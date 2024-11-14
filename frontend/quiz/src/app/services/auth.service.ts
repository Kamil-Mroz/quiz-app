import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  router = inject(Router);
  constructor(private http: HttpClient) {}

  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError((error) => {
          const errorMessage = error?.message || 'Register failed';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  login(userData: {
    username: string;
    password: string;
  }): Observable<{ token: string; message: string }> {
    return this.http
      .post<{ token: string; message: string }>(
        `${this.apiUrl}/login`,
        userData
      )
      .pipe(
        catchError((error) => {
          const errorMessage = error?.message || 'Login failed';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      catchError((error) => {
        const errorMessage = error?.message || 'Failed to fetch user profile';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  setToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }
  clear(): void {
    sessionStorage.removeItem('authToken');
  }

  logout(): void {
    this.clear();
    this.router.navigate(['login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
