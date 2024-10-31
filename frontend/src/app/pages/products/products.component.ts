import { Component, inject, ViewChild } from '@angular/core';
import { OrdersListComponent } from '../../components/orders/orders-list/orders-list.component';
import { OrdersService } from '../../services/orders.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalService } from '../../services/modal.service';
import { OrdersFormComponent } from '../../components/orders/orders-form/orders-form.component';
import { IOrder, IProduct, IRoleType } from '../../interfaces';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProductListComponent } from '../../components/products/product-list/product-list.component';
import { ProductsService } from '../../services/product.service';
import { ProductsFormComponent } from '../../components/products/product-form/products-form.component';
import { CategoriesService } from '../../services/category.service';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ProductListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    ProductsFormComponent
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  public productsService: ProductsService = inject(ProductsService);
  public modalService: ModalService = inject(ModalService);
  public categoriesService: CategoriesService = inject(CategoriesService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addProductsModal') public addProductsModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  productForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    category: ['', Validators.required], 
  })
  public canAdd: boolean = false;

  constructor() {
    this.productsService.search.page = 1;
    this.categoriesService.getAll();
    this.productsService.getAll();

    const appRoutes = routes.filter(route => route.path == 'app')[0].children?.filter(route => route.path == 'products')[0];
    this.canAdd = this.authService.areActionsAvailable(appRoutes?.data?.['actionsAvailableAuthorities']);
  }

  saveOrder(product: IProduct) {
    this.productsService.save(product);
    this.modalService.closeAll();
  }

  callEdition(product: IProduct) {
    this.productForm.controls['id'].setValue(product.id ? JSON.stringify(product.id) : '');
    this.productForm.controls['name'].setValue(product.name ? product.name : '');
    this.productForm.controls['description'].setValue(product.description ? JSON.stringify(product.description) : '');
    this.productForm.controls['price'].setValue(product.price ? JSON.stringify(product.price) : '');
    this.productForm.controls['stock'].setValue(product.stock ? JSON.stringify(product.stock) : '');
    this.productForm.controls['category'].setValue(product.category?.id ? JSON.stringify(product.category.id) : '');

    this.modalService.displayModal('md', this.addProductsModal);
  }
  
  updateOrder(order: IOrder) {
    this.productsService.update(order);
    this.modalService.closeAll();
  }

}
