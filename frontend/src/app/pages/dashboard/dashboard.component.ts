import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CalendarioEventosComponent } from '../../components/calendario-eventos/calendario-eventos.component';
import { EventsService } from '../../services/event.service';
import { TaskService } from '../../services/task.service';
import { IEvent, ITask } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../services/modal.service';
import { TaskDetailsComponent } from "../../components/task/task-details/task-details.component";
import { EventcarddetailsComponent } from '../../components/eventcards/eventcard-details/eventcarddetails.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CalendarioEventosComponent, EventcarddetailsComponent, CommonModule, ModalComponent, TaskDetailsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  eventService: EventsService = inject(EventsService);
  taskService: TaskService = inject(TaskService);
  eventSelected: IEvent | undefined = undefined;
  modalService: ModalService = inject(ModalService);
  taskSelected: ITask | undefined = undefined;
  @ViewChild('showEventModal') showEventModal: any;
  @ViewChild('showTaskModal') showTaskModal: any;

  constructor() {

  }

  saveEvent(event: IEvent) {
    console.log("saving event!", event);
    this.eventService.save(event);
  }

  saveTask(task: ITask) {
    console.log("saving task!", task);
    this.taskService.save(task);
  }

  showEventDetails(event: IEvent) {
    this.eventSelected = event;
    this.modalService.displayModal('md', this.showEventModal);
  }

  showtaskDetails(task: ITask) {
    this.taskSelected = task;
    this.modalService.displayModal('md', this.showTaskModal);
  }

  ngOnInit(){
   this.eventService.search.size = 1000;
   this.eventService.getAll();
   this.taskService.getAll();
  }
}
