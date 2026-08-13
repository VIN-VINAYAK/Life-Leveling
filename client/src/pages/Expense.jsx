import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { expenseAPI } from '../services/api';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];
const initialExpense = { category: 'Food', description: '', amount: '', date: '' };
const initialThing = { name: '', estimatedCost: '', priority: 'want' };

export const Expense = () => {
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
      toast.error('Unable to load expense data');
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
    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }, [currentData]);

  const handleSetup = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.setupMonth(setup);
      toast.success('Month setup saved');
      await loadData();
    } catch (error) {
      toast.error('Could not save month setup');
    }
  };

  const handleExpenseAdd = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addExpense(expense);
      toast.success('Expense added');
      setExpense(initialExpense);
      await loadData();
    } catch (error) {
      toast.error('Could not add expense');
    }
  };

  const handleParseSms = async () => {
    try {
      const response = await expenseAPI.parseSms({ messages: smsText.split(/\n/) });
      setParsedExpenses(response.data.expenses || []);
      toast.success('SMS expenses parsed');
    } catch (error) {
      toast.error('Unable to parse messages');
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
      toast.success('Parsed expenses saved');
    } catch (error) {
      toast.error('Failed to save parsed expenses');
    }
  };

  const handleThingAdd = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addThing(thing);
      toast.success('Thing added');
      setThing(initialThing);
      await loadData();
    } catch (error) {
      toast.error('Could not add thing');
    }
  };

  const handlePurchase = async (itemId) => {
    try {
      await expenseAPI.markPurchased(itemId);
      await loadData();
      toast.success('Marked as purchased');
    } catch (error) {
      toast.error('Could not update thing');
    }
  };

  const handleInsights = async () => {
    try {
      const response = await expenseAPI.getAiInsights();
      setInsights(response.data.insights);
      toast.success('AI insights loaded');
    } catch (error) {
      toast.error('AI insights unavailable');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">Expense AI</p>
            <h1 className="text-3xl font-bold text-slate-900">Budgeting, SMS parsing, and smart planning</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Back to dashboard</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Month setup</h2>
              <form onSubmit={handleSetup} className="mt-4 grid gap-4 md:grid-cols-2">
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Monthly income" value={setup.monthlyIncome} onChange={(e) => setSetup({ ...setup, monthlyIncome: e.target.value })} />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Savings goal" value={setup.savingsGoal} onChange={(e) => setSetup({ ...setup, savingsGoal: e.target.value })} />
                <button type="submit" className="md:col-span-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Save setup</button>
              </form>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Add expense</h2>
                  <p className="text-sm text-slate-500">Track where your money is going.</p>
                </div>
                <button onClick={handleInsights} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Get AI Insights</button>
              </div>
              <form onSubmit={handleExpenseAdd} className="mt-4 grid gap-4 md:grid-cols-2">
                <select className="rounded-xl border border-slate-200 px-3 py-2" value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Description" value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} required />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Amount" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required />
                <input className="rounded-xl border border-slate-200 px-3 py-2" type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} />
                <button type="submit" className="md:col-span-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Add expense</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Savings progress</h2>
              {loading ? <div className="mt-4 h-20 animate-pulse rounded-2xl bg-slate-100" /> : (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Current savings</span>
                    <span className="font-semibold">₹{Number(currentData?.totalSaved || 0).toFixed(2)}</span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${Number(currentData?.totalSaved || 0) >= Number(setup.savingsGoal || 0) ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, Math.round(((Number(currentData?.totalSaved || 0) / Math.max(1, Number(setup.savingsGoal || 0))) * 100)))}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Target: ₹{Number(setup.savingsGoal || 0).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Category breakdown</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8" label>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">SMS paste</h2>
            <textarea value={smsText} onChange={(e) => setSmsText(e.target.value)} rows="6" className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2" placeholder="Paste SMS messages here" />
            <div className="mt-4 flex gap-3">
              <button onClick={handleParseSms} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Parse SMS</button>
              {parsedExpenses.length > 0 && <button onClick={handleConfirmParsed} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Save parsed expenses</button>}
            </div>
            {parsedExpenses.length > 0 && <div className="mt-4 space-y-2">{parsedExpenses.map((item, index) => <div key={index} className="rounded-2xl border border-slate-200 p-3 text-sm">{item.description} • ₹{item.amount}</div>)}</div>}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Things list</h2>
            <form onSubmit={handleThingAdd} className="mt-4 grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Item name" value={thing.name} onChange={(e) => setThing({ ...thing, name: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-3 py-2" type="number" placeholder="Estimated cost" value={thing.estimatedCost} onChange={(e) => setThing({ ...thing, estimatedCost: e.target.value })} />
              <select className="rounded-xl border border-slate-200 px-3 py-2" value={thing.priority} onChange={(e) => setThing({ ...thing, priority: e.target.value })}>
                <option value="want">Want</option>
                <option value="need">Need</option>
              </select>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Add item</button>
            </form>
            <div className="mt-4 space-y-3">{things.map((item) => <div key={item._id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"><label className="flex items-center gap-3"><input type="checkbox" checked={item.purchased} onChange={() => handlePurchase(item._id)} /><span>{item.name} • ₹{item.estimatedCost}</span></label><span className="text-sm text-slate-500">{item.priority}</span></div>)}</div>
          </div>
        </div>

        {insights && <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 p-6 text-white shadow-sm"><h3 className="text-lg font-semibold">AI expense insight</h3><div className="mt-3 space-y-2 text-sm"><p><span className="font-semibold">Analysis:</span> {insights.spendingAnalysis}</p><p><span className="font-semibold">Cut:</span> {insights.topAreasToCut?.join(', ')}</p><p><span className="font-semibold">Tip:</span> {insights.savingsTip}</p><p><span className="font-semibold">Plan:</span> {insights.controlledPlan}</p><p><span className="font-semibold">Motivation:</span> {insights.motivationalMessage}</p></div></div>}
      </div>
    </div>
  );
};
