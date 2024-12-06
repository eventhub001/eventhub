import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EventsService } from './event.service';

describe('EventsService', () => {
  let service: EventsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsService],
    });

    service = TestBed.inject(EventsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call findAllWithParams with correct parameters', () => {
    const mockResponse = {
      meta: { page: 1, size: 5, totalPages: 2 },
      data: [{ id: 1, name: 'Conference' }, { id: 2, name: 'Workshop' }],
    };

    console.log('Input from service HTTP request:', mockResponse);

    service.getAll();

    const req = httpMock.expectOne(`events?page=1&size=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    console.log('Output from service get method:', service.events$());
    expect(service.events$()).toEqual(mockResponse.data);
  });
});
