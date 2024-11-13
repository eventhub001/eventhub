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
import { IUser, IVendor } from '../../../interfaces';
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
  public user?: IUser;
  public authService: AuthService = inject(AuthService);

  // public modalService: ModalService = inject(ModalService);
  // public authService: AuthService = inject(AuthService);
  // @ViewChild('addVendorModal') public addVendorModal: any;
  // public fb: FormBuilder = inject(FormBuilder);

  // taskForm = this.fb.group({
  //   id: [''],
  //   name: ['', Validators.required],
  //   description: ['', Validators.required],
  //   location: ['', Validators.required],
  //   rating: ['', Validators.required],
  //   vendorCategory: ['', Validators.required],
  // })


constructor() {
  this.vendorService.search.page = 1;
  this.getVendors();
}

ngOnInit(): void {
  this.loadFromLocalStorage();

}

getVendors(): void {
  this.user = this.authService.getUser();
  if (this.authService.isSuperAdmin()) {
    this.vendorService.getAll().subscribe({
      next: (vendors: IVendor[]) => {
        console.log('All vendors fetched:', vendors); // Verifica los datos obtenidos
        this.vendors = vendors;
        this.saveToLocalStorage();
      },
      error: (err: any) => {
        console.error('Error fetching all vendors', err);
      }
    });
  } else {
    this.vendorService.getVendorByUser(this.user?.id!).subscribe({
      next: (vendors: IVendor[]) => {
        console.log('Vendors fetched:', vendors); // Verifica los datos obtenidos
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

// saveVendor(vendor: IVendor) {
//   console.log(vendor)
//   this.vendorService.save(vendor);
//   this.modalService.closeAll();
// }

// callEdition(vendor: IVendor) {
//   this.taskForm.controls['id'].setValue(vendor.id ? JSON.stringify(vendor.id)  : '');
//   this.taskForm.controls['name'].setValue(vendor.name ? vendor.name : '');
//   this.taskForm.controls['description'].setValue(vendor.description ? vendor.description : '');
//   this.taskForm.controls['location'].setValue(vendor.location ? vendor.location : '');
//   this.taskForm.controls['rating'].setValue(vendor.rating ?  JSON.stringify(vendor.rating) : '');

//   this.modalService.displayModal('md', this.addVendorModal);
// }

// updateUser(vendor: IVendor) {
//   this.vendorService.update(vendor);
//   this.modalService.closeAll();
// }

// callModalAction() {
//   this.taskForm.reset();
//   this.modalService.displayModal('md', this.addVendorModal)
// }
}
