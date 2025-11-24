import createClient from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const apiKey = process.env.AI_API_KEY;
    const rawBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
    const baseUrl = rawBaseUrl.replace(/\/+$/, '');
    const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json({ error: "Configuração de API Key ausente." }, { status: 500 });
    }

    const { essayId } = await request.json();

    if (!essayId) {
      return NextResponse.json({ error: "ID da redação obrigatório." }, { status: 400 });
    }

    // 1. Buscar contexto da redação no banco
    // Nota: Usamos essay_prompts (nome real da tabela)
    const { data: essay, error: dbError } = await supabase
        .from('essays')
        .select(`
            title,
            content,
            essay_prompts ( title ),
            essay_corrections ( 
                final_grade,
                feedback,
                essay_correction_errors ( 
                    common_errors ( error_type ) 
                )
            )
        `)
        .eq('id', essayId)
        .single();

    if (dbError || !essay) {
        console.error("Erro ao buscar redação:", dbError);
        return NextResponse.json({ error: "Redação não encontrada." }, { status: 404 });
    }

    // Tratamento seguro do título do prompt (pode vir como array ou objeto)
    const promptTitle = essay.essay_prompts 
        ? (Array.isArray(essay.essay_prompts) ? essay.essay_prompts[0]?.title : (essay.essay_prompts as any).title) 
        : "Tema Livre";

    const correction = essay.essay_corrections?.[0];
    const errors = correction?.essay_correction_errors
        ?.map((e: any) => e.common_errors?.error_type)
        .join(', ') || "Erros gerais de coesão e gramática";

    // 2. Prompt para a IA
    const systemPrompt = `
      Você é um professor de redação especialista no ENEM.
      Crie um PLANO DE AÇÃO prático (checklist) para o aluno com base na correção desta redação.
      
      DADOS DA REDAÇÃO:
      - Tema: "${promptTitle}"
      - Nota: ${correction?.final_grade || 'N/A'}
      - Principais Erros: ${errors}
      - Feedback Anterior: "${correction?.feedback || ''}"
      
      OBJETIVO:
      Retorne ESTRITAMENTE um JSON com uma lista de 4 a 5 tarefas curtas e acionáveis.
      Exemplo de tarefa: "Revisar regras de crase", "Ler uma redação nota 1000 sobre o tema".
      
      FORMATO JSON:
      {
        "actionable_items": [
          "Tarefa 1",
          "Tarefa 2",
          "Tarefa 3"
        ]
      }
    `;

    // 3. Chamada à API de IA
    console.log(`[IA] Gerando plano para essay ${essayId}...`);
    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Gere o plano de ação." }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("[IA] Erro API:", errText);
        throw new Error(`Erro na API de IA: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    let jsonContent;
    try {
        jsonContent = JSON.parse(cleanContent);
    } catch (e) {
        console.error("[IA] Erro ao parsear JSON:", cleanContent);
        throw new Error("Formato inválido da IA");
    }

    if (!jsonContent.actionable_items) throw new Error("JSON sem actionable_items");

    // 4. Formatar e Salvar no Banco
    const tasksToSave = jsonContent.actionable_items.map((text: string) => ({
        id: crypto.randomUUID(),
        text: text,
        completed: false
    }));

    const { error: saveError } = await supabase
        .from('ai_feedback')
        .upsert({ 
            essay_id: essayId, 
            actionable_items: tasksToSave 
        }, { onConflict: 'essay_id' });

    if (saveError) {
        console.error("[Supabase] Erro ao salvar plano:", saveError);
        throw saveError;
    }

    return NextResponse.json({ tasks: tasksToSave });

  } catch (error: any) {
    console.error("Erro no generate-study-plan:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}