import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { expenseAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];
const categoryColors = ['#e6a047', '#80b8a0', '#d77e5c', '#9b8ac4', '#77a6b5', '#d78da2', '#9aab82'];
const initialExpense = { category: 'Food', description: '', amount: '', date: '' };
const initialThing = { name: '', estimatedCost: '', priority: 'want' };

export const Expense = () => {
  const { language, t } = useLanguage();
  const numberLocale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const navigate = useNavigate();
  const [setup, setSetup] = useState({ monthlyIncome: '', savingsGoal: '' });
  const [expense, setExpense] = useState(initialExpense);
  const [smsText, setSmsText] = useState('');
  const [parsedExpenses, setParsedExpenses] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [things, setThings] = useState([]);
  const [thing, setThing] = useState(initialThing);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [currentRes, thingsRes] = await Promise.all([expenseAPI.getCurrent(), expenseAPI.getThingsList()]);
      setCurrentData(currentRes.data.log);
      setThings(thingsRes.data.list?.items || []);
      setSetup({ monthlyIncome: currentRes.data.log?.monthlyIncome || '', savingsGoal: currentRes.data.log?.savingsGoal || '' });
    } catch (error) {
      toast.error(t('Unable to load expense data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const chartData = useMemo(() => {
    const summary = (currentData?.expenses || []).reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount || 0);
      return acc;
    }, {});
    return Object.entries(summary)
      .map(([name, value]) => ({ name, value, color: categoryColors[categories.indexOf(name)] || categoryColors[categoryColors.length - 1] }))
      .sort((first, second) => second.value - first.value);
  }, [currentData]);
  const totalExpenses = useMemo(() => chartData.reduce((total, item) => total + item.value, 0), [chartData]);

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.setupMonth(setup);
      toast.success(t('Month setup saved'));
      await loadData();
    } catch (error) {
      toast.error(t('Could not save month setup'));
    }
  };

  const handleExpenseAdd = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addExpense(expense);
      toast.success(t('Expense added'));
      setExpense(initialExpense);
      await loadData();
    } catch (error) {
      toast.error(t('Could not add expense'));
    }
  };

  const handleParseSms = async () => {
    try {
      const response = await expenseAPI.parseSms({ messages: smsText.split(/\n/) });
      setParsedExpenses(response.data.expenses || []);
      toast.success(t('SMS expenses parsed'));
    } catch (error) {
      toast.error(t('Unable to parse messages'));
    }
  };

  const handleConfirmParsed = async () => {
    try {
      for (const item of parsedExpenses) {
        await expenseAPI.addExpense({ ...item, source: 'sms_parsed' });
      }
      setParsedExpenses([]);
      setSmsText('');
      await loadData();
      toast.success(t('Parsed expenses saved'));
    } catch (error) {
      toast.error(t('Failed to save parsed expenses'));
    }
  };

  const handleThingAdd = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addThing(thing);
      toast.success(t('Thing added'));
      setThing(initialThing);
      await loadData();
    } catch (error) {
      toast.error(t('Could not add thing'));
    }
  };

  const handlePurchase = async (itemId) => {
    try {
      await expenseAPI.markPurchased(itemId);
      await loadData();
      toast.success(t('Marked as purchased'));
    } catch (error) {
      toast.error(t('Could not update thing'));
    }
  };

  const handleInsights = async () => {
    try {
      const response = await expenseAPI.getAiInsights();
      setInsights(response.data.insights);
      toast.success(t('AI insights loaded'));
    } catch (error) {
      toast.error(t('AI insights unavailable'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">{t('Expense AI')}</p>
            <h1 className="text-3xl font-bold text-slate-900">{t('Budgeting, SMS parsing, and smart planning')}</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">{t('Back to dashboard')}</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{t('Month setup')}</h2>
              <form onSubmit={handleSetup} className="mt-4 grid gap-4 md:grid-cols-2">
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Monthly income')} value={setup.monthlyIncome} onChange={(e) => setSetup({ ...setup, monthlyIncome: e.target.value })} />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Savings goal')} value={setup.savingsGoal} onChange={(e) => setSetup({ ...setup, savingsGoal: e.target.value })} />
                <button type="submit" className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">{t('Save setup')}</button>
              </form>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{t('Add expense')}</h2>
                  <p className="text-sm text-slate-500">{t('Track where your money is going.')}</p>
                </div>
                <button onClick={handleInsights} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">{t('Get AI Insights')}</button>
              </div>
              <form onSubmit={handleExpenseAdd} className="mt-4 grid gap-4 md:grid-cols-2">
                <select className="rounded-xl border border-slate-200 px-3 py-2" value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}
                </select>
                <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder={t('Description')} value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} required />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Amount')} value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} />
                <button type="submit" className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">{t('Add expense')}</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{t('Savings progress')}</h2>
              {loading ? <div className="mt-4 h-20 animate-pulse rounded-2xl bg-slate-100" /> : (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{t('Current savings')}</span>
                    <span className="font-semibold">₹{Number(currentData?.totalSaved || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${Number(currentData?.totalSaved || 0) >= Number(setup.savingsGoal || 0) ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, Math.round(((Number(currentData?.totalSaved || 0) / Math.max(1, Number(setup.savingsGoal || 0))) * 100)))}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{t('Target:')} ₹{Number(setup.savingsGoal || 0).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="glass expense-chart-card">
              <div className="expense-chart-heading">
                <div>
                  <p className="expense-chart-eyebrow">{t('SPENDING SNAPSHOT')}</p>
                  <h3>{t('Category breakdown')}</h3>
                </div>
                <span className="expense-chart-period">{t('This month')}</span>
              </div>
              {chartData.length ? (
                <div className="expense-chart-layout">
                  <div className="expense-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="70%"
                          outerRadius="94%"
                          paddingAngle={4}
                          cornerRadius={5}
                          stroke="none"
                          isAnimationActive
                        >
                          {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`₹${Number(value).toLocaleString(numberLocale, { maximumFractionDigits: 2 })}`, t(name)]}
                          contentStyle={{ background: 'var(--bg-panel-raised)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--text)' }}
                          itemStyle={{ color: 'var(--text)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="expense-donut__center" aria-label={`${t('Total expenses')} ₹${totalExpenses.toFixed(2)}`}>
                      <span>{t('TOTAL SPENT')}</span>
                      <strong>₹{totalExpenses.toLocaleString(numberLocale, { maximumFractionDigits: 0 })}</strong>
                    </div>
                  </div>
                  <div className="expense-chart-legend">
                    {chartData.map((item) => (
                      <div className="expense-chart-legend__row" key={item.name}>
                        <span className="expense-chart-legend__name"><i style={{ backgroundColor: item.color }} />{t(item.name)}</span>
                        <span className="expense-chart-legend__amount">₹{item.value.toLocaleString(numberLocale, { maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="expense-chart-empty">
                  <span>₹</span>
                  <strong>{t('No spending recorded yet')}</strong>
                  <p>{t('Add an expense to see your category breakdown.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{t('SMS paste')}</h2>
            <textarea value={smsText} onChange={(e) => setSmsText(e.target.value)} rows="6" className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2" placeholder={t('Paste SMS messages here')} />
            <div className="mt-4 flex gap-3">
              <button onClick={handleParseSms} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">{t('Parse SMS')}</button>
              {parsedExpenses.length > 0 && <button onClick={handleConfirmParsed} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">{t('Save parsed expenses')}</button>}
            </div>
            {parsedExpenses.length > 0 && <div className="mt-4 space-y-2">{parsedExpenses.map((item, index) => <div key={index} className="rounded-2xl border border-slate-200 p-3 text-sm">{item.description} • ₹{item.amount}</div>)}</div>}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{t('Things list')}</h2>
            <form onSubmit={handleThingAdd} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder={t('Item name')} value={thing.name} onChange={(e) => setThing({ ...thing, name: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder={t('Estimated cost')} value={thing.estimatedCost} onChange={(e) => setThing({ ...thing, estimatedCost: e.target.value })} />
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={thing.priority} onChange={(e) => setThing({ ...thing, priority: e.target.value })}>
                <option value="want">{t('Want')}</option>
                <option value="need">{t('Need')}</option>
              </select>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">{t('Add item')}</button>
            </form>
            <div className="mt-4 space-y-3">{things.map((item) => <div key={item._id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"><label className="flex items-center gap-3"><input type="checkbox" checked={item.purchased} onChange={() => handlePurchase(item._id)} /><span>{item.name} • ₹{item.estimatedCost}</span></label><span className="text-sm text-slate-500">{t(item.priority.charAt(0).toUpperCase() + item.priority.slice(1))}</span></div>)}</div>
          </div>
        </div>

        {insights && <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 p-6 text-white shadow-sm"><h3 className="text-lg font-semibold">{t('AI expense insight')}</h3><div className="mt-3 space-y-2 text-sm"><p><span className="font-semibold">{t('Analysis:')}</span> {insights.spendingAnalysis}</p><p><span className="font-semibold">{t('Cut:')}</span> {insights.topAreasToCut?.join(', ')}</p><p><span className="font-semibold">{t('Tip:')}</span> {insights.savingsTip}</p><p><span className="font-semibold">{t('Plan:')}</span> {insights.controlledPlan}</p><p><span className="font-semibold">{t('Motivation:')}</span> {insights.motivationalMessage}</p></div></div>}
      </div>
    </div>
  );
};
