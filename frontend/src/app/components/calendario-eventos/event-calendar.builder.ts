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
            start: this.getDateOnly(task.dueDate?.toString() as string),
            end: this.getDateOnly(this.addOneDayToDate(task.dueDate?.toString() as string)),
            id: task.id,
            extendedProps: {
                type: "Task",
                taskPriority: task.priority,
                taskStatus: task.status,
                taskDescription: task.description
            },
            ...this.settings
        })));
    }

    parseToEvent(event: ICalendarEvent) {
        const eventObj: IEvent = {
            eventId: Number(event.id),
            eventName: event.title,
            eventStartDate: event.start as string,
            eventEndDate: event.end as string,
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
            dueDate: event.start as Date
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
  