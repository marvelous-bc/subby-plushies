// ==UserScript==
// @name         Subby's Plushies & Essentials - Cleanup Auto Launcher
// @namespace    subbycat.subbysplushies.launcher.cleanup
// @author       Marvelous
// @version      2.4.0
// @description  Loads the latest published Essentials release; removes obsolete launcher caches safely; prevents duplicate injection.
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Cleanup-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Cleanup-Launcher.user.js
// @match        https://bondageprojects.elementfx.com/R*
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://bondageprojects.com/R*
// @match        https://www.bondageprojects.com/R*
// @match        https://bondageeurope.com/*/BondageClub/*
// @match        https://www.bondageeurope.com/*/BondageClub/*
// @match        https://bondage-europe.com/*/BondageClub/*
// @match        https://www.bondage-europe.com/*/BondageClub/*
// @match        https://bondage-asia.com/club/*
// @match        https://www.bondage-asia.com/club/*
// @run-at       document-start
// @noframes
// @sandbox      raw
// @inject-into  page
// @grant        none
// ==/UserScript==
(() => {
  'use strict';

  // This launcher only deletes known obsolete *launcher caches* in localStorage.
  // It never deletes outfits, plushie settings, character data, repo files or userscripts.
  // Disable any other Subby's Plushies launcher/full userscript in Tampermonkey.
  const VERSION = '2.4.0';
  const TAG = '[Subbycat Cleanup Launcher]';
  const REPO = 'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/';
  const MIRROR = 'https://cdn.jsdelivr.net/gh/marvelous-bc/subby-plushies@main/';
  const MANIFEST_PATH = 'version.json';
  const SCRIPT_PATH = 'SubbysPlushies.user.js';
  const CACHE_KEY = 'SubbysPlushiesLauncher:last-good:script';
  const CACHE_VERSION = 'SubbysPlushiesLauncher:last-good:version';
  const OBSOLETE_KEYS = Object.freeze([
    'SubbysPlushiesLauncher:script',
    'SubbysPlushiesLauncher:v2:script',
    'SubbysPlushiesLauncher:v1:script',
    'SubbysPlushiesLauncher:legacy:script',
    'SubbysPlushiesLauncher:version'
  ]);
  const state = {
    launcherVersion: VERSION, phase: 'init', pluginVersion: null,
    source: null, manifestVersion: null, cleanedKeys: [],
    duplicateDetected: false, error: null, cacheUsed: false, attempts: []
  };
  const log = (...args) => console.info(TAG, ...args);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const errorText = e => String(e?.stack || e?.message || e);
  const setPhase = (phase, detail = '') => {
    state.phase = phase;
    state.attempts.push({ phase, detail: String(detail) });
    if (state.attempts.length > 20) state.attempts.shift();
    log(phase, detail);
  };
  const storage = {
    get(key) { try { return localStorage.getItem(key) || ''; } catch (_) { return ''; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch (e) { console.warn(TAG, 'Cache save failed', e); return false; } },
    del(key) { try { if (localStorage.getItem(key) !== null) { localStorage.removeItem(key); state.cleanedKeys.push(key); } } catch (_) {} }
  };
  const probe = () => {
    let api = null, guard = null, bootstrap = false, marker = null;
    try { api = window.SubbysPlushies || null; } catch (_) {}
    try { guard = window.__SUBBYS_PLUSHIES_ACTIVE__ || null; } catch (_) {}
    try { bootstrap = typeof window.SubbysPlushiesBootstrapDiag === 'function'; } catch (_) {}
    try { marker = document.documentElement?.getAttribute('data-subbys-plushies-runtime') || null; } catch (_) {}
    return { api, guard, bootstrap, marker, started: !!(api || guard || bootstrap || marker) };
  };
  function diagnostic() {
    const current = probe();
    return { ...state, existingPlugin: current.started, ready: current.api?.ready === true,
      currentPluginVersion: current.api?.version || current.guard || null };
  }
  try { window.SubbysPlushiesLauncherDiag = diagnostic; } catch (_) {}
  if (window.__SUBBYS_PLUSHIES_CLEANUP_LAUNCHER__) {
    state.duplicateDetected = true;
    console.warn(TAG, 'Second cleanup launcher instance detected; skipping.');
    return;
  }
  window.__SUBBYS_PLUSHIES_CLEANUP_LAUNCHER__ = true;

  function parseVersion(v) {
    return String(v || '').match(/\d+/g)?.slice(0, 4).map(Number) || [];
  }
  function compareVersions(a, b) {
    const x = parseVersion(a), y = parseVersion(b);
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const diff = (x[i] || 0) - (y[i] || 0);
      if (diff) return diff;
    }
    return 0;
  }
  function validateScript(text) {
    const code = String(text || '');
    if (code.length < 3000 || !code.includes('__SUBBYS_PLUSHIES_ACTIVE__') ||
        !code.includes('SubbysPlushies')) throw Error('Downloaded source is not a complete Essentials script.');
    const version = code.match(/^\s*\/\/\s*@version\s+(\S+)/m)?.[1];
    if (!version || !/^\d+\.\d+(?:\.\d+)?(?:[-\w.]*)?$/.test(version)) {
      throw Error('Essentials script version is missing or malformed.');
    }
    return { code, version };
  }
  async function request(url, timeoutMs = 18000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(url + separator + '_=' + Date.now(), {
        cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      if (!response.ok) throw Error(`HTTP ${response.status} ${url}`);
      return await response.text();
    } finally { clearTimeout(timer); }
  }
  async function getManifest() {
    for (const base of [REPO, MIRROR]) {
      try {
        const result = JSON.parse(await request(base + MANIFEST_PATH, 12000));
        if (!/^\d+\.\d+/.test(result?.version || '')) throw Error('Invalid version.json version');
        return { version: result.version, source: base + MANIFEST_PATH };
      } catch (e) { console.warn(TAG, 'Manifest source unavailable:', base, errorText(e)); }
    }
    return null;
  }
  async function getLatest(manifest) {
    const errors = [];
    for (const base of [REPO, MIRROR]) {
      try {
        const result = validateScript(await request(base + SCRIPT_PATH));
        // Reject mismatched script/manifest pairs instead of silently installing
        // a stale or partially published release. Cache is the safe fallback.
        if (manifest && compareVersions(result.version, manifest.version) !== 0) {
          throw Error(`version.json (${manifest.version}) and script (${result.version}) mismatch; upload both together.`);
        }
        return { ...result, url: base + SCRIPT_PATH, fromCache: false };
      } catch (e) { errors.push(errorText(e)); }
    }
    throw Error('Unable to download matching release: ' + errors.join(' | '));
  }
  function loadCache() {
    const saved = storage.get(CACHE_KEY);
    if (!saved) return null;
    try { return { ...validateScript(saved), url: 'verified offline cache', fromCache: true }; }
    catch (e) { console.warn(TAG, 'Invalid cached release; ignoring', errorText(e)); return null; }
  }
  function cleanupOldCaches() {
    for (const key of OBSOLETE_KEYS) storage.del(key);
    // Deliberately leave unrelated localStorage entries and plugin preferences intact.
    // Don't remove the sole verified offline cache.
    setPhase('cleanup-complete', `${state.cleanedKeys.length} obsolete launcher cache(s) removed`);
  }
  async function waitForDocument() {
    for (let i = 0; i < 400; i++) {
      if (document.documentElement) return;
      await sleep(50);
    }
    throw Error('BC document was not created within 20 seconds.');
  }
  function inject(source) {
    if (probe().started) throw Error('Essentials already started from another userscript.');
    const tagged = source.code + '\n//# sourceURL=SubbysPlushies-' + source.version + '-cleanup-launcher.js';
    const tryScriptTag = () => {
      const node = document.createElement('script');
      node.dataset.subbysPlushiesLoader = '1';
      node.textContent = tagged;
      (document.head || document.documentElement).appendChild(node);
      node.remove();
    };
    const methods = [
      ['script tag', tryScriptTag],
      ['page eval', () => window.eval(tagged)],
      ['Function', () => window.Function(tagged)()]
    ];
    for (const [name, run] of methods) {
      if (probe().started) return name;
      try { run(); } catch (e) { console.warn(TAG, name, 'failed:', errorText(e)); }
      if (probe().started) return name;
    }
    throw Error('No injection method started Essentials. Verify browser CSP and userscript page injection.');
  }
  async function waitForReady() {
    for (let i = 0; i < 600; i++) {
      const result = probe();
      if (result.api?.ready === true) return result.api.version || result.guard || 'unknown';
      if (result.api?.failed === true) throw Error('Essentials reported startup failure.');
      await sleep(200);
    }
    throw Error('Essentials did not become ready within 120 seconds.');
  }
  async function main() {
    setPhase('waiting-for-document');
    await waitForDocument();
    if (probe().started) {
      state.duplicateDetected = true;
      setPhase('existing-addon', 'Already loaded; refusing duplicate injection.');
      cleanupOldCaches();
      return;
    }
    // Give existing @require-based launchers a chance to announce themselves.
    await sleep(1300);
    if (probe().started) {
      state.duplicateDetected = true;
      setPhase('existing-addon', 'Detected another launcher; refusing duplicate injection.');
      cleanupOldCaches();
      return;
    }
    setPhase('checking-release');
    const manifest = await getManifest();
    state.manifestVersion = manifest?.version || null;
    let release;
    try { release = await getLatest(manifest); }
    catch (e) {
      console.warn(TAG, 'Online release unavailable; checking offline cache:', errorText(e));
      release = loadCache();
      if (!release) throw e;
      if (manifest && compareVersions(release.version, manifest.version) < 0) {
        console.warn(TAG, 'Offline cache is older than published manifest:', release.version, manifest.version);
      }
    }
    if (probe().started) { state.duplicateDetected = true; setPhase('existing-addon', 'Addon appeared during download.'); return; }
    state.source = release.url;
    state.cacheUsed = !!release.fromCache;
    setPhase('injecting', release.version);
    state.method = inject(release);
    state.pluginVersion = await waitForReady();
    // Free storage used by earlier launchers first (several copies of a multi-MB script
    // can otherwise fill the browser's localStorage quota).
    cleanupOldCaches();
    if (!release.fromCache) {
      // Save only one last-known-working copy, not 3 duplicated scripts.
      storage.set(CACHE_KEY, release.code);
      storage.set(CACHE_VERSION, release.version);
    }
    setPhase('ready', `Essentials ${state.pluginVersion} via ${release.url}`);
  }
  void main().catch(e => { state.error = errorText(e); setPhase('failed', state.error); console.error(TAG, e); });
})();
