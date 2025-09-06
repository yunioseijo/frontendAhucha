import { Injectable, effect, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ahucha.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private systemDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  private preferred = signal<ThemeMode>(this.readInitial());

  // Expose current effective theme
  readonly mode = this.preferred;

  constructor() {
    // React to changes
    effect(() => this.applyTheme(this.preferred()));
    // React to system changes when in system mode
    this.systemDarkMQ.addEventListener('change', () => {
      if (this.preferred() === 'system') this.applyTheme('system');
    });
  }

  set(mode: ThemeMode) {
    this.preferred.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  toggle() {
    const next = this.preferred() === 'light' ? 'dark' : 'light';
    this.set(next);
  }

  private readInitial(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored ?? 'system';
  }

  private applyTheme(mode: ThemeMode) {
    const isDark = mode === 'dark' || (mode === 'system' && this.systemDarkMQ.matches);
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(isDark ? 'dark-theme' : 'light-theme');
  }
}

