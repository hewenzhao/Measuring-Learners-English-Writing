import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded file (.txt, .docx, or fallback).
 * Returns the extracted plain text string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (extension === '.docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  }

  // Default to text reader for .txt, .csv, and other plain text formats
  return await file.text();
}

/**
 * Check if a file extension is supported (.txt or .docx).
 */
export function isSupportedTextFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith('.txt') || lower.endsWith('.docx');
}
