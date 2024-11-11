import { Component, Input } from '@angular/core';
import { ITask } from '../../../interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent {
  @Input() task: ITask | undefined;

  constructor() {}

  asDate(dateString: string | Date): string | null {
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'MM/dd/yyyy');
  }
}
