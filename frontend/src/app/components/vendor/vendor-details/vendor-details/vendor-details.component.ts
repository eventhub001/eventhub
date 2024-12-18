import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {  IVendor, IVendorService } from '../../../../interfaces';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../../../services/vendor.service';
import { UserService } from '../../../../services/user.service';
import { ChatService } from '../../../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-vendor1-details',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetails1Component {

  vendor: IVendor | undefined;
  vendorService: IVendorService | undefined;
  service: VendorService = inject(VendorService)
  @Input() servicios: IVendorService[] = [];
  @Input() vendors: IVendor[] = [];
  public chatService: ChatService = inject(ChatService);
  public userService: UserService = inject(UserService);
  public vendorid: number = 0;
  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.vendorid = +params['vendorid'];
      this.getVendorDetails();
    });

  }



  ngOnInit(): void {
    this.loadFromLocalStorage();

    this.chatService.initConnectionSocket()

  }

  getVendorDetails(): void {
    this.service.getServicesByVendorId(this.vendorid).subscribe({
      next: (vendorService: IVendorService[]) => {
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



















