import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensaje } from '../models/mensaje.model';

const API = 'https://gpcueb.org/siftlyai/api';

/**
 * Servicio para el envío y gestión de mensajes dentro de una conversación.
 *
 * Cada mensaje enviado desencadena en el backend llamadas paralelas a todos
 * los modelos de IA configurados. Las respuestas se recuperan mediante polling
 * desde los componentes que consumen este servicio.
 */
@Injectable({ providedIn: 'root' })
export class MensajeService {
  constructor(private http: HttpClient) {}

  /**
   * Envía un nuevo mensaje a una conversación.
   * El backend procesa el mensaje de forma asíncrona y retorna el {@link Mensaje}
   * creado inmediatamente; las respuestas de IA se van poblando con polling.
   *
   * @param conversacionId - ID de la conversación destino.
   * @param contenido      - Texto del mensaje o prompt para generación de medios.
   * @param tipoContenido  - Tipo de respuesta esperada: 'TEXTO' (default), 'IMAGEN', 'VIDEO' o 'AUDIO_TTS'.
   * @returns Observable con el mensaje guardado en el backend.
   */
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

  /**
   * Marca una respuesta de IA como la mejor para un mensaje dado.
   * Puede ser invocado manualmente por el usuario o automáticamente por el juez de IA.
   *
   * @param mensajeId    - ID del mensaje al que pertenece la respuesta.
   * @param respuestaIAId - ID de la respuesta de IA que se desea marcar como mejor.
   * @returns Observable con el mensaje actualizado.
   */
  seleccionarMejorRespuesta(mensajeId: number, respuestaIAId: number): Observable<Mensaje> {
    return this.http.post<Mensaje>(
      `${API}/conversaciones/mensajes/${mensajeId}/mejor-respuesta`,
      { respuestaIAId }
    );
  }

  /**
   * Elimina un mensaje y todas sus respuestas de IA asociadas.
   *
   * @param mensajeId - ID del mensaje a eliminar.
   * @returns Observable vacío al completarse.
   */
  eliminarMensaje(mensajeId: number): Observable<void> {
    return this.http.delete<void>(`${API}/conversaciones/mensajes/${mensajeId}`);
  }
}
