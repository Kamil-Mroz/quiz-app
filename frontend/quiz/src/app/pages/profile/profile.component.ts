import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe} from '@angular/common';
import { SolvedQuiz } from '../../../model';
import { AchievementsComponent } from "../../components/achievements/achievements.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DecimalPipe, AchievementsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  protected IMAGE_URL = 'http://localhost:3000/images/';
  user:
    | {
        username: string;
        email: string;
        solvedQuizzes: SolvedQuiz[];
      }
    | undefined;
  stats:
    | {
        totalQuizzesSolved: number;
        accuracy: number;
      }
    | undefined;

  achievements:
    | {
        name: string;
        description: string;
        url: string;
      }[]
    | undefined;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user = data.user;
        this.stats = data.stats;
        this.achievements = data.achievements;
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
