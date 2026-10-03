import React, { useState, useRef } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { 
  X, 
  User, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Mail,
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
  const { currentUser, updateUserProfile } = useDairySync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(currentUser.name || '');
  const [title, setTitle] = useState(currentUser.title || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [nickname, setNickname] = useState(currentUser.nickname || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    const updates = {
        name: name.trim(),
        title: title.trim(),
        username: username.trim(),
        nickname: nickname.trim(),
        avatar: avatar.trim() || currentUser.avatar
      };
    const result = updateUserProfile(currentUser.id, updates);
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }
    setSuccessMsg('Profile updated successfully.');
    setTimeout(onClose, 900);
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
              <h2 className="text-lg font-extrabold tracking-tight">Edit Profile</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Update display information and profile picture
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
              @{username || currentUser.username} • {currentUser.email}
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

          {/* Firebase credentials are managed by Authentication, not the profile document. */}
          <div className="border-t border-slate-200 pt-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-900">
              <strong>Firebase Authentication manages this account’s email and password.</strong> Use the Forgot Password link on the sign-in screen to reset credentials. This editor changes display information only.
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>Firebase account: <strong className="font-mono">{currentUser.email}</strong></span>
            </div>
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
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
