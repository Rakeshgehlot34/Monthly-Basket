import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Zap,
  Shield,
  Cloud,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface UserGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuidanceModal: React.FC<UserGuidanceModalProps> = ({ isOpen, onClose }) => {
  const [activeTopic, setActiveTopic] = useState<number>(0);

  if (!isOpen) return null;

  const topics = [
    {
      title: 'Google Sheets as Database',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      badge: 'Core Architecture',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            SpendSync uses your Google Spreadsheet as a live, secure cloud database. You never have to worry about locked databases or vendor lock-in!
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Zero Setup Required:</strong> Clicking &quot;Google Sign In&quot; automatically provisions or links a spreadsheet titled <em>&quot;SpendSync - Monthly Finance Tracker&quot;</em> in your Google Drive.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Structured Sheets:</strong> The sheet contains separate tabs for <code>Transactions</code>, <code>DailySections</code>, and <code>Budgets</code> with frozen header rows.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Real-Time Sync:</strong> Every entry, update, or deletion is immediately mirrored in Google Sheets. You can open the spreadsheet directly at any time.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Monthly Reset Cycle',
      icon: Calendar,
      color: 'text-blue-400',
      badge: 'Monthly Reset',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            The spending tracker operates on a monthly ledger cycle where expenses and incomes reset automatically at the beginning of each calendar month.
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Monthly Independence:</strong> Each month maintains its own budget and transaction records. You can switch between months via the top month selector.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Surplus / Deficit Rollover:</strong> In Settings, you can choose whether the previous month&apos;s net savings or deficit rolls over into the next month&apos;s budget or starts fresh.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Historical Archives:</strong> Past months remain permanently recorded in your Google Sheet for tax and audit purposes.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dynamic Procurement Sections',
      icon: Zap,
      color: 'text-amber-400',
      badge: 'Dynamic Units',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            For recurring daily business or household procurement (e.g. Milk, Farm Soil, Diesel, Seedling Bags, Daily Labour), create Dynamic Daily Sections!
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Unit & Unit Price:</strong> Set the measuring unit (e.g. <em>Liter, Bag (25kg), Daily Shift, Pack</em>) and default unit price.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Dynamic Price Updates:</strong> Unit prices change with market fluctuations; update the unit price anytime in 1 click!
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Instant Subtotal Calculation:</strong> Enter today&apos;s quantity, and SpendSync auto-calculates <code>Total = Quantity × Unit Price</code> and logs it into your sheet with 1 tap.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Top Nav vs Sidebar Sections',
      icon: Layers,
      color: 'text-purple-400',
      badge: 'Navigation Layout',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            To keep your navigation clean, SpendSync features an intelligent two-tier navigation structure:
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">First 2–3 in Top Navigation:</strong> Your top 2 to 3 favorite dynamic items appear directly as quick-log tabs in the top navigation bar for one-tap daily logging!
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Remaining in Sidebar:</strong> All other dynamic sections are neatly organized in the Sidebar drawer and &quot;All Sections&quot; hub.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Customizable:</strong> Click the pin icon in the Sidebar or Settings to promote any section to the top navigation.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role-Based Access Control',
      icon: Shield,
      color: 'text-indigo-400',
      badge: 'RBAC',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Secure team and family access with three role levels:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-indigo-500/30">
              <div className="font-bold text-indigo-400 text-xs">Admin</div>
              <div className="text-[11px] text-slate-300">
                Full CRUD control, budget configuration, Google Sheet connection, role assignment, and deleting records.
              </div>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <div className="font-bold text-blue-400 text-xs">Manager</div>
              <div className="text-[11px] text-slate-300">
                Can add and edit expenses/incomes, update dynamic section prices, view full analytics. Cannot wipe cloud data or alter core sheet settings.
              </div>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <div className="font-bold text-slate-400 text-xs">Staff Logger</div>
              <div className="text-[11px] text-slate-300">
                Optimized fast daily logging interface for field staff or family members to log daily procurement without exposing bank balance or delete permissions.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Offline Support & Sync',
      icon: Cloud,
      color: 'text-teal-400',
      badge: 'PWA & Offline',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Works 100% reliably even with spotty internet in greenhouses, farms, transit, or offline:
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Offline Queue:</strong> Any transaction logged while offline is instantly saved locally and queued in an offline mutation log.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Auto-Sync on Reconnect:</strong> As soon as your device reconnects to WiFi or mobile data, the offline queue automatically flushes to Google Sheets.
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">SpendSync User Guide & Architecture</h3>
              <p className="text-xs text-slate-400">Everything you need to know about Google Sheets Sync & Daily Spend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Topics List on Left */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800 p-2 overflow-y-auto bg-slate-950/40 space-y-1">
            {topics.map((t, idx) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.title}
                  onClick={() => setActiveTopic(idx)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                    activeTopic === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${t.color}`} />
                  <span className="truncate">{t.title}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Content on Right */}
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {React.createElement(topics[activeTopic].icon, {
                  className: `w-5 h-5 ${topics[activeTopic].color}`,
                })}
                <h4 className="font-bold text-sm text-white">{topics[activeTopic].title}</h4>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {topics[activeTopic].badge}
              </span>
            </div>

            {topics[activeTopic].content}

            {/* Next Topic Button */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setActiveTopic((prev) => Math.max(0, prev - 1))}
                disabled={activeTopic === 0}
                className="text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>

              {activeTopic < topics.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveTopic((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <span>Next Topic</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  Got It, Let&apos;s Start!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
