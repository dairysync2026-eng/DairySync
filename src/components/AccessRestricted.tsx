import React from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { UserRole } from '../types';
import { ShieldAlert, Lock, ArrowLeft, LogOut, CheckCircle2, Building2, Terminal, RefreshCw } from 'lucide-react';

interface AccessRestrictedProps {
  requiredTab: string;
  onNavigateHome: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredTab,
  onNavigateHome
}) => {
  const { 
    currentRole, 
    currentUser, 
    logout, 
    isDeveloperActive, 
    returnToDeveloperAccount,
    loginAsRoleUser,
    users 
  } = useDairySync();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'ingredients': return 'Raw Ingredients Inventory';
      case 'wip': return 'WIP Production Batches';
      case 'finished': return 'Cold Storage Finished Goods';
      case 'sync': return 'Supply & Demand Synchronization';
      case 'procurement': return 'ROP Procurement Management';
      case 'pos': return 'Dairy Box Point of Sale (POS)';
      case 'audit': return 'Operational & Regulatory Audit Trail';
      default: return tab.toUpperCase();
    }
  };

  const getAuthorizedRoles = (tab: string): string[] => {
    switch (tab) {
      case 'ingredients': return ['Developer (Superuser)', 'Director', 'Plant Manager', 'Production Staff', 'Procurement'];
      case 'wip': return ['Developer (Superuser)', 'Director', 'Plant Manager', 'Production Staff'];
      case 'finished': return ['Developer (Superuser)', 'Director', 'Plant Manager', 'Store Outlet'];
      case 'sync': return ['Developer (Superuser)', 'Director / PMO Supervisor'];
      case 'procurement': return ['Developer (Superuser)', 'Director', 'Admin Asst IV (Procurement)', 'Plant Manager'];
      case 'pos': return ['Developer (Superuser)', 'Director', 'Dairy Box Store Outlet'];
      case 'audit': return ['Lead Developer (Superuser)', 'Director / PMO Supervisor'];
      default: return ['Developer (Superuser)', 'Director'];
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white border-2 border-rose-200 rounded-3xl shadow-lg space-y-6 text-slate-900">
      
      <div className="flex items-start space-x-4">
        <div className="p-3.5 bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <span className="text-xs text-slate-400 font-mono">RBAC Security Rule</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Permission Denied for {getTabTitle(requiredTab)}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
            Your current logged-in account does not possess the required operational privileges to view or manage this section.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Your Current Account */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Your Logged-In Profile</span>
          <div className="flex items-center space-x-3">
            <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
            <div>
              <p className="font-extrabold text-xs text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{currentUser.title}</p>
            </div>
          </div>
        </div>

        {/* Authorized Roles for This View */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
          <span className="text-[10px] uppercase font-extrabold text-indigo-500 tracking-wider block">Authorized Roles for This View</span>
          <div className="space-y-1">
            {getAuthorizedRoles(requiredTab).map((roleName, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{roleName}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onNavigateHome}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow transition-all flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Command Center</span>
        </button>

        {isDeveloperActive ? (
          <button
            onClick={returnToDeveloperAccount}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Return to Lead Dev Dashboard</span>
          </button>
        ) : (
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Switch / Change Staff Account</span>
          </button>
        )}
      </div>

    </div>
  );
};
