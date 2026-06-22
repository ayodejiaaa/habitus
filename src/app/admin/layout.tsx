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
    
    // Check if the error is a Prisma/database connection issue
    console.error("Admin layout error:", error);
    return (
      <div className="flex min-h-screen bg-brand-bg">
        <DashboardSidebar role="ADMIN" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="bg-white border border-red-100 rounded-xl p-8 max-w-xl mx-auto my-12 text-center space-y-6 shadow-sm">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">!</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-charcoal">Database Connection Error</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Unable to connect to the database server at <code className="bg-gray-100 px-1 py-0.5 rounded">localhost:5432</code>. Please make sure your database server is running or configured correctly in <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code>.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

