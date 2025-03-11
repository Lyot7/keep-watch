"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { decodeHtml } from "@/utils/decodeHtml";
import { useEffect, useRef } from "react";
import { FiClock, FiClock as FiDuration, FiPieChart, FiStar, FiTag, FiThumbsDown, FiThumbsUp } from "react-icons/fi";

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
  bgColor: string;
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

  // Calculer la durée totale des vidéos (en secondes)
  const totalDurationSeconds = youtubeVideos.reduce((acc, video) => {
    return acc + (video.durationSeconds || 0);
  }, 0);

  // Formatter le temps total en heures:minutes
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Compter les vidéos par état
  const countByState: Record<string, number> = {
    "A voir !": 0,
    "Recommander": 0,
    "Impressionnant": 0,
    "Ne pas recommander": 0
  };

  // Compter les vidéos par thème
  const countByTheme: Record<string, number> = {};

  // Calculer des stats par mois (pour les 6 derniers mois)
  const getRecentMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      months.push(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));
    }
    return months;
  };

  const recentMonths = getRecentMonths();
  const countByMonth: Record<string, number> = Object.fromEntries(
    recentMonths.map(month => [month, 0])
  );

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

    // Compter par mois
    if (video.publishedAt) {
      try {
        const date = new Date(video.publishedAt);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (countByMonth[monthYear] !== undefined) {
          countByMonth[monthYear]++;
        }
      } catch {
        // Gérer les formats de date incorrects
      }
    }
  });

  // Créer les statistiques pour l'affichage
  const categoryStats: CategoryStat[] = [
    {
      name: "Impressionnantes",
      count: countByState["Impressionnant"],
      icon: <FiStar size={22} className="text-purple-400" />,
      color: "bg-purple-600",
      bgColor: "purple",
      percentage: totalVideos > 0 ? (countByState["Impressionnant"] / totalVideos) * 100 : 0,
      stateKey: "Impressionnant"
    },
    {
      name: "Recommandées",
      count: countByState["Recommander"],
      icon: <FiThumbsUp size={22} className="text-green-400" />,
      color: "bg-green-600",
      bgColor: "green",
      percentage: totalVideos > 0 ? (countByState["Recommander"] / totalVideos) * 100 : 0,
      stateKey: "Recommander"
    },
    {
      name: "À voir",
      count: countByState["A voir !"],
      icon: <FiClock size={22} className="text-blue-400" />,
      color: "bg-blue-600",
      bgColor: "blue",
      percentage: totalVideos > 0 ? (countByState["A voir !"] / totalVideos) * 100 : 0,
      stateKey: "A voir !"
    },
    {
      name: "Pas recommandées",
      count: countByState["Ne pas recommander"],
      icon: <FiThumbsDown size={22} className="text-red-400" />,
      color: "bg-red-600",
      bgColor: "red",
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

  // Référence pour le dessin du donut chart
  const donutChartRef = useRef<HTMLDivElement>(null);

  // Création du donut chart avec CSS
  useEffect(() => {
    if (!donutChartRef.current) return;

    // Nettoyer les anciens styles
    const oldStyle = document.getElementById('donut-chart-style');
    if (oldStyle) {
      document.head.removeChild(oldStyle);
    }

    // Création d'un style pour les conic-gradient
    const style = document.createElement('style');
    style.id = 'donut-chart-style';

    // Calculer les positions pour le conic-gradient
    const conicGradientParts: string[] = [];
    let currentDegree = 0;

    categoryStats.forEach((stat) => {
      if (stat.percentage > 0) {
        const degrees = (stat.percentage / 100) * 360;
        const startDegree = currentDegree;
        const endDegree = currentDegree + degrees;

        conicGradientParts.push(`var(--color-${stat.bgColor}) ${startDegree}deg ${endDegree}deg`);
        currentDegree = endDegree;
      }
    });

    // Si aucune vidéo, afficher un cercle gris
    const conicGradient = conicGradientParts.length > 0
      ? `conic-gradient(${conicGradientParts.join(', ')})`
      : 'conic-gradient(#4b5563 0deg 360deg)';

    style.textContent = `
      .donut-chart-content {
        background: ${conicGradient};
      }
    `;

    document.head.appendChild(style);

    return () => {
      if (document.getElementById('donut-chart-style')) {
        document.head.removeChild(document.getElementById('donut-chart-style')!);
      }
    };
  }, [categoryStats, totalVideos]);

  return (
    <div className="mb-10 bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-300">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 rounded-lg">
            <FiPieChart className="text-blue-400 mr-2" size={20} />
            <span className="text-xl font-semibold">{totalVideos} vidéos</span>
          </div>
          <div className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 rounded-lg">
            <FiDuration className="text-blue-400 mr-2" size={20} />
            <span className="text-xl font-semibold">{formatTotalDuration(totalDurationSeconds)}</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition flex items-center"
            >
              <span className="mr-1">Réinitialiser</span>
              <span className="inline-flex items-center justify-center bg-blue-500 text-xs w-5 h-5 rounded-full">
                {activeStateFilters.length + activeThemeFilters.length}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left column with donut chart */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-blue-300">Répartition</h3>

          <div
            ref={donutChartRef}
            className="relative mx-auto"
            style={{
              width: '200px',
              height: '200px',
              '--color-purple': '#9333ea',
              '--color-green': '#16a34a',
              '--color-blue': '#2563eb',
              '--color-red': '#dc2626'
            } as React.CSSProperties}
          >
            {/* Donut chart avec conic-gradient */}
            <div
              className="donut-chart-content absolute inset-0 rounded-full"
              style={{
                clipPath: 'circle(50%)',
              }}
            />

            {/* Trou au milieu pour faire un donut */}
            <div className="absolute inset-0 flex items-center justify-center flex-col bg-gray-800 rounded-full"
              style={{ width: '70%', height: '70%', margin: 'auto', top: 0, right: 0, bottom: 0, left: 0 }}>
              <span className="text-3xl font-bold">{totalVideos}</span>
              <span className="text-sm text-gray-400">vidéos</span>
            </div>

            {/* Overlay pour les interactions */}
            <div className="absolute inset-0 rounded-full" style={{ pointerEvents: 'none' }}>
              {categoryStats.map((stat) => (
                stat.percentage > 0 ? (
                  <div
                    key={stat.stateKey}
                    className="absolute inset-0 rounded-full"
                    style={{
                      pointerEvents: 'all',
                      cursor: 'pointer',
                      zIndex: 10,
                      opacity: 0, // Transparent mais cliquable
                    }}
                    onClick={() => onStateFilterToggle(stat.stateKey)}
                  />
                ) : null
              ))}
            </div>
          </div>
        </div>

        {/* Middle column with stats */}
        <div className="grid grid-cols-2 gap-4">
          {categoryStats.map((stat) => {
            // Déterminer les couleurs spécifiques à chaque état pour un style cohérent
            const borderColor = activeStateFilters.includes(stat.stateKey)
              ? stat.bgColor === 'purple' ? 'border-purple-500'
                : stat.bgColor === 'green' ? 'border-green-500'
                  : stat.bgColor === 'blue' ? 'border-blue-500'
                    : stat.bgColor === 'red' ? 'border-red-500'
                      : 'border-gray-700'
              : 'border-gray-700 hover:border-gray-600';

            const ringColor = activeStateFilters.includes(stat.stateKey)
              ? stat.bgColor === 'purple' ? 'ring-1 ring-purple-400/50'
                : stat.bgColor === 'green' ? 'ring-1 ring-green-400/50'
                  : stat.bgColor === 'blue' ? 'ring-1 ring-blue-400/50'
                    : stat.bgColor === 'red' ? 'ring-1 ring-red-400/50'
                      : ''
              : '';

            const iconBgColor = activeStateFilters.includes(stat.stateKey)
              ? stat.bgColor === 'purple' ? 'bg-purple-900/60'
                : stat.bgColor === 'green' ? 'bg-green-900/60'
                  : stat.bgColor === 'blue' ? 'bg-blue-900/60'
                    : stat.bgColor === 'red' ? 'bg-red-900/60'
                      : 'bg-gray-900'
              : 'bg-gray-900';

            return (
              <div
                key={stat.name}
                className={`bg-gray-800 bg-opacity-90 rounded-xl p-4 flex flex-col border ${borderColor} ${ringColor} transition-all duration-200 shadow-md cursor-pointer`}
                onClick={() => onStateFilterToggle(stat.stateKey)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-base">{stat.name}</span>
                  <div className={`rounded-full p-2 ${iconBgColor}`}>{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold mb-3">{stat.count}</div>
                <div className="w-full bg-gray-900/80 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`${stat.color} h-2 rounded-full`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="text-gray-400 text-sm text-right">{stat.percentage.toFixed(1)}% du total</div>
              </div>
            );
          })}
        </div>

        {/* Right column with activity feed */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-blue-300 flex items-center">
            <FiClock className="mr-2" />
            Activité Récente
          </h3>

          <div className="space-y-3">
            {/* Afficher les dernières vidéos ajoutées */}
            {youtubeVideos
              .sort((a, b) => {
                // Trier par date de publication décroissante (la plus récente en premier)
                const dateA = new Date(a.publishedAt);
                const dateB = new Date(b.publishedAt);
                return dateB.getTime() - dateA.getTime();
              })
              .slice(0, 3)
              .map(video => {
                // Déterminer la couleur en fonction de l'état
                const stateColor =
                  video.state === "Impressionnant" ? "text-purple-400" :
                    video.state === "Recommander" ? "text-green-400" :
                      video.state === "A voir !" ? "text-blue-400" :
                        video.state === "Ne pas recommander" ? "text-red-400" :
                          "text-gray-400";

                // Formater la date relative (aujourd'hui, hier, etc.)
                const formatRelativeDate = (dateStr: string) => {
                  const date = new Date(dateStr);
                  const now = new Date();
                  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                  if (diffDays === 0) return "Aujourd'hui";
                  if (diffDays === 1) return "Hier";
                  if (diffDays < 7) return `Il y a ${diffDays} jours`;

                  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                };

                // Échapper les caractères spéciaux dans le titre
                const safeTitle = video.title
                  ? decodeHtml(video.title)
                  : '';

                return (
                  <div key={video.id} className="bg-gray-900 bg-opacity-90 rounded-lg p-3 hover:bg-gray-800 transition-colors shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm line-clamp-1 flex-1 pr-2 text-white">
                        {safeTitle}
                      </div>
                      <span className={`text-xs font-medium ${stateColor} px-2 py-1 bg-gray-800 rounded-md whitespace-nowrap ml-1`}>
                        {video.state}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between items-center">
                      <span className="truncate max-w-[50%]">{decodeHtml(video.channelTitle)}</span>
                      <span className="text-gray-500">{formatRelativeDate(video.publishedAt)}</span>
                    </div>
                  </div>
                );
              })}

            {youtubeVideos.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                Aucune vidéo dans votre collection
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thèmes populaires (filtres cliquables) */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-blue-300 flex items-center">
          <FiTag className="mr-2" />
          Filtrer par thème
        </h3>
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