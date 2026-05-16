import { useState } from 'react';
import '../styles/feature2.css';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="page-section">
      <div className="container feature2-narrow">
        <section className="card">
          <h1>Contact StrategAI</h1>
          <p>Talk to product specialists about onboarding, pricing, and implementation support.</p>
          {submitted ? <p className="feature2-success">Thank you. Your message has been captured.</p> : null}
          <form onSubmit={handleSubmit} noValidate>
            <label className="form-label" htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" className="input" value={formData.name} onChange={handleChange} />

            <label className="form-label" htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" className="input" value={formData.email} onChange={handleChange} />

            <label className="form-label" htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" className="input" value={formData.company} onChange={handleChange} />

            <label className="form-label" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              className="input feature2-textarea"
              value={formData.message}
              onChange={handleChange}
            />

            <button type="submit" className="btn-primary">Send Message</button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Contact;
