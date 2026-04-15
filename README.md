<div align="center">
  <img src="icon.png" alt="YallQuran Logo" width="100" height="100" style="border-radius:16px;" />

  <h1>YallQuran 📖</h1>

  <p><em>A clean, minimalist, open-source Quran reading website — no ads, no clutter, just the Word.</em></p>

  <a href="https://yallcode.github.io/YallQuran/">
    <img src="https://img.shields.io/badge/Live%20Site-GitHub%20Pages-gold?style=flat-square&logo=github" alt="Live Site" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
  &nbsp;
  <img src="https://img.shields.io/badge/API-AlQuran.cloud-blue?style=flat-square" alt="API" />
  &nbsp;
  <img src="https://img.shields.io/badge/Dark%20Mode-Supported-333?style=flat-square&logo=half-life" alt="Dark Mode" />

</div>

---

## ✨ What is YallQuran?

**YallQuran** is a lightweight, distraction-free Quran reading web app built and maintained by [YallCode](https://github.com/yallcode). It fetches the full Arabic text and English translation of all 114 Surahs from the free [AlQuran.cloud API](https://alquran.cloud/api) and renders them in a beautiful, mobile-friendly reading experience — hosted entirely on GitHub Pages with zero backend.

> *"Indeed, it is We who sent down the Quran and indeed, We will be its guardian."*
> — Surah Al-Hijr (15:9)

---

## 🚀 Features

| Feature | Details |
|---|---|
| 📡 **Live API Integration** | Fetches all 114 Surahs (Arabic + English) from AlQuran.cloud |
| 🌙 **Dark / Light Mode** | Toggle with one click — preference saved to `localStorage` |
| 📱 **Mobile Responsive** | Clean layout on all screen sizes |
| ⚡ **Skeleton Loaders** | Smooth loading placeholders while data fetches |
| 🕌 **Bismillah Header** | Displayed automatically for each applicable Surah |
| ✍️ **Arabic Typography** | Rendered in Noto Naskh Arabic for proper Uthmani script |
| 🎨 **Parchment + Midnight themes** | Warm parchment for light, deep midnight blue for dark |
| 🪶 **No frameworks** | Vanilla JS + Tailwind CDN — ultra-lightweight |
| 📂 **Open Source** | MIT licensed — fork, remix, and learn freely |

---

## 📸 Preview

> *Select a Surah from the dropdown to start reading. Arabic and English translation appear side by side in elegant cards.*

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — semantic, accessible markup
- **Tailwind CSS** — via CDN (no build step needed)
- **Vanilla JavaScript (ES2020)** — no frameworks, no dependencies
- **[AlQuran.cloud API](https://alquran.cloud/api)** — free, open Quran data
  - Edition used: `quran-uthmani` (Arabic) + `en.sahih` (Saheeh International)
- **GitHub Pages** — zero-cost hosting

---

## 📂 Project Structure

```
YallQuran/
├── index.html      ← Main UI (Tailwind, fonts, layout)
├── app.js          ← API fetching, rendering, theme logic
├── icon.png        ← App logo / favicon
└── README.md       ← You're reading this!
```

---

## ▶️ How to Use

### Option 1 — Visit the live site

👉 **[yallcode.github.io/YallQuran](https://yallcode.github.io/YallQuran/)**

### Option 2 — Run locally

No build step or server needed.

```bash
# 1. Clone the repo
git clone https://github.com/yallcode/YallQuran.git

# 2. Open the file directly in your browser
open YallQuran/index.html
# or just double-click index.html in your file manager
```

> ⚠️ Some browsers block API calls from `file://` URLs due to CORS. If nothing loads, use a simple local server:
> ```bash
> # Python 3
> python -m http.server 8080
> # Then visit http://localhost:8080
> ```

---

## 🌐 API Reference

YallQuran uses the free **[AlQuran.cloud API](https://alquran.cloud/api)** (no API key required).

| Endpoint used | Purpose |
|---|---|
| `GET /v1/surah` | Fetch the list of all 114 Surahs |
| `GET /v1/surah/{n}/quran-uthmani` | Fetch Arabic text for Surah n |
| `GET /v1/surah/{n}/en.sahih` | Fetch English translation for Surah n |

Both Arabic and translation requests are fired **in parallel** (`Promise.all`) for speed.

---

## 🤝 Contributing

Contributions, issues, and feature requests are all welcome! 🙌

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 💡 Planned Features

- [ ] 🔖 Bookmark / favourite Ayahs
- [ ] 🔊 Audio recitation player (per Ayah)
- [ ] 🔍 Search across all Ayahs
- [ ] 🌍 Multi-language translations
- [ ] 📋 Copy Ayah to clipboard

---

## 📄 License

This project is licensed under the **MIT License** — see below for details.

```
MIT License

Copyright (c) 2025 YallCode

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  Made with 🤍 by <a href="https://github.com/yallcode">YallCode</a>
  &nbsp;·&nbsp;
  <a href="https://yallcode.github.io/YallaYCode/">Website</a>
  &nbsp;·&nbsp;
  <a href="https://www.youtube.com/@YallaYCode">YouTube</a>
  &nbsp;·&nbsp;
  <a href="https://x.com/YallCode">X / Twitter</a>
</div>
