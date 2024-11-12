import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.css',
})
export class QuizListComponent {
  @Input() quizzes: any[] = [];
  @Input() isOwner: boolean = false;
  @Output() editQuiz = new EventEmitter<number>();
  @Output() deleteQuiz = new EventEmitter<number>();

  onEditQuiz(id: number) {
    this.editQuiz.emit(id);
  }

  onDeleteQuiz(id: number) {
    this.deleteQuiz.emit(id);
  }
}
