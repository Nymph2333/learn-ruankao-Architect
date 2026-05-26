# Phase 0 / Phase 1 Structure Check

This checklist verifies only the scaffold, documentation standards, reusable templates, and minimum TypeScript validation script.

## Required Directories

- `sources/`
- `data/`
- `docs/`
- `templates/`
- `scripts/`
- `verification/`
- `config/`

## Required Files

- `AGENTS.md`
- `README.md`
- `config/sources.yaml`
- `config/taxonomy.yaml`
- `templates/concept-card.md`
- `templates/case-analysis-card.md`
- `templates/paper-template.md`
- `verification/phase0-structure-check.md`
- `scripts/verify-structure.ts`
- `package.json`
- `tsconfig.json`
- `.gitignore`

## Validation Commands

```bash
pnpm install
pnpm typecheck
pnpm verify
```

## Acceptance Criteria

- The required directories exist.
- The required files exist.
- The concept, case-analysis, and paper templates contain their core headings.
- `AGENTS.md` contains `Non-Negotiable Output Structure`.
- No crawler, parser, renderer, or external website access is implemented in this phase.
