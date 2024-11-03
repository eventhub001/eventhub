import { Component, Input } from '@angular/core';
import { IEvent } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-eventcarddetails',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule],
  templateUrl: './eventcarddetails.component.html',
  styleUrl: './eventcarddetails.component.scss'
})
export class EventcarddetailsComponent {
  @Input() event: IEvent | undefined;
  isEditing: boolean = false;

  constructor() {}

  toggleEdit() {
    this.isEditing = !this.isEditing; // Toggle edit mode
  }

  deleteEvent() {
    // Implement delete logic here
    console.log('Event deleted:', this.event?.eventId); // Example logic
  }

  saveEvent(updatedEvent: IEvent) {
    // Implement save logic here
    console.log('Event saved:', updatedEvent);
    this.toggleEdit(); // Close edit mode after saving
  }
}
