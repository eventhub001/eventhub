import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IEventFormQuestion } from '../../../interfaces';

/** @title Task Form AI Component */
@Component({
  selector: 'task-form-ai',
  templateUrl: 'task-formai.component.html',
  styleUrls: ['task-formai.component.scss'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule, MatOptionModule, CommonModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormAIComponent {

  @Input() taskForm!: FormGroup;
  @Output() isValidInput: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() eventFormQuestion: IEventFormQuestion[] = []; 

  emitIsValidInput() {
    // Emit validity status of the form
    const isValid = this.taskForm.valid;
    
    // Emit the overall form validity
    this.isValidInput.emit(isValid);
  }

  getOptionsForQuestion(questionid: number): any {
    const mapping: any = {
      1: [
        'Equipo audiovisual', 'Sonido', 'Wi-Fi', 'Decoración', 'Pantalla',
        'Iluminación', 'Sillas', 'Mesas', 'Escenario', 'Micrófonos',
        'Pizarras', 'Transporte', 'Electricidad', 'Carpas', 'Stands',
        'Espacios de descanso', 'Zona de catering', 'Estacionamiento', 
        'Material promocional', 'Servicio de seguridad', 'Proyección',
        'Personal de apoyo', 'Mobiliario adicional', 'Material de limpieza'
      ],
      2: [
        '5-20', '10-30', '20-50', '30-70', '50-100', 
        '100-200', '200-500', '500-1000', '1000-2000', 'Más de 2000'
      ],
      3:  [
        'Ponentes principales', 'Sesión de networking', 'Talleres interactivos', 
        'Panel de expertos', 'Café y desayuno', 'Conferencia magistral', 
        'Almuerzo de trabajo', 'Rueda de prensa', 'Exposición de productos', 
        'Presentación de nuevos proyectos'
      ],
      4: [
        "Iluminación", "Wi-Fi", "Streaming en vivo", "Aplicaciones de votación o encuestas",
        "Control de acceso", "Pantallas y proyectores", "Realidad aumentada o virtual",
        "Sistemas de traducción simultánea", "Plataformas de registro", "Equipos de grabación",
        "Sistemas de backup de energía", "Aplicaciones móviles para el evento"
      ],
      5: [
        "Sin limite", "Medio presupuesto", "Presupuesto pequeño"
      ]
    };

    return mapping[questionid];
  }

  getMappingFromQuestionName(questioname: string) {
    const mapping: any = {
      "¿Qué necesitas para tu evento?": [
        'Equipo audiovisual', 'Sonido', 'Wi-Fi', 'Decoración', 'Pantalla',
        'Iluminación', 'Sillas', 'Mesas', 'Escenario', 'Micrófonos',
        'Pizarras', 'Transporte', 'Electricidad', 'Carpas', 'Stands',
        'Espacios de descanso', 'Zona de catering', 'Estacionamiento', 
        'Material promocional', 'Servicio de seguridad', 'Proyección',
        'Personal de apoyo', 'Mobiliario adicional', 'Material de limpieza'
      ],
      "¿Qué rango de personas?": [
        '5-20', '10-30', '20-50', '30-70', '50-100', 
        '100-200', '200-500', '500-1000', '1000-2000', 'Más de 2000'
      ],
      "¿Cuál es el objetivo de tu evento?": [
        'Ponentes principales', 'Sesión de networking', 'Talleres interactivos', 
        'Panel de expertos', 'Café y desayuno', 'Conferencia magistral', 
        'Almuerzo de trabajo', 'Rueda de prensa', 'Exposición de productos', 
        'Presentación de nuevos proyectos'
      ]    
    };

    return mapping[questioname];
  }

  isOneSelectionOnly(formControlName: string): boolean {
    const mapping: any = {
      'rangoPersonasInput': true,
      'presupuestoInput': true,
    };
    return mapping[formControlName];
  }

}
