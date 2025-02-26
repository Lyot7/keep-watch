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
      {/* Afficher la catégorie "🤯" uniquement si elle contient des vidéos */}
      {hasVideosWithState("🤯") && (
        <>
          <p className="mb-4 my-auto text-center">
            Les vidéos qui m&apos;ont marqué.
          </p>
          <ItemsByState youtubeVideos={youtubeVideos} state="🤯" />
        </>
      )}

      {/* Afficher la catégorie "Vu" uniquement si elle contient des vidéos */}
      {hasVideosWithState("Vu") && (
        <>
          <p className="mb-4 my-auto text-center">
            Les dernières vidéos que j&apos;ai regardé.
          </p>
          <ItemsByState youtubeVideos={youtubeVideos} state="Vu" />
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
      {!hasVideosWithState("🤯") && !hasVideosWithState("Vu") && !hasVideosWithState("A voir !") && (
        <p className="text-center text-xl text-gray-400 py-10">
          Aucune vidéo trouvée. Veuillez vérifier votre connexion à l&apos;API YouTube ou ajouter des chaînes à suivre.
        </p>
      )}
    </section>
  );
};

export default Veille;