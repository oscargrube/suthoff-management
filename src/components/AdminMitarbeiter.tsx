/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useERPState } from "../data/StateContext";
import { User, UserRolle, Datei } from "../types";
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  History,
  Plane,
  X,
  CreditCard,
  UserCheck,
  Check,
  UserX
} from "lucide-react";

export const AdminMitarbeiter: React.FC = () => {
  const { users, addUser, updateUser } = useERPState();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection state
  const [selectedUserId, setSelectedUserId] = useState<string>("u2"); // default select Gerhard Richter

  // Add/Edit user form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    rolle: UserRolle.MITARBEITER,
    personalnummer: `GLB-${1000 + users.length + 1}`,
    stundenlohnBrutto: 18.50,
    sollstundenMonat: 160,
    urlaubstageGesamt: 28,
  });

  // Active sub-dossier tab inside selected user detail view
  const [detailTab, setDetailTab] = useState<"stammdaten" | "dokumente" | "historie" | "zeiterfassung" | "urlaub">("stammdaten");

  // Filtered users calculation
  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.vorname} ${u.nachname} ${u.personalnummer}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || u.rolle === roleFilter;
    const matchesStatus = statusFilter === "ALL" || (statusFilter === "AKTIV" ? u.aktiv : !u.aktiv);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: User = {
      id: `u-gen-${Date.now()}`,
      personalnummer: newUser.personalnummer,
      vorname: newUser.vorname,
      nachname: newUser.nachname,
      email: newUser.email,
      telefon: newUser.telefon,
      rolle: newUser.rolle,
      eintrittsdatum: new Date().toISOString().split("T")[0],
      sollstundenMonat: newUser.sollstundenMonat,
      iststundenMonat: 0,
      stundenlohnBrutto: newUser.stundenlohnBrutto,
      urlaubstageGesamt: newUser.urlaubstageGesamt,
      urlaubstageVerbraucht: 0,
      aktiv: true,
      profilbild: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      dateien: [],
      baustellenHistorie: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addUser(created);
    setSelectedUserId(created.id);
    setShowAddModal(false);
    // Reset modal state
    setNewUser({
      vorname: "",
      nachname: "",
      email: "",
      telefon: "",
      rolle: UserRolle.MITARBEITER,
      personalnummer: `GLB-${1000 + users.length + 2}`,
      stundenlohnBrutto: 18.50,
      sollstundenMonat: 160,
      urlaubstageGesamt: 28,
    });
  };

  const handleToggleActive = (user: User) => {
    const updated = { ...user, aktiv: !user.aktiv };
    updateUser(updated);
  };

  // Simulate Holiday allocation / approve
  const handleApproveHoliday = () => {
    if (selectedUser.urlaubstageVerbraucht >= selectedUser.urlaubstageGesamt) {
      alert("Urlaubstage bereits vollständig verbraucht!");
      return;
    }
    const updated = {
      ...selectedUser,
      urlaubstageVerbraucht: selectedUser.urlaubstageVerbraucht + 1
    };
    updateUser(updated);
    alert(`1 Urlaubstag genehmigt!\nResturlaub: ${updated.urlaubstageGesamt - updated.urlaubstageVerbraucht} Tage.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1" id="hr-panel">
      {/* 1. Left Side: Search list */}
      <div className="lg:col-span-1 space-y-4" id="staff-directory">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Mitarbeiterverzeichnis
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">Suchen Sie Profile oder fügen Sie neue hinzu</p>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-1.5 px-3 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Neu anlegen
            </button>
          </div>

          {/* Search filters row */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Personalnr, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg p-1 text-slate-600 focus:outline-none"
              >
                <option value="ALL">Alle Rollen</option>
                {Object.values(UserRolle).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200/80 rounded-lg p-1 text-slate-600 focus:outline-none"
              >
                <option value="ALL">Alle Stati</option>
                <option value="AKTIV">Aktiv</option>
                <option value="INAKTIV">Inaktiv</option>
              </select>
            </div>
          </div>

          {/* Render listing */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl font-sans">
                Keine Mitarbeiterdaten gefunden.
              </div>
            ) : (
              filteredUsers.map(user => {
                const isChosen = selectedUserId === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isChosen
                        ? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10"
                        : "bg-white border-slate-100 hover:border-slate-350 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={user.profilbild} alt={user.nachname} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className={`font-bold text-xs truncate ${isChosen ? "text-white" : "text-slate-700"}`}>
                          {user.vorname} {user.nachname}
                        </p>
                        <p className={`text-[10px] uppercase font-mono mt-0.5 ${isChosen ? "text-emerald-300" : "text-emerald-600"}`}>
                          {user.rolle}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] block opacity-80">{user.personalnummer}</span>
                      <span className={`inline-block w-2-2 h-2 rounded-full mt-1.5 ${user.aktiv ? "bg-emerald-500" : "bg-slate-400"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle & Right Side: Employee detailed dossier folder */}
      {selectedUser && (
        <div className="lg:col-span-2 space-y-4" id="staff-folder">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="details-dossier">
            {/* Header profile background banner */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={selectedUser.profilbild}
                alt={selectedUser.nachname}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md flex-shrink-0"
              />
              <div className="min-w-0 text-center sm:text-left flex-1">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800 leading-none">
                    {selectedUser.vorname} {selectedUser.nachname}
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded leading-none font-bold uppercase">
                    {selectedUser.rolle}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-none">{selectedUser.personalnummer} | Eingestellt am {new Date(selectedUser.eintrittsdatum).toLocaleDateString("de-DE")}</p>
              </div>

              {/* Status activator toggle */}
              <button
                onClick={() => handleToggleActive(selectedUser)}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm border ${
                  selectedUser.aktiv
                    ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                }`}
              >
                {selectedUser.aktiv ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Inaktivieren</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Aktivieren</span>
                  </>
                )}
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-medium font-sans">
              {[
                { id: "stammdaten", label: "Stammdaten", icon: FileText },
                { id: "dokumente", label: "Dokumente", icon: CreditCard },
                { id: "historie", label: "Einsatzhistorie", icon: History },
                { id: "zeiterfassung", label: "Zeiterfassungen", icon: Clock },
                { id: "urlaub", label: "Urlaubsanspruch", icon: Plane }
              ].map(tb => {
                const Icon = tb.icon;
                const isAct = detailTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setDetailTab(tb.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-4 border-b-2 hover:text-slate-800 transition-colors cursor-pointer ${
                      isAct
                        ? "border-emerald-600 text-emerald-700 font-bold"
                        : "border-transparent text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dossier contents tab-panel */}
            <div className="p-6 text-xs text-slate-600" id="sub-panel-box">
              {/* STAMMDATEN PANEL */}
              {detailTab === "stammdaten" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-relaxed">
                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Kontaktdaten</p>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">E-Mail Adresse</span>
                        <a href={`mailto:${selectedUser.email}`} className="font-bold text-emerald-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedUser.email}
                        </a>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-slate-250">
                        <span className="text-slate-400">Mobil / Telefon</span>
                        <a href={`tel:${selectedUser.telefon}`} className="font-bold text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedUser.telefon}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Vertrags- & Lohnstufen</p>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Bruttolohn/Stunde</span>
                        <span className="font-bold text-slate-700 font-mono">
                          €{selectedUser.stundenlohnBrutto.toFixed(2)} / Std
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-slate-250">
                        <span className="text-slate-400">Sollarbeitszeit (Monat)</span>
                        <span className="font-bold text-slate-700 font-mono">
                          {selectedUser.sollstundenMonat} Stunden
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOKUMENTE PANEL */}
              {detailTab === "dokumente" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Vertriebene Dokumente / Nachweise</p>
                    <button
                      onClick={() => alert("Simulation anwerfen: Upload-Ereignis abgeschlossen.")}
                      className="bg-slate-50 text-[10px] text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100"
                    >
                      Dokument hochladen
                    </button>
                  </div>

                  {selectedUser.dateien.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs italic">
                      Keine PDF- oder Bilddokumente für diese Personalakte hinterlegt.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedUser.dateien.map(doc => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-700 truncate">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Große: {Math.round(doc.dateigroeße / 1024)} MB | {doc.uploadDatum}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => alert("Simulierter PDF-Download gestartet")}
                            className="bg-white border border-slate-200 px-2 py-1 hover:bg-slate-50 rounded text-[10px] shrink-0 font-medium font-sans"
                          >
                            Herunterladen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Wage Slip Generator Simulation */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100/50 mt-4">
                    <p className="font-bold text-emerald-950 text-xs">Lohn- & Gehaltsabrechnung generieren</p>
                    <p className="text-[11px] text-emerald-700 mt-1">Sende den berechneten Bruttonettolohn dieses Monats direkt an DATEV-Schnittstelle.</p>
                    <button
                      onClick={() => alert(`Lohnabrechnung für ${selectedUser.vorname} ${selectedUser.nachname} erfolgreich generiert!\nNetto: €${(selectedUser.iststundenMonat * selectedUser.stundenlohnBrutto * 0.65).toFixed(2)}\nLohnzettel an Mitarbeiter eMail gesendet.`)}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 text-[10px] rounded-lg cursor-pointer"
                    >
                      Abrechnungs-Simulation starten
                    </button>
                  </div>
                </div>
              )}

              {/* HISTORIE PANEL */}
              {detailTab === "historie" && (
                <div className="space-y-4">
                  <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Erbrachte Baustelleneinsätze</p>
                  
                  {selectedUser.baustellenHistorie.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs italic">
                      Bislang wurden keine archivierten Bautage für diesen Mitarbeiter gefunden.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      {selectedUser.baustellenHistorie.map(hist => (
                        <div key={hist.id} className="flex justify-between items-center py-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-700">{hist.baustelleName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{hist.rolle} | {hist.datum}</p>
                          </div>
                          <span className="font-bold font-mono text-slate-700">{hist.stunden} Std</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ZEITERFASSUNG PANEL */}
              {detailTab === "zeiterfassung" && (
                <div className="space-y-4">
                  <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Aktuelle Zeiterfassungszeiten</p>
                  <p className="text-[11px] text-slate-400 font-sans mb-2">Zeigt eine Übersicht aller getätigten Stempelzeiten dieses Monats.</p>
                  
                  <div className="bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 font-mono text-[10px] text-slate-400 uppercase">
                        <tr>
                          <th className="p-2.5">Arbeitstag</th>
                          <th className="p-2.5">Einstieg</th>
                          <th className="p-2.5 text-center">Pause</th>
                          <th className="p-2 text-center">Nettozeit</th>
                          <th className="p-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold">05.06.2026</td>
                          <td className="p-2.5 font-mono">07:15</td>
                          <td className="p-2.5 text-center font-mono">45 Min</td>
                          <td className="p-2 text-center font-bold font-mono">8.5 Std</td>
                          <td className="p-1 text-center">
                            <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">Laufend</span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 border-t border-slate-150">
                          <td className="p-2.5 font-bold">04.06.2026</td>
                          <td className="p-2.5 font-mono">06:30</td>
                          <td className="p-2.5 text-center font-mono">45 Min</td>
                          <td className="p-2 text-center font-bold font-mono">8.6 Std</td>
                          <td className="p-1 text-center">
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase">Freigegeben</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* URLAUB PANEL */}
              {detailTab === "urlaub" && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <p className="font-bold text-slate-800 text-[11px] uppercase font-mono tracking-wider">Jahresurlaubsauswertung 2026</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-center">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-mono leading-none">Vertraglich gesamt</span>
                        <p className="text-xl font-bold text-slate-800 mt-2">{selectedUser.urlaubstageGesamt} Tage</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-mono leading-none">Bereits genommen</span>
                        <p className="text-xl font-bold text-slate-850 mt-2">{selectedUser.urlaubstageVerbraucht} Tage</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 md:col-span-1">
                        <span className="text-[10px] text-indigo-700 uppercase font-mono leading-none font-bold">Resturlaubs-Anspruch</span>
                        <p className="text-xl font-bold text-indigo-800 mt-2">
                          {selectedUser.urlaubstageGesamt - selectedUser.urlaubstageVerbraucht} Tage
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Urlaub genehmigen action */}
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-emerald-950 text-xs">Simulierter Urlaubsdisponent</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Soll der nächste beantragte Urlaubstag direkt genehmigt werden?</p>
                    </div>

                    <button
                      onClick={handleApproveHoliday}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                      <span>Urlaub genehmigen (+1 Tag)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adding User popup panel modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 h-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Neuen Handwerker registrieren</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Fügt die Daten in die HR-Datenbank ein</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-lg p-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Vorname</label>
                  <input
                    type="text"
                    required
                    value={newUser.vorname}
                    onChange={(e) => setNewUser({ ...newUser, vorname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Nachname</label>
                  <input
                    type="text"
                    required
                    value={newUser.nachname}
                    onChange={(e) => setNewUser({ ...newUser, nachname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Telefonnummer</label>
                  <input
                    type="text"
                    required
                    value={newUser.telefon}
                    onChange={(e) => setNewUser({ ...newUser, telefon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    placeholder="+49 (0) ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Rolle</label>
                  <select
                    value={newUser.rolle}
                    onChange={(e) => setNewUser({ ...newUser, rolle: e.target.value as UserRolle })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 text-xs text-slate-700"
                  >
                    {Object.values(UserRolle).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Eintritts-Bruttolohn/Std</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newUser.stundenlohnBrutto}
                    onChange={(e) => setNewUser({ ...newUser, stundenlohnBrutto: parseFloat(e.target.value) || 12 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Sollstunden / Monat</label>
                  <input
                    type="number"
                    value={newUser.sollstundenMonat}
                    onChange={(e) => setNewUser({ ...newUser, sollstundenMonat: parseInt(e.target.value) || 160 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-mono font-bold text-[10px] uppercase">Urlaubstage / Jahr</label>
                  <input
                    type="number"
                    value={newUser.urlaubstageGesamt}
                    onChange={(e) => setNewUser({ ...newUser, urlaubstageGesamt: parseInt(e.target.value) || 28 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans"
                >
                  Mitarbeiter anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
