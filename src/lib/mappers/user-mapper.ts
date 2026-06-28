import { PublicUserDTO, ClientProfileDTO, AdminUserDTO, AuthenticatedUserDTO } from "../dto/user";

export function toPublicUserDTO(user: any): PublicUserDTO {
  return {
    id: user.id,
    name: user.name ?? null,
    role: user.role,
  };
}

export function toClientProfileDTO(user: any): ClientProfileDTO {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    emailAuditReports: !!user.emailAuditReports,
    statusChangeAlerts: !!user.statusChangeAlerts,
    createdAt: user.createdAt,
  };
}

export function toAdminUserDTO(user: any): AdminUserDTO {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function toAuthenticatedUserDTO(user: any): AuthenticatedUserDTO {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}
