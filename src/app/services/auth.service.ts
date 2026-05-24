import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Datos del usuario autenticado almacenados en memoria y en localStorage.
 */
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  /** Rol del usuario: 'ADMIN' o 'USUARIO'. */
  rol: string;
}

/**
 * Servicio central de autenticación.
 *
 * Gestiona el ciclo completo de sesión: registro, login por credenciales,
 * login por Google OAuth2, verificación de código por email y logout.
 * El token JWT y los datos del usuario se persisten en localStorage bajo la clave `'auth'`.
 *
 * @example
 * // Verificar si hay sesión activa
 * if (this.auth.isLoggedIn) { ... }
 *
 * // Iniciar sesión con email y contraseña
 * this.auth.login(email, pass).subscribe(() => this.router.navigate(['/chat']));
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuario: Usuario | null = null;
  private _token: string | null = null;
  private readonly API = 'https://gpcueb.org/siftlyai/api';

  constructor(private http: HttpClient, private router: Router) {
    this.cargarSesion();
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  /** Usuario actualmente autenticado, o `null` si no hay sesión. */
  get usuario(): Usuario | null { return this._usuario; }

  /** JWT de la sesión activa, o `null` si no hay sesión. */
  get token(): string | null    { return this._token; }

  /**
   * Indica si el usuario tiene una sesión válida.
   * Lee siempre desde localStorage para evitar fallos de timing entre
   * el guardado y la evaluación del guard de rutas.
   */
  get isLoggedIn(): boolean {
    if (this._token) return true;
    try {
      const stored = localStorage.getItem('auth');
      if (!stored) return false;
      const data = JSON.parse(stored);
      if (data?.token) {
        this._token   = data.token;
        this._usuario = data.usuario;
        return true;
      }
    } catch { }
    return false;
  }

  /** `true` si el usuario tiene el rol 'ADMIN'. */
  get isAdmin(): boolean {
    return (this._usuario?.rol ?? '') === 'ADMIN';
  }

  // ─── Flujo Google OAuth2 ─────────────────────────────────────────────────────

  /**
   * Redirige al usuario al endpoint de autorización de Google OAuth2 en el backend.
   * El backend completará el flujo y redirigirá a `/oauth2/callback` con el token.
   */
  loginConGoogle(): void {
    window.location.href = `${this.API}/oauth2/authorization/google`;
  }

  /**
   * Procesa los parámetros recibidos en la URL de callback de OAuth2.
   * Extrae el token y los datos del usuario y los persiste en memoria y localStorage.
   *
   * @param params - Query params del callback (token, refreshToken, nombre, apellido, email, rol, id).
   */
  procesarCallbackOAuth2(params: any): void {
    this._token = params['token'];
    this._usuario = {
      id:       +params['id'],
      email:    params['email']   ?? '',
      nombre:   decodeURIComponent(params['nombre']   ?? ''),
      apellido: decodeURIComponent(params['apellido'] ?? ''),
      rol:      params['rol']     ?? 'USUARIO'
    };
    this.persistir();
  }

  // ─── Autenticación local ─────────────────────────────────────────────────────

  /**
   * Autentica al usuario con email y contraseña.
   * Si la autenticación es exitosa, guarda la sesión automáticamente via `tap`.
   *
   * @param email - Correo electrónico del usuario.
   * @param pass  - Contraseña en texto plano.
   * @returns Observable con la respuesta del backend (incluye token y datos del usuario).
   */
  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.API}/auth/login`, { email, password: pass }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * Tras el registro exitoso, el backend envía un código de verificación al email.
   *
   * @param nombre   - Primer nombre del usuario.
   * @param apellido - Apellido del usuario.
   * @param email    - Correo electrónico.
   * @param password - Contraseña elegida.
   * @returns Observable con la respuesta del backend.
   */
  registro(nombre: string, apellido: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/auth/registro`, { nombre, apellido, email, password });
  }

  /**
   * Verifica el código de 6 dígitos enviado al email del usuario tras el registro.
   * Si es correcto, activa la cuenta y guarda la sesión automáticamente.
   *
   * @param email  - Email del usuario que se está verificando.
   * @param codigo - Código de 6 dígitos recibido por email.
   * @returns Observable con la respuesta del backend (incluye token si el código es válido).
   */
  verificarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post<any>(`${this.API}/auth/verificar-codigo`, { email, codigo }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  /**
   * Solicita el reenvío del código de verificación al email indicado.
   *
   * @param email - Email del usuario que solicita el reenvío.
   * @returns Observable con la respuesta del backend.
   */
  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.API}/auth/reenviar-codigo`, { email });
  }

  // ─── Gestión interna de sesión ───────────────────────────────────────────────

  /**
   * Extrae el token y los datos del usuario de la respuesta del backend y los persiste.
   *
   * @param res - Respuesta del backend tras login o verificación de código.
   */
  private guardarSesion(res: any): void {
    this._token   = res.token;
    this._usuario = res.usuario ?? null;
    this.persistir();
  }

  /**
   * Serializa el estado de sesión actual en localStorage bajo la clave `'auth'`.
   */
  private persistir(): void {
    localStorage.setItem('auth', JSON.stringify({
      token:   this._token,
      usuario: this._usuario
    }));
  }

  /**
   * Recupera la sesión almacenada en localStorage al inicializar el servicio.
   * Si los datos están corruptos, limpia localStorage para evitar errores futuros.
   */
  private cargarSesion(): void {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const data    = JSON.parse(stored);
        this._token   = data.token   ?? null;
        this._usuario = data.usuario ?? null;
      }
    } catch {
      localStorage.removeItem('auth');
    }
  }

  /**
   * Cierra la sesión del usuario.
   * Notifica al backend (fire-and-forget para registrar el logout en auditoría)
   * y limpia el estado local independientemente del resultado de la llamada.
   * Redirige al usuario a `/login`.
   */
  logout(): void {
    if (this._token) {
      this.http.post(`${this.API}/auth/logout`, {}).subscribe({
        error: () => { /* silencioso */ }
      });
    }
    localStorage.removeItem('auth');
    this._token   = null;
    this._usuario = null;
    this.router.navigate(['/login']);
  }
}
