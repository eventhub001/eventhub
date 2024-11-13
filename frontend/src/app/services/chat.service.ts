import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { IChat } from '../interfaces';
import * as SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService  extends BaseService<IChat> {

  private stompClient: any;
  private messageSubject: BehaviorSubject<IChat[]> = new BehaviorSubject<IChat[]>([]);
  constructor() {
    super();
    this.initConnectionSocket();
    this.source = 'api/notifications';
   }

   initConnectionSocket(){
    const url = 'http://localhost:8080/chat';
    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);

   }

   joinChatRoom(roomId: number): void {
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
        console.log('Raw message from server:', message);
        const messageContent = JSON.parse(message.body);
        console.log('Parsed message content:', messageContent);
        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);
        this.messageSubject.next(currentMessage);
      });
    });
  }

   sendMessage(roomId: number, chatMessage: IChat){
    console.log('Sending message:', chatMessage); // Agrega este registro para depurar
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage));
    } else {
      console.error('Stomp client is not connected');
    }
   }

    getMessages(){
      return this.messageSubject.asObservable();
    }















}
