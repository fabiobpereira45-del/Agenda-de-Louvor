import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppContext';
import { Sparkles, Copy, CheckCircle2, Search, ExternalLink } from 'lucide-react';

const EXTERNAL_AIS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', color: 'bg-forest-900', text: 'text-parchment-200' },
  { name: 'Claude', url: 'https://claude.ai', color: 'bg-[#D4A373]', text: 'text-forest-900' },
  { name: 'Gemini', url: 'https://gemini.google.com', color: 'bg-white', text: 'text-forest-900' },
];

export function AiCopilotPage() {
  const { themes } = useAppStore();
  const [aiPrompt, setAiPrompt] = useState('');
  const [searchType, setSearchType] = useState('badaladas');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const generatedPrompt = useMemo(() => {
    return `Como um especialista em música cristã e liturgia, sugira 5 músicas evangélicas para um culto com o tema "${aiPrompt || 'Geral'}".
As músicas devem focar no estilo "${searchType}".
Considere a participação da congregação.
Para cada música, informe: Título, Artista, justificativa litúrgica e link do YouTube.`;
  }, [aiPrompt, searchType]);

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-forest-900/10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-forest-900 mb-2 flex items-center gap-4">
            Copiloto de Adoração
            <Sparkles className="w-8 h-8 text-amber-500" />
          </h1>
          <p className="text-forest-700 tracking-wide text-sm uppercase font-semibold">Inspiração Assistida por IA</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Configuration */}
        <div className="space-y-8">
          <div className="bg-white border border-forest-900/10 p-8">
            <h3 className="font-serif text-2xl mb-8 text-forest-900 flex items-center gap-3">
              <Search className="w-5 h-5 text-amber-500" />
              Parâmetros da Busca
            </h3>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Direção Litúrgica (Estilo)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['badaladas', 'retro', 'tendências', 'contemplativo'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setSearchType(type)}
                      className={`px-4 py-3 text-xs uppercase tracking-wider font-bold transition-all border ${
                        searchType === type 
                          ? 'bg-forest-900 text-parchment-200 border-forest-900' 
                          : 'bg-transparent text-forest-700 border-forest-900/20 hover:border-forest-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-forest-500 font-semibold">Tema Central</label>
                <select 
                  className="w-full bg-transparent border-b border-forest-700/30 py-3 focus:border-forest-900 outline-none transition-colors rounded-none text-forest-900 font-serif text-lg"
                  onChange={(e) => setAiPrompt(e.target.value)}
                  value={aiPrompt}
                >
                  <option value="">Selecione o tema...</option>
                  {themes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-8">
            <h3 className="font-serif text-xl mb-6 text-forest-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-amber-600" />
              Consultar Oráculos (IAs)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {EXTERNAL_AIS.map(ai => (
                <a 
                  key={ai.name}
                  href={ai.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between p-5 border border-forest-900/10 font-bold uppercase tracking-wider text-sm hover:scale-[1.01] transition-transform ${ai.color} ${ai.text}`}
                >
                  {ai.name}
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Preview */}
        <div className="bg-forest-900 text-parchment-200 p-8 flex flex-col relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-1">
            <h3 className="font-serif text-2xl mb-2 text-amber-400">Prompt Otimizado</h3>
            <p className="text-forest-400 text-sm mb-8">Copie a instrução abaixo e cole na sua IA de preferência para obter os melhores resultados.</p>
            
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="pl-6 font-serif text-xl leading-relaxed text-parchment-100 whitespace-pre-wrap">
                {generatedPrompt}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <button 
              onClick={copyPromptToClipboard}
              className={`w-full py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${
                copyFeedback 
                  ? 'bg-amber-500 text-forest-900' 
                  : 'bg-parchment-200 text-forest-900 hover:bg-white'
              }`}
            >
              {copyFeedback ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Manifesto Copiado
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Instrução
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
