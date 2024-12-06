import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEvent, IRequestResource } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './request-resource-list.component.html',
  styleUrl: './request-resource-list.component.scss'
})
export class RequestResourceListComponent {

  @Input() title: string  = '';
  @Input() recursos: IRequestResource[] = [];
  @Input() eventos: IEvent[] = [];
  @Output() callModalAction: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  @Output() callDeleteAction: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  @Output() callEditStatusAction: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  public AuthService: AuthService = inject(AuthService);

  user: any;

  ngOnInit(): void {
    this.user = this.AuthService.getUser();
  }

}
