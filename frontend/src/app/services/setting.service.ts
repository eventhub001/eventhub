import { inject, Injectable, signal } from '@angular/core';
import { ISetting, ISearch } from '../interfaces';
import { BaseService } from './base-service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService extends BaseService<ISetting> {

  protected override source: string = 'settings'; // Replace with your actual API endpoint
  private settingListSignal = signal<ISetting[]>([]);

  get setting$() {
    return this.settingListSignal;
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
        this.settingListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching Setting data', err);
      }
    });
  }

  save(setting: ISetting) {
    this.add(setting).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La configuración se ha guardado correctamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ha ocurrido al guardar la configuración', 'center', 'top', ['error-snackbar']);
        console.error('Error saving Setting', err);
      }
    });
  }

  update(setting: ISetting) {
    this.editCustomSource(`${setting.id}`, setting).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La configuración se ha guardado correctamente", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Un error ha ocurrido al guardar la configuración', 'center', 'top', ['error-snackbar']);
        console.error('Error updating Setting', err);
      }
    });
  }

  delete(setting: ISetting) {
    this.delCustomSource(`${setting.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "The Setting has been deleted successfully", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred while deleting the Setting', 'center', 'top', ['error-snackbar']);
        console.error('Error deleting Setting', err);
      }
    });
  }
}
