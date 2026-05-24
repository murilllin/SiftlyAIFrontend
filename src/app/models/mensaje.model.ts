import { RespuestaIA } from './respuesta-ia.model';

/**
 * Representa un mensaje dentro de una conversación.
 * Puede ser enviado por el usuario o generado por el sistema.
 */
export interface Mensaje {
  /** Identificador único del mensaje. */
  id: number;
  /** ID de la conversación a la que pertenece. */
  conversacionId: number;
  /** Origen del mensaje: 'USUARIO' para mensajes del usuario, 'SISTEMA' para respuestas de IA. */
  tipo: 'USUARIO' | 'SISTEMA';
  /** Contenido textual del mensaje o prompt. */
  contenido: string;
  /** Tipo de contenido solicitado o generado. */
  tipoContenido: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO_TTS';
  /** Fecha de creación en formato ISO 8601. */
  fechaCreacion: string;
  /** Lista de respuestas generadas por los distintos modelos de IA. */
  respuestasIA: RespuestaIA[];
  /** ID de la respuesta seleccionada como la mejor por el usuario (opcional). */
  mejorRespuestaId?: number;
}
