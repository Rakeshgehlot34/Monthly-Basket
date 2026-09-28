import React, { useState, useEffect } from 'react';
import { X, Layers, Zap, DollarSign, Check, Pin, PinOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DynamicSection } from '../types';

interface DynamicSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: DynamicSection | null;
}

export const DynamicSectionModal: React.FC<DynamicSectionModalProps> = ({
  isOpen,
  onClose,
  initialSection,
}) => {
  const {
    addDynamicSection,
    updateDynamicSection,
    dynamicSections,
    currency,
  } = useApp();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Liter');
  const [defaultUnitPrice, setDefaultUnitPrice] = useState('50');
  const [isFavorite, setIsFavorite] = useState(false);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');

  const currentlyPinnedCount = dynamicSections.filter(
    (s) => s.isFavorite && (!initialSection || s.id !== initialSection.id)
  ).length;

  useEffect(() => {
    if (initialSection) {
      setName(initialSection.name);
      setUnit(initialSection.unit);
      setDefaultUnitPrice(String(initialSection.defaultUnitPrice));
      setIsFavorite(initialSection.isFavorite);
      setDescription(initialSection.description || '');
      setColor(initialSection.color || '#10b981');
    } else {
      setName('');
      setUnit('Liter');
      setDefaultUnitPrice('50');
      setIsFavorite(currentlyPinnedCount < 3);
      setDescription('');
      setColor('#10b981');
    }
  }, [initialSection, isOpen, currentlyPinnedCount]);

  if (!isOpen) return null;

  const UNIT_PRESETS = [
    'Liter',
    'Kg',
    'Bag (25kg)',
    'Bag (50kg)',
    'Pack (100 pcs)',
    'Piece',
    'Box',
    'Daily Shift',
    'Hour',
    'Meter',
    'Crate',
    'Bunch',
    'Tanker (5000L)',
  ];

  const COLOR_PRESETS = [
    '#10b981', // emerald
    '#0284c7', // sky
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#ef4444', // red
    '#14b8a6', // teal
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a section name.');
      return;
    }
    const price = parseFloat(defaultUnitPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid default unit price.');
      return;
    }

    if (isFavorite && currentlyPinnedCount >= 3) {
      alert('Maximum 3 sections can be pinned to top navigation. Please unpin another section or uncheck "Pin to Top Navigation".');
      return;
    }

    if (initialSection) {
      await updateDynamicSection(initialSection.id, {
        name: name.trim(),
        unit: unit.trim() || 'Unit',
        defaultUnitPrice: price,
        isFavorite,
        description: description.trim() || undefined,
        color,
      });
    } else {
      await addDynamicSection({
        name: name.trim(),
        icon: 'Layers',
        color,
        unit: unit.trim() || 'Unit',
        defaultUnitPrice: price,
        isFavorite,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {initialSection ? 'Edit Daily Procurement Section' : 'Create Dynamic Procurement Section'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure unit, pricing & top nav pin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Section Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Section Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Fresh Milk Supply, Diesel, Soil Bags, Daily Labour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Unit Name & Presets */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Measuring Unit (e.g. Liter, Bag, Shift, Box) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Liter"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-2"
              required
            />
            {/* Quick unit presets */}
            <div className="flex flex-wrap gap-1">
              {UNIT_PRESETS.slice(0, 8).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setUnit(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    unit === p
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Default Unit Price */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Default Unit Price ({currency} per {unit || 'unit'}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold">{currency}</span>
              <input
                type="number"
                step="any"
                min="0"
                value={defaultUnitPrice}
                onChange={(e) => setDefaultUnitPrice(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              You can adjust this price anytime when logging daily purchases.
            </p>
          </div>

          {/* Pin to Top Navigation (First 2-3 rule) */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {isFavorite ? (
                  <Pin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <PinOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-white">Pin to Top Navigation Bar</div>
                  <div className="text-[11px] text-slate-400">
                    Up to 3 items can be pinned to top navigation for 1-click quick logging. Remaining sections stay in the sidebar.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => {
                  if (e.target.checked && currentlyPinnedCount >= 3) {
                    alert('Top navigation limit reached (3/3 items). Unpin an existing item first.');
                    return;
                  }
                  setIsFavorite(e.target.checked);
                }}
                className="w-4 h-4 mt-1 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-700/50 pt-1.5">
              <span>Current Pinned Count:</span>
              <span className="font-bold text-emerald-400">{currentlyPinnedCount + (isFavorite ? 1 : 0)} / 3</span>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Section Theme Accent</label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-white ring-2 ring-emerald-500/40' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Daily morning delivery from local farmer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialSection ? 'Update Section' : 'Create & Add to Spreadsheet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
