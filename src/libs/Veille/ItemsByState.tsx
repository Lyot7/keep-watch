"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import Image from "next/image";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";

interface ItemsByStateProps {
  youtubeVideos: YoutubeVideo[];
  state: string;
}

const ItemsByState: React.FC<ItemsByStateProps> = ({ youtubeVideos, state }) => {
  const [updatingState, setUpdatingState] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<string | null>(null);

  const handleUpdateState = async (
    videoId: string,
    newState: string,
    duration?: string,
    durationSeconds?: number
  ) => {
    try {
      setUpdatingState(videoId);
      const response = await fetch('/api/videos/updateVideoState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId, state: newState, duration, durationSeconds }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video state');
      }

      // Fermer la modale et recharger la page
      setModalVisible(null);
      window.location.reload();
    } catch (error: unknown) {
      console.error('Error updating video state:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setUpdatingState(null);
    }
  };

  // Fonction pour ouvrir la modale
  const openModal = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    setModalVisible(videoId);
  };

  // Fonction pour fermer la modale
  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalVisible(null);
  };

  // Filtrer les vidéos par état
  const filteredVideos = youtubeVideos.filter(video => video.state === state);

  return (
    <ul className="w-full flex flex-wrap gap-4 justify-center">
      {filteredVideos.length > 0 ? (
        filteredVideos.map((video) => (
          <li
            key={video.id}
            className="my-4 bg-gray-800 rounded-xl overflow-hidden min-w-[300px] max-w-[350px] shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
            onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
          >
            <div className="w-full relative aspect-video">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold line-clamp-2 mb-2">{video.title}</h2>
              <p className="text-gray-300 mb-2">{video.channelTitle}</p>

              <div className="flex flex-wrap gap-2 mt-1 mb-2">
                <span className="bg-gray-700 rounded-md px-2 py-1 text-sm">{video.theme}</span>
              </div>

              <p className="text-gray-400 text-sm mb-3">{video.publishedAt}</p>

              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => openModal(e, video.id)}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white"
                  aria-label="Modifier l'état"
                >
                  <FiEdit size={18} />
                </button>
              </div>
            </div>

            {/* Modal pour modifier l'état de la vidéo */}
            {modalVisible === video.id && (
              <>
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={closeModal}
                ></div>
                <div
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-lg shadow-xl z-50 w-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-semibold mb-4">Modifier l&apos;état</h3>
                  <p className="text-gray-300 mb-4 line-clamp-1">{video.title}</p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleUpdateState(video.id, "A voir !", video.duration, video.durationSeconds)}
                      disabled={updatingState === video.id}
                      className={`p-2 rounded ${video.state === "A voir !" ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} transition`}
                    >
                      À voir
                    </button>
                    <button
                      onClick={() => handleUpdateState(video.id, "Recommander", video.duration, video.durationSeconds)}
                      disabled={updatingState === video.id}
                      className={`p-2 rounded ${video.state === "Recommander" ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} transition`}
                    >
                      Recommander
                    </button>
                    <button
                      onClick={() => handleUpdateState(video.id, "Impressionnant", video.duration, video.durationSeconds)}
                      disabled={updatingState === video.id}
                      className={`p-2 rounded ${video.state === "Impressionnant" ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'} transition`}
                    >
                      Impressionnant
                    </button>
                    <button
                      onClick={() => handleUpdateState(video.id, "Nul", video.duration, video.durationSeconds)}
                      disabled={updatingState === video.id}
                      className={`p-2 rounded ${video.state === "Nul" ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition`}
                    >
                      Nul
                    </button>
                  </div>

                  <button
                    onClick={closeModal}
                    className="mt-4 p-2 w-full rounded bg-gray-600 hover:bg-gray-700 transition"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </li>
        ))
      ) : (
        <p>Aucune vidéo trouvée dans cette catégorie</p>
      )}
    </ul>
  );
};

export default ItemsByState;