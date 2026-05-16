import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="page-section">
      <div className="container">
        <section className="card not-found-card">
          <h1>Page not found</h1>
          <p>The page you requested does not exist or has moved.</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </section>
      </div>
    </main>
  );
};

export default NotFound;

