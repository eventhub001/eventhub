import { FormBuilder, Validators } from '@angular/forms';
import { Component, inject, ViewChild } from '@angular/core';
import { RequestResourceListComponent } from '../../components/request-resource/request-resource-list/request-resource-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { RequestResourceFormComponent } from '../../components/request-resource/request-resource-form/request-resource-form.component';
import { StatusFormComponent } from '../../components/status/status-form.component';
import { RequestResourceService } from '../../services/request-resource.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { EventsService } from '../../services/event.service';
import { IRequestResource } from '../../interfaces';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [RequestResourceListComponent, PaginationComponent, LoaderComponent, ModalComponent, RequestResourceFormComponent, StatusFormComponent],
  templateUrl: './recuest-resource.component.html',
  styleUrl: './recuest-resource.component.scss'
})
export class SolicitudesComponent {

  public requestResourceService: RequestResourceService = inject(RequestResourceService);
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

    this.requestResourceService.search.page = 1;
    this.requestResourceService.getAllRequestByUserId(this.userId);
    this.eventService.getAllByUserId(this.userId);
  }

  saveRecurso(recurso: IRequestResource) {
    // antes de guardar la solicitud, se debe asignar el id del usuario que está logueado
    this.requestResourceService.save(recurso);
    this.modalService.closeAll();
  }

  callEdition(recurso: IRequestResource) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['vendor_service_id'].setValue(recurso.vendor_service_id?.service_name ? JSON.stringify(recurso.vendor_service_id.service_name) : '');
    this.solicitudForm.controls['user_id'].setValue(recurso.user?.id  ? JSON.stringify(recurso.user?.id ) : '');
    this.solicitudForm.controls['dateRequest'].setValue(recurso.dateRequest ? new Date(recurso.dateRequest).toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['requested_quantity'].setValue(recurso.requested_quantity ? JSON.stringify(recurso.requested_quantity) : '');
    this.solicitudForm.controls['status'].setValue(recurso.status ? JSON.stringify(recurso.status) : '');
    this.solicitudForm.controls['event_id'].setValue(recurso.event ? JSON.stringify(recurso.event) : '');

    this.modalService.displayModal('md', this.addRecursosModal);
  }

  callEditStatus(recurso: IRequestResource) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['status'].setValue(recurso.status ? JSON.stringify(recurso.status) : '');

    this.modalService.displayModal('md', this.changeStatusModal);
  }

  updatRecurso(recurso: IRequestResource) {
    this.requestResourceService.update(recurso);
    this.modalService.closeAll();
  }

  updateStatus(recurso: IRequestResource) {
    if (! recurso.status) {
      console.error('No se encontró el estado actualizado');
      return;
    }
    this.requestResourceService.updateStatus(recurso.status, recurso.id);
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
