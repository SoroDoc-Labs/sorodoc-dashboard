import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  extractSpecFromWasm,
  generateMarkdown,
  generateTypeScript,
  generateOpenApi,
  validateContractSpec,
  ContractSpecAST,
} from "@sorodoc/sdk";

const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

describe("Workstream 3 & 9: Cross-Interface Semantic Parity", () => {
  const fixtures = ["custom_types.wasm", "errors.wasm", "increment.wasm"];

  it.each(fixtures)("verifies identical semantic outputs for fixture %s across SDK, CLI, and Dashboard modes", (fixtureName) => {
    const fixturePath = path.join(FIXTURES_DIR, fixtureName);
    expect(fs.existsSync(fixturePath)).toBe(true);

    const wasmBytes = fs.readFileSync(fixturePath);
    const contractName = path.basename(fixtureName, ".wasm");

    // 1. Core SDK Extraction
    const ast: ContractSpecAST = extractSpecFromWasm(wasmBytes);
    expect(ast).toBeDefined();
    expect(ast.functions.length).toBeGreaterThan(0);

    // 2. Direct SDK Generation
    const sdkMarkdown = generateMarkdown(ast, { contractName });
    const sdkTypeScript = generateTypeScript(ast, `${contractName}Client`);
    const sdkOpenApi = generateOpenApi(ast, { title: `${contractName} API` });
    const sdkValidation = validateContractSpec(ast);

    // 3. Emulated Dashboard Extraction (exact same client calls as Dashboard page.tsx)
    const dashboardBuffer = Buffer.from(wasmBytes.buffer, wasmBytes.byteOffset, wasmBytes.byteLength);
    const dashboardAst = extractSpecFromWasm(dashboardBuffer);
    const dashboardMarkdown = generateMarkdown(dashboardAst, { contractName });
    const dashboardTypeScript = generateTypeScript(dashboardAst, `${contractName}Client`);
    const dashboardOpenApi = generateOpenApi(dashboardAst, { title: `${contractName} API` });

    // Verify Semantic Parity between SDK and Dashboard
    expect(dashboardAst).toEqual(ast);
    expect(dashboardMarkdown).toBe(sdkMarkdown);
    expect(dashboardTypeScript).toBe(sdkTypeScript);
    expect(dashboardOpenApi).toEqual(sdkOpenApi);

    // 4. Validate Specification Integrity
    expect(sdkValidation.valid).toBe(true);
    expect(sdkValidation.stats.functionCount).toBe(ast.functions.length);
    expect(sdkValidation.stats.structCount).toBe(ast.structs.length);
  });
});
