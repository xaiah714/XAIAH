// Cloudflare deployment (rev 9) — OpenNext adapter defaults are all we
// need: no ISR/queue features in use, so no caching bindings required.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
