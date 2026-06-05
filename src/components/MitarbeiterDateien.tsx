/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { UserRolle, Datei } from "../types";
import {
  ArrowRightLeft,
  Award,
  BookOpen,
  Download,
  Eye,
  FileCheck,
  FileText,
  Upload,
} from "lucide-react";

export const MitarbeiterDateien: React.FC = () => {
  const { currentUser, updateUser } = useERPState();

  const todayStr = "2026-06-05";
  const isAzubi = currentUser.rolle === UserRolle.AZUBI;

  // Tab navigation & interactive document states
  const [viewingContract, setViewingContract] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<{
    month: string;
    netWage: number;
    workHours: number;
  } | null>(null);
  const [viewingReport, setViewingReport] = useState<{
    id: string;
    name: string;
    date: string;
    size: number;
  } | null>(null);

  // New Wochenbericht form states
  const [uploadKw, setUploadKw] = useState("KW 23/2026");
  const [uploadHours, setUploadHours] = useState("38.0");
  const [uploadActivities, setUploadActivities] = useState(
    "Wegebau & Pflasterarbeiten im Privatgarten, Gehölzpflege & Raseneinsaat."
  );

  const handleWochenberichtUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadKw.trim()) {
      alert("Bitte geben Sie eine Kalenderwoche an!");
      return;
    }
    const cleanKwNum = uploadKw.replace(/\//g, "_").replace(/ /g, "_");
    const fileName = `Wochenbericht_${cleanKwNum}_${currentUser.vorname}_List.pdf`;

    const newFile: Datei = {
      id: `doc-report-${currentUser.id}-${Date.now()}`,
      name: fileName,
      dateityp: "pdf",
      dateigroeße: Math.floor(Math.random() * 80) + 120, // 120 - 200 KB
      uploadDatum: todayStr,
      url: "#",
      hochgeladenVon: currentUser.id,
    };

    // Update global state representing user's loaded files
    const updatedUser = {
      ...currentUser,
      dateien: [newFile, ...currentUser.dateien],
    };
    updateUser(updatedUser);

    // Clear forms and show confirmation
    setUploadKw(`KW ${parseInt(uploadKw.replace(/\D/g, "")) + 1 || 24}/2026`);
    alert(
      `Wochenbericht für ${uploadKw} wurde erfolgreich erstellt,\nals PDF-Dokument "${fileName}" gerendert und zur Prüfung eingereicht!`
    );
  };

  const handleMockDownload = (filename: string) => {
    alert(
      `Dokument "${filename}" erfolgreich heruntergeladen.\nEs wurde für den Offline-Betrieb auf Ihrem Endgerät zwischengespeichert.`
    );
  };

  const myReports = currentUser.dateien.filter(
    (f) => f.name.toLowerCase().includes("bericht") || f.name.toLowerCase().includes("nachweis")
  );

  return (
    <div className="space-y-6" id="documents-view">
      {/* Stammblatt summary profile card */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-3.5 md:col-span-2">
          <img
            src={currentUser.profilbild}
            alt={currentUser.nachname}
            className="w-12 h-12 rounded-xl object-cover border border-emerald-100/55 shadow-xs"
          />
          <div>
            <h4 className="font-black text-slate-800 text-sm">
              {currentUser.vorname} {currentUser.nachname}
            </h4>
            <p className="text-xs text-emerald-700/80 font-mono mt-0.5">
              Stamm-ID: {currentUser.personalnummer} • Rolle: {currentUser.rolle}
            </p>
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 text-xs text-slate-500">
          <span className="uppercase font-mono text-[9px] text-slate-400 block font-bold">
            Mitglied im Betrieb seit
          </span>
          <p className="font-bold text-slate-800 mt-1 font-mono">
            {new Date(currentUser.eintrittsdatum).toLocaleDateString("de-DE", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 text-xs text-slate-500">
          <span className="uppercase font-mono text-[9px] text-slate-400 block font-bold">
            Vergütung
          </span>
          <p className="font-bold text-slate-800 mt-1 font-mono">
            {currentUser.stundenlohnBrutto.toFixed(2)} €{" "}
            <span className="font-normal text-[10px] text-slate-450">/ Std</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents & Gehaltsabrechnungen grids list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Arbeitsvertrag file catalog card */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight border-b border-slate-50 pb-3 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Arbeitsvertrag & Dienstvereinbarungen
            </h3>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">
                    Anstellungsvertrag_{currentUser.vorname}_{currentUser.nachname}.pdf
                  </h4>
                  <p className="text-[10px] text-slate-455 mt-1 leading-none font-mono">
                    Erstellt am: {currentUser.eintrittsdatum} • Größe: 1.4 MB • Status: Aktiv
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setViewingContract(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/40 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ansehen</span>
                </button>
                <button
                  onClick={() =>
                    handleMockDownload(
                      `Anstellungsvertrag_${currentUser.vorname}_${currentUser.nachname}.pdf`
                    )
                  }
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-750 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lohnabrechnungen folder catalog */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight border-b border-slate-50 pb-3 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Monatliche Lohnabrechnungen (Auszahlungsbelege)
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50/20 text-xs leading-relaxed font-sans">
              {[
                {
                  month: "Mai",
                  date: "31.05.2026",
                  size: "145 KB",
                  hours: currentUser.iststundenMonat || 158.0,
                },
                { month: "April", date: "30.04.2026", size: "142 KB", hours: 160.0 },
                { month: "März", date: "31.03.2026", size: "144 KB", hours: 158.0 },
              ].map((slip, i) => {
                const bruttoPay = slip.hours * currentUser.stundenlohnBrutto;
                const netWage = bruttoPay * 0.65; // realistic net deduction
                const docName = `Lohnabrechnung_${slip.month.substring(0, 3)}_2026_${
                  currentUser.nachname
                }.pdf`;

                return (
                  <div
                    key={i}
                    className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-55 transition-all text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{docName}</h4>
                        <p className="text-[10px] text-slate-450 mt-1 font-mono">
                          Buchung: {slip.date} • Auszahlung: {netWage.toFixed(2)} € Netto
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() =>
                          setViewingPayslip({ month: slip.month, workHours: slip.hours, netWage })
                        }
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Öffnen</span>
                      </button>
                      <button
                        onClick={() => handleMockDownload(docName)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg cursor-pointer flex items-center justify-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apprentice / Azubi report upload side component */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-xs relative overflow-hidden">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-bold text-slate-850 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Wochenbericht & Berichtshefte
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Stammformular zur Abzeichnung des wöchentlichen Ausbildungsnachweises
              </p>
            </div>

            {/* Conditional warning/info depending on role */}
            {!isAzubi ? (
              <div className="p-4 text-center bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 italic leading-relaxed font-sans">
                Der Upload von wöchentlichen Berichtshefte-Pdf ist exklusiv für gewerbliche
                Auszubildende geschaltet.
              </div>
            ) : (
              <div className="space-y-5">
                {/* Add-report upload fields */}
                <form
                  onSubmit={handleWochenberichtUploadSubmit}
                  className="space-y-3.5 bg-indigo-50/20 border border-indigo-200/30 p-4 rounded-xl relative z-10"
                >
                  <span className="text-[10px] uppercase font-mono font-black text-indigo-700 block">
                    Wochenbericht Einreichen
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-indigo-950 font-sans font-bold">
                        Kalenderwoche (KW)
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadKw}
                        onChange={(e) => setUploadKw(e.target.value)}
                        placeholder="KW 23/2026"
                        className="w-full bg-white mt-1 border border-indigo-200/50 rounded-lg p-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-indigo-955 font-sans font-bold">Ist-Stunden</label>
                      <input
                        type="text"
                        required
                        value={uploadHours}
                        onChange={(e) => setUploadHours(e.target.value)}
                        className="w-full bg-white mt-1 border border-indigo-200/50 rounded-lg p-1.5 text-center focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-indigo-955 font-sans font-semibold">
                      Tätigkeitsschwerpunkte
                    </label>
                    <textarea
                      rows={2}
                      value={uploadActivities}
                      onChange={(e) => setUploadActivities(e.target.value)}
                      className="w-full mt-1 bg-white border border-indigo-200/50 rounded-lg p-2 text-xs leading-relaxed text-indigo-950/80 focus:outline-none"
                      placeholder="Z.B Rasenneuanlage vorbereitet, Gehölze verpflanzt, Weg gepflastert..."
                    />
                  </div>

                  {/* Dropzone mockup */}
                  <div className="border border-dashed border-indigo-250 bg-white p-3.5 rounded-lg text-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-5 h-5 text-indigo-650 mx-auto mb-1.5 animate-bounce" />
                    <span className="text-[10px] text-indigo-955 font-bold block">
                      Nachweis (Bericht_KW23.pdf)
                    </span>
                    <span className="text-[8.5px] text-indigo-400 font-mono mt-0.5 block">
                      Klicken zum Ersetzen
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Ausbildungsleiter vorlegen</span>
                  </button>
                </form>

                {/* Pre-uploaded reports catalog history */}
                <div className="space-y-2 mt-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                    Geprüfte Wochenberichte ({myReports.length})
                  </span>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {myReports.length === 0 ? (
                      <span className="text-xs text-slate-400 italic block py-1">
                        Noch keine Wochenberichte hinterlegt
                      </span>
                    ) : (
                      myReports.map((reportFile) => (
                        <div
                          key={reportFile.id}
                          className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pl-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span className="truncate text-slate-800 font-black text-[11px] block">
                              {reportFile.name}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setViewingReport({
                                id: reportFile.id,
                                name: reportFile.name,
                                date: reportFile.uploadDatum,
                                size: reportFile.dateigroeße,
                              })
                            }
                            className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-250 rounded font-bold text-[9px] cursor-pointer"
                          >
                            Ansehen
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDER MODAL: ARBEITSVERTRAG VIEWER */}
      {viewingContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-emerald-900/10 shadow-2xl max-h-[90vh] flex flex-col relative z-50">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/20 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-emerald-950 font-sans tracking-tight text-sm uppercase">
                  Arbeitsvertrag & Dienstabkommen
                </h3>
                <p className="text-[10px] text-emerald-800/60 font-mono">
                  Dossier-ID: doc-contract-{currentUser.id}
                </p>
              </div>
              <button
                onClick={() => setViewingContract(false)}
                className="text-slate-400 hover:text-slate-600 font-bold font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto text-xs text-slate-700 space-y-4 font-sans leading-relaxed">
              <div className="text-center border-b border-dashed border-slate-200 pb-4">
                <h4 className="font-black text-slate-850 text-sm tracking-tight animate-fade-in">
                  DIENST- UND ANSTELLUNGSVERTRAG FÜR GEWERBLICHE MITARBEITER
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Garten- und Landschaftsbau Betriebe Deutschland
                </p>
              </div>

              <p>
                Zwischen der Firma <strong>GaLaBau Meister GmbH</strong> (nachfolgend Arbeitgeber)
                und <strong>Herrn / Frau {currentUser.vorname} {currentUser.nachname}</strong>{" "}
                (nachfolgend Arbeitnehmer/Auszubildender) wird folgender Vertrag geschlossen:
              </p>

              <p>
                <strong>§ 1 Beginn und Dauer:</strong> Das feste Arbeits- bzw. Ausbildungsverhältnis
                beginnt am <strong>{currentUser.eintrittsdatum}</strong>. Das Dienstverhältnis wird
                auf unbestimmte Zeit abgeschlossen.
              </p>

              <p>
                <strong>§ 2 Aufgaben & Arbeitsort:</strong> Der Arbeitnehmer wird als{" "}
                <strong>{currentUser.rolle}</strong> im Unternehmen eingesetzt. Der Arbeitsort
                umfasst den Betriebshof sowie die wechselnden Baustellen des Arbeitgebers.
              </p>

              <p>
                <strong>§ 3 Vergütung:</strong> Der Arbeitnehmer erhält eine arbeitsvertraglich
                vereinbarte Bruttovergütung in Höhe von{" "}
                <strong>{currentUser.stundenlohnBrutto.toFixed(2)} € pro Arbeitsstunde</strong>.
                Auszahlung erfolgt bargeldlos auf das hinterlegte Bankkonto des Arbeitnehmers zum
                Monatsende.
              </p>

              <p>
                <strong>§ 4 Erholungsurlaub:</strong> Dem Mitarbeiter steht ein gesetzlich und
                tarifvertraglich verankerter Erholungsurlaub von insgesamt{" "}
                <strong>{currentUser.urlaubstageGesamt} Arbeitstagen</strong> bezogen auf ein volles
                Kalenderjahr zu.
              </p>

              <p>
                <strong>§ 5 Berichtspflichten & Zeiterfassung:</strong> Der Mitarbeiter verpflichtet
                sich zur lückenlosen täglichen Einstempelung über das mobile GaLaBau-ERP Terminal.
                Auszubildende verpflichten sich darüber hinaus zur wöchentlichen Nachweisführung der
                Berichtshefte im Portal.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-8 text-[10px] text-slate-400 border-t border-slate-100 font-sans">
                <div className="border-t border-dashed border-slate-300 pt-3 text-center">
                  Christian Müller (Geschäftsführer)
                </div>
                <div className="border-t border-dashed border-slate-300 pt-3 text-center">
                  {currentUser.vorname} {currentUser.nachname} (Unterschrift des Mitarbeiters)
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setViewingContract(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors shadow-sm"
              >
                Fenster Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODAL: GEHALTSABRECHNUNG VIEWER */}
      {viewingPayslip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-emerald-900/10 shadow-2xl overflow-hidden flex flex-col relative z-50">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/20 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-emerald-950 font-sans tracking-tight text-sm uppercase">
                  Elektronischer Gehaltsnachweis
                </h3>
                <p className="text-[10px] text-emerald-800/60 font-mono">
                  Pers.-Nr: {currentUser.personalnummer} • Abrechnungsmonat {viewingPayslip.month}{" "}
                  2026
                </p>
              </div>
              <button
                onClick={() => setViewingPayslip(null)}
                className="text-slate-400 hover:text-slate-600 font-bold font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                    Verdienstbeleg (Entwurf)
                  </span>
                  <span className="text-slate-500 font-mono">{viewingPayslip.month} 2026</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-mono">
                  <p>
                    <strong>Mitarbeiter:</strong> {currentUser.vorname} {currentUser.nachname}
                  </p>
                  <p className="text-right">
                    <strong>Arbeitgeber:</strong> GaLaBau Meister GmbH
                  </p>
                  <p>
                    <strong>Eintrittsdatum:</strong> {currentUser.eintrittsdatum}
                  </p>
                  <p className="text-right">
                    <strong>Betriebshof:</strong> Hauptquartier Nord
                  </p>
                </div>
              </div>

              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-55 font-mono text-[9px] text-slate-450 uppercase">
                    <tr>
                      <th className="p-2.5">Lohnart / Beschreibung</th>
                      <th className="p-2.5 text-right w-16">Menge</th>
                      <th className="p-2.5 text-right w-16">Satz</th>
                      <th className="p-2.5 text-right w-20">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-800">
                        Nettoarbeitsstunden (Iststunden)
                      </td>
                      <td className="p-2.5 text-right">{viewingPayslip.workHours.toFixed(1)} Std</td>
                      <td className="p-2.5 text-right">
                        {currentUser.stundenlohnBrutto.toFixed(2)} €
                      </td>
                      <td className="p-2.5 text-right">
                        {(viewingPayslip.workHours * currentUser.stundenlohnBrutto).toFixed(2)} €
                      </td>
                    </tr>
                    <tr className="text-rose-700 bg-rose-50/25">
                      <td className="p-2.5 font-sans text-slate-600">
                        Lohnsteuerabzug (Pauschal 15%)
                      </td>
                      <td className="p-2.5 text-right">-</td>
                      <td className="p-2.5 text-right">15.0%</td>
                      <td className="p-2.5 text-right">
                        -{(viewingPayslip.workHours * currentUser.stundenlohnBrutto * 0.15).toFixed(
                          2
                        )}{" "}
                        €
                      </td>
                    </tr>
                    <tr className="text-rose-700 bg-rose-50/25">
                      <td className="p-2.5 font-sans text-slate-600">
                        Gesamt-Sozialabgaben (GKV, RV, PV 20%)
                      </td>
                      <td className="p-2.5 text-right">-</td>
                      <td className="p-2.5 text-right font-bold">20.0%</td>
                      <td className="p-2.5 text-right">
                        -{(viewingPayslip.workHours * currentUser.stundenlohnBrutto * 0.2).toFixed(
                          2
                        )}{" "}
                        €
                      </td>
                    </tr>
                    <tr className="bg-emerald-500/5 font-black border-t border-slate-200">
                      <td className="p-2.5 font-sans text-emerald-950">
                        Auszahlungsbetrag (Banküberweisung)
                      </td>
                      <td className="p-2.5 text-right">-</td>
                      <td className="p-2.5 text-right">-</td>
                      <td className="p-2.5 text-right text-emerald-700">
                        {viewingPayslip.netWage.toFixed(2)} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-normal">
                Die automatische Auszahlung dieses Lohnbelegs wurde zum 30. des Abrechnungsmonats an
                Ihr hinterlegtes Girokonto vorgenommen.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => alert("Lohnabrechnung erfolgreich als PDF heruntergeladen!")}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-750 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Als PDF exportieren
              </button>
              <button
                onClick={() => setViewingPayslip(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODAL: WOCHENBERICHT DETAILS VIEWER */}
      {viewingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-emerald-900/10 shadow-2xl overflow-hidden flex flex-col relative z-50">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/20 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-emerald-950 font-sans tracking-tight text-xs uppercase">
                  Wochenberichtsunterlage (Archiv)
                </h3>
                <p className="text-[10px] text-emerald-800/60 font-mono">
                  Dokumenten-Ref: doc-rep-{viewingReport.id}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700 font-sans leading-relaxed">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800">Kalenderwoche:</span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 font-bold">
                  {viewingReport.name.replace("Wochenbericht_", "").split("_")[0]} / 2026
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  Eingetragener Ausbildungsinhalt:
                </span>
                <p className="bg-slate-50 border border-slate-150 p-3 rounded-xl italic leading-relaxed text-[11px] text-slate-600">
                  {uploadActivities}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block uppercase text-[8.5px] font-mono font-bold">
                    Dauer (Woche)
                  </span>
                  <p className="font-bold text-slate-800">{uploadHours} Std</p>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8.5px] font-mono font-bold">
                    Status
                  </span>
                  <p className="font-bold text-emerald-600 flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Freigegeben
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setViewingReport(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
