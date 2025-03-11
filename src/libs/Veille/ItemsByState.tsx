"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { decodeHtml } from "@/utils/decodeHtml";
import Image from "next/image";
import { useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";

interface ItemsByStateProps {
  youtubeVideos: YoutubeVideo[];
  state: string;
}

const ItemsByState: React.FC<ItemsByStateProps> = ({ youtubeVideos, state }) => {
  const [updatingState, setUpdatingState] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLLIElement>(null);

  // Fonction pour convertir une date formatée (ex: "15 Janvier 2025") en objet Date
  const parseFormattedDate = (dateString: string): Date => {
    const monthsMapping: { [key: string]: number } = {
      "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5,
      "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
    };

    try {
      const parts = dateString.split(' ');
      if (parts.length !== 3) return new Date(); // Date invalide

      const day = parseInt(parts[0], 10);
      const month = monthsMapping[parts[1]];
      const year = parseInt(parts[2], 10);

      return new Date(year, month, day);
    } catch (error) {
      console.error('Erreur lors du parsing de la date:', dateString, error);
      return new Date(); // Retourner la date actuelle en cas d'erreur
    }
  };

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
  const openModal = (e: React.MouseEvent, videoId: string, cardElement: HTMLElement) => {
    e.stopPropagation();
    setModalVisible(videoId);
    // Get the width and height of the card and set it for the modal
    if (cardElement) {
      setCardWidth(cardElement.offsetWidth);
      setCardHeight(cardElement.offsetHeight);
    }
  };

  // Fonction pour fermer la modale
  const closeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalVisible(null);
  };

  // Filtrer les vidéos par état puis trier par date de publication (du plus récent au plus ancien)
  const filteredVideos = youtubeVideos
    .filter(video => video.state === state)
    .sort((a, b) => {
      const dateA = parseFormattedDate(a.publishedAt);
      const dateB = parseFormattedDate(b.publishedAt);
      return dateB.getTime() - dateA.getTime(); // Tri décroissant (plus récent d'abord)
    });

  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <li
              key={video.id}
              className="my-4 bg-gray-800 rounded-xl overflow-hidden w-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
              onClick={() => window.open(video.videoUrl, '_blank', 'noopener,noreferrer')}
              ref={modalVisible === video.id ? cardRef : null}
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
                <h2 className="text-xl font-semibold line-clamp-2 mb-2">{decodeHtml(video.title)}</h2>
                <p className="text-gray-300 mb-2">{decodeHtml(video.channelTitle)}</p>

                <div className="flex justify-between items-center mt-1 mb-2">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-700 rounded-md px-2 py-1 text-sm">{video.theme}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{video.publishedAt}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass the parent li element to get its size
                      openModal(e, video.id, e.currentTarget.closest('li') as HTMLElement);
                    }}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-white self-end"
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
                    className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeModal}
                  ></div>
                  <div
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col justify-center"
                    style={{
                      width: `${cardWidth}px`,
                      height: `${cardHeight}px`,
                      maxWidth: '90vw',
                      maxHeight: '90vh'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 flex flex-col justify-center items-center h-full">
                      <h3 className="text-lg font-medium text-white mb-4">Sélectionnez le nouvel état</h3>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        <button
                          onClick={() => handleUpdateState(video.id, "Impressionnant", video.duration, video.durationSeconds)}
                          disabled={updatingState === video.id}
                          className={`p-3 rounded-md flex flex-col items-center justify-center transition-all ${video.state === "Impressionnant"
                            ? 'bg-purple-600'
                            : 'bg-gray-800 border border-purple-400/50 hover:bg-purple-600/30 hover:border-purple-400'
                            }`}
                        >
                          <span className="text-xl mb-1 text-purple-400">⭐</span>
                          <span className="font-medium">Impressionnant</span>
                        </button>

                        <button
                          onClick={() => handleUpdateState(video.id, "Recommander", video.duration, video.durationSeconds)}
                          disabled={updatingState === video.id}
                          className={`p-3 rounded-md flex flex-col items-center justify-center transition-all ${video.state === "Recommander"
                            ? 'bg-green-600'
                            : 'bg-gray-800 border border-green-400/50 hover:bg-green-600/30 hover:border-green-400'
                            }`}
                        >
                          <span className="text-xl mb-1 text-green-400">👍</span>
                          <span className="font-medium">Recommander</span>
                        </button>

                        <button
                          onClick={() => handleUpdateState(video.id, "A voir !", video.duration, video.durationSeconds)}
                          disabled={updatingState === video.id}
                          className={`p-3 rounded-md flex flex-col items-center justify-center transition-all ${video.state === "A voir !"
                            ? 'bg-blue-600'
                            : 'bg-gray-800 border border-blue-400/50 hover:bg-blue-600/30 hover:border-blue-400'
                            }`}
                        >
                          <span className="text-xl mb-1 text-blue-400">👁️</span>
                          <span className="font-medium">À voir</span>
                        </button>

                        <button
                          onClick={() => handleUpdateState(video.id, "Ne pas recommander", video.duration, video.durationSeconds)}
                          disabled={updatingState === video.id}
                          className={`p-3 rounded-md flex flex-col items-center justify-center transition-all ${video.state === "Ne pas recommander"
                            ? 'bg-red-600'
                            : 'bg-gray-800 border border-red-400/50 hover:bg-red-600/30 hover:border-red-400'
                            }`}
                        >
                          <span className="text-xl mb-1 text-red-400">👎</span>
                          <span className="font-medium">Ne pas recommander</span>
                        </button>
                      </div>

                      {/* Loader */}
                      {updatingState === video.id && (
                        <div className="flex justify-center my-2">
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          <span className="ml-2 text-sm text-gray-300">Mise à jour...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))
        ) : (
          <p>Aucune vidéo trouvée dans cette catégorie</p>
        )}
      </ul>
    </div>
  );
};

export default ItemsByState;