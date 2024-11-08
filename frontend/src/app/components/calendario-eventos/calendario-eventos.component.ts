import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CalendarOptions, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ICalendarEvent, IEvent, ITask, ITaskProgress } from '../../interfaces';
import { EventCalendarBuilder } from './event-calendar.builder';

@Component({
  selector: 'app-calendario-eventos',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendario-eventos.component.html',
  styleUrl: './calendario-eventos.component.scss'
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
    },
    eventDrop: (info) => {
      if (info.event.extendedProps['type'] === 'Event') {
        this.saveEvent.emit(this.calendarEventBuilder.parseToEvent(info.event as ICalendarEvent));
      }
    },
  };

  @Input() events: IEvent[] = [];
  @Input() tasks: ITask[] = [];
  @Input() tasksProgress: ITaskProgress[] = [];
  @Output() saveEvent: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  @Output() showEventDetails: EventEmitter<IEvent> = new EventEmitter<IEvent>();
  calendarEvents: ICalendarEvent[] = [];
  calendarEventBuilder: EventCalendarBuilder = new EventCalendarBuilder;

  constructor() {
    this.addEvent = this.addEvent.bind(this);
  }

  ngOnChanges() {
    if (this.events.length > 0) {
      this.calendarEventBuilder.parseEvents(this.events);
    }

    if (this.tasks.length > 0) {
      console.log('tasks');
      console.log(this.tasks);
      this.calendarEventBuilder.parseTasks(this.tasks);
    }

    this.calendarEvents = this.calendarEventBuilder.build();
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
