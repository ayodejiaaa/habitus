"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { 
  RegisterSchema, 
  UpdateProfileSchema, 
  ChangePasswordSchema, 
  InspectionRequestSchema, 
  InspectionReportSchema 
} from "./schemas";
import { RequestStatus } from "@prisma/client";

/**
 * Register a new user
 */
export async function registerUser(values: any) {
  try {
    const validated = RegisterSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid form input." };
    }

    const { name, email, password } = validated.data;
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return { error: "Email already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
      },
    });

    return { success: "Account created successfully! You can now login." };
  } catch (error: any) {
    console.error("Register error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Submit an inspection request
 */
export async function createInspectionRequest(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to request an inspection." };
    }

    const validated = InspectionRequestSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid form input." };
    }

    const data = validated.data;

    await db.inspectionRequest.create({
      data: {
        userId: session.user.id,
        projectName: data.projectName,
        propertyAddress: data.propertyAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        propertyType: data.propertyType,
        stage: data.stage,
        siteContactName: data.siteContactName,
        siteContactPhone: data.siteContactPhone,
        notes: data.notes || null,
        specialInstructions: data.specialInstructions || null,
        status: "SUBMITTED",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/requests");
    return { success: "Inspection request submitted successfully!" };
  } catch (error) {
    console.error("Create request error:", error);
    return { error: "Failed to submit request." };
  }
}

/**
 * Update request status (Admin only)
 */
export async function updateRequestStatus(requestId: string, status: RequestStatus) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session?.user || role !== "ADMIN") {
      return { error: "Unauthorized access." };
    }

    await db.inspectionRequest.update({
      where: { id: requestId },
      data: { status },
    });

    revalidatePath("/admin/requests");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/requests");
    return { success: `Status updated to ${status}` };
  } catch (error) {
    console.error("Update request status error:", error);
    return { error: "Failed to update status." };
  }
}

/**
 * Publish an inspection report (Admin only)
 */
export async function publishInspectionReport(values: any) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session?.user || role !== "ADMIN") {
      return { error: "Unauthorized access." };
    }

    const validated = InspectionReportSchema.safeParse(values);
    if (!validated.success) {
      console.error("Validation failed:", validated.error);
      return { error: "Invalid form input." };
    }

    const { requestId, assessmentStatus, executiveSummary, findings, recommendation, mediaAssets } = validated.data;

    // Transaction to create report, add assets, and update request status
    await db.$transaction(async (tx) => {
      // 1. Create Report
      const report = await tx.inspectionReport.create({
        data: {
          requestId,
          assessmentStatus,
          executiveSummary,
          findings,
          recommendation,
        },
      });

      // 2. Add Media Assets if any
      if (mediaAssets && mediaAssets.length > 0) {
        await tx.mediaAsset.createMany({
          data: mediaAssets.map((asset) => ({
            reportId: report.id,
            type: asset.type,
            url: asset.url,
          })),
        });
      }

      // 3. Update Request Status to REPORT_READY
      await tx.inspectionRequest.update({
        where: { id: requestId },
        data: { status: "REPORT_READY" },
      });
    });

    revalidatePath("/admin/requests");
    revalidatePath("/admin/reports");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reports");
    return { success: "Inspection report published successfully!" };
  } catch (error) {
    console.error("Publish report error:", error);
    return { error: "Failed to publish report." };
  }
}

/**
 * Update User Profile
 */
export async function updateProfile(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized." };
    }

    const validated = UpdateProfileSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid profile data." };
    }

    const { name, email } = validated.data;

    // Check if email changed and is taken
    if (email !== session.user.email) {
      const emailExists = await db.user.findUnique({ where: { email } });
      if (emailExists) {
        return { error: "Email address already in use." };
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { name, email },
    });

    revalidatePath("/dashboard/settings");
    return { success: "Profile updated successfully!" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile." };
  }
}

/**
 * Change Password
 */
export async function changePassword(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized." };
    }

    const validated = ChangePasswordSchema.safeParse(values);
    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || "Invalid input data.";
      return { error: errorMsg };
    }

    const { currentPassword, newPassword } = validated.data;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: "User password not found." };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { error: "Incorrect current password." };
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: newHashedPassword },
    });

    return { success: "Password changed successfully!" };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to change password." };
  }
}

/**
 * Logout action for client-rendered components
 */
export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}
