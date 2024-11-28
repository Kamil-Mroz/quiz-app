import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';
import { SolvedQuiz } from '../../model';

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

  getProfile(): Observable<{
    user: {
      username: string;
      email: string;
      solvedQuizzes: SolvedQuiz[];
      profilePicture: string;
    };
    stats: {
      totalQuizzesSolved: number;
      accuracy: number;
    };
    achievements: {
      name: string;
      description: string;
      url: string;
    }[];
  }> {
    return this.http
      .get<{
        user: {
          username: string;
          email: string;
          solvedQuizzes: SolvedQuiz[];
          profilePicture: string;
        };
        stats: {
          totalQuizzesSolved: number;
          accuracy: number;
        };
        achievements: {
          name: string;
          description: string;
          url: string;
        }[];
      }>(`${this.apiUrl}/profile`)
      .pipe(
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

  uploadImage(formData: FormData): Observable<{ message: string }> {
    const token = this.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/uploadImage`,
      formData,
      { headers }
    );
  }

  getProfilePicture(profilePicture: string) {
    const token = this.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });

    return this.http.get(`${this.apiUrl}/profilePicture/${profilePicture}`, {
      headers,
      responseType: 'blob',
    });
  }
}
