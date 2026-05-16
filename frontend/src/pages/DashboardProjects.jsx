import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InlineAlert from '../components/InlineAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import PageMotion from '../components/PageMotion';
import api from '../services/api';
import './feature2/styles/credits.css';

const normalizeProject = (project) => ({
  ...project,
  type: project.type || project.business_type || 'Business',
  country: project.country || project.market || 'Local market',
  reports: project.reports ?? project.reports_count ?? 0,
  lastDate: project.lastDate || project.updated_at?.slice(0, 10) || project.created_at?.slice(0, 10) || 'No date',
});

const getProgress = (reports) => Math.min((Number(reports || 0) / 5) * 100, 100);

const getStatus = (reports) => {
  if (reports >= 4) return 'Active';
  if (reports >= 2) return 'In Progress';
  return 'New';
};

const DashboardProjects = () => {
  const [projects, setProjects] = useState([]);
  const [projectRatings, setProjectRatings] = useState({});
  const [savingRatingProjectId, setSavingRatingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name-asc');

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      setLoading(true);
      setError('');

      try {
        const [projectsResponse, reviewsResponse] = await Promise.all([
          api.get('/projects'),
          api.get('/reviews/my'),
        ]);
        const data = projectsResponse?.data || [];
        const ratingsMap = (reviewsResponse?.data?.reviews || []).reduce((acc, review) => {
          acc[Number(review.project_id)] = Number(review.rating);
          return acc;
        }, {});
        if (isMounted) {
          setProjects(data.map(normalizeProject));
          setProjectRatings(ratingsMap);
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError?.message || 'Failed to load projects.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const rows = projects.filter((project) => project.name?.toLowerCase().includes(search.toLowerCase()));

    return [...rows].sort((a, b) => {
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      if (sort === 'reports-desc') return Number(b.reports || 0) - Number(a.reports || 0);
      if (sort === 'reports-asc') return Number(a.reports || 0) - Number(b.reports || 0);
      return a.name.localeCompare(b.name);
    });
  }, [projects, search, sort]);

  const saveProjectRating = async (project, rating) => {
    if (!project?.id || !rating) return;
    const projectId = Number(project.id);
    const previousRating = projectRatings[projectId];
    setProjectRatings((prev) => ({ ...prev, [projectId]: rating }));
    setSavingRatingProjectId(projectId);

    try {
      await api.post('/reviews', {
        project_id: projectId,
        rating,
        text: `Rated ${project.name} with ${rating} stars.`,
      });
    } catch (requestError) {
      setProjectRatings((prev) => ({ ...prev, [projectId]: previousRating }));
      setError(requestError?.response?.data?.message || 'Could not save rating.');
    } finally {
      setSavingRatingProjectId(null);
    }
  };

  return (
    <PageMotion>
      <main className="page-section credits-page dashboard-projects-page">
        <div className="container credits-container">
          <section className="credits-section-head dashboard-projects-head">
            <div>
              <h2>Projects</h2>
              <p>All your projects with reports and latest activity</p>
            </div>
            <Link to="/projects/new" className="btn-primary">+ New Project</Link>
          </section>

          <InlineAlert type="error" message={error} />

          <section className="card dashboard-projects-toolbar">
            <input
              type="text"
              className="input"
              placeholder="Search projects by name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="name-asc">Sort: Name A-Z</option>
              <option value="name-desc">Sort: Name Z-A</option>
              <option value="reports-desc">Sort: Reports High-Low</option>
              <option value="reports-asc">Sort: Reports Low-High</option>
            </select>
            <button type="button" className="btn-secondary" onClick={() => { setSearch(''); setSort('name-asc'); }}>
              Clear
            </button>
          </section>

          {loading ? (
            <section className="card">
              <LoadingSpinner label="Loading projects" />
            </section>
          ) : filteredProjects.length === 0 ? (
            <section className="card empty-state">
              <h3>No projects found</h3>
              <p>Try another keyword or create a new project.</p>
              <Link to="/projects/new" className="btn-primary">Create Project</Link>
            </section>
          ) : (
            <section className="dashboard-projects-grid">
              {filteredProjects.map((project) => {
                const progress = getProgress(project.reports);

                return (
                  <article key={project.id} className="card dashboard-project-card">
                    <div className="dashboard-project-card-top">
                      <span className="dashboard-project-icon">P</span>
                      <span className="status-pill">{getStatus(project.reports)}</span>
                    </div>
                    <h3>{project.name}</h3>
                    <p className="dashboard-project-type">{project.type}</p>
                    <dl>
                      <div><dt>Reports</dt><dd>{project.reports}</dd></div>
                      <div><dt>Last Date</dt><dd>{project.lastDate}</dd></div>
                      <div><dt>Country</dt><dd>{project.country}</dd></div>
                    </dl>
                    <div className="dashboard-project-progress">
                      <div>
                        <span>Project progress</span>
                        <strong>{Math.round(progress)}%</strong>
                      </div>
                      <span className="dashboard-project-progress-track">
                        <span style={{ width: `${progress}%` }} />
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Rate this project</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const currentRating = Number(projectRatings[Number(project.id)] || 0);
                          const active = star <= currentRating;
                          return (
                            <button
                              key={`${project.id}-star-${star}`}
                              type="button"
                              onClick={() => saveProjectRating(project, star)}
                              disabled={savingRatingProjectId === Number(project.id)}
                              className={`text-xl leading-none transition ${
                                active ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="dashboard-project-actions">
                      <Link to={`/projects/${project.id}/select`} className="btn-primary">Generate</Link>
                      <Link to={`/projects/${project.id}/edit`} className="btn-secondary">Details</Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </PageMotion>
  );
};

export default DashboardProjects;
