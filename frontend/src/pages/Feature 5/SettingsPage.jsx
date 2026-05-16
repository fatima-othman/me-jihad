import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SectionTitle from "../../components/SectionTitle";
import Breadcrumbs from "../../components/Breadcrumbs";
import { requestPasswordReset } from "../feature2/services/feature2Service";

function formatMemberSince(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function SettingsPage({
  TopActionBar,
  darkMode,
  setDarkMode,
  panelBg,
  mutedText,
  showToast,
  addNotification,
  fakeDownload,
}) {
  const { user, syncUser } = useAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "Strategy Manager",
    memberSince: "-",
  });

  const [preferences, setPreferences] = useState({
    language: "English / Arabic",
    emailNotifications: true,
    weeklySummary: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastLogin: "-",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [sendingResetCode, setSendingResetCode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
  });

  useEffect(() => {
    const localLastLoginKey = `strategai_last_login_at_${user?.id || user?.email || "guest"}`;
    let localLastLogin = localStorage.getItem(localLastLoginKey);
    if (!localLastLogin && user) {
      localLastLogin = new Date().toISOString();
      localStorage.setItem(localLastLoginKey, localLastLogin);
    }

    setProfileData({
      fullName: user?.name || "",
      email: user?.email || "",
      role: "Strategy Manager",
      memberSince: formatMemberSince(user?.created_at),
    });

    setSecurity((current) => ({
      ...current,
      lastLogin: localLastLogin
        ? new Date(localLastLogin).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "-",
    }));
  }, [user]);

  const initial = useMemo(
    () => ({ name: user?.name || "", email: user?.email || "" }),
    [user?.name, user?.email],
  );

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      showToast("error", "Missing fields", "Name and email are required.");
      return;
    }

    setSavingProfile(true);
    try {
      const { data } = await api.put("/profile", {
        name: profileData.fullName.trim(),
        email: profileData.email.trim(),
      });

      if (data?.user) {
        syncUser(data.user);
      }

      setIsEditingProfile(false);
      showToast("success", "Profile updated", "Your profile changes were saved.");
      addNotification("Profile updated", "Your account profile was updated successfully.");
    } catch (error) {
      showToast("error", "Update failed", error?.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
      showToast("error", "Missing fields", "Please fill all password fields.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.put("/profile", passwordForm);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setShowPasswordForm(false);
      showToast("success", "Password updated", "Your password was changed successfully.");
      addNotification("Security update", "Your account password was changed.");
    } catch (error) {
      const message =
        error?.response?.data?.errors?.current_password?.[0] ||
        error?.response?.data?.errors?.password?.[0] ||
        error?.response?.data?.message ||
        "Could not change password.";
      showToast("error", "Password update failed", message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendResetCodeInline = async () => {
    if (!forgotPasswordForm.email.trim()) {
      showToast("error", "Missing email", "Please enter your email first.");
      return;
    }

    setSendingResetCode(true);
    try {
      const result = await requestPasswordReset({ email: forgotPasswordForm.email.trim() });
      showToast("success", "Reset link sent", result?.message || "Password reset link sent to your email.");
    } catch (error) {
      showToast("error", "Send failed", error?.message || "Could not send reset code.");
    } finally {
      setSendingResetCode(false);
    }
  };

  const handleExportData = () => {
    fakeDownload("Account data");
    addNotification("Export data", "Your account data export was prepared.");
  };

  return (
    <>
      <TopActionBar />
      <Breadcrumbs items={["Dashboard", "Settings"]} darkMode={darkMode} />

      <SectionTitle
        title="Settings"
        subtitle="Manage your account profile, preferences, security, and quick actions"
        darkMode={darkMode}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#355872] text-white flex items-center justify-center text-2xl font-bold">
                {(profileData.fullName || "S").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Profile Overview
                </h3>
                <p className={`text-sm mt-1 ${mutedText}`}>
                  Your personal account information
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isEditingProfile) {
                  handleSaveProfile();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              disabled={savingProfile}
              className="bg-[#355872] hover:bg-[#7AAACE] text-white px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              {isEditingProfile ? (savingProfile ? "Saving..." : "Save Changes") : "Edit Profile"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm mb-2 ${mutedText}`}>Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                className={`w-full border rounded-xl px-4 py-3 ${
                  darkMode
                    ? "bg-[#0F172A] border-gray-700 text-white disabled:opacity-80"
                    : "bg-gray-50 border-gray-200 text-gray-900 disabled:opacity-90"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm mb-2 ${mutedText}`}>Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className={`w-full border rounded-xl px-4 py-3 ${
                  darkMode
                    ? "bg-[#0F172A] border-gray-700 text-white disabled:opacity-80"
                    : "bg-gray-50 border-gray-200 text-gray-900 disabled:opacity-90"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#0F172A] border-gray-700" : "bg-[#F7F8F0] border-gray-200"}`}>
                <p className={`text-sm mb-1 ${mutedText}`}>Role</p>
                <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {profileData.role}
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#0F172A] border-gray-700" : "bg-[#F7F8F0] border-gray-200"}`}>
                <p className={`text-sm mb-1 ${mutedText}`}>Member Since</p>
                <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {profileData.memberSince}
                </p>
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-[#355872] hover:bg-[#7AAACE] text-white px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      fullName: initial.name,
                      email: initial.email,
                      role: "Strategy Manager",
                      memberSince: formatMemberSince(user?.created_at),
                    });
                  }}
                  className={`px-4 py-2 rounded-xl border transition ${
                    darkMode
                      ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <h3 className={`text-xl font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Preferences
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Theme</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Switch between light and dark mode</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-xl transition ${
                  darkMode
                    ? "bg-[#355872] text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {darkMode ? "Dark" : "Light"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Language</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Choose your preferred interface language</p>
              </div>
              <span className="text-[#355872] font-medium">{preferences.language}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Notifications</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Receive product and report updates</p>
              </div>
              <button
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    emailNotifications: !preferences.emailNotifications,
                  })
                }
                className={`px-4 py-2 rounded-xl transition ${
                  preferences.emailNotifications
                    ? "bg-[#355872] text-white"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {preferences.emailNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Weekly Summary</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Get a weekly email summary of activity</p>
              </div>
              <button
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    weeklySummary: !preferences.weeklySummary,
                  })
                }
                className={`px-4 py-2 rounded-xl transition ${
                  preferences.weeklySummary
                    ? "bg-[#355872] text-white"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {preferences.weeklySummary ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <h3 className={`text-xl font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Security
          </h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Change Password</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Update your password for better account security</p>
              </div>
              <button
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className={`px-4 py-2 rounded-xl border transition ${
                  darkMode
                    ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {showPasswordForm ? "Close" : "Change"}
              </button>
            </div>

            {showPasswordForm ? (
              <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#0F172A] border-gray-700" : "bg-[#F7F8F0] border-gray-200"}`}>
                {!forgotMode ? (
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passwordForm.current_password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 ${
                        darkMode ? "bg-[#0b1322] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordForm.password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 ${
                        darkMode ? "bg-[#0b1322] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.password_confirmation}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 ${
                        darkMode ? "bg-[#0b1322] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="bg-[#355872] hover:bg-[#7AAACE] text-white px-4 py-2 rounded-xl transition disabled:opacity-50"
                    >
                      {changingPassword ? "Changing..." : "Save Password"}
                    </button>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(true);
                          setForgotPasswordForm((prev) => ({ ...prev, email: profileData.email || prev.email }));
                        }}
                        className={`text-sm underline ${darkMode ? "text-[#9CD5FF]" : "text-[#355872]"}`}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={forgotPasswordForm.email}
                      onChange={(event) => setForgotPasswordForm((current) => ({ ...current, email: event.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 ${
                        darkMode ? "bg-[#0b1322] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                      }`}
                    />
                    <p className={`text-sm ${mutedText}`}>
                      We will send a secure reset link to your email. Open it to set a new password.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendResetCodeInline}
                        disabled={sendingResetCode}
                        className="flex-1 bg-[#355872] hover:bg-[#7AAACE] text-white px-4 py-2 rounded-xl transition disabled:opacity-50"
                      >
                        {sendingResetCode ? "Sending..." : "Send Reset Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setForgotMode(false)}
                        className={`px-4 py-2 rounded-xl border transition ${
                          darkMode
                            ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>Two-Factor Authentication</p>
                <p className={`text-sm mt-1 ${mutedText}`}>Add an extra layer of protection to your account</p>
              </div>
              <button
                onClick={() =>
                  setSecurity({
                    ...security,
                    twoFactorEnabled: !security.twoFactorEnabled,
                  })
                }
                className={`px-4 py-2 rounded-xl transition ${
                  security.twoFactorEnabled
                    ? "bg-[#355872] text-white"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {security.twoFactorEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#0F172A] border-gray-700" : "bg-[#F7F8F0] border-gray-200"}`}>
              <p className={`text-sm mb-1 ${mutedText}`}>Last Login</p>
              <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {security.lastLogin}
              </p>
            </div>
          </div>
        </div>

        <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
          <h3 className={`text-xl font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleExportData}
              className="bg-[#355872] hover:bg-[#7AAACE] text-white px-5 py-4 rounded-2xl transition text-left"
            >
              <p className="font-semibold">Export Data</p>
              <p className="text-sm text-white/80 mt-1">Download your account summary and settings</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
