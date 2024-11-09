import { Component, inject, ViewChild } from '@angular/core';
import { CalendarioEventosComponent } from '../../components/calendario-eventos/calendario-eventos.component';
import { EventsService } from '../../services/event.service';
import { TaskService } from '../../services/task.service';
import { IEvent } from '../../interfaces';
import { EventcarddetailsComponent } from "../../components/eventcards/eventcarddetails/eventcarddetails.component";
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CalendarioEventosComponent, EventcarddetailsComponent, CommonModule, ModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  eventService: EventsService = inject(EventsService);
  taskService: TaskService = inject(TaskService);
  eventSelected: IEvent | undefined = undefined;
  modalService: ModalService = inject(ModalService);
  @ViewChild('addProductsModal') addProductsModal: any;
  
  constructor() {
    this.eventService.getAll();
    this.taskService.getAll();
  }

  saveEvent(event: IEvent) {
    console.log("saving event!", event);
    this.eventService.save(event);
  }

  showEventDetails(event: IEvent) {
    this.eventSelected = event;
    this.modalService.displayModal('md', this.addProductsModal);
  }
}
