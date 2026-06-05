/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { Baustelle, BaustellenStatus, BaustellenTyp, Bautag, Datei } from "../types";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  TrendingDown,
  TrendingUp,
  LineChart,
  Hammer,
  Users,
  FileDown,
  CheckCircle,
  FileText,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ClipboardList,
  Sparkles
} from "lucide-react";

export const AdminBaustellen: React.FC = () => {
  const { baustellen, addBaustelle, bautage, users, materials, maschinen } = useERPState();

  // Filter settings
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typFilter, setTypFilter] = useState<string>("ALL");

  // Selection state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("b1"); // default Kurpark

  // Active view layout (List vs Gantt)
  const [viewMode, setViewMode] = useState<"list" | "gantt">("list");

  // Active sub-details tab
  const [detailsTab, setDetailsTab] = useState<"uebersicht" | "bautage" | "material" | "mitarbeiter" | "dateien">("uebersicht");

  // Add project form modal state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    kundenname: "",
    kundenadresse: "",
    typ: BaustellenTyp.BAU,
    beschreibung: "",
    startdatum: "2026-06-10",
    enddatum: "2026-07-10",
    endpreis: 25000.00,
    kalkulierteMaterialkosten: 8000.00,
    kalkulierteLohnkosten: 10000.00
  });

  // Filters mapping
  const filteredProjects = baustellen.filter(b => {
    const sQuery = searchQuery.toLowerCase();
    const matchQuery = b.name.toLowerCase().includes(sQuery) ||
                       b.kundenname.toLowerCase().includes(sQuery) ||
                       b.baustellennummer.toLowerCase().includes(sQuery);

    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchTyp = typFilter === "ALL" || b.typ === typFilter;

    return matchQuery && matchStatus && matchTyp;
  });

  const selectedProject = baustellen.find(b => b.id === selectedProjectId) || baustellen[0];

  // Profit margins calculation helper
  const getMargin = (b: Baustelle) => {
    const revenue = b.endpreis;
    const costs = b.tatsaechlicheLohnkosten + b.tatsaechlicheMaterialkosten;
    const profit = revenue - costs;
    return {
      profit,
      percent: Math.round((profit / Math.max(1, revenue)) * 100)
    };
  };

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Baustelle = {
      id: `b-gen-${Date.now()}`,
      baustellennummer: `PRJ-2026-0${baustellen.length + 1}`,
      typ: newProject.typ,
      name: newProject.name,
      kundenname: newProject.kundenname,
      kundenadresse: newProject.kundenadresse,
      beschreibung: newProject.beschreibung,
      startdatum: newProject.startdatum,
      enddatum: newProject.enddatum,
      status: BaustellenStatus.GEPLANT,
      endpreis: newProject.endpreis,
      kalkulierteMaterialkosten: newProject.kalkulierteMaterialkosten,
      kalkulierteLohnkosten: newProject.kalkulierteLohnkosten,
      tatsaechlicheMaterialkosten: 0,
      tatsaechlicheLohnkosten: 0,
      materialVorOrt: [],
      maschinenVorOrt: [],
      dateien: [],
      createdAt: new Date().toISOString()
    };

    addBaustelle(created);
    setSelectedProjectId(created.id);
    setShowAddProject(false);
    // Reset form values
    setNewProject({
      name: "",
      kundenname: "",
      kundenadresse: "",
      typ: BaustellenTyp.BAU,
      beschreibung: "",
      startdatum: "2026-06-10",
      enddatum: "2026-07-10",
      endpreis: 25000.00,
      kalkulierteMaterialkosten: 8000.00,
      kalkulierteLohnkosten: 10000.00
    });
  };

  // Find all Bautage representing the selected project
  const projectBautage = bautage.filter(bt => bt.baustelleId === selectedProject.id);

  return (
    <div className="space-y-6" id="projects-workspace">
      {/* 1. Header and View selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 leading-none">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Projektverwaltung & Gantt-Jahresplanung
          </h2>
          <p className="text-xs text-slate-400 mt-1">Überwachen Sie Gewinne, Bautageberichte und Bauzeitüberlappungen</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                viewMode === "list" ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Projekttabelle
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                viewMode === "gantt" ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Gantt-Zeitplan
            </button>
          </div>

          <button
            onClick={() => setShowAddProject(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Neues Projekt planen
          </button>
        </div>
      </div>

      {/* 2. Main splitting layouts */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List panel column */}
          <div className="lg:col-span-1 space-y-4" id="projects-rail">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="font-bold text-xs tracking-wider uppercase font-mono text-slate-400">Projekte Filter</div>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Projektname, Nr..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 rounded-lg p-1 text-slate-600"
                  >
                    <option value="ALL">Alle Stati</option>
                    <option value="AKTIV">AKTIV</option>
                    <option value="GEPLANT">GEPLANT</option>
                    <option value="ABGESCHLOSSEN">ABGESCHLOSSEN</option>
                  </select>

                  <select
                    value={typFilter}
                    onChange={(e) => setTypFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 rounded-lg p-1 text-slate-600"
                  >
                    <option value="ALL">Alle Typen</option>
                    <option value="BAU">BAU</option>
                    <option value="PFLEGE">PFLEGE</option>
                  </select>
                </div>
              </div>

              {/* Render dynamic list */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {filteredProjects.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 text-slate-400 rounded-xl text-xs font-sans">
                    Keine Übereinstimmungen gefunden. Show all.
                  </div>
                ) : (
                  filteredProjects.map(prj => {
                    const isChosen = selectedProjectId === prj.id;
                    const margin = getMargin(prj);
                    return (
                      <div
                        key={prj.id}
                        onClick={() => setSelectedProjectId(prj.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChosen
                            ? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10"
                            : "bg-white border-slate-100 hover:border-slate-350 text-slate-600"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.2 text-[8px] font-mono leading-none rounded font-bold uppercase ${
                                prj.typ === "BAU" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {prj.typ}
                              </span>
                              <span className="text-[9px] font-mono opacity-60 leading-none">{prj.baustellennummer}</span>
                            </div>

                            <h4 className={`font-black text-xs truncate mt-2 ${isChosen ? "text-white" : "text-slate-800"}`}>
                              {prj.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{prj.kundenname}</p>
                          </div>

                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 font-bold ${
                            prj.status === "AKTIV" ? "bg-emerald-150 text-emerald-800 font-bold" :
                            prj.status === "GEPLANT" ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-800"
                          }`}>
                            {prj.status}
                          </span>
                        </div>

                        {/* Cost visual bars summary on chosen project card */}
                        <div className="mt-3 pt-3 border-t border-slate-100/10 flex items-center justify-between text-[10px]">
                          <span className="font-mono">Umsatz: €{prj.endpreis.toLocaleString("de-DE")}</span>
                          <span className={`font-mono font-medium ${margin.percent < 30 ? "text-red-500" : "text-emerald-500"}`}>
                            Marge: {margin.percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Details dossier column */}
          {selectedProject && (
            <div className="lg:col-span-2 space-y-4" id="project-dossier-full">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header overview area */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                        selectedProject.typ === "BAU" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {selectedProject.typ}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{selectedProject.baustellennummer}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mt-2">{selectedProject.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Adresse: {selectedProject.kundenadresse}</p>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-slate-400 text-[10px] block">PROJEKTBUDGET (KVP)</span>
                    <span className="text-lg font-black text-slate-800">€{selectedProject.endpreis.toLocaleString("de-DE")}</span>
                  </div>
                </div>

                {/* Tab layout details */}
                <div className="flex border-b border-slate-100 text-xs font-medium bg-white">
                  {[
                    { id: "uebersicht", label: "Kalkulation & Gewinne" },
                    { id: "bautage", label: "Tagesberichte Log" },
                    { id: "material", label: "Material-Logs" },
                    { id: "mitarbeiter", label: "Crew & Stunden" }
                  ].map(dt => (
                    <button
                      key={dt.id}
                      onClick={() => setDetailsTab(dt.id as any)}
                      className={`flex-1 py-4 border-b-2 font-bold hover:text-slate-700 transition-colors cursor-pointer text-center ${
                        detailsTab === dt.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400"
                      }`}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>

                {/* Sub Tab Panel Wrapper */}
                <div className="p-6 text-xs text-slate-600 leading-relaxed" id="project-detail-box">
                  {/* TAB 1: KALKULATION & GEWINNE */}
                  {detailsTab === "uebersicht" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Material Budget comparisons */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <p className="font-bold text-slate-850 text-xs mb-3">Materialbudget-Vergleich</p>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span>Geplant kalkuliert</span>
                              <span className="font-mono text-slate-800">€{selectedProject.kalkulierteMaterialkosten.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] border-b border-slate-200 pb-2">
                              <span>Tatsächlich verbraucht</span>
                              <span className="font-mono text-red-600 font-bold">€{selectedProject.tatsaechlicheMaterialkosten.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span>Differenz / Rest</span>
                              <span className="font-mono text-emerald-600">
                                €{(selectedProject.kalkulierteMaterialkosten - selectedProject.tatsaechlicheMaterialkosten).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Wage cost budget comparisons */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <p className="font-bold text-slate-850 text-xs mb-3">Lohnkosten-Vergleich</p>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span>Geplant kalkuliert</span>
                              <span className="font-mono text-slate-800">€{selectedProject.kalkulierteLohnkosten.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] border-b border-slate-200 pb-2">
                              <span>Soll/Ist-Ausgezahlt</span>
                              <span className="font-mono text-red-600 font-bold">€{selectedProject.tatsaechlicheLohnkosten.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span>Differenz / Einsparung</span>
                              <span className="font-mono text-emerald-600">
                                €{(selectedProject.kalkulierteLohnkosten - selectedProject.tatsaechlicheLohnkosten).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Decgungsbeitrag Gauge Indicator */}
                      {(() => {
                        const m = getMargin(selectedProject);
                        return (
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                              <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                Deckungsbeitrag & Bruttogewinn (Profitabilität)
                              </p>
                              <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                                Der Bruttogewinn dieses Gartenprojekts beläuft sich auf{" "}
                                <strong>€{m.profit.toLocaleString("de-DE")}</strong>. Der Betrieb erzielt somit eine herausragende Netto-Marge von <strong>{m.percent}%</strong>.
                              </p>
                            </div>
                            
                            <div className="bg-white px-4 py-2 border border-emerald-250 text-emerald-900 rounded-xl font-bold font-mono text-center">
                              <span className="text-[9px] text-slate-400 block font-normal leading-none uppercase">NET MARGE</span>
                              <span className="text-xl inline-block mt-1">{m.percent}%</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 2: TAGESBERICHTE LOG */}
                  {detailsTab === "bautage" && (
                    <div className="space-y-4">
                      <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Tagesberichte & Bautage-Logbuch</p>
                      
                      {projectBautage.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs italic">
                          Bislang sind keine Daily Bautage oder Tagesberichte für dieses Bauvorhaben registriert.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {projectBautage.map(bt => {
                            const assignedCrew = users.filter(u => bt.mitarbeiterIds.includes(u.id));

                            return (
                              <div key={bt.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-150 transition-colors">
                                <div className="flex justify-between items-start flex-col sm:flex-row gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800">
                                        {new Date(bt.datum).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                                      </span>
                                      <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                                        {bt.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Wetter: {bt.wetter || "Keine Wetteraufzeichnungen"}</p>
                                  </div>
                                  
                                  <div className="text-left sm:text-right shrink-0">
                                    <div className="flex -space-x-1">
                                      {assignedCrew.map(c => (
                                        <img
                                          key={c.id}
                                          src={c.profilbild}
                                          alt={c.nachname}
                                          title={`${c.vorname} ${c.nachname}`}
                                          className="w-5 h-5 rounded-full border border-white object-cover shadow-xs"
                                        />
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{bt.mitarbeiterIds.length} Mitarbeiter</p>
                                  </div>
                                </div>

                                {bt.tagesbericht ? (
                                  <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 leading-normal">
                                    <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Bericht Freitext</p>
                                    <p>{bt.tagesbericht}</p>
                                    {bt.bemerkungen && (
                                      <p className="text-[11px] text-amber-700 mt-1 italic">Vorkommnisse: {bt.bemerkungen}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-slate-400 text-[11px] mt-2 italic font-sans">Noch kein freigegebener Lieferschein-Bericht vorhanden.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: MATERIAL LOGS */}
                  {detailsTab === "material" && (
                    <div className="space-y-4">
                      <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Baustellenmaterial & Lieferscheinkontroll-Abgleich</p>
                      
                      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                            <tr>
                              <th className="p-3">Material-Bezeichnung</th>
                              <th className="p-3 text-center">Kalkuliert</th>
                              <th className="p-3 text-center">Verbraucht</th>
                              <th className="p-3 text-right">Differenz (Soll/Ist)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="p-3 font-bold">Muschelkalk-Pflaster 10/10/8</td>
                              <td className="p-3 text-center font-mono">3.0 T</td>
                              <td className="p-3 text-center font-mono text-red-600">2.5 T</td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">+0.5 T übrig</td>
                            </tr>
                            <tr className="border-t border-slate-100">
                              <td className="p-3 font-bold">Mutterboden gesiebt</td>
                              <td className="p-3 text-center font-mono">5.0 M³</td>
                              <td className="p-3 text-center font-mono text-red-600">4.0 M³</td>
                              <td className="p-3 text-right text-emerald-600 font-bold font-mono">+1.0 M³ übrig</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CREW & STUNDEN */}
                  {detailsTab === "mitarbeiter" && (
                    <div className="space-y-4">
                      <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Erfasste Arbeitszeiten der Stammbelegschaft</p>
                      
                      <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-150 p-4">
                        <div className="flex justify-between items-center py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Gerhard Richter (Vorarbeiter)</span>
                          </div>
                          <span className="font-mono text-slate-800">17.1 Stunden gesamt</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Markus Schulz (Mitarbeiter)</span>
                          </div>
                          <span className="font-mono text-slate-800">16.8 Stunden gesamt</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">Lukas Kramer (Azubi)</span>
                          </div>
                          <span className="font-mono text-slate-800">15.5 Stunden gesamt</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GANTT VIEW TIMELINE */
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto" id="gantt-chart-view">
          <div className="min-w-[900px] space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Gantt-Bauzeitendiagramm (Überlappungsprüfung)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Analysieren Sie Terminkonflikte und Ressourcenengpässe</p>
            </div>

            {/* Grid structure for weeks */}
            <div className="grid grid-cols-12 gap-1.5 font-mono text-[10px] text-slate-400 uppercase font-bold text-center border-b border-slate-100 pb-2">
              <div className="col-span-3 text-left font-sans font-bold text-slate-700">Baustelle</div>
              <div>Mo 01.06</div>
              <div>Di 02.06</div>
              <div>Mi 03.06</div>
              <div>Do 04.06</div>
              <div className="bg-emerald-50 text-emerald-700 rounded p-0.5">Fr 05.06 (Heute)</div>
              <div>Sa 06.06</div>
              <div>So 07.06</div>
              <div>Mo 08.06</div>
              <div>Di 09.06</div>
              <div>Mi 10.06</div>
              <div>Do 11.06</div>
            </div>

            {/* Gantt channels */}
            <div className="space-y-4 mt-4">
              {baustellen.map((pj, idx) => {
                // Return horizontal offsets
                let colSpanClass = "col-span-4 translate-x-2";
                let colorClass = "bg-emerald-500 text-white shadow-emerald-500/10";
                
                if (pj.id === "b1") {
                  colSpanClass = "col-span-8 translate-x-0";
                  colorClass = "bg-emerald-700 text-white shadow-emerald-700/10";
                } else if (pj.id === "b2") {
                  colSpanClass = "col-span-10 translate-x-0";
                  colorClass = "bg-amber-600 text-white shadow-amber-600/10";
                } else if (pj.id === "b3") {
                  colSpanClass = "col-span-4 col-start-9";
                  colorClass = "bg-slate-400 text-slate-800";
                } else if (pj.id === "b4") {
                  colSpanClass = "col-span-3 col-start-1";
                  colorClass = "bg-emerald-250 text-emerald-900 line-through opacity-60";
                }

                return (
                  <div key={pj.id} className="grid grid-cols-12 gap-1.5 items-center">
                    <div className="col-span-3 truncate text-xs">
                      <p className="font-bold text-slate-700">{pj.name}</p>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{pj.baustellennummer} | {pj.status}</span>
                    </div>

                    <div className={`col-span-9 grid grid-cols-9 h-10 items-stretch relative`}>
                      <div className={`absolute top-1 bottom-1 left-2 right-2 rounded-xl flex items-center p-3 text-[10px] font-medium leading-none ${colorClass} ${colSpanClass} shadow-md`}>
                        <span className="truncate">{pj.name} ({pj.status})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Adding Project popup modal panel */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 h-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Neues KVP-Gartenprojekt anlegen</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Erstellt einen neuen geplanten Bauträger im ERP</p>
              </div>
              <button
                onClick={() => setShowAddProject(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-lg p-2 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Projektname / Bauvorhaben-Bezeichnung</label>
                <input
                  type="text"
                  required
                  placeholder="Gartengestaltung Villa Schmidt"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Kunde Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Helga Schmidt"
                    value={newProject.kundenname}
                    onChange={(e) => setNewProject({ ...newProject, kundenname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Projekttyp</label>
                  <select
                    value={newProject.typ}
                    onChange={(e) => setNewProject({ ...newProject, typ: e.target.value as BaustellenTyp })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={BaustellenTyp.BAU}>BAU</option>
                    <option value={BaustellenTyp.PFLEGE}>PFLEGE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Kundenadresse (für Navigation)</label>
                <input
                  type="text"
                  required
                  placeholder="Kranichfelderstr. 104, 99097 Erfurt"
                  value={newProject.kundenadresse}
                  onChange={(e) => setNewProject({ ...newProject, kundenadresse: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Leistungsbeschreibung / Notizen</label>
                <textarea
                  rows={2}
                  placeholder="30m Heckenformschnitt, Pflasterzeile verlegen..."
                  value={newProject.beschreibung}
                  onChange={(e) => setNewProject({ ...newProject, beschreibung: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Startdatum</label>
                  <input
                    type="date"
                    required
                    value={newProject.startdatum}
                    onChange={(e) => setNewProject({ ...newProject, startdatum: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Enddatum (Kalkulation)</label>
                  <input
                    type="date"
                    required
                    value={newProject.enddatum}
                    onChange={(e) => setNewProject({ ...newProject, enddatum: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Endpreis (€)</label>
                  <input
                    type="number"
                    value={newProject.endpreis}
                    onChange={(e) => setNewProject({ ...newProject, endpreis: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Lohn kalk.</label>
                  <input
                    type="number"
                    value={newProject.kalkulierteLohnkosten}
                    onChange={(e) => setNewProject({ ...newProject, kalkulierteLohnkosten: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Material kalk.</label>
                  <input
                    type="number"
                    value={newProject.kalkulierteMaterialkosten}
                    onChange={(e) => setNewProject({ ...newProject, kalkulierteMaterialkosten: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans cursor-pointer"
                >
                  Projekt archivieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
