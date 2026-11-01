import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { CodeSymbol, RepositoryMetadata } from '../../models/catalog.model';

@Component({
  selector: 'app-symbols',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="symbols-container">
      <div class="filter-header">
        <div class="header-left">
          <h2>Code Symbols AST Catalog ({{ symbols.length }})</h2>
          <span class="subtext">Deterministic structural indexing across all enterprise repositories</span>
        </div>

        <div class="filters-row">
          <select class="repo-select" (change)="onRepoChange($event)" [value]="selectedRepo">
            <option value="">All Workspaces</option>
            <option *ngFor="let r of repositories" [value]="r.name">{{ r.name }}</option>
          </select>

          <input
            type="text"
            placeholder="Filter symbols, classes, interfaces..."
            class="search-input"
            (input)="onSearch($event)"
            [value]="searchQuery"
          />
        </div>
      </div>

      <div class="table-card">
        <table class="symbols-table">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Symbol Name</th>
              <th>Workspace</th>
              <th>File Path</th>
              <th>Line</th>
              <th>Exported</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of symbols">
              <td>
                <span class="kind-pill" [class]="s.kind">{{ s.kind }}</span>
              </td>
              <td class="symbol-name">{{ s.name }}</td>
              <td>
                <span class="repo-badge">{{ s.repo }}</span>
              </td>
              <td class="file-path">{{ s.filePath }}</td>
              <td class="line-num">L{{ s.line }}</td>
              <td>
                <span class="status-dot" [class.active]="s.isExported"></span>
                {{ s.isExported ? 'Public' : 'Internal' }}
              </td>
            </tr>
            <tr *ngIf="symbols.length === 0">
              <td colspan="6" class="empty-state">No matching code symbols found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .symbols-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-left h2 {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      margin: 0 0 4px 0;
      color: var(--text-primary);
    }
    .subtext {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .filters-row {
      display: flex;
      gap: 12px;
    }
    .repo-select, .search-input {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
    }
    .repo-select:focus, .search-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    .search-input {
      width: 280px;
    }
    .table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .symbols-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    .symbols-table th {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .symbols-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .symbols-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .kind-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }
    .kind-pill.class { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .kind-pill.interface { background: rgba(52, 211, 153, 0.2); color: #34d399; }
    .kind-pill.function { background: rgba(192, 132, 252, 0.2); color: #c084fc; }
    .symbol-name {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: var(--accent-cyan);
    }
    .repo-badge {
      background: rgba(255,255,255,0.06);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: var(--text-secondary);
    }
    .file-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .line-num {
      color: var(--accent-amber);
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #64748b;
      margin-right: 4px;
    }
    .status-dot.active {
      background: var(--accent-green);
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary);
    }
  `]
})
export class SymbolsComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);

  public symbols: CodeSymbol[] = [];
  public repositories: RepositoryMetadata[] = [];
  public selectedRepo = '';
  public searchQuery = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['repo']) {
        this.selectedRepo = params['repo'];
      }
      this.loadSymbols();
    });

    this.catalogService.getRepositories().subscribe((repos) => {
      this.repositories = repos;
    });
  }

  loadSymbols() {
    this.catalogService.getSymbols(this.searchQuery, this.selectedRepo).subscribe((symbols) => {
      this.symbols = symbols;
    });
  }

  onRepoChange(event: Event) {
    this.selectedRepo = (event.target as HTMLSelectElement).value;
    this.loadSymbols();
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.loadSymbols();
  }
}

