import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mensaje } from '../../models/mensaje.model';

@Component({
  selector: 'app-mensaje',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="msg-contenido">{{ mensaje.contenido }}</div>`,
  styles: [`.msg-contenido { color: #fff; white-space: pre-wrap; }`]
})
export class MensajeComponent {
  @Input() mensaje!: Mensaje;
}
