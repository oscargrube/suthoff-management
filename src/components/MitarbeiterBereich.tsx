/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { useERPState } from "../data/StateContext";
import { UserRolle, Bautag, BautagStatus, Zeiterfassung, MaterialPosition, Datei } from "../types";
import {
  Clock,
  Play,
  Square,
  Pause,
  MapPin,
  FileSpreadsheet,
  CloudSun,
  Camera,
  Plus,
} from "lucide-react";

interface MitarbeiterBereichProps {
  setTab?: (tab: string) => void;
}

export const MitarbeiterBereich: React.FC<MitarbeiterBereichProps> = ({ setTab }) => {
  const {
    currentUser,
    baustellen,
    bautage,
    materials,
    maschinen,
    addZeiterfassung,
    updateBautag,
  } = useERPState();

  const todayStr = "2026-06-05";

  // Check-In Clock State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [pauseMinutes, setPauseMinutes] = useState(0);
  const [fahrzeitHin, setFahrzeitHin] = useState(20); // default
  const [pauseStart, setPauseStart] = useState<number | null>(null);

  // Active Bautag representing today's project assignment
  const myAssignedBautage = bautage.filter(
    (bt) => bt.datum === todayStr && bt.mitarbeiterIds.includes(currentUser.id)
  );

  // Active selected Bautag to write a report for
  const [selectedReportBautag, setSelectedReportBautag] = useState<Bautag | null>(null);

  // Tagesbericht form fields
  const [berichtWetter, setBerichtWetter] = useState("Sonnig, 21°C");
  const [berichtBemerkung, setBerichtBemerkung] = useState("");
  const [berichtText, setBerichtText] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [materialMenge, setMaterialMenge] = useState("1.5");
  const [reportMaterials, setReportMaterials] = useState<MaterialPosition[]>([]);
  const [reportPhotoType, setReportPhotoType] = useState<"vorher" | "nachher">("vorher");
  const [photosList, setPhotosList] = useState<Datei[]>([]);

  // Determine permissions
  const isForeman =
    currentUser.rolle === UserRolle.VORARBEITER_BAU ||
    currentUser.rolle === UserRolle.VORARBEITER_PFLEGE;

  // Auto load first assigned bautag for today's report
  useEffect(() => {
    if (myAssignedBautage.length > 0 && !selectedReportBautag) {
      setSelectedReportBautag(myAssignedBautage[0]);
    }
  }, [myAssignedBautage, selectedReportBautag]);

  // Load report values if report bautag is loaded/selected
  useEffect(() => {
    if (selectedReportBautag) {
      setBerichtWetter(selectedReportBautag.wetter || "Sonnig, 21°C");
      setBerichtBemerkung(selectedReportBautag.bemerkungen || "");
      setBerichtText(selectedReportBautag.tagesbericht || "");
      setReportMaterials(selectedReportBautag.verbrauchtesMaterial || []);
      setPhotosList([
        ...(selectedReportBautag.fotosVorher || []),
        ...(selectedReportBautag.fotosNachher || []),
      ]);
    }
  }, [selectedReportBautag]);

  // Clock in handler
  const handleCheckIn = () => {
    const now = new Date();
    setStartTime(now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }));
    setIsCheckedIn(true);
    setIsPaused(false);
    setPauseMinutes(0);
  };

  // Toggle pause handler
  const handleTogglePause = () => {
    if (!isPaused) {
      // Start pausing
      setIsPaused(true);
      setPauseStart(Date.now());
    } else {
      // Return from pause, compute elapsed minutes
      setIsPaused(false);
      if (pauseStart) {
        const diffMs = Date.now() - pauseStart;
        const diffMins = Math.max(15, Math.round(diffMs / 60000)); // Minimum simulated pause
        setPauseMinutes((prev) => prev + diffMins);
        setPauseStart(null);
      } else {
        setPauseMinutes((prev) => prev + 30); // fallback
      }
    }
  };

  // Clock out handler
  const handleCheckOut = () => {
    if (!startTime) return;

    // Simulate hours calc
    const randomizedWorkedHours = 8.4;

    // Create new sheet item
    const record: Zeiterfassung = {
      id: `z-sub-${currentUser.id}-${Date.now()}`,
      userId: currentUser.id,
      datum: todayStr,
      checkIn: `2026-06-05T${startTime}:00Z`,
      checkOut: new Date().toISOString(),
      pauseMinuten: pauseMinutes || 45,
      fahrzeitHin,
      fahrzeitZurueck: 25,
      arbeitszeitNetto: randomizedWorkedHours,
      bautagId: myAssignedBautage[0]?.id,
      freigegeben: false,
    };

    addZeiterfassung(record);
    setIsCheckedIn(false);
    setIsPaused(false);
    setStartTime(null);
    alert(
      `Zeiterfassung erfolgreich übermittelt:\nBruttoarbeitszeit: 8,4 Std\nPause: ${
        pauseMinutes || 45
      } Min\nFahrzeit: ${fahrzeitHin + 25} Min`
    );
  };

  const handleAddMaterialToReport = () => {
    if (!selectedMaterialId) return;
    const qty = parseFloat(materialMenge);
    if (isNaN(qty) || qty <= 0) return;

    const existingIdx = reportMaterials.findIndex((m) => m.materialId === selectedMaterialId);
    if (existingIdx > -1) {
      const updated = [...reportMaterials];
      updated[existingIdx].menge += qty;
      setReportMaterials(updated);
    } else {
      setReportMaterials([...reportMaterials, { materialId: selectedMaterialId, menge: qty }]);
    }
    setSelectedMaterialId("");
  };

  const handleRemoveMaterialFromReport = (idx: number) => {
    setReportMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSimulatePhoto = () => {
    const index = photosList.length + 1;
    const photoUrl =
      reportPhotoType === "vorher"
        ? "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300"
        : "https://images.unsplash.com/photo-1595181891393-2202c88a3b0c?auto=format&fit=crop&q=80&w=300";

    const localFile: Datei = {
      id: `img-user-${currentUser.id}-${Date.now()}`,
      name: `Kamera_Nachweis_${index}.jpg`,
      dateityp: "jpg",
      dateigroeße: 145,
      uploadDatum: todayStr,
      url: photoUrl,
      hochgeladenVon: currentUser.id,
    };

    setPhotosList([...photosList, localFile]);
  };

  const handleSaveReport = () => {
    if (!selectedReportBautag) return;

    // Filter photos based on simulated types
    const vorherPhotos = photosList.filter((p) => !p.name.includes("nachher"));
    const nachherPhotos = photosList.filter(
      (p) => p.name.includes("nachher") || p.name.includes("Kamera")
    );

    const updatedBautag: Bautag = {
      ...selectedReportBautag,
      wetter: berichtWetter,
      bemerkungen: berichtBemerkung,
      tagesbericht: berichtText,
      verbrauchtesMaterial: reportMaterials,
      fotosVorher: vorherPhotos,
      fotosNachher: nachReviewOrCameraPhotos(nachherPhotos),
      status: BautagStatus.ABGESCHLOSSEN, // automatic review flag
    };

    updateBautag(updatedBautag);
    alert(
      "Tagesbericht erfolgreich mit Lieferscheinen und Materialverbrauch im ERP archiviert!"
    );
  };

  const nachReviewOrCameraPhotos = (photos: Datei[]) => {
    return photos;
  };

  return (
    <div className="space-y-6" id="mitarbeiter-bereich-root">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="tablet-view-day">
        {/* Active clock interface & Baustelleneinteilung column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Clock Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Clock className="w-48 h-48 translate-x-12 translate-y-12" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] tracking-wider uppercase font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Zeiterfassung Live
                </span>
                {isCheckedIn ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Eingestempelt
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Nicht angemeldet</span>
                )}
              </div>

              {/* Dynamic timer display */}
              <div className="text-center py-4">
                {isCheckedIn ? (
                  <div>
                    <p className="text-3xl font-black font-mono tracking-tight text-white leading-none">
                      {isPaused ? "PAUSE AKTIV" : startTime ? `${startTime} → Jetzt` : "LAUFEND"}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-mono mt-2">
                      Soll: 8.0 Stunden | Pause gesamt: {pauseMinutes} Min
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-black font-mono tracking-tight text-slate-400 leading-none">
                      00:00:00
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans mt-2">
                      Schichtbeginn beim Eintreffen am Hof oder Baustelle
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    className="col-span-2 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 transition-colors text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <Play className="w-4 h-4 fill-slate-900 stroke-none" />
                    <span>Check-In (Einstempeln)</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleTogglePause}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs cursor-pointer border transition-colors ${
                        isPaused
                          ? "bg-slate-800 text-white border-slate-700"
                          : "bg-amber-600/15 border-amber-500/30 text-amber-300 hover:bg-amber-600/30"
                      }`}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current stroke-none" />
                          <span>Weiter</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current stroke-none" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCheckOut}
                      className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded-xl text-xs font-bold leading-none cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current stroke-none" />
                      <span>Check-Out</span>
                    </button>
                  </>
                )}
              </div>

              {/* Drive Log settings */}
              {isCheckedIn && (
                <div className="mt-5 pt-4 border-t border-slate-850 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">
                      Fahrzeit Hin (Min)
                    </label>
                    <input
                      type="number"
                      value={fahrzeitHin}
                      onChange={(e) => setFahrzeitHin(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/50 mt-1 rounded px-2 py-1 text-white border border-slate-750 text-xs text-center font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">
                      Heutige Pause (Min)
                    </label>
                    <input
                      type="number"
                      value={pauseMinutes}
                      onChange={(e) => setPauseMinutes(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800/50 mt-1 rounded px-2 py-1 text-white border border-slate-750 text-xs text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Today's schedule cards info with maps */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-xs tracking-tight uppercase">
                Baustelleneinteilung Heute
              </h3>
            </div>

            {myAssignedBautage.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl font-sans">
                Sie sind für den heutigen Tag im Urlaubs-, Krank- oder dispo-freien Status.
              </div>
            ) : (
              <div className="space-y-4">
                {myAssignedBautage.map((bt) => {
                  const prj = baustellen.find((b) => b.id === bt.baustelleId);
                  if (!prj) return null;

                  return (
                    <div key={bt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono w-full">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md uppercase font-bold leading-none">
                            {prj.typ}
                          </span>
                          <span className="text-slate-400 font-bold">{prj.baustellennummer}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-xs mt-2">{prj.name}</h4>
                        <p className="text-[11px] text-slate-505 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{prj.kundenadresse}</span>
                        </p>
                      </div>

                      {/* Map navigation integration action */}
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(prj.kundenadresse)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100/50 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Route starten</span>
                      </a>

                      <div className="pt-3 border-t border-slate-200 text-[11px] space-y-1.5">
                        <p className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-400">
                          Werkzeug & Großgeräte vor Ort
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {bt.verwendeteMaschinenIds.length === 0 ? (
                            <span className="text-slate-400 italic text-[10px]">
                              Keine Großgeräte verzeichnet
                            </span>
                          ) : (
                            bt.verwendeteMaschinenIds.map((machId) => {
                              const mach = maschinen.find((m) => m.id === machId);
                              return (
                                <span
                                  key={machId}
                                  className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] text-slate-600 font-medium"
                                >
                                  {mach ? mach.name : "Gerät"}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tagesbericht Form or Employee overview */}
        <div className="space-y-6 lg:col-span-2">
          {isForeman ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-850 text-sm flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-emerald-600" />
                      Tagesbericht verfassen (Vorarbeiter)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Erfassung von Materialverbrauch & Bautätigkeit
                    </p>
                  </div>
                  {myAssignedBautage.length > 1 && (
                    <select
                      value={selectedReportBautag?.id}
                      onChange={(e) =>
                        setSelectedReportBautag(bautage.find((b) => b.id === e.target.value) || null)
                      }
                      className="bg-slate-50 border border-slate-200 py-1 px-2 rounded font-mono text-[10px]"
                    >
                      {myAssignedBautage.map((b) => (
                        <option key={b.id} value={b.id}>
                          {baustellen.find((p) => p.id === b.baustelleId)?.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {selectedReportBautag ? (
                <div className="space-y-4">
                  {/* Weather and basic fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Bautag Wetterbericht
                      </label>
                      <input
                        type="text"
                        value={berichtWetter}
                        onChange={(e) => setBerichtWetter(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Kurz-Bemerkungen (Hemmnisse)
                      </label>
                      <input
                        type="text"
                        value={berichtBemerkung}
                        onChange={(e) => setBerichtBemerkung(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none"
                        placeholder="Zufahrtswege gesperrt, Betonmischer verspätet"
                      />
                    </div>
                  </div>

                  {/* Material utilization section */}
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase font-bold text-slate-400">
                      Verbrauchtes Lieferscheinsgut / Schüttgut abrechnen
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedMaterialId}
                        onChange={(e) => setSelectedMaterialId(e.target.value)}
                        className="flex-1 bg-slate-55 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="">-- Material auswählen --</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.einheit}) - Lagerbestand: {m.aktuellerBestand}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        value={materialMenge}
                        onChange={(e) => setMaterialMenge(e.target.value)}
                        className="w-20 bg-slate-55 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-center font-mono focus:outline-none"
                      />
                      <button
                        onClick={handleAddMaterialToReport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-1 flex items-center justify-center cursor-pointer text-xs font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Table of mapped consumption */}
                    {reportMaterials.length > 0 && (
                      <div className="border border-slate-100 rounded-xl overflow-hidden mt-2 bg-slate-50/40">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                            <tr>
                              <th className="p-2.5">Bezeichnung</th>
                              <th className="p-2.5 text-center">Menge</th>
                              <th className="p-3 text-right">Aktion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportMaterials.map((mPos, idx) => {
                              const mat = materials.find((x) => x.id === mPos.materialId);
                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2.5 font-medium">{mat ? mat.name : "Unbekannt"}</td>
                                  <td className="p-2.5 text-center font-mono">
                                    {mPos.menge} {mat?.einheit}
                                  </td>
                                  <td className="p-2 text-right">
                                    <button
                                      onClick={() => handleRemoveMaterialFromReport(idx)}
                                      className="text-red-500 hover:text-red-700 font-bold px-3 py-1 text-xs cursor-pointer"
                                    >
                                      Löschen
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Freitext */}
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Baufortschritt & Bericht (Freitext Abrechnungsgrundlage)
                    </label>
                    <textarea
                      rows={3}
                      value={berichtText}
                      onChange={(e) => setBerichtText(e.target.value)}
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl p-3 focus:outline-none text-xs font-sans leading-relaxed pointer-events-auto"
                      placeholder="Tragen Sie hier alle Details zum Baufortschritt, Bodenaushub, Fundamentlegung und Bepflanzung ein..."
                    />
                  </div>

                  {/* Photos */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block font-mono text-[10px] uppercase font-bold text-slate-400">
                        Nachweise (Lieferscheine / Hindernis-Fotos)
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setReportPhotoType("vorher")}
                          className={`text-[9px] font-mono rounded px-2 py-0.5 border ${
                            reportPhotoType === "vorher"
                              ? "bg-slate-800 text-white"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          Vorher
                        </button>
                        <button
                          onClick={() => setReportPhotoType("nachher")}
                          className={`text-[9px] font-mono rounded px-2 py-0.5 border ${
                            reportPhotoType === "nachher"
                              ? "bg-slate-800 text-white"
                              : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          Nachher
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                      {photosList.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative aspect-video rounded-lg overflow-hidden border border-slate-250 shadow-xs"
                        >
                          <img src={photo.url} alt={photo.name} className="object-cover w-full h-full" />
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-mono px-1.5 py-0.1 rounded uppercase">
                            {photo.name.includes("nachher") || photo.name.includes("Kamera")
                              ? "Nachher"
                              : "Vorher"}
                          </span>
                        </div>
                      ))}

                      <button
                        onClick={handleSimulatePhoto}
                        className="aspect-video bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg flex flex-col justify-center items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        <Camera className="w-5 h-5 mb-1 animate-pulse" />
                        <span className="text-[10px]">Photo simuliern</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={handleSaveReport}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-shadow shadow-md shadow-emerald-950/15"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Tagesbericht an die Verwaltung freigeben</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Lade heutigen Baustellentag...</p>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 border border-emerald-900/10 rounded-2xl shadow-sm text-center font-sans space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-850 text-sm">Gute Arbeit, {currentUser.vorname}!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Stempeln Sie sich ganz einfach über das linke Terminal ein und aus. Der Tagesbericht
                  wird nachher von dem verantwortlichen Vorarbeiter vor Ort abgegeben.
                </p>
              </div>
              <div className="flex justify-center gap-2.5">
                <button
                  onClick={() => setTab?.("wochenplan-stunden")}
                  className="text-xs px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100/50 rounded-xl font-bold cursor-pointer"
                >
                  Wochenplan ansehen
                </button>
                <button
                  onClick={() => setTab?.("meine-dateien")}
                  className="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Meine Dokumente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MitarbeiterBereich;
