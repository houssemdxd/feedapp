/**
 * Utilitaire pour gérer les modèles Google Gemini
 * 
 * Documentation officielle: https://ai.google.dev/gemini-api/docs/models
 * 
 * Modèles disponibles (selon documentation Google):
 * - gemini-2.5-pro: Meilleure qualité, raisonnement complexe
 * - gemini-2.5-flash: Équilibre vitesse/qualité (recommandé)
 * - gemini-2.5-flash-lite: Plus rapide, moins cher, tâches simples
 */

export type GeminiModel = 
  | "gemini-2.5-pro"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite";

/**
 * Liste des modèles Gemini valides dans l'ordre de priorité recommandé
 * 
 * Ordre basé sur:
 * 1. Performance (vitesse de réponse)
 * 2. Coût (tokens)
 * 3. Qualité (précision)
 */
export const GEMINI_MODELS: GeminiModel[] = [
  "gemini-2.5-flash",        // Équilibre optimal (recommandé par défaut)
  "gemini-2.5-flash-lite",   // Plus rapide et moins cher
  "gemini-2.5-pro",          // Meilleure qualité
];

/**
 * Description des modèles Gemini
 */
export const GEMINI_MODEL_INFO: Record<GeminiModel, {
  name: string;
  description: string;
  useCase: string;
  speed: "fast" | "medium" | "slow";
  quality: "high" | "medium" | "good";
}> = {
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    description: "Modèle équilibré offrant un bon compromis entre vitesse et qualité",
    useCase: "Analyse de données, génération de contenu, tâches générales",
    speed: "fast",
    quality: "high",
  },
  "gemini-2.5-flash-lite": {
    name: "Gemini 2.5 Flash Lite",
    description: "Version allégée optimisée pour la vitesse et le coût",
    useCase: "Tâches simples, classification, traduction, haut volume",
    speed: "fast",
    quality: "good",
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    description: "Modèle premium pour raisonnement complexe et analyse approfondie",
    useCase: "Analyse complexe, raisonnement multi-étapes, tâches critiques",
    speed: "slow",
    quality: "high",
  },
};

/**
 * Configuration par défaut pour la génération de contenu
 */
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,        // Équilibre créativité/précision (0-2)
  topP: 0.95,              // Diversité des réponses (0-1)
  topK: 40,                // Sélection des tokens (1-40)
  maxOutputTokens: 8192,   // Limite de tokens en sortie
};

/**
 * Vérifie si un modèle est valide
 */
export function isValidGeminiModel(model: string): model is GeminiModel {
  return GEMINI_MODELS.includes(model as GeminiModel);
}

/**
 * Obtient les informations d'un modèle
 */
export function getModelInfo(model: GeminiModel) {
  return GEMINI_MODEL_INFO[model];
}

/**
 * Obtient le modèle par défaut (recommandé)
 */
export function getDefaultModel(): GeminiModel {
  return GEMINI_MODELS[0]; // gemini-2.5-flash
}

