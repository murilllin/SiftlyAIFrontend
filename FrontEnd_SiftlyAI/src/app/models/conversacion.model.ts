import { Mensaje } from './mensaje.model';

export interface Conversacion {
  id: number;
  titulo: string;
  usuarioId?: number;
  usuarioNombre?: string;
  fechaCreacion: string;
  fechaUltimaActividad: string;
  activa: boolean;
  mensajes?: Mensaje[];
}
