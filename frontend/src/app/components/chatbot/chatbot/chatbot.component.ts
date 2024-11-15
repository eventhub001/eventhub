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
       //this.renderCustomText();
        this.renderCustomCard();

    });
  }

  renderCustomText() {
    const customText = '¡Hola! ¿En qué tipo de evento necesitas ayuda?'
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.renderCustomText(customText);
  }





  renderCustomCard(){
    const dfMessenger = document.querySelector('df-messenger')as any;
    const payload = [
      {
        "type": "info",
        "title": "Creacion de Eventos",
        "subtitle": "Info item subtitle",
        "actionLink": "app/events",

      }];
    dfMessenger.renderCustomCard(payload);

  }

  showMinChat(){
    const dfMessenger = document.querySelector('df-messenger') as any;
    dfMessenger.showMinChat();
  }








}
