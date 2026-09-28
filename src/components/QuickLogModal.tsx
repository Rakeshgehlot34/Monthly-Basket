import React, { useState, useEffect } from 'react';
import { X, Zap, DollarSign, Calculator, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QuickLogModalProps {
  sectionId: string | null;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ sectionId, onClose }) => {
  const { dynamicSections, quickLogSectionPurchase, currency } = useApp();

  const section = dynamicSections.find((s) => s.id === sectionId);

  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  useEffect(() => {
    if (section) {
      setUnitPrice(section.defaultUnitPrice);
      setQuantity(1);
      setNotes('');
      setSuccessAnim(false);
    }
  }, [section]);

  if (!sectionId || !section) return null;

  const totalAmount = Math.round(quantity * unitPrice * 100) / 100;

  const handleIncrement = (delta: number) => {
    setQuantity((prev) => Math.max(0.1, Math.round((prev + delta) * 10) / 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || unitPrice < 0) return;

    try {
      setIsSubmitting(true);
      await quickLogSectionPurchase(section.id, quantity, unitPrice, notes);
      setSuccessAnim(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{section.name}</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Daily Log
                </span>
              </div>
              <p className="text-xs text-slate-400">Unit: {section.unit}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Unit Price Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Unit Price ({currency} per {section.unit})</span>
              <span className="text-[10px] text-emerald-400 font-normal">Editable anytime</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currency}</span>
              <input
                type="number"
                step="any"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quantity Stepper & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Quantity ({section.unit}s)</span>
              <span className="text-[10px] text-slate-400 font-mono">Today's Consumption / Purchase</span>
            </label>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleIncrement(-1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center border border-slate-700 active:scale-95 transition-all"
              >
                -
              </button>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl py-2 px-3 text-center text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => handleIncrement(1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center border border-slate-700 active:scale-95 transition-all"
              >
                +
              </button>
            </div>

            {/* Quick Increment Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 2, 5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setQuantity(val)}
                  className={`py-1 rounded-lg text-xs font-semibold transition-colors ${
                    quantity === val
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {val} {section.unit}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Subtotal Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-800/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[11px] text-slate-400">Total Purchase Cost</div>
                <div className="text-[11px] text-emerald-300/80 font-mono">
                  {quantity} {section.unit} × {currency}{unitPrice}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {currency}{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Vendor (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Morning delivery, vendor invoice #102"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || quantity <= 0}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              successAnim
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
            }`}
          >
            {successAnim ? (
              <>
                <Check className="w-5 h-5 animate-bounce" />
                <span>Logged to Google Sheets!</span>
              </>
            ) : isSubmitting ? (
              <span>Recording...</span>
            ) : (
              <>
                <span>Record Spend for Today</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
