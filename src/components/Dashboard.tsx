/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useERPState } from "../data/StateContext";
import { BaustellenStatus, UserRolle, MaschinenStatus, FahrzeugStatus } from "../types";
import {
  TrendingUp,
  TriangleAlert,
  Users2,
  CalendarDays,
  Hammer,
  Truck,
  Droplet,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Warehouse,
  CloudSun,
  MapPin,
  Calendar
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    users,
    materials,
    maschinen,
    fahrzeuge,
    baustellen,
    bautage,
    zeiterfassungen
  } = useERPState();

  const todayStr = "2026-06-05"; // Simulated context date

  // Generate days in the week around Friday, June 5, 2026: Mon 1. June to Sun 7. June
  const weekDays = [
    { key: "Mon", name: "Montag", date: "2026-06-01" },
    { key: "Tue", name: "Dienstag", date: "2026-06-02" },
    { key: "Wed", name: "Mittwoch", date: "2026-06-03" },
    { key: "Thu", name: "Donnerstag", date: "2026-06-04" },
    { key: "Fri", name: "Freitag", date: "2026-06-05" },
    { key: "Sat", name: "Samstag", date: "2026-06-06" },
    { key: "Sun", name: "Sonntag", date: "2026-06-07" }
  ];

  // If the logged-in user is a worker, render the custom single-view dashboard
  if (currentUser.rolle !== UserRolle.ADMIN) {
    const myTodayBautage = bautage.filter(bt =>
      bt.datum === todayStr && bt.mitarbeiterIds.includes(currentUser.id)
    );

    const istStunden = currentUser.iststundenMonat ?? 158;
    const sollStunden = currentUser.sollstundenMonat ?? 160;
    const stundenPercent = Math.min(100, Math.round((istStunden / sollStunden) * 100));

    return (
      <div className="space-y-6 animate-fade-in" id="worker-dashboard-container">
        {/* 1. Welcoming & Work Hours Widget */}
        <div className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm overflow-hidden relative">
          {/* Subtle background plant pattern icon */}
          <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
            <Warehouse className="w-64 h-64 translate-x-12 -translate-y-12 text-emerald-950" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
            {/* Left Column: Greeting, Date, Weather */}
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Mitarbeiter Dashboard
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-950 font-sans tracking-tight">
                  Guten Tag, {currentUser.vorname}!
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-emerald-800/80">
                  <span className="flex items-center gap-1 bg-emerald-50/60 px-2.5 py-0.5 rounded border border-emerald-100/30 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Freitag, 05. Juni 2026
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span className="flex items-center gap-1 bg-emerald-50/60 px-2.5 py-0.5 rounded border border-emerald-100/30 font-medium">
                    <CloudSun className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                    Wetter: {myTodayBautage[0]?.wetter || "Sonnig, 21°C"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Month Hours Progress Widget */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4.5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-emerald-900 font-sans">Monatsstunden</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                  {stundenPercent}% Erreicht
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-black text-emerald-950 font-mono tracking-tight">
                  {istStunden.toFixed(1)} <span className="text-xs font-normal text-emerald-700">von {sollStunden} Std.</span>
                </p>
                <span className="text-[10px] text-emerald-700/75 font-mono">Rest: {(sollStunden - istStunden > 0 ? (sollStunden - istStunden).toFixed(1) : "0")} Std.</span>
              </div>
              {/* Hours progress bar */}
              <div className="w-full bg-emerald-200/30 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${stundenPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Today's Worksite Overview Widget */}
        <div className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-50 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-emerald-950 text-xs tracking-tight uppercase font-sans">
                Heutige Baustelle
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200/50">
              Einteilung für den 05.06.2026
            </span>
          </div>

          {myTodayBautage.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/20 border border-dashed border-emerald-200 rounded-xl text-xs text-emerald-800/60 font-sans italic">
              Heute sind Sie auf keiner aktiven Baustelle eingeteilt (z.B. Urlaub, Krankheit oder administrative Aufgaben).
            </div>
          ) : (
            (() => {
              const activeBt = myTodayBautage[0];
              const project = baustellen.find(b => b.id === activeBt.baustelleId);
              if (!project) {
                return (
                  <div className="p-4 text-center text-xs text-emerald-800/60">
                    Ungültige Zuweisung. Bitte wenden Sie sich an die Bauleitung.
                  </div>
                );
              }

              const assignedColleagues = users.filter(u => activeBt.mitarbeiterIds.includes(u.id));
              const activeMachines = maschinen.filter(m => activeBt.verwendeteMaschinenIds.includes(m.id));

              return (
                <div className="space-y-5" id="today-worksite-card">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                          project.typ === "BAU" ? "bg-amber-100 text-amber-800 border border-amber-200/60" : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                        }`}>
                          {project.typ === "BAU" ? "Gartenbau & Pflasterung" : "Gartenpflege & Pflanzung"}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700/60 font-bold">{project.baustellennummer}</span>
                      </div>
                      <h4 className="font-black text-emerald-950 text-base mt-2 tracking-tight">
                        {project.name}
                      </h4>
                      <p className="text-xs text-emerald-800/70 mt-1 font-medium flex items-center gap-1.5 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {project.kundenadresse}
                      </p>
                    </div>

                    {/* Google navigation helper */}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(project.kundenadresse)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm shadow-emerald-900/10 cursor-pointer self-start font-sans"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Route starten</span>
                    </a>
                  </div>

                  {project.beschreibung && (
                    <div className="bg-emerald-50/20 p-3.5 rounded-xl border border-emerald-100/50 text-xs text-emerald-950 leading-relaxed font-sans">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-emerald-700 block mb-1">
                        Tagesziel & Beschreibung
                      </span>
                      {project.beschreibung}
                    </div>
                  )}

                  {activeBt.bemerkungen && (
                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/40 text-xs text-amber-900 leading-relaxed font-sans">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-amber-700 block mb-1">
                        Wichtige Anmerkung für heute
                      </span>
                      {activeBt.bemerkungen}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-50">
                    {/* Crew list */}
                    <div>
                      <p className="text-[10px] font-mono text-emerald-800/60 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5 text-emerald-600" />
                        Heutiges Team vor Ort ({assignedColleagues.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedColleagues.map(colleague => (
                          <div
                            key={colleague.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-sans ${
                              colleague.id === currentUser.id 
                                ? "bg-emerald-50 text-emerald-900 border-emerald-200/80 font-bold" 
                                : "bg-white text-emerald-950 border-emerald-100/80"
                            }`}
                          >
                            <img
                              src={colleague.profilbild}
                              alt={colleague.nachname}
                              className="w-4 h-4 rounded-full object-cover border border-emerald-200/50"
                            />
                            <span className="truncate max-w-[120px]">
                              {colleague.vorname} {colleague.nachname.charAt(0)}. {colleague.id === currentUser.id && "(Du)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Machinery list */}
                    <div>
                      <p className="text-[10px] font-mono text-emerald-800/60 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                        <Hammer className="w-3.5 h-3.5 text-emerald-600" />
                        Maschinen & Fahrzeuge
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {activeMachines.length === 0 ? (
                          <span className="text-xs text-emerald-700/50 italic py-1 pl-1">Keine Großgeräte zugewiesen</span>
                        ) : (
                          activeMachines.map(mac => (
                            <span
                              key={mac.id}
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50/40 text-emerald-900 text-xs border border-emerald-100/55 font-mono"
                            >
                              {mac.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* 3. Wochenplan (Weekly Schedule) */}
        <div className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-50 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-emerald-950 text-xs tracking-tight uppercase font-sans">
                Wochenplan (KW 23)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700/65 tracking-wider hidden sm:inline">
              Montag 01.06. - Sonntag 07.06.2026
            </span>
          </div>

          <div className="divide-y divide-emerald-50 font-sans">
            {weekDays.map(day => {
              const isToday = day.date === todayStr;
              
              // Find assignment
              const dayBt = bautage.find(bt => bt.datum === day.date && bt.mitarbeiterIds.includes(currentUser.id));
              const dayProject = dayBt ? baustellen.find(b => b.id === dayBt.baustelleId) : null;

              return (
                <div
                  key={day.key}
                  className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 -mx-3.5 transition-all text-sm ${
                    isToday 
                      ? "bg-emerald-50/50 rounded-xl border border-emerald-100/60 font-bold" 
                      : "hover:bg-emerald-50/10"
                  }`}
                >
                  {/* Day Date Column */}
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono select-none ${
                      isToday 
                        ? "bg-emerald-600 text-white font-bold" 
                        : "bg-emerald-50 text-emerald-800"
                    }`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                        {day.key === "Mon" ? "Mo" : day.key === "Tue" ? "Di" : day.key === "Wed" ? "Mi" : day.key === "Thu" ? "Do" : day.key === "Fri" ? "Fr" : day.key === "Sat" ? "Sa" : "So"}
                      </span>
                      <span className="text-xs font-bold leading-none mt-1">
                        {day.date.split("-")[2]}
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isToday ? "text-emerald-950" : "text-emerald-900"}`}>
                        {day.name} {isToday && <span className="text-[9px] bg-emerald-200/60 text-emerald-800 font-mono px-1.5 py-0.2 rounded uppercase ml-1">Heute</span>}
                      </p>
                      <p className="text-[10px] text-emerald-700/50 font-mono mt-0.5">
                        {new Date(day.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}.2026
                      </p>
                    </div>
                  </div>

                  {/* Project Allocation Column */}
                  <div className="flex-1 min-w-0 sm:pl-4">
                    {dayProject ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-950 truncate">
                            {dayProject.name}
                          </h4>
                          <p className="text-[10px] text-emerald-700/60 truncate mt-0.5">
                            Kunde: {dayProject.kundenname} • Ort: {dayProject.kundenadresse.split(",")[0]}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                          <span className={`${isToday ? "text-[8px] bg-white border border-emerald-250/20 shadow-xs" : "text-[8px] border border-emerald-100"} px-1.5 py-0.5 font-mono uppercase font-bold rounded ${
                            dayProject.typ === "BAU" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                          }`}>
                            {dayProject.typ}
                          </span>
                          {dayBt.status === "ABGESCHLOSSEN" && (
                            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.1 rounded border border-emerald-100">
                              Erledigt
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-700/40 italic font-sans">
                        Keine Zuweisung (Frei / Berufsschule)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Metrics calculations
  const activeBaustellen = baustellen.filter(b => b.status === BaustellenStatus.AKTIV);
  const plannedBaustellen = baustellen.filter(b => b.status === BaustellenStatus.GEPLANT);
  
  // Find current day's active Bautage
  const todayBautage = bautage.filter(bt => bt.datum === todayStr);

  // Employees assigned today
  const assignedEmployeeIds = todayBautage.reduce<string[]>((acc, bt) => {
    return [...acc, ...bt.mitarbeiterIds];
  }, []);
  const uniquelyAssignedStaff = Array.from(new Set(assignedEmployeeIds));

  // Low materials stock level alert
  const lowStockMaterials = materials.filter(m => m.aktuellerBestand < m.mindestbestand);

  // Machine issues (SCHLECHT or DEFEKT)
  const faultyMachines = maschinen.filter(m => 
    m.status === MaschinenStatus.DEFEKT || m.status === MaschinenStatus.SCHLECHT
  );

  // Vehicle issues (WARTUNG or DEFEKT)
  const faultyFleet = fahrzeuge.filter(f => 
    f.status === FahrzeugStatus.WARTUNG || f.status === FahrzeugStatus.DEFEKT
  );

  // Total finances
  const totalRevenue = baustellen.reduce((sum, b) => sum + b.endpreis, 0);
  const totalActualCosts = baustellen.reduce((sum, b) => sum + b.tatsaechlicheLohnkosten + b.tatsaechlicheMaterialkosten, 0);
  const estimatedProfit = totalRevenue - totalActualCosts;

  // Render elegant custom SVG bar charts for month breakdown
  const revenueHistory = [
    { month: "Jan", rev: 18000, cost: 12000 },
    { month: "Feb", rev: 22000, cost: 15000 },
    { month: "Mär", rev: 35000, cost: 24000 },
    { month: "Apr", rev: 58000, cost: 38000 },
    { month: "Mai", rev: 72000, cost: 49000 },
    { month: "Jun", rev: 84500, cost: 51000 } // Current June projection based on active
  ];

  const maxVal = Math.max(...revenueHistory.map(r => r.rev));

  return (
    <div className="space-y-6" id="dashboard-wrapper">
      {/* Upper Welcome and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm" id="welcome-header">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <Sparkles className="w-3.5 h-3.5" />
            Willkommen im ERP-Portal
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mt-2">
            Servus, {currentUser.vorname}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hier ist der tagesaktuelle Status für das GaLaBau-Zentrum. Heute ist Freitag, der{" "}
            <strong>05. Juni 2026</strong>.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs text-slate-600">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Eingeschriebene Belegschaft</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">{users.length} Mitarbeiter</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Baustellen Aktiv / Geplant</div>
            <div className="font-bold text-slate-800 text-sm mt-0.5">
              {activeBaustellen.length} / {plannedBaustellen.length} Projekte
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 font-mono block">AKTIVE BAUSTELLEN</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{activeBaustellen.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Laufende Gartenprojekte</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 font-mono block">TEAM DISPONIERTHETSGRAD</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {Math.round((uniquelyAssignedStaff.length / Math.max(1, users.filter(u => u.rolle !== UserRolle.ADMIN && u.aktiv).length)) * 100)}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {uniquelyAssignedStaff.length} von {users.filter(u => u.rolle !== UserRolle.ADMIN && u.aktiv).length} Handwerkern vor Ort
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 font-mono block">ERWARTETER GEWINN (KUM.)</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight">
              €{estimatedProfit.toLocaleString("de-DE", { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
              Deckungsbeitrag: {Math.round((estimatedProfit / Math.max(1, totalRevenue)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TriangleAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 font-mono block">STÖRUNGEN & KRITISCHES</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {lowStockMaterials.length + faultyMachines.length + faultyFleet.length}
            </span>
            <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
              {lowStockMaterials.length} Lagerwarnungen | {faultyMachines.length + faultyFleet.length} Defekte
            </span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-detail-grid">
        {/* Left column: Today's scheduling + Active projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Scheduling and deployment list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Heute eingeplante Baustellenbelegung</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Wer arbeitet heute woran?</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium border border-emerald-100">
                05.06.2026
              </span>
            </div>

            {todayBautage.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl text-xs font-sans">
                Keine Baustellenplanung für den heutigen Kalendertag hinterlegt.
              </div>
            ) : (
              <div className="space-y-3">
                {todayBautage.map(bt => {
                  const project = baustellen.find(b => b.id === bt.baustelleId);
                  if (!project) return null;
                  
                  // Map worker IDs to users
                  const assignedStaff = users.filter(u => bt.mitarbeiterIds.includes(u.id));
                  const assignedMachinery = maschinen.filter(m => bt.verwendeteMaschinenIds.includes(m.id));

                  return (
                    <div
                      key={bt.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors bg-gradient-to-r from-white to-slate-50/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-mono rounded ${
                              project.typ === "BAU" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {project.typ}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{project.baustellennummer}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs mt-1.5 truncate">{project.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{project.kundenadresse}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="inline-flex px-2 py-1 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 leading-none">
                            {bt.status === "LAUFEND" ? "Aktiv Vor Ort" : "Disponiert"}
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-1 font-mono">
                            Ankunft: {bt.ankunftszeit ? new Date(bt.ankunftszeit).toLocaleTimeString("de-DE", {hour: "2-digit", minute:"2-digit"}) + " Uhr" : "7:00 Uhr"}
                          </span>
                        </div>
                      </div>

                      {/* Display workers and machines */}
                      <div className="mt-4 pt-3 border-t border-slate-100/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Users2 className="w-3 h-3 text-slate-500" /> Crew vor Ort ({assignedStaff.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {assignedStaff.map(staff => (
                              <div
                                key={staff.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200"
                              >
                                <img
                                  src={staff.profilbild}
                                  alt={staff.nachname}
                                  className="w-3.5 h-3.5 rounded-full object-cover"
                                />
                                <span className="truncate max-w-[100px]">
                                  {staff.vorname} {staff.nachname.charAt(0)}.
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Hammer className="w-3 h-3 text-slate-500" /> Zugewiesener Fuhrpark:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {assignedMachinery.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic font-sans py-0.5">Keine Großgeräte</span>
                            ) : (
                              assignedMachinery.map(mach => (
                                <span
                                  key={mach.id}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] border border-slate-200"
                                >
                                  {mach.name}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Projects Financial / Progress Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Projektfortschritt & Kostenübersicht</h3>
            <div className="space-y-4">
              {activeBaustellen.map(prj => {
                const totalCalculated = prj.kalkulierteLohnkosten + prj.kalkulierteMaterialkosten;
                const totalActual = prj.tatsaechlicheLohnkosten + prj.tatsaechlicheMaterialkosten;
                const budgetPercent = Math.min(100, Math.round((totalActual / Math.max(1, totalCalculated)) * 100));
                
                // Color status logic
                let budgetColor = "bg-emerald-500";
                if (budgetPercent > 90) budgetColor = "bg-red-500";
                else if (budgetPercent > 75) budgetColor = "bg-amber-500";

                return (
                  <div key={prj.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 text-[12px]">{prj.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{prj.kundenname}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-slate-700">
                          €{totalActual.toLocaleString("de-DE")} / €{totalCalculated.toLocaleString("de-DE")}
                        </span>
                        <span className="block text-[10px] text-slate-400">Budget verbraucht ({budgetPercent}%)</span>
                      </div>
                    </div>
                    {/* Visual bar tracker */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${budgetColor} transition-all duration-500`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Incidents / Alert logs + Calendar Overviews */}
        <div className="space-y-6">
          {/* Alert Logs Widget: Material Stock & Maintenance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
              <TriangleAlert className="w-4 h-4 text-amber-500" />
              Lager- & Wartungsalarme
            </h3>
            <p className="text-xs text-slate-400 font-sans mb-4">Erforderliche administrative Aktionen</p>

            <div className="space-y-3">
              {/* Material deficits alerts */}
              {lowStockMaterials.map(mat => (
                <div
                  key={mat.id}
                  className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2 text-xs"
                >
                  <Warehouse className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-amber-900 leading-tight">Mindestbestand unterschritten</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 truncate">{mat.name}</p>
                    <p className="text-[10px] font-mono text-amber-700 mt-1">
                      Bestand: <strong className="text-red-600">{mat.aktuellerBestand} {mat.einheit}</strong> (Min: {mat.mindestbestand} {mat.einheit})
                    </p>
                  </div>
                </div>
              ))}

              {/* Machinery defect alert */}
              {faultyMachines.map(mach => (
                <div
                  key={mach.id}
                  className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-2 text-xs"
                >
                  <Hammer className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-red-900 leading-tight">Gerät defekt/wartungsbedürftig</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 truncate">{mach.name}</p>
                    <p className="text-[10px] font-mono text-red-700 mt-1">
                      Status: <strong className="uppercase">{mach.status}</strong> | Standort: {mach.aktuellerStandort}
                    </p>
                  </div>
                </div>
              ))}

              {/* Vehicle inspections needed alerts */}
              {faultyFleet.map(veh => (
                <div
                  key={veh.id}
                  className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2 text-xs"
                >
                  <Truck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-indigo-950 leading-tight">Prüfung fällig</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 truncate">{veh.bezeichnung} ({veh.kennzeichen})</p>
                    <p className="text-[10px] font-mono text-indigo-600 mt-1">
                      Nächste Inspektion: {new Date(veh.naechsteInspektion).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
              ))}

              {lowStockMaterials.length === 0 && faultyMachines.length === 0 && faultyFleet.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl">
                  Alle Lager- & Wartungswerte im optimalen grünen Bereich.
                </div>
              )}
            </div>
          </div>

          {/* Graphical Month Sales / Costs Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="graphics-tab">
            <h3 className="font-bold text-slate-800 text-sm mb-1.5">Umsatz pro Monat</h3>
            <p className="text-xs text-slate-400 font-sans mb-4">Soll/Ist-Verlauf 2026 (Erstes Halbjahr)</p>
            
            {/* Custom SVG diagram - highly secure against package conflicts */}
            <div className="relative pt-4">
              <div className="flex h-36 items-end gap-3.5 pb-2 border-b border-slate-100">
                {revenueHistory.map((h, i) => {
                  const revHeight = Math.max(10, Math.round((h.rev / maxVal) * 100));
                  const costHeight = Math.max(8, Math.round((h.cost / maxVal) * 100));

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white font-mono text-[9px] p-2 rounded shadow-xl z-20 whitespace-nowrap leading-tight text-center">
                        <p className="font-bold">Umsatz: €{h.rev.toLocaleString()}</p>
                        <p className="text-slate-400">Kosten: €{h.cost.toLocaleString()}</p>
                      </div>

                      <div className="w-full flex justify-center gap-1 h-full items-end max-w-[45px]">
                        {/* Cost Bar */}
                        <div
                          style={{ height: `${costHeight}%` }}
                          className="w-2.5 bg-slate-200 rounded-t-sm group-hover:bg-slate-300 transition-colors"
                        />
                        {/* Revenue Bar */}
                        <div
                          style={{ height: `${revHeight}%` }}
                          className="w-2.5 bg-emerald-600 rounded-t-sm group-hover:bg-emerald-500 transition-colors"
                        />
                      </div>
                      <span className="text-[10px] mt-2 font-mono text-slate-400 font-medium block">
                        {h.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />
                  Umsatz
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-sm" />
                  Kosten (Lohn + Material)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
