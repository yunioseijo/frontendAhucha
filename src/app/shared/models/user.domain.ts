export interface User {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  isActive: boolean;
  roles: ('admin' | 'super-user' | 'user')[];
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  countryCode?: string;
  locale?: string;
  timezone?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

