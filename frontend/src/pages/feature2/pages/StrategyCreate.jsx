import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildStrategyDetailsPath } from '../../config/routes';
import { createStrategyReport } from '../services/feature2Service';
import '../styles/feature2.css';

const StrategyCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    target_market: '',
    objective: '',
    timeline: '6 months',
    budget_range: '10,000 - 50,000 USD',
    challenges: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.company_name.trim() || !formData.objective.trim() || !formData.industry.trim()) {
      setError('Company name, industry, and objective are required.');
      return;
    }

    setLoading(true);
    try {
      const report = await createStrategyReport(formData);
      navigate(buildStrategyDetailsPath(report.id), { state: { report } });
    } catch (err) {
      setError(err.message || 'Could not generate strategy report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-section generate-page">
      <div className="container feature2-narrow">
        <section className="generate-header">
          <h1>Generate AI Strategy</h1>
          <p>Fill in your business details - our AI will craft a personalised strategy.</p>
        </section>

        <section className="card generate-card">
          {error ? <p className="form-alert">{error}</p> : null}
          <form onSubmit={handleSubmit} noValidate>
            <div className="generate-section">
              <h2>Business Information</h2>
              <label className="form-label" htmlFor="company_name">Business Name</label>
              <input
                id="company_name"
                name="company_name"
                className="input"
                placeholder="e.g. NovaMart Solutions"
                value={formData.company_name}
                onChange={handleChange}
              />

              <div className="generate-grid">
                <div>
                  <label className="form-label" htmlFor="industry">Industry</label>
                  <select id="industry" name="industry" className="input" value={formData.industry} onChange={handleChange}>
                    <option value="">Select your industry</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="budget_range">Annual Budget</label>
                  <select id="budget_range" name="budget_range" className="input" value={formData.budget_range} onChange={handleChange}>
                    <option value="10,000 - 50,000 USD">10,000 - 50,000 USD</option>
                    <option value="50,000 - 250,000 USD">50,000 - 250,000 USD</option>
                    <option value="250,000+ USD">250,000+ USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="generate-section">
              <h2>Market & Objectives</h2>
              <label className="form-label" htmlFor="target_market">Target Market</label>
              <input
                id="target_market"
                name="target_market"
                className="input"
                placeholder="e.g. SMB owners aged 30-50"
                value={formData.target_market}
                onChange={handleChange}
              />

              <label className="form-label" htmlFor="objective">Primary Objective</label>
              <input
                id="objective"
                name="objective"
                className="input"
                placeholder="e.g. Increase revenue by 30% in 6 months"
                value={formData.objective}
                onChange={handleChange}
              />

              <div className="generate-grid">
                <div>
                  <label className="form-label" htmlFor="timeline">Timeline</label>
                  <input id="timeline" name="timeline" className="input" value={formData.timeline} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label" htmlFor="challenges">Main Challenges</label>
                  <input id="challenges" name="challenges" className="input" value={formData.challenges} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-generate-submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Strategy'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default StrategyCreate;
