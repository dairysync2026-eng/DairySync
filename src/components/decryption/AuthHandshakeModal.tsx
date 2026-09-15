import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, Terminal } from 'lucide-react';
import { ScrambleText } from './ScrambleText';

interface AuthHandshakeModalProps {
  isOpen: boolean;
  status: 'authenticating' | 'success' | 'error';
  errorMessage?: string | null;
  userName?: string;
  userRole?: string;
  onFinish: () => void;
  onDismissError: () => void;
}

export const AuthHandshakeModal: React.FC<AuthHandshakeModalProps> = ({
  isOpen,
  status,
  errorMessage,
  userName,
  userRole,
  onFinish,
  onDismissError
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hexToken, setHexToken] = useState('0x7F2A...9B');
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setPulseActive(false);
      return;
    }

    if (status === 'authenticating') {
      setCurrentStep(1);

      // Advance through cryptographic stages
      const t1 = setTimeout(() => {
        setCurrentStep(2);
      }, 350);

      const t2 = setTimeout(() => {
        setCurrentStep(3);
        setHexToken('0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase());
      }, 700);

      const t3 = setTimeout(() => {
        setCurrentStep(4);
        setPulseActive(true);
      }, 1050);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else if (status === 'success') {
      setCurrentStep(4);
      setPulseActive(true);
      const timer = setTimeout(() => {
        onFinish();
      }, 850);
      return () => clearTimeout(timer);
    } else if (status === 'error') {
      setCurrentStep(99); // Error step
    }
  }, [isOpen, status, onFinish]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Handshake Terminal Box */}
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden relative font-mono text-white selection:bg-indigo-500">
        
        {/* Top Header / Status bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black tracking-widest uppercase text-slate-300 ml-1">
              TLS 1.3 // RBAC HANDSHAKE
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            PCC-MMSU GATEWAY
          </span>
        </div>

        {/* Dynamic Visual Content */}
        <div className="p-6 space-y-5">
          
          {/* Central Animated Badge */}
          <div className="flex justify-center py-2 relative">
            {pulseActive && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
                <span className="w-32 h-32 rounded-full border border-emerald-400/40 animate-pulse" />
              </span>
            )}

            <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
              status === 'error'
                ? 'bg-rose-950/50 border-rose-500 text-rose-400'
                : currentStep >= 4
                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-indigo-950/40 border-indigo-500/50 text-indigo-400'
            }`}>
              {status === 'error' ? (
                <ShieldAlert className="w-10 h-10 animate-bounce" />
              ) : currentStep >= 4 ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <Lock className="w-10 h-10 animate-pulse" />
              )}
            </div>
          </div>

          {/* Verification Protocol Sequence Checklist */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
            
            {/* Step 1: Certificate & Handshake */}
            <div className={`flex items-center justify-between transition-colors ${
              currentStep >= 1 ? 'text-slate-200' : 'text-slate-600'
            }`}>
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>[1/3] VERIFYING CLIENT SIGNATURE</span>
              </div>
              <span className="font-bold text-[10px]">
                {currentStep > 1 ? (
                  <span className="text-emerald-400">PASSED</span>
                ) : status === 'error' ? (
                  <span className="text-rose-400">FAILED</span>
                ) : (
                  <span className="text-amber-400 animate-pulse">CHECKING...</span>
                )}
              </span>
            </div>

            {/* Step 2: Role Authorization Matrix */}
            <div className={`flex items-center justify-between transition-colors ${
              currentStep >= 2 ? 'text-slate-200' : 'text-slate-600'
            }`}>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>[2/3] EVALUATING RBAC MATRIX</span>
              </div>
              <span className="font-bold text-[10px]">
                {currentStep > 2 ? (
                  <span className="text-emerald-400">AUTHORIZED</span>
                ) : currentStep === 2 && status !== 'error' ? (
                  <span className="text-amber-400 animate-pulse">EVALUATING...</span>
                ) : status === 'error' ? (
                  <span className="text-rose-400">REJECTED</span>
                ) : (
                  <span className="text-slate-600">STANDBY</span>
                )}
              </span>
            </div>

            {/* Step 3: Decrypting Session Payload */}
            <div className={`flex items-center justify-between transition-colors ${
              currentStep >= 3 ? 'text-slate-200' : 'text-slate-600'
            }`}>
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>[3/3] DECRYPTING SESSION TOKENS</span>
              </div>
              <span className="font-bold text-[10px]">
                {currentStep >= 4 && status !== 'error' ? (
                  <span className="text-emerald-400">DECRYPTED</span>
                ) : currentStep === 3 && status !== 'error' ? (
                  <ScrambleText
                    text="0x8F9A2B7C"
                    isRevealed={true}
                    scrambleDurationMs={400}
                    className="text-indigo-400"
                  />
                ) : (
                  <span className="text-slate-600">••••••••</span>
                )}
              </span>
            </div>

          </div>

          {/* Status Message or Outcome Card */}
          {status === 'error' ? (
            <div className="p-3.5 bg-rose-950/50 border border-rose-500/50 rounded-2xl text-rose-300 text-xs">
              <p className="font-bold uppercase tracking-wider text-rose-200">
                Security Handshake Failure
              </p>
              <p className="text-[11px] mt-1 text-rose-300/90 leading-relaxed font-mono">
                {errorMessage || 'Signature mismatch: User credentials not recognized under PCC-MMSU security protocols.'}
              </p>
            </div>
          ) : currentStep >= 4 ? (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs text-center animate-in zoom-in-95 duration-200">
              <p className="font-extrabold uppercase tracking-widest text-emerald-200">
                AUTHENTICATION SUCCESSFUL
              </p>
              <p className="text-[11px] mt-1 text-emerald-300/90 font-mono">
                Operator Clearance: <span className="text-white font-bold">{userName || 'Authorized Staff'}</span> {userRole ? `(${userRole.toUpperCase()})` : ''}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>CIPHER: AES-256-GCM</span>
              <span className="text-indigo-400">{hexToken}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {status === 'error' ? (
              <button
                type="button"
                onClick={onDismissError}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20"
              >
                Return to Login Credentials
              </button>
            ) : currentStep >= 4 ? (
              <button
                type="button"
                onClick={onFinish}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                Accessing Dashboard Now...
              </button>
            ) : (
              <div className="w-full text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Negotiating cryptographic clearance handshake...</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
