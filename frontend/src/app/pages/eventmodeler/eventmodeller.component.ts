import { ChangeDetectorRef, Component, effect, inject, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TestComponent } from '../../components/evenmodeller3d/3dsimulator.component';
import { AssetModel } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { ModelService } from '../../services/model.service';

@Component({
  selector: 'app-event-modeller',
  standalone: true,
  imports: [TestComponent, CommonModule],
  templateUrl: './eventmodeller.component.html',
  styleUrls: ['./eventmodeller.component.scss']
})
export class EventModellerComponent {
  title = 'event modeller';
  modelMetadata: AssetModel[] = [];
  images: Blob[] = [];
  isLoading: boolean = true;
  modelService: ModelService = inject(ModelService);

  constructor() {
    this.modelService.getAll();
  }
}