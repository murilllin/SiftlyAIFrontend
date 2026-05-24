import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversacion } from '../models/conversacion.model';

const API = 'https://gpcueb.org/siftlyai/api';

/**
 * Servicio para la gestión de conversaciones.
 *
 * Expone operaciones CRUD contra el endpoint `/conversaciones` del backend.
 * Todas las peticiones incluyen automáticamente el JWT gracias a {@link AuthInterceptor}.
 */
@Injectable({ providedIn: 'root' })
export class ConversacionService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las conversaciones activas de un usuario.
   *
   * @param usuarioId - ID del usuario propietario.
   * @returns Observable con el listado de conversaciones ordenadas por actividad reciente.
   */
  obtenerConversaciones(usuarioId: number): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${API}/conversaciones/usuario/${usuarioId}`);
  }

  /**
   * Obtiene el detalle de una conversación, incluyendo todos sus mensajes y respuestas de IA.
   *
   * @param id - ID de la conversación.
   * @returns Observable con la conversación completa.
   */
  obtenerConversacion(id: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${API}/conversaciones/${id}`);
  }

  /**
   * Crea una nueva conversación para el usuario indicado.
   *
   * @param titulo     - Título inicial de la conversación.
   * @param usuarioId  - ID del usuario propietario.
   * @returns Observable con la conversación recién creada.
   */
  crearConversacion(titulo: string, usuarioId: number): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${API}/conversaciones`, { titulo, usuarioId });
  }

  /**
   * Elimina (soft-delete) una conversación por su ID.
   *
   * @param id - ID de la conversación a eliminar.
   * @returns Observable vacío al completarse.
   */
  eliminarConversacion(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/conversaciones/${id}`);
  }

  /**
   * Actualiza el título de una conversación existente.
   *
   * @param id     - ID de la conversación a actualizar.
   * @param titulo - Nuevo título.
   * @returns Observable con la conversación actualizada.
   */
  actualizarConversacion(id: number, titulo: string): Observable<Conversacion> {
    return this.http.put<Conversacion>(`${API}/conversaciones/${id}`, { titulo });
  }
}
