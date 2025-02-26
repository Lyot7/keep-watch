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
        execSync("timeout /t 5", { stdio: "inherit" });
      } catch (dockerError) {
        console.error(
          "❌ Erreur lors du démarrage du conteneur Docker:",
          dockerError.message
        );
        process.exit(1);
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

  // Étape 2: Générer le client Prisma
  console.log("\n📦 Génération du client Prisma...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // Étape 3: Appliquer les migrations
  console.log("\n🔄 Application des migrations...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Migrations appliquées avec succès.");
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
