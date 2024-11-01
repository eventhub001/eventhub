import { Component, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
@Component({
  selector: 'app-mat-card-input',
  standalone: true,
  templateUrl: './mat-card-input.component.html',
  styleUrl: './mat-card-input.component.scss'
})
export class MatCardInputComponent {
  @Input() title: string = '';
  @Input() placeHolder: string = '';
}
