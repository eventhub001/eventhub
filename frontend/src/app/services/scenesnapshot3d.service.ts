import { inject, Injectable, signal } from '@angular/core';
import { ISceneSnapshot3D, ISearch } from '../interfaces';
import { BaseService } from './base-service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SceneSnapshot3DService extends BaseService<ISceneSnapshot3D> {

  protected override source: string = 'scene-snapshot-3d';
  private scenesnapshot3DListSignal = signal<ISceneSnapshot3D[]>([]);

  get sceneSnapshot3D$() {
    return this.scenesnapshot3DListSignal;
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
        this.scenesnapshot3DListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching Scene3D data', err);
      }
    });
  }
  save(scene3D: ISceneSnapshot3D) {
    this.add(scene3D).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "El escenario ha sido guardado exitosamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ocurrio al guardar el escenario', 'center', 'top', ['error-snackbar']);
        console.error('Error saving Scene3D', err);
      }
    });
  }

  update(scene3D: ISceneSnapshot3D) {
    this.editCustomSource(`${scene3D.id}`, scene3D).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "El escenario ha sido actualizado exitosamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ocurrio al actualizar el escenario', 'center', 'top', ['error-snackbar']);
        console.error('Error updating Scene3D', err);
      }
    });
  }

  delete(scene3D: ISceneSnapshot3D) {
    this.delCustomSource(`${scene3D.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "El escenario ha sido eliminado exitosamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ocurrio al eliminar el escenario', 'center', 'top', ['error-snackbar']);
        console.error('Error deleting Scene3D', err);
      }
    });
  }
}
