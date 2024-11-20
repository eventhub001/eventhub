import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ICotizacion } from '../../../interfaces';
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
  @Input() cotizaciones: ICotizacion[] = [];
  @Output() callModalAction: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  @Output() callDeleteAction: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  public AuthService: AuthService = inject(AuthService);

}
