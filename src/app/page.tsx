import ErrorBoundary from "@/components/ErrorBoundary";
import VideoError from "@/components/VideoError";
import Veille from "@/libs/Veille/VeilleScreen";
import { PrismaClient, VideoState } from "@prisma/client";
import { Suspense } from "react";

// Types for our enhanced YouTube videos with state information
type YoutubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  videoUrl: string;
  duration: string;
  durationSeconds: number;
  theme?: string;
  state?: string;
};

type EnhancedYoutubeVideo = YoutubeVideo & {
  state: string;
  duration: string;
  durationSeconds: number | null;
};

// Data fetching function to keep separation of concerns
async function fetchVideosWithState(): Promise<EnhancedYoutubeVideo[]> {
  // Create a new PrismaClient instance with the correct connection string
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  });

  try {
    // Fetch YouTube videos from our App Router API
    const apiUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    console.log("Connecting to API at:", apiUrl);

    const response = await fetch(`${apiUrl}/api/youtube`, {
      next: { revalidate: 3600 } // Revalidate cache every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }

    const youtubeVideos: YoutubeVideo[] = await response.json();
    console.log(`Fetched ${youtubeVideos.length} videos from YouTube API`);

    // Fetch video states from database
    console.log("Fetching video states from database...");
    const videoStates = await prisma.videoState.findMany({
      select: {
        videoId: true,
        state: true,
        duration: true,
        durationSeconds: true
      }
    });
    console.log(`Found ${videoStates.length} video states in database`);

    // Create a map for quick lookup of video states by ID
    const videoStateMap = new Map<string, VideoState>(
      videoStates.map(state => [state.videoId, state as VideoState])
    );

    // Enhance videos with state information
    return youtubeVideos.map(video => {
      const stateData = videoStateMap.get(video.id);
      return {
        ...video,
        state: stateData?.state || video.state || "A voir !",
        duration: stateData?.duration || video.duration,
        durationSeconds: stateData?.durationSeconds || video.durationSeconds,
      };
    });
  } catch (error) {
    console.error("Error fetching videos and states:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Loading component for Suspense fallback
function LoadingVideos() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-xl text-gray-300">Chargement des vidéos...</div>
    </div>
  );
}

// ContentSection component renders the actual content
async function ContentSection() {
  const videosWithState = await fetchVideosWithState();

  return <Veille youtubeVideos={videosWithState} />;
}

// Main page component
export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative z-10 p-6">
        <header className="py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Keep Watch
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bienvenue sur Keep Watch, ma plateforme personnelle de veille technologique et de productivité.
          </p>
        </header>

        <ErrorBoundary fallback={VideoError}>
          <Suspense fallback={<LoadingVideos />}>
            <ContentSection />
          </Suspense>
        </ErrorBoundary>

        <footer className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>Développé avec Next.js, Tailwind CSS et l&apos;API YouTube</p>
        </footer>
      </div>
    </main>
  );
}
