function Feature5Sidebar({
  darkMode,
  mutedText,
  NavButton,
}) {
  return (
    <aside
      className={`w-[250px] border-r px-5 py-6 hidden md:flex md:flex-col md:justify-between ${
        darkMode
          ? 'bg-[#111827] border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-[#355872] text-white flex items-center justify-center font-bold">
            S
          </div>

          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              StrategAI
            </h1>

            <p className={`text-xs ${mutedText}`}>
              AI Strategy Dashboard
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavButton to="/dashboard" label="Dashboard" />
          <NavButton to="/history" label="Report History" />
          <NavButton to="/comparison" label="Comparison" />
          <NavButton to="/settings" label="Settings" />
        </nav>
      </div>
    </aside>
  );
}

export default Feature5Sidebar;
