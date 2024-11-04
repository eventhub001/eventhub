import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {ITask} from '../../../interfaces';
import { CommonModule, formatDate } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  @Input() title: string  = '';
  @Input() tasks: ITask[] = [];
  @Output() callModalAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callDeleteAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  public authService: AuthService = inject(AuthService);

  public todayDate: Date;

  constructor() {
    // Asigna la fecha de hoy formateada a la variable todayDate
    this.todayDate = new Date();  }




}
