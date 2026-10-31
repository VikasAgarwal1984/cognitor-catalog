import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { CatalogSummary, RepositoryMetadata } from '../../models/catalog.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overview-container">
      <!-- KPI Metric Cards -->
      <section class="kpi-grid" *ngIf="summary">
        <div class="kpi-card">
          <div class="kpi-icon-wrap cyan">
            <span class="material-symbols-outlined">folder_special</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ summary.totalRepositories }}</span>
            <span class="kpi-label">Active Workspaces</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap green">
            <span class="material-symbols-outlined">data_object</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ summary.totalCodeSymbols | number }}</span>
            <span class="kpi-label">Indexed Code Symbols</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap purple">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ summary.totalDocuments | number }}</span>
            <span class="kpi-label">ADRs & Specs</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap amber">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ summary.totalTrackedNeeds }}</span>
            <span class="kpi-label">User Needs Mapped</span>
          </div>
        </div>
      </section>

      <!-- Language Distribution -->
      <section class="lang-strip" *ngIf="summary && langEntries.length">
        <span class="strip-title">Language Footprint:</span>
        <div class="lang-badges">
          <span class="lang-badge" *ngFor="let item of langEntries">
            <span class="dot"></span> {{ item[0] }}: <strong>{{ item[1] }} repos</strong>
          </span>
        </div>
      </section>

      <!-- Repositories Grid -->
      <section class="repos-section">
        <div class="section-header">
          <h2>Enterprise Workspaces ({{ repositories.length }})</h2>
          <input
            type="text"
            placeholder="Search workspaces..."
            class="search-input"
            (input)="onSearch($event)"
          />
        </div>

        <div class="repos-grid">
          <div class="repo-card" *ngFor="let repo of filteredRepositories">
            <div class="repo-top">
              <span class="repo-name">{{ repo.name }}</span>
              <span class="lang-pill" [class]="repo.primaryLanguage.toLowerCase() === 'c#' ? 'csharp' : repo.primaryLanguage.toLowerCase()">{{ repo.primaryLanguage }}</span>
            </div>

            <div class="repo-stats">
              <div class="stat-item">
                <span class="stat-num">{{ repo.symbolCount }}</span>
                <span class="stat-lbl">Symbols</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ repo.docCount }}</span>
                <span class="stat-lbl">Docs</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ repo.totalFiles }}</span>
                <span class="stat-lbl">Files</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ repo.totalLines | number }}</span>
                <span class="stat-lbl">Lines</span>
              </div>
            </div>

            <div class="repo-badges">
              <span class="tag-badge" *ngIf="repo.hasDevops">DevOps</span>
              <span class="tag-badge" *ngIf="repo.hasHelm">Helm</span>
              <span class="tag-badge" *ngIf="repo.hasBdd">BDD</span>
              <span class="tag-badge need-tag" *ngFor="let n of repo.userNeeds.slice(0, 2)">{{ n }}</span>
            </div>

            <div class="repo-footer">
              <a [routerLink]="['/symbols']" [queryParams]="{ repo: repo.name }" class="view-link">Explore Symbols &rarr;</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    }
    .kpi-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-icon-wrap.cyan { background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); }
    .kpi-icon-wrap.green { background: rgba(52, 211, 153, 0.15); color: var(--accent-green); }
    .kpi-icon-wrap.purple { background: rgba(192, 132, 252, 0.15); color: var(--accent-purple); }
    .kpi-icon-wrap.amber { background: rgba(251, 191, 36, 0.15); color: var(--accent-amber); }
    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      font-family: 'Google Sans', sans-serif;
      display: block;
      color: var(--text-primary);
    }
    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .lang-strip {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 20px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .strip-title {
      font-weight: 600;
      color: var(--text-secondary);
    }
    .lang-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .lang-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-primary);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-cyan);
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .section-header h2 {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      margin: 0;
      color: var(--text-primary);
    }
    .search-input {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      width: 260px;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    .repos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .repo-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .repo-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent-cyan);
    }
    .repo-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .repo-name {
      font-weight: 600;
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-primary);
    }
    .lang-pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      color: var(--text-secondary);
    }
    .lang-pill.typescript { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .lang-pill.csharp { background: rgba(192, 132, 252, 0.2); color: #c084fc; }
    .lang-pill.python { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .repo-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: var(--bg-secondary);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 12px;
      text-align: center;
    }
    .stat-num {
      font-size: 14px;
      font-weight: 700;
      display: block;
      color: var(--text-primary);
    }
    .stat-lbl {
      font-size: 10px;
      color: var(--text-secondary);
      text-transform: uppercase;
    }
    .repo-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }
    .tag-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    .need-tag {
      border-color: rgba(52, 211, 153, 0.3);
      color: var(--accent-green);
    }
    .repo-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
      text-align: right;
    }
    .view-link {
      color: var(--accent-cyan);
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
    }
    .view-link:hover {
      text-decoration: underline;
    }
  `]
})
export class OverviewComponent implements OnInit {
  private catalogService = inject(CatalogService);
  public summary: CatalogSummary | null = null;
  public repositories: RepositoryMetadata[] = [];
  public filteredRepositories: RepositoryMetadata[] = [];
  public langEntries: [string, number][] = [];

  ngOnInit() {
    this.catalogService.getSummary().subscribe((sum) => {
      this.summary = sum;
      this.langEntries = Object.entries(sum.primaryLanguages || {});
    });

    this.catalogService.getRepositories().subscribe((repos) => {
      this.repositories = repos;
      this.filteredRepositories = repos;
    });
  }

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRepositories = this.repositories.filter(
      (r) => r.name.toLowerCase().includes(val) || r.primaryLanguage.toLowerCase().includes(val)
    );
  }
}
