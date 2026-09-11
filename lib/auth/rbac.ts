/**
 * Role-Based Access Control (RBAC) & Authorization Definitions
 * VerifyLingua Enterprise Platform
 */

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATIONS_MANAGER",
  "TRANSLATOR_REVIEWER",
  "TRANSLATOR",
  "CUSTOMER_SUPPORT",
  "BILLING_MANAGER",
  "READ_ONLY_ANALYST",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const CLIENT_ROLES = [
  "CUSTOMER",
  "ATTORNEY",
  "CLIENT_OWNER",
  "CLIENT_MEMBER",
  "INDIVIDUAL",
] as const;

export type ClientRole = (typeof CLIENT_ROLES)[number];

export type UserRole = AdminRole | ClientRole | string;

export const ROLE_COOKIE_NAME = "vl_role";

/**
 * Validates whether a given role string qualifies as an administrative operator.
 */
export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase().trim();
  return ADMIN_ROLES.some((r) => r === normalized);
}

/**
 * Detailed permission map per administrative role.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  OPERATIONS_MANAGER: [
    "jobs:read",
    "jobs:write",
    "jobs:retry",
    "users:read",
    "users:write",
    "organizations:read",
    "organizations:write",
    "reviews:read",
    "reviews:write",
    "languages:read",
    "languages:write",
    "glossaries:read",
    "glossaries:write",
    "system-health:read",
    "system-health:write",
    "audit-log:read",
  ],
  TRANSLATOR_REVIEWER: [
    "reviews:read",
    "reviews:write",
    "glossaries:read",
    "glossaries:write",
    "jobs:read",
  ],
  TRANSLATOR: [
    "reviews:read",
    "reviews:write",
    "glossaries:read",
    "jobs:read",
  ],
  CUSTOMER_SUPPORT: [
    "jobs:read",
    "users:read",
    "reviews:read",
    "support:read",
    "support:write",
    "audit-log:read",
  ],
  BILLING_MANAGER: [
    "billing:read",
    "billing:write",
    "organizations:read",
    "organizations:write",
    "invoices:read",
    "invoices:write",
  ],
  READ_ONLY_ANALYST: [
    "jobs:read",
    "users:read",
    "organizations:read",
    "billing:read",
    "system-health:read",
    "audit-log:read",
  ],
};

/**
 * Checks if a role has a specific permission.
 */
export function hasPermission(role: string | null | undefined, permission: string): boolean {
  if (!role) return false;
  const normalized = role.toUpperCase().trim() as AdminRole;
  if (normalized === "SUPER_ADMIN" || normalized === "ADMIN") return true;

  const permissions = ROLE_PERMISSIONS[normalized];
  if (!permissions) return false;

  if (permissions.includes("*")) return true;
  return permissions.includes(permission);
}
