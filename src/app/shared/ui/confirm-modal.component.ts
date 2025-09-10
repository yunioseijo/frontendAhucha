import { Component, ChangeDetectionStrategy, EventEmitter, Output, input } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="cm__backdrop" (click)="onCancel()"></div>
      <div class="cm__panel" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="cm__title">{{ title() }}</div>
        <div class="cm__message">{{ message() }}</div>
        <div class="cm__actions">
          <button class="btn-ghost" type="button" (click)="onCancel()">{{ cancelText() }}</button>
          <button class="btn-primary" type="button" (click)="onConfirm()">{{ confirmText() }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { position: fixed; inset:0; display: contents; }
    .cm__backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); }
    .cm__panel { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; padding: 16px; }
    .cm__panel > div { background: #fff; color: var(--text-on-light); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 16px; min-width: 300px; max-width: 90vw; }
    .cm__title { font-weight: 700; margin-bottom: 8px; }
    .cm__message { color: var(--muted-on-light); margin-bottom: 12px; }
    .cm__actions { display:flex; gap: 8px; justify-content:flex-end; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent {
  open = input<boolean>(false);
  title = input<string>('Confirmar acción');
  message = input<string>('¿Estás seguro?');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() { this.confirm.emit(); }
  onCancel() { this.cancel.emit(); }
}

