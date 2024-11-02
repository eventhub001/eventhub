import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { IEvent } from '../../interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { EventcarddetailsComponent } from './eventcarddetails/eventcarddetails.component';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { EventTypesService } from '../../services/eventtype.service';
import { EventsFormComponent } from "./event-card-form/event-card-form.component";

@Component({
  selector: 'app-eventcards',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe, CommonModule, EventcarddetailsComponent, FormsModule, EventsFormComponent, EventsFormComponent],
  templateUrl: './eventcards.component.html',
  styleUrl: './eventcards.component.scss'
})
export class EventcardsComponent {
  @Input() events: IEvent[] = [];
  eventTypeService: EventTypesService = inject(EventTypesService);
  editEvent: boolean = false;
  public fb: FormBuilder = inject(FormBuilder);
  eventForm: FormGroup = this.fb.group({
    id: [''],
    eventName: [''],
    eventTypeName: ['']
  });
  selectedEvent: IEvent | null = null;

  constructor() {
    this.eventTypeService.getAll();
  }

  showEventDetails(event: IEvent) {
    this.selectedEvent = event; // Set the selected event to show details
  }

  closeEventDetails() {
    this.selectedEvent = null; // Close event details
  }

  confirmEdit() {
    //this.editEvent = true; // Set edit mode
  }

  editMode(event: IEvent) {
    this.eventForm.controls["id"].setValue(event.eventId);
    this.eventForm.controls["eventName"].setValue(event.eventName);
    this.eventForm.controls["eventTypeName"].setValue(this.selectedEvent?.eventType);
    this.editEvent = !this.editEvent; // Toggle edit mode
  }
}
