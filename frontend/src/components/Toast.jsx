const Toast = ({ toast, onClose, darkMode = false }) => {
  if (!toast) return null;

  const toneStyles =
    toast.type === "success"
      ? "bg-[#355872] text-white"
      : toast.type === "error"
      ? "bg-red-500 text-white"
      : darkMode
      ? "bg-[#111827] text-white border border-gray-700"
      : "bg-white text-gray-900 border border-gray-200";

  return (
    <div className="fixed top-5 right-5 z-[200]">
      <div className={`min-w-[260px] max-w-[360px] px-4 py-3 rounded-2xl shadow-xl ${toneStyles}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{toast.title}</p>
            {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
          </div>

          <button onClick={onClose} className="text-sm opacity-80 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;