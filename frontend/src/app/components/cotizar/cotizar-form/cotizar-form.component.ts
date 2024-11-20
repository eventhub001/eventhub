import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CotizacionService } from '../../../services/Cotizacion.Service';
import { UserService } from '../../../services/user.service';
import { ICotizacion, IVendor, IVendorService } from '../../../interfaces';
import { VendorService } from '../../../services/vendor.service';

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
  public UserService: UserService = inject(UserService);
  service: VendorService = inject(VendorService)

  constructor() {
    this.cotizacionService.search.page = 1;
    // this.cotizacionService.getAll();
    this.getVendorDetails();
  }
  @Input() servicios: IVendorService[] = [];
  vendor: IVendor | undefined;
  @Input() cotizacionForm!: FormGroup;
  @Input() vendorId!: number;
  @Output() callSaveMethod: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  @Output() callUpdateMethod: EventEmitter<ICotizacion> = new EventEmitter<ICotizacion>();
  selectedVendor: IVendor | null = null;

  callSave() {
    let IdService: number = this.cotizacionForm.controls['service'].value;
    let cotizacion: ICotizacion = {
      event: this.cotizacionForm.controls['event'].value,
      montoCotizado: this.cotizacionForm.controls['montoCotizado'].value,
      cantidadRecurso: this.cotizacionForm.controls['cantidadRecurso'].value,
      estado: this.cotizacionForm.controls['estado'].value,
      vendor_service_id: { id: IdService },
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

  statusOptions = [
    { id: 'enviada', nombre: 'Enviada' },
    { id: 'aceptada', nombre: 'Aceptada' },
    { id: 'rechazada', nombre: 'Rechazada' }
  ];



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
