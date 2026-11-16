import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  ImageUp,
  KeyRound,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
  X,
} from 'lucide-react';
import { useDairySync } from '../context/DairySyncContext';
import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from '../types';
import type { ManagedAccount } from '../services/adminAccounts';
import { auth } from '../services/firebase';
import { encodeAppLogo, useAppBranding } from '../hooks/useAppBranding';

const elevatedRoles = new Set<UserRole>(['developer', 'system_admin']);
const operationalRoles = USER_ROLES.filter(role => !elevatedRoles.has(role));

export const SystemAdministration: React.FC = () => {
  const {
    users,
    currentRole,
    isOnline,
    cloudSyncStatus,
    fetchManagedAccounts,
    createManagedUser,
    updateManagedUserProfile,
    updateManagedUserRole,
    setManagedUserDisabled,
    sendManagedUserPasswordReset,
    logAuditAction,
  } = useDairySync();
  const { logoUrl, error: brandingError, isSaving: isSavingLogo, updateLogo, restoreDefaultLogo } = useAppBranding();
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', username: '', title: '', department: '' });
  const logoFileInput = useRef<HTMLInputElement>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    title: '',
    department: '',
    role: 'production_staff' as UserRole,
  });

  const isLeadDeveloper = currentRole === 'developer';
  const assignableRoles = isLeadDeveloper ? USER_ROLES : operationalRoles;

  const reloadAccounts = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setAccounts(await fetchManagedAccounts());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Managed accounts could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reloadAccounts();
  }, []);

  const profileByEmail = useMemo(
    () => new Map(users.map(user => [user.email.toLowerCase(), user])),
    [users]
  );
  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...accounts]
      .filter(account => !query ||
        account.email.toLowerCase().includes(query) ||
        account.displayName.toLowerCase().includes(query) ||
        (account.role || '').toLowerCase().includes(query)
      )
      .sort((a, b) => a.email.localeCompare(b.email));
  }, [accounts, search]);

  const activeCount = accounts.filter(account => !account.disabled).length;
  const disabledCount = accounts.length - activeCount;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    setNotice(null);
    const result = await createManagedUser({
      ...newUser,
      avatar: users[0]?.avatar || '',
    });
    setNotice({ success: result.success, message: result.message });
    if (result.success) {
      setNewUser({
        name: '',
        email: '',
        username: '',
        title: '',
        department: '',
        role: 'production_staff',
      });
    }
    await reloadAccounts();
    setIsCreating(false);
  };

  const handleRoleChange = async (account: ManagedAccount, role: UserRole) => {
    if (account.role === role) return;
    setBusyUid(account.uid);
    setNotice(null);
    const result = await updateManagedUserRole(account, role);
    setNotice({ success: result.success, message: result.message });
    await reloadAccounts();
    setBusyUid(null);
  };

  const handleStatusChange = async (account: ManagedAccount) => {
    const action = account.disabled ? 'reactivate' : 'disable';
    if (!window.confirm(`Are you sure you want to ${action} ${account.email}?`)) return;
    setBusyUid(account.uid);
    setNotice(null);
    const result = await setManagedUserDisabled(account, !account.disabled);
    setNotice({ success: result.success, message: result.message });
    await reloadAccounts();
    setBusyUid(null);
  };

  const handlePasswordReset = async (account: ManagedAccount) => {
    setBusyUid(account.uid);
    setNotice(null);
    const result = await sendManagedUserPasswordReset(account.email);
    setNotice({ success: result.success, message: result.message });
    setBusyUid(null);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice(null);
    try {
      await updateLogo(await encodeAppLogo(file));
      logAuditAction({
        category: 'security',
        subsystem: 'System Branding',
        action: 'APP_LOGO_UPDATED',
        description: 'Updated the shared DairySync app logo.',
        severity: 'success',
      });
      setNotice({ success: true, message: 'The shared app logo was updated.' });
    } catch (error) {
      setNotice({
        success: false,
        message: error instanceof Error ? error.message : 'The app logo could not be updated.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleLogoReset = async () => {
    if (!window.confirm('Restore the default DairySync app logo for everyone?')) return;
    setNotice(null);
    try {
      await restoreDefaultLogo();
      logAuditAction({
        category: 'security',
        subsystem: 'System Branding',
        action: 'APP_LOGO_RESET',
        description: 'Restored the default DairySync app logo.',
        severity: 'success',
      });
      setNotice({ success: true, message: 'The default app logo was restored.' });
    } catch (error) {
      setNotice({
        success: false,
        message: error instanceof Error ? error.message : 'The default app logo could not be restored.',
      });
    }
  };

  const startEditing = (account: ManagedAccount) => {
    const profile = profileByEmail.get(account.email.toLowerCase());
    if (!profile) {
      setNotice({ success: false, message: `No staff profile is linked to ${account.email}; refresh the directory and try again.` });
      return;
    }
    setEditingUid(account.uid);
    setEditForm({
      name: profile.name,
      username: profile.username,
      title: profile.title,
      department: profile.department,
    });
  };

  const handleProfileSave = async (account: ManagedAccount) => {
    const profile = profileByEmail.get(account.email.toLowerCase());
    if (!profile) return;
    setBusyUid(account.uid);
    setNotice(null);
    const result = await updateManagedUserProfile(profile.id, editForm);
    setNotice({ success: result.success, message: result.message });
    if (result.success) setEditingUid(null);
    setBusyUid(null);
  };

  const statusClass = (disabled: boolean) => disabled
    ? 'bg-slate-100 text-slate-600 border-slate-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-700">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">System Administration</h1>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Manage staff accounts and access. Account changes are recorded in the audit trail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void reloadAccounts()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh accounts
          </button>
        </div>
      </section>

      {currentRole === 'system_admin' && (
        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Current DairySync app logo" className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 object-contain p-1" />
              <div>
                <h2 className="text-base font-black text-slate-900">Shared app logo</h2>
                <p className="mt-1 max-w-xl text-xs text-slate-500">
                  Change the logo shown in the app header and browser tab for everyone. Installed home-screen app icons continue to use their existing artwork.
                </p>
                {brandingError && <p className="mt-1 text-xs font-semibold text-rose-700">Logo status: {brandingError}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={logoFileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={event => void handleLogoUpload(event)}
              />
              <button
                type="button"
                onClick={() => logoFileInput.current?.click()}
                disabled={isSavingLogo || !isOnline}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <ImageUp className="h-4 w-4" />
                {isSavingLogo ? 'Saving logo…' : 'Change logo'}
              </button>
              <button
                type="button"
                onClick={() => void handleLogoReset()}
                disabled={isSavingLogo || !isOnline}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restore default
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Firebase accounts</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{accounts.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Active</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Disabled</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{disabledCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <Activity className="h-3.5 w-3.5" /> System connectivity
          </p>
          <p className={`mt-2 text-sm font-bold ${isOnline ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isOnline ? 'Network online' : 'Network offline'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Admin data sync: {cloudSyncStatus}</p>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-black text-slate-900">Create staff account</h2>
        </div>
        <form onSubmit={event => void handleCreate(event)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Full name
            <input required maxLength={120} value={newUser.name} onChange={event => setNewUser({ ...newUser, name: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Email
            <input required type="email" autoComplete="email" value={newUser.email} onChange={event => setNewUser({ ...newUser, email: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Username
            <input required autoComplete="username" value={newUser.username} onChange={event => setNewUser({ ...newUser, username: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Job title
            <input value={newUser.title} onChange={event => setNewUser({ ...newUser, title: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Department
            <input value={newUser.department} onChange={event => setNewUser({ ...newUser, department: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1 text-xs font-bold text-slate-600">
            Assigned role
            <select value={newUser.role} onChange={event => setNewUser({ ...newUser, role: event.target.value as UserRole })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              {assignableRoles.map(role => <option key={role} value={role}>{USER_ROLE_LABELS[role]}</option>)}
            </select>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={isCreating || !isOnline} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
              {isCreating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              {isCreating ? 'Creating account…' : 'Create account & send setup email'}
            </button>
          </div>
        </form>
        <p className="mt-3 text-[11px] text-slate-500">
          A random temporary password is created on the server. The user receives a Firebase password-setup email; no password is displayed or stored by this page.
          {!isLeadDeveloper && ' Only the Lead Developer can grant developer or system-administrator access.'}
        </p>
      </section>

      {notice && (
        <div role="status" className={`flex items-start gap-2 rounded-2xl border p-3 text-sm font-medium ${notice.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-black text-slate-900">Account directory</h2>
            <p className="mt-1 text-xs text-slate-500">Role changes revoke refresh sessions, but an existing ID token may remain valid up to one hour. Disabling prevents future sign-ins and refreshes; existing tokens can also remain valid until expiry.</p>
          </div>
          <label className="relative block sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search users…" className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
        </div>

        {loadError && (
          <div className="m-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="font-bold">Account directory unavailable</p><p className="mt-1">{loadError}</p><p className="mt-1 text-xs">Confirm Cloud Functions are deployed and the signed-in account has administrator access.</p></div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Loading accounts…</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{accounts.length ? 'No accounts match your search.' : 'No Firebase accounts were found.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr><th className="px-4 py-3 font-extrabold">Account</th><th className="px-4 py-3 font-extrabold">Role</th><th className="px-4 py-3 font-extrabold">Status</th><th className="px-4 py-3 font-extrabold">Last sign-in</th><th className="px-4 py-3 text-right font-extrabold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map(account => {
                  const profile = profileByEmail.get(account.email.toLowerCase());
                  const role = USER_ROLES.find(item => item === account.role);
                  const isSelf = account.uid === auth.currentUser?.uid;
                  const protectedAccount = Boolean(role && elevatedRoles.has(role));
                  const canChange = isLeadDeveloper || !protectedAccount;
                  const canEditProfile = Boolean(profile) && (isLeadDeveloper || !protectedAccount);
                  const isBusy = busyUid === account.uid;
                  return (
                    <React.Fragment key={account.uid}>
                      <tr className="align-top">
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">{profile?.name || account.displayName || account.email}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{account.email}</p>
                          {!profile && <p className="mt-1 text-[10px] font-bold text-amber-700">Staff profile not linked</p>}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            aria-label={`Role for ${account.email}`}
                            value={account.role || ''}
                            disabled={isBusy || !canChange || isSelf}
                            onChange={event => {
                              const nextRole = USER_ROLES.find(item => item === event.target.value);
                              if (nextRole) void handleRoleChange(account, nextRole);
                            }}
                            className="max-w-56 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                          >
                            {!role && <option value="">Unassigned role</option>}
                            {role && <option value={role}>{USER_ROLE_LABELS[role]}</option>}
                            {assignableRoles.filter(item => item !== role).map(item => <option key={item} value={item}>{USER_ROLE_LABELS[item]}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusClass(account.disabled)}`}>
                            {account.disabled ? 'Disabled' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600">
                          {account.lastSignInTime ? new Date(account.lastSignInTime).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {canEditProfile && <button type="button" title="Edit staff profile" onClick={() => editingUid === account.uid ? setEditingUid(null) : startEditing(account)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>}
                            <button type="button" title="Send password reset email" disabled={isBusy} onClick={() => void handlePasswordReset(account)} className="rounded-lg border border-slate-200 p-2 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"><Mail className="h-4 w-4" /></button>
                            <button
                              type="button"
                              title={account.disabled ? 'Reactivate account' : 'Disable account'}
                              disabled={isBusy || isSelf || (!isLeadDeveloper && protectedAccount)}
                              onClick={() => void handleStatusChange(account)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : account.disabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingUid === account.uid && profile && (
                        <tr>
                          <td colSpan={5} className="bg-slate-50 px-4 py-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {(['name', 'username', 'title', 'department'] as const).map(field => (
                                <label key={field} className="space-y-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                  {field === 'name' ? 'Full name' : field}
                                  <input value={editForm[field]} onChange={event => setEditForm({ ...editForm, [field]: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500" />
                                </label>
                              ))}
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <button type="button" onClick={() => setEditingUid(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
                              <button type="button" disabled={isBusy} onClick={() => void handleProfileSave(account)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save profile</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            System Administrators can manage operational roles but cannot grant or modify Developer/System Administrator access. The Lead Developer provisions privileged accounts. Administrative changes are also recorded by the trusted Firebase Functions backend.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
          <KeyRound className="h-3.5 w-3.5" />
          Elevated roles cannot disable their own account; an active administrator must always remain.
        </div>
      </section>
    </div>
  );
};
