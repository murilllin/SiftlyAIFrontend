import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn should be false when localStorage is empty', () => {
    expect(service.isLoggedIn).toBeFalse();
  });

  it('isLoggedIn should be true after procesarCallbackOAuth2', () => {
    service.procesarCallbackOAuth2({
      token: 'test-token',
      id: '1',
      email: 'user@example.com',
      nombre: 'Juan',
      apellido: 'Perez',
      rol: 'USUARIO',
    });
    expect(service.isLoggedIn).toBeTrue();
  });

  it('usuario should be set correctly after procesarCallbackOAuth2', () => {
    service.procesarCallbackOAuth2({
      token: 'abc',
      id: '42',
      email: 'a@b.com',
      nombre: 'Ana',
      apellido: 'Lopez',
      rol: 'ADMIN',
    });
    expect(service.usuario?.nombre).toBe('Ana');
    expect(service.usuario?.apellido).toBe('Lopez');
    expect(service.usuario?.email).toBe('a@b.com');
    expect(service.usuario?.id).toBe(42);
  });

  it('isAdmin should be true when rol is ADMIN', () => {
    service.procesarCallbackOAuth2({
      token: 'x',
      id: '1',
      email: 'admin@siftly.com',
      nombre: 'Admin',
      apellido: '',
      rol: 'ADMIN',
    });
    expect(service.isAdmin).toBeTrue();
  });

  it('isAdmin should be false when rol is USUARIO', () => {
    service.procesarCallbackOAuth2({
      token: 'x',
      id: '2',
      email: 'user@siftly.com',
      nombre: 'User',
      apellido: '',
      rol: 'USUARIO',
    });
    expect(service.isAdmin).toBeFalse();
  });

  it('token getter should return the stored token', () => {
    service.procesarCallbackOAuth2({
      token: 'my-jwt-token',
      id: '1',
      email: 'x@x.com',
      nombre: 'X',
      apellido: 'Y',
      rol: 'USUARIO',
    });
    expect(service.token).toBe('my-jwt-token');
  });

  it('procesarCallbackOAuth2 should persist to localStorage', () => {
    service.procesarCallbackOAuth2({
      token: 'persist-token',
      id: '5',
      email: 'p@p.com',
      nombre: 'Pedro',
      apellido: 'Gil',
      rol: 'USUARIO',
    });
    const stored = JSON.parse(localStorage.getItem('auth')!);
    expect(stored.token).toBe('persist-token');
    expect(stored.usuario.nombre).toBe('Pedro');
  });

  it('should restore session from localStorage on construction', () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({ token: 'restored-token', usuario: { id: 7, email: 'r@r.com', nombre: 'Rosa', apellido: 'M', rol: 'USUARIO' } })
    );
    // Re-create service so constructor runs with pre-filled localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.isLoggedIn).toBeTrue();
    expect(fresh.token).toBe('restored-token');
    expect(fresh.usuario?.nombre).toBe('Rosa');
  });

  it('cargarSesion should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('auth', 'NOT_JSON{{{{');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.isLoggedIn).toBeFalse();
    // corrupted entry should have been removed
    expect(localStorage.getItem('auth')).toBeNull();
  });

  it('isLoggedIn should read from localStorage even when in-memory token is null', () => {
    localStorage.setItem(
      'auth',
      JSON.stringify({ token: 'ls-only-token', usuario: { id: 3, email: 'ls@ls.com', nombre: 'LS', apellido: '', rol: 'USUARIO' } })
    );
    // Access a fresh service instance that starts with empty memory but filled LS
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.isLoggedIn).toBeTrue();
  });
});
