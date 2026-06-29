"use server";

import { db } from "@/lib/db";
import { auth, signOut, unstable_update } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { 
  RegisterSchema, 
  UpdateProfileSchema, 
  ChangePasswordSchema, 
  InspectionRequestSchema, 
  InspectionReportSchema,
  NotificationPreferencesSchema
} from "./schemas";
import { RequestStatus } from "@prisma/client";

import { generateVerificationToken } from "./tokens";
import { sendEmailVerificationEmail, sendReportIssuedEmail } from "./email";
import { logSecurity } from "./security";
import { rateLimit, getClientIp } from "./rate-limit";
import { sanitizeText, sanitizeMultilineText } from "./security/input-security";
import { canModifyRequest } from "./security/report-integrity";

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
    const ip = await getClientIp();
    const cleanEmail = email.toLowerCase().trim();

    // 1. IP rate limiting (5 per hour)
    const ipLimitCheck = await rateLimit({
      action: "register-ip",
      identifier: ip,
      limit: 5,
      window: "1h",
    });
    if (!ipLimitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        ip,
        reason: "Registration IP rate limit exceeded",
      });
      return { error: "Too many registrations from this IP. Please try again later." };
    }

    // 2. Email rate limiting (3 per hour)
    const emailLimitCheck = await rateLimit({
      action: "register-email",
      identifier: cleanEmail,
      limit: 3,
      window: "1h",
    });
    if (!emailLimitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        email: cleanEmail,
        ip,
        reason: "Registration email rate limit exceeded",
      });
      return { error: "Too many registration attempts for this email address. Please try again later." };
    }

    const existingUser = await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } });

    if (existingUser) {
      return { error: "Email already in use." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sanitizedName = sanitizeText(name);

    const user = await db.user.create({
      data: {
        name: sanitizedName,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "CLIENT",
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Generate token & send email
    const token = await generateVerificationToken(user.id);
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/verify-email/${token}`;
    
    await sendEmailVerificationEmail(user.email, verificationLink);

    logSecurity("VERIFICATION_EMAIL_SENT", { email: user.email });

    return { success: "Account created successfully! Please check your email to verify your account." };
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

    const userId = session.user.id;
    // Rate Limiting: Max 10 requests per day per user
    const limitCheck = await rateLimit({
      action: "inspection-request",
      identifier: userId,
      limit: 10,
      window: "24h",
    });
    if (!limitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        userId,
        reason: "Inspection request daily rate limit exceeded",
      });
      return { error: "Daily limit for inspection requests reached. Please try again tomorrow." };
    }

    const data = validated.data;
    const sanitizedProjectName = sanitizeText(data.projectName);
    const sanitizedPropertyAddress = sanitizeText(data.propertyAddress);
    const sanitizedCity = sanitizeText(data.city);
    const sanitizedState = sanitizeText(data.state);
    const sanitizedCountry = sanitizeText(data.country);
    const sanitizedSiteContactName = sanitizeText(data.siteContactName);
    const sanitizedSiteContactPhone = sanitizeText(data.siteContactPhone);
    const sanitizedNotes = sanitizeMultilineText(data.notes);
    const sanitizedSpecialInstructions = sanitizeMultilineText(data.specialInstructions);

    await db.inspectionRequest.create({
      data: {
        userId: session.user.id,
        projectName: sanitizedProjectName,
        propertyAddress: sanitizedPropertyAddress,
        city: sanitizedCity,
        state: sanitizedState,
        country: sanitizedCountry,
        propertyType: data.propertyType,
        stage: data.stage,
        serviceId: data.serviceId,
        siteContactName: sanitizedSiteContactName,
        siteContactPhone: sanitizedSiteContactPhone,
        notes: sanitizedNotes || null,
        specialInstructions: sanitizedSpecialInstructions || null,
        status: "SUBMITTED",
        paymentStatus: values.paymentStatus || "PAID",
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

    const integrity = await canModifyRequest(requestId);
    if (!integrity.allowed) {
      logSecurity("REPORT_INTEGRITY_VIOLATION", {
        userId: session.user.id,
        reason: `Blocked attempt by user (role: ${role}) to update request ${requestId} status to ${status} after report was issued`,
      });
      return { error: integrity.reason || "This request cannot be modified because an inspection report has already been issued." };
    }

    await db.inspectionRequest.update({
      where: { id: requestId },
      data: { status },
      select: { id: true },
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

    const adminUserId = session.user.id || "";
    // Rate Limiting: Max 5 publishes/updates per minute per admin (accidental double submits)
    const limitCheck = await rateLimit({
      action: "publish-report",
      identifier: adminUserId,
      limit: 5,
      window: "1m",
    });
    if (!limitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        userId: adminUserId,
        reason: "Report publishing rate limit exceeded",
      });
      return { error: "Too many publishing operations. Please wait a moment." };
    }

    const validated = InspectionReportSchema.safeParse(values);
    if (!validated.success) {
      console.error("Validation failed:", validated.error);
      return { error: "Invalid form input." };
    }

    const { requestId, assessmentStatus, executiveSummary, findings, recommendation, status = "DRAFT", mediaAssets } = validated.data;

    const sanitizedExecutiveSummary = sanitizeMultilineText(executiveSummary);
    const sanitizedFindings = sanitizeMultilineText(findings);

    // Transaction to create/update report, add assets, and update request status
    const result = await db.$transaction(async (tx) => {
      // Check if report already exists
      const existingReport = await tx.inspectionReport.findUnique({
        where: { requestId },
        include: {
          request: {
            include: {
              user: {
                select: {
                  email: true,
                }
              }
            }
          }
        },
      });

      if (existingReport && existingReport.status === "ISSUED") {
        throw new Error("This report has already been issued and cannot be modified.");
      }

      let report;
      if (existingReport) {
        // 1. Update Report
        report = await tx.inspectionReport.update({
          where: { id: existingReport.id },
          data: {
            assessmentStatus,
            executiveSummary: sanitizedExecutiveSummary,
            findings: sanitizedFindings,
            recommendation,
            status: status as any,
          },
        });

        // Delete old media assets to replace with new ones
        await tx.mediaAsset.deleteMany({
          where: { reportId: report.id },
        });
      } else {
        // 1. Create Report
        report = await tx.inspectionReport.create({
          data: {
            requestId,
            assessmentStatus,
            executiveSummary: sanitizedExecutiveSummary,
            findings: sanitizedFindings,
            recommendation,
            status: status as any,
          },
        });
      }

      // 2. Add Media Assets if any
      if (mediaAssets && mediaAssets.length > 0) {
        await tx.mediaAsset.createMany({
          data: mediaAssets.map((asset) => ({
            reportId: report.id,
            storageProvider: asset.storageProvider,
            originalFileName: asset.originalFileName,
            displayName: asset.displayName,
            mediaType: asset.mediaType,
            trustedUrl: asset.trustedUrl,
            uploadedBy: session?.user?.id || "admin",
            checksum: asset.checksum,
          })),
        });

        // Log chain-of-custody security events
        mediaAssets.forEach((asset) => {
          logSecurity("EVIDENCE_ATTACHED", {
            userId: session?.user?.id || "admin",
            resourceType: "MEDIA_ASSET",
            resourceId: asset.trustedUrl,
          });
        });
      }

      // Log report publishing / saving draft
      if (status === "ISSUED") {
        logSecurity("EVIDENCE_PUBLISHED", {
          userId: session?.user?.id || "admin",
          resourceType: "REPORT",
          resourceId: report.id,
        });

        // 3. Update Request Status to REPORT_READY
        await tx.inspectionRequest.update({
          where: { id: requestId },
          data: { status: "REPORT_READY" },
        });
      } else {
        // Update Request Status to IN_PROGRESS when saved as draft
        await tx.inspectionRequest.update({
          where: { id: requestId },
          data: { status: "IN_PROGRESS" },
        });
      }

      // Fetch request details for email trigger if we are issuing the report
      const requestWithUser = await tx.inspectionRequest.findUnique({
        where: { id: requestId },
        include: {
          user: {
            select: {
              email: true,
            }
          }
        },
      });

      return { report, request: requestWithUser };
    });

    // If report is issued, trigger email notification to the client
    if (status === "ISSUED" && result.request?.user?.email) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const reportLink = `${appUrl}/dashboard/reports`;
      // Send email (async, non-blocking)
      sendReportIssuedEmail(
        result.request.user.email,
        result.request.projectName,
        reportLink
      ).catch((err) => console.error("Error sending report issued email:", err));
    }

    revalidatePath("/admin/requests");
    revalidatePath("/admin/reports");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/reports");
    
    return { 
      success: status === "ISSUED" 
        ? "Inspection report issued successfully and client notified!" 
        : "Inspection report draft saved successfully!" 
    };
  } catch (error: any) {
    console.error("Publish/Draft report error:", error);
    return { error: error?.message || "Failed to save/issue report." };
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
    const sanitizedName = sanitizeText(name);

    // Check if email changed and is taken
    if (email !== session.user.email) {
      const emailExists = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (emailExists) {
        return { error: "Email address already in use." };
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { name: sanitizedName, email },
      select: { id: true },
    });

    // Update NextAuth session cookie immediately
    await unstable_update({
      user: {
        name: sanitizedName,
        email,
      }
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

    const userId = session.user.id;
    // Rate Limiting: Max 5 attempts per hour per authenticated user
    const limitCheck = await rateLimit({
      action: "change-password",
      identifier: userId,
      limit: 5,
      window: "1h",
    });
    if (!limitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        userId,
        reason: "Change password rate limit exceeded",
      });
      return { error: "Too many attempts detected. Please try again later." };
    }

    const validated = ChangePasswordSchema.safeParse(values);
    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || "Invalid input data.";
      return { error: errorMsg };
    }

    const { currentPassword, newPassword } = validated.data;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
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
      select: { id: true },
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

/**
 * Update User Notification Preferences
 */
export async function updateNotificationPreferences(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized." };
    }

    const validated = NotificationPreferencesSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid preference data." };
    }

    const { emailAuditReports, statusChangeAlerts } = validated.data;

    await db.user.update({
      where: { id: session.user.id },
      data: { emailAuditReports, statusChangeAlerts },
      select: { id: true },
    });

    revalidatePath("/dashboard/settings");
    return { success: "Notification preferences saved successfully!" };
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return { error: "Failed to save preferences." };
  }
}

/**
 * Update inspection service price (Admin only)
 */
export async function updateServicePrice(serviceId: string, price: number) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session?.user || role !== "ADMIN") {
      return { error: "Unauthorized access." };
    }

    if (isNaN(price) || price < 0) {
      return { error: "Price must be a valid positive number." };
    }

    await db.inspectionService.update({
      where: { id: serviceId },
      data: { price },
    });

    revalidatePath("/");
    revalidatePath("/pricing");
    revalidatePath("/dashboard/requests");
    revalidatePath("/admin/services");
    return { success: "Price updated successfully!" };
  } catch (error) {
    console.error("Update service price error:", error);
    return { error: "Failed to update price." };
  }
}

/**
 * Toggle inspection service active status (Admin only)
 */
export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (!session?.user || role !== "ADMIN") {
      return { error: "Unauthorized access." };
    }

    await db.inspectionService.update({
      where: { id: serviceId },
      data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/pricing");
    revalidatePath("/dashboard/requests");
    revalidatePath("/admin/services");
    return { success: `Service availability status updated!` };
  } catch (error) {
    console.error("Toggle service active status error:", error);
    return { error: "Failed to toggle status." };
  }
}

/**
 * Resends the verification email to the logged in unverified user.
 */
export async function resendVerificationEmail() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthenticated." };
    }

    const userId = session.user.id;

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.emailVerified) {
      return { error: "Email is already verified." };
    }

    // Rate Limiting: Max 3 per hour
    const limitCheck = await rateLimit({
      action: "resend-verification",
      identifier: userId,
      limit: 3,
      window: "1h",
    });
    if (!limitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        userId,
        email: user.email,
        reason: "Verification resend rate limit exceeded",
      });
      return { error: "Too many verification emails sent. Please try again later." };
    }

    // Generate new token & send email
    const token = await generateVerificationToken(user.id);
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/verify-email/${token}`;
    
    await sendEmailVerificationEmail(user.email, verificationLink);

    logSecurity("VERIFICATION_RESENT", {
      email: user.email,
      tokenId: token,
    });

    return { success: "Verification email resent successfully. Please check your inbox." };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "Failed to resend verification email." };
  }
}

/**
 * Submit contact form
 */
export async function submitContactForm(values: { firstName: string; lastName: string; email: string; message: string }) {
  try {
    const ip = await getClientIp();
    
    // Rate limit: 5 submissions per hour per IP
    const limitCheck = await rateLimit({
      action: "contact-form",
      identifier: ip,
      limit: 5,
      window: "1h",
    });
    
    if (!limitCheck.success) {
      logSecurity("RATE_LIMIT_EXCEEDED", {
        ip,
        email: values.email,
        reason: "Contact form rate limit exceeded",
      });
      return { error: "Too many attempts detected. Please wait a few minutes and try again." };
    }

    const sanitizedFirstName = sanitizeText(values.firstName);
    const sanitizedLastName = sanitizeText(values.lastName);

    // Log the security event for audit tracking
    logSecurity("EVIDENCE_SUBMITTED", {
      email: values.email,
      ip,
      reason: `Contact message submitted by ${sanitizedFirstName} ${sanitizedLastName}`,
    });

    return { success: "Message sent successfully!" };
  } catch (error) {
    console.error("Contact submit error:", error);
    return { error: "Failed to submit contact form." };
  }
}
