import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "./setup.js";
import Home from "../app/page.js";
import * as SoroDocSdk from "@sorodoc/sdk";

function encodeLeb128(n: number): Buffer {
  const bytes: number[] = [];
  do {
    let byte = n & 0x7f;
    n >>>= 7;
    if (n !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (n !== 0);
  return Buffer.from(bytes);
}

function buildValidMockWasm(): Uint8Array {
  const specBytes = Buffer.from([0,0,0,0,0,0,0,2,102,110,0,0,0,0,0,2,102,110,0,0,0,0,0,0,0,0,0,0]);
  const nameBuf = Buffer.from("contractspecv0");
  const secNameLen = encodeLeb128(nameBuf.length);
  const secContent = Buffer.concat([secNameLen, nameBuf, specBytes]);
  const secLen = encodeLeb128(secContent.length);

  const wasm = Buffer.concat([
    Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]),
    Buffer.from([0x00]),
    secLen,
    secContent,
  ]);
  return new Uint8Array(wasm);
}

describe("Dashboard Interactive QA Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders accessible controls for WASM file selection and RPC lookup", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Inspect Local WASM/i)).toBeInTheDocument();
    expect(screen.getByText(/RPC Contract Lookup/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contract Address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fetch Contract Spec/i })).toBeInTheDocument();
  });

  it("handles valid WASM file upload and renders specification tabs", async () => {
    render(<Home />);
    const fileBytes = buildValidMockWasm();
    const file = new File([fileBytes], "test_token.wasm", { type: "application/wasm" });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Markdown Documentation/i)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript Client/i)).toBeInTheDocument();
      expect(screen.getByText(/OpenAPI 3.0 Schema/i)).toBeInTheDocument();
      expect(screen.getByText(/Normalized AST \(JSON\)/i)).toBeInTheDocument();
    });
  });

  it("switches tabs smoothly between Markdown, TypeScript, OpenAPI, and JSON AST", async () => {
    render(<Home />);
    const file = new File([buildValidMockWasm()], "test_contract.wasm", { type: "application/wasm" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Markdown Documentation/i)).toBeInTheDocument();
    });

    // Switch to TypeScript tab
    fireEvent.click(screen.getByText(/TypeScript Client/i));
    await waitFor(() => {
      expect(screen.getByText(/export interface/i)).toBeInTheDocument();
    });

    // Switch to OpenAPI tab
    fireEvent.click(screen.getByText(/OpenAPI 3.0 Schema/i));
    await waitFor(() => {
      expect(screen.getByText(/"openapi": "3.0.3"/i)).toBeInTheDocument();
    });

    // Switch to JSON AST tab
    fireEvent.click(screen.getByText(/Normalized AST \(JSON\)/i));
    await waitFor(() => {
      expect(screen.getByText(/"functions":/i)).toBeInTheDocument();
    });
  });

  it("displays meaningful error when uploading malformed WASM binary", async () => {
    render(<Home />);
    const corruptBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const file = new File([corruptBytes], "corrupt.wasm", { type: "application/wasm" });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Malformed WASM/i)).toBeInTheDocument();
    });
  });

  it("handles copy-to-clipboard action gracefully", async () => {
    render(<Home />);
    const file = new File([buildValidMockWasm()], "contract.wasm", { type: "application/wasm" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Copy to Clipboard/i)).toBeInTheDocument();
    });

    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextSpy },
    });

    fireEvent.click(screen.getByText(/Copy to Clipboard/i));
    expect(writeTextSpy).toHaveBeenCalled();
  });

  it("handles file download action without crashing", async () => {
    render(<Home />);
    const file = new File([buildValidMockWasm()], "contract.wasm", { type: "application/wasm" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Download File/i)).toBeInTheDocument();
    });

    const createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi.fn();
    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    fireEvent.click(screen.getByText(/Download File/i));
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it("displays helpful error feedback when RPC lookup fails", async () => {
    render(<Home />);
    const contractInput = screen.getByPlaceholderText(/Contract Address/i);
    fireEvent.change(contractInput, { target: { value: "INVALID_CONTRACT_ID" } });

    const submitBtn = screen.getByRole("button", { name: /Fetch Contract Spec/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/RPC Fetch Failure/i)).toBeInTheDocument();
    });
  });
});
