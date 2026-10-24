import { TextStats } from './analyzer';

export interface MetricStats {
  mean: number;
  sd: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}

export interface IndicatorDefinition {
  key: string;
  label: string;
  category: 'Volume & Length' | 'Syntactic Complexity' | 'Logical Connectors & Cohesion' | 'Lexical Diversity & Sophistication' | 'Target Wordlist Diagnostics';
  unit?: string;
  isCount?: boolean;
  getValue: (stats: TextStats) => number;
}

export const INDICATOR_DEFINITIONS: IndicatorDefinition[] = [
  // Volume & Length
  {
    key: 'totalWords',
    label: 'Total Words (Tokens)',
    category: 'Volume & Length',
    unit: 'words',
    isCount: true,
    getValue: s => s.totalWords
  },
  {
    key: 'totalSentences',
    label: 'Total Sentences',
    category: 'Volume & Length',
    unit: 'sentences',
    isCount: true,
    getValue: s => s.totalSentences
  },
  {
    key: 'avgSentenceLength',
    label: 'Mean Sentence Length',
    category: 'Volume & Length',
    unit: 'words/sent',
    getValue: s => s.avgSentenceLength
  },
  {
    key: 'sentenceLengthStdDev',
    label: 'Sentence Length SD (Variability)',
    category: 'Volume & Length',
    unit: 'words',
    getValue: s => s.sentenceLengthStdDev
  },
  {
    key: 'medianSentenceLength',
    label: 'Median Sentence Length',
    category: 'Volume & Length',
    unit: 'words',
    getValue: s => s.medianSentenceLength
  },
  {
    key: 'minSentenceLength',
    label: 'Minimum Sentence Length',
    category: 'Volume & Length',
    unit: 'words',
    getValue: s => s.minSentenceLength
  },
  {
    key: 'maxSentenceLength',
    label: 'Maximum Sentence Length',
    category: 'Volume & Length',
    unit: 'words',
    getValue: s => s.maxSentenceLength
  },
  {
    key: 'shortSentencesPct',
    label: 'Short Sentences (<10w) Ratio',
    category: 'Volume & Length',
    unit: '%',
    getValue: s => s.sentenceDistribution.shortPct
  },
  {
    key: 'mediumSentencesPct',
    label: 'Medium Sentences (10-25w) Ratio',
    category: 'Volume & Length',
    unit: '%',
    getValue: s => s.sentenceDistribution.mediumPct
  },
  {
    key: 'longSentencesPct',
    label: 'Long Sentences (>25w) Ratio',
    category: 'Volume & Length',
    unit: '%',
    getValue: s => s.sentenceDistribution.longPct
  },

  // Syntactic Complexity
  {
    key: 'clausesPerSentence',
    label: 'Clauses Per Sentence',
    category: 'Syntactic Complexity',
    unit: 'clauses/sent',
    getValue: s => s.clausesPerSentence
  },
  {
    key: 'subordinateClausesCount',
    label: 'Subordinate Clauses (Count)',
    category: 'Syntactic Complexity',
    unit: 'clauses',
    isCount: true,
    getValue: s => s.subordinateClausesCount
  },
  {
    key: 'subordinationRatio',
    label: 'Subordination Ratio',
    category: 'Syntactic Complexity',
    unit: 'subord/sent',
    getValue: s => s.subordinationRatio
  },
  {
    key: 'coordinateClausesCount',
    label: 'Coordinate Clauses (Count)',
    category: 'Syntactic Complexity',
    unit: 'clauses',
    isCount: true,
    getValue: s => s.coordinateClausesCount
  },
  {
    key: 'coordinationRatio',
    label: 'Coordination Ratio',
    category: 'Syntactic Complexity',
    unit: 'coord/sent',
    getValue: s => s.coordinationRatio
  },
  {
    key: 'complexSentencesCount',
    label: 'Complex Sentences (Count)',
    category: 'Syntactic Complexity',
    unit: 'sentences',
    isCount: true,
    getValue: s => s.complexSentencesCount
  },
  {
    key: 'complexSentencesRatio',
    label: 'Complex Sentences Ratio',
    category: 'Syntactic Complexity',
    unit: '%',
    getValue: s => s.complexSentencesRatio
  },
  {
    key: 'passiveVoiceCount',
    label: 'Passive Voice Constructions (Count)',
    category: 'Syntactic Complexity',
    unit: 'passives',
    isCount: true,
    getValue: s => s.passiveVoiceCount
  },
  {
    key: 'passiveVoiceRatio',
    label: 'Passive Voice Ratio',
    category: 'Syntactic Complexity',
    unit: 'passive/sent',
    getValue: s => s.passiveVoiceRatio
  },

  // Logical Connectors & Cohesion
  {
    key: 'logicalConnectorsCount',
    label: 'Logical Connectors (Total Count)',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.logicalConnectorsCount
  },
  {
    key: 'logicalConnectorsDensity',
    label: 'Logical Connectors Density',
    category: 'Logical Connectors & Cohesion',
    unit: 'per 100 words',
    getValue: s => s.logicalConnectorsDensity
  },
  {
    key: 'connectorsContrast',
    label: 'Connectors: Contrast & Concession',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.connectorsByCategory.contrast
  },
  {
    key: 'connectorsAddition',
    label: 'Connectors: Addition & Reinforcement',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.connectorsByCategory.addition
  },
  {
    key: 'connectorsCauseResult',
    label: 'Connectors: Cause, Effect & Result',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.connectorsByCategory.causeResult
  },
  {
    key: 'connectorsSequence',
    label: 'Connectors: Sequence & Progression',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.connectorsByCategory.sequence
  },
  {
    key: 'connectorsExemplification',
    label: 'Connectors: Exemplification & Clarification',
    category: 'Logical Connectors & Cohesion',
    unit: 'markers',
    isCount: true,
    getValue: s => s.connectorsByCategory.exemplification
  },

  // Lexical Diversity & Sophistication
  {
    key: 'uniqueWords',
    label: 'Unique Words (Types)',
    category: 'Lexical Diversity & Sophistication',
    unit: 'types',
    isCount: true,
    getValue: s => s.uniqueWords
  },
  {
    key: 'typeTokenRatio',
    label: 'Type-Token Ratio (TTR)',
    category: 'Lexical Diversity & Sophistication',
    unit: '%',
    getValue: s => s.typeTokenRatio
  },
  {
    key: 'lexicalDensity',
    label: 'Lexical Density (Content Words)',
    category: 'Lexical Diversity & Sophistication',
    unit: '%',
    getValue: s => s.lexicalDensity
  },
  {
    key: 'polysyllabicWordCount',
    label: 'Advanced/Polysyllabic Words (Count)',
    category: 'Lexical Diversity & Sophistication',
    unit: 'words',
    isCount: true,
    getValue: s => s.polysyllabicWordCount
  },
  {
    key: 'polysyllabicWordRatio',
    label: 'Advanced Words Ratio (>=3 Syllables)',
    category: 'Lexical Diversity & Sophistication',
    unit: '%',
    getValue: s => s.polysyllabicWordRatio
  },
  {
    key: 'avgWordLength',
    label: 'Mean Word Length',
    category: 'Lexical Diversity & Sophistication',
    unit: 'characters',
    getValue: s => s.avgWordLength
  },

  // Target Wordlist Diagnostics
  {
    key: 'targetWordlistMatches',
    label: 'Target Wordlist Matches (Tokens)',
    category: 'Target Wordlist Diagnostics',
    unit: 'tokens',
    isCount: true,
    getValue: s => s.targetWordlistStats?.totalMatches ?? 0
  },
  {
    key: 'targetWordlistDensity',
    label: 'Target Wordlist Density',
    category: 'Target Wordlist Diagnostics',
    unit: '%',
    getValue: s => s.targetWordlistStats?.densityPercentage ?? 0
  },
  {
    key: 'targetWordlistTypesCovered',
    label: 'Target Wordlist Types Covered',
    category: 'Target Wordlist Diagnostics',
    unit: 'types',
    isCount: true,
    getValue: s => s.targetWordlistStats?.matchedTypesCount ?? 0
  },
  {
    key: 'targetWordlistCoverage',
    label: 'Target Wordlist Coverage Rate',
    category: 'Target Wordlist Diagnostics',
    unit: '%',
    getValue: s => s.targetWordlistStats?.coveragePercentage ?? 0
  }
];

/**
 * Calculates descriptive statistics (mean, SD, median, min, max, sum) for an array of numbers.
 */
export function calculateDescriptiveStats(values: number[]): MetricStats {
  if (!values || values.length === 0) {
    return { mean: 0, sd: 0, median: 0, min: 0, max: 0, sum: 0, count: 0 };
  }

  const count = values.length;
  const rawSum = values.reduce((a, b) => a + b, 0);
  const sum = Number(rawSum.toFixed(2));
  const mean = Number((rawSum / count).toFixed(2));

  // Sample Standard Deviation
  let sd = 0;
  if (count > 1) {
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1);
    sd = Number(Math.sqrt(variance).toFixed(2));
  }

  // Median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 
    ? Number(sorted[mid].toFixed(2)) 
    : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));

  const min = Number(Math.min(...values).toFixed(2));
  const max = Number(Math.max(...values).toFixed(2));

  return { mean, sd, median, min, max, sum, count };
}

export interface IndicatorStatResult {
  definition: IndicatorDefinition;
  stats: MetricStats;
}

export interface CorpusStatsSummary {
  fileCount: number;
  indicatorStats: IndicatorStatResult[];
  categoryStats: Record<string, IndicatorStatResult[]>;
}

/**
 * Computes descriptive statistics for all writing indicators across a corpus of analyzed files.
 */
export function computeCorpusStats(items: Array<{ filename: string; stats?: TextStats; status: string }>): CorpusStatsSummary {
  const analyzedItems = items.filter(i => i.status === 'analyzed' && i.stats);
  const fileCount = analyzedItems.length;

  const indicatorStats: IndicatorStatResult[] = INDICATOR_DEFINITIONS.map(def => {
    const values = analyzedItems.map(item => def.getValue(item.stats!));
    const stats = calculateDescriptiveStats(values);
    return {
      definition: def,
      stats
    };
  });

  const categoryStats: Record<string, IndicatorStatResult[]> = {};
  indicatorStats.forEach(item => {
    const cat = item.definition.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = [];
    }
    categoryStats[cat].push(item);
  });

  return {
    fileCount,
    indicatorStats,
    categoryStats
  };
}

/**
 * Helper to escape CSV cell contents adhering to RFC 4180 standard.
 */
function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates a clean, publication-ready Statistical Summary CSV table where rows are indicators
 * and columns are Mean, SD, Median, Min, Max, and Total Sum.
 */
export function generateStatisticsSummaryCsv(
  items: Array<{ filename: string; stats?: TextStats; status: string }>
): string {
  const analyzedItems = items.filter(i => i.status === 'analyzed' && i.stats);
  if (analyzedItems.length === 0) return '';

  const summary = computeCorpusStats(analyzedItems);

  const headers = [
    'Category',
    'Indicator Name',
    'Unit',
    'Analyzed Files (N)',
    'Mean (Average)',
    'Standard Deviation (SD)',
    'Median',
    'Minimum',
    'Maximum',
    'Total / Sum'
  ];

  const rows: string[][] = summary.indicatorStats.map(item => [
    item.definition.category,
    item.definition.label,
    item.definition.unit || '-',
    String(summary.fileCount),
    String(item.stats.mean),
    String(item.stats.sd),
    String(item.stats.median),
    String(item.stats.min),
    String(item.stats.max),
    item.definition.isCount ? String(item.stats.sum) : '-'
  ]);

  const csvLines = [
    [`"Report Title"`, `"Corpus Indicators Statistical Summary (N=${summary.fileCount} Files)"`].map(escapeCsv).join(','),
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  return csvLines.join('\r\n');
}

/**
 * Generates a comprehensive CSV containing each file's indicators PLUS summary statistics
 * (Mean, SD, Median, Min, Max, Sum) at the bottom for easy data manipulation in SPSS, R, Excel, or Stata.
 */
export function generateCorpusIndicatorsCsv(
  items: Array<{ filename: string; stats?: TextStats; status: string }>
): string {
  const analyzedItems = items.filter(i => i.status === 'analyzed' && i.stats);
  if (analyzedItems.length === 0) return '';

  const headers = ['Filename', ...INDICATOR_DEFINITIONS.map(d => `${d.label}${d.unit ? ` (${d.unit})` : ''}`)];
  const rows: string[][] = [];

  // File rows
  analyzedItems.forEach(item => {
    const row = [
      item.filename,
      ...INDICATOR_DEFINITIONS.map(d => String(d.getValue(item.stats!)))
    ];
    rows.push(row);
  });

  // Calculate stats for each indicator
  const statsSummary = computeCorpusStats(analyzedItems);

  // Separator row
  rows.push(headers.map(() => '---'));

  // Summary statistics rows
  const meanRow = ['CORPUS STATISTICS: MEAN', ...statsSummary.indicatorStats.map(s => String(s.stats.mean))];
  const sdRow = ['CORPUS STATISTICS: STANDARD DEVIATION (SD)', ...statsSummary.indicatorStats.map(s => String(s.stats.sd))];
  const medianRow = ['CORPUS STATISTICS: MEDIAN', ...statsSummary.indicatorStats.map(s => String(s.stats.median))];
  const minRow = ['CORPUS STATISTICS: MINIMUM', ...statsSummary.indicatorStats.map(s => String(s.stats.min))];
  const maxRow = ['CORPUS STATISTICS: MAXIMUM', ...statsSummary.indicatorStats.map(s => String(s.stats.max))];
  const sumRow = ['CORPUS STATISTICS: TOTAL / SUM', ...statsSummary.indicatorStats.map(s => s.definition.isCount ? String(s.stats.sum) : '-')];

  rows.push(meanRow, sdRow, medianRow, minRow, maxRow, sumRow);

  const csvLines = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  return csvLines.join('\r\n');
}

/**
 * Generates a CSV detailing target wordlist hits, presence, and contexts across all batch files.
 */
export function generateCorpusTargetWordlistCsv(
  items: Array<{ filename: string; stats?: TextStats; status: string }>
): string {
  const analyzedItems = items.filter(i => i.status === 'analyzed' && i.stats && i.stats.targetWordlistStats);
  if (analyzedItems.length === 0) return '';

  const headers = [
    'Filename',
    'Target Word',
    'Status',
    'Occurrences (Count)',
    'Density (% of File)',
    'Matched Token Forms',
    'Sample Sentence Context'
  ];

  const rows: string[][] = [];

  analyzedItems.forEach(item => {
    const tStats = item.stats!.targetWordlistStats!;
    tStats.matches.forEach(m => {
      rows.push([
        item.filename,
        m.word,
        'PRESENT',
        String(m.count),
        `${m.density}%`,
        m.matchedTokens.join(', '),
        m.sampleSentences[0] || ''
      ]);
    });

    tStats.unmatchedWords.forEach(uw => {
      rows.push([
        item.filename,
        uw,
        'ABSENT',
        '0',
        '0%',
        '-',
        '-'
      ]);
    });
  });

  const csvLines = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  return csvLines.join('\r\n');
}

/**
 * Generates a clean, well-formatted CSV for a single text's indicators and target wordlist statistics.
 */
export function generateSingleTextCsv(filename: string, stats: TextStats): string {
  const headers = ['Category', 'Indicator Name', 'Unit', 'Measured Value'];
  const rows: string[][] = INDICATOR_DEFINITIONS.map(d => [
    d.category,
    d.label,
    d.unit || '-',
    String(d.getValue(stats))
  ]);

  // Target wordlist section if applicable
  if (stats.targetWordlistStats) {
    rows.push(['---', '---', '---', '---']);
    rows.push(['Target Wordlist Diagnostic', 'Total Target Words in List', 'words', String(stats.targetWordlistStats.targetWordCount)]);
    rows.push(['Target Wordlist Diagnostic', 'Total Matches Found', 'tokens', String(stats.targetWordlistStats.totalMatches)]);
    rows.push(['Target Wordlist Diagnostic', 'List Density in Text', '%', `${stats.targetWordlistStats.densityPercentage}%`]);
    rows.push(['Target Wordlist Diagnostic', 'Unique Target Types Covered', 'types', String(stats.targetWordlistStats.matchedTypesCount)]);
    rows.push(['Target Wordlist Diagnostic', 'Wordlist Coverage Rate', '%', `${stats.targetWordlistStats.coveragePercentage}%`]);

    rows.push(['---', '---', '---', '---']);
    rows.push(['Target Word Breakdown', 'Target Word', 'Status', 'Count & Matched Tokens']);
    stats.targetWordlistStats.matches.forEach(m => {
      rows.push(['Target Word Breakdown', m.word, 'MATCHED', `${m.count} hit(s): [${m.matchedTokens.join(', ')}]`]);
    });
    stats.targetWordlistStats.unmatchedWords.forEach(uw => {
      rows.push(['Target Word Breakdown', uw, 'UNMATCHED', '0 hit(s)']);
    });
  }

  const csvLines = [
    [`"Report Title"`, `"Learner Writing Indicators & Statistics: ${filename || 'Pasted Essay'}"`].join(','),
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ];

  return csvLines.join('\r\n');
}

/**
 * Initiates download of a CSV file in the browser with UTF-8 BOM encoding for complete Excel/R/SPSS compatibility.
 */
export function downloadCsv(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
