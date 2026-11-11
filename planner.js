(() => {
const places = [
  { en: 'Bayterek', kk: 'Бәйтерек', open: 600, close: 1080, visit: 45, cost: 1500, interests: 'architecture, skyline, observation tower' },
  { en: 'National Museum', kk: 'Ұлттық музей', open: 600, close: 1020, visit: 75, cost: 2000, interests: 'history, culture, indoor exhibitions' },
  { en: 'Khan Shatyr', kk: 'Хан Шатыр', open: 600, close: 1260, visit: 45, cost: 0, interests: 'shopping, architecture, indoor leisure' },
  { en: 'Palace of Peace and Reconciliation', kk: 'Бейбітшілік және келісім сарайы', open: 600, close: 1020, visit: 60, cost: 1200, interests: 'architecture, culture, pyramid' },
  { en: 'Botanical Garden', kk: 'Ботаникалық бақ', open: 540, close: 1140, visit: 60, cost: 0, interests: 'nature, gardens, outdoor walking' }
];

function schedule(ids, start, hours) {
  let cursor = start;
  const limit = start + hours * 60;
  return ids.map((id, i) => {
    const p = places[id];
    const arrival = cursor + (i ? 30 : 0);
    const visitStart = Math.max(arrival, p.open);
    const end = visitStart + p.visit;
    cursor = end;
    return { id, p, start: visitStart, end, wait: visitStart - arrival, late: Math.max(0, end - limit), closed: end > p.close };
  });
}

function feasibleRoutes(start, hours, budget) {
  const routes = [];
  function visit(ids) {
    const rows = schedule(ids, start, hours);
    const cost = rows.reduce((sum, row) => sum + row.p.cost, 0);
    if (cost > budget || rows.some(row => row.late || row.closed)) return;
    if (ids.length >= 2) routes.push({ ids, cost, end: rows.at(-1).end });
    if (ids.length === 4) return;
    places.forEach((_, id) => {
      if (!ids.includes(id)) visit([...ids, id]);
    });
  }
  visit([]);
  return routes;
}

const TravelPlanner = { places, schedule, feasibleRoutes };
if (typeof module !== 'undefined') module.exports = TravelPlanner;
if (typeof window !== 'undefined') window.TravelPlanner = TravelPlanner;

})();
