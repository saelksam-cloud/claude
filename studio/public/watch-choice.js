export function pickWatchReference(posts, votes, previousId, random = Math.random) {
  const rated = new Set(Object.values(votes || {}).filter(v => !v.selectedText && !v.feedbackTags?.length && v.rating)
    .map(v => v.contentId.replace(/^ref-/, '')));
  const unseen = posts.filter(post => !rated.has(post.id));
  const available = unseen.length ? unseen : posts.filter(post =>
    !Object.values(votes || {}).some(v => v.contentId === 'ref-' + post.id && !v.selectedText && !v.feedbackTags?.length && v.rating < 0));
  const alternatives = available.filter(post => post.id !== previousId);
  const pool = alternatives.length ? alternatives : available;
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}
