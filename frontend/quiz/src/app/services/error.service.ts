import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private errorMessageSource = new BehaviorSubject<string>('');
  currentErrorMessage$ = this.errorMessageSource.asObservable();

  constructor() {}

  setErrorMessage(message: string): void {
    this.errorMessageSource.next(message);
  }
  clearErrorMessage(): void {
    this.errorMessageSource.next('');
  }
}
