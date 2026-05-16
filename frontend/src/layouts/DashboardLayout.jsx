import Feature5Sidebar from '../components/Feature5Sidebar';
function DashboardLayout({
  children,
  darkMode,
  mutedText,
  showProfileMenu,
  setShowProfileMenu,
  setShowToast,
  navigate,
  NavButton,
}) {
  return (
    <div className="flex min-h-screen">
     <Feature5Sidebar
  darkMode={darkMode}
  mutedText={mutedText}
  showProfileMenu={showProfileMenu}
  setShowProfileMenu={setShowProfileMenu}
  navigate={navigate}
  NavButton={NavButton}
  showToast={setShowToast}
/>

      <main className="flex-1 px-6 py-6 md:px-10">{children}</main>
    </div>
  );
}

export default DashboardLayout;
