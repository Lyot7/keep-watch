"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { FiEye, FiPieChart, FiStar, FiThumbsUp, FiXCircle } from "react-icons/fi";

interface DashboardStatsProps {
  youtubeVideos: YoutubeVideo[];
}

interface CategoryStat {
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  percentage: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ youtubeVideos }) => {
  // Calcul des statistiques
  const totalVideos = youtubeVideos.length;

  // Compter les vidéos par état
  const countByState: Record<string, number> = {
    "A voir !": 0,
    "Recommander": 0,
    "Impressionnant": 0,
    "Nul": 0
  };

  // Compter les vidéos par thème
  const countByTheme: Record<string, number> = {};

  youtubeVideos.forEach(video => {
    // Compter par état
    if (video.state && countByState.hasOwnProperty(video.state)) {
      countByState[video.state]++;
    }

    // Compter par thème
    if (video.theme) {
      countByTheme[video.theme] = (countByTheme[video.theme] || 0) + 1;
    }
  });

  // Créer les stats de catégories avec pourcentages
  const categoryStats: CategoryStat[] = [
    {
      name: "À voir",
      count: countByState["A voir !"],
      icon: <FiEye className="text-blue-400" size={24} />,
      color: "bg-blue-500",
      percentage: totalVideos > 0 ? (countByState["A voir !"] / totalVideos) * 100 : 0
    },
    {
      name: "Recommandés",
      count: countByState["Recommander"],
      icon: <FiThumbsUp className="text-green-400" size={24} />,
      color: "bg-green-500",
      percentage: totalVideos > 0 ? (countByState["Recommander"] / totalVideos) * 100 : 0
    },
    {
      name: "Impressionnants",
      count: countByState["Impressionnant"],
      icon: <FiStar className="text-purple-400" size={24} />,
      color: "bg-purple-500",
      percentage: totalVideos > 0 ? (countByState["Impressionnant"] / totalVideos) * 100 : 0
    },
    {
      name: "Nuls",
      count: countByState["Nul"],
      icon: <FiXCircle className="text-red-400" size={24} />,
      color: "bg-red-500",
      percentage: totalVideos > 0 ? (countByState["Nul"] / totalVideos) * 100 : 0
    }
  ];

  // Trouver les thèmes les plus populaires (top 3)
  const topThemes = Object.entries(countByTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="mb-10 bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-300">Dashboard</h2>
        <div className="flex items-center">
          <FiPieChart className="text-blue-400 mr-2" size={20} />
          <span className="text-xl font-semibold">{totalVideos} vidéos au total</span>
        </div>
      </div>

      {/* Statistiques par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoryStats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 bg-opacity-70 rounded-lg p-4 flex flex-col border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-lg">{stat.name}</span>
              <div className="bg-gray-900 rounded-full p-2">{stat.icon}</div>
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

      {/* Thèmes populaires */}
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-medium mb-3 text-blue-300">Thèmes populaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThemes.map(([theme, count]) => (
            <div key={theme} className="flex items-center justify-between bg-gray-900 bg-opacity-70 rounded-lg p-3">
              <span className="font-medium">{theme}</span>
              <span className="bg-blue-500 px-2 py-1 rounded text-sm">{count} vidéos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats; 