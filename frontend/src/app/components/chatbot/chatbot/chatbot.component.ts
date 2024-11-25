import { VendorcategoryService } from './../../../services/vendorcategory.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EventsService } from '../../../services/event.service';
import { IEvent, IEventType, ITask, IVendor, IVendorService } from '../../../interfaces';
import { TaskService } from '../../../services/task.service';
import { EventTypesService } from '../../../services/eventtype.service';
import { MachineLearningService } from '../../../services/machinelearning.service';

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
  public vendorService!: IVendorService;
  private isCreatingEvent: boolean = false;
  isVendorQuestionFlow: boolean = false;
  machineLearningService: MachineLearningService = new MachineLearningService();
  userResponses: { eventLocation?: string; eventServices?: string } = {};

  constructor() {
    this.eventTypesService.getAll();

  }









  ngAfterViewInit() {
    window.addEventListener('dfMessengerLoaded', (response: any) => {
      this.sendWelcomeMessage();
    });

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
      subtitle: `Descripción: ${event.eventDescription} \nFecha: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'Fecha no disponible'} \nInicio del Evento: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'} \nFinalización del Evento: ${event.eventEndDate ? new Date(event.eventEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'}`,
      actionLink: `#event-link` // Usar un identificador genérico
    }));
    dfMessenger.renderCustomCard(payload);

    // Agregar manejador de eventos para redirigir en la misma página
    setTimeout(() => {
      const eventLinks = document.querySelectorAll(`#event-link`);
      eventLinks.forEach(eventLink => {
        eventLink.addEventListener('click', () => {
          window.location.href = `http://localhost:4200/app/events`;
        });
      });
    }, 1000); // Esperar un momento para asegurarse de que los elementos estén en el DOM
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
  } else if (this.isVendorQuestionFlow) {
    this.handleVendorQuestions(userMessage);
  } else if (this.isVendorRequest(userMessage)) {
    this.startVendorQuestionFlow();
  } else if (this.isEventDetails(userMessage)) {
    console.log('Event details detected');
    this.createEventFromMessage(userMessage);
  } else {
    console.log('No matching condition found');
  }
}


sendWelcomeMessage() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  const welcomeMessage = `Bienvenido a Eventhub! Si deseas crear un evento puedes brindarme los detalles y te lo creare automaticamente aqui tienes un ejemplo:

  Cumpleaños de Jorge, el dia 11-28-2024 a las 3:00 PM
  \nBoda de Carlos y Maria, el dia 12-15-2024 a las 12:00 PM`;
  dfMessenger.renderCustomText(welcomeMessage);
}

isEventDetails(message: string): boolean {
  console.log('Checking if message contains event details');
  const eventDetailsRegex = /(.+), el dia (\d{2}-\d{2}-\d{4}) a las (.+)/;
  const result = eventDetailsRegex.test(message);
  console.log('Event details regex test result:', result);
  return result;
}

createEventFromMessage(message: string) {
  console.log('Creating event from message:', message);
  const dfMessenger = document.querySelector('df-messenger') as any;
  const eventDetailsRegex = /(.+), el dia (\d{2}-\d{2}-\d{4}) a las (.+)/;
  const match = message.match(eventDetailsRegex);

  if (match) {
    const [_, eventName, eventDate, startTime] = match;

    console.log('Event details:', { eventName, eventDate, startTime });

    const eventType = this.getEventTypeByName(eventName.split(' ')[0].trim()); // Asumiendo que el tipo de evento es la primera palabra del nombre del evento
    if (!eventType) {
      dfMessenger.renderCustomText('Tipo de evento no válido. Por favor, proporciona un tipo de evento válido.');
      return;
    }

    if (this.isValidDate(eventDate, 'MM-DD-YYYY') && this.isValidTime(startTime)) {
      console.log('Date and time are valid');
      this.eventData = {
        eventType,
        eventName,
        eventStartDate: this.convertToISODate(eventDate, 'MM-DD-YYYY') + 'T' + this.convertTo24HourFormat(startTime),
        eventEndDate: this.convertToISODate(eventDate, 'MM-DD-YYYY') + 'T00:00:00', // Hora final por defecto a las 12:00 AM
        eventDescription: undefined // Asignar undefined si no hay descripción
      };

      this.saveEvent();
      dfMessenger.renderCustomText('Genial! Te creare el evento de inmediato. Por favor espera mientras genero el evento.');

      setTimeout(() => {
        const infoResponse = [
          {
            "type": "info",
            "title": "Tu evento ha sido creado!",
            "subtitle": `Nombre del Evento: ${eventName}\nFecha: ${eventDate}\nHora Inicial: ${startTime}\nHora Final: 12:00 AM`,
            "image": {
              "src": {
                "rawUrl": "https://example.com/images/logo.png" // Puedes cambiar esta URL a una imagen relevante
              }
            },
            "actionLink": "http://localhost:4200/app/events" // Puedes cambiar este enlace a uno relevante
          }
        ];
        console.log('Rendering custom card with infoResponse:', infoResponse);
        if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
          dfMessenger.renderCustomCard(infoResponse);
        } else {
          console.error('dfMessenger.renderCustomCard is not a function or dfMessenger is not found');
        }
      }, 2000); // 2 segundos de retraso

      setTimeout(() => {
        dfMessenger.renderCustomText('Puedes acceder a tu lista de eventos dándole click sobre la tarjeta.');
      }, 4000); // 4 segundos de retraso

      setTimeout(() => {
        dfMessenger.renderCustomText('Si deseas te puedo sugerir proveedores para tu evento. \nAqui tienes algunos ejemplos de servicios solo escribe los que necesitas y te dare mis recomendaciones (catering, música, decoración)');
        this.waitForVendorResponse();
      }, 6000); // 6 segundos de retraso
    } else {
      console.log('Invalid date or time:', { eventDate, startTime });
      dfMessenger.renderCustomText('Por favor, proporciona una fecha y hora válidas.');
    }
  } else {
    dfMessenger.renderCustomText('No pude entender los detalles del evento. Por favor, proporciona los detalles en el formato correcto.');
  }
}
waitForVendorResponse() {
  window.addEventListener('df-response-received', (event: any) => {
    const userMessage = event.detail.response.queryResult.queryText;
    if (!this.userResponses.eventServices) {
      this.userResponses.eventServices = userMessage;
      this.showVendorSuggestions();
    }
  }, { once: true });
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
  this.eventData = {};
  this.isCreatingEvent = true;
  this.isVendorQuestionFlow = true;
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
  console.log('Buscando tipo de evento:', eventTypeName);
  const eventTypes = this.eventTypesService.eventTypes$();
  console.log('Tipos de eventos disponibles:', eventTypes);
  if (!eventTypes || eventTypes.length === 0) {
    console.error('No se encontraron tipos de eventos');
    return undefined;
  }
  const normalizedEventTypeName = eventTypeName.trim().toLowerCase();
  const eventTypeWords = normalizedEventTypeName.split(' ');
  console.log('Normalized event type name:', normalizedEventTypeName);
  return eventTypes.find(eventType => {
    const normalizedEventType = eventType.eventTypeName?.trim().toLowerCase();
    if (!normalizedEventType) return false;
    const eventTypeWordsArray = normalizedEventType.split(' ');
    return eventTypeWords.every(word => eventTypeWordsArray.includes(word));
  });
}


saveEvent() {
  const userId = this.authService.getUser()?.id;
  if (!userId) {
    console.error('User ID not found');
    return;
  }

  const event: IEvent = {
    eventName: this.eventData.eventName!,
    eventDescription: this.eventData.eventDescription || undefined, // Asignar null si no hay descripción
    eventType: this.eventData.eventType!,
    eventStartDate: this.eventData.eventStartDate!,
    eventEndDate: this.eventData.eventEndDate!,
    userId: userId
  };

  console.log('Saving event:', event);

  this.eventService.save(event);
  this.isCreatingEvent = false; // Reset the flag after saving the event
}



handleVendorQuestions(userMessage: string) {
  const dfMessenger = document.querySelector('df-messenger') as any;

  if (this.isVendorRequest(userMessage)) {
    this.resetVendorQuestionFlow();
    this.startVendorQuestionFlow();
    return;
  }

  if (!this.eventData.eventName) {
    this.eventData.eventName = userMessage;
    dfMessenger.renderCustomText('¿Qué tipo de evento desea realizar?');
  } else if (!this.eventData.eventType) {
    const eventType = this.getEventTypeByName(userMessage);
    if (eventType) {
      this.eventData.eventType = eventType;
      dfMessenger.renderCustomText('Por favor, proporciona la ubicación del evento.');
    } else {
      dfMessenger.renderCustomText('Tipo de evento no válido. Por favor, proporciona un tipo de evento válido.');
    }
  } else if (!this.userResponses.eventLocation) {
    this.userResponses.eventLocation = userMessage;
    dfMessenger.renderCustomText('¿Qué servicios necesitas para el evento? (e.g., catering, música, decoración)');
  } else if (!this.userResponses.eventServices) {
    this.userResponses.eventServices = userMessage;
    this.showVendorSuggestions();
  }
}

showVendorSuggestions() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  dfMessenger.renderCustomText('Aquí tienes algunas sugerencias de proveedores para tu evento: ...');

  // Combina eventData y userResponses para enviar al método de sugerencias
  const vendorAnswers = {
    ...this.eventData,
    ...this.userResponses
  };

  // Llama al servicio para obtener las sugerencias de vendors
  this.machineLearningService.computeVendorData({ vendor_answers: JSON.stringify(vendorAnswers) }).subscribe(response => {
    console.log('Response from server:', response); // Log the response to inspect its structure
    const suggestions = response.data.cosine_similarity;

    // Filtrar y organizar la información para evitar duplicados
    const uniqueVendors = new Map();
    suggestions.forEach((vendor: any) => {
      const vendorInfo = vendor.vendor_info;
      const vendorName = vendorInfo.match(/Vendor: ([^()]+)/)?.[1] || 'Nombre no especificado';
      const vendorCategory = vendorInfo.match(/Category: ([^()]+)/)?.[1] || 'No especificado';
      const vendorLocation = vendorInfo.match(/Location: ([^,]+)/)?.[1] || 'No especificado';

      if (!uniqueVendors.has(vendorName)) {
        uniqueVendors.set(vendorName, {
          type: "info",
          title: vendorName,
          subtitle: `Categoría: ${vendorCategory} \nServicios: ${vendor.service_name || 'No especificado'} \nUbicación: ${vendorLocation}`,
          actionLink: `http://localhost:4200/app/vendors`
        });
      }
    });

    const payload = Array.from(uniqueVendors.values());
    dfMessenger.renderCustomCard(payload);
  });

  setTimeout(() => {
    dfMessenger.renderCustomText('Espero que estas sugerencias te sean útiles.');
  }, 2000);
}

isVendorRequest(userMessage: string): boolean {
  return userMessage.toLowerCase().includes('quiero hacer un evento');
}

startVendorQuestionFlow() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  this.isVendorQuestionFlow = true;
  dfMessenger.renderCustomText('¿Qué nombre le gustaría dar al evento?');
}






resetVendorQuestionFlow() {
  this.eventData = {
    eventName: '',
    eventDescription: '',
    eventType: undefined,
    eventStartDate: '',
    eventEndDate: ''
  };
  this.userResponses = {
    eventLocation: '',
    eventServices: ''
  };
}


















































































calcularEspacio(peopleAmount: number){
  let spaceperPerson = 1.5;
  let space = spaceperPerson * peopleAmount;
  return space + 'm²';


}












}
