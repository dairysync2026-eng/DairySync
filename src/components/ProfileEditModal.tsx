import React, { useState, useRef } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { 
  X, 
  User, 
  Camera, 
  Upload, 
  Lock, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ProfileEditModalProps {
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ onClose }) => {
  const { currentUser, updateUserProfile, verifyUserPassword } = useDairySync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(currentUser.name || '');
  const [title, setTitle] = useState(currentUser.title || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [nickname, setNickname] = useState(currentUser.nickname || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [email, setEmail] = useState(currentUser.email || '');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Authentication process states for sensitive changes (email / password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [codeCountdown, setCodeCountdown] = useState(0);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if sensitive credentials have changed
  const isEmailChanged = email.trim().toLowerCase() !== (currentUser.email || '').trim().toLowerCase();
  const isPasswordChanged = newPassword.trim().length > 0;
  const requiresAuthentication = isEmailChanged || isPasswordChanged;

  // Handle local file upload for profile picture
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 2MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger 6-digit OTP verification email simulation
  const handleSendVerificationCode = () => {
    if (!currentPassword) {
      setErrorMsg('Please enter your current password first before requesting an authentication code.');
      return;
    }

    const isValidPass = verifyUserPassword(currentUser.id, currentPassword);
    if (!isValidPass) {
      setErrorMsg('Current password verification failed. Please check your current password.');
      return;
    }

    // Generate 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(randomCode);
    setCodeCountdown(60);
    setErrorMsg(null);

    // Timer countdown
    const interval = setInterval(() => {
      setCodeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full official name (at least 2 characters).');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter an official title.');
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }

    // Sensitive field authentication check
    if (requiresAuthentication) {
      if (!currentPassword) {
        setErrorMsg('Authentication required: Enter your current password to authorize email or password modifications.');
        return;
      }

      const isCurrentPasswordCorrect = verifyUserPassword(currentUser.id, currentPassword);
      if (!isCurrentPasswordCorrect) {
        setErrorMsg('Authentication Failed: The current password you entered is incorrect.');
        return;
      }

      if (isEmailChanged) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setErrorMsg('Please enter a valid email address.');
          return;
        }
      }

      if (isPasswordChanged) {
        if (newPassword.length < 6) {
          setErrorMsg('New password must be at least 6 characters long.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMsg('New password and confirmation do not match.');
          return;
        }
      }

      // If a verification code was dispatched, verify it
      if (sentCode && verificationCode.trim() !== sentCode) {
        setErrorMsg('The 6-digit authentication security code entered is invalid or expired.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const updates: any = {
        name: name.trim(),
        title: title.trim(),
        username: username.trim(),
        nickname: nickname.trim(),
        avatar: avatar.trim() || currentUser.avatar
      };

      if (isEmailChanged) {
        updates.email = email.trim();
      }

      if (isPasswordChanged) {
        updates.password = newPassword.trim();
      }

      const result = updateUserProfile(currentUser.id, updates);

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        setSuccessMsg('Profile and credentials updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Edit Profile & Credentials</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Update display information, profile picture, username, and authenticated credentials
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Profile Card Preview */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center space-x-4">
          <div className="relative group">
            <img 
              src={avatar || currentUser.avatar} 
              alt={name.trim() || currentUser.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              title="Change Picture"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base truncate">
                {name.trim() || currentUser.name}
              </h3>
              {nickname && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  "{nickname}"
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-600 truncate mt-0.5">
              {title || 'No title set'}
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              @{username || currentUser.username} • {email || currentUser.email}
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
            {currentUser.role}
          </span>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Section 1: Profile Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Identity & Display Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Official Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Edward Allen, Engr. Alexis Vance, Maria Santos"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 shadow-sm"
                  required
                />
              </div>

              {/* Official Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Center Director / PMO Supervisor"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Nickname / Alias */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nickname / Preferred Alias</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Doc Edward, Selwyn, Chief"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. director, selwyn_mmsu"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                />
              </div>

              {/* Department (Read only) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={currentUser.department}
                  disabled
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

            </div>

            {/* Profile Picture Management */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">Profile Picture</label>
              
              <div className="space-y-3">
                {/* Direct URL input and File upload */}
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Enter image URL or choose preset below..."
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Avatar Presets Picker */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Or select from curated portraits:</span>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatar(presetUrl)}
                        className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          avatar === presetUrl ? 'border-indigo-600 scale-105 shadow-md' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-10 h-10 object-cover" />
                        {avatar === presetUrl && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Security Credentials & Authentication Process */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Security & Credential Management</span>
              </h3>
              {requiresAuthentication && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  <span>Auth Verification Active</span>
                </span>
              )}
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Authentication Security Protocol:</strong> Changing your <strong>Email</strong> or <strong>Password</strong> requires verifying your current password. An authentication verification confirmation will be executed before changes apply.
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Account Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@pcc-mmsu.gov.ph"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              {isEmailChanged && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center space-x-1">
                  <span>* Email change detected. Current password verification required.</span>
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full text-xs px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full text-xs px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Authentication Verification Section (Triggered if Email or Password is changed) */}
            {requiresAuthentication && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3.5 animate-in fade-in">
                <div className="flex items-center space-x-2 text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wide">
                    Authentication Verification Gate
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Current Password Verification <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password to authorize changes"
                      className="w-full text-xs px-3.5 py-2.5 pr-9 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional 2FA simulation code */}
                <div className="pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300">
                      Security Code Verification (Optional 2-Step Check)
                    </label>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={codeCountdown > 0}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 disabled:text-slate-500 flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${codeCountdown > 0 ? 'animate-spin' : ''}`} />
                      <span>{codeCountdown > 0 ? `Resend in ${codeCountdown}s` : 'Send Code to Email'}</span>
                    </button>
                  </div>

                  {sentCode && (
                    <div className="mb-2 p-2 rounded-xl bg-amber-950/80 border border-amber-800/80 text-[11px] text-amber-300 flex items-center justify-between">
                      <span>Simulated Email OTP Sent to {currentUser.email}:</span>
                      <strong className="font-mono text-xs bg-amber-900 px-2 py-0.5 rounded text-amber-100">{sentCode}</strong>
                    </div>
                  )}

                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder={sentCode ? "Enter the 6-digit code sent above" : "Click 'Send Code to Email' or authorize via password above"}
                    maxLength={6}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono tracking-widest"
                  />
                </div>

              </div>
            )}

          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Profile & Credentials</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
