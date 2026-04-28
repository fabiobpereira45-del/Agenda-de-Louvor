import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Users, Plus, Trash2, Edit2, User, Loader2 } from 'lucide-react';
import { Member } from '../types';
import { api } from '../lib/api';

export function MembersPage() {
  const { members, setMembers, isLoading: isGlobalLoading } = useAppStore();
  const [isEditing, setIsEditing] = useState<Member | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    try {
      if (isEditing) {
        const updated = await api.updateMember(isEditing.id, { name, role });
        setMembers(members.map(m => m.id === isEditing.id ? updated : m));
        setIsEditing(null);
      } else {
        const nouveau = await api.addMember({ name, role });
        setMembers([...members, nouveau]);
      }
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Erro ao salvar membro:', error);
      alert(`Falha ao salvar: ${error.message || 'Verifique sua conexão'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este integrante?')) return;
    
    try {
      await api.deleteMember(id);
      setMembers(members.filter(m => m.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir membro:', error);
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-forest-900/10 pb-4 md:pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif text-forest-900 mb-1">Membros</h1>
          <p className="text-forest-700 tracking-wide text-xs md:text-sm uppercase font-semibold">Corpo de Adoradores</p>
        </div>
        <div className="bg-forest-900 text-parchment-200 px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold tracking-wider">
          {members.length} CADASTRADOS
        </div>
      </header>

      {/* Extreme Asymmetry: 30/70 Split (Form vs List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
        
        {/* Form Column - Sticky & Sharp */}
        <div className="lg:col-span-4 lg:sticky lg:top-12 bg-forest-900 text-parchment-200 p-8 shadow-2xl">
          <h3 className="font-serif text-2xl mb-6 text-amber-400">
            {isEditing ? 'Editar Registro' : 'Novo Integrante'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Nome Completo</label>
              <input 
                name="name"
                required
                defaultValue={isEditing?.name || ''}
                type="text" 
                className="w-full bg-transparent border-b border-forest-700 py-2 focus:border-amber-500 outline-none transition-colors rounded-none placeholder-forest-700" 
                placeholder="Ex: João Silva"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Ministério</label>
              <select 
                name="role"
                required
                defaultValue={isEditing?.role || ''}
                className="w-full bg-forest-900 border-b border-forest-700 py-2 focus:border-amber-500 outline-none transition-colors rounded-none text-parchment-200"
              >
                <option value="" disabled className="text-forest-700">Selecione...</option>
                <option value="Vocal">Vocal</option>
                <option value="Violão">Violão</option>
                <option value="Guitarra">Guitarra</option>
                <option value="Baixo">Baixo</option>
                <option value="Bateria">Bateria</option>
                <option value="Teclado">Teclado</option>
                <option value="Sonorização">Sonorização</option>
              </select>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-amber-500 text-forest-900 py-3 font-bold uppercase tracking-wider text-sm hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Adicionar'}
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="px-6 border border-forest-700 text-forest-500 hover:text-parchment-200 hover:border-parchment-200 transition-colors uppercase tracking-wider text-sm font-bold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column - Minimalist overlapping layout */}
        <div className="lg:col-span-8 space-y-4">
          {isGlobalLoading ? (
             <div className="py-24 flex flex-col items-center justify-center text-forest-900/40">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-serif text-xl">Sincronizando com o céu...</p>
             </div>
          ) : members.length === 0 ? (
            <div className="py-24 border border-dashed border-forest-900/20 flex flex-col items-center justify-center text-forest-900/40">
              <User className="w-16 h-16 mb-4 stroke-1" />
              <p className="font-serif text-xl">O santuário está vazio.</p>
              <p className="text-sm tracking-wide">Adicione o primeiro membro.</p>
            </div>
          ) : (
            members.map(member => (
              <div 
                key={member.id} 
                className="group relative bg-white border border-forest-900/5 p-6 flex items-center justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-6">
                  {/* Avatar substitute - Sharp geometry */}
                  <div className="w-12 h-12 bg-forest-900 flex items-center justify-center text-amber-500 font-serif text-xl">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-forest-900">{member.name}</h4>
                    <span className="text-xs uppercase tracking-widest text-forest-500">{member.role}</span>
                  </div>
                </div>
                
                {/* Actions - visible on hover, sharp lines */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setIsEditing(member)}
                    className="p-3 text-forest-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-3 text-forest-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Hover decorative element */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
