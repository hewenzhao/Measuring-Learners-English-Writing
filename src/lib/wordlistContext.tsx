import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { DEFAULT_WORDLIST, WORDLIST_PRESETS, parseWordlistInput } from './wordlist';

interface WordlistContextType {
  wordlist: string[];
  rawInput: string;
  setRawInput: (raw: string) => void;
  saveWordlist: (words: string[]) => void;
  loadPreset: (presetId: string) => void;
  clearWordlist: () => void;
  activePresetId: string | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'measuring_learners_target_wordlist';
const STORAGE_RAW_KEY = 'measuring_learners_target_wordlist_raw';

const WordlistContext = createContext<WordlistContextType | undefined>(undefined);

export function WordlistProvider({ children }: { children: ReactNode }) {
  const [wordlist, setWordlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_WORDLIST;
  });

  const [rawInput, setRawInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RAW_KEY);
      if (saved) return saved;
    } catch (e) {
      // fallback
    }
    return DEFAULT_WORDLIST.join(', ');
  });

  const [activePresetId, setActivePresetId] = useState<string | null>('awl-core');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wordlist));
      localStorage.setItem(STORAGE_RAW_KEY, rawInput);
    } catch (e) {
      // ignore
    }
  }, [wordlist, rawInput]);

  const saveWordlist = (words: string[]) => {
    const clean = words.map(w => w.trim().toLowerCase()).filter(Boolean);
    const unique = Array.from(new Set(clean));
    setWordlist(unique);
    setRawInput(unique.join(', '));
    
    // Check if matches a preset
    const matchedPreset = WORDLIST_PRESETS.find(
      p => p.words.length === unique.length && p.words.every(w => unique.includes(w))
    );
    setActivePresetId(matchedPreset ? matchedPreset.id : null);
  };

  const loadPreset = (presetId: string) => {
    const preset = WORDLIST_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setWordlist(preset.words);
    setRawInput(preset.words.join(', '));
    setActivePresetId(preset.id);
  };

  const clearWordlist = () => {
    setWordlist([]);
    setRawInput('');
    setActivePresetId(null);
  };

  return (
    <WordlistContext.Provider
      value={{
        wordlist,
        rawInput,
        setRawInput,
        saveWordlist,
        loadPreset,
        clearWordlist,
        activePresetId,
        isModalOpen,
        setIsModalOpen
      }}
    >
      {children}
    </WordlistContext.Provider>
  );
}

export function useWordlist() {
  const context = useContext(WordlistContext);
  if (!context) {
    throw new Error('useWordlist must be used within a WordlistProvider');
  }
  return context;
}
