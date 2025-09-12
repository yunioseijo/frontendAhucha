import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API } from '../../core/config/api.config';
import {
  AuditListResponseDto,
  ChangePasswordDto,
  UpdateProfileDto,
  UpdateUserDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
  UserListResponseDto,
  UserResponseDto,
  CreateUserDto,
  RegisterResponseDto,
} from '@shared/api/types.gen';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  me(): Observable<UserResponseDto> { return this.http.get<UserResponseDto>(`${API.baseUrl}/users/me`); }
  updateMe(payload: UpdateProfileDto): Observable<UserResponseDto> { return this.http.patch<UserResponseDto>(`${API.baseUrl}/users/me`, payload); }
  changeMyPassword(payload: ChangePasswordDto): Observable<unknown> { return this.http.patch(`${API.baseUrl}/users/me/password`, payload); }

  list(
    limit = 10,
    offset = 0,
    filters?: { q?: string; role?: 'admin' | 'super-user' | 'user'; isActive?: boolean; emailVerified?: boolean }
  ): Observable<UserListResponseDto> {
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    if (filters) {
      if (filters.q && filters.q.trim().length > 0) params = params.set('q', filters.q.trim());
      if (filters.role) {
        const allowed = new Set(['admin', 'super-user', 'user']);
        if (allowed.has(filters.role)) params = params.set('role', filters.role);
      }
      if (typeof filters.isActive === 'boolean') params = params.set('isActive', String(filters.isActive));
      if (typeof filters.emailVerified === 'boolean') params = params.set('emailVerified', String(filters.emailVerified));
    }
    return this.http.get<UserListResponseDto>(`${API.baseUrl}/users`, { params });
  }

  listDeleted(
    limit = 10,
    offset = 0,
    filters?: { q?: string; role?: 'admin' | 'super-user' | 'user' }
  ): Observable<UserListResponseDto> {
    let params = new HttpParams().set('limit', limit).set('offset', offset).set('onlyDeleted', 'true');
    if (filters) {
      if (filters.q && filters.q.trim().length > 0) params = params.set('q', filters.q.trim());
      if (filters.role) {
        const allowed = new Set(['admin', 'super-user', 'user']);
        if (allowed.has(filters.role)) params = params.set('role', filters.role);
      }
    }
    return this.http.get<UserListResponseDto>(`${API.baseUrl}/users`, { params });
  }

  get(id: string): Observable<UserResponseDto> { return this.http.get<UserResponseDto>(`${API.baseUrl}/users/${id}`); }
  update(id: string, payload: UpdateUserDto): Observable<UserResponseDto> { return this.http.patch<UserResponseDto>(`${API.baseUrl}/users/${id}`, payload); }
  remove(id: string): Observable<unknown> { return this.http.delete(`${API.baseUrl}/users/${id}`); }
  purge(id: string): Observable<unknown> { return this.http.delete(`${API.baseUrl}/users/${id}`, { params: new HttpParams().set('permanent', 'true') }); }
  restore(id: string): Observable<unknown> { return this.http.patch(`${API.baseUrl}/users/${id}/restore`, {}); }
  updateRoles(id: string, payload: UpdateUserRolesDto): Observable<UserResponseDto> { return this.http.patch<UserResponseDto>(`${API.baseUrl}/users/${id}/roles`, payload); }
  updateStatus(id: string, payload: UpdateUserStatusDto): Observable<UserResponseDto> { return this.http.patch<UserResponseDto>(`${API.baseUrl}/users/${id}/status`, payload); }
  audit(id: string, limit = 10, offset = 0): Observable<AuditListResponseDto> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<AuditListResponseDto>(`${API.baseUrl}/users/${id}/audit`, { params });
  }

  // Admin-side create via public register endpoint (does not mutate auth tokens)
  create(payload: CreateUserDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${API.baseUrl}/auth/register`, payload);
  }
}
