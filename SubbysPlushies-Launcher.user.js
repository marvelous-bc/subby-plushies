// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.1.1
// @description  Always-load-latest launcher for Subby's Plushies
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://www.bondageeurope.com/*/BondageClub/
// @match        https://www.bondage-europe.com/*/BondageClub/
// @match        https://www.bondage-asia.com/club/*/
// @run-at       document-start
// @sandbox      raw
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    const SCRIPT_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js";
    const MANIFEST_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/version.json";
    const TAG = "[Subby's Plushies Launcher]";

    // New cache namespace on purpose: never reuse the old v2.0 launcher cache.
    const CACHE_PREFIX = "SubbysPlushiesLauncher:v2:";
    const CACHE_VERSION_KEY = `${CACHE_PREFIX}version`;
    const CACHE_SCRIPT_KEY = `${CACHE_PREFIX}script`;
    const CACHE_URL_KEY = `${CACHE_PREFIX}url`;

    function cacheBust(url) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_=${Date.now()}`;
    }

    function storageGet(key, fallback = "") {
        try {
            const value = window.localStorage?.getItem(key);
            return value == null ? fallback : value;
        } catch (_) {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage?.setItem(key, String(value));
            return true;
        } catch (error) {
            console.warn(TAG, `Could not cache ${key}.`, error);
            return false;
        }
    }

    function activePluginVersion() {
        const guard = window.__SUBBYS_PLUSHIES_ACTIVE__;
        if (guard != null && guard !== false) return String(guard);
        const apiVersion = window.SubbysPlushies?.version ?? window.SubbysPlushies?.VERSION;
        return apiVersion == null ? "" : String(apiVersion);
    }

    function pluginStarted() {
        return !!window.__SUBBYS_PLUSHIES_ACTIVE__ || !!window.SubbysPlushies;
    }

    function scriptVersion(code) {
        const text = String(code || "");
        return (
            text.match(/@version\s+([^\s]+)/i)?.[1] ||
            text.match(/const\s+VERSION\s*=\s*["']([^"']+)["']/i)?.[1] ||
            ""
        ).trim();
    }

    function validatePluginCode(code) {
        const text = String(code || "");
        if (text.length < 1000) throw new Error("Downloaded plugin was unexpectedly small.");
        if (!text.includes("__SUBBYS_PLUSHIES_ACTIVE__") || !text.includes("SubbysPlushies")) {
            throw new Error("Downloaded file did not look like Subby's Plushies.");
        }
        const version = scriptVersion(text);
        if (!version) throw new Error("Downloaded plugin did not contain a version.");
        return { code: text, version };
    }

    async function requestText(url, timeoutMs = 15000) {
        if (typeof window.fetch !== "function") throw new Error("fetch is unavailable in this client.");

        const controller = typeof AbortController === "function" ? new AbortController() : null;
        const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;

        try {
            const response = await window.fetch(cacheBust(url), {
                method: "GET",
                cache: "no-store",
                credentials: "omit",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                },
                ...(controller ? { signal: controller.signal } : {}),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} while fetching ${url}`);
            return String(await response.text());
        } catch (error) {
            if (error?.name === "AbortError") throw new Error(`Timed out while fetching ${url}`);
            throw error;
        } finally {
            if (timer != null) window.clearTimeout(timer);
        }
    }

    function executePlugin(code, version) {
        if (pluginStarted()) {
            const active = activePluginVersion() || "unknown";
            throw new Error(
                `Subby's Plushies v${active} was already loaded before the launcher. ` +
                `Disable the separately installed SubbysPlushies.user.js copy and leave only the launcher enabled.`
            );
        }

        const source = `${code}\n//# sourceURL=SubbysPlushies-${version}.user.js`;
        const errors = [];

        try {
            window.eval(source);
            if (pluginStarted()) return "eval";
            errors.push(new Error("eval completed but the plugin did not start."));
        } catch (error) {
            errors.push(error);
        }

        if (!pluginStarted()) {
            try {
                window.Function(source)();
                if (pluginStarted()) return "Function";
                errors.push(new Error("Function completed but the plugin did not start."));
            } catch (error) {
                errors.push(error);
            }
        }

        if (!pluginStarted()) {
            try {
                const script = document.createElement("script");
                script.textContent = source;
                const parent = document.head || document.documentElement;
                if (!parent) throw new Error("No document element available for script injection.");
                parent.appendChild(script);
                script.remove();
                if (pluginStarted()) return "script";
                errors.push(new Error("Script injection completed but the plugin did not start."));
            } catch (error) {
                errors.push(error);
            }
        }

        throw errors[0] || new Error("Plugin execution was blocked.");
    }

    async function readManifestForDiagnostics() {
        try {
            const manifest = JSON.parse(await requestText(MANIFEST_URL, 8000));
            return manifest && typeof manifest === "object" ? manifest : null;
        } catch (error) {
            console.warn(TAG, "version.json could not be read; continuing with the canonical script.", error);
            return null;
        }
    }

    function cacheRelease(code, version) {
        storageSet(CACHE_SCRIPT_KEY, code);
        storageSet(CACHE_VERSION_KEY, version);
        storageSet(CACHE_URL_KEY, SCRIPT_URL);
    }

    async function load() {
        console.log(TAG, "Launcher v2.1.1 starting.");

        if (pluginStarted()) {
            const active = activePluginVersion() || "unknown";
            console.error(
                TAG,
                `Subby's Plushies v${active} is already running before the launcher. ` +
                `Disable the standalone plugin/userscript so the launcher can control the version.`
            );
            return;
        }

        const cachedCode = storageGet(CACHE_SCRIPT_KEY, "");
        const cachedVersion = storageGet(CACHE_VERSION_KEY, "");

        try {
            // The canonical script is ALWAYS authoritative.
            // version.json is never used to choose or redirect the download.
            const rawCode = await requestText(SCRIPT_URL);
            const downloaded = validatePluginCode(rawCode);
            const manifest = await readManifestForDiagnostics();
            const manifestVersion = String(manifest?.version || "").trim();

            if (manifestVersion && manifestVersion !== downloaded.version) {
                console.warn(
                    TAG,
                    `Publishing mismatch: version.json says v${manifestVersion}, ` +
                    `but SubbysPlushies.user.js is v${downloaded.version}. Loading v${downloaded.version}.`
                );
            }

            const method = executePlugin(downloaded.code, downloaded.version);
            cacheRelease(downloaded.code, downloaded.version);

            console.log(
                TAG,
                `Downloaded and started CURRENT GitHub plugin v${downloaded.version} using ${method}.`
            );
            return;
        } catch (onlineError) {
            console.warn(TAG, "Could not start the current GitHub copy.", onlineError);

            if (!cachedCode || pluginStarted()) {
                console.error(TAG, "No usable launcher cache is available.");
                return;
            }

            try {
                const cached = validatePluginCode(cachedCode);
                const method = executePlugin(cached.code, cached.version || cachedVersion || "cached");
                console.warn(
                    TAG,
                    `OFFLINE FALLBACK: started cached v${cached.version || cachedVersion || "unknown"} using ${method}.`
                );
            } catch (cacheError) {
                console.error(TAG, "Both GitHub and the launcher cache failed.", cacheError);
            }
        }
    }

    void load();
})();
