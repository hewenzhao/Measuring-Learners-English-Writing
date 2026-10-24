import nlp from 'compromise';
import { TargetWordlistAnalysis, evaluateWordlist } from './wordlist';

export const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

export type ConnectorCategoryKey = 'contrast' | 'addition' | 'causeResult' | 'sequence' | 'exemplification';

export interface DetectedConnector {
  text: string;
  category: ConnectorCategoryKey;
  categoryLabel: string;
  count: number;
}

export interface SentenceDistribution {
  short: number; // < 10 words
  medium: number; // 10-25 words
  long: number; // > 25 words
  shortPct: number;
  mediumPct: number;
  longPct: number;
}

export const CONNECTOR_CATEGORIES: Array<{
  key: ConnectorCategoryKey;
  label: string;
  color: string;
  phrases: string[];
}> = [
  {
    key: 'contrast',
    label: 'Contrast & Concession',
    color: 'rose',
    phrases: [
      'on the other hand',
      'in contrast',
      'by contrast',
      'on the contrary',
      'even though',
      'in spite of',
      'even if',
      'however',
      'nevertheless',
      'nonetheless',
      'conversely',
      'instead',
      'although',
      'whereas',
      'despite'
    ]
  },
  {
    key: 'addition',
    label: 'Addition & Elaboration',
    color: 'blue',
    phrases: [
      'in addition',
      'as well as',
      'not only',
      'what is more',
      'furthermore',
      'moreover',
      'additionally',
      'besides',
      'also'
    ]
  },
  {
    key: 'causeResult',
    label: 'Cause & Effect',
    color: 'amber',
    phrases: [
      'as a result',
      'for this reason',
      'because of',
      'due to',
      'owing to',
      'so that',
      'in order to',
      'therefore',
      'consequently',
      'thus',
      'hence',
      'accordingly'
    ]
  },
  {
    key: 'sequence',
    label: 'Sequence & Transition',
    color: 'emerald',
    phrases: [
      'to begin with',
      'in conclusion',
      'to sum up',
      'to summarize',
      'in summary',
      'first of all',
      'firstly',
      'secondly',
      'thirdly',
      'finally',
      'subsequently',
      'meanwhile',
      'afterwards',
      'thereafter'
    ]
  },
  {
    key: 'exemplification',
    label: 'Exemplification & Clarification',
    color: 'purple',
    phrases: [
      'for example',
      'for instance',
      'in other words',
      'that is to say',
      'to illustrate',
      'specifically',
      'namely',
      'such as'
    ]
  }
];

export interface TextStats {
  // basic counts
  totalWords: number;
  totalSentences: number;
  
  // sentence length stats
  avgSentenceLength: number;
  maxSentenceLength: number;
  minSentenceLength: number;
  medianSentenceLength: number;
  sentenceLengthStdDev: number; // Variety / variability indicator
  sentenceDistribution: SentenceDistribution;
  
  // lexical complexity
  uniqueWords: number;
  typeTokenRatio: number;
  avgWordLength: number;
  lexicalDensity: number; // percentage of content vs grammatical wrapper words
  polysyllabicWordCount: number; // Words with >=3 syllables
  polysyllabicWordRatio: number; // % of total words (lexical sophistication)
  
  // syntactic complexity (proxy)
  clausesPerSentence: number; 
  coordinateClausesCount: number;
  subordinateClausesCount: number;
  subordinationRatio: number; // Subordinate clauses / sentence
  coordinationRatio: number; // Coordinate clauses / sentence
  complexSentencesCount: number; // Sentences containing subordinate clause or multiple clauses
  complexSentencesRatio: number; // % of sentences
  passiveVoiceCount: number;
  passiveVoiceRatio: number;
  
  coordinateClauses: string[];
  subordinateClauses: string[];
  clauses: string[];

  // Learner logical connectors & discourse markers
  logicalConnectorsCount: number;
  logicalConnectorsDensity: number; // per 100 words
  connectorsByCategory: Record<ConnectorCategoryKey, number>;
  detectedConnectors: DetectedConnector[];
  
  // Target wordlist diagnostics & marking
  targetWordlistStats?: TargetWordlistAnalysis;

  wordFrequencies: Array<{ word: string; count: number }>;
  rankedSentences: Array<{ text: string; length: number }>;
}

export interface AnalyzeOptions {
  filterStopwords?: boolean;
  targetWordlist?: string[];
}

function countSyllables(word: string): number {
  const clean = word.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean || clean.length <= 3) return 1;
  const processed = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = processed.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function extractLogicalConnectors(rawText: string) {
  const matchesMap: Record<string, DetectedConnector> = {};
  const categoryCounts: Record<ConnectorCategoryKey, number> = {
    contrast: 0,
    addition: 0,
    causeResult: 0,
    sequence: 0,
    exemplification: 0
  };

  const allPhrases: Array<{ phrase: string; key: ConnectorCategoryKey; label: string }> = [];
  CONNECTOR_CATEGORIES.forEach(cat => {
    cat.phrases.forEach(phrase => {
      allPhrases.push({ phrase, key: cat.key, label: cat.label });
    });
  });
  allPhrases.sort((a, b) => b.phrase.length - a.phrase.length);

  let textToScan = rawText;
  allPhrases.forEach(({ phrase, key, label }) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = textToScan.match(regex);
    if (matches && matches.length > 0) {
      const lower = phrase.toLowerCase();
      if (!matchesMap[lower]) {
        matchesMap[lower] = {
          text: lower,
          category: key,
          categoryLabel: label,
          count: 0
        };
      }
      matchesMap[lower].count += matches.length;
      categoryCounts[key] += matches.length;

      // Blank out matched string to avoid partial overlap with shorter words
      textToScan = textToScan.replace(regex, ' '.repeat(phrase.length));
    }
  });

  const detectedConnectors = Object.values(matchesMap).sort((a, b) => b.count - a.count);
  const totalConnectors = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return {
    totalConnectors,
    categoryCounts,
    detectedConnectors
  };
}

export function analyzeText(text: string, options: AnalyzeOptions = {}): TextStats {
  if (!text.trim()) {
    return {
      totalWords: 0,
      totalSentences: 0,
      avgSentenceLength: 0,
      maxSentenceLength: 0,
      minSentenceLength: 0,
      medianSentenceLength: 0,
      sentenceLengthStdDev: 0,
      sentenceDistribution: {
        short: 0,
        medium: 0,
        long: 0,
        shortPct: 0,
        mediumPct: 0,
        longPct: 0
      },
      uniqueWords: 0,
      typeTokenRatio: 0,
      avgWordLength: 0,
      lexicalDensity: 0,
      polysyllabicWordCount: 0,
      polysyllabicWordRatio: 0,
      clausesPerSentence: 0,
      coordinateClausesCount: 0,
      subordinateClausesCount: 0,
      subordinationRatio: 0,
      coordinationRatio: 0,
      complexSentencesCount: 0,
      complexSentencesRatio: 0,
      passiveVoiceCount: 0,
      passiveVoiceRatio: 0,
      coordinateClauses: [],
      subordinateClauses: [],
      clauses: [],
      logicalConnectorsCount: 0,
      logicalConnectorsDensity: 0,
      connectorsByCategory: {
        contrast: 0,
        addition: 0,
        causeResult: 0,
        sequence: 0,
        exemplification: 0
      },
      detectedConnectors: [],
      targetWordlistStats: options.targetWordlist && options.targetWordlist.length > 0 
        ? evaluateWordlist('', options.targetWordlist, 0, []) 
        : undefined,
      wordFrequencies: [],
      rankedSentences: [],
    };
  }

  const doc = nlp(text);
  
  // Get sentences
  const sentencesRaw = doc.sentences().out('array') as string[];
  // Fallback to basic split if compromise fails to find any sentences but there is text
  const validSentences = sentencesRaw.length > 0 ? sentencesRaw : [text.trim()];
  const totalSentences = validSentences.length;

  // Use compromise text tokenization
  const tags = doc.terms().out('tags') as Array<Record<string, string[]>>;
  
  // Extract clean words
  let contentWordCount = 0;
  let wordLengthsSum = 0;
  
  const allWordsUnfiltered: string[] = [];
  
  for (let i = 0; i < tags.length; i++) {
    const item = tags[i];
    const wordKey = Object.keys(item)[0];
    const termTags = item[wordKey] || [];
    
    // Compromise keys in out('tags') are the lowercased clean words
    if (!wordKey) continue;
    // skip purely punctuation or whitespace tokens if any leaked
    if (!/[a-z0-9]/i.test(wordKey)) continue;

    allWordsUnfiltered.push(wordKey);
    wordLengthsSum += wordKey.length;

    // Check if lexical (Noun, Verb, Adjective, Adverb)
    if (termTags.some(t => ['Noun', 'Verb', 'Adjective', 'Adverb'].includes(t))) {
      contentWordCount++;
    }
  }

  // Count clauses
  const clauses = doc.clauses().out('array') as string[];
  const clausesPerSentence = totalSentences > 0 ? clauses.length / totalSentences : 0;

  // Use heuristic matching for Coordinate and Subordinate clauses
  const coordMatch = doc.match('(and|but|for|or|nor|so|yet) (#Noun|#Pronoun|#Determiner)+ #Adverb? #Verb');
  const coordinateClauses = coordMatch.out('array') as string[];
  const coordinateClausesCount = coordinateClauses.length;

  const subordMatch = doc.match('(after|although|as|because|before|even if|even though|if|in order that|once|provided that|rather than|since|so that|than|that|though|unless|until|when|whenever|where|whereas|wherever|whether|while|why) (#Noun|#Pronoun|#Determiner)+ #Adverb? #Verb');
  const subordinateClauses = subordMatch.out('array') as string[];
  const subordinateClausesCount = subordinateClauses.length;

  let totalWords = allWordsUnfiltered.length;
  // Fallback if NLP missed words for some weird reason
  if (totalWords === 0 && text.trim().length > 0) {
     const splitWords = text.toLowerCase().match(/[a-z0-9'-]+/g) || [];
     allWordsUnfiltered.push(...splitWords);
     for (const w of splitWords) {
       wordLengthsSum += w.length;
     }
     totalWords = allWordsUnfiltered.length;
  }

  const avgWordLength = totalWords > 0 ? wordLengthsSum / totalWords : 0;
  const lexicalDensity = totalWords > 0 ? (contentWordCount / totalWords) * 100 : 0;

  // Sentences processing for min, max, avg
  const wordRegex = /[a-zA-Z0-9'-]+/g;
  const sentenceLengths = validSentences.map(s => {
    const docSentence = nlp(s);
    // filter to actual words
    const sTags = docSentence.terms().out('tags') as Array<Record<string, string[]>>;
    let wordCount = 0;
    for (const item of sTags) {
      if (/[a-z0-9]/i.test(Object.keys(item)[0])) wordCount++;
    }
    // Fallback if compromise yields 0
    if (wordCount === 0) {
      const match = s.match(wordRegex);
      wordCount = match ? match.length : 0;
    }
    return { text: s, length: wordCount };
  }).filter(l => l.length > 0);

  let avgSentenceLength = 0;
  let maxSentenceLength = 0;
  let minSentenceLength = 0;
  let medianSentenceLength = 0;
  let varianceSum = 0;
  let shortSentences = 0;
  let mediumSentences = 0;
  let longSentences = 0;

  if (sentenceLengths.length > 0) {
    const sumLengths = sentenceLengths.reduce((sum, item) => sum + item.length, 0);
    avgSentenceLength = sumLengths / sentenceLengths.length;
    maxSentenceLength = Math.max(...sentenceLengths.map(l => l.length));
    minSentenceLength = Math.min(...sentenceLengths.map(l => l.length));
    
    const sortedLengths = sentenceLengths.map(s => s.length).sort((a, b) => a - b);
    const mid = Math.floor(sortedLengths.length / 2);
    if (sortedLengths.length % 2 === 0) {
      medianSentenceLength = (sortedLengths[mid - 1] + sortedLengths[mid]) / 2;
    } else {
      medianSentenceLength = sortedLengths[mid];
    }

    sentenceLengths.forEach(s => {
      if (s.length < 10) shortSentences++;
      else if (s.length <= 25) mediumSentences++;
      else longSentences++;
      varianceSum += Math.pow(s.length - avgSentenceLength, 2);
    });
  }

  const totalSCount = sentenceLengths.length || 1;
  const sentenceLengthStdDev = sentenceLengths.length > 0 ? Number(Math.sqrt(varianceSum / sentenceLengths.length).toFixed(1)) : 0;
  const sentenceDistribution: SentenceDistribution = {
    short: shortSentences,
    medium: mediumSentences,
    long: longSentences,
    shortPct: Number(((shortSentences / totalSCount) * 100).toFixed(1)),
    mediumPct: Number(((mediumSentences / totalSCount) * 100).toFixed(1)),
    longPct: Number(((longSentences / totalSCount) * 100).toFixed(1)),
  };

  // Complex sentences calculation: sentences with subordinate markers or >= 2 clauses
  const subordConjunctionsRegex = /\b(after|although|as|because|before|even if|even though|if|in order that|once|provided that|rather than|since|so that|than|that|though|unless|until|when|whenever|where|whereas|wherever|whether|while|why)\b/i;
  let complexSentencesCount = 0;
  validSentences.forEach(s => {
    const sDoc = nlp(s);
    const sClauses = sDoc.clauses().out('array') as string[];
    if (subordConjunctionsRegex.test(s) || sClauses.length >= 2) {
      complexSentencesCount++;
    }
  });
  const complexSentencesRatio = totalSentences > 0 ? Number(((complexSentencesCount / totalSentences) * 100).toFixed(1)) : 0;

  // Subordination & Coordination ratios per sentence
  const subordinationRatio = totalSentences > 0 ? Number((subordinateClausesCount / totalSentences).toFixed(2)) : 0;
  const coordinationRatio = totalSentences > 0 ? Number((coordinateClausesCount / totalSentences).toFixed(2)) : 0;

  // Passive voice count
  const passiveMatches = doc.match('(am|is|are|was|were|been|being|be) #Adverb? #Adverb? #Participle');
  const passiveVoiceCount = passiveMatches.length;
  const passiveVoiceRatio = totalSentences > 0 ? Number((passiveVoiceCount / totalSentences).toFixed(2)) : 0;

  // Polysyllabic words (>= 3 syllables - academic/advanced vocabulary indicator)
  let polysyllabicWordCount = 0;
  for (const word of allWordsUnfiltered) {
    if (countSyllables(word) >= 3) {
      polysyllabicWordCount++;
    }
  }
  const polysyllabicWordRatio = totalWords > 0 ? Number(((polysyllabicWordCount / totalWords) * 100).toFixed(2)) : 0;

  // Logical connectors extraction
  const { totalConnectors, categoryCounts, detectedConnectors } = extractLogicalConnectors(text);
  const logicalConnectorsDensity = totalWords > 0 ? Number(((totalConnectors / totalWords) * 100).toFixed(2)) : 0;

  const rankedSentences = [...sentenceLengths].sort((a, b) => b.length - a.length);

  // Frequency mapping with optional stopword filtering
  let frequencyWords = allWordsUnfiltered;
  if (options.filterStopwords) {
    frequencyWords = allWordsUnfiltered.filter(w => !STOPWORDS.has(w));
  }

  const wordCounts: Record<string, number> = {};
  for (const word of frequencyWords) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }
  
  const uniqueWords = Object.keys(wordCounts).length;
  
  const totalWordsForTtr = frequencyWords.length;
  const typeTokenRatio = totalWordsForTtr > 0 ? (uniqueWords / totalWordsForTtr) * 100 : 0;

  const wordFrequencies = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)); 

  // Target wordlist evaluation if provided
  let targetWordlistStats: TargetWordlistAnalysis | undefined;
  if (options.targetWordlist && options.targetWordlist.length > 0) {
    targetWordlistStats = evaluateWordlist(text, options.targetWordlist, totalWords, validSentences);
  }

  return {
    totalWords: totalWordsForTtr, 
    totalSentences,
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
    maxSentenceLength,
    minSentenceLength,
    medianSentenceLength: Number(medianSentenceLength.toFixed(1)),
    sentenceLengthStdDev,
    sentenceDistribution,
    uniqueWords,
    typeTokenRatio: Number(typeTokenRatio.toFixed(2)),
    avgWordLength: Number(avgWordLength.toFixed(2)),
    lexicalDensity: Number(lexicalDensity.toFixed(2)),
    polysyllabicWordCount,
    polysyllabicWordRatio,
    clausesPerSentence: Number(clausesPerSentence.toFixed(2)),
    coordinateClausesCount,
    subordinateClausesCount,
    subordinationRatio,
    coordinationRatio,
    complexSentencesCount,
    complexSentencesRatio,
    passiveVoiceCount,
    passiveVoiceRatio,
    coordinateClauses,
    subordinateClauses,
    clauses,
    logicalConnectorsCount: totalConnectors,
    logicalConnectorsDensity,
    connectorsByCategory: categoryCounts,
    detectedConnectors,
    targetWordlistStats,
    wordFrequencies,
    rankedSentences,
  };
}

export function prependSentenceLengths(text: string): string {
  if (!text.trim()) return text;

  // Let compromise parse sentences elegantly
  const doc = nlp(text);
  const sentencesRaw = (doc.json() as any[]);
  
  if (!sentencesRaw || sentencesRaw.length === 0) return text;

  let result = '';
  // compromise json() output can give text and pre/post whitespace roughly,
  // but it's simpler to string match. Using regex approach mixed with strict counts.

  let offset = 0;
  for (const s of sentencesRaw) {
    const docSentence = nlp(s.text);
    const sTags = docSentence.terms().out('tags') as Array<Record<string, string[]>>;
    let termCount = 0;
    for (const item of sTags) {
      if (/[a-z0-9]/i.test(Object.keys(item)[0])) termCount++;
    }

    const startIdx = text.indexOf(s.text, offset);
    if (startIdx !== -1) {
       const preamble = text.substring(offset, startIdx);
       const insertion = `[${termCount}] `;
       result += preamble + insertion + s.text;
       offset = startIdx + s.text.length;
    }
  }
  
  // add remainder
  result += text.substring(offset);

  return result;
}
