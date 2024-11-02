import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { EventsService } from '../../../services/event.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ITask } from '../../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  public eventsService: EventsService = inject(EventsService);

  constructor() {
    this.eventsService.search.page = 1;
    this.eventsService.getAll();
  }

  events = computed(() => this.eventsService.events$());

  @Input() taskForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callUpdateMethod: EventEmitter<ITask> = new EventEmitter<ITask>();


  callSave() {

    let selectedEventId: number = this.taskForm.controls['event'].value;

    let task: ITask = {
      taskName: this.taskForm.controls['taskName'].value,
      description: this.taskForm.controls['description'].value,
      dueDate: this.taskForm.controls['dueDate'].value,
      priority: this.taskForm.controls['priority'].value,
      event:  { eventId: selectedEventId }
    }



    if(this.taskForm.controls['id'].value) {
      task.id = this.taskForm.controls['id'].value;
    }
    if(task.id) {
      this.callUpdateMethod.emit(task);
    } else {
     this.callSaveMethod.emit(task);
    }
  }


  priorities = [
    { id: 1, name: 'Alta' },
    { id: 2, name: 'Media' },
    { id: 3, name: 'Baja' }
  ];


}
