import { motion } from 'framer-motion';

const MotionSpan = motion.span;

const LoadingSpinner = ({ label = 'Loading', small = false }) => {
  return (
    <span className={`spinner-wrap${small ? ' spinner-wrap-small' : ''}`} role="status" aria-live="polite">
      <MotionSpan
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {label ? <span className="spinner-text">{label}</span> : null}
    </span>
  );
};

export default LoadingSpinner;
