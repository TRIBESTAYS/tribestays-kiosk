export const CONFIG = {
  registerUrl: import.meta.env.VITE_REGISTER_URL || 'https://tribestays.com/events/register',
  apiBase: import.meta.env.VITE_API_BASE || null,
  autoAdvanceMs: 4500,  // time each card stays in focus while auto-scrolling
  resumeAfterMs: 5500,  // auto-scroll resumes this long after the last touch
  idleResetMs: 45000,   // an open registration panel closes after this much inactivity
  successCloseMs: 8000, // success screen auto-closes after this
};

const img = (id) => `https://images.unsplash.com/${id}?w=640&q=70&auto=format&fit=crop`;

// colors: [start, end] of each card's gradient
export const EVENTS = [
  { id: 'f1-race-night', title: 'F1 Race Night', tagline: 'Lights out on the big screen. Pit-stop snacks & podium prizes.', category: 'Motorsport', emoji: '🏎️', art: 'checker', date: '2026-11-08', time: '7:00 PM', venue: 'Rooftop Lounge', spots: 40, colors: ['#FF431E', '#B3122E'] },
  { id: 'football-5s', title: 'Floodlit 5-a-side', tagline: 'Mixed teams, no egos. Boots optional, banter mandatory.', category: 'Football', emoji: '⚽', date: '2026-11-08', time: '5:00 PM', venue: 'Turf Arena', spots: 20, image: img('photo-1431324155629-1a6deb1dec8d'), colors: ['#307C5F', '#0A7CC1'] },
  { id: 'sunrise-yoga', title: 'Sunrise Yoga', tagline: 'Slow flow, deep breaths and chai on the terrace after.', category: 'Wellness', emoji: '🧘', date: '2026-11-04', time: '6:30 AM', venue: 'Terrace Garden', spots: 18, image: img('photo-1544367567-0f2fcb009e0b'), colors: ['#307C5F', '#CDC3B9'] },
  { id: 'pottery-workshop', title: 'Pottery Workshop', tagline: 'Get your hands muddy on the wheel. Take home what you make.', category: 'Workshop', emoji: '🏺', date: '2026-11-05', time: '6:00 PM', venue: 'Studio B, Ground Floor', spots: 12, image: img('photo-1565193566173-7a0ee3dbe261'), colors: ['#CDC3B9', '#FF431E'] },
  { id: 'speakeasy-night', title: 'Speakeasy Night', tagline: 'Jazz, low lights and mocktails. Password at the door: “tribe”.', category: 'Social', emoji: '🥃', date: '2026-11-06', time: '9:00 PM', venue: 'The Hidden Room, Basement', spots: 35, image: img('photo-1514362545857-3bc16c4c7d1b'), colors: ['#0A7CC1', '#3A1C71'] },
  { id: 'board-game-night', title: 'Board Game Night', tagline: 'Catan, Codenames & questionable alliances. Pizza on us.', category: 'Games', emoji: '🎲', date: '2026-11-03', time: '8:00 PM', venue: 'Common Lounge', spots: 24, image: img('photo-1610890716171-6b1bb98ffd09'), colors: ['#FF431E', '#0A7CC1'] },
  { id: 'open-mic', title: 'Open Mic', tagline: 'Sing, rap, roast, recite. Five minutes, one mic, all love.', category: 'Music', emoji: '🎤', date: '2026-11-07', time: '8:30 PM', venue: 'Amphitheatre', spots: 60, image: img('photo-1516450360452-9312f5e86fc7'), colors: ['#B3122E', '#0A7CC1'] },
  { id: 'rooftop-movie', title: 'Rooftop Movie', tagline: 'Bean bags, popcorn and a cult classic under the stars.', category: 'Cinema', emoji: '🍿', date: '2026-11-09', time: '8:00 PM', venue: 'Rooftop', spots: 45, image: img('photo-1489599849927-2ee91cede3ba'), colors: ['#307C5F', '#FF431E'] },
];

const asDate = (iso) => new Date(`${iso}T12:00:00`);
export const shortDate = (e) => asDate(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
export const featureDate = (e) => asDate(e.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
export const longDate = (e) => asDate(e.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
export const cardVars = (e) => ({ '--c1': e.colors[0], '--c2': e.colors[1] });

/* ---------- Data access ----------
   With VITE_API_BASE unset, mock data is used: rooms 101–999 exist,
   odd numbers have 1 resident, even numbers have 2. */
const MOCK_ROOMS = { 101: 1, 102: 2, 204: 2, 305: 1, 412: 2 };
const mockRegistrations = new Set();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Returns { found: false } or { found: true, residents }
export async function lookupRoom(room) {
  if (CONFIG.apiBase) {
    const res = await fetch(`${CONFIG.apiBase}/rooms/${encodeURIComponent(room)}`);
    if (res.status === 404) return { found: false };
    if (!res.ok) throw new Error('Lookup failed');
    const data = await res.json(); // expected: { residents: number }
    return { found: true, residents: data.residents };
  }
  await wait(900);
  const n = Number(room);
  if (MOCK_ROOMS[n]) return { found: true, residents: MOCK_ROOMS[n] };
  if (n >= 101 && n <= 999) return { found: true, residents: n % 2 ? 1 : 2 };
  return { found: false };
}

// Returns { ok: true } or { ok: false, reason: 'already' | 'error' }
export async function submitRegistration({ eventId, room, attendees }) {
  if (CONFIG.apiBase) {
    const res = await fetch(`${CONFIG.apiBase}/events/${encodeURIComponent(eventId)}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, attendees }),
    });
    if (res.status === 409) return { ok: false, reason: 'already' };
    if (!res.ok) return { ok: false, reason: 'error' };
    return { ok: true };
  }
  await wait(700);
  const key = `${eventId}:${room}`;
  if (mockRegistrations.has(key)) return { ok: false, reason: 'already' };
  mockRegistrations.add(key);
  return { ok: true };
}