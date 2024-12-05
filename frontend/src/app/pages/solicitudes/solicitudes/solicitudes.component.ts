import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { SolicituRecursoService } from './../../../services/SolicituRecurso.Service';
import { Component, inject, ViewChild } from '@angular/core';
import { SolicituRecurso } from '../../../interfaces';
import { SolicitudListComponent } from "../../../components/solicitudes/solicitud-list/solicitud-list/solicitud-list.component";
import { PaginationComponent } from "../../../components/pagination/pagination.component";
import { LoaderComponent } from "../../../components/loader/loader.component";
import { ModalComponent } from "../../../components/modal/modal.component";
import { SolicitudFormComponent } from "../../../components/solicitudes/solicitud-form/solicitud-form/solicitud-form.component";
import { EventsService } from '../../../services/event.service';
import { StatusFormComponent } from "../../../components/status/solicitud-form/status-form.component";

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [SolicitudListComponent, PaginationComponent, LoaderComponent, ModalComponent, SolicitudFormComponent, StatusFormComponent],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent {

  public solicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  public eventService: EventsService = inject(EventsService);
  public fb: FormBuilder = inject(FormBuilder);
  public statusOptions = [
    { id: 'Pendiente', nombre: 'Pendiente' },
    { id: 'Aprobado', nombre: 'Aprobado' },
    { id: 'Rechazado', nombre: 'Rechazado' }
  ];
  @ViewChild('addRecursosModal') public addRecursosModal: any;
  @ViewChild('changeStatusModal') public changeStatusModal: any;
  userId: number  = 0;

  solicitudForm = this.fb.group({
    id: [''],
    vendor_service_id: ['', Validators.required],
    user_id: ['', Validators.required],
    dateRequest: ['', Validators.required],
    requested_quantity: ['', Validators.required],
    status: ['', Validators.required],
    event_id: ['', Validators.required],
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

    this.solicituRecursoService.search.page = 1;
    this.solicituRecursoService.getAllRecursosByUserId(this.userId);
    this.eventService.getAllByUserId(this.userId);
  }

  saveRecurso(recurso: SolicituRecurso) {
    // antes de guardar la solicitud, se debe asignar el id del usuario que está logueado
    this.solicituRecursoService.save(recurso);
    this.modalService.closeAll();
  }

  callEdition(recurso: SolicituRecurso) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['vendor_service_id'].setValue(recurso.vendor_service_id?.service_name ? JSON.stringify(recurso.vendor_service_id.service_name) : '');
    this.solicitudForm.controls['user_id'].setValue(recurso.user?.id  ? JSON.stringify(recurso.user?.id ) : '');
    this.solicitudForm.controls['dateRequest'].setValue(recurso.dateRequest ? new Date(recurso.dateRequest).toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['requested_quantity'].setValue(recurso.requested_quantity ? JSON.stringify(recurso.requested_quantity) : '');
    this.solicitudForm.controls['status'].setValue(recurso.status ? JSON.stringify(recurso.status) : '');
    this.solicitudForm.controls['event_id'].setValue(recurso.event ? JSON.stringify(recurso.event) : '');

    this.modalService.displayModal('md', this.addRecursosModal);
  }

  callEditStatus(recurso: SolicituRecurso) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['status'].setValue(recurso.status ? JSON.stringify(recurso.status) : '');

    this.modalService.displayModal('md', this.changeStatusModal);
  }

  updatRecurso(recurso: SolicituRecurso) {
    this.solicituRecursoService.update(recurso);
    this.modalService.closeAll();
  }

  updateStatus(recurso: SolicituRecurso) {
    if (! recurso.status) {
      console.error('No se encontró el estado actualizado');
      return;
    }
    this.solicituRecursoService.updateStatus(recurso.status, recurso.id);
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
