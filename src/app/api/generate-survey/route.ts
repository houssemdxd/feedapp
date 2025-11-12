import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
    Generate 5 survey questions about "${topic}".
    Each question must be a JSON object:
    { "question": "...", "type": "radio|checkbox|input|rating", "elements": ["..."] }
    Return only a valid JSON array (no markdown, no extra text).
    `;

    const hfKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfKey) {
      return NextResponse.json({ error: "Missing HUGGINGFACE_API_KEY" }, { status: 400 });
    }

    // ✅ Use Hugging Face’s Featherless OpenAI-style completions endpoint
    const response = await fetch("https://router.huggingface.co/featherless-ai/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-70B-Instruct", // choose your model here
        prompt,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face API error:", response.status, errText);
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.text || "";

    // 🧩 Clean and parse JSON output
    let questions = [];
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (match) questions = JSON.parse(match[0]);
    } catch (err) {
      console.error("JSON parse error:", err);
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("/api/generate-survey error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
