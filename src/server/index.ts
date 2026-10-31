import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RepositoryCatalogScanner } from './scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '4200', 10);
const basePath = process.env.BASE_PATH || '/catalog/';

app.use(cors());
app.use(express.json());

const scanner = new RepositoryCatalogScanner();

// Health check
app.get('/healthz', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cognitor-catalog',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiRouter = express.Router();

apiRouter.get('/summary', (req, res) => {
  res.json(scanner.getSummary());
});

apiRouter.get('/repositories', (req, res) => {
  res.json(scanner.getRepositories());
});

apiRouter.get('/symbols', (req, res) => {
  const query = req.query.q as string | undefined;
  const repo = req.query.repo as string | undefined;
  res.json(scanner.getSymbols(query, repo));
});

apiRouter.get('/documents', (req, res) => {
  const query = req.query.q as string | undefined;
  const repo = req.query.repo as string | undefined;
  const type = req.query.type as string | undefined;
  res.json(scanner.getDocuments(query, repo, type));
});

apiRouter.post('/scan', async (req, res) => {
  const summary = await scanner.scanAll();
  res.json({ message: 'Catalog re-indexing completed successfully', summary });
});

app.use(`${basePath}api/v1`, apiRouter);
app.use('/api/v1', apiRouter);

// Serve Frontend UI (built Angular application)
const uiDistCandidates = [
  path.join(__dirname, '../frontend/dist/frontend/browser'),
  path.join(__dirname, '../../frontend/dist/frontend/browser'),
  path.join(__dirname, '../ui'),
  path.join(__dirname, '../../src/ui'),
];

let uiPath = '';
for (const cand of uiDistCandidates) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    uiPath = cand;
    break;
  }
}

if (uiPath) {
  console.log(`[Catalog] Serving UI from: ${uiPath}`);
  app.use(basePath, express.static(uiPath));
  app.use('/', express.static(uiPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(uiPath, 'index.html'));
  });
} else {
  console.log(`[Catalog] UI dist not found yet, serving placeholder router`);
  app.get(basePath, (req, res) => {
    res.send(`<h1>Cognitor Catalog Indexer Service</h1><p>API is active at <a href="${basePath}api/v1/summary">${basePath}api/v1/summary</a></p>`);
  });
}

// Initial scan
console.log(`[Catalog] Initializing repository catalog scan...`);
scanner.scanAll().then((summary) => {
  console.log(`[Catalog] Prime scan complete: ${summary.totalRepositories} repos, ${summary.totalCodeSymbols} symbols, ${summary.totalDocuments} docs indexed in ${summary.lastScanDurationMs}ms.`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`============================================================`);
  console.log(`  cognitor-catalog: Running on port ${port}`);
  console.log(`  Subpath Base : ${basePath}`);
  console.log(`  API Base     : ${basePath}api/v1/`);
  console.log(`============================================================`);
});
