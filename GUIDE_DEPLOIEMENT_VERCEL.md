# 🚀 Guide de Déploiement sur Vercel

## 📋 Prérequis

1. **Compte GitHub** : Ton projet doit être sur GitHub
2. **Compte Vercel** : Crée un compte gratuit sur [vercel.com](https://vercel.com)
3. **Variables d'environnement** : Prépare tes clés API

---

## 🎯 Méthode 1 : Déploiement via l'Interface Vercel (Recommandé)

### Étape 1 : Préparer le Projet sur GitHub

1. **Initialiser Git** (si pas déjà fait) :
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Créer un repository sur GitHub** :
   - Va sur [github.com](https://github.com)
   - Clique sur "New repository"
   - Donne un nom à ton projet
   - Ne coche PAS "Initialize with README"
   - Clique sur "Create repository"

3. **Connecter le projet local à GitHub** :
```bash
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer sur Vercel

1. **Aller sur Vercel** :
   - Va sur [vercel.com](https://vercel.com)
   - Clique sur "Sign Up" ou "Log In"
   - Connecte-toi avec GitHub

2. **Importer le Projet** :
   - Clique sur "Add New..." → "Project"
   - Sélectionne ton repository GitHub
   - Clique sur "Import"

3. **Configurer le Projet** :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./` (laisser par défaut)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `npm install` (par défaut)

4. **Ajouter les Variables d'Environnement** :
   
   Clique sur "Environment Variables" et ajoute :

   ```
   MONGODB_URI = ton_uri_mongodb
   GEMINI_API_KEY = ta_cle_gemini
   NEXTAUTH_SECRET = un_secret_aleatoire
   NEXTAUTH_URL = https://ton-projet.vercel.app
   ```

   **Important** : 
   - Pour `NEXTAUTH_URL`, utilise l'URL que Vercel te donnera après le premier déploiement
   - Tu peux aussi utiliser des variables différentes pour Production, Preview, et Development

5. **Déployer** :
   - Clique sur "Deploy"
   - Attends 2-3 minutes
   - Ton site sera en ligne ! 🎉

---

## 🎯 Méthode 2 : Déploiement via CLI Vercel

### Étape 1 : Installer Vercel CLI

```bash
npm install -g vercel
```

### Étape 2 : Se Connecter

```bash
vercel login
```

### Étape 3 : Déployer

```bash
# Dans le dossier de ton projet
vercel
```

Suis les instructions :
- **Set up and deploy?** → Y
- **Which scope?** → Sélectionne ton compte
- **Link to existing project?** → N (première fois)
- **What's your project's name?** → Donne un nom
- **In which directory is your code located?** → ./

### Étape 4 : Ajouter les Variables d'Environnement

```bash
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

Pour chaque variable, choisis :
- **Production** : Oui
- **Preview** : Oui (optionnel)
- **Development** : Oui (optionnel)

### Étape 5 : Déployer en Production

```bash
vercel --prod
```

---

## ⚙️ Configuration des Variables d'Environnement

### Variables Requises

1. **MONGODB_URI** :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
   - Obtiens l'URI depuis [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **GEMINI_API_KEY** :
   ```
   AIzaSy...
   ```
   - Obtiens la clé depuis [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **NEXTAUTH_SECRET** :
   ```bash
   # Génère un secret aléatoire
   openssl rand -base64 32
   ```
   Ou utilise un générateur en ligne

4. **NEXTAUTH_URL** :
   ```
   https://ton-projet.vercel.app
   ```
   - Remplace par l'URL de ton projet Vercel

### Autres Variables Possibles

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://ton-projet.vercel.app`

---

## 🔧 Configuration Vercel (vercel.json)

Crée un fichier `vercel.json` à la racine du projet (optionnel) :

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 📝 Checklist Avant Déploiement

- [ ] Le projet build sans erreur (`npm run build`)
- [ ] Toutes les variables d'environnement sont préparées
- [ ] Le projet est sur GitHub
- [ ] Les fichiers sensibles sont dans `.gitignore`
- [ ] MongoDB Atlas est configuré et accessible
- [ ] La clé API Gemini est valide

---

## 🐛 Résolution de Problèmes

### Erreur : "Build Failed"

1. **Vérifie les logs** dans Vercel Dashboard → Deployments → Logs
2. **Teste localement** :
   ```bash
   npm run build
   ```
3. **Vérifie les erreurs TypeScript** :
   ```bash
   npm run lint
   ```

### Erreur : "Environment Variables Missing"

1. Va dans Vercel Dashboard → Settings → Environment Variables
2. Vérifie que toutes les variables sont ajoutées
3. Redéploie après avoir ajouté les variables

### Erreur : "MongoDB Connection Failed"

1. Vérifie que l'IP de Vercel est autorisée dans MongoDB Atlas
   - Va dans Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)
2. Vérifie que l'URI MongoDB est correcte

### Erreur : "API Route Not Found"

1. Vérifie que les routes API sont dans `src/app/api/`
2. Vérifie que les noms de fichiers sont corrects
3. Redéploie après les corrections

---

## 🔄 Mises à Jour Automatiques

Une fois connecté à GitHub, Vercel déploie automatiquement :
- **Chaque push sur `main`** → Déploiement en production
- **Chaque pull request** → Déploiement en preview

Pour désactiver :
- Va dans Settings → Git → Disconnect

---

## 🌐 URLs Générées

Après le déploiement, tu auras :
- **Production** : `https://ton-projet.vercel.app`
- **Preview** : `https://ton-projet-git-branch-username.vercel.app`
- **Custom Domain** : Tu peux ajouter ton propre domaine dans Settings → Domains

---

## 📊 Monitoring

Vercel te donne accès à :
- **Analytics** : Visiteurs, pages vues, etc.
- **Logs** : Logs en temps réel
- **Speed Insights** : Performance du site
- **Deployments** : Historique des déploiements

---

## 🎉 C'est Fait !

Une fois déployé, tu peux :
1. Partager l'URL avec tes utilisateurs
2. Surveiller les performances
3. Mettre à jour en poussant sur GitHub

**Bon déploiement ! 🚀**

