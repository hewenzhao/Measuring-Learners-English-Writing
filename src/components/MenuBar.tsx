import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  ChevronDown, 
  Upload, 
  FileText, 
  Layers, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  RotateCcw,
  BookmarkCheck, 
  Filter, 
  BookOpen, 
  Info, 
  Check, 
  ExternalLink,
  TableProperties
} from 'lucide-react';
import { useApp } from '../lib/appContext';
import { useWordlist } from '../lib/wordlistContext';

export function MenuBar() {
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);
  
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const referencesMenuRef = useRef<HTMLDivElement>(null);

  const { 
    activeTab, 
    filterStopwords, 
    toggleFilterStopwords,
    singleHandlers,
    batchHandlers,
    handleMenuUploadSingle,
    handleMenuUploadBatch,
    handleMenuExportExcel,
    handleMenuExportCsv,
    handleMenuClearActive,
    handleMenuClearAll
  } = useApp();

  const { wordlist, setIsModalOpen } = useWordlist();

  // Close menus on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileOpen(false);
      }
      if (referencesMenuRef.current && !referencesMenuRef.current.contains(e.target as Node)) {
        setIsReferencesOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsFileOpen(false);
        setIsReferencesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 font-sans">
      
      {/* 1. FILE DROPDOWN MENU */}
      <div className="relative" ref={fileMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsFileOpen(!isFileOpen);
            setIsReferencesOpen(false);
          }}
          aria-haspopup="true"
          aria-expanded={isFileOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            isFileOpen 
              ? 'bg-blue-50 text-blue-800 border border-blue-300 shadow-xs' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
          }`}
          title="File menu: Upload files, Export reports, and Clear data"
        >
          <Folder className="h-4 w-4 text-blue-600" />
          <span>File</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${isFileOpen ? 'rotate-180' : ''}`} />
        </button>

        {isFileOpen && (
          <div 
            className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            role="menu"
            aria-orientation="vertical"
          >
            {/* Section 1: Upload Files (Single/Batch) */}
            <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Upload Files (Single / Batch)</span>
              <Upload className="h-3 w-3 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuUploadSingle();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-blue-50 group-hover:bg-blue-100 text-blue-600 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-blue-900 flex items-center justify-between">
                  <span>Upload Single Document</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded font-normal">.docx / .txt</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Analyze individual learner essay or text
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuUploadBatch();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 mt-0.5">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-indigo-900 flex items-center justify-between">
                  <span>Upload Batch Files</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded font-normal">Corpus</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Import multiple writing samples for comparative corpus statistics
                </p>
              </div>
            </button>

            <div className="border-t border-gray-100 my-1.5" />

            {/* Section 2: Export (CSV/Excel) */}
            <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Export (CSV / Excel)</span>
              <Download className="h-3 w-3 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuExportExcel();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 mt-0.5">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Export to Excel (.xlsx)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">Multi-sheet</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {activeTab === 'single' 
                    ? (singleHandlers.hasDocument ? 'Export single document report with 4 detailed sheets' : 'Export current single analysis (no document loaded)')
                    : (batchHandlers.itemsCount > 0 ? `Export batch corpus workbook (${batchHandlers.itemsCount} files)` : 'Export batch corpus analysis (no files loaded)')
                  }
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuExportCsv();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-blue-50 group-hover:bg-blue-100 text-blue-600 mt-0.5">
                <TableProperties className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-blue-900 flex items-center justify-between">
                  <span>Export to CSV (.csv)</span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-medium">Indicators</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {activeTab === 'single'
                    ? 'Export indicator measurements and descriptive statistics'
                    : 'Export all corpus documents and aggregated statistics'
                  }
                </p>
              </div>
            </button>

            {/* Additional CSV options for batch mode */}
            {activeTab === 'batch' && batchHandlers.analyzedCount > 0 && (
              <div className="pl-9 pr-3.5 pb-1 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFileOpen(false);
                    handleMenuExportCsv('summary');
                  }}
                  className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  title="Export only Mean, SD, Min, Max descriptive statistics"
                >
                  Stats Summary CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFileOpen(false);
                    handleMenuExportCsv('wordlist');
                  }}
                  className="text-[11px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                  title="Export target wordlist occurrences per file"
                >
                  Wordlist CSV
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 my-1.5" />

            {/* Section 3: Clear All */}
            <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Clear Data</span>
              <Trash2 className="h-3 w-3 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuClearActive();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-red-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-red-50 group-hover:bg-red-100 text-red-600 mt-0.5">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-red-700">
                  {activeTab === 'single' ? 'Clear Single Document' : 'Clear Batch Corpus'}
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {activeTab === 'single' 
                    ? (singleHandlers.hasDocument ? `Clear loaded "${singleHandlers.fileName || 'document'}"` : 'Reset single analyzer')
                    : (batchHandlers.itemsCount > 0 ? `Remove all ${batchHandlers.itemsCount} imported files` : 'Reset batch queue')
                  }
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFileOpen(false);
                handleMenuClearAll();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-red-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-gray-100 group-hover:bg-red-100 text-gray-600 group-hover:text-red-600 mt-0.5">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-red-700">
                  Clear All (Single & Batch)
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Reset both single document and batch corpus state
                </p>
              </div>
            </button>

          </div>
        )}
      </div>

      {/* 2. REFERENCES DROPDOWN MENU */}
      <div className="relative" ref={referencesMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsReferencesOpen(!isReferencesOpen);
            setIsFileOpen(false);
          }}
          aria-haspopup="true"
          aria-expanded={isReferencesOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            isReferencesOpen 
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
          }`}
          title="References menu: Target Wordlist, Stopwords filtering, and User Guide"
        >
          <BookOpen className="h-4 w-4 text-amber-600" />
          <span>References</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${isReferencesOpen ? 'rotate-180' : ''}`} />
        </button>

        {isReferencesOpen && (
          <div 
            className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Linguistic References & Settings</span>
              <BookOpen className="h-3 w-3 text-gray-400" />
            </div>

            {/* Item 1: Target Wordlist */}
            <button
              type="button"
              onClick={() => {
                setIsReferencesOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-amber-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="p-1 rounded bg-amber-50 group-hover:bg-amber-100 text-amber-600 mt-0.5">
                <BookmarkCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-amber-900 flex items-center justify-between">
                  <span>Target Wordlist</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {wordlist.length} words
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Configure custom vocabulary list, inflections & in-text highlighting
                </p>
              </div>
            </button>

            {/* Item 2: Filter Stopwords */}
            <button
              type="button"
              onClick={() => {
                toggleFilterStopwords();
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-indigo-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className={`p-1 rounded mt-0.5 transition-colors ${
                filterStopwords 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600'
              }`}>
                <Filter className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-indigo-900 flex items-center justify-between">
                  <span>Filter Stopwords</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                    filterStopwords 
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {filterStopwords ? (
                      <>
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Off</span>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  {filterStopwords 
                    ? 'Function & grammar words excluded from frequencies' 
                    : 'All words included in frequency calculation'}
                </p>
              </div>
            </button>

            <div className="border-t border-gray-100 my-1.5" />

            {/* Item 3: User Guide */}
            <a
              href="/UserGuide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsReferencesOpen(false)}
              className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer block"
            >
              <div className="p-1 rounded bg-blue-50 group-hover:bg-blue-100 text-blue-600 mt-0.5">
                <Info className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 group-hover:text-blue-900 flex items-center justify-between">
                  <span>User Guide</span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                    <span>PDF</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  Methodology, linguistic indicator definitions & offline EXE guide
                </p>
              </div>
            </a>

            <div className="border-t border-gray-100 my-1" />
            <div className="px-3.5 py-1.5 bg-gray-50/70 rounded-b-xl flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-semibold text-gray-700">v2.0 • Otc, 2026</span>
              <span className="text-[10px] text-gray-400">Oscar Wenzhao He</span>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
