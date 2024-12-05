import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IRole, IUser } from '../../../interfaces';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SigUpComponent {

  public signUpError!: String;
  public validSignup!: boolean;
  @ViewChild('name') nameModel!: NgModel;
  @ViewChild('lastname') lastnameModel!: NgModel;
  @ViewChild('email') emailModel!: NgModel;
  @ViewChild('password') passwordModel!: NgModel;
  @ViewChild('rol') rolModel!: NgModel;
  roleSelected: number = 0;

  public RolService: RoleService = inject(RoleService);
  public user: IUser = {};

  constructor(private router: Router,
    private authService: AuthService
  ) {
    this.RolService.getAll();
  }

  selectrol(arg0: any) {
    console.log(arg0);
    this.roleSelected = arg0;
  }

  public handleSignup(event: Event) {
    event.preventDefault();

    window.location.href = '/app/dashboard';

    this.user.role = { id: this.roleSelected } as IRole;

    if (!this.nameModel.valid) {
      this.nameModel.control.markAsTouched();
    }
    if (!this.lastnameModel.valid) {
      this.lastnameModel.control.markAsTouched();
    }
    if (!this.emailModel.valid) {
      this.emailModel.control.markAsTouched();
    }
    if (!this.passwordModel.valid) {
      this.passwordModel.control.markAsTouched();
    }
    if (this.emailModel.valid && this.passwordModel.valid) {
      this.authService.signup(this.user).subscribe({
        next: () => this.validSignup = true,
        error: (err: any) => (this.signUpError = err.description),
      });
    }
  }
}
