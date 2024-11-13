import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { IUser } from '../../../interfaces';
import { ActivatedRoute, Route } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';



interface Message {
  user: string;
  text: string;
}



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule,MatInputModule,  FormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  public user: UserService = inject(UserService);
  userInterface: IUser | undefined;
  messageInput: string = '';
  userId: number = 0;
  vendorId: number = 0;
  vendorUserid: number = 0;
  receiver: string = '';
  messageList: any[] = [];
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(private chatService: ChatService,  private route: ActivatedRoute, private snackBar: MatSnackBar) {

  }


  ngOnInit(): void {


    // Getting user id from local storage
    this.loadingUserIdFromLocalStorage();

    // Getting vendor id from local storage
    this.loadvendorIdFromLocalStorage();

    // Load messages from local storage
    this.loadMessagesFromLocalStorage();

    // Join chat room
    this.chatService.joinChatRoom(this.vendorId);
    // Listen for messages
    this.listenMessages();
  }

  sendMessage(): void {
    if (this.messageInput.trim() && this.userId) {
      const chatMessage = {
        message: this.messageInput,
        user: { id: this.userId },
        roomId: this.vendorId // Asegúrate de incluir el roomId en el mensaje
      };

      console.log('Sending message:', chatMessage); // Agrega este registro para depurar
      this.chatService.sendMessage(this.vendorId, chatMessage);

      // Obtener los mensajes existentes del localStorage
      const storedMessages = localStorage.getItem('chat_messages');
      const messages = storedMessages ? JSON.parse(storedMessages) : [];

        // Agregar el nuevo mensaje al array de mensajes
        messages.push({
          ...chatMessage,
          message_side: 'sender'
        });

      // Guardar el array de mensajes actualizado en el localStorage
      localStorage.setItem('chat_messages', JSON.stringify(messages));

      // Agregar el mensaje a la lista de mensajes
      this.messageInput = '';
    } else {
      console.error('Message input or user ID is invalid');
    }
  }

  listenMessages() {
    this.chatService.getMessages().subscribe((messages: any) => {
      this.messageList = messages
        .filter((item: any) => item.roomId === this.vendorId) // Filtra los mensajes por roomId
        .map((item: any) => ({
          ...item,
          message_side: item.user.id !== this.userId ? 'receiver' : 'sender'
        }));

      // Guardar los mensajes en el localStorage
      localStorage.setItem('chat_messages', JSON.stringify(this.messageList));

        //obteniendo el receiver
        const storedMessages = localStorage.getItem('chat_messages');
        if (storedMessages) {
          const mssgObj = JSON.parse(storedMessages);
          if (mssgObj.length > 0) {
            const lastMessage = mssgObj[mssgObj.length - 1]; // Accede al último elemento del arreglo
            this.receiver = lastMessage.message_side;
            console.log('receiver:', this.receiver); // Agrega este registro para depurar
          } else {
            console.error('No messages found in localStorage');
          }
        } else {
          console.error('No user found in localStorage');
        }


      // Obtener vendorUserid del localStorage
    const vendorUserid = localStorage.getItem('vendor');
    if (vendorUserid) {
      const vendorUseridObj = JSON.parse(vendorUserid);
      this.vendorUserid = vendorUseridObj.user.id;
    }





    // Filtrar mensajes para notificar al usuario correcto
    const newMessages = messages.filter((item: any) => {
      // Si el mensaje es enviado por el vendor y el usuario actual no es el vendor, notificar al usuario actual
      if (item.user.id === this.vendorUserid && this.receiver === 'receiver') {
        return true;
      }
      // Si el mensaje es enviado por otro usuario y el usuario actual es el vendor, notificar al vendor
      if (item.user.id !== this.vendorUserid && this.receiver === 'sender') {
        return false;
      }
      return false;
    });

    if (newMessages.length > 0) {
      this.snackBar.open('Tienes un nuevo mensaje', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }




    });
  }





  loadMessagesFromLocalStorage(): void {
    const storedMessages = localStorage.getItem('chat_messages');
  if (storedMessages) {
    this.messageList = JSON.parse(storedMessages)
      .filter((item: any) => item.roomId === this.vendorId) // Filtra los mensajes por roomId
      .map((item: any) => ({
        ...item,
        message_side: item.user.id !== this.userId ? 'receiver' : 'sender'
      }));
  }
  }



  loadvendorIdFromLocalStorage(): void {
    // Getting vendor id from local storage
    const vendorId = localStorage.getItem('vendor');
    if (vendorId) {
      const vendorObj = JSON.parse(vendorId);
      this.vendorId = vendorObj.id;
      console.log('Vendor Id:', this.vendorId); // Agrega este registro para depurar
    } else {
      console.error('No user found in localStorage');
    }

  }



  loadingUserIdFromLocalStorage(): void {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId); // Agrega este registro para depurar
    } else {
      console.error('No user found in localStorage');
    }

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

}















