import { inject, Injectable, signal } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AssetImg, AssetMetadata, IResponse, ISearch } from '../interfaces';
import { AlertService } from './alert.service';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends BaseService<Blob> {
  protected override source: string = 'models';
  private modelListSignal = signal<AssetMetadata[]>([]);
  private modelImgListSignal = signal<AssetImg[]>([]);
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


  getModel(filename: string): Observable<Blob> {
    return this.findBlobCustomSource(`files/model/${filename}`);
  }

  getImg(filename: string): Observable<Blob> {
    return this.findBlobCustomSource(`files/img/${filename}`);
  }

  getTexture(filename: string) : Observable<Blob> {
    return this.findBlobCustomSource(`files/texture/${filename}`);
  }
}
