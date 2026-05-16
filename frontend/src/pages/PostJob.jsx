import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-data-label text-text-muted uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full h-input-height px-3 bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";
const textareaCls = "w-full px-3 py-2 bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg text-body-base text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors resize-vertical leading-relaxed";

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    title: '', company: '', location: '', type: 'full-time',
    description: '', requirements: '', salary_min: '', salary_max: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  function addSkill() {
    const t = skillInput.trim().replace(/,+$/, '');
    if (t && !skills.includes(t)) setSkills(s => [...s, t]);
    setSkillInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('jobs').insert({
      title: fields.title,
      company: fields.company,
      location: fields.location,
      type: fields.type,
      description: fields.description,
      requirements: fields.requirements,
      skills_required: skills,
      salary_min: fields.salary_min ? parseInt(fields.salary_min) : null,
      salary_max: fields.salary_max ? parseInt(fields.salary_max) : null,
      recruiter_id: user.id,
      is_active: true,
    });
    setLoading(false);
    if (error) { toast.error('Failed to post job.'); return; }
    toast.success('Role published!');
    navigate('/recruiter/dashboard');
  }

  return (
    <div className="max-w-[720px] mx-auto px-margin-page py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-bold text-[28px] text-text-primary dark:text-inverse-on-surface mb-2">Post a new role</h1>
        <p className="text-body-base text-text-secondary dark:text-text-muted">
          Roles are reviewed within 24 hours and matched to candidates by skill score.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Role title — full width */}
        <Field label="Role title" required>
          <input
            value={fields.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            required
            className={inputCls}
          />
        </Field>

        {/* Company + Location — 2 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company" required>
            <input
              value={fields.company}
              onChange={e => set('company', e.target.value)}
              placeholder="HireOnyx Inc."
              required
              className={inputCls}
            />
          </Field>
          <Field label="Location" required>
            <input
              value={fields.location}
              onChange={e => set('location', e.target.value)}
              placeholder="Remote, Bangalore"
              required
              className={inputCls}
            />
          </Field>
        </div>

        {/* Type + Salary — 2 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employment type">
            <select
              value={fields.type}
              onChange={e => set('type', e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary min (₹/mo)">
              <input
                type="number"
                value={fields.salary_min}
                onChange={e => set('salary_min', e.target.value)}
                placeholder="40000"
                className={inputCls}
              />
            </Field>
            <Field label="Salary max (₹/mo)">
              <input
                type="number"
                value={fields.salary_max}
                onChange={e => set('salary_max', e.target.value)}
                placeholder="70000"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-default dark:bg-outline-variant"></div>

        {/* Description */}
        <Field label="Job description" required>
          <textarea
            value={fields.description}
            onChange={e => set('description', e.target.value)}
            rows={6}
            placeholder="What does success look like in this role? Include day-to-day responsibilities..."
            required
            className={textareaCls}
          />
        </Field>

        {/* Requirements */}
        <Field label="Requirements" required>
          <textarea
            value={fields.requirements}
            onChange={e => set('requirements', e.target.value)}
            rows={4}
            placeholder="Skills, experience, and qualifications needed..."
            required
            className={textareaCls}
          />
        </Field>

        {/* Skills tag input */}
        <Field label="Required skills" hint="Press Enter or comma to add a skill tag">
          <div className="min-h-input-height px-3 py-2 bg-surface-card dark:bg-surface-container border border-border-default dark:border-outline-variant rounded-lg flex flex-wrap gap-2 focus-within:border-primary transition-colors">
            {skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-light text-primary border border-primary/20 rounded-full font-mono text-[12px]">
                {s}
                <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}
                  className="text-primary/60 hover:text-primary leading-none">
                  &times;
                </button>
              </span>
            ))}
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? 'TypeScript, React, Node.js…' : ''}
              className="bg-transparent border-none outline-none text-body-sm text-text-primary dark:text-inverse-on-surface placeholder:text-text-muted flex-1 min-w-[120px]"
            />
          </div>
        </Field>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-default dark:border-outline-variant">
          <Link to="/recruiter/dashboard"
            className="text-body-sm text-text-secondary dark:text-text-muted hover:text-primary transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-white text-button-text font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60">
            <span className="material-symbols-outlined text-[16px]">publish</span>
            {loading ? 'Publishing…' : 'Publish Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
