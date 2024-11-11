import { Component, Input } from '@angular/core';
import { IEvent } from '../../../interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-event-card-details',
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

  asTime(arg0: string): string {
    const date = new Date(arg0);
    const hours = date.getHours().toString().padStart(2, '0'); // Format hours to 2 digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Format minutes to 2 digits
    return `${hours}:${minutes}`;
  }

  asDate(arg0: string) {
    return new DatePipe('en-US').transform(arg0, 'MM/dd/yyyy');
  }
}