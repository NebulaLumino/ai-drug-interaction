import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured." }, { status: 500 });
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status} - ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content ?? "No output.";

    return NextResponse.json({ result });
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
