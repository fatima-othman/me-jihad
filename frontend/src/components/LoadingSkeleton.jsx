const LoadingSkeleton = ({ darkMode = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className={`rounded-2xl border p-6 shadow-sm animate-pulse ${
          darkMode ? "bg-[#111827] border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className={`h-12 w-12 rounded-2xl mb-5 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-5 w-2/3 rounded mb-3 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-4 w-full rounded mb-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-4 w-5/6 rounded mb-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        <div className={`h-4 w-4/6 rounded mb-5 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />

        <div className="grid grid-cols-2 gap-3">
          <div className={`h-10 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
          <div className={`h-10 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;