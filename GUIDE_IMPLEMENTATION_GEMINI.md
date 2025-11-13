# Guide d'Implémentation : Modèles Google Gemini

## Vue d'Ensemble

Ce guide explique comment implémenter et utiliser les modèles Google Gemini dans le système d'analyse de statistiques.

## Modèles Disponibles

Selon la [documentation officielle Google](https://ai.google.dev/gemini-api/docs/models), les modèles suivants sont disponibles :

### 1. **gemini-2.5-flash** (Recommandé par défaut)
- **Vitesse** : Rapide
- **Qualité** : Élevée
- **Coût** : Modéré
- **Use Case** : Analyse de données, génération de contenu, tâches générales
- **Recommandé pour** : La plupart des cas d'usage

### 2. **gemini-2.5-flash-lite**
- **Vitesse** : Très rapide
- **Qualité** : Bonne
- **Coût** : Faible
- **Use Case** : Tâches simples, classification, traduction, haut volume
- **Recommandé pour** : Applications nécessitant une réponse rapide et un coût réduit

### 3. **gemini-2.5-pro**
- **Vitesse** : Plus lent
- **Qualité** : Très élevée
- **Coût** : Plus élevé
- **Use Case** : Analyse complexe, raisonnement multi-étapes, tâches critiques
- **Recommandé pour** : Analyses approfondies nécessitant un raisonnement complexe

## Architecture de l'Implémentation

### Structure des Fichiers

```
src/
├── lib/
│   └── gemini-models.ts          # Définitions et utilitaires des modèles
└── app/
    └── api/
        └── ai/
            └── analyze-stats/
                └── route.ts      # Route API utilisant les modèles
```

### Fichier : `src/lib/gemini-models.ts`

Ce fichier centralise :
- La liste des modèles valides
- Les informations sur chaque modèle
- La configuration par défaut
- Les fonctions utilitaires

**Exemple d'utilisation** :

```typescript
import { 
  GEMINI_MODELS, 
  getDefaultModel,
  getModelInfo 
} from "@/lib/gemini-models";

// Obtenir le modèle par défaut
const defaultModel = getDefaultModel(); // "gemini-2.5-flash"

// Obtenir les infos d'un modèle
const info = getModelInfo("gemini-2.5-pro");
console.log(info.description); // "Modèle premium..."
```

### Fichier : `src/app/api/ai/analyze-stats/route.ts`

Ce fichier implémente :
- Le système de fallback automatique
- La gestion des erreurs
- La normalisation des réponses

## Système de Fallback

Le système essaie automatiquement les modèles dans cet ordre :

1. **gemini-2.5-flash** (premier essai)
2. **gemini-2.5-flash-lite** (si flash échoue)
3. **gemini-2.5-pro** (si flash-lite échoue)

### Comment ça fonctionne

```typescript
for (const modelName of modelsToTry) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    });
    const result = await model.generateContent(prompt);
    // Succès !
    break;
  } catch (err) {
    // Si erreur 404 (modèle non disponible), essayer le suivant
    if (err.message.includes("404") || err.message.includes("not found")) {
      continue; // Essayer le modèle suivant
    }
    throw err; // Autre erreur, relancer
  }
}
```

## Configuration

### Paramètres de Génération

Les paramètres par défaut sont définis dans `DEFAULT_GENERATION_CONFIG` :

```typescript
{
  temperature: 0.7,        // Créativité (0-2, plus haut = plus créatif)
  topP: 0.95,              // Diversité (0-1)
  topK: 40,                // Sélection des tokens (1-40)
  maxOutputTokens: 8192,   // Limite de tokens en sortie
}
```

### Personnalisation

Pour personnaliser les paramètres :

```typescript
const customConfig = {
  temperature: 0.5,        // Plus déterministe
  maxOutputTokens: 4096,   // Limite réduite
};

const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: customConfig,
});
```

## Gestion des Erreurs

### Erreurs Gérées Automatiquement

1. **Modèle non disponible (404)** : Passage automatique au modèle suivant
2. **Rate Limit** : Erreur relancée (nécessite retry manuel)
3. **Clé API invalide** : Message d'erreur explicite
4. **Timeout** : Erreur relancée

### Exemple de Gestion

```typescript
try {
  // Tentative avec le modèle
  const result = await model.generateContent(prompt);
} catch (err: any) {
  if (err.message.includes("404") || err.message.includes("not found")) {
    // Modèle non disponible, essayer le suivant
    continue;
  }
  // Autre erreur (rate limit, auth, etc.)
  throw err;
}
```

## Utilisation

### 1. Configuration de la Clé API

Créer un fichier `.env.local` :

```bash
GEMINI_API_KEY=ta_cle_api_ici
```

Obtenir une clé : https://makersuite.google.com/app/apikey

### 2. Appel de l'API

```typescript
const response = await fetch("/api/ai/analyze-stats", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stats: statisticsData,
    formTitle: "Mon Formulaire",
    formType: "survey",
  }),
});

const analysis = await response.json();
console.log(analysis.summary);      // Résumé
console.log(analysis.insights);     // Insights
console.log(analysis.recommendations); // Recommandations
```

### 3. Vérification des Modèles Disponibles

Pour vérifier quels modèles sont disponibles dans votre compte :

```typescript
import { GEMINI_MODELS } from "@/lib/gemini-models";

console.log("Modèles configurés:", GEMINI_MODELS);
// ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"]
```

## Bonnes Pratiques

### 1. Utiliser le Modèle Adapté

- **Tâches simples** → `gemini-2.5-flash-lite`
- **Tâches générales** → `gemini-2.5-flash` (recommandé)
- **Tâches complexes** → `gemini-2.5-pro`

### 2. Gérer les Timeouts

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30s

try {
  const result = await model.generateContent(prompt, {
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeout);
}
```

### 3. Limiter les Tokens

Pour réduire les coûts, limiter `maxOutputTokens` :

```typescript
const config = {
  ...DEFAULT_GENERATION_CONFIG,
  maxOutputTokens: 2048, // Réduire si nécessaire
};
```

### 4. Logger les Modèles Utilisés

Le système log automatiquement :
- Les tentatives de modèles
- Les succès/échecs
- Les erreurs

Vérifier les logs pour optimiser :

```typescript
console.log(`[Gemini AI] Tentative avec le modèle: ${modelName}`);
console.log(`✅ [Gemini AI] Modèle ${modelName} fonctionne!`);
```

## Dépannage

### Problème : "Modèle non trouvé (404)"

**Solution** : Le système essaie automatiquement le modèle suivant. Vérifier que :
- La clé API est valide
- Le compte a accès aux modèles Gemini 2.5
- La région est supportée

### Problème : "Rate Limit Exceeded"

**Solution** : 
- Attendre quelques secondes
- Implémenter un système de retry avec backoff exponentiel
- Vérifier les quotas dans Google Cloud Console

### Problème : "Invalid API Key"

**Solution** :
- Vérifier que `GEMINI_API_KEY` est défini dans `.env.local`
- Vérifier que la clé est correcte
- Redémarrer le serveur après modification de `.env.local`

## Ressources

- **Documentation officielle** : https://ai.google.dev/gemini-api/docs/models
- **Obtenir une clé API** : https://makersuite.google.com/app/apikey
- **Prix et quotas** : https://ai.google.dev/pricing
- **Exemples de code** : https://ai.google.dev/gemini-api/docs/get-started/node

## Résumé

1. ✅ Les modèles sont définis dans `src/lib/gemini-models.ts`
2. ✅ Le système de fallback est automatique
3. ✅ La configuration est centralisée et personnalisable
4. ✅ Les erreurs sont gérées automatiquement
5. ✅ Les logs permettent le débogage

**Le système est prêt à l'emploi !** 🚀

