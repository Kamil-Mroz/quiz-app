import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../model';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, Location, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent implements OnInit {
  quiz: Quiz | null = null;
  quizId: number = -1;
  isLoading = false;
  errorMessage = '';

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.quizId = +params.get('id')!;
      this.fetchQuiz();
    });
  }

  fetchQuiz() {
    this.errorMessage = '';
    this.isLoading = true;
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (data: Quiz) => {
        this.quiz = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }
  goBack() {
    this.location.back();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}
