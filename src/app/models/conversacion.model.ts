import { Mensaje } from './mensaje.model';

/**
 * Representa una conversación entre un usuario y los modelos de IA.
 */
export interface Conversacion {
  /** Identificador único de la conversación. */
  id: number;
  /** Título descriptivo de la conversación. */
  titulo: string;
  /** ID del usuario propietario (opcional, puede omitirse en respuestas parciales). */
  usuarioId?: number;
  /** Nombre del usuario propietario (opcional). */
  usuarioNombre?: string;
  /** Fecha de creación en formato ISO 8601. */
  fechaCreacion: string;
  /** Fecha del último mensaje o actividad en formato ISO 8601. */
  fechaUltimaActividad: string;
  /** Indica si la conversación está activa (no eliminada). */
  activa: boolean;
  /** Lista de mensajes de la conversación (se incluye al pedir detalle). */
  mensajes?: Mensaje[];
}
