import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { db } from "@/lib/db";
import { requireAuthenticatedUser, requireAdminAccess, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await requireAuthenticatedUser();
    await requireAdminAccess(user);

    // Fetch emailVerified status directly from database to avoid stale cookie values
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });

    if (!dbUser?.emailVerified) {
      redirect("/verify-email/pending");
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
  } catch (error) {
    if (error instanceof AuthorizationError) {
      if (error.code === "UNAUTHENTICATED") {
        return <SecurityErrorPage type="UNAUTHENTICATED" />;
      }
      if (error.code === "UNAUTHORIZED") {
        return <SecurityErrorPage type="UNAUTHORIZED" />;
      }
    }
    redirect("/login");
  }
}

