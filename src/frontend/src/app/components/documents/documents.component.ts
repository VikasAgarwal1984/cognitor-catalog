import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../services/catalog.service';
import { DocumentEntry, RepositoryMetadata } from '../../models/catalog.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="docs-container">
      <div class="filter-header">
        <div class="header-left">
          <h2>Architectural Decisions & Technical Specs ({{ documents.length }})</h2>
          <span class="subtext">Centralized index of ADRs, tri-layer specifications, BDD feature files, and design documents</span>
        </div>

        <div class="filters-row">
          <select class="type-select" (change)="onTypeChange($event)">
            <option value="">All Document Types</option>
            <option value="adr">ADRs (Architecture Decisions)</option>
            <option value="bdd">BDD Gherkin Feature Files</option>
            <option value="spec">SRS Specifications</option>
            <option value="guide">Technical Guides</option>
            <option value="readme">Repository Readmes</option>
          </select>

          <input
            type="text"
            placeholder="Search documents by title or path..."
            class="search-input"
            (input)="onSearch($event)"
          />
        </div>
      </div>

      <div class="docs-grid">
        <div class="doc-card" *ngFor="let doc of documents">
          <div class="doc-top">
            <span class="type-pill" [class]="doc.type">{{ doc.type | uppercase }}</span>
            <span class="repo-name">{{ doc.repo }}</span>
          </div>

          <h3 class="doc-title">{{ doc.title }}</h3>
          <p class="doc-summary">{{ doc.summary }}</p>

          <div class="doc-path">
            <span class="material-symbols-outlined path-icon">description</span>
            <code>{{ doc.filePath }}</code>
          </div>

          <div class="doc-footer" *ngIf="doc.userNeeds.length">
            <span class="need-chip" *ngFor="let n of doc.userNeeds">{{ n }}</span>
          </div>
        </div>

        <div *ngIf="documents.length === 0" class="empty-docs">
          No architectural documents found matching your filter criteria.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .docs-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
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
    .type-select, .search-input {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
    }
    .type-select:focus, .search-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    .search-input {
      width: 280px;
    }
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px;
    }
    .doc-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s, transform 0.2s;
    }
    .doc-card:hover {
      border-color: var(--accent-purple);
      transform: translateY(-2px);
    }
    .doc-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .type-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .type-pill.adr { background: rgba(192, 132, 252, 0.2); color: #c084fc; }
    .type-pill.bdd { background: rgba(52, 211, 153, 0.2); color: #34d399; }
    .type-pill.spec { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .type-pill.guide { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .type-pill.readme { background: rgba(255, 255, 255, 0.1); color: var(--text-secondary); }
    .repo-name {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }
    .doc-title {
      font-size: 15px;
      font-family: 'Google Sans', sans-serif;
      margin: 0 0 8px 0;
      color: var(--text-primary);
      line-height: 1.4;
    }
    .doc-summary {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0 0 14px 0;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .doc-path {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-secondary);
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 10px;
    }
    .path-icon {
      font-size: 14px;
    }
    .doc-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding-top: 8px;
      border-top: 1px solid var(--border-color);
    }
    .need-chip {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: var(--accent-green);
      font-weight: 600;
    }
    .empty-docs {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
    }
  `]
})
export class DocumentsComponent implements OnInit {
  private catalogService = inject(CatalogService);
  public documents: DocumentEntry[] = [];
  public selectedType = '';
  public searchQuery = '';

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.catalogService.getDocuments(this.searchQuery, undefined, this.selectedType).subscribe((docs) => {
      this.documents = docs;
    });
  }

  onTypeChange(event: Event) {
    this.selectedType = (event.target as HTMLSelectElement).value;
    this.loadDocuments();
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.loadDocuments();
  }
}
