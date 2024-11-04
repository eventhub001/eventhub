import { Component, inject } from '@angular/core';
import { CalendarioEventosComponent } from '../../components/calendario-eventos/calendario-eventos.component';
import { EventsService } from '../../services/event.service';
import { TaskService } from '../../services/task.service';
import { TaskProgressService } from '../../services/task-progress.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CalendarioEventosComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  eventService: EventsService = inject(EventsService);
  taskProgressService: TaskProgressService = inject(TaskProgressService);
  taskService: TaskService = inject(TaskService);
  
  constructor() {
    this.eventService.getAll();
    this.taskService.getAll();
    this.taskProgressService.getAll();
  }
}
