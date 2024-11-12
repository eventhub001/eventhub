<<<<<<< Updated upstream
import { Component, inject } from '@angular/core';
=======
import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
>>>>>>> Stashed changes
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { IChat, IUser, IVendor } from '../../../interfaces';
import { ActivatedRoute, Route } from '@angular/router';
import { UserService } from '../../../services/user.service';
<<<<<<< Updated upstream
=======
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from './notification-dialog.component/notification-dialog.component.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
>>>>>>> Stashed changes



interface Message {
  user: string;
  text: string;
}



@Component({
  selector: 'app-chat',
  standalone: true,
<<<<<<< Updated upstream
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule,MatInputModule,  FormsModule, CommonModule],
=======
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule,MatInputModule,  FormsModule, CommonModule, HttpClientModule, MatSnackBarModule],
>>>>>>> Stashed changes
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  public user: UserService = inject(UserService);
  userInterface: IUser | undefined;

  // messages: Message[] = [];
  // newMessage: string = '';

  // sendMessage(): void {
  //   if (this.newMessage.trim()) {
  //     this.messages.push({ user: 'Usuario', text: this.newMessage });
  //     this.newMessage = '';
  //   }

  messageInput: string = '';
  userId: number = 0;
  messageList: any[] = [];
  vendorUserid: IVendor | undefined;

<<<<<<< Updated upstream
  constructor(private chatService: ChatService,  private route: ActivatedRoute) {

  }

  ngOnInit(): void {
=======
  constructor(private chatService: ChatService,  private route: ActivatedRoute,  private snackBar: MatSnackBar) {

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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


    // Getting vendor user id from local storage
    const vendorUserid = localStorage.getItem('vendor');
    if (vendorUserid) {
      const vendorUseridObj = JSON.parse(vendorUserid);
      this.vendorUserid = vendorUseridObj.user.id;
    }



    if (this.messageInput.trim() && this.userId) {
      const chatMessage = {
        message: this.messageInput,
        user: { id: this.userId },
        roomId: this.vendorId,
        recipientId : this.vendorUserid
      };

        console.log('Sending message:', chatMessage); // Agrega este registro para depurar
        this.chatService.sendMessage(this.vendorId, chatMessage);


          // Agregar el nuevo mensaje a la lista de mensajes
        this.messageList.push({
          ...chatMessage,
          message_side: 'sender'
        });


      // Limpiar el campo de entrada de mensaje
      this.messageInput = '';
    } else {
      console.error('Message input or user ID is invalid');
    }
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chatService.clearSubscriptions();
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
                // Getting vendor user id from local storage
          const vendorUserid = localStorage.getItem('vendor');
          if (vendorUserid) {
            const vendorUseridObj = JSON.parse(vendorUserid);
            this.vendorUserid = vendorUseridObj.user.id;
          }

          // Filtrar mensajes para notificar al usuario correcto
        const newMessages = messages.filter((item: any) => {
          // Si el mensaje es enviado por el vendor y el usuario actual no es el vendor, notificar al usuario actual
          if (item.user.id === this.vendorUserid && this.userId !== this.vendorUserid) {
            return true;
          }
          // Si el mensaje es enviado por otro usuario y el usuario actual es el vendor, notificar al vendor
          if (item.user.id !== this.vendorUserid && this.userId === this.vendorUserid) {
            return true;
          }
          return false;
        });

        if (newMessages.length > 0) {
          this.snackBar.open('Tienes un nuevo mensaje', 'Cerrar', {
            duration: 3000,
          });
        }
    });
  }






  loadMessagesFromLocalStorage(): void {
    const storedMessages = localStorage.getItem('chat_messages');
  if (storedMessages) {
    this.messageList = JSON.parse(storedMessages)
      //.filter((item: any) => item.roomId === this.vendorId) // Filtra los mensajes por roomId
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
>>>>>>> Stashed changes
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId); // Agrega este registro para depurar
    } else {
      console.error('No user found in localStorage');
    }
    this.chatService.joinChatRoom("anc");
    this.listenMessages()
  }

  sendMessage(): void {
    if (this.messageInput.trim() && this.userId) {
      const chatMessage = {
        message: this.messageInput,
        user: { id: this.userId }
      };

      console.log('Sending message:', chatMessage); // Agrega este registro para depurar

      this.chatService.sendMessage("anc", chatMessage);
      this.messageInput = '';
    } else {
      console.error('Message input or user ID is invalid');
    }
  }

  listenMessages() {
    this.chatService.getMessages().subscribe((messages: any) => {
      this.messageList = messages.map((item: any) => ({
        ...item,
        message_side: item.user.id != this.userId ? 'receiver' : 'sender'
      }));
    });
  }






  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

























}










