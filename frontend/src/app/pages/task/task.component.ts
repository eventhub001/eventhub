import { Component, inject, ViewChild } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ITask } from '../../interfaces';
import { TaskListComponent } from '../../components/task/task-list/task-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { TaskFormComponent } from '../../components/task/task-form/task-form.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [

    TaskListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    TaskFormComponent
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {

  public taskService: TaskService = inject(TaskService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addTaskModal') public addTaskModal: any;
  public fb: FormBuilder = inject(FormBuilder);

  taskForm = this.fb.group({
    id: [''],
    taskName: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: ['', Validators.required],
    event: ['', Validators.required],
  })

constructor() {
  this.taskService.search.page = 1;
  this.taskService.getAll();
}

saveTask(task: ITask) {
  console.log(task)
  this.taskService.save(task);
  this.modalService.closeAll();
}

callEdition(task: ITask) {
  this.taskForm.controls['id'].setValue(task.id ? JSON.stringify(task.id)  : '');
  this.taskForm.controls['taskName'].setValue(task.taskName ? task.taskName : '');
  this.taskForm.controls['description'].setValue(task.description ? task.description : '');
  this.taskForm.controls['dueDate'].setValue(task.dueDate ? JSON.stringify(task.dueDate) : '');
  this.taskForm.controls['priority'].setValue(task.priority ? task.priority : '');
  this.taskForm.controls['event'].setValue(task.event ? JSON.stringify(task.event.eventId) : '');
  this.modalService.displayModal('md', this.addTaskModal);
}

updateTask(task: ITask) {

  this.taskService.update(task);
  this.modalService.closeAll();
}

callModalAction() {
  this.taskForm.reset();
  this.modalService.displayModal('md', this.addTaskModal)
}
}
