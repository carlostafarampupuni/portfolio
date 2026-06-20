# Carlos Tafara Mpupuni — Learning Design Portfolio

Interactive learning modules built with React, Three.js, and Vite.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Framework: Vite (auto-detected)
4. Click Deploy — done

## Custom domain (optional, ~$10–15/yr)

1. Buy domain on Namecheap or Cloudflare Registrar (cheapest)
2. In Vercel dashboard → your project → Settings → Domains → add your domain
3. Copy the DNS records Vercel gives you into your registrar's DNS settings
4. Vercel auto-provisions an SSL certificate (free)

## Adding your real details

- **About page:** `src/pages/About.jsx` — update timeline entries and personal note
- **Research page:** `src/pages/Research.jsx` — replace placeholder titles with real paper titles, DOIs, patent numbers
- **Contact page:** `src/pages/Contact.jsx` — replace placeholder email/GitHub/LinkedIn URLs
- **Your name in Nav:** `src/components/Nav.jsx` line 17

## Project structure

```
src/
├── theme.css                      ← shared design tokens (fonts, colours, spacing)
├── index.css                      ← body-level layout
├── App.jsx                        ← React Router routes (lazy-loads heavy modules)
├── components/
│   └── Nav.jsx                    ← sticky top navigation
├── pages/
│   ├── Home.jsx                   ← landing page with module grid
│   ├── About.jsx                  ← biography and timeline
│   ├── Projects.jsx               ← index of all modules
│   ├── Research.jsx               ← publications and patents
│   └── Contact.jsx                ← links and location
└── modules/
    ├── electrochemistry/          ← Daniell cell, Nernst, Li intercalation
    │   ├── ElectrochemModule.jsx  ← paginated wrapper
    │   ├── PageCell.jsx
    │   ├── PageNernst.jsx
    │   ├── PageSim.jsx
    │   ├── PageLi.jsx
    │   ├── PageQuiz.jsx
    │   └── nernst.js
    └── ibp/                       ← Integration by Parts
        ├── IBPModule.jsx          ← paginated wrapper
        ├── PageOrigin.jsx
        ├── PageAreaProof.jsx
        ├── PageLIATE.jsx
        ├── PageCyclic.jsx
        ├── PageQuiz.jsx
        └── NavRow.jsx
```
