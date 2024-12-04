import { inject, Injectable, signal } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AssetImg, AssetMetadata, AssetModel, AssetTexture, IResponse, ISearch } from '../interfaces';
import { AlertService } from './alert.service';
import { BaseService } from './base-service';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class ModelMetadataService extends BaseService<AssetMetadata> {
  protected override source: string = 'models';
  private modelListSignal = signal<AssetMetadata[]>([]);
  private modelImgListSignal = signal<AssetImg[]>([]);
  private modelModelListSignal = signal<AssetModel[]>([]);
  private modelTextureListSignal = signal<AssetTexture[]>([]);
  public alertService: AlertService = inject(AlertService);
  modelService: ModelService = inject(ModelService);
  get models$() {
    return this.modelListSignal;
  }
  get modelImgs$() {
    return this.modelImgListSignal;
  }

  get modelModels$() {
    return this.modelModelListSignal;
  }
  get modelTextures$() {
    return this.modelTextureListSignal;
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
        this.modelListSignal.set(response.data);
  
        // Array of observables for each image
        const imageRequests = response.data.map((model: AssetMetadata) =>
          this.modelService.getImg(model.modelImgPath).pipe(
            map((imgBlob: Blob) => 
            {
              return {id: model.id, blob: imgBlob}
            }),
          )
        );
  
        // Wait until all image requests are complete
        forkJoin(imageRequests).subscribe({
          next: (imgBlobs: unknown) => {
            const blobs = imgBlobs as AssetImg[];
            this.modelImgListSignal.set(blobs);
          },
          error: (err: any) => {
            console.error('Error loading images', err);
          }
        });
  
        return response.data;
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getModels(assetMetadata: AssetMetadata[]) {
    assetMetadata.forEach((model: AssetMetadata) => {
      this.modelService.getModel(model.modelPath).subscribe({
        next: (response: any) => {
          this.modelModelListSignal.update(
            current => [...current, {id: model.id, blob: response}]
          );
        },
        error: (err: any) => {
          console.error('error', err);
        }
      })
    });
  }

  getTextures(assetMetadata: AssetMetadata[]) {
    assetMetadata.forEach((model: AssetMetadata) => {
      this.modelService.getTexture(model.modelTexturePath).subscribe({
        next: (response: any) => {
          this.modelTextureListSignal.update(
            current => [...current, {id: model.id, blob: response}]
          );
        },
        error: (err: any) => {
          console.error('error', err);
        }
      })
    });
  }
  getAllByUser() {
    this.findAllWithParamsAndCustomSource(`models`, { page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i + 1);
        this.modelListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getImg(filename: string): Observable<Blob> {
    return this.http.get(`${this.source}/files/img/${filename}`, { responseType: 'blob' });
  }

  save(model: AssetMetadata) {
    this.add(model).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        console.log('success', response.message);
        this.getAll();
      },
      error: (err: any) => {
        //this.alertService.displayAlert('error', 'An error occurred adding the model', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
  
  update(model: AssetMetadata) {
    this.editCustomSource(`${model.id}`, model).subscribe({
      next: (response: any) => {
        //this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        console.log('success', response.message);
        this.getAll();
      },
      error: (err: any) => {
        //this.alertService.displayAlert('error', 'An error occurred updating the model', 'center', 'top', ['error-snackbar']);
        console.log('error', err);
        console.error('error', err);
      }
    });
  }
  
  delete(model: AssetMetadata) {
    this.delCustomSource(`${model.id}`).subscribe({
      next: (response: any) => {
        //this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        console.log('success', response.message);
        this.getAll();
      },
      error: (err: any) => {
        //this.alertService.displayAlert('error', 'An error occurred deleting the model', 'center', 'top', ['error-snackbar']);
        console.log('error', err);
        console.error('error', err);
      }
    });
  }
}
