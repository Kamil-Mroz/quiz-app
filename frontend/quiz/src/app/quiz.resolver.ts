import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { QuizService } from './services/quiz.service';
import { Quiz } from '../model';
import { catchError, map, of } from 'rxjs';

export const quizResolver: ResolveFn<Quiz | null> = (route, state) => {
  const quizService = inject(QuizService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/']);
    return of(null);
  }

  return quizService.getQuizById(+id).pipe(
    map((data) => {
      if (data) {
        return data;
      } else {
        router.navigate(['/']);
        return null;
      }
    }),
    catchError((error) => {
      console.error('Quiz not found', error);
      router.navigate(['/']);
      return of(null);
    })
  );
};
