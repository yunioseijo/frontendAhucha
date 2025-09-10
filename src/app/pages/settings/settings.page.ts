import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@core/layout/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private theme = inject(ThemeService);
  readonly mode = this.theme.mode; // signal

  setMode(value: 'light' | 'dark' | 'system') {
    this.theme.set(value);
  }
}
