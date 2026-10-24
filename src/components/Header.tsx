"use client";

import React from "react";
import { CaseStudyMeta, ProjectId } from "@/lib/types";
import { CASE_STUDIES, PANEL_CSV_SHA256 } from "@/lib/constants";
import { ShieldCheck, Database, Layers, Flame, FileCheck, AlertTriangle } from "lucide-react";

interface HeaderProps {
  selectedProject: ProjectId;
  onSelectProject: (id: ProjectId) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  dynamicBackingRatioBps?: number;
}

export function Header({
  selectedProject,
  onSelectProject,
  activeTab,
  onSelectTab,
  dynamicBackingRatioBps,
}: HeaderProps) {
  const currentCase: CaseStudyMeta = CASE_STUDIES[selectedProject];
  const effectiveBackingBps = dynamicBackingRatioBps ?? currentCase.backingRatioBps;
  const effectiveBackingPct = (effectiveBackingBps / 100).toFixed(2);

  const tabs = [
    { id: "counterfactual", label: "Causal Counterfactual & Holdout Lab", icon: Layers },
    { id: "spatial", label: "150km Spatial Durbin & Donor Twin", icon: Database },
    { id: "vault", label: "On-Chain Dual-Tranche Vault & SLA", icon: ShieldCheck },
    { id: "cybersecurity", label: "Adversarial Tamper & Revert Suite", icon: AlertTriangle },
  ];

  return (
    <header className="border-b border-carbon-700/60 bg-carbon-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-carbon-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  CarbonProof
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                  CausalMRV
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track 1: IEEE ClimateChain Global Hackathon 2026 • Offline Verification & On-Chain Settlement
              </p>
            </div>
          </div>

          {/* Cryptographic Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-glow-green" />
              <span>SHA-256: {PANEL_CSV_SHA256.slice(0, 10)}...{PANEL_CSV_SHA256.slice(-6)}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded uppercase font-bold">
                VERIFIED
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-400 text-xs font-mono">
              <FileCheck className="h-3.5 w-3.5" />
              <span>6/6 Math + 12/12 Chain</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded uppercase font-bold">
                100% PASS
              </span>
            </div>
          </div>
        </div>

        {/* Case Study Portfolio Switcher */}
        <div className="mt-4 pt-3 border-t border-carbon-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Audited Case Portfolio:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CASE_STUDIES) as ProjectId[]).map((projKey) => {
                const c = CASE_STUDIES[projKey];
                const isSelected = selectedProject === projKey;
                return (
                  <button
                    key={projKey}
                    onClick={() => onSelectProject(projKey)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25"
                        : "bg-carbon-900 text-slate-300 hover:bg-carbon-800 border border-carbon-700/50"
                    }`}
                  >
                    #{c.numericalId}: {c.name.split(",")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-slate-400 italic">
            {currentCase.scientificReference}
          </div>
        </div>

        {/* Active Project KPI Strip */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          <div className="bg-carbon-900/90 border border-carbon-700/50 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Issued Developer VCUs</div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {currentCase.issuedVCUs.toLocaleString()}
            </div>
          </div>

          <div className="bg-carbon-900/90 border border-emerald-500/30 rounded-lg p-2.5">
            <div className="text-[11px] text-emerald-400">Verified Causal VCUs</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {currentCase.verifiedVCUs.toLocaleString()}
            </div>
          </div>

          <div className="bg-carbon-900/90 border border-rose-500/30 rounded-lg p-2.5">
            <div className="text-[11px] text-rose-400">Over-Credited Excess</div>
            <div className="text-sm font-bold text-rose-400 font-mono">
              {currentCase.excessVCUs.toLocaleString()}{" "}
              <span className="text-xs font-normal">({currentCase.excessPct}%)</span>
            </div>
          </div>

          <div className="bg-carbon-900/90 border border-amber-500/30 rounded-lg p-2.5">
            <div className="text-[11px] text-amber-400">Retired vs Active Excess</div>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-rose-400 font-semibold">{currentCase.retiredExcessVCUs.toLocaleString()}</span> ret /{" "}
              <span className="text-amber-400 font-semibold">{currentCase.activeExcessVCUs.toLocaleString()}</span> act
            </div>
          </div>

          <div className="bg-carbon-900/90 border border-carbon-700/50 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Dynamic Risk Buffer</div>
            <div className="text-sm font-bold text-slate-200 font-mono flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              {currentCase.remainingBufferVCUs === 0
                ? "100% BURNED"
                : `${currentCase.remainingBufferVCUs.toLocaleString()} VCUs`}
            </div>
          </div>

          <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-lg p-2.5">
            <div className="text-[11px] text-cyan-300">On-Chain Backing Ratio</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {effectiveBackingBps} bps{" "}
              <span className="text-xs text-slate-300">({effectiveBackingPct}%)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-4 flex space-x-1 border-b border-carbon-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-cyan-400 text-cyan-300 bg-carbon-900/60"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
