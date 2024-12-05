import { Component, inject, ViewChild } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { IEventTaskTemplate, ITask } from '../../interfaces';
import { TaskListComponent } from '../../components/task/task-list/task-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { TaskFormComponent } from '../../components/task/task-form/task-form.component';
import { EventsService } from '../../services/event.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EventFormService } from '../../services/evenform.service';
import { TaskTemplateService } from '../../services/tasktemplate.service';
import { EventTaskTemplateService } from '../../services/eventtasktemplate.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [

    TaskListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    TaskFormComponent,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {

  public taskService: TaskService = inject(TaskService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  public eventFormService: EventFormService= inject(EventFormService);
  public eventService: EventsService = inject(EventsService);
  public taskTemplateService: TaskTemplateService = inject(TaskTemplateService);
  public eventTaskTemplateService: EventTaskTemplateService = inject(EventTaskTemplateService);
  @ViewChild('addTaskModal') public addTaskModal: any;
  public fb: FormBuilder = inject(FormBuilder);

  taskForm = this.fb.group({
    id: [''],
    taskName: ['', Validators.required],
    description: ['', Validators.required],
    status: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: ['', Validators.required],
    event: ['', Validators.required],
  })

constructor() {
  this.taskTemplateService.getAll();
  this.eventFormService.getAll();
  this.eventService.search.size = 1000;
  const eventId = this.eventService.getEventId();
  if (eventId !== null) {
    this.taskService.getAllByEventId(eventId);
  } else {
    console.error('Event ID is null');
  }
}

saveTask(task: ITask) {
  console.log(task)
  this.taskService.save(task);
  this.modalService.closeAll();
}

saveEventTaskTemplate(taskTemplate: IEventTaskTemplate) {
  console.log("saving task template event in database", taskTemplate);
  this.eventTaskTemplateService.save(taskTemplate);
}

callEdition(task: ITask) {
  this.taskForm.controls['id'].setValue(task.id ? JSON.stringify(task.id)  : '');
  this.taskForm.controls['taskName'].setValue(task.taskName ? task.taskName : '');
  this.taskForm.controls['description'].setValue(task.description ? task.description : '');
  this.taskForm.controls['status'].setValue(task.status ? task.status : '');
  this.taskForm.controls['dueDate'].setValue(task.dueDate ?  new Date(task.dueDate).toISOString().substring(0, 10) : '');
  this.taskForm.controls['priority'].setValue(task.priority ? task.priority : '');
  this.taskForm.controls['event'].setValue(task.event ? JSON.stringify(task.event.eventId) : '');
  this.modalService.displayModal('md', this.addTaskModal);
}

updateTask(task: ITask) {
console.log(task)
if (task.dueDate) {
  const dueDate = new Date(task.dueDate);
 const adjustedDate = new Date(dueDate.getTime() + (6 * 60 * 60 * 1000)); // Añadir 6 horas
 task.dueDate = adjustedDate;
}
  this.taskService.update(task);
  this.modalService.closeAll();
}

callModalAction() {
  this.taskForm.reset();
  this.modalService.displayModal('md', this.addTaskModal)
}


















}
