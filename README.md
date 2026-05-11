# 🎵 LyricsApp

Application web privée pour partager les paroles de chansons au sein d'un groupe.

## Fonctionnalités

- ✅ Inscription avec validation admin
- ✅ Soumission de chansons (validées par admin avant publication)
- ✅ Modification de chansons (validée par admin)
- ✅ Zoom sur les paroles (A+ / A-)
- ✅ Tableau de bord admin complet
- ✅ Recherche par titre / artiste

## Stack technique

- **Frontend** : React + Vite
- **Backend/Auth** : Supabase (PostgreSQL + Auth)
- **Déploiement** : Vercel

---

## 🚀 Guide de déploiement (20 min)

### Étape 1 — Supabase

1. Crée un compte sur [supabase.com](https://supabase.com)
2. Crée un nouveau projet
3. Va dans **SQL Editor** et colle le contenu de `supabase/migrations/001_init.sql`
4. Clique **Run**
5. Va dans **Settings > API** et copie :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Étape 2 — Créer ton compte admin

Dans Supabase > **Authentication > Users** :
1. Clique **Invite user** et entre ton email
2. Après inscription, va dans **Table Editor > profiles**
3. Trouve ton profil et change `role` en `admin` et `status` en `active`

### Étape 3 — Vercel

1. Push le projet sur GitHub
   ```bash
   git init
   git add .
   git commit -m "init lyricsapp"
   git remote add origin https://github.com/TON_USER/lyricsapp.git
   git push -u origin main
   ```

2. Va sur [vercel.com](https://vercel.com), connecte ton GitHub
3. Importe le repo `lyricsapp`
4. Dans **Environment Variables**, ajoute :
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
5. Clique **Deploy** 🎉

---

## Développement local

```bash
# Installe les dépendances
npm install

# Copie le fichier d'environnement
cp .env.example .env.local
# Remplis les valeurs dans .env.local

# Lance le serveur de développement
npm run dev
```

---

## Structure du projet

```
lyricsapp/
├── src/
│   ├── contexts/      # AuthContext (gestion utilisateur)
│   ├── pages/         # Pages de l'app
│   ├── components/    # Navbar
│   └── lib/           # Client Supabase
├── supabase/
│   └── migrations/    # Schéma SQL à exécuter
├── vercel.json        # Config déploiement Vercel
└── .env.example       # Variables d'environnement à remplir
```
