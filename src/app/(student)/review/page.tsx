import { redirect } from "next/navigation";

/** Ancienne route : tout passe par l ecran Anki dedie. */
export default function ReviewRedirectPage() {
  redirect("/anki");
}
