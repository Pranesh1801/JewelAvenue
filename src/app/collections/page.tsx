import { redirect } from "next/navigation";

// /collections no longer exists — redirect to home
export default function Page() {
  redirect("/");
}
