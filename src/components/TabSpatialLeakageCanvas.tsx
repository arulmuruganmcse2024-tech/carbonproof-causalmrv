"use client";

import React, { useState } from "react";
import { DONOR_POLYGONS, SPATIAL_LEAKAGE_METRICS } from "@/lib/constants";
import { CaseStudyMeta, DonorPolygon } from "@/lib/types";
import { MapPin, Info, Compass, Layers, CheckCircle2 } from "lucide-react";

interface TabSpatialLeakageCanvasProps {
  caseStudy: CaseStudyMeta;
}

export function TabSpatialLeakageCanvas({ caseStudy }: TabSpatialLeakageCanvasProps) {
  const [selectedDonor, setSelectedDonor] = useState<DonorPolygon | null>(DONOR_POLYGONS[0]);
  const [selectedRing, setSelectedRing] = useState<number | null>(null);

  // Filter top non-zero donors
  const activeDonors = DONOR_POLYGONS.filter((d) => d.weight > 0.001);
  const totalSimplexWeight = DONOR_POLYGONS.reduce((acc, d) => acc + d.weight, 0);

  // SVG Canvas Center & Scaling
  const viewBoxWidth = 600;
  const viewBoxHeight = 500;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;
  const maxRadiusKm = 300;
  const scale = 220 / maxRadiusKm; // pixels per km

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Geospatial Vector Canvas */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-carbon-700/60 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Spatial Durbin Digital Twin (150 km Buffer Canvas)</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-carbon-900 border border-carbon-700 font-mono text-slate-300">
                Scale: 1:300 km
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Visualizes the central treated project, concentric Spatial Durbin leakage rings, and 30 control donors located &gt;150 km outside the project boundary.
            </p>
          </div>

          <div className="relative bg-carbon-950/90 rounded-lg p-2 border border-carbon-800 flex items-center justify-center overflow-hidden">
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="w-full h-auto max-h-[420px]"
              style={{ filter: "drop-shadow(0 0 12px rgba(0,0,0,0.5))" }}
            >
              <defs>
                {/* Radial Gradients */}
                <radialGradient id="ringGrad1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                </radialGradient>
                <radialGradient id="ringGrad2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
                </radialGradient>
                <radialGradient id="ringGrad3" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
                </radialGradient>
              </defs>

              {/* Grid Radar Rings */}
              <circle cx={centerX} cy={centerY} r={280 * scale} fill="none" stroke="#1e293b" strokeDasharray="3 3" />
              <circle cx={centerX} cy={centerY} r={200 * scale} fill="none" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Outer 150 km Buffer Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={150 * scale}
                fill="url(#ringGrad3)"
                stroke="#0284c7"
                strokeWidth={selectedRing === 150 ? 2 : 1}
                strokeDasharray="4 4"
                className="cursor-pointer transition-all hover:stroke-cyan-400"
                onClick={() => setSelectedRing(selectedRing === 150 ? null : 150)}
              />

              {/* Mid 50 km Buffer Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={50 * scale}
                fill="url(#ringGrad2)"
                stroke="#d97706"
                strokeWidth={selectedRing === 50 ? 2 : 1}
                strokeDasharray="3 3"
                className="cursor-pointer transition-all hover:stroke-amber-400"
                onClick={() => setSelectedRing(selectedRing === 50 ? null : 50)}
              />

              {/* Inner 10 km Buffer Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={15 * scale}
                fill="url(#ringGrad1)"
                stroke="#e11d48"
                strokeWidth={selectedRing === 10 ? 2 : 1}
                className="cursor-pointer transition-all hover:stroke-rose-400"
                onClick={() => setSelectedRing(selectedRing === 10 ? null : 10)}
              />

              {/* Concentric Ring Labels */}
              <text x={centerX} y={centerY - 150 * scale - 6} fill="#0284c7" fontSize="10" textAnchor="middle" fontFamily="monospace">
                150 km Regional Buffer
              </text>
              <text x={centerX} y={centerY - 50 * scale - 4} fill="#d97706" fontSize="9" textAnchor="middle" fontFamily="monospace">
                50 km Intermediate Buffer
              </text>
              <text x={centerX} y={centerY - 15 * scale - 3} fill="#e11d48" fontSize="8" textAnchor="middle" fontFamily="monospace">
                10 km Border
              </text>

              {/* Central Project Polygon */}
              <g
                className="cursor-pointer"
                onClick={() => {
                  setSelectedDonor(null);
                  setSelectedRing(null);
                }}
              >
                <polygon
                  points={`${centerX},${centerY - 10} ${centerX + 12},${centerY - 3} ${centerX + 10},${centerY + 10} ${centerX - 8},${centerY + 12} ${centerX - 12},${centerY}`}
                  fill="#10b981"
                  stroke="#34d399"
                  strokeWidth="2"
                  filter="drop-shadow(0 0 8px rgba(16,185,129,0.7))"
                />
                <circle cx={centerX} cy={centerY} r="3" fill="#ffffff" />
                <text x={centerX} y={centerY + 24} fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {caseStudy.name.split(",")[0]}
                </text>
                <text x={centerX} y={centerY + 35} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  ({(caseStudy.areaHa / 1000).toFixed(0)}k ha Treated)
                </text>
              </g>

              {/* Donors Polygons (>150 km away) */}
              {DONOR_POLYGONS.map((donor) => {
                const rad = (donor.angleDeg * Math.PI) / 180;
                const distPixels = donor.distanceFromProjectKm * scale;
                const dx = centerX + distPixels * Math.cos(rad);
                const dy = centerY + distPixels * Math.sin(rad);

                const isSelected = selectedDonor?.id === donor.id;
                const hasWeight = donor.weight > 0;
                const radius = hasWeight ? 8 + donor.weight * 22 : 4;
                const fill = hasWeight
                  ? isSelected
                    ? "#38bdf8"
                    : "#0284c7"
                  : "#334155";
                const stroke = hasWeight ? (isSelected ? "#ffffff" : "#7dd3fc") : "#475569";

                return (
                  <g
                    key={donor.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSelectedDonor(donor)}
                  >
                    {/* Connecting line to project for active donors */}
                    {hasWeight && (
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={dx}
                        y2={dy}
                        stroke="#38bdf8"
                        strokeWidth={donor.weight * 3}
                        strokeOpacity={isSelected ? 0.8 : 0.35}
                        strokeDasharray={isSelected ? "none" : "3 3"}
                      />
                    )}
                    <circle
                      cx={dx}
                      cy={dy}
                      r={radius}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2.5 : 1}
                      filter={hasWeight ? "drop-shadow(0 0 6px rgba(56,189,248,0.5))" : undefined}
                    />
                    {hasWeight && (
                      <text
                        x={dx}
                        y={dy - radius - 3}
                        fill={isSelected ? "#ffffff" : "#38bdf8"}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {(donor.weight * 100).toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Inset Legend */}
            <div className="absolute bottom-2 left-2 bg-carbon-900/90 border border-carbon-700/80 rounded p-2 text-[10px] space-y-1 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Treated Project Polygon</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Active Simplex Donor (w_j &gt; 0)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>Zero-Weight Donor (&gt;150 km)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail: Selected Entity & Simplex Weight Matrix */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Donor Card */}
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
              <span>Biophysical Covariate Inspection</span>
              {selectedDonor?.weight ? (
                <span className="text-cyan-400 text-xs font-bold">
                  w* = {(selectedDonor.weight * 100).toFixed(1)}% Simplex Weight
                </span>
              ) : null}
            </h4>

            {selectedDonor ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-mono">{selectedDonor.id}: {selectedDonor.name}</div>
                    <div className="text-xs text-slate-400">Distance: {selectedDonor.distanceFromProjectKm} km from boundary</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="bg-carbon-900 rounded p-2 border border-carbon-800">
                    <div className="text-[10px] text-slate-500">Elevation (SRTM)</div>
                    <div className="font-mono font-bold text-slate-200">{selectedDonor.elevationM} m</div>
                  </div>
                  <div className="bg-carbon-900 rounded p-2 border border-carbon-800">
                    <div className="text-[10px] text-slate-500">Slope Gradient</div>
                    <div className="font-mono font-bold text-slate-200">{selectedDonor.slopeDeg}&deg;</div>
                  </div>
                  <div className="bg-carbon-900 rounded p-2 border border-carbon-800">
                    <div className="text-[10px] text-slate-500">Baseline Canopy (GFW)</div>
                    <div className="font-mono font-bold text-slate-200">{selectedDonor.canopyPct}%</div>
                  </div>
                  <div className="bg-carbon-900 rounded p-2 border border-carbon-800">
                    <div className="text-[10px] text-slate-500">Distance to Road Access</div>
                    <div className="font-mono font-bold text-slate-200">{selectedDonor.roadDistKm} km</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                Click on any donor polygon or buffer ring on the map to inspect biophysical covariates.
              </div>
            )}
          </div>

          {/* Top Simplex Donors Table */}
          <div className="glass-panel rounded-xl p-5 border border-carbon-700/60">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Optimal Simplex Donor Weights (W*)
              </h4>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>&Sigma;w = {totalSimplexWeight.toFixed(7)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-carbon-900 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-1.5 px-2">Donor ID</th>
                    <th className="py-1.5 px-2">Weight (w*)</th>
                    <th className="py-1.5 px-2">Dist</th>
                    <th className="py-1.5 px-2">Canopy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-carbon-800">
                  {activeDonors.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDonor(d)}
                      className={`cursor-pointer transition-colors ${
                        selectedDonor?.id === d.id ? "bg-cyan-950/40 text-cyan-300 font-bold" : "hover:bg-carbon-900/60 text-slate-300"
                      }`}
                    >
                      <td className="py-1.5 px-2 font-mono">{d.id}</td>
                      <td className="py-1.5 px-2 font-mono text-cyan-400">{(d.weight * 100).toFixed(1)}%</td>
                      <td className="py-1.5 px-2 font-mono">{d.distanceFromProjectKm} km</td>
                      <td className="py-1.5 px-2 font-mono">{d.canopyPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 border-t border-carbon-800 pt-2 flex items-center justify-between">
              <span>All 30 Donors satisfy w_j &ge; 0 and &Sigma;w_j = 1.0</span>
              <span className="font-mono text-slate-500">25 Donors w=0.000</span>
            </div>
          </div>

          {/* Spatial Leakage Ring Audit Summary */}
          <div className="glass-panel rounded-xl p-4 border border-carbon-700/60 text-xs space-y-2">
            <div className="font-bold text-slate-300 flex items-center justify-between font-mono">
              <span>150 km Spatial Durbin Leakage Deduction</span>
              <span className="text-amber-400">{SPATIAL_LEAKAGE_METRICS.cumulativePenaltyPct}% (3.18 kha)</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-400">
              {SPATIAL_LEAKAGE_METRICS.rings.map((ring) => (
                <div key={ring.name} className="flex justify-between py-0.5 border-b border-carbon-800/40">
                  <span>{ring.name}:</span>
                  <span className="font-mono text-slate-300">
                    {ring.lossDisplacedKha} kha displaced ({ring.gladAlerts.toLocaleString()} GLAD-S2 alerts)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
