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

export const routes: Routes = [
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
    path: 'event3dplanner',
    component: EventModellerComponent
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
          ],
          name: 'Events',
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
            IRoleType.user
          ],
          name: 'Dashboard',
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
            IRoleType.user
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
            IRoleType.user
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
            IRoleType.user
          ],
          name: 'Detalles del Proveedor',
          showInSidebar: false
        }
      },

    ],
  },
];
