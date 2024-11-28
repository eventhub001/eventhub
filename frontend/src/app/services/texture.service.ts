import { inject, Injectable, signal } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AssetImg, AssetMetadata, AssetTexture, AssetTextureMetadata, IResponse, ISearch } from '../interfaces';
import { AlertService } from './alert.service';
import { BaseService } from './base-service';
import { asset } from 'zimjs/ts-src/typings/zim';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class TextureService extends BaseService<Blob> {
  protected override source: string = 'textures';
  public alertService: AlertService = inject(AlertService);
  public modelService: ModelService = inject(ModelService);
  private textureListSignal = signal<AssetTextureMetadata[]>([]);
  private textureTextureListSignal = signal<AssetTexture[]>([]);

  get textures$() {
    return this.textureListSignal;
  }

  get textureTextures$() {
    return this.textureTextureListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 100
  }
  public totalItems: any = [];

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from(
          { length: this.search.totalPages ? this.search.totalPages : 0 },
          (_, i) => i + 1
        );
        this.textureListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getTextures(assetMetadata: AssetTextureMetadata[]) {
    assetMetadata.forEach((model: AssetTextureMetadata) => {
      this.modelService.getTexture(model.texturePath).subscribe({
        next: (response: any) => {
          this.textureTextureListSignal.update(
            current => [...current, {id: model.id, blob: response}]
          );
        },
        error: (err: any) => {
          console.error('error', err);
        }
      })
    });
  }
}
