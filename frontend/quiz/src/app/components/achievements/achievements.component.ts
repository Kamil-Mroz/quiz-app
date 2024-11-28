import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.css',
})
export class AchievementsComponent {
  @Input() IMAGE_URL: string = '';
  @Input() achievements: {
    name: string;
    description: string;
    url: string;
  }[] = [];
}
