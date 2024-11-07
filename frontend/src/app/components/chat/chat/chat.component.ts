import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



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

  messages: Message[] = [];
  newMessage: string = '';

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messages.push({ user: 'Usuario', text: this.newMessage });
      this.newMessage = '';
    }
  }



}
