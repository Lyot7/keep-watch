"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { useState } from "react";
import DashboardStats from "./DashboardStats";
import ItemsByState from "./ItemsByState";

interface VeilleProps {
  youtubeVideos: YoutubeVideo[];
}

const Veille: React.FC<VeilleProps> = ({ youtubeVideos = [] }) => {
  // State to track active filters - always define hooks at the top level before any conditional returns
  const [activeStateFilters, setActiveStateFilters] = useState<string[]>([]);
  const [activeThemeFilters, setActiveThemeFilters] = useState<string[]>([]);

  // Handle case when youtubeVideos is undefined or empty
  if (!youtubeVideos || youtubeVideos.length === 0) {
    return (
      <section className="py-12 text-center">
        <p className="text-xl text-gray-400">
          Aucune vidéo disponible pour le moment. Veuillez réessayer plus tard.
        </p>
      </section>
    );
  }

  // Vérifier si une catégorie contient des vidéos
  const hasVideosWithState = (state: string): boolean => {
    return youtubeVideos.some(video => video.state === state);
  };

  // Toggle a state filter when a dashboard stat is clicked
  const toggleStateFilter = (state: string) => {
    setActiveStateFilters(prev => {
      if (prev.includes(state)) {
        return prev.filter(filter => filter !== state);
      } else {
        return [...prev, state];
      }
    });
  };

  // Toggle a theme filter when a theme box is clicked
  const toggleThemeFilter = (theme: string) => {
    setActiveThemeFilters(prev => {
      if (prev.includes(theme)) {
        return prev.filter(filter => filter !== theme);
      } else {
        return [...prev, theme];
      }
    });
  };

  // Check if a video passes the current filters
  const videoPassesFilters = (video: YoutubeVideo): boolean => {
    // Check if video passes state filters
    const passesStateFilter = activeStateFilters.length === 0 ||
      (typeof video.state === 'string' && activeStateFilters.includes(video.state));

    // Check if video passes theme filters
    const passesThemeFilter = activeThemeFilters.length === 0 ||
      (typeof video.theme === 'string' && activeThemeFilters.includes(video.theme));

    // Video must pass both state and theme filters
    return passesStateFilter && passesThemeFilter;
  };

  // Check if a category should be displayed based on active filters
  const shouldShowCategory = (state: string): boolean => {
    // If no filters are active, show all categories that have videos
    if (activeStateFilters.length === 0 && activeThemeFilters.length === 0) {
      return hasVideosWithState(state);
    }

    // Check if any videos in this state category pass all filters
    return youtubeVideos.some(video =>
      video.state === state && videoPassesFilters(video)
    );
  };

  // Filter videos for a specific state category
  const getFilteredVideosForState = (state: string): YoutubeVideo[] => {
    return youtubeVideos.filter(video =>
      video.state === state && videoPassesFilters(video)
    );
  };

  return (
    <section>
      {/* Afficher le dashboard avec les statistiques */}
      <DashboardStats
        youtubeVideos={youtubeVideos}
        activeStateFilters={activeStateFilters}
        activeThemeFilters={activeThemeFilters}
        onStateFilterToggle={toggleStateFilter}
        onThemeFilterToggle={toggleThemeFilter}
      />

      <div className="mt-8">
        {/* Afficher la catégorie "Impressionnant" uniquement si elle contient des vidéos */}
        {shouldShowCategory("Impressionnant") && (
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8 mt-4 text-center">
              Vidéos que je recommande fortement
            </h2>
            <ItemsByState
              youtubeVideos={getFilteredVideosForState("Impressionnant")}
              state="Impressionnant"
            />
          </div>
        )}

        {/* Afficher la catégorie "Recommander" uniquement si elle contient des vidéos */}
        {shouldShowCategory("Recommander") && (
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8 mt-4 text-center">
              Vidéos Recommandées
            </h2>
            <ItemsByState
              youtubeVideos={getFilteredVideosForState("Recommander")}
              state="Recommander"
            />
          </div>
        )}

        {/* Afficher la catégorie "A voir !" uniquement si elle contient des vidéos */}
        {shouldShowCategory("A voir !") && (
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8 mt-4 text-center">
              Vidéos À Voir
            </h2>
            <ItemsByState
              youtubeVideos={getFilteredVideosForState("A voir !")}
              state="A voir !"
            />
          </div>
        )}

        {/* Afficher la catégorie "Ne pas recommander" uniquement si elle contient des vidéos */}
        {shouldShowCategory("Ne pas recommander") && (
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-8 mt-4 text-center">
              Vidéos à Éviter
            </h2>
            <ItemsByState
              youtubeVideos={getFilteredVideosForState("Ne pas recommander")}
              state="Ne pas recommander"
            />
          </div>
        )}

        {/* Message si aucune vidéo ne correspond aux filtres actifs */}
        {!shouldShowCategory("Impressionnant") &&
          !shouldShowCategory("Recommander") &&
          !shouldShowCategory("A voir !") &&
          !shouldShowCategory("Ne pas recommander") && (
            <p className="text-center text-xl text-gray-400 py-10">
              Aucune vidéo ne correspond aux filtres sélectionnés.
              {(activeStateFilters.length > 0 || activeThemeFilters.length > 0) &&
                " Essayez de modifier vos filtres."}
            </p>
          )}
      </div>
    </section>
  );
};

export default Veille;