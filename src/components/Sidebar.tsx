/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useERPState } from "../data/StateContext";
import { UserRolle } from "../types";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Users,
  HardHat,
  Truck,
  LineChart,
  Warehouse,
  FileText,
  Clock,
  RotateCcw,
  ShieldCheck,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { currentUser, users, switchUser, resetAll } = useERPState();

  // Define navigations and visibility based on role
  const isAdmin = currentUser.rolle === UserRolle.ADMIN;
  const isVorarbeiter =
    currentUser.rolle === UserRolle.VORARBEITER_BAU ||
    currentUser.rolle === UserRolle.VORARBEITER_PFLEGE;

  // Let's list menu items with icons and role access rules
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [UserRolle.ADMIN, UserRolle.VORARBEITER_BAU, UserRolle.VORARBEITER_PFLEGE, UserRolle.MITARBEITER, UserRolle.AZUBI, UserRolle.PRAKTIKANT]
    },
    {
      id: "mitarbeiter-bereich",
      label: "Mein Arbeitsbereich",
      icon: Clock,
      roles: [UserRolle.VORARBEITER_BAU, UserRolle.VORARBEITER_PFLEGE, UserRolle.MITARBEITER, UserRolle.AZUBI, UserRolle.PRAKTIKANT],
      badge: "Mobil optimiert"
    },
    {
      id: "wochenplan-stunden",
      label: "Wochenplan & Stunden",
      icon: CalendarDays,
      roles: [UserRolle.ADMIN, UserRolle.VORARBEITER_BAU, UserRolle.VORARBEITER_PFLEGE, UserRolle.MITARBEITER, UserRolle.AZUBI, UserRolle.PRAKTIKANT]
    },
    {
      id: "meine-dateien",
      label: "Meine Dateien",
      icon: FileText,
      roles: [UserRolle.ADMIN, UserRolle.VORARBEITER_BAU, UserRolle.VORARBEITER_PFLEGE, UserRolle.MITARBEITER, UserRolle.AZUBI, UserRolle.PRAKTIKANT]
    },
    {
      id: "disposition",
      label: "Wochenplanung (Dispo)",
      icon: CalendarDays,
      roles: [UserRolle.ADMIN] // Only admin has write dispo, others see via Dashboard/Workplace
    },
    {
      id: "projekte",
      label: "Baustellen & Gantt",
      icon: Briefcase,
      roles: [UserRolle.ADMIN]
    },
    {
      id: "mitarbeiter-admin",
      label: "Mitarbeiterverwaltung",
      icon: Users,
      roles: [UserRolle.ADMIN]
    },
    {
      id: "lager",
      label: "Lager & Materialien",
      icon: Warehouse,
      roles: [UserRolle.ADMIN]
    },
    {
      id: "maschinen",
      label: "Maschinen & Fuhrpark",
      icon: HardHat,
      roles: [UserRolle.ADMIN]
    },
    {
      id: "finanzen",
      label: "Finanzauswertung & Soll-Ist",
      icon: LineChart,
      roles: [UserRolle.ADMIN]
    }
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(currentUser.rolle));

  const getRoleColor = (role: UserRolle) => {
    switch (role) {
      case UserRolle.ADMIN:
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200";
      case UserRolle.VORARBEITER_BAU:
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200";
      case UserRolle.VORARBEITER_PFLEGE:
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200";
      case UserRolle.MITARBEITER:
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200";
      case UserRolle.AZUBI:
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200";
      case UserRolle.PRAKTIKANT:
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabelString = (role: UserRolle) => {
    switch (role) {
      case UserRolle.ADMIN: return "Admin (Vollzugriff)";
      case UserRolle.VORARBEITER_BAU: return "Vorarbeiter (Bau)";
      case UserRolle.VORARBEITER_PFLEGE: return "Vorarbeiter (Pflege)";
      case UserRolle.MITARBEITER: return "Mitarbeiter";
      case UserRolle.AZUBI: return "Azubi (+Berichtsheft)";
      case UserRolle.PRAKTIKANT: return "Praktikant (Eingeschränkt)";
    }
  };

  return (
    <aside className="w-80 bg-emerald-950 text-emerald-50 h-screen flex flex-col border-r border-emerald-900 overflow-y-auto">
      {/* Brand logo & system header */}
      <div className="p-6 border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase className="w-5 h-5 text-emerald-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none text-white">GaLaBau ERP</h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest mt-1 uppercase">Baustellen-Manager</p>
          </div>
        </div>
      </div>

      {/* Simulated Identity Selector Grid */}
      <div className="p-4 bg-emerald-900/30 border-b border-emerald-900/50">
        <label className="block text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5" />
          Aktuelle Ansicht simulieren:
        </label>
        
        <select
          value={currentUser.id}
          onChange={(e) => {
            switchUser(e.target.value);
            // Auto switch active tab to corresponding space to prevent stuck empty pages
            const nextUser = users.find(u => u.id === e.target.value);
            if (nextUser) {
              if (nextUser.rolle === UserRolle.ADMIN) {
                setTab("dashboard");
              } else {
                setTab("mitarbeiter-bereich");
              }
            }
          }}
          className="w-full bg-emerald-900 border border-emerald-800 text-white rounded-lg py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.vorname} {u.nachname} ({getRoleLabelString(u.rolle)})
            </option>
          ))}
        </select>

        {/* Profile Card Summary */}
        <div className="mt-3 bg-emerald-950/60 rounded-lg p-2.5 flex items-center gap-2.5 border border-emerald-930">
          <img
            src={currentUser.profilbild}
            alt={currentUser.nachname}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-xs leading-none text-white truncate">
              {currentUser.vorname} {currentUser.nachname}
            </p>
            <p className="text-[10px] text-emerald-300 font-mono mt-1 leading-none">
              {currentUser.personalnummer}
            </p>
            <div className="mt-1.5">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border leading-none ${getRoleColor(currentUser.rolle)}`}>
                {currentUser.rolle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation options */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase px-3 mb-2">Navigation</div>
        
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/10"
                  : "text-emerald-300 hover:bg-emerald-900/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-400 group-hover:text-white"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom utility controls */}
      <div className="p-4 border-t border-emerald-900 bg-emerald-950/40">
        <button
          onClick={() => {
            if (confirm("Möchten Sie alle Daten auf die Ausgangswerte zurücksetzen?")) {
              resetAll();
              alert("System zurückgesetzt!");
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-900/30 border border-emerald-800 hover:bg-emerald-900/60 hover:text-white transition-all text-emerald-400 text-xs rounded-lg cursor-pointer font-sans"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Werkseinstellung laden</span>
        </button>
      </div>
    </aside>
  );
};
