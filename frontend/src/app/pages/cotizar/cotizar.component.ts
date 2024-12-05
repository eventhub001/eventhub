import { StatusFormComponent } from './../../components/status/solicitud-form/status-form.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../app/services/auth.service';
import { CotizacionListComponent } from '../../components/cotizar/cotizar-list/cotizar-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { CotizacionService } from '../../services/Cotizacion.Service';
import { ModalService } from '../../services/modal.service';
import { Component, inject, ViewChild } from '@angular/core';
import { ICotizacion } from '../../interfaces';
import { CotizarFormComponent } from "../../components/cotizar/cotizar-form/cotizar-form.component";
import { EventsService } from '../../services/event.service';


@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CotizacionListComponent, PaginationComponent, LoaderComponent, ModalComponent, CotizacionListComponent, CotizarFormComponent,StatusFormComponent],
  templateUrl: './cotizar.component.html',
  styleUrl: './cotizar.component.scss'
})

export class CotizacionesComponent {


  public cotizacionService: CotizacionService = inject(CotizacionService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  public eventService: EventsService = inject(EventsService);
  public fb: FormBuilder = inject(FormBuilder);
  public statusOptions = [
    { id: 'Pendiente', nombre: 'Pendiente' },
    { id: 'Aprobado', nombre: 'Aprobado' },
    { id: 'Rechazado', nombre: 'Rechazado' }
  ];
  @ViewChild('addCotizacionesModal') public addCotizacionesModal: any;
  @ViewChild('changeStatusModal') public changeStatusModal: any;
  userId: number = 0;

  cotizacionForm = this.fb.group({
    id: [''],
    vendor_service_id: ['', Validators.required],
    user_id: ['', Validators.required],
    event_id: ['', Validators.required],
    quoted_amount: ['', Validators.required],
    quantityResource: ['', Validators.required],
    status: ['', Validators.required]
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

    this.loadingUserIdFromLocalStorage();
    this.cotizacionService.search.page = 1;
    this.cotizacionService.getAllCotizacionesByUserId(this.userId);
    this.eventService.getAllByUserId(this.userId);
  }

  saveCotizacion(cotizacion: ICotizacion) {
    this.cotizacionService.save(cotizacion);
    this.modalService.closeAll();
  }

  callEdition(cotizacion: ICotizacion) {
    this.cotizacionForm.controls['id'].setValue(cotizacion.id ? JSON.stringify(cotizacion.id) : '');
    this.cotizacionForm.controls['event_id'].setValue(cotizacion.event_id ? JSON.stringify(cotizacion.event_id) : '');
    this.cotizacionForm.controls['vendor_service_id'].setValue(cotizacion.vendor_service_id ? JSON.stringify(cotizacion.vendor_service_id) : '');
    this.cotizacionForm.controls['user_id'].setValue(cotizacion.user?.id  ? JSON.stringify(cotizacion.user?.id ) : '');
    this.cotizacionForm.controls['quoted_amount'].setValue(cotizacion.quoted_amount ? JSON.stringify(cotizacion.quoted_amount) : '');
    this.cotizacionForm.controls['quantityResource'].setValue(cotizacion.quantityResource ? JSON.stringify(cotizacion.quantityResource) : '');
    this.cotizacionForm.controls['status'].setValue(cotizacion.status ? cotizacion.status.toString() : '');
    this.modalService.displayModal('md', this.addCotizacionesModal);
  }

  callEditStatus(recurso: ICotizacion) {
    this.cotizacionForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.cotizacionForm.controls['status'].setValue(recurso.status ? JSON.stringify(recurso.status) : '');

    this.modalService.displayModal('md', this.changeStatusModal);
  }

  updateCotizacion(cotizacion: ICotizacion) {
    this.cotizacionService.update(cotizacion);
    this.modalService.closeAll();
  }

  updateStatus(recurso: ICotizacion) {
    if (! recurso.status) {
      console.error('No se encontró el estado actualizado');
      return;
    }
    this.cotizacionService.updateStatus(recurso.status, recurso.id);
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
}
