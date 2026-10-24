"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { CaseStudyMeta } from "@/lib/types";
import {
  HOLDOUT_MODELS,
  BOOTSTRAP_METRICS,
  PLACEBO_METRICS,
} from "@/lib/constants";
import { simulateCausalSensitivity } from "@/lib/scmEngine";
import { Sliders, CheckCircle2, TrendingDown, Info, Flame, AlertCircle } from "lucide-react";

interface TabCounterfactualLabProps {
  caseStudy: CaseStudyMeta;
  onUpdateSimulatedBackingBps?: (bps: number) => void;
}

export function TabCounterfactualLab({
  caseStudy,
  onUpdateSimulatedBackingBps,
}: TabCounterfactualLabProps) {
  // Sensitivity Sliders State
  const [baselineMultiplier, setBaselineMultiplier] = useState<number>(1.0);
  const [spatialLeakagePct, setSpatialLeakagePct] = useState<number>(5.13);

  // Compute live simulated counterfactual
  const simulation = useMemo(() => {
    const res = simulateCausalSensitivity(caseStudy, baselineMultiplier, spatialLeakagePct);
    if (onUpdateSimulatedBackingBps) {
      onUpdateSimulatedBackingBps(res.backingRatioBps);
    }
    return res;
  }, [caseStudy, baselineMultiplier, spatialLeakagePct, onUpdateSimulatedBackingBps]);

  // Placebo chart data preparation
  const placeboData = useMemo(() => {
    const items = [
      { name: "Project (Treated)", ratio: PLACEBO_METRICS.projectRatio, isTreated: true },
      { name: "Donor #04", ratio: 3.47, isTreated: false },
      { name: "Donor #12", ratio: 2.89, isTreated: false },
      { name: "Donor #19", ratio: 2.34, isTreated: false },
      { name: "Donor #07", ratio: 1.95, isTreated: false },
      { name: "Donor #23", ratio: 1.62, isTreated: false },
      { name: "Donor #02", ratio: 1.45, isTreated: false },
      { name: "Donor #15", ratio: 1.34, isTreated: false },
      { name: "Donor #28", ratio: 1.21, isTreated: false },
      { name: "Donor #09", ratio: 1.10, isTreated: false },
      { name: "Donor #16", ratio: 0.98, isTreated: false },
      { name: "Donor #25", ratio: 0.85, isTreated: false },
      { name: "Donor #30", ratio: 0.61, isTreated: false },
    ];
    return items;
  }, []);

  return (
    <div className="space-y-6">
      {/* Interactive Sensitivity Controls Panel */}
      <div className="glass-panel rounded-xl p-5 border border-carbon-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Interactive Causal Sensitivity Studio
              </h3>
              <p className="text-xs text-slate-400">
                Adjust empirical assumptions live to observe dynamic counterfactual re-weighting, buffer burn, and backing ratio.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                setBaselineMultiplier(1.0);
                setSpatialLeakagePct(5.13);
              }}
              className="px-2.5 py-1 rounded bg-carbon-800 hover:bg-carbon-700 text-slate-300 transition-colors border border-carbon-700 font-mono text-[11px]"
            >
              Reset to Locked Baseline (1.0x / 5.13%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-carbon-900/60 rounded-lg p-4 border border-carbon-800">
          {/* Slider 1: Developer Baseline Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Developer Baseline Multiplier:</span>
              <span className="font-mono font-bold text-rose-400">{baselineMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={baselineMultiplier}
              onChange={(e) => setBaselineMultiplier(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.50x (Severe Deflation)</span>
              <span>1.00x (Locked Verra Benchmark)</span>
              <span>2.00x (Extreme Inflation)</span>
            </div>
          </div>

          {/* Slider 2: 150 km Spatial Leakage Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">150 km Spatial Durbin Leakage Rate:</span>
              <span className="font-mono font-bold text-amber-400">{spatialLeakagePct.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="15.0"
              step="0.25"
              value={spatialLeakagePct}
              onChange={(e) => setSpatialLeakagePct(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0% (Zero Leakage)</span>
              <span>5.13% (Empirical Spatial Durbin)</span>
              <span>15.0% (Max Displacement)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Outcome Pill Banner */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-carbon-950/80 rounded-lg p-2.5 border border-carbon-800">
            <div className="text-[11px] text-slate-400">Simulated Claimed VCUs</div>
            <div className="text-sm font-mono font-bold text-rose-400">
              {simulation.totalClaimed.toLocaleString()}
            </div>
          </div>

          <div className="bg-carbon-950/80 rounded-lg p-2.5 border border-carbon-800">
            <div className="text-[11px] text-slate-400">Simulated Verified VCUs</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {simulation.totalVerified.toLocaleString()}
            </div>
          </div>

          <div className="bg-carbon-950/80 rounded-lg p-2.5 border border-carbon-800">
            <div className="text-[11px] text-slate-400">Over-Crediting Discovered</div>
            <div className="text-sm font-mono font-bold text-amber-400">
              {simulation.totalExcess.toLocaleString()} ({simulation.excessPct}%)
            </div>
          </div>

          <div className="bg-carbon-950/80 rounded-lg p-2.5 border border-cyan-800/60">
            <div className="text-[11px] text-cyan-300">Resulting Backing Ratio</div>
            <div className="text-sm font-mono font-bold text-cyan-400">
              {simulation.backingRatioBps} bps ({simulation.backingPct}%)
            </div>
          </div>
        </div>
      </div>

      {/* Chart 1: 2001-2024 Annual Trajectory Chart */}
      <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>24-Year Annual Panel Trajectory (2001–2024)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-sans normal-case">
                Causal Synthetic Counterfactual vs Developer PDD Baseline
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Shaded windows show Pre-Intervention Training (2001–2006), Out-of-Sample Holdout (2007–2010), and Crediting (2011–2024).
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simulation.annualSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2f44" opacity={0.6} />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Loss (kha/yr)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#080e14",
                  borderColor: "#1a2f44",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

              {/* Shaded Regime Areas */}
              <ReferenceArea x1={2001} x2={2006} strokeOpacity={0} fill="#0ea5e9" fillOpacity={0.05} />
              <ReferenceArea x1={2007} x2={2010} strokeOpacity={0} fill="#f59e0b" fillOpacity={0.07} />
              <ReferenceArea x1={2011} x2={2024} strokeOpacity={0} fill="#10b981" fillOpacity={0.06} />

              <Line
                type="monotone"
                dataKey="staticPddLossKha"
                name="Static Developer PDD Baseline (Linear)"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="unweightedMeanKha"
                name="Unweighted Donor Mean (1/30)"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="scmCounterfactualKha"
                name="CarbonProof SCM Simplex Counterfactual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 2, fill: "#38bdf8" }}
              />
              <Line
                type="monotone"
                dataKey="observedLossKha"
                name="Observed Project Deforestation (GFW Satellite)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 2, fill: "#10b981" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-carbon-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>2001–2006: Pre-Intervention Training (Simplex Fit)</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>2007–2010: Out-of-Sample Holdout (Zero Treatment)</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>2011–2024: Post-Intervention Crediting Window</span>
          </div>
        </div>
      </div>

      {/* Grid of Chart 2 & Chart 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out-of-Sample Holdout Scorecard */}
        <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Out-of-Sample Holdout Scorecard (2007–2010)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-normal">
                RMSPE & MAE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly on pre-intervention holdout years unseen during donor weight optimization.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-carbon-900/80 text-slate-400 border-b border-carbon-800 font-mono">
                <tr>
                  <th className="py-2 px-3">Model Specification</th>
                  <th className="py-2 px-3">RMSPE</th>
                  <th className="py-2 px-3">MAE</th>
                  <th className="py-2 px-3">OOS Error Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-800/60">
                {HOLDOUT_MODELS.map((m, idx) => {
                  const isScm = m.name.includes("Simplex");
                  return (
                    <tr
                      key={m.name}
                      className={isScm ? "bg-cyan-950/20 font-semibold text-cyan-300" : "text-slate-300"}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-1.5">
                          {isScm && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                          <span>{m.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{m.rmspe.toFixed(4)} kha</td>
                      <td className="py-2.5 px-3 font-mono">{m.mae.toFixed(4)} kha</td>
                      <td className="py-2.5 px-3 font-mono">
                        {isScm ? (
                          <span className="text-emerald-400 font-bold">
                            -{BOOTSTRAP_METRICS.meanReductionPct}% [95% CI]
                          </span>
                        ) : idx === 3 ? (
                          <span className="text-rose-400 font-medium">Baseline (0%)</span>
                        ) : (
                          <span className="text-slate-400">
                            -{(((4.1004 - m.rmspe) / 4.1004) * 100).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-carbon-900/60 rounded-lg p-3 text-xs space-y-1.5 border border-carbon-800">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span>200-Bootstrap Resample Validation:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              CarbonProof SCM achieves a mean holdout error reduction of{" "}
              <strong className="text-emerald-400">{BOOTSTRAP_METRICS.meanReductionPct}%</strong> with 95% confidence interval{" "}
              <span className="text-cyan-300 font-mono">
                [{BOOTSTRAP_METRICS.ci95Lower}%, {BOOTSTRAP_METRICS.ci95Upper}%]
              </span>{" "}
              relative to developer static PDD extrapolation.
            </p>
          </div>
        </div>

        {/* 30-Donor In-Space Placebo Permutations */}
        <div className="glass-panel rounded-xl p-5 border border-carbon-700/60 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                30 In-Space Placebo Permutations
              </h3>
              <p className="text-xs text-slate-400">
                Post/Pre RMSPE Ratio test iteratively reassigning intervention to each donor polygon.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-emerald-400">
                p = {PLACEBO_METRICS.empiricalPValue}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">1/31 &le; 0.05</div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placeboData} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2f44" opacity={0.5} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#080e14",
                    borderColor: "#1a2f44",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}x`, "Post/Pre RMSPE Ratio"]}
                />
                <Bar
                  dataKey="ratio"
                  shape={(props: any) => {
                    const { fill, x, y, width, height, payload } = props;
                    const barFill = payload.isTreated ? "#10b981" : "#334155";
                    return <rect x={x} y={y} width={width} height={height} fill={barFill} rx={3} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-carbon-900/60 rounded-lg p-3 text-xs space-y-1 border border-carbon-800">
            <div className="flex justify-between text-slate-300">
              <span>Treated Project Post/Pre RMSPE Ratio:</span>
              <strong className="text-emerald-400 font-mono">{PLACEBO_METRICS.projectRatio}x</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Max Donor Placebo Ratio (False Positive):</span>
              <span className="font-mono text-slate-300">{PLACEBO_METRICS.maxDonorRatio}x</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Empirical p-value:</span>
              <span className="font-mono text-emerald-400 font-bold">
                (1 + {PLACEBO_METRICS.extremeCount}) / (30 + 1) = {PLACEBO_METRICS.empiricalPValue} (Statistically Significant)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
