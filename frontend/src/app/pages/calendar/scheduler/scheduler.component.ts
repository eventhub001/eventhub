import { Component } from '@angular/core';
import { EventSettingsModel } from '@syncfusion/ej2-angular-schedule';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule, ScheduleModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  public eventSettings: EventSettingsModel = {
    dataSource: [
      {
        Id: 1,
        Subject: 'Meeting',
        StartTime: new Date(2023, 9, 15, 10, 0),
        EndTime: new Date(2023, 9, 15, 12, 0)
      }
    ]
  };

}

