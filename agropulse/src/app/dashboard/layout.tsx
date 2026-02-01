import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

import { auth } from "~/server/auth";
import { DashboardNav } from "~/components/dashboard/nav";
import { Toaster } from "~/components/ui/toaster";
import { LanguageProvider } from "~/providers/language-provider";
import { OfflineIndicator } from "~/components/offline-indicator";
import { DraftManager } from "~/components/draft-manager";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          <DashboardNav />
          
         
          <main className="lg:ml-64 pt-14 lg:pt-16 min-h-screen">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
          
          <Toaster />
          <OfflineIndicator />
          <DraftManager />
        </div>
      </LanguageProvider>
    </SessionProvider>
  );
}
