/* src/components/DownloadInvitation.jsx — v4
 * Fixes:
 *  1. NO special characters at all — only ASCII-safe helvetica chars
 *  2. Corners use '+' not '*' (renders as square on Windows jsPDF)
 *  3. Badges use plain text labels, no symbols
 *  4. Hearts/bullets replaced with plain dashes
 *  5. All 9 pages with full data
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import './DownloadInvitation.css';

/* Safe text helper — strips any char outside printable ASCII (32-126).
   jsPDF helvetica only covers Windows-1252 / Latin-1 safely.
   Anything outside that range renders as a black square or blank. */
const safe = (str = '') =>
  String(str).replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim() || '---';

const DownloadInvitation = ({ data }) => {
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const isMarriage = data.invitationType === 'Marriage';

  const generatePDF = async () => {
    setLoading(true);
    setProgress(5);

    try {
      const jsPDF = (await import('jspdf')).default;
      setProgress(12);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const PW  = doc.internal.pageSize.getWidth();   // 595.28
      const PH  = doc.internal.pageSize.getHeight();  // 841.89

      /* ── Theme colours ──────────────────────────────── */
      const bgR = isMarriage ? 26  : 14;
      const bgG = isMarriage ? 0   : 0;
      const bgB = isMarriage ? 8   : 32;
      const acR = isMarriage ? 212 : 187;
      const acG = isMarriage ? 175 : 143;
      const acB = isMarriage ? 55  : 206;
      const mk  = isMarriage ? [139,0,0] : [108,52,131];

      /* ── Reusable drawing helpers ───────────────────── */
      const bg = () => {
        doc.setFillColor(bgR, bgG, bgB);
        doc.rect(0, 0, PW, PH, 'F');
        // subtle lighter strip at top
        doc.setFillColor(bgR + 8, bgG + 4, bgB + 8);
        doc.rect(0, 0, PW, PH * 0.35, 'F');
      };

      const border = () => {
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(0.7);
        doc.rect(13, 13, PW - 26, PH - 26);
        doc.setLineWidth(0.2);
        doc.rect(18, 18, PW - 36, PH - 36);
      };

      /* Corner marks — use '+' which is 100% safe in all PDF fonts */
      const corners = () => {
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('+', 21, 28);
        doc.text('+', PW - 26, 28);
        doc.text('+', 21, PH - 18);
        doc.text('+', PW - 26, PH - 18);
      };

      /* Horizontal divider line */
      const hline = (y, mx = 60) => {
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(0.35);
        doc.line(mx, y, PW - mx, y);
      };

      /* Section badge — plain text, no symbols */
      const badge = (text, y) => {
        const safeText = safe(text);
        // measure width safely
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const tw = doc.getStringUnitWidth(safeText) * 7 * (72 / 96) + 32;
        const bx = (PW - tw) / 2;
        doc.setFillColor(...mk);
        doc.roundedRect(bx, y - 5, tw, 15, 3, 3, 'F');
        doc.setTextColor(acR, acG, acB);
        doc.text(safeText, PW / 2, y + 5, { align: 'center' });
      };

      /* Page footer */
      const footer = (pgNum) => {
        doc.setFillColor(bgR, bgG, bgB);
        doc.rect(0, PH - 30, PW, 30, 'F');
        doc.setTextColor(100, 80, 60);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'italic');
        doc.text('Hosted & Prepared by Dheeraj', PW / 2, PH - 17, { align: 'center' });
        doc.setTextColor(80, 60, 80);
        doc.setFont('helvetica', 'normal');
        doc.text(`${pgNum} / 9`, PW / 2, PH - 7, { align: 'center' });
      };

      /* Thin accent left bar (for event cards) */
      const accentBar = (x, y, h) => {
        doc.setFillColor(acR, acG, acB);
        doc.roundedRect(x, y, 4, h, 2, 2, 'F');
      };

      /* ── Extract data safely ────────────────────────── */
      const bride       = safe(data.brideName);
      const groom       = safe(data.groomName);
      const invType     = safe(data.invitationType);
      const dressCode   = safe(data.dressCode);
      const brideParents = safe(data.parents?.brideParents);
      const groomParents = safe(data.parents?.groomParents);

      const mainEventIdx = isMarriage ? 4 : 0;
      const mainEvent    = data.events?.[mainEventIdx] || data.events?.[0] || {};
      const meName  = safe(mainEvent.name);
      const meDate  = safe(mainEvent.date);
      const meTime  = safe(mainEvent.time);
      const meVenue = safe(mainEvent.venue);

      const venueName    = safe(data.venue?.name);
      const venueAddress = safe(data.venue?.address);
      const venueMap     = safe(data.venue?.mapLink);

      const rsvpPhone = safe(data.rsvp?.contact);
      const rsvpWA    = safe(data.rsvp?.whatsapp);
      const rsvpEmail = safe(data.rsvp?.email);

      /* ════════════════════════════════════════════════
         PAGE 1 — HERO
      ════════════════════════════════════════════════ */
      bg(); border(); corners();

      // Type label
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text(`-- ${invType} Invitation --`, PW / 2, 56, { align: 'center' });
      hline(64, 80);

      // Couple names — large
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(44);
      doc.setFont('helvetica', 'bold');
      doc.text(bride, PW / 2, 124, { align: 'center' });

      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(26);
      doc.text('&', PW / 2, 158, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(44);
      doc.text(groom, PW / 2, 202, { align: 'center' });
      hline(214, 80);

      // Parents line
      doc.setTextColor(180, 150, 110);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Son / Daughter of ${groomParents}  &  ${brideParents}`,
        PW / 2, 234, { align: 'center', maxWidth: PW - 80 }
      );

      // Main event box
      doc.setFillColor(...mk);
      doc.roundedRect(55, 252, PW - 110, 62, 8, 8, 'F');
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(0.5);
      doc.roundedRect(55, 252, PW - 110, 62, 8, 8, 'S');
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(meName, PW / 2, 272, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${meDate}   |   ${meTime}`, PW / 2, 290, { align: 'center' });
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(200, 175, 140);
      doc.text(meVenue, PW / 2, 306, { align: 'center' });

      // Dress code
      doc.setTextColor(120, 100, 80);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dress Code: ${dressCode}`, PW / 2, 344, { align: 'center' });

      // Request line
      doc.setTextColor(170, 145, 110);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Together with their families,', PW / 2, 386, { align: 'center' });
      doc.text('request the honour of your presence', PW / 2, 404, { align: 'center' });
      hline(416, 80);

      // Venue summary
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(venueName, PW / 2, 438, { align: 'center' });
      doc.setTextColor(150, 130, 100);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(venueAddress, PW / 2, 454, { align: 'center', maxWidth: PW - 80 });

      footer(1);
      setProgress(18);

      /* ════════════════════════════════════════════════
         PAGE 2 — COUPLE
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('THE COUPLE', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(`${bride}  &  ${groom}`, PW / 2, 98, { align: 'center' });
      hline(110, 80);

      // Two person cards side by side
      const personCards = [
        { name: bride, parents: brideParents, role: isMarriage ? 'THE BRIDE' : 'THE BRIDE-TO-BE' },
        { name: groom, parents: groomParents, role: isMarriage ? 'THE GROOM' : 'THE GROOM-TO-BE' },
      ];
      const cW = 184, cH = 205, cY = 138;
      personCards.forEach((card, i) => {
        const cX = 50 + i * (cW + 108);
        doc.setFillColor(...mk);
        doc.roundedRect(cX, cY, cW, cH, 8, 8, 'F');
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(0.6);
        doc.roundedRect(cX, cY, cW, cH, 8, 8, 'S');

        // Photo placeholder circle
        const cx = cX + cW / 2, cy = cY + 66;
        doc.setFillColor(bgR, bgG, bgB);
        doc.circle(cx, cy, 44, 'F');
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(1.2);
        doc.circle(cx, cy, 44, 'S');
        // Initial letter inside circle
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(card.name[0] || '?', cx, cy + 8, { align: 'center' });

        // Role label
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.text(card.role, cx, cY + 126, { align: 'center' });

        // Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(card.name, cx, cY + 148, { align: 'center' });

        // Parents — split across 2 lines if long
        doc.setTextColor(165, 145, 115);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        const parentWords = card.parents.split(' ');
        const mid = Math.ceil(parentWords.length / 2);
        doc.text(parentWords.slice(0, mid).join(' '), cx, cY + 168, { align: 'center' });
        if (parentWords.length > mid) {
          doc.text(parentWords.slice(mid).join(' '), cx, cY + 179, { align: 'center' });
        }
      });

      // Heart / divider between cards
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('<3', PW / 2, 248, { align: 'center' });

      doc.setTextColor(100, 85, 65);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Dress Code: ${dressCode}`, PW / 2, 374, { align: 'center' });

      footer(2);
      setProgress(28);

      /* ════════════════════════════════════════════════
         PAGE 3 — LOVE STORY
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('LOVE STORY', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Our Journey', PW / 2, 94, { align: 'center' });
      hline(106, 80);

      const story = data.story || [];
      // Vertical timeline — centre line
      const tlX = PW / 2;
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(0.4);
      // dashed line: draw short segments
      let dy = 116;
      while (dy < PH - 80) {
        doc.line(tlX, dy, tlX, Math.min(dy + 5, PH - 80));
        dy += 10;
      }

      const rowH   = story.length > 0 ? Math.min(82, (PH - 200) / story.length) : 70;
      const startY = 118;

      story.forEach((item, i) => {
        const iy       = startY + i * rowH;
        const leftSide = i % 2 === 0;

        // Dot on timeline
        doc.setFillColor(acR, acG, acB);
        doc.circle(tlX, iy, 4, 'F');

        // Year pill
        doc.setFillColor(...mk);
        doc.roundedRect(tlX - 18, iy + 5, 36, 12, 4, 4, 'F');
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(item.year), tlX, iy + 13, { align: 'center' });

        // Card
        const cw = 182, ch = 50;
        const cx = leftSide ? 28 : PW - 28 - cw;
        doc.setFillColor(bgR + 14, bgG + 8, bgB + 14);
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(0.3);
        doc.roundedRect(cx, iy - ch + 8, cw, ch, 5, 5, 'FD');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(item.title), cx + 8, iy - 6);

        // Description — word-wrap
        doc.setTextColor(160, 140, 110);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        const desc  = safe(item.description || '');
        const words = desc.split(' ');
        let line = '', lines = [];
        words.forEach(w => {
          const test = line ? line + ' ' + w : w;
          if (doc.getStringUnitWidth(test) * 7.5 * (72/96) < cw - 16) {
            line = test;
          } else {
            if (line) lines.push(line);
            line = w;
          }
        });
        if (line) lines.push(line);
        lines.slice(0, 2).forEach((ln, j) => {
          doc.text(ln, cx + 8, iy - 6 + 12 + j * 10);
        });
      });

      footer(3);
      setProgress(36);

      /* ════════════════════════════════════════════════
         PAGE 4 — EVENTS
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('EVENT SCHEDULE', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Celebrations', PW / 2, 92, { align: 'center' });
      hline(104, 80);

      const events  = data.events || [];
      const evCardH = Math.min(72, (PH - 190) / Math.max(events.length, 1) - 6);

      events.forEach((ev, i) => {
        const ey = 118 + i * (evCardH + 6);
        doc.setFillColor(...mk);
        doc.roundedRect(38, ey, PW - 76, evCardH, 6, 6, 'F');
        accentBar(38, ey, evCardH);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(safe(ev.name), 52, ey + 16);

        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`${safe(ev.date)}   |   ${safe(ev.time)}`, 52, ey + 30);

        doc.setTextColor(170, 150, 120);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(safe(ev.venue), 52, ey + 42);

        if (evCardH > 52 && ev.address) {
          doc.setTextColor(110, 95, 75);
          doc.setFontSize(7.5);
          doc.text(safe(ev.address), 52, ey + 54);
        }
      });

      footer(4);
      setProgress(45);

      /* ════════════════════════════════════════════════
         PAGE 5 — COUNTDOWN
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('COUNTDOWN', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Counting Down To Forever', PW / 2, 92, { align: 'center' });
      hline(104, 80);

      // Calculate days remaining
      let daysLeft = '---', hoursLeft = '--', minsLeft = '--';
      try {
        const match = meDate.match(/(\d+)\s+(\w+)\s+(\d+)/);
        if (match) {
          const evDate = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
          const diff = evDate - new Date();
          if (diff > 0) {
            daysLeft  = String(Math.floor(diff / 86400000)).padStart(3, '0');
            hoursLeft = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
            minsLeft  = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
          } else {
            daysLeft = '000'; hoursLeft = '00'; minsLeft = '00';
          }
        }
      } catch(_) {}

      const units = [[daysLeft, 'DAYS'], [hoursLeft, 'HOURS'], [minsLeft, 'MINS']];
      const bW2 = 118, bH2 = 88;
      const totalW = units.length * bW2 + (units.length - 1) * 18;
      const sx = (PW - totalW) / 2;

      units.forEach(([val, lbl], i) => {
        const bx2 = sx + i * (bW2 + 18);
        const by2 = 138;
        doc.setFillColor(...mk);
        doc.roundedRect(bx2, by2, bW2, bH2, 8, 8, 'F');
        doc.setDrawColor(acR, acG, acB);
        doc.setLineWidth(0.6);
        doc.roundedRect(bx2, by2, bW2, bH2, 8, 8, 'S');
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(30);
        doc.setFont('helvetica', 'bold');
        doc.text(val, bx2 + bW2 / 2, by2 + 48, { align: 'center' });
        doc.setTextColor(170, 150, 120);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(lbl, bx2 + bW2 / 2, by2 + 63, { align: 'center' });
        // Colon separator
        if (i < units.length - 1) {
          doc.setTextColor(acR, acG, acB);
          doc.setFontSize(20);
          doc.text(':', bx2 + bW2 + 9, by2 + 52, { align: 'center' });
        }
      });

      doc.setTextColor(160, 140, 110);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text(`${meName}  |  ${meDate}  |  ${meTime}`, PW / 2, 268, { align: 'center', maxWidth: PW - 80 });
      hline(282, 80);
      doc.setTextColor(100, 85, 65);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Live countdown available in the digital invitation', PW / 2, 302, { align: 'center' });

      footer(5);
      setProgress(54);

      /* ════════════════════════════════════════════════
         PAGE 6 — GALLERY
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('GALLERY', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Moments Captured With Love', PW / 2, 92, { align: 'center' });
      hline(104, 80);

      const gLabels  = ['Pre-Wedding','Couple','Family','Engagement','Ceremony','Reception','Candid','Memories'];
      const gcols    = 4, grows = 2;
      const gpad     = 8;
      const gw       = (PW - 80 - gpad * (gcols - 1)) / gcols;
      const gh       = (PH - 290) / grows;

      for (let r = 0; r < grows; r++) {
        for (let c = 0; c < gcols; c++) {
          const idx = r * gcols + c;
          const gx  = 40 + c * (gw + gpad);
          const gy  = 116 + r * (gh + gpad);
          doc.setFillColor(...mk);
          doc.roundedRect(gx, gy, gw, gh, 5, 5, 'F');
          doc.setDrawColor(acR, acG, acB);
          doc.setLineWidth(0.25);
          doc.roundedRect(gx, gy, gw, gh, 5, 5, 'S');
          doc.setTextColor(100, 85, 65);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'normal');
          doc.text('[ ]', gx + gw / 2, gy + gh / 2 + 4, { align: 'center' });
          doc.setTextColor(140, 120, 90);
          doc.setFontSize(6);
          doc.text(gLabels[idx] || '', gx + gw / 2, gy + gh - 6, { align: 'center' });
        }
      }

      doc.setTextColor(90, 75, 55);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('Place your photos in /public/images/ to populate the gallery', PW / 2, PH - 50, { align: 'center' });

      footer(6);
      setProgress(63);

      /* ════════════════════════════════════════════════
         PAGE 7 — VENUE
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('VENUE', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Find Us Here', PW / 2, 92, { align: 'center' });
      hline(104, 80);

      // Venue info card
      doc.setFillColor(...mk);
      doc.roundedRect(38, 118, PW - 76, 110, 8, 8, 'F');
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(0.6);
      doc.roundedRect(38, 118, PW - 76, 110, 8, 8, 'S');

      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(venueName, PW / 2, 146, { align: 'center' });

      doc.setTextColor(220, 200, 175);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(venueAddress, PW / 2, 164, { align: 'center', maxWidth: PW - 100 });

      doc.setTextColor(140, 120, 90);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Google Maps:', PW / 2, 184, { align: 'center' });
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(venueMap, PW / 2, 198, { align: 'center', maxWidth: PW - 80 });

      // Map placeholder box
      doc.setFillColor(bgR + 10, bgG + 5, bgB + 10);
      doc.roundedRect(38, 242, PW - 76, 200, 8, 8, 'F');
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(0.25);
      doc.roundedRect(38, 242, PW - 76, 200, 8, 8, 'S');
      doc.setTextColor(90, 75, 55);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('[ Map ]', PW / 2, 348, { align: 'center' });
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('Scan QR or open the link above in Google Maps', PW / 2, 368, { align: 'center' });

      // Events at venue table
      hline(458, 80);
      badge('EVENTS AT THIS VENUE', 474);

      events.forEach((ev, i) => {
        const ey2 = 500 + i * 22;
        if (ey2 > PH - 45) return;
        doc.setTextColor(180, 155, 120);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(safe(ev.name), 58, ey2);
        doc.setTextColor(110, 95, 75);
        doc.setFontSize(8);
        doc.text(`${safe(ev.date)}  |  ${safe(ev.time)}`, PW - 58, ey2, { align: 'right' });
        doc.setDrawColor(...mk);
        doc.setLineWidth(0.2);
        doc.line(58, ey2 + 4, PW - 58, ey2 + 4);
      });

      footer(7);
      setProgress(72);

      /* ════════════════════════════════════════════════
         PAGE 8 — RSVP
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      badge('RSVP', 55);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('Join Us', PW / 2, 94, { align: 'center' });
      hline(106, 80);

      // Quote
      const quote = isMarriage
        ? '"Two souls, one heart. Your presence completes our day."'
        : '"Love is in the air - and we want you there!"';
      doc.setTextColor(170, 148, 118);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(safe(quote), PW / 2, 144, { align: 'center', maxWidth: PW - 80 });

      doc.setTextColor(110, 95, 75);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Kindly confirm your attendance by reaching out below.', PW / 2, 172, { align: 'center' });

      // Contact card
      doc.setFillColor(...mk);
      doc.roundedRect(55, 190, PW - 110, 184, 10, 10, 'F');
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(0.6);
      doc.roundedRect(55, 190, PW - 110, 184, 10, 10, 'S');

      // Left accent bar on card
      doc.setFillColor(acR, acG, acB);
      doc.roundedRect(55, 190, 4, 184, 2, 2, 'F');

      const contactRows = [
        ['PHONE',     rsvpPhone],
        ['WHATSAPP',  rsvpWA],
        ['EMAIL',     rsvpEmail],
      ];

      contactRows.forEach(([label, val], i) => {
        const ry = 218 + i * 56;
        // Label
        doc.setTextColor(acR, acG, acB);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 72, ry);
        // Value
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11.5);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 72, ry + 17);
        // Divider (except last)
        if (i < contactRows.length - 1) {
          doc.setDrawColor(acR, acG, acB);
          doc.setLineWidth(0.2);
          doc.line(72, ry + 28, PW - 72, ry + 28);
        }
      });

      // Decorative dots row
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      ['- o -', '<3', '- o -', '<3', '- o -'].forEach((s, i) => {
        doc.text(s, PW / 2 - 44 + i * 22, 408, { align: 'center' });
      });

      footer(8);
      setProgress(82);

      /* ════════════════════════════════════════════════
         PAGE 9 — THANK YOU / FOOTER
      ════════════════════════════════════════════════ */
      doc.addPage(); bg(); border(); corners();
      hline(PH - 102, 55);

      // Monogram circle
      const mcx = PW / 2, mcy = PH - 184;
      doc.setFillColor(...mk);
      doc.circle(mcx, mcy, 54, 'F');
      doc.setDrawColor(acR, acG, acB);
      doc.setLineWidth(1.4);
      doc.circle(mcx, mcy, 54, 'S');
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(`${bride[0] || '?'} & ${groom[0] || '?'}`, mcx, mcy + 10, { align: 'center' });

      // Thank You heading
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(38);
      doc.setFont('helvetica', 'bold');
      doc.text('Thank You', PW / 2, PH - 294, { align: 'center' });
      hline(PH - 312, 80);

      doc.setTextColor(170, 148, 118);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'italic');
      doc.text('Your presence and blessings mean the world to us.', PW / 2, PH - 340, { align: 'center' });

      doc.setTextColor(220, 200, 175);
      doc.setFontSize(11.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`With Love,  ${bride}  &  ${groom}`, PW / 2, PH - 364, { align: 'center' });

      // Decorative row
      doc.setTextColor(acR, acG, acB);
      doc.setFontSize(13);
      ['- + -', '<3', '- + -', '<3', '- + -'].forEach((s, i) => {
        doc.text(s, PW / 2 - 44 + i * 22, PH - 410, { align: 'center' });
      });

      hline(PH - 430, 80);

      // Event summary
      doc.setTextColor(160, 140, 110);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${meName}   |   ${meDate}   |   ${meTime}`, PW / 2, PH - 452, { align: 'center', maxWidth: PW - 80 });
      doc.setTextColor(120, 100, 80);
      doc.setFontSize(8);
      doc.text(venueName, PW / 2, PH - 468, { align: 'center' });

      hline(PH - 486, 55);

      doc.setTextColor(100, 85, 65);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Hosted & Prepared by Dheeraj', PW / 2, PH - 504, { align: 'center' });
      doc.setTextColor(70, 55, 70);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Built with React + Framer Motion', PW / 2, PH - 520, { align: 'center' });

      footer(9);
      setProgress(95);

      /* ── Save ──────────────────────────────────────── */
      const filename = `${bride}_${groom}_${invType}_Invitation.pdf`;
      doc.save(filename);
      setProgress(100);

    } catch(err) {
      console.error('PDF error:', err);
      alert(`PDF generation failed:\n\n${err.message}\n\nMake sure jspdf is installed:\nnpm install jspdf`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const isM = data.invitationType === 'Marriage';

  return (
    <motion.div className="download-wrap">
      <motion.button
        className={`download-btn-main ${isM ? 'marriage' : 'engagement'}`}
        onClick={generatePDF}
        disabled={loading}
        whileHover={!loading ? { scale: 1.04 } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}
            >
              ...
            </motion.span>
            {' '}Generating PDF... {progress}%
          </>
        ) : (
          '[ PDF ] Download Invitation'
        )}
      </motion.button>

      {loading && (
        <div className={`pdf-progress-bar ${isM ? 'marriage' : 'engagement'}`}>
          <motion.div
            className="pdf-progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default DownloadInvitation;