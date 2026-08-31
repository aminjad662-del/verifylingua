# Phase 0 Implementation Plan: Foundations, Tokens, Data Layer, and Quality Gates

## Objectives
1. **Hard Gate 1 Resolution**: Verify UILO availability across installed skills/MCP servers. (Result: Not found. Proceeding autonomously with shadcn/ui and the screenshot-led visual specification).
2. **Visual Analysis & Design Specification**: Complete /docs/REFERENCE_UI.md and /docs/REFERENCE_CHECKLIST.md mapping the visual grammar from 
eference-product.jpg and 
eference-community.jpg.
3. **Tailwind v4 Design System Tokens**: Set up pp/globals.css with the strict semantic tokens and named gradients specified in §4.1.
4. **Prisma Data Layer**: Implement the complete schema in prisma/schema.prisma matching all entities and enums in §8.
5. **Quality Gates & CI**: Configure .github/workflows/ci.yml, scripts/check-raw-hex.js, 	sconfig.json (strict), and .env.example.
6. **Core UI Primitives**: Implement accessible shadcn/Radix components styled with our design tokens.
7. **Verification**: Run prisma generate, 
ode scripts/check-raw-hex.js, and pnpm build to verify clean build.

## Proposed Steps
- [x] Download reference screenshots into /docs/references/
- [x] Check UILO skill availability & document Hard Gate 1 in BUILD_STATE.md
- [ ] Create detailed REFERENCE_UI.md and REFERENCE_CHECKLIST.md
- [ ] Configure 	sconfig.json, 
ext.config.ts, postcss.config.mjs
- [ ] Implement pp/globals.css with @theme block and full light/dark tokens
- [ ] Implement prisma/schema.prisma with all 11 models and enums
- [ ] Run pnpm db:generate / generate Prisma Client
- [ ] Create .env.example
- [ ] Create scripts/check-raw-hex.js to enforce token usage
- [ ] Implement core UI components in components/ui/
- [ ] Create base layout pp/layout.tsx and placeholder home page for Phase 0
- [ ] Set up .github/workflows/ci.yml
- [ ] Verify build and commit phase-0: repo setup, design tokens, prisma schema, CI
