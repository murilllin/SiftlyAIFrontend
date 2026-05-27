import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeToggleComponent],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  email = '';
  password = '';
  error = '';
  cargando = false;

  private dominiosTemporales = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwawaymail.com',
    'sharklasers.com', 'guerrillamail.net', 'guerrillamail.org',
    'mailnator.com', '33mail.com', 'temp-mail.org',
    'fakeinbox.com', 'getairmail.com', 'mintemail.com',
    'mytrashmail.com', 'spambog.com', 'trashmail.com',
    'fake-email.com', 'dispostable.com', 'jetable.com', 'tempmail.net'
  ];

  constructor(private auth: AuthService, private router: Router) {}

  private esEmailValido(email: string): boolean {
    // Expresión regular mejorada para validar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return false;
    }

    const [localPart, domain] = email.split('@');
    
    if (localPart.length < 2) {
      return false;
    }
    
    if (domain.split('.').some(part => part.length < 2)) {
      return false;
    }
    
    const domainLower = domain.toLowerCase();
    if (this.dominiosTemporales.some(tempDomain => domainLower === tempDomain)) {
      return false;
    }
    
    return true;
  }

  private esContrasenaSegura(password: string): { valida: boolean; mensaje: string } {
    if (password.length < 8) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos 8 caracteres' };
    }
    
    if (password.length > 128) {
      return { valida: false, mensaje: 'La contraseña no puede tener más de 128 caracteres' };
    }
    
    const contrasenasDebiles = [
      '123456', '12345678', '123456789', '12345', '1234', '123',
      'password', 'contraseña', 'admin', 'qwerty', 'abc123',
      '111111', '000000', '123123', '123321', '11111111',
      'password123', 'admin123', 'qwerty123', '1234567890',
      'asdfghjkl', 'qwertyuiop', 'zxcvbnm', '987654321'
    ];
    
    if (contrasenasDebiles.includes(password.toLowerCase())) {
      return { valida: false, mensaje: 'Esta contraseña es demasiado débil, elige una más segura' };
    }
    
    let tieneMayuscula = /[A-Z]/.test(password);
    let tieneMinuscula = /[a-z]/.test(password);
    let tieneNumero = /[0-9]/.test(password);
    let tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!tieneMayuscula) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos una letra mayúscula' };
    }
    
    if (!tieneMinuscula) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos una letra minúscula' };
    }
    
    if (!tieneNumero) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos un número' };
    }
    
    if (!tieneEspecial) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)' };
    }
    
    return { valida: true, mensaje: '' };
  }

  private esNombreValido(nombre: string): { valida: boolean; mensaje: string } {
    const trimmed = nombre.trim();
    
    if (!trimmed) {
      return { valida: false, mensaje: 'El nombre es obligatorio' };
    }
    
    if (trimmed.length < 2) {
      return { valida: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (trimmed.length > 50) {
      return { valida: false, mensaje: 'El nombre no puede tener más de 50 caracteres' };
    }
    
    const nombreRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/;
    if (!nombreRegex.test(trimmed)) {
      return { valida: false, mensaje: 'El nombre solo puede contener letras y espacios' };
    }
    
    return { valida: true, mensaje: '' };
  }

  registrarConGoogle(): void {
    this.auth.loginConGoogle();
  }

  registrar(): void {
    this.error = '';
    
    const nombreValido = this.esNombreValido(this.nombre);
    if (!nombreValido.valida) {
      this.error = nombreValido.mensaje;
      this.cargando = false;
      return;
    }

    if (!this.email) {
      this.error = 'El correo electrónico es obligatorio';
      return;
    }
    
    if (!this.esEmailValido(this.email)) {
      this.error = 'Por favor ingresa un correo electrónico válido (no se permiten emails temporales o falsos como a@a.a)';
      return;
    }

    if (!this.password) {
      this.error = 'La contraseña es obligatoria';
      return;
    }
    
    const contrasenaValida = this.esContrasenaSegura(this.password);
    if (!contrasenaValida.valida) {
      this.error = contrasenaValida.mensaje;
      return;
    }

    this.cargando = true;
    this.error = '';

    const nombreLimpio = this.nombre.trim();
    const apellidoLimpio = this.apellido.trim();
    
    this.auth.registro(nombreLimpio, apellidoLimpio, this.email.toLowerCase(), this.password).subscribe({
      next: () => {
        this.router.navigate(['/verificar'], { queryParams: { email: this.email.toLowerCase() } });
      },
      error: (e: HttpErrorResponse) => {
        const errorBody = e.error as { error?: string, message?: string };
        const errorMsg = errorBody?.error || errorBody?.message || 'Error al registrar. Por favor intenta de nuevo.';
        
        if (errorMsg.includes('duplicate key') || errorMsg.includes('already exists') || errorMsg.includes('ya está registrado')) {
          this.error = 'Este correo electrónico ya está registrado. Por favor inicia sesión o usa otro email.';
        } else if (errorMsg.toLowerCase().includes('password') || errorMsg.toLowerCase().includes('contraseña')) {
          this.error = 'La contraseña no cumple con los requisitos de seguridad.';
        } else {
          this.error = errorMsg;
        }
        this.cargando = false;
      }
    });
  }
}
