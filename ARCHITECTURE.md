# Architecture — sorodoc-dashboard

`sorodoc-dashboard` is the web-based contract explorer and documentation viewer for the **SoroDoc** ecosystem. Built with Next.js App Router and React, it provides an interactive visual interface for uploading Soroban contracts or querying contracts on-chain.

---

## 1. System Role & Ecosystem Alignment

```
                         ┌─────────────────────┐
                         │   Web User / Dev    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  sorodoc-dashboard  │
                         │ (Next.js App Router)│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    @sorodoc/sdk     │
                         │  (Published Engine) │
                         └──────────┬──────────┘
                                    │
                       ┌────────────┴────────────┐
                       ▼                         ▼
            ┌─────────────────────┐   ┌──────────────────────┐
            │  WASM Spec Parsing  │   │  Soroban RPC Client  │
            │  & Code Generators  │   │  Ledger Code Query   │
            └─────────────────────┘   └──────────────────────┘
```

### Architectural Tenets
1. **Delegation to SDK:** All contract specification parsing, normalization, Markdown generation, TypeScript formatting, and OpenAPI mapping are delegated to `@sorodoc/sdk`. The Dashboard is purely an interface layer.
2. **Read-Only Explorer:** The Dashboard does not hold cryptographic private keys, does not sign transactions, and does not submit contract calls to the Stellar network.
3. **Responsive Client Architecture:** Interactive tabs and instant code generation allow developers to switch seamlessly between Markdown, TypeScript, and OpenAPI views without page reloads.

---

## 2. Component & Flow Architecture

```
app/
├── layout.tsx         # Root HTML layout and metadata
├── page.tsx           # Main interactive contract documentation explorer
└── globals.css        # Tailwind styling & dark-theme design tokens
```

### Key Workflows in `app/page.tsx`

#### 1. Local WASM Upload Flow
1. User drops or selects a `.wasm` file via the file input.
2. The browser validates file constraints:
   - Size > 0 bytes (rejects empty files).
   - Size <= 15MB (protects against browser memory exhaustion).
3. The file is read into a `Buffer` / `Uint8Array`.
4. `@sorodoc/sdk`'s `extractSpecFromWasm` parses the embedded `contractspecv0` custom section and returns the normalized `ContractSpecAST`.
5. The AST is stored in React state, and the active view tab renders the formatted result.

#### 2. On-Chain RPC Retrieval Flow
1. User enters a Soroban RPC URL (default: `https://soroban-testnet.stellar.org`) and a 56-character Contract ID (`C...`).
2. The dashboard dynamically invokes `@sorodoc/sdk`'s `fetchSpecFromRpc`:
   - Queries the contract instance persistent ledger entry.
   - Verifies the contract executable is a WASM contract (rejecting native Stellar Asset contracts with clear messaging).
   - Retrieves the WASM code entry corresponding to the WASM hash.
   - Extracts and normalizes the embedded specification AST.
3. The normalized AST is rendered across all output views.

#### 3. Output Generation & Export
- **Markdown:** `generateMarkdown(ast, { contractName })`
- **TypeScript:** `generateTypeScript(ast, `${contractName}Client`)`
- **OpenAPI:** `generateOpenApi(ast, { title: `${contractName} API` })`
- **JSON:** Pretty-printed `ContractSpecAST`
- **Export:** Users can copy output directly to their clipboard or download the respective `.md`, `.ts`, or `.json` file.

---

## 3. Security & Reliability Model

- **File Upload Safeguards:** 15MB hard ceiling on client-side buffer allocations.
- **Fail-Safe RPC Handling:** Network errors, invalid contract addresses, missing ledger entries, and non-WASM contracts are caught and displayed as clear, non-technical alert banners.
- **Transpile Packages:** Configured in `next.config.ts` via `transpilePackages: ["@sorodoc/sdk"]` to ensure seamless ES module compatibility with Next.js webpack bundling.
