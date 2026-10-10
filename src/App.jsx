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
import { SearchModal } from "./components/common/SearchModal";
import { AuthModal } from "./components/auth/AuthModal";
import { ProfileModal } from "./components/common/ProfileModal";
import { SplashScreen } from "./components/common/SplashScreen";

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
      <SearchModal />
      <AuthModal />
      <ProfileModal />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <FinanceProvider>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={1800} />
      )}
      <MainLayout />
    </FinanceProvider>
  );
}
