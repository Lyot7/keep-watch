/**
 * Script pour démarrer l'application complète avec Docker
 *
 * Ce script:
 * 1. Vérifie si les conteneurs Docker sont en cours d'exécution
 * 2. Démarre ou redémarre la stack Docker complète
 * 3. Affiche les logs des conteneurs
 *
 * Exécuter avec: node scripts/docker-start-all.js
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

console.log("🚀 Démarrage de Keep Watch avec Docker...");

try {
  // Vérifier si les conteneurs sont déjà en cours d'exécution
  console.log("\n🔍 Vérification des conteneurs Docker...");
  const containers = execSync("docker ps --filter name=keepwatch -q", {
    encoding: "utf8",
  }).trim();

  if (containers) {
    console.log("⚠️ Des conteneurs Keep Watch sont déjà en cours d'exécution");
    console.log("📋 Liste des conteneurs:");
    execSync("docker ps --filter name=keepwatch", { stdio: "inherit" });

    // Demander à l'utilisateur s'il veut redémarrer
    console.log("\n🔄 Redémarrage des conteneurs...");
    execSync("docker-compose down", { stdio: "inherit" });
  }

  // Construire et démarrer les conteneurs
  console.log("\n🏗️ Construction et démarrage des conteneurs Docker...");
  execSync("docker-compose up --build -d", { stdio: "inherit" });

  // Vérifier que les conteneurs sont bien démarrés
  console.log("\n✅ Vérification de l'état des conteneurs:");
  execSync("docker ps --filter name=keepwatch", { stdio: "inherit" });

  // Attendre que les conteneurs soient prêts
  console.log("\n⏳ Attente pour que les services soient prêts...");
  console.log("   (cela peut prendre quelques instants)");

  // Attendre quelques secondes
  execSync("timeout /t 10", { stdio: "inherit" });

  // Vérifier la santé du conteneur PostgreSQL
  try {
    console.log("\n🔍 Vérification de l'état de PostgreSQL...");
    execSync("docker exec keepwatch-postgres pg_isready -U postgres", {
      stdio: "inherit",
    });
    console.log("✅ PostgreSQL est prêt à accepter des connexions");
  } catch (pgError) {
    console.log(`⚠️ PostgreSQL n'est pas encore prêt: ${pgError.message}`);
    console.log("   Attendons un peu plus...");
    execSync("timeout /t 5", { stdio: "inherit" });
  }

  // Afficher l'URL de l'application
  console.log("\n🌐 L'application est accessible à l'adresse:");
  console.log("   http://localhost:3000");

  // Afficher les commandes utiles
  console.log("\n📋 Commandes utiles:");
  console.log("   - Pour voir les logs: npm run docker:logs");
  console.log("   - Pour arrêter les conteneurs: npm run docker:down");
  console.log("   - Pour accéder à la base de données: npx prisma studio");

  // Demander si l'utilisateur souhaite voir les logs
  console.log("\n📊 Affichage des logs en direct (Ctrl+C pour quitter)...");
  execSync("docker-compose logs -f", { stdio: "inherit" });
} catch (error) {
  console.error("\n❌ Erreur lors du démarrage des conteneurs:", error.message);
  process.exit(1);
}
