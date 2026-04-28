import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Music, Sparkles, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'scales' | 'members' | 'themes' | 'songs' | 'ai-search') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: 'scales', label: 'Escalas', icon: Calendar },
    { id: 'members', label: 'Membros', icon: Users },
    { id: 'themes', label: 'Temas', icon: BookOpen },
    { id: 'songs', label: 'Músicas', icon: Music },
    { id: 'ai-search', label: 'Copiloto IA', icon: Sparkles },
  ] as const;

  return (
    <aside className="w-64 bg-forest-900 text-parchment-200 min-h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-forest-700/50">
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
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-amber-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-forest-900' : 'text-parchment-400 group-hover:text-amber-500'}`} />
              <span className="relative z-10">{tab.label}</span>
              
              {/* Hover highlight line for non-active items */}
              {!isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0 bg-amber-500/20 transition-all group-hover:w-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-forest-700/50">
        <div className="text-xs text-forest-500 font-mono">
          V2.0 • Divine Minimalist
        </div>
      </div>
    </aside>
  );
}
