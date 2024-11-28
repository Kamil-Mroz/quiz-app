import { Component, OnDestroy, OnInit } from '@angular/core';
import { Quiz } from '../../../model';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-solve',
  standalone: true,
  imports: [DateFormatPipe, FormsModule, RouterLink],
  templateUrl: './quiz-solve.component.html',
  styleUrl: './quiz-solve.component.css',
})
export class QuizSolveComponent implements OnInit, OnDestroy {
  quiz!: Quiz | null;
  answers: (string | number | boolean | Date)[] = [];
  score: number | undefined;
  accuracy: number | undefined;
  errorMessage = '';
  isLoading: boolean = false;
  timeRemaining: number = 0;
  timerInterval: any;
  achievementUnlocked?: boolean;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));

    this.isLoading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (data) => {
        this.quiz = data;
        this.answers = Array(this.quiz.questions.length).fill(null);
        this.timeRemaining = this.quiz.timeToSolve * 60;
        this.startTimer();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        clearInterval(this.timerInterval);
        this.submitQuiz();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  goBack() {
    this.location.back();
  }

  setAnswer(
    questionIndex: number,
    answer: string | number | boolean | Date
  ): void {
    if (answer) {
      this.answers[questionIndex] = answer;
    }
  }

  canSubmit(): boolean {
    return this.answers.every((ans) => ans !== null);
  }

  submitQuiz(): void {
    if (this.quiz) {
      clearInterval(this.timerInterval);

      this.quizService.submitQuizAttempt(this.quiz.id, this.answers).subscribe({
        next: (data) => {
          this.score = data.score;
          this.accuracy = data.accuracy;
          this.achievementUnlocked = data.achievementUnlocked;
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
