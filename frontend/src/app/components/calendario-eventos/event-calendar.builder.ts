import { ICalendarEvent, IEvent, ITask, ITaskProgress } from "../../interfaces";

export class EventCalendarBuilder {
    private calendarEvents: ICalendarEvent[] = [];
  
    settings = {
        editable: true,
        allDay: false
    }

    constructor() {
    }

    parseEvents(events: IEvent[]) {
        this.calendarEvents = this.calendarEvents.concat(events.map(event => ({
            title: event.eventName || 'No Title', // Default title if none provided
            start: event.eventStartDate as string,
            end: event.eventEndDate as string,
            id: event.eventId,
            ...this.settings
        })));
    }

    parseTasks(tasksProgress: ITaskProgress[]) {
        this.calendarEvents = this.calendarEvents.concat(tasksProgress.map(tasksProgress => ({
            title: tasksProgress.task?.taskName || 'No Title', // Default title if none provided
            start: tasksProgress.task?.dueDate as string,
            end: this.addOneDayToDate(tasksProgress.task?.dueDate!) as string,
            id: tasksProgress.id,
            ...this.settings
        })));
    }

    addOneDayToDate(date: string) {
        const dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + 1);
        return dateObj.toISOString();
    }

    getTaskProgress(taskId: number, tasksProgress: ITaskProgress[]) {
        return tasksProgress.find(taskProgress => taskProgress.task?.id === taskId);
    }
  
    build(): ICalendarEvent[] {
      return this.calendarEvents;
    }
  }
  