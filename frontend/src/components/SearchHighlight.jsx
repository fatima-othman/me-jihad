const SearchHighlight = ({ text, query, darkMode = false }) => {
  if (!query?.trim()) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className={`px-1 rounded ${
              darkMode ? "bg-[#7AAACE] text-white" : "bg-[#9CD5FF] text-[#355872]"
            }`}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default SearchHighlight;