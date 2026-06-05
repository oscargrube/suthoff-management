/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { ArrowRightLeft, Calendar, History, MapPin } from "lucide-react";

export const WochenstundenBereich: React.FC = () => {
  const { currentUser, bautage, baustellen, zeiterfassungen, maschinen } = useERPState();

  const todayStr = "2026-06-05";

  // Corrective log request model
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionDatum, setCorrectionDatum] = useState("");
  const [correctionSoll, setCorrectionSoll] = useState("8.0");
  const [correctionGrund, setCorrectionGrund] = useState("");

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Korrekturanfrage für den ${new Date(correctionDatum).toLocaleDateString("de-DE")} über ${correctionSoll} Std gesendet!\nBegründung: "${correctionGrund}"`
    );
    setShowCorrectionForm(false);
    setCorrectionGrund("");
  };

  const weekDays = [
    { key: "Mon", name: "Montag", date: "2026-06-01" },
    { key: "Tue", name: "Dienstag", date: "2026-06-02" },
    { key: "Wed", name: "Mittwoch", date: "2026-06-03" },
    { key: "Thu", name: "Donnerstag", date: "2026-06-04" },
    { key: "Fri", name: "Freitag", date: "2026-06-05" },
    { key: "Sat", name: "Samstag", date: "2026-06-06" },
    { key: "Sun", name: "Sonntag", date: "2026-06-07" },
  ];

  const myHistory = zeiterfassungen.filter((z) => z.userId === currentUser.id);

  return (
    <div className="space-y-6" id="wochenplan-stunden-root">
      {/* Top hours balance dashboard widget */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-emerald-50 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Stundenkonto & Abrechnungsstand (Monat)
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Soll/Ist-Vergleich für den aktuellen Leistungszeitraum
            </p>
          </div>
          <button
            onClick={() => setShowCorrectionForm(!showCorrectionForm)}
            className="text-xs font-bold px-3 py-2 text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
            <span>Korrekturbuchung beantragen</span>
          </button>
        </div>

        {/* Quick compare parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 text-center">
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">
              Sollstunden / Monat
            </span>
            <p className="text-xl font-black text-slate-800 mt-1">
              {currentUser.sollstundenMonat || 160}{" "}
              <span className="text-xs font-normal text-slate-450">Std</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl">
            <span className="text-[10px] text-emerald-800/80 uppercase font-mono tracking-wide font-bold">
              Iststunden / Monat
            </span>
            <p className="text-xl font-black text-emerald-900 mt-1">
              {currentUser.iststundenMonat || 158.0}{" "}
              <span className="text-xs font-bold text-emerald-700">Std</span>
            </p>
            <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase block mt-1 w-max mx-auto">
              {Math.round(
                ((currentUser.iststundenMonat || 158) / (currentUser.sollstundenMonat || 160)) * 100
              )}
              % erreicht
            </span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">
              Überstundenkonto (Gesamt)
            </span>
            <p className="text-xl font-black text-emerald-750 mt-1">
              +12.4 <span className="text-xs font-normal text-slate-450">Std</span>
            </p>
          </div>
        </div>

        {/* Progress Bar of hours achieved */}
        <div className="bg-emerald-200/20 rounded-full h-3.5 overflow-hidden border border-emerald-100/50 relative">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  ((currentUser.iststundenMonat || 158) / (currentUser.sollstundenMonat || 160)) * 100
                )
              )}%`,
            }}
          />
        </div>

        {/* Correction form */}
        {showCorrectionForm && (
          <form
            onSubmit={handleCorrectionSubmit}
            className="mt-6 p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3 animate-fade-in relative z-15"
          >
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Nachträgliche manuelle Korrekturbuchung beantragen
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-550">Arbeitstag Auswählen</label>
                <input
                  type="date"
                  required
                  value={correctionDatum}
                  onChange={(e) => setCorrectionDatum(e.target.value)}
                  className="w-full bg-white mt-1 rounded-xl p-2 border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-550">Tatsächliche Stunden</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={correctionSoll}
                  onChange={(e) => setCorrectionSoll(e.target.value)}
                  className="w-full bg-white mt-1 rounded-xl p-2 border border-slate-200 text-xs font-mono text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-550 text-xs">Grund für die manuelle Korrektur</label>
              <input
                type="text"
                required
                value={correctionGrund}
                onChange={(e) => setCorrectionGrund(e.target.value)}
                className="w-full bg-white mt-1 rounded-xl p-2 border border-slate-200 text-xs font-sans"
                placeholder="WLAN Ausfall im Mobilfunknetz vor Ort, Tablet-App nicht synchronisationsfähig gewesen."
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowCorrectionForm(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-650 font-bold"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
              >
                Antrag absenden
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wochenplan Schedule Widget */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center border-b border-emerald-50 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-850 text-xs tracking-tight uppercase">
                Wochenplan (KW 23)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-800/60 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
              Montag, 01. Juni bis Sonntag, 07. Juni 2026
            </span>
          </div>

          <div className="divide-y divide-emerald-50 select-none">
            {weekDays.map((day) => {
              const isToday = day.date === todayStr;

              // Find day's assignment for current worker
              const dayBt = bautage.find(
                (bt) => bt.datum === day.date && bt.mitarbeiterIds.includes(currentUser.id)
              );
              const dayProject = dayBt ? baustellen.find((b) => b.id === dayBt.baustelleId) : null;

              return (
                <div
                  key={day.key}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 -mx-3.5 transition-all text-xs ${
                    isToday
                      ? "bg-emerald-50/50 rounded-xl border border-emerald-100 font-bold"
                      : "hover:bg-emerald-50/10"
                  }`}
                >
                  {/* Day description bar column */}
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono ${
                        isToday
                          ? "bg-emerald-600 text-white font-black shadow-xs shadow-emerald-650"
                          : "bg-emerald-50 text-emerald-800 font-bold"
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider leading-none">
                        {day.key === "Mon"
                          ? "Mo"
                          : day.key === "Tue"
                          ? "Di"
                          : day.key === "Wed"
                          ? "Mi"
                          : day.key === "Thu"
                          ? "Do"
                          : day.key === "Fri"
                          ? "Fr"
                          : day.key === "Sat"
                          ? "Sa"
                          : "So"}
                      </span>
                      <span className="text-xs leading-none mt-1 font-black">
                        {day.date.split("-")[2]}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-black ${
                          isToday ? "text-emerald-950" : "text-slate-800"
                        }`}
                      >
                        {day.name}{" "}
                        {isToday && (
                          <span className="text-[8px] bg-emerald-200 text-emerald-850 px-1.5 py-0.2 rounded-md font-mono uppercase ml-1">
                            Heute
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[sky-900]/40 font-mono mt-0.5">
                        {day.date.split("-")[2]}.{day.date.split("-")[1]}.2026
                      </p>
                    </div>
                  </div>

                  {/* Allocated Project / Activity */}
                  <div className="flex-1 min-w-0 sm:pl-4">
                    {dayProject ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-850 truncate">
                            {dayProject.name}
                          </h4>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5 font-medium">
                            Adresse: {dayProject.kundenadresse.split(",")[0]} • Kunde:{" "}
                            {dayProject.kundenname}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                          <span
                            className={`text-[8.5px] font-mono uppercase font-black px-2 py-0.5 rounded border border-emerald-100/30 ${
                              dayProject.typ === "BAU"
                                ? "bg-amber-100 text-amber-850"
                                : "bg-emerald-50/60 text-emerald-850"
                            }`}
                          >
                            {dayProject.typ}
                          </span>
                          {dayBt.status === "ABGESCHLOSSEN" && (
                            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-100/30 px-1.5 py-0.5 rounded-full border border-emerald-100/50">
                              Erledigt
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">
                        Keine Einteilung geplant (Frei / Berufsschule/ Krank)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Timesheets List */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs lg:col-span-1">
          <h3 className="font-bold text-slate-850 text-xs tracking-tight uppercase border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            Letzte Zeiteinträge
          </h3>

          <div className="space-y-2.5">
            {myHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Noch keine historischen Stunden erfasst.
              </p>
            ) : (
              myHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 font-sans"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-705">
                        {new Date(item.datum).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {item.checkIn
                          ? new Date(item.checkIn).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " Uhr"
                          : "Manuell"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-slate-800">
                      {item.arbeitszeitNetto} Std
                    </span>
                    <span
                      className={`block text-[9px] font-mono px-1.5 py-0.2 rounded mt-1.5 w-max ml-auto font-bold uppercase ${
                        item.freigegeben
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.freigegeben ? "Freigegeben" : "In Prüfung"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
