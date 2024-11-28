import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../model';
import { QuizService } from '../../services/quiz.service';
import { Router } from '@angular/router';
import { QuizListComponent } from '../../components/quiz-list/quiz-list.component';

@Component({
  selector: 'app-user-quizzes',
  standalone: true,
  imports: [QuizListComponent],
  templateUrl: './user-quizzes.component.html',
  styleUrl: './user-quizzes.component.css',
})
export class UserQuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  isLoading = true;
  errorMessage = '';
  isOwner = true;

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit() {
    this.loadOwnQuizzes();
  }

  loadOwnQuizzes() {
    this.quizService.getOwnQuiz().subscribe({
      next: (data) => {
        this.quizzes = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
  editQuiz(quizId: number) {
    this.router.navigate(['/quizzes', quizId, 'edit']);
  }
  addQuiz() {
    this.router.navigate(['/quizzes', 'add']);
  }

  deleteQuiz(quizId: number) {
    this.errorMessage = '';
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          this.quizzes = this.quizzes.filter((quiz) => quiz.id !== quizId);
        },
        error: (error) => {
          this.errorMessage = error.message;
        },
      });
    }
  }
}
