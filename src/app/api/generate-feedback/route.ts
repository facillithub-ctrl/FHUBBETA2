import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Configuração e Normalização das Chaves
    const apiKey = process.env.AI_API_KEY;
    // Remove barra final se houver
    const rawBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
    const baseUrl = rawBaseUrl.replace(/\/+$/, ''); 
    
    // ATUALIZAÇÃO: Mudamos o fallback para o llama-3.3-70b-versatile que é muito estável no Groq
    const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json({ error: 'Configuração de API Key ausente no servidor.' }, { status: 500 });
    }

    const { text } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Texto muito curto para análise.' }, { status: 400 });
    }

    // 2. Construção da URL final
    const endpoint = `${baseUrl}/chat/completions`;

    console.log(`[IA] Conectando em: ${endpoint}`);
    console.log(`[IA] Usando Modelo: ${model}`); // Log para confirmar qual modelo está indo

    const systemPrompt = `
      Você é um corretor especialista em redações do ENEM (Brasil).
      Analise o texto fornecido e retorne ESTRITAMENTE um JSON. Não inclua markdown (como \`\`\`json), apenas o objeto JSON puro.
      
      A estrutura deve ser:
      {
        "detailed_feedback": [
          { "competency": "Competência 1", "feedback": "..." },
          { "competency": "Competência 2", "feedback": "..." },
          { "competency": "Competência 3", "feedback": "..." },
          { "competency": "Competência 4", "feedback": "..." },
          { "competency": "Competência 5", "feedback": "..." }
        ],
        "rewrite_suggestions": [
          { "original": "texto original", "suggestion": "texto melhorado" }
        ],
        "actionable_items": ["ação 1", "ação 2", "ação 3"]
      }
    `;

    // 3. Chamada Fetch
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.3, // Baixa temperatura para ser mais analítico
        // Nota: Nem todos os modelos do Groq suportam json_object nativo perfeitamente, 
        // mas o Llama 3.3 costuma respeitar bem o prompt.
        // Se der erro de formato, removemos essa linha, mas vamos tentar manter.
        response_format: { type: "json_object" } 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[IA] Erro da API (${response.status}):`, errorText);
      
      // Tenta fazer o parse do erro para mostrar algo amigável
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) { /* ignore */ }

      return NextResponse.json({ 
        error: `Erro do provedor: ${errorMessage}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'A IA não retornou conteúdo.' }, { status: 500 });
    }

    // 4. Tratamento do JSON
    try {
      // Às vezes a IA coloca markdown em volta mesmo pedindo pra não pôr
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonContent = JSON.parse(cleanContent);
      return NextResponse.json(jsonContent);
    } catch (e) {
      console.error("[IA] Falha ao parsear JSON. Conteúdo bruto:", content);
      return NextResponse.json({ error: 'A resposta da IA não veio no formato correto. Tente novamente.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[IA] Erro crítico:", error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}