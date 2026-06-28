# Déploiement isiQuint Studio sur Coolify + Supabase auto-hébergé

## Prérequis
- Serveur Hetzner avec Coolify installé
- Docker + Docker Compose
- Domaine (ex: `isiquint.app`)

---

## Étape 1 : Créer le repo GitHub

```bash
cd ~/Dev/isiquint-studio
git init
git add .
git commit -m "Initial commit"

# Créer le repo sur GitHub puis :
git remote add origin https://github.com/TON_USER/isiquint-studio.git
git push -u origin main
```

## Étape 2 : Variables GitHub Secrets

Dans **GitHub > Settings > Secrets and variables > Actions** :

| Secret | Valeur |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://supabase.ton-domaine.com` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon de Supabase |

## Étape 3 : Générer les clés Supabase

Après avoir lancé Supabase une première fois (voir Étape 4) :

```bash
# Générer JWT_SECRET
openssl rand -hex 32

# Les clés ANON_KEY et SERVICE_ROLE_KEY sont générées par Supabase
# Elles se trouvent dans les variables d'environnement de Gotrue
docker compose exec supabase-auth env | grep ANON_KEY
docker compose exec supabase-auth env | grep SERVICE_ROLE_KEY
```

## Étape 4 : Déployer sur le serveur

### Option A : Docker Compose directement

```bash
# Copier le projet sur le serveur
scp -r . root@ton-serveur:/opt/isiquint

# Sur le serveur :
cd /opt/isiquint
cp .env.example .env
# Éditer .env avec les vraies valeurs
nano .env

# Lancer
docker compose up -d

# Vérifier
docker compose ps
docker compose logs -f isiquint
```

### Option B : Via Coolify

1. Dans Coolify, créer une nouvelle application **Docker Compose**
2. Sélectionner le repo GitHub `isiquint-studio`
3. Le `docker-compose.yml` sera détecté automatiquement
4. Configurer les variables d'environnement dans Coolify
5. Déployer

## Étape 5 : Configurer Nginx/Traefik (Coolify)

Coolify gère automatiquement SSL avec Let's Encrypt.
Configurer le reverse proxy pour :
- `isiquint.app` → port 3000 (l'app Next.js)
- `supabase.isiquint.app` → port 9999 (Supabase Auth)

## Étape 6 : Initialiser la base de données

```bash
# Le script init.sql est monté automatiquement dans le container
# Mais pour forcer l'exécution :
docker compose exec supabase-db psql -U postgres -d isiquint -f /docker-entrypoint-initdb.d/init.sql
```

## Étape 7 : Créer le premier utilisateur

```bash
# Via l'API Supabase
curl -X POST http://localhost:9999/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"ton@email.com","password":"ton_mdp"}'
```

---

## Structure des fichiers

```
isiquint-studio/
├── .github/workflows/ci.yml    # CI: tests + build
├── Dockerfile                   # Image production (standalone)
├── docker-compose.yml           # App + Supabase stack
├── .dockerignore
├── .env.example
├── supabase/
│   └── init.sql                # Schéma de base
└── ...
```

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de l'API Supabase | `https://supabase.isiquint.app` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (admin) | `eyJhbG...` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `mon_mdp_fort` |
| `JWT_SECRET` | Secret pour les tokens JWT | `hex_64_chars` |
| `API_EXTERNAL_URL` | URL publique Supabase Auth | `https://auth.isiquint.app` |
| `SITE_URL` | URL de l'app | `https://isiquint.app` |

## Commandes utiles

```bash
# Logs
docker compose logs -f isiquint
docker compose logs -f supabase-db

# Restart
docker compose restart isiquint

# Mettre à jour
git pull && docker compose up -d --build

# Backup PostgreSQL
docker compose exec supabase-db pg_dump -U postgres isiquint > backup.sql
```
