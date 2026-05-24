import { Injectable } from '@angular/core';

/** Modos de tema disponibles en la aplicación. */
export type ThemeMode = 'light' | 'dark';

/**
 * Servicio de gestión de tema visual (claro / oscuro).
 *
 * Al inicializarse, lee el tema guardado en localStorage. Si no hay preferencia
 * guardada, aplica el tema oscuro por defecto (Stitch design system).
 * El tema se aplica añadiendo el atributo `data-theme` y las clases CSS
 * correspondientes al elemento `<html>`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'siftly-theme';
  private _mode: ThemeMode = 'dark';

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      this._mode = saved;
    } else {
      this._mode = 'dark';
    }
    this.apply();
  }

  /** Tema activo actual. */
  get mode(): ThemeMode { return this._mode; }

  /** `true` si el tema activo es oscuro. */
  get isDark(): boolean { return this._mode === 'dark'; }

  /** `true` si el tema activo es claro. */
  get isLight(): boolean { return this._mode === 'light'; }

  /**
   * Alterna entre tema oscuro y claro, aplica el cambio al DOM
   * y persiste la preferencia en localStorage.
   */
  toggle() {
    this._mode = this._mode === 'dark' ? 'light' : 'dark';
    this.apply();
    localStorage.setItem(this.STORAGE_KEY, this._mode);
  }

  /**
   * Establece un tema específico, lo aplica al DOM y lo persiste en localStorage.
   *
   * @param mode - Tema a activar: 'light' o 'dark'.
   */
  setMode(mode: ThemeMode) {
    this._mode = mode;
    this.apply();
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  /**
   * Aplica el tema actual al elemento `<html>` mediante el atributo `data-theme`
   * y las clases CSS 'dark' / 'light'. Esto permite que los estilos CSS reaccionen
   * usando selectores como `[data-theme="dark"]` o la clase `.dark`.
   */
  private apply() {
    document.documentElement.setAttribute('data-theme', this._mode);
    if (this._mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }
}
