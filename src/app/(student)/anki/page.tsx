import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { BrandHeader } from "@/components/nav";
import { AnkiScreen } from "@/components/anki/anki-screen";

export default async function AnkiPage() {
  const session = await getSession();
  if (!session?.user?.placedAt) redirect("/placement");

  return (
    <>
      <BrandHeader subtitle="Systeme Anki · repetition espacee" />
      <AnkiScreen />
    </>
  );
}
