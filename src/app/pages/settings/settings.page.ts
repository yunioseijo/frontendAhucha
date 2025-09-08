import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { ThemeService } from '@core/layout/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatButtonToggleGroup, MatButtonToggle],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private theme = inject(ThemeService);
  readonly mode = this.theme.mode; // signal

  setMode(value: 'light' | 'dark' | 'system') {
    this.theme.set(value);
  }
}

