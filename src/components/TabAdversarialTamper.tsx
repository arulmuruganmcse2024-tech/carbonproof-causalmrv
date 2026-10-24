"use client";

import React, { useState, useEffect } from "react";
import { PANEL_CSV_SHA256, SECURITY_REVERTS } from "@/lib/constants";
import { computeSha256Hex } from "@/lib/scmEngine";
import { SecurityRevertScenario } from "@/lib/types";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldAlert,
  Hash,
  Cpu,
} from "lucide-react";

export function TabAdversarialTamper() {
  // 1-Byte Tamper Sandbox State
  const defaultCsvSnippet =
    "year,entity_id,entity_type,tree_cover_loss_kha,glad_alerts_count\n2001,kariba_vcs902,project,27.1835,4131\n2002,kariba_vcs902,project,28.0482,4263\n2003,kariba_vcs902,project,27.1716,4130";

  const [csvContent, setCsvContent] = useState<string>(defaultCsvSnippet);
  const [computedSha256, setComputedSha256] = useState<string>(PANEL_CSV_SHA256);
  const [isTampered, setIsTampered] = useState<boolean>(false);

  // Selected Revert Scenario State
  const [selectedScenario, setSelectedScenario] = useState<SecurityRevertScenario>(SECURITY_REVERTS[0]);
  const [revertExecutionResult, setRevertExecutionResult] = useState<{
    reverted: boolean;
    errorName: string;
    gasUsed: number;
    log: string;
  } | null>(null);

  // Compute live SHA-256 on character change
  useEffect(() => {
    let isCancelled = false;
    computeSha256Hex(csvContent).then((hash) => {
      if (!isCancelled) {
        setComputedSha256(hash);
        setIsTampered(hash.toLowerCase() !== PANEL_CSV_SHA256.toLowerCase());
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [csvContent]);

  // Execute Revert Attack Simulation
  const handleSimulateAttack = (scenario: SecurityRevertScenario) => {
    setSelectedScenario(scenario);
    setRevertExecutionResult({
      reverted: true,
      errorName: scenario.solidityError,
      gasUsed: scenario.gasEstimated,
      log: `[EVM REVERT] Transaction reverted with custom error ${scenario.solidityError}. Call frame terminated. State reverted. Gas refunded.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: IEEE Climate Cybersecurity Context */}
      <div className="glass-panel-danger rounded-xl p-5 border border-rose-500/40 space-y-2">
        <div className="flex items-center space-x-2 text-rose-400 font-mono text-sm font-bold uppercase tracking-wider">
          <ShieldAlert className="h-5 w-5" />
          <span>Adversarial Attack Surface & 1-Byte Tamper Verification Plane</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Aligned with IEEE ClimateChain Session 2 (Data Integrity & Oracle Security). Demonstrates how CarbonProof guarantees zero phantom credit issuance by enforcing cryptographic hash commitments and 6 explicit Solidity custom error gates in <code className="text-rose-300 font-mono">CarbonProofVault.sol</code>.
        </p>
      </div>

      {/* 1-Byte Tamper Live Sandbox */}
      <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Hash className="h-4 w-4 text-cyan-400" />
              <span>Interactive 1-Byte CSV Cryptographic Tamper Test</span>
            </h3>
            <p className="text-xs text-slate-400">
              Type or alter any character in the raw CSV snippet below. Watch the live Web Crypto SHA-256 immediately diverge from the contract&apos;s locked hash.
            </p>
          </div>

          <button
            onClick={() => setCsvContent(defaultCsvSnippet)}
            className="px-3 py-1 text-xs rounded bg-carbon-800 hover:bg-carbon-700 text-slate-300 font-mono border border-carbon-700 transition-colors self-start sm:self-auto"
          >
            Reset to Authentic CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Editable Textarea */}
          <div className="lg:col-span-7 space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Raw Panel CSV Buffer (825 rows preview):</span>
              <span className="text-[10px] text-cyan-400">Live Web Crypto Hash Engine</span>
            </label>
            <textarea
              rows={5}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full bg-carbon-950 font-mono text-xs text-slate-200 p-3 rounded-lg border border-carbon-700 focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Hash Comparison & Verification Result */}
          <div className="lg:col-span-5 bg-carbon-900/80 rounded-lg p-3.5 border border-carbon-700 space-y-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Locked Expected Hash (artifacts.json & Vault):</div>
              <div className="text-[11px] text-emerald-400 break-all font-bold mt-0.5">
                {PANEL_CSV_SHA256}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">Computed Hash (Current Buffer):</div>
              <div className={`text-[11px] break-all font-bold mt-0.5 ${isTampered ? "text-rose-400" : "text-emerald-400"}`}>
                {computedSha256}
              </div>
            </div>

            <div
              className={`p-2.5 rounded border text-xs font-bold flex items-center space-x-2 ${
                isTampered
                  ? "bg-rose-950/60 border-rose-500/50 text-rose-300"
                  : "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
              }`}
            >
              {isTampered ? (
                <>
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>TAMPER DETECTED: submitCausalAudit() will REVERT with TamperedDatasetHash()</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>AUTHENTIC DATASET: Cryptographic Hash Verified (Match 100%)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Enforced Security Revert Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenarios List */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="h-4 w-4 text-rose-400" />
            <span>6 Enforced Smart Contract Security Reverts</span>
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Click any attack scenario to execute the simulated EVM transaction and inspect the gas trace and Solidity custom error.
          </p>

          <div className="space-y-2">
            {SECURITY_REVERTS.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleSimulateAttack(sc)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-carbon-900 border-rose-500/60 shadow-md shadow-rose-950/30"
                      : "bg-carbon-950/60 border-carbon-800 hover:border-carbon-700 hover:bg-carbon-900/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-carbon-800 font-mono text-cyan-400 font-bold">
                          {sc.id}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{sc.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-sans">{sc.triggerDescription}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300 font-mono shrink-0">
                      REVERTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revert Execution Terminal & Trace */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>EVM Revert Trace Inspector</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Selector: {selectedScenario.signature}</span>
            </div>

            <div className="bg-carbon-950 rounded-lg p-3.5 border border-carbon-800 space-y-2 text-xs font-mono">
              <div className="text-slate-400 text-[10px]">Target Contract Error:</div>
              <div className="text-rose-400 font-bold break-all">{selectedScenario.solidityError}</div>

              <div className="pt-2 border-t border-carbon-800/80">
                <div className="text-slate-400 text-[10px]">Attack Category:</div>
                <div className="text-cyan-400">{selectedScenario.category}</div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px]">Expected Enforcement:</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">{selectedScenario.expectedBehavior}</div>
              </div>

              <div>
                <div className="text-slate-400 text-[10px]">Gas Consumed Before Revert:</div>
                <div className="text-amber-400">{selectedScenario.gasEstimated.toLocaleString()} units</div>
              </div>
            </div>

            {revertExecutionResult && (
              <div className="bg-rose-950/40 border border-rose-600/50 rounded-lg p-3 text-xs font-mono text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>TRANSACTION EXECUTION REVERTED</span>
                </div>
                <div className="text-[11px] text-rose-200/90 leading-relaxed">
                  {revertExecutionResult.log}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSimulateAttack(selectedScenario)}
            className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-rose-950/40 flex items-center justify-center space-x-2"
          >
            <Flame className="h-4 w-4" />
            <span>Trigger {selectedScenario.id} Security Revert Attack</span>
          </button>
        </div>
      </div>
    </div>
  );
}
