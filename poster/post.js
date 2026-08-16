#!/usr/bin/env node
/**
 * Nendago -> Zernio Threads poster.
 *
 * Usage:
 *   node --env-file=.env post.js --text "<post text>" [--link <url>] [--schedule "2026-08-17T20:07:00+08:00"]
 *
 * Env (dari .env / .env.example):
 *   ZERNIO_API_KEY       - API key dari dashboard Zernio
 *   THREADS_ACCOUNT_ID   - account ID dari dashboard Zernio (selepas connect @nendago_hq)
 *   ZERNIO_ENDPOINT      - optional override endpoint
 *
 * Nota: Threads had maksimum 500 aksara. Link, emoji dan hashtag semuanya dikira.
 * Skrip akan TRUNCATE jika melebihi had dan beri amaran. Jika panggilan API gagal,
 * teks post tetap dicetak untuk salin tampal manual.
 */
"use strict";

const ZERNIO_ENDPOINT = process.env.ZERNIO_ENDPOINT || "https://zernio.com/api/v1/posts";
const MAX_CHARS = 500;

function parseArgs(argv) {
  const args = { text: null, link: null, schedule: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--text") args.text = argv[++i];
    else if (a === "--link") args.link = argv[++i];
    else if (a === "--schedule") args.schedule = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function printPost(post) {
  console.error("\n--- POST TEXT (salinkan manual) ---");
  console.error(post);
  console.error("--- END POST ---");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(
      'Usage: node --env-file=.env post.js --text "<post>" [--link <url>] [--schedule "YYYY-MM-DDTHH:MM:SS+08:00"]'
    );
    return;
  }

  const apiKey = process.env.ZERNIO_API_KEY;
  const accountId = process.env.THREADS_ACCOUNT_ID;

  if (!apiKey || !accountId) {
    console.error("ERROR: Env tidak lengkap. Pastikan ZERNIO_API_KEY dan THREADS_ACCOUNT_ID ada dalam .env (rujuk .env.example).");
    process.exit(1);
  }
  if (!args.text) {
    console.error("ERROR: --text diperlukan. Guna --help untuk panduan.");
    process.exit(1);
  }

  // Bina content: teks post + optional link di baris akhir.
  let content = args.text.trim();
  if (args.link) {
    content += "\n" + args.link.trim();
  }

  // Threads had maksimum 500 aksara (kiraan standard JavaScript = .length).
  const totalChars = content.length;
  let final = content;
  if (totalChars > MAX_CHARS) {
    console.warn(`WARNING: post ${totalChars} aksara (>${MAX_CHARS}). Saya truncate untuk muat had Threads.`);
    if (args.link) {
      const link = args.link.trim();
      const body = args.text.trim();
      const room = MAX_CHARS - (`\n` + link).length;
      let cut = body.slice(0, room).replace(/[\uD800-\uDBFF]$/, "");
      final = cut.trimEnd() + "\n" + link;
    } else {
      final = content.slice(0, MAX_CHARS - 1).replace(/[\uD800-\uDBFF]$/, "") + "…";
    }
    console.warn(`WARNING: post akhir = ${final.length} aksara.`);
  }

  // Kira dan paparkan jumlah aksara untuk semakan.
  console.log(`📝 ${final.length} aksara / ${MAX_CHARS} maksimum`);

  const payload = {
    platforms: [{ platform: "threads", accountId }],
    content: final,
    publishNow: true,
  };
  if (args.schedule) payload.scheduledFor = args.schedule;

  try {
    const res = await fetch(ZERNIO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      console.error(`ZERNIO ERROR (${res.status}): ${bodyText}`);
      printPost(final);
      process.exit(1);
    }
    console.log("SUCCESS: post dihantar ke Zernio untuk Threads @nendago_hq.");
    try {
      console.log(JSON.stringify(JSON.parse(bodyText), null, 2));
    } catch {
      console.log(bodyText);
    }
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    printPost(final);
    process.exit(1);
  }
}

main();