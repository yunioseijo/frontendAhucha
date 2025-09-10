import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { toast } from 'ngx-sonner';

let lastNetworkToastAt = 0;

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    // Evitar que solicitudes queden colgadas indefinidamente
    timeout(8000),
    catchError((error: unknown) => {
      // RxJS TimeoutError no es HttpErrorResponse
      if (error instanceof TimeoutError) {
        toast.error('No se ha podido establecer conexión con el servidor');
        return throwError(() => error);
      }
      const err = error as HttpErrorResponse;

      // Network/connection error (backend caído, CORS, DNS, etc.)
      const isNetworkError = err instanceof HttpErrorResponse && err.status === 0;
      const now = Date.now();
      if (isNetworkError && now - lastNetworkToastAt > 5000) {
        lastNetworkToastAt = now;
        toast.error('No se ha podido establecer conexión con el servidor');
      }

      // Opcional: errores 5xx
      if (!isNetworkError && err.status >= 500) {
        toast.error('Error del servidor. Inténtalo más tarde');
      }

      return throwError(() => err);
    })
  );
};
