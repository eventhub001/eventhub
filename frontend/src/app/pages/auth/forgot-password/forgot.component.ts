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
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss'
})
export class forgotComponent {

  public signUpError!: String;
  public validSignup!: boolean;
  @ViewChild('email') emailModel!: NgModel;
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

  handleChangePassword() {
    let email = this.emailModel.value;
    this.authService.forgotPassword(email).subscribe({
      next: () => this.validSignup = true,
      error: (err: any) => (this.signUpError = err.description),
    });

    window.location.href = '/login';

  }
}
