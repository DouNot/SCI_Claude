# 🌐 Configuration des Variables d'Environnement

## 📋 Vue d'ensemble

Votre application utilise des **variables d'environnement** pour s'adapter automatiquement entre développement et production.

### ✅ Avantages
- 🔄 **Changement facile** entre dev et prod
- 🔒 **Sécurité** : pas de secrets dans le code
- 🚀 **Déploiement simple** sur n'importe quelle plateforme
- 🌍 **Multi-environnements** : dev, staging, prod

---

## 📂 Structure

```
projet/
├── backend/
│   ├── .env                           # ❌ NE PAS COMMIT (git ignore)
│   ├── .env.example                   # ✅ Template pour développement
│   └── .env.production.example        # ✅ Template pour production
├── frontend/
│   ├── .env                           # ❌ NE PAS COMMIT (git ignore)
│   ├── .env.example                   # ✅ Template pour développement
│   └── .env.production.example        # ✅ Template pour production
└── DEPLOIEMENT.md                     # 📖 Guide complet
```

---

## 🔧 Configuration Locale (Développement)

### Backend

1. **Copier le template** :
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Le fichier `.env` est déjà configuré** pour localhost :
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   NODE_ENV=development
   JWT_SECRET="votre_secret_ultra_securise"
   ```

### Frontend

1. **Copier le template** :
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Le fichier `.env` est déjà configuré** pour localhost :
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

---

## 🚀 Configuration Production

### Option 1 : Variables système

Sur votre serveur, définir les variables :

```bash
export DATABASE_URL="postgresql://..."
export NODE_ENV="production"
export JWT_SECRET="clé-ultra-sécurisée"
export FRONTEND_URL="https://votre-app.vercel.app"
```

### Option 2 : Fichier .env

Créer un fichier `.env` sur le serveur :

```bash
cd backend
cp .env.production.example .env
# Éditer avec vos vraies valeurs
nano .env
```

### Option 3 : Plateformes cloud (Recommandé)

Les plateformes comme **Railway**, **Render**, **Vercel** ont des interfaces pour configurer les variables.

Voir le guide complet : **[DEPLOIEMENT.md](./DEPLOIEMENT.md)**

---

## 🔑 Variables Importantes

### Backend

| Variable | Développement | Production | Obligatoire |
|----------|---------------|------------|-------------|
| `DATABASE_URL` | `file:./dev.db` | `postgresql://...` | ✅ |
| `NODE_ENV` | `development` | `production` | ✅ |
| `PORT` | `3000` | `3000` (ou auto) | ✅ |
| `JWT_SECRET` | N'importe | **CLÉ FORTE** | ✅ |
| `FRONTEND_URL` | `http://localhost:5173` | `https://...` | ✅ |

### Frontend

| Variable | Développement | Production | Obligatoire |
|----------|---------------|------------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | `https://.../api` | ✅ |

---

## ⚠️ Sécurité

### ❌ À NE JAMAIS FAIRE

- Commiter les fichiers `.env` sur Git
- Mettre des secrets dans le code
- Utiliser le même `JWT_SECRET` partout

### ✅ BONNES PRATIQUES

- Utiliser des clés différentes par environnement
- Générer des `JWT_SECRET` forts :
  ```bash
  openssl rand -base64 32
  ```
- Utiliser HTTPS en production
- Changer les secrets régulièrement

---

## 🔍 Vérifier la Configuration

### Backend

```bash
cd backend
npm start
```

Vous devriez voir :
```
🚀 Serveur démarré
📍 URL: http://localhost:3000
📊 Environnement: development
```

Tester l'API :
```bash
curl http://localhost:3000/health
```

### Frontend

```bash
cd frontend
npm run dev
```

Vous devriez voir :
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

---

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend

1. **Vérifier VITE_API_URL** :
   ```bash
   cat frontend/.env
   # Doit contenir : VITE_API_URL=http://localhost:3000/api
   ```

2. **Redémarrer Vite** après changement de `.env` :
   ```bash
   # Ctrl+C puis
   npm run dev
   ```

### Erreur CORS en production

1. **Vérifier FRONTEND_URL** dans le backend
2. **S'assurer que les deux sont en HTTPS**

### Base de données introuvable

1. **Vérifier DATABASE_URL**
2. **Exécuter les migrations** :
   ```bash
   npx prisma migrate deploy
   ```

---

## 📚 Ressources

- 📖 [Guide de déploiement complet](./DEPLOIEMENT.md)
- 🔐 [Documentation JWT](https://jwt.io/)
- 🗄️ [Prisma Documentation](https://www.prisma.io/docs)
- ⚡ [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Checklist

### Développement
- [ ] Backend `.env` créé
- [ ] Frontend `.env` créé
- [ ] Backend démarre sur :3000
- [ ] Frontend démarre sur :5173
- [ ] Les deux communiquent

### Production
- [ ] Variables backend configurées
- [ ] Variables frontend configurées
- [ ] JWT_SECRET changé et fort
- [ ] DATABASE_URL pointe vers PostgreSQL
- [ ] FRONTEND_URL et VITE_API_URL corrects
- [ ] HTTPS activé partout
- [ ] Migrations Prisma exécutées

---

**Besoin d'aide ?** Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md) pour le guide complet ! 🚀
