import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StudentNav } from "@/components/nav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (session.user.role === "CENTER_ADMIN") redirect("/admin");

  return (
    <div className="merk-app">
      <StudentNav />
      <div className="merk-shell">{children}</div>
    </div>
  );
}
