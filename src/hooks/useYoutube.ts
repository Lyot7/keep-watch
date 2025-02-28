import { VideoStateEnum, YoutubeVideo } from "@/types/youtube";
import { useState } from "react";

/**
 * Custom hook for working with YouTube data
 */
export function useYoutube() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);

  /**
   * Fetch videos by state
   */
  const fetchVideosByState = async (state: VideoStateEnum) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/youtube/videos?state=${encodeURIComponent(state)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update video state
   */
  const updateVideoState = async (videoId: string, state: VideoStateEnum) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/youtube/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, state }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update video in local state
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId ? { ...video, state } : video
        )
      );

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Error updating video state:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch latest videos from a channel
   */
  const fetchLatestVideos = async (channelId: string, maxResults = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/youtube/channel/${encodeURIComponent(
          channelId
        )}/videos?maxResults=${maxResults}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Error fetching latest videos:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    fetchVideosByState,
    updateVideoState,
    fetchLatestVideos,
  };
}
