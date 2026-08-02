# Affiliate setup — how many programs do you actually need?

Every product on the site now shows a **Buy** row (Amazon · Target · Ulta ·
Walmart · CVS) that links straight to that product. The links work today;
they start **earning** the moment you paste your ids into
[`lib/affiliates.js`](lib/affiliates.js).

---

## The short answer

The product library contains **158 products across 54 brands**.

**You do NOT need 54 affiliate programs.** You are sending shoppers to
*retailers*, not to brand websites — so the retailer's program pays you
regardless of which of the 54 brands is in the cart.

| Route | Sign-ups | Covers |
| --- | --- | --- |
| **Minimum (do this first)** | **2** | Everything on the site |
| Better rates | 5–6 | Everything, at higher commission |
| Maximum | +10–15 | Adds direct brand deals on your best sellers |

### The 2 sign-ups that cover 100% of the site

1. **Amazon Associates** — `affiliate-program.amazon.com`.
   Paste your tag (e.g. `howsmyhair-20`) into `AFFILIATES.amazonTag`.
   Amazon carries essentially all 54 brands, so this one program alone
   monetizes every product card. Note their rule: you must make 3 qualifying
   sales within 180 days to stay in the program.
2. **One link-monetization network** — **Sovrn Commerce** (`sovrn.com/commerce`)
   or **Skimlinks** (`skimlinks.com`). You get a single site id that
   automatically converts *any* retailer link (Target, Ulta, Walmart, CVS,
   and thousands more) into a tracked one. Paste it into
   `AFFILIATES.networkId` and set `network` to `"sovrn"` or `"skimlinks"`.
   This is the shortcut that replaces ~50 individual applications.

That's it — two accounts, two strings pasted, every link on the site earns.

### Optional: direct retailer programs (higher rates than the network)

Worth doing once you have traffic, because direct pays more than a network
that takes a cut. Each is one application:

| Retailer | Where to apply |
| --- | --- |
| Target Partners | partners.target.com (Impact) |
| Walmart Creator/Affiliates | affiliates.walmart.com (Impact) |
| Ulta Beauty | Ulta affiliate program (Impact) |
| CVS | CVS affiliate program (Rakuten/CJ) |
| Sally Beauty *(optional 6th)* | good pro-brand coverage |

When you're approved directly, you can either keep using the network
wrapper (simplest) or add per-retailer link formats later.

### Optional: direct brand programs — prioritize these 15

Direct brand deals usually pay the best (often 10–20% vs 1–4% at
retailers). Chase them in this order, which is ranked by how often each
brand actually appears in your routines:

| # | Brand | Products in library | Typical program home |
| --- | --- | --- | --- |
| 1 | L'Oréal (incl. Elvive, EverPure) | 17 | Rakuten / brand site |
| 2 | Dove | 13 | Unilever programs / retailers |
| 3 | OGX | 12 | Rakuten / retailers |
| 4 | Pantene | 7 | P&G programs / retailers |
| 5 | Living Proof | 7 | Impact / brand site |
| 6 | amika | 7 | ShareASale / brand site |
| 7 | Not Your Mother's | 6 | Retailers |
| 8 | Pureology | 6 | Rakuten (L'Oréal Pro) |
| 9 | Redken | 6 | Rakuten (L'Oréal Pro) |
| 10 | Garnier Fructis | 5 | Rakuten (L'Oréal) |
| 11 | **K18** | 4 | Brand affiliate program — high value |
| 12 | TRESemmé | 4 | Unilever / retailers |
| 13 | **Olaplex** | 3 | Brand affiliate program — high value |
| 14 | Bumble and bumble | 3 | Rakuten |
| 15 | Crown Affair | 3 | ShareASale / brand site |

The remaining 39 brands have 1–2 products each — the retailer programs
already cover them, so don't spend applications there.

> **Reality check:** most brand programs want a live site with some traffic
> before approving. Start with the 2 sign-ups above (they approve fast),
> get real clicks flowing, then apply to K18, Olaplex, amika and Living
> Proof — the four where a direct deal is most worth the paperwork.

---

## Where to paste the ids

`lib/affiliates.js`:

```js
export const AFFILIATES = {
  amazonTag: "howsmyhair-20",   // ← your Amazon Associates tag
  networkId: "123456",          // ← your Sovrn/Skimlinks site id
  network: "sovrn",             // or "skimlinks"
};
```

Save, redeploy (`npm run deploy`), done. Nothing else in the code needs
touching — all 158 products and the Where-to-Buy tab read from this file.

## Legal note (already handled)

FTC rules require disclosure. The results page footer already says the
links may earn a commission at no extra cost, and every buy link carries
`rel="nofollow sponsored"`, which is what Amazon and Google both require.
