import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ICalendarEvent, IEvent, ITask, ITaskProgress } from '../../interfaces';
import { EventCalendarBuilder } from './event-calendar.builder';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import timeGridPlugin from '@fullcalendar/timegrid'

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [FullCalendarModule,  MatInputModule, MatSelectModule],
  templateUrl: './calendario-eventos.component.html',
  styleUrls: ['./calendario-eventos.component.scss']
})
export class CalendarioEventosComponent {
  @ViewChild(FullCalendarComponent) fullCalendarComponent!: FullCalendarComponent;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    selectable: true,
    locale: esLocale,
    eventDisplay: 'block',
    displayEventTime: true,
    displayEventEnd: true,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    navLinks: false,
    moreLinkClick: 'popover',
    validRange: {
      start: new Date().toISOString().split('T')[0]
    },
    eventClick: (info) => {
      if (info.event.extendedProps['type'] === 'Event') {
        console.log(info.event as ICalendarEvent);
        this.showEventDetails.emit(this.calendarEventBuilder.parseToEvent(info.event as ICalendarEvent));
      }
      if (info.event.extendedProps['type'] === 'Task') {
        this.showTaskDetails.emit(this.calendarEventBuilder.parseToTask(info.event as ICalendarEvent));
      }
    },
    eventDrop: (info) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventStart = new Date(info.event.start as Date);
      if (eventStart < today) {
        info.revert();
      } else{
        if (info.event.extendedProps['type'] === 'Event') {
          this.saveEvent.emit(this.calendarEventBuilder.parseToEvent(info.event as ICalendarEvent));
        }
        if (info.event.extendedProps['type'] === 'Task') {
          this.saveTask.emit(this.calendarEventBuilder.parseToTask(info.event as ICalendarEvent));
        }
      }
    }
  };

  @Input() events: IEvent[] = [];
  @Input() tasks: ITask[] = [];
  @Input() tasksProgress: ITaskProgress[] = [];

  @Output() saveEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() showEventDetails: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() saveTask: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() showTaskDetails: EventEmitter<ITask> = new EventEmitter<ITask>();

  selectedEventType: string = '';
  selectedTaskType: string = '';
  calendarEvents: ICalendarEvent[] = [];
  calendarEventBuilder: EventCalendarBuilder = new EventCalendarBuilder();

  constructor() {
    this.addEvent = this.addEvent.bind(this);
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    this.updateCalendarEvents();
  }


  applyFilters() {
    this.updateCalendarEvents();
  }

  updateCalendarEvents() {
    let filteredEvents = [...this.events];
    let filteredTasks = [...this.tasks];

    this.calendarEventBuilder = new EventCalendarBuilder();

    if (this.selectedEventType === 'event') {
      filteredTasks = [];
    } else if (this.selectedEventType === 'task') {
      filteredEvents = [];
    }

    if (this.selectedTaskType) {
      filteredTasks = filteredTasks.filter(task => task.status === this.selectedTaskType);
    }

    this.calendarEventBuilder.parseEvents(filteredEvents);
    this.calendarEventBuilder.parseTasks(filteredTasks);
    this.calendarEvents = [...this.calendarEventBuilder.build()];


    this.calendarOptions.events = this.calendarEvents as EventSourceInput;
  }

  addEvent(event: ICalendarEvent) {
    this.calendarEvents = [
      ...this.calendarEvents,
      event
    ];
    this.calendarOptions.events = this.calendarEvents as EventSourceInput;
  }
}
