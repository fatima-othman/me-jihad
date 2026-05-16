import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const PageMotion = ({ children, className }) => {
  return (
    <MotionDiv
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </MotionDiv>
  );
};

export default PageMotion;
