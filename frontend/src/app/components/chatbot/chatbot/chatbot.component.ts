import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { EventsService } from '../../../services/event.service';
import { IEvent, ITask } from '../../../interfaces';
import { TaskService } from '../../../services/task.service';

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




  renderCustomText() {
    const customText = '¡Hola! ¿En qué tipo de evento necesitas ayuda?';
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.renderCustomText(customText);
  }

  renderCustomCard(events: IEvent[]) {
    const dfMessenger = document.querySelector('df-messenger') as any;
    const payload = events.map(event => ({
      type: "info",
      title: event.eventName,
      subtitle: `Fecha: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleDateString() : 'Fecha no disponible'} Hora: ${event.eventStartDate ? new Date(event.eventStartDate).toLocaleTimeString() : 'Hora no disponible'}`,
      actionLink: `http://localhost:4200/app/events`
    }));
    dfMessenger.renderCustomCard(payload);
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


   // Verificar si el usuario quiere ver la lista de eventos
   if (userMessage.toLowerCase().includes('lista de eventos')|| userMessage.toLowerCase().includes('ver eventos') || userMessage.toLowerCase().includes('mis eventos')) {
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

   // Verificar si el usuario quiere ver las tareas de un evento específico
if (userMessage.toLowerCase().includes('ver tareas del evento') ||
    userMessage.toLowerCase().includes('mostrar tareas del evento') ||
    userMessage.toLowerCase().includes('listar tareas del evento')) {
      const eventNameMatch = userMessage.match(/(ver|mostrar|listar) tareas del evento (.+)/i);
      if (eventNameMatch && eventNameMatch[2]) {
    const eventName = eventNameMatch[2].trim();
    this.taskService.getAllTasksByEventName(eventName).subscribe({
      next: (tasks: ITask[]) => {
        if (tasks.length > 0) {
          const dfMessenger = document.querySelector('df-messenger') as any;
          const cards = tasks.map(task => ({
            type: "info",
            title: task.taskName,
            subtitle: `Descripción: ${task.description ? task.description : 'No disponible'} \nProgreso: ${task.status} \nPrioridad: ${task.priority} \nFecha de Vencimiento: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Fecha no disponible'}`,
            //actionLink: `https://example.com/tasks/${}`
          }));
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

  // Capturar la cantidad de asistentes si el intent es preguntar_asistentes
  if (parameters && parameters.cantidad_personas) {
    const asistentes = parameters.cantidad_personas;
    console.log('Cantidad de asistentes:', asistentes);
    const espacioNecesario = this.calcularEspacio(asistentes);
    const respuestaPersonalizada = `Con ${asistentes} personas, necesitarás un espacio de ${espacioNecesario}. ¿Dónde será el evento?`;
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.renderCustomText(respuestaPersonalizada);
  }









}







































































































calcularEspacio(peopleAmount: number){
  let spaceperPerson = 1.5;
  let space = spaceperPerson * peopleAmount;
  return space + 'm²';


}












}
