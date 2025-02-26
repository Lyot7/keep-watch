"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import Image from "next/image";
import { useState } from "react";
import { FiClock } from "react-icons/fi";

interface ItemsByStateProps {
  youtubeVideos: YoutubeVideo[];
  state: string;
}

const ItemsByState: React.FC<ItemsByStateProps> = ({ youtubeVideos, state }) => {
  const [updatingState, setUpdatingState] = useState<string | null>(null);

  const handleUpdateState = async (videoId: string, newState: string, duration?: string, durationSeconds?: number) => {
    try {
      setUpdatingState(videoId);
      const response = await fetch('/api/videos/updateVideoState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, state: newState, duration, durationSeconds }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video state');
      }

      // Reload the page to get the updated data
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error updating video state:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setUpdatingState(null);
    }
  };

  return (
    <ul className="w-full flex flex-wrap gap-4 justify-center">
      {youtubeVideos.filter(video => video.state === state).length > 0 ? (
        youtubeVideos.filter(video => video.state === state).map((video) => (
          <li key={video.id} className="my-4 bg-gray-800 rounded-xl overflow-hidden min-w-[300px] max-w-[350px] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-full relative aspect-video">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold line-clamp-2 mb-2">{video.title}</h2>
              <p className="text-gray-300 mb-2">{video.channelTitle}</p>

              <div className="flex flex-wrap gap-2 mt-1 mb-2">
                <span className="bg-gray-700 rounded-md px-2 py-1 text-sm">{video.theme}</span>
                <span className="bg-blue-700 rounded-md px-2 py-1 text-sm flex items-center">
                  <FiClock className="mr-1" /> {video.duration}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-3">{video.publishedAt}</p>

              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline block mb-4"
              >
                Voir sur YouTube
              </a>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleUpdateState(video.id, "A voir !", video.duration, video.durationSeconds)}
                  disabled={updatingState === video.id || video.state === "A voir !"}
                  className={`px-2 py-1 rounded ${video.state === "A voir !" ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} transition`}
                >
                  À voir
                </button>
                <button
                  onClick={() => handleUpdateState(video.id, "Vu", video.duration, video.durationSeconds)}
                  disabled={updatingState === video.id || video.state === "Vu"}
                  className={`px-2 py-1 rounded ${video.state === "Vu" ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} transition`}
                >
                  Vu
                </button>
                <button
                  onClick={() => handleUpdateState(video.id, "🤯", video.duration, video.durationSeconds)}
                  disabled={updatingState === video.id || video.state === "🤯"}
                  className={`px-2 py-1 rounded ${video.state === "🤯" ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'} transition`}
                >
                  🤯
                </button>
              </div>
            </div>
          </li>
        ))
      ) : (
        <p>Aucune vidéo trouvée dans cette catégorie</p>
      )}
    </ul>
  );
};

export default ItemsByState;