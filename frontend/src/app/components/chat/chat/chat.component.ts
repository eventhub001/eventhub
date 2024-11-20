import { Component, ElementRef, Inject, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { IUser } from '../../../interfaces';
import { ActivatedRoute} from '@angular/router';
import { UserService } from '../../../services/user.service';
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


    this.loadingUserIdFromLocalStorage();

    this.loadvendorIdFromLocalStorage();

    this.loadMessagesFromLocalStorage();

    this.chatService.joinChatRoom(this.vendorId);
    this.listenMessages();
  }

  sendMessage(): void {
    if (this.messageInput.trim() && this.userId) {
      const chatMessage = {
        message: this.messageInput,
        user: { id: this.userId },
        roomId: this.vendorId
      };

      console.log('Sending message:', chatMessage);
      this.chatService.sendMessage(this.vendorId, chatMessage);

      const storedMessages = localStorage.getItem('chat_messages');
      const messages = storedMessages ? JSON.parse(storedMessages) : [];

        messages.push({
          ...chatMessage,
          message_side: 'sender'
        });

      localStorage.setItem('chat_messages', JSON.stringify(messages));

      this.messageInput = '';
    } else {
      console.error('Message input or user ID is invalid');
    }
  }

  listenMessages() {
    this.chatService.getMessages().subscribe((messages: any) => {
      this.messageList = messages
        .filter((item: any) => item.roomId === this.vendorId)
        .map((item: any) => ({
          ...item,
          message_side: item.user.id !== this.userId ? 'receiver' : 'sender'
        }));

      localStorage.setItem('chat_messages', JSON.stringify(this.messageList));

        const storedMessages = localStorage.getItem('chat_messages');
        if (storedMessages) {
          const mssgObj = JSON.parse(storedMessages);
          if (mssgObj.length > 0) {
            const lastMessage = mssgObj[mssgObj.length - 1];
            this.receiver = lastMessage.message_side;
            console.log('receiver:', this.receiver);
          } else {
            console.error('No messages found in localStorage');
          }
        } else {
          console.error('No user found in localStorage');
        }


    const vendorUserid = localStorage.getItem('vendor');
    if (vendorUserid) {
      const vendorUseridObj = JSON.parse(vendorUserid);
      this.vendorUserid = vendorUseridObj.user.id;
    }





    const newMessages = messages.filter((item: any) => {
      if (item.user.id === this.vendorUserid && this.receiver === 'receiver') {
        return true;
      }

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
      .filter((item: any) => item.roomId === this.vendorId)
      .map((item: any) => ({
        ...item,
        message_side: item.user.id !== this.userId ? 'receiver' : 'sender'
      }));
  }
  }



  loadvendorIdFromLocalStorage(): void {
    const vendorId = localStorage.getItem('vendor');
    if (vendorId) {
      const vendorObj = JSON.parse(vendorId);
      this.vendorId = vendorObj.id;
      console.log('Vendor Id:', this.vendorId);
    } else {
      console.error('No user found in localStorage');
    }

  }



  loadingUserIdFromLocalStorage(): void {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId);
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















