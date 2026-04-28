import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { AnimatePresence, motion } from 'motion/react';

// Placeholders for Pages (We will create these next)
import { ScalesPage } from './pages/ScalesPage';
import { MembersPage } from './pages/MembersPage';
import { ThemesPage } from './pages/ThemesPage';
import { SongsPage } from './pages/SongsPage';
import { AiCopilotPage } from './pages/AiCopilotPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'scales' | 'members' | 'themes' | 'songs' | 'ai-search'>('scales');

  return (
    <div className="min-h-screen bg-parchment-200 text-forest-900 font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content: offset by sidebar on desktop, full-width on mobile */}
      <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0 pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-4 md:p-12 max-w-7xl mx-auto"
          >
            {activeTab === 'scales' && <ScalesPage />}
            {activeTab === 'members' && <MembersPage />}
            {activeTab === 'themes' && <ThemesPage />}
            {activeTab === 'songs' && <SongsPage />}
            {activeTab === 'ai-search' && <AiCopilotPage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
