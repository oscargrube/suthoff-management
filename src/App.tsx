/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { StateProvider, useERPState } from "./data/StateContext";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Wochenplanung } from "./components/Wochenplanung";
import { MitarbeiterBereich } from "./components/MitarbeiterBereich";
import { WochenstundenBereich } from "./components/WochenstundenBereich";
import { MitarbeiterDateien } from "./components/MitarbeiterDateien";
import { AdminMitarbeiter } from "./components/AdminMitarbeiter";
import { AdminBaustellen } from "./components/AdminBaustellen";
import { LagerVerwaltung } from "./components/LagerVerwaltung";
import { MaschinenFuhrpark } from "./components/MaschinenFuhrpark";
import { FinanzAnalyse } from "./components/FinanzAnalyse";
import { UserRolle } from "./types";
import { LayoutDashboard } from "lucide-react";

const MainLayout: React.FC = () => {
  const { currentUser } = useERPState();
  
  // Tab control
  // Admins see Dashboard by default, crew starts on their workplace terminal
  const [currentTab, setTab] = useState<string>(() => {
    return currentUser.rolle === UserRolle.ADMIN ? "dashboard" : "mitarbeiter-bereich";
  });

  const getHeaderTitle = () => {
    switch (currentTab) {
      case "dashboard":
        return "Unternehmens-Zentrale & Dashboard";
      case "mitarbeiter-bereich":
        return "Mitarbeiter Arbeitsbereich & Mobile Terminal";
      case "wochenplan-stunden":
        return "Wochenplanung & Stundenkonto";
      case "meine-dateien":
        return "Digitale Personalakte & Dokumente";
      case "disposition":
        return "Einsatzplanung & Disposition";
      case "projekte":
        return "Baustellen-Übersichten & Zeitlinien";
      case "mitarbeiter-admin":
        return "Personal- & Stammdatenverwaltung";
      case "lager":
        return "Material- & Lagerverwaltung";
      case "maschinen":
        return "Maschinenpark- & Fuhrparkdisposition";
      case "finanzen":
        return "Controlling, Finanzen & Rentabilität";
      default:
        return "GaLaBau ERP";
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard />;
      case "mitarbeiter-bereich":
        return <MitarbeiterBereich setTab={setTab} />;
      case "wochenplan-stunden":
        return <WochenstundenBereich />;
      case "meine-dateien":
        return <MitarbeiterDateien />;
      case "disposition":
        return <Wochenplanung />;
      case "projekte":
        return <AdminBaustellen />;
      case "mitarbeiter-admin":
        return <AdminMitarbeiter />;
      case "lager":
        return <LagerVerwaltung />;
      case "maschinen":
        return <MaschinenFuhrpark />;
      case "finanzen":
        return <FinanzAnalyse />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#fafbfc] text-emerald-950 font-sans overflow-hidden" id="galabau-master-app text-xs">
      {/* Dynamic left side menu bar */}
      <Sidebar currentTab={currentTab} setTab={setTab} />

      {/* Primary content area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top bar header */}
        <header className="bg-white border-b border-emerald-900/10 px-8 py-4.5 shrink-0 flex justify-between items-center z-10">
          <div className="min-w-0">
            <h2 className="font-bold text-emerald-950 text-sm tracking-tight truncate uppercase font-sans">
              {getHeaderTitle()}
            </h2>
            <p className="text-[10px] text-emerald-700/60 font-mono tracking-wider mt-0.5">GaLaBau ERP v1.0.0 • Simulationsmodus</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right hidden sm:block">
              <span className="font-mono text-[9px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded font-bold border border-emerald-200/60 uppercase tracking-wider">
                Meisterzentrale Aktiv
              </span>
              <p className="text-[10px] text-emerald-600/70 mt-1.5 font-sans">Nutzer: {currentUser.vorname} {currentUser.nachname}</p>
            </div>
          </div>
        </header>

        {/* Tab view containers */}
        <section className="flex-1 overflow-y-auto p-8 relative bg-emerald-50/10">
          {renderActiveTab()}
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <StateProvider>
      <MainLayout />
    </StateProvider>
  );
}
