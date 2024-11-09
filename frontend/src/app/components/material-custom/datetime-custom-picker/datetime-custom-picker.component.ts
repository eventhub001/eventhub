import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker open method */
@Component({
  selector: 'datetime-custom-picker',
  templateUrl: 'datetime-custom-picker.component.html',
  styleUrl: 'datetime-custom-picker.component.scss',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeCustomPickerComponent {

  @Input() dateTimeForm!: FormGroup;
  @Output() isValidInput: EventEmitter<boolean> = new EventEmitter<boolean>();
}
