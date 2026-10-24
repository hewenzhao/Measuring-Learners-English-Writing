import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

export interface SingleHandlers {
  exportExcel: () => void;
  exportCsv: () => void;
  clear: () => void;
  uploadFile: () => void;
  hasDocument: boolean;
  fileName: string;
}

export interface BatchHandlers {
  exportExcel: () => void;
  exportSummaryCsv: () => void;
  exportIndicatorsCsv: () => void;
  exportWordlistCsv: () => void;
  clear: () => void;
  uploadFiles: () => void;
  itemsCount: number;
  analyzedCount: number;
}

interface AppContextType {
  activeTab: 'single' | 'batch';
  setActiveTab: (tab: 'single' | 'batch') => void;
  
  filterStopwords: boolean;
  setFilterStopwords: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFilterStopwords: () => void;

  singleHandlers: SingleHandlers;
  registerSingleHandlers: (handlers: SingleHandlers) => void;

  batchHandlers: BatchHandlers;
  registerBatchHandlers: (handlers: BatchHandlers) => void;

  // File menu actions
  handleMenuUploadSingle: () => void;
  handleMenuUploadBatch: () => void;
  handleMenuExportExcel: () => void;
  handleMenuExportCsv: (batchVariant?: 'summary' | 'indicators' | 'wordlist') => void;
  handleMenuClearActive: () => void;
  handleMenuClearAll: () => void;

  // Notification toast
  notification: string | null;
  showNotification: (msg: string) => void;
}

const defaultSingleHandlers: SingleHandlers = {
  exportExcel: () => {},
  exportCsv: () => {},
  clear: () => {},
  uploadFile: () => {},
  hasDocument: false,
  fileName: ''
};

const defaultBatchHandlers: BatchHandlers = {
  exportExcel: () => {},
  exportSummaryCsv: () => {},
  exportIndicatorsCsv: () => {},
  exportWordlistCsv: () => {},
  clear: () => {},
  uploadFiles: () => {},
  itemsCount: 0,
  analyzedCount: 0
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [filterStopwords, setFilterStopwords] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const [singleHandlers, setSingleHandlers] = useState<SingleHandlers>(defaultSingleHandlers);
  const [batchHandlers, setBatchHandlers] = useState<BatchHandlers>(defaultBatchHandlers);

  const showNotification = useCallback((msg: string) => {
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(msg);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const toggleFilterStopwords = useCallback(() => {
    setFilterStopwords(prev => {
      const next = !prev;
      showNotification(next ? 'Stopwords filter enabled' : 'Stopwords filter disabled');
      return next;
    });
  }, [showNotification]);

  const registerSingleHandlers = useCallback((handlers: SingleHandlers) => {
    setSingleHandlers(handlers);
  }, []);

  const registerBatchHandlers = useCallback((handlers: BatchHandlers) => {
    setBatchHandlers(handlers);
  }, []);

  const handleMenuUploadSingle = useCallback(() => {
    setActiveTab('single');
    // Short delay to ensure tab DOM is visible if switching
    setTimeout(() => {
      singleHandlers.uploadFile();
    }, 50);
  }, [singleHandlers]);

  const handleMenuUploadBatch = useCallback(() => {
    setActiveTab('batch');
    setTimeout(() => {
      batchHandlers.uploadFiles();
    }, 50);
  }, [batchHandlers]);

  const handleMenuExportExcel = useCallback(() => {
    if (activeTab === 'single') {
      if (!singleHandlers.hasDocument) {
        showNotification('Please load or analyze a single document first.');
        return;
      }
      singleHandlers.exportExcel();
      showNotification('Exporting Single Document Excel report...');
    } else {
      if (batchHandlers.itemsCount === 0) {
        showNotification('Please import batch corpus files first.');
        return;
      }
      batchHandlers.exportExcel();
      showNotification('Exporting Batch Corpus Excel report...');
    }
  }, [activeTab, singleHandlers, batchHandlers, showNotification]);

  const handleMenuExportCsv = useCallback((batchVariant?: 'summary' | 'indicators' | 'wordlist') => {
    if (activeTab === 'single') {
      if (!singleHandlers.hasDocument) {
        showNotification('Please load or analyze a single document first.');
        return;
      }
      singleHandlers.exportCsv();
      showNotification('Exporting Single Indicators CSV...');
    } else {
      if (batchHandlers.itemsCount === 0 || batchHandlers.analyzedCount === 0) {
        showNotification('Please analyze batch documents before exporting CSV.');
        return;
      }
      if (batchVariant === 'summary') {
        batchHandlers.exportSummaryCsv();
        showNotification('Exporting Corpus Summary Statistics CSV...');
      } else if (batchVariant === 'wordlist') {
        batchHandlers.exportWordlistCsv();
        showNotification('Exporting Corpus Target Wordlist CSV...');
      } else {
        batchHandlers.exportIndicatorsCsv();
        showNotification('Exporting Corpus Indicators & Statistics CSV...');
      }
    }
  }, [activeTab, singleHandlers, batchHandlers, showNotification]);

  const handleMenuClearActive = useCallback(() => {
    if (activeTab === 'single') {
      if (!singleHandlers.hasDocument) return;
      singleHandlers.clear();
      showNotification('Single document cleared.');
    } else {
      if (batchHandlers.itemsCount === 0) return;
      batchHandlers.clear();
      showNotification('Batch corpus cleared.');
    }
  }, [activeTab, singleHandlers, batchHandlers, showNotification]);

  const handleMenuClearAll = useCallback(() => {
    singleHandlers.clear();
    batchHandlers.clear();
    showNotification('All single and batch documents have been cleared.');
  }, [singleHandlers, batchHandlers, showNotification]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        filterStopwords,
        setFilterStopwords,
        toggleFilterStopwords,
        singleHandlers,
        registerSingleHandlers,
        batchHandlers,
        registerBatchHandlers,
        handleMenuUploadSingle,
        handleMenuUploadBatch,
        handleMenuExportExcel,
        handleMenuExportCsv,
        handleMenuClearActive,
        handleMenuClearAll,
        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
