import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { of } from 'rxjs';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call findAllWithParams with correct parameters and update state on success', () => {
    const mockResponse = {
      meta: { page: 1, size: 10, totalPages: 3 },
      data: [{ id: 1, name: 'Task1' }, { id: 2, name: 'Task2' }],
    };

    console.log('Input from service HTTP request:', mockResponse);

    service.getAll();

    const req = httpMock.expectOne(`task?page=1&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    console.log('Output from service get method:', service.task$());
    expect(service.task$()).toEqual(mockResponse.data);
  });

});
