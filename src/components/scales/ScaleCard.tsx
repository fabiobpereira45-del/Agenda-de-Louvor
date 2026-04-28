import React from 'react';
import { Scale, Member } from '../../types';
import { Calendar, Download, Edit2, Trash2, Music, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScaleCardProps {
  scale: Scale;
  members: Member[];
  onView: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onDownload: () => void;
}

export const ScaleCard: React.FC<ScaleCardProps> = ({ scale, members, onView, onEdit, onDelete, onDownload }) => {
  const dateObj = React.useMemo(() => {
    try {
      return scale.date ? parseISO(scale.date) : new Date();
    } catch (e) {
      return new Date();
    }
  }, [scale.date]);

  const safeFormat = (date: Date, pattern: string) => {
    try {
      return format(date, pattern, { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  return (
    <div className="group relative bg-white border border-forest-900/10 hover:border-forest-900 transition-colors duration-300">
      
      {/* Decorative top border */}
      <div className="h-1 bg-amber-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      
      {/* Invisible element for PDF generation */}
      <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        <div id={`scale-report-${scale.id}`} className="w-[800px] p-12 font-sans" style={{ backgroundColor: '#F9F7F2', color: '#0F1F1C' }}>
        <div className="border-b-2 pb-6 mb-8 text-center" style={{ borderColor: '#0F1F1C' }}>
          <h1 className="text-4xl font-serif mb-2">Escala de Louvor</h1>
          <p className="text-xl uppercase tracking-widest" style={{ color: '#1A332E' }}>
            {safeFormat(dateObj, "dd 'de' MMMM 'de' yyyy")}
          </p>
          <p className="text-lg mt-2 font-serif italic">Tema: {scale.theme}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-serif border-b pb-2 mb-4" style={{ borderColor: 'rgba(15, 31, 28, 0.2)' }}>Ministério</h2>
            <ul className="space-y-3">
              {scale.memberIds.map(mId => {
                const m = members.find(x => x.id === mId);
                return m ? (
                  <li key={mId} className="flex justify-between border-b border-dashed pb-1" style={{ borderColor: 'rgba(15, 31, 28, 0.2)' }}>
                    <span className="font-bold">{m.name}</span>
                    <span className="text-sm uppercase" style={{ color: '#254740' }}>{m.role}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-serif border-b pb-2 mb-4" style={{ borderColor: 'rgba(15, 31, 28, 0.2)' }}>Repertório</h2>
            <ul className="space-y-4">
              {scale.songs.map((s, idx) => (
                <li key={idx}>
                  <div className="font-bold text-lg">{idx + 1}. {s.title}</div>
                  <div className="text-sm" style={{ color: '#254740' }}>{s.artist}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {safeFormat(dateObj, "dd 'de' MMM")}
            </div>
            <h3 className="text-2xl font-serif text-forest-900">{scale.theme}</h3>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onView} className="px-3 py-1 bg-amber-500/10 text-amber-700 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-forest-900 transition-colors" title="Ver detalhes">
              Ver
            </button>
            <button onClick={onDownload} className="p-2 text-forest-500 hover:text-forest-900 transition-colors" title="Baixar PDF">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onEdit} className="p-2 text-forest-500 hover:text-amber-600 transition-colors" title="Editar">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(scale.id)} className="p-2 text-forest-500 hover:text-red-700 transition-colors" title="Excluir">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs uppercase tracking-widest text-forest-400 font-semibold mb-3 flex items-center gap-2">
              <Music className="w-3 h-3" /> Repertório
            </h4>
            <div className="space-y-2">
              {scale.songs.slice(0, 3).map((song, idx) => (
                <div key={idx} className="text-sm text-forest-800 font-medium">
                  {idx + 1}. {song.title} <span className="text-forest-400 font-normal">/ {song.artist}</span>
                </div>
              ))}
              {scale.songs.length > 3 && (
                <div className="text-xs text-amber-600 font-bold tracking-wider">
                  + {scale.songs.length - 3} CANÇÕES
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-forest-400 font-semibold mb-3 flex items-center gap-2">
              <User className="w-3 h-3" /> Ministério
            </h4>
            <div className="flex flex-wrap gap-2">
              {scale.memberIds.slice(0, 4).map(mId => {
                const member = members.find(m => m.id === mId);
                return member ? (
                  <span key={mId} className="text-[10px] uppercase tracking-widest bg-parchment-200 text-forest-700 px-2 py-1 border border-forest-900/10">
                    {member.name.split(' ')[0]}
                  </span>
                ) : null;
              })}
              {scale.memberIds.length > 4 && (
                <span className="text-[10px] font-bold text-amber-600 self-center ml-1">
                  +{scale.memberIds.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
