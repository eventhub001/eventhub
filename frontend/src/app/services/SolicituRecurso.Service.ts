import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, SolicituRecurso } from '../interfaces';
import { AlertService } from './alert.service';
import { map, Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicituRecursoService extends BaseService<SolicituRecurso> {

  protected override source: string = 'solicitud_recurso';
  private solicitudRecursoListSignal = signal<SolicituRecurso[]>([]);

  get solicitudRecurso$() {
    return this.solicitudRecursoListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  };

  public totalItems: any = [];

  getAll(): Observable<SolicituRecurso[]> {
    return this.findAllWithParams({ page: this.search.page, size: this.search.size }).pipe(
      map((response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.solicitudRecursoListSignal.set(response.data);
        return response.data;
      }),
      catchError((err: any) => {
        console.error('Error fetching solicitudes', err);
        return throwError(err);
      })
    );
  }

  save(solicitud: SolicituRecurso) {
    this.add(solicitud).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Solicitud saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error saving solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(solicitud: SolicituRecurso) {
    this.editCustomSource(`${solicitud.id}`, solicitud).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Solicitud updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error updating solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(solicitud: SolicituRecurso) {
    this.delCustomSource(`${solicitud.id}`).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Solicitud deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error deleting solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
