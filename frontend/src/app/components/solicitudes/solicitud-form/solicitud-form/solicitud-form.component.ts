import { VendorServiceService } from './../../../../services/vendor-service.service';
import { UserService } from './../../../../services/user.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SolicituRecursoService } from '../../../../services/SolicituRecurso.Service';
import { IVendor, IVendorService, SolicituRecurso } from '../../../../interfaces';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VendorService } from '../../../../services/vendor.service';
import { CommonModule } from '@angular/common';

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
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callUpdateMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();

  // Lista de status
  estado = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Aprobado' },
    { id: 3, nombre: 'Rechazado' }
  ];

  callSave() {
    let IdServicio: number = this.solicitudForm.controls['vendor_service_id'].value;
    let solicitud: SolicituRecurso = {
      fechaEvento: this.solicitudForm.controls['fechaEvento'].value,
      fechaSolicitud: this.solicitudForm.controls['fechaSolicitud'].value,
      cantidad_solicitada: this.solicitudForm.controls['cantidad_solicitada'].value,
      estado: this.solicitudForm.controls['estado'].value,
      vendor_service_id: { id: IdServicio },
      horaEvento: this.solicitudForm.controls['horaEvento'].value,

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
