import { inject, Injectable, signal } from '@angular/core';
import { IRole } from '../interfaces';
import { BaseService } from './base-service';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService<IRole> {

  protected override source: string = 'roles';
  private roleListSignal = signal<IRole[]>([]);
  get rols$() {
    return this.roleListSignal;
  }

  public totalItems: any = [];
  private authService: AuthService = inject(AuthService);
  private alertService: AlertService = inject(AlertService);

  public getAll() {
    this.findAll().subscribe({
      next: (response: any) => {
        response.reverse();
        this.roleListSignal.set(response);
      },
      error: (error : any) => {
        console.log('error', error);
      }
    });
  }


}
