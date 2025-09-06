import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, Subject, catchError, filter, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshInProgress = false;
const refreshSubject = new Subject<boolean>();

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  const token = auth.accessToken;
  const withAuth = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withAuth).pipe(
    catchError((error: unknown) => {
      const err = error as HttpErrorResponse;
      if (err.status !== 401) {
        return throwError(() => err);
      }

      // already trying to refresh: wait for it
      if (refreshInProgress) {
        return refreshSubject.pipe(
          filter(Boolean),
          take(1),
          switchMap(() => {
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
