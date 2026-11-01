# Cognitor Catalog (`cognitor-catalog`)

An authoritative central architectural knowledge graph, multi-repository AST symbol indexer, and end-to-end SDLC traceability suite for the Kubernetes platform ecosystem.

Licensed strictly under **Apache-2.0**.

## 🌟 Core Architecture

1. **Multi-Repository AST & Code Symbol Scanner**:
   - Ingests all active enterprise workspaces (`d:\git\*`).
   - Extracts classes, interfaces, exported functions, structs, and line pointers.
2. **Architecture Decision Records (ADR) & Technical Specs Library**:
   - Full-text indexing of markdown documentation, ADRs, SRS specs, and BDD Gherkin `.feature` files.
3. **9-Stage SDLC Traceability Engine**:
   - Maps User Needs (`NEED-2026-001` through `NEED-2026-020`) through Stages S1–S9 and Review Gates R1–R9.
4. **Angular 22 Standalone Frontend**:
   - Built with Google Material Design 3 (M3) theming, Angular Router, and responsive layouts.
   - Served at `/catalog/` behind Authentik Forward-Auth Outpost SSO.

