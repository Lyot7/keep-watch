'use client';

import { VideoGrid } from '@/features/youtube/components/VideoGrid';
import { useYoutube } from '@/hooks/useYoutube';
import { VideoStateEnum } from '@/types/youtube';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VideosByStatePage() {
  const params = useParams();
  const stateParam = params?.state as string || 'a-voir';
  const { videos, loading, error, fetchVideosByState } = useYoutube();
  const [pageTitle, setPageTitle] = useState('Vidéos YouTube');

  useEffect(() => {
    // Map URL parameter to VideoStateEnum
    let videoState: VideoStateEnum;
    let title = 'Vidéos YouTube';

    switch (stateParam) {
      case 'a-voir':
        videoState = VideoStateEnum.ToWatch;
        title = 'Vidéos à voir';
        break;
      case 'impressionnant':
        videoState = VideoStateEnum.Impressive;
        title = 'Vidéos impressionnantes';
        break;
      case 'recommander':
        videoState = VideoStateEnum.Recommend;
        title = 'Vidéos recommandées';
        break;
      default:
        videoState = VideoStateEnum.ToWatch;
        title = 'Vidéos à voir';
    }

    setPageTitle(title);
    fetchVideosByState(videoState);
  }, [stateParam, fetchVideosByState]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Une erreur est survenue lors du chargement des vidéos. Veuillez réessayer.
        </div>
      )}

      <VideoGrid videos={videos} isLoading={loading} />
    </div>
  );
} 