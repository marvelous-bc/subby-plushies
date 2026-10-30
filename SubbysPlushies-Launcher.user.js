// ==UserScript==
// @name         Subby's Plushies & Essentials Launcher
// @namespace    subbycat.subbysplushies.launcher
// @author       Marvelous
// @version      2.4.0.1
// @description  Strict GitHub-verified launcher: no @require, no offline fallback, no stale startup
// @homepageURL  https://github.com/marvelous-bc/subby-plushies
// @supportURL   https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL    https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
// @downloadURL  https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js
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
    const VERSION = '2.4.0.1';
    const TAG = '[Subbycat Strict Launcher]';
    const REPO = 'marvelous-bc/subby-plushies';
    const FILE = 'SubbysPlushies.user.js';
    const API = `https://api.github.com/repos/${REPO}`;
    const STATE = {launcher:VERSION,phase:'initializing',source:null,commit:null,expectedBlob:null,
        actualBlob:null,pluginVersion:null,verified:false,ready:false,error:null,attempts:[]};
    const delay = ms => new Promise(r=>setTimeout(r,ms));
    const diag = () => ({...STATE,attempts:[...STATE.attempts]});
    window.SubbysPlushiesLauncherDiag = diag;
    const note=(phase,details='')=>{STATE.phase=phase;STATE.attempts.push({phase,details:String(details),at:Date.now()});console.info(TAG,phase,details)};
    async function fetchFresh(url, asJSON=false) {
        const controller = new AbortController();
        const timer = setTimeout(()=>controller.abort(),20000);
        try {
            const sep=url.includes('?')?'&':'?';
            const response=await fetch(`${url}${sep}_=${Date.now()}-${Math.random().toString(36).slice(2)}`,{
                cache:'no-store',credentials:'omit',signal:controller.signal,
                headers:{'Accept':asJSON?'application/vnd.github+json':'text/plain'}
            });
            if(!response.ok)throw Error(`HTTP ${response.status} while fetching ${url}`);
            return asJSON?response.json():response.text();
        } finally {clearTimeout(timer)}
    }
    async function gitBlobSha(source) {
        if(!crypto?.subtle)throw Error('Web Crypto unavailable: cannot verify source.');
        const data=new TextEncoder().encode(source);
        const prefix=new TextEncoder().encode(`blob ${data.length}\0`);
        const combined=new Uint8Array(prefix.length+data.length);
        combined.set(prefix);combined.set(data,prefix.length);
        const digest=await crypto.subtle.digest('SHA-1',combined);
        return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
    function currentPlugin() {
        return !!(window.__SUBBYS_PLUSHIES_ACTIVE__ || window.SubbysPlushies ||
            typeof window.SubbysPlushiesBootstrapDiag==='function' ||
            document.documentElement?.getAttribute('data-subbys-plushies-runtime'));
    }
    async function getVerifiedSource(){
        note('checking-github-head');
        const head=await fetchFresh(`${API}/commits/main`,true);
        const commit=String(head?.sha||'');
        if(!/^[a-f0-9]{40}$/i.test(commit))throw Error('GitHub did not return a valid commit SHA.');
        STATE.commit=commit;
        note('checking-github-file',commit.slice(0,12));
        const meta=await fetchFresh(`${API}/contents/${FILE}?ref=${commit}`,true);
        const expected=String(meta?.sha||'');
        if(!/^[a-f0-9]{40}$/i.test(expected)||meta?.type!=='file')throw Error('GitHub did not return a valid file blob SHA.');
        STATE.expectedBlob=expected;
        const url=`https://raw.githubusercontent.com/${REPO}/${commit}/${FILE}`;
        note('downloading-immutable-version',url);
        const code=await fetchFresh(url);
        if(code.length<1000||!code.includes('__SUBBYS_PLUSHIES_ACTIVE__')||!code.includes('SubbysPlushies'))
            throw Error('Downloaded content is not the expected Essentials userscript.');
        const actual=await gitBlobSha(code);
        STATE.actualBlob=actual;
        if(actual!==expected)throw Error(`Source verification mismatch: GitHub ${expected}, downloaded ${actual}.`);
        const version=code.match(/@version\s+([^\s]+)/i)?.[1]||'unknown';
        STATE.pluginVersion=version;
        STATE.source=url;
        STATE.verified=true;
        return code;
    }
    async function waitForBC(){
        note('waiting-for-bc');
        const start=Date.now();
        while(Date.now()-start<135000){
            if(typeof window.AssetGet==='function'||typeof window.InventoryWear==='function')return;
            await delay(250);
        }
        throw Error('BC APIs did not become available within 135 seconds.');
    }
    // One-time migration: remove only obsolete, duplicate launcher source caches.
    // Keep BCX, outfits, drawing data and all other localStorage entries untouched.
    function cleanupLegacyScriptCaches(){
        const keys=[
            'SubbysPlushiesLauncher:script',
            'SubbysPlushiesLauncher:v2:script',
            'SubbysPlushiesLauncher:last-good:script'
        ];
        const marker='SubbysPlushiesLauncher:legacy-cache-cleanup:v1';
        try {
            if(localStorage.getItem(marker)==='done')return;
            let removed=0,estimatedBytes=0;
            for(const key of keys){
                const value=localStorage.getItem(key);
                if(value===null)continue;
                localStorage.removeItem(key);
                // Verify removal before recording the migration as complete.
                if(localStorage.getItem(key)!==null)throw Error(`Could not remove ${key}`);
                estimatedBytes+=2*(key.length+value.length);
                removed++;
            }
            try{localStorage.setItem(marker,'done')}catch(e){
                // Cleanup itself succeeded; if storage cannot record the marker,
                // retrying the now-empty cleanup next launch is harmless.
                console.warn(TAG,'Could not record cache cleanup marker',e);
            }
            STATE.legacyCleanup={removed,estimatedBytes};
            note('legacy-cache-cleanup',`${removed} obsolete script caches removed; approx ${(estimatedBytes/1048576).toFixed(2)} MiB freed`);
        } catch(e){
            STATE.legacyCleanup={error:String(e)};
            console.warn(TAG,'Legacy cache cleanup incomplete; no other data was touched',e);
        }
    }
    async function launch(){
        if(currentPlugin())throw Error('Essentials is already running from another script or @require; disable the old launcher/main userscript. Cannot guarantee its version.');
        const source=await getVerifiedSource();
        cleanupLegacyScriptCaches();
        await waitForBC();
        // Recheck the branch immediately before injection in case GitHub changed while BC initialized.
        const latest=await fetchFresh(`${API}/commits/main`,true);
        if(latest?.sha!==STATE.commit)throw Error('GitHub main changed during startup. Refresh to obtain the newest release.');
        if(currentPlugin())throw Error('Another copy of Essentials started during verification; refusing duplicate injection.');
        note('starting-verified-plugin',STATE.pluginVersion);
        const script=document.createElement('script');
        script.dataset.subbysPlushiesStrictLauncher='1';
        script.textContent=source+`\n//# sourceURL=SubbysPlushies-verified-${STATE.commit.slice(0,12)}.js`;
        (document.head||document.documentElement).appendChild(script);
        script.remove();
        const start=Date.now();
        while(Date.now()-start<135000){
            if(window.SubbysPlushies?.ready===true){STATE.ready=true;note('ready',STATE.pluginVersion);return;}
            if(window.SubbysPlushies?.failed===true)throw Error('Essentials reported initialization failure.');
            await delay(250);
        }
        throw Error('Verified Essentials was injected but did not report ready in time.');
    }
    launch().catch(error=>{
        STATE.phase='blocked';STATE.error=String(error?.stack||error);
        console.error(TAG,'Essentials blocked: cannot guarantee current GitHub version.',error);
    });
})();
