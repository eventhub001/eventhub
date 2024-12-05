import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IQuote, ISearch, IStatus } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService extends BaseService<IQuote> {

  protected override source: string = 'api/cotizaciones';
  private quoteListSignal = signal<IQuote[]>([]);
  private alertService = inject(AlertService);

  get quote$() {
    return this.quoteListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 10
  };

  public totalItems: any = [];

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i+1);
        this.quoteListSignal.set(response.data);
        console.log('quotes', response.data);
      },
      error: (err: any) => {
        console.error('error', err);
      }
    });
  }

  getAllQuotesByUserId(userId: number) {
    this.findAllWithParamsAndCustomSource(`user/${userId}/quotes`, { page: this.search.page, size: this.search.size}).subscribe({
      next: (response: any) => {
        this.search = {...this.search, ...response.meta};
        this.totalItems = Array.from({length: this.search.totalPages ? this.search.totalPages : 0}, (_, i) => i + 1);
        this.quoteListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error fetching quotes by user', err);
      }
    });
  }

  save(quote: IQuote) {
    this.add(quote).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Quote saved successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error saving Quote', 'center', 'top', ['error-snackbar']);
        console.error('Error saving Quote', err);
      }
    });
  }

  update(quote: IQuote) {
    this.editCustomSource(`${quote.id}`, quote).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Quote updated successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error updating Quote', 'center', 'top', ['error-snackbar']);
        console.error('Error updating Quote', err);
      }
    });
  }

  updateStatus(status: IStatus, id?: number) {
    this.editCustomSourceStatus(`${id}`, status).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Solicitud actualizada con éxito', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al actualizar la solicitud', 'center', 'top', ['error-snackbar']);
        console.error('error', err);
      }
    });
  }

  delete(quote: IQuote) {
    this.delCustomSource(`${quote.id}`).subscribe({
      next: (response: any) => {
        this.alertService.displayAlert('success', 'Quote deleted successfully', 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error deleting Quote', 'center', 'top', ['error-snackbar']);
        console.error('Error deleting Quote', err);
      }
    });
  }
}
