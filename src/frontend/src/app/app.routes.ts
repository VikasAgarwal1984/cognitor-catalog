import { Routes } from '@angular/router';
import { OverviewComponent } from './components/overview/overview.component';
import { SymbolsComponent } from './components/symbols/symbols.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { TraceabilityComponent } from './components/traceability/traceability.component';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'symbols', component: SymbolsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'traceability', component: TraceabilityComponent },
  { path: '**', redirectTo: 'overview' }
];

