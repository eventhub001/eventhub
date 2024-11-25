import { VendorServiceService } from './../../../../services/vendor-service.service';
import { UserService } from './../../../../services/user.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SolicituRecursoService } from '../../../../services/SolicituRecurso.Service';
import { IEvent, IVendor, IVendorService, SolicituRecurso } from '../../../../interfaces';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendorService } from '../../../../services/vendor.service';
import { CommonModule } from '@angular/common';
import * as e from 'cors';

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './solicitud-form.component.html',
  styleUrl: './solicitud-form.component.scss'
})
export class SolicitudFormComponent {

  public SolicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public UserService: UserService = inject(UserService);
  service: VendorService = inject(VendorService)
  fb: any;



  constructor() {
    this.SolicituRecursoService.search.page = 1;
    this.VendorServiceService.getAll();
  // this.SolicituRecursoService.getAll();
    this.getVendorDetails();
    this.SolicituRecursoService = inject(SolicituRecursoService);
    this.VendorServiceService = inject(VendorServiceService);
    this.UserService = inject(UserService);
    this.service = inject(VendorService);
  }

  @Input() servicios: IVendorService[] = [];
  @Input() eventos: IEvent[] = [];
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callUpdateMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  // debe llegar como parámetro es decir como un Input la lista de evento y debe existir un select en html que liste los eventos

  // Lista de status
  estado = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Aprobado' },
    { id: 3, nombre: 'Rechazado' }
  ];

  callSave() {
    let IdServicio: number = this.solicitudForm.controls['vendor_service_id'].value;
    let IdEvent: number = this.solicitudForm.controls['event_event_id'].value;
    let solicitud: SolicituRecurso = {
      fechaEvento: this.solicitudForm.controls['fechaEvento'].value,
      fechaSolicitud: this.solicitudForm.controls['fechaSolicitud'].value,
      cantidad_solicitada: this.solicitudForm.controls['cantidad_solicitada'].value,
      estado: this.solicitudForm.controls['estado'].value,
      vendor_service: { id: IdServicio },
      event_event:{ id: IdEvent},
      horaEvento: this.solicitudForm.controls['horaEvento'].value,
      //event: { id: 1 },
    }


    if(this.solicitudForm.controls['id'].value) {
      solicitud.id = this.solicitudForm.controls['id'].value;
    }


    if(solicitud.id) {
      this.callUpdateMethod.emit(solicitud);
    } else {
      this.callSaveMethod.emit(solicitud);
    }
  }

  ngOnInit(): void {
    this.solicitudForm = this.fb.group({
      vendor_service_id: ['', Validators.required],
      event_event_id: ['', Validators.required],

    });
  }

  ngOnChanges() {
    // blabla solicitudRecursos$()
    }

    getVendorDetails(): void {
      const userId = this.UserService.getUserId();
      if (userId !== null) {
        this.service.getVendorByUserId(userId).subscribe({
          next: (vendorService : IVendorService[]) => {
            if (vendorService.length > 0) {
              this.servicios = vendorService;
              this.vendor = vendorService[0].vendor;

            }
          },
          error: (err: any) => {
            console.error('Error fetching vendor details', err);
          }
        });
      }
    }



}
