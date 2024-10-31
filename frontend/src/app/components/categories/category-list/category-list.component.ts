import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ICategory } from '../../../interfaces';
import { routes } from '../../../app.routes';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent {
  @Input() title: string  = '';
  @Input() categories: ICategory[] = [];
  @Output() callModalAction: EventEmitter<ICategory> = new EventEmitter<ICategory>();
  @Output() callDeleteAction: EventEmitter<ICategory> = new EventEmitter<ICategory>();

  public canEdit: boolean = false;
  public authService = inject(AuthService);

  constructor() {
    const appRoutes = routes.filter(route => route.path == 'app')[0].children?.filter(route => route.path == 'products')[0];
    this.canEdit = this.authService.areActionsAvailable(appRoutes?.data?.['actionsAvailableAuthorities']);
  }
}
