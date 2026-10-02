// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.0.0
// @description  Lightweight Subby's Plushies launcher that checks GitHub for the latest release on every Bondage Club load
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL     https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL   https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
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
    const SCRIPT_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.min.user.js";
    const CACHE_VERSION_KEY = "SubbysPlushiesLauncher:version";
    const CACHE_SCRIPT_KEY = "SubbysPlushiesLauncher:script";
    const TAG = "[Subby's Plushies Launcher]";

    const requestText = url => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`,
            headers: { "Cache-Control": "no-cache" },
            timeout: 12000,
            onload: response => response.status >= 200 && response.status < 300
                ? resolve(String(response.responseText || ""))
                : reject(new Error(`HTTP ${response.status}`)),
            onerror: () => reject(new Error("Network request failed")),
            ontimeout: () => reject(new Error("Network request timed out")),
        });
    });

    function executeLatest(code, version) {
        if (!code || !code.includes("SubbysPlushies")) throw new Error("Downloaded script did not look like Subby's Plushies.");
        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        let firstError = null;
        try {
            unsafeWindow.eval(source);
            return;
        } catch (error) {
            firstError = error;
        }
        try {
            const pageFunction = unsafeWindow.Function;
            pageFunction(source)();
            console.warn(TAG, "Page eval was unavailable; used Function fallback.", firstError);
            return;
        } catch (_) {}
        const script = unsafeWindow.document.createElement("script");
        script.textContent = source;
        (unsafeWindow.document.head || unsafeWindow.document.documentElement).appendChild(script);
        script.remove();
        if (!unsafeWindow.__SUBBYS_PLUSHIES_ACTIVE__) {
            throw firstError || new Error("Browser security settings blocked launcher execution.");
        }
        console.warn(TAG, "Page eval was unavailable; used script injection fallback.", firstError);
    }

    async function load() {
        const cachedVersion = String(GM_getValue(CACHE_VERSION_KEY, "") || "");
        const cachedScript = String(GM_getValue(CACHE_SCRIPT_KEY, "") || "");
        try {
            const manifest = JSON.parse(await requestText(MANIFEST_URL));
            const latestVersion = String(manifest?.version || "").trim();
            if (!latestVersion) throw new Error("version.json did not contain a version.");

            let code = cachedScript;
            if (!code || latestVersion !== cachedVersion) {
                code = await requestText(SCRIPT_URL);
                executeLatest(code, latestVersion);
                GM_setValue(CACHE_SCRIPT_KEY, code);
                GM_setValue(CACHE_VERSION_KEY, latestVersion);
                console.log(TAG, `Downloaded v${latestVersion}.`);
                return;
            }

            try {
                executeLatest(code, latestVersion);
            } catch (cachedError) {
                console.warn(TAG, "Cached release could not start; downloading a fresh copy.", cachedError);
                code = await requestText(SCRIPT_URL);
                executeLatest(code, latestVersion);
                GM_setValue(CACHE_SCRIPT_KEY, code);
                GM_setValue(CACHE_VERSION_KEY, latestVersion);
            }
        } catch (error) {
            if (cachedScript) {
                try {
                    console.warn(TAG, "Could not check GitHub; starting the cached release instead.", error);
                    executeLatest(cachedScript, cachedVersion || "cached");
                    return;
                } catch (cachedError) {
                    console.error(TAG, "GitHub and the cached release both failed.", cachedError);
                    return;
                }
            }
            console.error(TAG, "Could not download Subby's Plushies and no cached release exists.", error);
        }
    }

    void load();
})();
