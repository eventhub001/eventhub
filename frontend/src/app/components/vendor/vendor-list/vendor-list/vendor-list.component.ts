import { QuoteService } from './../../../../services/quote.service';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IQuote, IVendor, IVendorService} from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';
import { VendorcategoryService } from '../../../../services/vendorcategory.service';
import { IVendorCategory } from '../../../../interfaces';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { VendorService } from '../../../../services/vendor.service';

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
  public userService: UserService = inject(UserService);
  public VendorService: VendorService = inject(VendorService);
  public quoteService: QuoteService = inject(QuoteService);
  private fb: FormBuilder = inject(FormBuilder);
  public displayedColumns: string[] = ['id', 'name', 'description', 'location', 'rating', 'category', 'actions'];
  @Input() servicios: IVendorService[] = [];


  selectedVendor: IVendor| null = null;
  vendors: IVendor | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('addQuoteModal') public addQuoteModal: any;
  modalService: any;

  constructor(  private router: Router ) {
    this.dataSource = new MatTableDataSource(this.vendor);
    this.loadCategories();
  }
  quoteForm = this.fb.group({
    id: [''],
    event_id: ['', Validators.required],
    vendor_service_id: ['', Validators.required],
    montoCotizado: ['', Validators.required],
    cantidadRecurso: ['', Validators.required],
    user: ['', Validators.required],
    estado: ['', Validators.required],
    service: ['']
  });

  openAddQuotesModal(vendor: IVendor) {
    this.selectedVendor = vendor;
    console.log('Selected Vendor ID:', vendor.id);
    this.modalService.displayModal('md', this.addQuoteModal);
    this.VendorService.getVendorByUserId(vendor!.id!).subscribe({
      next: (vendor_service_id : IVendorService[]) => {
        if (vendor_service_id.length > 0) {
          this.servicios = vendor_service_id;
          this.vendors = vendor_service_id[0].vendor;

        }
      },
      error: (err: any) => {
        console.error('Error fetching vendor details', err);
      }
    });
  }

  navigateToQuote(quoteId: number) {
    this.router.navigate(['app/quote', quoteId]);
  }

  saveCotizacion(quote: IQuote) {
    quote.quoted_amount = this.quoteForm.controls['montoCotizado'].value ? Number(this.quoteForm.controls['montoCotizado'].value) : undefined;
    quote.quantityResource = this.quoteForm.controls['cantidadRecurso'].value ? Number(this.quoteForm.controls['cantidadRecurso'].value) : undefined;
    quote.status = { id: 1, status: 'Pending', description: 'Pending approval' };

    this.quoteService.save(quote);
    this.modalService.closeAll();

  }

  callEdition(cotizacion: IQuote) {
    console.log('Abriendo el formulario de edición para:', cotizacion);
    this.quoteForm.controls['id'].setValue(cotizacion.id ? cotizacion.id.toString() : '');
    this.quoteForm.controls['event_id'].setValue(cotizacion.event_id && cotizacion.event_id ? cotizacion.event_id.toString() : null);
    this.quoteForm.controls['vendor_service_id'].setValue(cotizacion.vendor_service_id && cotizacion.vendor_service_id ? cotizacion.vendor_service_id.toString() : null);
    this.quoteForm.controls['montoCotizado'].setValue(cotizacion.quoted_amount ? cotizacion.quoted_amount.toString() : '');
    this.quoteForm.controls['cantidadRecurso'].setValue(cotizacion.quantityResource ? cotizacion.quantityResource.toString() : '');
    this.quoteForm.controls['user'].setValue(cotizacion.user?.id ? cotizacion.user.id.toString() : null);
    this.quoteForm.controls['estado'].setValue(cotizacion.status ? cotizacion.status.toString() : '');

    console.log('Formulario de edición preparado:', this.quoteForm.value);
    this.modalService.displayModal('md', this.addQuoteModal);
  }


  updateCotizacion(cotizacion: IQuote) {
    cotizacion.quoted_amount = this.quoteForm.controls['montoCotizado'].value ? Number(this.quoteForm.controls['montoCotizado'].value) : undefined;
    cotizacion.quantityResource = this.quoteForm.controls['cantidadRecurso'].value ? Number(this.quoteForm.controls['cantidadRecurso'].value) : undefined;

    this.quoteService.update(cotizacion);
    this.modalService.closeAll();
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
