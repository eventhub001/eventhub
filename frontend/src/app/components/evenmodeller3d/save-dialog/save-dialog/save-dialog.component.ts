import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { IScene3D } from '../../../../interfaces';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [],
  templateUrl: './save-dialog.component.html',
  styleUrl: './save-dialog.component.scss'
})
export class SaveDialogComponent {

  @Output() callSaveAction = new EventEmitter<IScene3D>();
  @ViewChild('descriptionInputText') inputText!: ElementRef;
  authService: AuthService = inject(AuthService);

  callSave(save: boolean) {
    if (save) {
      this.callSaveAction.emit({description: this.inputText.nativeElement.value, user: {id: this.authService.getUser()?.id!}});
    }
  }
}
