import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

interface NotionApiResultItem {
  id: string;
  created_time: string;
  cover: { external: { url: string } };
  properties: {
    Titre: { title: { plain_text: string }[] };
    Description: { rich_text: { plain_text: string }[] };
    Theme: { select: { name: string } };
    Author: { rich_text: { plain_text: string }[] };
    URL: { url: string };
    Etat: { status: { name: string } };
  };
}

interface NotionApiResponse {
  results: NotionApiResultItem[];
}

// Define the simplified type your UI will use.
export interface NotionItemType {
  id: string;
  title: string;
  description: string;
  miniature: string;
  theme: string;
  date_publication: string;
  auteur: string;
  youtube_url: string;
  etat: string;
}

export async function getNotionDB(): Promise<NotionItemType[]> {
  // Check that the NOTION_TOKEN environment variable is defined
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("Missing environment variable NOTION_TOKEN");
  }

  const notion = new Client({
    auth: token,
  });

  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error("Missing environment variable NOTION_DATABASE_ID");
  }

  const response = await notion.databases.query({ database_id: databaseId });
  const notionResponse = response as unknown as NotionApiResponse;

  console.log(notionResponse);
  // Map the raw Notion response to your simplified type.
  const mappedItems = notionResponse.results.map((item) => ({
    id: item.id,
    title: item.properties.Titre.title[0]?.plain_text || "",
    auteur: item.properties.Author.rich_text[0]?.plain_text || "",
    description: item.properties.Description.rich_text[0]?.plain_text || "",
    theme: item.properties.Theme.select?.name || "",
    miniature: item.cover.external.url,
    youtube_url: item.properties.URL.url || "",
    date_publication: formatDate(item.created_time),
    etat: item.properties.Etat.status?.name || "",
  }));

  console.log(mappedItems);

  const filteredItems = mappedItems.filter((item) => item.etat !== "A trier");

  console.log(filteredItems);

  return filteredItems;
}

// Helper function to format ISO date string to "15 Janvier 2025"
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
