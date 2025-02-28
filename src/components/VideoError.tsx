'use client';

import { ReactNode } from 'react';

interface VideoErrorProps {
  error: Error;
}

/**
 * VideoError component to display error state for video loading failures
 */
export default function VideoError({ error }: VideoErrorProps): ReactNode {
  console.error("Error rendering videos:", error);

  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 my-8">
      <h2 className="text-xl font-bold text-red-500 mb-2">
        Erreur lors du chargement des vidéos
      </h2>
      <p className="text-gray-300">
        Une erreur s&apos;est produite lors de la récupération des vidéos. Veuillez réessayer plus tard.
      </p>
    </div>
  );
} 