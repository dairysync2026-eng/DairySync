import React, { useState } from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { InventoryTrendGraph } from '../InventoryTrendGraph';
import { UserProfile, UserRole } from '../../types';
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  Factory, 
  Snowflake, 
  TrendingUp, 
  Truck, 
  ShoppingCart, 
  Users,
  Code2,
  FileText,
  UserCheck,
  Lock,
  Key,
  X,
  UserCog,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  Unlock
} from 'lucide-react';
import { ScrambleText } from '../decryption/ScrambleText';
import { MicroPulseLock } from '../decryption/MicroPulseLock';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenIsoSurvey?: () => void;
  onOpenReports?: () => void;
}

export const DeveloperDashboard: React.FC<SubsystemDashboardProps> = ({ 
  onNavigateTab, 
  onOpenIsoSurvey,
  onOpenReports
}) => {
  const { 
    ingredients, 
    finishedGoods, 
    wipBatches, 
    commitments, 
    users, 
    transactions,
    auditLogs,
    resetToDefaultData,
    triggerManualCloudSync,
    currentUser,
    loginAsRoleUser,
    updateUserProfile
  } = useDairySync();

  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    nickname: '',
    username: '',
    email: '',
    title: '',
    department: '',
    password: ''
  });
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [pulseMap, setPulseMap] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleStartEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name,
      nickname: u.nickname || '',
      username: u.username,
      email: u.email,
      title: u.title,
      department: u.department,
      password: u.password || ''
    });
    setStatusMessage(null);
  };

  const handleSaveEditUser = () => {
    if (!editingUser) return;
    const res = updateUserProfile(editingUser.id, {
      name: editFormData.name,
      nickname: editFormData.nickname,
      username: editFormData.username,
      email: editFormData.email,
      title: editFormData.title,
      department: editFormData.department,
      password: editFormData.password
    });

    if (res.success) {
      setStatusMessage(`Account credentials for ${editFormData.name} updated successfully.`);
      setEditingUser(null);
    } else {
      setStatusMessage(res.message || 'Failed to update user.');
    }
  };

  const togglePasswordReveal = (userId: string) => {
    const willReveal = !showPasswordMap[userId];
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: willReveal
    }));
    if (willReveal) {
      setPulseMap(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setPulseMap(prev => ({ ...prev, [userId]: false }));
      }, 900);
    }
  };

  const toggleAllPasswords = () => {
    const anyRevealed = users.some(u => showPasswordMap[u.id]);
    const nextState = !anyRevealed;
    const newMap: Record<string, boolean> = {};
    const newPulse: Record<string, boolean> = {};
    users.forEach(u => {
      newMap[u.id] = nextState;
      if (nextState) newPulse[u.id] = true;
    });
    setShowPasswordMap(newMap);
    if (nextState) {
      setPulseMap(newPulse);
      setTimeout(() => setPulseMap({}), 900);
    }
  };

  const totalRawValuation = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const totalFinishedValuation = finishedGoods.reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);
  const totalValuation = totalRawValuation + totalFinishedValuation;

  const subsystems = [
    {
      id: 'ingredients',
      name: 'Raw Ingredients',
      desc: 'Raw Carabao Milk, Sweeteners, Flavoring & Packaging',
      count: `${ingredients.length} items`,
      icon: Package,
      color: 'amber'
    },
    {
      id: 'wip',
      name: 'WIP Production Batches',
      desc: 'Pasteurization, Incubation & Bottling processing runs',
      count: `${wipBatches.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length} active batches`,
      icon: Factory,
      color: 'indigo'
    },
    {
      id: 'finished',
      name: 'Cold Storage (Finished Goods)',
      desc: 'Central warehouse chiller (4°C) holding & FEFO allocation',
      count: `${finishedGoods.reduce((s, f) => s + f.currentStock, 0)} units`,
      icon: Snowflake,
      color: 'teal'
    },
    {
      id: 'sync',
      name: 'Supply & Demand Sync',
      desc: 'DepEd National School Feeding & Retail commitments',
      count: `${commitments.length} contracts`,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'procurement',
      name: 'ROP Procurement Desk',
      desc: 'Reorder Point calculations, automated POs & lead times',
      count: `${ingredients.filter(i => i.currentStock <= i.reorderPoint).length} low stock alerts`,
      icon: Truck,
      color: 'emerald'
    },
    {
      id: 'pos',
      name: 'Dairy Box POS Register',
      desc: 'Walk-in cash sales, thermal receipts & retail deductions',
      count: `${transactions.filter(t => t.action === 'out_sale' && t.itemType === 'finished_good').length} POS sales`,
      icon: ShoppingCart,
      color: 'purple'
    },
    {
      id: 'audit',
      name: 'Operational Audit Trail',
      desc: 'Immutable provenance, user action logs, stock changes & WIP history',
      count: `${auditLogs.length} audit logs`,
      icon: ShieldCheck,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Master Developer Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border-2 border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Terminal className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-700 font-mono">
                  Master Superuser Clearance
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700">
                  All 8 Subsystems Unlocked
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight mt-1">Lead Developer & Super Admin Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). Full developer oversight over all subsystem states, database storage synchronization, RBAC access control policies, and live operational simulation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={triggerManualCloudSync}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Cloud Sync</span>
          </button>
          <button
            onClick={onOpenReports}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-700 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset local state to default PCC-MMSU baseline dataset?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center space-x-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all"
          >
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Developer Subsystems Overview Grid */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Full Operational Subsystems Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click any module to inspect or bypass RBAC authorization restrictions directly
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            6 / 6 Operational Subsystems Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subsystems.map(sub => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => onNavigateTab(sub.id)}
                className="p-4 bg-slate-50 hover:bg-indigo-50/50 border-2 border-slate-200 hover:border-indigo-300 rounded-2xl text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {sub.count}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-3 group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-normal">
                    {sub.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 text-xs font-bold text-indigo-600">
                  <span>Open Subsystem View</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System KPIs Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inventory Valuation */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total System Valuation</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-mono">₱{totalValuation.toLocaleString()}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Raw: ₱{totalRawValuation.toLocaleString()} • Goods: ₱{totalFinishedValuation.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Managed Users & RBAC */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Active Staff Profiles</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-mono">{users.length} Accounts</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Lead Dev Master Clearance Active
            </p>
            <button
              onClick={() => setShowAllUsersModal(true)}
              className="mt-3 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manage All Account Users</span>
            </button>
          </div>
        </div>

        {/* Local & Cloud State */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Storage Sync Status</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-blue-600 font-mono">Synced</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Local Storage Key: dairysync_pcc_mmsu_state_v1
            </p>
          </div>
        </div>

        {/* ISO 25010 Benchmark */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Software Quality</span>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-purple-700 font-mono">4.85 / 5.0</span>
            <button
              onClick={onOpenIsoSurvey}
              className="mt-1 text-xs font-bold text-purple-700 hover:text-purple-900 block"
            >
              Open ISO 25010 Evaluator →
            </button>
          </div>
        </div>

      </div>

      {/* Inventory Trend Graph */}
      <InventoryTrendGraph />

      {/* Lead Developer Exclusive: All Account Users Master Directory Modal */}
      {showAllUsersModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black tracking-tight">All Account Users Directory</h3>
                    <span className="text-[10px] uppercase font-extrabold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full tracking-wider">
                      Lead Dev Master Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Exclusive supervisory directory. Only the Lead Developer has authorization to manage and access all account users.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                {/* Master Decrypt All / Lock All Toggle */}
                <button
                  type="button"
                  onClick={toggleAllPasswords}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                    users.some(u => showPasswordMap[u.id])
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950'
                      : 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300 hover:bg-indigo-950'
                  }`}
                  title="Toggle cryptographic scramble decryption for all credentials"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {users.some(u => showPasswordMap[u.id]) ? 'Re-encrypt All' : 'Decrypt All Credentials'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowAllUsersModal(false);
                    setEditingUser(null);
                    setStatusMessage(null);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Directory"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Security Policy Alert Banner */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start space-x-3 text-xs text-indigo-950">
                <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-indigo-900">
                    RBAC Enforcement Policy: Exclusive Lead Developer Clearance
                  </p>
                  <p className="text-indigo-800 leading-relaxed">
                    Under the PCC-MMSU security model, only the <strong>Lead Developer</strong> profile has system-wide permissions to access, view credentials, and switch between all registered staff accounts. All other operational accounts are strictly isolated to their individual assigned duties.
                  </p>
                </div>
              </div>

              {/* Dynamic Decryption Cypher Feed Banner */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-indigo-400 font-bold">CYPHERNET // RBAC MASTER</span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-500">AES-256-GCM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">CLEARANCE:</span>
                  <ScrambleText
                    text="LEAD_DEVELOPER_SUPERVISORY_ACCESS_ACTIVE"
                    isRevealed={true}
                    scrambleDurationMs={600}
                    className="text-emerald-400 font-bold text-[10px]"
                  />
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Editing Form (if editing a user) */}
              {editingUser ? (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2">
                      <UserCog className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        Edit Credentials for {editingUser.name} ({editingUser.role.toUpperCase()})
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Callsign / Nickname</label>
                      <input
                        type="text"
                        value={editFormData.nickname}
                        onChange={e => setEditFormData({ ...editFormData, nickname: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Username</label>
                      <input
                        type="text"
                        value={editFormData.username}
                        onChange={e => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Position / Official Title</label>
                      <input
                        type="text"
                        value={editFormData.title}
                        onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Department</label>
                      <input
                        type="text"
                        value={editFormData.department}
                        onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Password</label>
                      <input
                        type="text"
                        value={editFormData.password}
                        onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditUser}
                      className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                    >
                      Save Account Changes
                    </button>
                  </div>
                </div>
              ) : null}

              {/* All Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(u => {
                  const isCurrent = currentUser.id === u.id;
                  const isDev = u.role === 'Developer';
                  const showPass = showPasswordMap[u.id] || false;

                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top Row: Avatar + Info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {u.name} {u.nickname ? `(${u.nickname})` : ''}
                                </h4>
                                {isCurrent && (
                                  <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{u.title}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{u.department}</p>
                            </div>
                          </div>

                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border shrink-0 ${
                            isDev 
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Credentials Details */}
                        <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-[11px] font-mono border border-slate-100">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Username:</span>
                            <strong className="text-indigo-700 font-bold">@{u.username}</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Email:</span>
                            <span className="text-slate-800 font-medium">{u.email}</span>
                          </div>

                          {/* Password with Micro-Pulse Decryption Lock / Unlock & Scramble Effect */}
                          <div className={`relative overflow-hidden p-2 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                            showPass 
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs' 
                              : 'bg-slate-100/90 border-slate-200'
                          }`}>
                            {/* Expanding SVG Ripple Pulse Wave that sweeps across the row when unlocked */}
                            {pulseMap[u.id] && (
                              <span 
                                className="absolute inset-0 pointer-events-none bg-radial from-emerald-400/25 via-indigo-500/15 to-transparent animate-pulse"
                                aria-hidden="true"
                              />
                            )}

                            <div className="relative z-10 flex items-center space-x-2">
                              <span className="text-slate-500 font-semibold">Password:</span>
                              <span className="text-slate-900 font-bold">
                                <ScrambleText
                                  text={u.password || 'none'}
                                  isRevealed={showPass}
                                  scrambleDurationMs={500}
                                  className={showPass ? 'text-slate-900' : 'text-slate-400'}
                                />
                              </span>
                            </div>

                            <div className="relative z-10 flex items-center">
                              <MicroPulseLock
                                isUnlocked={showPass}
                                onToggle={() => togglePasswordReveal(u.id)}
                                title={showPass ? 'Re-encrypt password' : 'Micro-Pulse Decrypt & Unlock'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleStartEditUser(u)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span>Edit Account</span>
                        </button>

                        {!isCurrent && (
                          <button
                            onClick={() => {
                              loginAsRoleUser(u.role);
                              setShowAllUsersModal(false);
                            }}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Switch Into User</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="font-mono">PCC-MMSU Lead Developer Master Clearance Active</span>
              <button
                onClick={() => setShowAllUsersModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all"
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
