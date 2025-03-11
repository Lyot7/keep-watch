import Veille from "@/libs/Veille/VeilleScreen";
import { getYoutubeVideos, YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { PrismaClient } from "@prisma/client";
import { Suspense } from "react";

// Initialize Prisma client
const prisma = new PrismaClient();

// This page is a Server Component, so we can use async directly.
export default async function Page() {
  // Wrap in try/catch for better error handling
  let youtubeVideos: YoutubeVideo[] = [];
  try {
    // Récupérer les vidéos de YouTube
    youtubeVideos = await getYoutubeVideos();
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    // Continue with empty array
  }

  // Vérifier si le modèle VideoState existe dans Prisma
  let videoStates: { videoId: string; state: string; duration: string | null; durationSeconds: number | null }[] = [];

  try {
    // Récupérer les états des vidéos depuis la base de données
    // Sans vérification préalable, on utilise try/catch pour gérer les erreurs
    videoStates = await prisma.videoState.findMany({
      select: {
        videoId: true,
        state: true,
        duration: true,
        durationSeconds: true
      }
    });
  } catch (error) {
    console.error("Error fetching video states:", error);
    // Continuer sans les états
  }

  // Créer un Map pour accéder rapidement aux données d'une vidéo par son ID
  const videoStateMap = new Map(
    videoStates.map(state => [state.videoId, state])
  );

  // Mettre à jour les états des vidéos et préserver les informations de durée
  const videosWithState = youtubeVideos.map(video => {
    const stateData = videoStateMap.get(video.id);
    return {
      ...video,
      state: stateData?.state || video.state || "A voir !",
      // Conserver les informations de durée de l'API YouTube
      // mais utiliser celles de la base de données si disponibles
      duration: stateData?.duration || video.duration,
      durationSeconds: stateData?.durationSeconds || video.durationSeconds,
    };
  });

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Grille en perspective en arrière-plan */}
      <div className="perspective-grid">
        <div className="grid-lines"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <header className="py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Keep Watch
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bienvenue sur Keep Watch, ma plateforme personnelle de veille technologique et de productivité.
          </p>
        </header>

        <Suspense fallback={<div>Chargement des vidéos...</div>}>
          <Veille youtubeVideos={videosWithState} />
        </Suspense>

        <footer className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>Développé avec Next.js, Tailwind CSS et l&apos;API YouTube</p>
        </footer>
      </div>
    </main>
  );
}
