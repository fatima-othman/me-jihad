import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
