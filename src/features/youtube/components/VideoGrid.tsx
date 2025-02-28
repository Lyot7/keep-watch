'use client';

import { useYoutube } from '@/hooks/useYoutube';
import { VideoStateEnum, YoutubeVideo } from '@/types/youtube';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: YoutubeVideo[];
  isLoading?: boolean;
}

export function VideoGrid({ videos, isLoading = false }: VideoGridProps) {
  const { updateVideoState } = useYoutube();

  // Handle changing the state of a video
  const handleStateChange = async (videoId: string, newState: VideoStateEnum) => {
    await updateVideoState(videoId, newState);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-gray-100 animate-pulse rounded-lg overflow-hidden h-64"
          >
            <div className="w-full h-36 bg-gray-200"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <h3 className="text-lg font-medium text-gray-900">Aucune vidéo trouvée</h3>
        <p className="text-sm text-gray-500 mt-1">
          Aucune vidéo ne correspond à ces critères pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onStateChange={handleStateChange}
        />
      ))}
    </div>
  );
} 