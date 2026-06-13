import { z } from "zod";

// User Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
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
  mediaAssets: z.array(
    z.object({
      type: z.enum(["PHOTO", "VIDEO"]),
      url: z.string().url("Must be a valid URL"),
    })
  ).optional(),
});
