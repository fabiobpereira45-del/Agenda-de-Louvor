import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Scale, Theme, Song } from '../types';
import { api } from '../lib/api';

interface AppContextType {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  scales: Scale[];
  setScales: React.Dispatch<React.SetStateAction<Scale[]>>;
  themes: Theme[];
  setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
  masterSongs: Song[];
  setMasterSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [themes, setThemes] = useState<Theme[]>(DEFAULT_THEMES);
  const [masterSongs, setMasterSongs] = useState<Song[]>([]);

  // Carregamento inicial do Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [dbMembers, dbThemes, dbSongs, dbScales] = await Promise.all([
          api.getMembers(),
          api.getThemes(),
          api.getSongs(),
          api.getScales()
        ]);
        
        if (dbMembers) setMembers(dbMembers);
        if (dbThemes && dbThemes.length > 0) setThemes(dbThemes);
        if (dbSongs) setMasterSongs(dbSongs);
        if (dbScales) setScales(dbScales);

      } catch (error) {
        console.error('Erro ao sincronizar com Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{
      members, setMembers,
      scales, setScales,
      themes, setThemes,
      masterSongs, setMasterSongs,
      isLoading
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
