// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The app is published to GitHub Pages at the repo subpath
// https://nichetoolkit-hub.github.io/etsy-profit-master/
// so every public URL (client assets, router) must be prefixed with that base.
const GITHUB_PAGES_BASE = "/etsy-profit-master";

export default defineConfig({
  // Disable the wrapper's nitro (cloudflare-module) build for this static deploy:
  // nitro reroutes the client+SSR outputs into .output/ and node_modules/.nitro/,
  // which breaks TanStack Start's prerender step (it imports the SSR entry from
  // dist/server/). This deploy targets GitHub Pages (pure static), so no SSR
  // server is needed; the plain Vite layout (dist/client + dist/server used for
  // prerendering) is exactly what we want.
  nitro: false,
  // Prefixes emitted asset URLs (<script>/<link> srcs, runtime asset lookups)
  // with the GitHub Pages subpath so JS/CSS resolve at
  // https://nichetoolkit-hub.github.io/etsy-profit-master/assets/...
  vite: {
    base: `${GITHUB_PAGES_BASE}/`,
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    // Tell the router to treat everything under /etsy-profit-master/ as the app root.
    // Wired to the client and SSR at build time (TSS_ROUTER_BASEPATH define).
    router: { basepath: GITHUB_PAGES_BASE },
    // Statically prerender the app shell (index.html) into dist/client so the
    // site works as pure static hosting (no SSR server on GitHub Pages).
    // The only non-prerenderable route is the Dodo Payments webhook (server-side,
    // POST-only API) which is intentionally omitted from static hosting.
    prerender: { enabled: true },
  },
});