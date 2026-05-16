const SectionTitle = ({ title, subtitle, action, darkMode = false }) => (
  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
    <div>
      <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);

export default SectionTitle;