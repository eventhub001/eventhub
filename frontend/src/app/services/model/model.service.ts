import { inject, Injectable, signal } from '@angular/core';
import { Asset, AssetModel, ISearch } from '../../interfaces';
import { BaseService } from '../base-service';
import { AlertService } from '../alert.service';
import { AuthService } from '../auth.service';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends BaseService<AssetModel> {
  protected override source: string = 'models';
  private modelListSignal = signal<AssetModel[]>([]);
  private modelImgListSignal = signal<Blob[]>([]);
  public alertService: AlertService = inject(AlertService);
  get models$() {
    return this.modelListSignal;
  }
  get modelImgs$() {
    return this.modelImgListSignal;
  }
  public search: ISearch = {
    page: 1,
    size: 5
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
        const imageRequests = response.data.map((model: AssetModel) =>
          this.getImg(model.modelImgPath)
        );
  
        // Wait until all image requests are complete
        forkJoin(imageRequests).subscribe({
          next: (imgBlobs: unknown) => {
            const blobs = imgBlobs as Blob[];
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

  save(model: AssetModel) {
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
  
  update(model: AssetModel) {
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
  
  delete(model: AssetModel) {
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
