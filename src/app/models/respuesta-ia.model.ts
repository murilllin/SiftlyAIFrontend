/**
 * Representa la respuesta generada por un modelo de IA a un mensaje del usuario.
 */
export interface RespuestaIA {
  /** Identificador único de la respuesta. */
  id: number;
  /** ID del mensaje al que pertenece esta respuesta. */
  mensajeId: number;
  /** Clave interna del modelo (ej: 'GROQ_LLAMA3_3_70B', 'GEMINI_2_5_FLASH'). */
  modeloIA: string;
  /** Nombre legible del modelo para mostrar en la UI. */
  nombreModelo: string;
  /** Texto de la respuesta generada (vacío para respuestas de audio/imagen/video). */
  respuesta: string;
  /** Tiempo que tardó el modelo en responder, en milisegundos. */
  tiempoRespuestaMs: number;
  /** Indica si esta respuesta fue seleccionada como la mejor por el juez de IA o el usuario. */
  esMejorRespuesta: boolean;
  /** Fecha de creación en formato ISO 8601. */
  fechaCreacion: string;
  /** URL del archivo generado para respuestas de imagen, video o audio (opcional). */
  urlArchivo?: string;
}
