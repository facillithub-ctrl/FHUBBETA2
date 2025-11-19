import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Validação das Chaves de API
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
    const model = process.env.AI_MODEL || "qwen-2.5-72b-versatile";

    if (!apiKey) {
      console.error("ERRO: AI_API_KEY não encontrada no .env.local");
      return NextResponse.json({ error: 'Chave de API da IA não configurada no servidor.' }, { status: 500 });
    }

    // 2. Ler o corpo da requisição
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Texto muito curto ou inválido.' }, { status: 400 });
    }

    // 3. Construção do Prompt
    const systemPrompt = `
      Você é um corretor especialista em redações do ENEM.
      Analise o texto e retorne APENAS um JSON válido com esta estrutura exata:
      {
        "detailed_feedback": [
          { "competency": "Competência 1...", "feedback": "..." },
          { "competency": "Competência 2...", "feedback": "..." },
          { "competency": "Competência 3...", "feedback": "..." },
          { "competency": "Competência 4...", "feedback": "..." },
          { "competency": "Competência 5...", "feedback": "..." }
        ],
        "rewrite_suggestions": [
          { "original": "trecho", "suggestion": "melhoria" }
        ],
        "actionable_items": ["ação 1", "ação 2"]
      }
    `;

    // 4. Chamada direta à API do Groq usando fetch (sem biblioteca extra)
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API do Groq:", errorData);
      return NextResponse.json({ error: `Erro no provedor de IA: ${response.statusText}` }, { status: 500 });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: 'A IA não retornou conteúdo.' }, { status: 500 });
    }

    // 5. Parse e Retorno
    try {
      const jsonResponse = JSON.parse(aiContent);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON da IA:", aiContent);
      // Tenta recuperar o JSON se vier misturado com texto
      const match = aiContent.match(/\{[\s\S]*\}/);
      if (match) {
          return NextResponse.json(JSON.parse(match[0]));
      }
      return NextResponse.json({ error: 'Formato de resposta da IA inválido.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Erro crítico na rota:", error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}