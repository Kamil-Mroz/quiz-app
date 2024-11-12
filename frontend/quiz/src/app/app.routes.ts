import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { UserQuizzesComponent } from './pages/user-quizzes/user-quizzes.component';
import { quizResolver } from './quiz.resolver';
import { loggedInGuard } from './logged-in.guard';
import { EditQuizComponent } from './pages/edit-quiz/edit-quiz.component';
import { QuizSolveComponent } from './pages/quiz-solve/quiz-solve.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'quizzes/own',
    component: UserQuizzesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/add',
    component: EditQuizComponent,
    canActivate: [authGuard],
  },
  {
    path: 'quizzes/:id/edit',
    component: EditQuizComponent,
    canActivate: [authGuard],
    resolve: { quiz: quizResolver },
  },
  {
    path: 'quizzes/:id/solve',
    component: QuizSolveComponent,
    canActivate: [authGuard],
    resolve: { quiz: quizResolver },
  },
  {
    path: 'quizzes/:id',
    component: QuizComponent,
    resolve: { quiz: quizResolver },
  },

  { path: 'login', component: LoginComponent, canActivate: [loggedInGuard] },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [loggedInGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
