import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, IVendorCategory } from '../interfaces';
import { AlertService } from './alert.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorcategoryService extends BaseService<IVendorCategory> {

  protected override source: string = 'vendor_category';
  private vendorCategoryListSignal = signal<IVendorCategory[]>([]);

  get vendorCategory$() {
    return this.vendorCategoryListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }


  public totalItems: any = [];



  getAll(): Observable<IVendorCategory[]> {
    return this.findAllWithParams({ page: this.search.page, size: this.search.size }).pipe(
      map((response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.vendorCategoryListSignal.set(response.data);
        return response.data;
      })
    );
  }

}
