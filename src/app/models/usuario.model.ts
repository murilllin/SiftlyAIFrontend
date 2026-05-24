/**
 * Re-exporta la interfaz Usuario desde AuthService para mantener
 * compatibilidad con imports que usen el módulo de modelos.
 *
 * @see AuthService
 */
export type { Usuario } from '../services/auth.service';
