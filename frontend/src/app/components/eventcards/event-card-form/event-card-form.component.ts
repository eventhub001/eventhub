import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IEvent, IEventType } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-card-events-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './event-card-form.component.html',
  styleUrls: ['./event-card-form.component.scss'] // Fix typo from 'styleUrl' to 'styleUrls'
})
export class EventsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() eventForm!: FormGroup;
  @Output() callSaveEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() callUpdateEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Input() eventTypes: IEventType[] = [];
  @Output() authService: AuthService = inject(AuthService);

  callSave() {
    let event: IEvent = {
      eventName: this.eventForm.controls['evenName'].value,
      eventType: this.eventForm.controls['evenTypeName'].value,
      userId: this.authService.getUser()?.id!
    };
    if (this.eventForm.controls['id'].value) {
      event.eventId = this.eventForm.controls['id'].value;
    }
    if (event.eventId) {
      this.callUpdateEvent.emit(event);
    } else {
      this.callSaveEvent.emit(event);
    }
  }
}
