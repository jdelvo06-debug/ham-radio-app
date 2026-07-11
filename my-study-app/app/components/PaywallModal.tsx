'use client';

interface PaywallModalProps {
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
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-800 text-white shadow-2xl">
        <div className="border-b border-slate-700 bg-gradient-to-br from-blue-950 to-purple-950 px-6 py-6">
          <div className="mb-3 inline-flex items-center rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold tracking-wide text-amber-500">
            🔒 Premium Access
          </div>
          <h3 className="text-2xl font-black leading-tight">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {message}
          </p>
        </div>

        <div className="px-6 py-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Premium includes
          </p>

          <div className="space-y-3">
            {premiumFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3"
              >
                <span className="mt-0.5 text-lg text-emerald-500">✓</span>
                <span className="text-sm text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {error && (
              <div
                className="rounded-2xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
              >
                {error}
              </div>
            )}
            {(productTitle || productPrice) && (
              <div
                className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-emerald-100"
              >
                <p className="text-sm font-semibold">
                  {productTitle || 'Premium Access'}
                </p>
                {productPrice && (
                  <p className="mt-1 text-xs text-emerald-200/80">
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
              className="w-full rounded-2xl border border-slate-600 px-4 py-4 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-transparent"
            >
              Maybe Later
            </button>
            <button
              onClick={onRestore}
              disabled={isPurchasing || isRestoring}
              className="w-full text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRestoring ? 'Restoring Purchase...' : 'Restore Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
