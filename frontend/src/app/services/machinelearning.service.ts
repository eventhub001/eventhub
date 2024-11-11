import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';

interface IEventForm {
  user_id: string;
  question: string;
  answer: string;
}

interface IComputeResponse {
  status: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class MachineLearningService extends BaseService<IEventForm> {
    
    protected override source: string = 'ml-model';
  /**
   * Calls the compute API on the Flask server.
   * @param data User answers to compute recommendations.
   * @returns Observable with the computed response from the Flask server.
   */
  public computeEventForm(data: { new_user_answers: string }): Observable<IComputeResponse> {
    return this.http.post<IComputeResponse>(`${this.source}/compute`, data);
  }
}
