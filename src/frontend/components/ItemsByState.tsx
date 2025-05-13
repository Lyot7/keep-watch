import { VideoCard } from "@/frontend/components/VideoCard";
import { VideoState } from "@/types/videoState";
import { useState, useEffect } from "react";

interface ItemsByStateProps {
  videoStates: VideoState[];
}

// Helper function to map UI display states to actual data states
function mapStateToDataState(uiState: string): string {
  switch(uiState) {
    case "À voir":
      return "A voir !";
    case "Impressionnant":
      return "Impressionnant";
    case "Recommander":
      return "Recommander";
    default:
      return uiState;
  }
}

export function ItemsByState({ videoStates }: ItemsByStateProps) {
  const uiStates = ["À voir", "Impressionnant", "Recommander"];
  const [sortedVideos, setSortedVideos] = useState<Record<string, VideoState[]>>({});

  useEffect(() => {
    // Process and organize videos by state
    const videosByState: Record<string, VideoState[]> = {};
    
    // Initialize states
    uiStates.forEach(state => {
      videosByState[state] = [];
    });

    // Distribute videos to states
    videoStates.forEach(video => {
      // Find matching UI state
      const matchingUiState = uiStates.find(
        uiState => mapStateToDataState(uiState) === video.state
      );
      
      if (matchingUiState) {
        videosByState[matchingUiState].push(video);
      }
    });

    setSortedVideos(videosByState);
  }, [videoStates]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {uiStates.map((state) => (
        <div key={state} className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">{state}</h2>
          <div className="space-y-4">
            {sortedVideos[state]?.map((video) => (
              <VideoCard key={video.videoId} video={video} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 