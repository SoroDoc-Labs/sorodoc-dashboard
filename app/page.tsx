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

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Inspect Local Contract WASM</h2>
            <p className="text-slate-400 text-sm mt-1">
              Upload a compiled Soroban <code className="text-indigo-300">.wasm</code> file to extract its embedded specification.
            </p>
          </div>
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow">
            <span>{isProcessing ? "Reading..." : "Select WASM File"}</span>
            <input
              type="file"
              accept=".wasm"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-sm">
            <strong className="font-semibold">Error: </strong>
            {error}
          </div>
        )}
      </section>

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
              <button
                onClick={() => navigator.clipboard.writeText(getOutputText())}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Copy to Clipboard
              </button>
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
