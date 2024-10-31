import { Component, inject, ViewChild } from '@angular/core';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ModalService } from '../../services/modal.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CategoryListComponent } from '../../components/categories/category-list/category-list.component';
import { CategoriesService } from '../../services/category.service';
import { CategoryFormComponent } from '../../components/categories/category-form/categories-form.component';
import { ICategory } from '../../interfaces';
import { routes } from '../../app.routes';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CategoryListComponent,
    PaginationComponent,
    ModalComponent,
    LoaderComponent,
    CategoryFormComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  public categoriesService: CategoriesService = inject(CategoriesService);
  public modalService: ModalService = inject(ModalService);
  public authService: AuthService = inject(AuthService);
  @ViewChild('addCategoriesModal') public addCategoriesModal: any;
  public fb: FormBuilder = inject(FormBuilder);
  categoryForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    description: ['', Validators.required],
  })

  public canAdd: boolean = false;

  constructor() {
    this.categoriesService.search.page = 1;
    this.categoriesService.getAll();

    const appRoutes = routes.filter(route => route.path == 'app')[0].children?.filter(route => route.path == 'products')[0];
    this.canAdd = this.authService.areActionsAvailable(appRoutes?.data?.['actionsAvailableAuthorities']);
  }

  saveCategory(category: ICategory) {
    this.categoriesService.save(category);
    this.modalService.closeAll();
  }

  callEdition(category: ICategory) {
    this.categoryForm.controls['id'].setValue(category.id ? JSON.stringify(category.id) : '');
    this.categoryForm.controls['name'].setValue(category.name ? category.name : '');
    this.categoryForm.controls['description'].setValue(category.description ? category.description : '');
    this.modalService.displayModal('md', this.addCategoriesModal);
  }

  updateCategory(category: ICategory) {
    this.categoriesService.update(category);
    this.modalService.closeAll();
  }

}
