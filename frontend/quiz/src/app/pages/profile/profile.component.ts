import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DecimalPipe } from '@angular/common';
import { SolvedQuiz } from '../../../model';
import { AchievementsComponent } from '../../components/achievements/achievements.component';
import { DomSanitizer } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DecimalPipe, AchievementsComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  protected IMAGE_URL = 'http://localhost:3000/images/';
  profileForm: FormGroup;
  profilePictureUrl: any;
  user:
    | {
        username: string;
        email: string;
        solvedQuizzes: SolvedQuiz[];
        profilePicture: string;
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
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.profileForm = this.fb.group({
      profileImage: [null, Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
      this.profileForm.patchValue({
        profileImage: this.selectedFile,
      });
    }
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user = data.user;
        this.stats = data.stats;
        this.achievements = data.achievements;
        this.loadProfilePicture(data.user.profilePicture);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  uploadImage() {
    if (this.profileForm.valid && this.selectedFile) {
      const { profileImage: image } = this.profileForm.getRawValue();

      const formData = new FormData();
      formData.append('file', image);

      this.authService.uploadImage(formData).subscribe({
        next: (data) => {
          alert(data.message);
        },
        error: (err) => {
          console.log(err.message);
        },
      });
      console.log(image);
      this.profileForm.reset();
      this.selectedFile = null;
    }
  }
  loadProfilePicture(profilePicture: string): void {
    this.authService.getProfilePicture(profilePicture).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.profilePictureUrl =
          this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        console.error('Failed to load profile picture:', err);
        this.errorMessage = 'Failed to load profile picture';
      },
    });
  }
}
