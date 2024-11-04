import { Component, inject, Input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { IEvent, IEventType } from '../../interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { EventcarddetailsComponent } from './eventcarddetails/eventcarddetails.component';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { EventTypesService } from '../../services/eventtype.service';
import { EventsFormComponent } from "./event-card-form/event-card-form.component";
import { EventsService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { EventDeleteConfirmationComponent } from './delete-event-confirmation/delete-event-confirmation.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-eventcards',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe, CommonModule, EventcarddetailsComponent,
    FormsModule, EventsFormComponent, EventsFormComponent, EventDeleteConfirmationComponent,
    ModalComponent],
  templateUrl: './eventcards.component.html',
  styleUrl: './eventcards.component.scss'
})
export class EventcardsComponent {


  @Input() events: IEvent[] = [];
  eventTypeService: EventTypesService = inject(EventTypesService);
  authService: AuthService = inject(AuthService);
  eventService: EventsService = inject(EventsService);
  modalService: ModalService = inject(ModalService);
  editEventId: number = -1;
  public fb: FormBuilder = inject(FormBuilder);
  createEvent: boolean = false;
  @ViewChild("addProductsModal") eventDeleteModal!: any;
  eventForm: FormGroup = this.fb.group({
    id: [''],
    eventName: ['', Validators.required],
    eventType: ['', Validators.required],
    eventDescription: ['']
  });
  selectedEvent: IEvent | null = null;
  showDeleteModal: boolean = false;

  constructor() {
    this.eventTypeService.getAll();
  }

  ngOnChanges() {
    console.log('receiving events: ');
    console.log(this.events);
  }

  showEventDetails(event: IEvent) {
    this.selectedEvent = event; // Set the selected event to show details
  }

  closeEditMode() {
    this.editEventId = -1; // Close
  }

  closeCreateMode() {
    this.createEvent = false; // Close create mode
  }

  closeEventDetails() {
    this.selectedEvent = null; // Close event details
  }

  save(event: IEvent) {
    this.eventService.save(event);
  }

  update(event: IEvent) {
    this.eventService.save(event);
  }

  editMode(event: IEvent) {
    this.eventForm.controls["id"].setValue(event.eventId);
    this.eventForm.controls["eventName"].setValue(event.eventName);
    this.eventForm.controls["eventType"].setValue(event?.eventType!.eventTypeId ? JSON.stringify(event?.eventType.eventTypeId) : '');
    this.eventForm.controls["eventDescription"].setValue(event?.eventDescription);
    this.editEventId = event.eventId!; // Toggle edit mode
    this.createEvent = false; // Close create mode
  }

  deleteMode(event: IEvent) {
    this.selectedEvent = event;
    this.showDeleteModal = true;
    this.modalService.displayModal('md', this.eventDeleteModal);
  }

  createMode() {
    this.eventForm.reset(); // Reset
    this.createEvent = true; // Toggle create mode
  }

  cancelDelete() {
    console.log("cancel delete");
    this.showDeleteModal = false;
  }
  
  deleteEvent(event: IEvent) {
    console.log("delete event");
    console.log(event);
    this.eventService.delete(event);
    this.showDeleteModal = false;
    this.eventDeleteModal.close();
  }

  // date parsing functions
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
