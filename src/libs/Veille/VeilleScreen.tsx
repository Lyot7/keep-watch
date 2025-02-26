"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import DashboardStats from "./DashboardStats";
import ItemsByState from "./ItemsByState";

interface VeilleProps {
  youtubeVideos: YoutubeVideo[];
}

const Veille: React.FC<VeilleProps> = ({ youtubeVideos }) => {
  // Vérifier si une catégorie contient des vidéos
  const hasVideosWithState = (state: string): boolean => {
    return youtubeVideos.some(video => video.state === state);
  };

  return (
    <section>
      {/* Afficher le dashboard avec les statistiques */}
      <DashboardStats youtubeVideos={youtubeVideos} />

      {/* Sections de vidéos par catégorie */}
      <div className="mt-8">
        {/* Afficher la catégorie "Impressionnant" uniquement si elle contient des vidéos */}
        {hasVideosWithState("Impressionnant") && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Vidéos à voir absolument
            </h2>
            <p className="mb-4 text-center text-gray-400">
              Les vidéos qui m&apos;ont impressionné.
            </p>
            <ItemsByState youtubeVideos={youtubeVideos} state="Impressionnant" />
          </div>
        )}

        {/* Afficher la catégorie "Recommander" uniquement si elle contient des vidéos */}
        {hasVideosWithState("Recommander") && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Vidéos Recommandées
            </h2>
            <p className="mb-4 text-center text-gray-400">
              Les vidéos que je recommande.
            </p>
            <ItemsByState youtubeVideos={youtubeVideos} state="Recommander" />
          </div>
        )}

        {/* Afficher la catégorie "A voir !" uniquement si elle contient des vidéos */}
        {hasVideosWithState("A voir !") && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Vidéos À Voir
            </h2>
            <p className="mb-4 text-center text-gray-400">
              Les vidéos qu&apos;il faudrait que je regarde.
            </p>
            <ItemsByState youtubeVideos={youtubeVideos} state="A voir !" />
          </div>
        )}

        {/* Message si aucune vidéo n'est trouvée dans aucune catégorie */}
        {!hasVideosWithState("Impressionnant") && !hasVideosWithState("Recommander") && !hasVideosWithState("A voir !") && (
          <p className="text-center text-xl text-gray-400 py-10">
            Aucune vidéo trouvée. Veuillez vérifier votre connexion à l&apos;API YouTube ou ajouter des chaînes à suivre.
          </p>
        )}
      </div>
    </section>
  );
};

export default Veille;