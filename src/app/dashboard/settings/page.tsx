import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile details and update notification rules.</p>
      </div>

      <SettingsForm 
        initialUser={{ 
          name: user.name, 
          email: user.email,
          emailAuditReports: user.emailAuditReports,
          statusChangeAlerts: user.statusChangeAlerts
        }} 
      />
    </div>
  );
}
