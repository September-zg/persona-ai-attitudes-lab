/* Deterministic scoring and descriptive analysis. No network or model calls. */
(function () {
  const definition = typeof module !== 'undefined' && module.exports
    ? require('./questionnaire.js') : globalThis.AssessmentDefinition;
  const items = [...definition.personality, ...definition.attitude];
  const keys = Object.keys(definition.dimensions);
  const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const variance = values => values.length < 2 ? null : values.reduce((s, x) => s + (x - mean(values)) ** 2, 0) / (values.length - 1);
  function validAnswers(answers) {
    return answers && Object.keys(answers).length === items.length && items.every(q => Number.isInteger(answers[q[0]]) && answers[q[0]] >= 1 && answers[q[0]] <= 5);
  }
  function score(answers) {
    if (!validAnswers(answers)) throw new Error('需要完整的 26 题整数回答（1–5）。');
    return Object.fromEntries(keys.map(key => [key, mean(items.filter(q => q[2] === key).map(q => q[3] ? 6 - answers[q[0]] : answers[q[0]]))]));
  }
  function alpha(selectedItems, rows) {
    if (rows.length < 10 || selectedItems.length < 2) return null;
    const matrix = rows.map(r => selectedItems.map(q => q[3] ? 6 - r.answers[q[0]] : r.answers[q[0]]));
    const totalVariance = variance(matrix.map(row => row.reduce((a, b) => a + b, 0)));
    if (!totalVariance) return null;
    const itemVariance = selectedItems.reduce((sum, _, i) => sum + variance(matrix.map(row => row[i])), 0);
    return selectedItems.length / (selectedItems.length - 1) * (1 - itemVariance / totalVariance);
  }
  function correlation(a, b) {
    if (a.length < 10 || b.length !== a.length) return null;
    const ma = mean(a), mb = mean(b);
    const aa = a.map(x => x - ma), bb = b.map(x => x - mb);
    const denominator = Math.sqrt(aa.reduce((s, x) => s + x * x, 0) * bb.reduce((s, x) => s + x * x, 0));
    return denominator ? aa.reduce((s, x, i) => s + x * bb[i], 0) / denominator : null;
  }
  function histogram(values) {
    const counts = [0, 0, 0, 0];
    for (const value of values) if (Number.isFinite(value) && value >= 1 && value <= 5) counts[Math.min(3, Math.floor(value - 1))]++;
    return counts;
  }
  function summarize(payload) {
    const source = payload.responses || [];
    const synthetic = source.filter(r => r.syntheticTest === true).length;
    const invalid = source.filter(r => r.syntheticTest !== true && !validAnswers(r.answers)).length;
    const rows = source.filter(r => r.syntheticTest !== true && validAnswers(r.answers)).map(r => ({...r, scores:score(r.answers)}));
    const feedback = (payload.feedback || []).filter(f => f.syntheticTest !== true && Number.isInteger(f.rating) && f.rating >= 1 && f.rating <= 5);
    const averages = Object.fromEntries(keys.map(k => [k, mean(rows.map(r => r.scores[k]))]));
    const alphas = Object.fromEntries(keys.map(k => [k, alpha(items.filter(q => q[2] === k), rows)]));
    const distributions = Object.fromEntries(keys.map(k => [k, histogram(rows.map(r => r.scores[k]))]));
    const itemCounts = Object.fromEntries(items.map(q => [q[0], [1, 2, 3, 4, 5].map(n => rows.filter(r => r.answers[q[0]] === n).length)]));
    const correlations = Object.fromEntries(keys.slice(0, 5).map(p => [p, Object.fromEntries(keys.slice(5).map(a => [a, correlation(rows.map(r => r.scores[p]), rows.map(r => r.scores[a]))]))]));
    const timed = rows.map(r => r.durationSeconds).filter(x => Number.isFinite(x) && x >= 0);
    const feedbackStats = Object.fromEntries(Object.keys(definition.feedbackFields).map(k => {
      const values = feedback.map(f => k === 'rating' ? f.rating : f.ratings?.[k]).filter(v => Number.isInteger(v) && v >= 1 && v <= 5);
      return [k, {n:values.length, mean:mean(values)}];
    }));
    const patterns = rows.filter(r => new Set(Object.values(r.answers)).size === 1).length;
    return {rows, feedback, synthetic, invalid, averages, alphas, distributions, itemCounts, correlations, feedbackStats, timedCount:timed.length, meanDuration:mean(timed), straightLineCount:patterns};
  }
  const api = {score, validAnswers, alpha, correlation, histogram, summarize};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.AssessmentAnalysis = api;
})();
