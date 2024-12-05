import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { IUser, IVendor, IVendorService } from '../../../../interfaces';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../../../services/vendor.service';
import { UserService } from '../../../../services/user.service';
import { ChatComponent } from "../../../chat/chat/chat.component";
import { ChatService } from '../../../../services/chat.service';
import { NotificationDialogComponent } from '../../../chat/chat/notification-dialog.component/notification-dialog.component.component';
@Component({
  selector: 'app-vendor1-details',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    ChatComponent,
    NotificationDialogComponent
  ],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetails1Component {

  vendor: IVendor | undefined;
  vendorService: IVendorService | undefined;
  service: VendorService = inject(VendorService)
  selectedDate: Date | undefined;
  selectedTime: string = '';
  availabilityStatus: string = '';

  @Input() servicios: IVendorService[] = [];
  @Input() vendors: IVendor[] = [];
  public chatService: ChatService = inject(ChatService);
  public userService: UserService = inject(UserService);

  constructor() {}

ngOnChanges() {
// blabla solicitudRecursos$()
}

  ngOnInit(): void {
    this.loadFromLocalStorage();
    this.getVendorDetails();
    this.chatService.initConnectionSocket()

  }

  getVendorDetails(): void {
    const userId = this.userService.getUserId();
    if (userId !== null) {
      this.service.getVendorByUserId(userId).subscribe({
        next: (vendorService : IVendorService[]) => {
          if (vendorService.length > 0) {
            this.servicios = vendorService;
            this.vendor = vendorService[0].vendor;
            this.saveToLocalStorage();
          }
        },
        error: (err: any) => {
          console.error('Error fetching vendor details', err);
        }
      });
    }
  }


  saveToLocalStorage(): void {
    localStorage.setItem('vendor', JSON.stringify(this.vendor));
    localStorage.setItem('servicios', JSON.stringify(this.servicios));
  }

  loadFromLocalStorage(): void {
    const vendorData = localStorage.getItem('vendor');
    const serviciosData = localStorage.getItem('servicios');
    if (vendorData) {
      this.vendor = JSON.parse(vendorData);
    }
    if (serviciosData) {
      this.servicios = JSON.parse(serviciosData);
    }
  }

}



















