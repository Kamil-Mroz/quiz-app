import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DecimalPipe, NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: any;
  stats: any;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user = data.user;
        this.stats = data.stats;
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
