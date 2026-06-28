export interface PublicUserDTO {
  id: string;
  name: string | null;
  role: string;
}

export interface ClientProfileDTO {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailAuditReports: boolean;
  statusChangeAlerts: boolean;
  createdAt: Date;
}

export interface AdminUserDTO {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export interface AuthenticatedUserDTO {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: Date | null;
}
