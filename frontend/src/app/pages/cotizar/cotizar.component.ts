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

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CotizacionListComponent, PaginationComponent, LoaderComponent, ModalComponent, CotizacionListComponent, CotizarFormComponent],
  templateUrl: './cotizar.component.html',
  styleUrl: './cotizar.component.scss'
})
export class CotizacionesComponent {

  public cotizacionService: CotizacionService = inject(CotizacionService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addCotizacionesModal') public addCotizacionesModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  userId: number = 0;

  cotizacionForm = this.fb.group({
    id: [''],
    vendor_service_id: ['', Validators.required],
    event_event_id: ['', Validators.required],
    montoCotizado: ['', Validators.required],
    cantidadRecurso: ['', Validators.required],
    estado: ['', Validators.required]

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
  }

  saveCotizacion(cotizacion: ICotizacion) {
    this.cotizacionService.save(cotizacion);
    this.modalService.closeAll();
  }

  callEdition(cotizacion: ICotizacion) {
    this.cotizacionForm.controls['id'].setValue(cotizacion.id ? JSON.stringify(cotizacion.id) : '');
    this.cotizacionForm.controls['event_event_id'].setValue(cotizacion.event_event_id ? JSON.stringify(cotizacion.event_event_id) : '');
    this.cotizacionForm.controls['vendor_service_id'].setValue(cotizacion.vendor_service_id ? JSON.stringify(cotizacion.vendor_service_id) : '');
    this.cotizacionForm.controls['montoCotizado'].setValue(cotizacion.montoCotizado ? JSON.stringify(cotizacion.montoCotizado) : '');
    this.cotizacionForm.controls['cantidadRecurso'].setValue(cotizacion.cantidadRecurso ? JSON.stringify(cotizacion.cantidadRecurso) : '');
    this.cotizacionForm.controls['estado'].setValue(cotizacion.estado || '');
    this.modalService.displayModal('md', this.addCotizacionesModal);
  }

  updateCotizacion(cotizacion: ICotizacion) {
    this.cotizacionService.update(cotizacion);
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
