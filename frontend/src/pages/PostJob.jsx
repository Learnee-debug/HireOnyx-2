import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SURFACE, LABEL, BTN_PRIMARY } from '../lib/design';
import toast from 'react-hot-toast';

const INPUT_STYLE = {
  width: '100%', padding: '11px 13px', borderRadius: 10,
  background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)',
  color: '#F0F4FF', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color 0.15s ease',
};

function Field({ label, required, children }) {
  return (
    <div>
      <div style={{ ...LABEL, marginBottom: 8 }}>{label}{required && <span style={{ color: '#4F8EF7' }}> *</span>}</div>
      {children}
    </div>
  );
}

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({ title: '', company: '', location: '', type: 'Full-time', description: '', requirements: '', salary_min: '', salary_max: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));
  const focus = e => e.target.style.borderColor = '#4F8EF7';
  const blur = e => e.target.style.borderColor = 'rgba(255,255,255,0.10)';

  function addSkill() {
    const t = skillInput.trim().replace(/,+$/, '');
    if (t && !skills.includes(t)) setSkills(s => [...s, t]);
    setSkillInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('jobs').insert({
      title: fields.title, company: fields.company, location: fields.location,
      type: fields.type.toLowerCase().replace(' ', '-'),
      description: fields.description, requirements: fields.requirements,
      skills_required: skills,
      salary_min: fields.salary_min ? parseInt(fields.salary_min) : null,
      salary_max: fields.salary_max ? parseInt(fields.salary_max) : null,
      recruiter_id: user.id, is_active: true,
    });
    setLoading(false);
    if (error) { toast.error('Failed to post job.'); return; }
    toast.success('Role published!');
    navigate('/recruiter/dashboard');
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px', position: 'relative' }} className="pj-root">
      <style>{`
        @media(max-width:900px){.pj-root{padding:24px 16px!important}}
        @media(max-width:640px){
          .pj-form{padding:20px!important}
          .pj-grid{grid-template-columns:1fr!important}
          .pj-salary-grid{grid-template-columns:1fr 1fr!important}
          .pj-actions{flex-direction:column!important;align-items:stretch!important}
          .pj-actions a,.pj-actions button{text-align:center;justify-content:center}
        }
      `}</style>
      <div style={{ position: 'absolute', top: -100, right: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ ...LABEL, color: '#4F8EF7', marginBottom: 8 }}>Recruiter</div>
      <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F4FF', margin: '0 0 8px' }}>Post a new role</h1>
      <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>
        Roles are reviewed within 24 hours and matched to candidates by skill score.
      </p>

      <form onSubmit={handleSubmit} style={{ ...SURFACE, padding: 32, maxWidth: 860 }} className="pj-form">
        <div className="pj-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Full width: title */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Role title" required>
              <input value={fields.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Frontend Engineer" required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          <Field label="Company" required>
            <input value={fields.company} onChange={e => set('company', e.target.value)} placeholder="HireOnyx Inc." required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
          </Field>
          <Field label="Location" required>
            <input value={fields.location} onChange={e => set('location', e.target.value)} placeholder="Remote, Bangalore" required style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
          </Field>

          <Field label="Type">
            <select value={fields.type} onChange={e => set('type', e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
              {['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <div className="pj-salary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Salary min (₹/mo)">
              <input type="number" value={fields.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="40000" style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
            </Field>
            <Field label="Salary max (₹/mo)">
              <input type="number" value={fields.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="70000" style={INPUT_STYLE} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Description" required>
              <textarea value={fields.description} onChange={e => set('description', e.target.value)} rows={6} placeholder="What does success look like in this role?" required style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.7 }} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Requirements" required>
              <textarea value={fields.requirements} onChange={e => set('requirements', e.target.value)} rows={4} placeholder="Skills, experience, and qualifications needed..." required style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.7 }} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          {/* Skills tag input */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Required skills (press Enter to add)">
              <div style={{ background: '#161D2E', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.30)', color: '#4F8EF7', fontFamily: '"JetBrains Mono"', fontSize: 12 }}>
                    {s}
                    <button type="button" onClick={() => setSkills(s2 => s2.filter(x => x !== s))} style={{ background: 'none', border: 'none', color: '#4F8EF7', cursor: 'pointer', lineHeight: 1, padding: 0, fontSize: 14 }}>×</button>
                  </span>
                ))}
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }}
                  onBlur={addSkill}
                  placeholder={skills.length === 0 ? 'TypeScript, React, Node.js…' : ''}
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#F0F4FF', fontSize: 13, fontFamily: 'inherit', flex: '1 1 120px', minWidth: 80, padding: '2px 4px' }}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div className="pj-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/recruiter/dashboard" style={{ padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', color: '#F0F4FF', fontSize: 14, fontWeight: 500 }}>Cancel</Link>
          <button type="submit" disabled={loading} style={{ ...BTN_PRIMARY, padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            + {loading ? 'Publishing…' : 'Publish role'}
          </button>
        </div>
      </form>
    </div>
  );
}
