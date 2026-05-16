/**
 * ResumeUpload.jsx
 * ----------------
 * Drag-and-drop / click PDF upload component.
 * After upload, shows parsed skills + skill count.
 * Stores profile in localStorage via aiMatchingApi helpers.
 *
 * Props:
 *   onParsed(profile) — called with the structured profile after parse
 *   compact           — smaller inline variant (for dashboard)
 */

import { useState, useRef } from 'react';
import { parseResume, saveProfile, clearProfile } from '../../lib/aiMatchingApi';

export default function ResumeUpload({ onParsed, compact = false }) {
  const [state, setState] = useState('idle'); // idle | uploading | done | error
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.'); setState('error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5 MB.'); setState('error'); return;
    }

    setState('uploading');
    setError('');
    try {
      const parsed = await parseResume(file);
      saveProfile(parsed);
      setProfile(parsed);
      setState('done');
      onParsed?.(parsed);
    } catch (err) {
      setError(err.message || 'Failed to parse resume.');
      setState('error');
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleRemove() {
    clearProfile();
    setProfile(null);
    setState('idle');
    setError('');
    onParsed?.(null);
  }

  // ── Done state ─────────────────────────────────────────────
  if (state === 'done' && profile) {
    return (
      <div className="bg-score-high-bg border border-green-100 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-score-high-text text-[18px]">check_circle</span>
              <span className="text-score-high-text font-semibold text-body-base">Resume parsed</span>
              <span className="px-2 py-0.5 bg-score-high-bg border border-green-100 text-score-high-text font-mono text-[10px] font-semibold rounded-full">
                {profile.skills.length} skills found
              </span>
            </div>
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 12).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-surface-container-low border border-border-default text-text-secondary font-mono text-[11px] rounded-full">
                    {s}
                  </span>
                ))}
                {profile.skills.length > 12 && (
                  <span className="text-primary font-mono text-[11px]">+{profile.skills.length - 12} more</span>
                )}
              </div>
            )}
          </div>
          <button onClick={handleRemove}
            className="text-text-muted hover:text-text-primary transition-colors text-[20px] leading-none p-1 flex-shrink-0"
            title="Remove resume">&times;</button>
        </div>
      </div>
    );
  }

  // ── Upload / idle state ────────────────────────────────────
  return (
    <div
      onClick={() => state !== 'uploading' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed transition-all cursor-pointer text-center select-none
        ${drag ? 'border-primary bg-accent-light/40' : state === 'error' ? 'border-error/40 bg-error/5' : 'border-border-default hover:border-primary/50 bg-surface-card dark:bg-surface-container'}
        ${compact ? 'p-4' : 'p-6'}`}
      style={{ cursor: state === 'uploading' ? 'wait' : 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {state === 'uploading' ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-border-default border-t-primary rounded-full animate-spin"></div>
          <span className="text-body-sm text-text-secondary dark:text-text-muted">Parsing resume…</span>
        </div>
      ) : (
        <>
          <span className="material-symbols-outlined text-[32px] text-text-muted block mb-2">description</span>
          <div className="text-body-base font-medium text-text-primary dark:text-inverse-on-surface mb-1">
            {drag ? 'Drop your resume' : 'Upload your resume'}
          </div>
          <div className="text-body-sm text-text-secondary dark:text-text-muted">
            PDF only · max 5 MB · drag & drop or click
          </div>
          {state === 'error' && (
            <div className="text-error text-body-sm mt-2">{error}</div>
          )}
        </>
      )}
    </div>
  );
}
