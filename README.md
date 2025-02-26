# Keep Watch 📺

Une application pour suivre et organiser vos vidéos YouTube préférées avec persistance PostgreSQL.

## Configuration avec Docker (Recommandée)

La méthode la plus simple pour démarrer l'application est d'utiliser Docker, qui configurera automatiquement à la fois l'application et la base de données PostgreSQL.

### Prérequis

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop)

### Démarrage rapide

```bash
# Démarrer l'application et la base de données
npm run docker:dev

# L'application sera disponible sur http://localhost:3000
# La base de données PostgreSQL sera disponible sur localhost:7864
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

### Installation

```bash
# Installer les dépendances
npm install

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
- `YOUTUBE_MAX_RESULTS_PER_CHANNEL`: Nombre maximum de vidéos à récupérer par chaîne
- `YOUTUBE_DAILY_QUOTA_LIMIT`: Limite quotidienne d'utilisation de l'API YouTube

## Fonctionnalités

- Récupération des vidéos YouTube à partir de chaînes spécifiées
- Classement des vidéos par état (à voir, vu, etc.)
- Organisation par thèmes
- Filtrage par durée
- Stockage persistant avec PostgreSQL

## Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+ installé et configuré
- Une clé API YouTube Data API v3

## Configuration

1. **Cloner le dépôt**

```bash
git clone <url-du-repo>
cd keep-watch
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de la base de données PostgreSQL**

Assurez-vous que PostgreSQL est installé et en cours d'exécution, puis:

```bash
# Créer une base de données PostgreSQL
createdb keepwatch

# Configuration des variables d'environnement
# Modifiez .env et .env.local avec vos propres informations
```

4. **Configuration des variables d'environnement**

Créez ou modifiez les fichiers `.env` et `.env.local` avec les informations suivantes:

```
# API YouTube
YOUTUBE_API_KEY="VOTRE_CLÉ_API_YOUTUBE"

# Configuration PostgreSQL
DATABASE_URL="postgresql://utilisateur:mot_de_passe@localhost:7864/keepwatch"

# Configuration du cache YouTube
YOUTUBE_CACHE_TTL_HOURS="24"
YOUTUBE_MAX_RESULTS_PER_CHANNEL="10"
YOUTUBE_DAILY_QUOTA_LIMIT="8000"
```

5. **Initialisation de la base de données**

```bash
# Génération du client Prisma
npm run prisma:generate

# Exécution des migrations
npm run prisma:migrate

# OU utilisez le script de configuration automatique
node prisma/setup-postgres.js
```

## Utilisation

1. **Démarrer le serveur de développement**

```bash
npm run dev
```

2. **Accéder à l'application**

Ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)

## Optimisation du quota API YouTube

L'application est conçue pour gérer efficacement le quota d'API YouTube:

- Les résultats sont mis en cache pendant 24h par défaut
- Les requêtes API sont limitées à 10 vidéos par chaîne par défaut
- Le système suit l'utilisation du quota et évite de faire des requêtes inutiles
- En cas de limite de quota atteinte, l'application utilise les données en cache

Vous pouvez ajuster ces paramètres dans les fichiers `.env` et `.env.local`.

## Personnalisation

### Ajouter de nouvelles chaînes YouTube

Modifiez le fichier `src/pages/api/youtube/getYoutubeVideos.ts` pour ajouter de nouvelles chaînes:

```typescript
const YOUTUBE_CHANNELS: ChannelConfig[] = [
  { id: "UC5HDIVwuqoIuKKw-WbQ4CvA", theme: "Développement" },
  { id: "UCLKx4-_XO5sR0AO0j8ye7zQ", theme: "Automatisation & Productivité" },
  // Ajoutez d'autres chaînes selon vos besoins
];
```

## Licence

MIT
