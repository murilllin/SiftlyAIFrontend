import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP que adjunta automáticamente el token JWT a todas las
 * peticiones salientes al backend.
 *
 * Si hay un token activo en {@link AuthService}, añade el header
 * `Authorization: Bearer <token>` clonando la petición original.
 * Si no hay token (usuario no autenticado), la petición se deja pasar sin modificar.
 *
 * Está registrado como proveedor global en `main.ts`:
 * ```ts
 * { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
 * ```
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  /**
   * Intercepta la petición HTTP saliente y agrega el header de autorización si hay sesión activa.
   *
   * @param req  - Petición HTTP original (inmutable).
   * @param next - Manejador que pasa la petición al siguiente interceptor o al backend.
   * @returns Observable con la respuesta HTTP.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.token;
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
