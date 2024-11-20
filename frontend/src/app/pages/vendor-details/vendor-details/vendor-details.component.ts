import { Component, inject } from '@angular/core';
import { VendorService } from '../../../services/vendor.service';
import { UserService } from '../../../services/user.service';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { VendorDetails1Component } from '../../../components/vendor/vendor-details/vendor-details/vendor-details.component';
import { IVendor} from '../../../interfaces';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ChatComponent } from "../../../components/chat/chat/chat.component";


@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [LoaderComponent, VendorDetailsComponent, VendorDetails1Component, MatCardModule, MatButtonModule, CommonModule, ChatComponent],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetailsComponent {
  public vendorService: VendorService = inject(VendorService);
  public userService: UserService = inject(UserService);
  vendor: IVendor | undefined;

  constructor() {
    this.vendorService.search.page = 1;
    const userId = this.userService.getUserId();
    if (userId !== null) {
      this.vendorService.getVendorByUserId(userId);
    } else {
      console.error('User ID is null');
    }

  }







}
