import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ICategory } from '../../../interfaces';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './categories-form.component.html',
  styleUrl: './categories-form.component.scss'
})
export class CategoryFormComponent {
  public fb: FormBuilder = inject(FormBuilder);
  @Input() categoryForm!: FormGroup;
  @Output() callSaveMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
  @Output() callUpdateMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();

  callSave() {
    let category: ICategory = {
      name: this.categoryForm.controls['name'].value,
      description: this.categoryForm.controls['description'].value,
    };
    if (this.categoryForm.controls['id'].value) {
      category.id = this.categoryForm.controls['id'].value;
    }
    if (category.id) {
      this.callUpdateMethod.emit(category);
    } else {
      this.callSaveMethod.emit(category);
    }
  }
}
