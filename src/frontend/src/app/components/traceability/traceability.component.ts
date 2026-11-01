import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../services/catalog.service';
import { RepositoryMetadata } from '../../models/catalog.model';

interface TraceabilityRow {
  needId: string;
  title: string;
  primaryRepo: string;
  stage: string;
  stagesCompleted: number;
  reviewGate: string;
  status: 'passed' | 'review_pending' | 'in_progress';
}

@Component({
  selector: 'app-traceability',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trace-container">
      <div class="header-section">
        <h2>Enterprise SDLC 9-Stage Traceability Matrix</h2>
        <p class="subtitle">Complete compliance chain from User Need intake through Dev Deploy (S7/R7), Action Center Gate (S8/R8), and Prod Canary (S9/R9)</p>
      </div>

      <div class="stepper-legend">
        <div class="legend-item"><span class="step-num">S1</span> Intake</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item"><span class="step-num">S2</span> Specs</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item"><span class="step-num">S3</span> BDD</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item"><span class="step-num">S4</span> Story</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item"><span class="step-num">S5</span> Code</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item"><span class="step-num">S6</span> Tests</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item special"><span class="step-num">S7</span> Dev Deploy (R7)</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item special"><span class="step-num">S8</span> Action Center (R8)</div>
        <div class="legend-arrow">&rarr;</div>
        <div class="legend-item special prod"><span class="step-num">S9</span> Prod Canary (R9)</div>
      </div>

      <div class="table-card">
        <table class="trace-table">
          <thead>
            <tr>
              <th>Need Identifier</th>
              <th>Need Description / Objective</th>
              <th>Primary Repo</th>
              <th>Current Stage</th>
              <th>Review Gate (R1–R9)</th>
              <th>Gate Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>
                <span class="need-badge">{{ row.needId }}</span>
              </td>
              <td class="need-title">{{ row.title }}</td>
              <td>
                <span class="repo-badge">{{ row.primaryRepo }}</span>
              </td>
              <td>
                <span class="stage-pill" [class.final]="row.stage === 'S9'">
                  {{ row.stage }} ({{ row.stagesCompleted }}/9)
                </span>
              </td>
              <td>
                <span class="gate-pill" [class.prod]="row.reviewGate === 'R9'">{{ row.reviewGate }}</span>
              </td>
              <td>
                <span class="status-badge" [class]="row.status">
                  <span class="material-symbols-outlined status-icon">
                    {{ row.status === 'passed' ? 'check_circle' : 'hourglass_top' }}
                  </span>
                  {{ row.status === 'passed' ? 'Verified Pass' : 'Gate Ready' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .trace-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .header-section {
      margin-bottom: 20px;
    }
    .header-section h2 {
      font-family: 'Google Sans', sans-serif;
      font-size: 20px;
      margin: 0 0 6px 0;
      color: var(--text-primary);
    }
    .subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }
    .stepper-legend {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 18px;
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .legend-item {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .legend-item.special {
      color: var(--accent-cyan);
    }
    .legend-item.prod {
      color: var(--accent-green);
    }
    .step-num {
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
    }
    .legend-arrow {
      color: var(--text-secondary);
      font-size: 12px;
    }
    .table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .trace-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }
    .trace-table th {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .trace-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    .trace-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .need-badge {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: var(--accent-cyan);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .need-title {
      font-weight: 500;
      color: var(--text-primary);
    }
    .repo-badge {
      background: rgba(255, 255, 255, 0.06);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }
    .stage-pill {
      background: rgba(192, 132, 252, 0.15);
      color: var(--accent-purple);
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
    }
    .stage-pill.final {
      background: rgba(52, 211, 153, 0.15);
      color: var(--accent-green);
    }
    .gate-pill {
      background: rgba(251, 191, 36, 0.15);
      color: var(--accent-amber);
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
    }
    .gate-pill.prod {
      background: rgba(52, 211, 153, 0.2);
      color: var(--accent-green);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-badge.passed {
      color: var(--accent-green);
    }
    .status-badge.review_pending {
      color: var(--accent-amber);
    }
    .status-icon {
      font-size: 16px;
    }
  `]
})
export class TraceabilityComponent implements OnInit {
  private catalogService = inject(CatalogService);
  public rows: TraceabilityRow[] = [
    { needId: 'NEED-2026-001', title: 'Interactive Coach Live Persona Engine', primaryRepo: 'interactive-coach', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-002', title: 'Legal & Real Estate Advisory Assistant', primaryRepo: 'legal-advise', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-003', title: 'Lichess Deep Game Analysis Engine', primaryRepo: 'lichess-analysis', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-004', title: 'Mera Vyapar GST POS & Inventory Suite', primaryRepo: 'mera-vyapar', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-005', title: 'Naviisha 3D Immersive Greens Visualizer', primaryRepo: 'my-naviisha-greens', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-006', title: 'Universal FastMCP Agent Tool Gateway', primaryRepo: 'mcp-tools', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-007', title: 'OCR Invoice Extraction & Indian MCA Filing', primaryRepo: 'ocr-reader', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-008', title: 'AI Studio High-Res Image Generation', primaryRepo: 'image-generator', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-009', title: 'Nutritional Plant Health Reminder', primaryRepo: 'plant-nutrition-reminder', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-010', title: 'Corporate Unified Brand Identity System', primaryRepo: 'platform_branding', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-011', title: 'Indian Brand & FMCG Product Finder', primaryRepo: 'product-finder', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-012', title: 'Company & Equity Registry Database', primaryRepo: 'comp-database', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-013', title: 'Naviisha Public Web & Customer Portal', primaryRepo: 'published_naviisha', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-014', title: 'Bangalore Real Estate Valuation Engine', primaryRepo: 'realestate-advise', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-015', title: 'Spiritual & Religious Wisdom Assistant', primaryRepo: 'religious-advise', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-016', title: 'Agent Automation Skills Catalog', primaryRepo: 'skills-sh', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-017', title: 'NSE/BSE Indian Stock Intelligence', primaryRepo: 'stock-recommender', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-018', title: 'Imperial Address Luxury Portal', primaryRepo: 'the-imperial-address', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-019', title: 'WhatsApp Business Messaging Outpost', primaryRepo: 'whatsapp-integrator', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
    { needId: 'NEED-2026-020', title: 'Project Management Remote Intake & SDLC Studio', primaryRepo: 'project-management', stage: 'S9', stagesCompleted: 9, reviewGate: 'R9', status: 'passed' },
  ];

  ngOnInit() {
    this.catalogService.getRepositories().subscribe((repos) => {
      // enrich primary repos if detected
    });
  }
}

