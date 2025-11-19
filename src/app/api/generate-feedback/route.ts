import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuração do cliente compatível com OpenAI (Groq, Together, etc.)
const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

export async function POST(request: Request) {
  try {
    // 1. Validar Entrada
    const { text, theme, title } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'O texto é demasiado curto para uma análise precisa.' }, 
        { status: 400 }
      );
    }

    console.log("🚀 Iniciando correção com IA para:", title);

    // 2. Construção do Prompt do Especialista
    const systemPrompt = `
      Tu és um corretor sénior de redações para vestibulares e exames nacionais (como o ENEM).
      O teu objetivo é avaliar redações com rigor, foco técnico e didática.
      
      As 5 Competências de avaliação são:
      1. Domínio da escrita formal da língua portuguesa.
      2. Compreensão do tema e estrutura do texto dissertativo-argumentativo.
      3. Capacidade de argumentação e defesa de ponto de vista.
      4. Conhecimento dos mecanismos linguísticos (coesão e coerência).
      5. Proposta de intervenção para o problema abordado.

      DEVES retornar APENAS um objeto JSON válido com a seguinte estrutura exata, sem markdown ou explicações adicionais:
      {
        "final_grade": number (0 a 1000),
        "grade_c1": number (0, 40, 80, 120, 160, 200),
        "grade_c2": number (0, 40, 80, 120, 160, 200),
        "grade_c3": number (0, 40, 80, 120, 160, 200),
        "grade_c4": number (0, 40, 80, 120, 160, 200),
        "grade_c5": number (0, 40, 80, 120, 160, 200),
        "detailed_feedback": [
          { "competency": "1", "feedback": "Comentário específico sobre a competência 1..." },
          { "competency": "2", "feedback": "Comentário específico sobre a competência 2..." },
          ... para as 5 competências
        ],
        "rewrite_suggestions": [
          { "original": "Frase original com problema", "suggestion": "Sugestão de reescrita melhorada" },
          ... (mínimo 2, máximo 5 sugestões)
        ],
        "actionable_items": [
          "Ação prática 1 para melhorar (ex: estudar uso de vírgulas)",
          "Ação prática 2...",
          ... (3 a 5 itens)
        ],
        "general_comment": "Um parágrafo curto e motivador resumindo o desempenho."
      }
    `;

    const userPrompt = `
      Tema da Redação: ${theme || "Tema Livre"}
      Título: ${title || "Sem título"}
      
      Texto da Redação:
      "${text}"
    `;

    // 3. Chamada à IA
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: process.env.AI_MODEL || 'qwen-2.5-72b-versatile',
      temperature: 0.3, // Baixa temperatura para ser mais consistente e técnico
      max_tokens: 4096,
      response_format: { type: "json_object" }, // Garante resposta JSON na Groq
    });

    const aiContent = completion.choices[0].message.content;

    if (!aiContent) {
      throw new Error("A IA retornou uma resposta vazia.");
    }

    // 4. Parse e Tratamento de Erros do JSON
    let parsedData;
    try {
      parsedData = JSON.parse(aiContent);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON da IA:", aiContent);
      return NextResponse.json({ error: 'Erro ao processar a resposta da IA.' }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Erro na rota /api/generate-feedback:", error);
    return NextResponse.json(
      { error: error.message || 'Ocorreu um erro interno ao processar a correção.' }, 
      { status: 500 }
    );
  }
}