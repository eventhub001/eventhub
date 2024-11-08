
import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IEventForm, ISearch, IEventTaskTemplate } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
  })
  export class EventTaskTemplateService extends BaseService<IEventTaskTemplate> {
    protected override source: string = 'event-task-templates';
    private alertService: AlertService = inject(AlertService)
    private userTaskTemplateListSignal = signal<IEventTaskTemplate[]>([]);
    
    get userTaskTemplates$() {
      return this.userTaskTemplateListSignal;
    }
  
    getAll() {
      this.findAll().subscribe({
        next: (response: any) => {
          this.userTaskTemplateListSignal.set(response.data);
        },
        error: (err: any) => {
          console.error('error', err);
        }
      });
    }
  
    save(userTaskTemplate: IEventTaskTemplate) {
      this.add(userTaskTemplate).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred adding the user task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  
    update(userTaskTemplate: IEventTaskTemplate) {
      this.editCustomSource(`${userTaskTemplate.taskTemplateId}`, userTaskTemplate).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred updating the user task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  
    delete(userTaskTemplate: IEventTaskTemplate) {
      this.delCustomSource(`${userTaskTemplate.taskTemplateId}`).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred deleting the user task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  }
  