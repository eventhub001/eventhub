import { Component, inject, Input } from '@angular/core';
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
    eventClick: function(info) {
      console.log(info.event.title);
    }
  };

  @Input() events: IEvent[] = [];
  @Input() tasks: ITask[] = [];
  @Input() tasksProgress: ITaskProgress[] = [];
  calendarEvents: ICalendarEvent[] = [];
  calendaEventBuilder: EventCalendarBuilder = new EventCalendarBuilder;

  constructor() {
    this.addEvent = this.addEvent.bind(this);
    this.addEvent({
      title: 'Bodas de Emilio y Emilia',
      allDay: false,
      start: '2024-11-04T09:00Z',
      end: '2024-11-04T10:00Z',
      editable: true,
      startEditable: true,
      durationEditable: true,
    })
  }

  ngOnChanges() {
    if (this.events.length > 0) {
      this.calendaEventBuilder.parseEvents(this.events);
    }
    if (this.tasksProgress.length > 0) {
      this.calendaEventBuilder.parseTasks(this.tasksProgress);
    }

    this.calendarEvents = this.calendaEventBuilder.build();
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
