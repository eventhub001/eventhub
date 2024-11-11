import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, Cotización } from '../interfaces';
import { AlertService } from './alert.service';
import { map, Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService extends BaseService<Cotización> {

  protected override source: string = 'cotizacion';
  private cotizacionListSignal = signal<Cotización[]>([]);

  get cotizacion$() {
    return this.cotizacionListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  };

  public totalItems: any = [];

  getAll(): Observable<Cotización[]> {
    return this.findAllWithParams({ page: this.search.page, size: this.search.size }).pipe(
      map((response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.cotizacionListSignal.set(response.data);
        return response.data;
      }),
      catchError((err: any) => {
        console.error('Error fetching cotizaciones', err);
        return throwError(err);
      })
    );
  }

  save(cotizacion: Cotización) {
    this.add(cotizacion).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Cotización saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error saving cotización', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(cotizacion: Cotización) {
    this.editCustomSource(`${cotizacion.id}`, cotizacion).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Cotización updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error updating cotización', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(cotizacion: Cotización) {
    this.delCustomSource(`${cotizacion.id}`).subscribe({
      next: (response: any) => {
        inject(AlertService).displayAlert('success', 'Cotización deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        inject(AlertService).displayAlert('error', 'Error deleting cotización', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
