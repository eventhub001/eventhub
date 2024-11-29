import { Component, inject, Input, ViewChild } from '@angular/core';
import { VendorService } from '../../../services/vendor.service';
import { UserService } from '../../../services/user.service';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { VendorDetails1Component } from '../../../components/vendor/vendor-details/vendor-details/vendor-details.component';
import { ICotizacion, IVendor, IVendorService, SolicituRecurso } from '../../../interfaces';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ChatComponent } from "../../../components/chat/chat/chat.component";
import { SolicitudFormComponent } from "../../../components/solicitudes/solicitud-form/solicitud-form/solicitud-form.component";
import { SolicituRecursoService } from '../../../services/SolicituRecurso.Service';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from "../../../components/modal/modal.component";
import { CotizarFormComponent } from "../../../components/cotizar/cotizar-form/cotizar-form.component";
import { CotizacionService } from '../../../services/Cotizacion.Service';
import { EventsService } from '../../../services/event.service';

@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [LoaderComponent, VendorDetails1Component, MatCardModule, MatButtonModule, CommonModule, ChatComponent, SolicitudFormComponent, ModalComponent, CotizarFormComponent],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetailsComponent {
  public vendorService: VendorService = inject(VendorService);
  public userService: UserService = inject(UserService);
  vendor: IVendor | undefined;
  requestDate: string = '';
  requestTime: string = '';
  requestStatus: 'accepted' | 'denied' | null = null;
  vendors: IVendor | undefined;
  userId: number = 0;
  selectedVendor: IVendor | null = null;
  public cotizacionService: CotizacionService = inject(CotizacionService);
  public solicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  public VendorService: VendorService = inject(VendorService);
  public eventService: EventsService = inject(EventsService);
  public fb: FormBuilder = inject(FormBuilder);
  @ViewChild('addRecursosModal') public addRecursosModal: any;
  @ViewChild('addCotizacionesModal') public addCotizacionesModal: any;
  @Input() servicios: IVendorService[] = [];

  solicitudForm = this.fb.group({
    id: [''],
    vendor_service_id: ['', Validators.required],
    user_id: ['', Validators.required],
    fechaSolicitud: ['', Validators.required],
    fechaEvento: ['', Validators.required],
    horaEvento: ['', Validators.required],
    cantidad_solicitada: ['', Validators.required],
    estado: ['', Validators.required],
    event_id: ['', Validators.required],
  });

  cotizacionForm = this.fb.group({
    id: [''],
    event_id: ['', Validators.required],
    vendor_service_id: ['', Validators.required],
    montoCotizado: ['', Validators.required],
    cantidadRecurso: ['', Validators.required],
    user: ['', Validators.required],
    estado: ['enviada', Validators.required],
    service: ['']
  });

  constructor() {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId);
    } else {
      console.error('No user found in localStorage');
    }
    this.eventService.getAllByUserId(this.userId);

    this.solicituRecursoService.search.page = 1;
  // this.solicituRecursoService.getAllRecursosByUserId(this.userId);

    this.vendorService.search.page = 1;
    const userId = this.userService.getUserId();
    if (userId !== null) {
      this.vendorService.getVendorByUserId(userId);
    } else {
      console.error('User ID is null');
    }
  }

  saveRecurso(recurso: SolicituRecurso) {
    recurso.horaEvento = this.solicitudForm.controls['horaEvento'].value || undefined;
    console.log('Recurso:', recurso);

    this.solicituRecursoService.save(recurso);
    this.modalService.closeAll();
  }

  callEdition(recurso: SolicituRecurso) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['vendor_service_id'].setValue(recurso.vendor_service_id?.service_name ? JSON.stringify(recurso.vendor_service_id.service_name) : '');
    this.solicitudForm.controls['user_id'].setValue(recurso.user?.id ? JSON.stringify(recurso.user.id) : '');
    this.solicitudForm.controls['fechaSolicitud'].setValue(recurso.fechaSolicitud ? recurso.fechaSolicitud.toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['fechaEvento'].setValue(recurso.fechaEvento ? recurso.fechaEvento.toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['horaEvento'].setValue(recurso.horaEvento ? recurso.horaEvento : '');
    this.solicitudForm.controls['cantidad_solicitada'].setValue(recurso.cantidad_solicitada ? JSON.stringify(recurso.cantidad_solicitada) : '');
    this.solicitudForm.controls['estado'].setValue(recurso.estado ? JSON.stringify(recurso.estado) : '');
    this.modalService.displayModal('md', this.addRecursosModal);
  }

  updatRecurso(recurso: SolicituRecurso) {

    recurso.horaEvento = this.solicitudForm.controls['horaEvento'].value || undefined;

    this.solicituRecursoService.update(recurso);
    this.modalService.closeAll();
  }

  loadingUserIdFromLocalStorage(): void {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId);
    } else {
      console.error('No user found in localStorage');
    }
  }

  openAddCotizacionesModal(vendor: IVendor) {
    this.selectedVendor = vendor;
    console.log('Selected Vendor ID:', vendor.id);
    this.modalService.displayModal('md', this.addCotizacionesModal);
    this.VendorService.getVendorByUserId(vendor!.id!).subscribe({
      next: (vendor_service_id : IVendorService[]) => {
        if (vendor_service_id.length > 0) {
          this.servicios = vendor_service_id;
          this.vendors = vendor_service_id[0].vendor;

        }
      },
      error: (err: any) => {
        console.error('Error fetching vendor details', err);
      }
    });
  }

  saveCotizacion(cotizacion: ICotizacion) {
    cotizacion.montoCotizado = this.cotizacionForm.controls['montoCotizado'].value ? Number(this.cotizacionForm.controls['montoCotizado'].value) : undefined;
    cotizacion.cantidadRecurso = this.cotizacionForm.controls['cantidadRecurso'].value ? Number(this.cotizacionForm.controls['cantidadRecurso'].value) : undefined;
    cotizacion.estado = 'enviada';

    this.cotizacionService.save(cotizacion);
    this.modalService.closeAll();

  }

  callEditio(cotizacion: ICotizacion) {
    console.log('Abriendo el formulario de edición para:', cotizacion);
    this.cotizacionForm.controls['id'].setValue(cotizacion.id ? cotizacion.id.toString() : '');
    this.cotizacionForm.controls['event_id'].setValue(cotizacion.event_id && cotizacion.event_id.id ? cotizacion.event_id.id?.toString() : null);
    this.cotizacionForm.controls['vendor_service_id'].setValue(cotizacion.vendor_service_id && cotizacion.vendor_service_id.id ? cotizacion.vendor_service_id.id.toString() : null);
    this.cotizacionForm.controls['montoCotizado'].setValue(cotizacion.montoCotizado ? cotizacion.montoCotizado.toString() : '');
    this.cotizacionForm.controls['cantidadRecurso'].setValue(cotizacion.cantidadRecurso ? cotizacion.cantidadRecurso.toString() : '');
    this.cotizacionForm.controls['user'].setValue(cotizacion.user?.id ? cotizacion.user.id.toString() : null);
    this.cotizacionForm.controls['estado'].setValue(cotizacion.estado || 'enviada');

    console.log('Formulario de edición preparado:', this.cotizacionForm.value);
    this.modalService.displayModal('md', this.addCotizacionesModal);
  }


  updateCotizacion(cotizacion: ICotizacion) {
    cotizacion.montoCotizado = this.cotizacionForm.controls['montoCotizado'].value ? Number(this.cotizacionForm.controls['montoCotizado'].value) : undefined;
    cotizacion.cantidadRecurso = this.cotizacionForm.controls['cantidadRecurso'].value ? Number(this.cotizacionForm.controls['cantidadRecurso'].value) : undefined;

    this.cotizacionService.update(cotizacion);
    this.modalService.closeAll();
  }
}
