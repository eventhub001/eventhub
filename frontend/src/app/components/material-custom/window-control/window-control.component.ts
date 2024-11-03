import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-window-control',
  standalone: true,
  imports: [],
  templateUrl: './window-control.component.html',
  styleUrl: './window-control.component.scss'
})
export class WindowControlComponent {
  @Input() rightComponent!: Component;
  @Input() leftComponent!: Component;
}
