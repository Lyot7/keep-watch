/**
 * Script pour vérifier et démarrer le conteneur PostgreSQL
 *
 * Ce script:
 * 1. Vérifie si le conteneur keepwatch-postgres est en cours d'exécution
 * 2. Le démarre si nécessaire
 * 3. Attend que PostgreSQL soit prêt à accepter des connexions
 *
 * Exécuter avec: node scripts/start-postgres.js
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

console.log("🔍 Vérification du conteneur PostgreSQL...");

try {
  // Vérifier si le conteneur est en cours d'exécution
  const containerStatus = execSync(
    "docker ps --filter name=keepwatch-postgres --format '{{.Status}}'",
    { encoding: "utf8" }
  ).trim();

  if (containerStatus) {
    console.log("✅ Le conteneur PostgreSQL est déjà en cours d'exécution");

    // Afficher les informations du conteneur
    try {
      console.log("📊 Détails du conteneur:");
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
    } catch (infoError) {
      console.log(
        `⚠️ Impossible d'obtenir les détails du conteneur: ${infoError.message}`
      );
    }
  } else {
    throw new Error("Container not running");
  }
} catch (error) {
  console.log(
    `⚠️ Le conteneur PostgreSQL n'est pas en cours d'exécution: ${error.message}`
  );
  console.log("🚀 Démarrage du conteneur PostgreSQL...");

  try {
    // Démarrer le conteneur
    execSync("docker-compose up -d postgres", { stdio: "inherit" });
    console.log("✅ Conteneur PostgreSQL démarré avec succès");

    // Attendre que PostgreSQL soit prêt
    console.log("⏳ Attente de la disponibilité de PostgreSQL...");
    execSync("timeout /t 10", { stdio: "inherit" });

    // Vérifier que le conteneur est bien démarré
    try {
      const runningStatus = execSync(
        "docker ps --filter name=keepwatch-postgres --format '{{.Status}}'",
        { encoding: "utf8" }
      ).trim();

      if (runningStatus) {
        console.log(
          "✅ Le conteneur PostgreSQL est maintenant en cours d'exécution"
        );

        // Afficher les informations du conteneur
        try {
          console.log("📊 Détails du conteneur:");
          const containerInfo = execSync(
            'docker inspect keepwatch-postgres --format="{{.State.Status}}"',
            { encoding: "utf8" }
          ).trim();
          console.log(`   État: ${containerInfo}`);

          const portInfo = execSync("docker port keepwatch-postgres", {
            encoding: "utf8",
          }).trim();
          console.log(`   Ports: ${portInfo}`);
        } catch (detailError) {
          console.log(
            `⚠️ Impossible d'obtenir les détails du conteneur: ${detailError.message}`
          );
        }

        // Tester la connexion PostgreSQL
        console.log("🔌 Test de connexion PostgreSQL...");

        // Attendre quelques secondes supplémentaires pour que PostgreSQL soit prêt à accepter des connexions
        execSync("timeout /t 5", { stdio: "inherit" });

        try {
          execSync("docker exec keepwatch-postgres pg_isready -U postgres", {
            stdio: "inherit",
          });
          console.log("✅ PostgreSQL est prêt à accepter des connexions");
        } catch (pgError) {
          console.log(
            `⚠️ PostgreSQL n'est pas encore prêt à accepter des connexions: ${pgError.message}`
          );
          console.log("⏳ Attente supplémentaire...");
          execSync("timeout /t 10", { stdio: "inherit" });
          console.log(
            "✅ Conteneur démarré, mais l'état de connexion n'a pas pu être vérifié"
          );
        }
      } else {
        console.log("⚠️ Le conteneur n'a pas pu être démarré correctement");
      }
    } catch (statusError) {
      console.log(
        `⚠️ Impossible de vérifier l'état du conteneur après démarrage: ${statusError.message}`
      );
    }
  } catch (startError) {
    console.error(
      "❌ Erreur lors du démarrage du conteneur PostgreSQL:",
      startError.message
    );
    process.exit(1);
  }
}

console.log("🎉 Opération terminée");
