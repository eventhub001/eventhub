import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ICalendarEvent, IEvent, ITask, ITaskProgress } from '../../interfaces';
import { EventCalendarBuilder } from './event-calendar.builder';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [FullCalendarModule,  MatInputModule, MatSelectModule],
  templateUrl: './calendario-eventos.component.html',
  styleUrls: ['./calendario-eventos.component.scss']
})
export class CalendarioEventosComponent {
  // Calendar options
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

  @Input() events: IEvent[] = [];               // Array of event objects
  @Input() tasks: ITask[] = [];                 // Array of task objects
  @Input() tasksProgress: ITaskProgress[] = []; // Array of task progress objects

  @Output() saveEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() showEventDetails: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() saveTask: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() showTaskDetails: EventEmitter<ITask> = new EventEmitter<ITask>();

  selectedEventType: string = '';               // Selected event type filter (Event/Task)
  selectedTaskType: string = '';                // Selected task type filter (e.g., TypeA, TypeB)
  calendarEvents: ICalendarEvent[] = [];        // Events to be displayed on the calendar
  calendarEventBuilder: EventCalendarBuilder = new EventCalendarBuilder();

  constructor() {
    this.addEvent = this.addEvent.bind(this);
  }

  ngOnChanges() {
    this.updateCalendarEvents();
  }

  // Apply filters when selection changes
  applyFilters() {
    this.updateCalendarEvents();
  }

  // Update the calendar events based on the selected filters
  updateCalendarEvents() {
    let filteredEvents = [...this.events];
    let filteredTasks = [...this.tasks];

    this.calendarEventBuilder = new EventCalendarBuilder();

    // Filter by selected event type
    if (this.selectedEventType === 'event') {
      filteredTasks = [];  // Hide tasks if only events are selected
    } else if (this.selectedEventType === 'task') {
      filteredEvents = [];  // Hide events if only tasks are selected
      // Further filter tasks by task type, if specified
    }

    if (this.selectedTaskType) {
      console.log(this.selectedTaskType);
      filteredTasks = filteredTasks.filter(task => task.status === this.selectedTaskType);
    }

    // Build calendar events from the filtered lists
    this.calendarEventBuilder.parseEvents(filteredEvents);
    this.calendarEventBuilder.parseTasks(filteredTasks);

    // Update the calendar view with filtered events
    this.calendarEvents = [...this.calendarEventBuilder.build()];
    this.calendarOptions.events = this.calendarEvents as EventSourceInput;
  }

  // Method to add a new event to the calendar
  addEvent(event: ICalendarEvent) {
    this.calendarEvents = [
      ...this.calendarEvents,
      event
    ];
    this.calendarOptions.events = this.calendarEvents as EventSourceInput;
  }
}
