import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';

let lastNetworkToastAt = 0;

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const dialog = inject(MatDialog);
  return next(req).pipe(
    // Evitar que solicitudes queden colgadas indefinidamente
    timeout(8000),
    catchError((error: unknown) => {
      // RxJS TimeoutError no es HttpErrorResponse
      if (error instanceof TimeoutError) {
        dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Sin conexión',
            message:
              'No se ha podido establecer conexión con el servidor',
            confirmText: 'Cerrar',
            cancelText: 'Cancelar',
            variant: 'warning',
            icon: 'signal_wifi_connected_no_internet_4',
          },
        });
        return throwError(() => error);
      }
      const err = error as HttpErrorResponse;

      // Network/connection error (backend caído, CORS, DNS, etc.)
      const isNetworkError =
        err instanceof HttpErrorResponse && err.status === 0;
      const now = Date.now();
      if (isNetworkError && now - lastNetworkToastAt > 5000) {
        lastNetworkToastAt = now;
        dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Sin conexión',
            message:
              'No se ha podido establecer conexión con el servidor',
            confirmText: 'Cerrar',
            cancelText: 'Cancelar',
            variant: 'warning',
            icon: 'signal_wifi_connected_no_internet_4',
          },
        });
      }

      // Opcional: errores 5xx
      if (!isNetworkError && err.status >= 500) {
        dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error del servidor',
            message: 'Error del servidor. Inténtalo más tarde',
            confirmText: 'Cerrar',
            cancelText: 'Cancelar',
            variant: 'danger',
            icon: 'error',
          },
        });
      }

      return throwError(() => err);
    })
  );
};
