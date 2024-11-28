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
      actionLink: `#event-link`
    }));
    dfMessenger.renderCustomCard(payload);
    setTimeout(() => {
      const eventLinks = document.querySelectorAll(`#event-link`);
      eventLinks.forEach(eventLink => {
        eventLink.addEventListener('click', () => {
          window.location.href = `http://localhost:4200/app/events`;
        });
      });
    }, 1000);
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
          const dfMessenger = document.querySelector('df-messenger') as any;
          const cards = tasks.map(task => ({
            type: "info",
            title: task.taskName,
            subtitle: `Descripción: ${task.description ? task.description : 'No disponible'} \nProgreso: ${task.status} \nPrioridad: ${task.priority} \nFecha de Vencimiento: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Fecha no disponible'}`,
            actionLink: `http://localhost:4200/task`
          }));
          dfMessenger.renderCustomCard(cards);
          dfMessenger.renderCustomText('Aquí tienes las tareas del evento. ¡Espero que te sean útiles!');
        } else {
          const dfMessenger = document.querySelector('df-messenger') as any;
          dfMessenger.renderCustomText(`No hay tareas registradas para el evento "${eventName}".`);
        }
      },
      error: (err: any) => {
        const dfMessenger = document.querySelector('df-messenger') as any;
        dfMessenger.renderCustomText('Hubo un error al obtener las tareas del evento. Por favor, inténtalo de nuevo más tarde.');
      }
    });
  } else {
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.renderCustomText('Por favor, especifica el nombre del evento.');
  }
}


responseReceived(event: any) {
  if (event.detail && event.detail.response) {
    const queryResult = event.detail.response.queryResult;
    if (queryResult) {
      const userMessage = queryResult.queryText;
      const botResponse = queryResult.fulfillmentText;
      const intentName = queryResult.intent?.displayName || '';
      const contexts = queryResult.outputContexts || [];
      const parameters = queryResult.parameters;
      this.handleUserResponse(userMessage, botResponse, parameters, intentName, contexts);
    }
  }
}

handleUserResponse(userMessage: string, botResponse: string, parameters: any, intentName: string, contexts: any[]) {
  const outputContexts = contexts || [];

    const isEventCreationContext = outputContexts.some((context: any) =>
    context.name && this.validEventContexts.some(validContext => context.name.includes(validContext))
  );
  if (isEventCreationContext) {
    this.crearEvento(parameters);
  }
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

isEventDetails(message: string): boolean {
  const eventDetailsRegex = /(.+), el dia (\d{2}-\d{2}-\d{4}) a las (.+)/;
  const result = eventDetailsRegex.test(message);
  return result;
}

waitForVendorResponse() {
  const listener = (event: any) => {
    const userMessage = event.detail.response.queryResult.queryText;
    this.userResponses.eventServices = userMessage;
    this.showVendorSuggestions();
  };
  if (this.vendorResponseListener) {
    window.removeEventListener('df-response-received', this.vendorResponseListener);
  }
  this.vendorResponseListener = listener;
  window.addEventListener('df-response-received', this.vendorResponseListener, { once: true });
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
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hour12}:${minuteStr} ${ampm}`;
}

getEventTypeByName(eventTypeName: string): IEventType | undefined {
  const eventTypes = this.eventTypesService.eventTypes$();
  if (!eventTypes || eventTypes.length === 0) {
    return undefined;
  }
  const normalizedEventTypeName = eventTypeName.trim().toLowerCase();
  const eventTypeWords = normalizedEventTypeName.split(' ');
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
    return;
  }

  const event: IEvent = {
    eventName: this.eventData.eventName!,
    eventDescription: this.eventData.eventDescription || undefined,
    eventType: this.eventData.eventType!,
    eventStartDate: this.eventData.eventStartDate!,
    eventEndDate: this.eventData.eventEndDate!,
    userId: userId
  };
  this.eventService.save(event);
  this.isCreatingEvent = false;
}

showVendorSuggestions() {
  const dfMessenger = document.querySelector('df-messenger') as any;

  const vendorAnswers = {
    ...this.eventData,
    ...this.userResponses
  };

  this.machineLearningService.computeVendorData({ vendor_answers: JSON.stringify(vendorAnswers) }).subscribe(response => {
    const suggestions = response.data.cosine_similarity;

    const uniqueVendors = new Map();
    suggestions.forEach((vendor: any) => {
      const vendorInfo = vendor.vendor_info;
      const vendorName = vendorInfo.match(/Vendor: ([^()]+)/)?.[1] || 'Nombre no especificado';
      const vendorLocation = vendorInfo.match(/Location: ([^,]+)/)?.[1] || 'No especificado';

      if (!uniqueVendors.has(vendorName)) {
        uniqueVendors.set(vendorName, {
          type: "info",
          title: vendorName,
          subtitle: `Servicios: ${vendor.service_name || 'No especificado'} \nUbicación: ${vendorLocation}`,
          actionLink: `http://localhost:4200/app/vendors`
        });
      }
    });
    const payload = Array.from(uniqueVendors.values());
    setTimeout(() => {
      dfMessenger.renderCustomCard(payload);
    }, 4000);

  });
  setTimeout(() => {
    dfMessenger.renderCustomText('Espero que estas sugerencias te sean útiles.😎');
  }, 9000);

  setTimeout(() => {
    dfMessenger.renderCustomText(this.defaultWelcomeMessage());
  }, 12000);

}

    crearEvento(parameters: any) {
      const dfMessenger = document.querySelector('df-messenger') as any;
      if (!this.eventData.eventType && parameters.EventType) {
        const eventType = this.getEventTypeByName(parameters.EventType);
        if (eventType) {
          this.eventData.eventType = eventType;
        }
        return;
      }
      if (!this.eventData.eventName && parameters.nombre_evento) {
        this.eventData.eventName = Array.isArray(parameters.nombre_evento) ? parameters.nombre_evento[0] : parameters.nombre_evento;
        return;
      }
      if (!this.eventData.eventDescription && parameters.descripcion_evento) {
        this.eventData.eventDescription = parameters.descripcion_evento;
        return;
      }
      if (parameters.fecha_evento) {
        const formattedDate = this.convertFromISOToMMDDYYYY(parameters.fecha_evento);
        if (this.isValidDate(formattedDate, 'MM-DD-YYYY')) {
          this.eventData.eventStartDate = this.convertToISODate(formattedDate, 'MM-DD-YYYY');
        }
        return;
      }
    if (this.eventData.eventStartDate && !this.eventData.eventStartDate.includes('T') && parameters.hora_inicio) {
      const formattedTime = this.convertFromISOTo12HourFormat(parameters.hora_inicio);
      if (this.isValidTime(formattedTime)) {
        const time24 = this.convertTo24HourFormat(formattedTime);
        this.eventData.eventStartDate += `T${time24}:00`;
      }
      return;
    }

    if (!this.eventData.eventEndDate && parameters.hora_final) {
      const formattedTime = this.convertFromISOTo12HourFormat(parameters.hora_final);
      if (this.isValidTime(formattedTime)) {
        const time24 = this.convertTo24HourFormat(formattedTime);
        this.eventData.eventEndDate = `${this.eventData.eventStartDate?.split('T')[0]}T${time24}:00`;
        this.saveEvent();
        setTimeout(() => {
          dfMessenger.renderCustomText('Generando Evento...');
        }, 1000);
        setTimeout(() => {
          dfMessenger.renderCustomText('Listo! Tu evento se ha creado.');
        }, 2000);

        setTimeout(() => {
          const infoResponse = [
            {
              "type": "info",
              "title": "Tu evento ha sido creado!",
              "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nDescripcion: ${this.eventData.eventDescription} \nFecha: ${this.convertFromISOToMMDDYYYY(this.eventData.eventStartDate!)}`,
              "actionLink": "http://localhost:4200/app/events"
            }
          ];
          console.log('Rendering custom card with infoResponse:', infoResponse);
          if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
            dfMessenger.renderCustomCard(infoResponse);
          } else {
            console.error('dfMessenger.renderCustomCard is not a function or dfMessenger is not found');
          }
        }, 4000);

        setTimeout(() => {
          dfMessenger.renderCustomText('Puedes acceder a tu lista de eventos dándole click sobre la tarjeta anterior.');
        }, 4000);

        setTimeout(() => {
          dfMessenger.renderCustomText(this.defaultWelcomeMessage());
        }, 4000);

      }
      return;
    }
    }

showEventsForTomorrow() {
  const dfMessenger = document.querySelector('df-messenger') as any;

  this.eventService.getEventsForTomorrow();

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
          "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nFecha: ${eventDate}\nHora Inicial: ${startTime}\nHora Final: ${endTime}`,
          "actionLink": "http://localhost:4200/app/events"
        };
      });
      console.log('Rendering custom cards with infoResponses:', infoResponses);
      const dfMessenger = document.querySelector('df-messenger') as any;
      if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
        infoResponses.forEach((infoResponse: any) => {
          dfMessenger.renderCustomCard([infoResponse]);
        });
      }
    }
  }, 2000);
  setTimeout(() => {
    dfMessenger.renderCustomText('Esta es tu lista de eventos de mañana.');
  }, 6000);
  setTimeout(() => {
    dfMessenger.renderCustomText(this.defaultWelcomeMessage());
  }, 10000);
}

showEventsForCurrentWeek() {
  const dfMessenger = document.querySelector('df-messenger') as any;

  this.eventService.getEventsForCurrentWeek();

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
          "subtitle": `Nombre del Evento: ${this.eventData.eventName}\nFecha: ${eventDate}\nHora Inicial: ${startTime}\nHora Final: ${endTime}`,
          "actionLink": "http://localhost:4200/app/events"
        };
      });

      console.log('Rendering custom cards with infoResponses:', infoResponses);
      const dfMessenger = document.querySelector('df-messenger') as any;
      if (dfMessenger && typeof dfMessenger.renderCustomCard === 'function') {
        infoResponses.forEach((infoResponse: any) => {
          dfMessenger.renderCustomCard([infoResponse]);
        });
      }
    }
  }, 4000);


  setTimeout(() => {
    dfMessenger.renderCustomText('Esta es tu lista de eventos de esta semana.');

  }, 6000);


  setTimeout(() => {
    dfMessenger.renderCustomText(this.defaultWelcomeMessage());

  }, 10000);



}

eventSuggestions() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  const suggestions_answers = this.userResponses.labels || '';
  this.machineLearningService.computeEventSuggestionsData({ suggestions_answers }).subscribe(response => {
    const suggestions = response.data.suggestions;
    const uniqueSuggestions = new Map();
    suggestions.forEach((suggestion: string, index: number) => {
      const suggestionTitle = `Sugerencia de Evento ${index + 1}`;
      const suggestionSubtitle = suggestion;
      uniqueSuggestions.set(suggestionTitle, {
        type: "info",
        subtitle: suggestionSubtitle,
        actionLink: `http://localhost:4200/app/events`
      });
    });
    const payload = Array.from(uniqueSuggestions.values());
    setTimeout(() => {
      dfMessenger.renderCustomCard(payload);
    }, 4000);
  });

  setTimeout(() => {
    dfMessenger.renderCustomText('Espero que estas sugerencias te sean útiles.😎');
  }, 7000);

  setTimeout(() => {
    dfMessenger.renderCustomText(this.defaultWelcomeMessage());
  }, 9000);
}

defaultWelcomeMessage() {
  const dfMessenger = document.querySelector('df-messenger') as any;
  dfMessenger.renderCustomText('Hola! Yo soy el agente EventHub. 🤖\n\n' +
    'Tengo disponibles estas funcionalidades:\n\n' +
    'Puedo ayudarte a crear un evento. 🎉\n\n' +
    'Puedo darte sugerencias de proveedores de nuestra base de datos. 🛠️\n\n' +
    'Puedo decirte si tienes un evento agendado para esta semana o para mañana. 📅\n\n' +
    'Puedo darte sugerencias de planes para tu evento. 💡\n\n' +
    '¿Tienes alguna pregunta o necesitas ayuda? No dudes en preguntar. 🤔\n\n' +
    '¡Estoy aquí para ayudarte! 😊');
}

waitForEventSuggestionsResponse() {

  const listener = (event: any) => {
    const userMessage = event.detail.response.queryResult.queryText;
    this.userResponses.labels = userMessage;
    this.eventSuggestions();
  };
  if (this.vendorResponseListener) {
    window.removeEventListener('df-response-received', this.vendorResponseListener);
  }
  this.vendorResponseListener = listener;
  window.addEventListener('df-response-received', this.vendorResponseListener, { once: true });
}











}
