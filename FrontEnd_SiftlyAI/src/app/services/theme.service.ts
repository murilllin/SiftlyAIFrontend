import { Injectable } from '@angular/core';

/** Modos de tema disponibles en la aplicación. */
export type ThemeMode = 'light' | 'dark';

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

  get mode(): ThemeMode { return this._mode; }

  get isDark(): boolean { return this._mode === 'dark'; }

  get isLight(): boolean { return this._mode === 'light'; }

  toggle() {
    this._mode = this._mode === 'dark' ? 'light' : 'dark';
    this.apply();
    localStorage.setItem(this.STORAGE_KEY, this._mode);
  }

  setMode(mode: ThemeMode) {
    this._mode = mode;
    this.apply();
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

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
