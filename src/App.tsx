import { useState } from 'react';
import { FileText, Layers, Monitor, CheckCircle2 } from 'lucide-react';
import { SingleAnalyzer } from './components/SingleAnalyzer';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { WordlistProvider } from './lib/wordlistContext';
import { AppProvider, useApp } from './lib/appContext';
import { MenuBar } from './components/MenuBar';
import { WordlistModal } from './components/WordlistModal';
import { DesktopExeModal } from './components/DesktopExeModal';
import { BRAND_BACKGROUND_URL, BRAND_LOGO_URL } from './assets/brand';

function MainApp() {
  const { activeTab, setActiveTab, notification } = useApp();
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-gray-900 selection:bg-blue-100">
      {/* Background Image Layer: uses bundled relative asset so it works in browser and desktop Electron EXE */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-300"
        style={{
          backgroundImage: `url(${BRAND_BACKGROUND_URL})`,
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Soft translucent overlay ensuring high readability, contrast, and modern glassmorphic feel */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50/85 backdrop-blur-[0.5px]" />

      {/* Header */}
      <header className="relative z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between min-h-16 py-2.5 sm:py-0 flex-wrap sm:flex-nowrap gap-3 items-center">
            
            {/* Left: Branding & Version / Date */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img 
                  src={BRAND_LOGO_URL} 
                  alt="Measuring Learners English Writing Logo" 
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-contain shadow-sm border border-blue-200 ring-2 ring-blue-500/15 bg-white p-0.5"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.src.includes('logo.png')) {
                      img.src = './logo.png';
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-bold tracking-tight text-gray-900 leading-tight">
                    Measuring Learners English Writing
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                    v2.0
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Otc, 2026
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5">
                  Designed by Oscar Wenzhao He
                </p>
              </div>
            </div>
            
            {/* Center/Right: Dropdowns (File, References), Tab Navigation, Windows EXE */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              
              {/* File & References Dropdown Menus */}
              <MenuBar />

              <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

              {/* View Switcher: Single Document vs. Batch Corpus */}
              <nav className="flex space-x-1 border border-gray-200 bg-gray-100/90 p-1 rounded-lg backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                  title="Switch to Single Document Analysis"
                >
                  <FileText className="h-4 w-4" />
                  <span>Single Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('batch')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                    activeTab === 'batch'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                  title="Switch to Batch Corpus Analysis"
                >
                  <Layers className="h-4 w-4" />
                  <span>Batch Corpus Analysis</span>
                </button>
              </nav>

              {/* Windows EXE Desktop Dialog Trigger */}
              <button
                type="button"
                onClick={() => setIsExeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-blue-700 bg-blue-50/90 hover:bg-blue-100 hover:text-blue-900 border border-blue-200 shadow-2xs cursor-pointer"
                title="编译与打包 Windows EXE 桌面版"
              >
                <Monitor className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Windows EXE</span>
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className={activeTab === 'single' ? 'block h-full' : 'hidden'}>
          <SingleAnalyzer />
        </div>
        <div className={activeTab === 'batch' ? 'block h-full' : 'hidden'}>
          <BatchAnalyzer />
        </div>
      </main>

      {/* Footer with Version and Date */}
      <footer className="relative z-10 mt-auto py-5 border-t border-gray-200/80 bg-white/80 backdrop-blur-xs text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <img 
              src={BRAND_LOGO_URL} 
              alt="Logo" 
              className="h-6 w-6 rounded-full object-contain border border-blue-200 shadow-2xs bg-white" 
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.includes('logo.png')) {
                  img.src = './logo.png';
                }
              }}
            />
            <span className="font-semibold text-gray-800">Measuring Learners English Writing</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">
              v2.0
            </span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-gray-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
              Date: Otc, 2026
            </span>
          </div>
          <div className="text-center sm:text-right text-gray-500">
            Designed by <span className="font-semibold text-gray-700">Oscar Wenzhao He</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <WordlistModal />
      <DesktopExeModal isOpen={isExeModalOpen} onClose={() => setIsExeModalOpen(false)} />

      {/* Action Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900/95 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WordlistProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </WordlistProvider>
  );
}
