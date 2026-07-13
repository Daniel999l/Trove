import Item from '../models/Item.js';

export async function findMatches(query, location) {
  const items = await Item.find({ status: 'available' }).lean();

  const scored = items.map(item => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || '').toLowerCase();

    const queryWords = queryLower.split(/\s+/);
    const itemWords = (titleLower + ' ' + descLower).split(/\s+/);
    const overlap = queryWords.filter(w => itemWords.includes(w)).length;
    score += overlap * 10;

    if (item.location.toLowerCase() === location.toLowerCase()) {
      score += 5;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).filter(s => s.score > 0).map(s => s.item);
}