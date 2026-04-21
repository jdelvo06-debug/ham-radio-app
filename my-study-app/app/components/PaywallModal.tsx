'use client';

interface PaywallModalProps {
  darkMode: boolean;
  title?: string;
  message?: string;
  productTitle?: string | null;
  productPrice?: string | null;
  onPurchase: () => void | Promise<void>;
  onRestore: () => void | Promise<void>;
  onClose: () => void;
  isPurchasing?: boolean;
  isRestoring?: boolean;
  error?: string | null;
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
  productTitle = null,
  productPrice = null,
  onPurchase,
  onRestore,
  onClose,
  isPurchasing = false,
  isRestoring = false,
  error = null,
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
            {error && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${darkMode ? 'border-rose-900/60 bg-rose-950/40 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
              >
                {error}
              </div>
            )}
            {(productTitle || productPrice) && (
              <div
                className={`rounded-2xl border px-4 py-3 ${darkMode ? 'border-emerald-900/50 bg-emerald-950/30 text-emerald-100' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
              >
                <p className="text-sm font-semibold">
                  {productTitle || 'Premium Access'}
                </p>
                {productPrice && (
                  <p className={`mt-1 text-xs ${darkMode ? 'text-emerald-200/80' : 'text-emerald-800'}`}>
                    App Store price: {productPrice}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={onPurchase}
              disabled={isPurchasing || isRestoring}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-base font-bold text-white shadow-lg transition-transform disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
            >
              {isPurchasing
                ? 'Processing Purchase...'
                : productPrice
                  ? `Unlock Premium for ${productPrice}`
                  : 'Unlock Premium'}
            </button>
            <button
              onClick={onClose}
              disabled={isPurchasing || isRestoring}
              className={`w-full rounded-2xl border px-4 py-4 text-sm font-semibold ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 disabled:hover:bg-transparent' : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:hover:bg-transparent'} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              Maybe Later
            </button>
            <button
              onClick={onRestore}
              disabled={isPurchasing || isRestoring}
              className={`w-full text-sm font-semibold underline-offset-4 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isRestoring ? 'Restoring Purchase...' : 'Restore Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
