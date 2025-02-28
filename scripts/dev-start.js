/**
 * Script pour démarrer l'environnement de développement local
 *
 * Ce script:
 * 1. Démarre PostgreSQL dans Docker
 * 2. Attend que PostgreSQL soit prêt
 * 3. Exécute les migrations Prisma si nécessaire
 * 4. Démarre l'application Next.js en mode développement
 *
 * Exécuter avec: node scripts/dev-start.js
 */

import { execSync, spawn } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

console.log("🚀 Démarrage de l'environnement de développement...");

// S'assurer que le fichier .env.local existe
if (!fs.existsSync(path.join(process.cwd(), ".env.local"))) {
  console.log("⚠️ Fichier .env.local non trouvé, création à partir de .env");
  fs.copyFileSync(
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), ".env.local")
  );
}

try {
  // Démarrer PostgreSQL avec Docker
  console.log("\n🐘 Démarrage de PostgreSQL avec Docker...");
  execSync("docker-compose -f docker-compose.dev.yml up -d", {
    stdio: "inherit",
  });

  // Vérifier que PostgreSQL est démarré
  console.log("\n⏳ Attente pour que PostgreSQL soit prêt...");
  let pgReady = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!pgReady && attempts < maxAttempts) {
    try {
      execSync("docker exec keepwatch-postgres pg_isready -U postgres", {
        stdio: "pipe",
      });
      pgReady = true;
      console.log("✅ PostgreSQL est prêt à accepter des connexions");
    } catch (error) {
      attempts++;
      console.log(
        `⏳ PostgreSQL n'est pas encore prêt (${attempts}/${maxAttempts})... attente de 2 secondes`
      );
      execSync("timeout /t 2", { stdio: "pipe" });
    }
  }

  if (!pgReady) {
    throw new Error(
      "PostgreSQL n'a pas pu démarrer après plusieurs tentatives"
    );
  }

  // Exécuter les migrations Prisma
  console.log("\n🔄 Application des migrations Prisma...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  // Générer le client Prisma si nécessaire
  console.log("\n🔄 Génération du client Prisma...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // Démarrer l'application Next.js en mode développement
  console.log("\n📱 Démarrage de Next.js en mode développement...");
  console.log(
    "🌐 L'application sera accessible à l'adresse: http://localhost:3000"
  );
  console.log("🔄 Les modifications de code seront rechargées automatiquement");
  console.log("\n⚠️ Pour arrêter l'application, appuyez sur Ctrl+C");
  console.log(
    "⚠️ Pour arrêter PostgreSQL, exécutez: docker-compose -f docker-compose.dev.yml down"
  );

  // Démarrer Next.js avec spawn pour garder le processus en vie
  const nextProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
  });

  nextProcess.on("error", (error) => {
    console.error("\n❌ Erreur lors du démarrage de Next.js:", error.message);
    process.exit(1);
  });

  process.on("SIGINT", () => {
    console.log("\n🛑 Arrêt de l'application Next.js...");
    nextProcess.kill("SIGINT");
  });
} catch (error) {
  console.error("\n❌ Erreur:", error.message);
  process.exit(1);
}
