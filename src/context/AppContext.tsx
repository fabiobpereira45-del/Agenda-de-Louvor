import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Scale, Theme, Song } from '../types';

interface AppContextType {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  scales: Scale[];
  setScales: React.Dispatch<React.SetStateAction<Scale[]>>;
  themes: Theme[];
  setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
  masterSongs: Song[];
  setMasterSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_THEMES: Theme[] = [
  { id: '1', name: 'Adoração' },
  { id: '2', name: 'Gratidão' },
  { id: '3', name: 'Poder do Espírito' },
  { id: '4', name: 'Exaltação a Deus' },
  { id: '5', name: 'Páscoa' },
  { id: '6', name: 'Natal' },
  { id: '7', name: 'Missões' },
  { id: '8', name: 'Família' },
  { id: '9', name: 'Celebração' },
  { id: '10', name: 'Fogo' },
  { id: '11', name: 'Corinhos' },
  { id: '12', name: 'Hinos da Harpa' },
  { id: '13', name: 'Santidade' },
  { id: '14', name: 'Cura e Libertação' },
  { id: '15', name: 'Vida Eterna' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('louvor_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [scales, setScales] = useState<Scale[]>(() => {
    const saved = localStorage.getItem('louvor_scales');
    return saved ? JSON.parse(saved) : [];
  });

  const [themes, setThemes] = useState<Theme[]>(() => {
    const saved = localStorage.getItem('louvor_themes');
    return saved ? JSON.parse(saved) : DEFAULT_THEMES;
  });

  const [masterSongs, setMasterSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('louvor_master_songs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('louvor_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('louvor_scales', JSON.stringify(scales));
  }, [scales]);

  useEffect(() => {
    localStorage.setItem('louvor_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('louvor_master_songs', JSON.stringify(masterSongs));
  }, [masterSongs]);

  return (
    <AppContext.Provider value={{
      members, setMembers,
      scales, setScales,
      themes, setThemes,
      masterSongs, setMasterSongs
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
