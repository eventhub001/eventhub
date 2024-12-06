import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IRole, IUser } from '../../../interfaces';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from "@angular/forms";
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss'
})
export class resetComponent implements OnInit{

  public signUpError!: String;
  public validSignup!: boolean;
  @Input("token") token!: string;
  @ViewChild('password') passwordModel!: NgModel;
  password = new FormControl("password");
  roleSelected: number = 0;

  public RolService: RoleService = inject(RoleService);
  private route = inject(ActivatedRoute);
  public user: IUser = {};

  constructor(private router: Router,
    private authService: AuthService

  ) {
    this.RolService.getAll();
  }
  ngOnInit(): void {
    console.log("reset component");
  }


  handleChangePassword() {
    let password = this.passwordModel.value;
    console.log(password);
    console.log(this.token);
    this.authService.resetPassword(this.token, password).subscribe({
      next: () => this.validSignup = true,
      error: (err: any) => (this.signUpError = err.description),
    });

    window.location.href = '/login';

  }


  selectrol(arg0: any) {
    console.log(arg0);
    this.roleSelected = arg0;
  }

}
