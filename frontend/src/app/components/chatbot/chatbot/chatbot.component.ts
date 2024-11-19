import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChatbotComponent{

  constructor() {
  }

  ngAfterViewInit() {
    // Escucha el evento dfMessengerLoaded y usa renderCustomText
    window.addEventListener('dfMessengerLoaded', (response: any) => {
      //this.renderCustomCard()
    });

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

renderCustomCard() {
    const dfMessenger = document.querySelector('df-messenger') as any;
  const payload = [
    {
      "type": "info",
      "title": "Info item title",
      "subtitle": "Info item subtitle",
      "image": {
        "src": {
          "rawUrl": "https://example.com/images/logo.png"
        }
      },
      "actionLink": "https://example.com"
    },
    {
      "type": "info",
      "title": "Info item title",
      "subtitle": "Info item subtitle",
      "image": {
        "src": {
          "rawUrl": "https://example.com/images/logo.png"
        }
      },
      "actionLink": "https://example.com"
    }
  ];
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

  // Aquí puedes agregar lógica para mostrar una respuesta personalizada
  // if (userMessage.includes('evento')) {
  //   const customResponse = 'Parece que necesitas ayuda con un evento. ¿Puedes darme más detalles?';
  //   const dfMessenger = document.querySelector('df-messenger') as any;
  //   dfMessenger.renderCustomText(customResponse);
  // }

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
