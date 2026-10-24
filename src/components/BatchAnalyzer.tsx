import { useState, useCallback, useMemo, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  BookmarkCheck,
  BarChart3,
  Layers,
  ChevronDown,
  Table as TableIcon,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { analyzeText, TextStats } from '../lib/analyzer';
import { useWordlist } from '../lib/wordlistContext';
import { useApp } from '../lib/appContext';
import { 
  computeCorpusStats, 
  generateStatisticsSummaryCsv, 
  generateCorpusIndicatorsCsv, 
  generateCorpusTargetWordlistCsv,
  downloadCsv 
} from '../lib/indicatorStatistics';
import { extractTextFromFile } from '../lib/fileReader';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { BRAND_LOGO_URL } from '../assets/brand';

interface BatchItem {
  id: string;
  filename: string;
  content: string;
  stats?: TextStats;
  status: 'pending' | 'analyzed' | 'error';
  errorMessage?: string;
}

export function BatchAnalyzer() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'statistics'>('documents');
  const [statCategoryFilter, setStatCategoryFilter] = useState<string>('all');
  
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const { wordlist, setIsModalOpen } = useWordlist();
  const { filterStopwords, toggleFilterStopwords, registerBatchHandlers } = useApp();

  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsReadingFiles(true);
    const newItems: BatchItem[] = [];

    for (const file of fileList) {
      try {
        const content = await extractTextFromFile(file);
        newItems.push({
          id: Math.random().toString(36).substring(7),
          filename: file.name,
          content,
          status: 'pending'
        });
      } catch (err) {
        console.error(`Failed to read file ${file.name}:`, err);
        newItems.push({
          id: Math.random().toString(36).substring(7),
          filename: file.name,
          content: '',
          status: 'error',
          errorMessage: 'Failed to extract text from file'
        });
      }
    }

    setItems(prev => [...prev, ...newItems]);
    setIsReadingFiles(false);
  }, []);

  const handleFileUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await processFiles(files);
    event.target.value = '';
  }, [processFiles]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const analyzeAll = async () => {
    setIsAnalyzing(true);
    
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      try {
        const stats = analyzeText(newItems[i].content, { filterStopwords, targetWordlist: wordlist });
        newItems[i] = { ...newItems[i], stats, status: 'analyzed' };
      } catch (error) {
        newItems[i] = { ...newItems[i], status: 'error', errorMessage: 'Failed to analyze' };
      }
    }
    
    setItems(newItems);
    setIsAnalyzing(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const analyzedCount = items.filter(i => i.status === 'analyzed').length;

  // Compute corpus-level statistics across all analyzed documents
  const corpusStats = useMemo(() => {
    return computeCorpusStats(items);
  }, [items]);

  // Export 1: Statistics Summary in CSV
  const handleExportStatsSummaryCsv = useCallback(() => {
    if (analyzedCount === 0) return;
    const csvContent = generateStatisticsSummaryCsv(items);
    downloadCsv(csvContent, 'Corpus_Indicator_Statistics_Summary.csv');
  }, [analyzedCount, items]);

  // Export 2: All Documents Indicators with Summary Statistics at the bottom
  const handleExportCorpusWithStatsCsv = useCallback(() => {
    if (analyzedCount === 0) return;
    const csvContent = generateCorpusIndicatorsCsv(items);
    downloadCsv(csvContent, 'Corpus_Indicators_And_Statistics.csv');
  }, [analyzedCount, items]);

  // Export 3: Target Wordlist Breakdown in CSV
  const handleExportWordlistCsv = useCallback(() => {
    if (analyzedCount === 0) return;
    const csvContent = generateCorpusTargetWordlistCsv(items);
    downloadCsv(csvContent, 'Corpus_Target_Wordlist_Breakdown.csv');
  }, [analyzedCount, items]);

  // Multi-sheet Excel export
  const exportToExcel = useCallback(() => {
    if (items.length === 0) return;

    // Sheet 1: Document Overview with Core Metrics and Wordlist Totals
    const overviewData = items.map(item => ({
      Filename: item.filename,
      Status: item.status,
      'Total Words': item.stats?.totalWords ?? 0,
      'Total Sentences': item.stats?.totalSentences ?? 0,
      'Avg Sentence Length': item.stats?.avgSentenceLength ?? 0,
      'Sentence Length SD': item.stats?.sentenceLengthStdDev ?? 0,
      'Short Sentences (<10w)': item.stats?.sentenceDistribution.short ?? 0,
      'Medium Sentences (10-25w)': item.stats?.sentenceDistribution.medium ?? 0,
      'Long Sentences (>25w)': item.stats?.sentenceDistribution.long ?? 0,
      'Clauses per Sentence': item.stats?.clausesPerSentence ?? 0,
      'Coordinate Clauses': item.stats?.coordinateClausesCount ?? 0,
      'Subordinate Clauses': item.stats?.subordinateClausesCount ?? 0,
      'Subordination Ratio': item.stats?.subordinationRatio ?? 0,
      'Coordination Ratio': item.stats?.coordinationRatio ?? 0,
      'Complex Sentences Count': item.stats?.complexSentencesCount ?? 0,
      'Complex Sentences (%)': item.stats?.complexSentencesRatio ?? 0,
      'Logical Connectors Total': item.stats?.logicalConnectorsCount ?? 0,
      'Connectors / 100 Words': item.stats?.logicalConnectorsDensity ?? 0,
      'Connectors (Contrast)': item.stats?.connectorsByCategory.contrast ?? 0,
      'Connectors (Addition)': item.stats?.connectorsByCategory.addition ?? 0,
      'Connectors (Cause & Effect)': item.stats?.connectorsByCategory.causeResult ?? 0,
      'Connectors (Sequence)': item.stats?.connectorsByCategory.sequence ?? 0,
      'Connectors (Exemplification)': item.stats?.connectorsByCategory.exemplification ?? 0,
      'Passive Voice Count': item.stats?.passiveVoiceCount ?? 0,
      'Type-Token Ratio (%)': item.stats?.typeTokenRatio ?? 0,
      'Lexical Density (%)': item.stats?.lexicalDensity ?? 0,
      'Advanced Words (%)': item.stats?.polysyllabicWordRatio ?? 0,
      'Target Wordlist Total in List': wordlist.length,
      'Target Wordlist Matches (Tokens)': item.stats?.targetWordlistStats?.totalMatches ?? 0,
      'Target Wordlist Density (%)': item.stats?.targetWordlistStats?.densityPercentage ?? 0,
      'Target Wordlist Types Covered': item.stats?.targetWordlistStats?.matchedTypesCount ?? 0,
      'Target Wordlist Coverage (%)': item.stats?.targetWordlistStats?.coveragePercentage ?? 0,
      'Matched Target Words': item.stats?.targetWordlistStats?.matches.map(m => `${m.word} (${m.count})`).join(', ') ?? '',
      'Unmatched Target Words': item.stats?.targetWordlistStats?.unmatchedWords.join(', ') ?? '',
      'Avg Word Length': item.stats?.avgWordLength ?? 0,
      'Max Sentence Length': item.stats?.maxSentenceLength ?? 0,
      'Min Sentence Length': item.stats?.minSentenceLength ?? 0,
      'Median Sentence Length': item.stats?.medianSentenceLength ?? 0,
    }));

    const wb = XLSX.utils.book_new();
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Corpus Stats");

    // Sheet 2: Indicator Statistics Summary Table
    if (analyzedCount > 0) {
      const statSummaryData = corpusStats.indicatorStats.map(stat => ({
        Category: stat.definition.category,
        Indicator: stat.definition.label,
        Unit: stat.definition.unit || '-',
        'N (Files)': corpusStats.fileCount,
        'Mean (Average)': stat.stats.mean,
        'SD (Standard Deviation)': stat.stats.sd,
        Median: stat.stats.median,
        Minimum: stat.stats.min,
        Maximum: stat.stats.max,
        'Total / Sum': stat.definition.isCount ? stat.stats.sum : '-'
      }));
      const wsStats = XLSX.utils.json_to_sheet(statSummaryData);
      XLSX.utils.book_append_sheet(wb, wsStats, "Indicator Statistics");
    }

    // Sheet 3: Target Wordlist Detailed Breakdown per File
    const wordlistRows: any[] = [];
    items.forEach(item => {
      if (item.stats && item.stats.targetWordlistStats) {
        const tStats = item.stats.targetWordlistStats;
        tStats.matches.forEach(m => {
          wordlistRows.push({
            Filename: item.filename,
            'Target Word': m.word,
            Status: 'PRESENT',
            'Occurrences (Count)': m.count,
            'Density (% of File)': `${m.density}%`,
            'Matched Token Forms': m.matchedTokens.join(', '),
            'Sample Sentence': m.sampleSentences[0] || ''
          });
        });

        tStats.unmatchedWords.forEach(uw => {
          wordlistRows.push({
            Filename: item.filename,
            'Target Word': uw,
            Status: 'ABSENT',
            'Occurrences (Count)': 0,
            'Density (% of File)': '0%',
            'Matched Token Forms': '-',
            'Sample Sentence': '-'
          });
        });
      }
    });

    if (wordlistRows.length > 0) {
      const wsWordlist = XLSX.utils.json_to_sheet(wordlistRows);
      XLSX.utils.book_append_sheet(wb, wsWordlist, "Target Wordlist Breakdown");
    }

    // Sheet 4: Top 200 Words per file
    const freqData: any[] = [];
    items.forEach(item => {
      if (item.stats && item.stats.wordFrequencies.length > 0) {
        const topWords = item.stats.wordFrequencies.slice(0, 200);
        topWords.forEach(wf => {
          freqData.push({
            Filename: item.filename,
            Word: wf.word,
            Count: wf.count
          });
        });
      }
    });

    if (freqData.length > 0) {
      const wsFreq = XLSX.utils.json_to_sheet(freqData);
      XLSX.utils.book_append_sheet(wb, wsFreq, "Top 200 Words Per File");
    }

    XLSX.writeFile(wb, "Learners_Writing_Corpus_Batch.xlsx");
  }, [items, wordlist.length, analyzedCount, corpusStats]);

  useEffect(() => {
    registerBatchHandlers({
      exportExcel: exportToExcel,
      exportSummaryCsv: handleExportStatsSummaryCsv,
      exportIndicatorsCsv: handleExportCorpusWithStatsCsv,
      exportWordlistCsv: handleExportWordlistCsv,
      clear: clearAll,
      uploadFiles: () => {
        batchFileInputRef.current?.click();
      },
      itemsCount: items.length,
      analyzedCount: analyzedCount
    });
  }, [
    registerBatchHandlers,
    exportToExcel,
    handleExportStatsSummaryCsv,
    handleExportCorpusWithStatsCsv,
    handleExportWordlistCsv,
    clearAll,
    items.length,
    analyzedCount
  ]);

  // Filtered indicator stats for the Statistics view tab
  const categoriesList = useMemo(() => {
    return ['all', ...Object.keys(corpusStats.categoryStats)];
  }, [corpusStats]);

  const displayedStats = useMemo(() => {
    if (statCategoryFilter === 'all') {
      return corpusStats.indicatorStats;
    }
    return corpusStats.categoryStats[statCategoryFilter] || [];
  }, [corpusStats, statCategoryFilter]);

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-8rem)]">
      
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>{items.length} file{items.length !== 1 ? 's' : ''} in corpus</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              analyzedCount === items.length && items.length > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <span>{analyzedCount}/{items.length} analyzed</span>
            </span>
          </div>
          
          <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          
          {/* Stopwords status badge (synchronized with References menu) */}
          <button
            type="button"
            onClick={toggleFilterStopwords}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterStopwords 
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
            }`}
            title="Toggle stopword filtering (also configured under References menu)"
          >
            <Filter className={`h-3.5 w-3.5 ${filterStopwords ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span>Stopwords: {filterStopwords ? 'Filtered' : 'Included'}</span>
          </button>

          {/* Wordlist Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Configure target wordlist (also configured under References menu)"
          >
            <BookmarkCheck className="h-4 w-4 text-amber-600" />
            <span>Wordlist ({wordlist.length})</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Analyze Button */}
          <button
            onClick={analyzeAll}
            disabled={items.length === 0 || isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Analyze or Re-analyze corpus with active wordlist & stopword settings"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              analyzedCount > 0 ? 'Re-analyze Corpus' : 'Analyze Corpus'
            )}
          </button>

          {/* Hidden input triggered by File -> Upload menu and drag-drop */}
          <input 
            type="file" 
            multiple 
            ref={batchFileInputRef}
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
            onChange={handleFileUpload} 
            disabled={isReadingFiles}
            className="hidden" 
          />
        </div>
      </div>

      {/* Main Body with Tab Switching: Documents Table vs. Indicator Statistics */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all relative ${
          isDragging ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/95 z-30 flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-blue-400 m-3 rounded-xl">
            <Upload className="h-10 w-10 text-blue-600 animate-bounce mb-3" />
            <p className="text-base font-semibold text-blue-900">Drop your .docx or .txt files here</p>
            <p className="text-xs text-blue-600 mt-1">Files will be added to the batch list automatically</p>
          </div>
        )}
        
        {/* Header Bar with Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-gray-200/80 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'documents'
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Documents View ({items.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('statistics')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'statistics'
                    ? 'bg-white text-gray-900 shadow-xs font-semibold text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Indicator Statistics ({corpusStats.indicatorStats.length} Metrics)</span>
              </button>
            </div>

            <span className="text-xs text-gray-500 hidden md:inline">
              Evaluated against target wordlist ({wordlist.length} target words)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {analyzedCount > 0 && (
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                {analyzedCount} of {items.length} Analyzed
              </span>
            )}
          </div>
        </div>
        
        {/* Tab 1: Documents View */}
        {activeTab === 'documents' && (
          <div className="flex-1 overflow-auto p-0">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                <div className="mb-4 relative">
                  <img 
                    src={BRAND_LOGO_URL} 
                    alt="Measuring Learners English Writing Logo" 
                    className="h-16 w-16 object-contain rounded-full shadow-xs border border-blue-100 bg-white p-1"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.includes('logo.png')) {
                        img.src = './logo.png';
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-1 justify-center flex-wrap">
                  <p className="text-gray-800 font-bold text-base">
                    {isReadingFiles ? 'Importing files...' : 'Corpus Batch Queue Empty'}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    v2.0
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Otc, 2026
                  </span>
                </div>
                <p className="text-sm text-gray-500 max-w-md">
                  Import multiple <span className="font-semibold text-gray-700">.docx</span> or <span className="font-semibold text-gray-700">.txt</span> files to batch analyze linguistic indicators, evaluate target wordlists, and compute corpus statistics.
                </p>
                
                <label className="mt-5 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-xs">
                  <Upload className="h-4 w-4" />
                  <span>Choose .docx / .txt Files</span>
                  <input 
                    type="file" 
                    multiple 
                    accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
                    onChange={handleFileUpload} 
                    disabled={isReadingFiles}
                    className="hidden" 
                  />
                </label>
                <span className="text-xs text-gray-400 mt-2">or drag & drop files here</span>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-white shadow-[0_1px_0_rgba(0,0,0,0.1)] z-10">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-gray-600">File Name</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Words</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Sentences</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Avg Len (±SD)</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Clauses/S</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Subord. (Ratio)</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Connectors (/100w)</th>
                    <th className="px-3 py-3 font-semibold text-amber-800 text-right bg-amber-50/60">Wordlist Hits</th>
                    <th className="px-3 py-3 font-semibold text-amber-800 text-right bg-amber-50/60">List Coverage</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Complex %</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">Adv. Vocab %</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-right">TTR %</th>
                    <th className="px-3 py-3 font-semibold text-gray-600 text-center">Status</th>
                    <th className="px-3 py-3 w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[180px] truncate" title={item.filename}>
                          {item.filename}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats?.totalWords.toLocaleString() ?? '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats?.totalSentences.toLocaleString() ?? '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats ? `${item.stats.avgSentenceLength} (±${item.stats.sentenceLengthStdDev})` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats?.clausesPerSentence ?? '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats ? `${item.stats.subordinateClausesCount} (${item.stats.subordinationRatio}/s)` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats ? `${item.stats.logicalConnectorsCount} (${item.stats.logicalConnectorsDensity})` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono font-medium text-amber-900 bg-amber-50/30">
                          {item.stats?.targetWordlistStats 
                            ? `${item.stats.targetWordlistStats.totalMatches} (${item.stats.targetWordlistStats.densityPercentage}%)`
                            : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono font-medium text-amber-900 bg-amber-50/30">
                          {item.stats?.targetWordlistStats 
                            ? `${item.stats.targetWordlistStats.matchedTypesCount}/${item.stats.targetWordlistStats.targetWordCount} (${item.stats.targetWordlistStats.coveragePercentage}%)`
                            : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats ? `${item.stats.complexSentencesRatio}%` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats ? `${item.stats.polysyllabicWordRatio}%` : '-'}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-gray-600">
                          {item.stats?.typeTokenRatio ?? '-'}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          {item.status === 'pending' && <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" title="Pending"></span>}
                          {item.status === 'analyzed' && <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" title="Analyzed" />}
                          {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mx-auto" title="Error" />}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Indicator Statistics View */}
        {activeTab === 'statistics' && (
          <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-50/30">
            {analyzedCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <BarChart3 className="h-12 w-12 mb-3 text-gray-300" />
                <h3 className="font-semibold text-gray-700 text-base">No Statistical Data Available Yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Upload text files and click <span className="font-semibold text-gray-700">"Analyze"</span> above to compute descriptive statistics across all writing indicators.
                </p>
              </div>
            ) : (
              <>
                {/* Corpus Overview Summary Banner */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Descriptive Statistics of Writing Indicators (N = {corpusStats.fileCount} Documents)
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Corpus distribution including Mean, Standard Deviation (SD), Median, Range (Min–Max), and Totals.
                      </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {categoriesList.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStatCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            statCategoryFilter === cat
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat === 'all' ? 'All Categories' : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs font-semibold text-blue-800">Analyzed Corpus Size</div>
                      <div className="text-lg font-bold text-blue-950 mt-0.5">{corpusStats.fileCount} Files</div>
                      <div className="text-[11px] text-blue-600 mt-0.5">
                        Total words: {corpusStats.indicatorStats.find(i => i.definition.key === 'totalWords')?.stats.sum.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <div className="text-xs font-semibold text-emerald-800">Mean Sentence Length</div>
                      <div className="text-lg font-bold text-emerald-950 mt-0.5">
                        {corpusStats.indicatorStats.find(i => i.definition.key === 'avgSentenceLength')?.stats.mean} w/sent
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">
                        SD: ±{corpusStats.indicatorStats.find(i => i.definition.key === 'avgSentenceLength')?.stats.sd}
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                      <div className="text-xs font-semibold text-purple-800">Mean Subordination</div>
                      <div className="text-lg font-bold text-purple-950 mt-0.5">
                        {corpusStats.indicatorStats.find(i => i.definition.key === 'subordinationRatio')?.stats.mean} /sent
                      </div>
                      <div className="text-[11px] text-purple-600 mt-0.5">
                        Clauses/sent: {corpusStats.indicatorStats.find(i => i.definition.key === 'clausesPerSentence')?.stats.mean}
                      </div>
                    </div>

                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <div className="text-xs font-semibold text-amber-800">Mean Connector Density</div>
                      <div className="text-lg font-bold text-amber-950 mt-0.5">
                        {corpusStats.indicatorStats.find(i => i.definition.key === 'logicalConnectorsDensity')?.stats.mean} /100w
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Wordlist coverage: {corpusStats.indicatorStats.find(i => i.definition.key === 'targetWordlistCoverage')?.stats.mean}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Indicators Statistical Table */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">Indicator Statistics Matrix</span>
                    <button
                      type="button"
                      onClick={handleExportStatsSummaryCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Statistics CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Indicator Name</th>
                          <th className="px-3 py-3 text-center">Unit</th>
                          <th className="px-3 py-3 text-right">Mean</th>
                          <th className="px-3 py-3 text-right">Std Dev (SD)</th>
                          <th className="px-3 py-3 text-right">Median</th>
                          <th className="px-3 py-3 text-right">Min</th>
                          <th className="px-3 py-3 text-right">Max</th>
                          <th className="px-4 py-3 text-right">Total Sum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {displayedStats.map((item) => (
                          <tr key={item.definition.key} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {item.definition.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {item.definition.label}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-xs text-gray-500">
                              {item.definition.unit || '—'}
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-bold text-blue-700 bg-blue-50/20">
                              {item.stats.mean}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-gray-600">
                              ±{item.stats.sd}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-gray-800 font-medium">
                              {item.stats.median}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-gray-500">
                              {item.stats.min}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-gray-500">
                              {item.stats.max}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-gray-700">
                              {item.definition.isCount ? item.stats.sum.toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
