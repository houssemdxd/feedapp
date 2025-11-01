import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { question, type, context } = await req.json();
    const promptBase = `You are assisting a user to fill out a form. Provide a concise, natural-sounding answer (max 25 words) for this field.
Question: ${question}
Type: ${type}
Context: ${JSON.stringify(context || {})}
Return only the suggested answer text, no explanations.`;

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You generate short, helpful form answers." },
            { role: "user", content: promptBase },
          ],
          temperature: 0.6,
          max_tokens: 70,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.choices?.[0]?.message?.content?.trim() ?? "";
        return NextResponse.json({ suggestion: text, source: "openai" });
      }
      // Log OpenAI error body for debugging
      try {
        const errText = await resp.text();
        console.error("/api/ai/suggest OpenAI error:", resp.status, errText);
      } catch {}
    }

    // Fallback: try to use current user's stored data first
    const q = String(question || "").toLowerCase();
    let u: { fname?: string | null; lname?: string | null; phone?: string | null; email?: string | null } | null = null;
    try {
      await connectDB();
      const sessionUser = await getCurrentUser();
      if (sessionUser && (sessionUser as any)?._id) {
        const doc = await User.findById((sessionUser as any)._id)
          .select("fname lname phone email")
          .lean();
        if (doc) u = { fname: (doc as any).fname, lname: (doc as any).lname, phone: (doc as any).phone, email: (doc as any).email };
      }
    } catch {}

    let suggestion = "";
    if (type === "email" || q.includes("email") || q.includes("mail")) suggestion = (u?.email && String(u.email)) || "client@example.com";
    else if (q.includes("prénom") || q.includes("firstname")) suggestion = (u?.fname && String(u.fname)) || "Ahmed";
    else if (q.includes("nom") || q.includes("name")) {
      const full = [u?.fname, u?.lname].filter(Boolean).join(" ");
      suggestion = full || "John Doe";
    } else if (q.includes("téléphone") || q.includes("phone") || q.includes("gsm")) {
      suggestion = (u?.phone && String(u.phone)) || "+216 12 345 678";
    } else if (q.includes("adresse") || q.includes("address")) suggestion = "123 Rue Principale, Tunis";
    else if (q.includes("ville") || q.includes("city")) suggestion = "Tunis";
    else if (q.includes("pays") || q.includes("country")) suggestion = "Tunisie";
    else if (q.includes("objet") || q.includes("subject")) suggestion = "Demande d'information";
    else if (q.includes("description") || q.includes("message") || q.includes("commentaire")) suggestion = "Je souhaite obtenir plus d'informations sur votre service.";
    else suggestion = "N/A";

    return NextResponse.json({ suggestion, source: "fallback" });
  } catch (e) {
    console.error("/api/ai/suggest error:", e);
    return NextResponse.json({ suggestion: "", source: "error" }, { status: 200 });
  }
}
