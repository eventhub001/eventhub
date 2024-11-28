import { ChangeDetectorRef, Component, effect, inject, Input, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { TestComponent } from '../../components/evenmodeller3d/3dsimulator.component';
import { AssetMetadata, AssetModel } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { ModelMetadataService } from '../../services/model-metadata.service';
import { TextureService } from '../../services/texture.service';

@Component({
  selector: 'app-event-modeller',
  standalone: true,
  imports: [TestComponent, CommonModule],
  templateUrl: './eventmodeller.component.html',
  styleUrls: ['./eventmodeller.component.scss']
})
export class EventModellerComponent {
  title = 'event modeller';
  modelMetadata: AssetMetadata[] = [];
  // images: Blob[] = [];
  isLoading: boolean = true;
  modelService: ModelMetadataService = inject(ModelMetadataService);
  textureService: TextureService = inject(TextureService);

  constructor() {
    this.modelService.getAll();
    this.textureService.getAll();

    effect(() => {
      if (this.modelService.models$().length > 0) {
        const models = this.modelService.models$();
        console.log()
        this.modelService.getModels(models);
      }
    });

    effect(() => {
      if (this.modelService.modelModels$().length > 0) {
        console.log("loading models");
        this.modelService.modelModels$();
      }
    });

    effect(() => {
      if (this.modelService.models$().length > 0 && this.modelService.models$().length === this.modelService.search.totalElements) {
        console.log("models data");
        console.log(this.modelService.models$());
        const models = this.modelService.models$();
        this.modelService.getTextures(models);
      }
    });

    effect(() => {
      if (this.textureService.textures$().length > 0 && this.textureService.textures$().length === this.textureService.search.totalElements) {
        console.log("textures data");
        const textures = this.textureService.textures$();
        console.log(textures);
        this.textureService.getTextures(textures);
      }
    })
  }
}