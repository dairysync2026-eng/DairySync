import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { ShieldAlert, UserCheck, Factory, ShoppingCart, Truck, Terminal, ArrowRight, UserCog, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

export const RoleBadge: React.FC = () => {
  const { 
    currentRole, 
    currentUser, 
    isDeveloperActive, 
    loginAsRoleUser, 
    returnToDeveloperAccount,
    users 
  } = useDairySync();

  const [showFastSwitcher, setShowFastSwitcher] = useState(false);

  const getRoleBadgeConfig = () => {
    switch (currentRole) {
      case 'developer':
        return {
          icon: Terminal,
          bg: 'bg-slate-900 border-indigo-500 text-white',
          badgeText: 'Lead Developer & Super Admin (Master All-Access)',
          desc: 'Unrestricted master access: all 7 subsystems unlocked, live RBAC role simulation & full administrative operations.',
          isDev: true
        };
      case 'director':
        return {
          icon: ShieldAlert,
          bg: 'bg-purple-50 border-purple-200 text-purple-900',
          badgeText: 'Director / PMO Supervisor View',
          desc: 'High-level executive oversight, budget allocation, production planning & ISO 25010 compliance monitoring.',
          isDev: false
        };
      case 'procurement':
        return {
          icon: Truck,
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeText: 'Admin Asst IV (Procurement) View',
          desc: 'Managing raw ingredient Reorder Points (ROP), supplier purchase orders & packaging procurement.',
          isDev: false
        };
      case 'plant_manager':
        return {
          icon: Factory,
          bg: 'bg-teal-50 border-teal-200 text-teal-900',
          badgeText: 'Plant Manager / Internal Custodian View',
          desc: 'Inventory reconciliation, WIP batch scheduling, cold storage monitoring & FEFO compliance.',
          isDev: false
        };
      case 'production_staff':
        return {
          icon: UserCheck,
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          badgeText: 'Production Staff View',
          desc: 'Requesting raw stock, logging daily ingredient consumption & advancing batch processing steps.',
          isDev: false
        };
      case 'store_outlet':
        return {
          icon: ShoppingCart,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeText: 'MMSU Dairy Box Store Outlet View',
          desc: 'Walk-in retail POS sales entry, real-time central cold-storage stock sync & demand logging.',
          isDev: false
        };
    }
  };

  const config = getRoleBadgeConfig();
  const Icon = config.icon;

  const roleLabels: Record<UserRole, { short: string; roleName: string }> = {
    developer: { short: 'DEV', roleName: 'Lead Dev Command' },
    director: { short: 'PMO', roleName: 'Director Dashboard' },
    procurement: { short: 'ROP', roleName: 'Procurement Desk' },
    plant_manager: { short: 'PLANT', roleName: 'Plant Manager' },
    production_staff: { short: 'PROD', roleName: 'Production Staff' },
    store_outlet: { short: 'POS', roleName: 'Store Outlet POS' },
  };

  return (
    <div className="space-y-2.5">
      {/* Developer Superuser Active Supervisory Strip */}
      {isDeveloperActive && currentRole !== 'developer' && (
        <div className="p-3.5 bg-slate-900 text-white rounded-3xl border-2 border-indigo-500 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-xs">
              <Terminal className="w-4 h-4 text-indigo-200" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700">
                  Lead Dev Master Session Active
                </span>
                <span className="text-xs text-slate-300 font-medium hidden sm:inline truncate">
                  Masquerading as <strong>{currentUser.name}</strong> ({roleLabels[currentRole]?.roleName})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                Superuser clearance active: Switch freely into other user dashboards without re-logging in
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto justify-end shrink-0">
            {/* Direct Switcher Quick Pills */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              {users.map(u => (
                <button
                  key={u.role}
                  onClick={() => loginAsRoleUser(u.role)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    currentRole === u.role
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={`Switch directly to ${u.name} (${u.title})`}
                >
                  {roleLabels[u.role]?.short || u.role}
                </button>
              ))}
            </div>

            {/* Switch Account dropdown toggle button */}
            <div className="relative">
              <button
                onClick={() => setShowFastSwitcher(!showFastSwitcher)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <span>Switch User</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFastSwitcher ? 'rotate-180' : ''}`} />
              </button>

              {showFastSwitcher && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-[10px] uppercase font-black text-indigo-700 tracking-wider">
                      Switch Dashboard Instantly
                    </p>
                    <p className="text-[10px] text-slate-500">No logout or credentials required</p>
                  </div>
                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.role}
                        onClick={() => {
                          loginAsRoleUser(u.role);
                          setShowFastSwitcher(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center space-x-2.5 transition-all ${
                          currentRole === u.role 
                            ? 'bg-indigo-600 text-white font-bold' 
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <div className="truncate flex-1">
                          <p className="font-bold leading-tight truncate">
                            {u.nickname ? `${u.name} (${u.nickname})` : u.name}
                          </p>
                          <p className={`text-[9px] truncate ${currentRole === u.role ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {u.title}
                          </p>
                        </div>
                        {currentRole === u.role && (
                          <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Return to Developer Button */}
            <button
              onClick={returnToDeveloperAccount}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Return to Lead Developer Command Center"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Lead Dev Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Role Operations Card */}
      <div className={`p-4 rounded-3xl border-2 ${config.bg} flex items-center justify-between shadow-sm`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-2xl ${config.isDev ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800'} border border-slate-200/20 shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`font-extrabold text-sm tracking-tight ${config.isDev ? 'text-white' : 'text-slate-900'}`}>{config.badgeText}</span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.isDev ? 'bg-indigo-950 text-indigo-200 border border-indigo-700' : 'bg-white border border-slate-200 text-slate-700'} uppercase font-mono`}>
                User: {currentUser.nickname ? `${currentUser.name} (${currentUser.nickname})` : currentUser.name}
              </span>
            </div>
            <p className={`text-xs ${config.isDev ? 'text-slate-300' : 'text-slate-600'} mt-0.5 leading-normal font-medium`}>{config.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
