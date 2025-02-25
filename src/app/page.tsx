import Veille from "@/libs/Veille/VeilleScreen";
import { getNotionDB, NotionItemType } from "@/pages/api/notion/getNotionDB";

// This page is now a Server Component, so we can use async directly.
export default async function Page() {
  const notionItems: NotionItemType[] = await getNotionDB();

  return (
    <main className="p-4 flex flex-col items-center justify-center mt-16">
      <h1 className="text-3xl font-bold mb-4">Veille Tech & Productivité</h1>

      <Veille notionItems={notionItems} />
    </main>
  );
}
