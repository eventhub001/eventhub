import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventcardsComponent } from './eventcards.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventTypesService } from '../../services/eventtype.service';
import { EventsService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { EventFormQuestionService } from '../../services/eventformquestions.service';
import { EventFormService } from '../../services/evenform.service';
import { TaskTemplateService } from '../../services/tasktemplate.service';
import { EventTaskTemplateService } from '../../services/eventtasktemplate.service';
import { TaskService } from '../../services/task.service';
import { MachineLearningService } from '../../services/machinelearning.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



describe('EventcardsComponent', () => {
  let component: EventcardsComponent;
  let fixture: ComponentFixture<EventcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventcardsComponent, MatCardModule, MatButtonModule, CommonModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: EventTypesService,
          useValue: { eventTypes$: () => [], getAll: () => [] }
        },
        {
          provide: EventsService,
          useValue: { events$: () => [], getAll: () => [] }
        },
        {
          provide: AuthService,
          useValue: { user$: () => [], getAll: () => [] }
        },
        {
          provide: ModalService,
          useValue: { modal$: () => [], getAll: () => [] }
        },
        {
          provide: EventFormQuestionService,
          useValue: { eventFormQuestions$: () => [], getAll: () => [] }
        },
        {
          provide: EventFormService,
          useValue: { eventForm$: () => [], getAll: () => [] }
        },
        {
          provide: TaskTemplateService,
          useValue: { taskTemplates$: () => [], getAll: () => [] }
        },
        {
          provide: EventTaskTemplateService,
          useValue: { eventTaskTemplates$: () => [], getAll: () => [] }
        },
        {
          provide: TaskService,
          useValue: { tasks$: () => [], getAll: () => [] }
        },
        {
          provide: MachineLearningService,
          useValue: { machineLearning$: () => [], getAll: () => [] }
        },
        {
          provide: MachineLearningService,
          useValue: { machineLearning$: () => [], getAll: () => [] }
        },
        { provide: Router, useValue: {} } // Mock Router
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventcardsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should parse dates correctly', () => {
    const timeTest1 = '2024-12-05T14:30:00';  // Example date string
    const timeResult = component.asTime(timeTest1);

    console.log("input:", timeTest1);
    console.log("output:", timeResult);
    expect(timeResult).toBe('02:30 PM');  // Expecting 12-hour format with AM/PM

    const timeTest2 = '2024-12-05T00:15:00';  // Midnight example
    const timeResult2 = component.asTime(timeTest2);
    expect(timeResult2).toBe('12:15 AM');  // Expecting 12-hour format with AM/PM

    // Test asDate function
    const dateTest = '2024-12-05T14:30:00';  // Example date string
    const dateResult = component.asDate(dateTest);
    expect(dateResult).toBe('05/12/2024');
  })

  
});
