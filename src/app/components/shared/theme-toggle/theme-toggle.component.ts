import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,  // ← CRÍTICO
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.css']
})
export class ThemeToggleComponent {
  rotating = false;

  constructor(public theme: ThemeService) {}

  toggle() {
    this.rotating = true;
    this.theme.toggle();
    setTimeout(() => this.rotating = false, 400);
  }
}
