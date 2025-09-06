import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButton,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Bienvenido a Ahucha</mat-card-title>
        <mat-card-subtitle>Gestión de usuarios</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p *ngIf="!auth.isAuthenticated()">Inicia sesión o crea una cuenta para continuar.</p>
        <p *ngIf="auth.isAuthenticated()">Sesión iniciada como <b>{{ auth.user()?.email }}</b></p>
      </mat-card-content>
      <mat-card-actions>
        <ng-container *ngIf="!auth.isAuthenticated(); else logged">
          <a mat-raised-button color="primary" routerLink="/auth/login">Entrar</a>
          <a mat-stroked-button color="primary" routerLink="/auth/register">Registro</a>
        </ng-container>
        <ng-template #logged>
          <a mat-raised-button color="primary" routerLink="/account">Mi cuenta</a>
          <a mat-stroked-button color="accent" *ngIf="auth.roles().includes('admin') || auth.roles().includes('super-user')" routerLink="/admin/users">Admin</a>
        </ng-template>
      </mat-card-actions>
    </mat-card>
  `
})
export class HomePage {
  auth = inject(AuthService);
}
