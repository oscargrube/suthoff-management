/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { Maschine, Fahrzeug, MaschinenStatus, FahrzeugStatus } from "../types";
import {
  Wrench,
  QrCode,
  ShieldCheck,
  Truck,
  Hammer,
  Search,
  TriangleAlert,
  CalendarDays,
  PlusCircle,
  FileSpreadsheet,
  Gauge,
  Sparkles,
  Info
} from "lucide-react";

export const MaschinenFuhrpark: React.FC = () => {
  const { maschinen, fahrzeuge, users, updateMaschine, updateFahrzeug } = useERPState();

  // Selected tab: Maschinen vs Fahrzeuge
  const [activeSegment, setActiveSegment] = useState<"maschinen" | "fahrzeuge">("maschinen");

  // Selection states
  const [selectedMachineId, setSelectedMachineId] = useState<string>("mas1");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("f1");

  // QR trigger modal simulation
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

  // Injury/Damage report state
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageText, setDamageText] = useState("");
  const [damageStatus, setDamageStatus] = useState("DEFEKT");

  const [licenseConfirm, setLicenseConfirm] = useState(false);

  const selectedMachine = maschinen.find(m => m.id === selectedMachineId) || maschinen[0];
  const selectedVehicle = fahrzeuge.find(f => f.id === selectedVehicleId) || fahrzeuge[0];

  const handleReportDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageText) return;

    if (activeSegment === "maschinen") {
      updateMaschine({
        ...selectedMachine,
        status: damageStatus as MaschinenStatus,
        aktuellerStandort: "Betriebs-Werkstatt"
      });
      alert(`Schaden für ${selectedMachine.name} übermittelt!\nStatus auf ${damageStatus} gesetzt. Gerät wurde für Disposition gesperrt.`);
    } else {
      updateFahrzeug({
        ...selectedVehicle,
        status: damageStatus as FahrzeugStatus
      });
      alert(`Schadensmeldung für ${selectedVehicle.bezeichnung} eingetragen!\nStatus auf ${damageStatus} abgeändert.`);
    }

    setDamageText("");
    setShowDamageForm(false);
  };

  const handlePerformMaintenance = (masId: string) => {
    const original = maschinen.find(m => m.id === masId);
    if (original) {
      updateMaschine({
        ...original,
        status: MaschinenStatus.SEHR_GUT,
        letzteWartung: "2026-06-05",
        naechsteWartung: "2026-12-05", // 6 months extension
        betriebsstunden: original.betriebsstunden + 0.5
      });
      alert("Wartungsbericht abgezeichnet!\nNächster Wartungszyklus um 6 Monate verlängert, Prüfsiegel erteilt.");
    }
  };

  return (
    <div className="space-y-6" id="fleet-root">
      {/* Tab select Segments */}
      <div className="flex border-b border-slate-100 bg-white p-2 rounded-2xl border">
        <button
          onClick={() => {
            setActiveSegment("maschinen");
            setShowDamageForm(false);
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSegment === "maschinen"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Schwere Baufahrzeuge & Maschinenpark</span>
        </button>

        <button
          onClick={() => {
            setActiveSegment("fahrzeuge");
            setShowDamageForm(false);
          }}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSegment === "fahrzeuge"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fahrzeuge & Fuhrparklogistik</span>
        </button>
      </div>

      {activeSegment === "maschinen" ? (
        /* ================= MASCHINEN GRID SECTION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="machines-grid">
          {/* List panel column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Maschinen Verzeichnis</span>
              
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {maschinen.map(mac => {
                  const isCh = selectedMachineId === mac.id;
                  const isDefect = mac.status === "DEFEKT";
                  const isSchlecht = mac.status === "SCHLECHT";

                  return (
                    <div
                      key={mac.id}
                      onClick={() => {
                        setSelectedMachineId(mac.id);
                        setShowDamageForm(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isCh
                          ? "bg-slate-900 border-slate-950 text-white shadow-md"
                          : "bg-white border-slate-100 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-bold text-xs ${isCh ? "text-white" : "text-slate-800"}`}>{mac.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{mac.inventarnummer}</p>
                        </div>

                        <span className={`text-[8px] font-mono font-bold uppercase rounded px-1.5 py-0.5 ${
                          isDefect ? "bg-red-100 text-red-700" :
                          isSchlecht ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {mac.status}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] opacity-80 flex justify-between items-center">
                        <span className="font-mono">{mac.betriebsstunden} h Betrieb</span>
                        <span className="font-sans">Ort: {mac.aktuellerStandort}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details dossier column */}
          {selectedMachine && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-none">{selectedMachine.name}</h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Prüf-Nummer: <strong className="font-mono">{selectedMachine.inventarnummer}</strong> | Typ: {selectedMachine.typ}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Simulated QR Trigger */}
                    <button
                      onClick={() => setShowQrCode(selectedMachine.inventarnummer)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-slate-200"
                    >
                      <QrCode className="w-4 h-4 text-slate-650" />
                      <span>Maschinen-QR Tag</span>
                    </button>

                    <button
                      onClick={() => setShowDamageForm(true)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-red-200"
                    >
                      <TriangleAlert className="w-4 h-4" />
                      <span>Schadenserfassung</span>
                    </button>
                  </div>
                </div>

                {/* Sub features panel */}
                {showDamageForm ? (
                  <form onSubmit={handleReportDamage} className="p-4 bg-red-50/50 border border-red-150 rounded-xl space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-red-900 text-xs">Schadens- & Defektbericht erstellen</p>
                      <select
                        value={damageStatus}
                        onChange={(e) => setDamageStatus(e.target.value)}
                        className="bg-white border text-xs py-0.5 px-2 rounded"
                      >
                        <option value="DEFEKT">DEFEKT</option>
                        <option value="SCHLECHT">SCHLECHT (Bedienung prüfen)</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      required
                      value={damageText}
                      onChange={(e) => setDamageText(e.target.value)}
                      placeholder="Gummikette gerissen links, Schaufelzähne stark abgenutzt..."
                      className="w-full bg-white border border-red-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />

                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowDamageForm(false)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-500"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-650 text-white rounded-lg font-bold"
                      >
                        Schaden absenden
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Betriebsdaten</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-400">Betriebsstunden</span>
                          <span className="font-black font-mono">{selectedMachine.betriebsstunden} Std</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Letzte Sicherheits-Inspektion</span>
                          <span className="font-mono text-slate-700">{new Date(selectedMachine.letzteWartung).toLocaleDateString("de-DE")}</span>
                        </div>
                        <div className="flex justify-between py-1 pt-1.5 border-t border-slate-200/50">
                          <span className="text-slate-400">Nächste Sicherheitsprüfsiegel</span>
                          <span className="font-bold font-mono text-slate-800">{new Date(selectedMachine.naechsteWartung).toLocaleDateString("de-DE")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance Protocol trigger */}
                    <div className="space-y-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100/50 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-emerald-950 text-[11px] uppercase font-mono tracking-wider flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                          Meister Prüfortal
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-1 leading-normal">
                          Tragen Sie eine erfolgreich abgeschlossene Wartung, Schläuchewechsel, Seilschutz oder Ölwechsel in das digitale Logbuch ein.
                        </p>
                      </div>

                      <button
                        onClick={() => handlePerformMaintenance(selectedMachine.id)}
                        className="w-full inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 p-3 rounded-lg text-xs cursor-pointer shadow-sm shadow-emerald-600/10"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Wartung abzeichnen (UVV Siegel erteilen)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= FUHRPARK SECTION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="fleet-car-grid">
          {/* Vehicle lists column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Fahrzeug Verzeichnis</span>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {fahrzeuge.map(car => {
                  const isCh = selectedVehicleId === car.id;
                  const isMaintenance = car.status === FahrzeugStatus.WARTUNG;
                  const isDefect = car.status === FahrzeugStatus.DEFEKT;

                  return (
                    <div
                      key={car.id}
                      onClick={() => {
                        setSelectedVehicleId(car.id);
                        setShowDamageForm(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCh
                          ? "bg-slate-900 border-slate-950 text-white shadow-md"
                          : "bg-white border-slate-100 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-bold text-xs ${isCh ? "text-white" : "text-slate-800"}`}>{car.bezeichnung}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{car.kennzeichen}</p>
                        </div>

                        <span className={`text-[8px] font-mono font-bold uppercase rounded px-1.5 py-0.5 ${
                          isDefect ? "bg-red-100 text-red-700" :
                          isMaintenance ? "bg-indigo-150 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {car.status}
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] opacity-80 flex justify-between items-center">
                        <span className="font-mono">{car.kilometerstand.toLocaleString()} km</span>
                        <span className="font-sans">TÜV: {new Date(car.naechsteInspektion).toLocaleDateString("de-DE", {month: "2-digit", year:"numeric"})}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vehicle detailed dossier */}
          {selectedVehicle && (
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-none">{selectedVehicle.bezeichnung}</h3>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Kennzeichen: <strong className="font-mono text-slate-650">{selectedVehicle.kennzeichen}</strong> | Typ: {selectedVehicle.typ}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDamageForm(true)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-red-200"
                    >
                      <TriangleAlert className="w-4 h-4" />
                      <span>Schadenserfassung</span>
                    </button>
                  </div>
                </div>

                {showDamageForm ? (
                  <form onSubmit={handleReportDamage} className="p-4 bg-red-50/50 border border-red-150 rounded-xl space-y-4">
                    <p className="font-bold text-red-900 text-xs">Fahrzeugschaden an Fuhrparkleiter senden</p>
                    <textarea
                      rows={2}
                      required
                      value={damageText}
                      onChange={(e) => setDamageText(e.target.value)}
                      placeholder="Blinkerglas hinten links gebrochen, Reifen verliert Luft..."
                      className="w-full bg-white border border-red-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />

                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowDamageForm(false)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-500"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-650 text-white rounded-lg font-bold"
                      >
                        Schaden absenden
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Flottendetails</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-400">Kilometerstand</span>
                          <span className="font-black font-mono">{selectedVehicle.kilometerstand.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Nächster TÜV / HU</span>
                          <span className="font-mono text-slate-700">{new Date(selectedVehicle.naechsteInspektion).toLocaleDateString("de-DE")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver licene confirmation checklist */}
                    <div className="space-y-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100/50 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-indigo-950 text-[11px] uppercase font-mono tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Führerscheinkontrolle
                        </p>
                        <p className="text-[11px] text-indigo-700 mt-1 leading-normal">
                          Gesetzliche Halterprüfung: Bestätigen Sie die physische Vorlage der Fahrerlaubnis (Klasse BE / C1E) der zugewiesenen Fahrer.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="liccheck"
                          checked={licenseConfirm}
                          onChange={(e) => setLicenseConfirm(e.target.checked)}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="liccheck" className="text-[10px] text-indigo-900 leading-tight">
                          Fahrerausweise wurden am heutigen Kalendertag gesichtet
                        </label>
                      </div>

                      <button
                        disabled={!licenseConfirm}
                        onClick={() => {
                          alert(`Führerscheinkontrolle für das Fahrzeug ${selectedVehicle.bezeichnung} abgeschlossen!\nFahrerzuweisungen sind gesichert.`);
                          setLicenseConfirm(false);
                        }}
                        className="w-full inline-flex items-center justify-center bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer shadow-sm"
                      >
                        Prüfbericht zeichnen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code simulated popup modal */}
      {showQrCode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Maschinen QR-Code Label</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Auf das Gehäuse aufzukleben</p>
            
            <div className="my-6 aspect-square w-48 bg-slate-100 rounded-xl border border-slate-200 mx-auto flex flex-col justify-center items-center text-slate-700 relative overflow-hidden">
              {/* Dummy QR artwork with icons */}
              <QrCode className="w-40 h-40 opacity-90 stroke-[1.2]" />
              <div className="absolute inset-0 flex items-center justify-center bg-white/10" />
            </div>

            <p className="text-[11px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-150">
              galabau-erp://inv/{showQrCode}
            </p>

            <button
              onClick={() => setShowQrCode(null)}
              className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Fenster Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
