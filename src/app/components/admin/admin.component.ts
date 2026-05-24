import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { forkJoin, timeout, catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface UsuarioAdmin {
  id: number; email: string; nombre: string; apellido: string; rol: string; activo: boolean;
}
interface Stats {
  totalUsuarios: number; usuariosActivos: number; totalConversaciones: number; totalMensajes: number;
}
interface Conversacion {
  id: number; titulo: string; fechaCreacion: string; fechaUltimaActividad: string; activa: boolean;
}
interface RespuestaIA {
  id: number; modeloIA: string; respuesta: string; tiempoRespuestaMs: number;
  esMejorRespuesta: boolean; urlArchivo: string | null;
}
interface Mensaje {
  id: number; tipo: string; contenido: string; tipoContenido: string;
  fechaCreacion: string; respuestasIA: RespuestaIA[];
}
interface ConversacionDetalle {
  id: number; titulo: string; mensajes: Mensaje[];
}
interface AuditoriaLog {
  id: number; usuarioEmail: string; usuarioNombre: string;
  accion: string; detalle: string; ipAddress: string; fecha: string; exitoso: boolean;
}
interface AuditoriaPage {
  contenido: AuditoriaLog[]; paginaActual: number; totalPaginas: number; totalElementos: number;
}

const API = 'https://gpcueb.org/siftlyai/api';

type Vista = 'usuarios' | 'conversaciones' | 'detalle' | 'auditoria';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  usuarios: UsuarioAdmin[] = [];
  stats: Stats = { totalUsuarios: 0, usuariosActivos: 0, totalConversaciones: 0, totalMensajes: 0 };
  cargando    = true;
  advertencia = '';

  vista: Vista = 'usuarios';

  usuarioSeleccionado: UsuarioAdmin | null = null;
  conversaciones: Conversacion[] = [];
  cargandoConvs = false;

  convSeleccionada: Conversacion | null = null;
  detalle: ConversacionDetalle | null = null;
  cargandoDetalle = false;
  mensajeExpandidoId: number | null = null;

  // ── auditoría ─────────────────────────────────────────────────
  auditoriaLogs: AuditoriaLog[] = [];
  auditoriaPagina       = 0;
  auditoriaTotalPaginas = 0;
  auditoriaTotalItems   = 0;
  cargandoAuditoria     = false;
  filtroAccion          = '';
  accionesDisponibles   = [
    'LOGIN','LOGOUT','REGISTRO','VERIFICACION_CODIGO','OAUTH2_LOGIN',
    'CREAR_CONVERSACION','ELIMINAR_CONVERSACION','ENVIAR_MENSAJE',
    'CAMBIAR_ROL','ACTIVAR_USUARIO','DESACTIVAR_USUARIO','ELIMINAR_USUARIO',
    'VER_CONVERSACION','VER_PANEL_ADMIN'
  ];

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin) { this.router.navigate(['/chat']); return; }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando    = true;
    this.advertencia = '';

    const stats$ = this.http.get<Stats>(`${API}/admin/stats`).pipe(
      timeout(10000),
      catchError(err => { console.error('Stats:', err); return of(this.stats); })
    );
    const usuarios$ = this.http.get<UsuarioAdmin[]>(`${API}/admin/usuarios`).pipe(
      timeout(10000),
      catchError(err => {
        const s = err?.status ?? err?.name;
        this.advertencia = s === 403
          ? 'Sin permisos. Vuelve a iniciar sesión.'
          : `Error cargando usuarios (${s ?? 'desconocido'}).`;
        return of([] as UsuarioAdmin[]);
      })
    );

    forkJoin({ stats: stats$, usuarios: usuarios$ }).subscribe({
      next: ({ stats, usuarios }) => {
        this.stats    = stats;
        this.usuarios = usuarios;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.advertencia = 'Error inesperado. Revisa la consola.';
        this.cargando    = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  irAuditoria(): void {
    this.vista = 'auditoria';
    this.auditoriaPagina = 0;
    this.cargarAuditoria();
  }

  cargarAuditoria(pagina = this.auditoriaPagina): void {
    this.cargandoAuditoria = true;
    this.cdr.detectChanges();

    // Corregido: "tamano" sin ñ para evitar líos de codificación
    let url = `${API}/admin/auditoria?pagina=${pagina}&tamano=50`;
    if (this.filtroAccion) url += `&accion=${encodeURIComponent(this.filtroAccion)}`;

    this.http.get<AuditoriaPage>(url).pipe(
      timeout(10000),
      catchError(err => {
        console.error('[Auditoría] Error:', err);
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.auditoriaLogs         = res.contenido ?? [];
        this.auditoriaPagina       = res.paginaActual ?? 0;
        this.auditoriaTotalPaginas = res.totalPaginas ?? 0;
        this.auditoriaTotalItems   = res.totalElementos ?? 0;
      }
      this.cargandoAuditoria = false;
      this.cdr.detectChanges();
    });
  }

  aplicarFiltroAuditoria(): void {
    this.auditoriaPagina = 0;
    this.cargarAuditoria(0);
  }

  verConversaciones(u: UsuarioAdmin): void {
    this.usuarioSeleccionado = u;
    this.conversaciones      = [];
    this.vista               = 'conversaciones';
    this.cargandoConvs       = true;
    this.cdr.detectChanges();

    this.http.get<Conversacion[]>(`${API}/conversaciones/usuario/${u.id}`)
      .pipe(timeout(10000), catchError(() => of([] as Conversacion[])))
      .subscribe(convs => {
        this.conversaciones = convs;
        this.cargandoConvs  = false;
        this.cdr.detectChanges();
      });
  }

  verDetalle(conv: Conversacion): void {
    this.convSeleccionada    = conv;
    this.detalle             = null;
    this.vista               = 'detalle';
    this.cargandoDetalle     = true;
    this.mensajeExpandidoId  = null;
    this.cdr.detectChanges();

    this.http.get<ConversacionDetalle>(`${API}/conversaciones/${conv.id}`)
      .pipe(timeout(10000), catchError(() => of(null)))
      .subscribe(d => {
        this.detalle         = d;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      });
  }

  toggleRespuestas(mensajeId: number): void {
    this.mensajeExpandidoId = this.mensajeExpandidoId === mensajeId ? null : mensajeId;
    this.cdr.detectChanges();
  }

  volverAUsuarios(): void {
    this.vista               = 'usuarios';
    this.usuarioSeleccionado = null;
    this.conversaciones      = [];
    this.cdr.detectChanges();
  }

  volverAConversaciones(): void {
    this.vista            = 'conversaciones';
    this.convSeleccionada = null;
    this.detalle          = null;
    this.cdr.detectChanges();
  }

  esMensajeUsuario(m: Mensaje): boolean { return m.tipo === 'USUARIO'; }

  getMejorRespuesta(m: Mensaje): RespuestaIA | null {
    return m.respuestasIA?.find(r => r.esMejorRespuesta) ?? m.respuestasIA?.[0] ?? null;
  }

  tieneVariasRespuestas(m: Mensaje): boolean {
    return (m.respuestasIA?.length ?? 0) > 1;
  }

  formatFecha(f: string): string {
    if (!f) return '';
    return new Date(f).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  }

  accionClass(accion: string): string {
    if (!accion) return '';
    if (['LOGIN','OAUTH2_LOGIN'].includes(accion)) return 'accion-login';
    if (accion === 'LOGOUT') return 'accion-logout';
    if (['ELIMINAR_USUARIO','ELIMINAR_CONVERSACION'].includes(accion)) return 'accion-danger';
    if (['ACTIVAR_USUARIO','CREAR_CONVERSACION','REGISTRO','VERIFICACION_CODIGO'].includes(accion)) return 'accion-success';
    if (['DESACTIVAR_USUARIO','CAMBIAR_ROL'].includes(accion)) return 'accion-warn';
    return 'accion-default';
  }

  toggleActivo(u: UsuarioAdmin): void {
    this.http.patch(`${API}/auth/usuarios/${u.id}/activar`, { activo: !u.activo })
      .subscribe({ next: () => { u.activo = !u.activo; this.cdr.detectChanges(); } });
  }

  cambiarRol(u: UsuarioAdmin, evento: Event): void {
    const rol = (evento.target as HTMLSelectElement).value;
    this.http.patch(`${API}/admin/usuarios/${u.id}/rol`, { rol })
      .subscribe({ next: () => { u.rol = rol; this.cdr.detectChanges(); } });
  }

  eliminar(u: UsuarioAdmin): void {
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) return;
    this.http.delete(`${API}/auth/usuarios/${u.id}`).subscribe({
      next: () => { this.usuarios = this.usuarios.filter(x => x.id !== u.id); this.cdr.detectChanges(); }
    });
  }

  logout(): void { this.auth.logout(); }
}
