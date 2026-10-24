"use client";

import React, { useState } from "react";
import { ProjectId } from "@/lib/types";
import { CASE_STUDIES } from "@/lib/constants";
import { Header } from "@/components/Header";
import { TabCounterfactualLab } from "@/components/TabCounterfactualLab";
import { TabSpatialLeakageCanvas } from "@/components/TabSpatialLeakageCanvas";
import { TabOnChainVault } from "@/components/TabOnChainVault";
import { TabAdversarialTamper } from "@/components/TabAdversarialTamper";
import { ShieldCheck, Database, Award, ExternalLink } from "lucide-react";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<ProjectId>("kariba_vcs902");
  const [activeTab, setActiveTab] = useState<string>("counterfactual");
  const [dynamicBackingBps, setDynamicBackingBps] = useState<number | undefined>(undefined);

  const currentCase = CASE_STUDIES[selectedProject];

  return (
    <div className="min-h-screen bg-[#040709] text-slate-100 flex flex-col justify-between">
      <div>
        {/* Top Executive Header */}
        <Header
          selectedProject={selectedProject}
          onSelectProject={(proj) => {
            setSelectedProject(proj);
            setDynamicBackingBps(undefined);
          }}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          dynamicBackingRatioBps={dynamicBackingBps}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "counterfactual" && (
            <TabCounterfactualLab
              caseStudy={currentCase}
              onUpdateSimulatedBackingBps={setDynamicBackingBps}
            />
          )}

          {activeTab === "spatial" && (
            <TabSpatialLeakageCanvas caseStudy={currentCase} />
          )}

          {activeTab === "vault" && (
            <TabOnChainVault caseStudy={currentCase} />
          )}

          {activeTab === "cybersecurity" && (
            <TabAdversarialTamper />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-carbon-800 bg-carbon-950 py-6 mt-12 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">CarbonProof (CausalMRV)</span>
            <span>•</span>
            <span>IEEE ClimateChain Global Hackathon 2026 — Track 1</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verra Audit Benchmark Calibrated</span>
            </span>
            <span>•</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              <span>ERC-1155 Dual-Tranche Protocol</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
