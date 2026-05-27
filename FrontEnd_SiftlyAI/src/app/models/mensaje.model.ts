import { RespuestaIA } from './respuesta-ia.model';

export interface Mensaje {
  id: number;
  conversacionId: number;
  tipo: 'USUARIO' | 'SISTEMA';
  contenido: string;
  tipoContenido: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'AUDIO_TTS';
  fechaCreacion: string;
  respuestasIA: RespuestaIA[];
  mejorRespuestaId?: number;
}
