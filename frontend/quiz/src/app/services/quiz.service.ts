import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Quiz } from '../../model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private apiUrl = 'http://localhost:3000/quizzes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getQuizzes(
    category?: string,
    search?: string,
    sortBy?: string
  ): Observable<Quiz[]> {
    let params = new HttpParams();

    if (category) {
      params = params.set('category', category);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<Quiz[]>(this.apiUrl, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${quizId}`);
  }
  getOwnQuiz(): Observable<Quiz[]> {
    const token = this.authService.getToken();
    if (!token) return of([]);

    const headers = new HttpHeaders({
      authorization: token,
    });
    return this.http.get<Quiz[]>(`${this.apiUrl}/own`, { headers });
  }
  deleteQuiz(quizId: number): Observable<void> {
    const token = this.authService.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });
    return this.http.delete<void>(`${this.apiUrl}/${quizId}`, { headers });
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    const token = this.authService.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });

    return this.http.post<Quiz>(`${this.apiUrl}`, quiz, { headers });
  }
  updateQuiz(id: number, quiz: Quiz): Observable<Quiz> {
    const token = this.authService.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });

    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz, { headers });
  }

  submitQuizAttempt(
    quizId: number,
    answers: (string | number | boolean | Date)[]
  ): Observable<{
    score: number;
    accuracy: number;
    achievementUnlocked: boolean;
  }> {
    const token = this.authService.getToken();
    if (!token) return of();
    const headers = new HttpHeaders({
      authorization: token,
    });
    return this.http.post<{
      score: number;
      accuracy: number;
      achievementUnlocked: boolean;
    }>(`${this.apiUrl}/${quizId}/attempt`, { answers }, { headers });
  }

  getTopUsers(): Observable<
    { username: string; totalSolvedQuizzes: number }[]
  > {
    return this.http.get<{ username: string; totalSolvedQuizzes: number }[]>(
      'http://localhost:3000/leaderboard'
    );
  }

  getAllQuizTitles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/all-questions`);
  }
}
