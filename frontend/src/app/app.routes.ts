import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { SigUpComponent } from './pages/auth/sign-up/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IRoleType } from './interfaces';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { EventModellerComponent } from './pages/eventmodeler/eventmodeller.component';
import { EventmanagerComponent } from './pages/eventmanager/eventmanager.component';
import { TaskComponent } from './pages/task/task.component';
import { VendorComponent } from './pages/vendor/vendor/vendor.component';
import { VendorDetailsComponent } from './pages/vendor-details/vendor-details/vendor-details.component';
import { ChatpageComponent } from './pages/chat/chatpage/chatpage.component';
import { LandingPageComponent } from './pages/lading-pages/ladingpage.component';
import { IndexComponent } from './pages/members/index/index.component';
import { AboutComponent } from './pages/members/about/about.component';
import { ContactComponent } from './pages/members/contact/contact.component';
import { ProductosComponent } from './pages/members/productos/productos.component';
import { UsersComponent } from './pages/users/users.component';
import { AdminRoleGuard } from './guards/admin-role.guard';

export const routes: Routes = [
  { path: '',
    component: LandingPageComponent

  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'signup',
    component: SigUpComponent,
    canActivate: [GuestGuard],
  },
  { path: 'index',
    component: IndexComponent,
  },
  { path: 'about',
    component: AboutComponent,
  },
  { path: 'contact',
    component: ContactComponent,
  },
  { path: 'productos',
    component: ProductosComponent,
  },

  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [

      {
        path: 'app',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
      path: "events",
      component: EventmanagerComponent,
      data: {
        authorities: [
          IRoleType.user,
          IRoleType.superAdmin,
          IRoleType.Producer,
          IRoleType.Supplier
          ],
          name: 'Eventos',
          showInSidebar: true
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ],
          name: 'Calendario',
          showInSidebar: true
        }
      },
      {
        path: 'task',
        component: TaskComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ],
          name: 'Task',
          showInSidebar: false
        }
      },
      {
        path: 'vendor',
        component: VendorComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ],
          name: 'Proveedores',
          showInSidebar: true
        }
      },
      {
        path: 'details',
        component: VendorDetailsComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ],
          name: 'Detalles del Proveedor',
          showInSidebar: false
        }
      },
      {
        path: 'chat',
        component: ChatpageComponent,
        data: {
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ],
          name: 'Chat',
          showInSidebar: false
        }
      },
      {
        path: 'event3dplanner',
        component: EventModellerComponent,
        data: {
          name: 'Modelaje 3D',
          showInSidebar: true,
          authorities: [
            IRoleType.admin,
            IRoleType.superAdmin,
            IRoleType.user,
            IRoleType.Supplier,
            IRoleType.Producer
          ]
        }
      },
    ],
  },
];
