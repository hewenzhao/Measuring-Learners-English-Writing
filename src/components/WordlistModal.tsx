import { useState, useRef, type ChangeEvent } from 'react';
import { useWordlist } from '../lib/wordlistContext';
import { WORDLIST_PRESETS, parseWordlistInput } from '../lib/wordlist';
import { extractTextFromFile } from '../lib/fileReader';
import { X, Upload, BookmarkCheck, Sparkles, Trash2, Check, FileText } from 'lucide-react';

export function WordlistModal() {
  const { 
    wordlist, 
    rawInput, 
    saveWordlist, 
    loadPreset, 
    clearWordlist, 
    activePresetId,
    isModalOpen, 
    setIsModalOpen 
  } = useWordlist();

  const [inputVal, setInputVal] = useState(rawInput);
  const [filterQuery, setFilterQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isModalOpen) return null;

  const currentParsed = parseWordlistInput(inputVal);

  const handleApply = () => {
    saveWordlist(currentParsed);
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await extractTextFromFile(file);
      const parsed = parseWordlistInput(content);
      setInputVal(parsed.join(', '));
    } catch (err) {
      console.error('Failed to extract text from wordlist file:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = WORDLIST_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setInputVal(preset.words.join(', '));
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    const updated = currentParsed.filter(w => w !== wordToRemove);
    setInputVal(updated.join(', '));
  };

  const displayedChips = filterQuery.trim()
    ? currentParsed.filter(w => w.includes(filterQuery.toLowerCase().trim()))
    : currentParsed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <BookmarkCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">Target Wordlist Manager</h2>
              <p className="text-xs text-gray-500">Provide vocabulary to automatically mark in texts and include in exported reports</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Curated Academic Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {WORDLIST_PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id && currentParsed.length === preset.words.length;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isActive 
                        ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-500/20 text-blue-900 font-medium' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{preset.name}</span>
                      <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-1.5 py-0.5 rounded">
                        {preset.words.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea Input & File Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Custom Wordlist (Paste or Edit)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Upload className="h-3.5 w-3.5" />
                  Import from .docx / .txt / .csv
                  <input 
                    type="file" 
                    accept=".docx,.txt,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv" 
                    ref={fileInputRef}
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
                {inputVal.trim() && (
                  <button
                    type="button"
                    onClick={() => setInputVal('')}
                    className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter target words separated by commas, spaces, or line breaks (e.g., analyze, approach, assess, concept, establish, research)..."
              rows={4}
              className="w-full text-sm p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 resize-none font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Supports single words, inflection stems, and multi-word phrases (e.g. "in order to", "climate change").
            </p>
          </div>

          {/* Parsed Words Summary & Preview Chips */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Active Words in Target List</span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {currentParsed.length}
                </span>
              </div>
              {currentParsed.length > 8 && (
                <input
                  type="text"
                  placeholder="Filter preview..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>

            {currentParsed.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">
                No words in list. Choose a preset above or type words into the text box.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {displayedChips.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-md shadow-2xs group hover:border-gray-300"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(word)}
                      className="text-gray-400 hover:text-red-500 ml-0.5"
                      title={`Remove "${word}"`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {displayedChips.length === 0 && filterQuery && (
                  <span className="text-xs text-gray-400 italic">No words match "{filterQuery}".</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {currentParsed.length} target {currentParsed.length === 1 ? 'word' : 'words'} ready
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Apply Target Wordlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
