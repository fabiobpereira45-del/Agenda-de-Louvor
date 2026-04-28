import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Music, Sparkles, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'scales' | 'members' | 'themes' | 'songs' | 'ai-search') => void;
}

const tabs = [
  { id: 'scales', label: 'Escalas', icon: Calendar },
  { id: 'members', label: 'Membros', icon: Users },
  { id: 'themes', label: 'Temas', icon: BookOpen },
  { id: 'songs', label: 'Músicas', icon: Music },
  { id: 'ai-search', label: 'IA', icon: Sparkles },
] as const;

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <>
      {/* ── Desktop: Sidebar lateral fixa ── */}
      <aside className="hidden md:flex w-64 bg-forest-900 text-parchment-200 min-h-screen flex-col fixed left-0 top-0 z-50 border-r border-forest-700/50">
        <div className="p-8 border-b border-forest-700/50">
          <h1 className="text-2xl font-serif tracking-tight text-amber-500 mb-1">Louvor.</h1>
          <p className="text-xs text-parchment-400 tracking-widest uppercase font-semibold">Ministério Local</p>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all group overflow-hidden ${
                  isActive ? 'text-forest-900' : 'text-parchment-300 hover:text-amber-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-amber-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-forest-900' : 'text-parchment-400 group-hover:text-amber-500'}`} />
                <span className="relative z-10">{tab.label}</span>
                {!isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0 bg-amber-500/20 transition-all group-hover:w-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-forest-700/50">
          <div className="text-xs text-forest-500 font-mono">V2.0 • Divine Minimalist</div>
        </div>
      </aside>

      {/* ── Mobile: Top Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-forest-900 text-parchment-200 flex items-center px-4 py-3 border-b border-forest-700/50">
        <h1 className="text-xl font-serif text-amber-500">Louvor.</h1>
        <span className="ml-2 text-[10px] text-parchment-400 uppercase tracking-widest self-end mb-0.5">
          {tabs.find(t => t.id === activeTab)?.label}
        </span>
      </header>

      {/* ── Mobile: Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-forest-900 border-t border-forest-700/50 flex items-stretch safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 relative transition-colors ${
                isActive ? 'text-amber-400' : 'text-parchment-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-amber-400"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
