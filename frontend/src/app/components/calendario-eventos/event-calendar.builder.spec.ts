import { IEvent, ITask, ICalendarEvent, ITaskProgress } from '../../interfaces';
import { DatePipe } from '@angular/common';
import { EventCalendarBuilder } from './event-calendar.builder';

describe('EventCalendarBuilder', () => {
  let builder: EventCalendarBuilder;

  beforeEach(() => {
    builder = new EventCalendarBuilder();
  });

  it('should create an instance of EventCalendarBuilder', () => {
    expect(builder).toBeTruthy();
  });

  describe('parseEvents', () => {
    it('should parse IEvent objects into ICalendarEvent objects', () => {
      const events: IEvent[] = [
        {
          eventId: 1,
          eventName: 'Event 1',
          eventStartDate: '2024-12-05T10:00:00',
          eventEndDate: '2024-12-05T12:00:00',
          eventDescription: 'Description of event 1',
          eventType: { eventTypeId: 1, eventTypeName: 'Conference' },
          userId: 123,
        },
      ];

      builder.parseEvents(events);
      const calendarEvents = builder.build();

      expect(calendarEvents.length).toBe(1);
      expect(calendarEvents[0].title).toBe('Event 1');
      expect(calendarEvents[0].start).toBe('2024-12-05T10:00:00');
      expect(calendarEvents[0].end).toBe('2024-12-05T12:00:00');
      expect(calendarEvents[0].extendedProps?.["eventTypeName"]).toBe('Conference');
    });
  });

  describe('parseTasks', () => {
    it('should parse ITask objects into ICalendarEvent objects', () => {
      const tasks: ITask[] = [
        {
          id: 1,
          taskName: 'Task 1',
          description: 'Description of task 1',
          priority: 'High',
          status: 'In Progress',
          event: { eventId: 1 },
          dueDate: new Date('2024-12-05T10:00:00'),
        },
      ];

      builder.parseTasks(tasks);
      const calendarEvents = builder.build();

      console.log("input:", tasks);
      console.log("output:", calendarEvents);

      expect(calendarEvents.length).toBe(1);
      expect(calendarEvents[0].title).toBe('Task 1');
      expect(calendarEvents[0].extendedProps?.["taskPriority"]).toBe('High');
      expect(calendarEvents[0].extendedProps?.["taskStatus"]).toBe('In Progress');
    });
  });

  describe('asTime', () => {
    it('should format date as time in HH:mm format', () => {
      const dateString = '2024-12-05T10:30:00';
      const time = builder.asTime(dateString);

      expect(time).toBe('10:30');
    });
  });

  describe('asDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const dateString = '2024-12-05T10:30:00';
      const formattedDate = builder.asDate(dateString);

      expect(formattedDate).toBe('2024-12-05');
    });
  });

  describe('addOneDayToDate', () => {
    it('should add one day to the given date', () => {
      const dateString = '2024-12-05T10:30:00';
      const newDate = builder.addOneDayToDate(dateString);

      const expectedDate = new Date('2024-12-06T10:30:00').toISOString();
      expect(newDate).toBe(expectedDate);
    });
  });

  describe('getDateOnly', () => {
    it('should return only the date part of an ISO string', () => {
      const dateString = '2024-12-05T10:30:00';
      const dateOnly = builder.getDateOnly(dateString);

    console.log("input:", dateString);
    console.log("output:", dateOnly);

      expect(dateOnly).toBe('2024-12-05');
    });
  });

  describe('parseToEvent', () => {
    it('should convert a calendar event to an IEvent object', () => {
      const calendarEvent: ICalendarEvent = {
        id: 1,
        title: 'Event 1',
        start: '2024-12-05T10:00:00',
        end: '2024-12-05T12:00:00',
        extendedProps: {
          eventDescription: 'Description of event 1',
          eventTypeId: 1,
          eventTypeName: 'Conference',
          userId: 123,
        },
        color: '#80A2A6',
        editable: true,
        allDay: false,
      };

      const event = builder.parseToEvent(calendarEvent);

      console.log("input:", calendarEvent);
      console.log("output:", event);

      expect(event.eventName).toBe('Event 1');
      expect(event.eventStartDate).toBe('2024-12-05T10:00');
      expect(event.eventEndDate).toBe('2024-12-05T12:00');
      expect(event.eventType?.["eventTypeName"]).toBe('Conference');
    });
  });
});
