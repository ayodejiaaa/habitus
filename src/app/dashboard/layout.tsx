import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch emailVerified status directly from database to avoid stale cookie values
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, role: true },
  });

  if (!user?.emailVerified) {
    redirect("/verify-email/pending");
  }

  const role = user.role || "CLIENT";

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <DashboardSidebar role={role} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

