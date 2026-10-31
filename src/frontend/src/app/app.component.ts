import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  template: `
    <div class="app-shell">
      <app-nav-bar></app-nav-bar>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-primary);
    }
    .app-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {}
