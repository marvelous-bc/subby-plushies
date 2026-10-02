// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.0.0
// @description  Lightweight Subby's Plushies launcher that checks GitHub for the latest v2 release on every Bondage Club load
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://www.bondageeurope.com/*/BondageClub/
// @match        https://www.bondage-europe.com/*/BondageClub/
// @match        https://www.bondage-asia.com/club/*/
// @run-at       document-start
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

    const requestText = url => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`,
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            timeout: 15000,
            onload: response => response.status >= 200 && response.status < 300
                ? resolve(String(response.responseText || ""))
                : reject(new Error(`HTTP ${response.status} while fetching ${url}`)),
            onerror: () => reject(new Error(`Network request failed for ${url}`)),
            ontimeout: () => reject(new Error(`Network request timed out for ${url}`)),
        });
    });

    function manifestScriptUrl(manifest) {
        const candidate = String(manifest?.downloadUrl || "").trim();
        if (!candidate) return DEFAULT_SCRIPT_URL;
        if (!candidate.startsWith(TRUSTED_RAW_PREFIX)) {
            throw new Error("version.json downloadUrl was outside the trusted Subby's Plushies GitHub repository.");
        }
        return candidate;
    }

    function pluginStarted() {
        return !!unsafeWindow.__SUBBYS_PLUSHIES_ACTIVE__ || !!unsafeWindow.SubbysPlushies;
    }

    function executeLatest(code, version) {
        if (!code || !code.includes("SubbysPlushies")) {
            throw new Error("Downloaded script did not look like Subby's Plushies.");
        }

        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        const failures = [];

        try {
            unsafeWindow.eval(source);
            if (pluginStarted()) return "eval";
            failures.push(new Error("Page eval completed but the addon did not start."));
        } catch (error) {
            failures.push(error);
        }

        if (!pluginStarted()) {
            try {
                const PageFunction = unsafeWindow.Function;
                if (typeof PageFunction !== "function") throw new Error("unsafeWindow.Function is unavailable.");
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

        if (!pluginStarted()) {
            try {
                const doc = unsafeWindow.document;
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

        throw failures[0] || new Error("Browser security settings blocked launcher execution.");
    }

    function cacheRelease(code, version, scriptUrl) {
        GM_setValue(CACHE_SCRIPT_KEY, code);
        GM_setValue(CACHE_VERSION_KEY, version);
        GM_setValue(CACHE_URL_KEY, scriptUrl);
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

        const cachedVersion = String(GM_getValue(CACHE_VERSION_KEY, "") || "");
        const cachedScript = String(GM_getValue(CACHE_SCRIPT_KEY, "") || "");
        const cachedUrl = String(GM_getValue(CACHE_URL_KEY, "") || "");

        try {
            const manifestText = await requestText(MANIFEST_URL);
            const manifest = JSON.parse(manifestText);
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
// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.0.0
// @description  Lightweight Subby's Plushies launcher that checks GitHub for the latest v2 release on every Bondage Club load
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://www.bondageeurope.com/*/BondageClub/
// @match        https://www.bondage-europe.com/*/BondageClub/
// @match        https://www.bondage-asia.com/club/*/
// @run-at       document-start
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

    const requestText = url => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`,
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            timeout: 15000,
            onload: response => response.status >= 200 && response.status < 300
                ? resolve(String(response.responseText || ""))
                : reject(new Error(`HTTP ${response.status} while fetching ${url}`)),
            onerror: () => reject(new Error(`Network request failed for ${url}`)),
            ontimeout: () => reject(new Error(`Network request timed out for ${url}`)),
        });
    });

    function manifestScriptUrl(manifest) {
        const candidate = String(manifest?.downloadUrl || "").trim();
        if (!candidate) return DEFAULT_SCRIPT_URL;
        if (!candidate.startsWith(TRUSTED_RAW_PREFIX)) {
            throw new Error("version.json downloadUrl was outside the trusted Subby's Plushies GitHub repository.");
        }
        return candidate;
    }

    function pluginStarted() {
        return !!unsafeWindow.__SUBBYS_PLUSHIES_ACTIVE__ || !!unsafeWindow.SubbysPlushies;
    }

    function executeLatest(code, version) {
        if (!code || !code.includes("SubbysPlushies")) {
            throw new Error("Downloaded script did not look like Subby's Plushies.");
        }

        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        const failures = [];

        try {
            unsafeWindow.eval(source);
            if (pluginStarted()) return "eval";
            failures.push(new Error("Page eval completed but the addon did not start."));
        } catch (error) {
            failures.push(error);
        }

        if (!pluginStarted()) {
            try {
                const PageFunction = unsafeWindow.Function;
                if (typeof PageFunction !== "function") throw new Error("unsafeWindow.Function is unavailable.");
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

        if (!pluginStarted()) {
            try {
                const doc = unsafeWindow.document;
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

        throw failures[0] || new Error("Browser security settings blocked launcher execution.");
    }

    function cacheRelease(code, version, scriptUrl) {
        GM_setValue(CACHE_SCRIPT_KEY, code);
        GM_setValue(CACHE_VERSION_KEY, version);
        GM_setValue(CACHE_URL_KEY, scriptUrl);
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

        const cachedVersion = String(GM_getValue(CACHE_VERSION_KEY, "") || "");
        const cachedScript = String(GM_getValue(CACHE_SCRIPT_KEY, "") || "");
        const cachedUrl = String(GM_getValue(CACHE_URL_KEY, "") || "");

        try {
            const manifestText = await requestText(MANIFEST_URL);
            const manifest = JSON.parse(manifestText);
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
