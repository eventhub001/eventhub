import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { IChat } from '../interfaces';
import * as SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService  {


  private stompClient: any;
  private messageSubject: BehaviorSubject<IChat[]> = new BehaviorSubject<IChat[]>([]);
  private subscriptions: Subscription[] = [];

  constructor() {

    this.initConnectionSocket();
   }

   initConnectionSocket(){
    const url = 'http://localhost:8080/chat';
    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);
   }






   joinChatRoom(roomId: number): Subscription {
    const subscription = new Subscription();
    this.stompClient.connect({}, () => {
      const sub = this.stompClient.subscribe(`/topic/${roomId}`, (message: any) => {
        console.log('Raw message from server:', message);
        const messageContent = JSON.parse(message.body);
        console.log('Parsed message content:', messageContent);
        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);
        this.messageSubject.next(currentMessage);
      });
      subscription.add(sub);
    });
    this.subscriptions.push(subscription);
    return subscription;
  }

  sendMessage(roomId: number, chatMessage: IChat) {
    console.log('Sending message:', chatMessage);
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(`/app/chat/${roomId}`, {}, JSON.stringify(chatMessage));
    } else {
      console.error('Stomp client is not connected');
    }
  }

  getMessages(): Observable<IChat[]> {
    return this.messageSubject.asObservable();
  }

  clearSubscriptions() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }















}