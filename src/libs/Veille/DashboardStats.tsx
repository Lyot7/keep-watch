"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { decodeHtml } from "@/utils/decodeHtml";
import { useEffect, useRef, useState } from "react";
import { FiClock, FiClock as FiDuration, FiPieChart, FiStar, FiTag, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { useRouter } from "next/navigation";

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
  // Use router for navigation with safe handling for server/client rendering
  const router = useRouter();
  // Add state to track if we're on client side
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Navigation function that only works after component is mounted
  const navigateToVideo = (videoId: string) => {
    if (isMounted) {
      router.push(`/youtube/${videoId}`);
    }
  };

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
    // Ne s'exécute que côté client
    if (!donutChartRef.current || !isMounted) return;

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
      :root {
        --color-purple: #9333ea;
        --color-green: #16a34a;
        --color-blue: #2563eb;
        --color-red: #dc2626;
      }
      .donut-chart-container {
        background: ${conicGradient};
      }
    `;

    document.head.appendChild(style);
  }, [categoryStats, isMounted]); // Ajouter isMounted aux dépendances

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
              className="flex items-center px-4 py-2 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FiPieChart className="text-blue-400 mr-2" size={20} />
              <span className="text-lg font-medium mr-2">Réinitialiser</span>
              <span className="inline-flex items-center justify-center bg-blue-500 text-xs font-semibold w-5 h-5 rounded-full">
                {activeStateFilters.length + activeThemeFilters.length}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left column with donut chart - reduced to 3/12 */}
        <div className="lg:col-span-3 bg-gray-800 bg-opacity-70 rounded-xl p-5 border border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium mb-5 text-blue-300 text-center">Répartition</h3>

          <div className="relative" style={{ width: '180px', height: '180px' }}>
            {/* Rendu conditionnel du donut chart en fonction de isMounted */}
            {isMounted ? (
              <div className="donut-chart-container absolute inset-0 rounded-full" ref={donutChartRef}
                style={{
                  clipPath: 'circle(50%)',
                }}
              ></div>
            ) : (
              <div className="absolute inset-0 rounded-full bg-gray-800" ref={donutChartRef}
                style={{
                  clipPath: 'circle(50%)',
                }}
              ></div>
            )}

            {/* Trou au milieu pour faire un donut */}
            <div className="absolute inset-0 flex items-center justify-center flex-col bg-gray-800 rounded-full"
              style={{ width: '70%', height: '70%', margin: 'auto', top: 0, right: 0, bottom: 0, left: 0 }}>
              <span className="text-3xl font-bold">{totalVideos}</span>
              <span className="text-sm text-gray-400">vidéos</span>
            </div>

            {/* Overlay pour les interactions */}
            <div className="absolute inset-0 rounded-full" style={{ pointerEvents: 'none' }}>
              {isMounted && (
                <>
                  {categoryStats.map((stat, index) => {
                    if (stat.percentage <= 0) return null;

                    // Calculer l'angle de début et de fin pour cette catégorie
                    let startAngle = 0;
                    categoryStats.slice(0, index).forEach(prevStat => {
                      if (prevStat.percentage > 0) {
                        startAngle += (prevStat.percentage / 100) * 360;
                      }
                    });

                    const angle = (stat.percentage / 100) * 360;

                    return (
                      <div
                        key={stat.stateKey}
                        className="absolute top-0 left-0 w-full h-full"
                        onClick={() => onStateFilterToggle(stat.stateKey)}
                        style={{
                          clipPath: `path('M90,90 L90,0 A90,90 0 ${angle > 180 ? 1 : 0},1 ${90 + 90 * Math.cos((startAngle + angle) * (Math.PI / 180))
                            },${90 + 90 * Math.sin((startAngle + angle) * (Math.PI / 180))
                            } Z')`,
                          transform: `rotate(${startAngle}deg)`,
                          transformOrigin: 'center',
                          cursor: 'pointer',
                          zIndex: 10,
                          // Bande de couleur subtile au survol pour aider au débogage visuel
                          backgroundColor: 'rgba(255,255,255,0.0)',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `rgba(${stat.bgColor === 'purple' ? '147, 51, 234' :
                            stat.bgColor === 'green' ? '22, 163, 74' :
                              stat.bgColor === 'blue' ? '37, 99, 235' :
                                stat.bgColor === 'red' ? '220, 38, 38' : '255, 255, 255'
                            }, 0.1)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.0)';
                        }}
                      />
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Middle column with stats - 6/12 */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {categoryStats.map((stat) => {
            // Base classes statiques qui sont les mêmes côté serveur et client
            const baseCardClass = "bg-gray-800 bg-opacity-90 rounded-xl p-4 flex flex-col border transition-all duration-200 shadow-md cursor-pointer";
            const baseIconClass = "rounded-full p-2 bg-gray-900";

            // Si côté client, on peut ajouter des classes conditionnelles
            if (isMounted) {
              const isActive = activeStateFilters.includes(stat.stateKey);
              let statCardClasses = baseCardClass;
              let iconBgClass = baseIconClass;

              if (isActive) {
                // Appliquer des styles spécifiques pour chaque état actif
                switch (stat.bgColor) {
                  case 'purple':
                    statCardClasses += " border-purple-500 ring-1 ring-purple-400/50";
                    iconBgClass = baseIconClass.replace("bg-gray-900", "bg-purple-900/60");
                    break;
                  case 'green':
                    statCardClasses += " border-green-500 ring-1 ring-green-400/50";
                    iconBgClass = baseIconClass.replace("bg-gray-900", "bg-green-900/60");
                    break;
                  case 'blue':
                    statCardClasses += " border-blue-500 ring-1 ring-blue-400/50";
                    iconBgClass = baseIconClass.replace("bg-gray-900", "bg-blue-900/60");
                    break;
                  case 'red':
                    statCardClasses += " border-red-500 ring-1 ring-red-400/50";
                    iconBgClass = baseIconClass.replace("bg-gray-900", "bg-red-900/60");
                    break;
                }
              } else {
                statCardClasses += " border-gray-700 hover:border-gray-600";
              }

              return (
                <div
                  key={stat.name}
                  className={statCardClasses}
                  onClick={() => onStateFilterToggle(stat.stateKey)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-base">{stat.name}</span>
                    <div className={iconBgClass}>{stat.icon}</div>
                  </div>
                  <div className="text-3xl font-bold mb-3">{stat.count}</div>
                  <div className="w-full bg-gray-900/80 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={stat.color + " h-2 rounded-full"}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm text-right">{stat.percentage.toFixed(1)}% du total</div>
                </div>
              );
            } else {
              // Rendu côté serveur simple et statique
              return (
                <div
                  key={stat.name}
                  className={baseCardClass + " border-gray-700"}
                  onClick={() => onStateFilterToggle(stat.stateKey)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-base">{stat.name}</span>
                    <div className={baseIconClass}>{stat.icon}</div>
                  </div>
                  <div className="text-3xl font-bold mb-3">{stat.count}</div>
                  <div className="w-full bg-gray-900/80 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={stat.color + " h-2 rounded-full"}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className="text-gray-400 text-sm text-right">{stat.percentage.toFixed(1)}% du total</div>
                </div>
              );
            }
          })}
        </div>

        {/* Right column with activity feed - 3/12 */}
        <div className="lg:col-span-3 bg-gray-800 bg-opacity-70 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-medium mb-4 text-blue-300 flex items-center">
            <FiClock className="mr-2" />
            Activité Récente
          </h3>

          <div className="space-y-3">
            {/* Afficher les dernières vidéos ajoutées, triées par date de publication la plus récente */}
            {youtubeVideos
              .sort((a, b) => {
                // Helper function to parse formatted date strings like "15 Janvier 2025"
                const parseFormattedDate = (dateString: string): Date => {
                  const monthsMapping: { [key: string]: number } = {
                    "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5,
                    "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
                  };

                  try {
                    const parts = dateString.split(' ');
                    if (parts.length !== 3) return new Date(); // Invalid date

                    const day = parseInt(parts[0], 10);
                    const month = monthsMapping[parts[1]];
                    const year = parseInt(parts[2], 10);

                    return new Date(year, month, day);
                  } catch (error) {
                    console.error('Error parsing date:', dateString, error);
                    return new Date(); // Return current date in case of error
                  }
                };

                // Trier par date de publication décroissante (la plus récente en premier)
                const dateA = parseFormattedDate(a.publishedAt);
                const dateB = parseFormattedDate(b.publishedAt);
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
                  <div 
                    key={video.id} 
                    className="bg-gray-900 bg-opacity-90 rounded-lg p-3 hover:bg-gray-800 transition-colors shadow-md cursor-pointer"
                    onClick={() => navigateToVideo(video.id)}
                  >
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