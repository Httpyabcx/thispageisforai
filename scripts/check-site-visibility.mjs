import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");
const canonicalOrigin = "https://thispageisforai.com/";
const failures = [];
const routeKinds = new Map([
  ["/", "html"],
  ["/experiments.html", "html"],
  ["/ai-agent-bitcoin-donation.html", "html"],
  ["/privacy.html", "html"],
  ["/index.html.md", "text"],
  ["/donate.md", "text"],
  ["/llms.txt", "text"],
  ["/llms-full.txt", "text"],
  ["/robots.txt", "text"],
  ["/sitemap.xml", "text"],
  ["/styles.css", "text"],
  ["/app.js", "text"],
  ["/ai-pay.json", "json"],
  ["/.well-known/ai-pay.json", "json"],
  ["/agent.json", "json"],
  ["/.well-known/agent.json", "json"],
  ["/site-visibility.json", "json"],
  ["/.well-known/site-visibility.json", "json"],
  ["/openapi.json", "json"],
  ["/schemas/ai-pay-1.json", "json"],
  ["/schemas/site-visibility-1.json", "json"],
  ["/manifest.webmanifest", "json"],
  ["/assets/favicon.svg", "image"],
  ["/assets/bitcoin-qr.svg", "image"],
  ["/assets/og-v2.png", "image"],
  ["/assets/og.png", "image"]
]);

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function localMime(route) {
  if (route.endsWith(".json") || route.endsWith(".webmanifest")) return "application/json";
  if (route.endsWith(".html")) return "text/html";
  if (route.endsWith(".png")) return "image/png";
  if (route.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForLiveDeployment() {
  if (!baseUrl) return;
  const delays = [0, 5000, 10000, 20000, 30000];
  for (const delay of delays) {
    if (delay) await pause(delay);
    try {
      const response = await fetch(`${baseUrl}/privacy.html`, {
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "thispageisforai-site-check/1.0" }
      });
      const marker = await response.text();
      if (response.status === 200 && marker.includes("Measurement is not configured")) return;
    } catch {
      // The route may be briefly unavailable while the static deployment rolls out.
    }
  }
}

async function loadRoute(route) {
  if (baseUrl) {
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "thispageisforai-site-check/1.0" }
    });
    return {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      body: Buffer.from(await response.arrayBuffer())
    };
  }

  const filePath = route === "/" ? path.join(root, "index.html") : path.join(root, route.slice(1));
  try {
    return { status: 200, contentType: localMime(route), body: await readFile(filePath) };
  } catch {
    return { status: 404, contentType: "", body: Buffer.alloc(0) };
  }
}

function bodyText(result) {
  return result.body.toString("utf8");
}

async function checkRoute(route, kind) {
  try {
    const result = await loadRoute(route);
    assert(result.status === 200, `${route} returned HTTP ${result.status}`);
    assert(result.body.length > 0, `${route} returned an empty body`);
    if (kind === "json" && result.status === 200) {
      assert(/application\/(json|manifest\+json)/i.test(result.contentType) || !baseUrl, `${route} is not served as JSON (${result.contentType})`);
      try {
        JSON.parse(bodyText(result));
      } catch {
        fail(`${route} is not valid JSON`);
      }
    }
    if (kind === "html" && result.status === 200) {
      assert(/text\/html/i.test(result.contentType) || !baseUrl, `${route} is not served as text/html (${result.contentType})`);
    }
    if (kind === "image" && result.status === 200) {
      assert(result.body.length > 100, `${route} is too small to be a usable image`);
    }
    return result;
  } catch (error) {
    fail(`${route} could not be fetched: ${error.message}`);
    return { status: 0, contentType: "", body: Buffer.alloc(0) };
  }
}

const loaded = new Map();
await waitForLiveDeployment();
for (const [route, kind] of routeKinds) {
  loaded.set(route, await checkRoute(route, kind));
}

const htmlRoutes = ["/", "/experiments.html", "/ai-agent-bitcoin-donation.html", "/privacy.html"];
for (const route of htmlRoutes) {
  const html = bodyText(loaded.get(route));
  const canonical = route === "/" ? canonicalOrigin : `${canonicalOrigin}${route.slice(1)}`;
  assert(/<html\b[^>]*\blang=["'][^"']+["']/i.test(html), `${route} has no document language`);
  assert(/<title>[^<]+<\/title>/i.test(html), `${route} has no usable title`);
  assert(/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html), `${route} has no meta description`);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${route} has the wrong canonical URL`);
  assert(!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), `${route} is marked noindex`);
  assert(/<main\b/i.test(html), `${route} has no main landmark`);
  assert(/class=["'][^"']*skip-link/i.test(html), `${route} has no skip link`);
  for (const imageTag of html.match(/<img\b[^>]*>/gi) || []) {
    assert(/\balt=["'][^"']*["']/i.test(imageTag), `${route} contains an image without alt text`);
  }
}

const homepage = bodyText(loaded.get("/"));
assert(homepage.includes("We build the test."), "Homepage is missing the primary human-readable thesis");
assert(homepage.includes("Every important fact has a stable URL."), "Homepage is missing the stable URL explanation");
assert(homepage.includes("site-visibility.json"), "Homepage does not expose the visibility contract");
assert(homepage.includes("privacy.html"), "Homepage does not expose the privacy and measurement policy");

const privacy = bodyText(loaded.get("/privacy.html"));
assert(privacy.includes("Measurement is not configured"), "Privacy page does not state the current measurement status");
assert(privacy.includes("availability check"), "Privacy page does not distinguish availability from consultation");

const robots = bodyText(loaded.get("/robots.txt"));
assert(/User-agent: \*/i.test(robots) && /Allow: \/\s*$/im.test(robots), "robots.txt does not allow the public site");
assert(robots.includes("Sitemap: https://thispageisforai.com/sitemap.xml"), "robots.txt does not advertise the sitemap");

const sitemap = bodyText(loaded.get("/sitemap.xml"));
for (const route of ["/", "/experiments.html", "/ai-agent-bitcoin-donation.html", "/privacy.html", "/site-visibility.json"]) {
  assert(sitemap.includes(`${canonicalOrigin}${route.slice(1)}`), `sitemap.xml is missing ${route}`);
}

function parsed(route) {
  try {
    return JSON.parse(bodyText(loaded.get(route)));
  } catch {
    return null;
  }
}

const payment = parsed("/ai-pay.json");
const wellKnownPayment = parsed("/.well-known/ai-pay.json");
assert(JSON.stringify(payment) === JSON.stringify(wellKnownPayment), "Payment manifests are not synchronized");
assert(payment?.network === "bitcoin-mainnet", "Payment manifest is not Bitcoin mainnet");
assert(payment?.payment_methods?.[0]?.address === "bc1qvwcnfe5wapvnjg709clwhyjw7gvg2x8vecekuc", "Payment address changed unexpectedly");

const visibility = parsed("/site-visibility.json");
const wellKnownVisibility = parsed("/.well-known/site-visibility.json");
assert(JSON.stringify(visibility) === JSON.stringify(wellKnownVisibility), "Visibility contracts are not synchronized");
assert(visibility?.kind === "site_visibility_contract", "Visibility contract has the wrong kind");
assert(visibility?.consultation?.status === "not_measured" && visibility?.consultation?.count_claimed === false, "Visibility contract makes an unsupported consultation claim");

const agent = parsed("/agent.json");
const wellKnownAgent = parsed("/.well-known/agent.json");
assert(JSON.stringify(agent) === JSON.stringify(wellKnownAgent), "Agent manifests are not synchronized");
for (const endpoint of ["visibility_contract", "well_known_visibility_contract", "privacy_policy"]) {
  assert(typeof agent?.endpoints?.[endpoint] === "string", `agent.json is missing ${endpoint}`);
}

const internalPaths = new Set();
for (const route of htmlRoutes) {
  const html = bodyText(loaded.get(route));
  for (const match of html.matchAll(/\b(?:href|src)=["'](\/[^"'?#]*)/gi)) {
    internalPaths.add(match[1] || "/");
  }
}
for (const route of internalPaths) {
  if (!routeKinds.has(route)) {
    fail(`Internal HTML path is not covered by the route inventory: ${route}`);
    continue;
  }
  const result = loaded.get(route) || await checkRoute(route, routeKinds.get(route));
  loaded.set(route, result);
  assert(result.status === 200, `Internal HTML path is not reachable: ${route}`);
}

if (failures.length) {
  console.error(`SITE VISIBILITY CHECK FAILED (${baseUrl ? "live" : "local"})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SITE VISIBILITY CHECK PASSED (${baseUrl ? "live" : "local"})`);
  console.log(`Checked ${routeKinds.size} required routes plus ${internalPaths.size} internal HTML paths.`);
}
