import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEvent, IEventForm, IEventFormQuestion, IEventType } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import {  DateTimeCustomPickerComponent } from "../../material-custom/datetime-custom-picker/datetime-custom-picker.component";
import { TaskFormAIComponent } from "../../task/task-form-ai/task-form-ai.component";

@Component({
  selector: 'app-card-events-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule, DateTimeCustomPickerComponent,
    TaskFormAIComponent
],
  templateUrl: './event-card-form.component.html',
  styleUrls: ['./event-card-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Fix typo from 'styleUrl' to 'styleUrls'
})
export class EventsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() eventForm!: FormGroup;
  @Input() createEvent: boolean;
  @Input() eventStartDate: string | null | Date = null;
  @Input() eventEndDate: string | null | Date = null;
  @Input() eventTypes: IEventType[] = [];
  @Input() isCreation: boolean = false;
  @Input() eventFormQuestion: IEventFormQuestion[] = [];

  @Output() callSaveEvent: EventEmitter<{event:IEvent, formresults: IEventForm[]}> = new EventEmitter<{event:IEvent, formresults: IEventForm[]}>();
  @Output() callUpdateEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() closeView: EventEmitter<void> = new EventEmitter<void>();
  @Output() authService: AuthService = inject(AuthService);
  @Output() callSaveTaskAI: EventEmitter<IEventForm[]> = new EventEmitter<IEventForm[]>();
  dateTimeForm: FormGroup = this.fb.group({
      dateInput: ['', Validators.required],
      startTime: ['11:00', Validators.required],
      endTime: ['', Validators.required]
    });
  taskAIForm: FormGroup = this.fb.group({
    eventResourceInput: [''],
    rangoPersonasInput: [''],
    estiloEvento: [''],
    planInput: [''],
    actividadesEvento: [''],
    publicoMeta: [''],
    lugarDeEventoInput: [''],
    presupuestoInput: ['']
  })

  constructor() {
    this.createEvent = false;
  }


  toHHmm(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  ngOnChanges() {
    if (this.eventForm && this.eventStartDate) {
      this.dateTimeForm.controls['dateInput'].setValue(this.eventStartDate);

      this.dateTimeForm.controls['startTime'].setValue(this.toHHmm(new Date(this.eventStartDate)));
      this.dateTimeForm.controls['endTime'].setValue(this.toHHmm(new Date(this.eventEndDate!)));
    }

  }

  isDateTimeValid(isValid: boolean) {
    console.log(isValid);
  }

  formatToLocalDateTime(date: any, time: any): string | null {
    const dateControl = date; // Date object
    const startTimeControl = time; // Time in HH:mm

    if (!dateControl || !startTimeControl) return null; // Return if values are missing

    // Format the date to YYYY-MM-DD
    const dateParsed = new Date(dateControl);
    const year = dateParsed.getFullYear();
    const month = String(dateParsed.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dateParsed.getDate()).padStart(2, '0');

    // Parse start time (assuming 'HH:mm' format) and append seconds
    const [hours, minutes] = startTimeControl.split(':');
    const startTimeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    // Combine date and time into ISO string
    return `${year}-${month}-${day}T${startTimeFormatted}`;
  }

  callSave() {
    // finds the eventtype and populates the event object
    const eventType = this.eventTypes.find((eventType: IEventType) => eventType.eventTypeId === Number(this.eventForm.controls['eventType'].value));

    if (!eventType) {
      throw new Error('Event type not found');
    }

    const startDateTime = this.formatToLocalDateTime(
      this.dateTimeForm.controls['dateInput'].value,
      this.dateTimeForm.controls["startTime"].value)!;

    const endDateTime = this.formatToLocalDateTime(
      this.dateTimeForm.controls['dateInput'].value,
      this.dateTimeForm.controls["endTime"].value)!;

    console.log("saving date time as: ");
    console.log(startDateTime);
    console.log(endDateTime);

    let event: IEvent = {
      eventName: this.eventForm.controls['eventName'].value,
      eventDescription: this.eventForm.controls['eventDescription'].value,
      eventType: eventType,
      eventStartDate: startDateTime,
      eventEndDate: endDateTime,
      userId: this.authService.getUser()?.id!
    };
    console.log("event", event);
    if (this.eventForm.controls['id'].value) {
      event.eventId = this.eventForm.controls['id'].value;
    }
    if (event.eventId) {
      this.callUpdateEvent.emit(event);
    } else {
      this.callSaveEvent.emit({
        event: event,
        formresults:this.generateTaskAI(event)
      });

    }

    this.closeView.emit();
  }

  sampleMethod() {
    console.log("sample method called");
  }

  closeViewEmitter() {
    this.closeView.emit();
  }

  generateTaskAI(event: IEvent) {
    console.log("event form questions desappear?", this.taskAIForm.controls["presupuestoInput"].value);
    const eventFormResults: IEventForm[] = this.eventFormQuestion.filter((eventFormQuestion: IEventFormQuestion) => {
      try {
        const value = this.taskAIForm.controls[eventFormQuestion.nnControlName].value;
        return value !== null && value !== ""; // Filtra los valores nulos o vacíos
      } catch (e) {
        console.log(e);
        console.log(eventFormQuestion.nnControlName);
        return false; // Si hay un error, ignora este item en el resultado final
      }
    }).map((eventFormQuestion: IEventFormQuestion) => {
      try {
        this.taskAIForm.controls[eventFormQuestion.nnControlName].value;
      } catch (e) {
        console.log(e);
        console.log(eventFormQuestion.nnControlName);
        throw new Error('Control not found');
      }
      const question: IEventFormQuestion = this.eventFormQuestion.find((question: IEventFormQuestion) => question.id === eventFormQuestion.id)!;

      if (!question) {
        throw new Error('Question not found');
      }

      const controlValueType = typeof this.taskAIForm.controls[eventFormQuestion.nnControlName].value;
      console.log("control value type: ", controlValueType, "control value: ", this.taskAIForm.controls[eventFormQuestion.nnControlName].value);
      if (controlValueType === "string") {
        return {
          question: question,
          answer: this.taskAIForm.controls[eventFormQuestion.nnControlName].value as string,
          event: event
        } as IEventForm
      }
      else {
        return {
          question: question,
          answer:  (this.taskAIForm.controls[eventFormQuestion.nnControlName].value as string[]).join(", "),
          event: event
        } as IEventForm
      }
    })

    return eventFormResults;
    //this.callSaveTaskAI.emit(eventFormResults);
  }

  listAsString(list: string[]) {
    return list.join(", ");
  }
}
