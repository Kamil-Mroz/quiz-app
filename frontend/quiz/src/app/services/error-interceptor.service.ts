import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptorService implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private errorService: ErrorService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage =
            'Unable to connect to the server. Please check your internet connection or try again later.';
        } else if (error.status === 404) {
          errorMessage =
            error.error?.message || 'Requested resource not found!';
        } else if (error.status === 500) {
        }

        if (error.status === 401) {
          this.authService.logout();
          errorMessage = 'Session expired. Please log in again.';
          this.errorService.setErrorMessage(errorMessage);
        }
        if (error.status === 403) {
          if (
            error.error &&
            error.error.message &&
            error.error.message.includes('Invalid token')
          ) {
            this.authService.logout();
            errorMessage =
              'Session expired or token invalid. Please log in again.';
          }
          this.errorService.setErrorMessage(errorMessage);
        }

        console.error('HTTP Error:', error);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
