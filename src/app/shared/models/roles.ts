export const USER_ROLES = ['admin', 'super-user', 'user'] as const;
export type UserRole = typeof USER_ROLES[number];

export const USER_ROLES_SET: ReadonlySet<UserRole> = new Set(USER_ROLES);

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES_SET.has(value as UserRole);
}

// Convenience groups
export const ADMIN_ROLES = ['admin', 'super-user'] as const satisfies readonly UserRole[];
