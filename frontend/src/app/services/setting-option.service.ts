import { Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISettingOption } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class SettingOptionService extends BaseService<ISettingOption> {

  protected override source: string = 'setting-options';
  private settingOptionsSignal = signal<ISettingOption[]>([]);

  get settingOptions$() {
    return this.settingOptionsSignal.asReadonly();
  }

  constructor(private alertService: AlertService) {
    super();
  }

  getAll(page: number = 1, size: number = 10) {
    this.findAllWithParams({ page, size }).subscribe({
      next: (response: any) => {
        this.settingOptionsSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching setting options:', err);
        this.alertService.displayAlert(
          'error',
          'Failed to fetch setting options.',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });
  }

  create(settingOption: ISettingOption) {
    this.add(settingOption).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          'success',
          'Setting option created successfully.',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll(); // Refresh list after creation
      },
      error: (err: any) => {
        console.error('Error creating setting option:', err);
        this.alertService.displayAlert(
          'error',
          'Failed to create setting option.',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });
  }

  update(settingOption: ISettingOption) {
    this.editCustomSource(`${settingOption.id}`, settingOption).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert(
          'success',
          'Setting option updated successfully.',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll(); // Refresh list after update
      },
      error: (err: any) => {
        console.error('Error updating setting option:', err);
        this.alertService.displayAlert(
          'error',
          'Failed to update setting option.',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });
  }

  delete(settingOptionId: number) {
    this.delCustomSource(`${settingOptionId}`).subscribe({
      next: () => {
        this.alertService.displayAlert(
          'success',
          'Setting option deleted successfully.',
          'center',
          'top',
          ['success-snackbar']
        );
        this.getAll(); // Refresh list after deletion
      },
      error: (err: any) => {
        console.error('Error deleting setting option:', err);
        this.alertService.displayAlert(
          'error',
          'Failed to delete setting option.',
          'center',
          'top',
          ['error-snackbar']
        );
      }
    });
  }
}
