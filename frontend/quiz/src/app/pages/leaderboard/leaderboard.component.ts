import {Component, OnInit} from '@angular/core';
import {QuizService} from "../../services/quiz.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  topUsers:{username: string,totalSolvedQuizzes: number}[]=[];
  isLoading:boolean = false;
  errorMessage:string = '';

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit() {
    this.isLoading = true;
    this.quizService.getTopUsers().subscribe({
      next: (data) => {
        this.topUsers = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
