const DashboardSkeleton = () => {
  return (
    <main className="page-section dashboard-page">
      <div className="container dashboard-skeleton" aria-live="polite" aria-busy="true">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-subtitle" />

        <section className="dashboard-metrics">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="card metric-card skeleton-card">
              <div className="skeleton-line skeleton-icon" />
              <div className="skeleton-line skeleton-value" />
              <div className="skeleton-line skeleton-text" />
            </article>
          ))}
        </section>

        <article className="card skeleton-banner" />
        <article className="card skeleton-list" />
      </div>
    </main>
  );
};

export default DashboardSkeleton;
