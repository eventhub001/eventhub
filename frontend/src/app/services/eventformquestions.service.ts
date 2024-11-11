import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IEventFormQuestion, ISearch } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class EventFormQuestionService extends BaseService<IEventFormQuestion> {
  protected override source: string = 'event-form-questions';
  private eventFormQuestionListSignal = signal<IEventFormQuestion[]>([]);

  get eventFormQuestions$() {
    return this.eventFormQuestionListSignal;
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
        console.log("receiving questions: ", response.data);
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.eventFormQuestionListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  save(eventFormQuestion: IEventFormQuestion) {
    this.add(eventFormQuestion).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred adding the event form question', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  update(eventFormQuestion: IEventFormQuestion) {
    this.editCustomSource(`${eventFormQuestion.id}`, eventFormQuestion).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred updating the event form question', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(eventFormQuestion: IEventFormQuestion) {
    this.delCustomSource(`${eventFormQuestion.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'An error occurred deleting the event form question', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }
}
