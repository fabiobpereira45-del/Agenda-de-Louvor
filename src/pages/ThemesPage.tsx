import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { BookOpen, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Theme } from '../types';
import { api } from '../lib/api';

export function ThemesPage() {
  const { themes, setThemes, isLoading: isGlobalLoading } = useAppStore();
  const [isEditing, setIsEditing] = useState<Theme | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      if (isEditing) {
        const updated = await api.updateTheme(isEditing.id, { name });
        setThemes(themes.map(t => t.id === isEditing.id ? updated : t));
        setIsEditing(null);
      } else {
        const nouveau = await api.addTheme({ name });
        setThemes([...themes, nouveau]);
      }
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Erro ao salvar tema:', error);
      alert(`Falha ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este tema?')) return;
    try {
      await api.deleteTheme(id);
      setThemes(themes.filter(t => t.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir tema:', error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-forest-900/10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-forest-900 mb-2">Temas</h1>
          <p className="text-forest-700 tracking-wide text-sm uppercase font-semibold">Direcionamento do Culto</p>
        </div>
        <div className="bg-forest-900 text-parchment-200 px-4 py-2 text-sm font-bold tracking-wider">
          {themes.length} REGISTRADOS
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-12 bg-white border border-forest-900/10 p-8 shadow-sm">
          <h3 className="font-serif text-2xl mb-6 text-forest-900">
            {isEditing ? 'Renomear Tema' : 'Novo Tema'}
          </h3>
          
          <form key={isEditing?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Nome do Tema</label>
              <input 
                name="name"
                required
                defaultValue={isEditing?.name ?? ''}
                type="text" 
                className="w-full bg-transparent border-b border-forest-700/30 py-2 focus:border-forest-900 outline-none transition-colors rounded-none placeholder-forest-900/30 text-forest-900" 
                placeholder="Ex: Culto de Missões"
              />
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

        {/* List Column - Grid style for themes */}
        <div className="lg:col-span-8">
          {isGlobalLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-forest-900/40">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-serif text-xl">Organizando os manuscritos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map(theme => (
                <div 
                  key={theme.id} 
                  className="group relative bg-parchment-100 border border-forest-900/10 p-5 flex items-center justify-between hover:border-forest-900 transition-all duration-300"
                >
                  <span className="font-serif text-lg text-forest-900">{theme.name}</span>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setIsEditing(theme)}
                      className="p-2 text-forest-500 hover:text-amber-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(theme.id)}
                      className="p-2 text-forest-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {themes.length === 0 && (
            <div className="py-24 border border-dashed border-forest-900/20 flex flex-col items-center justify-center text-forest-900/40">
              <BookOpen className="w-16 h-16 mb-4 stroke-1" />
              <p className="font-serif text-xl">Nenhum tema definido.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
