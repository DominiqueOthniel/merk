import { BrandHeader } from "@/components/nav";
import { ExamSession } from "@/components/exam/exam-session";

type Props = { params: Promise<{ sourceId: string }> };

export default async function ExamSetPage({ params }: Props) {
  const { sourceId: raw } = await params;
  const sourceId = decodeURIComponent(raw);

  return (
    <>
      <BrandHeader subtitle="Serie TELC · entrainement examen" />
      <ExamSession sourceId={sourceId} />
    </>
  );
}
