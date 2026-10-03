const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\aminj\\.gemini\\config\\plugins\\ecc\\skills';
const geminiTargetDir = 'C:\\Users\\aminj\\.gemini\\config\\skills\\ecc-skills';
const claudeTargetDir = 'C:\\Users\\aminj\\.claude\\skills\\ecc-skills';

console.log('Reading skills from:', srcDir);
const items = fs.readdirSync(srcDir);

const skills = [];
for (const item of items) {
  const sf = path.join(srcDir, item, 'SKILL.md');
  if (fs.existsSync(sf)) {
    const text = fs.readFileSync(sf, 'utf8');
    const nameMatch = text.match(/^name:\s*(.+)$/m);
    const descMatch = text.match(/^description:\s*(?:>-\s*|>\s*|\|-?\s*)?([^\n]+(?:\n\s+[^\n]+)*)/m);
    
    // Extract body after frontmatter
    let body = text.replace(/^---[\s\S]*?---\s*/, '').trim();
    
    skills.push({
      id: item,
      name: nameMatch ? nameMatch[1].trim() : item,
      description: descMatch ? descMatch[1].replace(/\n\s+/g, ' ').trim().replace(/^["']|["']$/g, '') : '',
      body: body,
      path: sf
    });
  }
}

console.log(`Successfully parsed ${skills.length} skills.`);

const domainDefs = [
  {
    id: '01-orchestration-and-loops',
    title: 'Autonomous Orchestration, Multi-Agent Fleet & Continuous Loops',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(orch-|autonomous-|continuous-agent|loop-|gan-|dmux-|claude-devfleet|team-|agentic-|dynamic-workflow|santa-|plan-canvas|plan-prd|prp-|dispatching-parallel|executing-plans|subagent-)/.test(n) ||
             /orchestrat|autonomous loop|subagent|workflow mode|devfleet|multi-agent/i.test(d);
    }
  },
  {
    id: '07-security-and-compliance',
    title: 'Security Auditing, Vulnerability Hunting, HIPAA & Compliance',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(security|hipaa|phi|defi|gateguard|bounty|compliance|prediction-market-risk|safety-guard)/.test(n) ||
             /vulnerability|exploit|bounty|hipaa|phi compliance|owasp|security review/i.test(d);
    }
  },
  {
    id: '08-testing-and-code-health',
    title: 'Testing, QA Automation, Code Health & Verification',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(test-|testing|tdd|e2e|qa|verification|benchmark|codehealth|plankton|code-review|code-simplification|review-|eval-|ai-regression|systematic-debugging|receiving-code-review|requesting-code-review|verification-before-completion)/.test(n) ||
             /playwright|vitest|pytest|testing strategy|code review|code health|refactoring/i.test(d);
    }
  },
  {
    id: '03-frontend-and-ui',
    title: 'Frontend Architecture, Modern Web, UI Systems & Motion',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(react|next|vue|nuxt|vite|angular|frontend|liquid-glass|minimalist|high-end|design-|gsap|emil|stitch|slides|banner|ui-to-vue|ui-demo)/.test(n) ||
             /react|next\.js|vue 3|nuxt|tailwind|frontend pattern|css|ui design/i.test(d);
    }
  },
  {
    id: '05-databases-and-data',
    title: 'Databases, Caching, Analytical Stores & Data Pipelines',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(postgres|mysql|redis|clickhouse|bigquery|bigtable|dbt|dataform|gcp-data|data-autocleaning|federate-lakehouse|discovering-gcp|prisma-)/.test(n) ||
             /database|sql optimization|postgres|redis|clickhouse|bigquery|lakehouse/i.test(d);
    }
  },
  {
    id: '06-devops-and-infrastructure',
    title: 'DevOps, Cloud, CI/CD, Containerization & Networking',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(deploy|docker|kubernetes|ci-cd|network|cisco|homelab|uncloud|terminal|gcp-|google-cloud|flox)/.test(n) ||
             /docker|kubernetes|ci\/cd pipeline|bgp|cisco ios|devops|server deployment/i.test(d);
    }
  },
  {
    id: '04-backend-and-languages',
    title: 'Backend Systems & Polyglot Frameworks (Go, Rust, Python, Swift, Java, C#, PHP)',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(golang|rust|swift|kotlin|java|springboot|quarkus|dotnet|csharp|fsharp|cpp|perl|laravel|django|fastapi|python-|nodejs-|tinystruct|bun-)/.test(n) ||
             /django|fastapi|spring boot|laravel|golang|rust|swift concurrency|ktor|celery/i.test(d);
    }
  },
  {
    id: '10-instincts-and-memory',
    title: 'Continuous Learning, Memory Vault, Council & Instincts',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(instinct|council|evolve|memory|knowledge|unified-memory|cost-|token-|promote|prune|projects|skill-health|skill-scout|skill-stocktake|strategic-compact)/.test(n) ||
             /instinct|continuous-learning|memory vault|council|token budget|knowledge ops/i.test(d);
    }
  },
  {
    id: '09-content-ops-and-finance',
    title: 'Growth, Content Engine, SEO, Operations, Media & Finance',
    match: s => {
      const n = s.name.toLowerCase();
      const d = s.description.toLowerCase();
      return /^(content|seo|social|x-api|email|finance|customer|google-workspace|lead|investor|media|video|manim|fal-ai|tasteforge|remotion|crosspost|article|marketing|brand|messages-ops)/.test(n) ||
             /marketing|social media|investor|finance|billing ops|seo audit|video/i.test(d);
    }
  },
  {
    id: '02-architecture-and-design',
    title: 'Clean Architecture, API Design, System Patterns & Engineering Excellence',
    match: () => true // Catch-all for remaining architectural & design skills
  }
];

// Bucket skills into domains
const domainMap = new Map();
for (const def of domainDefs) {
  domainMap.set(def.id, { def, skills: [] });
}

for (const s of skills) {
  for (const def of domainDefs) {
    if (def.match(s)) {
      domainMap.get(def.id).skills.push(s);
      break;
    }
  }
}

// Generate references files
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

for (const target of [geminiTargetDir, claudeTargetDir]) {
  ensureDir(target);
  ensureDir(path.join(target, 'references'));
}

console.log('Writing reference guides for each domain...');

for (const [id, entry] of domainMap.entries()) {
  const { def, skills: domainSkills } = entry;
  domainSkills.sort((a, b) => a.name.localeCompare(b.name));
  
  let refContent = `# ${def.title}\n\n`;
  refContent += `**Domain ID:** \`${id}\` | **Total Skills Bundled:** ${domainSkills.length}\n\n`;
  refContent += `## Domain Index\n\n`;
  refContent += `| Skill Name | Purpose & Trigger Summary |\n`;
  refContent += `| :--- | :--- |\n`;
  
  for (const s of domainSkills) {
    refContent += `| **\`${s.name}\`** | ${s.description.slice(0, 140)}${s.description.length > 140 ? '...' : ''} |\n`;
  }
  
  refContent += `\n---\n\n## Detailed Skill Runbooks & Guidance\n\n`;
  
  for (const s of domainSkills) {
    refContent += `### \`${s.name}\`\n\n`;
    if (s.description) refContent += `> **Trigger / Use Case:** ${s.description}\n\n`;
    
    // Include a clean excerpt of the skill body (up to 40 lines)
    const bodyLines = s.body.split('\n').slice(0, 45);
    refContent += bodyLines.join('\n') + (s.body.split('\n').length > 45 ? '\n\n*(Full detailed documentation available in source plugin)*\n' : '\n');
    refContent += `\n---\n\n`;
  }

  for (const target of [geminiTargetDir, claudeTargetDir]) {
    fs.writeFileSync(path.join(target, 'references', `${id}.md`), refContent, 'utf8');
  }
}

// Write catalog-index.md
let catalogContent = `# ECC 387-Skill Universal Catalog\n\n`;
catalogContent += `Complete directory of all 387 skills bundled into this unified master skill.\n\n`;

for (const [id, entry] of domainMap.entries()) {
  const { def, skills: domainSkills } = entry;
  catalogContent += `## ${def.title} (${domainSkills.length} skills)\n\n`;
  catalogContent += `*Reference File:* [\`references/${id}.md\`](./${id}.md)\n\n`;
  for (const s of domainSkills) {
    catalogContent += `- **\`${s.name}\`**: ${s.description}\n`;
  }
  catalogContent += `\n`;
}

for (const target of [geminiTargetDir, claudeTargetDir]) {
  fs.writeFileSync(path.join(target, 'references', 'catalog-index.md'), catalogContent, 'utf8');
}

// Write the Master SKILL.md
let masterSkill = `---
name: ecc-skills
description: "Master Unified ECC Suite consolidating all 387 Enterprise Claude Code capabilities into one single summonable skill. Covers Autonomous Orchestration & Loops (/orch-*, /loop-*, /santa-loop, /gan-build), Clean Architecture & System Design, Full-Stack Frontend (React, Next.js, Vue, GSAP), Multi-Language Backends (Go, Rust, Python, Django, Swift, Kotlin, Java, C#, Laravel), Databases (Postgres, Redis, ClickHouse, BigQuery), Cloud & DevOps (Docker, K8s, CI/CD, Cisco), Security & Compliance (Audits, Bounty Hunting, HIPAA), Quality & Testing (TDD, Playwright E2E, Code Health), Growth & Content Ops (SEO, X/Twitter, Video, Finance), and Continuous Learning Instincts (/instinct-*, /council, /evolve, Memory Vault)."
---

# Enterprise Claude Code (ECC) — Master Unified Suite

A single, unified master skill uniting all **387 ECC skills** across 10 specialized domains. Solves context-budget truncation by consolidating all capabilities into one structured, indexed, and summonable architecture.

---

## Interactive Domain Selector

When this master skill is invoked without a specific sub-task, select the domain to route immediately:

1. **Autonomous Orchestration, Fleet & Loops** (\`01-orchestration-and-loops\`) — \`/orch-add-feature\`, \`/orch-fix-defect\`, \`/orch-refine-code\`, \`/loop-start\`, DevFleet, GAN harness
2. **Clean Architecture, API & System Design** (\`02-architecture-and-design\`) — API design, Hexagonal architecture, systematic debugging, ADRs
3. **Frontend, Modern Web & Motion** (\`03-frontend-and-ui\`) — React 19, Next.js, Vue 3, Nuxt 4, Vite, Liquid Glass, Tailwind, GSAP, Emil Kowalski polish
4. **Backend & Polyglot Languages** (\`04-backend-and-languages\`) — Go, Rust, Python (Django/FastAPI), Swift Concurrency, Kotlin/Android, Java/Spring Boot, C#/.NET, Laravel
5. **Databases, Caching & Data Pipelines** (\`05-databases-and-data\`) — PostgreSQL (Supabase patterns), Redis, ClickHouse, BigQuery, DBT, Dataform
6. **DevOps, Cloud, CI/CD & Networking** (\`06-devops-and-infrastructure\`) — Docker, Kubernetes, CI/CD, Cisco IOS, BGP diagnostics, Uncloud, Terminal Ops
7. **Security, Hardening & Compliance** (\`07-security-and-compliance\`) — Security reviews, Bounty hunting, HIPAA/PHI, Gateguard, DeFi/AMM security
8. **Testing, QA Automation & Code Health** (\`08-testing-and-code-health\`) — TDD, Playwright E2E, Vitest/Pytest, CodeScene health, Benchmarks, Verification loops
9. **Growth, SEO, Content & Operations** (\`09-content-ops-and-finance\`) — SEO audits, Content Engine, X/Twitter API, Video/Manim/Remotion, Billing/Finance ops
10. **Continuous Learning, Memory & Instincts** (\`10-instincts-and-memory\`) — \`/instinct-status\`, \`/promote\`, \`/evolve\`, \`/council\`, Unified Memory Vault

---

## 10-Domain Routing Matrix

| Domain | Key Skills & Slash Commands | Reference File |
| :--- | :--- | :--- |
| **1. Orchestration & Loops** | \`orch-add-feature\`, \`orch-fix-defect\`, \`orch-refine-code\`, \`continuous-agent-loop\`, \`claude-devfleet\`, \`gan-style-harness\`, \`dynamic-workflow-mode\` | [\`01-orchestration-and-loops.md\`](./references/01-orchestration-and-loops.md) |
| **2. Architecture & Design** | \`agentic-engineering\`, \`api-design\`, \`backend-patterns\`, \`clean-architecture\`, \`systematic-debugging\`, \`source-driven-development\` | [\`02-architecture-and-design.md\`](./references/02-architecture-and-design.md) |
| **3. Frontend & Motion** | \`react-patterns\`, \`frontend-patterns\`, \`nuxt4-patterns\`, \`vue-patterns\`, \`vite-patterns\`, \`liquid-glass-design\`, \`make-interfaces-feel-better\` | [\`03-frontend-and-ui.md\`](./references/03-frontend-and-ui.md) |
| **4. Backend & Languages** | \`golang-patterns\`, \`rust-patterns\`, \`python-patterns\`, \`django-patterns\`, \`fastapi-patterns\`, \`swiftui-patterns\`, \`kotlin-patterns\`, \`laravel-patterns\` | [\`04-backend-and-languages.md\`](./references/04-backend-and-languages.md) |
| **5. Databases & Data** | \`postgres-patterns\`, \`redis-patterns\`, \`clickhouse-io\`, \`bigquery-sql\`, \`bigquery-graph\`, \`data-autocleaning\`, \`prisma-patterns\` | [\`05-databases-and-data.md\`](./references/05-databases-and-data.md) |
| **6. DevOps & Infrastructure** | \`deployment-patterns\`, \`ci-cd-and-automation\`, \`kubernetes-patterns\`, \`docker-patterns\`, \`cisco-ios-patterns\`, \`network-bgp-diagnostics\`, \`uncloud\` | [\`06-devops-and-infrastructure.md\`](./references/06-devops-and-infrastructure.md) |
| **7. Security & Compliance** | \`security-review\`, \`security-bounty-hunter\`, \`hipaa-compliance\`, \`django-security\`, \`laravel-security\`, \`prediction-market-risk-review\` | [\`07-security-and-compliance.md\`](./references/07-security-and-compliance.md) |
| **8. Testing & Code Health** | \`test-driven-development\`, \`e2e-testing\`, \`codehealth-mcp\`, \`plankton-code-quality\`, \`verification-before-completion\`, \`benchmark-methodology\` | [\`08-testing-and-code-health.md\`](./references/08-testing-and-code-health.md) |
| **9. Content, Ops & Finance** | \`content-engine\`, \`seo\`, \`x-api\`, \`finance-billing-ops\`, \`customer-billing-ops\`, \`google-workspace-ops\`, \`remotion-video-creation\` | [\`09-content-ops-and-finance.md\`](./references/09-content-ops-and-finance.md) |
| **10. Instincts & Memory** | \`instinct-status\`, \`promote\`, \`evolve\`, \`prune\`, \`council\`, \`unified-memory\`, \`knowledge-ops\`, \`cost-tracking\` | [\`10-instincts-and-memory.md\`](./references/10-instincts-and-memory.md) |

Full alphabetized catalog: [\`references/catalog-index.md\`](./references/catalog-index.md)

---

## Universal Execution Rules

1. **Evidence-First Verification**: Every change must be verified with concrete tool output (terminal test execution, build logs, or HTTP checks) before claiming completion.
2. **Strict Design & Code Craft**: Zero raw hex in styled components, zero generic AI placeholders, high typographic contrast, and robust error handling.
3. **Resilient Persistence**: External APIs and database connections must be wrapped with automatic retries and in-memory fallbacks for offline test runner stability.
4. **Context Conservation**: Consult the domain reference markdown files on demand rather than loading all sub-skills at once.
`;

for (const target of [geminiTargetDir, claudeTargetDir]) {
  fs.writeFileSync(path.join(target, 'SKILL.md'), masterSkill, 'utf8');
}

console.log('Master SKILL.md and all references written successfully to:');
console.log(' -', geminiTargetDir);
console.log(' -', claudeTargetDir);
