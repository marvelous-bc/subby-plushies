// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.3.7.9
// @description  Hybrid Subby's Plushies launcher: Opera/browser-safe @require + Electron live loader
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @require      https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js?launcher=2.3.7.9
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://bondageprojects.elementfx.com/R*
// @match        https://www.bondageeurope.com/*/BondageClub/*
// @match        https://bondageeurope.com/*/BondageClub/*
// @match        https://www.bondage-europe.com/*/BondageClub/*
// @match        https://bondage-europe.com/*/BondageClub/*
// @match        https://www.bondage-asia.com/club/*
// @match        https://bondage-asia.com/club/*
// @run-at       document-start
// @sandbox      raw
// @inject-into  page
// @noframes
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    const TAG = "[Subby's Plushies Launcher]";
    const LAUNCHER_VERSION = "2.3.7.9";

    const PRIMARY_SCRIPT_URL =
        "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js";
    const MIRROR_SCRIPT_URL =
        "https://cdn.jsdelivr.net/gh/marvelous-bc/subby-plushies@main/SubbysPlushies.user.js";

    // New verified cache. This is written ONLY after the addon reports ready=true.
    const GOOD_SCRIPT_KEY = "SubbysPlushiesLauncher:last-good:script";
    const GOOD_VERSION_KEY = "SubbysPlushiesLauncher:last-good:version";
    const GOOD_URL_KEY = "SubbysPlushiesLauncher:last-good:url";

    // Existing launcher caches are intentionally still readable as fallbacks.
    const LEGACY_SCRIPT_KEY = "SubbysPlushiesLauncher:script";
    const LEGACY_VERSION_KEY = "SubbysPlushiesLauncher:version";
    const OLD_V2_SCRIPT_KEY = "SubbysPlushiesLauncher:v2:script";
    const OLD_V2_VERSION_KEY = "SubbysPlushiesLauncher:v2:version";

    const FORCE_FALLBACK_SESSION_KEY = "SubbysPlushiesLauncher:force-fallback-once";
    const STARTUP_TIMEOUT_MS = 135000;

    const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

    function runningUnderUserscriptManager() {
        try {
            return typeof GM_info === "object" && !!GM_info;
        } catch (_) {
            return false;
        }
    }

    function userscriptManagerName() {
        try {
            return String(GM_info?.scriptHandler || GM_info?.handler || "userscript manager");
        } catch (_) {
            return "userscript manager";
        }
    }

    function cacheBust(url) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_=${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
            console.warn(TAG, `Could not write launcher cache key ${key}.`, error);
            return false;
        }
    }

    function sessionGet(key, fallback = "") {
        try {
            const value = window.sessionStorage?.getItem(key);
            return value == null ? fallback : value;
        } catch (_) {
            return fallback;
        }
    }

    function sessionSet(key, value) {
        try {
            window.sessionStorage?.setItem(key, String(value));
            return true;
        } catch (_) {
            return false;
        }
    }

    function sessionRemove(key) {
        try {
            window.sessionStorage?.removeItem(key);
        } catch (_) {}
    }

    function pluginApi() {
        return window.SubbysPlushies && typeof window.SubbysPlushies === "object"
            ? window.SubbysPlushies
            : null;
    }

    function pluginGuardVersion() {
        const value = window.__SUBBYS_PLUSHIES_ACTIVE__;
        return value == null || value === false ? "" : String(value);
    }

    function pluginFootprintExists() {
        return !!pluginApi() || !!pluginGuardVersion();
    }

    function activePluginVersion() {
        const api = pluginApi();
        return String(api?.version || api?.VERSION || pluginGuardVersion() || "").trim();
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
        if (text.length < 1000) {
            throw new Error("Downloaded/cached plugin was empty or unexpectedly small.");
        }
        if (!text.includes("SubbysPlushies") || !text.includes("__SUBBYS_PLUSHIES_ACTIVE__")) {
            throw new Error("Downloaded/cached file did not look like Subby's Plushies.");
        }

        const version = scriptVersion(text);
        if (!version) throw new Error("Plugin file did not contain a readable version.");

        return { code: text, version };
    }

    async function requestText(url, timeoutMs = 15000) {
        if (typeof window.fetch !== "function") {
            throw new Error("fetch is unavailable in this Bondage Club client.");
        }

        const controller = typeof AbortController === "function" ? new AbortController() : null;
        const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;

        try {
            // Deliberately no custom request headers here. Custom Cache-Control/Pragma
            // headers can trigger a CORS preflight in some Electron/browser builds.
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

    async function downloadCurrentPlugin() {
        const failures = [];

        for (const url of [PRIMARY_SCRIPT_URL, MIRROR_SCRIPT_URL]) {
            try {
                const downloaded = validatePluginCode(await requestText(url));
                return { ...downloaded, url };
            } catch (error) {
                failures.push(`${url}: ${String(error?.message || error)}`);
                console.warn(TAG, `Download source failed: ${url}`, error);
            }
        }

        throw new Error(`All online sources failed. ${failures.join(" | ")}`);
    }

    function cachedCandidates() {
        const raw = [
            {
                label: "verified last-known-good cache",
                code: storageGet(GOOD_SCRIPT_KEY, ""),
                version: storageGet(GOOD_VERSION_KEY, ""),
            },
            {
                label: "legacy launcher cache",
                code: storageGet(LEGACY_SCRIPT_KEY, ""),
                version: storageGet(LEGACY_VERSION_KEY, ""),
            },
            {
                label: "v2.1 launcher cache",
                code: storageGet(OLD_V2_SCRIPT_KEY, ""),
                version: storageGet(OLD_V2_VERSION_KEY, ""),
            },
        ];

        const seen = new Set();
        const result = [];

        for (const candidate of raw) {
            if (!candidate.code || seen.has(candidate.code)) continue;
            try {
                const validated = validatePluginCode(candidate.code);
                seen.add(candidate.code);
                result.push({
                    label: candidate.label,
                    code: validated.code,
                    version: validated.version || candidate.version || "cached",
                });
            } catch (error) {
                console.warn(TAG, `Ignoring invalid ${candidate.label}.`, error);
            }
        }

        return result;
    }

    function saveVerifiedRelease(code, version, url) {
        // This function is called ONLY after waitForPluginReady() confirms ready=true.
        storageSet(GOOD_SCRIPT_KEY, code);
        storageSet(GOOD_VERSION_KEY, version);
        storageSet(GOOD_URL_KEY, url || PRIMARY_SCRIPT_URL);

        // Keep the original cache keys current too, so older launcher copies still
        // have a usable fallback if someone temporarily rolls back the launcher.
        storageSet(LEGACY_SCRIPT_KEY, code);
        storageSet(LEGACY_VERSION_KEY, version);
        storageSet(OLD_V2_SCRIPT_KEY, code);
        storageSet(OLD_V2_VERSION_KEY, version);
    }

    function executeSource(code, version) {
        if (pluginFootprintExists()) {
            throw new Error(
                `A Subby's Plushies instance (v${activePluginVersion() || "unknown"}) already exists before execution.`
            );
        }

        const source = `${code}\n//# sourceURL=SubbysPlushies-${String(version || "latest")}.user.js`;
        const failures = [];

        try {
            window.eval(source);
            if (pluginFootprintExists()) return "eval";
            failures.push(new Error("eval returned without creating a plugin instance."));
        } catch (error) {
            failures.push(error);
            if (pluginFootprintExists()) return "eval-partial";
        }

        if (!pluginFootprintExists()) {
            try {
                window.Function(source)();
                if (pluginFootprintExists()) return "Function";
                failures.push(new Error("Function returned without creating a plugin instance."));
            } catch (error) {
                failures.push(error);
                if (pluginFootprintExists()) return "Function-partial";
            }
        }

        if (!pluginFootprintExists()) {
            try {
                const script = document.createElement("script");
                script.textContent = source;
                const parent = document.head || document.documentElement;
                if (!parent) throw new Error("No document element was available for script injection.");
                parent.appendChild(script);
                script.remove();

                if (pluginFootprintExists()) return "script";
                failures.push(new Error("Script injection returned without creating a plugin instance."));
            } catch (error) {
                failures.push(error);
                if (pluginFootprintExists()) return "script-partial";
            }
        }

        throw failures[0] || new Error("Launcher could not execute the plugin.");
    }

    async function waitForPluginReady(expectedVersion, timeoutMs = STARTUP_TIMEOUT_MS) {
        const startedAt = Date.now();
        let sawFootprint = pluginFootprintExists();

        while (Date.now() - startedAt < timeoutMs) {
            const api = pluginApi();
            const guardVersion = pluginGuardVersion();
            if (api || guardVersion) sawFootprint = true;

            if (api?.ready === true) {
                return {
                    version: String(api.version || guardVersion || expectedVersion || "unknown"),
                    legacyReady: false,
                };
            }

            if (api?.failed === true) {
                const startupError = api.startupError || "";
                throw new Error(
                    `Subby's Plushies reported startup failure${startupError ? `: ${startupError}` : "."}`
                );
            }

            // Older cached builds may not expose ready/failed. In that case require
            // the plugin footprint to stay alive for several seconds before accepting it.
            if (
                api &&
                typeof api.ready !== "boolean" &&
                typeof api.failed !== "boolean" &&
                Date.now() - startedAt >= 5000
            ) {
                return {
                    version: String(api.version || guardVersion || expectedVersion || "cached"),
                    legacyReady: true,
                };
            }

            if (
                !api &&
                guardVersion &&
                Date.now() - startedAt >= 5000
            ) {
                return {
                    version: String(guardVersion || expectedVersion || "cached"),
                    legacyReady: true,
                };
            }

            if (sawFootprint && !api && !guardVersion) {
                throw new Error("Subby's Plushies disappeared during startup.");
            }

            await sleep(100);
        }

        throw new Error(
            `Timed out after ${Math.round(timeoutMs / 1000)}s waiting for Subby's Plushies to become ready.`
        );
    }

    async function startCode(code, version, sourceLabel) {
        const method = executeSource(code, version);
        console.log(TAG, `Started executing ${sourceLabel} v${version} using ${method}; waiting for READY...`);

        const ready = await waitForPluginReady(version);
        console.log(
            TAG,
            `${sourceLabel} v${ready.version} is READY${ready.legacyReady ? " (legacy readiness check)" : ""}.`
        );
        return { method, ...ready };
    }

    function consumeForcedFallback() {
        const value = sessionGet(FORCE_FALLBACK_SESSION_KEY, "");
        if (!value) return null;
        sessionRemove(FORCE_FALLBACK_SESSION_KEY);

        try {
            return JSON.parse(value);
        } catch (_) {
            return { reason: value };
        }
    }

    function scheduleCleanFallbackReload(reason) {
        const candidates = cachedCandidates();
        if (!candidates.length) return false;

        const payload = JSON.stringify({
            at: Date.now(),
            reason: String(reason?.message || reason || "online startup failed"),
        });

        if (!sessionSet(FORCE_FALLBACK_SESSION_KEY, payload)) return false;

        console.warn(
            TAG,
            "The newest plugin partially started but did not become READY. Reloading once to start the cached last-known-good build on a clean page.",
            reason
        );

        window.setTimeout(() => window.location.reload(), 50);
        return true;
    }

    async function startFallback(reason = "online release unavailable") {
        const candidates = cachedCandidates();

        if (!candidates.length) {
            console.error(
                TAG,
                "No cached fallback exists. The launcher needs one successful online startup before it can create a verified fallback.",
                reason
            );
            return false;
        }

        const candidate = candidates[0];

        if (pluginFootprintExists()) {
            console.error(
                TAG,
                "A failed/partial plugin instance is still present, so fallback cannot safely start on this page.",
                reason
            );
            return false;
        }

        try {
            const result = await startCode(candidate.code, candidate.version, candidate.label);
            console.warn(
                TAG,
                `FALLBACK ACTIVE: ${candidate.label} v${result.version} started because the current online release was unavailable or failed.`
            );
            return true;
        } catch (error) {
            console.error(TAG, `${candidate.label} also failed to start.`, error);
            return false;
        }
    }

    async function load() {
        console.log(TAG, `Launcher v${LAUNCHER_VERSION} starting.`);

        const browserManager = runningUnderUserscriptManager();

        // In Opera/Chromium userscript managers, @require executes the plugin before
        // this launcher body. That path intentionally avoids runtime eval/Function.
        if (browserManager && pluginFootprintExists()) {
            const manager = userscriptManagerName();
            console.log(
                TAG,
                `Browser bootstrap active under ${manager}. ` +
                `Subby's Plushies v${activePluginVersion() || "loading"} was supplied by @require.`
            );

            try {
                const requiredReady = await waitForPluginReady(
                    activePluginVersion() || "required",
                    STARTUP_TIMEOUT_MS
                );
                console.log(
                    TAG,
                    `SUCCESS: Opera/browser @require build v${requiredReady.version} is READY.`
                );
            } catch (error) {
                console.error(
                    TAG,
                    "The browser @require copy was loaded but did not become READY.",
                    error
                );
            }
            return;
        }

        // If a browser userscript manager reached this point, @require did not create
        // the plugin at all. Do not attempt eval in the userscript sandbox; emit a
        // precise diagnostic instead. The Electron/direct path below remains unchanged.
        if (browserManager && !pluginFootprintExists()) {
            console.error(
                TAG,
                `The ${userscriptManagerName()} @require bootstrap did not create Subby's Plushies. ` +
                "Check that the userscript manager is allowed to run on this BC domain and that " +
                "the launcher was updated from GitHub. Runtime eval is intentionally disabled " +
                "for the Opera/browser path."
            );
            return;
        }

        const forcedFallback = consumeForcedFallback();
        if (forcedFallback) {
            console.warn(
                TAG,
                "Clean-page fallback requested after the previous online startup failed.",
                forcedFallback
            );
            await startFallback(forcedFallback.reason || "previous online startup failed");
            return;
        }

        if (pluginFootprintExists()) {
            console.error(
                TAG,
                `Subby's Plushies v${activePluginVersion() || "unknown"} already exists before the launcher can start it. ` +
                "Disable any separately installed standalone SubbysPlushies.user.js copy and leave only the launcher enabled."
            );
            return;
        }

        let downloaded;

        try {
            downloaded = await downloadCurrentPlugin();
            console.log(
                TAG,
                `Downloaded current plugin v${downloaded.version} from ${downloaded.url}.`
            );
        } catch (downloadError) {
            console.warn(TAG, "Could not download the current release; trying cached fallback.", downloadError);
            await startFallback(downloadError);
            return;
        }

        try {
            const result = await startCode(
                downloaded.code,
                downloaded.version,
                "current online release"
            );

            // Critical: cache only after READY has been confirmed.
            saveVerifiedRelease(downloaded.code, result.version, downloaded.url);

            console.log(
                TAG,
                `SUCCESS: current online release v${result.version} is READY and is now the verified fallback cache.`
            );
        } catch (startupError) {
            console.error(TAG, "The downloaded release did not finish starting.", startupError);

            if (pluginFootprintExists()) {
                // Running another build on top of partially installed hooks/assets is unsafe.
                // Reload a clean page once, then use the cached fallback.
                if (scheduleCleanFallbackReload(startupError)) return;

                console.error(
                    TAG,
                    "No cached fallback is available for a clean reload. Fix the current plugin build or restore a known-good cache."
                );
                return;
            }

            // No partial plugin state exists, so a same-page fallback is safe.
            await startFallback(startupError);
        }
    }

    void load();
})();
