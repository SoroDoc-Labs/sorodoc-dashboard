# sorodoc-dashboard

Web interface for the **SoroDoc** ecosystem. Inspect Soroban contracts, parse specifications from local WASM files, and view generated documentation, TypeScript client interfaces, and OpenAPI 3.0 schemas.

## Features

- **Read-only Contract Exploration:** Inspect functions, parameters, return types, structs, enums, unions, and error definitions.
- **Local WASM Upload:** Upload any compiled `.wasm` file to parse its specification in real time.
- **Multiple Output Views:** Switch seamlessly between:
  - Markdown Documentation
  - TypeScript Client Interface
  - OpenAPI 3.0 Schema
  - Normalized AST (JSON)
- **Soroban RPC Lookup:** Retrieve on-chain contract code directly via Soroban RPC endpoints without wallet requirements.
- **Download & Copy:** Quick export of `.md`, `.ts`, and `.json` outputs.

## Getting Started

The dashboard consumes the published `@sorodoc/sdk` from npm:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture & Integration

- **SDK as Single Source of Truth:** The dashboard imports `@sorodoc/sdk` for parsing WASM specifications and generating Markdown, TypeScript interfaces, and OpenAPI schemas. No parsing or code generation logic is duplicated in the dashboard.
- **Read-Only Model:** SoroDoc Dashboard is strictly an exploration and documentation engine. It does not store keys, sign transactions, or require wallet connections.
- **RPC Contract Retrieval:** Direct read-only ledger queries to Soroban RPC endpoints to fetch contract code and parse on-chain specifications.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
```

## License

MIT
