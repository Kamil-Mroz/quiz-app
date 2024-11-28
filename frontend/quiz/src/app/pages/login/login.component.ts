import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  constructor(
    private authService: AuthService,
    private router: Router,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.errorService.currentErrorMessage$.subscribe((message) => {
      if (message.includes('Please log in again')) {
        this.errorMessage = message;
      }
    });
  }

  login() {
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.value;

    if (!username || !password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.authService.login({ username, password }).subscribe({
      next: (data) => {
        this.authService.setToken(data.token);
        alert(data.message);
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
