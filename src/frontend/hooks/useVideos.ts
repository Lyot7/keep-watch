import { YoutubeVideoCache } from "@/shared/types/YoutubeVideoCache";
import { useCallback, useEffect, useState } from "react";

type ErrorType = string | null;

interface VideoResponse {
  videos: YoutubeVideoCache[];
  loading: boolean;
  error: ErrorType;
  selectedState: string;
  setSelectedState: (state: string) => void;
  updateVideoState: (videoId: string, newState: string) => Promise<boolean>;
  fetchVideos: (state: string) => Promise<void>;
}

export function useVideos(initialState = "A voir !"): VideoResponse {
  const [videos, setVideos] = useState<YoutubeVideoCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType>(null);
  const [selectedState, setSelectedState] = useState<string>(initialState);

  const fetchVideos = useCallback(async (state: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/videos?state=${state}`);

      if (!response.ok) {
        throw new Error(`Error fetching videos: ${response.statusText}`);
      }

      const data = await response.json();
      setVideos(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVideoState = useCallback(
    async (videoId: string, newState: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/videos/${videoId}/state`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: newState }),
        });

        if (!response.ok) {
          throw new Error(`Error updating video state: ${response.statusText}`);
        }

        // Update the local state
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.videoId === videoId ? { ...video, state: newState } : video
          )
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error updating video state:", err);
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  // Load videos when the selected state changes
  useEffect(() => {
    fetchVideos(selectedState);
  }, [selectedState, fetchVideos]);

  return {
    videos,
    loading,
    error,
    selectedState,
    setSelectedState,
    updateVideoState,
    fetchVideos,
  };
}
