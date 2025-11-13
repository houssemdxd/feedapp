import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { stats, formTitle, formType } = await req.json();

    if (!stats || !formTitle) {
      return NextResponse.json({ 
        summary: "Données manquantes pour l'analyse.",
        insights: [],
        recommendations: [],
        highlights: {},
        error: "Missing required data"
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        summary: "Analyse AI non disponible. Configurez GEMINI_API_KEY dans vos variables d'environnement.",
        insights: ["Statistiques disponibles mais analyse approfondie non disponible."],
        recommendations: ["Ajoutez votre clé API Gemini dans le fichier .env.local"],
        highlights: {}
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Format des statistiques pour l'IA
    const statsText = JSON.stringify(stats, null, 2);

    const prompt = `Tu es un expert en analyse de données et statistiques pour des formulaires et sondages.

Analyse les statistiques suivantes d'un ${formType === "survey" ? "sondage" : "formulaire"} intitulé "${formTitle}":

${statsText}

Fournis une analyse détaillée en JSON avec cette structure exacte:
{
  "summary": "Un résumé concis (2-3 phrases) des principales tendances et observations",
  "insights": [
    "Insight 1: observation clé avec chiffres",
    "Insight 2: autre observation importante",
    "Insight 3: pattern ou tendance remarquable"
  ],
  "recommendations": [
    "Recommandation 1: action suggérée basée sur les données",
    "Recommandation 2: amélioration possible",
    "Recommandation 3: point d'attention"
  ],
  "highlights": {
    "mostPopular": "Option/réponse la plus populaire avec pourcentage",
    "leastPopular": "Option/réponse la moins populaire avec pourcentage",
    "averageRating": "Note moyenne si applicable",
    "responseRate": "Taux de réponse ou participation"
  }
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire avant ou après.`;

    // Utiliser les modèles Gemini 2.5 actuels (les modèles 1.5 ne sont plus disponibles)
    // gemini-2.5-flash est plus rapide, gemini-2.5-pro est plus précis
    const modelsToTry = [
      "gemini-2.5-flash",      // Plus rapide, recommandé par défaut
      "gemini-2.5-flash-lite", // Version allégée, très rapide
      "gemini-2.5-pro",        // Plus lent mais meilleure qualité
      // Fallback avec préfixe "models/" au cas où le SDK le nécessiterait
      "models/gemini-2.5-flash",
      "models/gemini-2.5-flash-lite",
      "models/gemini-2.5-pro"
    ];
    
    let text = "";
    let lastError: any = null;
    
    // Fonction pour attendre avec backoff exponentiel
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Essayer chaque modèle jusqu'à ce qu'un fonctionne
    for (const modelName of modelsToTry) {
      let retries = 3; // Nombre de tentatives pour chaque modèle
      let attempt = 0;

      while (retries > 0) {
        try {
          attempt++;
          console.log(`[Gemini AI] Tentative ${attempt}/3 avec le modèle: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          text = response.text();
          console.log(`✅ [Gemini AI] Modèle ${modelName} fonctionne!`);
          break; // Succès, sortir de toutes les boucles
        } catch (err: any) {
          lastError = err;
          const errorMsg = err?.message || String(err);
          console.warn(`❌ [Gemini AI] Modèle ${modelName} a échoué (tentative ${attempt}/3):`, errorMsg);
          
          // Si erreur 404 ou "not found" (modèle non disponible), essayer le modèle suivant
          if (
            errorMsg.includes("404") ||
            errorMsg.includes("not found") ||
            errorMsg.includes("is not found") ||
            errorMsg.includes("not available") ||
            errorMsg.includes("not supported")
          ) {
            console.log(`   → Modèle ${modelName} non disponible, passage au suivant...`);
            break; // Sortir de la boucle de retry pour ce modèle
          }
          
          // Si erreur 503 (Service Unavailable) ou rate limit, retry avec backoff
          if (
            errorMsg.includes("503") ||
            errorMsg.includes("Service Unavailable") ||
            errorMsg.includes("overloaded") ||
            errorMsg.includes("rate limit") ||
            errorMsg.includes("429")
          ) {
            retries--;
            if (retries > 0) {
              const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Backoff exponentiel, max 5s
              console.log(`   → Service surchargé, nouvelle tentative dans ${waitTime}ms...`);
              await wait(waitTime);
              continue; // Réessayer avec le même modèle
            } else {
              console.log(`   → Trop de tentatives pour ${modelName}, passage au modèle suivant...`);
              break; // Passer au modèle suivant
            }
          }
          
          // Pour les autres erreurs (auth, etc.), relancer immédiatement
          throw err;
        }
      }

      // Si on a réussi, sortir de la boucle principale
      if (text) break;
    }
    
    // Si aucun modèle n'a fonctionné
    if (!text && lastError) {
      const errorMsg = lastError?.message || String(lastError);
      
      // Message spécifique pour service surchargé
      if (
        errorMsg.includes("503") ||
        errorMsg.includes("Service Unavailable") ||
        errorMsg.includes("overloaded")
      ) {
        return NextResponse.json({
          summary: "Le service d'analyse IA est temporairement surchargé. Veuillez réessayer dans quelques instants.",
          insights: [
            "Les modèles Gemini sont actuellement surchargés.",
            "Veuillez patienter quelques minutes et réessayer.",
            "Les statistiques sont toujours disponibles ci-dessous.",
          ],
          recommendations: [
            "Réessayez l'analyse dans quelques minutes.",
            "Les données statistiques restent accessibles sans l'analyse IA.",
          ],
          highlights: {},
          error: "Service temporarily unavailable",
        });
      }
      
      throw new Error(`Aucun modèle Gemini disponible. Dernière erreur: ${errorMsg}`);
    }

    // Extraire le JSON de la réponse
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback si pas de JSON trouvé - normaliser en tableaux
      const lines = text.split("\n").filter((line: string) => line.trim().length > 0);
      return NextResponse.json({
        summary: text.substring(0, 200) || "Analyse générée avec succès.",
        insights: lines.length > 0 ? lines.slice(0, 5) : [text.substring(0, 150)],
        recommendations: [],
        highlights: {}
      });
    }

    try {
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Normaliser les données pour s'assurer que insights et recommendations sont des tableaux
      const normalized = {
        summary: typeof analysis.summary === "string" ? analysis.summary : String(analysis.summary || ""),
        insights: Array.isArray(analysis.insights) 
          ? analysis.insights 
          : typeof analysis.insights === "string" 
            ? [analysis.insights] 
            : [],
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : typeof analysis.recommendations === "string"
            ? [analysis.recommendations]
            : [],
        highlights: typeof analysis.highlights === "object" && analysis.highlights !== null
          ? analysis.highlights
          : {}
      };
      
      return NextResponse.json(normalized);
    } catch (parseError) {
      // Si le parsing échoue, retourner le texte brut normalisé
      const lines = text.split("\n").filter((line: string) => line.trim().length > 0);
      return NextResponse.json({
        summary: text.substring(0, 300) || "Analyse générée avec succès.",
        insights: lines.length > 0 ? lines.slice(0, 5) : [text.substring(0, 200)],
        recommendations: [],
        highlights: {}
      });
    }
  } catch (error: any) {
    console.error("/api/ai/analyze-stats error:", error);
    return NextResponse.json(
      { 
        summary: "Erreur lors de l'analyse des statistiques.",
        insights: [],
        recommendations: [],
        highlights: {},
        error: error?.message || "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

