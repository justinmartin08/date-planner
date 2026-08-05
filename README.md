# 💖 Cielo & Yani — Date Planner & Letters

A private, full-stack couples space for **Cielo & Yani** to organize dates, send rich-text letters & voice notes, track memory locations on interactive maps, and customize themed experiences.

---

## ✨ Features

- 📅 **Interactive Date Planner**: Propose, accept, decline, and track romantic dates with map coordinates & location pins.
- 💌 **Private Letter Box**: Send encrypted rich-text letters, file attachments, and recorded voice notes.
- 🎨 **Dynamic Couple Themes**:
  - **Yani (Tiger Theme)**: Warm ember orange palette with tiger stripe textures, ambient glow, and tiger motifs.
  - **Cielo (Pokémon Theme)**: Electric Mega Charizard X theme with blue fire particles, Pokéball entrance animations, and custom badges.
- 📸 **Custom Avatar Cropper**: Built-in HTML5 canvas cropper with drag-to-pan, zoom slider, 90° rotation, and cloud database storage.
- 📱 **Universal Device Support**: Fully responsive across mobile, tablet, and desktop viewports.

---

## 🚀 Tech Stack

- **Framework**: Next.js (App Router & Turbopack)
- **Database**: PostgreSQL (Supabase Cloud DB) with Prisma ORM
- **Authentication**: JWT Cookie Sessions with bcrypt hashing
- **Styling**: Tailwind CSS & Vanilla CSS Design System Tokens
- **Maps**: Leaflet / React-Leaflet
- **Deployment**: Vercel Cloud Hosting (24/7 Uptime)

---

## 🛠️ Local Development

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/justinmartin08/date-planner.git
   cd date-planner
   npm install
   ```

2. Synchronize database & seed initial users:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
