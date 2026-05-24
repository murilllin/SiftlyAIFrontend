import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

/**
 * Componente de registro de nuevos usuarios.
 *
 * Permite crear una cuenta con nombre, apellido, email y contraseña,
 * o registrarse directamente mediante Google OAuth2.
 *
 * Tras un registro exitoso, redirige a `/verificar?email=<email>` para
 * que el usuario ingrese el código de 6 dígitos recibido por correo.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  /** Primer nombre del usuario. */
  nombre = '';
  /** Apellido del usuario. */
  apellido = '';
  /** Correo electrónico. */
  email = '';
  /** Contraseña elegida. */
  password = '';
  /** Mensaje de error a mostrar bajo el formulario. */
  error = '';
  /** `true` mientras la petición de registro está en vuelo. */
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Inicia el flujo de registro/login con Google OAuth2.
   * Si el usuario no existe, el backend lo crea automáticamente.
   */
  registrarConGoogle(): void {
    this.auth.loginConGoogle();
  }

  /**
   * Valida los campos obligatorios (nombre, email, contraseña) y envía la solicitud de registro.
   * Si el registro es exitoso, redirige a la pantalla de verificación de código.
   * Si falla, muestra el mensaje de error del backend.
   */
  registrar(): void {
    if (!this.nombre || !this.email || !this.password) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.auth.registro(this.nombre, this.apellido, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/verificar'], { queryParams: { email: this.email } }),
      error: (e: HttpErrorResponse) => {
        this.error = (e.error as { error?: string })?.error || 'Error al registrar';
        this.cargando = false;
      }
    });
  }
}
