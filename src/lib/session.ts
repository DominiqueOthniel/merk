import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}
