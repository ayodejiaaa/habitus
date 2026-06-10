import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <DashboardSidebar role="ADMIN" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
