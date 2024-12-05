import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IEvent, SolicituRecurso } from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitud-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './solicitud-list.component.html',
  styleUrl: './solicitud-list.component.scss'
})
export class SolicitudListComponent {

  @Input() title: string  = '';
  @Input() recursos: SolicituRecurso[] = [];
  @Input() eventos: IEvent[] = [];
  @Output() callModalAction: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callDeleteAction: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callEditStatusAction: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  public AuthService: AuthService = inject(AuthService);

}
