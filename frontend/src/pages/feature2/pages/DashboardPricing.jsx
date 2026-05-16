import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import InlineAlert from '../../../components/InlineAlert';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PageMotion from '../../../components/PageMotion';
import { ROUTES } from '../../../config/routes';
import { createCheckoutSession, createSetupIntent, getCreditPackages, savePaymentMethod } from '../services/feature2Service';
import '../styles/credits.css';

const MotionArticle = motion.article;

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const included = [
  { title: 'SWOT Analysis', desc: 'Comprehensive analysis of strengths and opportunities' },
  { title: 'Business Model Canvas', desc: 'Complete business model frameworks' },
  { title: 'Marketing Plans', desc: 'AI-generated go-to-market strategies' },
  { title: 'Competitive Analysis', desc: 'Market positioning and competitor insights' },
];

const fallbackPlans = [
  { id: 'starter-fallback', name: 'Starter', credits: 70, price: 50.0, isFallback: true, billing_cycle: 'one_time' },
  { id: 'growth-fallback', name: 'Growth', credits: 200, price: 120.0, isFallback: true, billing_cycle: 'one_time' },
  { id: 'business-fallback', name: 'Business', credits: 500, price: 260.0, isFallback: true, billing_cycle: 'one_time' },
  { id: 'enterprise-fallback', name: 'Enterprise', credits: 1200, price: 550.0, isFallback: true, billing_cycle: 'one_time' },
];

const formatPrice = (value) => {
  const numberValue = Number(value || 0);
  return `${numberValue.toFixed(2)} ILS`;
};

const CardSetupForm = ({ clientSecret, onSaved, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        onError(result.error.message || 'Failed to verify card details.');
        return;
      }

      const paymentMethodId = result?.setupIntent?.payment_method;

      if (!paymentMethodId) {
        onError('Stripe did not return a payment method id.');
        return;
      }

      await savePaymentMethod({ payment_method_id: paymentMethodId });
      onSaved();
    } catch (error) {
      onError(error?.message || 'Failed to save payment method.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="purchase-card-form">
      <label className="form-label" htmlFor="card-element">Card Information</label>
      <div className="input" id="card-element" style={{ paddingTop: '0.8rem' }}>
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#1b2b24',
                '::placeholder': {
                  color: '#6c7a73',
                },
              },
            },
          }}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={submitting || !stripe}>
        {submitting ? <LoadingSpinner label="Saving" small /> : 'Save Card'}
      </button>
    </form>
  );
};

const DashboardPricing = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [setupIntentSecret, setSetupIntentSecret] = useState('');
  const [loadingSetupIntent, setLoadingSetupIntent] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const displayPlans = useMemo(() => (plans.length > 0 ? plans : fallbackPlans), [plans]);

  useEffect(() => {
    let isMounted = true;

    const loadPackages = async () => {
      setLoadingPlans(true);
      setNotice({ type: '', message: '' });

      try {
        const packages = await getCreditPackages();
        if (isMounted) {
          setPlans(packages.filter((pkg) => pkg.is_active !== false));
        }
      } catch (error) {
        if (isMounted) {
          setNotice({ type: 'error', message: error?.message || 'Failed to load pricing packages.' });
        }
      } finally {
        if (isMounted) {
          setLoadingPlans(false);
        }
      }
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const canConfirm = useMemo(() => Boolean(selectedPlan), [selectedPlan]);

  const handleConfirmPayment = async () => {
    if (!selectedPlan) {
      return;
    }

    if (selectedPlan.isFallback) {
      setSelectedPlan(null);
      setNotice({
        type: 'success',
        message: 'Plan selected. Complete card setup to continue payment flow.',
      });
      await handleCreateSetupIntent();
      return;
    }

    setProcessingPayment(true);
    setNotice({ type: '', message: '' });

    try {
      const origin = window.location.origin;
      const successUrl = `${origin}${ROUTES.dashboardHistory}?session_id={CHECKOUT_SESSION_ID}`;
      const result = await createCheckoutSession({
        credit_package_id: selectedPlan.id,
        success_url: successUrl,
        cancel_url: `${origin}${ROUTES.dashboardPricing}`,
      });

      const checkoutUrl =
        result?.checkout_url ||
        result?.checkoutUrl ||
        result?.url ||
        result?.data?.checkout_url ||
        result?.data?.url;

      const sessionId =
        result?.checkout_session_id ||
        result?.checkoutSessionId ||
        result?.session_id ||
        result?.id ||
        result?.data?.checkout_session_id ||
        result?.data?.id;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      if (sessionId) {
        const stripe = await stripePromise;
        if (!stripe) {
          setNotice({ type: 'error', message: 'Stripe.js failed to initialize.' });
          return;
        }

        const { error: redirectError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (redirectError) {
          setNotice({ type: 'error', message: redirectError.message || 'Failed to redirect to Stripe Checkout.' });
          return;
        }

        return;
      }

      setNotice({
        type: 'error',
        message: `Checkout response missing redirect data. (${JSON.stringify(result)})`,
      });
    } catch (error) {
      setNotice({ type: 'error', message: error?.message || 'Failed to start checkout session.' });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateSetupIntent = async () => {
    if (!stripePublicKey) {
      setNotice({ type: 'error', message: 'Missing VITE_STRIPE_PUBLIC_KEY in frontend environment.' });
      return;
    }

    setLoadingSetupIntent(true);
    setNotice({ type: '', message: '' });

    try {
      const result = await createSetupIntent();
      setSetupIntentSecret(result?.client_secret || '');
      setCardSaved(false);
    } catch (error) {
      setNotice({ type: 'error', message: error?.message || 'Failed to initialize Stripe card setup.' });
    } finally {
      setLoadingSetupIntent(false);
    }
  };

  return (
    <PageMotion>
      <main className="page-section credits-page">
        <div className="container credits-container">
          <section className="pricing-head">
            <h2>Choose Your Plan</h2>
            <p>
              Select the perfect credit package for your business strategy needs.
              All packages include full access to StrategAI AI-powered tools.
            </p>
          </section>

          <InlineAlert type={notice.type || 'success'} message={notice.message} />

          <section className="card included-card">
            <h3>Billing Setup</h3>
            <p>Save a card to enable seamless checkout and auto-recharge.</p>
            {!setupIntentSecret ? (
              <button type="button" className="btn-secondary" onClick={handleCreateSetupIntent} disabled={loadingSetupIntent}>
                {loadingSetupIntent ? <LoadingSpinner label="Preparing" small /> : 'Add / Update Card'}
              </button>
            ) : null}

            {setupIntentSecret && stripePromise ? (
              <Elements stripe={stripePromise}>
                <CardSetupForm
                  clientSecret={setupIntentSecret}
                  onSaved={() => {
                    setCardSaved(true);
                    setNotice({ type: 'success', message: 'Card saved successfully. Auto-recharge can be enabled from Credits page.' });
                  }}
                  onError={(message) => {
                    setNotice({ type: 'error', message });
                  }}
                />
              </Elements>
            ) : null}

            {cardSaved ? <p className="credits-hint">Your default card is now linked to your account.</p> : null}
          </section>

          {loadingPlans ? (
            <section className="card" style={{ padding: '1rem 1.3rem' }}>
              <LoadingSpinner label="Loading pricing plans" />
            </section>
          ) : (
            <section className="pricing-grid">
              <MotionArticle
                className="card pricing-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h3>Free</h3>
                <p className="pricing-subtitle">On registration</p>
                <p className="pricing-price">0.00 ILS</p>
                <p className="pricing-credits">20 credits</p>
                <button type="button" className="btn-secondary" disabled>Current Plan</button>
              </MotionArticle>

              {displayPlans.map((plan, index) => (
                <MotionArticle
                  key={plan.id}
                  className={`card pricing-card${index === 1 ? ' pricing-card-featured' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: (index + 1) * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  {index === 1 ? <span className="pricing-badge">Best Value</span> : null}
                  <h3>{plan.name}</h3>
                  <p className="pricing-subtitle">
                    {plan.billing_cycle === 'monthly' ? 'Monthly subscription' : 'One-time purchase'}
                  </p>
                  <p className="pricing-price">{formatPrice(plan.price)}</p>
                  <p className="pricing-credits">{`${plan.credits} credits`}</p>
                  <button
                    type="button"
                    className={index === 1 ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setNotice({ type: '', message: '' });
                    }}
                  >
                    Buy Now
                  </button>
                </MotionArticle>
              ))}
            </section>
          )}

          <section className="card included-card">
            <h3>What's Included</h3>
            <div className="included-grid">
              {included.map((item) => (
                <p key={item.title}>
                  <span className="included-mark" />
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </p>
              ))}
            </div>
          </section>
        </div>

        {selectedPlan ? (
          <div className="purchase-overlay" role="dialog" aria-modal="true">
            <section className="purchase-modal card">
              <div className="purchase-head">
                <h3>Complete Purchase</h3>
                <button type="button" onClick={() => setSelectedPlan(null)} aria-label="Close" disabled={processingPayment}>
                  x
                </button>
              </div>

              <div className="purchase-summary">
                <p>
                  <span>Package</span>
                  <strong>{selectedPlan.name}</strong>
                </p>
                <p>
                  <span>Credits</span>
                  <strong>{`${selectedPlan.credits} credits`}</strong>
                </p>
                <p>
                  <span>Total</span>
                  <strong>{formatPrice(selectedPlan.price)}</strong>
                </p>
              </div>

              <p className="purchase-secure">Secure payment powered by Stripe Checkout</p>
              <div className="purchase-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedPlan(null)} disabled={processingPayment}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleConfirmPayment} disabled={!canConfirm || processingPayment}>
                  {processingPayment ? <LoadingSpinner label="Redirecting" small /> : 'Continue to Stripe'}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </PageMotion>
  );
};

export default DashboardPricing;
