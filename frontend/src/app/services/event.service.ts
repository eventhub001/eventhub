import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IEvent, ISearch } from '../interfaces';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService extends BaseService<IEvent> {
  protected override source: string = 'events';
  private eventListSignal = signal<IEvent[]>([]);

  get events$() {
    return this.eventListSignal;
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
        console.log(this.search);
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }
  private eventId: number | null = null;

  setEventId(id: number) {
    this.eventId = id;
  }
  getEventId(): number | null {
    return this.eventId;
  }

  getAllByUser() {
    this.findAllWithParamsAndCustomSource(`events`, { page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(event: IEvent) {
    this.add(event).subscribe({

      next: (response: any) => {
        this.alertService.displayAlert('success', 'evento guardado correctamente', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the event', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  saveAsSubscribe(event: IEvent) {
    return this.add(event);
  }

  update(event: IEvent) {
    this.editCustomSource(`${event.eventId}`, event).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Evento actualizado correctamente', 'center', 'top', ['success-snackbar']);
        this.getAllByUser();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the event', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(event: IEvent) {
    this.delCustomSource(`${event.eventId}`).subscribe({
      next: (response: any) => {
        console.log('response', response);
        this.alertService.displayAlert('Éxito al borra el evento', "Se ha borrado el evento", 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the event', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  searchByTerm(query: string) {
    this.findAllWithParamsAndCustomSource(`search`, { page: this.search.page, size: this.search.size, search: query }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    })
  }




  getEventsByUserId(userId: number): Observable<IEvent[]> {
    return this.findAllWithParamsAndCustomSource(`user/${userId}`, { page: this.search.page, size: this.search.size }).pipe(
      map((response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
        return response.data;
      })
    );
  }


  getEventsForCurrentWeek() {
    this.findAllWithParamsAndCustomSource(`week`, { page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getEventsForTomorrow() {
    this.findAllWithParamsAndCustomSource(`tomorrow`, { page: this.search.page, size: this.search.size }).subscribe({
      next: (response: any) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }



}
