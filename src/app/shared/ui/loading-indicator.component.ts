import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  template: `
    <div class="loading" role="status" aria-live="polite" aria-label="Cargando">
      <span class="spinner" aria-hidden="true"></span>
      <span class="text">Cargando…</span>
    </div>
  `,
  styles: [`
    .loading { display:flex; align-items:center; gap:8px; color: var(--muted-on-dark); }
    .spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(118,254,254,0.35); border-top-color: var(--electric-blue); animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicatorComponent {}

