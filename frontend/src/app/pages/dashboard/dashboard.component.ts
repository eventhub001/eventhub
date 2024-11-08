import { Component, inject } from '@angular/core';
import { CalendarioEventosComponent } from '../../components/calendario-eventos/calendario-eventos.component';
import { EventsService } from '../../services/event.service';
import { TaskService } from '../../services/task.service';
import { IEvent } from '../../interfaces';
import { EventcarddetailsComponent } from "../../components/eventcards/eventcarddetails/eventcarddetails.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CalendarioEventosComponent, EventcarddetailsComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  eventService: EventsService = inject(EventsService);
  taskService: TaskService = inject(TaskService);
  eventSelected: IEvent | undefined = undefined;
  
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
  }
}
