/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Material,
  Maschine,
  Fahrzeug,
  Baustelle,
  Bautag,
  Zeiterfassung,
  UserRolle
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_MATERIALS,
  INITIAL_MASCHINEN,
  INITIAL_FAHRZEUGE,
  INITIAL_BAUSTELLEN,
  INITIAL_BAUTAGE,
  INITIAL_ZEITERFASSUNGEN,
  ERPStorage
} from "./mockData";

interface StateContextType {
  currentUser: User;
  users: User[];
  materials: Material[];
  maschinen: Maschine[];
  fahrzeuge: Fahrzeug[];
  baustellen: Baustelle[];
  bautage: Bautag[];
  zeiterfassungen: Zeiterfassung[];
  
  // Setters/Updaters
  switchUser: (userId: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  addBaustelle: (b: Baustelle) => void;
  updateBaustelle: (b: Baustelle) => void;
  addBautag: (bt: Bautag) => void;
  updateBautag: (bt: Bautag) => void;
  deleteBautag: (id: string) => void;
  addZeiterfassung: (z: Zeiterfassung) => void;
  updateZeiterfassung: (z: Zeiterfassung) => void;
  updateMaterial: (m: Material) => void;
  updateMaschine: (mas: Maschine) => void;
  updateFahrzeug: (f: Fahrzeug) => void;
  resetAll: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => ERPStorage.get("users", INITIAL_USERS));
  const [materials, setMaterials] = useState<Material[]>(() => ERPStorage.get("materials", INITIAL_MATERIALS));
  const [maschinen, setMaschinen] = useState<Maschine[]>(() => ERPStorage.get("maschinen", INITIAL_MASCHINEN));
  const [fahrzeuge, setFahrzeuge] = useState<Fahrzeug[]>(() => ERPStorage.get("fahrzeuge", INITIAL_FAHRZEUGE));
  const [baustellen, setBaustellen] = useState<Baustelle[]>(() => ERPStorage.get("baustellen", INITIAL_BAUSTELLEN));
  const [bautage, setBautage] = useState<Bautag[]>(() => ERPStorage.get("bautage", INITIAL_BAUTAGE));
  const [zeiterfassungen, setZeiterfassungen] = useState<Zeiterfassung[]>(() => ERPStorage.get("zeiterfassungen", INITIAL_ZEITERFASSUNGEN));
  
  // Simulated Logged in User ID (Defaults to u1 - Admin)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return ERPStorage.get("current_user_id", "u1");
  });

  // Keep state synced to localStorage
  useEffect(() => { ERPStorage.set("users", users); }, [users]);
  useEffect(() => { ERPStorage.set("materials", materials); }, [materials]);
  useEffect(() => { ERPStorage.set("maschinen", maschinen); }, [maschinen]);
  useEffect(() => { ERPStorage.set("fahrzeuge", fahrzeuge); }, [fahrzeuge]);
  useEffect(() => { ERPStorage.set("baustellen", baustellen); }, [baustellen]);
  useEffect(() => { ERPStorage.set("bautage", bautage); }, [bautage]);
  useEffect(() => { ERPStorage.set("zeiterfassungen", zeiterfassungen); }, [zeiterfassungen]);
  useEffect(() => { ERPStorage.set("current_user_id", currentUserId); }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    if (users.find(u => u.id === userId)) {
      setCurrentUserId(userId);
    }
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const addBaustelle = (b: Baustelle) => {
    setBaustellen(prev => [...prev, b]);
  };

  const updateBaustelle = (updated: Baustelle) => {
    setBaustellen(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const addBautag = (bt: Bautag) => {
    setBautage(prev => {
      // Avoid duplicate assignments for the same baustelle and date
      const filtered = prev.filter(p => !(p.baustelleId === bt.baustelleId && p.datum === bt.datum));
      return [...filtered, bt];
    });
  };

  const updateBautag = (updated: Bautag) => {
    setBautage(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBautag = (id: string) => {
    setBautage(prev => prev.filter(bt => bt.id !== id));
  };

  const addZeiterfassung = (z: Zeiterfassung) => {
    setZeiterfassungen(prev => {
      // Overwrite if entry matches the user and date
      const filtered = prev.filter(item => !(item.userId === z.userId && item.datum === z.datum));
      return [...filtered, z];
    });

    // Automatically update actual hours in the user's monthly progress
    setUsers(prev => prev.map(u => {
      if (u.id === z.userId) {
        // Recalculate logged hours for this month
        const thisMonthHoursStr = z.datum.substring(0, 7); // YYYY-MM
        const totalHours = [z, ...zeiterfassungen.filter(item => item.userId === z.userId && !item.freigegeben && item.datum !== z.datum)]
          .filter(item => item.datum.startsWith(thisMonthHoursStr))
          .reduce((sum, item) => sum + (item.arbeitszeitNetto || 0), 0);
        return {
          ...u,
          iststundenMonat: Number(totalHours.toFixed(1))
        };
      }
      return u;
    }));
  };

  const updateZeiterfassung = (updated: Zeiterfassung) => {
    setZeiterfassungen(prev => prev.map(z => z.id === updated.id ? updated : z));
  };

  const updateMaterial = (updated: Material) => {
    setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const updateMaschine = (updated: Maschine) => {
    setMaschinen(prev => prev.map(mas => mas.id === updated.id ? updated : mas));
  };

  const updateFahrzeug = (updated: Fahrzeug) => {
    setFahrzeuge(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const resetAll = () => {
    ERPStorage.clearAll();
    setUsers(INITIAL_USERS);
    setMaterials(INITIAL_MATERIALS);
    setMaschinen(INITIAL_MASCHINEN);
    setFahrzeuge(INITIAL_FAHRZEUGE);
    setBaustellen(INITIAL_BAUSTELLEN);
    setBautage(INITIAL_BAUTAGE);
    setZeiterfassungen(INITIAL_ZEITERFASSUNGEN);
    setCurrentUserId("u1");
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        users,
        materials,
        maschinen,
        fahrzeuge,
        baustellen,
        bautage,
        zeiterfassungen,
        switchUser,
        addUser,
        updateUser,
        addBaustelle,
        updateBaustelle,
        addBautag,
        updateBautag,
        deleteBautag,
        addZeiterfassung,
        updateZeiterfassung,
        updateMaterial,
        updateMaschine,
        updateFahrzeug,
        resetAll
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useERPState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useERPState must be used within a StateProvider");
  }
  return context;
};
