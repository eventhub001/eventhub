import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IStatus, SolicituRecurso } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SolicituRecursoService extends BaseService<SolicituRecurso> {

  protected override source: string = 'api/solicitudes';
  private solicitudRecursoListSignal = signal<SolicituRecurso[]>([]);
  private alertService = inject(AlertService);

  get solicitudRecurso$() {
    return this.solicitudRecursoListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 10
  };

  public totalItems: any = [];

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i+1);
        this.solicitudRecursoListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllRecursosByUserId(userId: number) {
    this.findAllWithParamsAndCustomSource(`user/${userId}/solicitudes`, { page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.solicitudRecursoListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(solicitud: SolicituRecurso) {
    this.add(solicitud).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Solicitud saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error saving solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }



  update(solicitud: SolicituRecurso) {
    this.editCustomSource(`${solicitud.id}`, solicitud).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Solicitud updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error updating solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  updateStatus(status: IStatus, id?: number) {
    this.editCustomSourceStatus(`${id}`, status).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Solicitud actualizada con éxito', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al actualizar la solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(solicitud: SolicituRecurso) {
    this.delCustomSource(`${solicitud.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Solicitud deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error deleting solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
