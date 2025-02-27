import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);

  let modifiedReq = req;

  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.code === 'token_not_valid') {
        // Clear tokens from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Redirect user to login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
