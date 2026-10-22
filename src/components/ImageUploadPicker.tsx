import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, X, Sparkles } from 'lucide-react';

interface ImageUploadPickerProps {
  value: string;
  onChange: (value: string) => void;
  accentColor?: 'teal' | 'amber';
  label?: string;
  helperText?: string;
}

const AVATAR_PRESETS = [
  { id: 'av1', label: 'Student Developer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'UI Designer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'ML Researcher', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Cloud Coder', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Creative Peer', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: 'av7', label: 'DSA Problem Solver', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { id: 'av8', label: 'Campus Orator', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
];

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  value,
  onChange,
  accentColor = 'teal',
  label = 'Profile Picture / Avatar',
  helperText = 'Upload a photo or choose from campus avatar presets'
}) => {
  const [mode, setMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeal = accentColor === 'teal';
  const borderFocusClass = isTeal ? 'focus:border-teal-500' : 'focus:border-amber-500';
  const activeTabClass = isTeal
    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 400;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            onChange(optimized);
          } else {
            onChange(result);
          }
        } catch {
          onChange(result);
        }
      };
      img.onerror = () => {
        onChange(result);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-slate-200 font-medium text-xs flex items-center gap-1.5">
            <ImageIcon className={`w-3.5 h-3.5 ${isTeal ? 'text-teal-400' : 'text-amber-400'}`} />
            <span>{label}</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 rounded font-medium transition-colors ${mode === 'upload' ? activeTabClass : 'text-slate-400 hover:text-slate-200'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`px-2 py-1 rounded font-medium transition-colors ${mode === 'preset' ? activeTabClass : 'text-slate-400 hover:text-slate-200'}`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-1 rounded font-medium transition-colors ${mode === 'url' ? activeTabClass : 'text-slate-400 hover:text-slate-200'}`}
          >
            URL
          </button>
        </div>
      </div>

      {/* Main visual display & controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* Avatar preview */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
            {value ? (
              <img src={value} alt="Profile avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 text-[10px]">
                <ImageIcon className="w-6 h-6 mb-0.5 opacity-60" />
                <span>No photo</span>
              </div>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove image"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dynamic section based on selected mode */}
        <div className="flex-1 w-full">
          {mode === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition-all`}
              >
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                  <Upload className={`w-3.5 h-3.5 ${isTeal ? 'text-teal-400' : 'text-amber-400'}`} />
                  <span>Click to browse photo from computer</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP (up to 4MB)</p>
              </div>
              {uploadError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
          )}

          {mode === 'preset' && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Select a student avatar preset:</span>
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = value === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChange(p.url)}
                      title={p.label}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                        isSelected
                          ? isTeal
                            ? 'border-teal-400 ring-2 ring-teal-500/50'
                            : 'border-amber-400 ring-2 ring-amber-500/50'
                          : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-teal-950/60 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === 'url' && (
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className={`flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none ${borderFocusClass}`}
              />
              <button
                type="submit"
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  isTeal ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                } transition-colors`}
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
