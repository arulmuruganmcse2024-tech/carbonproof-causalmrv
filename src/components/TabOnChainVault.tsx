"use client";

import React, { useState } from "react";
import { CaseStudyMeta } from "@/lib/types";
import { PANEL_CSV_SHA256, VAULT_CONTRACT_ADDRESS } from "@/lib/constants";
import { ClientVaultStateMachine } from "@/lib/scmEngine";
import {
  ShieldCheck,
  Clock,
  Flame,
  Send,
  FastForward,
  Award,
  CheckCircle2,
  AlertOctagon,
  FileCode2,
  History,
  Lock,
} from "lucide-react";

interface TabOnChainVaultProps {
  caseStudy: CaseStudyMeta;
}

export function TabOnChainVault({ caseStudy }: TabOnChainVaultProps) {
  // Initialize state machine mirror
  const [vaultSM, setVaultSM] = useState(() => new ClientVaultStateMachine(caseStudy));
  const [activeMessage, setActiveMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [retireSuccessCert, setRetireSuccessCert] = useState<{ amount: number; causalTonnes: number; certId: string } | null>(null);

  const state = vaultSM.state;

  // Action 1: Submit Signed EIP-712 Causal Audit
  const handleAuditSubmit = () => {
    const payload = {
      projectId: state.projectId,
      epoch: state.currentEpoch + 1,
      issuedVCUs: caseStudy.issuedVCUs,
      verifiedVCUs: caseStudy.verifiedVCUs,
      excessVCUs: caseStudy.excessVCUs,
      retiredExcessVCUs: caseStudy.retiredExcessVCUs,
      activeExcessVCUs: caseStudy.activeExcessVCUs,
      empiricalPValueBps: caseStudy.pValBps,
      spatialLeakagePenaltyBps: caseStudy.leakageBps,
      panelCsvSha256: PANEL_CSV_SHA256,
    };

    const res = vaultSM.submitCausalAudit(payload, "ORACLE_AUDITOR");
    if (res.success) {
      setActiveMessage({
        type: "success",
        text: `EIP-712 Audit settled! Slashed ${Math.min(caseStudy.excessVCUs, caseStudy.initialBufferVCUs).toLocaleString()} buffer tokens. Backing ratio rebased to ${caseStudy.backingRatioBps} bps (${(caseStudy.backingRatioBps / 100).toFixed(2)}%). Status: REBASED_SETTLED.`,
      });
      setVaultSM(Object.assign(Object.create(Object.getPrototypeOf(vaultSM)), vaultSM));
    } else {
      setActiveMessage({ type: "error", text: res.error || "Audit submission failed." });
    }
  };

  // Action 2: Fast-forward EVM Clock & markOverdue
  const handleMarkOverdue = () => {
    const res = vaultSM.fastForwardAndMarkOverdue();
    if (res.success) {
      setActiveMessage({
        type: "error",
        text: `SLA Deadline expired! Project ${state.projectId} transitioned to OVERDUE_FROZEN. Secondary market transfers are now blocked by the ERC1155 _update hook.`,
      });
      setVaultSM(Object.assign(Object.create(Object.getPrototypeOf(vaultSM)), vaultSM));
    }
  };

  // Action 3: Transfer / Retire 10,000 Verified VCUs
  const handleRetireTokens = () => {
    const transferAmount = 10000;
    const res = vaultSM.transferVerifiedTokens(transferAmount);

    if (res.success) {
      const causalTonnes = (transferAmount * state.backingRatioBps) / 10000;
      setRetireSuccessCert({
        amount: transferAmount,
        causalTonnes,
        certId: "CP-CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      });
      setActiveMessage({
        type: "success",
        text: `Successfully retired ${transferAmount.toLocaleString()} tokens! Delivered ${causalTonnes.toLocaleString()} real causal tonnes at ${state.backingRatioBps} bps backing.`,
      });
      setVaultSM(Object.assign(Object.create(Object.getPrototypeOf(vaultSM)), vaultSM));
    } else {
      setActiveMessage({
        type: "error",
        text: `Transaction Reverted: ${res.error}. Tokens cannot be transferred or retired while project is frozen!`,
      });
      setRetireSuccessCert(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {activeMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-start space-x-3 transition-all ${
            activeMessage.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
              : activeMessage.type === "error"
              ? "bg-rose-950/70 border-rose-500/50 text-rose-300"
              : "bg-cyan-950/70 border-cyan-500/50 text-cyan-300"
          }`}
        >
          {activeMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider">
              {activeMessage.type === "success" ? "EVM Transaction Confirmed" : "On-Chain Execution Notification"}
            </div>
            <div>{activeMessage.text}</div>
          </div>
        </div>
      )}

      {/* Retirement Certificate Popup */}
      {retireSuccessCert && (
        <div className="glass-panel-glow rounded-xl p-5 border border-emerald-500/50 bg-emerald-950/30 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-bold font-mono text-white">
                Causal-Adjusted Carbon Retirement Certificate
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded">
              {retireSuccessCert.certId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
            <div className="bg-carbon-900/80 p-2.5 rounded border border-carbon-700">
              <div className="text-slate-400 text-[10px]">Nominal Units Burned</div>
              <div className="text-sm font-bold text-slate-100">{retireSuccessCert.amount.toLocaleString()} VCUs</div>
            </div>
            <div className="bg-carbon-900/80 p-2.5 rounded border border-carbon-700">
              <div className="text-slate-400 text-[10px]">Causal Backing Ratio</div>
              <div className="text-sm font-bold text-cyan-400">{state.backingRatioBps} bps ({(state.backingRatioBps / 100).toFixed(2)}%)</div>
            </div>
            <div className="bg-carbon-900/80 p-2.5 rounded border border-emerald-700/60">
              <div className="text-emerald-400 text-[10px]">Net Real Atmospheric Impact</div>
              <div className="text-sm font-bold text-emerald-300 font-mono">
                {retireSuccessCert.causalTonnes.toLocaleString()} tCO2e
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dual-Tranche Vault Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Contract State & SLA Clock */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Dual-Tranche Vault State</span>
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                  state.status === "REBASED_SETTLED"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                    : state.status === "OVERDUE_FROZEN"
                    ? "bg-rose-950 text-rose-400 border border-rose-700"
                    : "bg-cyan-950 text-cyan-400 border border-cyan-700"
                }`}
              >
                {state.status}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>Contract: <span className="text-slate-200">{VAULT_CONTRACT_ADDRESS}</span></div>
              <div>Standard: <span className="text-slate-200">ERC-1155 (Cancun EVM, viaIR)</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Liquid Verified Token */}
              <div className="bg-carbon-900/80 rounded-lg p-3 border border-carbon-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Token ID #{state.verifiedTokenId}</div>
                <div className="text-xs font-bold text-emerald-400 mt-1">Liquid Verified Carbon</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {state.liquidBuyerBalance.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Held by Buyer / Secondary</div>
              </div>

              {/* Dynamic Buffer Token */}
              <div className="bg-carbon-900/80 rounded-lg p-3 border border-carbon-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Token ID #{state.bufferTokenId}</div>
                <div className="text-xs font-bold text-amber-400 mt-1">Dynamic Risk Buffer</div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {state.bufferBalance.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Escrowed in Vault (Slashing Pool)</div>
              </div>
            </div>

            {/* Backing Ratio & SLA Clock Strip */}
            <div className="space-y-2 pt-2 border-t border-carbon-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Contract Backing Ratio:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {state.backingRatioBps} bps ({(state.backingRatioBps / 100).toFixed(2)}%)
                </span>
              </div>
              <div className="w-full bg-carbon-900 rounded-full h-2 overflow-hidden border border-carbon-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 transition-all duration-500"
                  style={{ width: `${Math.min(100, (state.backingRatioBps / 10000) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Audit SLA Deadline:</span>
                </span>
                <span className="font-mono text-slate-200">
                  {state.status === "OVERDUE_FROZEN" ? (
                    <span className="text-rose-400 font-bold">OVERDUE (SLA EXPIRED)</span>
                  ) : (
                    "T + 30 Days Remaining"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              On-Chain Simulation Controls
            </h4>

            <div className="space-y-2 text-xs">
              <button
                onClick={handleAuditSubmit}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-md transition-all font-mono"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Action 1: Submit Signed EIP-712 Causal Audit</span>
              </button>

              <button
                onClick={handleMarkOverdue}
                className="w-full py-2.5 px-3 rounded-lg bg-carbon-800 hover:bg-rose-950/60 text-rose-300 border border-rose-800/60 font-semibold flex items-center justify-center space-x-2 transition-all font-mono"
              >
                <FastForward className="h-4 w-4 text-rose-400" />
                <span>Action 2: Fast-Forward 31d & Trigger markOverdue()</span>
              </button>

              <button
                onClick={handleRetireTokens}
                className="w-full py-2.5 px-3 rounded-lg bg-carbon-800 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold flex items-center justify-center space-x-2 transition-all font-mono"
              >
                <Send className="h-4 w-4 text-cyan-400" />
                <span>Action 3: Transfer / Retire 10,000 Verified VCUs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: EIP-712 Payload Inspector & Live Event Log */}
        <div className="lg:col-span-7 space-y-5">
          {/* EIP-712 Typed Data Inspector */}
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileCode2 className="h-4 w-4 text-cyan-400" />
                <span>EIP-712 Structured Payload Inspector</span>
              </h4>
              <span className="text-[10px] text-cyan-400 font-mono">Domain: CarbonProof CausalMRV</span>
            </div>

            <div className="bg-carbon-950/95 rounded-lg p-3 border border-carbon-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56">
              <pre>{JSON.stringify(
                {
                  types: {
                    EIP712Domain: [
                      { name: "name", type: "string" },
                      { name: "version", type: "string" },
                      { name: "chainId", type: "uint256" },
                      { name: "verifyingContract", type: "address" },
                    ],
                    CausalAuditPayload: [
                      { name: "projectId", type: "uint256" },
                      { name: "epoch", type: "uint256" },
                      { name: "issuedVCUs", type: "uint256" },
                      { name: "verifiedVCUs", type: "uint256" },
                      { name: "excessVCUs", type: "uint256" },
                      { name: "retiredExcessVCUs", type: "uint256" },
                      { name: "activeExcessVCUs", type: "uint256" },
                      { name: "empiricalPValueBps", type: "uint256" },
                      { name: "spatialLeakagePenaltyBps", type: "uint256" },
                      { name: "panelCsvSha256", type: "bytes32" },
                    ],
                  },
                  message: {
                    projectId: state.projectId,
                    epoch: state.currentEpoch + 1,
                    issuedVCUs: caseStudy.issuedVCUs,
                    verifiedVCUs: caseStudy.verifiedVCUs,
                    excessVCUs: caseStudy.excessVCUs,
                    retiredExcessVCUs: caseStudy.retiredExcessVCUs,
                    activeExcessVCUs: caseStudy.activeExcessVCUs,
                    empiricalPValueBps: caseStudy.pValBps,
                    spatialLeakagePenaltyBps: caseStudy.leakageBps,
                    panelCsvSha256: PANEL_CSV_SHA256,
                  },
                },
                null,
                2
              )}</pre>
            </div>
          </div>

          {/* Emitted On-Chain Event Log */}
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <History className="h-4 w-4 text-emerald-400" />
              <span>Emitted Contract Event Log</span>
            </h4>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {vaultSM.eventLogs.length > 0 ? (
                vaultSM.eventLogs.map((log, i) => (
                  <div key={i} className="bg-carbon-900/90 rounded-lg p-2.5 border border-carbon-800 text-xs font-mono">
                    <div className="flex justify-between items-center text-cyan-400 font-bold">
                      <span>event {log.event}</span>
                      <span className="text-[10px] text-slate-500">Block #{log.blockNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 break-all">
                      {JSON.stringify(log.args)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      tx: {log.txHash.slice(0, 18)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic py-4 text-center">
                  No state changes executed yet. Click Action 1 or Action 2 to emit events.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
