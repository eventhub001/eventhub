import { IEvent, IUser, IStatus, IVendorService, IVendor, IQuote } from './../../../interfaces/index';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { VendorService } from '../../../services/vendor.service';
import { EventsService } from '../../../services/event.service';
import { VendorServiceService } from '../../../services/vendor-service.service';
import { QuoteService } from '../../../services/quote.service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss']
})
export class QuoteFormComponent implements OnInit {

  public cotizacionService: QuoteService = inject(QuoteService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public userService: UserService = inject(UserService);
  service: VendorService = inject(VendorService)
  eventsService: EventsService = inject(EventsService)
  user_id: number | undefined = this.getUserIdFromLocalStorage();
  fb: any;

  constructor() {
    this.cotizacionService.search.page = 1;

    // this.cotizacionService.getAll();
    this.events= this.eventsService.events$();
    this.VendorServiceService = inject(VendorServiceService);
    this.userService = inject(UserService);
    this.service = inject(VendorService);

  }


  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  @Input() cotizacionForm!: FormGroup;
  @Input() vendorId!: number;
  @Output() callSaveMethod: EventEmitter<IQuote> = new EventEmitter<IQuote>();
  @Output() callUpdateMethod: EventEmitter<IQuote> = new EventEmitter<IQuote>();
  selectedVendor: IVendor | null = null;
  vendor: IVendor | undefined;

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
    let IdService: number = this.cotizacionForm.controls['vendor_service_id'].value;
    let IdEvent: number = this.cotizacionForm.controls['event_id'].value;
    let cotizacion: IQuote = {
      user: {id:this.user_id} as IUser,
      quoted_amount: this.cotizacionForm.controls['quoted_amount'].value,
      quantityResource: this.cotizacionForm.controls['quantityResource'].value,
      vendor_service: { id: IdService },
      event:{ eventId: IdEvent},
      status: { id: 1, status: 'Pendiente', description: 'Pending approval' },
    };
    if(this.cotizacionForm.controls['id'].value) {
      cotizacion.id = this.cotizacionForm.controls['id'].value;
    }
    console.log(cotizacion);
    if(cotizacion.id) {
      this.callUpdateMethod.emit(cotizacion);
    } else {
      this.callSaveMethod.emit(cotizacion);
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

  /*showVendor(vendor: IVendor) {
    this.selectedVendor = vendor; // Set the selected event to show details
    console.log(this.selectedVendor);
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
