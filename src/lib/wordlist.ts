// Target wordlist management and analysis helpers for English learner writing

export interface TargetWordlistMatch {
  word: string; // the target word (base/lemma)
  matchedTokens: string[]; // actual tokens matched in text (e.g. ['analyzed', 'analyzing'])
  count: number;
  density: number; // occurrences per 100 words or percentage of total words
  sampleSentences: string[];
}

export interface TargetWordlistAnalysis {
  targetWordCount: number; // total unique target words provided
  totalMatches: number; // total token hits
  matchedTypesCount: number; // unique target words matched
  coveragePercentage: number; // (matchedTypesCount / targetWordCount) * 100
  densityPercentage: number; // (totalMatches / totalWords) * 100
  matches: TargetWordlistMatch[]; // matched target words, sorted by count desc
  unmatchedWords: string[]; // target words not appearing in text
}

export interface MarkedTextSegment {
  text: string;
  isMarked: boolean;
  targetWord?: string;
}

// Preset wordlists curated for EFL/ESL and academic writing diagnostics
export interface WordlistPreset {
  id: string;
  name: string;
  description: string;
  words: string[];
}

export const WORDLIST_PRESETS: WordlistPreset[] = [
  {
    id: 'awl-core',
    name: 'Academic Word List (AWL Core)',
    description: 'Averil Coxhead’s foundational academic vocabulary essential for formal essays and research papers.',
    words: [
      'analyze', 'approach', 'area', 'assess', 'assume', 'authority', 'available', 'benefit', 
      'concept', 'consist', 'constitute', 'context', 'contract', 'create', 'data', 'define', 
      'derive', 'distribute', 'economy', 'environment', 'establish', 'estimate', 'evident', 
      'factor', 'finance', 'formula', 'function', 'identify', 'income', 'indicate', 'individual', 
      'interpret', 'involve', 'issue', 'labor', 'legal', 'legislate', 'major', 'method', 
      'occur', 'percent', 'period', 'policy', 'principle', 'proceed', 'process', 'require', 
      'research', 'respond', 'role', 'section', 'sector', 'significant', 'similar', 'source', 
      'specific', 'structure', 'theory', 'vary'
    ]
  },
  {
    id: 'academic-discourse',
    name: 'Academic Discourse & Transitions',
    description: 'High-level rhetorical markers and connectors for argumentative writing and debate.',
    words: [
      'furthermore', 'moreover', 'nevertheless', 'nonetheless', 'consequently', 'therefore', 
      'accordingly', 'conversely', 'notwithstanding', 'subsequently', 'predominantly', 
      'inherently', 'imperative', 'ubiquitous', 'substantiate', 'elucidate', 'articulate', 
      'comprehend', 'unprecedented', 'paramount', 'synthesize'
    ]
  },
  {
    id: 'critical-verbs',
    name: 'Critical & Analytical Verbs',
    description: 'Action verbs for synthesizing sources, presenting claims, and critiquing evidence.',
    words: [
      'advocate', 'assert', 'clarify', 'corroborate', 'critique', 'delineate', 'demonstrate', 
      'disclose', 'emphasize', 'examine', 'exemplify', 'illustrate', 'imply', 'incorporate', 
      'indicate', 'juxtapose', 'postulate', 'reiterate', 'scrutinize', 'signify', 'substantiate', 
      'undermine', 'validate'
    ]
  }
];

export const DEFAULT_WORDLIST = WORDLIST_PRESETS[0].words;

/**
 * Parses raw text input into a clean, deduplicated array of lowercase target words and phrases.
 */
export function parseWordlistInput(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  
  // Split on newlines, commas, semicolons, tabs, and pipes
  const tokens = raw
    .split(/[\r\n,;|\t]+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0 && /[a-z0-9]/i.test(w));

  const unique = Array.from(new Set(tokens));
  return unique;
}

/**
 * Escapes regex special characters in a word or phrase.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex pattern that matches the word or common inflections (-s, -es, -ed, -ing, -d).
 * For multi-word phrases, matches the exact phrase.
 */
function buildWordMatcher(target: string): RegExp {
  const trimmed = target.trim();
  const escaped = escapeRegex(trimmed);

  // If multi-word phrase
  if (/\s+/.test(trimmed)) {
    return new RegExp(`\\b${escaped}\\b`, 'gi');
  }

  // If ends in 'e', handle 'ing' (e.g. create -> creating, created, creates)
  if (trimmed.endsWith('e') && trimmed.length > 3) {
    const root = escapeRegex(trimmed.slice(0, -1));
    return new RegExp(`\\b(?:${escaped}(?:s|d)?|${root}ing)\\b`, 'gi');
  }

  // If ends in 'y' preceded by consonant (e.g. vary -> varies, varied, varying)
  if (/[^aeiou]y$/i.test(trimmed) && trimmed.length > 3) {
    const root = escapeRegex(trimmed.slice(0, -1));
    return new RegExp(`\\b(?:${escaped}(?:ing)?|${root}(?:ies|ied))\\b`, 'gi');
  }

  // Standard regular inflections
  return new RegExp(`\\b${escaped}(?:s|es|ed|ing|d)?\\b`, 'gi');
}

/**
 * Analyzes target wordlist matches in the provided text.
 */
export function evaluateWordlist(
  text: string, 
  targetWords: string[], 
  totalWords: number,
  sentences: string[] = []
): TargetWordlistAnalysis {
  const cleanTargets = targetWords.map(w => w.trim().toLowerCase()).filter(Boolean);

  if (!cleanTargets.length || !text.trim()) {
    return {
      targetWordCount: cleanTargets.length,
      totalMatches: 0,
      matchedTypesCount: 0,
      coveragePercentage: 0,
      densityPercentage: 0,
      matches: [],
      unmatchedWords: [...cleanTargets]
    };
  }

  const matches: TargetWordlistMatch[] = [];
  const unmatchedWords: string[] = [];
  let totalMatchesCount = 0;

  for (const target of cleanTargets) {
    const regex = buildWordMatcher(target);
    const foundTokens = text.match(regex);

    if (foundTokens && foundTokens.length > 0) {
      totalMatchesCount += foundTokens.length;
      
      // Find sample sentences containing this target word
      const sampleSentences: string[] = [];
      for (const s of sentences) {
        if (regex.test(s)) {
          sampleSentences.push(s.trim());
          if (sampleSentences.length >= 3) break;
        }
      }

      const density = totalWords > 0 
        ? Number(((foundTokens.length / totalWords) * 100).toFixed(2)) 
        : 0;

      matches.push({
        word: target,
        matchedTokens: Array.from(new Set(foundTokens.map(t => t.toLowerCase()))),
        count: foundTokens.length,
        density,
        sampleSentences
      });
    } else {
      unmatchedWords.push(target);
    }
  }

  // Sort matches by count descending, then alphabetically
  matches.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const matchedTypesCount = matches.length;
  const coveragePercentage = cleanTargets.length > 0 
    ? Number(((matchedTypesCount / cleanTargets.length) * 100).toFixed(1)) 
    : 0;
  const densityPercentage = totalWords > 0 
    ? Number(((totalMatchesCount / totalWords) * 100).toFixed(2)) 
    : 0;

  return {
    targetWordCount: cleanTargets.length,
    totalMatches: totalMatchesCount,
    matchedTypesCount,
    coveragePercentage,
    densityPercentage,
    matches,
    unmatchedWords
  };
}

/**
 * Splits the source text into marked and unmarked segments for visual highlighting in the UI.
 */
export function markTextWithWordlist(
  text: string, 
  targetWords: string[]
): MarkedTextSegment[] {
  const cleanTargets = targetWords.map(w => w.trim().toLowerCase()).filter(Boolean);
  if (!cleanTargets.length || !text) {
    return [{ text, isMarked: false }];
  }

  // Sort targets longest first so multi-word phrases match before individual words
  const sortedTargets = [...cleanTargets].sort((a, b) => b.length - a.length);

  // Build combined patterns
  // Map regex to target base word
  const matchers = sortedTargets.map(target => ({
    target,
    regex: buildWordMatcher(target)
  }));

  // Find all match intervals [start, end, targetWord]
  interface Interval {
    start: number;
    end: number;
    targetWord: string;
  }
  const intervals: Interval[] = [];

  for (const { target, regex } of matchers) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      
      // Ensure no overlapping interval already recorded
      const overlaps = intervals.some(inv => 
        (start >= inv.start && start < inv.end) || 
        (end > inv.start && end <= inv.end)
      );

      if (!overlaps) {
        intervals.push({ start, end, targetWord: target });
      }
    }
  }

  // Sort intervals by start index
  intervals.sort((a, b) => a.start - b.start);

  if (intervals.length === 0) {
    return [{ text, isMarked: false }];
  }

  const segments: MarkedTextSegment[] = [];
  let currentIndex = 0;

  for (const inv of intervals) {
    if (inv.start > currentIndex) {
      segments.push({
        text: text.slice(currentIndex, inv.start),
        isMarked: false
      });
    }

    segments.push({
      text: text.slice(inv.start, inv.end),
      isMarked: true,
      targetWord: inv.targetWord
    });

    currentIndex = inv.end;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
      isMarked: false
    });
  }

  return segments;
}
