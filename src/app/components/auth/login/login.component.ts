import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

/**
 * Componente de inicio de sesión.
 *
 * Ofrece dos métodos de autenticación:
 * - **Credenciales locales**: email + contraseña contra el endpoint `/auth/login`.
 * - **Google OAuth2**: redirige al flujo de Google a través del backend.
 *
 * Tras un login exitoso navega a `/chat`. En caso de error muestra el mensaje
 * devuelto por el backend o un texto genérico.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  /** Email ingresado en el formulario. */
  email = '';
  /** Contraseña ingresada en el formulario. */
  password = '';
  /** Mensaje de error a mostrar bajo el formulario (vacío si no hay error). */
  error = '';
  /** `true` mientras la petición de login está en vuelo. */
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Inicia el flujo de autenticación con Google OAuth2.
   * Redirige al usuario al endpoint del backend que gestiona la autorización de Google.
   */
  loginConGoogle(): void {
    this.auth.loginConGoogle();
  }

  /**
   * Valida los campos del formulario y realiza el login con credenciales locales.
   * Si la autenticación es exitosa, navega a `/chat`.
   * Si falla, muestra el error recibido del backend.
   */
  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/chat']),
      error: (e: HttpErrorResponse) => {
        this.error = (e.error as { error?: string })?.error || 'Credenciales incorrectas';
        this.cargando = false;
      }
    });
  }
}
