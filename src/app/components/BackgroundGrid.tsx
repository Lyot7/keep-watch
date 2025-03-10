'use client';

/**
 * Background grid component for the futuristic UI aesthetic
 */
export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-[-1]">
      <div className="perspective-grid">
        <div className="grid-lines"></div>
      </div>
    </div>
  );
} 