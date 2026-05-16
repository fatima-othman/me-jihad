import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageMotion from '../../../components/PageMotion';
import { ROUTES } from '../../../config/routes';
import '../styles/home.css';

const featureCards = [
  {
    title: 'AI-Powered Analysis',
    description:
      'Advanced algorithms analyze market trends, competition, and opportunities to generate data-driven strategies.',
    icon: 'analysis',
  },
  {
    title: 'Structured Reports',
    description:
      'Professional, comprehensive business strategy reports ready to present to stakeholders and investors.',
    icon: 'reports',
  },
  {
    title: 'Growth Insights',
    description:
      'Identify growth opportunities and potential challenges before they impact your business.',
    icon: 'growth',
  },
  {
    title: 'Goal Alignment',
    description:
      'Align your strategy with business objectives and create actionable roadmaps for success.',
    icon: 'goals',
  },
  {
    title: 'Multi-dimensional',
    description: 'Analyze from multiple perspectives: market, financial, operational, and competitive.',
    icon: 'multi',
  },
  {
    title: 'Instant Generation',
    description: 'Generate comprehensive strategies in minutes, not weeks. Focus on execution, not research.',
    icon: 'instant',
  },
];

const MotionLink = motion(Link);
const Icon = ({ name }) => {
  const icons = {
    analysis: (
      <>
        <path d="M4 19h16" />
        <path d="M7 19v-7" />
        <path d="M12 19V8" />
        <path d="M17 19v-4" />
      </>
    ),
    reports: (
      <>
        <path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v4h4" />
        <path d="M10 12h6" />
        <path d="M10 16h6" />
      </>
    ),
    growth: (
      <>
        <path d="m5 16 5-5 3 3 6-6" />
        <path d="M15 8h4v4" />
      </>
    ),
    goals: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    multi: (
      <>
        <path d="M3 12h18" />
        <path d="M12 3v18" />
        <path d="M6 6l12 12" />
      </>
    ),
    instant: (
      <>
        <path d="M13 2 5 14h6l-1 8 8-12h-6z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const Home = () => {
  const MotionStatsText = motion.div;
  const MotionStatsCard = motion.aside;

  return (
    <PageMotion>
      <motion.section
        className="home-hero page-section"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container home-hero-grid">
          <motion.div className="hero-left" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <span className="hero-pill">AI-Powered Strategy</span>
            <h1>AI Business Strategy Generator</h1>
            <p>
              Transform your business vision into actionable strategies with AI-powered insights and comprehensive
              reports.
            </p>
            <div className="hero-actions">
              <MotionLink to={ROUTES.register} className="btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                Get started free
              </MotionLink>
              <motion.button type="button" className="btn-secondary" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                Explore use cases
              </motion.button>
            </div>
          </motion.div>

          <motion.aside className="hero-right card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <div className="analysis-head">
              <h2>Strategy Analysis</h2>
              <span>AI Generated</span>
            </div>

            <div className="analysis-row">
              <p>Market Opportunity</p>
              <strong>92%</strong>
            </div>
            <div className="analysis-row">
              <p>Competitive Edge</p>
              <strong>87%</strong>
            </div>
            <div className="analysis-row">
              <p>Growth Potential</p>
              <strong>95%</strong>
            </div>

            <div className="analysis-footer">Analyzed 2,847 data points</div>
          </motion.aside>
        </div>
      </motion.section>

      <motion.section
        className="page-section home-features"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container">
          <div className="features-heading">
            <h2>Everything you need to strategize</h2>
            <p>Comprehensive tools powered by AI to transform your business vision into reality.</p>
          </div>

          <div className="features-grid">
            {featureCards.map((item, index) => (
              <motion.article
                className="card feature-card"
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
              >
                <div className="feature-icon">
                  <Icon name={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="home-stats page-section"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container stats-grid">
          <MotionStatsText
            initial={{ opacity: 0, x: -26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            <h2>Built for startups and businesses that move fast</h2>
            <p>
              Whether you are launching a startup or scaling an enterprise, StrategAI provides the strategic framework
              you need to succeed.
            </p>
            <ul>
              <li>Generate strategies in minutes, not weeks</li>
              <li>Professional reports for investors and stakeholders</li>
              <li>Data-driven insights backed by AI analysis</li>
              <li>Export to PDF for presentations and meetings</li>
            </ul>
          </MotionStatsText>

          <MotionStatsCard
            className="stats-card"
            initial={{ opacity: 0, x: 26 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.38, ease: 'easeOut', delay: 0.06 }}
          >
            <div>
              <h3>10K+</h3>
              <p>Strategies Generated</p>
            </div>
            <div>
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
            <div>
              <h3>24/7</h3>
              <p>AI Support</p>
            </div>
          </MotionStatsCard>
        </div>
      </motion.section>

      <motion.section
        className="page-section home-cta"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container cta-wrap">
          <h2>Ready to transform your strategy?</h2>
          <p>Join thousands of businesses using AI to accelerate their growth.</p>
          <MotionLink to={ROUTES.register} className="btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            Get started free
          </MotionLink>
        </div>
      </motion.section>

      <footer className="home-footer">
        <div className="container footer-wrap">
          <strong>StrategAI</strong>
          <span> 2026 StrategAI. All rights reserved.</span>
        </div>
      </footer>
    </PageMotion>
  );
};

export default Home;

