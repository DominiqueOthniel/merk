import { BrandHeader } from "@/components/nav";
import { ExamSession } from "@/components/exam/exam-session";
import { getSession } from "@/lib/session";
import { examProviderLabel } from "@/lib/exam-provider";

type Props = { params: Promise<{ sourceId: string }> };

export default async function ExamSetPage({ params }: Props) {
  const { sourceId: raw } = await params;
  const sourceId = decodeURIComponent(raw);
  const session = await getSession();
  const label = examProviderLabel(session?.user?.examProvider);

  return (
    <>
      <BrandHeader subtitle={`Serie ${label} · entrainement examen`} />
      <ExamSession sourceId={sourceId} />
    </>
  );
}
