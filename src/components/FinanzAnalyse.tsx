/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import {
  TrendingUp,
  TriangleAlert,
  LineChart,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

export const FinanzAnalyse: React.FC = () => {
  const { baustellen } = useERPState();

  // Selected bento focus card status
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Financial aggregates
  const totalRevenue = baustellen.reduce((sum, b) => sum + b.endpreis, 0);
  
  const totalCalculatedWages = baustellen.reduce((sum, b) => sum + b.kalkulierteLohnkosten, 0);
  const totalActualWages = baustellen.reduce((sum, b) => sum + b.tatsaechlicheLohnkosten, 0);

  const totalCalculatedMaterials = baustellen.reduce((sum, b) => sum + b.kalkulierteMaterialkosten, 0);
  const totalActualMaterials = baustellen.reduce((sum, b) => sum + b.tatsaechlicheMaterialkosten, 0);

  const calculatedCosts = totalCalculatedWages + totalCalculatedMaterials;
  const actualCosts = totalActualWages + totalActualMaterials;

  const actualProfit = totalRevenue - actualCosts;
  const calculatedProfit = totalRevenue - calculatedCosts;

  // Monthly breakdown mock series
  const monthlyData = [
    { label: "Jan", revenue: 18000, profit: 6000, wages: 8000, materials: 4000 },
    { label: "Feb", revenue: 22000, profit: 7000, wages: 10000, materials: 5000 },
    { label: "Mär", revenue: 35000, profit: 11000, wages: 15000, materials: 9000 },
    { label: "Apr", revenue: 58000, profit: 20000, wages: 24000, materials: 14000 },
    { label: "Mai", revenue: 72000, profit: 23000, wages: 31000, materials: 18000 },
    { label: "Jun", revenue: 84500, profit: 33500, wages: 29000, materials: 22000 }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6 animate-fade-in" id="finanzen-root">
      {/* 3 Overview indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Kumulierter Umsatz (Ist)</span>
            <p className="text-xl font-bold text-slate-800 font-mono">
              €{totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-slate-400">Gesamte verbuchte Projektvolumen</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Erwirtschafteter Nettoerlös</span>
            <p className="text-xl font-bold text-indigo-750 font-mono">
              €{actualProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium font-sans">
              Gewinn-Marge: {Math.round((actualProfit / Math.max(1, totalRevenue)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Kostendeckungs-Faktor</span>
            <p className="text-xl font-bold text-slate-800 font-mono">
              {Math.round((calculatedCosts / Math.max(1, actualCosts)) * 100)}%
            </p>
            <span className="text-[10px] text-emerald-600 font-sans font-medium">Unter Plan-Budget geblieben</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Dynamic monthly charts (Revenue, wages, materials, profit) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm">Monatliche Analyse (Januar - Juni 2026)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Umsatzerlöse im Verhältnis zu Lohnabrechnungen und Materialaufwand</p>

            {/* Premium custom SVG charts diagram panel */}
            <div className="relative pt-6">
              <div className="flex h-44 items-end gap-3.5 pb-2 border-b border-slate-100">
                {monthlyData.map((mon, mIdx) => {
                  const revHr = Math.max(12, Math.round((mon.revenue / maxRevenue) * 100));
                  const prfHr = Math.max(8, Math.round((mon.profit / maxRevenue) * 100));
                  const wgHr = Math.max(6, Math.round((mon.wages / maxRevenue) * 100));
                  const matHr = Math.max(4, Math.round((mon.materials / maxRevenue) * 100));

                  const isHovered = hoveredIndex === mIdx;

                  return (
                    <div
                      key={mIdx}
                      onMouseEnter={() => setHoveredIndex(mIdx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group"
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 bg-slate-900 text-white font-mono text-[9px] p-2.5 rounded-xl shadow-xl z-30 whitespace-nowrap leading-tight text-center">
                          <p className="font-bold text-[10px] text-emerald-400">Umsatz: €{mon.revenue.toLocaleString()}</p>
                          <p className="mt-0.5">Lohn: €{mon.wages.toLocaleString()}</p>
                          <p>Material: €{mon.materials.toLocaleString()}</p>
                          <p className="text-emerald-350 border-t border-white/15 mt-1 pt-1">
                            Gewinn: <strong>€{mon.profit.toLocaleString()}</strong>
                          </p>
                        </div>
                      )}

                      <div className="w-full flex justify-center items-end gap-0.5 max-w-[50px] h-full">
                        {/* Material bar */}
                        <div style={{ height: `${matHr}%` }} className="w-1.5 bg-orange-200 rounded-t-xs" />
                        {/* Wages bar */}
                        <div style={{ height: `${wgHr}%` }} className="w-1.5 bg-indigo-300 rounded-t-xs" />
                        {/* Profit bar */}
                        <div style={{ height: `${prfHr}%` }} className="w-1.5 bg-blue-400 rounded-t-xs" />
                        {/* Revenue line/bar */}
                        <div style={{ height: `${revHr}%` }} className="w-2.5 bg-emerald-600 rounded-t-xs" />
                      </div>

                      <span className="text-[10px] mt-2 font-mono text-slate-400">{mon.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend indicators */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs" />
                  Gesamtumsatz
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-450 rounded-xs" />
                  Nettoertrag
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-300 rounded-xs" />
                  Lohnaufwand
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-orange-200 rounded-xs" />
                  Materialaufwand
                </span>
              </div>
            </div>
          </div>

          {/* Project Margins & Performance metrics table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Projekt-Gewinnmargen im direkten Vergleich</h3>
            
            <div className="space-y-4">
              {baustellen.map(pj => {
                const totalCost = pj.tatsaechlicheLohnkosten + pj.tatsaechlicheMaterialkosten;
                const profit = pj.endpreis - totalCost;
                const marginPercent = Math.round((profit / Math.max(1, pj.endpreis)) * 100);

                let healthColor = "w-2.5 h-2.5 rounded-full bg-emerald-500";
                if (marginPercent < 20) healthColor = "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse";
                else if (marginPercent < 35) healthColor = "w-2.5 h-2.5 rounded-full bg-amber-500";

                return (
                  <div key={pj.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-150 rounded-xl transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={healthColor} />
                          <span className="font-bold text-slate-800 truncate">{pj.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 pl-4">{pj.baustellennummer} | {pj.kundenname}</p>
                      </div>

                      <div className="flex items-center gap-4 font-mono pl-4 sm:pl-0 mt-2 sm:mt-0 text-left sm:text-right shrink-0 justify-between sm:justify-end">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-normal leading-none uppercase">REINGEWINN</span>
                          <span className="font-black text-slate-700 leading-none inline-block mt-1">€{profit.toLocaleString("de-DE")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-normal leading-none uppercase">PROZENT-MARGE</span>
                          <span className="font-black text-emerald-700 leading-none inline-block mt-1">{marginPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Projected Soll-Ist overall business budgeting compares */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-indigo-950 to-emerald-950 text-white p-6 rounded-2xl shadow-xl space-y-5 border border-slate-900">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 uppercase tracking-widest font-bold">
                Jahresabschluss KVP
              </span>
              <h3 className="font-bold text-sm text-white mt-3">Soll- / Ist-Vorkalkulation</h3>
              <p className="text-xs text-slate-350 leading-relaxed mt-1">
                Gegenüberstellung des gesamten kalkulierten Firmenbudgets zum tatsächlich ausgegebenen Arbeitslohn & Rohstoffverbrauch.
              </p>
            </div>

            {/* S-I wage cost compares progress */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                <span>Personalbudget (Wages)</span>
                <span>{Math.round((totalActualWages / Math.max(1, totalCalculatedWages)) * 100)}% verbraucht</span>
              </div>
              <div className="flex justify-between font-mono text-slate-200">
                <span>Geplant: €{totalCalculatedWages.toLocaleString()}</span>
                <span>Ausgezahlt: €{totalActualWages.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (totalActualWages / Math.max(1, totalCalculatedWages)) * 100)}%` }}
                />
              </div>
            </div>

            {/* S-I material cost compares progress */}
            <div className="space-y-2 text-xs pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                <span>Materialbudget (Stock)</span>
                <span>{Math.round((totalActualMaterials / Math.max(1, totalCalculatedMaterials)) * 100)}% verbraucht</span>
              </div>
              <div className="flex justify-between font-mono text-slate-200">
                <span>Geplant: €{totalCalculatedMaterials.toLocaleString()}</span>
                <span>Eingekauft: €{totalActualMaterials.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (totalActualMaterials / Math.max(1, totalCalculatedMaterials)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Summing report */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1 mt-4">
              <div className="flex justify-between text-slate-400">
                <span>Vorkalkulierter Gewinn</span>
                <span className="font-mono">€{calculatedProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-white/10 pt-1.5">
                <span>Tatsächlicher Reingewinn</span>
                <span className="font-mono text-emerald-400">€{actualProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-sans italic flex items-start gap-1.5 pt-2">
              <Info className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>
                Der Betrieb verbucht aktuell Einsparungen im Materialbereich, da Kies-Bestellungen rabattiert wurden.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
