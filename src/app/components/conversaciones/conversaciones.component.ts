import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConversacionService } from '../../services/conversacion.service';
import { Conversacion } from '../../models/conversacion.model';
import { LoadingComponent } from '../shared/loading/loading.component';

@Component({
  selector: 'app-conversaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './conversaciones.component.html',
  styleUrls: ['./conversaciones.component.css']
})
export class ConversacionesComponent implements OnInit {
  conversaciones: Conversacion[] = [];
  cargando = true;
  nuevoTitulo = '';
  creando = false;
  error = '';

  constructor(
    private convService: ConversacionService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const uid = this.auth.usuario!.id;
    this.cargando = true;
    this.convService.obtenerConversaciones(uid).subscribe({
      next: (convs) => { this.conversaciones = convs; this.cargando = false; },
      error: () => { this.error = 'Error al cargar conversaciones'; this.cargando = false; }
    });
  }

  crear() {
    const titulo = this.nuevoTitulo.trim() || 'Nueva conversación';
    this.creando = true;
    this.convService.crearConversacion(titulo, this.auth.usuario!.id).subscribe({
      next: () => {
        this.nuevoTitulo = '';
        this.creando = false;
        this.cargar();
      },
      error: () => { this.creando = false; }
    });
  }

  abrir(id: number) {
    this.router.navigate(['/conversaciones', id]);
  }

  eliminar(e: Event, id: number) {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta conversación?')) return;
    this.convService.eliminarConversacion(id).subscribe(() => this.cargar());
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
