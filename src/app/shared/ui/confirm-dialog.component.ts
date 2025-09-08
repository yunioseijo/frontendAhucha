import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: string; // material icon name, e.g., 'delete_forever'
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .title-row { display:flex; align-items:center; gap:10px; }
    .icon-badge { width:36px; height:36px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; }
    .icon-badge.danger { background:#fee2e2; color:#b91c1c; }
    .icon-badge.warning { background:#fef3c7; color:#b45309; }
    .icon-badge.info { background:#e0f2fe; color:#0369a1; }
    .actions { display:flex; gap:8px; }
    .content { margin-top: 6px; }
  `],
  template: `
    <h2 mat-dialog-title class="title-row">
      <span class="icon-badge" [ngClass]="data.variant || 'danger'">
        <mat-icon>{{ data.icon || defaultIcon }}</mat-icon>
      </span>
      <span>{{ data.title || 'Confirmación' }}</span>
    </h2>
    <div mat-dialog-content class="content">
      <p style="margin:0; line-height:1.5;">{{ data.message || '¿Confirmas esta acción?' }}</p>
    </div>
    <div mat-dialog-actions align="end" class="actions">
      <button mat-stroked-button (click)="cancel()">{{ data.cancelText || 'Cancelar' }}</button>
      <button mat-raised-button color="warn" (click)="confirm()">{{ data.confirmText || 'Eliminar' }}</button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly defaultIcon = 'warning_amber';

  cancel() { this.dialogRef.close(false); }
  confirm() { this.dialogRef.close(true); }
}
