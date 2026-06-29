# Configuration Google Business Profile API — Artitude

Procédure complète pour obtenir les credentials nécessaires à l'intégration GMB dans le projet Artitude.

## Variables à renseigner dans `.env.local`

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_GMB_ACCOUNT_ID=
```

---

## Étape 1 — Activer les APIs dans Google Cloud Console

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un projet ou sélectionner un projet existant
3. **APIs & Services → Library**

Rechercher et activer ces deux APIs :

| API | Nom de service | Usage |
|-----|---------------|-------|
| **My Business Business Information API** | `mybusinessbusinessinformation.googleapis.com` | Créer les fiches GMB |
| **My Business API** | `mybusiness.googleapis.com` | Uploader les photos |

> Si après activation le quota affiché est 0, cliquer sur le lien **request** dans la page de l'API pour demander l'accès GBP (délai Google : 1-3 jours).

---

## Étape 2 — Configurer l'OAuth Consent Screen

1. **APIs & Services → OAuth consent screen**
2. User type : **External** → Create
3. Remplir :
   - App name : `Artitude`
   - User support email : votre email Google
   - Developer contact email : votre email Google
4. **Save and Continue**
5. **Scopes** → Add or remove scopes
   - Chercher `business.manage`
   - Cocher `https://www.googleapis.com/auth/business.manage`
   - Update → Save and Continue
6. **Test users** → Add users → ajouter l'email du compte propriétaire de la fiche GMB
7. Save and Continue → Back to Dashboard

> **Important** : tant que l'app est en mode "Testing", le refresh token expire après 7 jours. Pour un usage production, repasser dans **Publishing status → Publish App** (nécessite une vérification Google si l'app est externe).

---

## Étape 3 — Créer les credentials OAuth2

→ `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type : **Web application**
3. Nom : `Artitude GMB`
4. **Authorized redirect URIs** → Add URI → `http://localhost:3000`
5. **Create**
6. Copier :
   - **Client ID** → `GOOGLE_CLIENT_ID` dans `.env.local`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET` dans `.env.local`

---

## Étape 4 — Obtenir le Refresh Token

→ `GOOGLE_REFRESH_TOKEN`

### 4a. Générer l'URL d'autorisation

Construire l'URL suivante en remplaçant `YOUR_CLIENT_ID` :

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent
```

1. Ouvrir cette URL dans le navigateur
2. Se connecter avec le compte Google **propriétaire de la fiche GMB**
3. Autoriser l'accès à "Artitude"
4. Google redirige vers `http://localhost:3000?code=XXXX...`
5. **Copier la valeur du paramètre `code`** dans l'URL (tout ce qui est après `code=` et avant `&`)

> Le code expire en quelques minutes. Passer directement à l'étape 4b.

### 4b. Échanger le code contre un refresh token

Dans le terminal, exécuter (remplacer les 3 valeurs) :

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d redirect_uri=http://localhost:3000 \
  -d grant_type=authorization_code \
  -d code=VOTRE_CODE_ICI
```

Réponse JSON attendue :

```json
{
  "access_token": "ya29.XXXX",
  "expires_in": 3599,
  "refresh_token": "1//XXXX",
  "scope": "https://www.googleapis.com/auth/business.manage",
  "token_type": "Bearer"
}
```

- Copier `refresh_token` → `GOOGLE_REFRESH_TOKEN` dans `.env.local`
- Garder `access_token` sous la main pour l'étape 5

> Le refresh token est à durée indéfinie (tant que l'app est publiée et l'accès non révoqué). Il sert à générer un nouvel access token à chaque requête serveur — c'est le rôle de `lib/gmb-client.ts`.

---

## Étape 5 — Récupérer le Account ID GMB

→ `GOOGLE_GMB_ACCOUNT_ID`

Avec l'`access_token` obtenu à l'étape 4b :

```bash
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  https://mybusinessaccountmanagement.googleapis.com/v1/accounts
```

Réponse JSON attendue :

```json
{
  "accounts": [
    {
      "name": "accounts/123456789",
      "accountName": "InRealArt",
      "type": "PERSONAL",
      "verificationState": "VERIFIED"
    }
  ]
}
```

Copier la valeur de `name` (ex: `accounts/123456789`) → `GOOGLE_GMB_ACCOUNT_ID` dans `.env.local`

> Si plusieurs comptes apparaissent, choisir celui dont `accountName` correspond au compte GMB InRealArt.

---

## Résultat final — `.env.local`

```env
# Google Business Profile API
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REFRESH_TOKEN=1//xxxx
GOOGLE_GMB_ACCOUNT_ID=accounts/123456789
```

---

## Vérification — Tester l'intégration

Lancer le serveur de développement :

```bash
pnpm dev
```

Remplir le formulaire d'inscription en entier (3 étapes + 4 photos) et soumettre. Vérifier dans [business.google.com](https://business.google.com) que la nouvelle fiche apparaît avec les photos.

---

## Erreurs fréquentes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `quota: 0` après activation | Accès GBP non accordé | Cliquer "request" sur la page de l'API |
| `invalid_grant` sur le curl | Code OAuth expiré | Refaire l'étape 4a depuis le début |
| `403 insufficientPermissions` | Mauvais scope ou mauvais compte | Vérifier que le compte connecté est bien propriétaire de la fiche GMB |
| Refresh token expire après 7 jours | App en mode "Testing" | Publier l'app dans l'OAuth consent screen |
| `GOOGLE_GMB_ACCOUNT_ID` manquant au démarrage | Variable non renseignée | Le serveur lève une erreur explicite au démarrage — vérifier `.env.local` |
