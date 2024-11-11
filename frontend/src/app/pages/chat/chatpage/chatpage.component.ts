import { Component } from '@angular/core';
import { ChatComponent } from '../../../components/chat/chat/chat.component';

@Component({
  selector: 'app-chatpage',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './chatpage.component.html',
  styleUrl: './chatpage.component.scss'
})
export class ChatpageComponent {

}
