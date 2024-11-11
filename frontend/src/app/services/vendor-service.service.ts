import { Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IVendorService } from '../interfaces';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorServiceService  extends BaseService<IVendorService> {

  protected override source: string = 'vendor_service';
  private vendorServiceListSignal = signal<IVendorService[]>([]);

  get vendorService$() {
    return this.vendorServiceListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }


  public totalItems: any = [];



  getAll(): Observable<IVendorService[]> {
    return this.findAllWithParams({ page: this.search.page, size: this.search.size }).pipe(
      map((response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.vendorServiceListSignal.set(response.data);
        return response.data;
      })
    );
  }
}
