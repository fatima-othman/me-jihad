const Breadcrumbs = ({ items, darkMode = false }) => (
  <div className={`flex items-center gap-2 text-sm mb-6 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        <span
          className={
            index === items.length - 1
              ? darkMode
                ? "text-white font-medium"
                : "text-gray-800 font-medium"
              : ""
          }
        >
          {item}
        </span>
        {index < items.length - 1 && <span>/</span>}
      </div>
    ))}
  </div>
);

export default Breadcrumbs;