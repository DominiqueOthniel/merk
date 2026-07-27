import { BrandHeader } from "@/components/nav";
import { ExamSession } from "@/components/exam/exam-session";

type Props = { params: Promise<{ sourceId: string }> };

export default async function ExamSetPage({ params }: Props) {
  const { sourceId } = await params;

  return (
    <>
      <BrandHeader subtitle="Serie TELC · production par association" />
      <ExamSession sourceId={sourceId} />
    </>
  );
}
