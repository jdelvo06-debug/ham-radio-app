'use client';

interface PaywallModalProps {
  darkMode: boolean;
  title?: string;
  message?: string;
  onPurchase: () => void;
  onClose: () => void;
}

const premiumFeatures = [
  'Unlimited practice questions',
  'Practice Exam, Bookmarks, and Review modes',
  'Learn mode with all lessons',
  'Analytics and progress insights',
  'Bookmarks and full question pool access',
];

export default function PaywallModal({
  darkMode,
  title = 'Unlock Ham Radio Premium',
  message = 'Go beyond the free tier with unlimited questions, advanced quiz modes, lessons, analytics, and bookmarks.',
  onPurchase,
  onClose,
}: PaywallModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
        <div className={`border-b px-6 py-6 ${darkMode ? 'border-slate-700 bg-gradient-to-br from-blue-950 to-purple-950' : 'border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50'}`}>
          <div className="mb-3 inline-flex items-center rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold tracking-wide text-amber-500">
            🔒 Premium Access
          </div>
          <h3 className="text-2xl font-black leading-tight">{title}</h3>
          <p className={`mt-3 text-sm leading-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {message}
          </p>
        </div>

        <div className="px-6 py-6">
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Premium includes
          </p>

          <div className="space-y-3">
            {premiumFeatures.map((feature) => (
              <div
                key={feature}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}
              >
                <span className="mt-0.5 text-lg text-emerald-500">✓</span>
                <span className={`text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={onPurchase}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            >
              Unlock Premium
            </button>
            <button
              onClick={onClose}
              className={`w-full rounded-2xl border px-4 py-4 text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
