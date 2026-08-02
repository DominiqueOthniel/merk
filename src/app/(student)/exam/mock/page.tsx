import { BrandHeader } from "@/components/nav";
import { MockExamSession } from "@/components/exam/mock-exam-session";

type Props = {
  searchParams: Promise<{ level?: string }>;
};

export default async function MockExamPage({ searchParams }: Props) {
  const params = await searchParams;
  const level = params.level === "B2" || params.level === "C1" ? params.level : "B1";

  return (
    <>
      <BrandHeader subtitle={`Mock exam · ${level}`} />
      <MockExamSession level={level} />
    </>
  );
}
