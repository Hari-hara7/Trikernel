import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { LandingPageClient } from "~/components/landing-page";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
