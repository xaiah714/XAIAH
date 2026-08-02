// ---------------------------------------------------------------------------
// Affiliate links (rev 15) — every product on the site becomes a clickable
// "buy" link that earns commission.
//
// HOW IT WORKS
//   • Amazon runs its own program, so its links get your Associates tag
//     appended directly (?tag=…).
//   • Target / Walmart / Ulta / CVS each live behind an affiliate NETWORK.
//     Rather than hand-managing four link formats, one network wrapper
//     (Sovrn Commerce or Skimlinks — pick either) rewrites any retailer
//     URL into a tracked one. Paste that id once and every non-Amazon
//     link on the site is monetized.
//   • Nothing breaks before you sign up: with the fields blank, links go
//     straight to the retailer, just without commission.
//
// WHERE TO PASTE YOUR IDS: right here. See AFFILIATES.md for the exact
// programs to join and what each one covers.
// ---------------------------------------------------------------------------

export const AFFILIATES = {
  // Amazon Associates tracking id (live)
  amazonTag: "howsmyhair-20",
  // Sovrn Commerce / Skimlinks site id — wraps every non-Amazon retailer
  // link. Leave blank to send plain (unmonetized) links.
  networkId: "",
  // "sovrn" | "skimlinks" — which wrapper the id above belongs to
  network: "sovrn",
};

// Retailers shown on each product card, in order.
export const RETAILERS = [
  { id: "amazon", label: "Amazon", search: (q) => `https://www.amazon.com/s?k=${q}` },
  { id: "target", label: "Target", search: (q) => `https://www.target.com/s?searchTerm=${q}` },
  { id: "ulta", label: "Ulta", search: (q) => `https://www.ulta.com/search?Ntt=${q}` },
  { id: "walmart", label: "Walmart", search: (q) => `https://www.walmart.com/search?q=${q}` },
  { id: "cvs", label: "CVS", search: (q) => `https://www.cvs.com/search?searchTerm=${q}` },
];

// Wrap a retailer URL in the affiliate network so the click is tracked.
function monetize(url, retailerId) {
  if (retailerId === "amazon") {
    if (!AFFILIATES.amazonTag) return url;
    return `${url}${url.includes("?") ? "&" : "?"}tag=${encodeURIComponent(AFFILIATES.amazonTag)}`;
  }
  if (!AFFILIATES.networkId) return url;
  const target = encodeURIComponent(url);
  return AFFILIATES.network === "skimlinks"
    ? `https://go.skimresources.com/?id=${encodeURIComponent(AFFILIATES.networkId)}&xs=1&url=${target}`
    : `https://redirect.viglink.com/?key=${encodeURIComponent(AFFILIATES.networkId)}&u=${target}`;
}

// Search query for one product — brand + name, minus our own formatting.
function query(product) {
  const raw = `${product.brand === "Any brand" ? "" : product.brand} ${product.name}`
    .replace(/\(.*?\)/g, " ")
    .replace(/[—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return encodeURIComponent(raw);
}

// Every buy link for a product, ready to render.
export function buyLinks(product) {
  if (!product) return [];
  const q = query(product);
  return RETAILERS.map((r) => ({
    id: r.id,
    label: r.label,
    url: monetize(r.search(q), r.id),
  }));
}

// Monetized links to each retailer's hair-care aisle (Where to Buy tab).
const HAIR_AISLE = {
  amazon: "https://www.amazon.com/s?k=hair+care",
  target: "https://www.target.com/c/hair-care/-/N-5xu1n",
  ulta: "https://www.ulta.com/shop/hair",
  walmart: "https://www.walmart.com/browse/beauty/hair-care/1085666_1007040",
  cvs: "https://www.cvs.com/shop/beauty/hair-care",
};
const STORE_FINDER = {
  target: "https://www.target.com/store-locator/find-stores",
  ulta: "https://www.ulta.com/stores",
  walmart: "https://www.walmart.com/store-finder",
  cvs: "https://www.cvs.com/store-locator/landing",
};

export function retailerLinks() {
  return RETAILERS.map((r) => ({ label: r.label, url: monetize(HAIR_AISLE[r.id], r.id) }));
}

export function storeFinderLinks() {
  return Object.entries(STORE_FINDER).map(([id, url]) => ({
    label: `${RETAILERS.find((r) => r.id === id).label} stores`,
    url,
  }));
}

// One product, one search — used when a link is needed outside a card.
export function searchLink(product, retailerId = "amazon") {
  const r = RETAILERS.find((x) => x.id === retailerId) || RETAILERS[0];
  return monetize(r.search(query(product)), r.id);
}

// True once at least one program is configured (used for the FTC-required
// "we may earn a commission" disclosure).
export function affiliatesActive() {
  return Boolean(AFFILIATES.amazonTag || AFFILIATES.networkId);
}
