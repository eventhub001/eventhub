import { IEvent } from './../../../interfaces/index';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotizacionService } from '../../../services/Cotizacion.Service';
import { UserService } from '../../../services/user.service';
import { ICotizacion, IVendor, IVendorService } from '../../../interfaces';
import { VendorService } from '../../../services/vendor.service';
import { EventsService } from '../../../services/event.service';
import { VendorServiceService } from '../../../services/vendor-service.service';

@Component({
  selector: 'app-cotizacion-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './cotizar-form.component.html',
  styleUrls: ['./cotizar-form.component.scss']
})
export class CotizarFormComponent {

  public cotizacionService: CotizacionService = inject(CotizacionService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public UserService: UserService = inject(UserService);
  service: VendorService = inject(VendorService)
  eventsService: EventsService = inject(EventsService)
  fb: any;

  constructor() {
    this.cotizacionService.search.page = 1;
    this.VendorServiceService.getAll();
    // this.cotizacionService.getAll();
    this.getVendorDetails();
    this.events= this.eventsService.events$();
    this.VendorServiceService = inject(VendorServiceService);
    this.UserService = inject(UserService);
    this.service = inject(VendorService);

  }

  @Input() servicios: IVendorService[] = [];
  @Input() events: IEvent[] = [];
  @Input() cotizacionForm!: FormGroup;
  @Input() vendorId!: number;
  @Output() callSaveMethod: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  @Output() callUpdateMethod: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  selectedVendor: IVendor | null = null;
  vendor: IVendor | undefined;

  statusOptions = [
    { id: 'enviada', nombre: 'Enviada' },
    { id: 'aceptada', nombre: 'Aceptada' },
    { id: 'rechazada', nombre: 'Rechazada' }
  ];

  callSave() {
    let IdService: number = this.cotizacionForm.controls['vendor_service_id'].value;
    let IdEvent: number = this.cotizacionForm.controls['event_id'].value;
    let cotizacion: ICotizacion = {
      montoCotizado: this.cotizacionForm.controls['montoCotizado'].value,
      cantidadRecurso: this.cotizacionForm.controls['cantidadRecurso'].value,
      estado: this.cotizacionForm.controls['estado'].value,
      vendor_service: { id: IdService },
      event_id: {id: IdEvent}
    };

    if(this.cotizacionForm.controls['id'].value) {
      cotizacion.id = this.cotizacionForm.controls['id'].value;
    }

    if(cotizacion.id) {
      this.callUpdateMethod.emit(cotizacion);
    } else {
      console.log('Cotizacion:', cotizacion);
      this.callSaveMethod.emit(cotizacion);
    }
  }

  ngOnInit(): void {
    this.cotizacionForm = this.fb.group({
      vendor_service_id: ['', Validators.required],
      event_id: ['', Validators.required],

    });
  }

  showVendor(vendor: IVendor) {
    this.selectedVendor = vendor; // Set the selected event to show details
    console.log(this.selectedVendor);
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
