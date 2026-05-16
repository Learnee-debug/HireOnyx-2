import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textareaCls = "w-full px-3 py-2.5 bg-surface-container-low border border-border-default rounded-lg text-body-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all resize-none leading-relaxed";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!resumeText.trim()) { setError('Resume text is required.'); return; }
    setError('');
    setLoading(true);

    const { data, error: err } = await supabase.from('applications').insert({
      job_id: job.id,
      seeker_id: user.id,
      cover_letter: coverLetter,
      resume_text: resumeText,
      status: 'applied',
    }).select().single();

    setLoading(false);

    if (err) {
      if (err.code === '23505') {
        setError("You've already applied to this job.");
      } else {
        setError('Failed to submit. Please try again.');
      }
      return;
    }

    onSuccess(data);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4 py-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-surface-card border border-border-default rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="font-semibold text-[20px] text-text-primary">Apply for {job.title}</h2>
            <p className="text-body-sm text-text-secondary mt-1">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors ml-4 flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="h-px bg-border-default mx-6 mt-5" />

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1.5">
              Cover Letter <span className="normal-case text-[11px] font-normal tracking-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit..."
              className={textareaCls}
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-1.5">
              Your Resume <span className="text-primary">*</span>
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here..."
              className={`${textareaCls} font-mono text-[13px]`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-error-container/20 border border-error/20 rounded-lg text-body-sm text-error">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-default">
            <button type="button" onClick={onClose}
              className="h-10 px-5 border border-border-default text-text-primary font-medium text-[14px] rounded-lg hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="h-10 px-5 bg-primary-container text-white font-semibold text-[14px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
