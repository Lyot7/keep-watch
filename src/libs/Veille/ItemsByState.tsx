"use client";
import { NotionItemType } from "@/pages/api/notion/getNotionDB";
import Image from "next/image";
import { useEffect } from "react";

interface ItemsByStateProps {
  notionItems: NotionItemType[];
  state: string;
}

const ItemsByState: React.FC<ItemsByStateProps> = ({ notionItems, state }) => {

  useEffect(() => {
    console.log(notionItems);
  }, [notionItems]);

  return (
    <ul className="w-full flex flex-wrap gap-4 justify-center">
      {notionItems.filter(item => item.etat === state).length > 0 ? (
        notionItems.filter(item => item.etat === state).map((item) => (
          <li key={item.id} className="my-4 bg-gray-800 rounded-xl overflow-hidden min-w-[300px] max-w-[350px]">
            <div className="w-full relative aspect-video">
              <Image
                src={item.miniature}
                alt={item.title}
                fill
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p>{item.auteur}</p>
              <p className="bg-gray-700 rounded-md px-1 w-fit">{item.theme}</p>
              <p>{item.date_publication}</p>
              {item.youtube_url && <a href={item.youtube_url}>Lien vers Youtube</a>}
            </div>
          </li>
        ))
      ) : (
        <p>Chargement ...</p>
      )}
    </ul>
  );
};

export default ItemsByState;