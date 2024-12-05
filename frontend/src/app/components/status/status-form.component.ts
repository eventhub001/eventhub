import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RequestResourceService } from '../../services/request-resource.service';
import { VendorServiceService } from '../../services/vendor-service.service';
import { UserService } from '../../services/user.service';
import { VendorService } from '../../services/vendor.service';
import { EventsService } from '../../services/event.service';
import { IEvent, IRequestResource, IVendor, IVendorService } from '../../interfaces';

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

  public RequestResourceService: RequestResourceService = inject(RequestResourceService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public UserService: UserService = inject(UserService);
  service: VendorService = inject(VendorService);
  requestResourceService: RequestResourceService = inject(RequestResourceService);
  eventsService: EventsService = inject(EventsService)
  fb: any;



  constructor() {
    this.RequestResourceService.search.page = 1;
    this.VendorServiceService.getAll();
    this.events= this.eventsService.events$();
    console.log('Eventos:', this.events);
    this.RequestResourceService = inject(RequestResourceService);
    this.VendorServiceService = inject(VendorServiceService);
    this.UserService = inject(UserService);
    this.service = inject(VendorService);
  }

  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  solicitudId: number | undefined;
  @Output() callSaveMethod: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  @Output() callUpdateMethod: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  @Output() callUpdateStatusMethod: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();



  updateStatus() {
    let solicitudId: number = this.solicitudForm.controls['id'].value;
    let statusId: number = this.solicitudForm.controls['status'].value;

    let solicitud: Partial<IRequestResource> = {
      id: solicitudId,
      status: { id: statusId, status: '', description: '' },
    };

    console.log('Solicitud actualizada:', solicitud);
    console.log('Formulario:', this.solicitudForm.controls);

    if (solicitudId) {
      this.callUpdateStatusMethod.emit(solicitud);
    } else {
      console.error('Error: No se encontró el ID de la solicitud.');
    }
  }


}
