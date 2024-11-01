import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {ITask } from '../../../interfaces';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  @Input() title: string  = '';
  @Input() tasks: ITask[] = [];
  @Output() callModalAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callDeleteAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  public authService: AuthService = inject(AuthService);

  formatDate(dateString: string): string {
    return formatDate(dateString, 'MM-dd-yyyy', 'en-US');
  }


}
