# Gtech Group — Company Profile Website

A clean, corporate **static website** (company profile) for **Gtech Group**, a diversified Bangladeshi business group. Built with plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies. Design follows the official Gtech Group company-profile PDF (navy blue + red theme).

## 📁 Structure

```
gtech-group-website/
├── index.html        # Home — hero, group concerns, stats, global partners
├── about.html        # About — story, mission/vision/goal, group structure, leadership
├── companies.html    # Our Concerns — all 6 companies in detail (with logos)
├── contact.html      # Contact — real address/phone/email + inquiry form
├── css/style.css     # All styles (navy + red corporate theme)
├── js/main.js        # Mobile nav, scroll reveal, counters, form
├── assets/logos/     # SVG logos for each group company
└── README.md
```

## 🏢 Group concerns included

| Company | Sector |
|---------|--------|
| G-Tech Solution Ltd. | Solar engineering & civil construction |
| Gtech Infrastructure Ltd. | Clean energy & ICT infrastructure |
| Gtech Solar | Renewable energy products |
| Dupno | GPS tracking technology |
| Gtech Aviation Ltd. | Aviation, travel & medical tourism |
| Gtech Supports | MEP (mechanical/electrical) consultancy |

## 🎨 Logos — IMPORTANT

The files in `assets/logos/` are **SVG recreations** built from the company-profile PDF (correct names + brand colors). To use the **exact official logos**, replace these files with your real logo images, keeping the same filenames:

```
assets/logos/gtech-group.svg
assets/logos/gtech-solution.svg
assets/logos/gtech-solar.svg
assets/logos/gtech-infrastructure.svg
assets/logos/dupno.svg
assets/logos/gtech-aviation.svg
```

If your logos are PNG instead of SVG, drop them in (e.g. `gtech-group.png`) and update the `src="..."` paths in the HTML files.

## 🚀 Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## ⬆️ Push to GitHub

```bash
cd gtech-group-website
git init
git add .
git commit -m "Initial commit: Gtech Group company profile website"
git branch -M main
git remote add origin https://github.com/<your-username>/gtech-group-website.git
git push -u origin main
```

### Optional: free hosting with GitHub Pages
After pushing → **Settings → Pages → Source: `main` / root → Save** →
live at `https://<your-username>.github.io/gtech-group-website/`.

## ✏️ Easy edits

- **Colors:** CSS variables at the top of `css/style.css` (`--navy`, `--red`, `--green`).
- **Text/contact:** edit the `.html` files directly.
- **Add real photos:** the leadership cards and `.media-box` blocks can hold real images — drop them in `assets/` and swap the placeholders.
- **Contact form:** demo only; connect to [Formspree](https://formspree.io) or a backend to receive messages.

---
© 2026 Gtech Group. All rights reserved.
