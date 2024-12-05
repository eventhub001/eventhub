import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IRequestResource, ISearch, IStatus} from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RequestResourceService extends BaseService<IRequestResource> {

  protected override source: string = 'api/request';
  private requestResourceListSignal = signal<IRequestResource[]>([]);
  private alertService = inject(AlertService);

  get requestResource$() {
    return this.requestResourceListSignal;
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
        this.requestResourceListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllRequestByUserId(userId: number) {
    this.findAllWithParamsAndCustomSource(`user/${userId}/request`, { page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.requestResourceListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(request: IRequestResource) {
    this.add(request).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Request saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error saving request', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }



  update(request: IRequestResource) {
    this.editCustomSource(`${request.id}`, request).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Request updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error updating request', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  updateStatus(status: IStatus, id?: number) {
    this.editCustomSourceStatus(`${id}`, status).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Request actualizada con éxito', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al actualizar la request', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(request: IRequestResource) {
    this.delCustomSource(`${request.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Request deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error deleting request', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
