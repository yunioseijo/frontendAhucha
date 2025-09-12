import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../../config/api.config';
import {
  CreateUserDto,
  LoginResponseDto,
  LoginUserDto,
  OkResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterResponseDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  TwoFactorCodeDto,
  VerifyEmailDto,
  UserResponseDto,
} from '@shared/api/types.gen';
import { tap } from 'rxjs/operators';
import { Observable, map, of, throwError } from 'rxjs';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private accessTokenSig = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  private refreshTokenSig = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  private currentUserSig = signal<UserResponseDto | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessTokenSig());
  readonly user = computed(() => this.currentUserSig());
  readonly roles = computed(() => this.currentUserSig()?.roles ?? []);

  get accessToken(): string | null { return this.accessTokenSig(); }
  get refreshToken(): string | null { return this.refreshTokenSig(); }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessTokenSig.set(accessToken);
    this.refreshTokenSig.set(refreshToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens() {
    this.accessTokenSig.set(null);
    this.refreshTokenSig.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  loadMe(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${API.baseUrl}/users/me`).pipe(
      tap((u) => this.currentUserSig.set(u))
    );
  }

  register(payload: CreateUserDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${API.baseUrl}/auth/register`, payload).pipe(
      tap((res) => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  login(payload: LoginUserDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${API.baseUrl}/auth/login`, payload).pipe(
      tap((res) => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  checkStatus(): Observable<void> {
    return this.http.get(`${API.baseUrl}/auth/check-status`).pipe(
      map(() => void 0)
    );
  }

  refresh(): Observable<RefreshResponseDto> {
    const refreshToken = this.refreshTokenSig();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    return this.http.post<RefreshResponseDto>(`${API.baseUrl}/auth/refresh`, { refreshToken } satisfies RefreshRequestDto).pipe(
      tap((res) => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  logoutCurrent(refreshToken?: string): Observable<OkResponseDto> {
    const token = refreshToken ?? this.refreshTokenSig();
    if (!token) {
      this.clearTokens();
      return of({ ok: true });
    }
    return this.http.post<OkResponseDto>(`${API.baseUrl}/auth/logout`, { refreshToken: token } satisfies RefreshRequestDto).pipe(
      tap(() => this.clearTokens())
    );
  }

  logoutAll(): Observable<OkResponseDto> {
    return this.http.post<OkResponseDto>(`${API.baseUrl}/auth/logout-all`, {}).pipe(
      tap(() => this.clearTokens())
    );
  }

  sendEmailVerification(): Observable<OkResponseDto> {
    return this.http.post<OkResponseDto>(`${API.baseUrl}/auth/email/send-verification`, {});
  }

  verifyEmail(payload: VerifyEmailDto): Observable<unknown> {
    return this.http.post(`${API.baseUrl}/auth/email/verify`, payload);
  }

  requestPasswordReset(payload: RequestPasswordResetDto): Observable<OkResponseDto> {
    return this.http.post<OkResponseDto>(`${API.baseUrl}/auth/password/request-reset`, payload);
  }

  resetPassword(payload: ResetPasswordDto): Observable<unknown> {
    return this.http.post(`${API.baseUrl}/auth/password/reset`, payload);
  }

  setup2FA(): Observable<unknown> { return this.http.post(`${API.baseUrl}/auth/2fa/setup`, {}); }
  enable2FA(payload: TwoFactorCodeDto): Observable<unknown> { return this.http.post(`${API.baseUrl}/auth/2fa/enable`, payload); }
  disable2FA(payload: TwoFactorCodeDto): Observable<unknown> { return this.http.post(`${API.baseUrl}/auth/2fa/disable`, payload); }
}
