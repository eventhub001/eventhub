import { Component, inject, ViewChild } from '@angular/core';
import { VendorService } from '../../../services/vendor.service';
import { VendorListComponent } from '../../../components/vendor/vendor-list/vendor-list/vendor-list.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IVendor } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [
    VendorListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,

  ],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss'
})
export class VendorComponent {
  public vendorService: VendorService = inject(VendorService);
  public vendors: IVendor[] = [];
  public authService: AuthService = inject(AuthService);


constructor() {
  this.vendorService.search.page = 1;
  this.getVendors();
}

ngOnInit(): void {
  this.loadFromLocalStorage();

}

getVendors(): void {
  let user = this.authService.getUser();
  if (this.authService.isSuperAdmin() || user?.role?.id == 3) {
    this.vendorService.getAll().subscribe({
      next: (vendors: IVendor[]) => {
        console.log('Vendors fetched:', vendors);
        this.vendors = vendors;
        this.saveToLocalStorage();
      },
      error: (err: any) => {
        console.error('Error fetching vendors', err);
      }
    });
  } else {
    const userId = this.authService.getUser()?.id;
    console.log('User ID:', userId);
    this.vendorService.getVendorByUser(userId!).subscribe({
      next: (vendors: IVendor[]) => {
        console.log('Vendors fetched:', vendors);
        this.vendors = vendors;
        this.saveToLocalStorage();
      },
      error: (err: any) => {
        console.error('Error fetching vendors', err);
      }
    });
  }
}

private saveToLocalStorage(): void {
  localStorage.setItem('vendors', JSON.stringify(this.vendors));
}

private loadFromLocalStorage(): void {
  const vendorsData = localStorage.getItem('vendors');
  if (vendorsData) {
    this.vendors = JSON.parse(vendorsData);
  }
}

onPaginationChange(): void {
  this.getVendors();
}
}
