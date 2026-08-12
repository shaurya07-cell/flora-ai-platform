import React, { useState } from 'react';
import { Settings as SettingsIcon, Plus, X, ShieldAlert, Cpu, Save, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';

export const Settings = () => {
  const [brands, setBrands] = useState(['FloraGrow', 'GreenHouse', 'ApexGrow', 'FloraX']);
  const [newBrand, setNewBrand] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [maxUploadSize, setMaxUploadSize] = useState('10');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    if (brands.includes(newBrand.trim())) {
      setNewBrand('');
      return;
    }
    setBrands([...brands, newBrand.trim()]);
    setNewBrand('');
  };

  const handleRemoveBrand = (brandToRemove) => {
    setBrands(brands.filter(b => b !== brandToRemove));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    // Simulate system config save
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      <PageHeader
        title="Settings & System Configurations"
        subtitle="Manage configurable brand whitelists, select active Gemini model, and configure pipeline parameters."
      />

      {saveSuccess && (
        <div className="p-3 bg-status-successSoft border border-brand-border rounded text-xs font-semibold text-status-success animate-fade-in-up">
          System parameters and validation rules updated successfully.
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start text-left">
        {/* Left Col: Brand Whitelist */}
        <div className="lg:col-span-1 bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2">
              <SettingsIcon className="h-4.5 w-4.5 text-accent" /> Brand Whitelist
            </h3>
            <p className="text-[11px] text-brand-muted mt-1 leading-normal">
              Whitelisted brand names used to validate catalog ingestion schemas in Level B rules.
            </p>
          </div>

          {/* Whitelist Chips */}
          <div className="flex flex-wrap gap-1.5 py-2">
            {brands.map(brand => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 bg-slate-50 border border-brand-border text-xs font-semibold text-brand-secondary pl-2.5 pr-1.5 py-1 rounded transition-all duration-300 hover:border-slate-300"
              >
                {brand}
                <button
                  type="button"
                  onClick={() => handleRemoveBrand(brand)}
                  className="p-0.5 rounded hover:bg-slate-200 text-brand-muted hover:text-brand-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Brand Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add Brand Name..."
              className="flex-1 border border-brand-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-borderStrong"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleAddBrand} icon={Plus}>
              Add
            </Button>
          </div>
        </div>

        {/* Right Col: Gemini / Ingestion Limits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gemini AI Settings */}
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-primary" /> Gemini AI Engine
              </h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-normal">
                Google Gemini model parameters loaded inside the `GEMINI_MODEL` environment variable.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-secondary block mb-1">Active Model Version</label>
              <select
                className="w-full sm:w-72 border border-brand-border rounded text-sm px-3 py-2 bg-white focus:outline-none focus:border-brand-borderStrong"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Speed)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Accuracy)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash-Exp</option>
              </select>
            </div>
          </div>

          {/* Ingestion Constraints */}
          <div className="bg-surface border border-brand-border rounded p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-brand-text flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-status-warning" /> Ingestion Constraints
              </h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-normal">
                Level A API schema upload validation boundaries to protect backend buffer allocations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-brand-secondary block mb-1">Max Upload File Size (MB)</label>
                <input
                  type="number"
                  className="w-full border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-borderStrong"
                  value={maxUploadSize}
                  onChange={(e) => setMaxUploadSize(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={saving ? Loader2 : Save}
              className={saving ? 'animate-pulse' : ''}
            >
              {saving ? 'Saving Configurations...' : 'Save System Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Settings;
