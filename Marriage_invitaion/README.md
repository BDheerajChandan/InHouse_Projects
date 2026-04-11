# 💍 Marriage & Engagement Digital Invitation
### Built with React + Vite + Framer Motion

A premium, fully animated digital wedding and engagement invitation website with horizontal slide navigation on desktop, vertical scroll on mobile, background music, PDF download, MP4 video export, and a beautiful envelope opening screen.

---

## 🚀 Quick Start

### Step 1 — Navigate to your project
```bash
cd C:\Users\b.dheeraj\Desktop\Marriage\Marriage_invitaion
```

### Step 2 — Install all dependencies
```bash
npm install
npm install framer-motion react-icons jspdf html2canvas
```

### Step 3 — Run the development server
```bash
npm run dev
```

Open your browser at → **http://localhost:5173**

---

## 📁 Final Project Structure

```
Marriage_invitaion/
│
├── index.html                          ← Updated HTML entry
├── vite.config.js                      ← Vite configuration
├── package.json                        ← All dependencies
│
├── public/
│   ├── images/                         ← ★ Place your images here
│   │   ├── bride.jpg
│   │   ├── groom.jpg
│   │   ├── couple.jpg
│   │   ├── gallery1.jpg → gallery8.jpg
│   │   ├── eng-gallery1.jpg → eng-gallery6.jpg
│   └── bgaudio/                        ← ★ Place your music here
│       ├── marriage-theme.mp3
│       └── engagement-theme.mp3
│
└── src/
    ├── main.jsx                         ← Entry point
    ├── App.jsx                          ← Root — toggle, loading, cursor, confetti
    ├── App.css                          ← App-level layout styles
    ├── index.css                        ← Global CSS variables & fonts
    │
    ├── data/
    │   ├── marriageData.js              ← All marriage invitation data
    │   └── engagementData.js            ← All engagement invitation data
    │
    └── components/
        ├── invitation_details.jsx       ← Master component (assembles all sections)
        ├── invitation_details.css
        │
        ├── LoadingScreen.jsx            ← Envelope opening animation
        ├── LoadingScreen.css
        │
        ├── InvitationToggle.jsx         ← Marriage ↔ Engagement toggle
        ├── InvitationToggle.css
        │
        ├── HeroSection.jsx              ← Full-screen hero with names & CTA
        ├── HeroSection.css
        │
        ├── CoupleSection.jsx            ← Bride & groom cards
        ├── CoupleSection.css
        │
        ├── StorySection.jsx             ← Animated love story timeline
        ├── StorySection.css
        │
        ├── EventDetailsSection.jsx      ← Event cards (Haldi, Sangeet, etc.)
        ├── EventDetailsSection.css
        │
        ├── CountdownSection.jsx         ← Live animated countdown timer
        ├── CountdownSection.css
        │
        ├── GallerySection.jsx           ← Image gallery with lightbox
        ├── GallerySection.css
        │
        ├── VenueSection.jsx             ← Venue info + Google Maps embed
        ├── VenueSection.css
        │
        ├── RSVPSection.jsx              ← WhatsApp / Phone / Email RSVP
        ├── RSVPSection.css
        │
        ├── FooterSection.jsx            ← Thank you footer
        ├── FooterSection.css
        │
        ├── SlideNavigation.jsx          ← Desktop: arrows + dots + keyboard nav
        ├── SlideNavigation.css
        │
        ├── MobileScrollIndicator.jsx    ← Mobile: animated scroll-down arrow
        ├── MobileScrollIndicator.css
        │
        ├── AnimatedFlowers.jsx          ← Floating petals / gems overlay
        ├── AnimatedFlowers.css
        │
        ├── BackgroundMusic.jsx          ← Play/Pause + Volume + Autoplay
        ├── BackgroundMusic.css
        │
        ├── DownloadInvitation.jsx       ← PDF download (jsPDF)
        ├── DownloadInvitation.css
        │
        ├── DownloadInvitationVideo.jsx  ← MP4/WebM video export
        └── DownloadInvitationVideo.css
```

---

## 🖼️ How to Add Your Images

Place your images in the `public/images/` folder:

| File Name | Used For |
|---|---|
| `bride.jpg` | Bride profile photo |
| `groom.jpg` | Groom profile photo |
| `couple.jpg` | Couple together |
| `gallery1.jpg` to `gallery8.jpg` | Marriage gallery |
| `eng-gallery1.jpg` to `eng-gallery6.jpg` | Engagement gallery |

> **Tip:** If images are missing, beautiful gradient placeholders are shown automatically.

---

## 🎵 How to Add Background Music

Place your `.mp3` files in the `public/bgaudio/` folder:

| File | Used For |
|---|---|
| `marriage-theme.mp3` | Plays during Marriage mode |
| `engagement-theme.mp3` | Plays during Engagement mode |

**Free romantic music sources:**
- [Pixabay Music](https://pixabay.com/music/) — search "romantic instrumental"
- [Bensound](https://www.bensound.com/) — search "wedding"
- [ZapSplat](https://www.zapsplat.com/)

> **Note:** Browser autoplay policies may block audio until first user interaction. The music button handles this automatically.

---

## ✏️ How to Customize Invitation Details

### Marriage Invitation → edit `src/data/marriageData.js`
### Engagement Invitation → edit `src/data/engagementData.js`

**Key fields to update:**

```js
const marriageData = {
  brideName: "Ananya",        // ← Change bride name
  groomName: "Rahul",         // ← Change groom name
  parents: {
    brideParents: "Mr. & Mrs. Sharma",
    groomParents: "Mr. & Mrs. Verma",
  },
  eventDate: "2026-12-12T19:00:00",  // ← Countdown target date
  events: [
    {
      name: "Wedding Ceremony",
      date: "12 December 2026",       // ← Change date
      time: "7:00 PM",                // ← Change time
      venue: "Royal Palace",          // ← Change venue
      ...
    }
  ],
  venue: {
    name: "Royal Palace Banquet",
    address: "Bhubaneswar, Odisha",
    mapLink: "https://maps.google.com/?q=YOUR_LAT,YOUR_LNG",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=...", // Google embed URL
  },
  rsvp: {
    contact: "+91 98765 43210",
    whatsapp: "+919876543210",       // ← No spaces/dashes
    email: "your@email.com",
  },
};
```

### How to get Google Maps Embed URL:
1. Go to [maps.google.com](https://maps.google.com)
2. Search your venue
3. Click **Share** → **Embed a map**
4. Copy the `src="..."` URL
5. Paste into `mapEmbedUrl` in your data file

---

## 🎨 Color Themes

### Marriage Theme (Gold & Maroon)
Defined in `src/data/marriageData.js`:
```js
themeColor: "#d4af37",        // Gold
themeSecondary: "#8B0000",    // Maroon
```

### Engagement Theme (Purple & Blue)
Defined in `src/data/engagementData.js`:
```js
themeColor: "#8e44ad",        // Purple
themeSecondary: "#2c3e50",    // Dark Blue
```

---

## 🖥️ Desktop Features
- **Horizontal slide navigation** — arrows, mouse wheel, keyboard (← →)
- **Section progress dots** at the bottom
- **Custom animated cursor** (gold ring on marriage, purple on engagement)
- **Scroll progress bar** at top of page

## 📱 Mobile Features
- **Vertical smooth scrolling**
- **Floating scroll-down indicator**
- **Stacked card layouts**
- **Touch-optimized buttons**

---

## 📄 PDF Download
- Click **"Download Invitation PDF"** in the footer or floating button
- Generates a beautiful styled PDF with:
  - Couple names
  - All event schedules
  - Venue details + map link
  - RSVP contacts
  - Theme colors matching Marriage or Engagement mode

## 🎬 Video Export (MP4/WebM)
- Click **"Download Invitation Video"**
- Captures each section using `html2canvas`
- Records canvas stream at 24fps using `MediaRecorder API`
- Each section plays for ~3 seconds with smooth fade transitions
- Exports as `.mp4` or `.webm` depending on browser support
- Shows progress percentage during generation

> **Note:** Keep the browser tab active during video generation. Takes ~30–60 seconds.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Music doesn't autoplay | Click anywhere on the page — browser blocks autoplay by default |
| Images not showing | Place files in `public/images/` (not `src/assets/`) |
| PDF download fails | Run `npm install jspdf` |
| Video export fails | Run `npm install html2canvas`; use Chrome/Edge for best support |
| Fonts not loading | Check internet connection (Google Fonts required) |
| Map not showing | Use a valid Google Maps embed URL in your data file |

---

## 📦 All npm Commands

```bash
# Install everything
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 💡 Pro Tips

1. **Change names**: Only edit the `data/` files — all components read from there
2. **Add more events**: Push extra objects into the `events` array in your data file
3. **Change the date**: Update `eventDate` in the data file — countdown updates automatically
4. **Two invitations independently**: The toggle switches ALL data, colors, and music instantly
5. **Video quality**: Video exports better on Chrome — use it for best results

---

*Built with ❤️ using React 18, Vite, Framer Motion, jsPDF & html2canvas*