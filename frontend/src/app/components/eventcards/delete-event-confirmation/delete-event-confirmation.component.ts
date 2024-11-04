import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { IEvent } from '../../../interfaces';

@Component({
  selector: 'app-event-confirmation-modal',
  standalone: true,
  templateUrl: 'delete-event-confirmation.component.html',
  styleUrl: 'delete-event-confirmation.component.scss',
  imports: [MatDialogModule]
})
export class EventDeleteConfirmationComponent {
  @Output() confirmed = new EventEmitter<IEvent>();
  @Input() eventParam!: IEvent | null;
  @Output() canceled = new EventEmitter<void>();

  confirm() {
    this.confirmed.emit(this.eventParam!);
  }

  cancel() {
    console.log('cancel');
    this.canceled.emit();
  }
}