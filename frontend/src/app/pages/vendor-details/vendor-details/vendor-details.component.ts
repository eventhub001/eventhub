import { RequestResourceService } from './../../../services/request-resource.service';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { VendorService } from '../../../services/vendor.service';
import { UserService } from '../../../services/user.service';
import { LoaderComponent } from "../../../components/loader/loader.component";
import { VendorDetails1Component } from '../../../components/vendor/vendor-details/vendor-details/vendor-details.component';
import { IQuote, IRequestResource, IVendor, IVendorService} from '../../../interfaces';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ChatComponent } from "../../../components/chat/chat/chat.component";
import { RequestResourceFormComponent } from "../../../components/request-resource/request-resource-form/request-resource-form.component";
import { ModalComponent } from "../../../components/modal/modal.component";
import { QuoteFormComponent } from "../../../components/quote/quote-form/quote-form.component";
import { FormBuilder, Validators } from '@angular/forms';
import { EventsService } from '../../../services/event.service';
import { ModalService } from '../../../services/modal.service';
import { QuoteService } from '../../../services/quote.service';


@Component({
  selector: 'app-vendor-details',
  standalone: true,
  imports: [LoaderComponent, VendorDetailsComponent, VendorDetails1Component, MatCardModule, MatButtonModule, CommonModule, ChatComponent, RequestResourceFormComponent, ModalComponent, QuoteFormComponent],
  templateUrl: './vendor-details.component.html',
  styleUrl: './vendor-details.component.scss'
})
export class VendorDetailsComponent {
  public vendorService: VendorService = inject(VendorService);
  public userService: UserService = inject(UserService);
  public fb: FormBuilder = inject(FormBuilder);
  public eventService: EventsService = inject(EventsService);
  public requestresourceService:  RequestResourceService= inject(RequestResourceService);
  public modalService: ModalService = inject(ModalService);
  public VendorService: VendorService = inject(VendorService);
  public quoteService: QuoteService = inject(QuoteService);
  vendor: IVendor | undefined;
  vendors: IVendor | undefined;
  userId: number = 0;
  selectedVendor: IVendor | null = null;
  @ViewChild('addRequestModal') public addRequestModal: any;
  @ViewChild('addQuoteModal') public addQuoteModal: any;
  @Input() servicios: IVendorService[] = [];

  constructor() {

    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId);
    } else {
      console.error('No user found in localStorage');
    }
    this.eventService.getAllByUserId(this.userId);

    this.requestresourceService.search.page = 1;
  // this.requestresourceService.getAllRecursosByUserId(this.userId);

    this.vendorService.search.page = 1;
    const userId = this.userService.getUserId();
    if (userId !== null) {
      this.vendorService.getVendorByUserId(userId);
    } else {
      console.error('User ID is null');
    }

  }

  requestForm = this.fb.group({
    id: [''],
    vendor_service_id: ['', Validators.required],
    user_id: ['', Validators.required],
    dateRequest: ['', Validators.required],
    requested_quantity: ['', Validators.required],
    status: ['', Validators.required],
    event_id: ['', Validators.required],
  });

  quoteForm = this.fb.group({
    id: [''],
    event_id: ['', Validators.required],
    vendor_service_id: ['', Validators.required],
    quoted_amount: ['', Validators.required],
    quantityResource: ['', Validators.required],
    user: ['', Validators.required],
    service: ['']
  });

  saveRequest(request: IRequestResource) {
    console.log('Request:', request);

    this.requestresourceService.save(request);
    this.modalService.closeAll();
  }

  callEdition(request: IRequestResource) {
    this.requestForm.controls['id'].setValue(request.id ? JSON.stringify(request.id) : '');
    this.requestForm.controls['vendor_service_id'].setValue(request.vendor_service_id?.service_name ? JSON.stringify(request.vendor_service_id.service_name) : '');
    this.requestForm.controls['user_id'].setValue(request.user?.id ? JSON.stringify(request.user.id) : '');
    this.requestForm.controls['dateRequest'].setValue(request.dateRequest ? request.dateRequest.toISOString().substring(0, 10) : '');
    this.requestForm.controls['requested_quantity'].setValue(request.requested_quantity ? JSON.stringify(request.requested_quantity) : '');
    this.requestForm.controls['status'].setValue(request.status ? JSON.stringify(request.status) : '');
    this.modalService.displayModal('md', this.addRequestModal);
  }

  updatRequest(Request: IRequestResource) {
    this.requestresourceService.update(Request);
    this.modalService.closeAll();
  }

  loadingUserIdFromLocalStorage(): void {
    const user = localStorage.getItem('auth_user');
    if (user) {
      const userObj = JSON.parse(user);
      this.userId = userObj.id;
      console.log('User ID:', this.userId);
    } else {
      console.error('No user found in localStorage');
    }
  }

  openAddQuoteModal(vendor: IVendor) {
    this.selectedVendor = vendor;
    console.log('Selected Vendor ID:', vendor.id);
    this.modalService.displayModal('md', this.openAddQuoteModal);
    this.VendorService.getVendorByUserId(vendor!.id!).subscribe({
      next: (vendor_service_id : IVendorService[]) => {
        if (vendor_service_id.length > 0) {
          this.servicios = vendor_service_id;
          this.vendors = vendor_service_id[0].vendor;

        }
      },
      error: (err: any) => {
        console.error('Error fetching vendor details', err);
      }
    });
  }

  saveQuote(quote: IQuote) {
    let status = {id:1, status: 'Pendiente', description: 'Pending approval'};
    quote.quoted_amount = this.quoteForm.controls['quoted_amount'].value ? Number(this.quoteForm.controls['quoted_amount'].value) : undefined;
    quote.quantityResource = this.quoteForm.controls['quantityResource'].value ? Number(this.quoteForm.controls['quantityResource'].value) : undefined;
    quote.status = status;
    console.log('Quote:', quote);

    this.quoteService.save(quote);
    this.modalService.closeAll();

  }

  callEditio(quote: IQuote) {
    console.log('Abriendo el formulario de edición para:', quote);
    this.quoteForm.controls['id'].setValue(quote.id ? quote.id.toString() : '');
    this.quoteForm.controls['vendor_service_id'].setValue(quote.vendor_service_id && quote.vendor_service_id.id ? quote.vendor_service_id.id.toString() : null);
    this.quoteForm.controls['quoted_amount'].setValue(quote.quoted_amount ? quote.quoted_amount.toString() : '');
    this.quoteForm.controls['quantityResource'].setValue(quote.quantityResource ? quote.quantityResource.toString() : '');
    this.quoteForm.controls['user'].setValue(quote.user?.id ? quote.user.id.toString() : null);

    console.log('Formulario de edición preparado:', this.quoteForm.value);
    this.modalService.displayModal('md', this.addQuoteModal);
  }


  updateQuote(cotizacion: IQuote) {
    cotizacion.quoted_amount = this.quoteForm.controls['quoted_amount'].value ? Number(this.quoteForm.controls['quoted_amount'].value) : undefined;
    cotizacion.quantityResource = this.quoteForm.controls['quantityResource'].value ? Number(this.quoteForm.controls['quantityResource'].value) : undefined;

    this.quoteService.update(cotizacion);
    this.modalService.closeAll();
  }



}
