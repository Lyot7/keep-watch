"use client";
import { NotionItemType } from "@/pages/api/notion/getNotionDB";
import { useEffect } from "react";
import ItemsByState from "./ItemsByState";

interface VeilleProps {
  notionItems: NotionItemType[];
}

const Veille: React.FC<VeilleProps> = ({ notionItems }) => {

  useEffect(() => {
    console.log(notionItems);
  }, [notionItems]);

  return (
    <section>
      <p className="mb-4 my-auto text-center">
        Les vidéos qui m&apos;ont marqué.
      </p>
      <ItemsByState notionItems={notionItems} state="🤯" />
      <p className="mb-4 my-auto text-center">
        Les dernières vidéos que j&apos;ai regardé.
      </p>
      <ItemsByState notionItems={notionItems} state="Vu" />

      <p className="mb-4 my-auto text-center">
        Les vidéos qu&apos;il faudrait que je regarde.
      </p>
      <ItemsByState notionItems={notionItems} state="A voir !" />
    </section>
  );
};

export default Veille;