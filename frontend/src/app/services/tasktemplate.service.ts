import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ISearch, ITaskTemplate } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
  })
  export class TaskTemplateService extends BaseService<ITaskTemplate> {
    protected override source: string = 'task-templates';

    private alertService = inject(AlertService);
    private taskTemplateListSignal = signal<ITaskTemplate[]>([]);
    
    public search: ISearch = {
      page: 1,
      size: 1000
    }

    public totalItems: any = [];
    get taskTemplates$() {
      return this.taskTemplateListSignal;
    }
  
    
    getAll() {
      this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
        next: (response: any) => {
          this.search = { ...this.search, ...response.meta };
          this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
          this.taskTemplateListSignal.set(response.data);
        },
        error: (err: any) => {
          console.error('error', err);
        }
      });
    }
    save(taskTemplate: ITaskTemplate) {
      this.add(taskTemplate).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred adding the task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  
    update(taskTemplate: ITaskTemplate) {
      this.editCustomSource(`${taskTemplate.taskTemplateId}`, taskTemplate).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred updating the task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  
    delete(taskTemplate: ITaskTemplate) {
      this.delCustomSource(`${taskTemplate.taskTemplateId}`).subscribe({
        next: (response: any) => {
          this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
          this.getAll();
        },
        error: (err: any) => {
          this.alertService.displayAlert('error', 'An error occurred deleting the task template', 'center', 'top', ['error-snackbar']);
          console.error('error', err);
        }
      });
    }
  }
  