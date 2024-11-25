import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function uniqueTitleValidator(
  existingTitles: string[],
  editQuizTitle?: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    if (
      editQuizTitle &&
      editQuizTitle.toLowerCase() === control.value.trim().toLocaleLowerCase()
    ) {
      return null;
    }
    const isDuplicate = existingTitles.includes(
      control.value.trim().toLowerCase()
    );
    return isDuplicate ? { uniqueTitle: true } : null;
  };
}
