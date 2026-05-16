import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import EmptyState from '../../../components/EmptyState';
import InlineAlert from '../../../components/InlineAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PageMotion from '../../../components/PageMotion';
import { ROUTES } from '../../../config/routes';
import { useAuth } from '../../../context/AuthContext';
import { getCreditPackages, getCreditsOverview, updateAutoRechargeSettings } from '../services/feature2Service';
import '../styles/credits.css';

const MotionSection = motion.section;

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCredits = (value) => {
  const numberValue = Number(value || 0);
  if (numberValue > 0) {
    return `+${numberValue}`;
  }
  return String(numberValue);
};

const DashboardCredits = () => {
  const { syncUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [autoRechargePackageId, setAutoRechargePackageId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [packages, setPackages] = useState([]);
  const [savingAuto, setSavingAuto] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [{ user, transactions }, packagesResponse] = await Promise.all([
          getCreditsOverview(),
          getCreditPackages(),
        ]);

        if (!isMounted) {
          return;
        }

        setBalance(Number(user?.credit_balance || 0));
        if (user) {
          syncUser(user);
        }
        setRecentActivity(transactions.slice(0, 8));
        setAutoRechargeEnabled(Boolean(user?.auto_recharge_enabled));
        setAutoRechargePackageId(user?.auto_recharge_package_id ? String(user.auto_recharge_package_id) : '');
        setPaymentMethodId(user?.stripe_payment_method_id || '');
        setPackages(packagesResponse.filter((pkg) => pkg.is_active !== false));
      } catch (apiError) {
        if (isMounted) {
          setError(apiError?.message || 'Failed to load credits overview.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const progressWidth = useMemo(() => {
    const highestPackageCredits = packages.reduce((max, pkg) => {
      const credits = Number(pkg?.credits || 0);
      return credits > max ? credits : max;
    }, 0);

    const referenceCap = Math.max(100, highestPackageCredits || 1200);
    const percent = Math.min(100, Math.round((Math.max(balance, 0) / referenceCap) * 100));
    return `${Math.max(percent, 4)}%`;
  }, [balance, packages]);

  const totalCreditsPurchased = useMemo(
    () => recentActivity
      .filter((row) => Number(row.amount || 0) > 0 && Number(row.credits || 0) > 0 && row?.status === 'completed')
      .reduce((sum, row) => sum + Number(row.credits || 0), 0),
    [recentActivity],
  );

  const handleSaveAutoRecharge = async () => {
    setSavingAuto(true);
    setError('');

    try {
      await updateAutoRechargeSettings({
        enabled: autoRechargeEnabled,
        credit_package_id: autoRechargeEnabled && autoRechargePackageId ? Number(autoRechargePackageId) : null,
      });
    } catch (apiError) {
      setError(apiError?.message || 'Failed to update auto recharge settings.');
    } finally {
      setSavingAuto(false);
    }
  };

  return (
    <PageMotion>
      <main className="page-section credits-page">
        <div className="container credits-container">
          <section className="credits-section-head">
            <h2>Credits Overview</h2>
            <p>Manage your credits and track usage for AI strategy generation</p>
          </section>

          <InlineAlert type="error" message={error} />

          <MotionSection className="card credits-overview-card" whileHover={{ y: -2 }}>
            <div className="credits-overview-top">
              <div>
                <span>Available Credits</span>
                <h3>
                  {loading ? <LoadingSpinner label="Loading" small /> : balance} <small>current balance</small>
                </h3>
                <p className="credits-hint" style={{ marginTop: '0.35rem' }}>
                  Total Credits Purchased: <strong>{loading ? '...' : totalCreditsPurchased}</strong>
                </p>
              </div>
              <Link to={ROUTES.dashboardPricing} className="btn-primary">Buy Credits</Link>
            </div>

            <div className="credits-progress-track">
              <span className="credits-progress-fill" style={{ width: progressWidth }} />
            </div>
            <p className="credits-hint">Each AI strategy generation uses 10 credits</p>
          </MotionSection>

          <section className="card included-card">
            <h3>Auto Recharge</h3>
            <p>Automatically charge your saved card when your credit balance reaches zero.</p>

            <p className="credits-hint">
              Saved payment method: {paymentMethodId ? 'Available' : 'Not found. Add one from Pricing page.'}
            </p>
            <p className="credits-hint">
              Select a recharge package first, then enable auto-recharge and save settings.
            </p>

            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={autoRechargeEnabled}
                  onChange={(event) => setAutoRechargeEnabled(event.target.checked)}
                  disabled={loading}
                />
                Enable auto-recharge
              </label>

              <label className="form-label" htmlFor="auto-recharge-package">Recharge package</label>
              <select
                id="auto-recharge-package"
                className="input"
                value={autoRechargePackageId}
                onChange={(event) => setAutoRechargePackageId(event.target.value)}
                disabled={loading}
              >
                <option value="">Select package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.credits} credits / {Number(pkg.price).toFixed(2)} ILS)
                  </option>
                ))}
              </select>

              <button type="button" className="btn-secondary" onClick={handleSaveAutoRecharge} disabled={savingAuto || loading}>
                {savingAuto ? <LoadingSpinner label="Saving" small /> : 'Save Auto Recharge Settings'}
              </button>
            </div>
          </section>

          <section className="credits-section-head credits-tight-top">
            <h2>Recent Activity</h2>
            <p>Your latest credit transactions</p>
          </section>

          {loading ? (
            <section className="card" style={{ padding: '1rem 1.3rem' }}>
              <LoadingSpinner label="Loading recent activity" />
            </section>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              title="No credit activity yet"
              description="Start generating reports and your credit usage will appear here."
              actionLabel="View plans"
              actionTo={ROUTES.dashboardPricing}
            />
          ) : (
            <section className="card credits-table-card">
              <h3>Credit Usage</h3>
              <table className="credits-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.created_at)}</td>
                      <td>{row.description || row.type || 'Transaction'}</td>
                      <td className="credits-col-right">{formatCredits(row.credits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="card need-credits-card">
            <h3>Need More Credits?</h3>
            <p>Purchase additional credits to continue generating comprehensive business strategies with AI</p>
            <Link to={ROUTES.dashboardPricing} className="btn-primary">View Pricing Plans</Link>
          </section>
        </div>
      </main>
    </PageMotion>
  );
};

export default DashboardCredits;
