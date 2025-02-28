'use client';

import { VideoStateEnum, YoutubeVideo } from '@/types/youtube';
import Image from 'next/image';
import { useState } from 'react';

interface VideoCardProps {
  video: YoutubeVideo;
  onStateChange?: (videoId: string, newState: VideoStateEnum) => Promise<void>;
}

export function VideoCard({ video, onStateChange }: VideoCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Format duration (PT1H2M3S -> 1:02:03)
  const formatDuration = (durationSeconds: number) => {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = Math.floor(durationSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format date (ISO -> DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle state change
  const handleStateChange = async (newState: VideoStateEnum) => {
    if (!onStateChange) return;

    setIsUpdating(true);
    try {
      await onStateChange(video.id, newState);
    } catch (error) {
      console.error('Failed to update video state:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get badge color based on state
  const getStateBadgeColor = (state: string): string => {
    switch (state) {
      case VideoStateEnum.ToWatch:
        return 'bg-blue-500';
      case VideoStateEnum.Impressive:
        return 'bg-yellow-500';
      case VideoStateEnum.Recommend:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow rounded-md border border-gray-200">
      <div className="relative aspect-video">
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-1 py-0.5 text-xs rounded">
            {formatDuration(video.durationSeconds)}
          </div>
        </a>
      </div>

      <div className="flex-grow p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>

          <div className="relative">
            <button
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              onClick={() => {/* Toggle dropdown menu */ }}
            >
              <span className="sr-only">Open menu</span>
              ⋮
            </button>
            {/* Dropdown menu would go here */}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500">{video.channelTitle}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(video.publishedAt)}
          </p>
        </div>
      </div>

      <div className="pt-0 pb-3 px-4 flex items-center justify-between">
        <span
          className={`text-white text-xs px-2 py-1 rounded-full ${getStateBadgeColor(video.state || '')}`}
        >
          {video.state}
        </span>

        <div className="flex gap-3 text-gray-500">
          <span className="flex items-center text-xs">
            {/* Clock icon */}
            <span className="mr-1">⏱️</span>
            {formatDuration(video.durationSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
} 