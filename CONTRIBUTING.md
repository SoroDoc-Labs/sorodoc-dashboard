# Contributing to sorodoc-dashboard

Thank you for your interest in contributing to **SoroDoc Dashboard**! We welcome bug fixes, UI/UX polish, accessibility enhancements, responsive improvements, and test coverage additions.

`sorodoc-dashboard` is the web interface for the [SoroDoc Ecosystem](https://github.com/SoroDoc-Labs). It allows developers to upload compiled Soroban WASM binaries or query on-chain contracts via Soroban RPC to interactively inspect specifications, explore Markdown docs, view TypeScript interfaces, and download OpenAPI 3.0 schemas.

---

## Prerequisites

- **Node.js**: `>= 20.0.0` (Active LTS versions 20.x, 22.x, or 24.x)
- **npm**: `>= 10.0.0`
- **Git**: `>= 2.30.0`

Verify your setup:
```bash
node -v
npm -v
git --version
```

---

## Quickstart Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SoroDoc-Labs/sorodoc-dashboard.git
   cd sorodoc-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```
   *Note: `@sorodoc/sdk` is installed automatically from the public npm registry.*

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

4. **Verify tests and build:**
   ```bash
   npm test
   npm run typecheck
   npm run build
   ```

---

## Available Development Scripts

All scripts are defined in `package.json`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server with Turbopack/Fast Refresh at `localhost:3000`. |
| `npm run build` | Compiles an optimized production build of the Next.js application. |
| `npm run start` | Runs the compiled Next.js production server locally. |
| `npm run typecheck` | Validates static TypeScript typing using `tsc --noEmit`. |
| `npm test` | Runs the test suite once with Vitest and `@testing-library/react`. |
| `npm run test:watch` | Runs Vitest in interactive watch mode for component TDD. |

---

## Architectural Boundaries & Responsibility

`sorodoc-dashboard` is an interactive frontend explorer built with Next.js App Router and React.

### Key Architectural Guidelines
1. **Never Duplicate SDK Logic:** The browser application does not contain custom WebAssembly section scanning or documentation formatting logic. It directly imports `@sorodoc/sdk` (`extractSpecFromWasm`, `generateMarkdown`, `generateTypeScript`, `generateOpenApi`, `fetchSpecFromRpc`).
2. **Read-Only Inspection:** SoroDoc Dashboard is strictly an explorer. It does not contain transaction signing, wallet key generation, or secret key storage.
3. **Upload Security Limits:** User uploads are restricted to `.wasm` files under 15MB. Empty files (0 bytes) are rejected with user-friendly error banners.
4. **RPC Safety:** Contract RPC fetching uses `@sorodoc/sdk`'s `fetchSpecFromRpc` to query ledger state safely without exposing RPC authentication credentials.

For deeper architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Git Workflow & Contribution Process

1. **Find or Open an Issue:**
   Browse [Dashboard open issues](https://github.com/SoroDoc-Labs/sorodoc-dashboard/issues). Issues labeled [`good first issue`](https://github.com/SoroDoc-Labs/sorodoc-dashboard/labels/good%20first%20issue), [`accessibility`](https://github.com/SoroDoc-Labs/sorodoc-dashboard/labels/accessibility), or [`beginner`](https://github.com/SoroDoc-Labs/sorodoc-dashboard/labels/beginner) are ideal for new contributors.

2. **Create a Feature Branch:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

3. **Commit Messages:**
   Use Conventional Commits:
   ```text
   feat(ui): add search filter for contract functions
   fix(a11y): add aria labels and keyboard focus to output tabs
   test(dashboard): add regression test for RPC failure handling
   ```

4. **Local Verification Checklist:**
   Before opening a PR, ensure all quality gates pass:
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

5. **Submit a Pull Request:**
   - Push your branch: `git push origin feat/your-feature-name`.
   - Open a PR against `main`. Fill in the PR description completely.
   - GitHub Actions CI will automatically test and verify your build.

---

## Reporting Issues & Security

- **Bug Reports & Features:** Submit using our GitHub issue templates.
- **Security Vulnerabilities:** Follow the private reporting process outlined in [SECURITY.md](./SECURITY.md).

---

## Code of Conduct

Please adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) in all interactions.
