const StatusBadge = ({ label, darkMode = false, variant = "default" }) => {
  const styles = {
    default: "bg-[#9CD5FF] text-[#355872]",
    warning: "bg-[#F7F8F0] text-[#355872]",
    danger: "bg-red-100 text-red-600",
    dark: darkMode ? "bg-[#355872] text-[#F7F8F0]" : "bg-[#F7F8F0] text-[#355872]",
    favorite: "bg-[#9CD5FF] text-[#355872]",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles[variant] || styles.default}`}>
      {label}
    </span>
  );
};

export default StatusBadge;