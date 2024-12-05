import { CotizacionService } from './../../../services/Cotizacion.Service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ICotizacion, IEvent } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cotizacion-list',
  standalone: true,
  imports: [],
  templateUrl: './cotizar-list.component.html',
  styleUrl: './cotizar-list.component.scss'
})
export class CotizacionListComponent {

  @Input() title: string = '';
  @Input() recursos: ICotizacion[] = [];
  @Input() eventos: IEvent[] = [];
  @Output() callModalAction: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  @Output() callDeleteAction: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  @Output() callEditStatusAction: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  public AuthService: AuthService = inject(AuthService);
  public CotizacionService: CotizacionService = inject(CotizacionService);

}
