import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { min } from 'lodash';
import { RequestResourceService } from '../../../services/request-resource.service';
import { VendorServiceService } from '../../../services/vendor-service.service';
import { UserService } from '../../../services/user.service';
import { VendorService } from '../../../services/vendor.service';
import { EventsService } from '../../../services/event.service';
import { IEvent, IRequestResource, IUser, IVendor, IVendorService } from '../../../interfaces';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [DatePipe],
  templateUrl: './request-resource-form.component.html',
  styleUrl: './request-resource-form.component.scss'
})
export class RequestResourceFormComponent {

  public RequestResourceService: RequestResourceService = inject(RequestResourceService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public userService: UserService = inject(UserService);
  service: VendorService = inject(VendorService);
  eventsService: EventsService = inject(EventsService)
  user_id: number | undefined = this.getUserIdFromLocalStorage();
  fb: any;
  minDate: Date = new Date();



  constructor(private datePipe: DatePipe) {
    this.RequestResourceService.search.page = 1;
    this.VendorServiceService.getAll();
  // this.RequestResourceService.getAll();
    this.events= this.eventsService.events$();
    this.getVendorDetails();
    this.RequestResourceService = inject(RequestResourceService);
    this.VendorServiceService = inject(VendorServiceService);
    this.userService = inject(UserService);
    this.service = inject(VendorService);
  }

  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  vendor: IVendor | undefined;
  @Input() solicitudForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
  @Output() callUpdateMethod: EventEmitter<IRequestResource> = new EventEmitter<IRequestResource>();
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
    let solicitud: IRequestResource = {
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
