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
  userResponses: { eventLocation?: string; eventServices?: string; labels?: string } = {};
  private vendorResponseListener: any;
  private validEventContexts: string[] = [
    "tipo_evento-followup",
    "nombre_evento-followup",
    "descripcion_evento-followup",
    "descripcion_dada",
    "hora_evento-followup",
    "hora_final_evento-followup"
  ];
  constructor() {
    this.eventTypesService.getAll();

  }










  ngAfterViewInit() {
    window.addEventListener('dfMessengerLoaded', (response: any) => {
      //this.sendWelcomeMessage();
    });

    window.addEventListener('df-response-received', (event: any) => {
      this.responseReceived(event);
    });
  }


  renderCustomCard(events: IEvent[]) {
    const dfMessenger = document.querySelector('df-messenger') as any;
    const payload = events.map(event => ({
      type: "info",
      title: event.eventName,
      subtitle: `Fecha: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'Fecha no disponible'} \nInicio del Evento: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'} \nFinalización del Evento: ${event.eventEndDate ? new Date(event.eventEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora no disponible'}`,
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

// handleAttendees(asistentes: number) {
//   console.log('Cantidad de asistentes:', asistentes);
//   const espacioNecesario = this.calcularEspacio(asistentes);
//   const respuestaPersonalizada = `Con ${asistentes} personas, necesitarás un espacio de ${espacioNecesario}.`;
//   const dfMessenger = document.querySelector('df-messenger') as any;
//   dfMessenger.renderCustomText(respuestaPersonalizada);
// }


responseReceived(event: any) {
  if (event.detail && event.detail.response) {
    console.log('Event Detail Response:', event.detail.response); // Log the response to inspect its structure
    const queryResult = event.detail.response.queryResult;
    if (queryResult) {
      const userMessage = queryResult.queryText;
      const botResponse = queryResult.fulfillmentText;
      const intentName = queryResult.intent?.displayName || '';
      const contexts = queryResult.outputContexts || [];
      const parameters = queryResult.parameters;
      this.handleUserResponse(userMessage, botResponse, parameters, intentName, contexts);
    } else {
      console.error('Invalid queryResult structure:', event.detail.response);
    }
  } else {
    console.error('Invalid event structure:', event);
  }
}

handleUserResponse(userMessage: string, botResponse: string, parameters: any, intentName: string, contexts: any[]) {
  console.log('User Message:', userMessage);
  console.log('Bot Response:', botResponse);



  // Verifica si alguno de los contextos activos es válido para la creación de eventos
  const outputContexts = contexts || [];

  // Verifica si alguno de los contextos de salida contiene un contexto válido para la creación de eventos
    const isEventCreationContext = outputContexts.some((context: any) =>
    context.name && this.validEventContexts.some(validContext => context.name.includes(validContext))
  );
  // Si estamos en un contexto válido, maneja la creación del evento
  if (isEventCreationContext) {
    this.crearEvento(parameters);
  } else {
    console.log('No estamos en un contexto de creación de eventos.');
  }




  // Prioridad 1: Petición para crear un evento.


  // // Prioridad 2: Petición para ver detalles de un evento.
  // if (this.isEventDetails(userMessage)) {
  //   console.log('Event details detected.');
  //   //this.createEventFromMessage(userMessage);
  //   return;
  // }

  // // Prioridad 3: Petición para listar eventos.
  // if (this.isEventListRequest(userMessage)) {
  //   //this.listEvents();
  //   return;
  // }

  // // Prioridad 4: Petición para listar tareas.
  // if (this.isTaskListRequest(userMessage)) {
  //   //this.listTasks(userMessage);
  //   return;
  // }

// Verifica si el nombre del intent hace match para mostrar eventos de mañana
  if (intentName === 'eventbyDay') {
    this.showEventsForTomorrow();
  }

  if (intentName === 'eventbyWeek') {
    this.showEventsForCurrentWeek();
  }

  if(intentName === 'vendor_Suggestions'){
    this.waitForVendorResponse();
  }
  if(intentName === 'event_Suggestions'){
    this.waitForEventSuggestionsResponse();
  }
}


// sendWelcomeMessage() {
//   const dfMessenger = document.querySelector('df-messenger') as any;
//   const welcomeMessage = `Bienvenido a Eventhub! Si deseas crear un evento puedes brindarme los detalles y te lo creare automaticamente aqui tienes un ejemplo:

//   Cumpleaños de Jorge, el dia 11-28-2024 a las 3:00 PM
//   \nBoda de Carlos y Maria, el dia 12-15-2024 a las 12:00 PM`;
//   dfMessenger.renderCustomText(welcomeMessage);
// }

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


        // Pregunta al usuario cuántas personas asistirán al evento
        // setTimeout(() => {
        //   dfMessenger.renderCustomText('¿Cuántas personas asistirán a tu evento?');
        //   this.waitForAttendeesResponse();
        // }, 6000); // 6 segundos de retraso


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
  // Define el listener
  const listener = (event: any) => {
    const userMessage = event.detail.response.queryResult.queryText;
    console.log('Listener triggered with userMessage:', userMessage);
    this.userResponses.eventServices = userMessage;
    console.log('Calling showVendorSuggestions with userMessage:', userMessage);
    this.showVendorSuggestions();
  };

  // Elimina el listener anterior si existe
  if (this.vendorResponseListener) {
    console.log('Removing previous listener');
    window.removeEventListener('df-response-received', this.vendorResponseListener);
  }

  // Almacena la referencia del nuevo listener
  this.vendorResponseListener = listener;

  // Agrega el nuevo listener
  console.log('Adding new listener');
  window.addEventListener('df-response-received', this.vendorResponseListener, { once: true });
}


manualUsuario(userMessage: string): boolean {
  if (userMessage.toLowerCase() === '/ayuda') {
    const dfMessenger = document.querySelector('df-messenger') as any;
    const helpText = `
      Aquí tienes los comandos disponibles:
      - Para listar tus eventos escribe la siguiente palabra: mis eventos.
      - Para ver las tareas de un evento específico: ver tareas del evento [nombre del evento].

    `;
    dfMessenger.renderCustomText(helpText);
    return true;
  }
  return false;
}



// isEventCreationRequest(userMessage: string): boolean {
//   return userMessage.toLowerCase().includes('crear evento');
// }

// startEventCreationFlow() {
//   const dfMessenger = document.querySelector('df-messenger') as any;
//   dfMessenger.renderCustomText('Por favor, proporciona el nombre del evento.');
//   this.eventData = {};
//   this.isCreatingEvent = true;
//   this.isVendorQuestionFlow = true;
// }

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
  if (format === 'MM-DD-YYYY') {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;
    return regex.test(dateString);
  } else if (format === 'YYYY-MM-DDTHH:mm:ssZ') {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/;
    return regex.test(dateString);
  } else if (format === 'YYYY-MM-DD') {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  }
  return false;
}

convertToISODate(dateString: string, format: string): string {
  if (format === 'MM-DD-YYYY') {
    const [month, day, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  return '';
}

convertFromISOToMMDDYYYY(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}


convertTo24HourFormat(timeString: string): string {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier.toUpperCase() === 'PM' && hours !== '12') {
    hours = String(parseInt(hours, 10) + 12);
  }
  if (modifier.toUpperCase() === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours}:${minutes}`;
}

convertFromISOTo12HourFormat(timeString: string): string {
  const date = new Date(timeString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hour12}:${minuteStr} ${ampm}`;
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



// handleVendorQuestions(userMessage: string) {
//   const dfMessenger = document.querySelector('df-messenger') as any;

//   if (this.isVendorRequest(userMessage)) {
//     this.resetVendorQuestionFlow();
//     this.startVendorQuestionFlow();
//     return;
//   }

//   if (!this.eventData.eventName) {
//     this.eventData.eventName = userMessage;
//     dfMessenger.renderCustomText('¿Qué tipo de evento desea realizar?');
//   } else if (!this.eventData.eventType) {
//     const eventType = this.getEventTypeByName(userMessage);
//     if (eventType) {
//       this.eventData.eventType = eventType;
//       dfMessenger.renderCustomText('Por favor, proporciona la ubicación del evento.');
//     } else {
//       dfMessenger.renderCustomText('Tipo de evento no válido. Por favor, proporciona un tipo de evento válido.');
//     }
//   } else if (!this.userResponses.eventLocation) {
//     this.userResponses.eventLocation = userMessage;
//     dfMessenger.renderCustomText('¿Qué servicios necesitas para el evento? (e.g., catering, música, decoración)');
//   } else if (!this.userResponses.eventServices) {
//     this.userResponses.eventServices = userMessage;
//     this.showVendorSuggestions();
//   }
// }

showVendorSuggestions() {
  const dfMessenger = document.querySelector('df-messenger') as any;

  // Combina eventData y userResponses para enviar al método de sugerencias
  const vendorAnswers = {
    ...this.eventData,
    ...this.userResponses
  };

  console.log('Calling computeVendorData with vendorAnswers:', vendorAnswers);

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
    console.log('Rendering custom card with payload:', payload);
    dfMessenger.renderCustomCard(payload);
  });

  setTimeout(() => {
    dfMessenger.renderCustomText('Espero que estas sugerencias te sean útiles.');
  }, 2000);
}





// isVendorRequest(userMessage: string): boolean {
//   return userMessage.toLowerCase().includes('quiero hacer un evento');
// }

// startVendorQuestionFlow() {
//   const dfMessenger = document.querySelector('df-messenger') as any;
//   this.isVendorQuestionFlow = true;
//   dfMessenger.renderCustomText('¿Qué nombre le gustaría dar al evento?');
// }






// resetVendorQuestionFlow() {
//   this.eventData = {
//     eventName: '',
//     eventDescription: '',
//     eventType: undefined,
//     eventStartDate: '',
//     eventEndDate: ''
//   };
//   this.userResponses = {
//     eventLocation: '',
//     eventServices: ''
//   };
// }




isContextActive(contexts: any[], contextName: string): boolean {
  return contexts.some((context) => context.name.includes(contextName));
}
















crearEvento(parameters: any) {
  const dfMessenger = document.querySelector('df-messenger') as any;
  // Tipo de evento
  if (!this.eventData.eventType && parameters.EventType) {
    const eventType = this.getEventTypeByName(parameters.EventType);
    if (eventType) {
      this.eventData.eventType = eventType;
      console.log(`Tipo de evento almacenado: ${eventType}`);
    } else {
      console.warn('Tipo de evento no válido.');
    }
    return;
  }

  // Nombre del evento
  if (!this.eventData.eventName && parameters.nombre_evento) {
    this.eventData.eventName = Array.isArray(parameters.nombre_evento) ? parameters.nombre_evento[0] : parameters.nombre_evento;
    console.log(`Nombre del evento almacenado: ${this.eventData.eventName}`);
    return;
  }

  // Descripción del evento
  if (!this.eventData.eventDescription && parameters.descripcion_evento) {
    this.eventData.eventDescription = parameters.descripcion_evento;
    console.log(`Descripción del evento almacenada: ${this.eventData.eventDescription}`);
    return;
  }

  if (parameters.fecha_evento) {
    console.log(`Fecha del parámetro: ${parameters.fecha_evento}`);
    const formattedDate = this.convertFromISOToMMDDYYYY(parameters.fecha_evento);
    console.log(`Fecha formateada: ${formattedDate}`);
    if (this.isValidDate(formattedDate, 'MM-DD-YYYY')) {
      this.eventData.eventStartDate = this.convertToISODate(formattedDate, 'MM-DD-YYYY');
      console.log(`Fecha de inicio almacenada: ${this.eventData.eventStartDate}`);
    } else {
      console.warn('Fecha de inicio no válida.');
    }
    return;
  }

  // Hora inicial
if (this.eventData.eventStartDate && !this.eventData.eventStartDate.includes('T') && parameters.hora_inicio) {
  const formattedTime = this.convertFromISOTo12HourFormat(parameters.hora_inicio);
  if (this.isValidTime(formattedTime)) {
    const time24 = this.convertTo24HourFormat(formattedTime);
    this.eventData.eventStartDate += `T${time24}:00`;
    console.log(`Hora de inicio almacenada: ${this.eventData.eventStartDate}`);
  } else {
    console.warn('Hora de inicio no válida.');
  }
  return;
}

// Hora final
if (!this.eventData.eventEndDate && parameters.hora_final) {
  const formattedTime = this.convertFromISOTo12HourFormat(parameters.hora_final);
  if (this.isValidTime(formattedTime)) {
    const time24 = this.convertTo24HourFormat(formattedTime);
    this.eventData.eventEndDate = `${this.eventData.eventStartDate?.split('T')[0]}T${time24}:00`;
    console.log(`Hora de finalización almacenada: ${this.eventData.eventEndDate}`);
    this.saveEvent(); // Guarda el evento completo

    setTimeout(() => {
      dfMessenger.renderCustomText('Generando Evento...');
    }, 1000); // 1 segundos de retraso


    setTimeout(() => {
      dfMessenger.renderCustomText('Listo! Su evento se ha creado.');
    }, 2000); // 2 segundos de retraso




    setTimeout(() => {
      const infoResponse = [
        {
          "type": "info",
          "title": "Tu evento ha sido creado!",
          "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nDescripcion: ${this.eventData.eventDescription} \nFecha: ${this.eventData.eventStartDate}`,
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
    }, 4000); // 2 segundos de retraso

    setTimeout(() => {
      dfMessenger.renderCustomText('Puedes acceder a tu lista de eventos dándole click sobre la tarjeta.');
    }, 4000); // 4 segundos de retraso

    setTimeout(() => {
      dfMessenger.renderCustomText('Hola! Yo soy el agende EventHub.\n😊Tengo disponibles estas funcionalides:\nPuedo ayudarte a crear un evento.\nPuedo darte sugerencia de proveedores de nuestra base de datos.\nSugerencias de que hacer con un evento.\nPuedo ayudarte con darte informacion de tus eventos.\nPuedo darte sugerencias de planes para tu evento.');
    }, 4000); // 4 segundos de retraso







    console.log('El evento se ha guardado correctamente:', this.eventData);
  } else {
    console.warn('Hora de finalización no válida.');
  }
  return;
}

  // Verificación final
  if (this.eventData.eventType && this.eventData.eventName && this.eventData.eventDescription &&
      this.eventData.eventStartDate && this.eventData.eventEndDate) {
    console.log('El evento está completo:', this.eventData);
  }

  // Verifica si se completó la creación del evento
  if (this.eventData.eventName && this.eventData.eventDescription && this.eventData.eventType &&
    this.eventData.eventStartDate && this.eventData.eventEndDate) {
    console.log('El evento se ha completado exitosamente:', this.eventData);
  }
}









sendFollowUpEvent(eventName: string) {
  const dfMessenger = document.querySelector('df-messenger') as any;
  dfMessenger.renderCustomText(eventName);
}





// waitForAttendeesResponse() {
//   const dfMessenger = document.querySelector('df-messenger') as any;
//   dfMessenger.addEventListener('df-response-received', (event: any) => {
//     const queryResult = event.detail.response.queryResult;
//     if (queryResult) {
//       const userMessage = queryResult.queryText;
//       const attendeesMatch = userMessage.match(/(\d+)/);
//       if (attendeesMatch) {
//         const numberOfAttendees = parseInt(attendeesMatch[1], 10);
//         this.handleAttendees(numberOfAttendees);
//       } else {
//         dfMessenger.renderCustomText('Por favor, proporciona un número válido de asistentes.');
//       }
//     }
//   }, { once: true });
// }





















































// calcularEspacio(peopleAmount: number){
//   let spaceperPerson = 1.5;
//   let space = spaceperPerson * peopleAmount;
//   return space + 'm²';


// }




showEventsForTomorrow() {
  this.eventService.getEventsForTomorrow();

  // Esperar un momento para asegurarse de que los datos se hayan actualizado
  setTimeout(() => {
    const events = this.eventService.events$();
    if (events && events.length > 0) {
      const infoResponses = events.map(event => {
        this.eventData = {
          eventType: event.eventType,
          eventName: event.eventName,
          eventStartDate: event.eventStartDate,
          eventEndDate: event.eventEndDate,
          eventDescription: event.eventDescription
        };

        const eventDate = this.convertFromISOToMMDDYYYY(event.eventStartDate!);
        const startTime = this.convertFromISOTo12HourFormat(event.eventStartDate!);
        const endTime = this.convertFromISOTo12HourFormat(event.eventEndDate!);

        return {
          "type": "info",
          "title": "Tu evento para mañana!",
          "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nFecha: ${eventDate}\nHora Inicial: ${startTime}\nHora Final: ${endTime}`,
          "image": {
            "src": {
              "rawUrl": "https://example.com/images/logo.png" // Puedes cambiar esta URL a una imagen relevante
            }
          },
          "actionLink": "http://localhost:4200/app/events" // Puedes cambiar este enlace a uno relevante
        };
      });

      console.log('Rendering custom cards with infoResponses:', infoResponses);
      const dfMessenger = document.querySelector('df-messenger') as any;
      if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
        infoResponses.forEach((infoResponse: any) => {
          dfMessenger.renderCustomCard([infoResponse]);
        });
      } else {
        console.error('dfMessenger.renderCustomCard is not a function or dfMessenger is not found');
      }
    } else {
      console.warn('No events found for tomorrow.');
    }
  }, 2000); // Ajusta el tiempo de espera según sea necesario
}


showEventsForCurrentWeek() {
  this.eventService.getEventsForCurrentWeek();

  // Esperar un momento para asegurarse de que los datos se hayan actualizado
  setTimeout(() => {
    const events = this.eventService.events$();
    if (events && events.length > 0) {
      const infoResponses = events.map(event => {
        this.eventData = {
          eventType: event.eventType,
          eventName: event.eventName,
          eventStartDate: event.eventStartDate,
          eventEndDate: event.eventEndDate,
          eventDescription: event.eventDescription
        };

        const eventDate = this.convertFromISOToMMDDYYYY(event.eventStartDate!);
        const startTime = this.convertFromISOTo12HourFormat(event.eventStartDate!);
        const endTime = this.convertFromISOTo12HourFormat(event.eventEndDate!);

        return {
          "type": "info",
          "title": "Tus eventos de esta semana!",
          "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nFecha: ${eventDate}\nHora Inicial: ${startTime}\nHora Final: ${endTime}`,
          "image": {
            "src": {
              "rawUrl": "https://example.com/images/logo.png" // Puedes cambiar esta URL a una imagen relevante
            }
          },
          "actionLink": "http://localhost:4200/app/events" // Puedes cambiar este enlace a uno relevante
        };
      });

      console.log('Rendering custom cards with infoResponses:', infoResponses);
      const dfMessenger = document.querySelector('df-messenger') as any;
      if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
        infoResponses.forEach((infoResponse: any) => {
          dfMessenger.renderCustomCard([infoResponse]);
        });
      } else {
        console.error('dfMessenger.renderCustomCard is not a function or dfMessenger is not found');
      }
    } else {
      console.warn('No events found for tomorrow.');
    }
  }, 2000); // Ajusta el tiempo de espera según sea necesario
}





eventSuggestions() {
  const dfMessenger = document.querySelector('df-messenger') as any;

  // Combina userResponses para enviar al método de sugerencias
  const suggestions_answers = {
    ...this.userResponses
  };

  console.log('Calling computeEventSuggestionsData with requestPayload:', { suggestions_answers });

  // Llama al servicio para obtener las sugerencias de eventos
  this.machineLearningService.computeEventSuggestionsData({ suggestions_answers: JSON.stringify(suggestions_answers) }).subscribe(response => {
    console.log('Response from server:', response); // Log the response to inspect its structure
    const suggestions = response.data.suggestions;

    // Filtrar y organizar la información para evitar duplicados
    const uniqueSuggestions = new Map();
    suggestions.forEach((suggestion: string, index: number) => {
      const suggestionTitle = `Sugerencia de Evento ${index + 1}`;
      const suggestionSubtitle = suggestion;

      uniqueSuggestions.set(suggestionTitle, {
        type: "info",
        title: suggestionTitle,
        subtitle: suggestionSubtitle,
        actionLink: `http://localhost:4200/app/events`
      });
    });

    const payload = Array.from(uniqueSuggestions.values());
    console.log('Rendering custom card with payload:', payload);
    dfMessenger.renderCustomCard(payload);
  });

  setTimeout(() => {
    dfMessenger.renderCustomText('Espero que estas sugerencias te sean útiles.');
  }, 2000);
}


















waitForEventSuggestionsResponse() {
  // Define el listener
  const listener = (event: any) => {
    const userMessage = event.detail.response.queryResult.queryText;
    console.log('Listener triggered with userMessage:', userMessage);
    this.userResponses.labels = userMessage;
    console.log('Calling showVendorSuggestions with userMessage:', userMessage);
    this.eventSuggestions();
  };

  // Elimina el listener anterior si existe
  if (this.vendorResponseListener) {
    console.log('Removing previous listener');
    window.removeEventListener('df-response-received', this.vendorResponseListener);
  }

  // Almacena la referencia del nuevo listener
  this.vendorResponseListener = listener;

  // Agrega el nuevo listener
  console.log('Adding new listener');
  window.addEventListener('df-response-received', this.vendorResponseListener, { once: true });


}



}
