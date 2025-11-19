import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.AI_API_KEY;
    const rawBaseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
    const baseUrl = rawBaseUrl.replace(/\/+$/, ''); 
    const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) return NextResponse.json({ error: 'API Key ausente.' }, { status: 500 });

    const { essayContent, feedback, grades } = await request.json();

    if (!essayContent || !feedback) {
      return NextResponse.json({ error: 'Dados insuficientes.' }, { status: 400 });
    }

    const systemPrompt = `
      Você é um mentor educacional especializado em redação.
      Com base na redação do aluno e no feedback da correção, crie um plano de melhoria personalizado.
      Retorne ESTRITAMENTE um JSON com esta estrutura:
      {
        "strengths": ["ponto forte 1", "ponto forte 2"],
        "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
        "weekly_schedule": [
          { "day": "Segunda", "activity": "Ler sobre...", "focus": "Gramática" },
          { "day": "Quarta", "activity": "Praticar escrita de...", "focus": "Coesão" },
          { "day": "Sexta", "activity": "Reescrever...", "focus": "Argumentação" }
        ],
        "recommended_resources": ["Nome de um livro ou tipo de aula", "Dica de site"]
      }
    `;

    const userPrompt = `
      Redação: "${essayContent.substring(0, 2000)}..."
      Notas: ${JSON.stringify(grades)}
      Feedback do Corretor: "${feedback}"
      
      Gere o plano de estudos.
    `;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanContent));

  } catch (error: any) {
    console.error("Erro ao gerar plano:", error);
    return NextResponse.json({ error: 'Erro ao gerar plano.' }, { status: 500 });
  }
}