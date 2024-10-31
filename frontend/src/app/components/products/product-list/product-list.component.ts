import { AfterViewInit, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IProduct, IAuthority } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {


  public canEdit: boolean = false;
  public authService = inject(AuthService);

  @Input() title: string  = '';
  @Input() userAuthorities: IAuthority[] | undefined = [];
  @Input() products: IProduct[] = [];
  @Output() callModalAction: EventEmitter<IProduct> = new EventEmitter<IProduct>();
  @Output() callDeleteAction: EventEmitter<IProduct> = new EventEmitter<IProduct>();

  constructor() {
    const appRoutes = routes.filter(route => route.path == 'app')[0].children?.filter(route => route.path == 'products')[0];
    
    this.canEdit = this.authService.areActionsAvailable(appRoutes?.data?.['actionsAvailableAuthorities']);
   }
}
