/**
 * ╔══════════════════════════════════════════════════════╗
 *   YallQuran — app.js
 *   Author : YallCode  (https://github.com/yallcode)
 *   API    : https://alquran.cloud/api
 *   Licence: MIT
 * ╚══════════════════════════════════════════════════════╝
 *
 *  Core responsibilities:
 *   1. Populate the Surah dropdown from the API
 *   2. Fetch and render Arabic text + English translation
 *   3. Handle dark / light theme toggle (persisted via localStorage)
 *   4. Show skeleton loaders, error states, and staggered card animations
 */

'use strict';

/* ── Constants ─────────────────────────────────────────────── */

const BASE_URL  = 'https://api.alquran.cloud/v1';
// Editions used:  Arabic Uthmani  +  English (Saheeh International)
const ARABIC_ED = 'quran-uthmani';
const TRANS_ED  = 'en.sahih';

// Surah 1 (Al-Fatihah) and Surah 9 (At-Tawbah) don't begin with Bismillah
const NO_BISMILLAH = new Set([1, 9]);

/* ── DOM references ─────────────────────────────────────────── */

const surahSelect       = document.getElementById('surah-select');
const ayahContainer     = document.getElementById('ayah-container');
const surahHeader       = document.getElementById('surah-header');
const surahNumberBadge  = document.getElementById('surah-number-badge');
const surahNameEn       = document.getElementById('surah-name-en');
const surahMeta         = document.getElementById('surah-meta');
const bismillahText     = document.getElementById('bismillah-text');
const welcomeScreen     = document.getElementById('welcome');
const errorMsg          = document.getElementById('error-msg');
const errorText         = document.getElementById('error-text');
const themeToggle       = document.getElementById('theme-toggle');
const themeIcon         = document.getElementById('theme-icon');

/* ══════════════════════════════════════════════════════════════
   1.  THEME  (dark / light)
   ══════════════════════════════════════════════════════════════ */

/**
 * Reads saved theme from localStorage (defaults to 'light').
 * Applies the [data-theme] attribute and updates the button icon.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = (theme === 'dark') ? '☀️' : '🌙';
  localStorage.setItem('yallquran-theme', theme);
}

/** Toggle between 'dark' and 'light'. */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Initialise theme on load
applyTheme(localStorage.getItem('yallquran-theme') || 'light');

// Wire up the toggle button
themeToggle.addEventListener('click', toggleTheme);

/* ══════════════════════════════════════════════════════════════
   2.  SURAH LIST  (populate the <select>)
   ══════════════════════════════════════════════════════════════ */

/**
 * Fetches all 114 Surahs from the API and fills the dropdown.
 * Each option shows:  "1 · Al-Fatihah  (الفاتحة)"
 */
async function loadSurahList() {
  try {
    const res  = await fetch(`${BASE_URL}/surah`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    data.data.forEach(surah => {
      const option = document.createElement('option');
      option.value = surah.number;
      option.textContent =
        `${surah.number}. ${surah.englishName}  (${surah.name})`;
      surahSelect.appendChild(option);
    });

  } catch (err) {
    console.error('[YallQuran] Failed to load Surah list:', err);
    showError('Could not load the Surah list. Check your internet connection.');
  }
}

/* ══════════════════════════════════════════════════════════════
   3.  SURAH CONTENT  (fetch + render Ayahs)
   ══════════════════════════════════════════════════════════════ */

/**
 * Main loader — called when the user picks a Surah.
 * Fetches both editions in parallel for speed.
 *
 * @param {number|string} surahNumber  1–114
 */
async function loadSurah(surahNumber) {
  clearError();
  hideWelcome();
  showSkeletons(7);   // show placeholder cards while fetching

  try {
    // Fetch Arabic and English in parallel
    const [arabicRes, transRes] = await Promise.all([
      fetch(`${BASE_URL}/surah/${surahNumber}/${ARABIC_ED}`),
      fetch(`${BASE_URL}/surah/${surahNumber}/${TRANS_ED}`),
    ]);

    if (!arabicRes.ok) throw new Error(`Arabic fetch failed (HTTP ${arabicRes.status})`);
    if (!transRes.ok)  throw new Error(`Translation fetch failed (HTTP ${transRes.status})`);

    const arabicData = await arabicRes.json();
    const transData  = await transRes.json();

    const surahInfo  = arabicData.data;          // metadata
    const ayahsAr    = arabicData.data.ayahs;    // Arabic ayahs array
    const ayahsTr    = transData.data.ayahs;     // English ayahs array

    // Render surah header card
    renderSurahHeader(surahInfo, surahNumber);

    // Render all Ayah cards
    renderAyahs(ayahsAr, ayahsTr);

  } catch (err) {
    console.error(`[YallQuran] Error loading Surah ${surahNumber}:`, err);
    clearSkeletons();
    showError(`Failed to load Surah ${surahNumber}. ${err.message}`);
  }
}

/**
 * Renders the Surah title/metadata card at the top.
 *
 * @param {object} info          API surah metadata object
 * @param {number} surahNumber   Surah index (1–114)
 */
function renderSurahHeader(info, surahNumber) {
  surahNumberBadge.textContent = `Surah ${info.number}`;
  surahNameEn.textContent      = `${info.englishName} — ${info.name}`;
  surahMeta.textContent        =
    `${info.revelationType} · ${info.numberOfAyahs} Ayahs · ${info.englishNameTranslation}`;

  // Only show Bismillah for Surahs that include it
  bismillahText.style.display =
    NO_BISMILLAH.has(Number(surahNumber)) ? 'none' : 'block';

  surahHeader.style.display = 'block';

  // Animate header in
  surahHeader.style.opacity  = '0';
  surahHeader.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    surahHeader.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    surahHeader.style.opacity    = '1';
    surahHeader.style.transform  = 'translateY(0)';
  });
}

/**
 * Clears old Ayahs, then injects one card per Ayah.
 *
 * @param {Array} arabicAyahs   Array of Ayah objects (Arabic text)
 * @param {Array} transAyahs    Parallel array of Ayah objects (translation)
 */
function renderAyahs(arabicAyahs, transAyahs) {
  clearSkeletons();

  const fragment = document.createDocumentFragment();

  arabicAyahs.forEach((ayah, index) => {
    const translation = transAyahs[index]?.text || '';

    const card = document.createElement('article');
    card.className = 'ayah-card';
    card.setAttribute('role', 'listitem');

    // Ayah number badge
    const numBadge = document.createElement('div');
    numBadge.className   = 'ayah-number';
    numBadge.textContent = ayah.numberInSurah;
    numBadge.setAttribute('aria-label', `Ayah ${ayah.numberInSurah}`);

    // Arabic text
    const arabicDiv = document.createElement('div');
    arabicDiv.className   = 'ayah-arabic';
    arabicDiv.lang        = 'ar';
    arabicDiv.textContent = ayah.text;

    // English translation
    const transDiv = document.createElement('div');
    transDiv.className   = 'ayah-translation';
    transDiv.lang        = 'en';
    transDiv.textContent = translation;

    card.appendChild(numBadge);
    card.appendChild(arabicDiv);
    card.appendChild(transDiv);
    fragment.appendChild(card);
  });

  ayahContainer.appendChild(fragment);

  // Scroll to top of reading area smoothly
  surahHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════════════════════════
   4.  SKELETON LOADERS
   ══════════════════════════════════════════════════════════════ */

/**
 * Injects n skeleton placeholder cards while real data loads.
 * @param {number} n  Number of skeletons to show
 */
function showSkeletons(n = 5) {
  clearSkeletons();
  const frag = document.createDocumentFragment();

  for (let i = 0; i < n; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.dataset.skeleton = true;
    card.innerHTML = `
      <div class="skeleton" style="width:60px;height:18px;margin-bottom:18px;border-radius:999px;"></div>
      <div class="skeleton" style="width:100%;height:22px;margin-bottom:10px;"></div>
      <div class="skeleton" style="width:80%;height:22px;margin-bottom:20px;"></div>
      <div class="skeleton" style="width:100%;height:14px;margin-bottom:8px;"></div>
      <div class="skeleton" style="width:70%;height:14px;"></div>
    `;
    frag.appendChild(card);
  }

  ayahContainer.appendChild(frag);
}

/** Removes all skeleton cards from the container. */
function clearSkeletons() {
  const skeletons = ayahContainer.querySelectorAll('[data-skeleton]');
  skeletons.forEach(el => el.remove());

  // Also clear real ayah cards from a previous Surah
  ayahContainer.innerHTML = '';
}

/* ══════════════════════════════════════════════════════════════
   5.  UI HELPERS  (welcome / error states)
   ══════════════════════════════════════════════════════════════ */

/** Hide the initial welcome / splash screen. */
function hideWelcome() {
  welcomeScreen.style.display = 'none';
  surahHeader.style.display   = 'none'; // reset; renderSurahHeader will re-show it
}

/** Show a user-facing error message banner. */
function showError(message) {
  errorText.textContent    = message;
  errorMsg.style.display   = 'block';
}

/** Clear any visible error message. */
function clearError() {
  errorMsg.style.display   = 'none';
  errorText.textContent    = '';
}

/* ══════════════════════════════════════════════════════════════
   6.  EVENT LISTENERS
   ══════════════════════════════════════════════════════════════ */

/** Load the chosen Surah when the user changes the select. */
surahSelect.addEventListener('change', (e) => {
  const surahNumber = e.target.value;
  if (surahNumber) {
    loadSurah(surahNumber);
  }
});

/* ══════════════════════════════════════════════════════════════
   7.  INIT
   ══════════════════════════════════════════════════════════════ */

/** Bootstrap the app: load the Surah list on page ready. */
(function init() {
  loadSurahList();
})();
