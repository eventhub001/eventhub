import { DatePipe } from "@angular/common";
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
            extendedProps: {
                type: "Event",
                eventTypeId: event.eventType?.eventTypeId,
                eventTypeName: event.eventType?.eventTypeName,
                eventDescription: event.eventDescription
            },
            color: "#EA55A1",
            ...this.settings
        })));
    }

    parseTasks(tasks: ITask[]) {
        this.calendarEvents = this.calendarEvents.concat(tasks.map(task => ({
            title: task.taskName || 'No Title', // Default title if none provided
            start: task.dueDate ? this.getDateOnly(task.dueDate?.toString() as string) : '',
            end: task.dueDate ? this.getDateOnly(this.addOneDayToDate(task.dueDate?.toString() as string)) : '',
            id: task.id,
            extendedProps: {
                type: "Task",
                taskPriority: task.priority,
                taskStatus: task.status,
                taskDescription: task.description,
                taskEventId: task.event?.eventId
            },
            ...this.settings
        })));
    }

    asTime(arg0: string): string {
        const date = new Date(arg0);
        const hours = date.getHours().toString().padStart(2, '0'); // Format hours to 2 digits
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Format minutes to 2 digits
        return `${hours}:${minutes}`;
      }
    
    asDate(arg0: string) {
        return new DatePipe('en-US').transform(arg0, 'yyyy-MM-dd');
    }

    parseToEvent(event: ICalendarEvent) {
        const eventObj: IEvent = {
            eventId: Number(event.id),
            eventName: event.title,
            eventStartDate: this.asDate(event.start as string) + "T" + this.asTime(event.start as string),
            eventEndDate: this.asDate(event.end as string) + "T" + this.asTime(event.end as string),
            eventDescription: event.extendedProps?.["eventDescription"],
            eventType: {
                eventTypeId: event.extendedProps?.["eventTypeId"],
                eventTypeName: event.extendedProps?.["eventTypeName"]
            }
        }

        return eventObj;
    }

    parseToTask(event: ICalendarEvent) {
        const taskObj: ITask = {
            id: Number(event.id),
            taskName: event.title,
            description: event.extendedProps?.["taskDescription"],
            priority: event.extendedProps?.["taskPriority"],
            status: event.extendedProps?.["taskStatus"],
            event: {eventId: event.extendedProps?.["taskEventId"]},
            dueDate: new Date(this.asDate(event.start as string) + "T" + this.asTime(event.start as string)),
        }

        return taskObj;
    }

    addOneDayToDate(date: string) {
        const dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + 1);
        return dateObj.toISOString();
    }

    getDateOnly(date: string) {
        return date.split('T')[0];
    }

    getTaskProgress(taskId: number, tasksProgress: ITaskProgress[]) {
        return tasksProgress.find(taskProgress => taskProgress.task?.id === taskId);
    }
  
    build(): ICalendarEvent[] {
      return this.calendarEvents;
    }
  }
  