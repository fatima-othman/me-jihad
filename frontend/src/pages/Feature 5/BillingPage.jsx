  import SectionTitle from "../../components/SectionTitle";
import Breadcrumbs from "../../components/Breadcrumbs";
import MiniBarChart from "../../components/MiniBarChart";

  function BillingPage({
  TopActionBar,
  darkMode,
  panelBg,
  mutedText,
  addNotification,
}) {
    const spendingChart = [
      { label: "Credits Used", value: 56 },
      { label: "Exports", value: 28 },
      { label: "Recharge Rate", value: 72 },
    ];

    return (
      <>
        <TopActionBar />
        <Breadcrumbs items={["Dashboard", "Billing & Credits"]} darkMode={darkMode} />

        <SectionTitle
          title="Billing & Credits"
          subtitle="Track your credit balance and recent billing activity"
          darkMode={darkMode}
          action={
            <button
              className="bg-[#355872] hover:bg-[#7AAACE] text-white px-5 py-3 rounded-xl shadow-sm transition"
              onClick={() => addNotification("New credit recharge", "A new credit purchase flow was opened.")}
            >
              + Buy Credits
            </button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
            <p className={`text-sm mb-2 ${mutedText}`}>Current Balance</p>
            <h3 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>45</h3>
            <p className="text-green-600 text-sm mt-2">Available credits</p>
          </div>

          <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
            <p className={`text-sm mb-2 ${mutedText}`}>Credits Used</p>
            <h3 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>25</h3>
            <p className={`text-sm mt-2 ${mutedText}`}>This month</p>
          </div>

          <div className={`border rounded-2xl p-6 shadow-sm ${panelBg}`}>
            <p className={`text-sm mb-2 ${mutedText}`}>Auto Recharge</p>
            <h3 className="text-2xl font-bold text-[#355872]">Enabled</h3>
            <p className={`text-sm mt-2 ${mutedText}`}>Saved card active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <MiniBarChart title="Billing Insights" data={spendingChart} darkMode={darkMode} />

          <div className={`border rounded-2xl shadow-sm overflow-hidden ${panelBg}`}>
            <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Recent Transactions
              </h3>
            </div>

            <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Auto-recharged 50 credits</p>
                  <p className={`text-sm ${mutedText}`}>Apr 27, 2025</p>
                </div>
                <span className="text-[#355872] font-semibold">+$10.00</span>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Generated Strategy Report</p>
                  <p className={`text-sm ${mutedText}`}>Apr 25, 2025</p>
                </div>
                <span className="text-red-500 font-semibold">-5 Credits</span>
              </div>

              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Exported PDF Report</p>
                  <p className={`text-sm ${mutedText}`}>Apr 22, 2025</p>
                </div>
                <span className="text-red-500 font-semibold">-1 Credit</span>
              </div>
            </div>
          </div>
        </div>
      </>
     );
}

export default BillingPage;