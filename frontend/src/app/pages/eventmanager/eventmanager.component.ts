import { Component, inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EventcardsComponent } from '../../components/eventcards/eventcards.component';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'app-eventmanager',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, EventcardsComponent],
  templateUrl: './eventmanager.component.html',
  styleUrl: './eventmanager.component.scss'
})
export class EventmanagerComponent {
  eventService: EventsService = inject(EventsService);

  constructor() {
    this.eventService.getAll();
  }
}
