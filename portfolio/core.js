(function (root) {
  'use strict';
  const choose = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
  function config(params) {
    return {
      demo: choose(params.get('demo'), ['home', 'history', 'math', 'quakes', 'budget', 'hearing'], 'home'),
      case: choose(params.get('case'), ['flood-camp', 'flood-mess-hall', 'union-avenue', 'flood-damage', 'relief-shoes', 'steel-mill'], 'flood-camp'),
      level: choose(Number(params.get('level')), [1, 2, 3], 1),
      ms: params.has('ms') ? choose(Number(params.get('ms')), [0, 350, 650, 1200, 3000, 5000], 0) : 0,
      rounds: choose(Number(params.get('rounds')), [6, 8, 12], 6),
      layout: choose(params.get('layout'), ['mixed', 'grouped', 'scattered'], 'grouped'),
      period: choose(params.get('period'), ['day', 'week'], 'day'),
      min: choose(params.get('min'), ['2.5', '4.5'], '2.5')
    };
  }
  function seeded(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function patterns(settings, seed) {
    const random = seeded(seed);
    const range = settings.level === 1 ? [2, 3, 4] : settings.level === 2 ? [5, 6, 7] : [8, 9, 10];
    const list = [];
    for (let i = 0; i < settings.rounds; i++) {
      const amount = settings.layout === 'mixed' && i % 2 ? list[i - 1].amount : range[Math.floor(random() * range.length)];
      const layout = settings.layout === 'mixed' ? (i % 2 ? 'scattered' : 'grouped') : settings.layout;
      list.push({ amount, layout, points: points(amount, layout, random) });
    }
    if (settings.layout === 'mixed') {
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    }
    return list;
  }
  function points(amount, layout, random) {
    if (layout === 'grouped') {
      const dice = {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]};
      const groups = amount <= 4 ? [amount] : [Math.floor(amount / 2), Math.ceil(amount / 2)];
      return groups.flatMap((n, i) => dice[n].map(([x, y]) => [groups.length === 1 ? 300 + x * 62 : (i ? 420 : 180) + x * 48, 180 + y * 62]));
    }
    const cells = Array.from({length: 24}, (_, i) => [85 + i % 6 * 86, 72 + Math.floor(i / 6) * 72]);
    for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
    return cells.slice(0, amount).map(([x, y]) => [x + (random() - .5) * 22, y + (random() - .5) * 20]);
  }
  function summary(trials) {
    return ['grouped', 'scattered'].map(layout => {
      const rows = trials.filter(t => t.layout === layout);
      return {layout, count: rows.length, correct: rows.filter(t => t.answer === t.amount).length, responseMs: rows.length ? Math.round(rows.reduce((sum, t) => sum + t.responseMs, 0) / rows.length) : null, counted: rows.filter(t => t.strategy === 'counted').length};
    });
  }
  function earthquakes(raw) {
    if (!raw || raw.type !== 'FeatureCollection' || !Array.isArray(raw.features) || raw.features.length > 5000 || !Number.isFinite(raw.metadata?.generated)) throw new Error('USGS returned an unexpected feed format.');
    return raw.features.filter(f => f?.properties?.type === 'earthquake' && typeof f.id === 'string' && Number.isFinite(f.properties.time) && Number.isFinite(f.properties.mag) && Array.isArray(f.geometry?.coordinates) && f.geometry.coordinates.length >= 3 && f.geometry.coordinates.slice(0,3).every(Number.isFinite) && Math.abs(f.geometry.coordinates[0]) <= 180 && Math.abs(f.geometry.coordinates[1]) <= 90).map(f => ({id: f.id, mag: f.properties.mag, place: String(f.properties.place || 'Location not named'), time: f.properties.time, updated: f.properties.updated, status: String(f.properties.status || 'unknown'), magType: String(f.properties.magType || 'unspecified'), lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], depth: f.geometry.coordinates[2], url: 'https://earthquake.usgs.gov/earthquakes/eventpage/' + encodeURIComponent(f.id)}));
  }
  function project(lon, lat) { return [(lon + 180) * 2.5, (90 - lat) * 2.5]; }
  function median(values) { const sorted = [...values].sort((a,b) => a-b); const n = sorted.length; return n ? n % 2 ? sorted[(n-1)/2] : (sorted[n/2-1] + sorted[n/2])/2 : null; }
  const api = {config, patterns, points, summary, earthquakes, project, median};
  root.FieldworkCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
