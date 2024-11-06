import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IVendor } from '../interfaces';
import { AlertService } from './alert.service';
import { EventsService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService extends BaseService<IVendor> {
  protected override source: string = 'vendor';
  private vendorListSignal = signal<IVendor[]>([]);


  get vendor$() {
    return this.vendorListSignal;
  }


  public search: ISearch = {
    page: 1,
    size: 5
  }


  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);
  private eventService: EventsService = inject(EventsService);



  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.vendorListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }


  save(vendor: IVendor) {
    this.add(vendor).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the user','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(vendor: IVendor) {
    this.editCustomSource(`${vendor.id}`, vendor).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the user','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(vendor: IVendor) {
    this.delCustomSource(`${vendor.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the user','center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
