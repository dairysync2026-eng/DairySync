import React, { useState, useEffect } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { UserRole } from '../types';
import { 
  Bell, 
  CloudCheck, 
  Cloud, 
  Award, 
  FileText, 
  ShieldCheck, 
  User, 
  UserCog,
  ChevronDown,
  RefreshCw,
  X,
  AlertTriangle,
  Info,
  LogOut,
  Lock,
  ShieldAlert,
  Menu,
  Terminal
} from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { OfflineStatusBadge } from './pwa/OfflineIndicator';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  onOpenIsoSurvey: () => void;
  onOpenReports: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenIsoSurvey,
  onOpenReports
}) => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUser, 
    users, 
    alerts, 
    markAlertRead, 
    clearAllAlerts,
    cloudSyncStatus,
    triggerManualCloudSync,
    resetToDefaultData,
    logout,
    loginAsRoleUser,
    isDeveloperActive,
    returnToDeveloperAccount
  } = useDairySync();

  const [timeString, setTimeString] = useState('');
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' PST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read);

  const getRoleLabel = (role: UserRole) => {
    switch(role) {
      case 'developer': return 'Lead Developer & Super Admin';
      case 'director': return 'Director / PMO Supervisor';
      case 'procurement': return 'Admin Asst IV (Procurement)';
      case 'plant_manager': return 'Plant Manager / Internal Custodian';
      case 'production_staff': return 'Production Staff';
      case 'store_outlet': return 'Dairy Box Store Outlet';
    }
  };

  return (
    <header className="bg-white text-slate-900 border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Institution Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-indigo-200">
              DS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  DairySync
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  PCC-MMSU
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Philippine Carabao Center at Mariano Marcos State University
              </p>
            </div>
          </div>

          {/* PST Clock */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3.5 py-1.5 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-700 font-mono font-bold flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{timeString || '08:00:00 PST'}</span>
            </div>
          </div>

          {/* Desktop Top Actions, Offline Indicator & Role Switcher (Hidden on Mobile) */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            {/* Requirement 18: Small Status Indicator (Green for Online, Amber for Offline/Cached) */}
            <OfflineStatusBadge compact={true} />

            {/* Install PWA Button */}
            <PWAInstallButton />

            {/* ISO 25010 Quality Rating */}
            <button
              onClick={onOpenIsoSurvey}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-600 rounded-xl border border-slate-200 transition-colors"
              title="ISO 25010 Quality Evaluation Scorecard"
            >
              <Award className="w-4 h-4" />
            </button>

            {/* Reports */}
            <button
              onClick={onOpenReports}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-xl border border-slate-200 transition-colors"
              title="Generate System Reports"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Alerts Slideover / Popover */}
              {showAlertsDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border-2 border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden p-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-slate-900">System Triggers & Alerts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={clearAllAlerts}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Clear All
                      </button>
                      <button 
                        onClick={() => setShowAlertsDrawer(false)}
                        className="text-slate-400 hover:text-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1.5 p-1">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No active alerts.</p>
                    ) : (
                      alerts.map(a => (
                        <div 
                          key={a.id} 
                          onClick={() => markAlertRead(a.id)}
                          className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                            a.read ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {a.type === 'rop_triggered' || a.severity === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900">{a.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{a.message}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-1">{a.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Developer Switching Indicator when viewing another dashboard */}
            {isDeveloperActive && currentRole !== 'developer' && (
              <button
                onClick={() => setShowRoleDropdown(prev => !prev)}
                className="hidden md:flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                title="Lead Developer Active: Click to switch accounts or return to dev dashboard"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] uppercase font-black text-indigo-700 tracking-wider">Dev Active:</span>
                <span className="text-xs font-extrabold text-indigo-950">Switch User</span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            )}

            {/* Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white pl-2 pr-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all border border-slate-700"
                title="Profile & Operational Role Settings"
              >
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400" 
                />
                <div className="text-left hidden sm:block">
                  <p className="font-bold text-[11px] leading-tight">
                    {currentUser.nickname || currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] text-emerald-300 uppercase font-mono">
                    {currentUser.title ? currentUser.title.split('/')[0].trim() : getRoleLabel(currentRole).split(' ')[0]}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl z-50 p-3 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  {/* Current Active Account Card */}
                  <div className="px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img 
                        src={currentUser.avatar} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover border border-indigo-400 shadow-sm shrink-0" 
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <p className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                            {currentUser.name}
                          </p>
                          {currentUser.nickname && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 shrink-0">
                              "{currentUser.nickname}"
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-slate-600 truncate mt-0.5">{currentUser.title}</p>
                        <p className="text-[9px] font-mono text-slate-400 truncate">@{currentUser.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Action Button */}
                  <button
                    onClick={() => {
                      setShowProfileEditModal(true);
                      setShowRoleDropdown(false);
                    }}
                    className="w-full mb-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center space-x-2 shadow-md shadow-indigo-100 transition-all"
                  >
                    <UserCog className="w-4 h-4" />
                    <span>Edit Profile & Credentials</span>
                  </button>

                  {(currentRole === 'developer' || isDeveloperActive) && (
                    <>
                      <div className="px-2 py-1.5 border-b border-indigo-100 bg-indigo-50/70 rounded-xl mb-1.5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-black text-indigo-700 tracking-wider flex items-center space-x-1">
                            <ShieldAlert className="w-3 h-3 text-indigo-600 inline mr-1" />
                            <span>Lead Dev Master Clearance</span>
                          </p>
                          <p className="text-[10px] text-indigo-600/90 font-medium">Switch to any user without re-login</p>
                        </div>
                        <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                          ACTIVE
                        </span>
                      </div>

                      {currentRole !== 'developer' && (
                        <button
                          onClick={() => {
                            returnToDeveloperAccount();
                            setShowRoleDropdown(false);
                          }}
                          className="w-full mb-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-between transition-all shadow-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Return to Lead Dev Dashboard</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">DEV</span>
                        </button>
                      )}

                      <div className="space-y-1">
                        {users.map(u => (
                          <button
                            key={u.role}
                            onClick={() => {
                              loginAsRoleUser(u.role);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center space-x-3 transition-all ${
                              currentRole === u.role 
                                ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                            <div className="truncate flex-1">
                              <p className="font-bold leading-tight truncate">
                                {u.nickname ? `${u.name} (${u.nickname})` : u.name}
                              </p>
                              <p className={`text-[10px] truncate ${currentRole === u.role ? 'text-indigo-100' : 'text-slate-500'}`}>{u.title}</p>
                            </div>
                            {currentRole === u.role && (
                              <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded text-xs font-mono font-bold">
                                Active
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 font-extrabold hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out / Lock System</span>
                    </button>

                    <button
                      onClick={() => {
                        resetToDefaultData();
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-slate-500 font-medium hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-400" />
                      <span>Reset Demo Database State</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Screen Actions & Drop Down Trigger Button (Visible Only on Mobile) */}
          <div className="flex sm:hidden items-center space-x-1.5">
            {/* Quick Alerts Bell on Mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertsDrawer(!showAlertsDrawer);
                  setShowMobileMenu(false);
                }}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative"
                aria-label="View system alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Mobile Alerts Slideover */}
              {showAlertsDrawer && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border-2 border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden p-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">System Triggers & Alerts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={clearAllAlerts}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => setShowAlertsDrawer(false)}
                        className="text-slate-400 hover:text-slate-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5 p-1">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No active alerts.</p>
                    ) : (
                      alerts.map(a => (
                        <div 
                          key={a.id} 
                          onClick={() => markAlertRead(a.id)}
                          className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                            a.read ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {a.type === 'rop_triggered' || a.severity === 'critical' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900 leading-snug">{a.title}</p>
                              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{a.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drop Down Menu Button */}
            <button
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                setShowAlertsDrawer(false);
              }}
              className={`flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all ${
                showMobileMenu
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-700'
              }`}
              aria-label="Toggle mobile header dropdown menu"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                  cloudSyncStatus === 'offline' ? 'bg-amber-500' : 'bg-emerald-400'
                }`} />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                showMobileMenu ? 'rotate-180 text-white' : ''
              }`} />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Screen Drop Down Menu */}
      {showMobileMenu && (
        <div className="sm:hidden border-t-2 border-slate-200 bg-white shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-4 space-y-3.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            
            {/* Active User Account Summary Card */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3 min-w-0">
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-400 shrink-0" 
                />
                <div className="truncate">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <p className="font-extrabold text-sm text-white truncate">
                      {currentUser.name}
                    </p>
                    {currentUser.nickname && (
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-700 shrink-0">
                        "{currentUser.nickname}"
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{currentUser.title}</p>
                  <p className="text-[10px] text-emerald-400 uppercase font-mono font-bold mt-0.5">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileEditModal(true);
                  setShowMobileMenu(false);
                }}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                title="Edit Profile & Credentials"
              >
                <UserCog className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Indicators Grid */}
            <div>
              <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-1.5 px-0.5">
                Quick Tools & System Status
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Online / Offline Status Badge */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
                  <OfflineStatusBadge compact={true} />
                </div>

                {/* ISO 25010 Quality Rating */}
                <button
                  onClick={() => {
                    onOpenIsoSurvey();
                    setShowMobileMenu(false);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors"
                >
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">ISO Scorecard</span>
                </button>

                {/* System Reports */}
                <button
                  onClick={() => {
                    onOpenReports();
                    setShowMobileMenu(false);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Reports</span>
                </button>

                {/* Alerts Trigger */}
                <button
                  onClick={() => {
                    setShowAlertsDrawer(true);
                    setShowMobileMenu(false);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-800 flex items-center justify-center space-x-2 transition-colors relative"
                >
                  <Bell className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="truncate">Alerts</span>
                  {unreadAlerts.length > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {unreadAlerts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Install PWA Button on Mobile */}
            <div className="w-full">
              <PWAInstallButton />
            </div>

            {/* Lead Developer Exclusive Account Switching */}
            {(currentRole === 'developer' || isDeveloperActive) && (
              <div className="p-3 bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    <p className="text-[10px] uppercase font-black text-indigo-800 tracking-wider">
                      Lead Dev: Switch User Without Re-Login
                    </p>
                  </div>
                  <span className="text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>

                {currentRole !== 'developer' && (
                  <button
                    onClick={() => {
                      returnToDeveloperAccount();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Return to Lead Dev Dashboard</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">DEV</span>
                  </button>
                )}

                <div className="space-y-1">
                  {users.map(u => (
                    <button
                      key={u.role}
                      onClick={() => {
                        loginAsRoleUser(u.role);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center space-x-2.5 transition-all ${
                        currentRole === u.role 
                          ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-300 shrink-0" />
                      <div className="truncate flex-1">
                        <p className="font-bold leading-tight truncate">
                          {u.nickname ? `${u.name} (${u.nickname})` : u.name}
                        </p>
                        <p className={`text-[10px] truncate ${currentRole === u.role ? 'text-indigo-100' : 'text-slate-500'}`}>{u.title}</p>
                      </div>
                      {currentRole === u.role && (
                        <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Session Controls */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  resetToDefaultData();
                  setShowMobileMenu(false);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1.5 py-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Demo State</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1.5 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Lock</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEditModal && (
        <ProfileEditModal onClose={() => setShowProfileEditModal(false)} />
      )}
    </header>
  );
};
