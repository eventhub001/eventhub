import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { ISceneSnapshot3D, IScene3DSetting, IScene3D } from '../../../../interfaces';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-scene-selection',
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
  templateUrl: './scene-selection.component.html',
  styleUrl: './scene-selection.component.scss'
})
export class SceneSelectionComponent {
  public dataSource: MatTableDataSource<ISceneSnapshot3D>;
  @Input() scenes: ISceneSnapshot3D[] = [];
  @Output() openedSceneSelected: EventEmitter<IScene3D> = new EventEmitter<IScene3D>();
  @Output() deleteSceneAction: EventEmitter<IScene3D> = new EventEmitter<IScene3D>();
  @Output() settingsSelected: EventEmitter<IScene3DSetting> = new EventEmitter<IScene3DSetting>();
  
  callModalAction: any;
  callDeleteAction: any;
  public displayedColumns: string[] = ['description', 'actions'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {scene3D: ISceneSnapshot3D[]}, public dialogRef: MatDialogRef<SceneSelectionComponent>) {
    this.dataSource = new MatTableDataSource(data.scene3D);
  }
  openScene(scene3D: IScene3D) {
    this.openedSceneSelected.emit(scene3D);
  }

  deleteScene(scene3D: IScene3D) {
    this.deleteSceneAction.emit(scene3D);
  }
}
