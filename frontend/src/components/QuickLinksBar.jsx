import { NavLink } from 'react-router-dom';
import { QUICK_LINKS } from '../config/routes';
import { useAuth } from '../context/AuthContext';

const QuickLinksBar = () => {
  const { isAuthenticated } = useAuth();

  const visibleLinks = QUICK_LINKS.filter((item) => {
    if (item.protected && !isAuthenticated) {
      return false;
    }
    return true;
  });

  return (
    <div className="quick-links-wrap" aria-label="Quick Navigation">
      <div className="container quick-links-scroll">
        {visibleLinks.map((item) => (
          <NavLink key={item.to} to={item.to} className="quick-link-chip">
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default QuickLinksBar;
