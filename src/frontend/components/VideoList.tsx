import { YoutubeVideoCache } from '@/shared/types/YoutubeVideoCache';
import Image from 'next/image';
import React from 'react';

interface VideoListProps {
  videos: YoutubeVideoCache[];
  onVideoSelect?: (video: YoutubeVideoCache) => void;
  onStateChange?: (videoId: string, newState: string) => void;
}

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  onVideoSelect,
  onStateChange
}) => {
  if (!videos || videos.length === 0) {
    return <div className="p-4 text-center">No videos found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          onClick={() => onVideoSelect && onVideoSelect(video)}
        >
          <div className="relative pb-[56.25%]">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              {formatDuration(video.duration)}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{video.channelTitle}</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatViews(video.viewCount)}</span>
              </div>
              <select
                value={video.state}
                onChange={(e) => onStateChange && onStateChange(video.videoId, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="A voir !">A voir !</option>
                <option value="Vu">Vu</option>
                <option value="Pas intéressé">Pas intéressé</option>
                <option value="A revoir">A revoir</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions
const formatDuration = (duration: string): string => {
  // Simple formatting for PT1H30M15S format
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!matches) return '0:00';

  const hours = matches[1] ? parseInt(matches[1]) : 0;
  const minutes = matches[2] ? parseInt(matches[2]) : 0;
  const seconds = matches[3] ? parseInt(matches[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatViews = (views: number | null): string => {
  if (!views) return '0 views';

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }

  return `${views} views`;
}; 