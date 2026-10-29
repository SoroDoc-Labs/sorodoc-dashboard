# sorodoc-dashboard

Web interface for the **SoroDoc** ecosystem. Inspect Soroban contracts, parse specifications from local WASM files, and view generated documentation, TypeScript client interfaces, and OpenAPI 3.0 schemas.

## Features

- **Read-only Contract Exploration:** Inspect functions, parameters, return types, structs, enums, unions, and error definitions.
- **Local WASM Upload:** Upload any compiled `.wasm` file to parse its specification in real time.
- **Multiple Output Views:** Switch seamlessly between:
  - Markdown Documentation
  - TypeScript Client Interface
  - OpenAPI 3.0 Schema
- **Copy-to-Clipboard:** Quick export for developer workflows.

## Getting Started

```bash
# 1. Ensure sorodoc-sdk is built
cd ../sorodoc-sdk
npm install
npm run build

# 2. Run dashboard
cd ../sorodoc-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
```

## License

MIT
