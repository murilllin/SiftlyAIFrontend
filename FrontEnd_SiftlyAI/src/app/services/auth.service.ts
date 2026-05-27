import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuario: Usuario | null = null;
  private _token: string | null = null;
  private readonly API = 'https://gpcueb.org/siftlyai';

  constructor(private http: HttpClient, private router: Router) {
    this.cargarSesion();
  }

  get usuario(): Usuario | null { return this._usuario; }

  get token(): string | null    { return this._token; }

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

  get isAdmin(): boolean {
    return (this._usuario?.rol ?? '') === 'ADMIN';
  }

  loginConGoogle(): void {
    window.location.href = `${this.API}/oauth2/authorization/google`;
  }

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

  login(email: string, pass: string): Observable<any> {
    return this.http.post<any>(`${this.API}/auth/login`, { email, password: pass }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  registro(nombre: string, apellido: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/auth/registro`, { nombre, apellido, email, password });
  }

  verificarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post<any>(`${this.API}/auth/verificar-codigo`, { email, codigo }).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  reenviarCodigo(email: string): Observable<any> {
    return this.http.post(`${this.API}/auth/reenviar-codigo`, { email });
  }

  private guardarSesion(res: any): void {
    this._token   = res.token;
    this._usuario = res.usuario ?? null;
    this.persistir();
  }

  private persistir(): void {
    localStorage.setItem('auth', JSON.stringify({
      token:   this._token,
      usuario: this._usuario
    }));
  }

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
