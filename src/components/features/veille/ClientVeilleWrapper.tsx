"use client";

import Veille from "@/components/features/veille/VeilleScreen";
import { YoutubeVideo } from "@/lib/api/youtube/getYoutubeVideos";
import { useEffect, useState } from "react";

interface ClientVeilleWrapperProps {
  initialVideos: YoutubeVideo[];
}

// This component acts as a client-side wrapper for the Veille component
// to prevent hydration mismatches
export default function ClientVeilleWrapper({ initialVideos }: ClientVeilleWrapperProps) {
  // Use state to ensure consistent rendering between server and client
  const [mounted, setMounted] = useState(false);
  
  // Convert any date objects or complex data in videos to consistent format
  // This helps prevent hydration mismatches
  const safeVideos = initialVideos.map((video: YoutubeVideo) => ({
    ...video,
    // Ensure all fields have consistent types
    id: video.id || "",
    title: video.title || "",
    description: video.description || "",
    thumbnailUrl: video.thumbnailUrl || "",
    channelTitle: video.channelTitle || "",
    publishedAt: video.publishedAt || "",
    videoUrl: video.videoUrl || "",
    duration: video.duration || "",
    durationSeconds: video.durationSeconds || 0,
    theme: video.theme || "",
    state: video.state || "A voir !",
  }));
  
  // Set mounted state after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before hydration, render a simpler version
  if (!mounted) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement de l&apos;interface...</p>
        </div>
      </div>
    );
  }

  // After hydration, render the full component
  return <Veille youtubeVideos={safeVideos} />;
} 