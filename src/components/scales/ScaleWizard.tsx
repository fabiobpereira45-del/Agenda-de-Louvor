import React, { useState } from 'react';
import { Member, Theme, Scale, Song } from '../../types';
import { X, Search, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../../context/AppContext';
import { api } from '../../lib/api';

interface ScaleWizardProps {
  initialData?: Scale;
  onClose: () => void;
  onSave: (scale: Scale) => void;
}

export const ScaleWizard: React.FC<ScaleWizardProps> = ({ initialData, onClose, onSave }) => {
  const { members, themes, masterSongs } = useAppStore();
  
  const [date, setDate] = useState(initialData?.date || '');
  const [theme, setTheme] = useState(initialData?.theme || '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialData?.memberIds || []);
  const [songs, setSongs] = useState<Song[]>(initialData?.songs || []);
  const [isSaving, setIsSaving] = useState(false);
  
  const [songInput, setSongInput] = useState({ title: '', artist: '' });
  const [songSearchQuery, setSongSearchQuery] = useState('');

  const handleSave = async () => {
    if (!date || !theme) {
      alert("Por favor, preencha a data e o tema.");
      return;
    }

    setIsSaving(true);
    try {
      const scaleData = {
        date,
        theme,
        memberIds: selectedMembers,
        songs
      };

      if (initialData) {
        await api.updateScale(initialData.id, scaleData);
        onSave({ ...scaleData, id: initialData.id });
      } else {
        const nouveau = await api.addScale(scaleData);
        onSave(nouveau);
      }
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
      alert('Falha ao salvar escala no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const addSong = () => {
    if (songInput.title && songInput.artist) {
      setSongs([...songs, { id: crypto.randomUUID(), ...songInput, themeId: '' }]);
      setSongInput({ title: '', artist: '' });
    }
  };

  // Group members by role for better selection
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  // Filter master songs
  const filteredMasterSongs = masterSongs.filter(s => 
    s.title.toLowerCase().includes(songSearchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(songSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-forest-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-parchment-200 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-forest-900/20"
      >
        <div className="flex justify-between items-center p-6 border-b border-forest-900/10 bg-white">
          <h2 className="text-2xl font-serif text-forest-900">
            {initialData ? 'Editar Escala' : 'Nova Escala'}
          </h2>
          <button onClick={onClose} className="p-2 text-forest-500 hover:text-forest-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Info & Repertory */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-widest text-forest-500 font-semibold border-b border-forest-900/10 pb-2">
                  1. Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">Data do Culto</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-white border border-forest-900/10 py-3 px-4 focus:border-amber-500 outline-none text-forest-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">Tema</label>
                    <select 
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      className="w-full bg-white border border-forest-900/10 py-3 px-4 focus:border-amber-500 outline-none text-forest-900 font-serif"
                    >
                      <option value="">Selecione...</option>
                      {themes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-widest text-forest-500 font-semibold border-b border-forest-900/10 pb-2">
                  2. Repertório
                </h3>
                
                {/* Search Master List */}
                {masterSongs.length > 0 && (
                  <div className="bg-white p-4 border border-forest-900/10 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar no acervo..."
                        value={songSearchQuery}
                        onChange={e => setSongSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-parchment-200 border-none outline-none text-sm text-forest-900"
                      />
                    </div>
                    {songSearchQuery && (
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredMasterSongs.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-2 hover:bg-parchment-200 text-sm">
                            <span><strong className="font-serif">{s.title}</strong> - {s.artist}</span>
                            <button 
                              onClick={() => {
                                // Usa o ID original da música (não cria UUID novo)
                                if (!songs.some(existing => existing.id === s.id)) {
                                  setSongs([...songs, s]);
                                }
                              }}
                              className="text-amber-600 hover:text-amber-700 font-bold text-[10px] uppercase tracking-wider"
                            >
                              Adicionar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Add */}
                <div className="flex gap-2">
                  <input 
                    placeholder="Título" 
                    value={songInput.title}
                    onChange={e => setSongInput({...songInput, title: e.target.value})}
                    className="flex-1 bg-white border border-forest-900/10 py-2 px-3 text-sm focus:border-amber-500 outline-none"
                  />
                  <input 
                    placeholder="Artista" 
                    value={songInput.artist}
                    onChange={e => setSongInput({...songInput, artist: e.target.value})}
                    className="flex-1 bg-white border border-forest-900/10 py-2 px-3 text-sm focus:border-amber-500 outline-none"
                  />
                  <button onClick={addSong} className="bg-forest-900 text-parchment-200 px-4 hover:bg-forest-700 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected Songs */}
                <div className="space-y-2">
                  {songs.map((song, idx) => (
                    <div key={song.id} className="flex items-center justify-between bg-white border border-forest-900/5 p-3 group">
                      <div className="flex gap-4">
                        <span className="text-forest-400 font-mono text-sm">{idx + 1}.</span>
                        <div>
                          <p className="font-serif text-forest-900 leading-none">{song.title}</p>
                          <p className="text-[10px] uppercase tracking-widest text-forest-500 mt-1">{song.artist}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSongs(songs.filter(s => s.id !== song.id))}
                        className="text-forest-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {songs.length === 0 && (
                    <p className="text-xs text-forest-500 italic">Nenhuma música adicionada.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Ministry Selection */}
            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-forest-500 font-semibold border-b border-forest-900/10 pb-2">
                3. Equipe Ministrante
              </h3>
              
              <div className="space-y-8">
                {(Object.entries(groupedMembers) as [string, Member[]][]).map(([role, roleMembers]) => (
                  <div key={role} className="space-y-3">
                    <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{role}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {roleMembers.map(member => {
                        const isSelected = selectedMembers.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            onClick={() => toggleMember(member.id)}
                            className={`flex items-center justify-between p-3 border text-sm text-left transition-all ${
                              isSelected 
                                ? 'bg-forest-900 text-parchment-200 border-forest-900' 
                                : 'bg-white border-forest-900/10 hover:border-forest-900/30 text-forest-900'
                            }`}
                          >
                            <span className="font-medium truncate">{member.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-xs text-forest-500 italic">Nenhum membro cadastrado no sistema.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-forest-900/10 bg-white flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 border border-forest-900/20 text-forest-700 font-bold text-sm uppercase tracking-wider hover:bg-forest-50">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-3 bg-amber-500 text-forest-900 font-bold text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? 'Atualizar Escala' : 'Criar Escala'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
