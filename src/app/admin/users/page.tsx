import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, ShieldAlert, Calendar } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all users
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Manage Users</h1>
        <p className="text-sm text-gray-500">View and manage clients and admin accounts.</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-brand-bg text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                      {u.name ? u.name.substring(0, 2) : "US"}
                    </div>
                    <div>
                      <span className="font-bold text-charcoal block">{u.name || "N/A"}</span>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {u.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                        u.role === "ADMIN" ? "bg-red-50 text-red-700 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center space-x-2 text-xs">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
