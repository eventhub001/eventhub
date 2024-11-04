import { ChangeDetectorRef, Component, effect, inject, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { ModelService } from '../../services/model/model.service';
import { TestComponent } from '../../test/test.component';
import { AssetModel } from '../../interfaces';
import { CommonModule } from '@angular/common';

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



  loadModelData(): void {
    this.modelService.getAll();
  }

  loadModelImages(imageFilenames: string[]): void {
    const loadPromises = imageFilenames.map(filename =>
      this.modelService.getImg(filename)
    );

    Promise.all(loadPromises)
      .then(blobs => {
        console.log("Images loaded:", blobs);
        return blobs;
      })
      .catch(error => {
        console.error("Error loading images:", error);
        this.isLoading = false;
      });
  }
}