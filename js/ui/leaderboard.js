// js/ui/leaderboard.js
const DIFFICULTY_KEYS = {
  easy: 'leaderboard_easy',
  medium: 'leaderboard_medium',
  hard: 'leaderboard_hard',
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadLeaderboard(difficulty) {
  const key = DIFFICULTY_KEYS[difficulty];
  if (!key) return [];
  const raw = localStorage.getItem(key);
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export function saveLeaderboard(difficulty, entries) {
  const key = DIFFICULTY_KEYS[difficulty];
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save leaderboard', e);
  }
}

// entry: { name, score, date }
// returns { updatedEntries, insertedIndex }
export function addScore(difficulty, entry) {
  if (!DIFFICULTY_KEYS[difficulty]) difficulty = 'medium';
  const score = Number(entry.score) || 0;
  const name =
    (entry.name || 'Player').toString().trim().substring(0, 10) || 'Player';
  const date = entry.date || Date.now();

  const entries = loadLeaderboard(difficulty);

  // find insert position (descending by score)
  let insertedIndex = -1;
  for (let i = 0; i < entries.length; i++) {
    if (score > Number(entries[i].score)) {
      entries.splice(i, 0, { name, score, date });
      insertedIndex = i;
      break;
    }
  }

  // if not inserted and we have fewer than 5, append
  if (insertedIndex === -1 && entries.length < 5) {
    entries.push({ name, score, date });
    insertedIndex = entries.length - 1;
  }

  // if there were no entries at all
  if (insertedIndex === -1 && entries.length === 0) {
    entries.push({ name, score, date });
    insertedIndex = 0;
  }

  // trim to top 5
  if (entries.length > 5) entries.length = 5;

  // determine if we actually changed the stored leaderboard (insertedIndex != -1)
  if (insertedIndex !== -1) {
    saveLeaderboard(difficulty, entries);
  }

  return { updatedEntries: entries, insertedIndex };
}

function escapeHtml(s) {
  return (s || '').replace(
    /[&<>"']/g,
    m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        m
      ]
  );
}

export function renderBoard(difficulty) {
  const entries = loadLeaderboard(difficulty);
  const listEl = document.getElementById('scores-' + difficulty);
  if (!listEl) return;
  listEl.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const e = entries[i];
    const li = document.createElement('li');
    li.className = 'score-row';
    if (e) {
      const d = new Date(e.date);
      li.innerHTML = `
        <span class="rank">${i + 1}.</span>
        <span class="name">${escapeHtml(e.name)}</span>
        <span class="score">${Number(e.score)}</span>
        <span class="date">${d.toLocaleDateString()}</span>
      `;
    } else {
      li.innerHTML = `
        <span class="rank">${i + 1}.</span>
        <span class="empty">—</span>
      `;
    }
    listEl.appendChild(li);
  }
}

export function renderAllBoards() {
  ['easy', 'medium', 'hard'].forEach(renderBoard);
}

// expose a small API to window for integration from game code
if (typeof window !== 'undefined') {
  window.leaderboard = window.leaderboard || {};
  window.leaderboard.addScore = (d, e) => addScore(d, e);
  window.leaderboard.load = d => loadLeaderboard(d);
  window.leaderboard.renderAll = () => renderAllBoards();
}

export default {
  loadLeaderboard,
  saveLeaderboard,
  addScore,
  renderBoard,
  renderAllBoards,
};
