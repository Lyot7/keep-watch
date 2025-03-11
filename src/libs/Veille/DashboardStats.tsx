"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { FiClock, FiPieChart, FiStar, FiTag, FiThumbsDown, FiThumbsUp } from "react-icons/fi";

interface DashboardStatsProps {
  youtubeVideos: YoutubeVideo[];
  activeStateFilters: string[];
  activeThemeFilters: string[];
  onStateFilterToggle: (state: string) => void;
  onThemeFilterToggle: (theme: string) => void;
}

interface CategoryStat {
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  percentage: number;
  stateKey: string; // The key used in the state property of videos
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  youtubeVideos,
  activeStateFilters,
  activeThemeFilters,
  onStateFilterToggle,
  onThemeFilterToggle
}) => {
  // Calculate total number of videos
  const totalVideos = youtubeVideos.length;

  // Compter les vidéos par état
  const countByState: Record<string, number> = {
    "A voir !": 0,
    "Recommander": 0,
    "Impressionnant": 0,
    "Ne pas recommander": 0
  };

  // Compter les vidéos par thème
  const countByTheme: Record<string, number> = {};

  // Remplir les compteurs
  youtubeVideos.forEach((video) => {
    // Compter par état
    if (video.state && countByState[video.state] !== undefined) {
      countByState[video.state]++;
    }

    // Compter par thème
    if (video.theme) {
      countByTheme[video.theme] = (countByTheme[video.theme] || 0) + 1;
    }
  });

  // Créer les statistiques pour l'affichage
  const categoryStats: CategoryStat[] = [
    {
      name: "À voir",
      count: countByState["A voir !"],
      icon: <FiClock size={24} className="text-blue-400" />,
      color: "bg-blue-600",
      percentage: totalVideos > 0 ? (countByState["A voir !"] / totalVideos) * 100 : 0,
      stateKey: "A voir !"
    },
    {
      name: "Recommandées",
      count: countByState["Recommander"],
      icon: <FiThumbsUp size={24} className="text-green-400" />,
      color: "bg-green-600",
      percentage: totalVideos > 0 ? (countByState["Recommander"] / totalVideos) * 100 : 0,
      stateKey: "Recommander"
    },
    {
      name: "Impressionnantes",
      count: countByState["Impressionnant"],
      icon: <FiStar size={24} className="text-purple-400" />,
      color: "bg-purple-600",
      percentage: totalVideos > 0 ? (countByState["Impressionnant"] / totalVideos) * 100 : 0,
      stateKey: "Impressionnant"
    },
    {
      name: "Pas recommandées",
      count: countByState["Ne pas recommander"],
      icon: <FiThumbsDown size={24} className="text-red-400" />,
      color: "bg-red-600",
      percentage: totalVideos > 0 ? (countByState["Ne pas recommander"] / totalVideos) * 100 : 0,
      stateKey: "Ne pas recommander"
    },
  ];

  // Trier les thèmes par nombre de vidéos (du plus grand au plus petit)
  const sortedThemes = Object.entries(countByTheme)
    .sort((a, b) => b[1] - a[1]);

  // Helper to check if any filters are active
  const hasActiveFilters = activeStateFilters.length > 0 || activeThemeFilters.length > 0;

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    // Reset all state filters
    activeStateFilters.forEach(filter => onStateFilterToggle(filter));
    // Reset all theme filters
    activeThemeFilters.forEach(filter => onThemeFilterToggle(filter));
  };

  return (
    <div className="mb-10 bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-300">Dashboard</h2>
        <div className="flex items-center gap-2">
          <FiPieChart className="text-blue-400" size={20} />
          <span className="text-xl font-semibold">{totalVideos} vidéos au total</span>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Statistiques par catégorie (cliquables) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoryStats.map((stat) => (
          <div
            key={stat.name}
            className={`bg-gray-800 bg-opacity-70 rounded-lg p-4 flex flex-col border ${activeStateFilters.includes(stat.stateKey)
              ? 'border-blue-500 ring-2 ring-blue-400 cursor-pointer'
              : 'border-gray-700 hover:border-gray-500 cursor-pointer'
              } transition-all duration-200`}
            onClick={() => onStateFilterToggle(stat.stateKey)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-lg">{stat.name}</span>
              <div className={`rounded-full p-2 ${activeStateFilters.includes(stat.stateKey) ? 'bg-blue-900' : 'bg-gray-900'
                }`}>{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold mb-2">{stat.count}</div>
            <div className="w-full bg-gray-900 rounded-full h-2.5 mb-1">
              <div
                className={`${stat.color} h-2.5 rounded-full`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
            <div className="text-gray-400 text-sm">{stat.percentage.toFixed(1)}% du total</div>
          </div>
        ))}
      </div>

      {/* Thèmes populaires (filtres cliquables) */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-blue-300">Filtrer par thème</h3>
        <div className="flex flex-wrap gap-2">
          {sortedThemes.map(([theme, count]) => (
            <div
              key={theme}
              onClick={() => onThemeFilterToggle(theme)}
              className={`flex items-center gap-2 bg-gray-900 bg-opacity-70 rounded-lg px-3 py-2 cursor-pointer ${activeThemeFilters.includes(theme)
                ? 'border border-blue-500 ring-1 ring-blue-400'
                : 'border border-gray-700 hover:border-gray-500'
                } transition-all duration-200`}
            >
              <FiTag className={activeThemeFilters.includes(theme) ? 'text-blue-400' : 'text-gray-400'} />
              <span className="font-medium">{theme}</span>
              <span className={`px-2 py-0.5 rounded text-sm ${activeThemeFilters.includes(theme) ? 'bg-blue-500' : 'bg-gray-700'
                }`}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 