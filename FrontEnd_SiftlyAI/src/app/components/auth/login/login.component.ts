import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;

  mostrarVerificacion = false;
  codigo = '';
  codigoError = '';
  codigoCargando = false;
  codigoExito = false;

  constructor(private auth: AuthService, private router: Router) {}

  loginConGoogle(): void {
    this.auth.loginConGoogle();
  }

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
        this.cargando = false;
        const msg = (e.error as { error?: string })?.error || '';
        if (
          msg.toLowerCase().includes('verific') ||
          msg.toLowerCase().includes('activad') ||
          e.status === 403
        ) {
          this.mostrarVerificacion = true;
        } else {
          this.error = msg || 'Credenciales incorrectas';
        }
      }
    });
  }

  verificar(): void {
    if (this.codigo.length !== 6) {
      this.codigoError = 'El código debe tener 6 dígitos';
      return;
    }
    this.codigoCargando = true;
    this.codigoError = '';
    this.auth.verificarCodigo(this.email, this.codigo).subscribe({
      next: () => {
        this.codigoExito = true;
        setTimeout(() => this.router.navigate(['/chat']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.codigoCargando = false;
        this.codigoError = (err.error as { error?: string })?.error || 'Código incorrecto.';
      }
    });
  }

  reenviarCodigo(): void {
    this.auth.reenviarCodigo(this.email).subscribe({
      next: () => { this.codigoError = ''; alert('Código reenviado. Revisa tu correo.'); },
      error: (err: HttpErrorResponse) => { this.codigoError = (err.error as { error?: string })?.error || 'Error al reenviar'; }
    });
  }

  volverAlLogin(): void {
    this.mostrarVerificacion = false;
    this.codigo = '';
    this.codigoError = '';
    this.codigoExito = false;
    this.error = '';
  }
}
