import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Music, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { api } from '../lib/api';

export function SongsPage() {
  const { masterSongs, setMasterSongs, themes, isLoading: isGlobalLoading } = useAppStore();
  const [isEditing, setIsEditing] = useState<Song | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const themeId = formData.get('themeId') as string;

    try {
      if (isEditing) {
        const updated = await api.updateSong(isEditing.id, { title, artist, themeId });
        setMasterSongs(masterSongs.map(s => s.id === isEditing.id ? updated : s));
        setIsEditing(null);
      } else {
        const nouveau = await api.addSong({ title, artist, themeId });
        setMasterSongs([...masterSongs, nouveau]);
      }
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Erro ao salvar música:', error);
      alert(`Falha ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta canção do repertório?')) return;
    try {
      await api.deleteSong(id);
      setMasterSongs(masterSongs.filter(s => s.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir música:', error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-forest-900/10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-forest-900 mb-2">Repertório</h1>
          <p className="text-forest-700 tracking-wide text-sm uppercase font-semibold">Acervo Musical</p>
        </div>
        <div className="bg-forest-900 text-parchment-200 px-4 py-2 text-sm font-bold tracking-wider">
          {masterSongs.length} CANÇÕES
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-12 bg-white border border-forest-900/10 p-8 shadow-sm">
          <h3 className="font-serif text-2xl mb-6 text-forest-900">
            {isEditing ? 'Editar Canção' : 'Nova Canção'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Título</label>
              <input 
                name="title"
                required
                defaultValue={isEditing?.title || ''}
                type="text" 
                className="w-full bg-transparent border-b border-forest-700/30 py-2 focus:border-forest-900 outline-none transition-colors rounded-none placeholder-forest-900/30 text-forest-900" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Artista / Ministério</label>
              <input 
                name="artist"
                required
                defaultValue={isEditing?.artist || ''}
                type="text" 
                className="w-full bg-transparent border-b border-forest-700/30 py-2 focus:border-forest-900 outline-none transition-colors rounded-none placeholder-forest-900/30 text-forest-900" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Tema Relacionado</label>
              <select 
                name="themeId"
                defaultValue={isEditing?.themeId || ''}
                className="w-full bg-transparent border-b border-forest-700/30 py-2 focus:border-forest-900 outline-none transition-colors rounded-none text-forest-900"
              >
                <option value="">Geral / Sem tema específico</option>
                {themes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-forest-900 text-parchment-200 py-3 font-bold uppercase tracking-wider text-sm hover:bg-forest-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Adicionar'}
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-6 border border-forest-900/20 text-forest-700 hover:bg-forest-50 transition-colors uppercase tracking-wider text-sm font-bold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8 space-y-3">
          {isGlobalLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-forest-900/40">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-serif text-xl">Sintonizando as vozes...</p>
            </div>
          ) : masterSongs.length === 0 ? (
             <div className="py-24 border border-dashed border-forest-900/20 flex flex-col items-center justify-center text-forest-900/40">
              <Music className="w-16 h-16 mb-4 stroke-1" />
              <p className="font-serif text-xl">Repertório vazio.</p>
            </div>
          ) : (
            masterSongs.map(song => (
              <div 
                key={song.id} 
                className="group relative bg-white border border-forest-900/5 p-5 flex items-center justify-between hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <h4 className="font-serif text-xl text-forest-900">{song.title}</h4>
                  <p className="text-xs uppercase tracking-widest text-forest-500 mt-1">
                    {song.artist} • <span className="text-amber-600">{themes.find(t => t.id === song.themeId)?.name || 'Geral'}</span>
                  </p>
                </div>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setIsEditing(song)}
                    className="p-3 text-forest-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(song.id)}
                    className="p-3 text-forest-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-forest-900 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
