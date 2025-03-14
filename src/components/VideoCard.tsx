"use client";

import { VideoState } from "@/types/videoState";
import { decodeHtml } from "@/utils/decodeHtml";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VideoCardProps {
  video: VideoState;
}

export function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentState, setCurrentState] = useState(video.state);

  const states = ["A voir !", "Impressionnant", "Recommander", "Ne pas recommander"];

  const handleStateChange = async (newState: string) => {
    try {
      const response = await fetch('/api/videos/updateVideoState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.videoId,
          state: newState,
          duration: video.duration,
          durationSeconds: video.durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video state');
      }

      setCurrentState(newState);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating video state:', error);
    }
  };

  const handleCardClick = () => {
    router.push(`/youtube/${video.videoId}`);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 h-full">
      <div
        className="aspect-video relative mb-2 cursor-pointer"
        onClick={handleCardClick}
      >
        {video.thumbnailUrl ? (
          <>
            <Image
              src={video.thumbnailUrl}
              alt={video.title || "Video thumbnail"}
              fill
              className="object-cover rounded"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-red-600 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            )}
          </>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full rounded bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">No thumbnail</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3
          className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-blue-400"
          onClick={handleCardClick}
        >
          {video.title ? decodeHtml(video.title) : ''}
        </h3>
        <p className="text-sm text-gray-400">{video.channelTitle ? decodeHtml(video.channelTitle) : ''}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">
            {video.duration || "Duration unknown"}
          </span>
          <div className="relative">
            {isEditing ? (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                {states.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleStateChange(state)}
                    className={`w-full text-left px-4 py-2 text-sm ${state === currentState
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-400 hover:text-blue-300"
              >
                {currentState}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 