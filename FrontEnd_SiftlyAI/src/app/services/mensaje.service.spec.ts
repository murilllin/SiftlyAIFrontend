import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MensajeService } from './mensaje.service';
import { Mensaje } from '../models/mensaje.model';

const API = 'http://localhost:8080/api';

describe('MensajeService', () => {
  let service: MensajeService;
  let http: HttpTestingController;

  const mockMensaje: Mensaje = {
    id: 10,
    conversacionId: 1,
    tipo: 'USUARIO',
    contenido: 'Hola',
    tipoContenido: 'TEXTO',
    fechaCreacion: '2024-01-01T00:00:00',
    respuestasIA: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MensajeService],
    });
    service = TestBed.inject(MensajeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('enviarMensaje should POST to /conversaciones/:id/mensajes with TEXTO by default', () => {
    service.enviarMensaje(1, 'Hola').subscribe(res => {
      expect(res.contenido).toBe('Hola');
      expect(res.tipoContenido).toBe('TEXTO');
    });
    const req = http.expectOne(`${API}/conversaciones/1/mensajes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ contenido: 'Hola', tipoContenido: 'TEXTO' });
    req.flush(mockMensaje);
  });

  it('enviarMensaje should POST with IMAGEN tipoContenido when specified', () => {
    service.enviarMensaje(1, 'data:image/png;base64,...', 'IMAGEN').subscribe();
    const req = http.expectOne(`${API}/conversaciones/1/mensajes`);
    expect(req.request.body.tipoContenido).toBe('IMAGEN');
    req.flush({ ...mockMensaje, tipoContenido: 'IMAGEN' });
  });

  it('enviarMensaje should POST with VIDEO tipoContenido when specified', () => {
    service.enviarMensaje(2, 'video-url', 'VIDEO').subscribe();
    const req = http.expectOne(`${API}/conversaciones/2/mensajes`);
    expect(req.request.body.tipoContenido).toBe('VIDEO');
    req.flush({ ...mockMensaje, tipoContenido: 'VIDEO' });
  });

  it('seleccionarMejorRespuesta should POST to correct endpoint with respuestaIAId', () => {
    service.seleccionarMejorRespuesta(10, 99).subscribe(res => {
      expect(res.mejorRespuestaId).toBe(99);
    });
    const req = http.expectOne(`${API}/conversaciones/mensajes/10/mejor-respuesta`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ respuestaIAId: 99 });
    req.flush({ ...mockMensaje, mejorRespuestaId: 99 });
  });

  it('eliminarMensaje should DELETE /conversaciones/mensajes/:id', () => {
    service.eliminarMensaje(10).subscribe();
    const req = http.expectOne(`${API}/conversaciones/mensajes/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('enviarMensaje should use the conversacionId in the URL correctly', () => {
    service.enviarMensaje(55, 'Prueba').subscribe();
    const req = http.expectOne(`${API}/conversaciones/55/mensajes`);
    expect(req.request.url).toContain('/55/mensajes');
    req.flush(mockMensaje);
  });
});
