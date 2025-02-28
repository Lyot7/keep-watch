"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { memo, useMemo } from "react";
import DashboardStats from "./DashboardStats";
import ItemsByState from "./ItemsByState";

// Available video states
export enum VideoStateEnum {
  ToWatch = "A voir !",
  Impressive = "Impressionnant",
  Recommend = "Recommander"
}

interface CategoryConfig {
  state: VideoStateEnum;
  title: string;
  description: string;
}

interface VeilleProps {
  youtubeVideos: YoutubeVideo[];
}

// Categories configuration for better maintainability
const CATEGORIES: CategoryConfig[] = [
  {
    state: VideoStateEnum.Impressive,
    title: "Vidéos à voir absolument",
    description: "Les vidéos qui m'ont impressionné."
  },
  {
    state: VideoStateEnum.Recommend,
    title: "Vidéos Recommandées",
    description: "Les vidéos que je recommande."
  },
  {
    state: VideoStateEnum.ToWatch,
    title: "Vidéos À Voir",
    description: "Les vidéos qu'il faudrait que je regarde."
  }
];

// VideoCategory component to reduce duplication
const VideoCategory = memo(({
  config,
  youtubeVideos
}: {
  config: CategoryConfig;
  youtubeVideos: YoutubeVideo[];
}) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold mb-4 text-center">
      {config.title}
    </h2>
    <p className="mb-4 text-center text-gray-400">
      {config.description}
    </p>
    <ItemsByState youtubeVideos={youtubeVideos} state={config.state} />
  </div>
));

VideoCategory.displayName = 'VideoCategory';

const Veille: React.FC<VeilleProps> = ({ youtubeVideos }) => {
  // Memoized function to check if a category has videos
  const hasVideosWithState = useMemo(() => {
    return (state: string): boolean => {
      return youtubeVideos.some(video => video.state === state);
    };
  }, [youtubeVideos]);

  // Check if any category has videos
  const hasAnyVideos = useMemo(() => {
    return CATEGORIES.some(category =>
      hasVideosWithState(category.state)
    );
  }, [hasVideosWithState]);

  return (
    <section>
      {/* Dashboard with statistics */}
      <DashboardStats youtubeVideos={youtubeVideos} />

      {/* Video categories sections */}
      <div className="mt-8">
        {CATEGORIES.map(category =>
          hasVideosWithState(category.state) && (
            <VideoCategory
              key={category.state}
              config={category}
              youtubeVideos={youtubeVideos}
            />
          )
        )}

        {/* Message when no videos are found in any category */}
        {!hasAnyVideos && (
          <p className="text-center text-xl text-gray-400 py-10">
            Aucune vidéo trouvée. Veuillez vérifier votre connexion à l&apos;API YouTube ou ajouter des chaînes à suivre.
          </p>
        )}
      </div>
    </section>
  );
};

export default memo(Veille);