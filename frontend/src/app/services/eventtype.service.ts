import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IEventType, ISearch } from '../interfaces';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class EventTypesService extends BaseService<IEventType> {
  protected override source: string = 'event-types';
  private eventTypeListSignal = signal<IEventType[]>([]);
  get eventTypes$() {
    return this.eventTypeListSignal;
  }
  public search: ISearch = { 
    page: 1,
    size: 5
  }
  public totalItems: any = [];
  private authService: AuthService = inject(AuthService);
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        console.log(response.data);
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventTypeListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(eventType: IEventType) {
    this.add(eventType).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the event type', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(eventType: IEventType) {
    this.editCustomSource(`${eventType.eventTypeId}`, eventType).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the event type', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(eventType: IEventType) {
    this.delCustomSource(`${eventType.eventTypeId}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the event type', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
