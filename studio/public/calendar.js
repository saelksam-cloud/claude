const formatter = (options) => new Intl.DateTimeFormat('fr-FR', options);
const dayKey = (date) => {
  const pad = (number) => String(number).padStart(2, '0');
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
};
const moveDay = (date, offset) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset, 12);
const monday = (date) => moveDay(date, -((date.getDay() + 6) % 7));

export function calendarDate(cursor, mode, direction) {
  if (!direction) return new Date();
  return mode === 'month'
    ? new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1, 12)
    : moveDay(cursor, direction * 7);
}

export function calendarMarkup({ posts, cursor, mode, statuses, esc }) {
  const month = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 12);
  const start = monday(mode === 'month' ? month : cursor);
  const size = mode === 'week' ? 7 : Math.round((moveDay(monday(end), 7) - start) / 86400000);
  const today = dayKey(new Date());
  const byDay = new Map();
  for (const post of posts) {
    const raw = post.status === 'published' ? post.publishedAt || post.scheduledAt : post.scheduledAt;
    const date = new Date(raw || NaN);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push({ post, date });
  }
  const shownDays = Array.from({ length: size }, (_, index) => moveDay(start, index));
  const count = shownDays.reduce((sum, date) => sum + (byDay.get(dayKey(date))?.length || 0), 0);
  const dayName = formatter({ weekday: 'long', day: 'numeric', month: 'long' });
  const time = formatter({ hour: '2-digit', minute: '2-digit' });
  const period = mode === 'month'
    ? formatter({ month: 'long', year: 'numeric' }).format(cursor)
    : formatter({ day: 'numeric', month: 'short', year: 'numeric' }).formatRange(start, moveDay(start, 6));
  return [
    '<div class="work-panel calendar-panel">',
    '<div class="calendar-head">',
    '<div><h2>' + esc(period) + '</h2><span class="small">' + count + ' post' + (count === 1 ? '' : 's') + ' sur la période affichée</span></div>',
    '<div class="row"><button class="btn sm" data-action="calendar-move" data-id="-1" aria-label="Période précédente">‹</button>',
    '<button class="btn sm" data-action="calendar-move" data-id="0">Aujourd’hui</button>',
    '<button class="btn sm" data-action="calendar-move" data-id="1" aria-label="Période suivante">›</button></div>',
    '<div class="seg" aria-label="Période du calendrier">' + [['month', 'Mois'], ['week', 'Semaine']].map(([key, label]) =>
      '<button class="' + (mode === key ? 'on' : '') + '" data-action="calendar-mode" data-id="' + key + '" aria-pressed="' + (mode === key) + '">' + label + '</button>').join('') + '</div></div>',
    '<div class="calendar-days" aria-hidden="true">' + ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'].map((day) => '<span>' + day + '</span>').join('') + '</div>',
    '<div class="calendar-grid ' + mode + '">',
    ...shownDays.map((date) => {
      const key = dayKey(date);
      const items = byDay.get(key) || [];
      const classes = [items.length ? 'has-posts' : '', key === today ? 'today' : '', mode === 'month' && date.getMonth() !== cursor.getMonth() ? 'out-month' : ''].join(' ');
      return '<section class="calendar-day ' + classes + '" aria-label="' + esc(dayName.format(date)) + '" data-drop-date="' + key + '">' +
        '<div class="calendar-number"><span>' + date.getDate() + '</span><small>' + esc(dayName.format(date)) + '</small></div>' +
        items.map(({ post, date: postDate }) => {
          const title = post.theme || post.text.split('\n')[0].slice(0, 70);
          return '<button class="cal-post s-' + post.status + '" draggable="' + (post.status !== 'published') + '" data-calendar-post="' + esc(post.id) +
            '" data-action="post-detail" data-id="' + esc(post.id) + '" title="' + esc(title) + '"><small>' + time.format(postDate) +
            ' · ' + esc(statuses[post.status]) + '</small><strong>' + esc(title) + '</strong></button>';
        }).join('') + '</section>';
    }),
    '</div></div>',
    count ? '' : '<div class="card empty calendar-empty">Aucun post à ces dates. Ouvre un post pour lui donner une date, ou crée un brouillon dans le Studio.</div>',
  ].join('');
}
