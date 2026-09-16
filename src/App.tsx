import React, { useState, useEffect } from 'react';
import { DairySyncProvider, useDairySync } from './context/DairySyncContext';
import { Header } from './components/Header';
import { RoleBadge } from './components/RoleBadge';
import { Dashboard } from './components/Dashboard';
import { RawIngredients } from './components/RawIngredients';
import { WipProduction } from './components/WipProduction';
import { FinishedGoods } from './components/FinishedGoods';
import { SupplyDemandSync } from './components/SupplyDemandSync';
import { Procurement } from './components/Procurement';
import { DairyBoxPos } from './components/DairyBoxPos';
import { AuditTrail } from './components/AuditTrail';
import { IsoEvaluationModal } from './components/IsoEvaluationModal';
import { ReportsModal } from './components/ReportsModal';
import { LoginPage } from './components/LoginPage';
import { AccessRestricted } from './components/AccessRestricted';
import { QuickActionsMenu } from './components/QuickActionsMenu';
import { ScrollableTabBar } from './components/ScrollableTabBar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Snowflake, 
  TrendingUp, 
  Truck, 
  ShoppingCart,
  Award,
  Lock,
  ShieldCheck
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, canAccessTab, currentRole } = useDairySync();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Modal states
  const [showIsoSurvey, setShowIsoSurvey] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Auto-redirect if current tab becomes unauthorized on role switch
  useEffect(() => {
    if (!canAccessTab(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentRole]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'ingredients', label: 'Raw Ingredients', icon: Package },
    { id: 'wip', label: 'WIP Batches', icon: Layers },
    { id: 'finished', label: 'Cold Storage', icon: Snowflake },
    { id: 'sync', label: 'Supply & Demand', icon: TrendingUp },
    { id: 'procurement', label: 'ROP Procurement', icon: Truck },
    { id: 'pos', label: 'Dairy Box POS', icon: ShoppingCart },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navbar */}
        <div className="print:hidden">
          <Header 
            onOpenIsoSurvey={() => setShowIsoSurvey(true)}
            onOpenReports={() => setShowReports(true)}
          />
        </div>

        {/* Primary Container */}
        <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Role View Context Banner */}
          <div className="print:hidden">
            <RoleBadge />
          </div>

          {/* Tab Navigation Menu with RBAC Lock Indicators & Horizontal Scroll Controls */}
          <ScrollableTabBar
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            canAccessTab={canAccessTab}
          />

          {/* Dynamic Main View Rendering with RBAC Guard */}
          <div className="transition-all duration-200">
            {!canAccessTab(activeTab) ? (
              <AccessRestricted 
                requiredTab={activeTab} 
                onNavigateHome={() => setActiveTab('dashboard')} 
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    onNavigateTab={setActiveTab}
                    onOpenIsoSurvey={() => setShowIsoSurvey(true)}
                    onOpenReports={() => setShowReports(true)}
                  />
                )}

                {activeTab === 'ingredients' && <RawIngredients />}

                {activeTab === 'wip' && <WipProduction />}

                {activeTab === 'finished' && <FinishedGoods onNavigateTab={setActiveTab} />}

                {activeTab === 'sync' && <SupplyDemandSync />}

                {activeTab === 'procurement' && <Procurement />}

                {activeTab === 'pos' && <DairyBoxPos />}

                {activeTab === 'audit' && <AuditTrail />}
              </>
            )}
          </div>

        </main>

        {/* Institutional Footer */}
        <footer className="bg-white border-t-2 border-slate-200 text-slate-500 text-xs py-6 mt-12 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <p className="font-bold text-slate-800">DairySync Cloud Inventory & Production Management System</p>
              <p className="text-[11px] text-slate-500">
                Developed for Philippine Carabao Center at Mariano Marcos State University (PCC-MMSU), Batac City
              </p>
              <p className="text-[10px] text-slate-400">
                Developers: Domingo, E. T., Martinez, S. D. B., Silva, S. J. P., Yasay, J. J. O. (College of Industrial Technology, MMSU)
              </p>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <button onClick={() => setShowIsoSurvey(true)} className="hover:text-indigo-600 font-semibold flex items-center space-x-1 transition-colors">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>ISO 25010 Evaluation</span>
              </button>
              <span>•</span>
              <span className="text-slate-400 font-mono">Build v2026.8.9</span>
            </div>
          </div>
        </footer>

        {/* Active Modals & Floating Quick Actions Menu */}
        <div className="print:hidden">
          <QuickActionsMenu />
          <OfflineIndicator />
        </div>
        {showIsoSurvey && <IsoEvaluationModal onClose={() => setShowIsoSurvey(false)} />}
        {showReports && <ReportsModal onClose={() => setShowReports(false)} />}

      </div>
  );
};

export default function App() {
  return (
    <DairySyncProvider>
      <MainLayout />
    </DairySyncProvider>
  );
}
