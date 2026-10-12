// ==UserScript==
// @name         Subby's Plushies & Essentials Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.3.8.0
// @description  Browser + Electron-BC launcher with startup-aware EBC fallback, live download and verified offline cache
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @require      https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js?launcher=2.3.8.0
// @match        https://bondageprojects.elementfx.com/R*
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://bondageeurope.com/*/BondageClub/*
// @match        https://www.bondageeurope.com/*/BondageClub/*
// @match        https://bondage-europe.com/*/BondageClub/*
// @match        https://www.bondage-europe.com/*/BondageClub/*
// @match        https://bondage-asia.com/club/*
// @match        https://www.bondage-asia.com/club/*
// @run-at       document-start
// @sandbox      raw
// @inject-into  page
// @noframes
// @grant        none
// ==/UserScript==
(() => {
    'use strict';
    const TAG = '[Subbycat Launcher]';
    const VERSION = '2.3.8.0';
    const PRIMARY = 'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js';
    const MIRROR = 'https://cdn.jsdelivr.net/gh/marvelous-bc/subby-plushies@main/SubbysPlushies.user.js';
    const READY_WAIT_MS = 135000;
    const REQUIRED_PROBE_MS = 1600;
    const VERIFIED_CACHE = 'SubbysPlushiesLauncher:last-good:script';
    const VERIFIED_VERSION = 'SubbysPlushiesLauncher:last-good:version';
    const LEGACY_CACHE = 'SubbysPlushiesLauncher:script';
    const LEGACY_OLD_CACHE = 'SubbysPlushiesLauncher:v2:script';
    const STATE = { launcher: VERSION, phase: 'start', method: null, source: null, manager: null,
        requiredSeen: false, pluginVersion: null, lastError: null, attempts: [], startedAt: Date.now() };
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const captureError = error => String(error?.stack || error?.message || error);
    const trace = (phase, details) => {
        STATE.phase = phase;
        if (details) STATE.attempts.push({phase, details: String(details), at: Date.now()});
        if (STATE.attempts.length > 32) STATE.attempts.shift();
        console.info(TAG, phase, details || '');
    };
    const failure = (phase, error) => {
        STATE.phase = phase;
        STATE.lastError = captureError(error);
        console.error(TAG, phase, error);
    };
    const storageGet = key => {try {return localStorage.getItem(key) || '';} catch (_) {return '';} };
    const storageSet = (key, value) => {try {localStorage.setItem(key, value);return true;} catch (_) {return false;} };
    function managerName() {
        try {return String(GM_info?.scriptHandler || GM_info?.handler || '');} catch (_) {return '';}
    }
    function probe() {
        let api = null, guard = null, bootstrap = false, attr = null;
        try {api = window.SubbysPlushies || null;} catch (_) {}
        try {guard = window.__SUBBYS_PLUSHIES_ACTIVE__ || null;} catch (_) {}
        try {bootstrap = typeof window.SubbysPlushiesBootstrapDiag === 'function';} catch (_) {}
        try {attr = document.documentElement?.getAttribute('data-subbys-plushies-runtime') || null;} catch (_) {}
        return {api,guard,bootstrap,attr,started:!!(api||guard||bootstrap||attr)};
    }
    function publicState() {
        const p=probe();
        return { ...STATE, active:!!p.api, ready:p.api?.ready === true,
            failed:p.api?.failed === true, guard:p.guard, bootstrap:p.bootstrap,
            runtime:p.attr, url:PRIMARY };
    }
    try {window.SubbysPlushiesLauncherDiag=publicState;} catch (_) {}
    function validSource(source) {
        const code=String(source||'');
        if(code.length < 1000 || !code.includes('__SUBBYS_PLUSHIES_ACTIVE__') || !code.includes('SubbysPlushies')) {
            throw Error('Download was not a valid Subbycat plugin userscript.');
        }
        const version=code.match(/@version\s+([^\s]+)/i)?.[1] || code.match(/const\s+VERSION\s*=\s*["']([^"']+)/)?.[1];
        if(!version)throw Error('Plugin version missing from source.');
        return {code,version};
    }
    async function requestText(url) {
        if(typeof fetch !== 'function') throw Error('fetch is unavailable in this client.');
        const controller=typeof AbortController === 'function' ? new AbortController() : null;
        const timeout=controller ? setTimeout(()=>controller.abort(),16000) : null;
        try {
            const separator=url.includes('?')?'&':'?';
            const response=await fetch(`${url}${separator}_=${Date.now()}`,{
                method:'GET',cache:'no-store',credentials:'omit',
                ...(controller?{signal:controller.signal}:{})
            });
            if(!response.ok)throw Error(`HTTP ${response.status}: ${url}`);
            return await response.text();
        } finally {if(timeout!==null)clearTimeout(timeout);}
    }
    async function download() {
        const errors=[];
        for(const url of [PRIMARY,MIRROR]) {
            try {const result=validSource(await requestText(url));return {...result,url};}
            catch(error) {errors.push(captureError(error));console.warn(TAG,'Download source failed:',url,error);}
        }
        throw Error('All download sources failed: '+errors.join(' | '));
    }
    function cached() {
        for(const key of [VERIFIED_CACHE,LEGACY_CACHE,LEGACY_OLD_CACHE]) {
            const code=storageGet(key);
            if(!code)continue;
            try {return {...validSource(code),url:`cache (${key})`,fromCache:true};}
            catch (_) {}
        }
        return null;
    }
    function assertNoDuplicate() {
        if(probe().started)throw Error('Main addon has already started; duplicate injection avoided.');
    }
    function execute(code,version) {
        assertNoDuplicate();
        const source=code+'\n//# sourceURL=SubbysPlushies-'+version+'-launcher.js';
        const methods=[];
        const canSeeBC=typeof window.AssetGet==='function' || typeof window.InventoryWear==='function';
        const injectScript=()=>{
            const host=document.head||document.documentElement;
            if(!host)throw Error('No document element available yet.');
            const script=document.createElement('script');
            script.dataset.subbysPlushiesLoader='1';
            script.textContent=source;
            host.appendChild(script);
            script.remove();
        };
        const choices=canSeeBC
            ? [['eval',()=>window.eval(source)],['script',injectScript],['Function',()=>window.Function(source)()]]
            : [['script',injectScript],['eval',()=>window.eval(source)],['Function',()=>window.Function(source)()]];
        for(const [method,fn] of choices) {
            if(probe().started)return methods[methods.length-1]||method;
            try {fn();methods.push(method);} catch(error) {STATE.attempts.push({phase:'execute-'+method,details:captureError(error)});}
            if(probe().started)return method;
        }
        throw Error('Source executed without creating a startup marker. Injection attempts: '+JSON.stringify(methods));
    }
    async function waitReady(label) {
        trace('waiting-for-ready',label);
        const begin=Date.now();
        let lastReport=0;
        while(Date.now()-begin<READY_WAIT_MS) {
            const p=probe();
            if(p.api?.ready===true) {
                STATE.pluginVersion=String(p.api.version||p.guard||'unknown');
                trace('ready',`${label}: v${STATE.pluginVersion}`);
                return true;
            }
            if(p.api?.failed===true)throw Error('Plugin initialization failed: '+(p.api.startupError||'unknown error'));
            if(Date.now()-lastReport>12000) {
                lastReport=Date.now();
                console.info(TAG,'Awaiting startup', {bootstrap:p.bootstrap,runtime:p.attr,guard:p.guard,api:!!p.api});
            }
            await sleep(200);
        }
        throw Error('Timed out waiting for plugin readiness ('+Math.round(READY_WAIT_MS/1000)+'s). '+JSON.stringify(publicState()));
    }
    async function start() {
        STATE.manager=managerName() || 'direct/EBC';
        trace('launcher-start',`${VERSION} under ${STATE.manager}`);
        // @require may already have started the addon but it can take time for BC APIs
        // to become available. A bootstrap marker counts as started even without ready=true.
        if(probe().started) {
            STATE.requiredSeen=true;
            trace('required-script-detected','Waiting instead of injecting a second copy.');
            await waitReady('@require/already installed');
            return;
        }
        await sleep(REQUIRED_PROBE_MS);
        if(probe().started) {
            STATE.requiredSeen=true;
            trace('late-required-script-detected','Waiting for initialized plugin.');
            await waitReady('@require');
            return;
        }
        // EBC may expose GM_info even when its loader did NOT execute @require.
        // Never return solely because GM_info exists.
        trace('require-missing','Falling back to live loader.');
        let downloaded;
        try {downloaded=await download();}
        catch(error) {
            console.warn(TAG,'Online download failed; trying verified offline fallback.',error);
            downloaded=cached();
            if(!downloaded)throw error;
        }
        STATE.source=downloaded.url;
        if(probe().started) {
            // An independent @require bootstrap may have started during the download.
            trace('startup-detected-after-download','Skipping duplicate injection.');
            await waitReady('existing addon');
            return;
        }
        trace('injecting',`v${downloaded.version} from ${downloaded.url}`);
        STATE.method=execute(downloaded.code,downloaded.version);
        await waitReady(downloaded.url);
        if(!downloaded.fromCache) {
            storageSet(VERIFIED_CACHE,downloaded.code);
            storageSet(VERIFIED_VERSION,STATE.pluginVersion||downloaded.version);
            storageSet(LEGACY_CACHE,downloaded.code);
            storageSet(LEGACY_OLD_CACHE,downloaded.code);
        }
    }
    void start().catch(error => failure('startup-failed',error));
})();
