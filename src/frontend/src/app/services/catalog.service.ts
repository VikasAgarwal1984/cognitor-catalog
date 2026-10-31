import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CatalogSummary, RepositoryMetadata, CodeSymbol, DocumentEntry } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiBase = '/catalog/api/v1';

  private summarySubject = new BehaviorSubject<CatalogSummary | null>(null);
  public summary$ = this.summarySubject.asObservable();

  public getSummary(): Observable<CatalogSummary> {
    return this.http.get<CatalogSummary>(`${this.apiBase}/summary`).pipe(
      tap((sum) => this.summarySubject.next(sum))
    );
  }

  public getRepositories(): Observable<RepositoryMetadata[]> {
    return this.http.get<RepositoryMetadata[]>(`${this.apiBase}/repositories`);
  }

  public getSymbols(query?: string, repo?: string): Observable<CodeSymbol[]> {
    const params: Record<string, string> = {};
    if (query) params['q'] = query;
    if (repo) params['repo'] = repo;
    return this.http.get<CodeSymbol[]>(`${this.apiBase}/symbols`, { params });
  }

  public getDocuments(query?: string, repo?: string, type?: string): Observable<DocumentEntry[]> {
    const params: Record<string, string> = {};
    if (query) params['q'] = query;
    if (repo) params['repo'] = repo;
    if (type) params['type'] = type;
    return this.http.get<DocumentEntry[]>(`${this.apiBase}/documents`, { params });
  }

  public triggerRescan(): Observable<{ message: string; summary: CatalogSummary }> {
    return this.http.post<{ message: string; summary: CatalogSummary }>(`${this.apiBase}/scan`, {}).pipe(
      tap((res) => this.summarySubject.next(res.summary))
    );
  }
}
