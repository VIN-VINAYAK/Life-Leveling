import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, ChevronDown, Sparkles } from 'lucide-react';
import { nutritionAPI } from '../services/api';
import { FoodTextAnalyzer } from '../components/nutrition/FoodTextAnalyzer';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Skeleton } from '../components/ui/Skeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { useXP } from '../context/XPContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const initialForm = { foodName: '', calories: '', carbs: '', protein: '', fat: '', quantity: '1' };

export const Nutrition = () => {
  const { language, t } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : 'en';
  const navigate = useNavigate();
  const manualEntryRef = useRef(null);
  const manualFoodRef = useRef(null);
  const { userStats, updateStats } = useXP();
  const { user, fetchCurrentUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [todayLog, setTodayLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingBatch, setLoggingBatch] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [todayRes, historyRes] = await Promise.all([nutritionAPI.getToday(), nutritionAPI.getHistory()]);
      setTodayLog(todayRes.data);
      setHistory(historyRes.data.logs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t('Unable to load nutrition data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    const meals = todayLog?.meals || [];
    return meals.reduce((acc, item) => {
      acc.calories += Number(item.calories || 0);
      acc.protein += Number(item.protein || 0);
      acc.carbs += Number(item.carbs || 0);
      acc.fat += Number(item.fat || 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todayLog]);

  const chartData = useMemo(() => history.slice(0, 7).reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    calories: entry.totalCalories || 0
  })), [history, locale]);

  const syncAward = async (responseData) => {
    if (responseData.userStats) {
      updateStats({
        ...userStats,
        ...responseData.userStats,
        streak: userStats.streak,
        totalTasks: userStats.totalTasks,
        completedTasks: userStats.completedTasks
      });
      await fetchCurrentUser();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await nutritionAPI.logMeal({
        ...form,
        calories: Number(form.calories),
        carbs: Number(form.carbs),
        protein: Number(form.protein),
        fat: Number(form.fat),
        quantity: Number(form.quantity)
      });
      toast.success(t('Meal logged · +8 XP'));
      await syncAward(response.data);
      setForm(initialForm);
      await loadData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to save meal'));
    }
  };

  const handleBatchLog = async (items) => {
    if (loggingBatch) return;
    setLoggingBatch(true);
    try {
      const response = await nutritionAPI.logBatch({ items });
      toast.success(t('Meal logged · +8 XP'));
      await syncAward(response.data);
      await loadData(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t('Failed to log this meal'));
    } finally {
      setLoggingBatch(false);
    }
  };

  const handleInsights = async () => {
    try {
      const response = await nutritionAPI.getAiInsights({
        nutritionData: {
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat
        }
      });
      setInsights(response.data.insights);
      await syncAward(response.data);
      toast.success(t('AI insights loaded'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('AI insights unavailable right now'));
    }
  };

  const enterManual = () => {
    setShowManual(true);
    window.requestAnimationFrame(() => {
      if (manualEntryRef.current) manualEntryRef.current.open = true;
      manualFoodRef.current?.focus();
      manualEntryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div className="page-shell nutrition-page">
      <Toaster position="top-right" />
      <div className="nutrition-page__content">
        <header className="nutrition-page__header">
          <div>
            <p className="section-eyebrow"><Sparkles size={15} /> LIFE LEVELING / {t('Nutrition')}</p>
            <h1>{t('Nutrition, in context.')}</h1>
            <p>{t('Make every meal part of your training plan, ')}{user?.username || t('Player')}.</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> {t('Dashboard')}
          </button>
        </header>

        <FoodTextAnalyzer onLog={handleBatchLog} logging={loggingBatch} onEnterManually={enterManual} />

        <div className="nutrition-primary-grid">
          <GlassCard className="nutrition-panel">
            <details ref={manualEntryRef} className="manual-entry" open={showManual}>
              <summary onClick={(event) => { event.preventDefault(); setShowManual((current) => !current); }}>
                <div><p className="section-eyebrow">{t('Alternative')}</p><h2>{t('Manual entry')}</h2></div>
                <ChevronDown size={18} />
              </summary>
              <p className="nutrition-panel__intro">{t('Already know the nutrition values? Add a meal directly.')}</p>
              <form onSubmit={handleSubmit} className="manual-entry__form">
                <label className="nutrition-field nutrition-field--full">
                  <span>{t('Food name')}</span>
                  <input ref={manualFoodRef} type="text" placeholder={t('e.g. Homemade lentil soup')} value={form.foodName} onChange={(event) => setForm({ ...form, foodName: event.target.value })} required />
                </label>
                <label className="nutrition-field"><span>{t('Calories (kcal)')}</span><input type="number" min="0" step="0.1" value={form.calories} onChange={(event) => setForm({ ...form, calories: event.target.value })} required /></label>
                <label className="nutrition-field"><span>{t('Carbs (g)')}</span><input type="number" min="0" step="0.1" value={form.carbs} onChange={(event) => setForm({ ...form, carbs: event.target.value })} required /></label>
                <label className="nutrition-field"><span>{t('Protein (g)')}</span><input type="number" min="0" step="0.1" value={form.protein} onChange={(event) => setForm({ ...form, protein: event.target.value })} required /></label>
                <label className="nutrition-field"><span>{t('Fat (g)')}</span><input type="number" min="0" step="0.1" value={form.fat} onChange={(event) => setForm({ ...form, fat: event.target.value })} required /></label>
                <label className="nutrition-field"><span>{t('Quantity')}</span><input type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required /></label>
                <button type="submit" className="primary-button manual-entry__submit">{t('Save meal · earn 8 XP')}</button>
              </form>
            </details>
          </GlassCard>

          <section className="glass nutrition-panel">
            <div className="nutrition-panel__heading">
              <div><p className="section-eyebrow">{t('Today')}</p><h2>{t('Daily nutrition')}</h2></div>
              <button type="button" className="secondary-button secondary-button--small" onClick={handleInsights} disabled={totals.calories === 0}>
                <Sparkles size={15} /> {t('AI insights')}
              </button>
            </div>
            <p className="nutrition-panel__intro">{t('A live snapshot of your logged meals.')}</p>
            {loading ? <div className="nutrition-skeletons"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div> : (
              <div className="nutrition-daily-bars">
                {[
                  ['Calories', totals.calories, 2400, 'kcal'],
                  ['Protein', totals.protein, 180, 'g'],
                  ['Carbs', totals.carbs, 260, 'g'],
                  ['Fat', totals.fat, 80, 'g']
                ].map(([label, value, goal, unit]) => (
                  <div className="nutrition-total-bar" key={label}>
                    <div><span>{t(label)}</span><strong><AnimatedNumber value={value} decimals={0} /> / {goal} {unit}</strong></div>
                    <div className="nutrition-total-bar__track"><span style={{ transform: `scaleX(${Math.min(1, value / goal)})` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="nutrition-secondary-grid">
          <section className="glass nutrition-panel">
            <div className="nutrition-panel__heading"><div><p className="section-eyebrow">{t('Food log')}</p><h2>{t('Today’s meals')}</h2></div><span className="nutrition-count">{todayLog?.meals?.length || 0} {t('entries')}</span></div>
            <div className="nutrition-meal-list">
              {loading ? <><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-20 rounded-xl" /></> : (todayLog?.meals || []).length === 0 ? (
                <p className="nutrition-empty">{t('Your first meal is a good place to start.')}</p>
              ) : (todayLog.meals || []).map((item, index) => (
                <article className="nutrition-meal-row" key={`${item.foodName}-${index}`}>
                  <div className="nutrition-meal-row__top"><div><h3>{item.foodName}</h3><p>{t('Quantity')} · {item.quantity}</p></div><strong>{item.calories} <small>kcal</small></strong></div>
                  <div className="nutrition-meal-row__macros"><span>{t('Protein')} {item.protein}g</span><span>{t('Carbs')} {item.carbs}g</span><span>{t('Fat')} {item.fat}g</span></div>
                </article>
              ))}
            </div>
          </section>

          <div className="nutrition-side-column">
            {insights && (
              <section className="glass nutrition-panel nutrition-insights">
                <p className="section-eyebrow">{t('Personal insights')}</p><h2>{t('AI nutrition insight')}</h2>
                <div className="nutrition-insights__body">
                  <p><strong>{t('Calorie assessment')}</strong>{insights.calorieAssessment}</p>
                  <p><strong>{t('Macro balance')}</strong>{insights.proteinCarbFeedback}</p>
                  <p><strong>{t('Try tomorrow')}</strong>{insights.suggestions?.join(', ')}</p>
                  <p><strong>{t('Keep going')}</strong>{insights.motivationalTip}</p>
                </div>
              </section>
            )}
            <GlassCard className="nutrition-panel nutrition-history-chart">
              <div className="nutrition-panel__heading">
                <div><p className="section-eyebrow">{t('Consistency')}</p><h2>{t('Last 7 days')}</h2></div>
                <span className="nutrition-chart-total"><strong>{chartData.reduce((sum, entry) => sum + Number(entry.calories || 0), 0).toLocaleString(locale)}</strong><small>{t('kcal logged')}</small></span>
              </div>
              {loading ? <Skeleton className="mt-5 h-64 rounded-xl" /> : chartData.length ? (
                <div className="nutrition-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 8, left: -15, bottom: 0 }} barCategoryGap="34%">
                      <defs>
                        <linearGradient id="nutritionBarFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--accent-strong)" stopOpacity={0.72} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--line)" strokeDasharray="4 6" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} dy={9} />
                      <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                      <Tooltip
                        cursor={{ fill: 'var(--mist)', radius: 8 }}
                        formatter={(value) => [`${Number(value).toLocaleString(locale)} kcal`, t('Calories')]}
                        contentStyle={{ background: 'var(--bg-panel-raised)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--elev-2)' }}
                        labelStyle={{ color: 'var(--muted)', marginBottom: 4 }}
                      />
                      <Bar dataKey="calories" name={t('Calories')} fill="url(#nutritionBarFill)" radius={[7, 7, 3, 3]} maxBarSize={38} background={{ fill: 'var(--bg-panel-soft)', radius: 7 }} animationDuration={650} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="nutrition-empty">{t('Your calorie history will appear as you log meals.')}</p>}
            </GlassCard>
          </div>
        </div>
        <p className="nutrition-xp-note">{t('Logging a meal earns +8 XP · your total is ')}{userStats.xp} XP</p>
      </div>
    </div>
  );
};
