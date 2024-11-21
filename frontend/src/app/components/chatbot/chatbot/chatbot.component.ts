import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EventsService } from '../../../services/event.service';
import { IEvent, IEventType, ITask } from '../../../interfaces';
import { TaskService } from '../../../services/task.service';
import { EventTypesService } from '../../../services/eventtype.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatbotComponent{

  public authService: AuthService = inject(AuthService);
  public eventService: EventsService = inject(EventsService);
  public taskService: TaskService = inject(TaskService);
  public eventTypesService: EventTypesService = inject(EventTypesService);
  private eventData: Partial<IEvent> = {};
  private isCreatingEvent: boolean = false;

  constructor() {
  }

  ngAfterViewInit() {
    // window.addEventListener('dfMessengerLoaded', (response: any) => {
    // });

    // Escucha el evento df-response-received para capturar la respuesta del usuario
    window.addEventListener('df-response-received', (event: any) => {
      this.responseReceived(event);
    });
  }


  renderCustomCard(events: IEvent[]) {
    const dfMessenger = document.querySelector('df-messenger') as any;
    const payload = events.map(event => ({
      type: "info",
      title: event.eventName,
      subtitle: ` Descripción: ${event.eventDescription} \nFecha: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'Fecha no disponible'} \nInicio del Evento: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'} \nFinalizacion del Evento: ${event.eventEndDate ? new Date(event.eventEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'}`,
      actionLink: `http://localhost:4200/app/events`
    }));
    dfMessenger.renderCustomCard(payload);
  }


isEventListRequest(userMessage: string): boolean {
  return userMessage.toLowerCase().includes('lista de eventos') ||
         userMessage.toLowerCase().includes('ver eventos') ||
         userMessage.toLowerCase().includes('mis eventos');
}

isTaskListRequest(userMessage: string): boolean {
  return userMessage.toLowerCase().includes('ver tareas del evento') ||
         userMessage.toLowerCase().includes('mostrar tareas del evento') ||
         userMessage.toLowerCase().includes('listar tareas del evento')||
         userMessage.toLowerCase().includes('mis tareas del evento');
}

listEvents() {
  const userId = this.authService.getUser()?.id;
  this.eventService.getEventsByUserId(userId!).subscribe({
    next: (events: IEvent[]) => {
      if (events.length > 0) {
        this.renderCustomCard(events);
        const dfMessenger = document.querySelector('df-messenger') as any;
        dfMessenger.renderCustomText('Puedes ver los eventos que tienes registrados haciendo click sobre la tarjeta. ¡Disfruta de tus eventos!');
      } else {
        const dfMessenger = document.querySelector('df-messenger') as any;
        dfMessenger.renderCustomText('No tienes eventos registrados.');
      }
    },
    error: (err: any) => {
      console.error('Error fetching events', err);
      const dfMessenger = document.querySelector('df-messenger') as any;
      dfMessenger.renderCustomText('Hubo un error al obtener tus eventos. Por favor, inténtalo de nuevo más tarde.');
    }
  });
}

listTasks(userMessage: string) {
  const eventNameMatch = userMessage.match(/(ver|mostrar|listar) tareas del evento (.+)/i);
  if (eventNameMatch && eventNameMatch[2]) {
    const eventName = eventNameMatch[2].trim();
    this.taskService.getAllTasksByEventName(eventName).subscribe({
      next: ( tasks: ITask[] ) => {
        if (tasks.length > 0) {
          // Almacenar el eventId en localStorage

          const dfMessenger = document.querySelector('df-messenger') as any;
          const cards = tasks.map(task => ({
            type: "info",
            title: task.taskName,
            subtitle: `Descripción: ${task.description ? task.description : 'No disponible'} \nProgreso: ${task.status} \nPrioridad: ${task.priority} \nFecha de Vencimiento: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Fecha no disponible'}`,
            actionLink: `http://localhost:4200/task`
          }));
          console.log('Cards:', cards);
          dfMessenger.renderCustomCard(cards);
          dfMessenger.renderCustomText('Aquí tienes las tareas del evento. ¡Espero que te sean útiles!');
        } else {
          const dfMessenger = document.querySelector('df-messenger') as any;
          dfMessenger.renderCustomText(`No hay tareas registradas para el evento "${eventName}".`);
        }
      },
      error: (err: any) => {
        console.error('Error fetching tasks', err);
        const dfMessenger = document.querySelector('df-messenger') as any;
        dfMessenger.renderCustomText('Hubo un error al obtener las tareas del evento. Por favor, inténtalo de nuevo más tarde.');
      }
    });
  } else {
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.renderCustomText('Por favor, especifica el nombre del evento.');
  }
}

handleAttendees(asistentes: number) {
  console.log('Cantidad de asistentes:', asistentes);
  const espacioNecesario = this.calcularEspacio(asistentes);
  const respuestaPersonalizada = `Con ${asistentes} personas, necesitarás un espacio de ${espacioNecesario}. ¿Dónde será el evento?`;
  const dfMessenger = document.querySelector('df-messenger') as any;
  dfMessenger.renderCustomText(respuestaPersonalizada);
}


responseReceived(event: any) {
  if (event.detail && event.detail.response) {
    console.log('Event Detail Response:', event.detail.response); // Log the response to inspect its structure
    const queryResult = event.detail.response.queryResult;
    if (queryResult) {
      const userMessage = queryResult.queryText;
      const botResponse = queryResult.fulfillmentText;
      this.handleUserResponse(userMessage, botResponse, queryResult.parameters);
    } else {
      console.error('Invalid queryResult structure:', event.detail.response);
    }
  } else {
    console.error('Invalid event structure:', event);
  }
}

handleUserResponse(userMessage: string, botResponse: string, parameters: any) {
  console.log('User Message:', userMessage);
  console.log('Bot Response:', botResponse);

  if (this.isCreatingEvent) {
    this.handleEventCreationResponse(userMessage);
  } else if (this.isEventCreationRequest(userMessage)) {
    this.startEventCreationFlow();
  } else if (this.isEventListRequest(userMessage)) {
    this.listEvents();
  } else if (this.isTaskListRequest(userMessage)) {
    this.listTasks(userMessage);
  } else if (parameters && parameters.cantidad_personas) {
    this.handleAttendees(parameters.cantidad_personas);
  }

}

manualUsuario(userMessage: string): boolean {
  if (userMessage.toLowerCase() === '/ayuda') {
    const dfMessenger = document.querySelector('df-messenger') as any;
    const helpText = `
      Aquí tienes los comandos disponibles:
      - /ayuda: Muestra este mensaje de ayuda.
      - Para ver una lista de eventos usa los siguientes comandos: ver eventos, lista de eventos, mis eventos.
      - Para ver las tareas de un evento específico usa los siguientes comandos: ver tareas del evento [nombre del evento], mostrar tareas del evento [nombre del evento], listar tareas del evento [nombre del evento], mis tareas del evento [nombre del evento].
      - crear evento: Inicia el proceso de creación de un nuevo evento.
    `;
    dfMessenger.renderCustomText(helpText);
    return true;
  }
  return false;
}



isEventCreationRequest(userMessage: string): boolean {
  return userMessage.toLowerCase().includes('crear evento');
}

startEventCreationFlow() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  dfMessenger.renderCustomText('Por favor, proporciona el nombre del evento.');
  this.eventData = {}; // Reset event data
  this.isCreatingEvent = true; // Set the flag to indicate that we are in the event creation flow
}

handleEventCreationResponse(userMessage: string) {
  const dfMessenger = document.querySelector('df-messenger') as any;

  if (!this.eventData.eventName) {
    this.eventData.eventName = userMessage;
    dfMessenger.renderCustomText('Por favor, proporciona la descripción del evento.');
  } else if (!this.eventData.eventDescription) {
    this.eventData.eventDescription = userMessage;
    dfMessenger.renderCustomText('Por favor, proporciona el tipo de evento.');
  } else if (!this.eventData.eventType) {
    const eventType = this.getEventTypeByName(userMessage);
    if (eventType) {
      this.eventData.eventType = eventType;
      dfMessenger.renderCustomText('Por favor, proporciona la fecha de inicio del evento (MM-DD-YYYY).');
    } else {
      dfMessenger.renderCustomText('Tipo de evento no válido. Por favor, proporciona un tipo de evento válido.');
    }
  } else if (!this.eventData.eventStartDate) {
    if (this.isValidDate(userMessage, 'MM-DD-YYYY')) {
      this.eventData.eventStartDate = this.convertToISODate(userMessage, 'MM-DD-YYYY');
      dfMessenger.renderCustomText('Por favor, proporciona la hora de inicio del evento (HH:MM AM/PM).');
    } else {
      dfMessenger.renderCustomText('Fecha de inicio no válida. Por favor, proporciona la fecha de inicio del evento en el formato MM-DD-YYYY.');
    }
  } else if (!this.eventData.eventStartDate.includes('T')) {
    if (this.isValidTime(userMessage)) {
      const time24 = this.convertTo24HourFormat(userMessage);
      this.eventData.eventStartDate += `T${time24}:00`;
      dfMessenger.renderCustomText('Por favor, proporciona la hora de finalización del evento (HH:MM AM/PM).');
    } else {
      dfMessenger.renderCustomText('Hora de inicio no válida. Por favor, proporciona la hora de inicio del evento en el formato HH:MM AM/PM.');
    }
  } else if (!this.eventData.eventEndDate) {
    if (this.isValidTime(userMessage)) {
      const time24 = this.convertTo24HourFormat(userMessage);
      this.eventData.eventEndDate = `${this.eventData.eventStartDate.split('T')[0]}T${time24}:00`;
      this.saveEvent();
      dfMessenger.renderCustomText('El evento se creó correctamente.');
    } else {
      dfMessenger.renderCustomText('Hora de finalización no válida. Por favor, proporciona la hora de finalización del evento en el formato HH:MM AM/PM.');
    }
  }
}

isValidTime(time: string): boolean {
  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d) ?([APap][Mm])$/;
  return timeRegex.test(time);
}

isValidDate(dateString: string, format: string): boolean {
  // Implementa la lógica para validar la fecha en el formato MM-DD-YYYY
  const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
  return regex.test(dateString);
}

convertToISODate(dateString: string, format: string): string {
  // Implementa la lógica para convertir la fecha de MM-DD-YYYY a ISO (YYYY-MM-DD)
  const [month, day, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
}



convertTo24HourFormat(time: string): string {
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier.toLowerCase() === 'pm') {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
}

getEventTypeByName(eventTypeName: string): IEventType | undefined {
  const eventTypes = this.eventTypesService.eventTypes$;
  return eventTypes().find(eventType => eventType.eventTypeName?.toLowerCase() === eventTypeName.toLowerCase());
}

saveEvent() {
  const userId = this.authService.getUser()?.id;
  if (!userId) {
    console.error('User ID not found');
    return;
  }

  const event: IEvent = {
    eventName: this.eventData.eventName!,
    eventDescription: this.eventData.eventDescription!,
    eventType: this.eventData.eventType!,
    eventStartDate: this.eventData.eventStartDate!,
    eventEndDate: this.eventData.eventEndDate!,
    userId: userId
  };

  this.eventService.save(event);
  this.isCreatingEvent = false; // Reset the flag after saving the event
}









































































































calcularEspacio(peopleAmount: number){
  let spaceperPerson = 1.5;
  let space = spaceperPerson * peopleAmount;
  return space + 'm²';


}












}
