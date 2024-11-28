import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [ReactiveFormsModule],
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private apiUrl = 'localhost:3000/login';
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  errorMessage = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/),
      ],
    ],
  });

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.http.post(this.apiUrl, { user: this.form.getRawValue() });
  }

  register() {
    if (this.form.invalid) {
      return;
    }

    const { username, email, password } = this.form.value;

    if (!username || !email || !password) {
      this.errorMessage = 'All fields are required';
      return;
    }

    const userData = { username, email, password };

    this.authService.register(userData).subscribe({
      next: (data) => {
        alert(data.message);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }
}
