import { z } from "zod";

// Shared strength policy for any *new* password (registration, change, reset).
// Single source of truth so these can't drift out of sync with each other again.
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number");

// User Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Inspection Request Schema
export const InspectionRequestSchema = z.object({
  projectName: z.string().min(3, "Project Name must be at least 3 characters"),
  propertyAddress: z.string().min(5, "Property Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  propertyType: z.enum(["Residential", "Commercial", "Other"], {
    message: "Please select a property type",
  }),
  stage: z.enum(["FOUNDATION", "STRUCTURE", "ROOFING", "FINISHING", "OTHER"], {
    message: "Please select the current stage",
  }),
  serviceId: z.string().min(1, "Please select an inspection type"),
  siteContactName: z.string().min(2, "Site Contact Name is required"),
  siteContactPhone: z.string().min(5, "Site Contact Phone is required"),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Inspection Report Schema
export const InspectionReportSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  assessmentStatus: z.enum(["ON_TRACK", "NEEDS_ATTENTION", "ISSUE_DETECTED"]),
  executiveSummary: z.string().min(10, "Summary must be at least 10 characters"),
  findings: z.string().min(5, "Findings are required (one per line)"),
  recommendation: z.enum(["PROCEED", "PROCEED_WITH_CAUTION", "PAUSE_FUNDING"]),
  status: z.enum(["DRAFT", "ISSUED"]).optional(),
  mediaAssets: z.array(
    z.object({
      storageProvider: z.enum(["GOOGLE_DRIVE", "YOUTUBE", "VIMEO", "S3", "R2"]),
      mediaType: z.enum(["IMAGE", "VIDEO"]),
      trustedUrl: z.string().url("Must be a valid URL"),
      displayName: z.string().optional().nullable(),
      originalFileName: z.string().optional().nullable(),
      checksum: z.string().optional().nullable(),
    })
  ).optional(),
});

export const NotificationPreferencesSchema = z.object({
  emailAuditReports: z.boolean(),
  statusChangeAlerts: z.boolean(),
});

// Contact Form Schema
export const ContactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(254),
  whatsapp: z.string().max(30).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});
