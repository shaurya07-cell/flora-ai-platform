import React from 'react';
import { X, Key, ShieldAlert, CheckCircle2, Code2 } from 'lucide-react';
import { Button } from '../Button';

export const OAuthGuideModal = ({ isOpen, onClose, provider = 'Google' }) => {
  if (!isOpen) return null;

  const isGoogle = provider.toLowerCase().includes('google');
  const envVars = isGoogle
    ? 'GOOGLE_CLIENT_ID="your_google_client_id"\nGOOGLE_CLIENT_SECRET="your_google_client_secret"'
    : 'GITHUB_CLIENT_ID="your_github_client_id"\nGITHUB_CLIENT_SECRET="your_github_client_secret"';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-surface border border-brand-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-left text-brand-text relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-brand-muted hover:text-brand-text hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-brand-border pb-4">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-primary">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-text">{provider} OAuth Integration Boundary</h3>
            <p className="text-xs text-brand-muted">Server configuration status & developer setup guide</p>
          </div>
        </div>

        {/* Body content */}
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>OAuth Credentials Not Set:</strong> The FLORA backend API server has OAuth endpoints ready, but live {provider} API Client IDs have not been set in the server <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file.
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-brand-text flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-accent" /> Developer Setup Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-brand-muted leading-relaxed pl-1">
              <li>Open <code className="font-mono text-brand-text bg-slate-100 px-1 rounded">flora-server/.env</code> in your editor.</li>
              <li>Add your developer credentials:</li>
            </ol>
          </div>

          {/* Environment Snippet */}
          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded border border-slate-800 relative">
            <pre className="whitespace-pre-wrap">{envVars}</pre>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
            <span>Email/Password authentication & local developer sign-in are fully active!</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-brand-border">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>

      </div>
    </div>
  );
};

export default OAuthGuideModal;
