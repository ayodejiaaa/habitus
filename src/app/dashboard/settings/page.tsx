import type { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { clientProfileSelect } from "@/lib/database/selects/user-selects";
import { toClientProfileDTO } from "@/lib/mappers/user-mapper";
import { sanitizeUser } from "@/lib/security/user-sanitizer";
import SettingsForm from "@/components/SettingsForm";
import { requireAuthenticatedUser, AuthorizationError } from "@/lib/access-policy";
import SecurityErrorPage from "@/components/SecurityErrorPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  let profile;
  try {
    const user = await requireAuthenticatedUser();
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: clientProfileSelect,
    });
    if (!dbUser) {
      redirect("/login");
    }
    profile = sanitizeUser(toClientProfileDTO(dbUser));
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black text-charcoal">Settings</h1>
        <p className="text-sm text-gray-500">Manage your profile details and update notification rules.</p>
      </div>

      <SettingsForm 
        initialUser={{ 
          name: profile.name, 
          email: profile.email,
          phone: profile.phone,
          emailAuditReports: profile.emailAuditReports,
          statusChangeAlerts: profile.statusChangeAlerts
        }} 
      />
    </div>
  );
}
