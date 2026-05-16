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
import { SURFACE, LABEL } from '../../lib/design';

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
      <div style={{ ...SURFACE, padding: compact ? '16px 20px' : '20px 24px', borderTop: '2px solid #00C2A8' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#00C2A8', fontSize: 18 }}>✓</span>
              <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: 14 }}>Resume parsed</span>
              <span style={{
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(0,194,168,0.12)', border: '1px solid rgba(0,194,168,0.30)',
                color: '#00C2A8', fontFamily: '"JetBrains Mono"', fontSize: 10, fontWeight: 600,
              }}>{profile.skills.length} skills found</span>
            </div>
            {profile.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {profile.skills.slice(0, 12).map((s) => (
                  <span key={s} style={{
                    padding: '2px 8px', borderRadius: 999,
                    background: '#161D2E', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94A3B8', fontFamily: '"JetBrains Mono"', fontSize: 10,
                  }}>{s}</span>
                ))}
                {profile.skills.length > 12 && (
                  <span style={{ color: '#4F8EF7', fontSize: 11, fontFamily: '"JetBrains Mono"' }}>
                    +{profile.skills.length - 12} more
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={handleRemove} style={{
            background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer',
            fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0,
          }} title="Remove resume">×</button>
        </div>
      </div>
    );
  }

  // ── Upload state ───────────────────────────────────────────
  return (
    <div
      onClick={() => state !== 'uploading' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        ...SURFACE,
        padding: compact ? '16px 20px' : '24px',
        borderStyle: 'dashed',
        borderColor: drag ? '#4F8EF7' : state === 'error' ? '#E05252' : 'rgba(255,255,255,0.14)',
        borderWidth: 2,
        borderRadius: 12,
        cursor: state === 'uploading' ? 'wait' : 'pointer',
        textAlign: 'center',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: drag ? '0 0 0 1px rgba(79,142,247,0.25)' : 'none',
        background: drag ? 'rgba(79,142,247,0.05)' : '#0F1520',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {state === 'uploading' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{
            width: 20, height: 20,
            border: '2px solid rgba(255,255,255,0.10)',
            borderTopColor: '#4F8EF7',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ color: '#94A3B8', fontSize: 14 }}>Parsing resume…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          <div style={{ fontSize: compact ? 24 : 32, marginBottom: 8 }}>📄</div>
          <div style={{ color: '#F0F4FF', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            {drag ? 'Drop your resume' : 'Upload your resume'}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 12 }}>
            PDF only · max 5 MB · drag & drop or click
          </div>
          {state === 'error' && (
            <div style={{ color: '#E05252', fontSize: 12, marginTop: 8 }}>{error}</div>
          )}
        </>
      )}
    </div>
  );
}
