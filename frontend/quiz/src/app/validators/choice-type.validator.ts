import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function choiceTypeValidator(questionType: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const choiceText = control.value?.trim();

    if (!choiceText) {
      return null;
    }

    if (questionType === 'numeric') {
      const isNumeric = !isNaN(choiceText);
      return isNumeric
        ? null
        : { invalidNumber: { message: 'Choice must be a number' } };
    }

    if (questionType === 'date') {
      const pattern = /^\d{2}-\d{2}-\d{4}$/;

      const isValid = pattern.test(choiceText);

      if (isValid) {
        const [day, month, year] = choiceText.split('-');

        const dayInt = parseInt(day, 10);
        const monthInt = parseInt(month, 10);
        const yearInt = parseInt(year, 10);

        if (dayInt < 1 || dayInt > 31) {
          return {
            invalidDate: {
              message: 'Invalid day. Day must be between 01 and 31.',
            },
          };
        }

        if (monthInt < 1 || monthInt > 12) {
          return {
            invalidDate: {
              message: 'Invalid month. Month must be between 01 and 12.',
            },
          };
        }

        if (yearInt < 1000 || yearInt > 9999) {
          return {
            invalidDate: {
              message: 'Invalid year. Year must be between 1000 and 9999.',
            },
          };
        }

        const date = new Date(
          `${yearInt}-${monthInt.toString().padStart(2, '0')}-${dayInt
            .toString()
            .padStart(2, '0')}`
        );

        if (
          date.getDate() !== dayInt ||
          date.getMonth() + 1 !== monthInt ||
          date.getFullYear() !== yearInt
        ) {
          return {
            invalidDate: {
              message: 'Invalid day, month, or year in the date.',
            },
          };
        }
      } else {
        return {
          invalidDateFormat: {
            message:
              'Invalid date format. The date must be in dd-mm-yyyy format.',
          },
        };
      }
    }

    if (questionType === 'boolean') {
      if (
        choiceText.toLowerCase() === 'true' ||
        choiceText.toLowerCase() === 'false'
      ) {
        return null;
      }
      return { invalidBoolean: { message: 'Choice must be true or false.' } };
    }

    return null;
  };
}
