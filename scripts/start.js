/**
 * Script de démarrage de l'application
 *
 * Ce script:
 * 1. Démarre la base de données PostgreSQL (si elle n'est pas déjà en cours d'exécution)
 * 2. Applique les migrations Prisma
 * 3. Démarre l'application
 *
 * Exécuter avec: node scripts/start.js
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

console.log("🚀 Démarrage de Keep Watch...");

try {
  // Démarrer la base de données
  console.log("\n📦 Démarrage de PostgreSQL...");
  try {
    execSync("npm run db:start", { stdio: "inherit" });
    console.log(
      "✅ PostgreSQL démarré avec succès (ou déjà en cours d'exécution)"
    );
  } catch (error) {
    console.error("❌ Erreur lors du démarrage de PostgreSQL:", error.message);
    process.exit(1);
  }

  // Configurer la base de données
  console.log("\n🔧 Configuration de la base de données...");
  try {
    execSync("npm run db:setup", { stdio: "inherit" });
    console.log("✅ Base de données configurée avec succès");
  } catch (error) {
    console.log(
      "⚠️ Des erreurs ont été rencontrées lors de la configuration de la base de données, mais on continue..."
    );
    console.log(`   Erreur: ${error.message}`);
  }

  // Démarrer l'application
  console.log("\n🚀 Démarrage de l'application...");
  execSync("npm run dev", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Erreur lors du démarrage de l'application:", error.message);
  process.exit(1);
}
