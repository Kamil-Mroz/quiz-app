import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Question, Quiz } from '../../../model';
import { QuizService } from '../../services/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgFor, NgIf } from '@angular/common';
import { correctAnswerInChoicesValidator } from '../../validators/correct-answer-in-choices.validator';
import { choiceTypeValidator } from '../../validators/choice-type.validator';

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './edit-quiz.component.html',
  styleUrl: './edit-quiz.component.css',
})
export class EditQuizComponent implements OnInit {
  quizForm!: FormGroup;
  quizId: number | null = null;
  isLoading: boolean = false;
  isEditing: boolean = false;
  quiz: Quiz | null = null;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.params['id'];
    if (this.quizId) {
      this.isEditing = true;
      this.fetchQuiz(this.quizId);
    } else {
      this.isEditing = false;
      this.initializeForm();
    }
  }

  goBack() {
    this.location.back();
  }

  initializeForm(quiz?: Quiz) {
    this.quizForm = this.fb.group({
      title: [quiz?.title || '', [Validators.required]],
      description: [quiz?.description || '', [Validators.required]],
      category: [quiz?.category || '', [Validators.required]],
      timeToSolve: [
        quiz?.timeToSolve || '',
        [Validators.required, Validators.min(1)],
      ],
      questions: this.fb.array(
        quiz?.questions?.map((q) => this.createQuestion(q)) || [
          this.createQuestion(),
        ],
        [this.minQuestionsValidator]
      ),
    });
  }

  questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions()
      .at(questionIndex)
      .get('choices') as FormArray<FormGroup>;
  }

  createQuestion(
    question: Question = { id: 0, text: '', correctAnswer: '', type: 'text' }
  ): FormGroup {
    const questionGroup = this.fb.group(
      {
        text: [question.text, [Validators.required]],
        correctAnswer: [question.correctAnswer, [Validators.required]],
        type: [question.type, [Validators.required]],
        choices: this.fb.array(
          question.choices?.map((choice) =>
            this.createChoice(String(choice.choiceText))
          ) || [this.createChoice(''), this.createChoice('')]
        ),
      },
      {
        validators: correctAnswerInChoicesValidator(),
      }
    );

    this.updateChoiceValidators(questionGroup);

    return questionGroup;
  }

  updateChoiceValidators(questionGroup: FormGroup) {
    const questionType = questionGroup.get('type')?.value;
    const choices = questionGroup.get('choices') as FormArray;

    choices.controls.forEach((control: AbstractControl, index: number) => {
      const choiceControl = control as FormGroup;
      const choiceText = choiceControl.get('choiceText');
      if (choiceText) {
        choiceText.setValidators([choiceTypeValidator(questionType)]);
        choiceText.updateValueAndValidity();
      }
    });
  }

  onTypeChange(questionIndex: number) {
    const questionGroup = this.questions().at(questionIndex) as FormGroup;

    this.updateChoiceValidators(questionGroup);

    questionGroup.updateValueAndValidity();
  }

  createChoice(choiceText: string = ''): FormGroup {
    return this.fb.group({
      choiceText: [choiceText, [Validators.required]],
    });
  }

  minQuestionsValidator(control: AbstractControl): ValidationErrors | null {
    const questionsArray = control as FormArray;
    return questionsArray.length < 1
      ? { minQuestions: 'A quiz must have at least one question' }
      : null;
  }

  addQuestion() {
    const questions = this.quizForm.get('questions') as FormArray;
    const newQuestion = this.createQuestion();

    newQuestion.setValidators(correctAnswerInChoicesValidator());
    questions.push(newQuestion);
  }

  addChoice(questionId: number) {
    const questions = this.quizForm.get('questions') as FormArray;
    const question = questions.at(questionId);
    const choices = question.get('choices') as FormArray;
    const questionType = question.get('type')?.value;

    if (questionType !== 'boolean' || choices.length < 2) {
      choices.push(this.createChoice());
    }

    const newChoice = choices.at(choices.length - 1);
    const choiceControl = newChoice.get('choiceText');

    choiceControl?.clearValidators();
    choiceControl?.setValidators([choiceTypeValidator(questionType)]);

    choiceControl?.updateValueAndValidity();
  }

  removeQuestion(index: number) {
    const questions = this.quizForm.get('questions') as FormArray;

    if (questions.length > 1) {
      questions.removeAt(index);
    }
  }

  removeChoice(questionIndex: number, choiceIndex: number) {
    const choices = this.getChoices(questionIndex);

    if (choices.length > 1) {
      choices.removeAt(choiceIndex);
    }
  }

  fetchQuiz(quizId: number) {
    this.isLoading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (data) => {
        this.quiz = data;
        this.formatQuizDates(data);

        this.initializeForm(this.quiz);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  onSubmit() {
    if (this.quizForm.invalid) return;

    const quiz: Quiz = this.quizForm.value;

    quiz.questions.forEach((question) => {
      if (question.type === 'date') {
        const correctAnswerDate = this.convertDateStringToDate(
          question.correctAnswer as string
        );
        if (correctAnswerDate) {
          question.correctAnswer = correctAnswerDate;
        }

        question.choices?.forEach(
          (choice: { choiceText: string | number | boolean | Date }) => {
            const choiceDate: Date | null = this.convertDateStringToDate(
              choice.choiceText as string
            );
            if (choiceDate) {
              choice.choiceText = choiceDate;
            }
          }
        );
      } else if (question.type === 'numeric') {
        question.correctAnswer = Number(question.correctAnswer);

        question.choices?.forEach(
          (choice: { choiceText: string | number | boolean | Date }) => {
            choice.choiceText = Number(choice.choiceText);
          }
        );
      } else if (question.type === 'boolean') {
        if (typeof question.correctAnswer === 'string') {
          question.correctAnswer =
            question.correctAnswer.toLocaleLowerCase() === 'true';
        }
        if (question.choices) {
          question.choices[0].choiceText = false;
          question.choices[1].choiceText = true;
        }
      }
    });

    if (this.isEditing && this.quizId !== null) {
      this.updateQuiz(quiz);
    } else {
      this.createQuiz(quiz);
    }
  }

  convertDateStringToDate(dateString: string): Date | null {
    const pattern = /^\d{2}-\d{2}-\d{4}$/;
    if (pattern.test(dateString)) {
      let parsedDate: Date | null = null;
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        parsedDate = new Date(`${year}-${month}-${day}`);
      }
      return parsedDate;
    }
    return null;
  }

  updateQuiz(quiz: Quiz) {
    if (this.quizId === null) return;
    this.isLoading = true;
    this.quizService.updateQuiz(this.quizId, quiz).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.router.navigate(['/quizzes/own']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  createQuiz(quiz: Quiz) {
    this.isLoading = true;
    this.quizService.createQuiz(quiz).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.router.navigate(['/quizzes/own']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

  formatQuizDates(quiz: Quiz) {
    quiz.questions.forEach((question) => {
      if (question.type === 'date') {
        if (typeof question.correctAnswer === 'string') {
          question.correctAnswer = this.formatDateToDDMMYYYY(
            new Date(question.correctAnswer)
          );
        } else if (question.correctAnswer instanceof Date) {
          question.correctAnswer = this.formatDateToDDMMYYYY(
            question.correctAnswer
          );
        }

        question.choices?.forEach(
          (choice: { choiceText: string | number | boolean | Date }) => {
            if (typeof choice.choiceText === 'string') {
              choice.choiceText = this.formatDateToDDMMYYYY(
                new Date(choice.choiceText)
              );
            } else if (choice.choiceText instanceof Date) {
              choice.choiceText = this.formatDateToDDMMYYYY(choice.choiceText);
            }
          }
        );
      }
    });
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
