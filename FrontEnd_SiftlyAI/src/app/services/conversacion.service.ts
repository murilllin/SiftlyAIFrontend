import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversacion } from '../models/conversacion.model';

const API = 'https://gpcueb.org/siftlyai';

@Injectable({ providedIn: 'root' })
export class ConversacionService {
  constructor(private http: HttpClient) {}

  obtenerConversaciones(usuarioId: number): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${API}/conversaciones/usuario/${usuarioId}`);
  }

  obtenerConversacion(id: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${API}/conversaciones/${id}`);
  }

  crearConversacion(titulo: string, usuarioId: number): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${API}/conversaciones`, { titulo, usuarioId });
  }

  eliminarConversacion(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/conversaciones/${id}`);
  }

  actualizarConversacion(id: number, titulo: string): Observable<Conversacion> {
    return this.http.put<Conversacion>(`${API}/conversaciones/${id}`, { titulo });
  }
}
