import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean'],
];

/**
 * QuillEditor
 * Wraps Quill.js and exposes the Quill instance via forwarded ref.
 * Also renders colored remote-cursor overlays for each collaborator.
 */
const QuillEditor = forwardRef(({ remoteCursors = {}, readOnly = false }, ref) => {
  const containerRef = useRef(null);
  const quillRef     = useRef(null);

  // Expose the Quill instance to parent via ref
  useImperativeHandle(ref, () => quillRef.current);

  // Initialize Quill once
  useEffect(() => {
    if (quillRef.current) return;
    const container = containerRef.current;
    const editorDiv = document.createElement('div');
    container.appendChild(editorDiv);

    quillRef.current = new Quill(editorDiv, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR },
      placeholder: 'Start writing — collaborators see every keystroke in real time…',
    });

    if (readOnly) quillRef.current.disable();

    return () => {
      quillRef.current = null;
      container.innerHTML = '';
    };
  }, [readOnly]);

  // Paint remote cursor overlays whenever positions change
  useEffect(() => {
    document.querySelectorAll('.remote-cursor').forEach(el => el.remove());
    if (!quillRef.current) return;

    Object.entries(remoteCursors).forEach(([socketId, { name, color, range }]) => {
      if (!range) return;
      try {
        const bounds   = quillRef.current.getBounds(range.index);
        if (!bounds) return;
        const editorEl = containerRef.current?.querySelector('.ql-editor');
        if (!editorEl) return;

        const parent = editorEl.parentElement;
        parent.style.position = 'relative';

        // Cursor caret line
        const caret = document.createElement('div');
        caret.className = 'remote-cursor';
        caret.dataset.id = socketId;
        caret.style.cssText = `
          position:absolute;
          left:${bounds.left}px;
          top:${bounds.top}px;
          height:${bounds.height}px;
          width:2px;
          background:${color};
          pointer-events:none;
          z-index:10;
        `;

        // Name badge above caret
        const badge = document.createElement('span');
        badge.textContent = name;
        badge.style.cssText = `
          position:absolute;top:-20px;left:0;
          background:${color};color:#fff;
          font-size:10px;font-family:'Outfit',sans-serif;font-weight:500;
          padding:2px 6px;border-radius:4px;
          white-space:nowrap;pointer-events:none;
        `;
        caret.appendChild(badge);
        parent.appendChild(caret);
      } catch { /* bounds can fail on rapid unmount */ }
    });
  }, [remoteCursors]);

  return <div ref={containerRef} className="quill-container" />;
});

QuillEditor.displayName = 'QuillEditor';
export default QuillEditor;
