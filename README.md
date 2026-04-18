<div align="center">
  <img src="icon.png" alt="YallQuran Logo" width="100" style="border-radius:16px;" />

  <h1>YallQuran 📖</h1>

  <p><em>A clean, open-source Quran reading website with Tajweed coloring, multiple Qirāʾāt scripts, and imam audio recitation.</em></p>

  <a href="https://yallcode.github.io/YallQuran/">
    <img src="https://img.shields.io/badge/Live%20Site-GitHub%20Pages-gold?style=flat-square&logo=github" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
  &nbsp;
  <img src="https://img.shields.io/badge/API-AlQuran.cloud-blue?style=flat-square" />
  &nbsp;
  <img src="https://img.shields.io/badge/Audio-Islamic.network-teal?style=flat-square" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tajweed-Color%20Coded-orange?style=flat-square" />
</div>

---

## ✨ What is YallQuran?

**YallQuran** is a lightweight, distraction-free Quran reading website built by [YallCode](https://github.com/yallcode) and hosted on GitHub Pages. It requires **no backend, no login, and no paywalls** — just open `index.html` and read.

> *"Indeed, it is We who sent down the Quran and indeed, We will be its guardian."* — Surah Al-Hijr (15:9)

---

## 🚀 Features

| Feature | Details |
|---|---|
| 📜 **Multiple Qirāʾāt** | Ḥafs ʿan ʿĀṣim (Uthmani & Simple), Warsh ʿan Nāfiʿ, Unvocalised |
| 🎨 **Tajweed Colors** | Color-coded Ghunnah, Qalqalah, Madd, Ikhfa, Idgham |
| 🎙️ **8 Reciters** | Al-Afasy, As-Sudais, Al-Husary, Al-Minshawi, Ayyoub, Basfar, Al-Shuraim, Ar-Rifai |
| ⏯️ **Full Audio Player** | Play/pause, previous/next, seek bar, volume, auto-advance |
| 🌙 **Dark / Light Mode** | Theme persisted in `localStorage` |
| 📱 **Mobile Responsive** | Clean reading layout on all screen sizes |
| ⚡ **Skeleton Loaders** | Smooth placeholders while API fetches |
| 📂 **Open Source** | MIT licensed — fork and remix freely |
| 🪶 **No frameworks** | Vanilla JS + Tailwind CDN — zero build step |

---

## 🎨 Tajweed Color Guide

| Color | Rule | Example |
|---|---|---|
| 🟢 **Green** | Ghunnah — nasal sound | نّ  مّ |
| 🔵 **Blue** | Qalqalah — echoing stop | قْ طْ بْ جْ دْ |
| 🔴 **Red** | Madd — elongation | ا  و  ي |
| 🟣 **Purple** | Ikhfa — hidden nasal | نْ + ikhfa letter |
| 🟠 **Orange** | Idgham — merging letters | tanwin + ي ن م و |

> Tajweed colouring is a client-side approximation and covers the most visually recognisable rules. Toggle it on/off from the sidebar.

---

## 🎙️ Available Reciters

| Reciter | Country | Style |
|---|---|---|
| Mishary Rashid Al-Afasy | Kuwait | Warm, melodic murattal |
| Abdurrahman As-Sudais | Saudi Arabia | Imam of Al-Haram, Makkah |
| Mahmoud Khalil Al-Husary | Egypt | Classic mujawwad |
| Mohamed Siddiq Al-Minshawi | Egypt | Legendary murattal & mujawwad |
| Muhammad Ayyoub | Saudi Arabia | Madinah Imam, deep voice |
| Abdullah Basfar | Saudi Arabia | Clear, precise murattal |
| Saud Al-Shuraim | Saudi Arabia | Imam of Al-Haram, Makkah |
| Hani Ar-Rifai | Saudi Arabia | Gentle, serene tone |

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — semantic markup, CSS variables for theming
- **Tailwind CSS** — via CDN (no build step)
- **Vanilla JavaScript (ES2020)** — no frameworks
- **[AlQuran.cloud API](https://alquran.cloud/api)** — Quran text in multiple editions
- **[Islamic.network CDN](https://cdn.islamic.network)** — per-ayah MP3 audio
- **GitHub Pages** — zero-cost hosting

---

## 📂 Project Structure

```
YallQuran/
├── index.html      ← Full UI (sidebar, audio bar, Tailwind, fonts)
├── app.js          ← All logic: API, tajweed, audio engine, theme
├── icon.png        ← App logo / favicon
└── README.md       ← You're reading this!
```

---

## ▶️ How to Use

### Option 1 — Live site

👉 **[yallcode.github.io/YallQuran](https://yallcode.github.io/YallQuran/)**

### Option 2 — Run locally

```bash
git clone https://github.com/yallcode/YallQuran.git
cd YallQuran

# Option A: open directly (works in most browsers)
open index.html

# Option B: local server (recommended to avoid CORS issues)
python -m http.server 8080
# → visit http://localhost:8080
```

### Using the sidebar

1. Click the **☰ hamburger** in the top-left to open the settings sidebar
2. **Qirāʾāt & Script** — choose your preferred Arabic script / qira'at
3. **Tajweed Colors** — toggle color-coded tajweed highlighting on/off
4. **Reciter & Audio** — pick an imam; a player bar appears at the bottom
5. Press **▶** on any Ayah card or use the bottom player to control playback

---

## 📄 License

```
MIT License — Copyright (c) 2025 YallCode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">
  Made with 🤍 by <a href="https://github.com/yallcode">YallCode</a>
  &nbsp;·&nbsp; <a href="https://yallcode.github.io/YallaYCode/">Website</a>
  &nbsp;·&nbsp; <a href="https://www.youtube.com/@YallaYCode">YouTube</a>
  &nbsp;·&nbsp; <a href="https://x.com/YallCode">X / Twitter</a>
</div>
