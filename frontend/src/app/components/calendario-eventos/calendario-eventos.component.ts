import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ICalendarEvent, IEvent, ITask, ITaskProgress } from '../../interfaces';
import { EventCalendarBuilder } from './event-calendar.builder';
import { EventcarddetailsComponent } from "../eventcards/eventcarddetails/eventcarddetails.component";
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [FullCalendarModule, EventcarddetailsComponent, MatInputModule, MatSelectModule],
  templateUrl: './calendario-eventos.component.html',
  styleUrls: ['./calendario-eventos.component.scss']
})
export class CalendarioEventosComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
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
    eventClick: (info) => {
      console.log(info.event.title);
      if (info.event.extendedProps['type'] === 'Event') {
        this.showEventDetails.emit(this.calendarEventBuilder.parseToEvent(info.event as ICalendarEvent));
      }

      if (info.event.extendedProps['type'] === 'Task') {
        this.showTaskDetails.emit(this.calendarEventBuilder.parseToTask(info.event as ICalendarEvent));
      }
    },
    eventDrop: (info) => {
      if (info.event.extendedProps['type'] === 'Event') {
        this.saveEvent.emit(this.calendarEventBuilder.parseToEvent(info.event as ICalendarEvent));
      }

      if (info.event.extendedProps['type'] === 'Task') {
        this.saveTask.emit(this.calendarEventBuilder.parseToTask(info.event as ICalendarEvent));
      }
    },
  };

  @Input() events: IEvent[] = [];
  @Input() tasks: ITask[] = [];
  @Input() tasksProgress: ITaskProgress[] = [];
  @Output() saveEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() showEventDetails: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() saveTask: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() showTaskDetails: EventEmitter<ITask> = new EventEmitter<ITask>();

  selectedEventType: string = '';  // Filter by event type (Event/Task)
  calendarEvents: ICalendarEvent[] = [];
  calendarEventBuilder: EventCalendarBuilder = new EventCalendarBuilder();

  constructor() {
    this.addEvent = this.addEvent.bind(this);
  }

  ngOnChanges() {
    this.updateCalendarEvents();
  }

  // This method updates the calendar events based on the selected filters
  applyFilters() {
    this.updateCalendarEvents();
  }

  // Fetch filtered events and tasks to populate the calendar
  updateCalendarEvents() {
    let filteredEvents = [...this.events];
    let filteredTasks = [...this.tasks];

    this.calendarEventBuilder = new EventCalendarBuilder();

    // Filter events/tasks based on selected event type
    if (this.selectedEventType === 'event') {
      filteredEvents = this.events;  // Show only events
      filteredTasks = [];  // Hide tasks
    } else if (this.selectedEventType === 'task') {
      filteredEvents = [];  // Hide events
      filteredTasks = this.tasks;  // Show only tasks
    }

    // Build the calendar events from the filtered list
    this.calendarEventBuilder.parseEvents(filteredEvents);
    this.calendarEventBuilder.parseTasks(filteredTasks);

    // Combine the filtered events and tasks for the calendar view

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
