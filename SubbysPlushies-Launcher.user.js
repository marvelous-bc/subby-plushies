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
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
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

    // Electron-BC generally executes userscripts directly in the page context.
    // Tampermonkey-style managers may expose the page through unsafeWindow.
    const PAGE = typeof unsafeWindow !== "undefined" && unsafeWindow
        ? unsafeWindow
        : window;

    function cacheBust(url) {
        return `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
    }

    function storageGet(key, fallback = "") {
        try {
            if (typeof GM_getValue === "function") {
                const value = GM_getValue(key, fallback);
                return value == null ? fallback : value;
            }
        } catch (error) {
            console.warn(TAG, "GM_getValue failed; using localStorage fallback.", error);
        }

        try {
            const value = PAGE.localStorage?.getItem(key);
            return value == null ? fallback : value;
        } catch (_) {
            return fallback;
        }
    }

    function storageSet(key, value) {
        try {
            if (typeof GM_setValue === "function") {
                GM_setValue(key, value);
                return true;
            }
        } catch (error) {
            console.warn(TAG, "GM_setValue failed; using localStorage fallback.", error);
        }

        try {
            PAGE.localStorage?.setItem(key, String(value));
            return true;
        } catch (_) {
            return false;
        }
    }

    function requestWithGM(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: cacheBust(url),
                headers: {
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                },
                timeout: 15000,
                onload: response => response.status >= 200 && response.status < 300
                    ? resolve(String(response.responseText || ""))
                    : reject(new Error(`HTTP ${response.status} while fetching ${url}`)),
                onerror: () => reject(new Error(`Network request failed for ${url}`)),
                ontimeout: () => reject(new Error(`Network request timed out for ${url}`)),
            });
        });
    }

    async function requestWithFetch(url) {
        const fetchFn = typeof PAGE.fetch === "function"
            ? PAGE.fetch.bind(PAGE)
            : typeof fetch === "function"
                ? fetch.bind(globalThis)
                : null;

        if (!fetchFn) throw new Error("Neither GM_xmlhttpRequest nor fetch is available.");

        const response = await fetchFn(cacheBust(url), {
            method: "GET",
            cache: "no-store",
            credentials: "omit",
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while fetching ${url}`);
        }

        return String(await response.text());
    }

    function requestText(url) {
        if (typeof GM_xmlhttpRequest === "function") {
            return requestWithGM(url);
        }
        return requestWithFetch(url);
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
        return !!PAGE.__SUBBYS_PLUSHIES_ACTIVE__ || !!PAGE.SubbysPlushies;
    }

    function executeLatest(code, version) {
        if (!code || !code.includes("SubbysPlushies")) {
            throw new Error("Downloaded script did not look like Subby's Plushies.");
        }

        if (pluginStarted()) return "already-loaded";

        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        const failures = [];

        // Best path for Electron-BC and raw/page-context userscript execution.
        try {
            if (typeof PAGE.eval !== "function") throw new Error("Page eval is unavailable.");
            PAGE.eval(source);
            if (pluginStarted()) return "eval";
            failures.push(new Error("Page eval completed but the addon did not start."));
        } catch (error) {
            failures.push(error);
        }

        // Works in page contexts where eval is restricted but Function is available.
        if (!pluginStarted()) {
            try {
                const PageFunction = PAGE.Function;
                if (typeof PageFunction !== "function") throw new Error("Page Function constructor is unavailable.");
                PageFunction(source)();
                if (pluginStarted()) {
                    console.warn(TAG, "Page eval was unavailable; used Function fallback.", failures[0]);
                    return "Function";
                }
                failures.push(new Error("Function fallback completed but the addon did not start."));
            } catch (error) {
                failures.push(error);
            }
        }

        // Final fallback for userscript managers that isolate the launcher itself.
        if (!pluginStarted()) {
            try {
                const doc = PAGE.document || document;
                const script = doc.createElement("script");
                script.textContent = source;
                const parent = doc.head || doc.documentElement;
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
        const cachedUrl = String(storageGet(CACHE_URL_KEY, "") || "");

        try {
            const manifest = JSON.parse(await requestText(MANIFEST_URL));
            const latestVersion = String(manifest?.version || "").trim();
            if (!latestVersion) throw new Error("version.json did not contain a version.");

            const scriptUrl = manifestScriptUrl(manifest);
            const cacheMatchesRelease = !!cachedScript
                && latestVersion === cachedVersion
                && (!cachedUrl || cachedUrl === scriptUrl);

            if (!cacheMatchesRelease) {
                await downloadAndStart(latestVersion, scriptUrl);
                console.log(TAG, `Downloaded and started v${latestVersion} from ${scriptUrl}.`);
                return;
            }

            try {
                executeLatest(cachedScript, latestVersion);
                console.log(TAG, `Started cached v${latestVersion}.`);
            } catch (cachedError) {
                console.warn(TAG, "Cached release could not start; downloading a fresh copy.", cachedError);
                await downloadAndStart(latestVersion, scriptUrl);
                console.log(TAG, `Fresh v${latestVersion} started successfully.`);
            }
        } catch (error) {
            if (cachedScript && !pluginStarted()) {
                try {
                    console.warn(TAG, "Could not check GitHub; starting the cached release instead.", error);
                    executeLatest(cachedScript, cachedVersion || "cached");
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
