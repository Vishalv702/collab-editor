import React from 'react';

const Dots = () => (
  <span className="ai-dots"><span/><span/><span/></span>
);

/**
 * AIPanel
 * Sidebar panel with three AI actions + summary modal + error toast.
 */
const AIPanel = ({
  loading, error, summary, showSummary,
  onSummarize, onImprove, onFixGrammar,
  onCloseSummary, onClearError,
}) => (
  <div className="ai-panel">
    <div className="ai-panel__head">
      <span className="ai-panel__star">✦</span>
      <span className="ai-panel__label">AI Assistant</span>
    </div>

    <div className="ai-panel__btns">
      <button className="ai-btn" onClick={onSummarize} disabled={loading}>
        {loading ? <Dots /> : '◈'} Summarize doc
      </button>
      <button className="ai-btn" onClick={onImprove} disabled={loading}>
        {loading ? <Dots /> : '◇'} Improve selection
      </button>
      <button className="ai-btn" onClick={onFixGrammar} disabled={loading}>
        {loading ? <Dots /> : '◻'} Fix grammar
      </button>
    </div>

    <p className="ai-panel__hint">Select text first for Improve & Grammar</p>

    {error && (
      <div className="ai-error">
        <span>{error}</span>
        <button onClick={onClearError}>✕</button>
      </div>
    )}

    {showSummary && summary && (
      <div className="ai-overlay" onClick={onCloseSummary}>
        <div className="ai-modal" onClick={e => e.stopPropagation()}>
          <div className="ai-modal__head">
            <h3>Document Summary</h3>
            <button onClick={onCloseSummary}>✕</button>
          </div>
          <p>{summary}</p>
        </div>
      </div>
    )}
  </div>
);

export default AIPanel;
