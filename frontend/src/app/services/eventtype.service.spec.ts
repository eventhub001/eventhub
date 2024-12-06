import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { EventTypesService } from './eventtype.service';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

describe('EventTypesService', () => {
  let service: EventTypesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    
    service = TestBed.inject(EventTypesService);
    httpMock = TestBed.inject(HttpTestingController);
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  })


  it('should call findAllWithParams with correct parameters', () => {

    const mockResponse = {
        meta: { page: 1, size: 264, totalPages: 3 },
        data: [{ id: 1, name: 'Cumpleaños' }, { id: 2, name: 'Concierto' }],
      };

    console.log("input from service http request:", mockResponse);

    service.getAll();

    const req = httpMock.expectOne(`event-types?page=1&size=264`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    
    console.log("output from service get method:", service.eventTypes$());
    expect(service.eventTypes$()).toEqual(mockResponse.data);
  });
});