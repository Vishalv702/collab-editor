import { useState, useCallback } from 'react';
import { aiService } from '../services/api';

/**
 * useAI — all AI feature state and handlers
 * Exposes: summarize, improveSelected, fixGrammar, and their loading/error state
 */
const useAI = (quillRef) => {
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const clearError  = useCallback(() => setError(null), []);
  const closeSummary = useCallback(() => { setShowSummary(false); setSummary(null); }, []);

  const getDocumentText = useCallback(() =>
    quillRef.current?.getText().trim() || '', [quillRef]);

  const getSelection = useCallback(() => {
    if (!quillRef.current) return { text: '', range: null };
    const range = quillRef.current.getSelection();
    if (!range || range.length === 0) return { text: '', range: null };
    return { text: quillRef.current.getText(range.index, range.length), range };
  }, [quillRef]);

  const summarize = useCallback(async () => {
    const text = getDocumentText();
    if (text.length < 20) { setError('Add more content before summarizing.'); return; }
    setLoading(true); setError(null);
    try {
      const { summary } = await aiService.summarize(text);
      setSummary(summary);
      setShowSummary(true);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }, [getDocumentText]);

  const improveSelected = useCallback(async () => {
    const { text, range } = getSelection();
    if (!text) { setError('Select some text first.'); return; }
    setLoading(true); setError(null);
    try {
      const { improved } = await aiService.improve(text);
      quillRef.current.deleteText(range.index, range.length);
      quillRef.current.insertText(range.index, improved);
      quillRef.current.setSelection(range.index, improved.length);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }, [getSelection, quillRef]);

  const fixGrammar = useCallback(async () => {
    const { text, range } = getSelection();
    if (!text) { setError('Select some text first.'); return; }
    setLoading(true); setError(null);
    try {
      const { corrected } = await aiService.fixGrammar(text);
      quillRef.current.deleteText(range.index, range.length);
      quillRef.current.insertText(range.index, corrected);
      quillRef.current.setSelection(range.index, corrected.length);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }, [getSelection, quillRef]);

  return {
    loading, error, summary, showSummary,
    summarize, improveSelected, fixGrammar,
    clearError, closeSummary,
  };
};

export default useAI;
