import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ICategory, IOrder, IProduct } from '../../../interfaces';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss'
})
export class ProductsFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @ViewChild('categoryTd') categoryTd!: ElementRef;
  @Input() productForm!: FormGroup;
  @Input() categories!: ICategory[];
  @Output() callSaveMethod: EventEmitter<IProduct> = new EventEmitter<IProduct>();
  @Output() callUpdateMethod: EventEmitter<IProduct> = new EventEmitter<IProduct>();

  callSave() {
    //this.categoryId = this.categoryTd.nativeElement.getAttribute('data-category-id')
      let product: IProduct = {
        name: this.productForm.controls['name'].value,
        description: this.productForm.controls['description'].value,
        price: this.productForm.controls['price'].value,
        stock: this.productForm.controls['stock'].value,
        category: {id: this.productForm.controls['category'].value, name: this.productForm.controls['category'].value}
      }
    if(this.productForm.controls['id'].value) {
      product.id = this.productForm.controls['id'].value;
    } 
    if(product.id) {
      this.callUpdateMethod.emit(product);
    } else {
      this.callSaveMethod.emit(product);
    }
  }
}