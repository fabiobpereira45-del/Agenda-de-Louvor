import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/AppContext';
import { ScaleCard } from '../components/scales/ScaleCard';
import { ScaleWizard } from '../components/scales/ScaleWizard';
import { ScaleDetailModal } from '../components/scales/ScaleDetailModal';
import { Plus, Search, Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import { Scale } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../lib/api';
import { AnimatePresence } from 'motion/react';

export function ScalesPage() {
  const { scales, setScales, members, isLoading } = useAppStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingScale, setEditingScale] = useState<Scale | null>(null);
  const [viewingScale, setViewingScale] = useState<Scale | null>(null);
  
  const [filterQuery, setFilterQuery] = useState('');
  // Inicia com o mês atual no formato yyyy-MM (ex: "2026-04")
  const [filterMonth, setFilterMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [isExporting, setIsExporting] = useState(false);

  const filteredScales = useMemo(() => {
    if (!Array.isArray(scales)) return [];
    
    return scales.filter(scale => {
      try {
        if (!scale.date) return false;
        const date = parseISO(scale.date);
        const monthMatch = filterMonth ? format(date, 'yyyy-MM') === filterMonth : true;
        const queryMatch = filterQuery ? (
          (scale.theme || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
          (scale.songs || []).some(s => s.title.toLowerCase().includes(filterQuery.toLowerCase()))
        ) : true;
        return monthMatch && queryMatch;
      } catch (e) {
        console.error("Erro ao processar data da escala:", e);
        return false;
      }
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [scales, filterMonth, filterQuery]);

  const downloadPDF = async (scaleId: string) => {
    const element = document.getElementById(`scale-report-${scaleId}`);
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F9F7F2',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`escala-louvor-${scaleId}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadMonthlyReport = async () => {
    if (filteredScales.length === 0) return;
    
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth  = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm
      const slotHeight = pdfHeight / 2;   // cada escala ocupa metade da folha
      const margin = 4;                   // margem interna em mm

      for (let i = 0; i < filteredScales.length; i++) {
        const scale = filteredScales[i];
        const element = document.getElementById(`scale-report-${scale.id}`);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#F9F7F2',
        });
        const imgData = canvas.toDataURL('image/png');

        // Calcula dimensões para caber em metade da página com margem
        const maxW = pdfWidth - margin * 2;
        const maxH = slotHeight - margin * 2;
        const ratio = Math.min(maxW / (canvas.width / 3.7795), maxH / (canvas.height / 3.7795));
        const imgW = (canvas.width / 3.7795) * ratio;
        const imgH = (canvas.height / 3.7795) * ratio;
        const xOffset = (pdfWidth - imgW) / 2;

        const isFirstOnPage = i % 2 === 0;

        // Nova página a cada 2 escalas (exceto na primeira)
        if (i > 0 && isFirstOnPage) {
          pdf.addPage();
        }

        // Posição Y: topo da folha ou metade
        const yOffset = isFirstOnPage
          ? margin
          : slotHeight + margin;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgW, imgH);

        // Linha divisória entre as duas escalas na mesma folha
        if (!isFirstOnPage) {
          pdf.setDrawColor(200, 190, 175);
          pdf.setLineWidth(0.3);
          pdf.line(margin, slotHeight, pdfWidth - margin, slotHeight);
        }
      }

      const monthTitle = filterMonth
        ? format(parseISO(`${filterMonth}-01`), 'MMMM-yyyy', { locale: ptBR })
        : 'Geral';
      pdf.save(`relatorio-mensal-${monthTitle}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar relatório mensal:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="border-b border-forest-900/10 pb-4 md:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif text-forest-900 mb-1">Escalas</h1>
          <p className="text-forest-700 tracking-wide text-xs uppercase font-semibold">Organização do Ministério</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-amber-500 text-forest-900 px-5 py-3 font-bold uppercase tracking-widest text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,31,28,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,31,28,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Nova Escala
        </button>
      </header>

      {/* Filters Area - Sharp Minimalist Design */}
      <div className="bg-white border border-forest-900/10 p-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[250px] space-y-2">
          <label className="text-[10px] uppercase font-bold text-forest-500 tracking-wider">Buscar por tema ou música</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <input 
              type="text" 
              placeholder="Ex: Culto da Família..."
              className="w-full pl-10 pr-4 py-3 bg-parchment-200 border-none focus:ring-1 focus:ring-amber-500 outline-none text-forest-900 text-sm"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-auto space-y-2">
          <label className="text-[10px] uppercase font-bold text-forest-500 tracking-wider">Filtrar por Mês</label>
          <input 
            type="month" 
            className="w-full py-3 px-4 bg-parchment-200 border-none outline-none text-forest-900 text-sm"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>

        {filteredScales.length > 0 && (
          <button 
            onClick={downloadMonthlyReport}
            disabled={isExporting}
            className="w-full md:w-auto bg-forest-900 text-parchment-200 px-6 py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-forest-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Gerando PDF...' : `Relatório Mensal (${filteredScales.length})`}
          </button>
        )}
      </div>

      {/* Scales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
        {isLoading ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-forest-900/40">
             <Loader2 className="w-12 h-12 animate-spin mb-4" />
             <p className="font-serif text-xl">Consultando os céus...</p>
          </div>
        ) : filteredScales.map(scale => (
          <ScaleCard 
            key={scale.id} 
            scale={scale} 
            members={members}
            onView={() => setViewingScale(scale)}
            onEdit={() => setEditingScale(scale)}
            onDelete={async (id) => {
              if (!confirm('Deseja excluir esta escala?')) return;
              try {
                await api.deleteScale(id);
                setScales(scales.filter(s => s.id !== id));
              } catch (error) {
                console.error('Erro ao excluir escala:', error);
                alert('Erro ao excluir do banco de dados.');
              }
            }}
            onDownload={() => downloadPDF(scale.id)}
          />
        ))}
        {!isLoading && filteredScales.length === 0 && (
          <div className="col-span-full py-24 bg-white border border-dashed border-forest-900/20 flex flex-col items-center justify-center text-forest-900/40">
            <CalendarIcon className="w-16 h-16 mb-4 stroke-1" />
            <p className="font-serif text-xl">Nenhuma escala programada.</p>
            <p className="text-sm tracking-wide">Inicie um novo ciclo de louvor.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <ScaleWizard 
            onClose={() => setIsCreating(false)} 
            onSave={(newScale) => {
              setScales([...scales, { ...newScale, id: crypto.randomUUID() }]);
              setIsCreating(false);
            }}
          />
        )}
        {editingScale && (
          <ScaleWizard 
            initialData={editingScale}
            onClose={() => setEditingScale(null)} 
            onSave={(updatedScale) => {
              setScales(scales.map(s => s.id === updatedScale.id ? updatedScale : s));
              setEditingScale(null);
            }}
          />
        )}
        {viewingScale && (
          <ScaleDetailModal
            scale={viewingScale}
            members={members}
            onClose={() => setViewingScale(null)}
            onEdit={() => { setEditingScale(viewingScale); setViewingScale(null); }}
            onSongsImported={(updated) => {
              setScales(scales.map(s => s.id === updated.id ? updated : s));
              setViewingScale(updated);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
