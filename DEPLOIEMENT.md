# 🚀 GUIDE DE DÉPLOIEMENT - SCI Cloud

Ce guide explique comment déployer SCI Cloud en production.

## 📋 Prérequis

- Compte sur une plateforme d'hébergement (Railway, Render, Vercel, Netlify, etc.)
- Base de données PostgreSQL (pour la production)
- Nom de domaine (optionnel)

---

## 🎯 Architecture de déploiement recommandée

```
Frontend (Vercel/Netlify)  →  Backend (Railway/Render)  →  PostgreSQL (Railway/Supabase)
```

---

## 1️⃣ DÉPLOYER LE BACKEND

### Option A : Railway (Recommandé)

1. **Créer un compte** sur [railway.app](https://railway.app)

2. **Créer un nouveau projet** :
   - New Project → Deploy from GitHub repo
   - Sélectionner votre repo
   - Root Directory : `/backend`

3. **Ajouter PostgreSQL** :
   - Add Service → Database → PostgreSQL
   - Railway créera automatiquement la variable `DATABASE_URL`

4. **Configurer les variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<générer avec: openssl rand -base64 32>
   FRONTEND_URL=https://votre-app.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre.email@gmail.com
   EMAIL_PASSWORD=votre_mot_de_passe_app
   EMAIL_CONTACT=contact@votre-sci.fr
   COMPANY_NAME=Votre SCI
   ```

5. **Déployer** :
   - Railway détecte automatiquement Node.js
   - Build command : `npm install`
   - Start command : `npm start`

6. **Exécuter les migrations Prisma** :
   - Settings → Deploy → Custom Start Command :
     ```bash
     npx prisma migrate deploy && npm start
     ```

7. **Récupérer l'URL** :
   - Settings → Generate Domain
   - Ex: `https://votre-app.railway.app`

### Option B : Render

1. **Créer un compte** sur [render.com](https://render.com)

2. **Nouveau Web Service** :
   - New → Web Service
   - Connect GitHub repo
   - Root Directory : `backend`

3. **Configuration** :
   - Environment : Node
   - Build Command : `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command : `npm start`

4. **Variables d'environnement** :
   - Ajouter les mêmes variables que Railway

5. **PostgreSQL** :
   - New → PostgreSQL
   - Copier l'Internal Database URL dans `DATABASE_URL`

---

## 2️⃣ DÉPLOYER LE FRONTEND

### Option A : Vercel (Recommandé)

1. **Créer un compte** sur [vercel.com](https://vercel.com)

2. **Nouveau projet** :
   - Add New → Project
   - Import your GitHub repo
   - Root Directory : `frontend`

3. **Configuration** :
   - Framework Preset : Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`

4. **Variables d'environnement** :
   ```
   VITE_API_URL=https://votre-api.railway.app/api
   ```

5. **Déployer** :
   - Vercel build et deploy automatiquement
   - Récupérer l'URL : `https://votre-app.vercel.app`

6. **Mettre à jour le backend** :
   - Retourner sur Railway
   - Mettre à jour `FRONTEND_URL` avec l'URL Vercel

### Option B : Netlify

1. **Créer un compte** sur [netlify.com](https://netlify.com)

2. **Nouveau site** :
   - Add new site → Import from Git
   - Sélectionner le repo
   - Base directory : `frontend`

3. **Build settings** :
   - Build command : `npm run build`
   - Publish directory : `dist`

4. **Environment variables** :
   - Site settings → Environment variables
   - Ajouter `VITE_API_URL`

---

## 3️⃣ CONFIGURER LA BASE DE DONNÉES

### Migrations Prisma

Après le premier déploiement, exécuter :

```bash
npx prisma migrate deploy
```

Ou via Railway CLI :
```bash
railway run npx prisma migrate deploy
```

### Créer le premier utilisateur

Se connecter à l'app et créer un compte via `/signup`

---

## 4️⃣ CONFIGURATION DNS (Optionnel)

### Si vous avez un nom de domaine :

1. **Backend** (ex: api.votre-sci.fr) :
   - Railway/Render : Settings → Custom Domain
   - Ajouter un CNAME dans votre DNS :
     ```
     CNAME  api  →  votre-app.railway.app
     ```

2. **Frontend** (ex: app.votre-sci.fr) :
   - Vercel/Netlify : Settings → Domains
   - Ajouter un A record ou CNAME :
     ```
     CNAME  app  →  votre-app.vercel.app
     ```

3. **Mettre à jour les variables** :
   - Backend : `FRONTEND_URL=https://app.votre-sci.fr`
   - Frontend : `VITE_API_URL=https://api.votre-sci.fr/api`

---

## 5️⃣ SÉCURITÉ EN PRODUCTION

### Backend

✅ **JWT_SECRET** : Générer une clé forte
```bash
openssl rand -base64 32
```

✅ **CORS** : Configurer correctement `FRONTEND_URL`

✅ **DATABASE_URL** : Utiliser PostgreSQL (pas SQLite)

✅ **HTTPS** : Activé automatiquement sur Railway/Render/Vercel

### Frontend

✅ **Variables d'environnement** : Ne jamais commiter `.env`

✅ **HTTPS** : Toujours en HTTPS en production

---

## 6️⃣ MONITORING

### Logs

- **Railway** : Deployments → View Logs
- **Render** : Logs tab
- **Vercel** : Deployments → Function Logs

### Health Check

Tester l'API :
```bash
curl https://votre-api.railway.app/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "timestamp": "2025-01-..."
}
```

---

## 🔄 MISE À JOUR

### Déploiement automatique

Railway/Render/Vercel se redéploient automatiquement à chaque push sur `main`

### Déploiement manuel

```bash
# Backend (Railway CLI)
railway up

# Frontend (Vercel CLI)
vercel --prod
```

---

## 🐛 DEBUGGING

### Erreur 500 Backend

1. Vérifier les logs Railway/Render
2. Vérifier que `DATABASE_URL` est correct
3. Vérifier que les migrations Prisma sont appliquées

### Erreur CORS Frontend

1. Vérifier `FRONTEND_URL` dans le backend
2. Vérifier `VITE_API_URL` dans le frontend
3. S'assurer que les deux sont en HTTPS

### Base de données

```bash
# Se connecter à la DB (Railway)
railway connect postgres

# Voir les tables
\dt

# Voir les utilisateurs
SELECT * FROM users;
```

---

## 📊 COÛTS ESTIMÉS

| Service | Plan | Prix |
|---------|------|------|
| Railway | Hobby | $5/mois (500h) |
| Render | Free | $0 (avec limitations) |
| Vercel | Hobby | $0 |
| Netlify | Free | $0 |
| **Total minimum** | | **$5/mois** |

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Backend
- [ ] PostgreSQL créé
- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET changé
- [ ] Migrations Prisma exécutées
- [ ] URL backend récupérée
- [ ] Health check fonctionne

### Frontend
- [ ] VITE_API_URL configuré
- [ ] Build réussi
- [ ] URL frontend récupérée
- [ ] App accessible

### Final
- [ ] Créer un compte test
- [ ] Tester création SCI
- [ ] Tester ajout bien
- [ ] Backend `FRONTEND_URL` mis à jour
- [ ] HTTPS activé partout

---

## 🆘 SUPPORT

- Railway : https://railway.app/help
- Render : https://render.com/docs
- Vercel : https://vercel.com/docs
- Netlify : https://docs.netlify.com

---

**Votre app est maintenant prête pour la production ! 🎉**
