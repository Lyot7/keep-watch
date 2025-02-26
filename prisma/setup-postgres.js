/**
 * Script pour configurer la base de données PostgreSQL
 *
 * Ce script:
 * 1. Crée la base de données si elle n'existe pas
 * 2. Applique les migrations Prisma
 * 3. Initialise les données nécessaires
 *
 * Exécuter avec: node prisma/setup-postgres.js
 */

import { execSync } from "child_process";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

console.log("🔧 Configuration de la base de données PostgreSQL...");

try {
  // Étape 1: Générer le client Prisma
  console.log("\n📦 Génération du client Prisma...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // Étape 2: Vérifier si la base de données existe déjà
  console.log("\n🔍 Vérification de la base de données...");
  // Cette commande échouera si la base n'existe pas, ce qui est normal
  try {
    execSync("npx prisma db pull", { stdio: "inherit" });
    console.log("✅ Base de données existante détectée.");
  } catch (dbError) {
    console.log("⚠️ Base de données non existante. Création en cours...");
    console.log(`   Erreur: ${dbError.message}`);

    // Extraire les informations de connexion de l'URL de la base de données
    const url = process.env.DATABASE_URL;
    const matches = url.match(
      /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
    );

    if (!matches) {
      throw new Error("Format d'URL de base de données invalide.");
    }

    const dbName = matches[5];

    // Créer la base de données (en se connectant à la base 'postgres')
    const pgUrl = url.replace(dbName, "postgres");
    const createDbCmd = `psql "${pgUrl}" -c "CREATE DATABASE ${dbName};"`;

    try {
      execSync(createDbCmd);
      console.log(`✅ Base de données '${dbName}' créée avec succès.`);
    } catch (createError) {
      console.error(
        "❌ Erreur lors de la création de la base de données:",
        createError.message
      );
      console.log(
        "⚠️ Continuons avec l'hypothèse que la base existe mais n'est pas accessible via Prisma..."
      );
    }
  }

  // Étape 3: Appliquer les migrations
  console.log("\n🔄 Application des migrations...");
  execSync("npx prisma migrate dev --name init", { stdio: "inherit" });

  console.log("\n✅ Configuration de la base de données terminée avec succès!");
  console.log("\n📝 Vous pouvez maintenant démarrer l'application avec:");
  console.log("   npm run dev");

  console.log("\n🔎 Pour explorer la base de données avec Prisma Studio:");
  console.log("   npm run prisma:studio");
} catch (error) {
  console.error(
    "\n❌ Erreur lors de la configuration de la base de données:",
    error.message
  );
  process.exit(1);
}
