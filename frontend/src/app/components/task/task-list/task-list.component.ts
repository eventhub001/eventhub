import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {ITask} from '../../../interfaces';
import { CommonModule, formatDate } from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  @Input() title: string  = '';
  @Input() tasks: ITask[] = [];
  @Output() callModalAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  @Output() callDeleteAction: EventEmitter<ITask> = new EventEmitter<ITask>();
  public authService: AuthService = inject(AuthService);
  @Input() eventIdSelected: number | null = null; 

  public todayDate: Date;
  public dataSource: MatTableDataSource<ITask>;
  public displayedColumns: string[] = ['id', 'taskName', 'description', 'status', 'dueDate', 'priority', 'actions'];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Asigna la fecha de hoy formateada a la variable todayDate
    this.todayDate = new Date();
    this.dataSource = new MatTableDataSource(this.tasks);


  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  ngOnChanges() {
    this.dataSource.data = this.tasks;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
