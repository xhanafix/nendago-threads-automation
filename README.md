# Nendago Threads Automation 🥭

> Auto-publish 3 posts daily to **@nendago_hq** on Threads — TOFU (awareness), MOFU (consideration), BOFU (conversion) — fully automated via [Zernio](https://zernio.com) API.

## 📋 Overview

This system **generates and schedules 88 unique posts (30 days)** for your Nendago brand (mandai — fermented cempedak rind, Banjar heritage food, ready-to-cook, RM18/250g).

**Post schedule (Malaysia time, UTC+8):**
| Time | Funnel | Purpose | Link |
|------|--------|---------|------|
| **08:07 MYT** | TOFU 🧠 | Awareness — educate about mandai | www.nendago.com |
| **13:13 MYT** | MOFU 💡 | Consideration — recipes, tips | www.nendago.com |
| **20:07 MYT** | BOFU 🛒 | Conversion — buy now, limited stock | www.nendago.com |

**Every post includes:** `https://www.nendago.com/` (landing page linking to Shopee, TikTok & other stores)

---

## 🚀 Quick Start

### 1. Sign up for Zernio (free)
Go to [zernio.com](https://zernio.com) — first 2 accounts are free, no credit card needed.

### 2. Connect @nendago_hq
- In Zernio dashboard, click **Connect Account** → **Threads**
- Login via your linked Instagram (must be **Business** or **Creator** account)
- After connecting, copy your **Account ID** (looks like `acc_xxxxxxxx`)

### 3. Configure environment
```bash
cd poster/
cp .env.example .env
```

Edit `.env` and paste your credentials:
```env
ZERNIO_API_KEY=zrn_your_api_key_here
THREADS_ACCOUNT_ID=acc_your_account_id_here
```

### 4. Test a single post
```bash
node --env-file=.env post.js --text "Dah cuba mandai? Lembut & kenyal — lain dari yang lain." --link "https://www.nendago.com/"
```

### 5. Schedule all 88 posts at once
```bash
node --env-file=.env batch-schedule.js
```

---

## 📁 Folder Structure

```
nendago-threads-automation/
├── README.md                    ← You are here
├── agents/
│   └── threads-content.md       ← AI agent instructions (for Claude Code / AI setup)
├── poster/
│   ├── post.js                  ← Single post publisher (Node.js, zero npm deps)
│   ├── batch-schedule.js        ← Batch scheduler — generates all 88 posts
│   └── .env.example             ← Credentials template
└── content-plan/
    ├── 30-hari-plan.md          ← 30-day editorial calendar (each day's angle)
    └── used-hooks.md            ← Hook tracking (prevents duplicate content)
```

---

## 🧠 How It Works

### Content Strategy: TOFU / MOFU / BOFU

| Funnel | Goal | Example Hook |
|--------|------|-------------|
| **TOFU** | Educate + reach | "Bukan sayur, bukan buah. Mandai ni kulit cempedak yang dijeruk cara Banjar." |
| **MOFU** | Engage + teach | "Ramai gagal masa pertama masak mandai. Sebab apa? Mereka tak bilas & perah!" |
| **BOFU** | Convert + urgency | "Stok batch minggu ni makin sikit. Rating 5.0, hampir 1,000 pesanan." |

### Anti-Repeat System
Every post hook is tracked in `content-plan/used-hooks.md`. The system checks this list before generating each post to ensure **zero repetition** across 30 days.

### Character Limit Enforcement
Threads caps posts at **500 characters**. The poster script automatically:
- Counts characters (including link + hashtag)
- Warns if approaching the limit
- Truncates safely (preserves link and hashtag) if needed

### Language
All posts are in **Bahasa Melayu Malaysia** (not Indonesian). Key differences enforced:
- ❌ No "gurih" (Indonesian) — ✅ use "sedap"
- ❌ No "penasaran" — ✅ use "teringin"
- ❌ No "kriuk/renyah" — ✅ use "lembut & kenyal" (mandai's actual texture)
- ❌ No "rangup/garing" — mandai is NOT crispy

### Compliance Rules
Strict checks before every post — no medical claims, no fake halal claims, no fabricated testimonials, no false urgency, no exaggerated quality claims.

---

## 🛠️ Scripts Reference

### `poster/post.js`
Publish a single post to Threads immediately or schedule it.

```bash
# Publish now
node --env-file=.env post.js --text "Your post text here" --link "https://www.nendago.com/"

# Schedule for later
node --env-file=.env post.js --text "..." --link "..." --schedule "2026-09-20T08:07:00+08:00"
```

### `poster/batch-schedule.js`
Schedules **88 unique posts** (30 days × 3, minus Day 1 which was manual) with correct dates and times. Handles rate limiting (60 req/min on Zernio).

```bash
node --env-file=.env batch-schedule.js
```

---

## 🤖 Claude Code Integration

To use the AI agent for generating fresh content anytime:

1. Copy `agents/threads-content.md` into your project's `.claude/agents/` folder
2. In Claude Code, invoke: `/threads-content` then ask:
   > "Jana 1 post TOFU untuk hari ni — Bahasa Melayu Malaysia, ≤430 aksara, 1 hashtag"

The agent will follow all brand guidelines, compliance rules, and Malaysian Malay language requirements.

---

## ⚠️ Important Notes

- **Zernio rate limit:** 60 requests per rolling window. Batch script adds 1.1s delay between posts to stay under limit.
- **Hashtag limit:** Threads allows only **1 hashtag** per post. We use `#Nendago`.
- **Cron expiry:** If using Claude Code daily cron instead of pre-scheduling, crons auto-expire after 7 days.
- **Zernio free tier:** Up to 2 connected accounts, unlimited posts. Paid tier (~$6/month) for advanced scheduling.

---

## 📊 30-Day Content Highlights

| Week | Theme | TOFU Angle |
|------|-------|-------------|
| Week 1 (19-25 Aug) | Introduction & Education | What is mandai, Banjar heritage |
| Week 2 (26 Aug-1 Sep) | Cooking & Recipes | How to cook, pairings, tips |
| Week 3 (2-8 Sep) | Social Proof & Testimonials | Ratings, reviews, customer stories |
| Week 4 (9-15 Sep) | Urgency & FOMO | Limited batches, scarcity |
| Final (16 Sep) | Malaysia Day closing | Celebration + final call to action |

---

## 📝 License & Credits

Built for **Nendago** — preserving Banjar heritage through modern social media.

Powered by [Zernio](https://zernio.com) (unified social media API) and [Claude Code](https://claude.ai/code).

---

*Untuk sebarang pertanyaan, lawati www.nendago.com*