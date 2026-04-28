import React, { useState } from 'react';
import { Scale, Member, Song } from '../../types';
import { X, Youtube, User, Music, Calendar, FileText, Download, Clipboard, CheckCircle2, Plus, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';

interface ScaleDetailProps {
  scale: Scale;
  members: Member[];
  onClose: () => void;
  onEdit: () => void;
  onSongsImported: (updatedScale: Scale) => void;
}

// Parseia o texto da IA e extrai músicas
function parseAiText(text: string): Partial<Song>[] {
  const songs: Partial<Song>[] = [];
  
  // Divide por blocos numerados (1., 2., 🎶 1., etc.)
  const blocks = text.split(/(?=(?:🎶\s*)?\d+[\.\)]\s)/g).filter(b => b.trim());

  for (const block of blocks) {
    const titleMatch = block.match(/(?:\*\*)?(?:Título[:\s]+)?([^\n*]+?)(?:\*\*)?(?:\s*\n|$)/i)
      || block.match(/(?:🎶\s*)?\d+[\.\)]\s+(?:\*\*)?(.+?)(?:\*\*)?(?:\n|$)/);
    const artistMatch = block.match(/(?:Artista|Ministério)[^:]*?:\s*(.+?)(?:\n|$)/i);
    const youtubeMatch = block.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s\)]+/i);

    if (titleMatch || artistMatch) {
      songs.push({
        title: titleMatch?.[1]?.replace(/\*\*/g, '').trim() || 'Título desconhecido',
        artist: artistMatch?.[1]?.trim() || 'Artista desconhecido',
        youtubeUrl: youtubeMatch?.[0] || undefined,
      });
    }
  }

  return songs.filter(s => s.title && s.title !== 'Título desconhecido');
}

export function ScaleDetailModal({ scale, members, onClose, onEdit, onSongsImported }: ScaleDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'import'>('info');
  const [importText, setImportText] = useState('');
  const [parsedSongs, setParsedSongs] = useState<Partial<Song>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const dateObj = React.useMemo(() => {
    try { return scale.date ? parseISO(scale.date) : new Date(); } catch { return new Date(); }
  }, [scale.date]);

  const scaleMembers = scale.memberIds
    .map(id => members.find(m => m.id === id))
    .filter(Boolean) as Member[];

  const handleParse = () => {
    setIsParsing(true);
    setTimeout(() => {
      const found = parseAiText(importText);
      setParsedSongs(found);
      setIsParsing(false);
    }, 400);
  };

  const handleSaveImported = async () => {
    if (parsedSongs.length === 0) return;
    setIsSaving(true);
    try {
      // Salva cada música nova no banco e coleta os IDs
      const savedSongs: Song[] = [];
      for (const s of parsedSongs) {
        const saved = await api.addSong({
          title: s.title!,
          artist: s.artist!,
          youtubeUrl: s.youtubeUrl,
          themeId: undefined
        });
        savedSongs.push(saved);
      }

      // Combina com as músicas existentes na escala
      const allSongs = [...scale.songs, ...savedSongs];
      const updatedScale = await api.updateScale(scale.id, {
        ...scale,
        songs: allSongs
      });

      onSongsImported({ ...scale, songs: allSongs });
      setImportText('');
      setParsedSongs([]);
      setActiveTab('info');
    } catch (err: any) {
      alert(`Erro ao importar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyScaleSummary = () => {
    const text = `📅 ${format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
🎵 Tema: ${scale.theme}

👥 Ministério:
${scaleMembers.map(m => `• ${m.name} — ${m.role}`).join('\n')}

🎶 Repertório:
${scale.songs.map((s, i) => `${i + 1}. ${s.title} — ${s.artist}${s.youtubeUrl ? '\n   ' + s.youtubeUrl : ''}`).join('\n')}

${scale.notes ? `📝 Notas: ${scale.notes}` : ''}`.trim();

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-forest-900/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-parchment-200 w-full md:max-w-2xl h-[90dvh] md:max-h-[85vh] flex flex-col rounded-t-2xl md:rounded-none shadow-2xl border border-forest-900/10"
      >
        {/* Header */}
        <div className="bg-forest-900 text-parchment-200 p-4 md:p-6 flex items-start justify-between rounded-t-2xl md:rounded-none">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3" />
              {format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif">{scale.theme}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyScaleSummary}
              className={`p-2 transition-colors rounded ${copyFeedback ? 'text-amber-400' : 'text-parchment-400 hover:text-parchment-200'}`}
              title="Copiar resumo"
            >
              {copyFeedback ? <CheckCircle2 className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
            </button>
            <button onClick={onEdit} className="px-3 py-1 bg-amber-500 text-forest-900 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors">
              Editar
            </button>
            <button onClick={onClose} className="p-2 text-parchment-400 hover:text-parchment-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-forest-900/10 bg-white">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${
              activeTab === 'info' ? 'border-b-2 border-amber-500 text-forest-900' : 'text-forest-500'
            }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'import' ? 'border-b-2 border-amber-500 text-forest-900' : 'text-forest-500'
            }`}
          >
            <Plus className="w-3 h-3" /> Importar do Copiloto
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {activeTab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-6 space-y-6">

                {/* Members */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-forest-500 font-bold mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" /> Ministério ({scaleMembers.length})
                  </h3>
                  {scaleMembers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scaleMembers.map(m => (
                        <div key={m.id} className="flex justify-between items-center bg-white border border-forest-900/10 px-4 py-2">
                          <span className="font-medium text-forest-900">{m.name}</span>
                          <span className="text-xs uppercase text-forest-500 font-semibold">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-forest-400 text-sm italic">Nenhum membro definido</p>
                  )}
                </div>

                {/* Songs */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-forest-500 font-bold mb-3 flex items-center gap-2">
                    <Music className="w-3 h-3" /> Repertório ({scale.songs.length})
                  </h3>
                  {scale.songs.length > 0 ? (
                    <div className="space-y-2">
                      {scale.songs.map((song, idx) => (
                        <div key={song.id} className="bg-white border border-forest-900/10 px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-amber-500 font-bold text-sm shrink-0">{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="font-serif font-bold text-forest-900 truncate">{song.title}</p>
                              <p className="text-xs text-forest-500 truncate">{song.artist}</p>
                            </div>
                          </div>
                          {song.youtubeUrl && (
                            <a
                              href={song.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 flex items-center gap-1 bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                            >
                              <Youtube className="w-3 h-3" />
                              YT
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-forest-400 text-sm italic">Nenhuma música definida</p>
                  )}
                </div>

                {/* Notes */}
                {scale.notes && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-forest-500 font-bold mb-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Notas
                    </h3>
                    <p className="text-forest-700 text-sm bg-white border border-forest-900/10 p-4">{scale.notes}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'import' && (
              <motion.div key="import" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-6 space-y-4">
                <p className="text-sm text-forest-600 bg-amber-500/10 border border-amber-500/20 p-3 rounded">
                  Cole abaixo o texto gerado pelo Copiloto IA. O sistema vai extrair automaticamente o título, artista e link do YouTube de cada música.
                </p>

                <textarea
                  value={importText}
                  onChange={e => { setImportText(e.target.value); setParsedSongs([]); }}
                  placeholder="Cole aqui o texto da IA com as músicas sugeridas..."
                  rows={8}
                  className="w-full border border-forest-900/20 bg-white p-3 text-sm text-forest-900 outline-none focus:border-forest-900 resize-none font-mono"
                />

                <button
                  onClick={handleParse}
                  disabled={!importText.trim() || isParsing}
                  className="w-full py-3 bg-forest-900 text-parchment-200 text-xs font-bold uppercase tracking-widest hover:bg-forest-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Analisar Texto
                </button>

                {parsedSongs.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-forest-500">{parsedSongs.length} música(s) encontrada(s):</p>
                    {parsedSongs.map((s, i) => (
                      <div key={i} className="bg-white border border-forest-900/10 px-4 py-3">
                        <p className="font-bold text-forest-900">{s.title}</p>
                        <p className="text-xs text-forest-500">{s.artist}</p>
                        {s.youtubeUrl && (
                          <a href={s.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1">
                            <Youtube className="w-3 h-3" /> {s.youtubeUrl}
                          </a>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={handleSaveImported}
                      disabled={isSaving}
                      className="w-full py-3 bg-amber-500 text-forest-900 text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Salvar e Adicionar à Escala
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
