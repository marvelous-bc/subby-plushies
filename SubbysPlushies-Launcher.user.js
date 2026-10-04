// ==UserScript==
// @name         BC - Subby's Plushies Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.3.7.18
// @description  Thin auto-update launcher for Subby's Plushies. Loads the matching full build from GitHub.
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @require      https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js?launcher=2.3.7.18
// @match        https://bondageprojects.elementfx.com/R*
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://bondageeurope.com/*/BondageClub/*
// @match        https://www.bondageeurope.com/*/BondageClub/*
// @match        https://bondage-europe.com/*/BondageClub/*
// @match        https://www.bondage-europe.com/*/BondageClub/*
// @match        https://bondage-asia.com/club/*
// @match        https://www.bondage-asia.com/club/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

(() => {
    "use strict";
    const tag = "[Subby's Plushies Launcher]";
    const expected = "2.3.7.18";
    window.setTimeout(() => {
        const api = window.SubbysPlushies;
        const active = String(api?.version || window.__SUBBYS_PLUSHIES_ACTIVE__ || "");
        if (api?.ready === true) console.log(tag, `Subby's Plushies v${active || expected} is ready.`);
        else if (api?.failed === true) console.error(tag, "Subby's Plushies reported startup failure:", api.startupError || "unknown error");
        else console.log(tag, `Launcher v${expected} loaded. The required full build handles browser/page-context startup.`);
    }, 2500);
})();
