import { VendorService } from './../../../../services/vendor.service';
import { VendorServiceService } from './../../../../services/vendor-service.service';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IVendor, ICotizacion, IVendorService } from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';
import { VendorcategoryService } from '../../../../services/vendorcategory.service';
import { IVendorCategory } from '../../../../interfaces';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { CotizarFormComponent } from "../../../cotizar/cotizar-form/cotizar-form.component";
import { ModalComponent } from "../../../modal/modal.component";
import { ModalService } from '../../../../services/modal.service';
import { Validators, FormBuilder } from '@angular/forms';
import { CotizacionService } from '../../../../services/Cotizacion.Service';
import { M } from 'vite/dist/node/types.d-aGj9QkWt';

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
    MatIconModule, CotizarFormComponent, ModalComponent],
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent {

  @Input() title: string = '';
  @Input() vendor: IVendor[] = [];
  @Output() callModalAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  @Output() callDeleteAction: EventEmitter<IVendor> = new EventEmitter<IVendor>();
  public authService: AuthService = inject(AuthService);
  public categories: IVendorCategory[] = [];
  public vendorCategoryService: VendorcategoryService = inject(VendorcategoryService);
  public dataSource: MatTableDataSource<IVendor>;
  public displayedColumns: string[] = ['id', 'name', 'description', 'location', 'rating', 'category', 'actions'];
  public cotizacionService: CotizacionService = inject(CotizacionService);
  public modalService: ModalService = inject(ModalService);
  public userService: UserService = inject(UserService);
  public VendorServiceService: VendorServiceService = inject(VendorServiceService);
  public VendorService: VendorService = inject(VendorService);
  @Input() servicios: IVendorService[] = [];

  selectedVendor: IVendor | null = null;
  vendors: IVendor | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('addCotizacionesModal') public addCotizacionesModal: any;


  cotizacionForm = this.fb.group({
    id: [''],
    event_event_id: ['', Validators.required],
    vendor_service_id: ['', Validators.required],
    montoCotizado: ['', Validators.required],
    cantidadRecurso: ['', Validators.required],
    user: ['', Validators.required],
    estado: ['enviada', Validators.required],
    service: ['']
  });


  openAddCotizacionesModal(vendor: IVendor) {
    this.selectedVendor = vendor;
    console.log('Selected Vendor ID:', vendor.id);
    this.modalService.displayModal('md', this.addCotizacionesModal);
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

  getVendorDetails(): void {



  }

  constructor(private router: Router, private fb: FormBuilder) {
    this.dataSource = new MatTableDataSource(this.vendor);
    this.loadCategories();
  }

  navigateToDetails(userId: number) {
    this.userService.setUserId(userId);
    this.router.navigate(['app/details']);
  }

  navigateToCotizacion(cotizacionId: number) {
    this.router.navigate(['app/cotizar', cotizacionId]);
  }

  private loadCategories(): void {
    this.vendorCategoryService.getAll();
    this.categories = this.categories;
    console.log('Categorías cargadas:', this.categories);
    this.assignCategoriesToVendors();
    this.saveToLocalStorage();
  }

  private assignCategoriesToVendors(): void {
    this.vendor.forEach(vendor => {
      vendor.vendorCategory = this.categories.find(category => category.id == vendor.vendorCategory?.id);
    });
    console.log('Proveedores con categorías asignadas:', this.vendor);
    this.dataSource.data = this.vendor;
    this.saveToLocalStorage();
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
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  saveCotizacion(cotizacion: ICotizacion) {
    cotizacion.montoCotizado = this.cotizacionForm.controls['montoCotizado'].value ? Number(this.cotizacionForm.controls['montoCotizado'].value) : undefined;
    cotizacion.cantidadRecurso = this.cotizacionForm.controls['cantidadRecurso'].value ? Number(this.cotizacionForm.controls['cantidadRecurso'].value) : undefined;
    cotizacion.estado = 'enviada';

    this.cotizacionService.save(cotizacion);
    this.modalService.closeAll();

  }

  callEdition(cotizacion: ICotizacion) {
    console.log('Abriendo el formulario de edición para:', cotizacion);
    this.cotizacionForm.controls['id'].setValue(cotizacion.id ? cotizacion.id.toString() : '');
    this.cotizacionForm.controls['event_event_id'].setValue(cotizacion.event_event_id && cotizacion.event_event_id ? cotizacion.event_event_id.toString() : null);
    this.cotizacionForm.controls['vendor_service_id'].setValue(cotizacion.vendor_service_id && cotizacion.vendor_service_id ? cotizacion.vendor_service_id.toString() : null);
    this.cotizacionForm.controls['montoCotizado'].setValue(cotizacion.montoCotizado ? cotizacion.montoCotizado.toString() : '');
    this.cotizacionForm.controls['cantidadRecurso'].setValue(cotizacion.cantidadRecurso ? cotizacion.cantidadRecurso.toString() : '');
    this.cotizacionForm.controls['user'].setValue(cotizacion.user?.id ? cotizacion.user.id.toString() : null);
    this.cotizacionForm.controls['estado'].setValue(cotizacion.estado || 'enviada');

    console.log('Formulario de edición preparado:', this.cotizacionForm.value);
    this.modalService.displayModal('md', this.addCotizacionesModal);
  }


  updateCotizacion(cotizacion: ICotizacion) {
    cotizacion.montoCotizado = this.cotizacionForm.controls['montoCotizado'].value ? Number(this.cotizacionForm.controls['montoCotizado'].value) : undefined;
    cotizacion.cantidadRecurso = this.cotizacionForm.controls['cantidadRecurso'].value ? Number(this.cotizacionForm.controls['cantidadRecurso'].value) : undefined;

    this.cotizacionService.update(cotizacion);
    this.modalService.closeAll();
  }
}
