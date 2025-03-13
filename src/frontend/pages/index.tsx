import { VideoList } from '@/frontend/components/VideoList';
import { useVideos } from '@/frontend/hooks/useVideos';
import { MainLayout } from '@/frontend/layouts/MainLayout';
import React from 'react';

interface StateButtonProps {
  state: string;
  selected: boolean;
  onClick: () => void;
}

const StateButton: React.FC<StateButtonProps> = ({
  state,
  selected,
  onClick
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-full ${selected
        ? 'bg-blue-500 text-white'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      onClick={onClick}
      type="button"
      aria-pressed={selected}
    >
      {state}
    </button>
  );
};

export default function HomePage() {
  const {
    videos,
    loading,
    error,
    selectedState,
    setSelectedState,
    updateVideoState
  } = useVideos();

  const handleStateChange = React.useCallback((state: string) => {
    setSelectedState(state);
  }, [setSelectedState]);

  return (
    <MainLayout title="Keep Watch - Home">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Keep Watch</h1>

        <div className="mb-6">
          <div className="flex justify-center space-x-4">
            <StateButton
              state="A voir !"
              selected={selectedState === 'A voir !'}
              onClick={() => handleStateChange('A voir !')}
            />
            <StateButton
              state="Vu"
              selected={selectedState === 'Vu'}
              onClick={() => handleStateChange('Vu')}
            />
            <StateButton
              state="A revoir"
              selected={selectedState === 'A revoir'}
              onClick={() => handleStateChange('A revoir')}
            />
            <StateButton
              state="Pas intéressé"
              selected={selectedState === 'Pas intéressé'}
              onClick={() => handleStateChange('Pas intéressé')}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <VideoList
            videos={videos}
            onStateChange={updateVideoState}
          />
        )}
      </div>
    </MainLayout>
  );
}
