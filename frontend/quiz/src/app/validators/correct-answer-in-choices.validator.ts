import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function correctAnswerInChoicesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const questionGroup = control as FormGroup;
    const correctAnswer = questionGroup.get('correctAnswer')?.value;
    const choices = questionGroup.get('choices')?.value;
    const questionType = questionGroup.get('type')?.value;

    if (
      Array.isArray(choices) &&
      correctAnswer !== undefined &&
      correctAnswer !== null
    ) {
      const isValid = choices.some(
        (choice: { choiceText: number | boolean | string }) => {
          if (
            questionType === 'text' &&
            typeof choice.choiceText === 'string' &&
            typeof correctAnswer === 'string'
          ) {
            return (
              choice.choiceText.toLowerCase() === correctAnswer.toLowerCase()
            );
          } else if (questionType === 'boolean') {
            if (typeof choice.choiceText === typeof correctAnswer) {
              return choice.choiceText === correctAnswer;
            } else if (typeof choice.choiceText === 'string') {
              return choice.choiceText.toLowerCase() === 'true'
                ? true === correctAnswer
                : false === correctAnswer;
            } else {
              return correctAnswer.toLowerCase() === 'true'
                ? true === choice.choiceText
                : false === choice.choiceText;
            }
          } else {
            return choice.choiceText == correctAnswer;
          }
        }
      );
      return isValid
        ? null
        : {
            correctAnswerNotInChoices:
              'Correct answer must be one of the choices',
          };
    }

    return null;
  };
}
