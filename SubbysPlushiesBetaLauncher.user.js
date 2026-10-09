// ==UserScript==
// @name         BC - Subby's Plushies + Wardrobe (Beta Launcher)
// @namespace    subbycat.subbysplushies.beta-live-loader
// @author       Marvelous
// @version      1.0.0-beta.1
// @description  Loads the latest beta Subby's Plushies + Wardrobe from GitHub on every BC page load; no SHA-256 maintenance needed.
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @match        https://bondageprojects.elementfx.com/R*
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://bondageeurope.com/*/BondageClub/
// @match        https://www.bondageeurope.com/*/BondageClub/
// @match        https://bondage-europe.com/*/BondageClub/
// @match        https://www.bondage-europe.com/*/BondageClub/
// @match        https://bondage-asia.com/club/*/
// @match        https://www.bondage-asia.com/club/*/
// @run-at       document-start
// @noframes
// @grant        none
// @sandbox      raw
// @inject-into  page
// ==/UserScript==

(() => {
    "use strict";

    const TAG = "[Subby's Plushies launcher]";
    const SCRIPT_URL = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/beta/SubbysPlushies.user.js";
    const ACTIVE_KEY = "__SUBBYS_PLUSHIES_ACTIVE__";
    const LOADER_KEY = "__SUBBYS_PLUSHIES_BETA_LIVE_LOADER__";
    const EXEC_KEY = "__SUBBYS_PLUSHIES_BETA_LIVE_EXECUTION__";
    const MAX_ATTEMPTS = 2;
    const REQUEST_TIMEOUT_MS = 12000;

    // Keep this separate from the main userscript's installed version. Only one
    // script should be enabled in the userscript manager: this launcher.
    if (window[LOADER_KEY]) return;
    const status = {
        loaderVersion: "1.0.0-beta.1",
        phase: "starting",
        version: null,
        transport: "fetch",
        injection: null,
        attempts: 0,
        url: SCRIPT_URL,
        error: null,
        startedAt: Date.now(),
        completedAt: null,
    };
    window[LOADER_KEY] = status;
    window.SubbysPlushiesLauncherDiag = () => ({ ...status, activeVersion: window[ACTIVE_KEY] || null });

    function indicate(phase) {
        status.phase = phase;
        try {
            if (document.documentElement) {
                document.documentElement.setAttribute("data-subbys-plushies-launcher", phase);
                document.documentElement.setAttribute("data-subbys-plushies-load-source", "loader");
            }
        } catch (_) {}
    }

    function validateCode(code) {
        if (typeof code !== "string" || code.length < 30000) {
            throw new Error("Response is too short to be the complete plushie plugin.");
        }
        if (!/\/\/\s*@name\s+BC - Subby's Plushies(?:\s|$)/m.test(code) ||
            !/function\s+SubbysPlushiesPageMain\s*\(/.test(code)) {
            throw new Error("GitHub returned an unexpected file, not Subby's Plushies.");
        }
        const match = code.match(/\/\/\s*@version\s+([^\s]+)/);
        if (!match) throw new Error("The latest plugin has no userscript version.");
        return match[1];
    }

    async function downloadFresh(attempt) {
        const url = `${SCRIPT_URL}?refresh=${Date.now()}-${attempt}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                method: "GET",
                mode: "cors",
                credentials: "omit",
                cache: "no-store",
                signal: controller.signal,
            });
            if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
            return await response.text();
        } finally {
            clearTimeout(timeout);
        }
    }

    // A short marker lets us detect CSP-blocked inline scripts without accidentally
    // executing the entire plugin twice while attempting alternate injection routes.
    function markedSource(code, marker) {
        const markerLine = `window[${JSON.stringify(EXEC_KEY)}] = ${JSON.stringify(marker)};\n`;
        return `${markerLine}${code}\n//# sourceURL=SubbysPlushies-GitHub-Live.user.js\n`;
    }

    function injectInline(code, marker) {
        const host = document.head || document.documentElement || document.body;
        if (!host) throw new Error("Document is not ready for script injection.");
        const script = document.createElement("script");
        const nonceSource = document.querySelector?.("script[nonce]");
        if (nonceSource?.nonce) script.nonce = nonceSource.nonce;
        script.dataset.subbysPlushiesLoader = "1";
        script.textContent = markedSource(code, marker);
        try { host.appendChild(script); } finally { script.remove(); }
        return window[EXEC_KEY] === marker;
    }

    function injectViaEval(code, marker) {
        // @grant none + @sandbox raw keeps execution in BC's main JavaScript world.
        const indirectEval = window.eval;
        if (typeof indirectEval !== "function") return false;
        indirectEval(markedSource(code, marker));
        return window[EXEC_KEY] === marker;
    }

    async function injectViaBlob(code, marker) {
        const host = document.head || document.documentElement || document.body;
        if (!host || typeof URL.createObjectURL !== "function") return false;
        const script = document.createElement("script");
        script.dataset.subbysPlushiesLoader = "1";
        const blobUrl = URL.createObjectURL(new Blob([markedSource(code, marker)], { type: "text/javascript" }));
        try {
            return await new Promise(resolve => {
                let finished = false;
                const finish = () => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    resolve(window[EXEC_KEY] === marker);
                };
                const timer = setTimeout(finish, 2500);
                script.onload = finish;
                script.onerror = finish;
                script.src = blobUrl;
                try { host.appendChild(script); } catch (_) { finish(); }
            });
        } finally {
            script.remove();
            URL.revokeObjectURL(blobUrl);
        }
    }

    async function executeInPage(code) {
        if (window[ACTIVE_KEY]) {
            throw new Error("Another Subby's Plushies copy is already running. Disable the old direct userscript; keep only the launcher.");
        }
        const marker = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const methods = [
            ["inline", () => injectInline(code, marker)],
            ["eval", () => injectViaEval(code, marker)],
            ["blob", () => injectViaBlob(code, marker)],
        ];
        const failures = [];
        for (const [name, method] of methods) {
            try {
                if (await method()) {
                    status.injection = name;
                    return;
                }
                failures.push(`${name}: blocked or not executed`);
            } catch (e) {
                if (window[EXEC_KEY] === marker) {
                    status.injection = name;
                    return;
                }
                failures.push(`${name}: ${String(e?.message || e)}`);
            }
        }
        throw new Error(`Browser blocked live plugin execution (${failures.join("; ")}).`);
    }

    async function launch() {
        try {
            indicate("downloading");
            let code;
            let lastError;
            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                status.attempts = attempt;
                try {
                    code = await downloadFresh(attempt);
                    status.version = validateCode(code);
                    break;
                } catch (e) {
                    lastError = e;
                    if (attempt < MAX_ATTEMPTS) await new Promise(resolve => setTimeout(resolve, 350));
                }
            }
            if (!code || !status.version) throw lastError || new Error("No valid GitHub script was received.");
            indicate("injecting");
            await executeInPage(code);
            indicate("started");
            status.completedAt = Date.now();
            console.info(TAG, `Loaded latest plugin v${status.version} (${status.injection}); fresh GitHub download on each page load.`);
        } catch (e) {
            status.error = String(e?.message || e);
            indicate("failed");
            status.completedAt = Date.now();
            console.error(TAG, `Could not load the latest plugin: ${status.error}`, e);
            console.error(TAG, "No cached/old plugin was run. Check GitHub access, browser CSP, and whether the old userscript is disabled.");
        }
    }

    void launch();
})();
