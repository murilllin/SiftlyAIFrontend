
export interface RespuestaIA {
  id: number;
  mensajeId: number;
  modeloIA: string;
  nombreModelo: string;
  respuesta: string;
  tiempoRespuestaMs: number;
  esMejorRespuesta: boolean;
  fechaCreacion: string;
  urlArchivo?: string;
}
