import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { AuthHandshakeModal } from './decryption/AuthHandshakeModal';

export const LoginPage: React.FC = () => {
  const { users, login, authError } = useDairySync();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Authentication Handshake State
  const [isHandshaking, setIsHandshaking] = useState(false);
  const [handshakeStatus, setHandshakeStatus] = useState<'authenticating' | 'success' | 'error'>('authenticating');
  const [handshakeError, setHandshakeError] = useState<string | null>(null);
  const [handshakeUser, setHandshakeUser] = useState<{ name: string; role: string } | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your email or username.');
      return;
    }

    // The local directory is used for username lookup and display only.
    const matched = users.find(u => 
      u.email.toLowerCase() === cleanId.toLowerCase() || 
      u.username.toLowerCase() === cleanId.toLowerCase()
    );
    setHandshakeUser(matched ? { name: matched.name, role: matched.role } : { name: cleanId, role: 'Verifying account' });

    // Launch High-Tech Authentication Handshake Animation
    setIsHandshaking(true);
    setHandshakeStatus('authenticating');
    setHandshakeError(null);

    const result = await login(cleanId, password);
    if (result.success) {
      setHandshakeStatus('success');
    } else {
      setTimeout(() => {
        setHandshakeStatus('error');
        setHandshakeError(result.message);
      }, 750);
    }
  };

  const handleHandshakeComplete = () => {
    setIsHandshaking(false);
    setSuccessMessage(`Signed in as ${handshakeUser?.name || identifier}.`);
  };

  const handleDismissHandshakeError = () => {
    setIsHandshaking(false);
    setErrorMessage(handshakeError);
    setHandshakeStatus('authenticating');
  };

  const handlePasswordReset = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const cleanId = identifier.trim().toLowerCase();
    const matchedUser = users.find(user => user.email.toLowerCase() === cleanId || user.username.toLowerCase() === cleanId);
    const email = matchedUser?.email || (cleanId.includes('@') ? cleanId : null);
    if (!email) {
      setErrorMessage('Enter the email address registered to your Firebase account, then request a reset link.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('If the account is registered, Firebase has sent a password reset link to its email address.');
    } catch (error) {
      const code = (error as { code?: string }).code;
      setErrorMessage(code === 'auth/operation-not-allowed'
        ? 'Password reset is unavailable because Firebase Email/Password sign-in is not enabled.'
        : 'Could not send a reset link. Check the account email and Firebase Auth configuration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <header className="p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/20">
              DS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  DairySync
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  PCC-MMSU
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Philippine Carabao Center at Mariano Marcos State University
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">RBAC Permission Gateway</span>
          </div>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center z-10">
        
        {/* Official Authentication Box */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">System Login</h1>
                <p className="text-xs text-slate-400 font-medium">Enter your staff credentials to log in</p>
              </div>
            </div>

            <div className="my-6 p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-start space-x-3 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Access is strictly restricted based on staff roles. Unauthenticated users cannot view or modify inventory data.
              </p>
            </div>

            {(errorMessage || authError) && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage || authError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleCustomLogin} className="space-y-4">
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Email address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. dr.domingo@pcc-mmsu.gov.ph or director"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 mt-2"
              >
                <span>Log In to DairySync</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full py-2 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
              >
                Forgot password? Send a Firebase reset link
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 text-center">
            <p className="text-[11px] text-slate-500">
              Need assistance? Contact PCC-MMSU IT Administration at <span className="text-slate-400 font-mono">support@pcc-mmsu.gov.ph</span>
            </p>
          </div>
        </div>

      </main>

      {/* Authentication Handshake Animation Modal */}
      <AuthHandshakeModal
        isOpen={isHandshaking}
        status={handshakeStatus}
        errorMessage={handshakeError}
        userName={handshakeUser?.name}
        userRole={handshakeUser?.role}
        onFinish={handleHandshakeComplete}
        onDismissError={handleDismissHandshakeError}
      />

      {/* Institutional Footer */}
      <footer className="p-6 border-t border-slate-800/80 text-slate-500 text-xs bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© 2026 Philippine Carabao Center at Mariano Marcos State University (PCC-MMSU)</p>
          <p className="text-[11px] text-slate-600">
            Developers: Domingo, E.T., Martinez, S.D.B., Silva, S.J.P., Yasay, J.J.O.
          </p>
        </div>
      </footer>

    </div>
  );
};
