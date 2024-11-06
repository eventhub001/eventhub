import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IVendor, IVendorService } from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';
import { VendorcategoryService } from '../../../../services/vendorcategory.service';
import { IVendorCategory } from '../../../../interfaces';
import { VendorServiceService } from '../../../../services/vendor-service.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent {

  @Input() title: string  = '';
  @Input() vendor: IVendor[] = [];
  @Input() vendorService: IVendorService[] = [];
  @Output() callModalAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  @Output() callDeleteAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  public authService: AuthService = inject(AuthService);
  public categories: IVendorCategory[] = [];
  public availability: IVendorService[] = [];
  public vendorCategoryService: VendorcategoryService = inject(VendorcategoryService);
  public vendorServiceService: VendorServiceService = inject(VendorServiceService);
  public dataSource: MatTableDataSource<IVendor>;
  public displayedColumns: string[] = ['id', 'name', 'description', 'location', 'rating', 'category', 'availability'];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(                          ) {
    // Asigna la fecha de hoy formateada a la variable todayDate
    this.dataSource = new MatTableDataSource(this.vendor);
    this.loadCategories();


  }

  private loadCategories(): void {
    this.vendorCategoryService.getAll().subscribe((categories: IVendorCategory[]) => {
      this.categories = categories;
      console.log('Categorías cargadas:', this.categories);
      this.assignCategoriesToVendors();
    });
  }

  private loadAvailability(): void {
    this.vendorServiceService.getAll().subscribe((availability: IVendorService[]) => {
      this.availability = availability;
      this.assignAvailabilityToVendors();
    });
  }

  private assignAvailabilityToVendors(): void {
    this.vendorService.forEach(vendorService => {
      const vendorServices = this.availability.filter(service => service.vendor?.id === vendorService.id);
      vendorService['isAvailable'] = vendorServices.length > 0; // Asignar los servicios al proveedor
    });
    this.dataSource.data = this.vendor;
  }

  private assignCategoriesToVendors(): void {
    this.vendor.forEach(vendor => {
      vendor.vendorCategory = this.categories.find(category => category.id === vendor.vendorCategory?.id);
    });
    console.log('Proveedores con categorías asignadas:', this.vendor);
    this.dataSource.data = this.vendor;
  }




  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource.data = this.vendor;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }






}
