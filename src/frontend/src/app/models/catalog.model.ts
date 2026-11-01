export interface RepositoryMetadata {
  id: string;
  name: string;
  path: string;
  primaryLanguage: string;
  languages: string[];
  totalFiles: number;
  totalLines: number;
  docCount: number;
  symbolCount: number;
  hasDevops: boolean;
  hasHelm: boolean;
  hasBdd: boolean;
  userNeeds: string[];
  lastIndexed: string;
}

export interface CodeSymbol {
  id: string;
  repo: string;
  filePath: string;
  kind: 'class' | 'interface' | 'function' | 'type' | 'struct' | 'enum';
  name: string;
  line: number;
  isExported: boolean;
}

export interface DocumentEntry {
  id: string;
  repo: string;
  filePath: string;
  title: string;
  type: 'adr' | 'spec' | 'bdd' | 'guide' | 'readme';
  summary: string;
  userNeeds: string[];
}

export interface CatalogSummary {
  totalRepositories: number;
  totalCodeSymbols: number;
  totalDocuments: number;
  totalTrackedNeeds: number;
  primaryLanguages: Record<string, number>;
  lastScanDurationMs: number;
  lastScannedAt: string;
}

