import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { FarmerDashboard } from "~/components/dashboard/farmer-dashboard";
import { BuyerDashboard } from "~/components/dashboard/buyer-dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="animate-fade-in">
      {session.user.role === "FARMER" ? (
        <FarmerDashboard />
      ) : (
        <BuyerDashboard />
      )}
    </div>
  );
}
