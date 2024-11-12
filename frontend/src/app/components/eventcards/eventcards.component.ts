import { Component, effect, inject, Input, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { IEvent, IEventForm, IEventTaskTemplate, IEventType, ITask, ITaskTemplate } from '../../interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { EventTypesService } from '../../services/eventtype.service';
import { EventsFormComponent } from "./event-card-form/event-card-form.component";
import { EventsService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { EventDeleteConfirmationComponent } from './delete-event-confirmation/delete-event-confirmation.component';
import { ModalComponent } from '../modal/modal.component';
import { Router } from '@angular/router';
import { EventFormQuestionService } from '../../services/eventformquestions.service';
import { EventcarddetailsComponent } from './eventcarddetails/eventcarddetails.component';
import { EventFormService } from '../../services/evenform.service';
import { AlertService } from '../../services/alert.service';
import { MachineLearningService } from '../../services/machinelearning.service';
import { formatForCosineModelCompute } from './ml-model-transformation';
import { TaskTemplateService } from '../../services/tasktemplate.service';
import { EventTaskTemplateService } from '../../services/eventtasktemplate.service';
import { TaskService } from '../../services/task.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationComponent } from "../pagination/pagination.component";

@Component({
  selector: 'app-eventcards',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, DatePipe, CommonModule, EventcarddetailsComponent,
    FormsModule, EventsFormComponent, EventsFormComponent, EventDeleteConfirmationComponent, MatPaginatorModule,
    ModalComponent, PaginationComponent, PaginationComponent],
  templateUrl: './eventcards.component.html',
  styleUrl: './eventcards.component.scss'
})
export class EventcardsComponent {


  @Input() events: IEvent[] = [];
  eventTypeService: EventTypesService = inject(EventTypesService);
  authService: AuthService = inject(AuthService);
  eventService: EventsService = inject(EventsService);
  modalService: ModalService = inject(ModalService);
  eventFormQuestionService: EventFormQuestionService = inject(EventFormQuestionService);
  eventFormservice: EventFormService = inject(EventFormService);
  alertService: AlertService = inject(AlertService);
  taskTemplateService: TaskTemplateService = inject(TaskTemplateService);
  machineLearningService: MachineLearningService = new MachineLearningService();
  eventTaskTemplateService: EventTaskTemplateService = inject(EventTaskTemplateService);
  taskServices: TaskService = inject(TaskService);

  editEventId: number = -1;
  public fb: FormBuilder = inject(FormBuilder);
  createEvent: boolean = false;
  @ViewChild("eventFormComponent", {static: false}) eventFormComponent!: EventsFormComponent;
  @ViewChild("eventFormComponent") set content(content: EventsFormComponent) {
    if(content) { // initially setter gets called with undefined
         this.eventFormComponent = content;
    }
 }

  @ViewChild("addProductsModal") eventDeleteModal!: any;

  eventForm: FormGroup = this.fb.group({
    id: [''],
    eventName: ['', Validators.required],
    eventType: ['', Validators.required],
    eventDescription: ['']
  });
  taskAIForm = this.fb.group({
    eventResourceControl: ['', Validators.required], // Example control for event resources
    rangoPersonasList: ['', Validators.required], // Example control for range of people
    estiloEvento: ['', Validators.required], // Example control for event style
    planEvento: ['', Validators.required], // Example control for event plan
    actividadesEvento: ['', Validators.required], // Example control for event activities
    publicoMeta: ['', Validators.required], // Example control for target audience
    presupuesto: [null, Validators.required] // Example for yes/no (presupuesto)
  });
  selectedEvent: IEvent | null = null;
  showDeleteModal: boolean = false;
  searchTerm: string = '';

  constructor(private router: Router) {
    this.eventTypeService.getAll();
    this.machineLearningService.computeEventForm({new_user_answers: "Pregunta: ¿Qué necesitas para tu evento? Decoración, globos... ¿Qué rango de personas? 5-20"}).subscribe(
      (response: any) => {
        console.log(response);
    });
    this.eventFormQuestionService.getAll();
    this.taskTemplateService.getAll();
  }

  showEventDetails(event: IEvent) {
    this.selectedEvent = event; // Set the selected event to show details
  }

  navigateToTasks(eventId: number) {
    this.eventService.search.pageSize = 1000;
    this.eventService.setEventId(eventId);
    this.router.navigate(['app/task']);
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

  save(event: {event:IEvent, formresults: IEventForm[]}) {
    this.eventService.saveAsSubscribe(event.event).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.eventService.getAll();
        this.generateTaskAI(response, event.formresults);
        
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the event', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
    // once this finish it the generateTaskAI is called.
  }

  update(event: IEvent) {
    this.eventService.save(event);
  }

  editMode(event: IEvent) {
    this.eventForm.controls["id"].setValue(event.eventId);
    this.eventForm.controls["eventName"].setValue(event.eventName);
    this.eventForm.controls["eventType"].setValue(event?.eventType?.eventTypeId ? JSON.stringify(event?.eventType.eventTypeId) : '');
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
    this.modalService.closeAll();
    this.eventService.getAll();
  }

  cancelDelete() {
    this.showDeleteModal = false;
  }

  deleteEvent(event: IEvent) {
    console.log(event);
    this.eventService.delete(event);
    this.modalService.closeAll();
    this.showDeleteModal = false;
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

  generateTaskAI(eventSaved: IEvent, eventanswer: IEventForm[]) {
    console.log("saving the form answers");
    
    const answer_collection: string = formatForCosineModelCompute(eventanswer);


    this.machineLearningService.computeEventForm({new_user_answers: answer_collection}).subscribe({
      next: (response: any) => {
        console.log(response);
        const task_list = response.data["frequency_analysis"];
        task_list.forEach((task: any) => {
          const tasksTemplates = this.taskTemplateService.taskTemplates$();
          const taskTemplateToSave: ITaskTemplate = tasksTemplates.find(t => t.taskTemplateId === Number(task["task_template_id"]))!;
          console.log("tasks loading...")  
          const eventTaskTemplate: IEventTaskTemplate = {
            taskTemplate: taskTemplateToSave,
            event: {eventId: eventSaved.eventId}
          }

          this.eventTaskTemplateService.save(eventTaskTemplate);

          const taskToSave: ITask = {
            taskName: taskTemplateToSave.taskTemplateName,
            description: taskTemplateToSave.taskTemplateDescription,
            event: eventSaved
          }

          this.taskServices.save(taskToSave);

        })
        console.log(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });


    eventanswer.forEach((event) => {
      event.event = eventSaved;
      this.eventFormservice.save(event);
    })
  }

  filterEventByTerm(term: string) {
    this.eventService.search.page = 1;
    this.eventService.searchByTerm(term);
  }
}
