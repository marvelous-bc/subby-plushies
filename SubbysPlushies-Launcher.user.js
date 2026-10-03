// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.0.0
// @description  Universal Subby's Plushies v2 launcher for Electron-BC and browser userscript managers
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

    const MANIFEST_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/version.json";
    const DEFAULT_SCRIPT_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js";
    const TRUSTED_RAW_PREFIX = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/";

    const CACHE_VERSION_KEY = "SubbysPlushiesLauncher:version";
    const CACHE_SCRIPT_KEY = "SubbysPlushiesLauncher:script";
    const CACHE_URL_KEY = "SubbysPlushiesLauncher:url";
    const TAG = "[Subby's Plushies Launcher]";

    function cacheBust(url) {
        return `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
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
            console.warn(TAG, `Could not cache ${key}; launcher will still work online.`, error);
            return false;
        }
    }

    async function requestText(url, timeoutMs = 15000) {
        if (typeof window.fetch !== "function") {
            throw new Error("fetch is unavailable in this Bondage Club client.");
        }

        const controller = typeof AbortController === "function" ? new AbortController() : null;
        const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;

        try {
            const response = await window.fetch(cacheBust(url), {
                method: "GET",
                cache: "no-store",
                credentials: "omit",
                ...(controller ? { signal: controller.signal } : {}),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} while fetching ${url}`);
            }

            return String(await response.text());
        } catch (error) {
            if (error?.name === "AbortError") {
                throw new Error(`Network request timed out for ${url}`);
            }
            throw error;
        } finally {
            if (timer != null) window.clearTimeout(timer);
        }
    }

    function manifestScriptUrl(manifest) {
        const candidate = String(manifest?.downloadUrl || "").trim();
        if (!candidate) return DEFAULT_SCRIPT_URL;
        if (!candidate.startsWith(TRUSTED_RAW_PREFIX)) {
            throw new Error("version.json downloadUrl was outside the trusted Subby's Plushies GitHub repository.");
        }
        return candidate;
    }

    function pluginStarted() {
        return !!window.__SUBBYS_PLUSHIES_ACTIVE__ || !!window.SubbysPlushies;
    }

    function executeLatest(code, version) {
        if (!code || !code.includes("SubbysPlushies")) {
            throw new Error("Downloaded script did not look like Subby's Plushies.");
        }

        if (pluginStarted()) return "already-loaded";

        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        const failures = [];

        try {
            window.eval(source);
            if (pluginStarted()) return "eval";
            failures.push(new Error("Page eval completed but the addon did not start."));
        } catch (error) {
            failures.push(error);
        }

        if (!pluginStarted()) {
            try {
                window.Function(source)();
                if (pluginStarted()) {
                    console.warn(TAG, "Page eval was unavailable; used Function fallback.", failures[0]);
                    return "Function";
                }
                failures.push(new Error("Function fallback completed but the addon did not start."));
            } catch (error) {
                failures.push(error);
            }
        }

        if (!pluginStarted()) {
            try {
                const script = document.createElement("script");
                script.textContent = source;
                const parent = document.head || document.documentElement;
                if (!parent) throw new Error("No document element was available for script injection.");
                parent.appendChild(script);
                script.remove();
                if (pluginStarted()) {
                    console.warn(TAG, "Eval fallbacks were unavailable; used script injection.", failures[0]);
                    return "script";
                }
                failures.push(new Error("Script injection completed but the addon did not start."));
            } catch (error) {
                failures.push(error);
            }
        }

        throw failures[0] || new Error("Launcher execution was blocked by the userscript environment.");
    }

    function cacheRelease(code, version, scriptUrl) {
        storageSet(CACHE_SCRIPT_KEY, code);
        storageSet(CACHE_VERSION_KEY, version);
        storageSet(CACHE_URL_KEY, scriptUrl);
    }

    async function downloadAndStart(version, scriptUrl) {
        const code = await requestText(scriptUrl);
        executeLatest(code, version);
        cacheRelease(code, version, scriptUrl);
        return code;
    }

    async function load() {
        if (pluginStarted()) {
            console.warn(TAG, "Subby's Plushies is already loaded; launcher did not start a second copy.");
            return;
        }

        const cachedVersion = String(storageGet(CACHE_VERSION_KEY, "") || "");
        const cachedScript = String(storageGet(CACHE_SCRIPT_KEY, "") || "");

        try {
            const manifest = JSON.parse(await requestText(MANIFEST_URL));
            const latestVersion = String(manifest?.version || "").trim();
            if (!latestVersion) throw new Error("version.json did not contain a version.");

            const scriptUrl = manifestScriptUrl(manifest);

            // Always fetch the current GitHub file while online. This means a corrected
            // v2.0.0 build is picked up even if the version number itself did not change.
            await downloadAndStart(latestVersion, scriptUrl);
            console.log(TAG, `Downloaded and started v${latestVersion} from ${scriptUrl}.`);
        } catch (error) {
            if (cachedScript && !pluginStarted()) {
                try {
                    console.warn(TAG, "Could not load the current GitHub release; starting the cached release instead.", error);
                    executeLatest(cachedScript, cachedVersion || "cached");
                    console.log(TAG, `Started cached ${cachedVersion ? `v${cachedVersion}` : "release"}.`);
                    return;
                } catch (cachedError) {
                    console.error(TAG, "GitHub and the cached release both failed.", cachedError);
                    return;
                }
            }

            console.error(TAG, "Could not download Subby's Plushies and no working cached release exists.", error);
        }
    }

    void load();
})();
