import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../model';
import { HttpClientModule } from '@angular/common/http';
import { QuizService } from '../../services/quiz.service';
import { FormsModule } from '@angular/forms';
import { QuizListComponent } from '../../components/quiz-list/quiz-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ HttpClientModule, FormsModule, QuizListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  quizzes: Quiz[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  sortBy:string = ''

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadQuizzes();
  }

  loadCategories() {
    this.isLoading = true;

    this.quizService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  onSearchChange() {
    this.loadQuizzes();
  }
  onSortChange(){
    this.loadQuizzes()
  }

  onCategoryChange() {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.isLoading = true;
    this.errorMessage = '';
    this.quizService
      .getQuizzes(this.selectedCategory, this.searchQuery, this.sortBy)
      .subscribe({
        next: (data) => {
          this.quizzes = data;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        },
      });
  }
}
