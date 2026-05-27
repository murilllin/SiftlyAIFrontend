import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RespuestaIA } from '../../models/respuesta-ia.model';

@Component({
  selector: 'app-respuesta-ia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resp">
      <span class="modelo">{{ respuesta.nombreModelo || respuesta.modeloIA }}</span>
      <p>{{ respuesta.respuesta }}</p>
    </div>
  `,
  styles: [`.resp { padding: 8px; } .modelo { font-weight: bold; color: #6c63ff; }`]
})
export class RespuestaIaComponent {
  @Input() respuesta!: RespuestaIA;
  @Output() seleccionarMejor = new EventEmitter<number>();
}
