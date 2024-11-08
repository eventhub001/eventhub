import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { EventsService } from '../../../services/event.service';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IEvent, IEventTaskTemplate, ITask, ITaskTemplate } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  public eventsService: EventsService = inject(EventsService);
  public selectedTastTemplate: ITaskTemplate | null = null;

  public filteredTaskTemplates: ITaskTemplate[] = []; // Filtered list for display
  public searchTerm: string = '';

  constructor() {
    this.eventsService.search.page = 1;
    this.eventsService.getAll();
  }

  events = computed(() => this.eventsService.events$());

  @Input() taskForm!: FormGroup;
  @Input() taskTemplates: ITaskTemplate[] = [];

  @Output() callSaveMethod: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callUpdateMethod: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callSaveTaskTemplate: EventEmitter<IEventTaskTemplate> = new EventEmitter<IEventTaskTemplate>();
  
  ngOnChanges() {
    if (this.taskTemplates.length > 0) {
      this.filteredTaskTemplates = this.taskTemplates
    }
  }

  openSelect() {
    const selectElement = document.getElementById('templates') as HTMLSelectElement;
    if (selectElement) {
      selectElement.showPicker();
      // unfocus the selection now.
    }
  }
  
  callSave(generateWithDescription: boolean = false) {

    if (generateWithDescription) {
      const taskBrokenDown = this.taskForm.controls['description'].value.split('\n');
      console.log(this.taskForm.controls['event'].value);
      console.log("saving description as task");
      taskBrokenDown.forEach((task: string) => {
        let taskToSave: ITask = {
          taskName: task,
          status: 'Pendiente',
          event:  { eventId: Number(this.taskForm.controls['event'].value) }
        }
        
        this.callSaveMethod.emit(taskToSave);
      })
    }

    if (this.selectedTastTemplate !== null) {
        const eventTaskTemplate: IEventTaskTemplate = {
          taskTemplate: this.selectedTastTemplate,
          event: {eventId: this.taskForm.controls['event'].value}
        }
        this.callSaveTaskTemplate.emit(eventTaskTemplate);
    }

    let selectedEventId: number = this.taskForm.controls['event'].value;

    let task: ITask = {
      taskName: this.taskForm.controls['taskName'].value,
      description: this.taskForm.controls['description'].value,
      status: this.taskForm.controls['status'].value,
      dueDate: this.taskForm.controls['dueDate'].value,
      priority: this.taskForm.controls['priority'].value,
      event:  { eventId: selectedEventId }
    }

    if(this.taskForm.controls['id'].value) {
      task.id = this.taskForm.controls['id'].value;
    }
    if(task.id) {
      this.callUpdateMethod.emit(task);
    } else {
     this.callSaveMethod.emit(task);
    }

  }

  fillWithTemplate(template: any) {
    const target = template.target as HTMLSelectElement;
    if (target.value === '-1') {
      this.selectedTastTemplate = null;
      return;
    }

    const templateFound: ITaskTemplate =  this.taskTemplates.find(t => t.taskTemplateId === Number(target.value))!;
    
    console.log(templateFound);
    this.taskForm.controls['taskName'].setValue(templateFound.taskTemplateName);
    console.log(templateFound.taskTemplateDescription);
    this.taskForm.controls["description"].setValue(templateFound.taskTemplateDescription);
    this.selectedTastTemplate = templateFound;
  }

  filterTemplates() {
    this.filteredTaskTemplates = this.taskTemplates.filter(template =>
      template.taskTemplateName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  priorities = [
    { id: 1, name: 'Alta' },
    { id: 2, name: 'Media' },
    { id: 3, name: 'Baja' }
  ];

  status = [
    { id: 1, name: 'En Progreso' },
    { id: 2, name: 'Completado' },
    { id: 3, name: 'Pendiente' }
  ];


}
