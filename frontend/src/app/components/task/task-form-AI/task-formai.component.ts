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
        'Alfombra roja', 'Área de food trucks', 'Arcos', 'Backline', 'Barra de bebidas',
        'Buffet', 'Carpa', 'Centros de mesa', 'Coctelería', 'DJ', 'Flores', 'Fotomatón',
        'Fotografía playa', 'Fotógrafos', 'Guardarropa', 'Iluminación', 'Iluminación escénica',
        'Instrumentos', 'Interpretación', 'Invitaciones', 'Lista invitados', 'Marketing',
        'Material promo', 'Mesas', 'Música en vivo', 'Mantelería', 'Pantalla', 'Parlantes', 'Pastel bodas',
        'Permisos', 'Presentador', 'Premios', 'Redes sociales', 'Seguridad', 'Sillas', 'Sonido',
        'Sonido profesional', 'Sorteos', 'Streaming', 'Wi-Fi', 'Transporte', 'Trofeos', 'Video bodas',
        'Zona juegos', 'Zona VIP'
    ],
      2: [
        '5-20', '10-30', '20-70', 'Más de 70'
      ],
      3: [
        "Promocionar artistas", "generar ingresos", "fomentar cultura",
        "Celebrar el amor", "crear ambiente romántico", "experiencia memorable",
        "Reconocer logros", "fortalecer lazos", "celebrar éxitos",
        "Recaudar fondos", "reconocer a destacados", "fortalecer imagen",
        "Experiencia divertida", "ambiente temático", "interacción social",
        "Reconocer logros", "inspirar", "aumentar visibilidad",
        "Conectar profesionales", "networking", "compartir conocimientos",
        "Lanzar producto", "aumentar ventas", "crear comunidad",
        "Fomentar participación ciudadana", "concienciar", "promover estilo de vida",
        "Celebrar diversidad", "impacto positivo", "conciencia ambiental",
        "Celebrar tradiciones", "expresión artística", "conmemorar historia",
        "Promover igualdad", "educación", "talento joven",
        "Crear espacio seguro", "fomentar colaboración", "celebrar vida",
        "Crear recuerdos", "inspirar futuras generaciones", "dejar legado",
        "Celebrar éxito", "crear ambiente de alegría"
    ],
      4:  [
        "Altar simbólico", "Arreglo floral", "Área de descanso", "Área de micrófono abierto", "Área para food trucks",
        "Buffet temático", "Cabina de DJ", "Cabina de fotos", "Camino iluminado", "Carpa exterior",
        "Carrito de snacks", "Catering", "Cine al aire libre", "Decoración temática", "Escenario",
        "Escenario de banderas", "Espacio para ceremonias", "Espacio para fotos grupales", "Espacio techado", "Estación de café",
        "Fogata", "Fotomatón", "Iluminación decorativa", "Jardín", "Juegos de mesa",
        "Karaoke", "Mesas de banquete", "Mini cancha", "Pantallas de proyección", "Parque inflable",
        "Piscina", "Pista de baile", "Puesto de helados", "Recepción", "Sala VIP",
        "Sala de reuniones", "Sistema de sonido", "Toldo", "Terraza", "Zona de bar",
        "Zona de cócteles", "Zona de firma de libro de invitados", "Zona de fotos", "Zona de juegos interactivos", "Zona infantil",
        "Zona lounge", "Zona maquillaje", "Zona para parrilla"
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
