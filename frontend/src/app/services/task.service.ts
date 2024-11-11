import { inject, Injectable, signal } from '@angular/core';
import { IEvent, ISearch, ITask } from '../interfaces';
import { BaseService } from './base-service';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { EventcardsComponent } from '../components/eventcards/eventcards.component';
import { EventsService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends BaseService<ITask> {

  protected override source: string = 'task';
  private taskListSignal = signal<ITask[]>([]);


  get task$() {
    return this.taskListSignal;
  }



  public search: ISearch = {
    page: 1,
    size: 5
  }

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);
  private eventService: EventsService = inject(EventsService); // Inyecta EventService

  getAll() {

    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.taskListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllByEventId(eventId: number) {

    this.findAllWithParamsAndCustomSource(`event/${eventId}/tasks`, { page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages: 0}, (_, i) => i+1);
        this.taskListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(task: ITask) {
    this.add(task).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La tarea ha sido creada exitosamente", 'center', 'top', ['success-snackbar']);
        const eventId = this.eventService.getEventId(); // Obtén el eventId del EventService
        if (eventId !== null) {
          this.getAllByEventId(eventId); // Llama a getAllByEventId con el eventId
        } else {
          console.error('No event ID found');
        }
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the product', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(task: ITask) {
    this.editCustomSource(`${task.id}`, task).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La Tarea ha sido actualizada exitosamente", 'center', 'top', ['success-snackbar']);
        const eventId = this.eventService.getEventId(); // Obtén el eventId del EventService
        if (eventId !== null) {
          this.getAllByEventId(eventId); // Llama a getAllByEventId con el eventId
        } else {
          console.error('No event ID found');
        }
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the product', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(task: ITask) {
    this.delCustomSource(`${task.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', "La tarea ha sido eliminada exitosamente", 'center', 'top', ['success-snackbar']);
        const eventId = this.eventService.getEventId(); // Obtén el eventId del EventService
        if (eventId !== null) {
          this.getAllByEventId(eventId); // Llama a getAllByEventId con el eventId
        } else {
          console.error('No event ID found');
        }
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the product', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }




















}
