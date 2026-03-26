/**
 * SSO Rhythm — Tailwind Plugin
 *
 * Injects .new-glass token definitions via addBase().
 * theme() calls are resolved at plugin execution time inside Tailwind's
 * pipeline, so this works correctly in both Vite dev and production builds
 * without needing to live in the same file as @tailwind base.
 */
const plugin = require('tailwindcss/plugin');
const tokens = require('./tokens.cjs');

module.exports = plugin(function ({ addBase, theme }) {
  const resolved = {};

  for (const [prop, value] of Object.entries(tokens)) {
    if (value && typeof value === 'object' && value.__raw) {
      // Raw CSS value — use as-is
      resolved[prop] = value.value;
    } else if (typeof value === 'string') {
      // Tailwind theme path — resolve via theme()
      const result = theme(value);
      if (result != null) {
        resolved[prop] = result;
      } else {
        console.warn(`[rhythm-plugin] Could not resolve theme path "${value}" for ${prop}`);
        resolved[prop] = value;
      }
    }
  }

  addBase({
    '.new-glass': resolved,
  });
});
