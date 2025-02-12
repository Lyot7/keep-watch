import Veille from "@/libs/Veille/VeilleScreen";
import { getNotionDB, NotionItemType } from "@/pages/api/notion/getNotionDB";

// This page is now a Server Component, so we can use async directly.
export default async function Page() {
  const notionItems: NotionItemType[] = await getNotionDB();

  return (
    <main>
      <Veille notionItems={notionItems} />
    </main>
  );
}
