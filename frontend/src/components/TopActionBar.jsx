function TopActionBar({
  darkMode,
  showNotifications,
  setShowNotifications,
  unreadNotifications,
  notifications,
  mutedText,
  markAllNotificationsRead,
  showNotificationsUI = false,
}) {
  if (!showNotificationsUI) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-3 mb-6 relative">
      <div className="relative">
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className={`relative h-11 px-4 rounded-xl border transition ${
            darkMode
              ? "bg-[#111827] border-gray-700 text-white hover:bg-gray-800"
              : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
          }`}
        >
          🔔

          {unreadNotifications > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            className={`absolute right-0 mt-3 w-[360px] rounded-2xl border shadow-xl z-[120] ${
              darkMode
                ? "bg-[#111827] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`px-5 py-4 border-b flex items-center justify-between ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div>
                <h3
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notifications
                </h3>

                <p className={`text-sm ${mutedText}`}>
                  {notifications.length} total notifications
                </p>
              </div>

              <button
                onClick={markAllNotificationsRead}
                className="text-sm text-[#355872] font-medium"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`px-5 py-4 border-b last:border-b-0 ${
                    darkMode ? "border-gray-700" : "border-gray-100"
                  } ${
                    !item.isRead
                      ? darkMode
                        ? "bg-[#0F172A]"
                        : "bg-[#F7F8F0]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className={`text-sm mt-1 ${mutedText}`}>
                        {item.message}
                      </p>
                    </div>

                    {!item.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#355872] mt-2" />
                    )}
                  </div>

                  <p className={`text-xs mt-2 ${mutedText}`}>
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopActionBar;
