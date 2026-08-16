#!/usr/bin/env node
/**
 * Batch schedule — Schedule posts to Threads via Zernio
 * Guna: node --env-file=.env batch-schedule.js
 *
 * Post untuk TOFU 08:07 · MOFU 13:13 · BOFU 20:07 MYT (UTC+8)
 * Link: https://www.nendago.com/
 * Hashtag: #Nendago
 *
 * 📝 CARA GUNA:
 * 1. Isi POSTS[] di bawah dengan content awak
 * 2. Setup .env (salin dari .env.example)
 * 3. Run: node --env-file=.env batch-schedule.js
 *
 * Untuk inspirasi content: lihat ../content-plan/30-hari-plan.md
 * Had: setiap post ≤430 aksara (link + hashtag akan ditambah)
 */
"use strict";

const ZERNIO_ENDPOINT = process.env.ZERNIO_ENDPOINT || "https://zernio.com/api/v1/posts";
const apiKey = process.env.ZERNIO_API_KEY;
const accountId = process.env.THREADS_ACCOUNT_ID;

if (!apiKey || !accountId) {
  console.error("ERROR: ZERNIO_API_KEY & THREADS_ACCOUNT_ID diperlukan dalam .env");
  process.exit(1);
}

const LINK = "https://www.nendago.com/";
const HASHTAG = "#Nendago";

function makePost(text) {
  return text.trimEnd() + "\n\n" + LINK + "\n\n" + HASHTAG;
}

function scheduleISO(year, month, day, hourMin) {
  const [h, m] = hourMin.split(":").map(Number);
  const d = String(day).padStart(2, "0");
  const mo = String(month).padStart(2, "0");
  return `${year}-${mo}-${d}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00+08:00`;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// ══════════════════════════════════════════════════════════════
// POSTS — edit sini kalau nak tukar content
// Setiap entry: { tofu: "...", mofu: "...", bofu: "..." }
// ≤430 aksara setiap post (link + hashtag akan ditambah)
// ══════════════════════════════════════════════════════════════
const POSTS = [
  // === HARI 1 — contoh ===
  { tofu: 'Dah cuba mandai? Kulit cempedak dijeruk cara Banjar, digoreng jadi lauk. Lembut & kenyal — lain dari yang lain.',
    mofu: 'Cara masak mandai: bilas bersih, perah air, potong, goreng. 5 minit je. Jangan skip bilasan — tu rahsianya.',
    bofu: 'Rating 5.0, hampir 1,000 pesanan. RM18 sebungkus. Bundle 3+1 = RM54. Order sekarang.' },
];

// ══════════════════════════════════════════════════════════════
// KONFIGURASI JADUAL — ubah ikut keperluan
// ══════════════════════════════════════════════════════════════
const START_YEAR = 2026;
const START_MONTH = 8;  // Ogos
const START_DAY = 19;   // Hari pertama schedule

// ══════════════════════════════════════════════════════════════

async function main() {
  process.stdout.write(`\n📋 Batch schedule — ${POSTS.length * 3} posts\n\n`);
  let success = 0, failed = 0;

  for (let i = 0; i < POSTS.length; i++) {
    const dayData = POSTS[i];
    // Kira tarikh: increment dari START_DAY
    let calDay = START_DAY + i;
    let calMonth = START_MONTH;
    let calYear = START_YEAR;
    // Handle bulan transition (contoh: 31 Ogos -> 1 September)
    if (calMonth === 8 && calDay > 31) { calDay -= 31; calMonth = 9; }
    if (calMonth === 9 && calDay > 30) { calDay -= 30; calMonth = 10; }
    if (calMonth === 10 && calDay > 31) { calDay -= 30; calMonth = 11; } // not needed but safe

    const displayDate = `${String(calDay).padStart(2,"0")}/${String(calMonth).padStart(2,"0")}/${calYear}`;
    const funnels = [
      { name: 'TOFU', text: dayData.tofu, time: '08:07' },
      { name: 'MOFU', text: dayData.mofu, time: '13:13' },
      { name: 'BOFU', text: dayData.bofu, time: '20:07' },
    ];

    for (const f of funnels) {
      const fullText = makePost(f.text);
      const scheduledFor = scheduleISO(calYear, calMonth, calDay, f.time);

      if (fullText.length > 500) {
        const safe = f.text.substring(0, 500 - LINK.length - HASHTAG.length - 4).trimEnd();
        fullText = safe + "\n\n" + LINK + "\n\n" + HASHTAG;
      }

      const payload = {
        content: fullText,
        platforms: [{ platform: "threads", accountId }],
        scheduledFor,
        timezone: "Asia/Kuala_Lumpur",
      };

      try {
        const res = await fetch(ZERNIO_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        const body = await res.text();
        if (!res.ok) {
          console.error(`❌ ${displayDate} ${f.name}: HTTP ${res.status}`);
          failed++;
        } else {
          console.log(`✅ ${displayDate} ${f.name}: ${fullText.length} aksara`);
          success++;
        }
      } catch (err) {
        console.error(`❌ ${displayDate} ${f.name}: ${err.message}`);
        failed++;
      }

      await delay(1100); // Rate limit protection — 1 post/saat
    }
  }

  console.log(`\n✅ ${success} berjaya, ${failed} gagal`);
  process.exit(failed > 0 ? 1 : 0);
}

main();