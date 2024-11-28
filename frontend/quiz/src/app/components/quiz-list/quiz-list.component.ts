import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Quiz } from '../../../model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.css',
})
export class QuizListComponent {
  @Input() quizzes: Quiz[] = [];
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
