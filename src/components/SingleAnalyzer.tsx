import { useState, useMemo, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { analyzeText, prependSentenceLengths, CONNECTOR_CATEGORIES } from '../lib/analyzer';
import { markTextWithWordlist } from '../lib/wordlist';
import { useWordlist } from '../lib/wordlistContext';
import { useApp } from '../lib/appContext';
import { generateSingleTextCsv, downloadCsv } from '../lib/indicatorStatistics';
import { extractTextFromFile } from '../lib/fileReader';
import { 
  FileText, 
  Calculator, 
  Hash, 
  List, 
  AlignLeft,
  Search,
  Filter,
  MessageSquare,
  TextSelect,
  ListOrdered,
  Upload,
  GraduationCap,
  Link2,
  GitBranch,
  Sparkles,
  BarChart2,
  BookmarkCheck,
  Download,
  Eye,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  X,
  Trash2,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatCard } from './StatCard';
import * as XLSX from 'xlsx';
import { BRAND_LOGO_URL } from '../assets/brand';

const SAMPLE_LEARNER_ESSAY = `In contemporary society, artificial intelligence has become an increasingly significant topic of discussion among educators and researchers worldwide. While some scholars argue that technological automation will replace traditional classroom teachers, others maintain that human mentorship remains indispensable for developing critical thinking and ethical reasoning.

Furthermore, recent educational studies indicate that integrating intelligent tutoring systems can substantially enhance individualized student progress. For instance, learners who receive automated immediate feedback frequently demonstrate notable improvements in complex problem-solving tasks. However, over-reliance on digital tools might inadvertently diminish learners' intrinsic motivation and collaborative interpersonal skills.

Therefore, it is crucial for educational policymakers to establish balanced curriculum guidelines that leverage computational technology while simultaneously preserving essential human pedagogical guidance. Consequently, students will be adequately equipped with analytical capabilities and interdisciplinary adaptability to thrive in a rapidly evolving global workforce.`;

export function SingleAnalyzer() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTargetOnly, setFilterTargetOnly] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [manualPasteInput, setManualPasteInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [resultTab, setResultTab] = useState<'learner' | 'wordlist' | 'words' | 'sentences' | 'clauses'>('learner');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { wordlist, setIsModalOpen } = useWordlist();
  const { filterStopwords, toggleFilterStopwords, registerSingleHandlers } = useApp();

  const stats = useMemo(
    () => analyzeText(text, { filterStopwords, targetWordlist: wordlist }), 
    [text, filterStopwords, wordlist]
  );

  const markedSegments = useMemo(
    () => markTextWithWordlist(text, wordlist),
    [text, wordlist]
  );

  const targetWordSet = useMemo(() => {
    return new Set(wordlist.map(w => w.toLowerCase().trim()));
  }, [wordlist]);

  const filteredWords = useMemo(() => {
    let list = stats.wordFrequencies;
    if (filterTargetOnly) {
      list = list.filter(w => targetWordSet.has(w.word.toLowerCase()));
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(w => w.word.includes(term));
  }, [stats.wordFrequencies, searchTerm, filterTargetOnly, targetWordSet]);

  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setIsReadingFile(true);
    setFileError(null);
    setFileName(file.name);
    try {
      const content = await extractTextFromFile(file);
      setText(content);
    } catch (err) {
      console.error('Failed to extract text from file:', err);
      setFileError(`Could not read "${file.name}". Please ensure it is a valid .docx or .txt document.`);
    } finally {
      setIsReadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

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

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_LEARNER_ESSAY);
    setFileName('sample_learner_essay.docx');
    setFileError(null);
  };

  const handleApplyManualPaste = () => {
    if (!manualPasteInput.trim()) return;
    setText(manualPasteInput.trim());
    setFileName('pasted_document.txt');
    setShowManualPaste(false);
    setManualPasteInput('');
  };

  const handleCopyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch {
      // ignore
    }
  };

  const exportReport = useCallback(() => {
    if (!text.trim()) return;

    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Single_Writing_Analysis';
    const wb = XLSX.utils.book_new();

    // Sheet 1: Executive Summary & All Metrics
    const summaryRows = [
      { Metric: 'Document Name', Value: fileName || 'Pasted Text' },
      { Metric: 'Total Words (Tokens)', Value: stats.totalWords },
      { Metric: 'Total Sentences', Value: stats.totalSentences },
      { Metric: 'Avg Sentence Length (Words)', Value: stats.avgSentenceLength },
      { Metric: 'Sentence Length SD (Variability)', Value: stats.sentenceLengthStdDev },
      { Metric: 'Short Sentences (<10w)', Value: `${stats.sentenceDistribution.short} (${stats.sentenceDistribution.shortPct}%)` },
      { Metric: 'Medium Sentences (10-25w)', Value: `${stats.sentenceDistribution.medium} (${stats.sentenceDistribution.mediumPct}%)` },
      { Metric: 'Long Sentences (>25w)', Value: `${stats.sentenceDistribution.long} (${stats.sentenceDistribution.longPct}%)` },
      { Metric: 'Clauses Per Sentence', Value: stats.clausesPerSentence },
      { Metric: 'Coordinate Clauses Count', Value: stats.coordinateClausesCount },
      { Metric: 'Subordinate Clauses Count', Value: stats.subordinateClausesCount },
      { Metric: 'Subordination Ratio', Value: stats.subordinationRatio },
      { Metric: 'Coordination Ratio', Value: stats.coordinationRatio },
      { Metric: 'Complex Sentences Ratio (%)', Value: `${stats.complexSentencesRatio}%` },
      { Metric: 'Passive Voice Count', Value: stats.passiveVoiceCount },
      { Metric: 'Type-Token Ratio (%)', Value: `${stats.typeTokenRatio}%` },
      { Metric: 'Lexical Density (%)', Value: `${stats.lexicalDensity}%` },
      { Metric: 'Advanced / Polysyllabic Vocab (%)', Value: `${stats.polysyllabicWordRatio}%` },
      { Metric: 'Logical Connectors Count', Value: stats.logicalConnectorsCount },
      { Metric: 'Logical Connectors Density (per 100w)', Value: stats.logicalConnectorsDensity },
      { Metric: 'Target Wordlist Total Words in List', Value: stats.targetWordlistStats?.targetWordCount ?? wordlist.length },
      { Metric: 'Target Wordlist Matches (Tokens)', Value: stats.targetWordlistStats?.totalMatches ?? 0 },
      { Metric: 'Target Wordlist Density (%)', Value: `${stats.targetWordlistStats?.densityPercentage ?? 0}%` },
      { Metric: 'Target Wordlist Unique Types Used', Value: stats.targetWordlistStats?.matchedTypesCount ?? 0 },
      { Metric: 'Target Wordlist List Coverage (%)', Value: `${stats.targetWordlistStats?.coveragePercentage ?? 0}%` },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Learner Metrics');

    // Sheet 2: Target Wordlist Detailed Matches
    if (stats.targetWordlistStats) {
      const targetRows = stats.targetWordlistStats.matches.map(m => ({
        'Target Word': m.word,
        Status: 'MATCHED',
        'Occurrences Count': m.count,
        'Density (% of Text)': `${m.density}%`,
        'Matched Token Forms': m.matchedTokens.join(', '),
        'Sample Sentence Context': m.sampleSentences[0] || ''
      }));

      stats.targetWordlistStats.unmatchedWords.forEach(uw => {
        targetRows.push({
          'Target Word': uw,
          Status: 'UNMATCHED',
          'Occurrences Count': 0,
          'Density (% of Text)': '0%',
          'Matched Token Forms': '-',
          'Sample Sentence Context': '-'
        });
      });

      const wsTarget = XLSX.utils.json_to_sheet(targetRows);
      XLSX.utils.book_append_sheet(wb, wsTarget, 'Target Wordlist Analysis');
    }

    // Sheet 3: Logical Connectors
    const connectorRows = stats.detectedConnectors.map(c => ({
      Connector: c.text,
      Category: c.categoryLabel,
      Occurrences: c.count
    }));
    if (connectorRows.length > 0) {
      const wsConn = XLSX.utils.json_to_sheet(connectorRows);
      XLSX.utils.book_append_sheet(wb, wsConn, 'Logical Connectors');
    }

    // Sheet 4: Word Frequency Catalog
    const freqRows = stats.wordFrequencies.slice(0, 500).map((wf, idx) => ({
      Rank: idx + 1,
      Word: wf.word,
      Count: wf.count,
      'Percentage (%)': ((wf.count / stats.totalWords) * 100).toFixed(2),
      'In Target Wordlist?': targetWordSet.has(wf.word.toLowerCase()) ? 'YES' : 'NO'
    }));
    const wsFreq = XLSX.utils.json_to_sheet(freqRows);
    XLSX.utils.book_append_sheet(wb, wsFreq, 'Word Frequencies');

    XLSX.writeFile(wb, `${baseName}_Learner_Report.xlsx`);
  }, [text, fileName, stats, wordlist.length, targetWordSet]);

  const exportCsv = useCallback(() => {
    if (!text.trim()) return;
    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Single_Writing_Analysis';
    const csvContent = generateSingleTextCsv(fileName || 'Pasted Essay', stats);
    downloadCsv(csvContent, `${baseName}_indicators.csv`);
  }, [text, fileName, stats]);

  useEffect(() => {
    registerSingleHandlers({
      exportExcel: exportReport,
      exportCsv: exportCsv,
      clear: () => {
        setText('');
        setFileName('');
        setFileError(null);
      },
      uploadFile: () => {
        fileInputRef.current?.click();
      },
      hasDocument: Boolean(text.trim()),
      fileName: fileName
    });
  }, [registerSingleHandlers, exportReport, exportCsv, text, fileName]);

  const targetStats = stats.targetWordlistStats;

  if (!text.trim()) {
    return (
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center p-6 sm:p-10 bg-white rounded-2xl border-2 transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10' 
            : 'border-dashed border-gray-300 hover:border-gray-400'
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/90 z-20 flex flex-col items-center justify-center pointer-events-none rounded-2xl">
            <Upload className="h-12 w-12 text-blue-600 animate-bounce mb-3" />
            <p className="text-lg font-semibold text-blue-900">Drop your .docx or .txt document here</p>
            <p className="text-sm text-blue-600 mt-1">Extracts plain text and calculates all indicators immediately</p>
          </div>
        )}

        <div className="max-w-2xl w-full text-center flex flex-col items-center">
          <div className="mb-5 relative group">
            <img 
              src={BRAND_LOGO_URL} 
              alt="Measuring Learners English Writing Logo" 
              className="h-20 sm:h-24 w-20 sm:w-24 object-contain rounded-full shadow-md border-2 border-blue-100 bg-white p-1 hover:scale-105 transition-transform"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.includes('logo.png')) {
                  img.src = './logo.png';
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Single Document Analysis
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              v2.0
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Otc, 2026
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mb-6 leading-relaxed">
            Import a learner essay or writing sample in Microsoft Word (<strong className="font-semibold text-gray-800">.docx</strong>) or Plain Text (<strong className="font-semibold text-gray-800">.txt</strong>) format to measure lexical, syntactic, cohesion, and readability indicators.
          </p>

          {/* File Error Notification */}
          {fileError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 max-w-md w-full text-left">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="flex-1">{fileError}</span>
              <button 
                type="button" 
                onClick={() => setFileError(null)} 
                className="text-red-500 hover:text-red-800 font-bold ml-1"
              >
                &times;
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-8">
            <label className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all text-sm group">
              {isReadingFile ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Upload className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
              )}
              <span>{isReadingFile ? 'Extracting text...' : 'Upload .docx / .txt Document'}</span>
              <input 
                type="file" 
                accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
                className="sr-only" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
                disabled={isReadingFile}
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSample}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-2xs transition-colors text-sm cursor-pointer"
              title="Try an authentic learner argumentative essay on AI and Education"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Try Sample Essay</span>
            </button>
          </div>

          {/* Supported Format Pills */}
          <div className="flex items-center justify-center gap-2 mb-8 text-xs text-gray-500 font-medium">
            <span className="px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">.docx (Word Document)</span>
            <span>•</span>
            <span className="px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">.txt (Plain Text UTF-8)</span>
            <span>•</span>
            <span className="text-gray-400">Drag & drop supported</span>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left text-xs text-gray-600 mb-6">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-blue-600" />
                Lexical & Syntactic
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                TTR, Root TTR, Lexical Density, Subordination Ratio, and Clause Complexity.
              </p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                <BookmarkCheck className="h-3.5 w-3.5 text-amber-600" />
                Target Wordlist
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Automatic inflection matching, density %, coverage, and in-text highlighting.
              </p>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                Indicator Statistics
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Descriptive stats (Mean, SD, Median, Min, Max, Skewness) exported to CSV.
              </p>
            </div>
          </div>

          {/* Subtle manual paste toggle for power users */}
          <div className="w-full">
            {!showManualPaste ? (
              <button
                type="button"
                onClick={() => setShowManualPaste(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4 cursor-pointer"
              >
                Or input text manually
              </button>
            ) : (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Manual Text Input</span>
                  <button
                    type="button"
                    onClick={() => { setShowManualPaste(false); setManualPasteInput(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  className="w-full h-28 p-2.5 text-xs text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden resize-none font-sans"
                  placeholder="Type or enter writing text here..."
                  value={manualPasteInput}
                  onChange={(e) => setManualPasteInput(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleApplyManualPaste}
                    disabled={!manualPasteInput.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Analyze Text
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-8rem)]">
      {/* Top Document Control Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs">
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm max-w-[200px] sm:max-w-[320px] truncate" title={fileName || 'Learner Document'}>
              {fileName || 'Learner Document'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-800 uppercase tracking-wide">
              {fileName?.toLowerCase().endsWith('.docx') ? 'DOCX' : 'TXT'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>{stats.totalWords.toLocaleString()} words</span>
            <span>•</span>
            <span>{stats.totalSentences} sentences</span>
            <span>•</span>
            <span>{stats.avgSentenceLength}w avg length</span>
            {(targetStats?.totalMatches ?? 0) > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {targetStats?.totalMatches} target vocabulary hits
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="View full document text with highlighted target vocabulary words"
          >
            <Eye className="h-3.5 w-3.5 text-amber-600" />
            <span>View Document & Marked Words</span>
          </button>
        </div>

        {/* Right side controls: Stopword Status Badge & Hidden Input */}
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Hidden file input for File -> Upload menu and file drop */}
          <input 
            type="file" 
            accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
            className="sr-only" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            disabled={isReadingFile}
          />
        </div>
      </div>
        
        {/* Top Stats Overview */}
        <div className="overflow-y-auto no-scrollbar shrink-0 pb-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Words" value={stats.totalWords} icon={<Hash className="h-4 w-4 text-blue-600" />} />
            <StatCard label="Avg Sentence" value={stats.avgSentenceLength} suffix="w" subtext={`SD: ±${stats.sentenceLengthStdDev}w`} icon={<Calculator className="h-4 w-4 text-indigo-600" />} />
            <StatCard label="Clauses / Sent" value={stats.clausesPerSentence} subtext={`${stats.clauses.length} total clauses`} icon={<MessageSquare className="h-4 w-4 text-amber-600" />} />
            <StatCard label="Subord. Clauses" value={stats.subordinateClausesCount} subtext={`${stats.subordinationRatio} per sent`} icon={<GitBranch className="h-4 w-4 text-emerald-600" />} />
            <StatCard label="Connectors" value={stats.logicalConnectorsCount} subtext={`${stats.logicalConnectorsDensity}/100 words`} icon={<Link2 className="h-4 w-4 text-purple-600" />} />
            <StatCard 
              label="Target Wordlist" 
              value={targetStats?.totalMatches ?? 0} 
              suffix=" hits"
              subtext={`${targetStats?.coveragePercentage ?? 0}% covered (${targetStats?.matchedTypesCount ?? 0}/${wordlist.length})`}
              icon={<BookmarkCheck className="h-4 w-4 text-amber-600" />} 
            />
          </div>
        </div>

        {/* Tabbed Result Container */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-0">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-1 bg-gray-200/50 p-1 rounded-lg">
              <button 
                onClick={() => setResultTab('learner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${resultTab === 'learner' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Learner Indicators
              </button>
              <button 
                onClick={() => setResultTab('wordlist')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${resultTab === 'wordlist' ? 'bg-white text-amber-800 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <BookmarkCheck className="h-4 w-4 text-amber-600" />
                Target Wordlist ({targetStats?.matchedTypesCount ?? 0}/{wordlist.length})
              </button>
              <button 
                onClick={() => setResultTab('words')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${resultTab === 'words' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="h-4 w-4 text-gray-500" />
                Words
              </button>
              <button 
                onClick={() => setResultTab('sentences')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${resultTab === 'sentences' ? 'bg-white text-gray-900 shadow-xs text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ListOrdered className="h-4 w-4 text-gray-500" />
                Sentences
              </button>
              <button 
                onClick={() => setResultTab('clauses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${resultTab === 'clauses' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <TextSelect className="h-4 w-4 text-gray-500" />
                Clauses ({stats.coordinateClausesCount + stats.subordinateClausesCount})
              </button>
            </div>
            
            {/* Actions: Search or Export Report */}
            <div className="flex items-center gap-2">
              {resultTab === 'words' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!text}
                    className="block w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={exportCsv}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Export writing indicators and statistics in CSV format"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={exportReport}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                title="Export complete writing metrics and target wordlist report to Excel"
              >
                <Download className="h-3.5 w-3.5" />
                Export Excel
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {stats.wordFrequencies.length === 0 && stats.clauses.length === 0 && stats.rankedSentences.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <FileText className="h-8 w-8 mb-3 opacity-20" />
                <p className="text-sm">No data to display.</p>
                <p className="text-xs mt-1">Enter or upload text to see analysis results.</p>
              </div>
            ) : resultTab === 'wordlist' ? (
              /* Dedicated Target Wordlist Diagnostic Panel */
              <div className="p-5 space-y-6">
                
                {/* Wordlist Overview Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="h-5 w-5 text-amber-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Target Wordlist Diagnostics</h3>
                        <p className="text-xs text-gray-500">Evaluates learner usage and density of designated target vocabulary.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 shadow-2xs transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Highlighted in Text
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
                      >
                        Edit Wordlist
                      </button>
                    </div>
                  </div>

                  {/* Top 4 Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <p className="text-[11px] font-medium text-gray-500">Target Matches Found</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{targetStats?.totalMatches ?? 0}</span>
                        <span className="text-xs text-gray-500">tokens</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Total occurrences in essay</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <p className="text-[11px] font-medium text-gray-500">Target Word Density</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{targetStats?.densityPercentage ?? 0}%</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Proportion of all text tokens</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <p className="text-[11px] font-medium text-gray-500">Unique Types Covered</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{targetStats?.matchedTypesCount ?? 0}</span>
                        <span className="text-xs text-gray-400">/ {targetStats?.targetWordCount ?? wordlist.length}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Different target words used</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <p className="text-[11px] font-medium text-gray-500">List Coverage Rate</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{targetStats?.coveragePercentage ?? 0}%</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">Target curriculum coverage</p>
                    </div>
                  </div>
                </div>

                {/* Section 1: Matched Target Words */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Matched Target Words ({targetStats?.matches.length ?? 0})
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400">Sorted by frequency in text</span>
                  </div>

                  {!targetStats || targetStats.matches.length === 0 ? (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-500">
                      No words from the target list were identified in this text. Try adjusting your target wordlist or incorporating target vocabulary into the essay.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {targetStats.matches.map((item, idx) => (
                        <div key={item.word} className="py-3 flex flex-col gap-1.5 first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}.</span>
                              <span className="text-sm font-bold text-gray-900">{item.word}</span>
                              <span className="text-xs bg-amber-100 text-amber-800 font-mono px-2 py-0.5 rounded-full font-semibold">
                                ×{item.count} {item.count === 1 ? 'match' : 'matches'}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">
                                ({item.density}% of text)
                              </span>
                            </div>
                            {item.matchedTokens.length > 0 && item.matchedTokens[0] !== item.word && (
                              <span className="text-[11px] text-gray-400 italic">
                                Found as: {item.matchedTokens.join(', ')}
                              </span>
                            )}
                          </div>
                          
                          {/* Sample Sentence Context */}
                          {item.sampleSentences.length > 0 && (
                            <div className="ml-7 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-2 italic leading-relaxed">
                              "{item.sampleSentences[0]}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Unmatched Target Words */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Unmatched Target Words ({targetStats?.unmatchedWords.length ?? 0})
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400">Target words not yet utilized in this draft</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    These target vocabulary items have not been used by the learner. Instructors can suggest integrating these terms into subsequent revisions.
                  </p>

                  {!targetStats || targetStats.unmatchedWords.length === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Outstanding! 100% of the target wordlist vocabulary was utilized in this text.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {targetStats.unmatchedWords.map((word) => (
                        <span
                          key={word}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : resultTab === 'words' ? (
              <div>
                {/* Target words filter toggle */}
                <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Filter View:</span>
                    <button
                      type="button"
                      onClick={() => setFilterTargetOnly(false)}
                      className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                        !filterTargetOnly ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      All Words ({stats.wordFrequencies.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTargetOnly(true)}
                      className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                        filterTargetOnly ? 'bg-amber-100 text-amber-900 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BookmarkCheck className="h-3 w-3 text-amber-600" />
                      Target Wordlist Only ({targetStats?.matchedTypesCount ?? 0})
                    </button>
                  </div>
                  <span className="text-gray-400 font-mono">
                    Showing {filteredWords.length} words
                  </span>
                </div>

                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur-xs shadow-[0_1px_0_rgba(0,0,0,0.1)] z-10">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-500 w-16 text-right">#</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Word</th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-right">Count</th>
                      <th className="px-6 py-3 font-medium text-gray-500 w-32">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence initial={false}>
                      {filteredWords.map((item, idx) => {
                        const percentage = ((item.count / stats.totalWords) * 100).toFixed(2);
                        const isTarget = targetWordSet.has(item.word.toLowerCase());
                        return (
                          <motion.tr 
                            key={item.word}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`hover:bg-gray-50/80 transition-colors group ${isTarget ? 'bg-amber-50/30' : ''}`}
                          >
                            <td className="px-6 py-2.5 text-gray-400 text-right text-xs">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-2.5 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              <div className="flex items-center gap-2">
                                <span>{item.word}</span>
                                {isTarget && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-sm border border-amber-200">
                                    <BookmarkCheck className="h-2.5 w-2.5 text-amber-600" />
                                    Target
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-2.5 font-mono text-gray-600 text-right">
                              {item.count.toLocaleString()}
                            </td>
                            <td className="px-6 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${isTarget ? 'bg-amber-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${Math.min(100, Number(percentage) * 5)}%` }} 
                                  />
                                </div>
                                <span className="text-xs text-gray-500 font-mono w-10 text-right">
                                  {percentage}%
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {filteredWords.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                          {searchTerm 
                            ? `No matching words found for "${searchTerm}".` 
                            : 'No target words detected in this text.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : resultTab === 'sentences' ? (
              <div className="p-4 space-y-2">
                {stats.rankedSentences.map((sentence, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors items-start">
                    <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-6 text-right">
                      {idx + 1}.
                    </span>
                    <span className="text-gray-700 text-sm flex-1">
                      {sentence.text}
                    </span>
                    <span className="text-indigo-600 font-mono text-xs whitespace-nowrap bg-indigo-50 px-2 py-1 rounded-md shrink-0">
                      {sentence.length} words
                    </span>
                  </div>
                ))}
              </div>
            ) : resultTab === 'clauses' ? (
              <div className="p-4 space-y-8">
                
                {/* Coordinative Clauses Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-800">Coordinate Clauses</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-mono px-2 py-0.5 rounded-md">
                      {stats.coordinateClausesCount}
                    </span>
                  </div>
                  {stats.coordinateClauses.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No coordinate clauses matched the heuristic.</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.coordinateClauses.map((clause, idx) => (
                        <div key={idx} className="bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg text-sm text-emerald-900 shadow-2xs">
                          {clause}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subordinative Clauses Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-800">Subordinate Clauses</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs font-mono px-2 py-0.5 rounded-md">
                      {stats.subordinateClausesCount}
                    </span>
                  </div>
                  {stats.subordinateClauses.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No subordinate clauses matched the heuristic.</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.subordinateClauses.map((clause, idx) => (
                        <div key={idx} className="bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg text-sm text-amber-900 shadow-2xs">
                          {clause}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* General Clauses Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-800">All Grammar Clauses</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-mono px-2 py-0.5 rounded-md">
                      {stats.clauses.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stats.clauses.map((clause, idx) => (
                      <div key={idx} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                        <span className="text-gray-400 font-mono text-xs mt-0.5 shrink-0 w-6 text-right">
                          {idx + 1}.
                        </span>
                        <span className="text-gray-700 text-sm">
                          {clause}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Learner Writing Profile Section */
              <div className="p-5 space-y-6">
                
                {/* 1. Target Wordlist Summary Banner */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Target Wordlist Diagnostics</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-900 font-mono text-xs px-2.5 py-1 rounded-full font-semibold">
                        {targetStats?.totalMatches ?? 0} matches ({targetStats?.densityPercentage ?? 0}% density)
                      </span>
                      <button
                        onClick={() => setResultTab('wordlist')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 ml-1"
                      >
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Covers <strong>{targetStats?.matchedTypesCount ?? 0} of {wordlist.length} target words</strong> ({targetStats?.coveragePercentage ?? 0}% of active target wordlist).
                  </p>
                  {targetStats && targetStats.matches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {targetStats.matches.slice(0, 10).map((m) => (
                        <span
                          key={m.word}
                          className="inline-flex items-center gap-1 bg-white border border-amber-200 px-2.5 py-1 rounded-md text-xs font-medium text-gray-800 shadow-2xs"
                        >
                          <span>{m.word}</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                            ×{m.count}
                          </span>
                        </span>
                      ))}
                      {targetStats.matches.length > 10 && (
                        <button
                          onClick={() => setResultTab('wordlist')}
                          className="text-xs text-amber-700 hover:text-amber-900 font-medium px-2 py-1"
                        >
                          +{targetStats.matches.length - 10} more...
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Logical Connectors & Cohesive Devices */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Logical Connectors & Discourse Markers</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 font-mono text-xs px-2.5 py-1 rounded-full font-medium">
                        {stats.logicalConnectorsCount} total ({stats.logicalConnectorsDensity} per 100 words)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Discourse connectors tie sentences together logically. Competent academic and argumentative writing typically utilizes 1.5–2.5 transitions per 100 words across diverse categories.
                  </p>

                  {/* Category Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
                    {CONNECTOR_CATEGORIES.map(cat => {
                      const count = stats.connectorsByCategory[cat.key] || 0;
                      return (
                        <div key={cat.key} className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                          <p className="text-[11px] font-medium text-gray-500 truncate" title={cat.label}>
                            {cat.label}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-lg font-bold text-gray-900">{count}</span>
                            <span className="text-[11px] text-gray-400">
                              {stats.logicalConnectorsCount > 0 ? `${Math.round((count / stats.logicalConnectorsCount) * 100)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detected Connectors List */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Detected Transition Words & Phrases</h4>
                    {stats.detectedConnectors.length === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-white p-3 rounded-lg border border-dashed border-gray-200">
                        No explicit logical connectors detected. Try incorporating transitions such as "however", "therefore", "furthermore", or "for example" to guide your reader.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {stats.detectedConnectors.map((conn, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-800 shadow-2xs"
                          >
                            <span className="capitalize">{conn.text}</span>
                            <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                              ×{conn.count}
                            </span>
                            <span className="text-[10px] text-gray-400">({conn.categoryLabel})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Sentence Length Variation & Pacing */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Sentence Length Variation & Pacing</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full">
                        Length SD: ±{stats.sentenceLengthStdDev} words
                      </span>
                    </div>
                  </div>

                  {/* Pedagogical variation feedback */}
                  <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 mb-4 flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {stats.sentenceLengthStdDev < 4 ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      ) : stats.sentenceLengthStdDev <= 10 ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <div>
                      {stats.sentenceLengthStdDev < 4 ? (
                        <span><b>Low Syntactic Variation (Monotonous):</b> Sentences are uniform in length. English learners are encouraged to blend short, punchy statements with longer multi-clause compound sentences.</span>
                      ) : stats.sentenceLengthStdDev <= 10 ? (
                        <span><b>Balanced Variation (Dynamic Pacing):</b> Well-paced distribution. Balances clear declarative clauses with descriptive elaboration.</span>
                      ) : (
                        <span><b>High Dynamic Variation:</b> Diverse sentence architecture spanning brief focal sentences to intricate, syntactically complex thoughts.</span>
                      )}
                    </div>
                  </div>

                  {/* Distribution Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-700">
                      <span>Sentence Length Distribution</span>
                      <span className="text-gray-400">Min: {stats.minSentenceLength}w · Median: {stats.medianSentenceLength}w · Max: {stats.maxSentenceLength}w</span>
                    </div>

                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-blue-500 h-full transition-all" 
                        style={{ width: `${stats.sentenceDistribution.shortPct}%` }}
                        title={`Short (<10w): ${stats.sentenceDistribution.shortPct}%`}
                      />
                      <div 
                        className="bg-indigo-500 h-full transition-all" 
                        style={{ width: `${stats.sentenceDistribution.mediumPct}%` }}
                        title={`Medium (10-25w): ${stats.sentenceDistribution.mediumPct}%`}
                      />
                      <div 
                        className="bg-purple-500 h-full transition-all" 
                        style={{ width: `${stats.sentenceDistribution.longPct}%` }}
                        title={`Long (>25w): ${stats.sentenceDistribution.longPct}%`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-blue-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Short (&lt;10 words)
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {stats.sentenceDistribution.short} <span className="text-xs font-normal text-gray-500">({stats.sentenceDistribution.shortPct}%)</span>
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Medium (10–25w)
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {stats.sentenceDistribution.medium} <span className="text-xs font-normal text-gray-500">({stats.sentenceDistribution.mediumPct}%)</span>
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-purple-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Long (&gt;25 words)
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {stats.sentenceDistribution.long} <span className="text-xs font-normal text-gray-500">({stats.sentenceDistribution.longPct}%)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Syntactic Complexity & Clause Architecture */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Syntactic Complexity & Clause Architecture</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Subordination Ratio</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{stats.subordinationRatio}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stats.subordinateClausesCount} subord. clauses</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Coordination Ratio</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{stats.coordinationRatio}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stats.coordinateClausesCount} coord. clauses</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Complex Sentences</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{stats.complexSentencesRatio}%</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stats.complexSentencesCount} of {stats.totalSentences} sentences</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Passive Voice</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{stats.passiveVoiceCount}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{stats.passiveVoiceRatio} per sentence</p>
                    </div>
                  </div>
                </div>

                {/* 5. Lexical Sophistication & Density */}
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Lexical Sophistication & Richness</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Advanced / Polysyllabic Vocab</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{stats.polysyllabicWordRatio}%</span>
                        <span className="text-xs text-gray-500 font-mono">({stats.polysyllabicWordCount} words)</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Words with 3+ syllables (proxy for academic tier).</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Lexical Density</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{stats.lexicalDensity}%</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Content-carrying words (nouns, verbs, adjs, advs).</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500">Type-Token Ratio (TTR)</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-gray-900">{stats.typeTokenRatio}%</span>
                        <span className="text-xs text-gray-500 font-mono">({stats.uniqueWords} unique)</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Vocabulary diversity without repetition.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Document Text & Target Wordlist Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-800">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{fileName || 'Document Viewer'}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{stats.totalWords.toLocaleString()} words</span>
                      <span>•</span>
                      <span>{stats.totalSentences} sentences</span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">{targetStats?.totalMatches ?? 0} target words marked</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setText(prependSentenceLengths(text))}
                    className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    title="Prepend sentence word counts into the document text"
                  >
                    Insert Sentence Lengths
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedNotification ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
                    <span>{copiedNotification ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content with highlighted target vocabulary */}
              <div className="p-6 overflow-y-auto flex-1 font-sans text-sm sm:text-base leading-relaxed text-gray-800 whitespace-pre-wrap select-text">
                {markedSegments.map((segment, idx) => {
                  if (segment.isMarked) {
                    return (
                      <mark
                        key={idx}
                        className="bg-amber-200/90 text-amber-950 font-semibold px-1 py-0.5 rounded-sm border-b-2 border-amber-400 mx-0.5 transition-all hover:bg-amber-300"
                        title={`Target Word: "${segment.targetWord}"`}
                      >
                        {segment.text}
                      </mark>
                    );
                  }
                  return <span key={idx}>{segment.text}</span>;
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <span>Marked words are highlighted based on the active <strong>{wordlist.length}-word Target Wordlist</strong>.</span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
