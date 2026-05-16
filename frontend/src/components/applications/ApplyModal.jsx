import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textareaCls = "w-full px-3 py-2.5 bg-surface-container-low dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-vertical leading-relaxed";

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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-xl p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-semibold text-[20px] text-text-primary dark:text-inverse-on-surface">Apply for {job.title}</h2>
            <p className="text-body-sm text-text-secondary dark:text-text-muted mt-1">{job.company}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors text-[22px] leading-none ml-4 flex-shrink-0">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">
              Cover Letter <span className="normal-case text-[11px] text-text-muted font-normal tracking-normal">(optional)</span>
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
            <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">
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

          {error && <p className="text-body-sm text-error">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-border-default dark:border-outline-variant text-text-primary dark:text-inverse-on-surface text-body-sm font-medium rounded-lg hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-primary-container text-white text-body-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
