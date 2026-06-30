export const publicUserSelect = {
  id: true,
  name: true,
  role: true,
};

export const clientProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  emailAuditReports: true,
  statusChangeAlerts: true,
  createdAt: true,
};

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
};

export const authenticatedUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  emailVerified: true,
};
