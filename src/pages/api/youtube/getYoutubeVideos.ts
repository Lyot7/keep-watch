import dotenv from "dotenv";

dotenv.config();

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  videoUrl: string;
  duration: string; // Durée formatée de la vidéo (ex: "10:30")
  durationSeconds: number; // Durée en secondes pour le filtrage
  theme?: string; // Thème personnalisé qui sera ajouté manuellement
  state?: string; // État de visionnage (à voir, vu, etc.)
}

// Interface pour les éléments retournés par l'API YouTube
interface YouTubeApiItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

// Interface pour les détails de vidéo retournés par l'API YouTube
interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string; // Format ISO 8601 (ex: "PT10M30S")
  };
}

// Configuration des chaînes YouTube à suivre avec leurs thèmes associés
interface ChannelConfig {
  id: string;
  theme: string;
}

const YOUTUBE_CHANNELS: ChannelConfig[] = [
  { id: "UC5HDIVwuqoIuKKw-WbQ4CvA", theme: "Développement" }, // Exemple: Melvynx
  { id: "UCLKx4-_XO5sR0AO0j8ye7zQ", theme: "Automatisation & Productivité" }, // Exemple: Shubham Sharma
  // Ajoutez d'autres chaînes selon vos besoins
];

// Durée minimale des vidéos en secondes (3 minutes = 180 secondes)
const MIN_VIDEO_DURATION_SECONDS = 180;

// Fonction pour convertir la durée ISO 8601 en secondes
function parseDuration(duration: string): number {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// Fonction pour formater la durée en format lisible (ex: "10:30")
function formatDuration(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export async function getYoutubeVideos(): Promise<YoutubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YouTube API Key not found in environment variables");
  }

  const allVideos: YoutubeVideo[] = [];

  // Récupérer les vidéos de chaque chaîne
  for (const channel of YOUTUBE_CHANNELS) {
    try {
      // 1. Récupérer les IDs des vidéos via l'API Search
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channel.id}&part=snippet,id&order=date&maxResults=50&type=video`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extraire les IDs des vidéos pour la seconde requête
      const videoIds = data.items
        .map((item: YouTubeApiItem) => item.id.videoId)
        .join(",");

      // 2. Récupérer les détails des vidéos, y compris la durée
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=contentDetails,snippet`
      );

      if (!videoDetailsResponse.ok) {
        throw new Error(
          `YouTube API error: ${videoDetailsResponse.statusText}`
        );
      }

      const videoDetails = await videoDetailsResponse.json();

      // Créer un Map des détails par ID de vidéo
      const detailsMap = new Map<
        string,
        { formattedDuration: string; durationSeconds: number }
      >();

      videoDetails.items.forEach((item: YouTubeVideoDetails) => {
        const durationSeconds = parseDuration(item.contentDetails.duration);

        // Ne pas inclure les vidéos de moins de 3 minutes
        if (durationSeconds < MIN_VIDEO_DURATION_SECONDS) {
          return;
        }

        detailsMap.set(item.id, {
          durationSeconds: durationSeconds,
          formattedDuration: formatDuration(durationSeconds),
        });
      });

      // Mapper les résultats de l'API YouTube au format attendu par l'application
      // et filtrer pour ne garder que les vidéos de plus de 3 minutes
      const channelVideos = data.items
        .filter((item: YouTubeApiItem) => detailsMap.has(item.id.videoId))
        .map((item: YouTubeApiItem) => {
          const details = detailsMap.get(item.id.videoId);

          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: formatDate(item.snippet.publishedAt),
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            duration: details!.formattedDuration, // Le '!' est sûr car on filtre avant
            durationSeconds: details!.durationSeconds,
            theme: channel.theme,
            state: "A voir !", // Par défaut, toutes les nouvelles vidéos sont à voir
          };
        });

      allVideos.push(...channelVideos);
    } catch (error) {
      console.error(`Error fetching videos for channel ${channel.id}:`, error);
    }
  }

  return allVideos;
}

// Helper function to format ISO date string to "15 Janvier 2025"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
