/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { User, Maschine, Fahrzeug, Baustelle, Bautag, BautagStatus, UserRolle } from "../types";
import {
  Users2,
  Hammer,
  Truck,
  TriangleAlert,
  PlusCircle,
  HelpCircle,
  CheckCircle,
  Trash2,
  CalendarDays,
  Sparkles,
  ChevronRight
} from "lucide-react";

export const Wochenplanung: React.FC = () => {
  const {
    users,
    maschinen,
    fahrzeuge,
    baustellen,
    bautage,
    addBautag,
    updateBautag,
    deleteBautag
  } = useERPState();

  // Simulated week offset or date helper
  const datesOfWeek = [
    { name: "Montag", date: "2026-06-01" },
    { name: "Dienstag", date: "2026-06-02" },
    { name: "Mittwoch", date: "2026-06-03" },
    { name: "Donnerstag", date: "2026-06-04" },
    { name: "Freitag", date: "2026-06-05" }, // today
    { name: "Samstag", date: "2026-06-06" },
    { name: "Sonntag", date: "2026-06-07" }
  ];

  // Active selection for click-allocation
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<string | null>(null);
  const [selectedMaschineId, setSelectedMaschineId] = useState<string | null>(null);
  const [selectedFahrzeugId, setSelectedFahrzeugId] = useState<string | null>(null);

  // Modal or drawer state for editing a slot specifically
  const [editingSlot, setEditingSlot] = useState<{ baustelleId: string; datum: string } | null>(null);
  
  // Create or retrieve active Bautag for a project and date
  const getBautagFor = (baustelleId: string, datum: string): Bautag | undefined => {
    return bautage.find(bt => bt.baustelleId === baustelleId && bt.datum === datum);
  };

  // Helper: check if a worker is already allocated elsewhere on that day
  const findStaffConflict = (mitarbeiterId: string, datum: string, currentBaustelleId: string): string | null => {
    const concurrentBautag = bautage.find(bt => 
      bt.datum === datum && 
      bt.baustelleId !== currentBaustelleId && 
      bt.mitarbeiterIds.includes(mitarbeiterId)
    );
    if (concurrentBautag) {
      const otherProject = baustellen.find(b => b.id === concurrentBautag.baustelleId);
      return otherProject ? otherProject.name : "andere Baustelle";
    }
    return null;
  };

  // Helper: check if a machine is already allocated elsewhere on that day
  const findMachineConflict = (maschineId: string, datum: string, currentBaustelleId: string): string | null => {
    const concurrentBautag = bautage.find(bt => 
      bt.datum === datum && 
      bt.baustelleId !== currentBaustelleId && 
      bt.verwendeteMaschinenIds.includes(maschineId)
    );
    if (concurrentBautag) {
      const otherProject = baustellen.find(b => b.id === concurrentBautag.baustelleId);
      return otherProject ? otherProject.name : "andere Baustelle";
    }
    return null;
  };

  // Assign current active selection to slot
  const handleSlotClick = (baustelleId: string, datum: string) => {
    let bt = getBautagFor(baustelleId, datum);
    
    // If no Bautag exists yet, create a default planned one
    if (!bt) {
      const project = baustellen.find(b => b.id === baustelleId);
      bt = {
        id: `bt-gen-${baustelleId}-${datum}`,
        baustelleId,
        datum,
        typ: project ? project.typ : "BAU",
        status: BautagStatus.GEPLANT,
        pausenzeitMinuten: 45,
        fahrzeitHinMinuten: 20,
        fahrzeitZurueckMinuten: 20,
        mitarbeiterIds: [],
        verwendeteMaschinenIds: [],
        kalkuliertesMaterial: [],
        verbrauchtesMaterial: [],
        fotosVorher: [],
        fotosNachher: []
      };
      addBautag(bt);
    }

    let updatedBt = { ...bt };
    let hasChanged = false;

    // Apply selected worker if loaded
    if (selectedMitarbeiterId) {
      if (!updatedBt.mitarbeiterIds.includes(selectedMitarbeiterId)) {
        updatedBt.mitarbeiterIds = [...updatedBt.mitarbeiterIds, selectedMitarbeiterId];
        hasChanged = true;
      }
    }

    // Apply selected machine if loaded
    if (selectedMaschineId) {
      if (!updatedBt.verwendeteMaschinenIds.includes(selectedMaschineId)) {
        updatedBt.verwendeteMaschinenIds = [...updatedBt.verwendeteMaschinenIds, selectedMaschineId];
        hasChanged = true;
      }
    }

    if (hasChanged) {
      updateBautag(updatedBt);
      // Clean active selections
      setSelectedMitarbeiterId(null);
      setSelectedMaschineId(null);
    } else {
      // If clicked without active selection, open quick edit panel
      setEditingSlot({ baustelleId, datum });
    }
  };

  const handleRemoveWorker = (bautag: Bautag, workerId: string) => {
    const updated = {
      ...bautag,
      mitarbeiterIds: bautag.mitarbeiterIds.filter(id => id !== workerId)
    };
    updateBautag(updated);
  };

  const handleRemoveMachine = (bautag: Bautag, machId: string) => {
    const updated = {
      ...bautag,
      verwendeteMaschinenIds: bautag.verwendeteMaschinenIds.filter(id => id !== machId)
    };
    updateBautag(updated);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-1" id="wochenplan-root">
      {/* 1. Left Side: Available resources */}
      <div className="xl:col-span-1 space-y-6" id="left-resource-rail">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2 text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-slate-400">Schnelles Zuweisen</h3>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal mb-4">
            Wählen Sie links eine Ressource aus, und klicken Sie anschließend im Kalender auf einen Tag, um sie direkt zu buchen.
          </p>

          {/* Mitarbeiter section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
              <span className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-emerald-600" /> Mitarbeiter
              </span>
              <span className="text-[10px] font-mono text-slate-400">{users.filter(u => u.aktiv).length} Aktiv</span>
            </div>
            
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {users.filter(u => u.aktiv).map(u => {
                const isSelected = selectedMitarbeiterId === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedMitarbeiterId(isSelected ? null : u.id);
                      setSelectedMaschineId(null);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-700 text-white shadow-sm"
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <img src={u.profilbild} alt={u.nachname} className="w-5 h-5 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[11px] truncate leading-none">{u.vorname} {u.nachname}</p>
                      <p className={`text-[9px] font-mono mt-0.5 ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>{u.rolle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Maschinen section */}
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
              <span className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1">
                <Hammer className="w-3.5 h-3.5 text-emerald-600" /> Maschinenpark
              </span>
              <span className="text-[10px] font-mono text-slate-400">{maschinen.length} Geräte</span>
            </div>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {maschinen.map(m => {
                const isSelected = selectedMaschineId === m.id;
                const isDefect = m.status === "DEFEKT";
                return (
                  <button
                    key={m.id}
                    disabled={isDefect}
                    onClick={() => {
                      setSelectedMaschineId(isSelected ? null : m.id);
                      setSelectedMitarbeiterId(null);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? "bg-amber-600 border-amber-700 text-white"
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[11px] truncate leading-none">{m.name}</p>
                      <p className={`text-[9px] font-mono mt-0.5 ${isSelected ? "text-amber-200" : "text-slate-400"}`}>{m.typ}</p>
                    </div>
                    {isDefect && (
                      <span className="text-[8px] bg-red-100 text-red-700 px-1 py-0.5 rounded uppercase font-mono">
                        Defekt
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle & Right Side: 7-Day Weekly Grid row by row */}
      <div className="xl:col-span-3 space-y-6" id="weekly-disponent-gantt">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                Zentrale Baustellen-Disposition
              </h2>
              <p className="text-xs text-slate-400">Wochenübersicht: Mo 01.06. - So 07.06.2026</p>
            </div>
            
            {/* Legend warnings check info */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" />
                Konfliktwarnung
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0" />
                Kapazität gefüllt
              </span>
            </div>
          </div>

          <div className="min-w-[900px]">
            {/* Table Header: Days columns */}
            <div className="grid grid-cols-8 gap-3 border-b border-slate-100 pb-3 font-mono text-xs text-slate-400 uppercase font-bold text-center">
              <div className="text-left font-sans font-bold text-slate-700">Baustelle (Typ/Nr)</div>
              {datesOfWeek.map((day, dIdx) => (
                <div key={dIdx} className={`p-1 rounded-lg ${day.date === "2026-06-05" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}`}>
                  <p>{day.name}</p>
                  <p className="text-[10px] font-normal font-mono opacity-80 mt-0.5">
                    {new Date(day.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>

            {/* Table Rows for projects */}
            <div className="divide-y divide-slate-100/80 mt-3 space-y-3">
              {baustellen.filter(b => b.status === "AKTIV" || b.status === "GEPLANT").map(project => {
                return (
                  <div key={project.id} className="grid grid-cols-8 gap-3 py-3 items-stretch">
                    {/* Project details card column */}
                    <div className="flex flex-col justify-center pr-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded ${
                          project.typ === "BAU" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {project.typ}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{project.baustellennummer}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-1.5 truncate leading-tight">{project.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{project.kundenname}</p>
                    </div>

                    {/* Columns Montag to Sunday */}
                    {datesOfWeek.map((dayOfW, dayIdx) => {
                      const bt = getBautagFor(project.id, dayOfW.date);
                      const hasAssigned = bt && (bt.mitarbeiterIds.length > 0 || bt.verwendeteMaschinenIds.length > 0);

                      // Calculate capacity warnings: e.g. for BAU sites we expect at least 2 workers
                      const capacityWarning = bt && bt.mitarbeiterIds.length < 2 && project.typ === "BAU" && bt.status !== "ABGESCHLOSSEN";

                      return (
                        <div
                          key={dayIdx}
                          onClick={() => handleSlotClick(project.id, dayOfW.date)}
                          className={`rounded-xl p-2.5 transition-all flex flex-col justify-between border ring-inset cursor-pointer min-h-[140px] hover:ring-2 hover:ring-emerald-500/20 ${
                            hasAssigned
                              ? "bg-slate-50/50 border-slate-200"
                              : "bg-white border-dashed border-slate-200 hover:border-slate-400"
                          } ${
                            dayOfW.date === "2026-06-05" ? "ring-1 ring-emerald-500 bg-emerald-50/20" : ""
                          }`}
                        >
                          {/* Inside cell layout */}
                          {bt ? (
                            <div className="space-y-2 text-[10px] h-full flex flex-col justify-between">
                              {/* Top bar indicators */}
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] px-1 bg-slate-200 text-slate-600 rounded font-mono uppercase">
                                  {bt.status}
                                </span>
                                {capacityWarning && (
                                  <span
                                    title="Kapazitätswarnung: Weniger als 2 Mitarbeiter für Bauprojekt eingeteilt!"
                                    className="p-0.5 bg-amber-100 text-amber-700 rounded-full"
                                  >
                                    <TriangleAlert className="w-3 h-3" />
                                  </span>
                                )}
                              </div>

                              {/* Allocated Staff list */}
                              <div className="space-y-1 my-1 flex-1">
                                {bt.mitarbeiterIds.map(stId => {
                                  const person = users.find(u => u.id === stId);
                                  if (!person) return null;
                                  
                                  const conflict = findStaffConflict(person.id, dayOfW.date, project.id);

                                  return (
                                    <div
                                      key={stId}
                                      onClick={(e) => { e.stopPropagation(); }}
                                      className={`p-1 rounded text-[9px] flex items-center justify-between leading-none ${
                                        conflict
                                          ? "bg-red-50 text-red-800 border border-red-100"
                                          : "bg-slate-100 text-slate-700 border border-slate-200"
                                      }`}
                                      title={conflict ? `KOLLISION: Eingeteilt bei: ${conflict}` : ""}
                                    >
                                      <span className="truncate max-w-[70px]">
                                        {person.vorname} {person.nachname.charAt(0)}.
                                      </span>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveWorker(bt, person.id);
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-0.5"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}

                                {/* Machine items list inside slots */}
                                {bt.verwendeteMaschinenIds.map(mId => {
                                  const mch = maschinen.find(m => m.id === mId);
                                  if (!mch) return null;

                                  const conflict = findMachineConflict(mch.id, dayOfW.date, project.id);

                                  return (
                                    <div
                                      key={mId}
                                      onClick={(e) => { e.stopPropagation(); }}
                                      className={`p-1 rounded text-[9px] flex items-center justify-between font-mono leading-none ${
                                        conflict
                                          ? "bg-red-50 text-red-800 border border-red-100"
                                          : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                      }`}
                                      title={conflict ? `MASCHINEN-KOLLISION: Einsatz bei: ${conflict}` : "Maschine zugewiesen"}
                                    >
                                      <span className="truncate max-w-[70px]">{mch.name}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveMachine(bt, mch.id);
                                        }}
                                        className="text-emerald-600 hover:text-red-500 p-0.5"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-1 flex items-center justify-center gap-0.5 hover:text-slate-600">
                                <PlusCircle className="w-2.5 h-2.5" /> Hinzufügen
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col justify-center items-center text-slate-300 hover:text-slate-400 py-6">
                              <PlusCircle className="w-5 h-5 stroke-[1.5] mb-1" />
                              <span className="text-[9px] tracking-wider uppercase font-mono">Planen</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Drawer Modal Component for detailed adjustments */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 h-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Dispositions-Detailplaner</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Datum: {new Date(editingSlot.datum).toLocaleDateString("de-DE")}
                </p>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-2 text-xl font-mono"
              >
                ×
              </button>
            </div>

            {/* Quick checkbox builder inside local Bautag slot */}
            {(() => {
              const project = baustellen.find(b => b.id === editingSlot.baustelleId);
              let bt = getBautagFor(editingSlot.baustelleId, editingSlot.datum);
              
              const initBautag = () => {
                const defaultBt: Bautag = {
                  id: `bt-gen-${editingSlot.baustelleId}-${editingSlot.datum}`,
                  baustelleId: editingSlot.baustelleId,
                  datum: editingSlot.datum,
                  typ: project ? project.typ : "BAU",
                  status: BautagStatus.GEPLANT,
                  pausenzeitMinuten: 45,
                  fahrzeitHinMinuten: 20,
                  fahrzeitZurueckMinuten: 20,
                  mitarbeiterIds: [],
                  verwendeteMaschinenIds: [],
                  kalkuliertesMaterial: [],
                  verbrauchtesMaterial: [],
                  fotosVorher: [],
                  fotosNachher: []
                };
                addBautag(defaultBt);
                return defaultBt;
              };

              const activeBt = bt || initBautag();

              const toggleStaffInList = (id: string) => {
                const isPresent = activeBt.mitarbeiterIds.includes(id);
                const nextM = isPresent
                  ? activeBt.mitarbeiterIds.filter(mid => mid !== id)
                  : [...activeBt.mitarbeiterIds, id];
                updateBautag({ ...activeBt, mitarbeiterIds: nextM });
              };

              const toggleMachineInList = (id: string) => {
                const isPresent = activeBt.verwendeteMaschinenIds.includes(id);
                const nextM = isPresent
                  ? activeBt.verwendeteMaschinenIds.filter(mid => mid !== id)
                  : [...activeBt.verwendeteMaschinenIds, id];
                updateBautag({ ...activeBt, verwendeteMaschinenIds: nextM });
              };

              return (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-700">{project?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{project?.kundenadresse}</p>
                  </div>

                  {/* Status switcher */}
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wide mb-1 font-mono font-bold">Wochenplaner-Status</label>
                    <div className="flex gap-2">
                      {["GEPLANT", "LAUFEND", "ABGESCHLOSSEN"].map(st => (
                        <button
                          key={st}
                          onClick={() => updateBautag({ ...activeBt, status: st as BautagStatus })}
                          className={`flex-1 py-1 rounded text-[11px] font-mono border ${
                            activeBt.status === st
                              ? "bg-slate-800 text-white border-slate-900"
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkbox staff lists */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wide font-mono font-bold">Arbeiter zuweisen</label>
                    <div className="max-h-[120px] overflow-y-auto space-y-1 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                      {users.map(u => {
                        const isChecked = activeBt.mitarbeiterIds.includes(u.id);
                        const conflict = findStaffConflict(u.id, editingSlot.datum, editingSlot.baustelleId);

                        return (
                          <label key={u.id} className="flex items-center gap-2 max-w-full truncate text-xs cursor-pointer p-1 rounded hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStaffInList(u.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700">{u.vorname} {u.nachname}</span>
                            {conflict && (
                              <span className="text-[8px] bg-red-100 text-red-700 border border-red-200 px-1 py-0.2 rounded shrink-0">
                                Kollision: {conflict}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checkbox machinery list */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wide font-mono font-bold">Maschinen zuweisen</label>
                    <div className="max-h-[100px] overflow-y-auto space-y-1 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                      {maschinen.map(m => {
                        const isChecked = activeBt.verwendeteMaschinenIds.includes(m.id);
                        const conflict = findMachineConflict(m.id, editingSlot.datum, editingSlot.baustelleId);

                        return (
                          <label key={m.id} className="flex items-center gap-2 max-w-full truncate text-xs cursor-pointer p-1 rounded hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMachineInList(m.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700">{m.name}</span>
                            {conflict && (
                              <span className="text-[8px] bg-red-100 text-red-700 border border-red-200 px-1 py-0.2 rounded shrink-0">
                                Kollision: {conflict}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        if (confirm("Möchten Sie diesen geplanten Bautag komplett löschen?")) {
                          deleteBautag(activeBt.id);
                          setEditingSlot(null);
                        }
                      }}
                      className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Löschen
                    </button>
                    <button
                      onClick={() => setEditingSlot(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium py-1.5 px-4 rounded-xl text-xs text-center cursor-pointer"
                    >
                      Disposition Speichern
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
