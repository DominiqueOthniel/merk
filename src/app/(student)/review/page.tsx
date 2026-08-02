import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { BrandHeader } from "@/components/nav";
import { ReviewSession } from "@/components/review/review-session";

export default async function ReviewPage() {
  const session = await getSession();
  if (!session?.user?.placedAt) redirect("/placement");

  return (
    <>
      <BrandHeader
        subtitle={
          session.user.cefrLevel
            ? `Cartes du jour · ${session.user.cefrLevel}${
                session.user.targetLevel
                  ? ` vers ${session.user.targetLevel}`
                  : ""
              }`
            : "Cartes du jour · production active"
        }
      />
      <ReviewSession />
    </>
  );
}
