import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bath, Building2, CircleHelp, Clock3, Droplets, FlaskConical, Presentation, School, ShieldCheck, Wifi } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { categories, getErrorMessage } from '../services/api';
import { rememberComplaintId } from '../services/recentComplaints';
import { useNotify } from '../components/NotificationProvider';

const initialForm = { studentName: '', department: '', category: '', description: '' };
const categoryIcons = {
  Classroom: School,
  Projector: Presentation,
  'Wi-Fi': Wifi,
  'Drinking Water': Droplets,
  'Laboratory Equipment': FlaskConical,
  Washroom: Bath,
  'Hostel Maintenance': Building2,
  Others: CircleHelp,
};

function validateForm(form) {
  const errors = {};
  if (form.studentName.trim().length < 2) errors.studentName = 'Enter your name (at least 2 characters).';
  if (form.department.trim().length < 2) errors.department = 'Enter your department (at least 2 characters).';
  if (!categories.includes(form.category)) errors.category = 'Choose the category that best matches your issue.';
  if (form.description.trim().length < 10) errors.description = 'Please add a little more detail (at least 10 characters).';
  return errors;
}

export default function ComplaintSubmission() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();
  const errors = validateForm(form);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setForm(initialForm);
    setTouched({});
    setAttempted(false);
  }

  async function submitComplaint(event) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/complaints', {
        studentName: form.studentName.trim(),
        department: form.department.trim(),
        category: form.category,
        description: form.description.trim(),
      });
      const complaintId = data.complaint.complaintId;
      const savedLocally = rememberComplaintId(complaintId);
      notify(
        savedLocally
          ? `Complaint ${complaintId} submitted. Opening the admin dashboard.`
          : `Complaint ${complaintId} submitted. Opening the admin dashboard. Save this ID to track your report.`,
        savedLocally ? 'success' : 'error'
      );
      resetForm();
      navigate('/admin');
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name) {
    return (attempted || touched[name]) ? errors[name] : '';
  }

  return (
    <div className="submission-page page-container">
      <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to student home</Link>
      <div className="submission-layout">
        <aside className="submission-intro">
          <span className="eyebrow"><span className="eyebrow__dot" /> LET US KNOW</span>
          <h1>Let’s make<br />campus <span>better.</span></h1>
          <p>Your report goes straight to the campus team best placed to help. We’ll keep you informed as it moves forward.</p>
          <div className="submission-assurance"><span><span className="assurance-check"><ShieldCheck size={16} /></span><span><strong>Private by design</strong><small>Your details are only available to administrators.</small></span></span></div>
          <div className="submission-assurance"><span><span className="assurance-check"><Clock3 size={16} /></span><span><strong>Updates you can follow</strong><small>Use your complaint ID to check progress anytime.</small></span></span></div>
          <div className="submission-intro__help">Already submitted a report? <Link to="/track">Track it here <ArrowRight size={14} /></Link></div>
        </aside>

        <form className="complaint-form" onSubmit={submitComplaint} noValidate>
          <div className="form-heading">
            <div><span className="section-index">COMPLAINT FORM</span><h2>Tell us what happened</h2><p>Fields marked <b>*</b> are required.</p></div>
            <span className="form-step"><span>01</span><i /> 01</span>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Your name <b>*</b></span>
              <input
                name="studentName"
                value={form.studentName}
                onChange={updateField}
                onBlur={() => setTouched((current) => ({ ...current, studentName: true }))}
                required minLength="2" maxLength="100" autoComplete="name" placeholder="e.g. Alex Morgan"
                aria-invalid={Boolean(fieldError('studentName'))}
                aria-describedby={fieldError('studentName') ? 'name-error' : undefined}
              />
              {fieldError('studentName') && <small className="field-error" id="name-error">{fieldError('studentName')}</small>}
            </label>
            <label className="field">
              <span>Department <b>*</b></span>
              <input
                name="department"
                list="campus-departments"
                value={form.department}
                onChange={updateField}
                onBlur={() => setTouched((current) => ({ ...current, department: true }))}
                required minLength="2" maxLength="100" placeholder="Select or enter a department"
                aria-invalid={Boolean(fieldError('department'))}
                aria-describedby={fieldError('department') ? 'department-error' : 'department-hint'}
              />
              <datalist id="campus-departments">
                <option value="Computer Science" /><option value="Information Technology" />
                <option value="Electrical Engineering" /><option value="Mechanical Engineering" />
              </datalist>
              <small className="field__hint" id="department-hint">Choose a suggestion or enter your own.</small>
              {fieldError('department') && <small className="field-error" id="department-error">{fieldError('department')}</small>}
            </label>
            <fieldset className={`category-field field--full${fieldError('category') ? ' category-field--invalid' : ''}`} aria-describedby={fieldError('category') ? 'category-error' : undefined}>
              <legend>What needs attention? <b>*</b></legend>
              <div className="category-grid">
                {categories.map((category) => {
                  const Icon = categoryIcons[category];
                  return (
                    <button
                      className={`category-option${form.category === category ? ' category-option--selected' : ''}`}
                      type="button"
                      key={category}
                      aria-pressed={form.category === category}
                      onClick={() => setForm((current) => ({ ...current, category }))}
                    >
                      <Icon size={18} strokeWidth={1.8} /><span>{category}</span>
                    </button>
                  );
                })}
              </div>
              {fieldError('category') && <small className="field-error" id="category-error">{fieldError('category')}</small>}
            </fieldset>
            <label className="field field--full">
              <span>Describe the issue <b>*</b></span>
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                onBlur={() => setTouched((current) => ({ ...current, description: true }))}
                required minLength="10" maxLength="3000" rows="5"
                placeholder="What happened? Where did it happen? Include anything that could help the team resolve it."
                aria-invalid={Boolean(fieldError('description'))}
                aria-describedby={fieldError('description') ? 'description-error description-count' : 'description-count'}
              />
              <span className="field__meta">
                {fieldError('description') && <small className="field-error" id="description-error">{fieldError('description')}</small>}
                <small className="field__hint" id="description-count">{form.description.length}/3000</small>
              </span>
            </label>
          </div>
          <footer className="form-actions">
            <button type="button" className="button button--text" onClick={resetForm} disabled={submitting}>Reset form</button>
            <button className="button button--primary button--large" type="submit" disabled={submitting}>
              {submitting ? <><span className="spinner spinner--light" />Submitting…</> : <>Submit complaint <ArrowRight size={17} /></>}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
