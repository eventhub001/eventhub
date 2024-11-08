import { Component, inject } from '@angular/core';
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



interface Message {
  user: string;
  text: string;
}



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule,MatInputModule,  FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

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

  constructor(private chatService: ChatService,  private route: ActivatedRoute) {

  }

  ngOnInit(): void {
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
    this.chatService.getMessages().subscribe((messages: IChat[]) => {
      this.messageList = messages.map((item: IUser) => ({
        ...item,
        message_side: item.id != this.userId ? 'sender' : 'receiver'
      }));
    });
  }





}















