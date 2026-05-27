import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConversacionService } from './conversacion.service';
import { Conversacion } from '../models/conversacion.model';

const API = 'http://localhost:8080/api';

describe('ConversacionService', () => {
  let service: ConversacionService;
  let http: HttpTestingController;

  const mockConversacion: Conversacion = {
    id: 1,
    titulo: 'Test Chat',
    usuarioId: 42,
    fechaCreacion: '2024-01-01T00:00:00',
    fechaUltimaActividad: '2024-01-01T01:00:00',
    activa: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConversacionService],
    });
    service = TestBed.inject(ConversacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('obtenerConversaciones should GET /conversaciones/usuario/:id', () => {
    service.obtenerConversaciones(42).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].titulo).toBe('Test Chat');
    });
    const req = http.expectOne(`${API}/conversaciones/usuario/42`);
    expect(req.request.method).toBe('GET');
    req.flush([mockConversacion]);
  });

  it('obtenerConversacion should GET /conversaciones/:id', () => {
    service.obtenerConversacion(1).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.activa).toBeTrue();
    });
    const req = http.expectOne(`${API}/conversaciones/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockConversacion);
  });

  it('crearConversacion should POST with titulo and usuarioId', () => {
    service.crearConversacion('Nueva', 42).subscribe(res => {
      expect(res.titulo).toBe('Nueva');
    });
    const req = http.expectOne(`${API}/conversaciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ titulo: 'Nueva', usuarioId: 42 });
    req.flush({ ...mockConversacion, titulo: 'Nueva' });
  });

  it('eliminarConversacion should DELETE /conversaciones/:id', () => {
    service.eliminarConversacion(1).subscribe();
    const req = http.expectOne(`${API}/conversaciones/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('actualizarConversacion should PUT with new titulo', () => {
    service.actualizarConversacion(1, 'Editado').subscribe(res => {
      expect(res.titulo).toBe('Editado');
    });
    const req = http.expectOne(`${API}/conversaciones/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ titulo: 'Editado' });
    req.flush({ ...mockConversacion, titulo: 'Editado' });
  });

  it('obtenerConversaciones should return empty array when no conversations', () => {
    service.obtenerConversaciones(99).subscribe(res => {
      expect(res).toEqual([]);
    });
    const req = http.expectOne(`${API}/conversaciones/usuario/99`);
    req.flush([]);
  });
});
