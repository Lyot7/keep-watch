"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
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
      {/* Afficher la catégorie "Impressionnant" uniquement si elle contient des vidéos */}
      {hasVideosWithState("Impressionnant") && (
        <>
          <p className="mb-4 my-auto text-center">
            Les vidéos qui m&apos;ont impressionné.
          </p>
          <ItemsByState youtubeVideos={youtubeVideos} state="Impressionnant" />
        </>
      )}

      {/* Afficher la catégorie "Recommander" uniquement si elle contient des vidéos */}
      {hasVideosWithState("Recommander") && (
        <>
          <p className="mb-4 my-auto text-center">
            Les vidéos que je recommande.
          </p>
          <ItemsByState youtubeVideos={youtubeVideos} state="Recommander" />
        </>
      )}

      {/* Afficher la catégorie "A voir !" uniquement si elle contient des vidéos */}
      {hasVideosWithState("A voir !") && (
        <>
          <p className="mb-4 my-auto text-center">
            Les vidéos qu&apos;il faudrait que je regarde.
          </p>
          <ItemsByState youtubeVideos={youtubeVideos} state="A voir !" />
        </>
      )}

      {/* Message si aucune vidéo n'est trouvée dans aucune catégorie */}
      {!hasVideosWithState("Impressionnant") && !hasVideosWithState("Recommander") && !hasVideosWithState("A voir !") && (
        <p className="text-center text-xl text-gray-400 py-10">
          Aucune vidéo trouvée. Veuillez vérifier votre connexion à l&apos;API YouTube ou ajouter des chaînes à suivre.
        </p>
      )}
    </section>
  );
};

export default Veille;