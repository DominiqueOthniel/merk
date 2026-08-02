import { BrandHeader } from "@/components/nav";
import { MockExamSession } from "@/components/exam/mock-exam-session";
import type { MockLevel } from "@/lib/content/mock-exam-meta";

type Props = {
  searchParams: Promise<{ level?: string }>;
};

function toLevel(raw: string | undefined): MockLevel {
  if (raw === "A1" || raw === "A2" || raw === "B2" || raw === "C1") return raw;
  return "B1";
}

export default async function MockExamPage({ searchParams }: Props) {
  const params = await searchParams;
  const level = toLevel(params.level);

  return (
    <>
      <BrandHeader subtitle={`Mock exam · ${level}`} />
      <MockExamSession level={level} />
    </>
  );
}
