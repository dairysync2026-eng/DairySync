import React, { useState, useEffect } from 'react';
import { DairySyncProvider, useDairySync } from './context/DairySyncContext';
import { Header } from './components/Header';
import { RoleBadge } from './components/RoleBadge';
import { Dashboard } from './components/Dashboard';
import { RawIngredients } from './components/RawIngredients';
import { PmoInventory } from './components/PmoInventory';
import { WipProduction } from './components/WipProduction';
import { WipInventory } from './components/WipInventory';
import { FinishedGoods } from './components/FinishedGoods';
import { ProductRecipes } from './components/ProductRecipes';
import { SupplyDemandSync } from './components/SupplyDemandSync';
import { Procurement } from './components/Procurement';
import { DairyBoxPos } from './components/DairyBoxPos';
import { AuditTrail } from './components/AuditTrail';
import { LoginPage } from './components/LoginPage';
import { AccessRestricted } from './components/AccessRestricted';
import { ScrollableTabBar } from './components/ScrollableTabBar';
import { 
  LayoutDashboard, 
  Package, 
  Archive,
  Layers, 
  ClipboardCheck,
  Snowflake, 
  ClipboardList,
  TrendingUp, 
  Truck, 
  ShoppingCart,
  Lock,
  ShieldCheck,
  BookOpen,
  UserCog
} from 'lucide-react';
import { SystemDocumentation } from './components/SystemDocumentation.tsx';
import { SystemAdministration } from './components/SystemAdministration';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isAuthReady, canAccessTab, currentRole } = useDairySync();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Auto-redirect if current tab becomes unauthorized on role switch
  useEffect(() => {
    if (!canAccessTab(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentRole]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300 text-sm">Checking secure session…</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'ingredients', label: currentRole === 'plant_manager' ? 'Raw Materials' : 'Raw Ingredients', icon: Package },
    { id: 'pmo_inventory', label: 'PMO Inventory', icon: Archive },
    { id: 'wip', label: 'WIP Batches', icon: Layers },
    { id: 'wip_inventory', label: 'WIP Inventory', icon: ClipboardCheck },
    { id: 'finished', label: currentRole === 'plant_manager' ? 'Finished Goods' : 'Cold Storage', icon: Snowflake },
    { id: 'recipes', label: 'Product Recipes', icon: ClipboardList },
    { id: 'sync', label: 'Supply and demand', icon: TrendingUp },
    { id: 'procurement', label: 'ROP Procurement', icon: Truck },
    { id: 'pos', label: currentRole === 'plant_manager' ? 'Sales History' : 'Dairy Box POS', icon: ShoppingCart },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'documentation', label: 'User Manual', icon: BookOpen },
    { id: 'administration', label: 'System Administration', icon: UserCog }
  ];

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navbar */}
        <div className="print:hidden">
          <Header />
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
                  />
                )}

                {activeTab === 'ingredients' && <RawIngredients />}

                {activeTab === 'pmo_inventory' && <PmoInventory />}

                {activeTab === 'wip' && <WipProduction />}

                {activeTab === 'wip_inventory' && <WipInventory />}

                {activeTab === 'finished' && <FinishedGoods onNavigateTab={setActiveTab} />}

                {activeTab === 'recipes' && <ProductRecipes />}

                {activeTab === 'sync' && <SupplyDemandSync />}

                {activeTab === 'procurement' && <Procurement />}

                {activeTab === 'pos' && (
                  currentRole === 'director' || currentRole === 'plant_manager'
                    ? <DairyBoxPos salesHistoryOnly />
                    : <DairyBoxPos />
                )}

                {activeTab === 'audit' && <AuditTrail />}

                {activeTab === 'documentation' && <SystemDocumentation />}

                {activeTab === 'administration' && <SystemAdministration />}
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
              <span className="text-slate-400 font-mono">Build v2026.8.9</span>
            </div>
          </div>
        </footer>

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
