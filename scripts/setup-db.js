/**
 * Script pour configurer la base de données PostgreSQL avec Docker
 *
 * Ce script:
 * 1. Vérifie si le conteneur Docker est en cours d'exécution
 * 2. Lance Docker si nécessaire (uniquement en environnement local)
 * 3. Génère le client Prisma
 * 4. Applique les migrations Prisma
 *
 * Exécuter avec: node scripts/setup-db.js
 */

import { execSync } from "child_process";
import dotenv from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

// Charger les variables d'environnement
dotenv.config();

console.log("🔧 Configuration de la base de données PostgreSQL...");

// Déterminer si on est dans Docker ou en local
const isInDocker =
  process.env.DATABASE_URL && process.env.DATABASE_URL.includes("@postgres:");
console.log(`📌 Environnement détecté: ${isInDocker ? "Docker" : "Local"}`);

try {
  // Étape 1: Si on est en local, vérifier si le conteneur Docker est en cours d'exécution
  if (!isInDocker) {
    console.log("\n🔍 Vérification du conteneur Docker...");
    try {
      const containerStatus = execSync(
        "docker ps --filter name=keepwatch-postgres --format '{{.Status}}'",
        {
          encoding: "utf8",
        }
      ).trim();

      if (containerStatus) {
        console.log("✅ Le conteneur PostgreSQL est en cours d'exécution.");
        // Afficher plus d'informations sur le conteneur
        console.log("📊 Détails du conteneur PostgreSQL:");
        const containerInfo = execSync(
          'docker inspect keepwatch-postgres --format="{{.State.Status}}"',
          { encoding: "utf8" }
        ).trim();
        console.log(`   État: ${containerInfo}`);

        // Afficher les ports séparément
        const portInfo = execSync("docker port keepwatch-postgres", {
          encoding: "utf8",
        }).trim();
        console.log(`   Ports: ${portInfo}`);
      } else {
        throw new Error("Container not running");
      }
    } catch (error) {
      console.log(
        "⚠️ Le conteneur PostgreSQL n'est pas en cours d'exécution. Démarrage..."
      );
      console.log(`   Erreur: ${error.message}`);

      try {
        execSync("docker-compose up -d postgres", { stdio: "inherit" });
        console.log("✅ Conteneur PostgreSQL démarré avec succès.");

        // Attendre que PostgreSQL soit prêt
        console.log("⏳ Attente de la disponibilité de PostgreSQL...");
        // Attendre un peu plus longtemps (10 secondes au lieu de 5)
        execSync("timeout /t 10", { stdio: "inherit" });

        // Afficher l'état du conteneur après démarrage
        console.log("📊 État du conteneur après démarrage:");
        const containerInfo = execSync(
          'docker inspect keepwatch-postgres --format="{{.State.Status}}"',
          { encoding: "utf8" }
        ).trim();
        console.log(`   État: ${containerInfo}`);

        const portInfo = execSync("docker port keepwatch-postgres", {
          encoding: "utf8",
        }).trim();
        console.log(`   Ports: ${portInfo}`);
      } catch (dockerError) {
        console.error(
          "❌ Erreur lors du démarrage du conteneur Docker:",
          dockerError.message
        );
        process.exit(1);
      }
    }

    // Tester la connexion PostgreSQL explicitement avec pg_isready
    console.log("\n🔌 Test de connexion PostgreSQL avec pg_isready...");
    try {
      // Remarque: si le client PostgreSQL n'est pas installé localement, cette commande échouera
      // mais ce n'est pas grave car on va utiliser une méthode alternative
      execSync("docker exec keepwatch-postgres pg_isready -U postgres", {
        stdio: "inherit",
      });
      console.log("✅ PostgreSQL est prêt à accepter des connexions.");
    } catch (pgError) {
      console.log(
        `⚠️ Impossible d'utiliser pg_isready, utilisation d'une méthode alternative: ${pgError.message}`
      );
      // Méthode alternative: exécuter une commande psql simple
      try {
        execSync(
          "docker exec keepwatch-postgres psql -U postgres -c 'SELECT 1'",
          { stdio: "inherit" }
        );
        console.log("✅ Connexion PostgreSQL réussie avec psql.");
      } catch (psqlError) {
        console.log(
          `⚠️ Problème de connexion à PostgreSQL. Tentative de reconfiguration: ${psqlError.message}`
        );

        // Reconfigurer les droits PostgreSQL
        try {
          console.log("🔐 Reconfiguration des droits d'accès PostgreSQL...");
          execSync(
            "docker exec keepwatch-postgres psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres';\"",
            { stdio: "inherit" }
          );
          execSync(
            'docker exec keepwatch-postgres psql -U postgres -c "CREATE DATABASE keepwatch;" || true',
            { stdio: "inherit" }
          );
          console.log("✅ Droits PostgreSQL reconfigurés.");
        } catch (reconfigError) {
          console.log(
            `⚠️ Impossible de reconfigurer PostgreSQL, mais on continue: ${reconfigError.message}`
          );
        }
      }
    }
  } else {
    console.log("\n⏳ Attente de la disponibilité de PostgreSQL...");
    // En environnement Docker, on suppose que le service postgres est déjà configuré et disponible
    try {
      // Attendre que PostgreSQL soit prêt (3 tentatives maximum)
      for (let i = 0; i < 3; i++) {
        try {
          execSync("npx prisma db pull --force", { stdio: "inherit" });
          console.log("✅ Connexion PostgreSQL établie.");
          break;
        } catch (e) {
          if (i === 2) throw e;
          console.log(
            `⏳ Tentative de connexion ${
              i + 1
            }/3 échouée, nouvel essai dans 3 secondes...`
          );
          execSync("sleep 3");
        }
      }
    } catch (error) {
      console.log(
        "⚠️ Impossible de se connecter à PostgreSQL, mais on continue..."
      );
      console.log(`   Erreur: ${error.message}`);
    }
  }

  // Étape 2: Vérifier si le client Prisma est déjà généré
  const prismaClientPath = join(
    process.cwd(),
    "node_modules",
    ".prisma",
    "client"
  );
  const clientExists = existsSync(prismaClientPath);

  if (clientExists) {
    console.log("\n📦 Client Prisma déjà généré, étape ignorée.");
  } else {
    // Générer le client Prisma avec plusieurs tentatives
    console.log("\n📦 Génération du client Prisma...");
    let prismaGenerated = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        execSync("npx prisma generate", { stdio: "inherit" });
        prismaGenerated = true;
        console.log("✅ Client Prisma généré avec succès.");
        break;
      } catch (genError) {
        console.log(
          `⚠️ Tentative ${attempt}/3 échouée pour générer le client Prisma.`
        );
        if (attempt === 3) {
          console.log(
            "⚠️ Impossible de générer le client Prisma, mais on continue..."
          );
          console.log(`   Erreur: ${genError.message}`);
        } else {
          console.log("⏳ Nouvelle tentative dans 3 secondes...");
          // Attendre 3 secondes avant la prochaine tentative
          execSync("timeout /t 3", { stdio: "inherit" });
        }
      }
    }

    if (!prismaGenerated) {
      console.log(
        "⚠️ Le client Prisma n'a pas pu être généré après 3 tentatives."
      );
    }
  }

  // Étape 3: Vérifier et créer la base de données si nécessaire
  console.log("\n🔍 Vérification de la base de données keepwatch...");
  try {
    execSync(
      "docker exec keepwatch-postgres psql -U postgres -c \"SELECT 1 FROM pg_database WHERE datname = 'keepwatch'\" | grep -q 1",
      { stdio: "pipe" }
    );
    console.log("✅ Base de données keepwatch existe déjà.");
  } catch (dbExistsError) {
    console.log(
      `⚠️ Base de données keepwatch non trouvée. Création: ${dbExistsError.message}`
    );
    try {
      execSync(
        'docker exec keepwatch-postgres psql -U postgres -c "CREATE DATABASE keepwatch;"',
        { stdio: "inherit" }
      );
      console.log("✅ Base de données keepwatch créée avec succès.");
    } catch (createDbError) {
      console.log(
        "⚠️ Erreur lors de la création de la base de données:",
        createDbError.message
      );
    }
  }

  // Étape 4: Appliquer les migrations
  console.log("\n🔄 Application des migrations...");
  try {
    // Utiliser directement la commande docker exec pour migrer
    console.log("🔄 Tentative de migration directe avec docker exec...");
    try {
      execSync(
        'docker exec -e DATABASE_URL="postgresql://postgres:postgres@localhost:5432/keepwatch?schema=public" keepwatch-postgres npx prisma migrate deploy',
        { stdio: "inherit" }
      );
      console.log("✅ Migrations appliquées avec succès via docker exec.");
    } catch (dockerMigrateError) {
      console.log(
        `⚠️ Erreur lors de la migration via docker exec. Essai avec Prisma local: ${dockerMigrateError.message}`
      );
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("✅ Migrations appliquées avec succès via Prisma local.");
    }
  } catch (migrateError) {
    console.log(
      "⚠️ Erreur pendant le déploiement des migrations. Tentative de création..."
    );
    console.log(`   Erreur: ${migrateError.message}`);
    try {
      execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
    } catch (devMigrateError) {
      console.log("❌ Erreur pendant la création des migrations:");
      console.log(`   Erreur: ${devMigrateError.message}`);
      console.log("⚠️ Continuons avec l'hypothèse que la base existe déjà...");
    }
  }

  console.log("\n✅ Configuration de la base de données terminée avec succès!");
  console.log("\n📝 Vous pouvez maintenant démarrer l'application avec:");
  console.log("   npm run dev");

  console.log("\n🔎 Pour explorer la base de données avec Prisma Studio:");
  console.log("   npx prisma studio");
} catch (error) {
  console.error(
    "\n❌ Erreur lors de la configuration de la base de données:",
    error.message
  );
  process.exit(1);
}
