import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensaje } from '../models/mensaje.model';

const API = 'https://gpcueb.org/siftlyai';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  constructor(private http: HttpClient) {}

  enviarMensaje(
    conversacionId: number,
    contenido: string,
    tipoContenido: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO_TTS' = 'TEXTO'
  ): Observable<Mensaje> {
    return this.http.post<Mensaje>(
      `${API}/conversaciones/${conversacionId}/mensajes`,
      { contenido, tipoContenido }
    );
  }

  seleccionarMejorRespuesta(mensajeId: number, respuestaIAId: number): Observable<Mensaje> {
    return this.http.post<Mensaje>(
      `${API}/conversaciones/mensajes/${mensajeId}/mejor-respuesta`,
      { respuestaIAId }
    );
  }

  eliminarMensaje(mensajeId: number): Observable<void> {
    return this.http.delete<void>(`${API}/conversaciones/mensajes/${mensajeId}`);
  }
}
