import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Check, LoaderCircle, Minus, Plus, Sparkles, Utensils } from 'lucide-react';
import { nutritionAPI } from '../../services/api';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { Skeleton } from '../ui/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

const createRow = () => ({ id: `${Date.now()}-${Math.random()}`, foodName: '', weightGrams: '' });
const nutritionFields = [
  ['calories', 'Calories', 'kcal'],
  ['protein', 'Protein', 'g'],
  ['carbs', 'Carbohydrates', 'g'],
  ['fat', 'Fat', 'g'],
  ['fiber', 'Fiber', 'g'],
  ['sugar', 'Sugar', 'g'],
  ['sodium', 'Sodium', 'mg']
];

const getValidation = (row, t) => {
  const name = row.foodName.trim();
  const weight = Number(row.weightGrams);
  return {
    name: name.length < 2 ? t('Enter a food name (at least 2 characters).') : name.length > 80 ? t('Food names must be 80 characters or fewer.') : '',
    weight: !row.weightGrams || !Number.isFinite(weight) || weight < 1 || weight > 5000
      ? t('Weight must be between 1 and 5000 grams.')
      : ''
  };
};

export const FoodTextAnalyzer = ({ onLog, logging = false, onEnterManually }) => {
  const [rows, setRows] = useState([createRow()]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const validRows = rows.every((row) => !getValidation(row, t).name && !getValidation(row, t).weight);

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
    setAnalysis(null);
    setError(null);
  };

  const addRow = () => {
    if (rows.length < 10) {
      setRows((current) => [...current, createRow()]);
      setAnalysis(null);
    }
  };

  const analyze = async () => {
    if (!validRows || loading) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setRows((current) => current.map((row) => ({ ...row, serverError: '' })));
    try {
      const response = await nutritionAPI.analyzeText({
        items: rows.map(({ foodName, weightGrams }) => ({ foodName: foodName.trim(), weightGrams: Number(weightGrams) }))
      });
      setAnalysis(response.data.analysis);
    } catch (requestError) {
      const responseData = requestError.response?.data;
      if (requestError.response?.status === 422 && responseData?.foodName) {
        const invalidName = responseData.foodName.toLowerCase();
        setRows((current) => current.map((row) => row.foodName.trim().toLowerCase() === invalidName
          ? { ...row, serverError: t('This entry was not recognized as a food. Edit it and retry.') }
          : row));
      }
      setError({
        message: responseData?.foodName
          ? t('Could not recognize this food. Edit that entry and try again.')
          : t(responseData?.message || 'Nutrition analysis failed. Please try again.'),
        unavailable: requestError.response?.status === 503 || !requestError.response
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass nutrition-analyzer" aria-labelledby="analyzer-title">
      <div className="nutrition-analyzer__header">
        <div>
          <p className="section-eyebrow"><Sparkles size={15} aria-hidden="true" /> {t('NutriAI guidance')}</p>
          <h2 id="analyzer-title">{t('Build a meal from food names')}</h2>
          <p>{t('Enter each food and its weight for a nutrition estimate tailored to your training context.')}</p>
        </div>
        <span className="nutrition-analyzer__badge"><Utensils size={14} /> {t('Text-based estimate')}</span>
      </div>

      <div className="nutrition-food-rows">
        <AnimatePresence initial={false}>
          {rows.map((row, index) => {
            const validation = getValidation(row, t);
            return (
              <motion.div
                key={row.id}
                className="nutrition-food-row"
                layout
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
              >
                <label className="nutrition-field nutrition-field--food">
                  <span>{t('Food item')} {index + 1}</span>
                  <input
                    type="text"
                    maxLength={80}
                    autoComplete="off"
                    value={row.foodName}
                    placeholder={t('e.g. Chicken breast, cooked')}
                    aria-label={`${t('Food item')} ${index + 1} ${t('name')}`}
                    aria-required="true"
                    aria-invalid={Boolean(validation.name || row.serverError)}
                    onChange={(event) => updateRow(row.id, 'foodName', event.target.value)}
                    onBlur={() => setRows((current) => current.map((item) => item.id === row.id ? { ...item, nameTouched: true } : item))}
                  />
                  {validation.name && (row.nameTouched || row.foodName.length > 0) && <small className="field-error">{validation.name}</small>}
                  {row.serverError && <small className="field-error">{row.serverError}</small>}
                </label>
                <label className="nutrition-field nutrition-field--weight">
                  <span>{t('Weight')}</span>
                  <span className="nutrition-weight-input">
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      step="1"
                      value={row.weightGrams}
                      placeholder="150"
                      aria-label={`${t('Food item')} ${index + 1} ${t('weight in grams')}`}
                      aria-required="true"
                      aria-invalid={Boolean(validation.weight && row.weightGrams !== '')}
                      onChange={(event) => updateRow(row.id, 'weightGrams', event.target.value)}
                      onBlur={() => setRows((current) => current.map((item) => item.id === row.id ? { ...item, weightTouched: true } : item))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && index === rows.length - 1) {
                          event.preventDefault();
                          if (rows.length < 10) addRow();
                        }
                      }}
                    />
                    <span aria-hidden="true">g</span>
                  </span>
                  {validation.weight && (row.weightTouched || row.weightGrams !== '') && <small className="field-error">{validation.weight}</small>}
                </label>
                <button
                  type="button"
                  className="icon-button nutrition-remove"
                  onClick={() => {
                    setRows((current) => current.filter((item) => item.id !== row.id));
                    setAnalysis(null);
                  }}
                  disabled={rows.length === 1}
                  aria-label={`${t('Remove food')} ${index + 1}`}
                  title={t('Remove food')}
                >
                  <Minus size={17} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="nutrition-analyzer__actions">
        <button type="button" className="secondary-button" onClick={addRow} disabled={rows.length >= 10 || loading}>
          <Plus size={16} /> {t('Add food')} <span>({rows.length}/10)</span>
        </button>
        <button type="button" className="primary-button" onClick={analyze} disabled={!validRows || loading}>
          {loading ? <><LoaderCircle className="spin" size={16} /> {t('Analyzing')}</> : <><Sparkles size={16} /> {t('Analyze meal')}</>}
        </button>
      </div>

      {error && (
        <div className="nutrition-analyzer__error" role="alert">
          <AlertCircle size={17} />
          <div>
            <p>{error.unavailable ? t('AI unavailable') : error.message}</p>
            {error.unavailable && <p>{t('Your entries are still here. You can retry or enter this meal manually.')}</p>}
          </div>
          <button type="button" className="text-button" onClick={error.unavailable ? onEnterManually : analyze}>
            {error.unavailable ? t('Enter manually') : t('Retry')}
          </button>
        </div>
      )}

      {loading && (
        <div className="nutrition-analysis-loading" aria-live="polite">
          <div className="nutrition-analysis-loading__label"><LoaderCircle className="spin" size={16} /> {t('Estimating portions and nutrition…')}</div>
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      )}

      {analysis && (
        <motion.div className="nutrition-analysis-result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="nutrition-results-grid">
            {analysis.items.map((item) => (
              <article className="nutrition-item-result" key={`${item.foodName}-${item.weightGrams}`}>
                <div className="nutrition-item-result__heading">
                  <div><h3>{item.foodName}</h3><p>{item.weightGrams} g · {t(item.confidence)} {t('confidence')}</p></div>
                  <span className="nutrition-item-result__calories"><AnimatedNumber value={item.nutrition.calories} decimals={1} /> kcal</span>
                </div>
                <p className="nutrition-item-result__assumption">{item.assumption}</p>
                <div className="nutrition-item-result__macros">
                  {['protein', 'carbs', 'fat'].map((key) => <span key={key}>{t(key)} <strong>{item.nutrition[key]} g</strong></span>)}
                </div>
              </article>
            ))}
          </div>

          <section className="nutrition-totals">
            <div className="nutrition-totals__header">
              <div><p className="section-eyebrow">{t('Server-summed estimate')}</p><h3>{t('Meal totals')}</h3></div>
              <p><AnimatedNumber value={analysis.totals.calories} decimals={1} /> <span>kcal</span></p>
            </div>
            {['protein', 'carbs', 'fat', 'fiber'].map((key) => {
              const total = Number(analysis.totals[key] || 0);
              const barWidth = Math.min(100, total / (key === 'protein' ? 100 : 140) * 100);
              return (
                <div className="nutrition-total-bar" key={key}>
                  <div><span>{t(key)}</span><strong><AnimatedNumber value={total} decimals={1} suffix=" g" /></strong></div>
                  <div className="nutrition-total-bar__track"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: barWidth / 100 }} style={{ transformOrigin: 'left' }} /></div>
                </div>
              );
            })}
          </section>

          <div className="nutrition-guidance-grid">
            <article className="nutrition-guidance-card"><h3>{t('Health assessment')}</h3><p>{analysis.healthAssessment}</p></article>
            <article className="nutrition-guidance-card"><h3>{t('For your training')}</h3><p>{analysis.fitnessFit}</p></article>
          </div>
          <article className="nutrition-guidance-card">
            <h3>{t('Recommendations')}</h3>
            <ul>{analysis.recommendations.map((recommendation, index) => <li key={`${index}-${recommendation}`}>{recommendation}</li>)}</ul>
          </article>
          <div className="nutrition-guidance-grid">
            <article className="nutrition-guidance-card"><h3>{t('Portion advice')}</h3><p>{analysis.portionAdvice}</p></article>
            <article className="nutrition-guidance-card"><h3>{t('Allergens')}</h3><p>{analysis.allergens.length ? analysis.allergens.join(', ') : t('No common allergens identified.')}</p></article>
          </div>

          <div className="nutrition-result-footer">
            <p>{t('AI estimate, not medical advice')}</p>
            <button type="button" className="primary-button" onClick={() => onLog(analysis.items)} disabled={logging}>
              {logging ? <><LoaderCircle className="spin" size={16} /> {t('Saving meal')}</> : <><Check size={16} /> {t('Log this meal')}</>}
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
