import { UserResponseDto } from '@shared/api/types.gen';
import { User } from '@shared/models/user.domain';

export function mapUserDtoToDomain(dto: UserResponseDto): User {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username ?? undefined,
    fullName: dto.fullName,
    isActive: dto.isActive,
    roles: dto.roles as any,
    avatarUrl: dto.avatarUrl ?? undefined,
    phone: dto.phone ?? undefined,
    bio: dto.bio ?? undefined,
    countryCode: dto.countryCode ?? undefined,
    locale: dto.locale ?? undefined,
    timezone: dto.timezone ?? undefined,
    emailVerified: dto.emailVerified,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    deletedAt: dto.deletedAt ?? undefined,
  };
}

