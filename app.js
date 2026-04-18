/**
 * ╔══════════════════════════════════════════════════════════════╗
 *   YallQuran — app.js
 *   Author  : YallCode  (github.com/yallcode)
 *   API     : https://alquran.cloud/api  (text)
 *             https://cdn.islamic.network (audio)
 *   Licence : MIT
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Modules:
 *   A. Theme         – dark / light toggle, localStorage
 *   B. Sidebar       – open/close, accordion sections
 *   C. Surah list    – populate the <select> dropdown
 *   D. Surah loader  – fetch Arabic + English in parallel
 *   E. Renderer      – inject header card + ayah cards
 *   F. Tajweed       – regex-based colour highlighting
 *   G. Audio engine  – play, pause, seek, auto-advance, volume
 *   H. Init          – bootstrap on DOMContentLoaded
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */

const API_BASE   = 'https://api.alquran.cloud/v1';
const AUDIO_CDN  = 'https://cdn.islamic.network/quran/audio/128';
const TRANS_ED   = 'en.sahih';                  // English translation edition

// Surahs that don't start with Bismillah
const NO_BISMILLAH = new Set([1, 9]);

// Human-readable names for each edition key
const EDITION_LABELS = {
  'quran-uthmani':   'Ḥafs ʿan ʿĀṣim · Uthmani',
  'quran-simple':    'Ḥafs ʿan ʿĀṣim · Simple',
  'quran-warsh-hafs':'Warsh ʿan Nāfiʿ',
  'quran-simple-min':'Unvocalised Script',
};

// Human-readable names for each reciter ID
const RECITER_LABELS = {
  'ar.alafasy':              'Mishary Al-Afasy',
  'ar.abdurrahmaansudais':   'As-Sudais',
  'ar.husary':               'Al-Husary',
  'ar.minshawi':             'Al-Minshawi',
  'ar.muhammadayyoub':       'Muhammad Ayyoub',
  'ar.abdullahbasfar':       'Abdullah Basfar',
  'ar.saoodshuraym':         'Saud Al-Shuraim',
  'ar.hanirifai':            'Hani Ar-Rifai',
};

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */

const state = {
  edition:       'quran-uthmani',  // current text edition
  reciter:       '',               // current audio reciter ID ('' = silent)
  tajweedOn:     false,            // tajweed colour mode
  largeText:     false,            // bigger Arabic font
  autoAdvance:   true,             // auto-play next ayah
  volume:        0.9,              // 0–1

  surahNumber:   null,             // currently loaded Surah number (1–114)
  ayahsData:     [],               // [{numberInSurah, number, arabic, translation}]
  surahName:     '',

  playingIndex:  -1,               // index of currently playing ayah (0-based)
  isPlaying:     false,
};

/* ══════════════════════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const sbToggle    = $('sb-toggle');
const sbOverlay   = $('sb-overlay');
const sidebar     = $('sidebar');
const surahSel    = $('surah-sel');
const themeBtn    = $('theme-btn');
const themeIcon   = $('theme-icon');

const welcome     = $('welcome');
const shCard      = $('sh-card');
const shBadge     = $('sh-badge');
const shName      = $('sh-name');
const shMeta      = $('sh-meta');
const bismillah   = $('bismillah');
const shPills     = $('sh-pills');
const errBar      = $('err-bar');
const ayahList    = $('ayah-list');

const tjToggle    = $('tj-tog');
const bigToggle   = $('big-tog');
const tjLegend    = $('tj-legend');
const autoAdvChk  = $('auto-adv');
const sbVol       = $('sb-vol');

// Audio bar
const audioBar    = $('audio-bar');
const abRecName   = $('ab-reciter-name');
const abAyahLbl   = $('ab-ayah-label');
const abRange     = $('ab-range');
const abCur       = $('ab-cur');
const abDur       = $('ab-dur');
const abPrev      = $('ab-prev');
const abPP        = $('ab-pp');
const abNext      = $('ab-next');
const abVol       = $('ab-vol');
const abVolIcon   = $('ab-vol-icon');

/* ══════════════════════════════════════════════════════════════
   A. THEME
══════════════════════════════════════════════════════════════ */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('yq-theme', theme);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

themeBtn.addEventListener('click', toggleTheme);
applyTheme(localStorage.getItem('yq-theme') || 'light');

/* ══════════════════════════════════════════════════════════════
   B. SIDEBAR
══════════════════════════════════════════════════════════════ */

function openSidebar() {
  document.body.classList.add('sb-open');
  localStorage.setItem('yq-sidebar', 'open');
}
function closeSidebar() {
  document.body.classList.remove('sb-open');
  localStorage.setItem('yq-sidebar', 'closed');
}
function toggleSidebar() {
  document.body.classList.contains('sb-open') ? closeSidebar() : openSidebar();
}

// On large screens always start open; on small screens respect stored pref
function initSidebar() {
  const stored = localStorage.getItem('yq-sidebar');
  if (window.innerWidth >= 1080) {
    openSidebar();
  } else {
    stored === 'open' ? openSidebar() : closeSidebar();
  }
}

sbToggle.addEventListener('click', toggleSidebar);
sbOverlay.addEventListener('click', closeSidebar);

// Accordion section toggle
$$('.sb-sec-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sec = btn.closest('.sb-sec');
    sec.classList.toggle('open');
  });
});

/* ── Edition radio buttons ─────────────── */
$$('input[name="edition"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.edition = radio.value;
    // Update active styles
    $$('.opt-row[data-ed]').forEach(r => r.classList.remove('sel'));
    radio.closest('.opt-row').classList.add('sel');
    // Reload current Surah with new edition
    if (state.surahNumber) loadSurah(state.surahNumber);
  });
});

/* ── Reciter radio buttons ─────────────── */
$$('input[name="reciter"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.reciter = radio.value;
    $$('.opt-row[data-rec]').forEach(r => r.classList.remove('sel'));
    radio.closest('.opt-row').classList.add('sel');
    // Stop any playing audio
    audioStop();
    // Show/hide per-ayah play buttons + audio bar
    updateAudioUI();
    // Update bar reciter label
    abRecName.textContent = state.reciter ? RECITER_LABELS[state.reciter] || state.reciter : '—';
  });
});

/* ── Tajweed toggle ────────────────────── */
tjToggle.addEventListener('change', () => {
  state.tajweedOn = tjToggle.checked;
  tjLegend.classList.toggle('show', state.tajweedOn);
  // Re-render Arabic text in all existing cards
  rerenderArabicText();
});

/* ── Large text toggle ─────────────────── */
bigToggle.addEventListener('change', () => {
  state.largeText = bigToggle.checked;
  $$('.ayah-ar').forEach(el => el.classList.toggle('big', state.largeText));
});

/* ── Auto-advance toggle ───────────────── */
autoAdvChk.addEventListener('change', () => {
  state.autoAdvance = autoAdvChk.checked;
});

/* ── Sidebar volume slider ─────────────── */
sbVol.addEventListener('input', () => {
  state.volume = sbVol.value / 100;
  abVol.value  = sbVol.value;   // keep in sync
  if (audioEl) audioEl.volume = state.volume;
});

/* ══════════════════════════════════════════════════════════════
   C. SURAH LIST
══════════════════════════════════════════════════════════════ */

async function loadSurahList() {
  try {
    const res  = await fetch(`${API_BASE}/surah`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.data.forEach(s => {
      const opt = document.createElement('option');
      opt.value       = s.number;
      opt.textContent = `${s.number}. ${s.englishName}  (${s.name})`;
      surahSel.appendChild(opt);
    });
  } catch (err) {
    console.error('[YQ] Surah list failed:', err);
    showError('Could not load Surah list. Check your internet connection.');
  }
}

surahSel.addEventListener('change', e => {
  if (e.target.value) loadSurah(Number(e.target.value));
});

/* ══════════════════════════════════════════════════════════════
   D. SURAH LOADER
══════════════════════════════════════════════════════════════ */

async function loadSurah(num) {
  state.surahNumber = num;
  clearError();
  hideWelcome();
  audioStop();
  showSkeletons(8);

  try {
    // Fetch Arabic (chosen edition) + English translation in parallel
    const [arRes, trRes] = await Promise.all([
      fetch(`${API_BASE}/surah/${num}/${state.edition}`),
      fetch(`${API_BASE}/surah/${num}/${TRANS_ED}`),
    ]);

    // Graceful fallback: if the requested edition 404s (e.g. warsh not on API),
    // fall back to quran-uthmani silently
    if (!arRes.ok) {
      if (arRes.status === 404) {
        console.warn(`[YQ] Edition "${state.edition}" not found, falling back to uthmani`);
        const fallbackRes = await fetch(`${API_BASE}/surah/${num}/quran-uthmani`);
        if (!fallbackRes.ok) throw new Error(`Fallback also failed (HTTP ${fallbackRes.status})`);
        const fbData = await fallbackRes.json();
        const trData = await trRes.json();
        renderSurah(fbData.data, trData.data.ayahs, true);
        return;
      }
      throw new Error(`Arabic fetch HTTP ${arRes.status}`);
    }
    if (!trRes.ok) throw new Error(`Translation fetch HTTP ${trRes.status}`);

    const arData = await arRes.json();
    const trData = await trRes.json();
    renderSurah(arData.data, trData.data.ayahs, false);

  } catch (err) {
    console.error(`[YQ] loadSurah(${num}) error:`, err);
    clearSkeletons();
    showError(`Failed to load Surah ${num}. ${err.message}`);
  }
}

/* ══════════════════════════════════════════════════════════════
   E. RENDERER
══════════════════════════════════════════════════════════════ */

function renderSurah(surahInfo, transAyahs, usedFallback) {
  // Cache ayah data for audio
  state.surahName = surahInfo.englishName;
  state.ayahsData = surahInfo.ayahs.map((a, i) => ({
    index:          i,
    numberInSurah:  a.numberInSurah,
    globalNumber:   a.number,        // global ayah number (1-6236) for audio CDN
    arabic:         a.text,
    translation:    transAyahs[i]?.text || '',
  }));

  // ── Header card ─────────────────────────────
  shBadge.textContent = `Surah ${surahInfo.number}`;
  shName.textContent  = `${surahInfo.englishName}  —  ${surahInfo.name}`;
  shMeta.textContent  = `${surahInfo.revelationType} · ${surahInfo.numberOfAyahs} Ayahs · ${surahInfo.englishNameTranslation}`;

  bismillah.style.display = NO_BISMILLAH.has(surahInfo.number) ? 'none' : 'block';

  // Info pills
  shPills.innerHTML = '';
  addPill(EDITION_LABELS[state.edition] || state.edition, false);
  if (usedFallback) addPill('⚠ Edition unavailable — showing Uthmani', false);
  if (state.reciter) addPill('🎙 ' + (RECITER_LABELS[state.reciter] || state.reciter), true);
  if (state.tajweedOn) addPill('🎨 Tajweed ON', true);

  shCard.style.display = 'block';
  animateIn(shCard);

  // ── Ayah cards ──────────────────────────────
  clearSkeletons();
  const frag = document.createDocumentFragment();

  state.ayahsData.forEach(ayah => {
    const card = document.createElement('article');
    card.className = 'ayah-card';
    card.dataset.index = ayah.index;
    card.setAttribute('role', 'listitem');

    // Top row: number badge + play button
    const top = document.createElement('div');
    top.className = 'ayah-top';

    const numBadge = document.createElement('div');
    numBadge.className   = 'ayah-num';
    numBadge.textContent = ayah.numberInSurah;

    const playBtn = document.createElement('button');
    playBtn.className       = 'ayah-play' + (state.reciter ? ' show' : '');
    playBtn.setAttribute('aria-label', `Play Ayah ${ayah.numberInSurah}`);
    playBtn.innerHTML       = '▶';
    playBtn.dataset.index   = ayah.index;
    playBtn.addEventListener('click', () => playAyah(ayah.index));

    top.appendChild(numBadge);
    top.appendChild(playBtn);

    // Arabic text
    const arDiv = document.createElement('div');
    arDiv.className = 'ayah-ar' + (state.largeText ? ' big' : '');
    arDiv.lang      = 'ar';
    arDiv.innerHTML = state.tajweedOn
      ? colorTajweed(ayah.arabic)
      : escapeHtml(ayah.arabic);

    // Translation
    const trDiv = document.createElement('div');
    trDiv.className   = 'ayah-tr';
    trDiv.lang        = 'en';
    trDiv.textContent = ayah.translation;

    card.appendChild(top);
    card.appendChild(arDiv);
    card.appendChild(trDiv);
    frag.appendChild(card);
  });

  ayahList.appendChild(frag);
  shCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateAudioUI();
}

/* Re-render only the Arabic text spans (when toggling tajweed without reloading) */
function rerenderArabicText() {
  $$('.ayah-ar').forEach((el, i) => {
    const ayah = state.ayahsData[i];
    if (!ayah) return;
    el.innerHTML = state.tajweedOn
      ? colorTajweed(ayah.arabic)
      : escapeHtml(ayah.arabic);
  });
  // Update pills
  const tjPill = Array.from($$('.sh-pill.hi')).find(p => p.textContent.includes('Tajweed'));
  if (state.tajweedOn && !tjPill) addPill('🎨 Tajweed ON', true);
  if (!state.tajweedOn && tjPill) tjPill.remove();
}

function addPill(text, highlight) {
  const p = document.createElement('span');
  p.className   = 'sh-pill' + (highlight ? ' hi' : '');
  p.textContent = text;
  shPills.appendChild(p);
}

function animateIn(el) {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(8px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    el.style.opacity    = '1';
    el.style.transform  = 'translateY(0)';
  });
}

/* ══════════════════════════════════════════════════════════════
   F. TAJWEED COLORIZER
   ──────────────────────────────────────────────────────────────
   Applies colour spans to recognisable tajweed patterns using
   Unicode Arabic character classes. This is a client-side
   approximation; perfect tajweed analysis requires a morphological
   engine. The colours here follow the standard colour convention
   used in most printed tajweed Qurans.
══════════════════════════════════════════════════════════════ */

const SUKUN  = '\u0652';  // ْ
const SHADDA = '\u0651';  // ّ
const TANWIN_F = '\u064B'; // ً
const TANWIN_D = '\u064C'; // ٌ
const TANWIN_K = '\u064D'; // ٍ
const FATHA  = '\u064E';
const DAMMA  = '\u064F';
const KASRA  = '\u0650';
const ALEF   = '\u0627';
const WAW    = '\u0648';
const YA     = '\u064A';

// IKHFA letter set: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك
const IKHFA_LETTERS = 'تثجدذزسشصضطظفقك';
// IDGHAM bi-Ghunnah: ي ن م و
const IDGHAM_LETTERS = 'ينمو';

/**
 * Takes a raw Arabic Quran text string and wraps recognised
 * tajweed-rule patterns with <span class="tj-*"> elements.
 *
 * @param   {string} text  Raw Arabic Quran text
 * @returns {string}       HTML string with colour spans
 */
function colorTajweed(text) {
  // Work on escaped HTML first, then wrap
  let t = escapeHtml(text);

  // ① Ghunnah — noon or meem with shaddah (نّ مّ)
  //   Standard: bright green
  t = t.replace(/([نم]ّ)/g, '<span class="tj-ghunnah">$1</span>');

  // ② Qalqalah — ق ط ب ج د followed by sukun
  //   Standard: blue/dark blue
  t = t.replace(/([قطبجد]ْ)/g, '<span class="tj-qalqalah">$1</span>');

  // ③ Idgham bi-Ghunnah — noon sakina / tanwin + [ي ن م و]
  //   Represented by: (نْ or tanwin) at word boundary → next word starts with idgham letter
  //   Simplified: tanwin followed by space then idgham letter
  t = t.replace(/([\u064B\u064C\u064D])\s([ينمو])/g,
    '<span class="tj-idgham">$1</span> <span class="tj-idgham">$2</span>');

  // ④ Ikhfa — noon sakina before ikhfa letters (same word)
  //   نْ followed immediately by ikhfa letter
  t = t.replace(/(نْ)([تثجدذزسشصضطظفقك])/g,
    '<span class="tj-ikhfa">$1</span><span class="tj-ikhfa">$2</span>');

  // ⑤ Madd — alef / waw / ya used for elongation (appearing after vowel)
  //   Heuristic: ا following fatha, و following damma, ي following kasra
  //   Simplified: standalone alef (non-hamza) in middle of word
  t = t.replace(/([\u064E])(\u0627)/g,
    '$1<span class="tj-madd">$2</span>');
  t = t.replace(/([\u064F])(\u0648)/g,
    '$1<span class="tj-madd">$2</span>');
  t = t.replace(/([\u0650])(\u064A)/g,
    '$1<span class="tj-madd">$2</span>');
  // Also: alef maddah ـٓ / alef wasla
  t = t.replace(/(آ)/g, '<span class="tj-madd">$1</span>');

  return t;
}

/* ══════════════════════════════════════════════════════════════
   G. AUDIO ENGINE
══════════════════════════════════════════════════════════════ */

let audioEl = null;     // the single HTMLAudioElement we reuse
let seekDragging = false;

/** Build the CDN URL for one ayah */
function audioUrl(globalAyahNumber) {
  return `${AUDIO_CDN}/${state.reciter}/${globalAyahNumber}.mp3`;
}

/** Format seconds → M:SS */
function fmtTime(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  return `${m}:${ss}`;
}

/** Show/hide per-ayah play buttons and the audio bar based on reciter state */
function updateAudioUI() {
  const hasReciter = !!state.reciter;
  $$('.ayah-play').forEach(btn => btn.classList.toggle('show', hasReciter));
  if (hasReciter) {
    audioBar.classList.add('show');
    abRecName.textContent = RECITER_LABELS[state.reciter] || state.reciter;
  } else {
    audioBar.classList.remove('show');
  }
}

/** Play the ayah at `index` in state.ayahsData */
function playAyah(index) {
  if (!state.reciter || !state.ayahsData.length) return;
  const ayah = state.ayahsData[index];
  if (!ayah) return;

  // Update state
  state.playingIndex = index;
  state.isPlaying    = true;

  // Highlight playing card
  $$('.ayah-card').forEach(c => c.classList.remove('playing'));
  $$('.ayah-play').forEach(b => b.classList.remove('active'));
  const card    = document.querySelector(`.ayah-card[data-index="${index}"]`);
  const playBtn = document.querySelector(`.ayah-play[data-index="${index}"]`);
  if (card)    card.classList.add('playing');
  if (playBtn) { playBtn.classList.add('active'); playBtn.innerHTML = '⏸'; }

  // Scroll card into view
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Audio bar label
  abAyahLbl.textContent = `${state.surahName || 'Surah'} · Ayah ${ayah.numberInSurah}`;
  abPP.innerHTML = '⏸';

  // Create / reuse audio element
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.volume = state.volume;
    wireAudioEvents();
  }
  audioEl.pause();
  audioEl.src    = audioUrl(ayah.globalNumber);
  audioEl.volume = state.volume;
  audioEl.load();
  audioEl.play().catch(e => console.warn('[YQ] Audio play error:', e));
}

/** Wire Audio element events once */
function wireAudioEvents() {
  // Time update → progress bar
  audioEl.addEventListener('timeupdate', () => {
    if (seekDragging) return;
    const pct = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
    abRange.value   = pct;
    abCur.textContent = fmtTime(audioEl.currentTime);
    abDur.textContent = fmtTime(audioEl.duration);
  });

  // Ayah ended
  audioEl.addEventListener('ended', () => {
    abPP.innerHTML = '▶';
    $$('.ayah-play').forEach(b => { b.classList.remove('active'); b.innerHTML = '▶'; });
    $$('.ayah-card').forEach(c => c.classList.remove('playing'));
    state.isPlaying = false;

    if (state.autoAdvance) {
      const next = state.playingIndex + 1;
      if (next < state.ayahsData.length) {
        setTimeout(() => playAyah(next), 400);
      }
    }
  });

  // Reset on error
  audioEl.addEventListener('error', () => {
    console.warn('[YQ] Audio error for ayah', state.playingIndex);
    abPP.innerHTML = '▶';
    state.isPlaying = false;
  });
}

/** Stop all audio and reset UI */
function audioStop() {
  if (audioEl) { audioEl.pause(); audioEl.src = ''; }
  state.isPlaying    = false;
  state.playingIndex = -1;
  abPP.innerHTML  = '▶';
  abRange.value   = 0;
  abCur.textContent = '0:00';
  abDur.textContent = '0:00';
  abAyahLbl.textContent = '—';
  $$('.ayah-card').forEach(c => c.classList.remove('playing'));
  $$('.ayah-play').forEach(b => { b.classList.remove('active'); b.innerHTML = '▶'; });
}

/* ── Audio bar controls ────────────────── */

// Play / Pause button
abPP.addEventListener('click', () => {
  if (!state.reciter) return;

  if (state.isPlaying && audioEl && !audioEl.paused) {
    audioEl.pause();
    state.isPlaying = false;
    abPP.innerHTML  = '▶';
    const pb = document.querySelector(`.ayah-play[data-index="${state.playingIndex}"]`);
    if (pb) { pb.classList.remove('active'); pb.innerHTML = '▶'; }
  } else if (audioEl && audioEl.src && audioEl.readyState > 0) {
    // Resume
    audioEl.play();
    state.isPlaying = true;
    abPP.innerHTML  = '⏸';
    const pb = document.querySelector(`.ayah-play[data-index="${state.playingIndex}"]`);
    if (pb) { pb.classList.add('active'); pb.innerHTML = '⏸'; }
  } else {
    // Start from first ayah (or continue from where we are)
    const startIdx = state.playingIndex >= 0 ? state.playingIndex : 0;
    playAyah(startIdx);
  }
});

// Previous ayah
abPrev.addEventListener('click', () => {
  if (!state.reciter) return;
  const prev = state.playingIndex > 0 ? state.playingIndex - 1 : 0;
  playAyah(prev);
});

// Next ayah
abNext.addEventListener('click', () => {
  if (!state.reciter) return;
  const next = state.playingIndex + 1;
  if (next < state.ayahsData.length) playAyah(next);
});

// Seek slider
abRange.addEventListener('mousedown', () => { seekDragging = true; });
abRange.addEventListener('touchstart', () => { seekDragging = true; }, { passive: true });
abRange.addEventListener('input', () => {
  if (audioEl && audioEl.duration) {
    const t = (abRange.value / 100) * audioEl.duration;
    abCur.textContent = fmtTime(t);
  }
});
abRange.addEventListener('change', () => {
  seekDragging = false;
  if (audioEl && audioEl.duration) {
    audioEl.currentTime = (abRange.value / 100) * audioEl.duration;
    if (state.isPlaying) audioEl.play();
  }
});

// Volume (audio bar)
abVol.addEventListener('input', () => {
  state.volume = abVol.value / 100;
  sbVol.value  = abVol.value;  // keep sidebar slider in sync
  if (audioEl) audioEl.volume = state.volume;
  abVolIcon.textContent = state.volume === 0 ? '🔇' : state.volume < 0.5 ? '🔉' : '🔊';
});
// Mute toggle
abVolIcon.addEventListener('click', () => {
  if (audioEl) {
    audioEl.muted = !audioEl.muted;
    abVolIcon.textContent = audioEl.muted ? '🔇' : '🔊';
  }
});

/* ══════════════════════════════════════════════════════════════
   SKELETON / ERROR / WELCOME HELPERS
══════════════════════════════════════════════════════════════ */

function showSkeletons(n = 6) {
  clearSkeletons();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'skel-card';
    c.dataset.skel = '1';
    c.innerHTML = `
      <div class="skel" style="width:52px;height:14px;margin-bottom:14px;border-radius:999px;"></div>
      <div class="skel" style="width:100%;height:20px;margin-bottom:8px;"></div>
      <div class="skel" style="width:72%;height:20px;margin-bottom:16px;"></div>
      <div class="skel" style="width:100%;height:12px;margin-bottom:6px;"></div>
      <div class="skel" style="width:60%;height:12px;"></div>`;
    frag.appendChild(c);
  }
  ayahList.appendChild(frag);
}

function clearSkeletons() {
  $$('[data-skel]').forEach(el => el.remove());
  ayahList.innerHTML = '';
}

function hideWelcome() {
  welcome.style.display  = 'none';
  shCard.style.display   = 'none';
}

function showError(msg) {
  errBar.textContent  = `⚠️  ${msg}`;
  errBar.style.display = 'block';
}
function clearError() {
  errBar.style.display = 'none';
  errBar.textContent   = '';
}

/** Escape HTML entities to prevent XSS when we use innerHTML */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════════
   H. INIT
══════════════════════════════════════════════════════════════ */

(function init() {
  initSidebar();
  loadSurahList();
})();
