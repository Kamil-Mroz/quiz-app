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
    let message:string | undefined ;

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
            if (typeof correctAnswer === 'string') {
              const containsBoolean = correctAnswer.toLowerCase() === "true" || correctAnswer.toLocaleLowerCase() === "false";
              if(!containsBoolean) {
                message = "Correct answer must be True or False"
              }
              return containsBoolean
            }
            const containsBoolean = correctAnswer === false || correctAnswer === true;
            if(!containsBoolean) {
              message = "Correct answer must be True or False"
            }
            return containsBoolean;
          } else {
            return choice.choiceText == correctAnswer;
          }
        }
      );
      return isValid
        ? null
        : {
            correctAnswerNotInChoices: message ??
              'Correct answer must be one of the choices',
          };
    }

    return null;
  };
}
