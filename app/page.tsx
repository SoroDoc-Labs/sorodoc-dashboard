"use client";

import { useState } from "react";
import {
  extractSpecFromWasm,
  generateMarkdown,
  generateTypeScript,
  generateOpenApi,
  ContractSpecAST,
} from "@sorodoc/sdk";

export default function Home() {
  const [ast, setAst] = useState<ContractSpecAST | null>(null);
  const [contractName, setContractName] = useState<string>("Contract");
  const [activeTab, setActiveTab] = useState<"markdown" | "typescript" | "openapi">("markdown");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [contractIdInput, setContractIdInput] = useState<string>("");
  const [rpcUrlInput, setRpcUrlInput] = useState<string>("https://soroban-testnet.stellar.org");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setContractName(file.name.replace(/\.wasm$/i, ""));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extractedAst = extractSpecFromWasm(buffer);
      setAst(extractedAst);
    } catch (err) {
      setError((err as Error).message || "Failed to parse WASM contract specification");
      setAst(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRpcLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractIdInput.trim()) return;

    setError(null);
    setIsProcessing(true);
    setContractName(contractIdInput.slice(0, 8));

    try {
      // Dynamically load fetchSpecFromRpc to ensure browser-safe execution
      const { fetchSpecFromRpc } = await import("@sorodoc/sdk");
      const extractedAst = await fetchSpecFromRpc({
        rpcUrl: rpcUrlInput.trim(),
        contractId: contractIdInput.trim(),
      });
      setAst(extractedAst);
    } catch (err) {
      setError((err as Error).message || "Failed to retrieve contract specification via RPC");
      setAst(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputText = () => {
    if (!ast) return "";
    switch (activeTab) {
      case "markdown":
        return generateMarkdown(ast, { contractName });
      case "typescript":
        return generateTypeScript(ast, `${contractName}Client`);
      case "openapi":
        return JSON.stringify(generateOpenApi(ast, { title: `${contractName} API` }), null, 2);
    }
  };

  const handleDownload = () => {
    const text = getOutputText();
    const ext = activeTab === "markdown" ? "md" : activeTab === "typescript" ? "ts" : "json";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${contractName}_spec.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          Soro<span className="text-indigo-400">Doc</span> Dashboard
        </h1>
        <p className="text-slate-400 text-lg">
          Extract accurate documentation, TypeScript definitions, and OpenAPI specs from Stellar Soroban contracts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* WASM File Upload Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Inspect Local WASM</h2>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Upload a compiled Soroban <code className="text-indigo-300">.wasm</code> binary to extract and explore its embedded interface specification.
            </p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow w-full text-center">
              <span>{isProcessing ? "Processing..." : "Select WASM File"}</span>
              <input
                type="file"
                accept=".wasm"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </div>
        </section>

        {/* Soroban RPC Direct Lookup */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-200">RPC Contract Lookup</h2>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Query a live Soroban RPC node by contract address to retrieve on-chain bytecode specs.
            </p>
          </div>
          <form onSubmit={handleRpcLookup} className="space-y-3">
            <input
              type="text"
              placeholder="Contract Address (e.g. C...)"
              value={contractIdInput}
              onChange={(e) => setContractIdInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="RPC URL (default: testnet)"
              value={rpcUrlInput}
              onChange={(e) => setRpcUrlInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-400 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !contractIdInput.trim()}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow"
            >
              {isProcessing ? "Fetching..." : "Fetch Contract Spec"}
            </button>
          </form>
        </section>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-sm">
          <strong className="font-semibold">Error: </strong>
          {error}
        </div>
      )}

      {ast && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button
              onClick={() => setActiveTab("markdown")}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "markdown"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Markdown Documentation
            </button>
            <button
              onClick={() => setActiveTab("typescript")}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "typescript"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              TypeScript Client
            </button>
            <button
              onClick={() => setActiveTab("openapi")}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "openapi"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              OpenAPI 3.0 Schema
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                {ast.functions.length} Function(s) · {ast.structs.length} Struct(s) · {ast.enums.length} Enum(s)
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(getOutputText())}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleDownload}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Download File
                </button>
              </div>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-slate-200 font-mono border border-slate-800 whitespace-pre-wrap">
              {getOutputText()}
            </pre>
          </div>
        </section>
      )}
    </main>
  );
}
