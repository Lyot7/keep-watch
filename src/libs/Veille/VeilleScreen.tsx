"use client";
import { NotionItemType } from "@/pages/api/notion/getNotionDB";
import Image from "next/image";
import { useEffect } from "react";

interface VeilleProps {
  notionItems: NotionItemType[];
}

const Veille: React.FC<VeilleProps> = ({ notionItems }) => {

  useEffect(() => {
    console.log(notionItems);
  }, [notionItems]);

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Veille Tech & Productivité</h1>
      <ul>
        {notionItems.length > 0 ? (
          notionItems.map((item) => (
            <li key={item.id} className="my-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p>{item.description}</p>
              <Image src={item.miniature} alt={item.title} width={500} height={300} />
              <p>Thème: {item.theme}</p>
              <p>Date de publication: {item.date_publication}</p>
              <p>Auteur: {item.auteur}</p>
              {item.youtube_url && <a href={item.youtube_url}>Lien vers Youtube</a>}
            </li>
          ))
        ) : (
          <p>Chargement ...</p>
        )}
      </ul>
    </section>
  );
};

export default Veille;