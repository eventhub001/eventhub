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

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [SolicitudListComponent, PaginationComponent, LoaderComponent, ModalComponent, SolicitudFormComponent],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss'
})
export class SolicitudesComponent {

  public solicituRecursoService: SolicituRecursoService = inject(SolicituRecursoService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addRecursosModal') public addRecursosModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  userId: number  = 0;

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
  }

  saveRecurso(recurso: SolicituRecurso) {
    // antes de guardar la solicitud, se debe asignar el id del usuario que está logueado
    this.solicituRecursoService.save(recurso);
    this.modalService.closeAll();
  }

  callEdition(recurso: SolicituRecurso) {
    this.solicitudForm.controls['id'].setValue(recurso.id ? JSON.stringify(recurso.id) : '');
    this.solicitudForm.controls['vendor_service_id'].setValue(recurso.vendor_service_id?.service_name ? JSON.stringify(recurso.vendor_service_id.service_name) : '');
    this.solicitudForm.controls['user_id'].setValue(recurso.user_id ? JSON.stringify(recurso.user_id) : '');
    this.solicitudForm.controls['fechaSolicitud'].setValue(recurso.fechaSolicitud ? new Date(recurso.fechaSolicitud).toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['fechaEvento'].setValue(recurso.fechaEvento ? new Date(recurso.fechaEvento).toISOString().substring(0, 10) : '');
    this.solicitudForm.controls['horaEvento'].setValue(recurso.horaEvento ? recurso.horaEvento : '');
    this.solicitudForm.controls['cantidad_solicitada'].setValue(recurso.cantidad_solicitada ? JSON.stringify(recurso.cantidad_solicitada) : '');
    this.solicitudForm.controls['estado'].setValue(recurso.estado ? JSON.stringify(recurso.estado) : '');
    this.solicitudForm.controls['event_id'].setValue(recurso.event_id ? JSON.stringify(recurso.event_id) : '');

    this.modalService.displayModal('md', this.addRecursosModal);
  }

  updatRecurso(recurso: SolicituRecurso) {
    this.solicituRecursoService.update(recurso);
    this.modalService.closeAll();
  }

  loadingUserIdFromLocalStorage(): void {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId); // Agrega este registro para depurar
    } else {
      console.error('No user found in localStorage');
    }
  }
}
