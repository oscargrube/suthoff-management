/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { Material, MaterialEinheit } from "../types";
import {
  Warehouse,
  Search,
  TriangleAlert,
  ShoppingCart,
  Boxes,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";

export const LagerVerwaltung: React.FC = () => {
  const { materials, updateMaterial, baustellen } = useERPState();

  // Search input
  const [searchQuery, setSearchQuery] = useState("");
  
  // Quick stock editor state
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState("0");

  // Filter low stocks specifically
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Dynamic automatic order list calculator based on upcoming projects
  // Formula: Benötigte Menge Baustellen - Aktueller Lagerbestand = Bestellmenge
  // Let's map required amounts for upcoming planned projects (Einfriedung Wohnpark needs 350 M² Rollrasen & 150 M Zaun)
  const simulatedProjectDemands = [
    { materialId: "m3", name: "Rollrasen Premium Sport", needed: 350 }, // Currently: 180 (needs 170)
    { materialId: "m4", name: "Doppelstabmattenzaun H-1.2m Anthrazit", needed: 120 }, // Currently: 150 (none needed)
    { materialId: "m1", name: "Muschelkalk-Pflaster 10/10/8", needed: 18 }, // Currently: 12.5 (needs 5.5)
    { materialId: "m5", name: "Zierkies Rheinkies 16/32", needed: 15 } // Currently: 4.2 (needs 10.8)
  ];

  const filteredMaterials = materials.filter(m => {
    const sQuery = searchQuery.toLowerCase();
    const matchQuery = m.name.toLowerCase().includes(sQuery) || m.artikelnummer.toLowerCase().includes(sQuery);
    const matchLow = !onlyLowStock || m.aktuellerBestand < m.mindestbestand;
    return matchQuery && matchLow;
  });

  const handleUpdateStock = (matId: string) => {
    const nextVal = parseFloat(editingStockVal);
    if (isNaN(nextVal)) return;

    const original = materials.find(m => m.id === matId);
    if (original) {
      updateMaterial({
        ...original,
        aktuellerBestand: nextVal
      });
      setEditingMaterialId(null);
    }
  };

  const handleQuickReorder = (matId: string, amount: number) => {
    const original = materials.find(m => m.id === matId);
    if (original) {
      updateMaterial({
        ...original,
        aktuellerBestand: original.aktuellerBestand + amount
      });
      alert(`Warenannahme verbucht!\n+${amount} ${original.einheit} auf den Gesamtbestand aufgeschlagen.`);
    }
  };

  return (
    <div className="space-y-6" id="warehouse-root">
      {/* Upper overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Gesamte Lagerartikel</span>
            <p className="text-xl font-bold text-slate-800 tracking-tight">{materials.length} Produkte</p>
            <span className="text-[10px] text-slate-400">Verteilte Schüttgutboxen & Hallenregale</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <TriangleAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 text-red-600">Meldebestand unterschritten</span>
            <p className="text-xl font-bold text-red-600 tracking-tight">
              {materials.filter(m => m.aktuellerBestand < m.mindestbestand).length} Artikel
            </p>
            <span className="text-[10px] text-red-600 font-medium">Bedarf an Zukäufen erkannt!</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Lagerbesetzung ausgelastet</span>
            <p className="text-xl font-bold text-slate-800 tracking-tight">92% Kapazität</p>
            <span className="text-[10px] text-slate-400">Inklusive Freifläche B & Kühlcontainer</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Materials list and quick additions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Materialbestand & Lagerbestandsliste</h3>
                <p className="text-xs text-slate-400">Verfolgen, buchen und inventarisieren Sie Schüttgut and Steine</p>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Artikel, Nr, Lagerort..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`text-xs font-semibold px-2.5 py-2 border rounded-xl leading-none transition-colors cursor-pointer ${
                    onlyLowStock
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Meldebestand-Warnung
                </button>
              </div>
            </div>

            {/* Scrollable table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Art.-Nr / Bezeichnung</th>
                    <th className="p-3">Lagerort</th>
                    <th className="p-3 text-center">Bestand</th>
                    <th className="p-3 text-center">Meldegrenze</th>
                    <th className="p-3 text-right">Einkaufspreis</th>
                    <th className="p-3 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.map(mat => {
                    const isLow = mat.aktuellerBestand < mat.mindestbestand;
                    const isEditing = editingMaterialId === mat.id;

                    return (
                      <tr key={mat.id} className={`hover:bg-slate-50/50 ${isLow ? "bg-red-50/10" : ""}`}>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 text-[12px]">{mat.name}</p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{mat.artikelnummer}</span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{mat.lagerort}</td>
                        
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 justify-center max-w-[120px] mx-auto">
                              <input
                                type="number"
                                value={editingStockVal}
                                onChange={(e) => setEditingStockVal(e.target.value)}
                                className="w-16 bg-white border border-slate-300 rounded p-1 text-center font-mono"
                              />
                              <button
                                onClick={() => handleUpdateStock(mat.id)}
                                className="bg-emerald-600 text-white rounded px-1.5 py-1"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className={`font-black font-mono text-xs ${isLow ? "text-red-600" : "text-slate-800"}`}>
                                {mat.aktuellerBestand} {mat.einheit}
                              </span>
                              {isLow && (
                                <span className="block text-[8px] bg-red-100 text-red-700 font-bold px-1 py-0.2 rounded font-mono uppercase w-fit mx-auto mt-1">
                                  Kritisch
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-center font-mono text-slate-400">{mat.mindestbestand} {mat.einheit}</td>
                        <td className="p-3 text-right font-mono text-slate-600">€{mat.einkaufspreis.toFixed(2)}</td>

                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingMaterialId(mat.id);
                              setEditingStockVal(mat.aktuellerBestand.toString());
                            }}
                            className="text-[10px] font-semibold text-slate-600 hover:text-slate-800 hover:underline bg-slate-50 p-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleQuickReorder(mat.id, 5)}
                            className="bg-emerald-50 text-emerald-800 text-[9px] hover:bg-emerald-100 py-1 px-1.5 rounded font-mono font-bold border border-emerald-100"
                          >
                            +5 Buchen
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Auto reordering calculator based on projects demands */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-850 text-white shadow-xl">
            <div className="flex items-center gap-1.5 mb-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-400">Automatischer Bestellrechner</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Berechnet aus anstehenden Gartenprojekten den logistischen Zusatzbedarf nach der Formel:
              <br />
              <strong className="text-white">Bedarf Baustellen - Lagerbestand = Bestellmenge</strong>
            </p>

            <div className="space-y-3.5">
              {simulatedProjectDemands.map((dem, idx) => {
                const stockMat = materials.find(m => m.id === dem.materialId);
                const currentStock = stockMat ? stockMat.aktuellerBestand : 0;
                
                const orderAmount = dem.needed - currentStock;
                const isDeficient = orderAmount > 0;

                return (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-bold truncate max-w-[150px]">{dem.name}</span>
                      <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
                        Geplant: {dem.needed} {stockMat?.einheit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span>Aktueller Lagerbestand</span>
                      <span className="font-mono">{currentStock} {stockMat?.einheit}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[11px]">
                      <span className="font-medium text-slate-400">Zusatz-Bestellmenge</span>
                      {isDeficient ? (
                        <span className="font-bold font-mono text-red-400">
                          {orderAmount} {stockMat?.einheit} erforderlich
                        </span>
                      ) : (
                        <span className="font-mono text-emerald-400 flex items-center gap-0.5">
                          Genug vorrätig
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                alert("Simulierter ERP-Sammelbestellschein an Großhändler Baustoffe-Erfurt GmbH versendet!\nDie Lieferung wird für den 09.06.2026 erwartet.");
              }}
              className="w-full mt-5 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sammelbestellung ausführen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
