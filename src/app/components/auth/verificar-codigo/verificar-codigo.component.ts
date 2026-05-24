import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Componente de verificación de cuenta por código de email.
 *
 * Muestra un input para ingresar el código de 6 dígitos enviado al correo
 * del usuario tras el registro. El email se recibe como query param `?email=`.
 *
 * Al verificar exitosamente, activa la cuenta, guarda la sesión y redirige
 * a `/chat` después de 1.5 segundos. También permite reenviar el código.
 */
@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-brand">
        <div class="brand-logo">
          <img src="https://i.imgur.com/0jeqOIS.png" alt="SiftlyAI" style="width:42px;height:42px;border-radius:10px;object-fit:cover;box-shadow:0 0 20px rgba(0,82,255,0.25);">
          <span class="brand-name">Siftly<span class="brand-ai">AI</span></span>
        </div>
      </div>
      <div class="auth-card animate-fade-in">
        <div class="auth-header">
          <h2>Verifica tu cuenta</h2>
          <p class="auth-sub">
            Enviamos un código de 6 dígitos a<br>
            <strong>{{ email }}</strong>
          </p>
        </div>
        <div class="form-group">
          <label>Código de verificación</label>
          <input
            type="text"
            [(ngModel)]="codigo"
            placeholder="000000"
            maxlength="6"
            style="text-align:center;letter-spacing:12px;font-size:28px;font-weight:700;font-family:monospace"
            (keyup.enter)="verificar()"
            autocomplete="one-time-code"
            autofocus
          />
        </div>
        <div class="error-msg" *ngIf="error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {{ error }}
        </div>
        <div *ngIf="exito" style="background:rgba(0,82,255,.12);border:1px solid rgba(0,82,255,.35);color:var(--color-primary);border-radius:4px;padding:10px 14px;font-size:14px;margin-bottom:12px;">
          Cuenta verificada. Redirigiendo...
        </div>
        <button class="btn-primary" (click)="verificar()" [disabled]="cargando || codigo.length < 6">
          <span *ngIf="!cargando">Verificar cuenta</span>
          <span *ngIf="cargando" class="btn-loading">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </span>
        </button>
        <p class="auth-link" style="margin-top:16px">
          ¿No recibiste el código?
          <a (click)="reenviar()" style="cursor:pointer">Reenviar</a>
        </p>
        <p class="auth-link">
          <a routerLink="/login">Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  `
})
export class VerificarCodigoComponent implements OnInit {
  /** Email del usuario leído desde el query param `?email=`. */
  email    = '';
  /** Código de 6 dígitos ingresado por el usuario. */
  codigo   = '';
  /** Mensaje de error a mostrar (vacío si no hay error). */
  error    = '';
  /** `true` tras una verificación exitosa, muestra el mensaje de éxito. */
  exito    = false;
  /** `true` mientras la petición de verificación está en vuelo. */
  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /** Lee el email del query param al inicializar el componente. */
  ngOnInit(): void {
    this.route.queryParams.subscribe(p => { this.email = p['email'] || ''; });
  }

  /**
   * Verifica el código de 6 dígitos ingresado.
   * Si es correcto, muestra un mensaje de éxito y redirige a `/chat` tras 1.5 segundos.
   * Si es incorrecto, muestra el error devuelto por el backend.
   */
  verificar(): void {
    if (this.codigo.length !== 6) { this.error = 'El código debe tener 6 dígitos'; return; }
    this.cargando = true;
    this.error    = '';
    this.auth.verificarCodigo(this.email, this.codigo).subscribe({
      next: () => { this.exito = true; setTimeout(() => this.router.navigate(['/chat']), 1500); },
      error: (err: HttpErrorResponse) => { this.cargando = false; this.error = (err.error as { error?: string })?.error || 'Código incorrecto.'; }
    });
  }

  /**
   * Solicita el reenvío del código de verificación al email del usuario.
   * Muestra una alerta nativa de confirmación o el error si falla.
   */
  reenviar(): void {
    this.auth.reenviarCodigo(this.email).subscribe({
      next: () => { this.error = ''; alert('Código reenviado. Revisa tu correo.'); },
      error: (err: HttpErrorResponse) => { this.error = (err.error as { error?: string })?.error || 'Error al reenviar'; }
    });
  }
}
