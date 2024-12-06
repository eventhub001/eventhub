import { QuoteFormComponent } from './../quote-form/quote-form.component';
import { CommonModule } from '@angular/common';
import { QuoteService } from './../../../services/quote.service';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { IEvent, IQuote } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cotizacion-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './quote-list.component.html',
  styleUrl: './quote-list.component.scss'
})
export class QuoteListComponent implements OnInit {

  @Input() title: string = '';
  @Input() recursos: IQuote[] = [];
  @Input() eventos: IEvent[] = [];
  @Output() callModalAction: EventEmitter<IQuote> = new EventEmitter<IQuote>();
  @Output() callDeleteAction: EventEmitter<IQuote> = new EventEmitter<IQuote>();
  @Output() callEditStatusAction: EventEmitter<IQuote> = new EventEmitter<IQuote>();
  public AuthService: AuthService = inject(AuthService);
  public QuoteService: QuoteService = inject(QuoteService);
  user: any;

  ngOnInit(): void {
    this.user = this.AuthService.getUser();
  }

}
