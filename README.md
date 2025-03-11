# Keep Watch 📺

Une application Next.js pour suivre et organiser vos vidéos YouTube préférées avec persistance PostgreSQL.

## Fonctionnalités

- Récupération des vidéos YouTube à partir de chaînes spécifiées
- Classement des vidéos par état (à voir, vu, etc.)
- Organisation par thèmes
- Filtrage par durée
- Stockage persistant avec PostgreSQL
- Gestion efficace des quotas de l'API YouTube

## Technologies utilisées

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Node.js, Next.js API routes
- **Base de données**: PostgreSQL 15, Prisma ORM
- **Conteneurisation**: Docker, Docker Compose
- **Langage**: TypeScript

## Configuration avec Docker (Recommandée)

La méthode la plus simple pour démarrer l'application est d'utiliser Docker, qui configurera automatiquement à la fois l'application et la base de données PostgreSQL.

### Prérequis

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop)

### Démarrage rapide

```bash
# Cloner le dépôt
git clone https://github.com/your-username/keep-watch.git
cd keep-watch

# Configurer les variables d'environnement
# Modifiez le fichier .env avec votre clé API YouTube et autres paramètres

# Démarrer l'application et la base de données
npm run docker:dev

# L'application sera disponible sur http://localhost:3000
# La base de données PostgreSQL sera disponible sur localhost:5432
```

### Autres commandes Docker

```bash
# Reconstruire les conteneurs (en cas de changements dans les dépendances)
npm run docker:dev:rebuild

# Arrêter tous les conteneurs
npm run docker:down

# Arrêter les conteneurs et supprimer les volumes (reset complet)
npm run docker:clean
```

## Configuration sans Docker (Développement local)

Si vous préférez exécuter l'application localement sans Docker, vous aurez quand même besoin de PostgreSQL:

### Prérequis

- Node.js v20 ou supérieur
- PostgreSQL v15 ou supérieur
- Une clé API YouTube Data API v3

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-username/keep-watch.git
cd keep-watch

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Modifiez le fichier .env avec votre clé API YouTube et autres paramètres

# Démarrer uniquement la base de données PostgreSQL avec Docker
npm run db:start

# Configurer la base de données
npm run db:setup

# Démarrer l'application
npm run dev
```

### Commandes de développement

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations Prisma
npm run prisma:migrate

# Explorer la base de données avec Prisma Studio
npm run prisma:studio

# Exécuter le script de démonstration
npm run demo

# Démarrer l'application
npm run dev

# Construire l'application pour la production
npm run build

# Démarrer l'application en mode production
npm run start
```

## Structure du projet

```
keep-watch/
├── .next/              # Dossier généré par Next.js
├── prisma/             # Modèles Prisma et migrations
│   ├── migrations/     # Migrations de la base de données
│   └── schema.prisma   # Schéma de la base de données
├── public/             # Fichiers statiques
├── scripts/            # Scripts utilitaires
├── src/                # Code source
│   ├── app/            # Composants et routes Next.js App Router
│   ├── components/     # Composants React réutilisables
│   ├── features/       # Fonctionnalités regroupées par domaine
│   ├── hooks/          # Custom React hooks
│   ├── libs/           # Bibliothèques et utilitaires
│   ├── pages/          # Routes Next.js Pages Router (si utilisées)
│   ├── services/       # Services d'accès aux données et APIs
│   └── types/          # Définitions de types TypeScript
├── .env                # Variables d'environnement
├── docker-compose.yml  # Configuration Docker Compose
├── Dockerfile.postgres # Dockerfile personnalisé pour PostgreSQL
├── next.config.ts      # Configuration Next.js
├── package.json        # Dépendances et scripts npm
└── tailwind.config.ts  # Configuration TailwindCSS
```

## Structure de la base de données

L'application utilise Prisma pour définir le schéma de la base de données avec les modèles suivants:

- `YoutubeChannel`: Stocke les informations sur les chaînes YouTube
- `YoutubeVideoCache`: Stocke les vidéos YouTube récupérées
- `VideoState`: Gère l'état de visionnage des vidéos
- `Theme`: Définit les thèmes personnalisés
- `VideoTheme`: Associe des vidéos à des thèmes
- `ApiQuotaUsage`: Suit l'utilisation de l'API YouTube pour respecter les quotas

## Variables d'environnement

Les variables d'environnement sont configurées dans le fichier `.env`:

- `YOUTUBE_API_KEY`: Clé API YouTube pour récupérer les vidéos
- `DATABASE_URL`: URL de connexion à la base de données PostgreSQL
- `YOUTUBE_CACHE_TTL_HOURS`: Durée de validité du cache des vidéos

## Optimisation du quota API YouTube

L'application est conçue pour gérer efficacement les données YouTube:

- Les résultats sont mis en cache pendant 24h par défaut
- Récupération du nombre maximum de vidéos autorisé par l'API YouTube (50 par chaîne)
- Le système continue de suivre l'utilisation du quota API pour des raisons de monitoring
- En cas d'erreur API, l'application utilise les données en cache

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## Licence

MIT
