export function getAutoCompetencies(disciplines, completedSet) {
  const map = {};
  disciplines.forEach(d => {
    if (completedSet.has(d.id)) {
      (d.competencies || []).forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    }
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, source: "auto" }));
}