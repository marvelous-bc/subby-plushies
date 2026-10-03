// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.3.0
// @description  Lightweight Subby's Plushies loader using the same dynamic-import approach as FUSAM
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        https://bondageeurope.com/*
// @match        https://www.bondageeurope.com/*
// @match        https://bondage-asia.com/*
// @match        https://www.bondage-asia.com/*
// @match        http://localhost:*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    "use strict";

    const TAG = "[Subby's Plushies Launcher]";
    const LAUNCHER_VERSION = "2.3.0";

    // FUSAM's loader succeeds on Opera by staying in the page world with
    // @grant none and loading its current code with dynamic import().
    // Do the same here. jsDelivr serves GitHub files with JavaScript/CORS
    // headers suitable for module import.
    const bucket = (Date.now() / 10000).toFixed(0);
    const scriptUrl =
        `https://cdn.jsdelivr.net/gh/marvelous-bc/subby-plushies@main/SubbysPlushies.user.js?v=${bucket}`;

    if (window.SubbysPlushies || window.__SUBBYS_PLUSHIES_ACTIVE__) {
        console.log(
            TAG,
            "Subby's Plushies already exists on this page; launcher will not load a second copy."
        );
        return;
    }

    console.log(
        TAG,
        `Launcher v${LAUNCHER_VERSION} loading the current plugin with dynamic import().`
    );

    import(scriptUrl)
        .then(() => {
            console.log(
                TAG,
                `Imported Subby's Plushies from ${scriptUrl}`
            );
        })
        .catch(error => {
            console.error(
                TAG,
                "Could not import Subby's Plushies. " +
                "This loader intentionally uses the same @grant none + dynamic import model as FUSAM.",
                error
            );
        });
})();
