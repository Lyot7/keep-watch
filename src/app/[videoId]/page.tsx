"use client";

import { VideoState } from '@/types/videoState';
import { decodeHtml } from '@/lib/utils/decodeHtml';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// DateDisplay component to handle async date formatting
const DateDisplay = ({ video }: { video: ExtendedVideoState }) => {
  const [formattedDate, setFormattedDate] = useState<string>('Chargement...');

  useEffect(() => {
    const getDate = async () => {
      const date = await formatDate(video);
      setFormattedDate(date);
    };

    getDate();
  }, [video]);

  return (
    <p className="text-gray-500 text-xs mt-1">
      {formattedDate}
    </p>
  );
};

// Define the same states used in the main application
const STATES = ["A voir !", "Impressionnant", "Recommander", "Ne pas recommander"];

// Pour les vidéos sans date, on peut tenter de les récupérer directement depuis l'API YouTube
const fetchYouTubePublishedDate = async (videoId: string): Promise<string | null> => {
  try {
    // Utiliser l'API publique YouTube Data API v3 (nécessite une clé API Google)
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('YouTube API key is missing');
      return null;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video data from YouTube API');
    }
    
    const data = await response.json();
    if (data.items && data.items.length > 0 && data.items[0].snippet && data.items[0].snippet.publishedAt) {
      return data.items[0].snippet.publishedAt;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return null;
  }
};

// Date formatter helper function with YouTube API fallback
const formatDate = async (video: ExtendedVideoState | null): Promise<string> => {
  if (!video) return 'Date inconnue';
  
  // Debug the video object to see all available properties
  console.log('Video object for date:', video);
  
  // First, check directly for publishedAt property - return it as is without reformatting
  if (video.publishedAt && typeof video.publishedAt === 'string') {
    return video.publishedAt;
  }
  
  // Try multiple possible locations for the date
  const possibleDates = [
    video.snippet?.publishedAt,
    video.videoState?.publishedAt,
    video.publishDate,
    video.publishTime,
    video.uploadDate,
    video.createdAt,
    // Try to extract from raw data if available
    typeof video.rawData === 'object' && video.rawData ? 
      (video.rawData as any).snippet?.publishedAt || (video.rawData as any).publishedAt : null
  ].filter(Boolean);
  
  let dateString: string | null = null;
  
  if (possibleDates.length > 0) {
    dateString = possibleDates[0] as string;
  } else if (video.videoId) {
    // If no date is found in the local object, try to fetch from YouTube API
    dateString = await fetchYouTubePublishedDate(video.videoId);
  }
  
  if (!dateString) {
    return 'Date inconnue';
  }
  
  try {
    // Use the date string we found
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected:', dateString);
      return 'Date inconnue';
    }
    
    // Format with full month name
    return formatDateToFrenchStyle(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Date inconnue';
  }
};

// Helper function to consistently format dates in French style with full month name
const formatDateToFrenchStyle = (date: Date): string => {
  // Format the date in a French locale with day, full month name, and year
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

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
  snippet?: {
    publishedAt?: string;
  };
  videoState?: {
    publishedAt?: string;
  };
  publishDate?: string;
  publishTime?: string;
  uploadDate?: string;
  createdAt?: string;
  rawData?: any;
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
  // Add mounted state to prevent hydration mismatch with router navigation
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted state after component mounts to safely use router
    setIsMounted(true);
  }, []);

  // Safe navigation function
  const navigateTo = (path: string) => {
    if (isMounted) {
      router.push(path);
    }
  };

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        // Fetch the video details
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }
        const videoData = await response.json();
        console.log('Fetched video data:', videoData);
        console.log('Incoming video state:', videoData.state);

        // Enhanced state extraction logic - prioritize videoState.state
        let actualState: string | null = null;

        // Try all possible locations where state might be stored in proper priority order
        if (videoData.videoState && typeof videoData.videoState.state === 'string' && videoData.videoState.state.trim() !== '') {
          // State in videoState object (highest priority)
          actualState = videoData.videoState.state;
          console.log('Using state from videoState object (highest priority):', actualState);
        } else if (typeof videoData.state === 'string' && videoData.state.trim() !== '') {
          // Direct state property (secondary priority)
          actualState = videoData.state;
          console.log('Using direct state property:', actualState);
        } else {
          // Default state (fallback)
          actualState = "A voir !";
          console.log('No valid state found, defaulting to:', actualState);
        }

        // Set the state on the video object
        videoData.state = actualState;
        console.log('Final video state set to:', videoData.state);

        setVideo(videoData);
        console.log('Set video with state:', videoData.state);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        // Get videos with "A voir !" state and randomize them
        let recsResponse = await fetch('/api/videos?state=A%20voir%20!&limit=8&random=true');
        let recsData = await recsResponse.json();
        console.log('Recommendations with "A voir !" state (randomized):', recsData);

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

    // Reset state when video ID changes
    setLoading(true);
    setError(null);
    setVideo(null);

    if (videoId) {
      fetchVideoDetails();
      fetchRecommendations();
    }
  }, [videoId]);

  useEffect(() => {
    console.log("Component mounted or video state changed - current state:", video?.state);

    // Ensure dropdown shows the correct initial state in the dropdown list
    if (video) {
      const dropdown = document.querySelector('.dropdown-menu');
      if (dropdown) {
        console.log("Dropdown found, ensuring correct state is highlighted");
      }
    }
  }, [video?.state, video]);

  const handleStateChange = async (newState: string) => {
    if (!video) return;

    console.log('Changing state from', video.state, 'to', newState);

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

      const updatedData = await response.json();
      console.log('Received updated data:', updatedData);

      // Make sure we're using the state from the response
      const updatedState = updatedData.state || newState;

      // Update the state in the UI
      setVideo(prevVideo => {
        if (!prevVideo) return null;
        const updatedVideo = { ...prevVideo, state: updatedState };
        console.log('Updated video object:', updatedVideo);
        return updatedVideo;
      });

      console.log('Updated video state to:', updatedState);

      // Close the dropdown
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
          onClick={() => navigateTo('/')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get the styled appearance for the video's state
  const videoState = video.state || "";
  const videoStyles = getStateStyles(videoState);

  // Log the current state for debugging
  console.log('Rendering with video state:', videoState);
  console.log('State styles applied:', videoStyles);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Grille en perspective en arrière-plan */}
      <div className="perspective-grid">
        <div className="grid-lines"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-4 md:p-6">
        <div className="mb-4">
          <button
            onClick={() => navigateTo('/')}
            className="px-5 py-2 bg-gray-800 bg-opacity-80 hover:bg-gray-700 text-white rounded-full transition-colors flex items-center gap-2 border border-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l&apos;accueil
          </button>
        </div>
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
                    className={`px-4 py-2 ${videoStyles.bg} ${videoStyles.border} ${videoStyles.hoverBorder} rounded-md text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-md`}
                    title="Click to change video state"
                  >
                    <span className={`${videoStyles.text} font-medium`}>
                      {videoStyles.icon} {video.state || 'Set Status'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isEditing && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg z-10 dropdown-menu">
                      {STATES.map((state) => {
                        const stateStyle = getStateStyles(state);
                        const isCurrentState = state === video.state;

                        return (
                          <button
                            key={state}
                            onClick={() => handleStateChange(state)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isCurrentState
                              ? `${stateStyle.bg} font-medium` // Highlight current state
                              : 'hover:bg-gray-700'
                              }`}
                          >
                            <span className={stateStyle.text}>{stateStyle.icon}</span>
                            {state}
                            {isCurrentState && (
                              <span className="ml-auto">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Video description */}
              {video.description && (
                <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {decodeHtml(video.description)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4">Vidéos recommandées</h2>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => {
                    console.log('Rendering recommendation:', rec);
                    return (
                      <div
                        key={rec.videoId || rec.id}
                        className="flex gap-3 p-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-80 transition-colors cursor-pointer bg-opacity-60"
                        onClick={() => {
                          navigateTo(`/${rec.videoId || rec.id}`);
                        }}
                      >
                        <div className="w-32 h-18 aspect-video relative flex-shrink-0 bg-gray-900">
                          {rec.thumbnailUrl ? (
                            <Image
                              src={rec.thumbnailUrl}
                              alt={rec.title || 'Video thumbnail'}
                              fill
                              sizes="128px"
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
                          <DateDisplay video={rec} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                  <p className="text-gray-400 text-sm">Aucune vidéo recommandée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}