import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-header">
      <div class="brand-section">
        <span class="material-symbols-outlined logo-icon">account_tree</span>
        <div class="brand-text">
          <span class="brand-title">COGNITOR CATALOG</span>
          <span class="brand-subtitle">Central AST & Architectural Knowledge Graph</span>
        </div>
      </div>

      <nav class="nav-links">
        <a routerLink="/overview" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">dashboard</span> Overview
        </a>
        <a routerLink="/symbols" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">code</span> Code Symbols
        </a>
        <a routerLink="/documents" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">menu_book</span> ADRs & Specs
        </a>
        <a routerLink="/traceability" routerLinkActive="active" class="nav-link">
          <span class="material-symbols-outlined">verified</span> SDLC Traceability
        </a>
      </nav>

      <div class="actions-section">
        <button class="rescan-btn" (click)="onRescan()" [disabled]="isScanning">
          <span class="material-symbols-outlined" [class.spinning]="isScanning">sync</span>
          {{ isScanning ? 'Indexing...' : 'Rescan Repositories' }}
        </button>
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      font-size: 30px;
      color: var(--accent-cyan);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Google Sans', sans-serif;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.8px;
      color: var(--text-primary);
    }
    .brand-subtitle {
      font-size: 11px;
      color: var(--text-secondary);
    }
    .nav-links {
      display: flex;
      gap: 8px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    .nav-link.active {
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent-cyan);
      border-bottom: 2px solid var(--accent-cyan);
    }
    .rescan-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .rescan-btn:hover:not(:disabled) {
      filter: brightness(1.1);
    }
    .rescan-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NavBarComponent {
  private catalogService = inject(CatalogService);
  public isScanning = false;

  onRescan() {
    this.isScanning = true;
    this.catalogService.triggerRescan().subscribe({
      next: () => {
        this.isScanning = false;
      },
      error: () => {
        this.isScanning = false;
      }
    });
  }
}

