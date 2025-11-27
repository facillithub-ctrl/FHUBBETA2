import createSupabaseServerClient from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Validação de Sessão
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 });
    }

    // 2. Configuração da URL da IA (CORREÇÃO DO ERRO 404)
    let aiBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
    // Remove barra final se houver
    if (aiBaseUrl.endsWith('/')) aiBaseUrl = aiBaseUrl.slice(0, -1);
    
    // Garante que o endpoint aponta para /chat/completions
    const aiEndpoint = aiBaseUrl.endsWith('/chat/completions') 
        ? aiBaseUrl 
        : `${aiBaseUrl}/chat/completions`;

    const apiKey = process.env.AI_API_KEY;
    const aiModel = process.env.AI_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
        console.error("ERRO: AI_API_KEY ausente.");
        return NextResponse.json({ error: 'Servidor de IA não configurado.' }, { status: 500 });
    }

    // 3. Dados da Requisição
    const body = await req.json();
    const { essayContent, essayTitle } = body;

    if (!essayContent || essayContent.trim().length < 20) {
      return NextResponse.json({ error: 'Texto muito curto.' }, { status: 400 });
    }

    // 4. Limpeza do Texto (Remove HTML para economizar tokens e evitar confusão da IA)
    // Remove tags HTML e decodifica entidades básicas se necessário
    const plainText = essayContent
        .replace(/<[^>]*>/g, ' ') // Troca tags por espaço
        .replace(/\s+/g, ' ')     // Normaliza espaços múltiplos
        .trim();

    console.log(`[IA] Enviando para: ${aiEndpoint} | Modelo: ${aiModel}`);

    // 5. Prompt Especializado (JSON Mode)
    const systemPrompt = `
      Atue como o "Facillit Corrector", um avaliador oficial do ENEM.
      Analise a redação abaixo com base nas 5 competências.
      
      SAÍDA OBRIGATÓRIA: Apenas um objeto JSON válido. Sem markdown.
      
      Estrutura:
      {
        "detailed_feedback": [
          { "competency": "Competência 1", "feedback": "..." },
          { "competency": "Competência 2", "feedback": "..." },
          { "competency": "Competência 3", "feedback": "..." },
          { "competency": "Competência 4", "feedback": "..." },
          { "competency": "Competência 5", "feedback": "..." }
        ],
        "rewrite_suggestions": [
          { "original": "trecho curto do texto", "suggestion": "versão melhorada" }
        ],
        "actionable_items": ["Ação 1", "Ação 2", "Ação 3"]
      }
    `;

    // 6. Chamada Externa
    const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: aiModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `TÍTULO: ${essayTitle || 'Sem título'}\n\nREDAÇÃO:\n${plainText}` }
            ],
            temperature: 0.3,
            max_tokens: 2500,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[IA] Erro Provider (${response.status}):`, errorText);
        // Tenta extrair mensagem de erro do JSON do provedor, se existir
        try {
            const errJson = JSON.parse(errorText);
            return NextResponse.json({ error: `Erro IA: ${errJson.error?.message || 'Falha na conexão'}` }, { status: response.status });
        } catch {
            return NextResponse.json({ error: `Erro IA (${response.status}): Verifique a API Key e URL.` }, { status: response.status });
        }
    }

    const completion = await response.json();
    const content = completion.choices[0].message.content;

    // 7. Parse Seguro
    try {
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanJson);
        return NextResponse.json(jsonResponse);
    } catch (parseError) {
        console.error("[IA] Erro Parse:", content);
        return NextResponse.json({ error: "Resposta da IA mal formatada." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[IA] Erro Crítico:", error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}