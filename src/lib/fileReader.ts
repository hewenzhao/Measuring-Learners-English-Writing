import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded file (.txt, .docx, or fallback).
 * Automatically handles UTF-8 as well as fallback encodings like GBK / Windows-1252.
 * Returns the extracted plain text string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (extension === '.docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  }

  // Handle plain text files (.txt, .md, .csv, etc.)
  try {
    const text = await file.text();
    // If text contains replacement characters (\uFFFD), attempt alternative decoding
    if (text.includes('\uFFFD')) {
      const buffer = await file.arrayBuffer();
      try {
        const gbkDecoder = new TextDecoder('gbk', { fatal: true });
        return gbkDecoder.decode(buffer);
      } catch {
        try {
          const latinDecoder = new TextDecoder('windows-1252');
          return latinDecoder.decode(buffer);
        } catch {
          return text;
        }
      }
    }
    return text;
  } catch {
    // Fallback using FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}

export interface ExtractedFileResult {
  file: File;
  name: string;
  content: string;
  error?: string;
}

/**
 * Extracts text from multiple files concurrently.
 */
export async function extractMultipleFiles(files: FileList | File[]): Promise<ExtractedFileResult[]> {
  const list = Array.from(files);
  const results = await Promise.all(
    list.map(async (file) => {
      try {
        const content = await extractTextFromFile(file);
        return { file, name: file.name, content };
      } catch (err) {
        return {
          file,
          name: file.name,
          content: '',
          error: err instanceof Error ? err.message : 'Failed to extract text'
        };
      }
    })
  );
  return results;
}

/**
 * Check if a file extension is supported (.txt or .docx).
 */
export function isSupportedTextFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith('.txt') || lower.endsWith('.docx');
}
