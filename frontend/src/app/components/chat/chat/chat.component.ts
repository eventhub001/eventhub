import { Component, Inject, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { IChat, IUser } from '../../../interfaces';
import { ActivatedRoute, Route } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from './notification-dialog.component/notification-dialog.component.component';



interface Message {
  user: string;
  text: string;
}



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule,MatInputModule,  FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  public user: UserService = inject(UserService);
  userInterface: IUser | undefined;
  messageInput: string = '';
  userId: number = 0;
  vendorId: number = 0;
  messageList: any[] = [];

  constructor(private chatService: ChatService,  private route: ActivatedRoute, private dialog: MatDialog) {

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
    });
  }



  showNotification(message: any): void {
    // Lógica para mostrar el pop-up
    this.dialog.open(NotificationDialogComponent, {
      data: { message: message.message }
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




}















