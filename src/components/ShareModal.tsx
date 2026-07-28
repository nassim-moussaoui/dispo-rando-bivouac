import React, { useState } from 'react';
import { Share2, Copy, Check, X, Send, Sparkles } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantCount: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, participantCount }) => {
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const inviteText = `Salut les potes ! 🌲
On s'organise une rando bivouac (1 nuit / 2 jours) cet été entre le 28 Juillet et le 30 Août 2026.

Mettez vos dispo sur notre lien partagé pour qu'on trouve le meilleur week-end :
👉 ${currentUrl}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(inviteText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-emerald-100 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900 space-y-5 p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-sm">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-950">Inviter tes amis</h3>
            <p className="text-xs font-bold text-slate-500">Envoie ce lien sur WhatsApp ou Signal !</p>
          </div>
        </div>

        {/* Pre-formatted WhatsApp Message Box */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Message d'invitation prêt à l'emploi :
          </label>
          <div className="bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-100 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed font-medium">
            {inviteText}
          </div>
        </div>

        {/* Copy Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleCopyText}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
          >
            {copiedMsg ? (
              <>
                <Check className="w-4 h-4 text-emerald-100" />
                <span>Message + Lien copié ! ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le message complet</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyUrl}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 font-bold text-xs rounded-2xl border-2 border-slate-200 transition cursor-pointer"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Lien seul copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Copier seulement l'URL</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
