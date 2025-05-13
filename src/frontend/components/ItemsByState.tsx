import { VideoCard } from "@/frontend/components/VideoCard";
import { VideoState } from "@/types/videoState";

interface ItemsByStateProps {
  videoStates: VideoState[];
}

export function ItemsByState({ videoStates }: ItemsByStateProps) {
  const states = ["À voir", "Impressionnant", "Recommander"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {states.map((state) => (
        <div key={state} className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">{state}</h2>
          <div className="space-y-4">
            {videoStates
              .filter((video) => video.state === state)
              .map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
} 