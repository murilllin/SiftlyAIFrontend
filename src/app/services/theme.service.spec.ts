import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    // Reset data-theme attribute before each test
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark', 'light');

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to dark mode when no saved preference', () => {
    expect(service.mode).toBe('dark');
    expect(service.isDark).toBeTrue();
    expect(service.isLight).toBeFalse();
  });

  it('toggle() should switch from dark to light', () => {
    // service starts in dark (default)
    service.toggle();
    expect(service.mode).toBe('light');
    expect(service.isLight).toBeTrue();
    expect(service.isDark).toBeFalse();
  });

  it('toggle() should switch from light back to dark', () => {
    service.toggle(); // dark -> light
    service.toggle(); // light -> dark
    expect(service.mode).toBe('dark');
    expect(service.isDark).toBeTrue();
  });

  it('toggle() should persist the new mode in localStorage', () => {
    service.toggle(); // dark -> light
    expect(localStorage.getItem('siftly-theme')).toBe('light');
    service.toggle(); // light -> dark
    expect(localStorage.getItem('siftly-theme')).toBe('dark');
  });

  it('setMode("light") should set light mode', () => {
    service.setMode('light');
    expect(service.mode).toBe('light');
    expect(service.isLight).toBeTrue();
  });

  it('setMode("dark") should set dark mode', () => {
    service.setMode('light'); // change first
    service.setMode('dark');
    expect(service.mode).toBe('dark');
    expect(service.isDark).toBeTrue();
  });

  it('setMode should persist to localStorage', () => {
    service.setMode('light');
    expect(localStorage.getItem('siftly-theme')).toBe('light');
  });

  it('apply() should set data-theme attribute on documentElement', () => {
    service.setMode('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    service.setMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('apply() should add "dark" class and remove "light" in dark mode', () => {
    service.setMode('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(document.documentElement.classList.contains('light')).toBeFalse();
  });

  it('apply() should add "light" class and remove "dark" in light mode', () => {
    service.setMode('light');
    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should load saved "light" preference from localStorage on construction', () => {
    localStorage.setItem('siftly-theme', 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const fresh = TestBed.inject(ThemeService);
    expect(fresh.mode).toBe('light');
  });

  it('should load saved "dark" preference from localStorage on construction', () => {
    localStorage.setItem('siftly-theme', 'dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const fresh = TestBed.inject(ThemeService);
    expect(fresh.mode).toBe('dark');
  });

  it('should fall back to dark if an invalid value is in localStorage', () => {
    localStorage.setItem('siftly-theme', 'invalid-value');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const fresh = TestBed.inject(ThemeService);
    expect(fresh.mode).toBe('dark');
  });
});
