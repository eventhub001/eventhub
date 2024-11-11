import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IEventForm, ISearch } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class EventFormService extends BaseService<IEventForm> {
  protected override source: string = 'event-forms';
  private eventFormListSignal = signal<IEventForm[]>([]);
  
  get eventForms$() {
    return this.eventFormListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }
  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventFormListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(eventForm: IEventForm) {
    this.add(eventForm).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the event form', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(eventForm: IEventForm) {
    this.editCustomSource(`${eventForm.taskFormId}`, eventForm).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the event form', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(eventForm: IEventForm) {
    this.delCustomSource(`${eventForm.taskFormId}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the event form', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
