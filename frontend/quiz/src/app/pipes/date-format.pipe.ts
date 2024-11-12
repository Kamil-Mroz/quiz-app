import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(date: Date | string | number | boolean): string {
    if (date === null || date === undefined) {
      return '';
    }

    if (typeof date === 'string' && !isNaN(Date.parse(date))) {
      date = new Date(date);
    }

    if (date instanceof Date) {
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      return `${day.toString().padStart(2, '0')} ${months[month]} ${year}`;
    }

    return `${date}`;
  }
}
