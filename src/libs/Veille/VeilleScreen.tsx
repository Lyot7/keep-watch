"use client";
import { YoutubeVideo } from "@/pages/api/youtube/getYoutubeVideos";
import { useEffect } from "react";
import ItemsByState from "./ItemsByState";

interface VeilleProps {
  youtubeVideos: YoutubeVideo[];
}

const Veille: React.FC<VeilleProps> = ({ youtubeVideos }) => {

  useEffect(() => {
    console.log(youtubeVideos);
  }, [youtubeVideos]);

  return (
    <section>
      <p className="mb-4 my-auto text-center">
        Les vidéos qui m&apos;ont marqué.
      </p>
      <ItemsByState youtubeVideos={youtubeVideos} state="🤯" />
      <p className="mb-4 my-auto text-center">
        Les dernières vidéos que j&apos;ai regardé.
      </p>
      <ItemsByState youtubeVideos={youtubeVideos} state="Vu" />

      <p className="mb-4 my-auto text-center">
        Les vidéos qu&apos;il faudrait que je regarde.
      </p>
      <ItemsByState youtubeVideos={youtubeVideos} state="A voir !" />
    </section>
  );
};

export default Veille;