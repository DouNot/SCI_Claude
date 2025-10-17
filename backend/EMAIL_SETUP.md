# 📧 Système d'envoi automatique d'emails - Installation

## 🚀 Installation de Nodemailer

```powershell
cd backend
npm install nodemailer
```

## ⚙️ Configuration (.env)

Ajoutez ces lignes à votre fichier `backend/.env` :

```env
# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
EMAIL_CONTACT=votre-email@gmail.com
COMPANY_NAME=SCI Claude
```

## 🔑 Configuration Gmail (Recommandé)

### Option 1 : Mot de passe d'application (Recommandé)

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Cliquez sur "Sécurité" dans le menu de gauche
3. Activez la validation en deux étapes si ce n'est pas déjà fait
4. Cherchez "Mots de passe des applications"
5. Créez un nouveau mot de passe d'application
6. Utilisez ce mot de passe dans `EMAIL_PASSWORD`

### Option 2 : Autres fournisseurs

**Outlook/Hotmail :**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=votre-email@outlook.com
EMAIL_PASSWORD=votre-mot-de-passe
```

**Yahoo :**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=votre-email@yahoo.com
EMAIL_PASSWORD=votre-mot-de-passe
```

**SMTP personnalisé :**
```env
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_PORT=587
EMAIL_USER=votre-email@votre-domaine.com
EMAIL_PASSWORD=votre-mot-de-passe
```

## 📋 Nouvelles routes API disponibles

### 1. Tester la configuration email

```http
GET http://localhost:3000/api/emails/test
```

**Réponse :**
```json
{
  "success": true,
  "message": "Configuration email valide"
}
```

### 2. Envoyer une quittance par email

```http
POST http://localhost:3000/api/emails/envoyer-quittance
Content-Type: application/json

{
  "bailId": "uuid-du-bail",
  "mois": 10,
  "annee": 2025,
  "datePaiement": "2025-10-05",
  "emailDestinataire": "locataire@example.com"
}
```

**Notes :**
- `datePaiement` est optionnel (pour quittances impayées)
- `emailDestinataire` est optionnel (utilise l'email du locataire par défaut)

**Réponse :**
```json
{
  "success": true,
  "message": "Quittance envoyee a locataire@example.com",
  "data": {
    "messageId": "<xxx@gmail.com>",
    "destinataire": "locataire@example.com",
    "periode": "Octobre 2025"
  }
}
```

### 3. Envoyer toutes les quittances du mois

```http
POST http://localhost:3000/api/emails/envoyer-quittances-lot
Content-Type: application/json

{
  "mois": 10,
  "annee": 2025
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "5 quittance(s) envoyee(s), 0 echec(s)",
  "data": {
    "succes": [
      {
        "locataire": "Jean Dupont",
        "email": "jean@example.com",
        "bien": "13 rue de la victoire"
      }
    ],
    "echecs": []
  }
}
```

### 4. Envoyer une relance pour impayé

```http
POST http://localhost:3000/api/emails/envoyer-relance
Content-Type: application/json

{
  "bailId": "uuid-du-bail",
  "mois": 10,
  "annee": 2025
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Relance envoyee a locataire@example.com"
}
```

## 🎨 Templates d'emails

### Email de quittance

L'email contient :
- ✅ Design professionnel avec header coloré
- ✅ Informations de la période et du montant
- ✅ Quittance PDF en pièce jointe
- ✅ Footer avec coordonnées de contact
- ✅ Version HTML et texte brut

### Email de relance

L'email contient :
- ⚠️ Header orange pour attirer l'attention
- ⚠️ Montant dû et nombre de jours de retard
- ⚠️ Message de relance professionnel
- ⚠️ Coordonnées de contact

## 🔧 Dépannage

### Erreur : "Invalid login"

**Solution 1 :** Utilisez un mot de passe d'application (voir section Configuration Gmail)

**Solution 2 :** Pour Gmail, activez "Accès moins sécurisé des applications" (non recommandé)

### Erreur : "ECONNREFUSED"

Vérifiez que :
- `EMAIL_HOST` et `EMAIL_PORT` sont corrects
- Votre firewall n'bloque pas le port 587
- Vous avez une connexion internet

### Erreur : "Self signed certificate"

Pour un serveur SMTP avec certificat auto-signé, ajoutez dans `emailService.js` :

```javascript
const transporter = nodemailer.createTransporter({
  // ... config existante
  tls: {
    rejectUnauthorized: false
  }
});
```

## 📊 Exemple d'utilisation complète

### Workflow typique :

1. **Début du mois :** Générer toutes les quittances
```http
POST /api/quittances/generer-lot
{ "mois": 10, "annee": 2025 }
```

2. **Envoyer toutes les quittances par email**
```http
POST /api/emails/envoyer-quittances-lot
{ "mois": 10, "annee": 2025 }
```

3. **Après réception du paiement :** Marquer comme payé
```http
PATCH /api/quittances/:id/payer
{ "datePaiement": "2025-10-05" }
```

4. **Envoyer la quittance mise à jour**
```http
POST /api/emails/envoyer-quittance
{
  "bailId": "xxx",
  "mois": 10,
  "annee": 2025,
  "datePaiement": "2025-10-05"
}
```

5. **Si impayé après 5 jours :** Envoyer une relance
```http
POST /api/emails/envoyer-relance
{
  "bailId": "xxx",
  "mois": 10,
  "annee": 2025
}
```

## ✨ Fonctionnalités futures possibles

- [ ] Planification automatique des envois (cron jobs)
- [ ] Historique des emails envoyés dans la BDD
- [ ] Templates d'emails personnalisables
- [ ] Multi-langues (FR/EN)
- [ ] Accusés de réception
- [ ] Statistiques d'ouverture des emails

## 🔒 Sécurité

- ⚠️ Ne commitez JAMAIS votre fichier `.env` sur Git
- ⚠️ Utilisez toujours des mots de passe d'application
- ⚠️ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Les emails sont envoyés via connexion sécurisée (TLS)

## 📝 Notes importantes

1. **Limite d'envoi Gmail :** 500 emails/jour pour un compte gratuit
2. **Performance :** L'envoi en lot peut prendre du temps (plusieurs emails)
3. **Validation :** Assurez-vous que tous les locataires ont un email valide
4. **Test :** Testez toujours avec `/api/emails/test` avant l'envoi en masse

---

**Besoin d'aide ?** Consultez la documentation Nodemailer : https://nodemailer.com/
