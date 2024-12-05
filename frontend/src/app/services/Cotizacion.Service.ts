import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, ICotizacion, IStatus } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService extends BaseService<ICotizacion> {

  protected override source: string = 'api/cotizaciones';
  private cotizacionListSignal = signal<ICotizacion[]>([]);
  private alertService = inject(AlertService);

  get cotizacion$() {
    return this.cotizacionListSignal;
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
        this.cotizacionListSignal.set(response.data);
        console.log('cotizaciones', response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllCotizacionesByUserId(userId: number) {
    this.findAllWithParamsAndCustomSource(`user/${userId}/cotizaciones`, { page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i + 1);
        this.cotizacionListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching cotizaciones by user', err);
      }
    });
  }

  save(cotizacion: ICotizacion) {
    this.add(cotizacion).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Cotización saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error saving cotización', 'center', 'top', ['error-snackbar']);
        console.error('Error saving cotización', err);
      }
    });
  }

  update(cotizacion: ICotizacion) {
    this.editCustomSource(`${cotizacion.id}`, cotizacion).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Cotización updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error updating cotización', 'center', 'top', ['error-snackbar']);
        console.error('Error updating cotización', err);
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

  delete(cotizacion: ICotizacion) {
    this.delCustomSource(`${cotizacion.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Cotización deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error deleting cotización', 'center', 'top', ['error-snackbar']);
        console.error('Error deleting cotización', err);
      }
    });
  }
}
