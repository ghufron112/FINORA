import React from "react";
import { FinanceProvider, useFinance } from "./context/FinanceContext";
import { BackgroundBlobs } from "./components/layout/BackgroundBlobs";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { MobileNav } from "./components/layout/MobileNav";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { TransactionsPage } from "./components/transactions/TransactionsPage";
import { AnalyticsPage } from "./components/analytics/AnalyticsPage";
import { BudgetPage } from "./components/budget/BudgetPage";
import { GoalsPage } from "./components/goals/GoalsPage";
import { CalendarPage } from "./components/calendar/CalendarPage";
import { InsightPage } from "./components/insight/InsightPage";
import { AddTransactionModal } from "./components/transactions/AddTransactionModal";
import { ExportReportModal } from "./components/transactions/ExportReportModal";
import { SearchModal } from "./components/common/SearchModal";
import { ProfileModal } from "./components/common/ProfileModal";
import { SplashScreen } from "./components/common/SplashScreen";
import { AuthScreen } from "./components/auth/AuthScreen";
import { Sparkles, Loader2 } from "lucide-react";

const MainLayout = () => {
  const { activePage } = useFinance();

  const renderCurrentPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "transaksi":
        return <TransactionsPage />;
      case "analitik":
        return <AnalyticsPage />;
      case "budget":
        return <BudgetPage />;
      case "tujuan":
        return <GoalsPage />;
      case "kalender":
        return <CalendarPage />;
      case "insight":
        return <InsightPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050B14] text-slate-900 dark:text-[#F5F7FA] transition-colors duration-200 overflow-x-hidden selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200">
      {/* Ambient Radial Blobs */}
      <BackgroundBlobs />

      {/* Fixed Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[268px] min-h-screen flex flex-col relative z-10">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Interactive Modals */}
      <AddTransactionModal />
      <ExportReportModal />
      <SearchModal />
      <ProfileModal />
    </div>
  );
};

const AppContent = () => {
  const { session, authLoading } = useFinance();

  // Loading screen while checking Supabase auth session
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#050B14] flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-2xl mb-4 animate-pulse">
          <div className="w-full h-full bg-[#071322] rounded-[14px] flex items-center justify-center">
            <span className="text-2xl font-black bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
              F
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memverifikasi Sesi Finora...</span>
        </div>
      </div>
    );
  }

  // Mandatory Authentication: Must create account or login first
  if (!session) {
    return <AuthScreen />;
  }

  // Authenticated: Render main application layout
  return <MainLayout />;
};

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <FinanceProvider>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={1800} />
      )}
      <AppContent />
    </FinanceProvider>
  );
}
