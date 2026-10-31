import fs from 'node:fs';
import path from 'node:path';

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

export class RepositoryCatalogScanner {
  private baseDir: string;
  private repositories: Map<string, RepositoryMetadata> = new Map();
  private symbols: CodeSymbol[] = [];
  private documents: DocumentEntry[] = [];
  private isScanning: boolean = false;
  private lastSummary: CatalogSummary | null = null;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.CATALOG_ROOT_DIR || 'D:\\git';
  }

  public async scanAll(): Promise<CatalogSummary> {
    const startTime = Date.now();
    this.isScanning = true;
    this.repositories.clear();
    this.symbols = [];
    this.documents = [];

    try {
      if (!fs.existsSync(this.baseDir)) {
        console.warn(`[Scanner] Base directory does not exist: ${this.baseDir}`);
        return this.createEmptySummary();
      }

      const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
      const repoDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

      for (const repoDir of repoDirs) {
        const repoPath = path.join(this.baseDir, repoDir.name);
        try {
          await this.scanRepository(repoDir.name, repoPath);
        } catch (err) {
          console.error(`[Scanner] Error scanning repo ${repoDir.name}:`, err);
        }
      }

      const langMap: Record<string, number> = {};
      for (const repo of this.repositories.values()) {
        langMap[repo.primaryLanguage] = (langMap[repo.primaryLanguage] || 0) + 1;
      }

      const allNeeds = new Set<string>();
      for (const r of this.repositories.values()) {
        r.userNeeds.forEach((n) => allNeeds.add(n));
      }

      this.lastSummary = {
        totalRepositories: this.repositories.size,
        totalCodeSymbols: this.symbols.length,
        totalDocuments: this.documents.length,
        totalTrackedNeeds: allNeeds.size,
        primaryLanguages: langMap,
        lastScanDurationMs: Date.now() - startTime,
        lastScannedAt: new Date().toISOString(),
      };

      return this.lastSummary;
    } finally {
      this.isScanning = false;
    }
  }

  private async scanRepository(repoName: string, repoPath: string): Promise<void> {
    const langSet = new Set<string>();
    const needSet = new Set<string>();
    let totalFiles = 0;
    let totalLines = 0;
    let hasDevops = fs.existsSync(path.join(repoPath, 'devops')) || fs.existsSync(path.join(repoPath, 'dev-ops'));
    let hasHelm = fs.existsSync(path.join(repoPath, 'devops', 'charts')) || fs.existsSync(path.join(repoPath, 'chart'));
    let hasBdd = false;
    let repoDocCount = 0;
    let repoSymbolCount = 0;

    const ignoreFolders = new Set(['node_modules', '.git', 'dist', 'bin', 'obj', '.angular', 'coverage', 'build', '.venv']);

    const walk = (currentPath: string, depth: number = 0) => {
      if (depth > 6) return;
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(currentPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (ignoreFolders.has(entry.name)) continue;
        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.relative(repoPath, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          totalFiles++;
          const ext = path.extname(entry.name).toLowerCase();

          // Language tagging
          if (['.ts', '.tsx'].includes(ext)) langSet.add('TypeScript');
          else if (['.js', '.jsx', '.mjs'].includes(ext)) langSet.add('JavaScript');
          else if (ext === '.cs') langSet.add('C#');
          else if (ext === '.py') langSet.add('Python');
          else if (ext === '.go') langSet.add('Go');
          else if (ext === '.java') langSet.add('Java');
          else if (['.yaml', '.yml'].includes(ext)) langSet.add('YAML');

          if (ext === '.feature') {
            hasBdd = true;
          }

          // Documentation extraction
          if (ext === '.md' || ext === '.feature') {
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const lines = content.split('\n');
              totalLines += lines.length;

              // Need extraction
              const needMatches = content.match(/NEED-2026-\d{3}/gi) || [];
              for (const nm of needMatches) {
                needSet.add(nm.toUpperCase());
              }

              let docType: DocumentEntry['type'] = 'spec';
              if (relPath.toLowerCase().includes('adr') || entry.name.toLowerCase().startsWith('adr-')) docType = 'adr';
              else if (ext === '.feature') docType = 'bdd';
              else if (entry.name.toLowerCase() === 'readme.md') docType = 'readme';
              else if (relPath.toLowerCase().includes('guide')) docType = 'guide';

              const firstHeading = lines.find((l) => l.trim().startsWith('#')) || entry.name;
              const title = firstHeading.replace(/^#+\s*/, '').trim();

              const docEntry: DocumentEntry = {
                id: `${repoName}:${relPath}`,
                repo: repoName,
                filePath: relPath,
                title: title.slice(0, 120),
                type: docType,
                summary: lines.slice(0, 5).join(' ').slice(0, 200).replace(/#/g, '').trim(),
                userNeeds: Array.from(new Set(needMatches.map((n) => n.toUpperCase()))),
              };

              this.documents.push(docEntry);
              repoDocCount++;
            } catch {}
          } else if (['.ts', '.cs', '.py', '.go', '.java'].includes(ext)) {
            // Symbol extraction
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const lines = content.split('\n');
              totalLines += lines.length;

              const symbols = this.extractSymbols(repoName, relPath, lines, ext);
              this.symbols.push(...symbols);
              repoSymbolCount += symbols.length;

              const needMatches = content.match(/NEED-2026-\d{3}/gi) || [];
              for (const nm of needMatches) {
                needSet.add(nm.toUpperCase());
              }
            } catch {}
          }
        }
      }
    };

    walk(repoPath);

    const primaryLanguage = langSet.has('TypeScript')
      ? 'TypeScript'
      : langSet.has('C#')
      ? 'C#'
      : langSet.has('Python')
      ? 'Python'
      : langSet.has('Go')
      ? 'Go'
      : langSet.size > 0
      ? Array.from(langSet)[0]
      : 'General';

    this.repositories.set(repoName, {
      id: repoName,
      name: repoName,
      path: repoPath,
      primaryLanguage,
      languages: Array.from(langSet),
      totalFiles,
      totalLines,
      docCount: repoDocCount,
      symbolCount: repoSymbolCount,
      hasDevops,
      hasHelm,
      hasBdd,
      userNeeds: Array.from(needSet),
      lastIndexed: new Date().toISOString(),
    });
  }

  private extractSymbols(repoName: string, relPath: string, lines: string[], ext: string): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    const maxSymbolsPerFile = 25;

    for (let i = 0; i < lines.length && symbols.length < maxSymbolsPerFile; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*')) continue;

      if (ext === '.ts' || ext === '.js') {
        const classMatch = line.match(/^export\s+(class|abstract class)\s+([A-Za-z0-9_]+)/);
        if (classMatch) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: 'class',
            name: classMatch[2],
            line: i + 1,
            isExported: true,
          });
          continue;
        }

        const interfaceMatch = line.match(/^export\s+interface\s+([A-Za-z0-9_]+)/);
        if (interfaceMatch) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: 'interface',
            name: interfaceMatch[1],
            line: i + 1,
            isExported: true,
          });
          continue;
        }

        const funcMatch = line.match(/^export\s+(async\s+)?function\s+([A-Za-z0-9_]+)/);
        if (funcMatch) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: 'function',
            name: funcMatch[2],
            line: i + 1,
            isExported: true,
          });
          continue;
        }
      } else if (ext === '.cs') {
        const csClass = line.match(/^public\s+(sealed\s+|static\s+|abstract\s+)?(class|interface|record|enum)\s+([A-Za-z0-9_]+)/);
        if (csClass) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: csClass[2] === 'interface' ? 'interface' : 'class',
            name: csClass[3],
            line: i + 1,
            isExported: true,
          });
        }
      } else if (ext === '.py') {
        const pyClass = line.match(/^class\s+([A-Za-z0-9_]+)/);
        if (pyClass) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: 'class',
            name: pyClass[1],
            line: i + 1,
            isExported: true,
          });
        }
        const pyDef = line.match(/^def\s+([A-Za-z0-9_]+)\s*\(/);
        if (pyDef && !pyDef[1].startsWith('_')) {
          symbols.push({
            id: `${repoName}:${relPath}:L${i + 1}`,
            repo: repoName,
            filePath: relPath,
            kind: 'function',
            name: pyDef[1],
            line: i + 1,
            isExported: true,
          });
        }
      }
    }

    return symbols;
  }

  private createEmptySummary(): CatalogSummary {
    return {
      totalRepositories: 0,
      totalCodeSymbols: 0,
      totalDocuments: 0,
      totalTrackedNeeds: 0,
      primaryLanguages: {},
      lastScanDurationMs: 0,
      lastScannedAt: new Date().toISOString(),
    };
  }

  public getSummary(): CatalogSummary {
    return this.lastSummary || this.createEmptySummary();
  }

  public getRepositories(): RepositoryMetadata[] {
    return Array.from(this.repositories.values());
  }

  public getSymbols(query?: string, repo?: string): CodeSymbol[] {
    let list = this.symbols;
    if (repo) list = list.filter((s) => s.repo.toLowerCase() === repo.toLowerCase());
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.filePath.toLowerCase().includes(q));
    }
    return list.slice(0, 200);
  }

  public getDocuments(query?: string, repo?: string, type?: string): DocumentEntry[] {
    let list = this.documents;
    if (repo) list = list.filter((d) => d.repo.toLowerCase() === repo.toLowerCase());
    if (type) list = list.filter((d) => d.type === type);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.filePath.toLowerCase().includes(q));
    }
    return list.slice(0, 200);
  }
}
