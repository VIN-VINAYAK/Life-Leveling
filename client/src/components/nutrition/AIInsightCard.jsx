import React from 'react';

export const AIInsightCard = ({ insights, onGenerate, loading, calories }) => {
  return (
    <section className="bg-white rounded-3xl shadow p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Nutrition Insights</h2>
          <p className="text-sm text-gray-500">Generate a professional summary based on today&apos;s intake.</p>
        </div>
        <button
          onClick={onGenerate}
          className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          disabled={loading || calories === 0}
        >
          {loading ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      {!insights ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
          <p className="font-semibold">No insights yet.</p>
          <p className="mt-2">Log some meals and then click the button to see a nutrition summary.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Nutrition Score</p>
            <p className="mt-3 text-4xl font-bold text-blue-600">{insights.overallScore}/100</p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Positive feedback</p>
              <ul className="mt-3 list-disc space-y-2 text-slate-600 pl-5">
                {insights.positiveFeedback.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Things to improve</p>
              <ul className="mt-3 list-disc space-y-2 text-slate-600 pl-5">
                {insights.thingsToImprove.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Foods to eat tomorrow</p>
              <ul className="mt-3 list-disc space-y-2 text-slate-600 pl-5">
                {insights.foodsToEatTomorrow.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5">
              <p className="font-semibold text-slate-900">Hydration reminder</p>
              <p className="mt-3 text-slate-600">{insights.hydrationReminder}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">Motivational message</p>
              <p className="mt-3 text-slate-600">{insights.motivationalMessage}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
