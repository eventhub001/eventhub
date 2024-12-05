import { EventsService } from './../../../../services/event.service';
import { VendorServiceService } from './../../../../services/vendor-service.service';
import { UserService } from './../../../../services/user.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SolicituRecursoService } from '../../../../services/SolicituRecurso.Service';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendorService } from '../../../../services/vendor.service';
import { CommonModule, DatePipe } from '@angular/common';
import { IEvent, IUser, IVendor, IVendorService, SolicituRecurso, } from '../../../../interfaces';
import { min } from 'lodash';

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './solicitud-form.component.html',
  styleUrl: './solicitud-form.component.scss'
})
export class SolicitudFormComponent {

  public SolicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public userService: UserService = inject(UserService);
  service: VendorService = inject(VendorService);
  eventsService: EventsService = inject(EventsService)
  user_id: number | undefined = this.getUserIdFromLocalStorage();
  fb: any;
  minDate: Date = new Date();



  constructor(private datePipe: DatePipe) {
    this.SolicituRecursoService.search.page = 1;
    this.VendorServiceService.getAll();
  // this.SolicituRecursoService.getAll();
    this.events= this.eventsService.events$();
    this.getVendorDetails();
    this.SolicituRecursoService = inject(SolicituRecursoService);
    this.VendorServiceService = inject(VendorServiceService);
    this.userService = inject(UserService);
    this.service = inject(VendorService);
  }

  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  @Output() callUpdateMethod: EventEmitter<SolicituRecurso> = new EventEmitter<SolicituRecurso>();
  // debe llegar como parámetro es decir como un Input la lista de evento y debe existir un select en html que liste los eventos

  // Lista de status
  status = [
    { id: 'Pendiente', nombre: 'Pendiente' },
    { id: 'Aprobado', nombre: 'Aprobado' },
    { id: 'Rechazado', nombre: 'Rechazado' }
  ];

  ngOnInit(): void {
    this.VendorServiceService.getAll();
    this.loadFromLocalStorage();
    this.getVendorDetails();
  }

  callSave() {
    let IdServicio: number = this.solicitudForm.controls['vendor_service_id'].value;
    let IdEvent: number = this.solicitudForm.controls['event_id'].value;
    let solicitud: SolicituRecurso = {
      user: {id:this.user_id} as IUser,
      dateRequest: this.solicitudForm.controls['dateRequest'].value,
      requested_quantity: this.solicitudForm.controls['requested_quantity'].value,
      vendor_service: { id: IdServicio },
      event:{ eventId: IdEvent},
      status: { id: 1, status: 'Pendiente', description: 'Pending approval' },
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

  getUserIdFromLocalStorage(): number | undefined {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.id ? Number(user.id) : undefined;
    }
    return undefined;
  }

 /* ngOnChanges() {
    // blabla solicitudRecursos$()
    }*/

    getVendorDetails(): void {
      const userId = this.userService.getUserId();
      if (userId !== null) {
        this.service.getVendorByUserId(userId).subscribe({
          next: (vendorService : IVendorService[]) => {
            if (vendorService.length > 0) {
              this.servicios = vendorService;
              this.vendor = vendorService[0].vendor;
              this.saveToLocalStorage();
            }
          },
          error: (err: any) => {
            console.error('Error fetching vendor details', err);
          }
        });
      }
    }


    saveToLocalStorage(): void {
      localStorage.setItem('vendor', JSON.stringify(this.vendor));
      localStorage.setItem('servicios', JSON.stringify(this.servicios));
    }

    loadFromLocalStorage(): void {
      const vendorData = localStorage.getItem('vendor');
      const serviciosData = localStorage.getItem('servicios');
      if (vendorData) {
        this.vendor = JSON.parse(vendorData);
      }
      if (serviciosData) {
        this.servicios = JSON.parse(serviciosData);
      }
    }

}
