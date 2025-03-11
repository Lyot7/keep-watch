"use client";

import { VideoState } from "@/types/videoState";
import { useState } from "react";

interface VideoCardProps {
  video: VideoState;
}

export function VideoCard({ video }: VideoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentState, setCurrentState] = useState(video.state);

  const states = ["À voir", "Impressionnant", "Recommander"];

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

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="aspect-video relative mb-2">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-400">{video.channelTitle}</p>
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