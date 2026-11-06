// Statistiques de la veille (utilisées par l'étude de marché).
export const engagement = (v) => (Number(String(v.likes).replace(/\D/g, '')) || 0) + 2 * (Number(String(v.comments).replace(/\D/g, '')) || 0);
const lengthBucket = (v) => {
  const n = Number(v.length) || (v.text || '').length;
  return n < 600 ? 'Court (< 600 car.)' : n < 1300 ? 'Moyen (600–1 300)' : 'Long (> 1 300)';
};

export function groupBy(items, key) {
  const map = new Map();
  for (const v of items) {
    const k = (typeof key === 'function' ? key(v) : v[key]) || 'Non classé';
    const g = map.get(k) || { label: k, count: 0, total: 0, likes: 0, comments: 0 };
    g.count++;
    g.total += engagement(v);
    g.likes += Number(v.likes) || 0;
    g.comments += Number(v.comments) || 0;
    map.set(k, g);
  }
  return [...map.values()]
    .map((g) => ({ ...g, avg: Math.round(g.total / g.count), avgLikes: Math.round(g.likes / g.count), avgComments: Math.round(g.comments / g.count) }))
    .sort((a, b) => b.avg - a.avg);
}

export function nicheStats(items) {
  return {
    topics: groupBy(items, 'topic'),
    hooks: groupBy(items, 'hookType'),
    formats: groupBy(items, 'format'),
    lengths: groupBy(items, lengthBucket),
  };
}

export function statsText(items) {
  const s = nicheStats(items);
  const line = (g) => `${g.label} : ${g.count} posts, engagement moyen ${g.avg} (${g.avgLikes} 👍, ${g.avgComments} 💬)`;
  return [
    `Posts analysés : ${items.length}`,
    `PAR SUJET\n${s.topics.map(line).join('\n')}`,
    `PAR TYPE DE HOOK\n${s.hooks.map(line).join('\n')}`,
    `PAR FORMAT\n${s.formats.map(line).join('\n')}`,
    `PAR LONGUEUR\n${s.lengths.map(line).join('\n')}`,
  ].join('\n\n');
}
