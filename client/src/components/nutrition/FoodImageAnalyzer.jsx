import React, { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, ScanSearch, Upload, X } from 'lucide-react';
import { nutritionAPI } from '../../services/api';

const nutritionFields = [
  ['calories', 'Calories', 'kcal'],
  ['protein', 'Protein', 'g'],
  ['carbs', 'Carbohydrates', 'g'],
  ['fat', 'Fat', 'g'],
  ['fiber', 'Fiber', 'g'],
  ['sugar', 'Sugar', 'g'],
  ['sodium', 'Sodium', 'mg']
];

export const FoodImageAnalyzer = () => {
  const inputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Please choose an image under 8 MB.');
      return;
    }
    setError('');
    setAnalysis(null);
    const reader = new FileReader();
    reader.onload = () => setImage({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      const response = await nutritionAPI.analyzeFoodImage({ imageDataUrl: image.dataUrl });
      setAnalysis(response.data.analysis);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Food analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setImage(null);
    setAnalysis(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/70 to-slate-950/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-300"><ScanSearch size={18} /><p className="text-sm font-semibold uppercase tracking-[0.2em]">NutriAI Vision</p></div>
          <h2 className="mt-2 text-2xl font-bold text-white">Scan a meal, understand the fuel</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Upload a clear food photo and NutriAI will estimate its nutrition and compare it with your fitness activity and goal.</p>
        </div>
        <span className="rounded-full border border-violet-400/30 px-3 py-1 text-xs text-violet-200">AI estimate, not medical advice</span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
        <div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          {image ? (
            <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-slate-950">
              <img src={image.dataUrl} alt="Selected food" className="h-52 w-full object-cover" />
              <button type="button" onClick={clear} className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-2 text-white" aria-label="Remove image"><X size={15} /></button>
              <p className="truncate px-3 py-2 text-xs text-slate-400">{image.name}</p>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="flex h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-violet-400/40 bg-slate-950/50 text-center text-slate-400 transition hover:border-violet-300 hover:text-white">
              <ImagePlus size={30} className="mb-3 text-violet-300" />
              <span className="font-semibold">Choose food image</span>
              <span className="mt-1 text-xs">JPG, PNG, or WebP up to 8 MB</span>
            </button>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-violet-400 hover:text-white"><Upload size={15} /> {image ? 'Change image' : 'Upload image'}</button>
            <button type="button" disabled={!image || loading} onClick={analyze} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <LoaderCircle size={15} className="animate-spin" /> : <ScanSearch size={15} />} {loading ? 'Analyzing' : 'Analyze food'}</button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>

        {analysis ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs uppercase tracking-[0.2em] text-violet-300">Detected food</p><h3 className="mt-1 text-xl font-bold text-white">{analysis.foodName}</h3><p className="text-sm text-slate-400">Serving: {analysis.servingSize} · Confidence: {analysis.confidence}</p></div>
              <span className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300">Fitness-aware result</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {nutritionFields.map(([key, label, unit]) => <div key={key} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-white">{Number(analysis.nutrition?.[key] || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">{unit}</span></p></div>)}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-slate-900/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Health assessment</p><p className="mt-2 text-sm leading-6 text-slate-300">{analysis.healthAssessment}</p></div>
              <div className="rounded-xl bg-slate-900/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">For your training</p><p className="mt-2 text-sm leading-6 text-slate-300">{analysis.fitnessFit}</p></div>
            </div>
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Practical guidance</p><p className="mt-2 text-sm text-slate-300">{analysis.portionAdvice}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">{analysis.recommendations?.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400"><span>Ingredients: {analysis.ingredients?.join(', ') || 'Not identified'}</span><span>•</span><span>Allergens: {analysis.allergens?.join(', ') || 'None identified'}</span></div>
          </div>
        ) : (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-center text-sm text-slate-500">Your detailed nutrition and fitness comparison will appear here after analysis.</div>
        )}
      </div>
    </section>
  );
};
