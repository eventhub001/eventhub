import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IVendor} from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';
import { VendorcategoryService } from '../../../../services/vendorcategory.service';
import { IVendorCategory } from '../../../../interfaces';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';

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
  @Output() callModalAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  @Output() callDeleteAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  @Output() filterApplied = new EventEmitter<number>();
  public authService: AuthService = inject(AuthService);
  public categories: IVendorCategory[] = [];
  public vendorCategoryService: VendorcategoryService = inject(VendorcategoryService);
  public dataSource: MatTableDataSource<IVendor>;
  public displayedColumns: string[] = [ 'name', 'description', 'location', 'rating', 'category', 'actions'];
  public userService: UserService = inject(UserService);


  selectedVendor: IVendor| null = null;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(  private router: Router ) {
    this.dataSource = new MatTableDataSource(this.vendor);
    this.loadCategories();
  }


  navigateToDetails(vendorId: number) {
    this.router.navigate(['app/details', vendorId]);
  }

  private loadCategories(): void {
    this.vendorCategoryService.getAll()
      this.categories = this.categories;
      console.log('Categorías cargadas:', this.categories);
      this.assignCategoriesToVendors();
      this.saveToLocalStorage()
  }



  private assignCategoriesToVendors(): void {
    this.vendor.forEach(vendor => {
      vendor.vendorCategory = this.categories.find(category => category.id == vendor.vendorCategory?.id);
    });
    console.log('Proveedores con categorías asignadas:', this.vendor);
    this.dataSource.data = this.vendor;
    this.saveToLocalStorage()
  }




  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;


  }


  ngOninit() {
    this.loadCategories();
    this.loadFromLocalStorage();

  }



  ngOnChanges() {
    this.dataSource.data = this.vendor;


  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const normalizedFilterValue = this.normalizeString(filterValue);
    this.dataSource.filter = normalizedFilterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.filterApplied.emit(this.dataSource.filteredData.length);
  }

normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

  saveToLocalStorage(): void {
    localStorage.setItem('vendors', JSON.stringify(this.vendor));
  }

  loadFromLocalStorage(): void {
    const vendorsData = localStorage.getItem('vendors');
    if (vendorsData) {
      this.vendor = JSON.parse(vendorsData);
    }
  }



}
