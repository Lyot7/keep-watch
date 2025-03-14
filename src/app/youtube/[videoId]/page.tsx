"use client";

import { VideoState } from '@/types/videoState';
import { decodeHtml } from '@/utils/decodeHtml';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Define the same states used in the main application
const STATES = ["A voir !", "Impressionnant", "Recommander", "Ne pas recommander"];

// Color schemes by state - same as in ItemsByState.tsx
const getStateStyles = (state: string) => {
  switch (state) {
    case "Impressionnant":
      return {
        bg: "bg-purple-900/30",
        border: "border-purple-400/50",
        hoverBorder: "hover:border-purple-400",
        text: "text-purple-400",
        icon: "⭐"
      };
    case "Recommander":
      return {
        bg: "bg-green-900/30",
        border: "border-green-400/50",
        hoverBorder: "hover:border-green-400",
        text: "text-green-400",
        icon: "👍"
      };
    case "A voir !":
      return {
        bg: "bg-blue-900/30",
        border: "border-blue-400/50",
        hoverBorder: "hover:border-blue-400",
        text: "text-blue-400",
        icon: "👁️"
      };
    case "Ne pas recommander":
      return {
        bg: "bg-red-900/30",
        border: "border-red-400/50",
        hoverBorder: "hover:border-red-400",
        text: "text-red-400",
        icon: "👎"
      };
    default:
      return {
        bg: "bg-gray-800",
        border: "border-gray-700",
        hoverBorder: "hover:border-gray-600",
        text: "text-gray-400",
        icon: "📹"
      };
  }
};

// At the top of the file, add this type
interface ExtendedVideoState extends VideoState {
  id?: string;
}

export default function VideoDetailPage() {
  const params = useParams<{ videoId: string }>();
  const router = useRouter();
  const videoId = params?.videoId;

  const [video, setVideo] = useState<VideoState | null>(null);
  const [recommendations, setRecommendations] = useState<ExtendedVideoState[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        // Fetch the video details
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        const videoData = await response.json();
        setVideo(videoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        // First try to get videos with "A voir !" state
        let recsResponse = await fetch('/api/videos?state=A%20voir%20!&limit=8');
        let recsData = await recsResponse.json();
        console.log('Recommendations with "A voir !" state:', recsData);

        // Check if the response has the expected structure
        let recommendationVideos = Array.isArray(recsData) ? recsData :
          recsData.videos ? recsData.videos : [];

        // If no videos with "A voir !" state were found, fetch random videos
        if (recommendationVideos.length === 0) {
          console.log('No videos with "A voir !" state found, fetching random videos');
          recsResponse = await fetch('/api/videos?limit=8&random=true');
          recsData = await recsResponse.json();
          console.log('Random recommendations:', recsData);

          recommendationVideos = Array.isArray(recsData) ? recsData :
            recsData.videos ? recsData.videos : [];
        }

        console.log('Final recommendation videos:', recommendationVideos);

        // Filter out the current video if it's in the recommendations
        setRecommendations(recommendationVideos.filter((v: ExtendedVideoState) => {
          // If either ID matches the current video ID, filter it out
          if (v.videoId === videoId || v.id === videoId) {
            return false;
          }
          return true;
        }));
      } catch (recErr) {
        console.error('Error fetching recommendations:', recErr);
        // Don't set error state here to allow the main video to still display
      }
    };

    if (videoId) {
      fetchVideoDetails();
      fetchRecommendations();
    }
  }, [videoId]);

  const handleStateChange = async (newState: string) => {
    if (!video) return;

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

      await response.json();
      setVideo({ ...video, state: newState });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating video state:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-300 mb-6">{error || 'Video not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const videoStyles = getStateStyles(video.state || "");

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content - Video and details */}
          <div className="lg:w-2/3">
            {/* Video player */}
            <div className="aspect-video bg-black relative rounded-lg overflow-hidden mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                title={video.title ? decodeHtml(video.title) : "YouTube video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>

            {/* Video details */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                {video.title ? decodeHtml(video.title) : 'Untitled Video'}
              </h1>

              <div className="flex flex-wrap justify-between items-center mb-4">
                <p className="text-gray-400">
                  {video.channelTitle ? decodeHtml(video.channelTitle) : 'Unknown Channel'}
                </p>

                {/* Status dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 ${videoStyles.bg} ${videoStyles.border} ${videoStyles.hoverBorder} rounded-md text-sm flex items-center gap-2`}
                  >
                    <span className={videoStyles.text}>
                      {videoStyles.icon} {video.state || 'Set Status'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isEditing && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                      {STATES.map((state) => {
                        const stateStyle = getStateStyles(state);
                        return (
                          <button
                            key={state}
                            onClick={() => handleStateChange(state)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${state === video.state
                              ? stateStyle.bg
                              : 'hover:bg-gray-700'
                              }`}
                          >
                            <span className={stateStyle.text}>{stateStyle.icon}</span> {state}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Video description */}
              {video.description && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {decodeHtml(video.description)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="lg:w-1/3">
            <h2 className="text-lg font-semibold mb-3">
              {recommendations.some(rec => rec.state === "A voir !")
                ? "Vidéos à voir"
                : "Vidéos recommandées"}
            </h2>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const recStyles = getStateStyles(rec.state || "");
                  console.log('Rendering recommendation:', rec);
                  return (
                    <div
                      key={rec.videoId || rec.id}
                      className={`flex gap-3 ${recStyles.bg} rounded-lg p-2 cursor-pointer border ${recStyles.border} ${recStyles.hoverBorder}`}
                      onClick={() => router.push(`/youtube/${rec.videoId || rec.id}`)}
                    >
                      <div className="w-40 min-w-[100px] aspect-video relative">
                        {rec.thumbnailUrl ? (
                          <Image
                            src={rec.thumbnailUrl}
                            alt={rec.title || 'Video thumbnail'}
                            fill
                            sizes="(max-width: 768px) 100px, 150px"
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No thumbnail</span>
                          </div>
                        )}
                        {rec.duration && (
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white px-1 py-0.5 text-xs rounded">
                            {rec.duration}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {rec.title ? decodeHtml(rec.title) : `Video ${rec.id || rec.videoId || 'Unknown'}`}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">
                          {rec.channelTitle ? decodeHtml(rec.channelTitle) : 'Unknown Channel'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          ID: {rec.videoId || rec.id || 'Missing'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No recommendations available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}