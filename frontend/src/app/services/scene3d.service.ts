import { inject, Injectable, signal } from '@angular/core';
import { IScene3D, ISearch } from '../interfaces';
import { BaseService } from './base-service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class Scene3DService extends BaseService<IScene3D> {

  protected override source: string = 'scene-3d';
  private scene3DListSignal = signal<IScene3D[]>([]);

  get scene3D$() {
    return this.scene3DListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5000
  };

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.scene3DListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching Scene3D data', err);
      }
    });
  }

  save(scene3D: IScene3D) {
    this.add(scene3D).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "The scene has been successfully saved", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred while saving the scene', 'center', 'top', ['error-snackbar']);
        console.error('Error saving Scene3D', err);
      }
    });
  }

  saveAsSubscribe(scene3D: IScene3D){
    return this.add(scene3D);
  }
  update(scene3D: IScene3D) {
    this.editCustomSource(`${scene3D.id}`, scene3D).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "The scene has been successfully updated", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred while updating the scene', 'center', 'top', ['error-snackbar']);
        console.error('Error updating Scene3D', err);
      }
    });
  }

  delete(scene3D: IScene3D) {
    this.delCustomSource(`${scene3D.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La escena ha sido eliminada exitosamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ocurrio al eliminar la escena', 'center', 'top', ['error-snackbar']);
        console.error('Error deleting Scene3D', err);
      }
    });
  }
}
