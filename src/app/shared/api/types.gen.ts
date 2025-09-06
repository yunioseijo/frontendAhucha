// Generated types from OpenAPI (manually seeded for now)
// Source: Ahucha REST API OpenAPI 3.0

// Auth
export interface CreateUserDto { email: string; password: string; fullName: string; }
export interface RegisterResponseDto { id: string; email: string; fullName: string; accessToken: string; refreshToken: string; }
export interface LoginUserDto { email: string; password: string; twoFactorCode?: string; }
export interface LoginResponseDto { id: string; email: string; accessToken: string; refreshToken: string; }
export interface RefreshRequestDto { refreshToken: string; }
export interface RefreshResponseDto { accessToken: string; refreshToken: string; }
export interface OkResponseDto { ok: boolean; }
export interface VerifyEmailDto { token: string; }
export interface RequestPasswordResetDto { email: string; }
export interface ResetPasswordDto { token: string; newPassword: string; }
export interface TwoFactorCodeDto { code: string; }

// Users
export interface UserResponseDto {
  id: string; email: string; username: string | null; fullName: string; firstName: string | null; lastName: string | null;
  isActive: boolean; roles: string[]; avatarUrl: string | null; phone: string | null; bio: string | null; countryCode: string | null; locale: string | null; timezone: string | null;
  emailVerified: boolean; emailVerifiedAt: string | null; lastLoginAt: string | null; lastLoginIp: string | null; createdAt: string; updatedAt: string; deletedAt: string | null;
}
export interface UpdateProfileDto { fullName?: string; username?: string; avatarUrl?: string; phone?: string; bio?: string; countryCode?: string; locale?: string; timezone?: string; }
export interface ChangePasswordDto { currentPassword: string; newPassword: string; }
export interface UserListResponseDto { total: number; data: UserResponseDto[]; }
export interface UpdateUserDto extends UpdateProfileDto { email?: string; }
export interface UpdateUserRolesDto { roles: ('admin' | 'super-user' | 'user')[]; }
export interface UpdateUserStatusDto { isActive: boolean; }
export interface AuditLogDto { id: string; action: string; metadata?: Record<string, unknown> | null; ip?: string | null; userAgent?: string | null; createdAt: string; }
export interface AuditListResponseDto { total: number; data: AuditLogDto[]; }

