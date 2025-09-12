import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, filter, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshInProgress = false;
const refreshSubject = new Subject<boolean>();
let redirectingToLogin = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.accessToken;
  // Do NOT attach Authorization to auth endpoints like login/register/refresh
  const excludeAuthHeader = /\/auth\/(login|register|refresh)/.test(req.url);
  const withAuth = !excludeAuthHeader && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(withAuth).pipe(
    catchError((error: unknown) => {
      const err = error as HttpErrorResponse;
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // Do not try refresh for auth endpoints (e.g., login failed with 401)
      if (/\/auth\//.test(req.url)) {
        return throwError(() => err);
      }

      // already trying to refresh: wait for it
      if (refreshInProgress) {
        return refreshSubject.pipe(
          take(1),
          switchMap((ok) => {
            if (!ok) return throwError(() => err);
            const newToken = auth.accessToken;
            const retried = newToken ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }) : req;
            return next(retried);
          })
        );
      }

      // start refresh flow
      refreshInProgress = true;
      return auth.refresh().pipe(
        tap({
          next: () => {
            refreshInProgress = false;
            refreshSubject.next(true);
          },
          error: () => {
            refreshInProgress = false;
            refreshSubject.next(false);
            auth.clearTokens();
            // Ensure single redirect to login after auth loss
            if (!redirectingToLogin) {
              redirectingToLogin = true;
              // Defer navigation to avoid interfering with the interceptor chain
              setTimeout(() => {
                // Avoid redirect loops if already under /auth
                const url = router.url || '';
                if (!url.startsWith('/auth')) {
                  router.navigate(['/auth/login']).finally(() => {
                    redirectingToLogin = false;
                  });
                } else {
                  redirectingToLogin = false;
                }
              }, 0);
            }
          }
        }),
        switchMap(() => {
          const newToken = auth.accessToken;
          const retried = newToken ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }) : req;
          return next(retried);
        }),
        catchError((e) => throwError(() => e))
      );
    })
  );
};
