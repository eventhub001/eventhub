import { CommonModule } from '@angular/common';
import * as e from 'cors';
import { co } from '@fullcalendar/core/internal-common';
import { SolicituRecursoService } from '../../../services/SolicituRecurso.Service';
import { VendorServiceService } from '../../../services/vendor-service.service';
import { UserService } from '../../../services/user.service';
import { VendorService } from '../../../services/vendor.service';
import { EventsService } from '../../../services/event.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IEvent, IUser, IVendor, IVendorService, SolicituRecurso } from '../../../interfaces';

@Component({
  selector: 'app-solicitud-status-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './status-form.component.html',
  styleUrl: './status-form.component.scss'
})
export class StatusFormComponent {

  public SolicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public UserService: UserService = inject(UserService);
  service: VendorService = inject(VendorService);
  solicitudService: SolicituRecursoService = inject(SolicituRecursoService);
  eventsService: EventsService = inject(EventsService)
  fb: any;



  constructor() {
    this.SolicituRecursoService.search.page = 1;
    this.VendorServiceService.getAll();
    this.events= this.eventsService.events$();
    console.log('Eventos:', this.events);
    this.SolicituRecursoService = inject(SolicituRecursoService);
    this.VendorServiceService = inject(VendorServiceService);
    this.UserService = inject(UserService);
    this.service = inject(VendorService);
  }

  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  solicitudId: number | undefined;
  @Output() callSaveMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callUpdateMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callUpdateStatusMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  // debe llegar como parámetro es decir como un Input la lista de evento y debe existir un select en html que liste los eventos



  updateStatus() {
    let solicitudId: number = this.solicitudForm.controls['id'].value; // ID de la solicitud a actualizar
    let statusId: number = this.solicitudForm.controls['status'].value; // Nuevo estado seleccionado

    // Construir el objeto de la solicitud con el estado actualizado
    let solicitud: Partial<SolicituRecurso> = {
      id: solicitudId,
      status: { id: statusId, status: '', description: '' }, // Asociar el ID del nuevo estado
    };

    console.log('Solicitud actualizada:', solicitud);
    console.log('Formulario:', this.solicitudForm.controls);

    // Validar si el ID está presente y emitir el evento de actualización
    if (solicitudId) {
      this.callUpdateStatusMethod.emit(solicitud);
    } else {
      console.error('Error: No se encontró el ID de la solicitud.');
    }
  }


}
