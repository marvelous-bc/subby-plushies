// ==UserScript==
// @name         BC PawLounge
// @namespace    https://github.com/marvelous-bc/kittychat
// @homepageURL  https://github.com/marvelous-bc/pawlounge
// @supportURL   https://github.com/marvelous-bc/pawlounge/issues
// @version      1.2.3
// @description  A cozy social companion for Bondage Club, with private notes, friend circles, memories, and customizable chat.
// @author       marvelous-bc
// @match        https://*.bondageprojects.elementfx.com/R*
// @match        https://*.bondageprojects.com/R*
// @match        https://*.bondage-europe.com/R*
// @match        https://*.bondageeurope.com/R*
// @inject-into  page
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==
(function () {
  'use strict';
  const VERSION = '1.2.3';
  // Emergency bootstrap: published BEFORE any early return, module setup or BC hooks.
  // If a previous Kittychat version is present, users still get a real diagnostic.
  const BOOT = { version: VERSION, phase: 'entry', error: '', conflict: '', started: Date.now(), attempts: 0 };
  const markBoot = phase => {
    BOOT.phase = phase;
    try {
      document.documentElement?.setAttribute('data-kittychat-injected', VERSION);
      document.documentElement?.setAttribute('data-kittychat-phase', phase);
      if (BOOT.error) document.documentElement?.setAttribute('data-kittychat-error', BOOT.error.slice(0, 260));
    } catch {}
  };
  const emergencyDiagnostics = () => ({
    ...BOOT,
    url: location.href,
    userId: Number(window.Player?.MemberNumber || 0),
    currentKittychatVersion: String(window.KittyChat?.version || ''),
    launcherHostPresent: !!document.querySelector('#kittychat-host'),
    conflictNotice: document.getElementById('kittychat-version-conflict')?.textContent || null,
    injectedMarker: document.documentElement?.getAttribute('data-kittychat-injected') || null
  });
  try { window.KittyChatBootDiag = emergencyDiagnostics; } catch {}
  markBoot('injected');
  if (window.KittyChat && window.KittyChat.version) {
    const previous = String(window.KittyChat.version);
    BOOT.conflict = `Kittychat ${previous} already running`; markBoot('blocked-by-existing-copy');
    if (previous !== VERSION) {
      console.error(`[Kittychat ${VERSION}] Another Kittychat version (${previous}) is already active. Disable the older userscript and reload.`);
      const showConflict = () => {
        if (!document.body || document.getElementById('kittychat-version-conflict')) return;
        const warning = document.createElement('div');
        warning.id = 'kittychat-version-conflict';
        warning.style.cssText = 'position:fixed;bottom:22px;right:12px;z-index:2147483646;max-width:310px;padding:12px 14px;border:2px solid #ef7ab6;background:#2a152d;color:#ffe9f5;border-radius:14px;font:13px/1.45 system-ui;box-shadow:0 8px 30px #0009';
        warning.textContent = `PawLounge is already open in another version. Disable the duplicate script and reload Bondage Club.`;
        document.body.appendChild(warning);
      };
      if (document.body) showConflict();
      else document.addEventListener('DOMContentLoaded',showConflict,{once:true});
    } else {
      console.warn(`[Kittychat ${VERSION}] Duplicate copy already active; newer copy will not start a second instance.`);
    }
    return;
  }
  // Catch initialization errors that occur before the regular retry machinery exists.
  try {
  markBoot('building-runtime');
  const DEFAULT_ASSET_BASE = 'https://raw.githubusercontent.com/marvelous-bc/pawlounge/main/assets/';
  // Bundled 128x128 Paw Moments artwork. Embedded so updating only this
  // userscript is sufficient; the matching PNG is shipped separately for repos.
  const KC_MOMENTS_ICON_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAA6Q0lEQVR42u29Z5Sk13ke+Lz3frFyVXdVx0k9AZMwCAOACAIBEjKDKMqk5KFES44yKdtr0WtLR1qba83Msbw+q115La+jkkV5bS45ViLBIJIgAgmCIDAABkBPnu6ezt3V1ZWrvnDvfffHVzOE9oc3GJGu55yeOj1dM939vfE+b7jAEEMMMcQQQwwxxBBDDPEDDxp8DDHEEG8HaxxiiCGGGGKIIYYYYoghhhhiiCGGGGKIIYYYYoghhhhiiCHerhhW9IYYYoghhhjGrx9AMJhO4dTN53QKp5hAPFSAH1BBHzlxhMqbZcp2srRZ3hSdRkd4ozPkhhZtYAM7Ikdf7mR1cWbOzJ6Z5Xe6QtBQ4InAq9WqQG5a5rMpoWUgszKWquPLyAmFJ1xpyJaxUkYF3digpWzfjrTUqpPtqBNnTph3qhLQf0sCP3PijEiEXRblclVks1kRiLRkvWUFgSNSwpUpx7d7PWVJKxZdpYQLY5HtkWe5FEaB1Qv6mjnuWJbfq9r1GJ10VHbD+OEnH9bvRCWgH3Trrs/VRXHmASpvpkXkNKVgZaVFJJXwJLNnCdvYVkCuodg1ykjfSnspN+uV3KzlO5kUhM53dTMTqCBnkdvLyvz6dr++MV+bq2UyfsuYbm+5hT52LEcnznzMEMBDBXgTf34G4xRO0amTp3Dm/BnCLGS5XBbZbFa0254AYkv6bDN7lkuWhDa2ISVNrKUkcrNWwctlMl4ulXVtYeV7YVCu96s71jurO2ut9b0bjbVKo10r2bB8JtPNZkurt+44/ty+kSN/uthauAJtttpxtdX3+/1nv/psfBqnzVAB3mhXjjOi/FASt28IuxZalJeB7Pdd4bq2SLFnBdI4cRw4ZNgWEo6E4xZS+VTBK/q+5XksMdIJt3dv9DbHq72VyY3G2u5avTrSb3cKjhFe0c0iXymgvKeCTD5j2lstsXT+OhZayzi8967vvHv3B/71fGv+PAte63XRAarBOy0UWO8UC8dDD4sPd7L0ROYJmXfy0u7aolzeL7NZ34p65I6yssLIsh0EFodkKY+drPDtQmnczvvZLAMjvbhT2O5vT1/Yfml6s74yXW1u7Gz3GmWO4rQvXCrlCzi8Zw/K+8d44tiEzh8egX8gC4wBIBBiGHMl5mdPPYmvP/bN+z0rs/HArvdsvbw023VTVtQQU/EpnDJ4B4UBersJ+wzOiNmHyjTZuUwPzDxAraWWNMJYsZ2WrmsL1XOkKyOpZSxJw4ZtfMOelxa+k/Mzbs4veinHysc6ntiO6qOb3Y2x9c7S3q3Wxo5mZ3sk7PbzFJNV8NIojhRQmRnj6VunTfFomQtHSpBTDqGQ/DwmNuDAgAMGFMAOIEYkZEvwn37kD+mF8xfCj9/3yX/SCdpf6/b1mop10wu7wfGzx9U7xQvQW+3OAdBvHv9N6WQcOVmflP1MWqRTngCnrJSIpE3StcmSsRJCx5FLGg5Zlp3P5dyRdMlNOV6GJAod1Sltttf3rLSWplfrq+P15uZ0v9MdYaVTrnBotFDA+GQF47dMmrE7J7hw6wj7u9OEsgCc5DmYwMAEBggZiBjQADEBJvlpQQS2GdYOB9t/tG4+87O/Yx0/9siZPaVDv7vWWFlKm1QtBgJymnE9qmsA6uEnHzYA3rZcgfVWaZ0BizOHz1iBlbdnijMWOGc5eelkLHJYOxYZZROTzY7lCsuzJvIFP+1mMp6w/Mjoka1gfcfFrZd3rDSWdm20VifarXpJBVHRg0O5TB47JysYv6eCiSNTunRrBZkDWViTLpAFQYCgQDrQ4HYMhAA0AAMIAMwADN3Q0uQvKBEhR4BuaZTeVUa2mMJqfXH3u2funVjautZrkRKO9HvgbJyCFbXsoP/F42fjmRlPPb75uHniySfMKZzmt9NJgd4Kq3/ioSdku9N2Avh23km5luf5Uai9rG37aTfl5J2iX0gVc2nb8kOg2I4bk5vB+p6V1sL42tbKeL29Xel22gWKlJu2UhgpFjCxZxyTh6b12O1TXLx1BM7uFKEIgg2CAZvQwPR1Yt2aQHogXMPJY2B8P3QL4u8/m8QTAMSUvI04BVhFm//gfb8nrs9vNn7s+Me/mxOlb9rCvVILa5vV3nYowzCUfq4dm26oombU87ORlilVqbbM3MycGZBHeKvzhTdVAU7ipJg8PiknMGFbfiGdt9OpIFKZqeJ0cXJkchSMsW7UyG/01ic2G+s71ptrk5vNtYlusz4aRUEq66TFSL6Eyo4Kxm4Z57HDk2bkcJnTe7MkJiwgPXDlfQPuG5jQECkwNEAGYIPEETPAYAxsmkAEiOTvePBEiABBElCAIQMSxNAMEIgtwNrl4LmfexKf+e3P0Lbs8N7ivrXbdt997sjY7d/dm9szH2hVX2yuNHq9etew0yWy+5HuhKFnIkM1paVWS9WK+eTZ4/qtDBFvpgLQyYcel8c7bccXvu+5+bx07NFDo0d3LLbn3z1bO3e82ljb0epsj0T9IG2xhaybwehoCZP7JjF5ZMpU7pjgwsEiywmHkAcgQIgBHWpwYIBgYK06seybj3Qg9O/bNIMEceKLDQEEIoJFFgA58AyAroUwPQN71If2YsBiwCRKYu1zce2fz+L3f+V3MPPQXl49vyo3FjagLRnvnNh7/djO45cPjd/2fNkdvdztBmuLjZVmEDS6kSODVNoOtELUNYE2VFOrkaN3AyoJEW9ubYHeTOs/cu8R19LF1IiXzfl+emI6v+O2P73y6McvLr1yX0rb1sRYBVN7pnn60DRXbh83+YMl8qfTwAgAKxG2CTRMYMAhg1SSnd8U8A2hJ3ad/HKEgXUDTHzzNxZCQAo7+aIB0AW69SY2rq9j9fIy5i/PYfHKAtymwHt/5gO48+MPQLtRogAArN0uGk9t4jc/8i/wl//ZX8X4kWlevLKIC0+8Is5/Y5Y2NrbgpPzu9NTe+cM7br+wv3joVZ+yc1vN2ka9v9GKTbjtWelegFCxJeLNTiOOjFBoLWscgX6zCk1vmgI8/tDjVjO2/aJ0CtqSlSOjh46eefX3f3lx9fKhdx9/0Nz3yQe48K4RiIog2IkVm1AT95lNYEDWwI23GDAAgb9v1MxJ4kYAvUbYLG6EdAFLWICwkn8QA7oeYHu9hrXra7h64SrmL81hZWEZ65ubiAKFACFsx0YKHvZ4E/ilL/wKcjuKUHEEYgKN2zC1GP/2vl/HnQ/ehvt/9IeAOxzCtM+6HvPqt67j/B+/KK88dwnbzRbcTKa9d/rQ3IHxo8/vzO971RH2/Gpjpbre3+wKY4UQsq+cftTnKCRuh29WoelNUQAG0+899Htu3ppOu6E7ctfU3bufnvvap166/J0PffSjH41v/413SWRAeksx9wxBgCEB9AE0DGhMgipJBmbmFdBhkCQwMyAHCgAGCwZZEhISQjpJSm8A9A2atQbWr69g6fJ1XL5wBdevLWJ9dR3tVgcBK1iuC9t34WWzsF0PRAIyYrTam8g1Jf6H3/s09r3nCOJWHwQCcgJWwcF/fPDfQnrAT/3UCXTzMawxF/a0DzHuAS5YXQ+w8dgSv/rFF6wr566iFXSRLo5U908fXtxfOvzKRH76hVjx/HpzeWurU28BsUp7uU61Uw8CsRlHjSicPT+r3iiK+U05Bp7CKTreOS6ymZztO2mrrzr7X1h89oHb9x7l23/tXVJLRea8gnAFUCSQC5BD4B7ANQNuGMATQBdAABjBADPIAgQLSLIBObDuCAhaHWysL2Lh8gKuX1mgK1eu8PzCImq1bYRxBC0Itu/DT2fgTJdQ9FKQwgZBQAoBwwYEASvlICPLCGobqM5tYN/7jyTflwimb4BJYPLoBF566gWgq4AUoEIDWglAWzEoLUhUXEx9Yj9N/ex+/fD5Lq5/+TJd/Mor5YXZF8uz/L3bcqOjD81MHD53aPzWc7sruy+1gk51uX6tnfGtBqvpVjRZF6WdpeDkV0++IXWGN0UBjuAIuSWXELE1VZy0FlpzR60uFY5+6HaFMoS5pEGuAE0mp3BSBN5i8LZJXHmgwXNJ3LYtCUgHEAKIAXQjbNWqWFhYxMK1eVy8dAHX5hawtr6Odq8LAzA5FmzfhVvOwHNc2JYLSRKSLEgIMAhGM0sCNOtBSmEQcQjPy1Bk17FycWXwtAZOUycvY0en0f2jb6NTa0MWfehYIhYEKQiiAyAMYTYicFqQvcvDgX94Bw586g7de66OuT+5JC49Obvn8qvP7Hn50nc+ODI6ubp3/NBzh8aPPdXudV9Zay6SF+e4HB/TeAj61JOvf07w5hBBJwBnc4qMaMqsW7QbnVouJV2M3l4GgiQm07QAsyFExGZVw3Q0BEnY0gFsmbjyCOjWWlhdWqGr167x1QtXcOXaNSwvL2Orvo2+iWAIEL4Nx/NhF0ZAUkCIRNiAgAYBWgFEEMLAsl0IJkiSRCSgdIwbaYWCIQ0GpWysXV0DIkBYAtCc8AghMHJ4jNpBl9tOHxN6HGEQILI1EHMSx5ghjABpgDsh1CoBOUGpe4s4+p576ejWvbr+1Bpf/eNZ+/y3Zvd8Z+nLe16pPHv/uw/+yJemijsfna8vXgWyqhrO6TMnzjDO3FC9dyAT6EiXYUAgoY0xyQE9IUqZbAAsYFYNUGc4Tgo6jLGxvoH5hTnMzc3jwsWLmJ+fR3Vji7fDBhQMICXslAdn1IdnZUFCgiixag1iMENoTZoMCBZbwoIkkC1sZEUGuU4KFacIDUZDdRCmYkQcQrGCYgOlY4i0g43FNQTbbXgpH6qnQASYjkZx/wiX8yP0G3/yW3j4tgf4XcfvRtEfAywg0jE0FBgSUjNgEcgIIDZQjT7gCUZeUPHHJujuj0zg7usP6dUvLPJj/+qr01954XOf+NAdH+tOFSfbS835viOcMJqNNINf16TwTVOAoqM4kLbp6SZP5Cc6L6oY1XObNPqRSbBi6OsG0AzuGziui2989sv44lcfxcrmOjbqm+hznAjWFbB8B15xBBAiiccEaB6wO0aBICBIQEhBYAGTfAWSEoZHSofJEB0en8FH/vqfo8JYDv21Hq+eXcErT13B5XgZLdEh1ibJB3wb20t1NJfr8G7NJvGeANPXcMZ8TO+Zxleee5y/MvsE9n1jF+47eg/e++734Ojhw/ALGQAaiqPE8egkgSVLAJwUmlRNAz6BRiRN/uJe+qn7/1r8+Z/+XfvxVx/9yIkHfvbqBlJbXqbSdnKNCOdfX7nINyUCHDkh8nxQSstxZcROJp2dPjf//P3FdNba8xcOsG5oMi2CiRheysfy4nX8L3//n2J2aw5N6kLkPMicD5n1YfspkG3BEIEZMNDQbGCYmQcFG0EClpHEbQFpS0AkJ0QSAoIkLLLgCpuylMFOu4yZ9+9C8T0VTL9vF2YOTKH3TB3NqI9YaGjWEFKgv9nAbffeirE7p6FbMQQJNoZJjltY/eYiXr0wi8hjrLc28cL8q/j6U9/E2RdeQGe7iYyfxkh6BNJyIWGgjE44ZQOQSUgoMgT0Ad1QsG/3Rb6XNS98+blSeWLH6mi+/PJme6OrG0H82bXP6ifx5OvmAcSbQQCVN8sEAL5kbnJL51OlpXQm06jNbRGaAHkCgxAN2EBIEXoygl10YWdSMJJgABhjwMYkxzDD3z//D2BuOgGD/RP78Kv/8y9hZnQXWDEJeu37kuRyrV/Fn/zx43juF78LsxYiXu2i+EMj+OCvvg/77EnYAwdJQiImxtqFtZs+k4npRjSePrYTOZMGCLB8F04mBeURzs69gl//D/8Sf/sX/h7+0elTeOxPvorGUh2O9mFrF1AMwxqIDRAnpJZQBLSBkQcnOG2laLO1vjvrFDwOtQwyWXEER+gdkwOcPMniw2tnZTsckcWebzuOK42OyLdlp5Qb2aytVMfUWsRyVJLZThIzFSpUdo1hdGQEm53rgC1gwBAsYEkbFmxQKEA+ITIR9MADMAyYGcwCbBiW7aBYyeHPSJ6ZEsqAoY1GgBDdksLluSUc/k4d+YdLiK73kL93BEcfPIArX11B6MYMAsi3aPnCIhABJG9UhZLEtHxkHKOyiCu8CmaGAYMsB07eg00S7TjGN577Fr79vWewq7ID9919Dx647z4cPHIQdsGDtlXiDgTAggANsE3oihBhHJANC7ZtCx3XKToB4MzrJyPxxgn/pPjw2llp9SynbMmUM26y7pidcr20BwNVLk1Vt5sNdK40IdLyJmWrYo1sLoPRqTJ0pEEkIDA4shkHe8v78Dd/+i+jYkaRcjNwpAuLZOIViJKYbRNmFy/g5//6r+DqxhyEZGhjYNgwjAExEyM58oVxgEBHUN2YQAwKDRBoTN87iSx8GDakTEyUdrB+bQVxMwDdOJUwAz2DzL48lXIF2FqAQJAkIYhgGNAgSN9DeqwMp1zAUncLn/3SH+EfnjqFX/nFUzj31IuQoYQxJnFhBoAHNC/UKIwUivlyLQh6YWzbxk/75sSZE6/rMfANU4CHn3hYRPXIstySO5LJ5pxFb9S6bFcKmVxeG4ipwo7Nnulj85UVASehcAUR2BjAkdizfwYiTuKjYIItXfgijZn0Dpz49J/HB+9+Dyr1ItJxBpZxICGIkkQQsVEIEHCQDThCiEhH0GyYQCSIiCAgQLDJhitdFK0MUlNpmEAnQjUM6VugQeFIGQPhO9jYqKK5Wof07YSGJoJqK/iTWZ7YMQE3lrBIQoUxom4IYRhEABsNbTSMZcHL55GbHEOcIpy9dg7/x7/5ffR7PUgWCf8wCIVX//SSNDZ3dxR2nl/urPYzWupwO+TXu3z8higAn2SB3bCc4piTHrVz9iZVin/X/fnMp52TfuBMh9RPlbPjm2TLoHpxgwAwOa8hpg2w+9BuOLAABixhw5UeSr0s7jp0FADwF05+CD/7sz+JD//QI9hZ2gHJFgREQgmzIW0UlFKISbMeZAoCkm1Y8KSLtPSREWlMN4q47YFD8I+m2TTigSci9Dd76OkQBsyxicG2QLPfxdbVKuAhoaEBIDRAFpg+MIUMO/DYxoeOvgd/7eGPYSI1BlIEKSSEEAAYihUMESw/BeFYsDwL8AeVK2bIrIRejvnyM5cwNjZ9tWxPXO126ip0dWSVLf16y8p6I1z/2bWzclyO21BWOkP+SLqSOi4P0AlRlFme5PNRVV0upktBITfSXb+46qE3SARjTmJ2DOw4sBNZSqFpNCzpoMg5fOiR9+LBv3Mv4uUubEvgodPvxm0vHsWV/34B87wAyEHBCDdqQybJCQbW6pCkab+CYi+LopXFztI4bn/fQez72wegO1GSiNkASGDh6SU0RAuhDhEbxRCCFBTWL6zSwR8/NjhYDhhBAUwc3oE0XHzg7g/ip374J+CkLbzv/odw+jd/A9XONthoKGngpT2w0ZBSgiPg6Ltug18pIm62AcuCKFhY+fwcr66v4YF7f+RCL2puWyk7anaieCNcutFE8vZTgBuTN4fPH5Ydp+OJTDqbK6WLduyOyAm6DwIpKGNoDx4UiyZKVSAmR6batfm1Eb0SQZQkTEsDgmBCjcruCgrZPFqqDmU0Dh86gB/9pffBK9jQLQVpSSz+4QJ++x/9n7gUX4WwCDYkCUtAac3MmgYZPwsICGIyocb999+JH/3kI4iqfRSn8/B3p6DqIbinAEfA3pXF8pkFPPfcObTtPoI4IM0GJCxo22Dp/AJgwCRuGi0QAuUjEyhTGQ/uvQebi1voihC33LEbP3TgTtT6Ldx2xzEsr6ziO8+dRZu6MFDwhY3bHroNiFRCUrhJY8rsF84J4bvxofKRS8u9tZptu5FoCF2cKRqcfZuGgFMnTxEAWUXVyVhjKb+ULnpRquKs0V3iXnoPpUjqQEPchyO2FHehg8qesRnqNZroXG7cTASJABUqFMaLmJiuwPQjkA2cu3oe//hn/jf8zl/6T2iudoC8g2/9/vcwG15BT/RBYNiRA7fjwyOXLLKSxJAZmg2U1mCH8eJzs6he2MLkh3bDP5wFIg3Lk7An0rCnstj8wgoe/d+/jiu8iq7qI2YNxRqxUTC+xMrVZZiOBlkCxgxk0TUo7B9B2StibX0zKRcLwvpSDT/+wx/AL/3Nn8OPP/QIPvWLfwsffOQhqG4E7sXYv2sGB44cgOn2QUSQeQv6esjnn3lVTIzvWsz5xYV2t9HtRL3YKuf0iTMnXvdi0OunADiFcqosXJQdOyVS/nVR9kfFR51PWH9b3imnjTKa1zVoDznOL9p36Qlz727amS/CNe0L20kPACVJk9EM6dvYtX8ndBiCOcZWVMXLwQV89eJTOPNrj0J3Y1zdXkCT2wkZ1Gf8yMOP4J/++j9EnvMgEHjQ38VgaKNZmRjX9Qr+1a/+Hv7gp/4zFj83h+1LTTSudbD89WV8/e9+DZ/5J3+Ac9E8GrqDQEUwzDDMHGsF5RLWVjfQrbYgXetml5HqKrjTWZQqJaysrcKRDnSs0WkHUCFQnavj+tVVqKU67jh2BL5wodo93PHAHXByGShlwABE3sLSEwvYrNWwb+zgi/2ovyxtGUrthUvVx9/e5eAz589Q3s3LkQlj46rM5X89+wv2Tvk+EypLh1pjOSbUFZhhxKTl45fE7vKFcUw+UuLaSxs0LQ6CJMCKBkV8YNehXbD/REBBwRgFFWlo3+CxK88g+gcK891lRBQCJjl7q5jRaXSgoROyhw0zJZ1jBoAyGj0dYDlVxRdeeQLPvzyLlO2ASKCnImyabXTdAMoYFKwcxl0Xq/1NtLlDGgzLEdiuNbm+UEP23iK4PWg5CA0wDpRnxrF0ZTlROgVopdFq9eC4NmwIWK6D5eur0FGIjO3j+MN3AUEMkgKwCRDg818+J8mzmntL+8+u11fbku2w51BcnCkaOvv6N4a87qeALgDbki5fCfejB5s1mFdi8LYBtACazByxEH1tyW0tkMrw9pVNoAuQOwislCSCU7fsQAoejNFQ0Ig5RjfsYJOr+NyTj2KudR0xFEc6BlyDL3/7azh58tfQRjNh2BLCGASGZCJLSFgsYDUE4l6EBWsNr2AeZ80lvCyuYFVuoaHaaLbaeOCB4/i1z/8DjNh5aKOhjWKWQMt0sHpxGXBvJABgKAYsYOete9DebsBwDBsSRhuwSlLSyYkKFpdW8Mdf+jLCqIdbDxzG3kN7obsBSBJEwYa6HvD8965g19SB66XUyHwnaoTK4ciJ6nr2zCy/rT0AADTDpvHXyibaaZqtf9M7nfnD8IT9590HrQe8ERVEGn0m2u9IfiEMg8/1rnjbpc1+MXWsvbgyajZjTRlB1NfJSSAAJmYmkfezaKgaIAmaGJo14iiC5ViIDWAGOZHRGiwZlCXE2kCzgRAEwUQSEinbhxe7uKWwGx/+6+8DJOMrv/8Yrscb6HIfkYlgkBBP0rHwvXPn0P4nXWzHLRhosNGkJSGExvKrC9+/e8sw0eDoOnb7FLivEMYhJCcFqUIxh0wlhRcvvoLf/cPPYqW3CTIaxx64DdJxEfVjkACsko3537+C1dom/tzR91zoqP4mhNdPqUx0tmP0KZzm029nBZg9PMvvevZdJsyaSNS7nf5x+Qppr5r6Lf2S46j/zrrVHtWBYb6q+/yb4gu6kD6H3UJYW5n81kJttHe9hczdIzDbCiQIKowxMjmC8YkxzK9tAhkb2iTNGoJkQvdKG+DEjWnWUEYlFUUwCwiySEJAwJUeMiqD+/fdiU/88gmMpvNA3kVldBT/7B//FppOe0ApaxgTQ0qFV9cu4tzCedgpG8pEABjCSMARWLm8kgyTSPH9RtSewejRcYQUY2lrGffdei/Wwy2cXzqPx770NF64+DKUa0AEZB0fxx+4E+hGIBJJt5MAv/rFlySl/O4towfnVreX244tejW+qoozTUNn8fb2AKdOn+InHnpCo98Ou7slYd0Hpbok9vln6bvm63TU+kmZkSJ6OnjRlNynYqe3GrVglwpj820dHG9cqCHz4MjN/09HGu6Ihx0zO/DdhZdhsgCDmZPBHnKEi3ScRkGkKYwjtE0PsR9BsQbDkBAWJCcK4EUubp8+iE/98k/Dut7H8sWLyBZTOPrILhw6MIO1i1WQg8TVs0asYkgiwCOOdUQEQIKgdQwnZWNjcQNhvQfbtcA9ndQwuhredBZTYxP4w+9+Ac+uvoSXlmexuL0ORRpeyoOUFtCKccetd2B6505EvRDCsyByNuL5AFfPXaMdEzMLGZG/1ornOykr1dO2Vm9E9v+6KwCBmJ/kpGsFAOICwhYR8j1fLosX7Mj6CPJWCpviKSXjK6aDXhuBX06NrxtH8sa5VZoWBwBrUAwxiWnvOTID+xsCJin2QhKRLW2kYx8/8cgH8f6feBDV5S08//Qsnn76e9jSdRg2cNlGPp1FOTeKgkzjr37io4hf2cYLr84hFAqFVgp3LZRw+Lb9eOrVsyAXAx+gAWYyPOhdAViSIMOMlJ1COu+jurqNxso2xg5OQ3X7TMSEwAATNmb27cVXv/UUvlV7CZZtJacFQYiMgi8lhGbcff89ECSTohEBImNj8dGr2KzX8MOHH/lOK2gveJAB2624Uq287uTPG5YDEIhxBvrzJz4PpHaj3G2Idtqvc0c+b/+p+Z5l0US4KJ8LS2goRf1+0FCl9Oial8n1Ni6vpRDCwAFRQIAgQAHTh3fAhY2INYiTFm+hgF2lafzFv/ohpBZCVJwx3P4XduOH33sPvvD5b8DLeLj7rlsxVsjDkx6ERajPbePstWtoqS4IhJ4dYuPqFnaOjyFle2hxG0iOfGA2yfAQGIISyy/4JeRSeZDW6MdtVC+tYuzYNJgT+XNkAB8o3VJB9tspZPwM+jpAqEOWbJMlJUygMJ4awe333AHVCyGkAFwBKPDsl16SbirdPTh68NJKa6kp0nbQiEk3Zy6/7uTPG14OPnHmhDn7ybN6RVtheVPXrfG+3v4cf9pS7PNhr211RDvmvoqinshVxufTudz65vWNvdhSIFeAgwEl3Acm902i4GXRVnWQSLIt0oSdU1OwaxrnvzeHzU4TFhN2HJ7EX/7oj0Ibg06ti+WX11Bvd9APA9SCNlq6wyAmm2zEymBjq4H8viLSrg9hBGxhkVEaihOmn4jARlHWK6CQLkKpEDZJRNBYPb+Io9Y9N2hQQDMQA+WjEyhxDtd5GzAGRESCAUkEE8S4/a6jmJicQK/Xg51xYKdshPMdzH7vVUxOz6zkvdLa1a2FLsesHLTfsOz/DVUAAjFPsD67djYS6KG1ZZjvokCQEM7VWAeuMbGKrK5SNgPbxXxpae38hb29xS6njuUpakQgIuhIYWRiFGPlUSzVtgBPgBlMTJSyHcRdhY1OC0vdKvoqxKvfXkRauAg4RiPsICIFRRqKDSsYYjYQJOBLF1ppbHdaKEYlpC0foilAEcHzXfQpBLMGGw3f9lHKjELpEDAGlrQ5dkArl5Zv1gEAMGkQ+kDxSAUVWYSlFyASLWLJRJIFLGa864F7vz95DABZB4tfPE+1Vp0fuOvYS83u1obriz5RGJ2rZvUpnOLTOP3OUgAAwGnwF09+UU8+OhkdyBzQta1if6pgUbev2HInyIqFx1bk9rvojhV3rFyJz6F+sUapd+WTqR8i6EjDr6QxvXMSz6+ch0hZJDgJD/V2G2EQoxeHqPVb3FEBhZwkgYoVYhODNdhQMjRiYAAhyCKByMRQQqPWaeGWrI2SyOJDdz6E43cfw5988+v45uXvwLIkiIhG02UYpZh1nHxvKBK+xOq1JajGwI1HiUR1J0ZqTwHjpXF4WxY6kpiYkn6F0GBXdhK3HjuGoNNPZiAEAAG+8vgF6aay9ZnC/meXm6vbtuWGsLQqzswZOnvXO88D3MwHTg+atk7+2Vbms2tnJVCUbtOLut1WPJaZqPWlUtXZdTElZm5O9BidVOemb9kF+TSQzGczWGhsbdcQhEkbeDeOqKk6CDiEVoaVUTe7hDQNzI0EBBEkEWKKwQ6w0trG1nwNf+tTP4ko1vTt51/i+ZVl+LZHEYco+CU4QiKOA7IYsJggDcN1XVTXNtBYqmJ0agyqr0BCgLsaVtnD+K4J5KoeWtQHmMkWEggV7njX7SiVSuh0u3A9BzJjI5rv8JXnL2BibPeFvFO4es1cjhyFqBf0zIlHT7zhC6fe8J5AAjGdJvPaj7n6nLEaKSXJVtWgqkZTlWXHc5urry4JxGDY3+fwEQN7ju5BCi4EY1BoARqdFpr9PsiS6EcR+nGIfhyiG/XRjQP0VYieChGoCFGsOFQR+nGEXhSiN3jfelzHsy/NwmELL377FX7l7HkcmJpBVqbhSxc5Ow1SMVwj4BsLabaR1hIjdgYqiLF5eQ1gmSSAMYO7GvCA8cOTyMGDQzY5sOEYiTx8vOuue6BChRuVRJF1sfz4VWy3Wrh1152Xar16w5J21CKpLneymt6Eyb23ZEPIiTMnzDMnnjHdRkoTU7RL7N7I5gr17eXqCFpg8gQhNDcZwekDO5C3sgh1D7EyMBFhu9PGwuUlpFMp9KI+QkQIVcyBjmBgBm6fkSx2MCA2QNIwniz8QIAGN7FCFp76+vN4z3vvwvG7j2K+toa5jevw4cHhpI/f4UQBfNjICAdZctDkEM2Lm8BxA3Q0YANkERABo4fHUUIKKSSdQzIGdhemsW9mP/rdPqy0lZR/jeDZr70onWy6NzNy4Opma7XlueleK+qr4huc/b+lCkAgfnzzcc5mSyZsd2JJcnusNLm9vTCPaKUHZ7eHuGlAJGACjZHJUYyPjGG1eQV333IcP3bf+9DpdDA9VsHLF68hQoxQRQh0iFBH9NoW8eT7JZsACAQprGTE2xiQAba4jvPBdRyt7sefPv40/vPZr6FQySPnuYCK4RkbGXZQEj7yfRulXgo5mYJAEfbTbeC2NiiMgLINpASwrZDfO4oKCiiYbUTEYBPjzqN3Iu3n0Am6sH0LVspGcKWOqy9dop27D13OWblrV8JLXd/kA22n3lDy5y1XAADI3pLV/ZVI28YKIxW3RnPjy0u92XuaF+tUPjSVtIkRQccK2VIOk9PjeHnzKoiAlaUNHNu/HynLxZX1JUQcIdARIhVSQuUYYiQJ2GDhDwQJEASYFZiSDmIyBGEEtmQTs1fm8EN3HEO24OHyyjzW6+twYSNvXJStDCZaWeyd2oUdHzmK9LEyOUUPxjAr2yKaM8xXAqAioX0JP5XBrtQk5vqr6AkNBy5uP3Q7VDeGkASKGcKxsfzNV6kZ9vie8YPnWkFr1aNUX1JPVap403YPv2UKMFefMweiA1HP9qNOr9mv5MbXImiunluj8k9O8c1EMGbAFdhxYCfSZ11cXpyDqmnsKo2hK3pohW1OhK8QawMDQ0kIEMlpgjURkrwBlHTdGhgYo6GFQGwi9LmH714+h+b2LhycnsG+7BS+e/559FrbKEqfdrcLuO1jD2L6l+9kTDkwBEaQ/HzcN4y9HjDfB57pAlEAd28K5fEyKgtZtCjAjtFJ7BrdibgRwM7ZkBGAHvPFx85Jy/drB0ePvLDcWOx4TjqqR4GuzhwxOPvmyOEtU4DZM7M8fWLahJuhroWIR9OVZcdzOhvnV7KH1V0aEgSTsP8wwL7b94I/q/DwkXtx4oEPQDLj+dnLaKkOhSpkrfWgecPA8KB5lgBAcELogogxGAQVEBAQJmnYBIAIMS5WF3BleR5ebOB3YpQ6RJXAxl1/52GM/U93QwUaOB+AzvXBa2GyOewWD3zYB3b6INsGf7MFlDTlRgq8ay6HnvFxPHcn8isCPRFCjhEs30FwrsbzF69h797Da1k3s6aU7ntuoHYjrZ44fOpNWxHzlinAKZziM0tnMOMeU0EYhdlSYT2VyW1vzm1m0RzsB4g5oYQjYGxmAqOigIvXL+PTsxfx4aPvBnwLfdWHYkWc9PzTje7fZHAjmemQJCBZQpKAFBKWtGCThM0yscZWAPQj2KGFFEtksh4mJyaxa2SSJ4/uobH/8TirtgKe7QFfqCeHp1EBNGOYZ5rALR7ER8tAwQI9lIF5pocdYzspc/cj7N03hfJde2A8F247Bl+OIGrA9WcvUE+HOLLzzks9FWylC9lAZmJVS9f0qdNvLPnztlAAADi847Cu9yKtap3Yd51moVDe2lrb2BWvBSynHOJOnAx/BhqjO8uYKJRxvV7DB48/goO79+JLr34n6bc3BmSYJEsWLECUDI1KSppABAlYEBARA30Dqx8jFRsULReVXAkTO8YwcWgKlUPjGLmljOxUHj5c4HIM3OazEgxcCoD/VAXuyQI/UQRNSeAlBcz2wV/bAv/7deDnJkFZC3xXiosP3o6RqfuBfEL8JU7JAC0NXFZc/40FWcqONWYmbnm12tzspd1sLJuheil6yRzHcfzAe4DBScD4vq+NLXSkVWukULm6ceXq8c7lJop7x6AYIJEwgtlKHsXRIqZoJ3aXduGPn38Kq/11EAM2LFhCgomJDUMYAkUMKwScAPCVRNHLoJQrYHRmFJP7JzF5bBLlwxMo7C2SN5EBUmDEANoGZi2EutgF1jVwtwt0CfylOqhkQ3x8FJgW4DUFvhSCQgDvHgU/tgn6Zg14aATsCfCIDbMRAM8FwLYCbAna7YH22MDdPvZ9+j7k/t3mmpt1tr2ONLFk1r7m8maZcBLEp2+ssfsB9gDVSpXLm4dNGqza7XZcyU+uneW+qZ1fEcU/P4bBYkYYZWD7DvbdshcvffcivnzpaTSiJkAMhy1YEUB9hggANxbISQ/FYg5T+6cwsXcCE8emUDk2jtxMCd5YCkgNKLAQMD3NuhXBbBkgNqCAgboCWgqUsQBfgrc0sBQCB/PghRhYYeDpENiOEk7BE6BjBZhv1UF35kEpCf6DKvBSF4gIcOTN4U9+fxbqgwWMfPwgsvbeVPRYv5CfHpVhV9lt1/YOugfF0vkl0zrR0p/H5/UbvSTqLd8WHjkrnA12qHa/EVYyk1VpOcHGq6upfXynHiTygzk84MCt+/HMF78DY3y4vRiespF3sxgpl1A5MIbyzBjGjoxj5FAFuT0FeGNpwB+0bgWA6WmoVgTe5kGOSINWdEomdyQAo8HKAH2TTJkoJNM/PJjg7QHYUOCFAFoCrAnUURAZCR71oP/jBkTM4I6GuLsIPJgBjdngqgI/3QV/uQFyiMwH8kYeFRN4BjtYaM9KCT9Ntu5OxL4KScfNdFjG3cGZE2fi13sryNtGAWbPzPL7732/iVPK6KgZTvo7N/xctr1xaSOFLohcAe4nmx10XeGWv3g7fuSVdXQbXZQOVqhyeJzLhyeQnynCLnlJo+ZglYwJDVQ9BlcT46FBsymJZN7wJm7sAjactJMZTgQdGXCoQYPNHjAAthV4JQRvK5i+hhIEk0wiQcQMq+gCqwwu2RAHfeAeH7jdhgkZaAtgTxZUU8C3msC9WZY56fA0j5mmLMgUd4Uh238qG/DuwESjoZxqhKYKmJM4ye/oLWH/pZPAVwpfMSNxQfWDbuiSbI+OTm5vLW+OqdWAqeIQeoOx8UDDTfl43++dSIThJhtm0Ad0X0FtRmA98JTJntdkE8dNYQ++dmOb/+BT5sEgGTPoxtcMEqp2K4nf5NvgsgWz1oV4kcBNDQUgNonCGABkCehQgEoOhC0gNmPIbwFiTiXr7lwB8aALnvfAV9tAR4NyNoSj0wJUhIBJxWRb/5L+Yv9l79vdr3a+HFZclDcPmw9/coYxAZw+ffrtOxjy/xeVasW0qKcccuLYoFPKV9Y6nQ56cy2WKTFIGJM/VEchnA8QLYWILgeI5kNEmyFM14D1YEtkwvgAhsAKYM1gxWADhiZmTWz04PMbHzwgDTgZTSJLgDwB1CPwbC/xAA/kwbUAHMZJlbEXQfdjqH4MHSSvcV8hbiuEjQhhXyGoRgjO9REvRTBbCuZ8BG7GycJKR4CVBjos4SJnGZqUFXxI3iV/3JmUHy+a/HRuMpXLZxy/1qs5k2uT8iROih8oBSAQtzNtzlqKyU2pbrfdGctPzPcR8fb5LYI3eJ8NWNMSoiQIg7SABYFJgJlgdMIYmhgwCjB6sDzEgFlTshdCE4zmpMTMxDe8/kDwycLRwY4COAJsCyAlwN9rEEcaYk8W9GAe8atNMGsgVjBBBBMmCqD7EeJ+iKgbQgcKqqeg+wpaa6hIQbcV+LoBX+6CD9qAL4TeUhG1qEWSyrzM99It+FEERsvddMAZsd5nL8ixVNrJTLlTbrF+q4WHHhZ4nZd7vuUeoPpklfv9viFEqhY1+pXcZJ0cO9x4ZVUMVviBXAKlCCIvGBaBkawRMMokAleA0QTWifBvKsHgczY3vPzAym9s7GeQ4aRkcGMwkaQAO5QUdsYc0HbI9Ng2YAvIH65A3uFDX+1ASoJQGhwqmDCG6odQnX7iGXoxOFAwfQXuxEBgIEYs8FwTiEKIP1dkKQThFWzAyJg9vlP8GD1I7xWjpmEgisi7f8P+6cy09xMl5KZ1ykllnIZ9pFIV/DoXCN9yBTiBE8YNXU2Qqhs2o5yd33Cy2ebG5XVCPxG+iZCwghKAncz8sQHMoGnEDJL0G68sXhvaGUYz3XhwfHOfNN0YG+ebU6mEZJWbK4GCBZRsoOIA39gCX24RpySsH5+CPJoCr/XhSAmhTbJ3UCW7fkgZUKRAQQyhFOysBbdsAS/WwNcboJ8pg0YcYFmBvseXeNx48lPyg+JjYobb2vB8TGYh1rQHE/6v+D+ffsD9S90/6nI2Ny0z7cyfucb2B0IBAOCSGzIsEUdxHDvwN3KFYrW2VAU2YlBagKNk1o4sSpZJadBrcrdE+K/5/M8s/b9REDagQUX4xrbXAdEySBQHsR82ASlKFKBgg9M2dFmAP7PKdLULZG1YH5+A2OsD9QiOIyF10ilkaYZtGJ4r4eddpHI2nEYAerEGWRKwPrWL6VCWZRNSfy76rilZ39ItfV59pn1JPxtF0CQQgDktiDZYqN9tL0bP9K76701BrdbeEC7gLVcAAnG6WjZRWDNaBZGC2ioXxleazSZ61zpsZSSgGAiT7bDkJuvheDCbxTcs96YXpxvmTWAmouQ+iIGfvzl6CALBSj7YGvQNRgzdJZiWAHVsWE4K9o48nIki7GIK5nNL4IUGRNqB81cmIcZsWD0Dz7XgWTbSaQ9px4YfMpxGCDS64DGC+CvjLH5uyoidnrSWjVT/rvMc973/aHx6gR36ljrv/q/mX+s/xiqH2GNDSMnqt/qPtj8b/oNGL/yasToMB2qpumRO4dQ7cFXs/wPK5aoJOsp4/phpB63mWH5y8QqeQ/2VKqXeW0z69SOGYQJurJLhRH1vCpbo+xXA11wOcWOF/M1XDErC0eDqGEUQbCf9mTe2iytw3OqhtVHD5oV5LDw7S521LahmB5OPj/E9v/tXYE0XyfnYOPRvr8Di5JIJwQSUCdjpgfZn2d6VYozZRIKkqDL0s91m/Ay+prPZr/FYdEm39DbgwOzSW/amFcinTdn5Bfc96mvRXLhM/yF8P12PX+m1e7Vef6ED9UZMCL8tFKBaqTJQ1mOG4u1+szuarqwpC3rthWWakgfAFkBBYtnCIyaBpCX7NVZ9QwmIAJKv8W2GwfEghEQY7A0WkHIg7D44rHW5trZN1WtrtHZlWSxfvo7aeg2NVgMBuvBsV2dt30hbUNhtydG/9zgd+PcfNLQnBevdJfALXeC+FLAnzWJnipG3hDSQaDP4YgBzUTXiV/RzqmZ/EwfdayrqbZhtsxppqydkW+iqFcaatLdpf825bN6jFqJXGlF3sTfXb22ZXnsttRakU4jfiC6ht4UCzJ6Z5SP3HtFxyovqnWYwVTi+kC4WaovPzZfvasAIT5BpM1RjwPKpG6Y9cOevafbgmMEhQEZAmGT9uyUTqzY9IGr3ubZYxca1Vbp++bpYnV8Um+ub6HR6UKwhLScoFsrd6fH9nUO3jG2NZyc3JnNTLQcyjoLIMVaU1wtbe4JHa7v9n5my9R05pvuLTGOukCCJDYX45ZY2S2qTl80i1+w5rexLetI7h3FT1dVeiyVvdwLR6Wb7sdOWImVkjFSPW9vRY9Gv1D8dWnylPRZu99bDdqez0Z2NZuNTT556Q2oCb4uLIxlM/2Lfv3BuGb07TSbOH993/94nLj76C5deeOYDn/j1n1flvz8t+k+GSVi3vp/jJb19SaOnGOz6tyxAMBg9oLPWQnuzzutzK2Lx0oLYWqxic2MTjXYHIWvYrhdmMrnWaHFsbaIwubyjsHO1nJlYHfUqVTLoqyjqBmG334m7EQs2rrQo4+cst5Kepo3u+9xPWB+lXRaoSdCvtI15NVrCsrykunLBWNY1LollMyoaOow6/a12RynVUI7b1bLVty072r17t5o9P5swD55wJWW8mt+HHxg76rWCWrvW62Q7wYkzJ+I3qiD0trk5NLlSpunn7Yl0CunxqeLEvZ/59j//R1NxYfKn/v3fiN0fycn4HKA7+uY+YCEBS4BNAET1HjeXt7E5v0bXz8+LlYVl2lzfRKPbQoCIPTfTK+VGm+XSeG16ZPf2eG6qOuKVV4pW8bqQshpEYbMbt7vtsBv0OvVeRIgtaUxKpow0lrYcW5MhclzbddI84iOzxy3Fn3RvsY7GL4eXedV5Tuecq3qEVo1reiqO2tyMm7GmXhR3wp7shXEUB31nJHSKm+r4xHGN02CcPEVn1z4so3pkhcjJLAK52VYsdVM3C8149swJdSrJdH6wFeAkTordD+12pu1p12qPFneO7qjUwtUPf+W5//T3xsJc+t6Pvdvs+dGDJj2aRdSMUJ+r0fb8JpauXBfL80tUXd9Cq9OFgoblef1CbrQ7VprcKuXHlqYLE1fHM9MraTu36bDc7oZhv9VrhO2gEfR12A9VGEnJkUNuLCCVSEkVx8oIspQfKqNllgFAZgSlIsd2vDhnFfyC1RZlsaIq2Ou3VIU61I+63I47kaZeGMUhCRn2oii2ZU/V3bpaxrI+cfiEwuk/e03cjQ1r9bkZUZyZIwAob5bN/8tbxAj/Fcrxtro7+ORDJ+WR8P32uOVlYtMrzZRvmegEjYcfu/CFn1lZnNsziqJwMi7aqoNe0EcMA/KsIJ8rbo/mxtYmRndcnyjuWh/PTGzl7HxDKFmLOGx0eu1Wo7/d6wa9iCmKlSW1LdzYh1D9UMSx3Y0Aqfx+aNYtxX66a5zI0dlOVrczbQYeTk4rlVkR9ANL91N+wct4yLOri9KSW7FELELiMApUEGuhQ+pRXI/qOntLVs/V58zs4Vk+ffr0f3HT5/dvLRyUqt+ESyXfVtfHn8RJgcNHrDsKjutz2XeYcuXcWKmUHTu03L5278r29cNbnY2sbbsYz+1oFVMj65XM+PW8W1jxyN4MI1XdCmu9er+her2W0oIjQ4hTthUSCcWS4ihSRlmas22Om/mmbrazJlNomM5ih+t+nVczB/jU4L7fGzzFDeGcwik6cuII3d7OWCt93/Z9X7SVRVlLcb/fN9ls1myqnPb7K/rhhx82A0t/UwT5A6EAr1WC+6fytu77KUlOxlE6PTayK1tK5dO+zDgk4fTCnmn3OmGzvdVrq6BPFoeACFyimCXiG8IOw8gYI5TSlgrsiLtuyOlq1eAINM4kVPT/VyHdcNnlzTJlO1k6C2A102Y8+YQ5jdOM4fXx//VKMHl8UhbtopUxGRtOxnWU5QTUtyCNdIQtbXJYWZZxpB+bsBcDUjXQVuXY1t1012i5R3UWX+KEaCqbaqXKNy5j/L8zkf81p5e3u4W/IxXgzyZGdXEgc0BWAQu2kuXYoq62SERt3fF9EzgR74gc3V/p81K+Yg5k2vxaYb/TBfTfrAK8VhFO4RThIYiH8TAudy4TABzIHOBqpco4A8xiKOwhhhhiiCGGGGKIIYYYYoghhhhiiCGGGGKIIYYYYoghhhhiiCGGGGKIIYYYYoghhhhiiCGGGGKIIYYYYoghhhhiiCGGGGKIIf4bwP8FLg9pTpQaLhkAAAAASUVORK5CYII=';
  const VALID_THEMES = ['pink', 'lavender', 'cream', 'midnight'];
  const STICKERS = [
    { id: 'purr', name: 'Purr', emoji: '😽' },
    { id: 'boop', name: 'Boop', emoji: '🐾' },
    { id: 'heart', name: 'Heart', emoji: '💗' },
    { id: 'sleep', name: 'Sleepy', emoji: '💤' },
    { id: 'zoomies', name: 'Zoomies', emoji: '🐈' },
    { id: 'blush', name: 'Blush', emoji: '😳' },
    { id: 'hug', name: 'Hug', emoji: '🫂' },
    { id: 'hiss', name: 'Hiss', emoji: '😾' },
    { id: 'moon-purr', name: 'Moon Purr', emoji: '😽' },
    { id: 'moon-wink', name: 'Moon Wink', emoji: '😉' },
    { id: 'moon-cheer', name: 'Moon Cheer', emoji: '🎉' },
    { id: 'moon-blush', name: 'Moon Blush', emoji: '🥰' },
    { id: 'moon-hiss', name: 'Moon Hiss', emoji: '😾' },
    { id: 'moon-boop', name: 'Moon Boop', emoji: '🐾' },
    { id: 'moon-hug', name: 'Moon Hug', emoji: '🫂' },
    { id: 'moon-yawn', name: 'Moon Yawn', emoji: '🥱' },
    { id: 'moon-zoomies', name: 'Moon Zoomies', emoji: '✨' },
    { id: 'moon-smug', name: 'Moon Smug', emoji: '😼' },
    { id: 'moon-wave', name: 'Moon Wave', emoji: '👋' },
    { id: 'moon-laugh', name: 'Moon Laugh', emoji: '😹' },
    { id: 'moon-cry', name: 'Moon Cry', emoji: '😭' },
    { id: 'moon-surprised', name: 'Moon Surprised', emoji: '😲' },
    { id: 'moon-think', name: 'Moon Think', emoji: '🤔' },
    { id: 'moon-stretch', name: 'Moon Stretch', emoji: '🙆' },
    { id: 'moon-peek', name: 'Moon Peek', emoji: '🫣' },
    { id: 'moon-dizzy', name: 'Moon Dizzy', emoji: '😵' },
    { id: 'moon-grumpy', name: 'Moon Grumpy', emoji: '😒' },
    { id: 'moon-sneeze', name: 'Moon Sneeze', emoji: '🤧' }
  ];
  const DEFAULT_SETTINGS = { theme: 'midnight', fontSize:'large', notifications: true, sounds: false,
    typing: false, panelScrollbars: true, zoomReferenceDpr:0, assetBase: DEFAULT_ASSET_BASE, avatar: '', signature: 'Purrs and pawprints ♡',
    pawHero: '', pawAbout: 'Professional cuddle thief ♡', pawLikes: '', pawDislikes: '', pawLookingFor: '',
    friendStatusMode: 'Available', friendStatusText: '', shareFriendStatus: true, friendStatusMinutes:0, friendStatusExpiresAt:0, petPersona:'curious-kitten', petPersonaShare:true, petPersonaDescription:'', shareLivePlushie:false, pawPlushie: '', pawBadges: '', pawProfileTheme: 'velvet', pawGuestbookOpen: true,
    pawTimezone: '', pawPronouns: '', pawGallery1: '', pawGallery2: '', pawGallery3: '', pawGallery4: '',
    shortcuts: ['Purr purr~', '*gently boops your nose*', 'Sending you a big kitty hug!'],
    peerCacheDays:7,peerCacheCap:200,showSubbycatRecentMessages:true,
    encodePrivateChat:false,quietHours:false,quietStart:'22:00',quietEnd:'08:00',minimalist:false,bubbleShape:'rounded',bubbleOpacity:95,layoutEdit:false,sidebarOrder:['side-card','side-search','paw-circle-row','kc-inbox-filter-wrap'] };
  const MAX_CONVERSATIONS = 100, MAX_MESSAGES = 90, MAX_GROUPS = 40, MAX_GROUP_MEMBERS = 10, MAX_GROUP_TEXT = 380;
  const MOMENT_LIMIT=150;
  const ui = { host: null, shadow: null, fab: null, panel: null, badge: null, body: null,
    title: null, subtitle: null, input: null, menu: null, status: null, rightArrowObserver: null };
  const state = { myId: 0, settings: { ...DEFAULT_SETTINGS }, chats: {}, profiles: {}, groups: {}, selectedGroup: '', groupCreateOpen: false, windowRect: null,
    selected: 0, roomHistory: [], roomMemories:[], roomMemoryDraft:{name:'',notes:'',tags:''}, tab: 'chats', search: '', groupSearch: '', roomSearch: '', roomSort: 'most', roomFavorites: [], roomRecent: [], rooms: [], moments: [], replyTarget:null, momentView:null,
    roomError: '', roomLoading: false, roomSearched: false, roomCounts: {}, roomSearchWarnings: [], roomSearchTrigger: 'not-started', roomLastStarted: 0, roomLastFinished: 0, open: false, contactsMode: 'all',
    composerMode: 'beep', typingUntil: {}, lastTypingSent: 0, lastSave: null,
    hooks: [], mod: null, suppressOutgoing: false, recentFingerprints: new Map(),
    started: false, deliveryOutbox:[], scheduledMessages:[], nativeWhisperHandler: null, toastTimer: null, fabPosition: null, roomsRequest: 0, messageSearch: '', hotkeysAttached: false, resizeAttached: false, bootError: '', bootAttempts: 0, lastBootErrorAt: 0, faceBurst: { at: 0, count: 0 }, panelScroll: { left: 0, right: 0 }, leftCollapsed: false, rightCollapsed: false, rightDrawerOpen: false, profileModal: null, circles: [], circleFilter: '', catchUpSince: 0, catchUpWhispersSince: 0, catchUpGroupsSince: 0, sharedAlbums: [], invitations: [], pawGuestbook: [], historyOlder: [], historyHasMore: false, historyLoading: false, historySelection: "", historyEpoch: 0, integritySeen: [] };
  // Friend-status packets are private Kittychat control messages, not public
  // chat/beeps. Keep all delivery state in memory; only settings/received status
  // are saved with existing Kittychat account data.
  const STATUS_MODES = Object.freeze({ Available:'🟢', Cuddly:'💗', Busy:'🔕', Away:'🌙', 'Do not disturb':'⛔', 'Looking for cuddles':'🫂', 'Busy roleplaying':'🎭', Approachable:'🌸', 'Feeling mischievous':'😼', 'Quiet company':'🕯️', 'Open to whispers':'💌' });
  const PET_PERSONAS = Object.freeze({
    'curious-kitten': {icon:'🐱',name:'Curious Kitten',trait:'Curious · gentle · playful',lines:['*tilts her head inquisitively, ears perking up*','*pads a little closer, tail swishing with curiosity*','*purrs softly and bats at a dangling ribbon*']},
    'mischievous-fox': {icon:'🦊',name:'Mischievous Fox',trait:'Clever · teasing · adventurous',lines:['*grins and flicks her fluffy tail with mischief*','*sneaks closer with a playful, cunning look*','*chuckles while circling around her friend*']},
    'loyal-puppy': {icon:'🐶',name:'Loyal Puppy',trait:'Devoted · energetic · affectionate',lines:['*wags her tail excitedly at the familiar voice*','*leans into the offered headpats happily*','*sits nearby with an attentive, cheerful look*']},
    'sleepy-cat': {icon:'😴',name:'Sleepy Cat',trait:'Calm · cuddly · dreamy',lines:['*curls into a cozy little ball and yawns*','*slow-blinks contentedly while purring*','*stretches lazily before settling down again*']},
    'shy-bunny': {icon:'🐰',name:'Shy Bunny',trait:'Soft · shy · sweet',lines:['*peeks out shyly, ears trembling a little*','*nuzzles closer after a moment of hesitation*','*wiggles her nose, cheeks turning pink*']},
    'proud-kitty': {icon:'👑',name:'Proud Kitty',trait:'Confident · elegant · independent',lines:['*raises her chin with a distinctly regal purr*','*flicks her tail and surveys the room proudly*','*accepts a gentle headpat with dignified approval*']}
  });
  const statusWire = {
    requested: new Map(), responded: new Map(), pending: [], queued: new Set(),
    dispatchTimer: null, bootAccount: 0, lastPublished: 0, packetsSent: 0,
    packetsReceived: 0, failures: 0, lastFailure: ''
  };
  const log = (...items) => console.log('[Kittychat]', ...items);
  const me = () => Number(window.Player?.MemberNumber || 0);
  const numeric = n => { const v = Number(n); return Number.isSafeInteger(v) && v > 0 ? v : 0; };
  const trim = (s, max = 350) => String(s == null ? '' : s).trim().slice(0, max);
  const escapeText = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // v0.9.14: PL2 data codec. A reversible format with integrity checksum.
  // NOT cryptography: anyone with the script can decode it. Never present it
  // as E2EE, a signature, or protection against a malicious peer.
  const PAW_CODEC_PREFIX='PL2.';
  const PAW_CHAT_PREFIX='[PLCHAT2:';
  const pawCodecMetrics={encoded:0,decoded:0,legacy:0,failed:0,storageFallbacks:0};
  const pawEncoder=new TextEncoder(),pawDecoder=new TextDecoder('utf-8',{fatal:true});
  function pawBytesToBase64Url(bytes){
    let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function pawBase64UrlToBytes(value){
    if(typeof value!=='string'||!value||!/^[A-Za-z0-9_-]+$/.test(value))throw Error('Invalid PL2 alphabet');
    const str=value.replace(/-/g,'+').replace(/_/g,'/');
    return Uint8Array.from(atob(str+'='.repeat((4-str.length%4)%4)),c=>c.charCodeAt(0));
  }
  function pawChecksum(data){
    let hash=2166136261;
    for(let i=0;i<data.length;i++){hash=Math.imul(hash^data[i],16777619)>>>0;}
    return hash.toString(16).padStart(8,'0');
  }
  function pawCodecEncode(data){
    const bytes=pawEncoder.encode(JSON.stringify(data));
    const salt=new Uint8Array(2);
    if(window.crypto?.getRandomValues)window.crypto.getRandomValues(salt);
    else {salt[0]=Math.random()*256|0;salt[1]=Math.random()*256|0;}
    const masked=new Uint8Array(bytes.length+2);masked.set(salt);
    let rolling=(salt[0]*3+salt[1])&255;
    for(let i=0;i<bytes.length;i++){rolling=(rolling+((i*17+53)&255))&255;masked[i+2]=bytes[i]^rolling;}
    pawCodecMetrics.encoded++;
    return PAW_CODEC_PREFIX+pawChecksum(bytes)+'.'+pawBytesToBase64Url(masked);
  }
  function pawCodecDecode(serialized,maxBytes=3000000){
    if(typeof serialized!=='string'||!serialized.startsWith(PAW_CODEC_PREFIX))throw Error('Missing PL2 header');
    const match=/^PL2\.([a-f0-9]{8})\.([A-Za-z0-9_-]+)$/.exec(serialized);
    if(!match||serialized.length>Math.ceil(maxBytes*1.5)+64)throw Error('Malformed or oversized PL2');
    const masked=pawBase64UrlToBytes(match[2]);
    if(masked.length<3||masked.length>maxBytes+2)throw Error('PL2 size invalid');
    const bytes=new Uint8Array(masked.length-2);
    let rolling=(masked[0]*3+masked[1])&255;
    for(let i=0;i<bytes.length;i++){rolling=(rolling+((i*17+53)&255))&255;bytes[i]=masked[i+2]^rolling;}
    if(pawChecksum(bytes)!==match[1])throw Error('PL2 checksum mismatch');
    const data=JSON.parse(pawDecoder.decode(bytes));
    pawCodecMetrics.decoded++;
    return data;
  }
  function pawParseWireJSON(value,maxBytes=20000){
    if(typeof value!=='string')throw Error('Missing packet');
    if(value.startsWith(PAW_CODEC_PREFIX))return pawCodecDecode(value,maxBytes);
    pawCodecMetrics.legacy++;
    return JSON.parse(value);
  }
  function pawWireJSON(data){const packed=pawCodecEncode(data);return packed.length<=14500?packed:JSON.stringify(data);}
  function pawEncodeChat(text,mode){
    const packet={v:2,kind:'chat',mode,text:String(text),nonce:integrityNonce()};
    return PAW_CHAT_PREFIX+pawCodecEncode(packet)+']';
  }
  function pawDecodeChat(value){
    if(typeof value!=='string'||!value.startsWith(PAW_CHAT_PREFIX)||!value.endsWith(']'))return null;
    try{
      const packet=pawCodecDecode(value.slice(PAW_CHAT_PREFIX.length,-1),12000);
      if(packet?.v!==2||packet.kind!=='chat'||!['whisper','beep'].includes(packet.mode)||typeof packet.text!=='string'||packet.text.length>2000)return null;
      return packet.text;
    }catch{pawCodecMetrics.failed++;return null;}
  }
  // v0.9.17 — opt-in authenticated private messaging via Web Crypto.
  // Manual out-of-band shared key: NOT Signal, MLS, forward secrecy, or a
  // replacement for transport/account authentication. Never persist secrets.
  const PAW_SECURE_PREFIX='[PLSEC1.';
  const pawSecureSecrets=new Map(); // key: actual BC member number, session only
  const pawSecurePending=new Map();
  const pawSecureSeen=new Set();
  const pawSecureKDFIterations=210000;
  function pawSecureAvailable(){return !!(window.crypto?.subtle && window.crypto?.getRandomValues);}
  function pawSecureToken(text){return typeof text==='string'&&text.startsWith(PAW_SECURE_PREFIX);}
  function pawSecureContext(sender,recipient,mode,mid){
    return pawEncoder.encode(`PawLounge.PLSEC1|${sender}|${recipient}|${mode}|${mid}`);
  }
  async function pawSecureDerive(secret,salt){
    const base=await window.crypto.subtle.importKey('raw',pawEncoder.encode(secret),'PBKDF2',false,['deriveKey']);
    return window.crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:pawSecureKDFIterations,hash:'SHA-256'},
      base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function pawEncryptPrivate(to,text,mode){
    to=numeric(to);
    const secret=pawSecureSecrets.get(to);
    if(!secret||!pawSecureAvailable())throw Error('Secure Chat key unavailable; no plaintext was sent');
    if(!['beep','whisper'].includes(mode))throw Error('Unsupported secure transport');
    if(!to||!me())throw Error('No secure conversation selected');
    const salt=window.crypto.getRandomValues(new Uint8Array(16));
    const iv=window.crypto.getRandomValues(new Uint8Array(12));
    const id=uniqueMessageId();
    const aad=pawSecureContext(me(),to,mode,id);
    const key=await pawSecureDerive(secret,salt);
    const ct=new Uint8Array(await window.crypto.subtle.encrypt(
      {name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,pawEncoder.encode(text)));
    const payload={v:1,s:me(),r:to,m:mode,id,k:'PBKDF2-SHA256',i:pawSecureKDFIterations,
      salt:pawBytesToBase64Url(salt),iv:pawBytesToBase64Url(iv),ct:pawBytesToBase64Url(ct)};
    const wire=PAW_SECURE_PREFIX+pawBytesToBase64Url(pawEncoder.encode(JSON.stringify(payload)))+']';
    if(wire.length>1950)throw Error('Encrypted message is too long for BC; shorten it');
    return {wire,id};
  }
  function pawSecureParse(wire,from,to,mode){
    if(typeof wire!=='string'||wire.length>1950||!wire.startsWith(PAW_SECURE_PREFIX)||!wire.endsWith(']'))throw Error('Invalid secure message envelope');
    const bytes=pawBase64UrlToBytes(wire.slice(PAW_SECURE_PREFIX.length,-1));
    if(bytes.length>2200)throw Error('Oversized encrypted packet');
    const p=JSON.parse(pawDecoder.decode(bytes));
    if(p?.v!==1||p.s!==from||p.r!==to||p.m!==mode||typeof p.id!=='string'||
      !/^msg_[0-9]+_[a-f0-9]{24}$/.test(p.id)||p.k!=='PBKDF2-SHA256'||p.i!==pawSecureKDFIterations||
      typeof p.salt!=='string'||typeof p.iv!=='string'||typeof p.ct!=='string')throw Error('Encrypted metadata invalid');
    const salt=pawBase64UrlToBytes(p.salt),iv=pawBase64UrlToBytes(p.iv),ct=pawBase64UrlToBytes(p.ct);
    if(salt.length!==16||iv.length!==12||ct.length<17||ct.length>2100)throw Error('Invalid cryptographic parameters');
    return {p,salt,iv,ct};
  }
  async function pawDecryptPrivate(wire,from,mode){
    from=numeric(from);const secret=pawSecureSecrets.get(from);
    if(!secret||!pawSecureAvailable())throw Error('Unlock Secure Chat for this contact');
    const {p,salt,iv,ct}=pawSecureParse(wire,from,me(),mode);
    const key=await pawSecureDerive(secret,salt);
    const raw=await window.crypto.subtle.decrypt({name:'AES-GCM',iv,
      additionalData:pawSecureContext(from,me(),mode,p.id),tagLength:128},key,ct);
    const text=pawDecoder.decode(new Uint8Array(raw));
    if(text.length>2000)throw Error('Decrypted message is oversized');
    return {id:p.id,text};
  }
  async function pawHandleSecureInbound(wire,from,mode){
    from=numeric(from);
    if(!from||!pawSecureToken(wire))return false;
    if(!inboundLimit(from,'secureChat',wire,1950))return true;
    let mid='';try{mid=pawSecureParse(wire,from,me(),mode).p.id;}catch {return true;}
    const account=state.myId;
    const seen=`${account}:${from}:${mid}`;
    if(pawSecureSeen.has(seen))return true;
    pawSecureSeen.add(seen);
    if(pawSecureSeen.size>1500)pawSecureSeen.delete(pawSecureSeen.values().next().value);
    if(!pawSecureSecrets.has(from)){
      const list=pawSecurePending.get(from)||[];
      if(list.length<30)list.push({wire,mode,account:state.myId});
      pawSecurePending.set(from,list);
      notice(`🔒 Encrypted ${mode} from ${bcName(from)}. Open Secure Chat to unlock it.`);
      return true;
    }
    try{
      const got=await pawDecryptPrivate(wire,from,mode);
      if(state.myId!==account||me()!==account)return true;
      if(!integrityAcceptEvent('secureChat',from,{nonce:got.id},got.id))return true;
      appendMessage(from,got.text,from,mode,'network',{messageId:got.id});
    }catch{
      notice(`🔒 Couldn't authenticate an encrypted message from ${bcName(from)}. Check the shared key.`);
      // Keep failed ciphertext for a corrected key in this same session.
      const list=pawSecurePending.get(from)||[];
      if(list.length<30)list.push({wire,mode,account:state.myId});
      pawSecurePending.set(from,list);
    }
    return true;
  }
  async function pawSecureUnlockPending(member){
    const list=pawSecurePending.get(member)||[];pawSecurePending.delete(member);
    for(const entry of list)if(entry.account===state.myId){
      // The original receive is already deduplicated. Decrypt directly.
      try{const got=await pawDecryptPrivate(entry.wire,member,entry.mode);
        if(state.myId===entry.account&&integrityAcceptEvent('secureChat',member,{nonce:got.id},got.id))
          appendMessage(member,got.text,member,entry.mode,'network',{messageId:got.id});
      }catch{const backlog=pawSecurePending.get(member)||[];if(backlog.length<30){backlog.push(entry);pawSecurePending.set(member,backlog);}}
    }
  }
  function pawSecureOpenModal(){
    const member=numeric(state.selected),modal=ui.shadow?.getElementById('kc-secure-modal');
    if(!member||!modal)return;
    modal.classList.remove('hidden');
    const label=modal.querySelector('.paw-secure-recipient');if(label)label.textContent=`${bcName(member)} (#${member})`;
    const input=modal.querySelector('#kc-secure-key');if(input){input.value='';input.type='password';input.focus();}
    const status=modal.querySelector('.paw-secure-status');if(status)status.textContent=pawSecureSecrets.has(member)?'Enabled for this session':'Not enabled';
  }
  function pawSecureCloseModal(){const el=ui.shadow?.getElementById('kc-secure-modal');if(el){el.classList.add('hidden');const input=el.querySelector('#kc-secure-key');if(input)input.value='';}}
  function pawSecureSaveKey(){
    const id=numeric(state.selected),field=ui.shadow?.getElementById('kc-secure-key');
    const key=field?.value||'';
    if(!pawSecureAvailable()){notice('This browser context does not support Web Crypto.');return;}
    if(!id||key.length<20||key.length>256){notice('Use a shared secret of 20–256 characters; generated random keys are recommended.');return;}
    pawSecureSecrets.set(id,key);if(field)field.value='';
    pawSecureCloseModal();renderChatHeader();
    notice(`🔐 Secure Chat enabled with ${bcName(id)} for this session. Both sides must use the SAME secret.`);
    void pawSecureUnlockPending(id);
  }
  function pawSecureForgetKey(){
    const id=numeric(state.selected);if(!id)return;
    pawSecureSecrets.delete(id);pawSecureCloseModal();renderChatHeader();notice('Secure Chat key cleared for this contact.');
  }
  function pawSecureGenerateKey(){
    const field=ui.shadow?.getElementById('kc-secure-key');if(!field||!pawSecureAvailable())return;
    field.value=pawBytesToBase64Url(window.crypto.getRandomValues(new Uint8Array(32)));
    field.type='text';field.select();
    notice('Random key generated. Copy it and share outside BC before enabling.');
  }
  function pawSecureResetSession(){pawSecureSecrets.clear();pawSecurePending.clear();pawSecureSeen.clear();}


  // v1.0.1: Optional password-protected local PawBooks vault.
  // PL2 is NOT encryption. When this vault is enabled, the normal account save
  // contains no shared-book or private-page content. The encrypted container is
  // kept in a separate account-scoped localStorage record.
  const pawBookVault={active:false,locked:false,account:0,key:null,salt:null,queue:Promise.resolve(),error:'',writes:0};
  const bookVaultStorageKey=id=>`Kittychat.PawBookVault.v1.${numeric(id)}`;
  function bookVaultRecord(id){
    try{
      const s=localStorage.getItem(bookVaultStorageKey(id));if(!s)return null;
      const v=JSON.parse(s);
      if(v?.v!==1||v.account!==numeric(id)||v.kdf!=='PBKDF2-SHA256'||v.iterations!==310000||
        v.cipher!=='AES-256-GCM'||typeof v.salt!=='string'||typeof v.iv!=='string'||typeof v.data!=='string')return null;
      return v;
    }catch{return null;}
  }
  function bookVaultCryptoAvailable(){return !!(window.crypto?.subtle&&window.crypto?.getRandomValues);}
  async function bookVaultDerive(password,salt){
    const raw=await window.crypto.subtle.importKey('raw',pawEncoder.encode(password),'PBKDF2',false,['deriveKey']);
    return window.crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:310000,salt},raw,
      {name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  function bookVaultPayload(){
    return {v:1,account:state.myId,sharedAlbums:state.sharedAlbums.slice(-30),privateBookPages:state.privateBookPages};
  }
  async function bookVaultEncrypt(key,salt,payload,account){
    const iv=window.crypto.getRandomValues(new Uint8Array(12));
    const aad=pawEncoder.encode(`PawLounge.PawBooksVault.v1:${account}`);
    const data=new Uint8Array(await window.crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},key,pawEncoder.encode(JSON.stringify(payload))));
    return {v:1,account,kdf:'PBKDF2-SHA256',iterations:310000,cipher:'AES-256-GCM',salt:pawBytesToBase64Url(salt),iv:pawBytesToBase64Url(iv),data:pawBytesToBase64Url(data)};
  }
  async function bookVaultDecrypt(key,record,account){
    const iv=pawBase64UrlToBytes(record.iv),data=pawBase64UrlToBytes(record.data);
    if(iv.length!==12||data.length>11000000)throw Error('Invalid encrypted vault');
    const aad=pawEncoder.encode(`PawLounge.PawBooksVault.v1:${account}`);
    const plaintext=await window.crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},key,data);
    const obj=JSON.parse(pawDecoder.decode(new Uint8Array(plaintext)));
    if(obj?.v!==1||obj.account!==account||!Array.isArray(obj.sharedAlbums)||
       !obj.privateBookPages||typeof obj.privateBookPages!=='object')throw Error('Damaged vault contents');
    return obj;
  }
  function bookVaultQueueSave(){
    if(!pawBookVault.active||pawBookVault.locked||!pawBookVault.key||pawBookVault.account!==state.myId)return;
    const account=state.myId,key=pawBookVault.key,salt=pawBookVault.salt;
    // Freeze each snapshot before async work. Serialized writes cannot replace
    // newer data with an older encryption result.
    const payload=bookVaultPayload();
    pawBookVault.queue=pawBookVault.queue.catch(()=>{}).then(async()=>{
      const record=await bookVaultEncrypt(key,salt,payload,account);
      localStorage.setItem(bookVaultStorageKey(account),JSON.stringify(record));
      pawBookVault.writes++;pawBookVault.error='';
    }).catch(e=>{pawBookVault.error='Encrypted PawBooks save failed: '+String(e?.message||e).slice(0,130);
      console.error('[PawLounge] '+pawBookVault.error);
      if(state.myId===account)notice('⚠ PawBooks vault could not save. Check storage space before closing BC.');});
  }
  function bookVaultPrepareAccount(account){
    pawBookVault.account=account;pawBookVault.key=null;pawBookVault.salt=null;
    try{pawBookVault.active=localStorage.getItem(bookVaultStorageKey(account))!==null;}catch{pawBookVault.active=false;}
    pawBookVault.locked=pawBookVault.active;
    pawBookVault.error='';
  }
  async function bookVaultEnable(){
    if(pawBookVault.active)return notice('PawBooks vault already enabled.');
    if(!bookVaultCryptoAvailable())return notice('Web Crypto requires a secure browser context.');
    const password=window.prompt('Choose a PawBooks vault password (at least 12 characters). You must remember this to unlock books after restarting.','');
    if(password===null)return;if(password.length<12)return notice('Use a longer, unique password (12+ characters).');
    if(window.prompt('Confirm PawBooks vault password:','')!==password)return notice('Passwords did not match.');
    const account=state.myId;
    try{
      const salt=window.crypto.getRandomValues(new Uint8Array(16));
      const key=await bookVaultDerive(password,salt);
      if(account!==state.myId)return;
      const vault=await bookVaultEncrypt(key,salt,bookVaultPayload(),account);
      // Write the encrypted copy BEFORE removing cleartext from the main save.
      localStorage.setItem(bookVaultStorageKey(account),JSON.stringify(vault));
      pawBookVault.account=account;pawBookVault.active=true;pawBookVault.locked=false;
      pawBookVault.key=key;pawBookVault.salt=salt;
      saveNow(true);
      if(account!==state.myId)throw Error('Account changed during vault setup');
      const main=safeRead(dataKey(),{});
      if((main.sharedAlbums?.length||0)||Object.keys(main.privateBookPages||{}).length)
        throw Error('Main save still contains PawBooks data; encrypted migration was not finalized');
      notice('🔐 PawBooks vault enabled. Back up your password—there is no recovery key.');
      bookRender();
    }catch(e){
      console.error('[PawLounge] Vault setup failed:',e);
      // Leave original data untouched if secure migration could not finish.
      pawBookVault.active=false;pawBookVault.locked=false;pawBookVault.key=null;pawBookVault.salt=null;
      notice('PawBooks encryption could not finish: '+String(e?.message||e).slice(0,100));
    }
  }
  async function bookVaultUnlock(){
    if(!pawBookVault.active||!pawBookVault.locked)return;
    if(!bookVaultCryptoAvailable())return notice('Web Crypto is unavailable in this browser context.');
    const password=window.prompt('PawBooks vault password:','');if(password===null)return;
    const account=state.myId,record=bookVaultRecord(account);
    if(!record)return notice('Encrypted vault is missing or damaged; do not overwrite your backup.');
    try{
      const salt=pawBase64UrlToBytes(record.salt);
      if(salt.length!==16)throw Error('Invalid salt');
      const key=await bookVaultDerive(password,salt);
      const payload=await bookVaultDecrypt(key,record,account);
      if(state.myId!==account)return;
      state.sharedAlbums=payload.sharedAlbums.slice(-30).map(normalizeAlbum).filter(Boolean);
      state.privateBookPages=normalizePrivateBookPages(payload.privateBookPages);
      pawBookVault.key=key;pawBookVault.salt=salt;pawBookVault.locked=false;pawBookVault.error='';
      notice('🔓 PawBooks unlocked for this session.');renderPawBooks();
    }catch(e){console.warn('[PawLounge] Vault unlock rejected:',e);notice('Incorrect password or damaged encrypted vault.');}
  }
  async function bookVaultLock(){
    if(!pawBookVault.active||pawBookVault.locked)return;
    bookVaultQueueSave();await pawBookVault.queue;
    if(pawBookVault.error)return notice('Cannot lock: last encrypted save failed. Preserve your session and free storage.');
    state.sharedAlbums=[];state.privateBookPages={};state.albumView='';
    pawBookVault.key=null;pawBookVault.salt=null;pawBookVault.locked=true;
    saveNow(true);notice('🔒 PawBooks locked.');renderPawBooks();
  }
  function bookVaultControls(){
    if(!pawBookVault.active)return '<button class="secondary" data-action="bookvaultenable" title="Encrypt all PawBooks saved on this device">🔐 Protect books on this device</button>';
    if(pawBookVault.locked)return '<button class="primary" data-action="bookvaultunlock">🔓 Unlock PawBooks</button>';
    return '<button class="secondary" data-action="bookvaultlock">🔒 Lock local vault</button>';
  }

  let pawUnreadableAccountKey='';
  const safeRead=(key,fallback)=>{
    try{
      const stored=localStorage.getItem(key);
      if(!stored)return fallback;
      const data=stored.startsWith(PAW_CODEC_PREFIX)?pawCodecDecode(stored,4500000):JSON.parse(stored);
      return data??fallback;
    }catch(err){
      if(String(key).startsWith('Kittychat.v1.'))pawUnreadableAccountKey=key;
      console.warn('[PawLounge] Cannot read saved data:',err);pawCodecMetrics.failed++;return fallback;
    }
  };
  // v1.1.11: keep the account cache in compact plain JSON rather than PL2.
  // PL2's Base64 layer expands serialized data by ~33% and can fill the
  // per-origin localStorage quota. safeRead() still understands older PL2
  // values, so migration happens safely at the next successful save.
  // This cache is not encrypted by PL2; Paw Notes keys retain their separate
  // password-encrypted vault and are never touched by this operation.
  let pawLastStorageWarning=0;
  const safeWrite=(key,value)=>{
    try {
      const serialized=JSON.stringify(value);
      // Avoid rewriting the entire site storage when no data changed.
      if(localStorage.getItem(key)===serialized)return true;
      localStorage.setItem(key,serialized);
      return true;
    } catch(err) {
      pawCodecMetrics.storageFallbacks++;
      const now=Date.now();
      if(now-pawLastStorageWarning>30000){
        pawLastStorageWarning=now;
        const quota=err?.name==='QuotaExceededError'||err?.code===22||/quota/i.test(String(err?.message||''));
        console.warn(quota?'[PawLounge] Storage full; preserving existing account record. Try PawLoungeCompactCache() or MarvelousStorageGuardian.':'[PawLounge] Cannot save local account cache:',err);
      }
      return false;
    }
  };

  // Privacy-safe quota diagnostic: counts bytes only, never saved values.
  try { Object.defineProperty(window,'PawLoungeStorageDiag',{
    configurable:true,value:()=>{
      const groups={WCE:0,PawLounge:0,Plushies:0,Other:0};
      let entries=0;
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i);if(!k)continue;
        const value=localStorage.getItem(k)||'';
        const bytes=(k.length+value.length)*2;
        const group=/bce-instant-messenger|wce|bce-past-profiles/i.test(k)?'WCE':
          /kittychat|pawlounge|marvelous|kc_/i.test(k)?'PawLounge':
          /subby|plush|essentials/i.test(k)?'Plushies':'Other';
        groups[group]+=bytes;entries++;
      }
      return {version:VERSION,estimatedTotalMB:Number((Object.values(groups).reduce((a,b)=>a+b,0)/1048576).toFixed(2)),
        byPluginMB:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,Number((v/1048576).toFixed(2))])),
        entries,accountCacheFormat:String(localStorage.getItem(dataKey())||'').startsWith(PAW_CODEC_PREFIX)?'legacy PL2':'compact JSON or missing',
        currentAccountCacheKB:Number(((localStorage.getItem(dataKey())||'').length*2/1024).toFixed(1)),cacheCompactions:pawCacheCompactions,cacheArchiveReady:pawCacheArchiveReadyFor===state.myId,cacheLastError:pawCacheLastCompactionError,note:'Usage estimates only. No saved values, keys, or passphrases are displayed.'};
    }
  });}catch{/* optional diagnostic */}

  // v0.9.13 Message Integrity Shield. BC supplies the outer sender member number.
  // Packet JSON and any self-declared sender inside it are UNTRUSTED. This is
  // validation, correlation and abuse control, not end-to-end authentication.
  const integrity = {rejects:0,duplicates:0,rateLimited:0,legacy:0,accepted:0,
    bursts:new Map(),keys:new Set(),recovery:new Map(),quorums:new Map()};
  const INTEGRITY_LOG_LIMIT=650;
  function integrityNonce(){
    if(window.crypto?.getRandomValues){const a=new Uint8Array(12);window.crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,16)}`;
  }
  function integrityReject(){integrity.rejects++;return false;}
  // IDs travel with messages and remain stable across exports, history and
  // reactions. Group IDs intentionally have a different prefix from message IDs.
  function uniqueMessageId(){return `msg_${me()}_${integrityNonce()}`;}
  function assignMissingMessageIds(messages){
    const seen=new Set();let fixed=0;
    for(const m of messages){
      if(!m||typeof m!=='object')continue;
      let id=typeof m.id==='string'?m.id:'';
      if(!id || id.length>90 || seen.has(id)){id=uniqueMessageId();fixed++;}
      m.id=id;seen.add(id);
    }
    return fixed;
  }
  function inboundLimit(from,family,raw,maxBytes=6000){
    if(!numeric(from)||from===me()||typeof raw!=='string'||raw.length>maxBytes)return integrityReject();
    const now=Date.now(),key=`${from}:${family}`;
    let record=integrity.bursts.get(key);
    if(!record||now-record.at>10000)record={at:now,count:0};
    record.count++;integrity.bursts.set(key,record);
    if(integrity.bursts.size>250){for(const [k,v] of integrity.bursts)if(now-v.at>15000)integrity.bursts.delete(k);}
    // A normal busy group can produce dozens of events; reject floods only.
    if(record.count>70){integrity.rateLimited++;return false;}
    return true;
  }
  function integrityReplayKey(family,from,packet,legacyKey=''){
    if(!packet||typeof packet!=='object'||Array.isArray(packet))return '';
    if(packet.nonce!==undefined){
      if(typeof packet.nonce!=='string'||!/^[a-zA-Z0-9_-]{12,72}$/.test(packet.nonce))return '!invalid';
      return `${family}:${from}:nonce:${packet.nonce}`;
    }
    integrity.legacy++;
    // Legacy peers have no nonce; only immutable message IDs can be durably
    // deduplicated. Mutable sync/ack/reactions remain backward compatible.
    return legacyKey?`${family}:${from}:legacy:${legacyKey}`:'';
  }
  function integrityAcceptEvent(family,from,packet,legacyKey=''){
    const key=integrityReplayKey(family,from,packet,legacyKey);
    if(key==='!invalid')return integrityReject();
    const semantic=legacyKey?`${family}:${from}:semantic:${legacyKey}`:'';
    if((key&&integrity.keys.has(key))||(semantic&&integrity.keys.has(semantic))){integrity.duplicates++;return false;}
    if(semantic){integrity.keys.add(semantic);state.integritySeen.push([semantic,Date.now()]);}
    if(key){
      integrity.keys.add(key);state.integritySeen.push([key,Date.now()]);
      if(state.integritySeen.length>INTEGRITY_LOG_LIMIT){
        state.integritySeen.splice(0,state.integritySeen.length-INTEGRITY_LOG_LIMIT);
        integrity.keys=new Set(state.integritySeen.map(x=>x[0]));
      }
      saveSoon();
    }
    if(state.integritySeen.length>INTEGRITY_LOG_LIMIT){state.integritySeen=state.integritySeen.slice(-INTEGRITY_LOG_LIMIT);integrity.keys=new Set(state.integritySeen.map(x=>x[0]));}
    integrity.accepted++;return true;
  }
  function integrityMsgId(s,max=80){return typeof s==='string' && s.length<=max && /^[a-zA-Z0-9_-]{8,80}$/.test(s);}
  // A history query is scoped to a short-lived, per-peer challenge. It is not
  // enough to be asked: recovery is committed only on two matching, independent
  // reports from two *other* accepted participants. The requester is not a vote.
  const RECOVERY_QUORUM=2, RECOVERY_TTL=90000, RECOVERY_MAX_CANDIDATES=80;
  function integrityRecoveryKey(group,member){return `${group}:${numeric(member)}`;}
  function integrityRequestRecovery(group,member,after){
    const token=integrityNonce();
    integrity.recovery.set(integrityRecoveryKey(group,member),{token,until:Date.now()+RECOVERY_TTL,after});
    return token;
  }
  function integrityPermitsRecovery(group,member,packet){
    const query=integrity.recovery.get(integrityRecoveryKey(group,member));
    if(!query||Date.now()>query.until||!packet||packet.rid!==query.token)return false;
    if(!Number.isSafeInteger(Number(packet.time))||Number(packet.time)<query.after||Number(packet.time)>Date.now()+60000)return false;
    return true;
  }
  function quorumState(gid){
    const result=integrity.quorums.get(gid);
    if(!result||Date.now()>result.until)return null;
    return result;
  }
  function recoveryStatus(gid){
    const round=quorumState(gid);
    if(!round)return '';
    return `Confirmed ${round.confirmed} · Pending ${round.candidates.size} · Reports from ${round.reporters.size}/${RECOVERY_QUORUM}+ members`;
  }
  function receiveHistoryWitness(g,from,p){
    const round=quorumState(g.id);
    if(!round||!round.members.has(from)||!g.joined||!g.accepted.includes(from)||from===me()||
       !integrityPermitsRecovery(g.id,from,p)||!integrityMsgId(p.mid,70)||
       !g.accepted.includes(numeric(p.author))||typeof p.text!=='string'||!p.text.trim()||
       p.text.length>MAX_GROUP_TEXT||!Number.isSafeInteger(p.time)||
       p.time<Date.now()-8*86400000||p.time>Date.now()+60000)return integrityReject();
    if(g.messages.some(m=>m.id===p.mid))return false;
    const reply=normalizeReply(p.replyTo), author=numeric(p.author);
    // Compare *exact* content, author and reply reference; a matching
    // ID with different text is not a valid corroboration.
    const value=JSON.stringify([p.mid,author,p.text,reply]);
    let candidate=round.candidates.get(p.mid);
    if(!candidate){
      if(round.candidates.size>=RECOVERY_MAX_CANDIDATES)return integrityReject();
      candidate={variants:new Map(),reporters:new Set()};round.candidates.set(p.mid,candidate);
    }
    if(candidate.reporters.has(from))return false;
    candidate.reporters.add(from);round.reporters.add(from);
    let variant=candidate.variants.get(value);
    if(!variant){
      // Never permit arbitrary unbounded conflicting copies of one ID.
      if(candidate.variants.size>=RECOVERY_QUORUM+2)return integrityReject();
      variant={votes:new Set(),author,text:p.text,time:p.time,reply};candidate.variants.set(value,variant);
    }
    variant.votes.add(from);
    if(variant.votes.size>=RECOVERY_QUORUM){
      const voters=[...variant.votes];
      addGroupMessage(g,variant.author,variant.text,p.mid,variant.reply,variant.time,true,voters);
      round.candidates.delete(p.mid);round.confirmed++;
      notice(`✓ Recovered group message with ${RECOVERY_QUORUM} matching member confirmations.`);
    }
    if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id){
      const label=ui.shadow?.querySelector('[data-recovery-status]');
      if(label)label.textContent=recoveryStatus(g.id);
    }
    return true;
  }
  const dataKey = () => `Kittychat.v1.${state.myId}`;
  const imgUrl = file => {
    const base = /^https:\/\/[^\s]+\/$/.test(state.settings.assetBase) ? state.settings.assetBase : DEFAULT_ASSET_BASE;
    // Header art changes need their own versioned URL: fresh launcher fetches
    // do not invalidate a browser/CDN cache for PNG files automatically.
    return base + file + (/^decor-header-lockup(?:-shaped|-mockup)?\.png$/.test(file) ? `?art=${VERSION}` : '');
  };
  const sticker = text => STICKERS.find(s => text === `🐱 Kittychat sticker: ${s.name} ${s.emoji}`);
  const bcName = id => {
    const fromRoom = Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter.find(p => p?.MemberNumber === id) : null;
    const fromFriend = window.Player?.FriendNames?.get?.(id);
    return trim(fromRoom?.Nickname || fromRoom?.Name || fromFriend || state.chats[id]?.displayName || state.profiles[id]?.name || `Kitty #${id}`, 80);
  };
  const name = id => trim(state.chats[id]?.nickname || bcName(id), 80);
  const inRoom = id => window.CurrentScreen === 'ChatRoom' && Array.isArray(window.ChatRoomCharacter) &&
    window.ChatRoomCharacter.some(p => p?.MemberNumber === id);
  const myFriends = () => Array.isArray(window.Player?.FriendList) ? window.Player.FriendList.map(x => numeric(typeof x === 'object' ? (x?.MemberNumber ?? x?.memberNumber ?? x?.ID) : x)).filter(Boolean) : [];
  // Native BC room roster: no PawLounge installation or friend relationship is
  // required. Only inspect the roster while actually inside the ChatRoom screen;
  // BC can retain ChatRoomCharacter when the character leaves a room.
  function currentRoomRoster() {
    if (window.CurrentScreen !== 'ChatRoom' || !Array.isArray(window.ChatRoomCharacter)) return [];
    const seen=new Set();
    return window.ChatRoomCharacter.filter(character=>{
      const id=numeric(character?.MemberNumber);
      if(!id||id===me()||seen.has(id))return false;
      seen.add(id);
      return true;
    });
  }
  function roomRosterSignature() {
    return window.CurrentScreen==='ChatRoom' ? 'room:' + trim(window.ChatRoomData?.Name||'',110) + ':' +
      currentRoomRoster().map(character=>`${numeric(character.MemberNumber)}:${trim(character.Nickname||character.Name||'',80)}`).sort().join('|') : 'not-in-room';
  }

  // Native BC's OnlineFriends response is the only source for remote availability.
  // Cache its online IDs briefly; an old PawLounge KCStatus does not mean online.
  const pawOnlinePresence={ids:new Set(),seenAt:0,lastQuery:0,modSdkHookInstalled:false};
  function pawObserveNativePresence(data){
    if(data?.Query!=='OnlineFriends'||!Array.isArray(data.Result))return;
    pawOnlinePresence.ids=new Set(data.Result.filter(e=>e&&e.Online!==false&&e.IsOnline!==false&&e.MemberNumber).map(e=>numeric(e.MemberNumber)).filter(Boolean));
    pawOnlinePresence.seenAt=Date.now();
    if(state.open&&state.tab==='chats'){scheduleSidebarUpdate();renderChatHeader();}
  }
  function pawPresenceTick(){
    // The OnlineFriends response is observed by hookBC() through ModSDK.
    // NEVER overwrite ServerAccountQueryResult directly: BCX detects raw
    // function replacements and other mods would lose their hook chain.
    if(!state.open||!me()||!window.ServerIsConnected||typeof window.ServerSend!=='function')return;
    // Without the ModSDK observer a query would be useless; avoid spamming BC.
    if(!pawOnlinePresence.modSdkHookInstalled)return;
    if(Date.now()-pawOnlinePresence.lastQuery>95000){
      pawOnlinePresence.lastQuery=Date.now();
      try{window.ServerSend('AccountQuery',{Query:'OnlineFriends'});}catch{}
    }
  }
  // Only a fresh native friend-list response can prove a BC friend is offline.
  // An unknown status is NOT treated as offline; the player can explicitly
  // select Offline Note in the composer instead.
  function pawFriendConfirmedOffline(member){
    const id=numeric(member);
    return id!==me() && myFriends().includes(id) && !inRoom(id) &&
      pawOnlinePresence.seenAt>0 && Date.now()-pawOnlinePresence.seenAt<130000 &&
      !pawOnlinePresence.ids.has(id);
  }
  function pawPresenceIsFresh(){return pawOnlinePresence.seenAt>0&&Date.now()-pawOnlinePresence.seenAt<130000;}
  // Ask BC before choosing delivery. A response is authoritative for a BC friend;
  // no room presence or stale friend status is ever interpreted as offline.
  function pawRequestPresenceForDelivery(){
    if(!pawOnlinePresence.modSdkHookInstalled||typeof window.ServerSend!=='function')return false;
    if(Date.now()-pawOnlinePresence.lastQuery<5000)return true;
    pawOnlinePresence.lastQuery=Date.now();
    try{window.ServerSend('AccountQuery',{Query:'OnlineFriends'});return true;}catch{return false;}
  }
  function pawFriendConfirmedOnline(member){
    if(numeric(member)===me())return true;
    if(inRoom(numeric(member)))return true;
    return Date.now()-pawOnlinePresence.seenAt<130000&&pawOnlinePresence.ids.has(numeric(member));
  }
  function statusView(member) {
    if (numeric(member) === me()) return (state.settings.shareFriendStatus && (!state.settings.friendStatusExpiresAt || state.settings.friendStatusExpiresAt>Date.now())) ? {
      mode:state.settings.friendStatusMode, text:trim(state.settings.friendStatusText,100)
    } : null;
    if(!pawFriendConfirmedOnline(member))return null;
    const raw=state.profiles[numeric(member)]?.friendStatus;
    if (!raw || !Object.hasOwn(STATUS_MODES,raw.mode) || (Number(raw.expiresAt)>0 && Number(raw.expiresAt)<=Date.now())) return null;
    return {mode:raw.mode,text:trim(raw.text || '',100)};
  }
  function statusLabel(member) {
    const st=statusView(member);
    return st ? `${STATUS_MODES[st.mode]} ${st.mode}${st.text ? ' · ' + st.text : ''}` : '';
  }
  function statusMarkup(member,cls='') {
    const label=statusLabel(member);
    return label ? `<div class="kc-status-label ${cls}" title="Friend-shared Kittychat status">${escapeText(label)}</div>` : '';
  }
  function statusUpdatePayload() {
    return {type:'KCStatus',version:1,action:'update',
      mode:statusView(me()) ? state.settings.friendStatusMode : '',
      text:statusView(me()) ? trim(state.settings.friendStatusText,100) : '',
      expiresAt:state.settings.friendStatusExpiresAt||0,
      at:Date.now()};
  }
  function sendStatusPacket(member,action='update') {
    member=numeric(member);
    if (!member || !myFriends().includes(member) || typeof window.ServerSend!=='function') return false;
    const data=action==='request'
      ? {type:'KCStatus',version:1,action:'request'}
      : statusUpdatePayload();
    try {
      window.ServerSend('AccountBeep',{MemberNumber:member,BeepType:'KCStatus',IsSecret:true,Message:pawWireJSON(data)});
      statusWire.packetsSent++;
      return true;
    } catch(err) {
      statusWire.failures++;statusWire.lastFailure=String(err?.message||err).slice(0,100);
      return false;
    }
  }
  function drainStatusQueue() {
    statusWire.dispatchTimer=null;
    if (!state.myId || state.myId!==me() || !statusWire.pending.length) return;
    const member=statusWire.pending.shift();
    statusWire.queued.delete(member);
    // Never send an old status; create the payload at dispatch time.
    sendStatusPacket(member,'update');
    if (statusWire.pending.length) statusWire.dispatchTimer=setTimeout(drainStatusQueue,750);
  }
  function expireFriendStatusIfNeeded(){
    if(state.myId===me()&&state.settings.shareFriendStatus&&state.settings.friendStatusExpiresAt>0&&state.settings.friendStatusExpiresAt<=Date.now()){
      state.settings.shareFriendStatus=false;state.settings.friendStatusExpiresAt=0;saveSoon();publishFriendStatus(false);
      if(state.open&&state.tab==='settings')renderSettings();
    }
  }
  function scheduleStatusExpiry(){
    const minutes=Number(state.settings.friendStatusMinutes)||0;
    state.settings.friendStatusExpiresAt=state.settings.shareFriendStatus&&minutes>0?Date.now()+minutes*60000:0;
  }
  function publishFriendStatus(announce=false) {
    if (!me() || state.myId!==me()) return 0;
    const peers=myFriends().filter(id => {
      const p=state.profiles[id];
      return p?.kitty || p?.friendStatus || statusWire.requested.has(id) || statusWire.responded.has(id);
    });
    const selected=numeric(state.selected);
    if (selected && myFriends().includes(selected) && !peers.includes(selected)) peers.unshift(selected);
    for (const member of peers.slice(0,70)) {
      if (!statusWire.queued.has(member)) {statusWire.queued.add(member);statusWire.pending.push(member);}
    }
    statusWire.lastPublished=Date.now();
    if (statusWire.pending.length && !statusWire.dispatchTimer) statusWire.dispatchTimer=setTimeout(drainStatusQueue,150);
    if (announce) notice(`Status saved. Updating ${Math.min(peers.length,70)} Kittychat friend${peers.length===1?'':'s'} ♡`);
    return Math.min(peers.length,70);
  }
  function requestFriendStatus(member) {
    member=numeric(member);
    if (!member || !myFriends().includes(member)) return false;
    const now=Date.now();
    if (now-(statusWire.requested.get(member)||0)<90000) return false;
    const ok=sendStatusPacket(member,'request');
    if (ok) statusWire.requested.set(member,now);
    return ok;
  }
  function receiveFriendStatus(data,member) {
    member=numeric(member);
    if (!member || !myFriends().includes(member)) return;
    let item;
    try { item=pawParseWireJSON(String(data.Message||''),1600); } catch { return; }
    if (item?.type!=='KCStatus' || item.version!==1) return;
    if (item.action==='request') {
      const now=Date.now();
      if (now-(statusWire.responded.get(member)||0)<8000) return;
      statusWire.responded.set(member,now);
      // Explicitly return a clear packet when sharing is off so offline peers
      // discard an older cached status rather than showing stale information.
      sendStatusPacket(member,'update');
      return;
    }
    if (item.action!=='update') return;
    statusWire.packetsReceived++;
    const p=state.profiles[member] || {};
    if (item.mode==='' && !item.text) delete p.friendStatus;
    else if (Object.hasOwn(STATUS_MODES,item.mode)) {
      const timestamp=Number(item.at);
      if (p.friendStatus && Number.isFinite(timestamp) && timestamp>0 && timestamp<p.friendStatus.at) return;
      p.friendStatus={mode:item.mode,text:trim(item.text||'',100),at:Number.isFinite(timestamp)?timestamp:Date.now(),expiresAt:Number.isFinite(Number(item.expiresAt))?Number(item.expiresAt):0};
    } else return;
    p.kitty=true;
    state.profiles[member]=p;
    saveSoon();
    if (state.open && (state.tab==='chats'||state.tab==='friends')) {
      renderSidebar();
      if (state.selected===member) {
        renderChatHeader();
        const el=ui.body?.querySelector('.kc-side-status');
        if (el) el.innerHTML=statusMarkup(member);
      }
    }
  }

  const ensure = id => {
    id = numeric(id); if (!id || id === me()) return null;
    if (!state.chats[id]) state.chats[id] = { id, messages: [], unread: 0, pinned: false, favorite: false, muted: false, replyLater:false,snoozeUntil:0,requestPending:false,requestAccepted:false,nickname: '', displayName: '', draft: '', updated: Date.now() };
    return state.chats[id];
  };
  // Native BC reply / reaction metadata and Kittychat group metadata.
  function normalizeReply(reply) {
    if (!reply || typeof reply!=='object') return null;
    const id=trim(reply.id||reply.messageId||'',100);
    if (!id) return null;
    return {id,senderName:trim(reply.senderName||'',90),snippet:trim(reply.snippet||'',150)};
  }
  function normalizeReactions(raw) {
    if (!raw || typeof raw!=='object' || Array.isArray(raw)) return {};
    const out={};
    for (const [emoji,list] of Object.entries(raw).slice(0,12)) {
      const symbol=trim(emoji,12);
      if (symbol && Array.isArray(list)) out[symbol]=[...new Set(list.map(numeric).filter(Boolean))].slice(0,10);
    }
    return out;
  }
  function lookupMessage(kind, conversation, mid) {
    const list=historyDisplayMessages(kind,conversation,visibleHistoryTail(kind,conversation));
    return list.find(m=>String(m.id)===String(mid)) || null;
  }
  function replyPreview(reply) {
    const r=normalizeReply(reply);
    return r ? `<button class="kc-message-reply" data-jumpreply="${escapeText(r.id)}" title="Go to replied message"><span>↪ ${escapeText(r.senderName||'Reply')}</span> ${escapeText(r.snippet)}</button>` : '';
  }
  function reactionMarkup(message,kind,conversation) {
    const reactions=normalizeReactions(message.reactions);
    const chips=Object.entries(reactions).filter(([emoji,ids])=>ids.length).map(([emoji,ids])=>`<button class="kc-reaction-chip ${ids.includes(me())?'mine':''}" data-reaction-id="${escapeText(message.id)}" data-emoji="${escapeText(emoji)}" title="${ids.length} reaction(s)">${escapeText(emoji)} ${ids.length}</button>`).join('');
    return chips ? `<div class="kc-reaction-list">${chips}</div>` : '';
  }
  function messageActions(m,kind) {
    const id=escapeText(m.id);
    return `<span class="kc-message-actions" title="Message ID: ${id}"><button class="react" data-reply-msg="${id}" title="Reply to this message">↩</button><button class="react" data-react="${id}" title="React to this message">♡</button><button class="react" data-save-moment="${id}" title="Save privately">☆</button><button class="react" data-book-save-message="${id}" title="Add to PawBook (ask consent if quoting another user)">📖</button></span>`;
  }
  function currentConversationKind() {return currentGroup()?'group':'chat';}
  function setReplyTarget(mid) {
    const kind=currentConversationKind(),conversation=kind==='group'?state.selectedGroup:state.selected;
    const m=lookupMessage(kind,conversation,mid);
    if (!m) {notice('That message is not loaded yet.');return;}
    state.replyTarget={kind,conversation,id:String(m.id),senderName:bcName(m.from),snippet:trim(m.text,125)};
    renderReplyBar();
    ui.shadow?.getElementById('kc-compose')?.focus();
  }
  function renderReplyBar() {
    const el=ui.shadow?.getElementById('kc-reply-banner');
    if (!el) return;
    const r=state.replyTarget;
    const conversation=currentGroup()?state.selectedGroup:state.selected;
    if (!r || r.kind!==currentConversationKind() || String(r.conversation)!==String(conversation)) {el.classList.add('hidden');el.innerHTML='';return;}
    el.classList.remove('hidden');
    el.innerHTML=`<span>↪ Replying to <b>${escapeText(r.senderName)}</b>: ${escapeText(r.snippet)}</span><button class="iconbutton" data-action="cancelreply" title="Cancel reply">✕</button>`;
  }
  async function applyReaction(kind,conversation,mid,member,emoji,remove=false,mustBeWhisper=false,expectedAuthor=0) {
    emoji=trim(emoji,12);mid=trim(mid,100);member=numeric(member);
    if (!member || !mid || !emoji) return;
    const recent=visibleHistoryTail(kind,conversation);
    let msg=recent.find(m=>m.id===mid) || state.historyOlder.find(m=>m.id===mid && state.historySelection===historySelectionKey(kind,conversation));
    if (!msg) {
      try {
        await flushHistoryArchive();
        const db=await historyDb();
        msg=await new Promise(resolve=>{
          const req=db.transaction('messages','readonly').objectStore('messages').get(`${state.myId}:${kind}:${conversation}:${mid}`);
          req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);
        });
      } catch {};
    }
    if (!msg || (mustBeWhisper && msg.mode!=='whisper')||(expectedAuthor&&msg.from!==expectedAuthor)) return;
    const reactions=normalizeReactions(msg.reactions);
    const members=new Set(reactions[emoji]||[]);
    if (remove) members.delete(member); else members.add(member);
    if (members.size) reactions[emoji]=[...members]; else delete reactions[emoji];
    msg.reactions=reactions;
    for (const m of recent) if(m.id===mid) m.reactions=reactions;
    for (const m of state.historyOlder) if(m.id===mid) m.reactions=reactions;
    archiveMessages(state.myId,kind,conversation,[msg]);saveSoon();
    if (state.open && (state.tab==='chats'||state.tab==='groups')) {
      if (kind==='group' && state.tab==='groups' && state.selectedGroup===conversation) renderGroupChat();
      if (kind==='chat' && state.tab==='chats' && state.selected===Number(conversation)) renderMessages();
    }
  }
  // Whisper IDs travel in the native BC Dictionary, leaving whisper text untouched.
  // They must be assigned *before* ServerSend queues the packet, so the sender
  // and recipient can refer to exactly the same bubble when reacting.
  const PAW_WHISPER_ID_TAG='KCPawWhisperId';
  const PAW_WHISPER_REACTION='KCPawWhisperReaction';
  const PAW_HIDDEN_REACTION_PREFIX='KCPawWhisperReaction:';
  const PAW_HIDDEN_TYPING_PREFIX='KCPawTyping:';
  // Short-lived; never persisted. Avoid one friend's keystrokes throttling another's.
  const typingSendTimes=new Map();
  function nativeWhisperId(packet){
    const dictionary=Array.isArray(packet?.Dictionary)?packet.Dictionary:[];
    const own=dictionary.find(v=>v?.Tag===PAW_WHISPER_ID_TAG);
    const native=dictionary.find(v=>v?.Tag==='MsgId');
    return trim(own?.Text||own?.Id||native?.MsgId||'',90);
  }
  function prepareOutgoingWhisper(packet){
    if(!packet||packet.Type!=='Whisper'||typeof packet.Content!=='string')return '';
    if(!Array.isArray(packet.Dictionary))packet.Dictionary=[];
    let id=nativeWhisperId(packet);
    if(!packet.Dictionary.some(v=>v?.Tag===PAW_WHISPER_ID_TAG)){
      // Never reuse the native MsgId, which may be regenerated by the BC queue.
      id=uniqueMessageId();
      packet.Dictionary.push({Tag:PAW_WHISPER_ID_TAG,Text:id});
    }
    return id;
  }
  function whisperReactionWire(message,mid,emoji,remove){
    return {type:PAW_WHISPER_REACTION,v:1,nonce:integrityNonce(),mid:trim(mid,90),emoji:trim(emoji,12),remove:!!remove,
      source:numeric(message.from),quote:trim(message.text,150),length:message.text.length};
  }
  function validWhisperReaction(data){
    if(!data||data.type!==PAW_WHISPER_REACTION||data.v!==1)return null;
    const mid=trim(data.mid,90),emoji=trim(data.emoji,12),source=numeric(data.source);
    const quote=trim(data.quote,150),length=Number(data.length);
    if(!mid||!emoji||!source||emoji.length>12||!quote||!Number.isSafeInteger(length)||length<1||length>2000)return null;
    return {mid,emoji,source,quote,length,remove:data.remove===true};
  }
  function locateWhisperReaction(member,packet){
    const chat=state.chats[member];
    if(!chat)return packet.mid;
    const recent=[...chat.messages,...(state.historySelection===historySelectionKey('chat',member)?state.historyOlder:[])];
    const exact=recent.find(m=>m.id===packet.mid&&m.mode==='whisper'&&m.from===packet.source);
    if(exact)return exact.id;
    // Compatibility for existing whispers stored before v0.9.6. Only
    // resolve by content when unique; never guess between identical messages.
    const legacy=recent.filter(m=>m.mode==='whisper'&&m.from===packet.source&&
      m.text.length===packet.length&&trim(m.text,150)===packet.quote);
    return legacy.length===1?legacy[0].id:packet.mid;
  }
  function receiveWhisperReaction(data,from){
    from=numeric(from);
    const packet=validWhisperReaction(data);
    if(!from||from===me()||!packet||![from,me()].includes(packet.source))return false;
    if(!state.chats[from])return false;
    const id=locateWhisperReaction(from,packet);
    // The archive validates message authorship even for older, paged messages.
    // applyReaction updates the archive, the visible chips and saved chat data.
    void applyReaction('chat',from,id,from,packet.emoji,packet.remove,true,packet.source);
    return true;
  }
  function sendWhisperReaction(member,original,emoji,remove){
    const packet=whisperReactionWire(original,original.id,emoji,remove);
    if(myFriends().includes(member) && pawSend(member,PAW_WHISPER_REACTION,packet))return true;
    if(!inRoom(member)||typeof window.ServerSend!=='function'){
      notice('Whisper reactions need a BC friendship or both players in the same room.');
      return false;
    }
    // BC Hidden messages do not create a normal whisper/chat entry. This
    // targeted path also supports players who are not on each other's BC list.
    try {
      window.ServerSend('ChatRoomChat',{Type:'Hidden',Target:member,
        Content:PAW_HIDDEN_REACTION_PREFIX+pawWireJSON(packet)});
      return true;
    }catch(err){console.warn('[PawLounge] Whisper reaction send failed:',err);notice('Could not send whisper reaction.');return false;}
  }
  // Type indicators are ephemeral and never enter message history, notifications,
  // the outbox or normal native chat. Sender identity comes from BC's outer packet.
  function receiveTypingPaws(packet,from,transport){
    from=numeric(from);
    if(!from||from===me()||!packet||packet.type!=='KCTyping'||packet.v!==1||
       typeof packet.typing!=='boolean'||
       (packet.mode!==undefined&&!['beep','whisper'].includes(packet.mode)))return false;
    if(transport==='whisper'&&(!inRoom(from)||packet.mode!=='whisper'))return false;
    state.typingUntil[from]=packet.typing?Date.now()+5500:0;
    if(state.open&&state.tab==='chats'&&state.selected===from)renderChatHeader();
    return true;
  }
  function onHiddenTypingPacket(data,senderCharacter=null){
    if(data?.Type!=='Hidden'||typeof data.Content!=='string'||
       !data.Content.startsWith(PAW_HIDDEN_TYPING_PREFIX))return false;
    // Recognized control messages are consumed even when malformed: never turn
    // a hostile or outdated control packet into a visible chat notification.
    if(data.Content.length>1100)return true;
    const from=numeric(data.Sender??data.MemberNumber??senderCharacter?.MemberNumber);
    const target=numeric(data.Target??data.TargetMemberNumber??data.Recipient);
    if(!from||from===me()||(target&&target!==me())||!inRoom(from))return true;
    try {
      if(inboundLimit(from,'typing',data.Content,850))
        receiveTypingPaws(pawParseWireJSON(data.Content.slice(PAW_HIDDEN_TYPING_PREFIX.length),1000),from,'whisper');
    }catch { /* Invalid packet: no message, no presence update. */ }
    return true;
  }
  function onWhisperReactionPacket(data,senderCharacter=null){
    if(data?.Type!=='Hidden'||typeof data.Content!=='string'||
        !data.Content.startsWith(PAW_HIDDEN_REACTION_PREFIX)||data.Content.length>1100)return false;
    const from=numeric(data.Sender??data.MemberNumber??senderCharacter?.MemberNumber);
    const target=numeric(data.Target??data.TargetMemberNumber??data.Recipient);
    if(!from||from===me()||(target&&target!==me()))return false;
    try{if(!inboundLimit(from,'reaction',data.Content,750))return false;const p=pawParseWireJSON(data.Content.slice(PAW_HIDDEN_REACTION_PREFIX.length),2200);return integrityAcceptEvent('whisperReaction',from,p)&&receiveWhisperReaction(p,from);}
    catch{return false;}
  }
  function replyAndReact(kind,mid,emoji) {
    const conversation=kind==='group'?state.selectedGroup:state.selected;
    const m=lookupMessage(kind,conversation,mid);
    if (!m) {notice('Load the message before reacting.');return;}
    if(kind==='chat' && m.mode!=='whisper' && !m.nativeId){notice('This older beep has no native message ID for reactions. New beeps support them.');return;}
    const remove=(normalizeReactions(m.reactions)[emoji]||[]).includes(me());
    if (kind==='group') {
      const g=currentGroup();if(!g)return;
      let sent=0;
      for (const id of g.accepted) if(id!==me()) if(sendGroupWire(id,{t:'react',id:g.id,mid,emoji,remove},'♡ Group reaction',true))sent++;
      if (!sent) {notice('No group members available to receive this reaction.');return;}
      void applyReaction(kind,g.id,mid,me(),emoji,remove);
    } else if(m.mode==='whisper'){
      if(sendWhisperReaction(conversation,m,emoji,remove))
        void applyReaction('chat',conversation,mid,me(),emoji,remove,true);
    } else {
      if (typeof window.ServerSendBeepMessage!=='function') {notice('Native reactions need a BC build with reaction support.');return;}
      if (!myFriends().includes(conversation)) {notice('You can react to native beeps from BC friends.');return;}
      try {state.suppressOutgoing=true;window.ServerSendBeepMessage(conversation,emoji,{messageType:'Reaction',reactionTo:mid,reactionEmoji:emoji,reactionRemove:remove});
        void applyReaction(kind,conversation,mid,me(),emoji,remove);
      } catch(err) {notice('Could not send reaction.');console.warn('[Kittychat]',err);} finally{state.suppressOutgoing=false;}
    }
  }
  // v0.7.34: durable, per-account private/group message archive. The small
  // localStorage copies below are only a fast UI cache, NOT the archive.
  // No profile images or WCE appearance data are stored here.
  const historyArchive = { dbPromise:null, pending:[], flushPromise:null, flushScheduled:false, error:'', saved:0, fetched:0 };
  const HISTORY_DB='kittychat-message-archive-v1';
  const HISTORY_PAGE=80;
  const historyClock={last:0};
  const monotonicMessageTime=()=>{ const now=Math.max(Date.now(),historyClock.last+1); historyClock.last=now; return now; };
  function historyDb() {
    if (historyArchive.dbPromise) return historyArchive.dbPromise;
    historyArchive.dbPromise = new Promise((resolve,reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB is unavailable')); return; }
      const request = indexedDB.open(HISTORY_DB,1);
      request.onupgradeneeded=() => {
        const db=request.result;
        if (!db.objectStoreNames.contains('messages')) {
          const store=db.createObjectStore('messages',{keyPath:'key'});
          store.createIndex('byAccount','account',{unique:false});
          store.createIndex('byConversation',['account','kind','conversation','time','key'],{unique:false});
        }
      };
      request.onsuccess=() => { const db=request.result; db.onversionchange=()=>db.close(); resolve(db); };
      request.onerror=()=>reject(request.error || new Error('Cannot open message archive'));
      request.onblocked=()=>reject(new Error('Another tab has an older message archive open'));
    }).catch(error=>{
      historyArchive.error=String(error?.message||error);
      historyArchive.dbPromise=null;
      throw error;
    });
    return historyArchive.dbPromise;
  }
  function historyRecord(account,kind,conversation,message) {
    const member=numeric(account);
    const group=kind==='group';
    const conv=String(conversation);
    // Never archive a private whisper/beep whose author is neither the signed-in
    // account nor the intended conversation partner. The key is account-scoped.
    if(!group&&(!numeric(conversation)||![member,numeric(conversation)].includes(numeric(message?.from))))return null;
    if (!member || !['chat','group'].includes(kind) || !conv || !message || typeof message.text!=='string') return null;
    const time=Number(message.time)||Date.now();
    const msgId=trim(message.id,90) || uniqueMessageId();
    const key=`${member}:${kind}:${conv}:${msgId}`;
    return {key,account:member,kind,conversation:conv,time,
      id:msgId,from:numeric(message.from),text:pawCodecEncode(trim(message.text,group?MAX_GROUP_TEXT:2000)),
      replyTo:normalizeReply(message.replyTo),reactions:normalizeReactions(message.reactions),nativeId:!!message.nativeId,
      ...(group?{recovered:!!message.recovered,verifiedBy:(message.verifiedBy||[]).slice(0,MAX_GROUP_MEMBERS)}:{mode:message.mode==='whisper'?'whisper':'beep',reaction:trim(message.reaction||'',6)})};
  }
  function pawDecodeHistoryRow(row){
    if(row&&typeof row.text==='string'&&row.text.startsWith(PAW_CODEC_PREFIX)){
      try{const decoded=pawCodecDecode(row.text,12000);row={...row,text:typeof decoded==='string'?decoded:''};}catch{pawCodecMetrics.failed++;row={...row,text:'[Damaged encoded message]'};}
    }
    if(row && (!row.id || typeof row.id!=='string')) row={...row,id:row.key?`legacy_${String(row.key).replace(/[^a-zA-Z0-9_-]/g,'_').slice(-64)}`:uniqueMessageId()};
    return row;
  }
  function archiveMessages(account,kind,conversation,messages) {
    for (const message of messages) {
      const row=historyRecord(account,kind,conversation,message);
      if (row) historyArchive.pending.push(row);
    }
    if (!historyArchive.flushScheduled) {
      historyArchive.flushScheduled=true;
      Promise.resolve().then(() => {
        historyArchive.flushScheduled=false;
        void flushHistoryArchive().catch(()=>{});
      });
    }
  }
  async function flushHistoryArchive() {
    if (historyArchive.flushPromise) {
      await historyArchive.flushPromise;
      if (!historyArchive.pending.length) return;
    }
    if (!historyArchive.pending.length) return;
    const work=(async () => {
      const db=await historyDb();
      while (historyArchive.pending.length) {
        const batch=historyArchive.pending.splice(0,300);
        try {
          await new Promise((resolve,reject) => {
            const tx=db.transaction('messages','readwrite');
            const store=tx.objectStore('messages');
            for (const row of batch) store.put(row);
            tx.oncomplete=resolve;
            tx.onerror=()=>reject(tx.error||new Error('History write failed'));
            tx.onabort=()=>reject(tx.error||new Error('History write aborted'));
          });
          historyArchive.saved+=batch.length;
          historyArchive.error='';
        } catch(err) {
          historyArchive.pending.unshift(...batch);
          throw err;
        }
      }
    })();
    historyArchive.flushPromise=work;
    try { await work; }
    catch(err) { historyArchive.error=String(err?.message||err); console.warn('[Kittychat] Could not save full message history:',err); throw err; }
    finally { if (historyArchive.flushPromise===work) historyArchive.flushPromise=null; }
  }
  function historyRange(account,kind,conversation,before) {
    const lower=[account,kind,String(conversation),0,''];
    const upper=before ? [account,kind,String(conversation),before.time,before.key]
      : [account,kind,String(conversation),8640000000000000,'\uffff'];
    return IDBKeyRange.bound(lower,upper,false,!!before);
  }
  async function readHistoryPage(account,kind,conversation,before=null,limit=HISTORY_PAGE) {
    await flushHistoryArchive();
    const db=await historyDb();
    return new Promise((resolve,reject) => {
      const tx=db.transaction('messages','readonly');
      const index=tx.objectStore('messages').index('byConversation');
      const result=[];
      const request=index.openCursor(historyRange(account,kind,conversation,before),'prev');
      request.onsuccess=() => {
        const cursor=request.result;
        if (!cursor || result.length>limit) return;
        const row=cursor.value;
        if(row?.account===account && row.kind===kind && row.conversation===String(conversation) &&
           (kind==='group'||[account,numeric(conversation)].includes(numeric(row.from))))
          result.push(pawDecodeHistoryRow(row));
        if (result.length<=limit) cursor.continue();
      };
      request.onerror=()=>reject(request.error);
      tx.oncomplete=()=> { historyArchive.fetched+=Math.min(limit,result.length); resolve({rows:result.slice(0,limit).reverse(),more:result.length>limit}); };
      tx.onerror=()=>reject(tx.error||new Error('History read failed'));
    });
  }
  function historySelectionKey(kind,conversation) { return `${kind}:${conversation}`; }
  function visibleHistoryTail(kind,conversation) {
    return kind==='group' ? state.groups[conversation]?.messages||[] : state.chats[conversation]?.messages||[];
  }
  async function prepareHistoryView(kind,conversation) {
    const sel=historySelectionKey(kind,conversation);
    if (state.historySelection===sel) return;
    const epoch=++state.historyEpoch;
    state.historySelection=sel;
    state.historyOlder=[];state.historyHasMore=false;state.historyLoading=true;
    const recent=visibleHistoryTail(kind,conversation);
    const oldest=recent.length ? recent[0] : null;
    const before=oldest ? historyRecord(state.myId,kind,conversation,oldest) : null;
    const cursorBefore=before ? {time:before.time,key:before.key} : null;
    try {
      const page=await readHistoryPage(state.myId,kind,conversation,cursorBefore,HISTORY_PAGE);
      if (epoch!==state.historyEpoch) return;
      state.historyOlder=page.rows;
      state.historyHasMore=page.more;
    } catch(err) {
      if (epoch!==state.historyEpoch) return;
      historyArchive.error=String(err?.message||err);
    } finally {
      if (epoch===state.historyEpoch) {
        state.historyLoading=false;
        if (state.open && (state.tab==='chats'||state.tab==='groups')) {
          if (kind==='chat' && state.tab==='chats' && state.selected===Number(conversation)) renderMessages();
          if (kind==='group' && state.tab==='groups' && state.selectedGroup===conversation) renderGroupChat();
        }
      }
    }
  }
  async function loadOlderHistory() {
    if (state.historyLoading || !state.historyHasMore || !state.historySelection) return;
    const [kind,...rest]=state.historySelection.split(':');
    const conversation=rest.join(':');
    const epoch=state.historyEpoch;
    const oldest=state.historyOlder[0];
    if (!oldest) { state.historyHasMore=false; return; }
    state.historyLoading=true;
    try {
      const page=await readHistoryPage(state.myId,kind,conversation,{time:oldest.time,key:oldest.key},HISTORY_PAGE);
      if (epoch!==state.historyEpoch) return;
      const seen=new Set(state.historyOlder.map(m=>m.key));
      state.historyOlder=[...page.rows.filter(m=>!seen.has(m.key)),...state.historyOlder];
      state.historyHasMore=page.more;
    } catch(err) { historyArchive.error=String(err?.message||err); notice('Could not load older messages from the local archive.'); }
    finally {
      if (epoch===state.historyEpoch) {
        state.historyLoading=false;
        if (kind==='chat' && state.tab==='chats' && state.selected===Number(conversation)) renderMessages(true);
        if (kind==='group' && state.tab==='groups' && state.selectedGroup===conversation) renderGroupChat(true);
      }
    }
  }
  function historyDisplayMessages(kind,conversation,recent) {
    if (state.historySelection!==historySelectionKey(kind,conversation)) return recent;
    const seen=new Set();
    return [...state.historyOlder,...recent].filter(m=>{
      const id=String(m.id||`${m.time}|${m.from}|${m.text}`);
      if (seen.has(id)) return false;
      seen.add(id);return true;
    }).sort((a,b)=>a.time-b.time);
  }
  function historyLoadButton() {
    if (!state.historySelection) return '';
    if (state.historyLoading) return '<div class="kc-archive-state">🐾 Loading message archive...</div>';
    return state.historyHasMore ? '<button class="kc-history-older" data-action="loadolderhistory">↑ Load 80 older messages</button>' : '';
  }
  function importAvailableNativeBeeps() {
    const entries=window.FriendListBeepLog;
    if (!Array.isArray(entries) || !entries.length) {
      notice('No existing BC beep log is available in this session.');
      return 0;
    }
    let imported=0;
    for (const entry of entries) {
      if (!entry || typeof entry!=='object' || (entry.BeepType && entry.BeepType!=='')) continue;
      const member=numeric(entry.MemberNumber ?? entry.MemberID ?? entry.Member ?? entry.SenderMemberNumber);
      if (!member || member===me()) continue;
      const original=entry.Message ?? entry.Content;
      if (typeof original!=='string' || !original.trim()) continue;
      const parsed=parseNativeBeep(original);
      if (parsed.reaction || !parsed.text || parsed.text==='(Beep)') continue;
      const from=(entry.Sent===true || entry.Sent===1 || entry.IsSent===true) ? me() : member;
      const rawDate=entry.Time ?? entry.Timestamp ?? entry.Date;
      const date=rawDate==null ? NaN : new Date(rawDate).getTime();
      const time=Number.isFinite(date) && date>0 ? date : Date.now();
      const text=trim(stripNativeBeepMetadata(parsed.text),2000);
      const chat=ensure(member);
      if (!chat || !text) continue;
      if (chat.messages.some(m=>m.from===from && m.text===text && Math.abs(m.time-time)<2500)) continue;
      let digest=0;
      for (let i=0;i<text.length;i++) digest=((digest<<5)-digest+text.charCodeAt(i))|0;
      const msg={id:`bc-native-${member}-${time}-${from}-${(digest>>>0).toString(36)}`,
        text,from,time,mode:'beep'};
      archiveMessages(state.myId,'chat',member,[msg]);
      if (!chat.messages.some(m=>m.id===msg.id)) {
        chat.messages.push(msg);
        chat.messages.sort((a,b)=>a.time-b.time);
        chat.messages=chat.messages.slice(-MAX_MESSAGES);
        chat.updated=Math.max(Number(chat.updated)||0,time);
      }
      imported++;
    }
    if (imported) { saveSoon(); updateBadge(); if (state.open) render(); }
    notice(imported ? `🐾 Imported ${imported} BC beep records into the archive.` : 'No new BC beep records were available to import.');
    return imported;
  }

  async function exportFullHistory() {
    const account=state.myId;
    if (!account) return;
    try {
      await flushHistoryArchive();
      const db=await historyDb();
      const rows=await new Promise((resolve,reject)=>{
        const result=[];
        const tx=db.transaction('messages','readonly');
        const request=tx.objectStore('messages').index('byAccount').openCursor(IDBKeyRange.only(account));
        request.onsuccess=()=>{const cursor=request.result;if(cursor){result.push(pawDecodeHistoryRow(cursor.value));cursor.continue();}};
        request.onerror=()=>reject(request.error);
        tx.oncomplete=()=>resolve(result);
        tx.onerror=()=>reject(tx.error);
      });
      const backup={version:3,format:'Kittychat full history',account,exported:new Date().toISOString(),
        chats:state.chats,groups:state.groups,profiles:state.profiles,moments:state.moments,roomFavorites:state.roomFavorites,roomRecent:state.roomRecent,roomSort:state.roomSort,
        messages:rows.sort((a,b)=>a.time-b.time),
        subbycatsPlaceLast20:state.roomHistory.slice(-20)};
      download(`Kittychat-FULL-backup-${account}-${new Date().toISOString().slice(0,10)}.json`,
        'application/json',JSON.stringify(backup,null,2));
      notice(`🐾 Full archive exported (${rows.length} saved messages).`);
    } catch(err) { historyArchive.error=String(err?.message||err); notice('Could not export your chat archive. Please try again.'); }
  }
  async function eraseArchivedHistory(account,kind=null,conversation=null) {
    try {
      await flushHistoryArchive();
      const db=await historyDb();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('messages','readwrite');
        const store=tx.objectStore('messages');
        const idx=kind ? store.index('byConversation') : store.index('byAccount');
        const range=kind ? historyRange(account,kind,conversation,null) : IDBKeyRange.only(account);
        const request=idx.openCursor(range);
        request.onsuccess=()=>{const cursor=request.result;if(cursor){cursor.delete();cursor.continue();}};
        request.onerror=()=>reject(request.error);
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error||new Error('Cannot erase archive'));
      });
      if (kind && state.historySelection===historySelectionKey(kind,conversation)) {
        state.historyOlder=[];state.historyHasMore=false;state.historySelection='';
        state.historyEpoch++;
      }
      historyArchive.error='';
    } catch(err){historyArchive.error=String(err?.message||err);notice('Could not delete your chat archive. Please try again.');}
  }

  const saveSoon = () => {
    clearTimeout(state.lastSave);
    state.lastSave = setTimeout(saveNow, 650);
  };
  // Small fast-cache snapshots. Durable message history remains in IndexedDB.
  // A snapshot is NEVER reduced until IndexedDB confirms the message archive
  // transaction has finished; this protects accounts with a broken archive.
  let pawCacheArchiveReadyFor=0;
  let pawCacheCompactionRunning=false;
  let pawCacheCompactions=0;
  let pawCacheLastCompactionError='';
  function pawCacheSnapshot(){
    return { settings: state.settings, chats: state.chats, groups: state.groups, profiles: state.profiles,
      moments:state.moments.slice(-MOMENT_LIMIT), circles:state.circles.slice(0,30),
      catchUpSince:state.catchUpSince,catchUpWhispersSince:state.catchUpWhispersSince,
      catchUpGroupsSince:state.catchUpGroupsSince,
      sharedAlbums:pawBookVault.active?[]:state.sharedAlbums.slice(-30),
      privateBookPages:pawBookVault.active?{}:state.privateBookPages,
      invitations:state.invitations.slice(-70),pawGuestbook:state.pawGuestbook.slice(-50),
      roomFavorites:state.roomFavorites.slice(-70),roomRecent:state.roomRecent.slice(-25),roomSort:state.roomSort,
      scheduledMessages:state.scheduledMessages.slice(-100),deliveryOutbox:state.deliveryOutbox.slice(-120),
      integritySeen:state.integritySeen.slice(-INTEGRITY_LOG_LIMIT),fabPosition:state.fabPosition,
      windowRect:pawViewportScale.mobile&&pawViewportScale.lastDesktopRect?pawViewportScale.lastDesktopRect:state.windowRect,
      lastSelected:state.selected,lastSelectedGroup:state.selectedGroup,
      roomHistory:state.roomHistory.slice(-20),roomMemories:state.roomMemories.slice(-60),
      leftCollapsed:state.leftCollapsed,rightCollapsed:state.rightCollapsed };
  }
  function pawCompactSnapshot(snapshot, emergency=false){
    const maxActive=emergency?12:40, maxTail=emergency?5:24;
    // Preserve all contact and group metadata so the user can reopen an older
    // conversation; their actual messages come from the IndexedDB archive.
    const recent=Object.entries(snapshot.chats||{}).sort((a,b)=>(b[1]?.updated||0)-(a[1]?.updated||0));
    const active=new Set(recent.slice(0,maxActive).map(([k])=>k));
    const chats=Object.fromEntries(recent.map(([k,chat])=>[
      k,{...chat,messages:active.has(k)?(chat.messages||[]).slice(-maxTail):[]}
    ]));
    const groups=Object.fromEntries(Object.entries(snapshot.groups||{}).map(([k,group])=>[
      k,{...group,messages:(group.messages||[]).slice(-maxTail)}
    ]));
    const outbox=(snapshot.deliveryOutbox||[]).filter(x=>
      !['sent','acknowledged','cancelled'].includes(x?.status)||
      (Number(x.updated||x.created)||Date.now())>Date.now()-7*86400000);
    return {...snapshot,chats,groups,
      deliveryOutbox:outbox.slice(emergency?-35:-75),
      integritySeen:(snapshot.integritySeen||[]).slice(emergency?-90:-180),
      roomHistory:(snapshot.roomHistory||[]).slice(emergency?-8:-14),
      roomRecent:(snapshot.roomRecent||[]).slice(emergency?-12:-20)};
  }
  // v1.2.0: Durable, account-isolated bulk snapshots. Native BC, WCE, BCX,
  // Plushies and encrypted Marvelous key-vault storage are never touched.
  const pawBulkState = {database:null,loading:null,chain:Promise.resolve(),queued:0,saved:0,restored:0,
    error:'',hydrating:false,lastSaved:0};
  let pawDataRevision=0;
  let pawHydrationAccount=0;
  let pawSaveRequestedWhileHydrating=false;
  // Per-BC-account storage boundaries. "Mine" contains settings and private
  // journal material; "shared" includes conversation data; "peers" is an
  // expiring cache of OTHER people's profile/presence data only. All three
  // stores commit atomically. No BCX/WCE keys or Paw Notes vaults are touched.
  const PAW_PEER_DAYS=[1,7,14,30];
  const PAW_PEER_CAPS=[50,100,200,400];
  const PAW_SHARED_KEYS=['chats','groups','invitations','pawGuestbook','sharedAlbums',
    'privateBookPages','scheduledMessages','deliveryOutbox','roomHistory'];
  function pawPeerPolicy(){
    return {
      days:PAW_PEER_DAYS.includes(Number(state.settings.peerCacheDays))?Number(state.settings.peerCacheDays):7,
      cap:PAW_PEER_CAPS.includes(Number(state.settings.peerCacheCap))?Number(state.settings.peerCacheCap):200
    };
  }
  function pawProtectedPeers(snapshot,account){
    const keep=new Set([String(account)]);
    for(const [id,chat] of Object.entries(snapshot.chats||{}))
      if(chat&&(chat.favorite===true||chat.pinned===true))keep.add(String(id));
    for(const circle of snapshot.circles||[])
      for(const id of circle?.members||[])if(numeric(id))keep.add(String(id));
    return keep;
  }
  function pawPartitionSnapshot(account,snapshot){
    const personal={...snapshot};
    const shared={};
    for(const key of PAW_SHARED_KEYS){
      shared[key]=personal[key];delete personal[key];
    }
    delete personal.profiles;
    const policy=pawPeerPolicy(),now=Date.now();
    const pinned=pawProtectedPeers(snapshot,account);
    const peers=Object.entries(snapshot.profiles||{}).filter(([id,p])=>
      numeric(id)&&Number(id)!==account&&p&&typeof p==='object'&&!Array.isArray(p))
      .map(([id,p])=>[id,p,Math.min(now,Number(p?._marvelousSeenAt||p?.updated)||now)]);
    const kept=peers.filter(([id,p,at])=>pinned.has(id)||now-at<=policy.days*86400000);
    const protectedEntries=kept.filter(([id])=>pinned.has(id));
    const temporary=kept.filter(([id])=>!pinned.has(id)).sort((a,b)=>b[2]-a[2]).slice(0,policy.cap);
    const peerProfiles=Object.fromEntries([...protectedEntries,...temporary].map(([id,v,at])=>
      [id,{...v,_marvelousSeenAt:at}]));
    if(snapshot.profiles?.[account])personal.ownProfile=snapshot.profiles[account];
    return {personal,shared,peers:peerProfiles,
      counts:{personal:1,sharedChats:Object.keys(shared.chats||{}).length,
        peers:Object.keys(peerProfiles).length,protectedPeers:protectedEntries.length,
        expired:peers.length-kept.length,overCap:kept.length-protectedEntries.length-temporary.length}};
  }
  function pawBulkDb(){
    if(pawBulkState.loading)return pawBulkState.loading;
    pawBulkState.loading=new Promise((resolve,reject)=>{
      if(!window.indexedDB)return reject(Error('IndexedDB unavailable'));
      const r=window.indexedDB.open('Marvelous-PawLounge-Storage-v2',2);
      r.onupgradeneeded=()=>{
        for(const store of ['accounts','shared','peerCache'])
          if(!r.result.objectStoreNames.contains(store))
            r.result.createObjectStore(store,{keyPath:'account'});
      };
      r.onerror=()=>reject(r.error||Error('Cannot open PawLounge storage'));
      r.onblocked=()=>reject(Error('PawLounge storage is blocked by another tab'));
      r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>{db.close();pawBulkState.loading=null;};
        pawBulkState.database=db;resolve(db);};
    }).catch(err=>{pawBulkState.loading=null;throw err;});
    return pawBulkState.loading;
  }
  async function pawBulkRead(account){
    const db=await pawBulkDb();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(['accounts','shared','peerCache'],'readonly');
      let owner=null,shared=null,peers=null;
      tx.objectStore('accounts').get(account).onsuccess=e=>{owner=e.target.result||null;};
      tx.objectStore('shared').get(account).onsuccess=e=>{shared=e.target.result||null;};
      tx.objectStore('peerCache').get(account).onsuccess=e=>{peers=e.target.result||null;};
      tx.oncomplete=()=>{
        if(!owner){resolve(null);return;}
        if(owner.format!==3){resolve(owner);return;} // read previous v2 records
        if(!shared||!peers){reject(Error('Account storage is incomplete: keeping old cache unchanged.'));return;}
        const personal=owner.snapshot||{};
        const profile={...(peers.profiles||{})};
        if(personal.ownProfile)profile[account]=personal.ownProfile;
        const {ownProfile,...rest}=personal;
        resolve({...owner,snapshot:{...rest,...(shared.snapshot||{}),profiles:profile}});
      };
      tx.onerror=()=>reject(tx.error||Error('Bulk read transaction failed'));
      tx.onabort=()=>reject(tx.error||Error('Bulk read aborted'));
    });
  }
  async function pawBulkPut(account,snapshot){
    const db=await pawBulkDb();
    const savedAt=Date.now(),parts=pawPartitionSnapshot(account,snapshot);
    // A single transaction means a failed write cannot split the records.
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(['accounts','shared','peerCache'],'readwrite');
      tx.objectStore('accounts').put({account,snapshot:parts.personal,savedAt,format:3});
      tx.objectStore('shared').put({account,snapshot:parts.shared,savedAt});
      tx.objectStore('peerCache').put({account,profiles:parts.peers,savedAt,policy:pawPeerPolicy()});
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||Error('Partition write failed'));
      tx.onabort=()=>reject(tx.error||Error('Partition write aborted'));
    });
    pawBulkState.partitionCounts=parts.counts;
    return savedAt;
  }
  function pawFastSnapshot(snapshot,stamp){
    // Preserve all contact/group metadata. Full content is in IndexedDB and
    // the existing separate per-message archive. No key vault is included.
    const outbox=(snapshot.deliveryOutbox||[]).filter(x=>
      !['sent','acknowledged','cancelled'].includes(x?.status)||
      (Number(x.updated||x.created)||0)>Date.now()-7*86400000);
    const chats=Object.fromEntries(Object.entries(snapshot.chats||{}).map(([id,c])=>
      [id,{...c,messages:[]}]));
    const groups=Object.fromEntries(Object.entries(snapshot.groups||{}).map(([id,c])=>
      [id,{...c,messages:[]}]));
    return {...snapshot,chats,groups,
      profiles:{}, // OTHER players live exclusively in the bounded peer cache
      moments:(snapshot.moments||[]).slice(-12),
      sharedAlbums:[],privateBookPages:{},pawGuestbook:[],invitations:[],
      roomMemories:(snapshot.roomMemories||[]).slice(-12),
      integritySeen:(snapshot.integritySeen||[]).slice(-80),
      roomHistory:(snapshot.roomHistory||[]).slice(-8),
      roomRecent:(snapshot.roomRecent||[]).slice(-12),
      deliveryOutbox:outbox.slice(-75),
      _bulkStoredAt:stamp,_bulkFormat:2};
  }
  function pawMinimumSnapshot(snapshot,stamp){
    const small=pawFastSnapshot(snapshot,stamp);
    // Last-resort bootstrap: all other content has already been durably
    // committed to IndexedDB. Keep unsent outbox and small preferences local.
    return {...small,profiles:{},moments:[],sharedAlbums:[],invitations:[],
      pawGuestbook:[],roomMemories:[],roomFavorites:[],roomRecent:[],
      chats:Object.fromEntries(Object.entries(small.chats).map(([id,c])=>
        [id,{id:c.id,displayName:c.displayName,updated:c.updated,
          unread:c.unread,draft:c.draft,messages:[]}])),
      groups:Object.fromEntries(Object.entries(small.groups).map(([id,c])=>
        [id,{...c,messages:[],polls:[],receipts:{}}])),
      deliveryOutbox:small.deliveryOutbox,
      _bulkStoredAt:stamp,_bulkFormat:2};
  }
  function pawBulkSave(account,snapshot){
    if(!account)return;
    const revision=++pawDataRevision;
    pawBulkState.queued++;
    const commit=async()=>{
      if(account===state.myId && revision!==pawDataRevision)return;
      // Every message MUST reach the indexed archive before its UI copy shrinks.
      if(pawCacheArchiveReadyFor!==account){
        for(const [id,c] of Object.entries(snapshot.chats||{}))
          if(numeric(id)&&Array.isArray(c.messages))archiveMessages(account,'chat',id,c.messages);
        for(const [id,g] of Object.entries(snapshot.groups||{}))
          if(/^g_[a-zA-Z0-9_-]{8,44}$/.test(id)&&Array.isArray(g.messages))
            archiveMessages(account,'group',id,g.messages);
      }
      await flushHistoryArchive();
      const stamp=await pawBulkPut(account,snapshot);
      pawBulkState.saved++;pawBulkState.error='';pawBulkState.lastSaved=stamp;
      pawCacheArchiveReadyFor=account;
      // Never overwrite a newer local session's cache with an older snapshot.
      if(account===state.myId && revision===pawDataRevision){
        if(!safeWrite(dataKey(),pawFastSnapshot(snapshot,stamp))&&
           !safeWrite(dataKey(),pawMinimumSnapshot(snapshot,stamp)))
          pawBulkState.error='IndexedDB saved but localStorage is entirely full; free another addon cache manually.';
      }
    };
    pawBulkState.chain=pawBulkState.chain.catch(()=>{}).then(commit).catch(e=>{
      pawBulkState.error=String(e?.message||e);
      // Keep the original local snapshot if the IDB write failed. Never
      // remove or compact unarchived records.
      if(account===state.myId && revision===pawDataRevision)
        safeWrite(dataKey(),snapshot);
    }).finally(()=>{pawBulkState.queued=Math.max(0,pawBulkState.queued-1);});
  }
  function pawMergeMessages(previous,current){
    const result=new Map();
    for(const m of previous||[])if(m&&typeof m.id==='string')result.set(m.id,m);
    for(const m of current||[])if(m&&typeof m.id==='string')result.set(m.id,m);
    return [...result.values()].sort((a,b)=>(Number(a.time)||0)-(Number(b.time)||0)).slice(-MAX_MESSAGES);
  }
  async function pawBulkHydrate(account,revision){
    try{
      const record=await pawBulkRead(account);
      if(!record||![2,3].includes(record.format)||!record.snapshot||state.myId!==account)return;
      // Never overwrite edits made after entering a room or changing accounts.
      if(pawDataRevision!==revision)return;
      const doc=record.snapshot;
      pawBulkState.lastSaved=record.savedAt||0;
      const listFields=['moments','circles','invitations','pawGuestbook','roomMemories',
        'roomFavorites','roomRecent','sharedAlbums'];
      for(const k of listFields){
        if(k==='sharedAlbums'&&pawBookVault.active)continue;
        if(!Array.isArray(doc[k]))continue;
        const seen=new Map();
        // Current local changes win; older bulk-only entries are retained.
        const identity=(x)=>String(x?.id ?? (x?.Name?x.Name+':'+x.Space:JSON.stringify(x)));
        for(const x of doc[k])seen.set(identity(x),x);
        for(const x of Array.isArray(state[k])?state[k]:[])seen.set(identity(x),x);
        state[k]=[...seen.values()];
      }
      if(doc.profiles&&typeof doc.profiles==='object'){
        const safe=pawPartitionSnapshot(account,{...doc,chats:doc.chats||{},circles:state.circles,profiles:{...doc.profiles,...state.profiles}});
        state.profiles={...safe.peers,...(safe.personal.ownProfile?{[account]:safe.personal.ownProfile}:{})};
      }
      if(!pawBookVault.active&&doc.privateBookPages&&typeof doc.privateBookPages==='object')
        state.privateBookPages={...doc.privateBookPages,...state.privateBookPages};
      for(const [id,full] of Object.entries(doc.chats||{})){
        if(!numeric(id))continue;
        const recent=state.chats[id];
        state.chats[id]={...full,...(recent||{}),
          messages:pawMergeMessages(full.messages,recent?.messages)};
      }
      for(const [id,full] of Object.entries(doc.groups||{})){
        if(!/^g_[a-zA-Z0-9_-]{8,44}$/.test(id))continue;
        const recent=state.groups[id];
        state.groups[id]={...full,...(recent||{}),
          messages:pawMergeMessages(full.messages,recent?.messages)};
      }
      pawCacheArchiveReadyFor=account;
      pawBulkState.restored++;pawBulkState.error='';
      if(state.open)render();
    }catch(e){pawBulkState.error=String(e?.message||e);}
  }
  // Export the complete PawLounge state stored in IndexedDB. This export is
  // private and may contain chat text. It does NOT include Paw Notes private
  // keys, server credentials, or the separate full message archive.
  window.MarvelousBulkStorageExport=async()=>{
    const account=state.myId;
    if(!account)throw Error('Log into Bondage Club first.');
    await pawBulkState.chain;
    const row=await pawBulkRead(account);
    if(!row?.snapshot)throw Error('No committed bulk snapshot yet. Save once and try again.');
    const payload={format:'MarvelousPawLoungeBulk-v2',account,
      savedAt:row.savedAt,snapshot:row.snapshot};
    download(`Marvelous-PawLounge-BULK-${account}-${new Date().toISOString().slice(0,10)}.json`,
      'application/json',JSON.stringify(payload));
    return {exportStarted:true,account,warning:'Private local account data. Keep the downloaded file secure. Export full message history separately.'};
  };
  try{Object.defineProperty(window,'MarvelousStorageDiag',{configurable:true,value:()=>({
    account:state.myId,bulkSaved:pawBulkState.saved,bulkRestored:pawBulkState.restored,
    pendingWrites:pawBulkState.queued,lastSaved:pawBulkState.lastSaved,
    bulkError:pawBulkState.error,archiveError:historyArchive.error,
    partitions:pawBulkState.partitionCounts||null,peerPolicy:pawPeerPolicy(),
    note:'Personal, peer cache, and shared records are separate by BC account. Paw Notes vaults are untouched.'
  })});}catch{}

  // Safe, explicit cleanup: only old non-favorite/non-circle peer snapshots.
  // Full messages, memories, unsent outbox and key vaults are never candidates.
  window.PawLoungeStorageCategories=()=>{
    const snap=pawCacheSnapshot(),part=pawPartitionSnapshot(state.myId,snap);
    const size=x=>Math.round(JSON.stringify(x||{}).length*2/1024);
    return {account:state.myId,policy:pawPeerPolicy(),counts:part.counts,
      estimatedKiB:{mine:size(part.personal),shared:size(part.shared),otherPlayers:size(part.peers)},
      caveat:'Estimates describe current PawLounge snapshots, not WCE/BCX or total disk use.',
      cloud:'Uploads require an explicit Marvelous Hub action and permission.'};
  };
  window.MarvelousStorageBoundaryDiag=()=>({
    account:state.myId,
    pawLounge:window.PawLoungeStorageCategories(),
    plushies:window.SubbysDataBoundaries?.status?.()||{connected:false},
    privacy:'No server uploads or deletion of encrypted keys. BCX/WCE keys are untouched.'
  });
  window.PawLoungeCleanupOtherPlayers=async()=>{
    const account=state.myId;
    if(!account||pawHydrationAccount===account)throw Error('Wait for account data to finish loading.');
    const parts=pawPartitionSnapshot(account,pawCacheSnapshot());
    let removed=0;
    for(const id of Object.keys(state.profiles)){
      if(Number(id)!==account&&!Object.hasOwn(parts.peers,id)){
        delete state.profiles[id];removed++;
      }
    }
    if(removed){pawBulkSave(account,pawCacheSnapshot());await pawBulkState.chain;}
    return {account,removed,kept:Object.keys(parts.peers).length,error:pawBulkState.error,
      note:'Only OTHER-player profile cache entries were removed. Shared chats and private records are preserved.'};
  };

  async function pawEnsureCacheArchive(account){
    if(pawHydrationAccount===account)return false;
    if(pawCacheCompactionRunning)return false;
    pawCacheCompactionRunning=true;
    try{
      if(!account||account!==state.myId) return false;
      // Queue every cached message into the indexed archive before trimming.
      for(const [id,chat] of Object.entries(state.chats))
        if(numeric(id)&&Array.isArray(chat.messages))archiveMessages(account,'chat',id,chat.messages);
      for(const [id,group] of Object.entries(state.groups))
        if(/^g_[a-zA-Z0-9_-]{8,44}$/.test(id)&&Array.isArray(group.messages))
          archiveMessages(account,'group',id,group.messages);
      await flushHistoryArchive();
      if(state.myId!==account||historyArchive.error)return false;
      pawCacheArchiveReadyFor=account;
      const snap=pawCacheSnapshot();
      const stamp=await pawBulkPut(account,snap);
      pawBulkState.saved++;pawBulkState.lastSaved=stamp;
      if(!safeWrite(dataKey(),pawFastSnapshot(snap,stamp))&&
         !safeWrite(dataKey(),pawMinimumSnapshot(snap,stamp)))
        pawCacheLastCompactionError='Bulk archive saved, but browser localStorage remains full.';
      pawCacheCompactions++;
      pawCacheLastCompactionError='';
      return true;
    }catch(e){pawCacheLastCompactionError=String(e?.message||e);return false;}
    finally{pawCacheCompactionRunning=false;}
  }
  window.PawLoungeCompactCache=async()=>({ok:await pawEnsureCacheArchive(state.myId),
    account:state.myId,compactions:pawCacheCompactions,error:pawCacheLastCompactionError,
    note:'Messages are archived before cache reduction; encryption keys are untouched.'});
  function saveNow(force=false) {
    clearTimeout(state.lastSave);
    if(pawHydrationAccount===state.myId){pawSaveRequestedWhileHydrating=true;return;}
    if(pawUnreadableAccountKey===dataKey()){
      pawBulkState.error='Account cache cannot be decoded. Existing record preserved; export/recover it before writing.';
      return;
    }
    if (!force && motionRuntime.active) { saveSoon(); return; }
    // Keep the in-memory tail for the current session; the fast disk copy is smaller.
    const entries=Object.values(state.chats).sort((a,b)=>(b.updated||0)-(a.updated||0));
    for(const chat of entries)chat.messages=(chat.messages||[]).slice(-MAX_MESSAGES);
    for(const old of entries.slice(MAX_CONVERSATIONS))delete state.chats[old.id];
    for(const group of Object.values(state.groups))group.messages=(group.messages||[]).slice(-MAX_MESSAGES);
    for(const old of Object.values(state.groups).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(MAX_GROUPS))delete state.groups[old.id];
    if(pawBookVault.active&&!pawBookVault.locked)bookVaultQueueSave();
    const snap=pawCacheSnapshot();
    // The full snapshot and all messages are committed to IndexedDB first.
    // Only then is the much smaller localStorage bootstrap copy replaced.
    // This also migrates old account snapshots if localStorage is already full.
    pawBulkSave(state.myId,snap);
  }
  function loadForAccount(id) {
    if (state.myId === id) return;
    if(typeof marvelousRoomImages!=='undefined'){for(const url of marvelousRoomImages.values())URL.revokeObjectURL(url);marvelousRoomImages.clear();}
    marvelousFocusRuntime.enabled=false;applyMarvelousFocus();
    if (statusWire.dispatchTimer) clearTimeout(statusWire.dispatchTimer);
    statusWire.dispatchTimer=null;statusWire.pending=[];statusWire.queued.clear();
    statusWire.requested.clear();statusWire.responded.clear();statusWire.bootAccount=0;
    state.myId = id;
    bookVaultPrepareAccount(id);
    integrity.bursts.clear();integrity.recovery.clear();integrity.quorums.clear();integrity.keys.clear();
    state.integritySeen=[];
    state.selected = 0; state.selectedGroup = ''; state.chats = {}; state.groups = {}; state.profiles = {}; state.roomHistory = []; state.roomMemories=[];state.roomMemoryDraft={name:'',notes:'',tags:''};state.moments=[];state.circles=[];state.circleFilter='';state.catchUpSince=0;state.catchUpWhispersSince=0;state.catchUpGroupsSince=0;state.sharedAlbums=[];state.privateBookPages={};state.invitations=[];state.pawGuestbook=[];state.roomFavorites=[];state.roomRecent=[];state.scheduledMessages=[];state.deliveryOutbox=[];state.replyTarget=null; state.panelScroll = { left: 0, right: 0 };
    const loaded = safeRead(dataKey(), {});
    // Legacy PL2 data stays untouched until its full IndexedDB migration
    // commits successfully. This avoids a quota failure during login.
    state.integritySeen=(Array.isArray(loaded.integritySeen)?loaded.integritySeen:[]).slice(-INTEGRITY_LOG_LIMIT)
      .filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&x[0].length<180&&Number.isFinite(Number(x[1]))&&Number(x[1])>Date.now()-14*86400000);
    integrity.keys=new Set(state.integritySeen.map(x=>x[0]));
    state.scheduledMessages=(Array.isArray(loaded.scheduledMessages)?loaded.scheduledMessages:[]).slice(-100).map(x=>({id:trim(x.id,70),kind:x.kind==='group'?'group':'chat',to:x.kind==='group'?trim(x.to,80):numeric(x.to),text:trim(x.text,x.kind==='group'?MAX_GROUP_TEXT:2000),mode:x.mode==='whisper'?'whisper':'beep',secure:x.kind!=='group'&&x.secure===true,due:Number(x.due),status:['pending','sent','missed','cancelled'].includes(x.status)?x.status:'cancelled',sentAt:Number(x.sentAt)||0})).filter(x=>x.id&&x.to&&x.text&&Number.isFinite(x.due));
    // A previously interrupted send is ambiguous, not a license to resend it.
    // Persist the intent for inspection, but never auto-replay an in-flight packet.
    state.deliveryOutbox=(Array.isArray(loaded.deliveryOutbox)?loaded.deliveryOutbox:[]).slice(-120).map(raw=>{
      if(!raw||typeof raw!=='object')return null;
      const kind=raw.kind==='group'?'group':'chat';
      const id=trim(raw.id,80),to=kind==='chat'?numeric(raw.to):trim(raw.to,80);
      const text=trim(raw.text,kind==='group'?MAX_GROUP_TEXT:2000);
      const mode=kind==='group'?'group':['whisper','beep','offline'].includes(raw.mode)?raw.mode:'beep';
      if(!/^out_[\w-]{6,75}$/.test(id)||!to||!text|| (kind==='group'&&!/^g_[a-zA-Z0-9_-]{8,44}$/.test(to)))return null;
      const status=['queued','sending','sent','partial','failed','acknowledged','unconfirmed','cancelled'].includes(raw.status)?raw.status:'failed';
      const ackTokens=kind==='group'&&raw.ackTokens&&typeof raw.ackTokens==='object'?Object.fromEntries(Object.entries(raw.ackTokens).filter(([k,v])=>numeric(k)&&typeof v==='string'&&/^[a-zA-Z0-9_-]{12,72}$/.test(v)).slice(0,MAX_GROUP_MEMBERS)):{};
      const targets=kind==='group' && raw.targets&&typeof raw.targets==='object'?Object.fromEntries(Object.entries(raw.targets).filter(([k,v])=>numeric(k)&&['queued','sending','sent','acknowledged','failed','unconfirmed'].includes(v)).slice(0,MAX_GROUP_MEMBERS)):{};
      for(const k in targets) if(targets[k]==='sending')targets[k]='unconfirmed';
      return {id,kind,to,text,mode,secure:kind==='chat'&&raw.secure===true,transport:raw.transport==='marvelous'?'marvelous':'',mid:trim(raw.mid||'',75),messageId:trim(raw.messageId||'',90),replyTo:normalizeReply(raw.replyTo),targets,ackTokens,created:Number(raw.created)||Date.now(),updated:Number(raw.updated)||Date.now(),attempts:Math.min(5,Math.max(0,Number(raw.attempts)||0)),nextTry:Date.now()+2000,status:status==='sending'?'unconfirmed':status,reason:trim(raw.reason||'',160)};
    }).filter(Boolean);
    state.moments=(Array.isArray(loaded.moments)?loaded.moments:[]).slice(-MOMENT_LIMIT).map(m=>normalizeMoment(m)).filter(Boolean);
    state.circles=(Array.isArray(loaded.circles)?loaded.circles:[]).slice(0,30).map(c=>({id:trim(c.id,40),name:trim(c.name,45),members:[...new Set((Array.isArray(c.members)?c.members:[]).map(numeric).filter(Boolean))].slice(0,150),shareStatus:c.shareStatus!==false,shareProfile:c.shareProfile!==false,quiet:c.quiet===true})).filter(c=>/^circle_[\w-]{4,32}$/.test(c.id)&&c.name);
    state.catchUpSince=Number.isFinite(Number(loaded.catchUpSince))?Number(loaded.catchUpSince):Date.now();
    // Independent read checkpoints. Existing installations inherit the global
    // checkpoint so old highlights never unexpectedly reappear.
    state.catchUpWhispersSince=Number.isFinite(Number(loaded.catchUpWhispersSince))&&Number(loaded.catchUpWhispersSince)>0?Number(loaded.catchUpWhispersSince):state.catchUpSince;
    state.catchUpGroupsSince=Number.isFinite(Number(loaded.catchUpGroupsSince))&&Number(loaded.catchUpGroupsSince)>0?Number(loaded.catchUpGroupsSince):state.catchUpSince;
    state.sharedAlbums=pawBookVault.active?[]:(Array.isArray(loaded.sharedAlbums)?loaded.sharedAlbums:[]).slice(-30).map(normalizeAlbum).filter(Boolean);
    state.privateBookPages=pawBookVault.active?{}:normalizePrivateBookPages(loaded.privateBookPages);
    state.invitations=(Array.isArray(loaded.invitations)?loaded.invitations:[]).slice(-70).map(normalizeInvitation).filter(Boolean);
    state.pawGuestbook=(Array.isArray(loaded.pawGuestbook)?loaded.pawGuestbook:[]).slice(-50).map(normalizeGuestEntry).filter(Boolean);
    state.roomFavorites=(Array.isArray(loaded.roomFavorites)?loaded.roomFavorites:[]).slice(-70).filter(r=>r && typeof r.Name==='string' && r.Name.length<110 && ['X','M','F'].includes(r.Space));
    state.roomRecent=(Array.isArray(loaded.roomRecent)?loaded.roomRecent:[]).slice(-25).filter(r=>r && typeof r.Name==='string' && ['X','M','F'].includes(r.Space));
    state.roomSort=['most','least','name','favorite'].includes(loaded.roomSort)?loaded.roomSort:'most';
    state.roomMemories=(Array.isArray(loaded.roomMemories)?loaded.roomMemories:[]).slice(-60).map(m=>{
      const id=trim(m?.id,50);if(!/^rm_[a-zA-Z0-9_-]{6,48}$/.test(id))return null;
      return {id,room:trim(m.room,110),notes:trim(m.notes,2000),tags:trim(m.tags,100),created:Number(m.created)||Date.now(),favorite:m.favorite===true,hasImage:m.hasImage===true};
    }).filter(Boolean);

    // Migrate every message that STILL exists in the old local save, before
    // the 90-message UI cache trims it. Missing historical BC server messages
    // cannot be recreated by Kittychat.
    let legacyIdsRepaired=0;
    for (const [member,c] of Object.entries(loaded.chats||{})) {
      if (numeric(member) && Array.isArray(c?.messages)){
        legacyIdsRepaired+=assignMissingMessageIds(c.messages);
        archiveMessages(id,'chat',member,c.messages.filter(m=>m&&typeof m.text==='string'));
      }
    }
    for (const [gid,g] of Object.entries(loaded.groups||{})) {
      if (/^g_[a-zA-Z0-9_-]{8,44}$/.test(gid) && Array.isArray(g?.messages)){
        legacyIdsRepaired+=assignMissingMessageIds(g.messages);
        archiveMessages(id,'group',gid,g.messages.filter(m=>m&&typeof m.text==='string'));
      }
    }
    // Full storage is loaded asynchronously before migration. Never write the
    // trimmed bootstrap cache back over a durable full snapshot.
    pawHydrationAccount=id;
    pawCacheArchiveReadyFor=0;
    pawBulkState.lastSaved=0;
    pawSaveRequestedWhileHydrating=false;
    state.historyEpoch++;state.historySelection='';state.historyOlder=[];
    state.historyHasMore=false;state.historyLoading=false;
    // Restore only Subbycat's place public transcript. Never restore private text.
    state.roomHistory = Array.isArray(loaded.roomHistory) ? loaded.roomHistory.slice(-20).filter(m =>
      m && ['Chat','Emote'].includes(m.type) && Number.isFinite(m.at) &&
      typeof m.text === 'string' && typeof m.name === 'string'
    ).map(m => ({ type:m.type, text:trim(m.text,1200), name:trim(m.name,80), at:m.at,
      sender:numeric(m.sender) })) : [];
    roomReplay.lastRoom = ''; roomReplay.snapshot = []; roomReplay.log = null;
    state.settings = { ...DEFAULT_SETTINGS, ...(loaded.settings || {}) };
    if(!PAW_PEER_DAYS.includes(Number(state.settings.peerCacheDays)))state.settings.peerCacheDays=7;
    if(!PAW_PEER_CAPS.includes(Number(state.settings.peerCacheCap)))state.settings.peerCacheCap=200;
    state.settings.peerCacheDays=Number(state.settings.peerCacheDays);
    state.settings.peerCacheCap=Number(state.settings.peerCacheCap);
    // Repo move to marvelous-bc/pawlounge. Only migrate the old built-in
    // repository URLs, never arbitrary custom URLs or saved friend profiles.
    // Keep storage keys and member IDs intact to preserve every conversation.
    const oldAssetHost = 'https://raw.githubusercontent.com/marvelous-bc/kittychat/main/assets/';
    const newAssetHost = DEFAULT_ASSET_BASE;
    if (state.settings.assetBase === oldAssetHost) state.settings.assetBase = newAssetHost;
    for (const imageSetting of ['avatar', 'pawHero', 'pawGallery1', 'pawGallery2', 'pawGallery3', 'pawGallery4']) {
      const value = state.settings[imageSetting];
      if (typeof value === 'string' && value.startsWith(oldAssetHost))
        state.settings[imageSetting] = newAssetHost + value.slice(oldAssetHost.length);
    }

    delete state.settings.quiet; // Retire the former moon/catnap feature, including old saved settings.
    if (!VALID_THEMES.includes(state.settings.theme)) state.settings.theme = 'midnight';
    if (!['normal','large','extra'].includes(state.settings.fontSize)) state.settings.fontSize='large';
    if (!Array.isArray(state.settings.shortcuts)) state.settings.shortcuts = DEFAULT_SETTINGS.shortcuts.slice();
    if (!Object.hasOwn(STATUS_MODES,state.settings.friendStatusMode)) state.settings.friendStatusMode='Available';
    state.settings.friendStatusText=trim(state.settings.friendStatusText || '',100);
    state.settings.shareFriendStatus=state.settings.shareFriendStatus!==false;
    state.settings.friendStatusMinutes=[0,30,60,240,1440].includes(Number(state.settings.friendStatusMinutes))?Number(state.settings.friendStatusMinutes):0;
    state.settings.friendStatusExpiresAt=Math.max(0,Number(state.settings.friendStatusExpiresAt)||0);
    if(!Object.hasOwn(PET_PERSONAS,state.settings.petPersona))state.settings.petPersona='curious-kitten';
    state.settings.petPersonaShare=state.settings.petPersonaShare!==false;
    state.settings.petPersonaDescription=trim(state.settings.petPersonaDescription||'',300);
    delete state.settings.focusPreset; // Retired focus presets: Conversation Focus is the only mode.
    if(!validHour(state.settings.quietStart))state.settings.quietStart='22:00';
    if(!validHour(state.settings.quietEnd))state.settings.quietEnd='08:00';
    if(!['rounded','square','cloud'].includes(state.settings.bubbleShape))state.settings.bubbleShape='rounded';
    state.settings.bubbleOpacity=Math.max(50,Math.min(100,Number(state.settings.bubbleOpacity)||95));
    state.settings.sidebarOrder=[...new Set((Array.isArray(state.settings.sidebarOrder)?state.settings.sidebarOrder:PAW_SECTIONS).filter(s=>PAW_SECTIONS.includes(s)))];
    state.chats = loaded.chats && typeof loaded.chats === 'object' ? loaded.chats : {};
    state.selected = numeric(loaded.lastSelected) || 0;
    state.selectedGroup = typeof loaded.lastSelectedGroup === 'string' ? loaded.lastSelectedGroup : '';
    state.leftCollapsed = !!loaded.leftCollapsed;
    state.rightCollapsed = !!loaded.rightCollapsed;
    state.profiles = loaded.profiles && typeof loaded.profiles === 'object' ? loaded.profiles : {};
    state.fabPosition = loaded.fabPosition || null;
    const r = loaded.windowRect;
    state.windowRect = r && ['x','y','w','h'].every(k => Number.isFinite(Number(r[k]))) ?
      {x:+r.x,y:+r.y,w:+r.w,h:+r.h} : null;
    if (loaded.groups && typeof loaded.groups === 'object') for (const [gid, raw] of Object.entries(loaded.groups).slice(0, MAX_GROUPS)) {
      if (!/^g_[a-zA-Z0-9_-]{8,44}$/.test(gid) || !raw || typeof raw !== 'object') continue;
      const members = [...new Set((Array.isArray(raw.members) ? raw.members : []).map(numeric).filter(Boolean))].slice(0,MAX_GROUP_MEMBERS);
      const creator = numeric(raw.creator);
      if (!creator || !members.includes(creator) || !members.includes(id) || members.length < 2) continue;
      state.groups[gid] = { id:gid, creator, name:trim(raw.name,46)||'Kitty Den', members,
        accepted:[...new Set((Array.isArray(raw.accepted) ? raw.accepted : []).map(numeric).filter(n => members.includes(n)))],
        joined:!!raw.joined, draft:trim(raw.draft||'',MAX_GROUP_TEXT), unread:Math.min(999,Math.max(0,Number(raw.unread)||0)),
        updated:Number(raw.updated)||Date.now(), membershipRevision:Math.max(0,Math.min(2147483647,Number(raw.membershipRevision)||0)), moderators:(Array.isArray(raw.moderators)?raw.moderators:[]).map(numeric).filter(n=>members.includes(n) && n!==creator),
        roles:Object.fromEntries(Object.entries(raw.roles||{}).filter(([k,v])=>members.includes(numeric(k))&&PAW_ROLE_NAMES.includes(v)).slice(0,MAX_GROUP_MEMBERS)),
        announcement:raw.announcement?{text:trim(raw.announcement.text,220),from:numeric(raw.announcement.from),at:Number(raw.announcement.at)||0}:null,
        polls:(Array.isArray(raw.polls)?raw.polls:[]).slice(-25).map(normalizePawPoll).filter(Boolean), receipts:raw.receipts && typeof raw.receipts==='object' ? Object.fromEntries(Object.entries(raw.receipts).slice(-90).map(([k,v])=>[trim(k,70),Array.isArray(v)?v.map(numeric).filter(n=>members.includes(n)):[]])) : {}, messages:(Array.isArray(raw.messages)?raw.messages:[]).slice(-MAX_MESSAGES)
          .filter(m=>m && typeof m.text==='string' && members.includes(numeric(m.from)))
          .map(m=>({id:trim(m.id,70),text:trim(m.text,MAX_GROUP_TEXT),from:numeric(m.from),time:Number(m.time)||Date.now(),replyTo:normalizeReply(m.replyTo),reactions:normalizeReactions(m.reactions),recovered:!!m.recovered,verifiedBy:(Array.isArray(m.verifiedBy)?[...new Set(m.verifiedBy.map(numeric).filter(n=>members.includes(n)))].slice(0,MAX_GROUP_MEMBERS):[])})) };
    }
    if (state.selectedGroup && !state.groups[state.selectedGroup]) state.selectedGroup = '';
    // Validate persisted data before ever putting it into the UI.
    for (const [key, chat] of Object.entries(state.chats)) {
      if (!numeric(key) || !chat || !Array.isArray(chat.messages)) { delete state.chats[key]; continue; }
      chat.id = numeric(key); chat.displayName = trim(chat.displayName || '', 80);chat.replyLater=!!chat.replyLater;chat.requestPending=!!chat.requestPending;chat.requestAccepted=!!chat.requestAccepted;chat.snoozeUntil=Math.max(0,Number(chat.snoozeUntil)||0); chat.messages = chat.messages.slice(-MAX_MESSAGES).filter(m => m && typeof m.text === 'string' && [id,numeric(key)].includes(numeric(m.from))).map(m => ({
        id: trim(m.id, 80), text: trim(m.mode === 'whisper' ? m.text : stripNativeBeepMetadata(m.text), 2000), from: numeric(m.from), time: Number(m.time) || Date.now(),
        mode: m.mode === 'whisper' ? 'whisper' : 'beep', offline:m.offline===true, replyTo:normalizeReply(m.replyTo),reactions:normalizeReactions(m.reactions),nativeId:!!m.nativeId,reaction: trim(m.reaction || '', 6) }));
      assignMissingMessageIds(chat.messages);
      chat.unread = Number(chat.unread) || 0;
    }
    for(const g of Object.values(state.groups))assignMissingMessageIds(g.messages);
    // Hydrate bulk data before any save/compaction can overwrite it. Future
    // account changes invalidate this callback's account guard.
    const hydrationRevision=pawDataRevision;
    void pawBulkHydrate(id,hydrationRevision).finally(()=>{
      if(state.myId!==id)return;
      pawHydrationAccount=0;
      const needsSave=pawSaveRequestedWhileHydrating||legacyIdsRepaired>0;
      pawSaveRequestedWhileHydrating=false;
      // First migration and future restores go through the same verified
      // archive + full IndexedDB write before shrinking the local copy.
      if(needsSave||!pawBulkState.lastSaved)saveSoon();
    });
  }
  function notice(text) {
    if (!ui.status) return;
    ui.status.textContent = text;
    ui.status.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => ui.status?.classList.remove('show'), 3300);
  }
  // BC's "beep with room" option can attach a metadata JSON envelope with
  // either ONE or TWO newlines before the private-use  marker. Never render it
  // as a second chat line. Require actual metadata JSON to avoid eating text.
  function stripNativeBeepMetadata(value) {
    if (typeof value !== 'string' || !value.includes('\uF124')) return value;
    const match = /(?:\r?\n)+[ \t]*\uF124[ \t]*(\{[\s\S]*\})[ \t]*$/u.exec(value);
    if (!match) return value;
    try {
      const metadata = JSON.parse(match[1]);
      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return value;
      if (!['messageColor','messageType','messageId','replyTo','replyToId','repliedTo','messageReplyId'].some(key => Object.hasOwn(metadata, key))) return value;
      return value.slice(0, match.index).trimEnd();
    } catch { return value; }
  }
  const signature = (member, mode, from, content) => `${member}|${mode}|${from}|${content}`;
  function appendMessage(member, text, from, mode = 'beep', source = 'network', metadata={}) {
    const chat = ensure(member);
    text = trim(mode === 'beep' ? stripNativeBeepMetadata(text) : text, 2000); if (!chat || !text) return;
    // Some BC builds invoke more than one display hook for the same event.
    const key = signature(member, mode, from, text);
    const last = state.recentFingerprints.get(key) || 0;
    if (Date.now() - last < 600) return;
    state.recentFingerprints.set(key, Date.now());
    if (state.recentFingerprints.size > 75) {
      for (const [k,t] of state.recentFingerprints) if (Date.now() - t > 5000) state.recentFingerprints.delete(k);
    }
    const mid=trim(metadata?.messageId || '',90);
    if(mid&&chat.messages.some(m=>m.id===mid))return;
    const message={ id: mid || uniqueMessageId(), text, from: numeric(from), time: monotonicMessageTime(), mode, offline:metadata?.offline===true, replyTo:normalizeReply(metadata?.replyTo),reactions:{},nativeId:!!mid };
    chat.messages.push(message);
    archiveMessages(state.myId,'chat',member,[message]);
    if (chat.messages.length > MAX_MESSAGES) chat.messages.shift();
    chat.updated = Date.now();
    if (from!==me() && !myFriends().includes(member) && !chat.requestAccepted) chat.requestPending=true;
    if (from !== me() && !(state.open && state.tab === 'chats' && state.selected === member)) {
      chat.unread = Math.min(999, (chat.unread || 0) + 1);
      if (state.settings.notifications && !inPawQuietHours() && !chat.muted && !chat.requestPending && !(chat.snoozeUntil>Date.now())) {
        if (state.settings.sounds) makeChime();
        notice(`🐾 New message from ${name(member)}`);
      }
    }
    saveSoon();
    updateBadge();
    if (state.open) { scheduleSidebarUpdate(); if (state.selected === member && state.tab === 'chats') { if (!appendVisiblePrivateMessage(member,message)) renderMessages(); } }
  }
  let audioCtx = null;
  function makeChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx ||= new Ctx();
      if (audioCtx.state === 'suspended') return;
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(784, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046, audioCtx.currentTime + .12);
      gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.035, audioCtx.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .18);
      osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + .19);
    } catch { /* Sound is optional. */ }
  }
  // Ordinary BC beeps carry the human-readable preview plus an encoded Kittychat payload.
  // Custom beep types are not used: BC's built-in handler only recognizes selected types.
  const kcEncode = payload => {
    return pawCodecEncode(payload);
  };
  const kcDecode = text => {
    const raw=String(text||'');
    const modern=raw.match(/\n\[KC2:(PL2\.[A-Za-z0-9._-]{1,6000})\]$/);
    if(modern){
      try{const data=pawCodecDecode(modern[1],12000);return data?.v===1&&typeof data.t==='string'?data:null;}
      catch{pawCodecMetrics.failed++;return null;}
    }
    const legacy=raw.match(/\n\[KC1:([A-Za-z0-9+/=]{1,2400})\]$/);
    if(!legacy)return null;
    try{
      const bin=atob(legacy[1]);
      const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));
      pawCodecMetrics.legacy++;
      return data?.v===1&&typeof data.t==='string'?data:null;
    }catch{return null;}
  };
  function sendGroupWire(member, body, summary, quiet=false) {
    if (!numeric(member) || !myFriends().includes(member) || typeof window.ServerSend !== 'function') return false;
    try {
      const packet={v:1,...body,nonce:integrityNonce()};
      const preview=body.t==='msg'?'🐾 PawLounge group message · open PawLounge to read':trim(summary,140);
      let envelope=`${preview}\n[KC2:${kcEncode(packet)}]`;
      if(envelope.length>1800){
        const utf=pawEncoder.encode(JSON.stringify(packet));
        let raw='';for(let i=0;i<utf.length;i+=8192)raw+=String.fromCharCode(...utf.subarray(i,i+8192));
        envelope=`${preview}\n[KC1:${btoa(raw)}]`;
      }
      if(envelope.length>1800)return false;
      state.suppressOutgoing = true;
      // All PawLounge group packets are addon control traffic, not native friend beeps.
      // Keep their type explicit so other addons (notably WCE's Instant Messenger)
      // do not archive the compressed KC2 envelope in ordinary beep history.
      // Older PawLounge clients already handle KCGroupControl in receiveBeep().
      window.ServerSend('AccountBeep', { MemberNumber:member, BeepType:'KCGroupControl', IsSecret:true, Message:envelope });
      return true;
    } catch(err) { console.warn('[Kittychat] Group message send failed',err); return false; }
    finally { state.suppressOutgoing = false; }
  }
  const groupId = () => {
    if (window.crypto?.getRandomValues) {
      const a = new Uint8Array(15); crypto.getRandomValues(a);
      return 'g_' + [...a].map(n=>n.toString(16).padStart(2,'0')).join('');
    }
    return 'g_' + Date.now().toString(36) + Math.random().toString(36).slice(2,16);
  };
  const currentGroup = () => state.tab==='groups' && state.selectedGroup ? state.groups[state.selectedGroup] : null;
  function addGroupMessage(g, from, text, id, reply=null, originalTime=null, recovered=false, verifiedBy=[]) {
    if (!g || !g.joined || !g.members.includes(from) || !g.accepted.includes(from)) return;
    const mid=trim(id,70), content=trim(text,MAX_GROUP_TEXT);
    if (!content || !mid || g.messages.some(m=>m.id===mid)) return;
    const supplied=Number(originalTime);
    const time=recovered && Number.isSafeInteger(supplied) && supplied>Date.now()-8*86400000 && supplied<=Date.now()+60000 ? supplied : monotonicMessageTime();
    const message={id:mid, text:content, from, time,replyTo:normalizeReply(reply),reactions:{},recovered:!!recovered,
      verifiedBy:recovered?[...new Set(verifiedBy.map(numeric))].filter(n=>g.accepted.includes(n)&&n!==me()).slice(0,MAX_GROUP_MEMBERS):[]};
    g.messages.push(message);
    g.messages.sort((a,b)=>a.time-b.time);
    archiveMessages(state.myId,'group',g.id,[message]);
    g.messages = g.messages.slice(-MAX_MESSAGES); g.updated=Date.now();
    g.receipts ||= {}; if (from===me()) {g.receipts[mid]=[];const keys=Object.keys(g.receipts);if(keys.length>80)delete g.receipts[keys[0]];}
    if (!recovered && from!==me() && !(state.open && state.selectedGroup===g.id && state.tab==='groups')) {
      g.unread=Math.min(999,(g.unread||0)+1);
      if (state.settings.notifications && !inPawQuietHours()) notice(`🐾 New message in ${g.name}`);
    }
    saveSoon(); updateBadge();
    if (state.open && state.tab==='groups') {renderSidebar(); if(state.selectedGroup===g.id) renderChat();}
  }
  function syncGroup(g) {
    if (g.creator !== me()) return;
    // All membership changes originate at the host; monotonically increasing
    // revisions prevent delayed synchronization packets resurrecting removals.
    g.membershipRevision=Math.min(2147483647,Math.max(0,Number(g.membershipRevision)||0)+1);
    const packet = {t:'sync',id:g.id,members:g.members,accepted:g.accepted,mods:g.moderators||[],name:g.name,roles:g.roles||{},announcement:g.announcement||null,rev:g.membershipRevision};
    for (const member of g.accepted) if (member!==me()) sendGroupWire(member,packet,`🐾 Kittychat group update: ${g.name}`);
  }
  function receiveGroupBeep(data, from) {
    from=numeric(from);
    const raw=data?.Message;
    // Ordinary beeps are not control packets. Only inspect the KC envelope.
    if(typeof raw!=='string'||(!raw.includes('[KC1:')&&!raw.includes('[KC2:')))return false;
    if(!inboundLimit(from,'groups',raw,2400))return true;
    const p=kcDecode(raw);
    if (!p || !/^g_[a-zA-Z0-9_-]{8,44}$/.test(p.id||'')) return true;
    if(!['invite','response','sync','msg','ack','announcement','poll','pollvote','react','historyRequest','historyMessage','historyWitness','leave','memberRequest','memberResult','removed'].includes(p.t))return true;
    // A durable event ID prevents replay even after the old message leaves the
    // 90-message cache. The sender is always BC's outer member number.
    const eventId=(p.t==='msg'||p.t==='historyMessage'||p.t==='historyWitness')&&integrityMsgId(p.mid,70)?`${p.id}:${p.mid}`:
      p.t==='invite'?`${p.id}:invite:${Number(p.rev)||0}`:p.t==='poll'&&integrityMsgId(p.poll?.id)?`${p.id}:${p.poll.id}`:'';
    if(!integrityAcceptEvent('group',from,p,eventId))return true;
    if (p.t==='invite') {
      if (numeric(p.creator)!==from || !Array.isArray(p.members) || typeof p.name!=='string'||p.name.length>46) return true;
      const members=[...new Set(p.members.map(numeric).filter(Boolean))];
      if (members.length<2 || members.length>MAX_GROUP_MEMBERS || !members.includes(from) || !members.includes(me())) return true;
      if (!state.groups[p.id]) {
        state.groups[p.id] = {id:p.id,creator:from,name:trim(p.name,46)||'Kitty Den',members,
          accepted:[from], joined:false,draft:'',unread:1, updated:Date.now(),membershipRevision:Math.max(0,Number(p.rev)||0),messages:[],moderators:[],receipts:{}};
        notice(`💌 Group invitation from ${bcName(from)} — open Groups to accept`);
      }
      saveSoon();updateBadge();if(state.open)render();
      return true;
    }
    const g=state.groups[p.id];
    if(!g)return true;
    // A removal must originate from the actual host identified by the BC
    // sender envelope, never a claimed ID inside the message.
    if(p.t==='removed'){
      if(from!==g.creator||!g.members.includes(me())){integrityReject();return true;}
      const rev=Number(p.rev);
      if(!Number.isSafeInteger(rev)||rev<=Number(g.membershipRevision||0))return true;
      delete state.groups[g.id];
      if(state.selectedGroup===g.id)state.selectedGroup='';
      notice(`You were removed from Group Den “${g.name}”.`);
      saveNow(true);updateBadge();if(state.open)render();
      return true;
    }
    if (!g.members.includes(from) || (p.t!=='response' && p.t!=='sync' && !g.accepted.includes(from))) return true;
    if(p.t==='memberRequest'){
      // Moderators request changes, but only the host can commit them.
      if(me()!==g.creator||!g.joined||!g.accepted.includes(from)||!g.moderators?.includes(from)){integrityReject();return true;}
      const target=numeric(p.target), operation=p.operation;
      if(!target||!['invite','kick'].includes(operation)){integrityReject();return true;}
      hostChangeGroupMember(g,operation,target,from);
      return true;
    }
    if(p.t==='memberResult'){
      if(from!==g.creator){integrityReject();return true;}
      notice(`🐾 Den request: ${trim(p.message||'Group membership updated',150)}`);
      return true;
    }
    if (p.t==='response' && me()===g.creator) {
      g.accepted=g.accepted.filter(n=>n!==from);
      if (p.accepted===true) g.accepted.push(from);
      g.accepted=[...new Set(g.accepted)].filter(n=>g.members.includes(n));
      g.updated=Date.now();syncGroup(g);saveSoon();if(state.open)render();
    } else if (p.t==='sync' && from===g.creator && Array.isArray(p.accepted)) {
      // Older hosts can sync legacy groups. Once a revisioned roster has been
      // observed, never accept a stale or unversioned membership rollback.
      const rev=Number(p.rev),current=Number(g.membershipRevision||0);
      if(current>0&&(!Number.isSafeInteger(rev)||rev<=current))return true;
      if(p.members!==undefined){
        if(!Array.isArray(p.members)){integrityReject();return true;}
        const members=[...new Set(p.members.map(numeric).filter(Boolean))];
        if(members.length<1||members.length>MAX_GROUP_MEMBERS||!members.includes(g.creator)) {integrityReject();return true;}
        if(!members.includes(me())){
          delete state.groups[g.id];if(state.selectedGroup===g.id)state.selectedGroup='';
          notice(`You are no longer a member of “${g.name}”.`);
          saveNow(true);updateBadge();if(state.open)render();return true;
        }
        g.members=members;
      }
      if(Number.isSafeInteger(rev)&&rev>=0)g.membershipRevision=rev;
      g.accepted=[...new Set(p.accepted.map(numeric).filter(n=>g.members.includes(n)))];
      g.moderators=Array.isArray(p.mods)?p.mods.map(numeric).filter(n=>g.members.includes(n)&&n!==g.creator):[];
      g.name=trim(p.name||g.name,46);
      g.roles=Object.fromEntries(Object.entries(p.roles||{}).filter(([k,v])=>g.members.includes(numeric(k))&&PAW_ROLE_NAMES.includes(v)));
      if(p.announcement&&typeof p.announcement==='object'&&Number(p.announcement.at)>Number(g.announcement?.at||0))g.announcement={text:trim(p.announcement.text,220),from:numeric(p.announcement.from),at:Number(p.announcement.at)};
      if (g.joined && !g.accepted.includes(me())){
        // Host has removed our accepted status: keep the invitation only if
        // explicitly pending; never silently add ourselves back.
        g.joined=false;
      }
      saveSoon();if(state.open)render();
    } else if (p.t==='msg' && g.joined && g.accepted.includes(from)) {
      if (typeof p.text==='string' && p.text.length<=MAX_GROUP_TEXT && integrityMsgId(p.mid,70)) {
        addGroupMessage(g,from,p.text,p.mid,p.replyTo);
        if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)appendVisibleGroupMessage(g,p.mid);
        if(from!==me() && g.accepted.includes(me()))sendGroupWire(from,{t:'ack',id:g.id,mid:p.mid,ackToken:typeof p.ackToken==='string'?p.ackToken:''},'✓ Client-reported receipt',true);
      }
    } else if (p.t==='ack' && typeof p.mid==='string' && g.accepted.includes(from)) {
      if (g.messages.some(m=>m.id===p.mid && m.from===me()) && state.deliveryOutbox.some(x=>x.kind==='group'&&x.to===g.id&&x.mid===p.mid&&['sent','acknowledged'].includes(x.targets?.[from])&&(!x.ackTokens?.[from]||x.ackTokens[from]===p.ackToken))) {g.receipts ||= {};g.receipts[p.mid]=[...new Set([...(g.receipts[p.mid]||[]),from])];markGroupOutboxAck(g.id,p.mid,from);saveSoon();if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id){const receipt=ui.shadow?.querySelector(`[data-group-receipt="${CSS.escape(p.mid)}"]`);if(receipt)receipt.textContent=`· ✓ ${g.receipts[p.mid].length}/${Math.max(0,g.accepted.length-1)} client ACKs`;else renderGroupChat();}}
    } else if(p.t==='announcement'&&g.joined&&(from===g.creator||g.moderators?.includes(from)||g.roles?.[from]==='Organizer')){
      const a=p.announcement;
      if(a&&typeof a==='object'&&numeric(a.from)===from&&typeof a.text==='string'&&a.text.length<=220&&Number.isSafeInteger(Number(a.at))&&Number(a.at)<=Date.now()+60000&&Number(a.at)>Number(g.announcement?.at||0)){
        g.announcement={text:trim(a.text,220),from,at:Number(a.at)};saveSoon();if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)renderGroupChat();
      }
    } else if(p.t==='poll'&&g.joined&&g.accepted.includes(from)){
      const poll=normalizePawPoll(p.poll);
      if(poll&&poll.from===from&&Number.isSafeInteger(Number(poll.at))&&Math.abs(Date.now()-Number(poll.at))<7*86400000&&!g.polls?.some(x=>x.id===poll.id)){
        poll.votes={};g.polls ||= [];g.polls.push(poll);g.polls=g.polls.slice(-25);saveSoon();if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)renderGroupChat();
      }
    } else if(p.t==='pollvote'&&g.joined&&g.accepted.includes(from)){
      const poll=g.polls?.find(x=>x.id===p.pollId),index=Number(p.index);
      if(poll&&Number.isInteger(index)&&index>=0&&index<poll.options.length){poll.votes ||= {};poll.votes[from]=index;saveSoon();if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)renderGroupChat();}
    } else if(p.t==='react' && g.joined && g.accepted.includes(from) && typeof p.mid==='string' && typeof p.emoji==='string' && p.emoji.length<=12 && (g.messages.some(m=>m.id===p.mid&&g.accepted.includes(m.from))||(state.historySelection===historySelectionKey('group',g.id)&&state.historyOlder.some(m=>m.id===p.mid&&g.accepted.includes(m.from))))) {
      void applyReaction('group',g.id,p.mid,from,p.emoji,!!p.remove);
    } else if(p.t==='historyRequest' && g.joined && g.accepted.includes(from) &&
       p.quorum===RECOVERY_QUORUM && typeof p.after==='number' &&
       Number.isSafeInteger(p.after)&&p.after>=Date.now()-8*86400000&&p.after<=Date.now()+60000&&
       typeof p.rid==='string'&&/^[a-zA-Z0-9_-]{12,72}$/.test(p.rid)) {
      // Independently attest *observed* messages from any accepted author.
      // Never use previously recovered data as independent evidence.
      const after=Math.max(Date.now()-7*86400000,p.after);
      const observations=g.messages.filter(m=>!m.recovered&&g.accepted.includes(m.from)&&
        integrityMsgId(m.id,70)&&m.time>=after&&m.time<=Date.now()+60000).slice(-8);
      observations.forEach((m,index)=>setTimeout(()=>{
        if(state.myId===me()&&state.groups[g.id]?.joined&&g.accepted.includes(from)&&myFriends().includes(from))
          sendGroupWire(from,{t:'historyWitness',id:g.id,mid:m.id,author:m.from,text:m.text,
            replyTo:m.replyTo,time:m.time,rid:p.rid},'🐾 History witness',true);
      },index*650));
    } else if(p.t==='historyWitness' && g.joined && typeof p.text==='string' && typeof p.mid==='string') {
      // A report alone is never enough to restore history.
      receiveHistoryWitness(g,from,p);
    } else if(p.t==='historyMessage') {
      // Old (pre-quorum) peer responses are intentionally ignored; no bypass.
      integrityReject();
    } else if (p.t==='leave' && g.creator===me()) {
      g.accepted=g.accepted.filter(n=>n!==from);syncGroup(g);saveSoon();if(state.open)render();
    }
    return true;
  }
  function normalizePawPoll(x) {
    if(!x||typeof x!=='object'||!/^poll_[\w-]{5,45}$/.test(trim(x.id,80))||!numeric(x.from))return null;
    const options=(Array.isArray(x.options)?x.options:[]).slice(0,5).map(v=>trim(v,65)).filter(Boolean);
    if(options.length<2||options.length>5||new Set(options).size!==options.length||!trim(x.question,130))return null;
    const votes=Object.fromEntries(Object.entries(x.votes||{}).slice(0,10).filter(([id,n])=>numeric(id)&&Number.isInteger(Number(n))&&n>=0&&n<options.length).map(([k,v])=>[numeric(k),Number(v)]));
    return {id:trim(x.id,80),from:numeric(x.from),question:trim(x.question,130),options,votes,at:Number(x.at)||Date.now()};
  }
  function canModerateDen(g){return !!g?.joined&&!!g.accepted?.includes(me())&&(g.creator===me()||g.moderators?.includes(me()));}
  function hostChangeGroupMember(g,operation,target,requester=me()){
    const report=(message,success=false)=>{
      if(requester!==me())sendGroupWire(requester,{t:'memberResult',id:g.id,message,success},'🐾 Den management',true);
      else notice(message);
      return success;
    };
    if(!g||g.creator!==me()||!g.joined)return report('The group host must be online to change membership.');
    if(!Number.isSafeInteger(target)||target<=0||target===me())return report('Invalid group member.');
    if(requester!==me()&&(!g.accepted.includes(requester)||!g.moderators?.includes(requester)))return report('Not authorized.');
    if(operation==='invite'){
      if(g.members.includes(target))return report('That person is already invited or in the group.');
      if(g.members.length>=MAX_GROUP_MEMBERS)return report('This Group Den is full.');
      if(!myFriends().includes(target))return report('The host must be BC friends with the invitee.');
      const members=[...g.members,target];
      if(!sendGroupWire(target,{t:'invite',id:g.id,creator:g.creator,name:g.name,members,rev:(g.membershipRevision||0)+1},
        `💌 Invitation to ${g.name}. Open PawLounge to accept.`))return report('BC could not send the invitation.');
      g.members=members;g.updated=Date.now();syncGroup(g);
      saveSoon();if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)renderGroupChat(true);
      return report(`Invitation sent to ${bcName(target)} (#${target}).`,true);
    }
    if(operation==='kick'){
      if(!g.members.includes(target))return report('That person is not in the group.');
      if(requester!==me()&&g.moderators?.includes(target))return report('Moderators cannot remove other moderators.');
      const nextRevision=Math.max(0,Number(g.membershipRevision)||0)+1;
      // Notify the person being removed before excluding them from group sync.
      // An offline recipient may miss this, but other clients will immediately
      // stop recognizing their membership and packets.
      sendGroupWire(target,{t:'removed',id:g.id,rev:nextRevision},'🐾 You were removed from this Group Den.',true);
      g.members=g.members.filter(id=>id!==target);
      g.accepted=g.accepted.filter(id=>id!==target);
      g.moderators=(g.moderators||[]).filter(id=>id!==target);
      if(g.roles)delete g.roles[target];
      for(const acks of Object.values(g.receipts||{}))if(Array.isArray(acks)){const k=acks.indexOf(target);if(k>=0)acks.splice(k,1);}
      g.updated=Date.now();syncGroup(g);saveSoon();
      if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)renderGroupChat(true);
      return report(`${bcName(target)} (#${target}) was removed from the group.`,true);
    }
    return report('Invalid group action.');
  }
  function changeGroupMember(operation,target){
    const g=currentGroup();
    if(!canModerateDen(g))return notice('Only the host and moderators can manage members.');
    const id=numeric(target);
    if(!id)return notice('Enter a valid BC member number.');
    if(operation==='kick'&&!window.confirm(`Remove ${bcName(id)} (#${id}) from “${g.name}”?`))return;
    if(g.creator===me()){hostChangeGroupMember(g,operation,id);return;}
    if(operation==='kick'&&(id===g.creator||g.moderators?.includes(id)))return notice('Moderators cannot remove the host or other moderators.');
    if(!sendGroupWire(g.creator,{t:'memberRequest',id:g.id,operation,target:id},'🐾 Moderator membership request',true)){
      notice('Could not reach the group host.');return;
    }
    notice(`Request sent to ${bcName(g.creator)}. The host must be online to approve it.`);
  }
  function createGroup(title, members) {
    title=trim(title,46);
    const friends=myFriends();
    const ids=[...new Set((members||[]).map(numeric).filter(n=>friends.includes(n)&&n!==me()))].slice(0,MAX_GROUP_MEMBERS-1);
    if (!title || ids.length<2) {notice('Choose a group name and at least two BC friends.');return false;}
    const id=groupId();
    const g={id,name:title,creator:me(),members:[me(),...ids],accepted:[me()],joined:true,draft:'',
      unread:0,updated:Date.now(),membershipRevision:0,messages:[],moderators:[],receipts:{}};
    state.groups[id]=g;
    let delivered=0;
    for (const friend of ids) if (sendGroupWire(friend,{t:'invite',id,creator:me(),name:title,members:g.members},
      `💌 ${bcName(me())} invited you to PawLounge group “${title}”. Open PawLounge to accept.`)) delivered++;
    state.groupCreateOpen=false;state.selectedGroup=id;state.tab='groups';
    saveSoon();render();
    requestAnimationFrame(()=>{if(state.open&&state.tab==='groups'&&state.selectedGroup===id)renderGroupChat();});
    notice(`Invited ${delivered}/${ids.length} friends. They must accept before messages reach them.`);
    return true;
  }
  function respondGroup(id, accept, batch=false) {
    const g=state.groups[id];if(!g || g.joined || g.creator===me())return;
    if (accept) {g.joined=true;g.unread=0;g.accepted=[...new Set([g.creator,me()])];
      if(!batch){state.selectedGroup=id;state.tab='groups';}}
    else delete state.groups[id];
    const ok=sendGroupWire(g.creator,{t:'response',id,accepted:!!accept},
      `🐾 ${bcName(me())} ${accept?'accepted':'declined'} your PawLounge invitation to ${g.name}.`);
    if (!ok && !batch) notice('Could not notify the group creator. Check that you are BC friends.');
    saveSoon();
    if(!batch){updateBadge();render();}
    if(accept&&!batch)requestAnimationFrame(()=>{if(state.open&&state.tab==='groups'&&state.selectedGroup===id)renderGroupChat();});
    return ok;
  }
  // v0.9.12: Transport-safe outbox. "Sent" means handed to BC, not read or
  // received by another player. Only compatible Group Dens provide ACK packets.
  const outboxRuntime={draining:false,repaintQueued:false,nonce:new Map(),sent:0,held:0};
  // The compact outbox is a session-only popover rather than a dedicated
  // chat row. Keep its state across message redraws, never across recipients.
  const outboxPopover={kind:'',to:'',open:false};
  function outboxIsOpen(kind,to){return outboxPopover.open&&outboxPopover.kind===kind&&String(outboxPopover.to)===String(to);}
  function outboxAttentionCount(kind,to){
    return state.deliveryOutbox.filter(x=>x.kind===kind&&String(x.to)===String(to)&&liveOutboxStatuses.has(x.status)).length;
  }
  function outboxTrigger(kind,to){
    const count=outboxAttentionCount(kind,to),open=outboxIsOpen(kind,to);
    return `<button type="button" class="kc-outbox-trigger${count?' kc-outbox-needs-attention':''}" data-action="toggleoutbox" aria-label="Outbox${count?` (${count} to review)`:''}" aria-controls="kc-outbox-popup" aria-expanded="${open}" title="Delivery outbox${count?` · ${count} to review`:''}"><span aria-hidden="true">📤</span><span class="kc-outbox-trigger-label">Outbox</span><span class="kc-outbox-trigger-count"${count?'':' hidden'}>${count||''}</span></button>`;
  }
  function updateOutboxTrigger(kind,to){
    const button=ui.body?.querySelector('.kc-outbox-trigger');
    if(!button)return;
    const count=outboxAttentionCount(kind,to);
    button.setAttribute('aria-expanded',String(outboxIsOpen(kind,to)));
    button.setAttribute('aria-label',`Outbox${count?` (${count} to review)`:''}`);
    button.title=`Delivery outbox${count?` · ${count} to review`:''}`;
    button.classList.toggle('kc-outbox-needs-attention',count>0);
    const badge=button.querySelector('.kc-outbox-trigger-count');
    if(badge){badge.hidden=count===0;badge.textContent=count?String(count):'';}
  }
  function refreshOutboxPopover(kind,to){
    const old=ui.body?.querySelector('.kc-outbox');
    if(!old || old.dataset.kind!==kind || String(old.dataset.to)!==String(to))return;
    const scrollTop=old.scrollTop;
    const tpl=document.createElement('template');tpl.innerHTML=outboxMarkup(kind,to).trim();
    const replacement=tpl.content.firstElementChild;
    if(replacement){old.replaceWith(replacement);replacement.scrollTop=scrollTop;}
    updateOutboxTrigger(kind,to);
  }
  function toggleOutboxPopover(){
    const kind=state.tab==='groups'?'group':'chat';
    const to=kind==='group'?state.selectedGroup:state.selected;
    if(!to)return;
    const open=!outboxIsOpen(kind,to);
    outboxPopover.kind=kind;outboxPopover.to=to;outboxPopover.open=open;
    const pop=ui.body?.querySelector('.kc-outbox');
    if(pop&&pop.dataset.kind===kind&&String(pop.dataset.to)===String(to))pop.hidden=!open;
    updateOutboxTrigger(kind,to);
  }
  const liveOutboxStatuses=new Set(['queued','sending','failed','unconfirmed','partial']);
  function outboxStatusLabel(item){
    if(!item)return '';
    if(item.status==='acknowledged')return '✓ Client-reported ACK';
    if(item.status==='sent')return item.kind==='group'?'✓ Sent to BC · waiting for ACK':(item.transport==='marvelous'||item.mode==='offline'?'✓ Encrypted offline note saved':'✓ Sent to BC · unconfirmed');
    if(item.status==='partial')return '◔ Partially sent · review outbox';
    if(item.status==='unconfirmed')return '？ Delivery uncertain · do not retry blindly';
    if(item.status==='failed')return '⚠ Failed · retry available';
    if(item.status==='sending')return '⌛ Sending…';
    if(item.status==='cancelled')return '✕ Cancelled';
    return '⌛ Queued';
  }
  function pruneOutbox(){
    if(state.deliveryOutbox.length<=120)return;
    const active=state.deliveryOutbox.filter(x=>liveOutboxStatuses.has(x.status));
    const finished=state.deliveryOutbox.filter(x=>!liveOutboxStatuses.has(x.status));
    state.deliveryOutbox=active.slice(-75).concat(finished.slice(-Math.max(0,120-Math.min(75,active.length)))).sort((a,b)=>a.created-b.created);
  }
  function outboxById(id){return state.deliveryOutbox.find(x=>x.id===id)||null;}
  function outboxForMessage(m){return m?.outboxId?outboxById(m.outboxId):null;}
  function setOutboxChanged(item){
    item.updated=Date.now();pruneOutbox();saveNow(true);
    if(!state.open||outboxRuntime.repaintQueued)return;
    outboxRuntime.repaintQueued=true;
    // Coalesce every packet in this frame, including multi-recipient groups.
    requestAnimationFrame(()=>{
      outboxRuntime.repaintQueued=false;
      if(!state.open||!ui.body)return;
      for(const label of ui.body.querySelectorAll('[data-outbox-status]')){
        const entry=outboxById(label.dataset.outboxStatus);
        if(entry){const text=outboxStatusLabel(entry);if(label.textContent!==text)label.textContent=text;}
      }
      const kind=state.tab==='groups'?'group':'chat',id=kind==='group'?state.selectedGroup:state.selected;
      refreshOutboxPopover(kind,id);
    });
  }
  function outboxMarkup(kind,to){
    const list=state.deliveryOutbox.filter(x=>x.kind===kind&&String(x.to)===String(to)&&x.status!=='cancelled').slice(-10).reverse();
    const flagged=list.filter(x=>liveOutboxStatuses.has(x.status));
    const shown=flagged.length?list.slice(0,5):list.slice(0,1);
    return `<section id="kc-outbox-popup" class="kc-outbox kc-outbox-popover" data-kind="${escapeText(kind)}" data-to="${escapeText(to)}" role="region" aria-label="Message delivery outbox" ${outboxIsOpen(kind,to)?'':'hidden'}><div class="kc-outbox-title">📤 Outbox${flagged.length?` · ${flagged.length} to review`:''}<button type="button" class="kc-outbox-close" data-action="toggleoutbox" aria-label="Close outbox">×</button></div>${shown.map(x=>`<div class="kc-outbox-row"><span class="kc-outbox-preview" title="${escapeText(x.text)}">${escapeText(x.text.slice(0,42))}</span><span class="kc-outbox-status" data-outbox-status="${escapeText(x.id)}" title="${escapeText(x.reason||'')}">${escapeText(outboxStatusLabel(x))}</span>${x.status==='failed'?`<small class="kc-outbox-error">${escapeText(x.reason||'Not sent')}</small>`:''}${x.status==='failed'||(x.kind==='group'&&Object.values(x.targets||{}).includes('failed'))?`<button class="secondary" data-outbox-retry="${escapeText(x.id)}" title="Retry only failed destinations">Retry failed</button>`:''}${x.status==='queued'?`<button class="secondary" data-outbox-cancel="${escapeText(x.id)}">Cancel</button>`:''}</div>`).join('')||'<div class="kc-outbox-empty">Nothing pending <small>BC delivery is not guaranteed.</small></div>'}</section>`;
  }
  function markOutboxMessage(item,member){
    const arr=state.chats[numeric(member)]?.messages;
    if(!arr)return;
    const found=[...arr].reverse().find(m=>m.from===me()&&m.mode===(item.mode==='offline'?'beep':item.mode)&&m.text===item.text&&Math.abs(m.time-item.created)<20000);
    if(found){
      found.outboxId=item.id;item.messageId=found.id;
      const visible=state.open&&state.tab==='chats'&&state.selected===numeric(member)?ui.shadow?.getElementById('kc-log'):null;
      const row=visible?.querySelector(`[data-message-id="${CSS.escape(String(found.id))}"]`);
      const meta=row?.querySelector('.msgmeta');
      if(meta&&!meta.querySelector('[data-outbox-status]')){
        const badge=document.createElement('span');badge.className='kc-delivery';
        badge.dataset.outboxStatus=item.id;badge.textContent=outboxStatusLabel(item);
        meta.append(' ',badge);
      }
    }
  }
  function enqueueDelivery(kind,to,text,mode='beep',replyTo=null){
    text=trim(text,kind==='group'?MAX_GROUP_TEXT:2000);
    if(!text||!to)return null;
    const key=`${kind}:${to}:${mode}:${text}`;
    const last=outboxRuntime.nonce.get(key)||0;
    // Some UI input handlers can double-submit in one frame. Keep deliberate
    // repeated identical messages possible after a short guard interval.
    if(Date.now()-last<500){notice('Already queued this message.');return null;}
    outboxRuntime.nonce.set(key,Date.now());
    if(outboxRuntime.nonce.size>75)for(const [k,t] of outboxRuntime.nonce)if(Date.now()-t>5000)outboxRuntime.nonce.delete(k);
    const g=kind==='group'?state.groups[to]:null;
    if(kind==='group'&&(!g?.joined||!g.accepted.includes(me())))return null;
    const targets=kind==='group'?Object.fromEntries(g.accepted.filter(n=>n!==me()).map(n=>[n,'queued'])):{};
    if(kind==='group'&&!Object.keys(targets).length)return null;
    const item={id:uniquePawId('out'),kind,to,text,mode:kind==='group'?'group':mode,replyTo:normalizeReply(replyTo),targets,ackTokens:{},
      mid:kind==='group'?uniqueMessageId():'',secure:kind==='chat'&&mode!=='offline'&&pawSecureSecrets.has(numeric(to)),transport:'',messageId:'',created:Date.now(),updated:Date.now(),attempts:0,nextTry:0,status:'queued',reason:''};
    state.deliveryOutbox.push(item);pruneOutbox();saveNow(true);
    if(kind==='group'){
      addGroupMessage(g,me(),text,item.mid,replyTo);
      const local=g.messages.find(m=>m.id===item.mid);if(local)local.outboxId=item.id;
      if(state.open&&state.tab==='groups'&&state.selectedGroup===g.id)appendVisibleGroupMessage(g,item.mid);
    }
    dispatchOutbox();return item;
  }
  async function dispatchOutbox(){
    if(outboxRuntime.draining||!state.myId||me()!==state.myId)return;
    outboxRuntime.draining=true;
    try {
      for(const item of state.deliveryOutbox){
        if(item.status!=='queued'||Number(item.nextTry)>Date.now())continue;
        if(item.mode!=='offline' && typeof window.ServerSend!=='function'){item.nextTry=Date.now()+2000;continue;}
        if(item.kind==='chat'&&item.mode==='whisper'&&(!inRoom(item.to)||typeof window.ChatRoomSendWhisper!=='function')){
          // Whispers MUST remain room-scoped, never transmit to someone elsewhere.
          item.status='failed';item.reason='Not in the same room';setOutboxChanged(item);continue;
        }
        if(item.kind==='chat'&&item.mode==='beep'&&!myFriends().includes(numeric(item.to))){item.status='failed';item.reason='Not a BC friend';setOutboxChanged(item);continue;}
        // A just-opened chat may not have a recent native BC OnlineFriends list.
        // Briefly wait for the authoritative BC response before picking Beep vs Note.
        // A network timeout never masquerades as proof that someone is offline.
        if(item.kind==='chat'&&item.mode==='beep'&&!inRoom(item.to)&&!pawPresenceIsFresh()&&
           Date.now()-item.created<10000&&pawRequestPresenceForDelivery()){
          item.nextTry=Date.now()+1600;
          continue;
        }
        const group=item.kind==='group'?state.groups[item.to]:null;
        if(item.kind==='group'&&!group?.joined){item.status='failed';item.reason='Group no longer joined';setOutboxChanged(item);continue;}
        if(item.kind==='group'){
          // Reserve all destinations as "sending" before crossing the transport
          // boundary. Reloading mid-send marks them unconfirmed, not queued.
          const eligible=Object.keys(item.targets).filter(n=>item.targets[n]==='queued');
          if(!eligible.length)continue;
          for(const id of eligible)item.targets[id]='sending';
          item.status='sending';item.attempts++;setOutboxChanged(item);
          let succeeded=0;
          for(const recipient of eligible){
            const id=numeric(recipient);
            if(!group.accepted.includes(id)||!myFriends().includes(id)){item.targets[recipient]='failed';continue;}
            (item.ackTokens ||= {})[recipient] ||= integrityNonce();saveNow(true);
            // BC's ServerSend has no delivery receipt; once invoked, we must
            // not automatically send the packet a second time.
            try{
              const ok=sendGroupWire(id,{t:'msg',id:group.id,mid:item.mid,text:item.text,replyTo:item.replyTo,ackToken:(item.ackTokens ||= {})[recipient] ||= integrityNonce()},`🐾 [${group.name}] ${bcName(me())}: ${item.text}`);
              item.targets[recipient]=ok?'sent':'unconfirmed';
              if(ok)succeeded++;
            }catch(err){item.targets[recipient]='unconfirmed';console.warn('[PawLounge] Group transport result uncertain:',err);}
            setOutboxChanged(item);
          }
          const statuses=Object.values(item.targets);
          item.status=statuses.every(v=>v==='acknowledged')?'acknowledged':statuses.some(v=>v==='failed'||v==='unconfirmed')?'partial':'sent';
          if(succeeded&&!group.messages.some(m=>m.id===item.mid)){
            addGroupMessage(group,me(),item.text,item.mid,item.replyTo);
            const saved=group.messages.find(m=>m.id===item.mid);if(saved)saved.outboxId=item.id;
            if(state.open&&state.tab==='groups'&&state.selectedGroup===group.id)appendVisibleGroupMessage(group,item.mid);
          }
          setOutboxChanged(item);outboxRuntime.sent+=succeeded;
        }else{
          item.status='sending';item.attempts++;setOutboxChanged(item);
          let crossed=false;
          try{
            // Native BC beeps are not an offline mailbox. Route only if BC
            // recently confirmed offline, or the sender chose Offline Note.
            // Never silently reroute an unknown presence state.
            if(item.mode==='offline'||(item.mode==='beep'&&pawFriendConfirmedOffline(item.to))){
              const noteId=await marvelousSendOfflineChat(item.to,item.text,()=>{crossed=true;});
              item.transport='marvelous';item.messageId='marv_'+noteId;
              appendMessage(item.to,item.text,me(),'beep','local',{messageId:item.messageId,offline:true});
            }else if(item.mode==='whisper'){
              const before=window.ChatRoomTargetMemberNumber;
              try{
                const encrypted=item.secure?await pawEncryptPrivate(item.to,item.text,'whisper'):null;
                if(encrypted)item.messageId=encrypted.id;
                const encoded=encrypted?encrypted.wire:state.settings.encodePrivateChat?pawEncodeChat(item.text,'whisper'):item.text;
                if(encoded.length>1950)throw Error('Message too long');
                window.ChatRoomTargetMemberNumber=numeric(item.to);crossed=true;window.ChatRoomSendWhisper(numeric(item.to),encoded);
              }
              finally{window.ChatRoomTargetMemberNumber=before;}
              appendMessage(item.to,item.text,me(),'whisper','local',item.secure?{messageId:item.messageId}:{});
            }else{
              try{
                const encrypted=item.secure?await pawEncryptPrivate(item.to,item.text,'beep'):null;
                if(encrypted)item.messageId=encrypted.id;
                const encodedBeep=encrypted?encrypted.wire:state.settings.encodePrivateChat?pawEncodeChat(item.text,'beep'):item.text;
                if(encodedBeep.length>1950)throw Error('Encoded message too long; shorten it or disable encoding');
                crossed=true;
                state.suppressOutgoing=true;
                if(typeof window.ServerSendBeepMessage==='function'){
                  window.ServerSendBeepMessage(item.to,encodedBeep,item.replyTo?{messageType:'Reply',replyTo:item.replyTo}:{});
                }else{
                  window.ServerSend('AccountBeep',{MemberNumber:item.to,BeepType:'',IsSecret:true,Message:encodedBeep});
                  if(Array.isArray(window.FriendListBeepLog))window.FriendListBeepLog.push({MemberNumber:item.to,MemberName:bcName(item.to),Sent:true,Private:true,Time:new Date(),Message:item.text});
                }
              }finally{state.suppressOutgoing=false;}
              appendMessage(item.to,item.text,me(),'beep','local',item.secure?{messageId:item.messageId}:{});
            }
            markOutboxMessage(item,item.to);
            item.status='sent';item.reason=item.transport==='marvelous'?'Encrypted offline note saved for 7 days; read receipt unavailable until opened':'Handed to BC; recipient receipt unavailable';outboxRuntime.sent++;
          }catch(err){if(err?.definitive)crossed=false;item.status=crossed?'unconfirmed':'failed';item.reason=trim(String(err?.message||err),130);console.warn('[PawLounge] Message handoff:',err);}
          setOutboxChanged(item);
        }
      }
    }finally{outboxRuntime.draining=false;}
  }
  function retryFailedOutbox(id){
    const item=outboxById(id);if(!item||!['failed','partial'].includes(item.status))return;
    // Never retry a sent/uncertain packet: doing so could duplicate delivery.
    if(item.kind==='group'){
      for(const key of Object.keys(item.targets))if(item.targets[key]==='failed')item.targets[key]='queued';
      if(!Object.values(item.targets).includes('queued'))return notice('No safely retryable destinations. Sent or uncertain packets will not be resent.');
    }else if(item.status!=='failed')return;
    if(item.kind==='chat'){
      // User knowingly retries one failed send; prevent stacking duplicates.
      if(!window.confirm('Retry the failed message? Only retry if you are confident it was not delivered.'))return;
    }
    item.status='queued';item.nextTry=0;item.reason='';setOutboxChanged(item);dispatchOutbox();
  }
  function cancelQueuedOutbox(id){
    const item=outboxById(id);if(!item||item.status!=='queued')return;
    item.status='cancelled';setOutboxChanged(item);
  }
  function markGroupOutboxAck(groupId,mid,from){
    for(const item of state.deliveryOutbox){
      if(item.kind!=='group'||item.to!==groupId||item.mid!==mid||!Object.hasOwn(item.targets,from))continue;
      if(item.targets[from]==='acknowledged')break;
      item.targets[from]='acknowledged';
      const statuses=Object.values(item.targets);
      if(statuses.every(x=>x==='acknowledged'))item.status='acknowledged';
      else if(statuses.some(x=>x==='failed'||x==='unconfirmed'))item.status='partial';
      else item.status='sent';
      setOutboxChanged(item);break;
    }
  }
  function appendVisibleGroupMessage(group,mid){
    const log=ui.shadow?.getElementById('kc-log');
    if(!log||state.tab!=='groups'||state.selectedGroup!==group.id)return false;
    if(log.querySelector('[data-message-id="'+CSS.escape(mid)+'"]'))return true;
    // Reuse the existing renderer's exact row HTML, but only insert that row.
    // If paging, a filter or unexpected structure is active, preserve scroll and
    // gracefully fall back to the existing group renderer.
    if(state.historyOlder.length||state.historyLoading||state.messageSearch)return false;
    const m=group.messages.find(x=>x.id===mid);if(!m)return false;
    const mine=m.from===me(),st=sticker(m.text),oldNearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<100;
    const html=`<div class="msgrow ${mine?'mine':'other'}" data-message-id="${escapeText(m.id)}"><div class="msgavatar">${avatar(mine?me():m.from)}</div><div class="msgcol"><div class="msgbubble"><div class="group-message-author">${escapeText(mine?'You':name(m.from))}</div>${replyPreview(m.replyTo)}${st?`<div class="msgsticker">${asset(`sticker-${st.id}.png`,'',st.emoji)}</div>`:escapeText(m.text)}</div>${reactionMarkup(m,'group',group.id)}<div class="msgmeta">${m.recovered?`<span title="Matched by ${m.verifiedBy?.length||0} other group participants; client-reported, not cryptographically verified">✓ ${m.verifiedBy?.length||0} peer confirmations · </span>`:''}${new Date(m.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} <span data-group-receipt="${escapeText(m.id)}">· ✓ ${group.receipts?.[m.id]?.length||0}/${Math.max(0,group.accepted.length-1)} client ACKs</span> <span class="kc-delivery" data-outbox-status="${escapeText(m.outboxId||'')}">${m.outboxId?escapeText(outboxStatusLabel(outboxById(m.outboxId))):''}</span> ${messageActions(m,'group')}</div></div></div>`;
    const empty=log.querySelector(':scope > .empty');if(empty)empty.remove();
    log.insertAdjacentHTML('beforeend',html);
    if(oldNearBottom)log.scrollTop=log.scrollHeight;
    return true;
  }
  function sendGroupMessage(text) {
    const g=currentGroup();text=trim(text,MAX_GROUP_TEXT);
    if(!g?.joined||!text)return false;
    const reply=state.replyTarget?.kind==='group'&&state.replyTarget.conversation===g.id?normalizeReply(state.replyTarget):null;
    const item=enqueueDelivery('group',g.id,text,'group',reply);
    if(!item){notice('Could not queue group message. Check group membership.');return false;}
    if(ui.input)ui.input.value='';g.draft='';state.replyTarget=null;renderReplyBar();saveSoon();
    if(item.status==='partial')notice('Some group members could not receive your message. Review Outbox.');
    return true;
  }
  function leaveGroup() {
    const g=currentGroup();if(!g)return;
    if (!window.confirm(`Leave ${g.name}? Local group history will be deleted.`))return;
    if (me()!==g.creator) sendGroupWire(g.creator,{t:'leave',id:g.id},`🐾 ${bcName(me())} left ${g.name}.`);
    delete state.groups[g.id];state.selectedGroup='';saveSoon();updateBadge();render();
  }
  // Decode ordinary BC beeps, including their metadata envelope (replies and
  // action messages). Do not save the internal metadata JSON as chat text.
  // Use BC's own parser whenever it exists, then a conservative fallback.
  function parseNativeBeep(raw) {
    if (typeof raw!=='string') return {text:'(Beep)',reaction:false,meta:{}};
    try {
      if (typeof window.FriendListBeepParseMessage==='function') {
        const parsed=window.FriendListBeepParseMessage(raw);
        if (parsed && typeof parsed==='object') {
          const meta=parsed.metadata && typeof parsed.metadata==='object'?parsed.metadata:{};
          return {text:trim(stripNativeBeepMetadata(typeof parsed.text==='string'?parsed.text:raw),2000)||'(Beep)',
            reaction:meta.messageType==='Reaction',meta};
        }
      }
    } catch(err){ console.warn('[Kittychat] Beep parser unavailable:',err); }
    return {text:trim(stripNativeBeepMetadata(raw),2000)||'(Beep)',reaction:false,meta:{}};
  }
  function rememberNativeSender(member, senderName) {
    const c = ensure(member);
    if (!c) return;
    const display = trim(senderName, 80);
    if (display) c.displayName = display; // Keep the local nickname intact.
  }
  function receiveBeep(data) {
    if (!data || typeof data !== 'object') return;
    const from = numeric(data.MemberNumber);
    if (!from || from === me()) return;
    // Internal group invitations/messages are not regular beeps.
    if (data.BeepType==='KCStatus') { if(inboundLimit(from,'status',String(data.Message||''),1600)) receiveFriendStatus(data,from); return; }
    if (data.BeepType===PAW_WHISPER_REACTION){
      try{if(inboundLimit(from,'reaction',String(data.Message||''),2000)){const p=pawParseWireJSON(String(data.Message||''),2500);if(integrityAcceptEvent('whisperReaction',from,p))receiveWhisperReaction(p,from);}}catch{}
      return;
    }
    if (data.BeepType==='KCMoment') {if(inboundLimit(from,'moment',String(data.Message||''),4000))receivePawMoment(data,from);return;}
    if (data.BeepType==='KCPawInvite'){if(inboundLimit(from,'invite',String(data.Message||''),4000))receivePawInvite(data,from);return;}
    if (data.BeepType==='KCPawAlbum'){if(inboundLimit(from,'album',String(data.Message||''),22500))receivePawAlbum(data,from);return;}
    if (data.BeepType==='KCPawGuestbook'){if(inboundLimit(from,'guestbook',String(data.Message||''),4000))receivePawGuestbook(data,from);return;}
    if (data.BeepType==='KCGroupControl') {receiveGroupBeep(data,from);return;}
    if (!data.BeepType && receiveGroupBeep(data, from)) return;
    if (data.BeepType === 'KCProfile') {
      if(!inboundLimit(from,'profile',String(data.Message||''),6800))return;
      try {
        const rawProfile = pawParseWireJSON(String(data.Message || ''),9000);
        if (rawProfile?.type !== 'KCProfile') return;
        const normalized = normalizePawProfile(rawProfile, from);
        if (!normalized) return;
        state.profiles[from] = {
          ...(state.profiles[from] || {}),
          name: normalized.name, avatar: normalized.avatar, signature: normalized.signature,
          pawProfile: normalized, kitty: true, updated: Date.now()
        };
        saveSoon();
        if (state.open) {
          renderSidebar();
          if (state.selected === from) renderChat();
          openViewProfileModal(from);
        }
      } catch { /* Ignore malformed profile messages. */ }
      return;
    }
    if (data.BeepType === 'KCTyping') {
      if(!inboundLimit(from,'typing',String(data.Message||''),850))return;
      try { receiveTypingPaws(pawParseWireJSON(data.Message,1000),from,'beep'); }
      catch { /* Ignore invalid/legacy typing signals. */ }
      return;
    }
    // No other special-purpose BC/addon beeps should become chat messages.
    if (data.BeepType && data.BeepType !== '') return;
    const message = parseNativeBeep(data.Message);
    const decodedChat=pawDecodeChat(message.text);
    if(decodedChat!==null)message.text=decodedChat;
    if(pawSecureToken(message.text)){void pawHandleSecureInbound(message.text,from,'beep');return;}
    if (message.reaction) {if(typeof message.meta.reactionTo==='string'&&typeof message.meta.reactionEmoji==='string')void applyReaction('chat',from,message.meta.reactionTo,from,message.meta.reactionEmoji,!!message.meta.reactionRemove);return;}
    rememberNativeSender(from, data.MemberName);
    appendMessage(from, message.text, from, 'beep','network',message.meta);
  }
  function onOutgoing(type, payload) {
    if (state.suppressOutgoing || !payload) return;
    if (type === 'AccountBeep') {
      if (payload.BeepType && payload.BeepType !== '') return;
      if (kcDecode(payload.Message)) return;
      const target = numeric(payload.MemberNumber);
      const message = parseNativeBeep(payload.Message);
      message.text=pawDecodeChat(message.text)??message.text;
      if(pawSecureToken(message.text)) return;
      if (target && message.reaction) {if(message.meta?.reactionTo&&message.meta?.reactionEmoji)void applyReaction('chat',target,message.meta.reactionTo,me(),message.meta.reactionEmoji,!!message.meta.reactionRemove);}
      else if (target && message.text !== '(Beep)') appendMessage(target, message.text, me(), 'beep','network',message.meta);
    } else if (type === 'ChatRoomChat' && payload.Type === 'Whisper') {
      // Captures BC's native whisper composer too, not only Kittychat sends.
      // A server echo is deduplicated by appendMessage().
      const target = numeric(payload.Target);
      const whisperId=prepareOutgoingWhisper(payload);
      if (pawSecureToken(payload.Content)) return;
      if (target && target !== me() && typeof payload.Content === 'string')
        appendMessage(target, payload.Content, me(), 'whisper','network',{messageId:whisperId});
    }
  }
  // Only Subbycat's place is eligible for persistent room-chat history.
  // Content is strictly public chat / emotes; never whispers, activities or hidden packets.
  const ROOM_HISTORY_NAME = "subbycat's place";
  const roomReplay = { lastRoom:'', snapshot:[], log:null, restoreCount:0 };
  function roomKey(name) {
    return String(name || '').trim().replace(/[‘’`´]/g,"'").replace(/\s+/g,' ').toLocaleLowerCase('en');
  }
  function inHistoryRoom() {
    return window.CurrentScreen === 'ChatRoom' && roomKey(window.ChatRoomData?.Name) === ROOM_HISTORY_NAME;
  }
  function onPublicRoomMessage(data, senderCharacter = null) {
    if (!inHistoryRoom() || !data || !['Chat','Emote'].includes(data.Type) || typeof data.Content !== 'string') return;
    const text = trim(data.Content, 1200);
    if (!text) return;
    const sender = numeric(data.Sender ?? data.MemberNumber ?? senderCharacter?.MemberNumber);
    const who = trim(data.SenderName || senderCharacter?.Nickname || senderCharacter?.Name ||
      (sender ? bcName(sender) : ''), 80) || (sender ? `#${sender}` : 'Someone');
    const message = { sender, name:who, text, type:data.Type, at:Date.now() };
    const latest = state.roomHistory[state.roomHistory.length - 1];
    // BC may deliver a packet through both supported handler paths.
    if (latest && latest.sender === sender && latest.text === text && latest.type === data.Type &&
        message.at - latest.at < 1200) return;
    state.roomHistory.push(message);
    if (state.roomHistory.length > 20) state.roomHistory.splice(0,state.roomHistory.length - 20);
    saveSoon();
  }
  function captureNativeRoomMessage(data, sender) {
    if(onHiddenTypingPacket(data,sender))return;
    if(onWhisperReactionPacket(data,sender))return;
    onWhisper(data, sender);
    onPublicRoomMessage(data, sender);
  }
  function restoreSubbycatRoomHistory() {
    // Presentation-only preference: retain local history without placing it
    // into the native BC chat log while this feature is disabled.
    if (state.settings.showSubbycatRecentMessages === false) {
      document.getElementById('kc-subbycat-previous-session')?.remove();
      roomReplay.lastRoom=''; roomReplay.snapshot=[]; roomReplay.log=null;
      return;
    }
    const active = inHistoryRoom();
    if (!active) {
      roomReplay.lastRoom=''; roomReplay.snapshot=[]; roomReplay.log=null;
      return;
    }
    if (!roomReplay.lastRoom) {
      roomReplay.lastRoom=ROOM_HISTORY_NAME;
      roomReplay.snapshot=state.roomHistory.slice(-20).map(m=>({...m}));
      roomReplay.log=null;
    }
    const log = document.getElementById('TextAreaChatLog');
    if (!log || !log.isConnected || !roomReplay.snapshot.length || log.querySelector('#kc-subbycat-previous-session')) return;
    // If BC replaces its chat log without a detectable screen transition,
    // refresh the transcript from persistent room history for that new log.
    if (roomReplay.log && roomReplay.log !== log) roomReplay.snapshot=state.roomHistory.slice(-20).map(m=>({...m}));
    roomReplay.log=log;
    const holder=document.createElement('section');
    holder.id='kc-subbycat-previous-session';
    holder.dataset.room='subbycats-place';
    holder.style.cssText='border:1px solid #95627b;background:#2a1729d9;color:#fbe3ef;border-radius:10px;margin:8px 4px 12px;padding:8px 11px;font:12px/1.55 system-ui;white-space:normal;overflow-wrap:anywhere;';
    const title=document.createElement('div');
    title.textContent='🐾 Subbycat’s place — last '+roomReplay.snapshot.length+' public messages (previous session)';
    title.style.cssText='font-weight:750;color:#f9abd2;margin-bottom:5px;';
    holder.append(title);
    for (const entry of roomReplay.snapshot) {
      const line=document.createElement('div');
      const time = new Date(entry.at);
      const prefix=Number.isNaN(time.getTime()) ? '' : time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ' · ';
      line.textContent=prefix+(entry.type==='Emote' ? '* '+entry.name+' '+entry.text : entry.name+': '+entry.text);
      holder.append(line);
    }
    // Purely local DOM; never replay a packet through BC, which would duplicate
    // messages in addons, notifications or other players' rooms.
    log.insertBefore(holder,log.firstChild);
    roomReplay.restoreCount++;
  }

  // BC's incoming Whisper packet may have a Sender but no Target. On the
  // receiver's client the server has already delivered it privately. Reject
  // any *explicit* target which names another player, but do not drop a valid
  // inbound whisper just because Target was omitted by the server.
  function onWhisper(data, senderCharacter = null) {
    if (!data || data.Type !== 'Whisper' || typeof data.Content !== 'string') return;
    const self = me();
    const from = numeric(data.Sender ?? data.MemberNumber ?? senderCharacter?.MemberNumber);
    const target = numeric(data.Target ?? data.TargetMemberNumber ?? data.Recipient);
    if (!self || !from) return;
    if (from === self) {
      // Outgoing echoes need an explicit recipient. Local outgoing sends are
      // also captured at ServerSend, so missing-target echoes are harmless.
      if (pawSecureToken(data.Content)) return;
      if (target && target !== self) appendMessage(target, pawDecodeChat(data.Content)??data.Content, self, 'whisper','network',{messageId:nativeWhisperId(data)});
      return;
    }
    // An explicit target for somebody else must never enter our inbox.
    if (target && target !== self) return;
    const senderName = data.SenderName || data.MemberName || senderCharacter?.Nickname || senderCharacter?.Name;
    rememberNativeSender(from, senderName);
    if(pawSecureToken(data.Content)){void pawHandleSecureInbound(data.Content,from,'whisper');return;}
    appendMessage(from, pawDecodeChat(data.Content)??data.Content, from, 'whisper','network',{messageId:nativeWhisperId(data)});
  }
  function registerNativeWhisperHandler() {
    // The built-in message handler is a secondary receive path on BC versions
    // which dispatch their room messages through registered handlers. It never
    // modifies, blocks or stops a BC message; appendMessage deduplicates the
    // overlap with the ChatRoomMessage hook.
    if (state.nativeWhisperHandler || typeof window.ChatRoomRegisterMessageHandler !== 'function') return;
    const handler = {
      Description: 'Kittychat native whisper inbox listener',
      Priority: -100,
      Callback: (data, sender) => {
        try { captureNativeRoomMessage(data, sender); }
        catch (err) { console.warn('[Kittychat] Native whisper handler:', err); }
        return false;
      }
    };
    try {
      window.ChatRoomRegisterMessageHandler(handler);
      state.nativeWhisperHandler = handler;
    } catch (err) {
      console.warn('[Kittychat] Optional native whisper handler unavailable:', err);
    }
  }
  // Quiet native BC notifications for Kittychat-muted contacts. Do not block
  // the message packet: BC must still update its beep log and show whispers.
  // Incoming packet context is synchronous and sender-specific; it is never a
  // global toggle of Player.AudioSettings or another player's sounds.
  let nativeMuteContext = null;
  const mutedNativeAudioStats = { beeps: 0, whispers: 0, notifications: 0 };
  function isMutedNativeContact(member) {
    const id = numeric(member);
    return !!(id && id !== me() && state.chats[id]?.muted);
  }
  function mutedNativeSender(kind, packet) {
    if (!packet || typeof packet !== 'object') return 0;
    if (kind === 'beep') {
      // Never interfere with other BC beep types (e.g. leash signals).
      if (packet.BeepType && packet.BeepType !== '') return 0;
      const from = numeric(packet.MemberNumber);
      return isMutedNativeContact(from) ? from : 0;
    }
    if (kind === 'whisper') {
      if (packet.Type !== 'Whisper') return 0;
      const from = numeric(packet.Sender ?? packet.MemberNumber);
      const to = numeric(packet.Target ?? packet.TargetMemberNumber ?? packet.Recipient);
      if (to && to !== me()) return 0;
      return isMutedNativeContact(from) ? from : 0;
    }
    return 0;
  }
  function inMutedNativePacket(kind, packet, callback) {
    const member = mutedNativeSender(kind,packet);
    if (!member) return callback();
    const parent = nativeMuteContext;
    nativeMuteContext = { member, kind };
    try { return callback(); }
    finally { nativeMuteContext = parent; }
  }
  function nativeSilentBeepArgs(args) {
    const options = args[2];
    const member = numeric(options?.memberNumber ?? options?.MemberNumber) ||
      (nativeMuteContext?.kind === 'beep' ? nativeMuteContext.member : 0);
    if (!isMutedNativeContact(member)) return args;
    // ServerShowBeep(..., { silent:true }) still displays BC's toast but skips
    // NotificationRaise(BEEP), which otherwise triggers the native beep audio.
    if (options?.silent) return args;
    mutedNativeAudioStats.beeps++;
    const next = [...args]; next[2] = { ...(options || {}), silent: true };
    return next;
  }
  function isNativeMessageNotification(type) {
    const eventTypes = window.NotificationEventType || {};
    const name = typeof type === 'string' ? type :
      Object.keys(eventTypes).find(key => eventTypes[key] === type) || '';
    return /beep|whisper|chat|message/i.test(name);
  }
  function suppressNativeMessageNotification(args) {
    const eventType = args[0];
    const options = args[1] || {};
    const from = numeric(options.memberNumber ?? options.MemberNumber ?? options.senderMemberNumber ?? options.characterMemberNumber);
    const scoped = nativeMuteContext;
    const eventName = typeof eventType === 'string' ? eventType :
      Object.keys(window.NotificationEventType || {}).find(key => window.NotificationEventType[key] === eventType) || '';
    // Outside a known incoming whisper, do not silence public room chat.
    const targeted = from && isMutedNativeContact(from) && /beep|whisper/i.test(eventName);
    // Some BC chat versions omit memberNumber on a whisper's notification;
    // while *processing that exact inbound whisper* we still know its sender.
    // Do not suppress unrelated room messages or non-message notifications.
    const withinMutedPacket = scoped && isMutedNativeContact(scoped.member) &&
      (!from || from === scoped.member) &&
      isNativeMessageNotification(eventType);
    if (!(targeted || withinMutedPacket)) return false;
    mutedNativeAudioStats.notifications++;
    if (scoped?.kind === 'whisper' || /whisper|chat/i.test(String(eventType))) mutedNativeAudioStats.whispers++;
    return true;
  }

  function hookBC() {
    registerNativeWhisperHandler();
    if (state.mod) return;
    if (typeof window.ServerSend !== 'function' || typeof window.ServerAccountBeep !== 'function' || typeof window.ChatRoomMessage !== 'function') return;
    const sdk = window.bcModSdk;
    if (sdk && typeof sdk.registerMod === 'function') {
      try {
        const mod = sdk.registerMod({ name: 'kittychat', fullName: 'PawLounge', version: VERSION,
          repository: 'https://github.com/marvelous-bc/pawlounge' });
        mod.hookFunction('ServerAccountBeep', 1, (args, next) => {
          try {
            const data=args[0];
            // Known Kittychat group envelopes are handled only in Kittychat, not BC's normal beep window.
            if (data && !data.BeepType && kcDecode(data.Message) && receiveGroupBeep(data,numeric(data.MemberNumber))) return;
            receiveBeep(data);
          } catch (e) { console.warn('[Kittychat] receive:',e); }
          return inMutedNativePacket('beep', args[0], () => next(args));
        });
        // Observe native BC's online-friend results using the same ModSDK
        // chain as the other PawLounge features (no direct overwrite).
        // Failure to install this optional hook only disables remote status
        // labels; native BC login and the rest of PawLounge keep working.
        if (typeof window.ServerAccountQueryResult === 'function') {
          try {
            mod.hookFunction('ServerAccountQueryResult', 1, (args, next) => {
              try { pawObserveNativePresence(args[0]); }
              catch (err) { console.warn('[PawLounge] Online presence observation failed:', err); }
              return next(args);
            });
            pawOnlinePresence.modSdkHookInstalled=true;
          } catch (err) { console.warn('[PawLounge] ModSDK online presence hook unavailable:', err); }
        }
        mod.hookFunction('ServerSend', 1, (args, next) => { try { onOutgoing(args[0], args[1]); } catch (e) { console.warn('[Kittychat] send:',e); } return next(args); });
        mod.hookFunction('ChatRoomMessage', 1, (args, next) => { try { captureNativeRoomMessage(args[0]); } catch (e) { console.warn('[Kittychat] whisper:',e); } return inMutedNativePacket('whisper', args[0], () => next(args)); });
        // Optional BC hooks are independent: a renamed API must not break
        // the existing messenger hooks or prevent Kittychat from loading.
        if (typeof window.ServerShowBeep === 'function') {
          try { mod.hookFunction('ServerShowBeep', 1, (args, next) => next(nativeSilentBeepArgs(args))); }
          catch (e) { console.warn('[Kittychat] Native beep silence hook unavailable:',e); }
        }
        if (typeof window.NotificationRaise === 'function') {
          try { mod.hookFunction('NotificationRaise', 1, (args, next) => suppressNativeMessageNotification(args) ? undefined : next(args)); }
          catch (e) { console.warn('[Kittychat] Native notification silence hook unavailable:',e); }
        }
        state.mod = mod; log('Connected with BC Mod SDK'); return;
      } catch (err) { console.warn('[Kittychat] Mod SDK registration failed; using chainable wrappers:',err); }
    }
    // ModSDK may be initialized later by BCX or the mod manager. Do not
    // replace native BC functions as a fallback: wait for SDK, then retry on
    // the existing startup tick. Native BC remains untouched in the meantime.
    if (!hookBC.waitNoticeLogged) {
      hookBC.waitNoticeLogged=true;
      console.info('[PawLounge] ModSDK not available yet; waiting to register compatible BC hooks.');
    }
  }
  function sendText(text, target = state.selected) {
    const member=numeric(target),chat=ensure(member);
    text=trim(text,2000);
    if(!member||!chat||!text)return false;
    const reply=state.replyTarget?.kind==='chat'&&Number(state.replyTarget.conversation)===member?normalizeReply(state.replyTarget):null;
    const mode=['beep','whisper','offline'].includes(state.composerMode)?state.composerMode:'beep';
    if(mode==='whisper'&&!inRoom(member)){notice('Whispers require that you are in the same room.');return false;}
    if(mode==='beep'&&!myFriends().includes(member)){notice('Beep messages require a BC friend. Try Whisper in the same room.');return false;}
    const whisperText=mode==='whisper'&&reply?trim(`↪ ${reply.senderName}: ${reply.snippet}\n${text}`,2000):text;
    const item=enqueueDelivery('chat',member,whisperText,mode,reply);
    if(!item)return false;
    if(ui.input)ui.input.value='';chat.draft='';state.replyTarget=null;renderReplyBar();saveSoon();
    if(item.messageId)queueVisiblePrivateChatSync(member,item.messageId);
    scheduleSidebarUpdate();return true;
  }
  function pawGalleryFromSettings() {
    return ['pawGallery1','pawGallery2','pawGallery3','pawGallery4']
      .map(k => trim(state.settings[k] || '', 500))
      .filter(u => /^https:\/\//i.test(u))
      .slice(0, 4);
  }

  // Marvelous Bridge v1: event-driven, local-only, and backward-compatible.
  // It never authenticates users or exposes private messages to other addons.
  const marvelousBridge = {api:null,unsubscribe:[],events:[],lastHeld:'',lowCpu:false,safeMode:false,attached:false,lastStatusAt:0};
  function marvelousBridgeConnect(){
    const api=window.SubbysPlushies;
    if(!api||api.apiVersion!==2||!api.ready){
      if(marvelousBridge.api){
        for(const off of marvelousBridge.unsubscribe.splice(0))try{off();}catch{}
        marvelousBridge.api=null;marvelousBridge.attached=false;
      }
      return null;
    }
    if(marvelousBridge.api===api)return api;
    for(const off of marvelousBridge.unsubscribe.splice(0))try{off();}catch{}
    marvelousBridge.api=api;marvelousBridge.attached=true;
    const capture=(event)=>{
      if(event?.milestone){
        marvelousBridge.events.unshift({at:Date.now(),kind:'plushie',message:
          String(event.plushName||'Plushie').slice(0,80)+' reached '+String(event.milestone).slice(0,40)});
        marvelousBridge.events.length=Math.min(marvelousBridge.events.length,20);
        if(state.open&&state.tab==='marvelous'&&marvelousHub.tab==='security')renderMarvelousHub();
      }
      if(state.open&&state.profileModal?.useOwn)renderProfileModal();
    };
    if(typeof api.on==='function'){
      marvelousBridge.unsubscribe.push(api.on('relationship',capture));
      marvelousBridge.unsubscribe.push(api.on('mood',()=>{if(state.open&&state.profileModal?.useOwn)renderProfileModal();}));
      marvelousBridge.unsubscribe.push(api.on('performance',marvelousBridgeUpdatePerformance));
      marvelousBridge.unsubscribe.push(api.on('essentials',marvelousBridgeUpdatePerformance));
    }
    marvelousBridgeUpdatePerformance();
    try{api.setExternalFocus?.(marvelousFocusRuntime.enabled&&window.CurrentScreen==='ChatRoom');}catch{}
    return api;
  }
  function marvelousBridgeHeld(){
    const api=marvelousBridgeConnect();
    if(!api)return null;
    try{
      const held=api.getHeld?.();if(!held?.name)return null;
      return {name:trim(held.name,80),mood:trim(held.mood?.label||'',40),
        level:trim(held.relationship?.level||'',40),favorite:held.favorite===true};
    }catch{return null;}
  }
  function marvelousBridgeUpdatePerformance(){
    const api=marvelousBridge.api;
    if(!api){marvelousBridge.lowCpu=false;marvelousBridge.safeMode=false;return;}
    try{
      const essentials=api.getEssentialsStatus?.()||{};
      marvelousBridge.safeMode=essentials.safeMode===true;
      marvelousBridge.lowCpu=marvelousBridge.safeMode||essentials.lowCpu===true||api.getPerformanceMode?.()==='low';
    }catch{marvelousBridge.lowCpu=false;marvelousBridge.safeMode=false;}
  }
  function marvelousBridgeTick(){
    if(!me())return;
    marvelousBridgeConnect();
    // Style class may be cleared by a game screen transition; no setting changes.
    if(marvelousBridge.api&&marvelousFocusRuntime.enabled&&window.CurrentScreen==='ChatRoom'){
      if(!document.body?.classList.contains('subbys-marvelous-focus'))try{marvelousBridge.api.setExternalFocus?.(true);}catch{}
    }
  }

  function ownPawProfilePayload() {
    const p = state.settings;
    return {
      type: 'KCProfile', version: 2,
      name: trim(Player?.Name || 'Kitty', 90),
      avatar: /^https:\/\//i.test(trim(p.avatar, 500)) ? trim(p.avatar, 500) : '',
      cover: /^https:\/\//i.test(trim(p.pawHero, 500)) ? trim(p.pawHero, 500) : '',
      signature: trim(p.signature || 'Purrs and pawprints ♡', 140),
      friendStatus: p.shareFriendStatus ? statusLabel(me()) : '',
      petPersona:p.petPersonaShare&&PET_PERSONAS[p.petPersona]?p.petPersona:'',
      petPersonaDescription:p.petPersonaShare?trim(p.petPersonaDescription||'',300):'',
      plushie:trim(p.pawPlushie,80),livePlushie:p.shareLivePlushie?marvelousBridgeHeld():null,badges:trim(p.pawBadges,150).split(',').map(s=>trim(s,24)).filter(Boolean).slice(0,5),profileTheme:['velvet','rose','midnight','lavender'].includes(p.pawProfileTheme)?p.pawProfileTheme:'velvet',guestbookOpen:p.pawGuestbookOpen!==false,
      about: trim(p.pawAbout || '', 240),
      likes: trim(p.pawLikes || '', 240),
      dislikes: trim(p.pawDislikes || '', 240),
      lookingFor: trim(p.pawLookingFor || '', 240),
      timezone: trim(p.pawTimezone || '', 60),
      pronouns: trim(p.pawPronouns || '', 60),
      gallery: pawGalleryFromSettings()
    };
  }
  function normalizePawProfile(profile, member) {
    if (!profile || typeof profile !== 'object') return null;
    const avatar = trim(profile.avatar || '', 500);
    const cover = trim(profile.cover || profile.hero || '', 500);
    const gallery = Array.isArray(profile.gallery) ? profile.gallery : [];
    return {
      name: trim(profile.name || bcName(member), 90),
      avatar: /^https:\/\//i.test(avatar) ? avatar : '',
      cover: /^https:\/\//i.test(cover) ? cover : '',
      signature: trim(profile.signature || '', 140), petPersona:typeof profile.petPersona==='string'&&PET_PERSONAS[profile.petPersona]?profile.petPersona:'',
      petPersonaDescription:typeof profile.petPersona==='string'&&PET_PERSONAS[profile.petPersona]?trim(profile.petPersonaDescription||'',300):'',
      about: trim(profile.about || '', 240),
      likes: trim(profile.likes || '', 240),
      dislikes: trim(profile.dislikes || '', 240),
      lookingFor: trim(profile.lookingFor || '', 240),
      plushie:trim(profile.plushie||'',80),livePlushie:profile.livePlushie&&typeof profile.livePlushie==='object'?{name:trim(profile.livePlushie.name||'',80),mood:trim(profile.livePlushie.mood||'',40),level:trim(profile.livePlushie.level||'',40),favorite:profile.livePlushie.favorite===true}:null,badges:Array.isArray(profile.badges)?profile.badges.map(s=>trim(s,24)).filter(Boolean).slice(0,5):[],profileTheme:['velvet','rose','midnight','lavender'].includes(profile.profileTheme)?profile.profileTheme:'velvet',guestbookOpen:profile.guestbookOpen===true,
      timezone: trim(profile.timezone || '', 60),
      pronouns: trim(profile.pronouns || '', 60),
      gallery: gallery.map(x => trim(x, 500)).filter(x => /^https:\/\//i.test(x)).slice(0, 4),
      updated: Date.now()
    };
  }
  function ownPawProfileView() {
    const payload = ownPawProfilePayload();
    return normalizePawProfile(payload, me());
  }
  function closeProfileModal() {
    state.profileModal = null;
    renderProfileModal();
  }
  function openShareProfileModal(member) {
    member = numeric(member || state.selected);
    if (!member) return;
    state.profileModal = { type: 'share', member };
    renderProfileModal();
  }
  function openViewProfileModal(member, useOwn = false) {
    member = numeric(member || state.selected);
    const profile = useOwn ? ownPawProfileView() : state.profiles[member]?.pawProfile;
    if (!member || !profile) {
      notice(useOwn ? 'Fill your Paw Profile in Settings first.' : 'This kitty has not shared a Paw Profile yet.');
      return;
    }
    state.profileModal = { type: 'view', member, profile, useOwn };
    renderProfileModal();
  }
  function renderProfileModal() {
    const box = ui.shadow?.getElementById('kc-profile-modal');
    if (!box) return;
    const modal = state.profileModal;
    if (!modal) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    box.classList.remove('hidden');
    if (modal.type === 'share') {
      const id = numeric(modal.member);
      const profile = ownPawProfileView();
      box.innerHTML = `<div class="kc-pawmodal" role="dialog" aria-modal="true" aria-label="Share your Paw Profile">
        <button class="kc-pawmodal-close" data-action="closeprofilemodal" aria-label="Close">✕</button>
        <div class="kc-pawmodal-title">Share your Paw Profile</div>
        <div class="kc-share-row">${avatar(me(),'large')}<div class="kc-share-copy"><b>Share your Paw Profile with ${escapeText(name(id))}?</b><p>This will send your profile card, status, about-me details, and up to four gallery pictures.</p></div></div>
        <div class="kc-share-preview"><div class="kc-share-preview-label">Preview</div><div class="kc-share-preview-card"><div class="kc-share-preview-name">${escapeText(profile?.name || Player?.Name || 'Kitty')}</div><div class="kc-share-preview-status">${escapeText(profile?.about || profile?.signature || 'Purrs and pawprints ♡')}</div></div></div>
        <div class="kc-pawmodal-actions"><button class="secondary" data-action="cancelshareprofile">Cancel</button><button class="primary kc-share-confirm" data-action="confirmshareprofile">🐾 Share Profile</button></div>
      </div>`;
      return;
    }
    const p = modal.profile || {};
    const hero = p.cover || p.avatar || trim(state.settings.pawHero || '', 500) || trim(state.settings.avatar || '', 500);
    const gallery = (p.gallery || []).slice(0,4);
    const aboutRows = [
      p.likes ? ['💗', 'Likes', p.likes] : null,
      p.dislikes ? ['💔', 'Dislikes', p.dislikes] : null,
      p.lookingFor ? ['🔎', 'Looking For', p.lookingFor] : null,
      p.timezone ? ['🕒', 'Timezone', p.timezone] : null,
      p.pronouns ? ['👤', 'Pronouns', p.pronouns] : null,
    ].filter(Boolean);
    box.innerHTML = `<div class="kc-pawviewer paw-profile-theme-${escapeText(p.profileTheme||'velvet')}" role="dialog" aria-modal="true" aria-label="Paw Profile">
      <div class="kc-pawviewer-head"><div class="kc-pawviewer-title">🐾 ${escapeText(p.name || bcName(modal.member))}'s Paw Profile</div><button class="kc-pawmodal-close" data-action="closeprofilemodal" aria-label="Close">✕</button></div>
      <div class="kc-pawviewer-body">
        <div class="kc-pawhero">${hero ? `<img src="${escapeText(hero)}" alt=""/>` : '<div class="kc-pawhero-fallback"></div>'}<div class="kc-pawhero-overlay">${avatar(modal.member,'hero')}<div class="kc-pawhero-meta"><div class="kc-pawhero-name">${escapeText(p.name || bcName(modal.member))} ♡</div><div class="kc-pawhero-sub"><span class="kc-statusdot ${inRoom(modal.member) ? 'on' : ''}"></span>${inRoom(modal.member) ? ' In your room' : ' Cozy connection'}<span class="kc-memberno">Member #${numeric(modal.member) || me()}</span></div></div></div></div>
        <div class="kc-pawquote">❝ ${escapeText(p.about || p.signature || 'Purrs and pawprints ♡')} ❞</div>
        ${statusMarkup(modal.member,'kc-pawstatus')}
        ${p.petPersona&&PET_PERSONAS[p.petPersona]?`<div class="paw-profile-detail">${PET_PERSONAS[p.petPersona].icon} Pet personality: <b>${escapeText(PET_PERSONAS[p.petPersona].name)}</b>${p.petPersonaDescription?`<p style="margin:6px 0 0;white-space:pre-wrap">${escapeText(p.petPersonaDescription)}</p>`:''}</div>`:''}
        ${p.plushie?`<div class="paw-profile-detail">🧸 Favorite plushie: <strong>${escapeText(p.plushie)}</strong></div>`:''}
        ${p.livePlushie?.name?`<div class="paw-profile-detail">🧸 ${modal.useOwn?'Currently holding':'Last shared'}: <b>${escapeText(p.livePlushie.name)}</b> · ${escapeText(p.livePlushie.mood||'')} · ${escapeText(p.livePlushie.level||'')}${p.livePlushie.favorite?' ★':''}</div>`:''}
        ${p.badges?.length?`<div class="paw-profile-badges">${p.badges.map(b=>`<span>✦ ${escapeText(b)}</span>`).join('')}</div>`:''}
        ${!modal.useOwn&&p.guestbookOpen&&myFriends().includes(modal.member)?`<button class="secondary" data-action="leaveguestbook">🐾 Leave a guestbook pawprint</button>`:''}
        ${modal.useOwn&&state.pawGuestbook.length?`<section class="kc-pawsection"><div class="kc-pawsection-title">✉ Guestbook received</div>${state.pawGuestbook.slice(-8).reverse().map(e=>`<p><b>${escapeText(bcName(e.from))}</b>: ${escapeText(e.text)}</p>`).join('')}</section>`:''}
        ${aboutRows.length ? `<section class="kc-pawsection"><div class="kc-pawsection-title">🐾 About Me</div><div class="kc-pawfacts">${aboutRows.map(row => `<div class="kc-pawfact"><span class="kc-pawfact-icon">${row[0]}</span><span class="kc-pawfact-label">${escapeText(row[1])}</span><span class="kc-pawfact-value">${escapeText(row[2])}</span></div>`).join('')}</div></section>` : ''}
        ${gallery.length ? `<section class="kc-pawsection"><div class="kc-pawsection-title">🖼 Gallery</div><div class="kc-pawgallery">${gallery.map((u, i) => `<div class="kc-pawgallery-item"><img src="${escapeText(u)}" alt="Gallery image ${i+1}"/></div>`).join('')}</div></section>` : ''}
      </div>
    </div>`;
  }
  function sendProfileNow(member) {
    const id = numeric(member || state.selected);
    if (!id || !myFriends().includes(id)) { notice('Select a BC friend before sharing your profile.'); return; }
    const payload = ownPawProfilePayload();
    try {
      window.ServerSend('AccountBeep', { MemberNumber: id, BeepType: 'KCProfile', IsSecret: true, Message: pawWireJSON(payload) });
      notice('Paw profile shared!');
    } catch { notice('Could not share your Paw Profile.'); }
  }

  function sendTyping() {
    const id=numeric(state.selected);
    if(!state.settings.typing||!id||state.tab!=='chats'||
       !ui.shadow?.getElementById('kc-compose')?.value?.trim()||
       typeof window.ServerSend!=='function')return;
    const mode=state.composerMode==='whisper'?'whisper':'beep';
    // Native beeps require BC friendship and a recognized PawLounge contact.
    // BC whispers require both players in the same room, not BC friendship:
    // the recipient can display the indicator if they run PawLounge.
    if(mode==='beep'&&(!state.profiles[id]?.kitty||!myFriends().includes(id)))return;
    if(mode==='whisper'&&!inRoom(id))return;
    const key=`${id}:${mode}`,now=Date.now();
    if(now-(typingSendTimes.get(key)||0)<4500)return;
    const packet={type:'KCTyping',v:1,mode,typing:true,nonce:integrityNonce()};
    try {
      if(mode==='whisper') {
        // Targeted BC Hidden control packet: no visible native whisper or beep.
        window.ServerSend('ChatRoomChat',{Type:'Hidden',Target:id,
          Content:PAW_HIDDEN_TYPING_PREFIX+pawWireJSON(packet)});
      } else {
        window.ServerSend('AccountBeep',{MemberNumber:id,BeepType:'KCTyping',
          IsSecret:true,Message:pawWireJSON(packet)});
      }
      typingSendTimes.set(key,now);
      if(typingSendTimes.size>120)for(const [k,t] of typingSendTimes)if(now-t>60000)typingSendTimes.delete(k);
    }catch(err){console.debug('[PawLounge] Optional typing signal unavailable:',err);}
  }
  function sendProfile() {
    openShareProfileModal(state.selected);
  }
  function download(filename, mime, content) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function exportHistory(format = 'txt') {
    const chat = state.chats[state.selected];
    if (!chat) return;
    const base = `Kittychat-${state.selected}-${new Date().toISOString().slice(0,10)}`;
    try {
      await flushHistoryArchive();
      const db=await historyDb();
      const records=[];
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('messages','readonly');
        const req=tx.objectStore('messages').index('byConversation').openCursor(historyRange(state.myId,'chat',chat.id,null));
        req.onsuccess=()=>{const cursor=req.result;if(cursor){records.push(pawDecodeHistoryRow(cursor.value));cursor.continue();}};
        req.onerror=()=>reject(req.error);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
      });
      if (format === 'json') download(base + '.json','application/json',JSON.stringify({...chat,messages:records},null,2));
      else download(base + '.txt','text/plain',records.map(m=>
        `[${new Date(m.time).toLocaleString()}] ${m.from===me()?'Me':name(chat.id)} (${m.mode}): ${m.text}`).join('\n'));
      notice(`Exported ${records.length} archived messages.`);
    } catch(err) { historyArchive.error=String(err?.message||err);notice('Could not export the full conversation archive.'); }
  }
  function asset(file, cls, emoji, alt = '') {
    return `<span class="asset ${cls || ''}"><img src="${escapeText(imgUrl(file))}" alt="${escapeText(alt)}" onerror="this.style.display='none'"/><span aria-hidden="true">${emoji}</span></span>`;
  }
  // BC portraits are display-only. No mugshot pixels, appearance bundles or
  // WCE profiles are ever saved in Kittychat/localStorage/IndexedDB.
  function avatar(id, cls = '') {
    const member = numeric(id);
    const url = state.profiles[member]?.avatar;
    const fallback = url && /^https:\/\//.test(url)
      ? `<img src="${escapeText(url)}" alt="" onerror="this.style.display='none'"/>🐱`
      : asset('kitty-avatar-default.png','','🐱');
    return `<span class="avatar ${cls}" data-kc-member="${member}">${fallback}<canvas class="kc-bc-mugshot" data-kc-portrait="${member}" width="128" height="128" aria-hidden="true"></canvas></span>`;
  }

  // Mugshots remain display-only. The game/WCE owns every source; Kittychat
  // does not write pictures, appearances, or a new profile database anywhere.
  const portraitRuntime = { queued: false, observer: null, pending: new WeakMap(),
    lastLive: new Map(), painted: 0, unresolved: new Set(), errors: new Map(),
    refreshLast: new Map(), refreshResults: new Map(), refreshBusy: new Set(), refreshGlobalAt: 0 };
  const portraitCandidateKeys = [
    'Canvas', 'canvas', 'DrawCanvas', 'drawCanvas', 'CharacterCanvas',
    'RenderCanvas', 'renderCanvas', 'AppearanceCanvas', 'AppearanceCanvasLayers',
    'CanvasLayers', 'canvasLayers', 'PortraitCanvas', 'portraitCanvas',
    'MugshotCanvas', 'mugshotCanvas', 'ImageCanvas', 'imageCanvas',
    'Image', 'image', 'ImageBitmap', 'imageBitmap', 'Bitmap', 'bitmap',
    'Sprite', 'sprite', 'Layers', 'layers', 'CharacterImage',
    'CanvasTemp', 'CanvasData', 'CanvasCache',
    'CanvasElement', 'Render', 'render', 'Rendering', 'rendering',
    'Context', 'context', 'ctx', 'Surface', 'surface', 'Texture', 'texture',
    'LayerCanvas','layerCanvas','DrawImage','drawImage','CharacterCanvasData', 'AppearanceLayers'
  ];
  const portraitImageKeys = [
    'mugshot', 'Mugshot', 'portrait', 'Portrait', 'portraitUrl',
    'PortraitURL', 'avatar', 'Avatar', 'image', 'Image', 'url', 'URL'
  ];
  const validPortraitURL = u => typeof u === 'string' && (
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(u) ||
    /^blob:https?:\/\//i.test(u) || /^https:\/\//i.test(u));
  function portraitImageSource(obj) {
    if (!obj || typeof obj !== 'object') return false;
    try {
      const w = obj.naturalWidth || obj.videoWidth || obj.width;
      const h = obj.naturalHeight || obj.videoHeight || obj.height;
      if (!(w > 0 && h > 0)) return false;
      // Older code required getContext or naturalWidth, accidentally rejecting
      // ImageBitmap and several BC/WCE canvas-image wrappers.
      if (typeof HTMLCanvasElement !== 'undefined' && obj instanceof HTMLCanvasElement) return true;
      // BC may provide a drawable canvas proxy from a different JS realm.
      if (typeof obj.getContext === 'function' && typeof obj.toDataURL === 'function') return true;
      if (typeof HTMLImageElement !== 'undefined' && obj instanceof HTMLImageElement) return true;
      if (typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap) return true;
      if (typeof OffscreenCanvas !== 'undefined' && obj instanceof OffscreenCanvas) return true;
      if (typeof HTMLVideoElement !== 'undefined' && obj instanceof HTMLVideoElement) return true;
      const tag = Object.prototype.toString.call(obj);
      return /\[object (?:HTMLCanvasElement|HTMLImageElement|ImageBitmap|OffscreenCanvas|HTMLVideoElement)\]/.test(tag);
    } catch { return false; }
  }
  function findLiveCharacter(member) {
    if (numeric(window.Player?.MemberNumber) === member) return window.Player;
    const room = Array.isArray(window.ChatRoomCharacter)
      ? window.ChatRoomCharacter.find(c => numeric(c?.MemberNumber) === member) : null;
    if (room) return room;
    for (const c of [window.CurrentCharacter, window.CharacterAppearanceSelection, window.DialogFocusItem?.Character]) {
      if (numeric(c?.MemberNumber) === member) return c;
    }
    return null;
  }
  // WCE remains optional. We only read public in-memory references already
  // exposed by WCE, never its private storage or its IndexedDB database.
  function readWceSavedProfile(member) {
    try {
      const wce = window.WCE || window.wce;
      if (!wce || !['object','function'].includes(typeof wce)) return null;
      const stores = [wce.savedProfiles, wce.profiles, wce.profileCache, wce.cachedProfiles];
      for (const store of stores) {
        if (!store) continue;
        if (typeof store.get === 'function') {
          const found = store.get(member) ?? store.get(String(member));
          if (found && typeof found.then !== 'function') return found;
        } else if (typeof store === 'object' && (store[member] || store[String(member)])) {
          return store[member] || store[String(member)];
        }
      }
    } catch {}
    return null;
  }
  function collectPortraitSources(record) {
    if (!record || typeof record !== 'object') return [];
    const result = [], seen = new WeakSet();
    // Only traverse rendering fields, not arbitrary appearance/account data.
    function add(value, depth = 0) {
      if (!value || depth > 4 || result.length >= 48 || typeof value !== 'object') return;
      if (seen.has(value)) return;
      seen.add(value);
      if (portraitImageSource(value)) { result.push(value); return; }
      // Some BC image wrappers expose the owning canvas only through a
      // rendering context, not via a property named `Canvas`.
      try {
        if (value.canvas && portraitImageSource(value.canvas)) {
          result.push(value.canvas);
          return;
        }
      } catch {}
      if (Array.isArray(value)) {
        for (const child of value.slice(0, 48)) add(child, depth + 1);
      } else if (value instanceof Map) {
        for (const child of [...value.values()].slice(0, 48)) add(child, depth + 1);
      } else {
        // BC mods may expose an object of named/numbered canvas layers.
        for (const key of portraitCandidateKeys) {
          let child;
          try { child = value[key]; } catch { continue; }
          if (child && child !== value) add(child, depth + 1);
        }
        if (depth <= 2) {
          // R133 renderer exposes additional layer wrappers; inspect only keys
          // with obvious image semantics, without traversing appearance arrays.
          let keys=[];
          try { keys=Object.keys(value).slice(0,90); } catch {}
          for (const key of keys) {
            if (!/canvas|bitmap|render|layer|image|texture|surface|portrait/i.test(key) || portraitCandidateKeys.includes(key)) continue;
            // A few BC mods expose the blink/eye and mouth overlay canvases
            // separately. Never mistake one of those overlays for a mugshot.
            if (/blink|eyes?|mouth|lips|expression|shadow|mask/i.test(key)) continue;
            try { add(value[key],depth+1); } catch {}
          }
        }
        if (depth > 0) {
          const keys = Object.keys(value);
          if (keys.length > 0 && keys.length < 50 && keys.every(k => /^\d+$|^Layer\d+$|^Canvas\d+$/i.test(k))) {
            for (const k of keys) add(value[k], depth + 1);
          }
        }
      }
    }
    add(record);
    return result;
  }
  function portraitUrl(record) {
    if (!record || typeof record !== 'object') return null;
    for (const key of portraitImageKeys) {
      let v;
      try { v = record[key]; } catch { continue; }
      if (validPortraitURL(v)) return v;
      if (v && typeof v === 'object' && validPortraitURL(v.src)) return v.src;
    }
    return null;
  }
  // BC character canvases may be 500 x 1750 with ~600 transparent pixels
  // above the head. The older fixed crop (y = 3.5% of the image) selected
  // that EMPTY section, incorrectly treating fully loaded avatars as missing.
  // Find the first visible region in a tiny *in-memory* preview and crop
  // around it instead. Nothing is stored or serialized.
  const portraitCropRuntime = { attempts:0, sampled:0, transparent:0, failures:0, last:new Map() };
  function inspectPortraitCrop(source) {
    const w=Number(source?.naturalWidth || source?.videoWidth || source?.width || 0);
    const h=Number(source?.naturalHeight || source?.videoHeight || source?.height || 0);
    if (!(w>0 && h>0)) return null;
    const probe=document.createElement('canvas');
    probe.width=80; probe.height=160;
    const p=probe.getContext('2d',{willReadFrequently:true});
    let minX=probe.width, maxX=-1, minY=probe.height, maxY=-1, visible=0;
    try {
      p.drawImage(source,0,0,probe.width,probe.height);
      const pix=p.getImageData(0,0,probe.width,probe.height).data;
      const rowCount=new Uint16Array(probe.height);
      // Require >1 solid pixel per row to ignore single transparent-edge
      // artifacts and stray glow pixels near the top of the BC canvas.
      for (let y=0;y<probe.height;y++) for (let x=0;x<probe.width;x++) {
        if (pix[(y*probe.width+x)*4+3] > 36) {
          rowCount[y]++; visible++;
          minX=Math.min(minX,x); maxX=Math.max(maxX,x);
        }
      }
      const rowMinimum=2;
      for (let y=0;y<probe.height;y++) if (rowCount[y]>=rowMinimum) {
        minY=Math.min(minY,y); maxY=Math.max(maxY,y);
      }
      if (maxY<0 || maxX<0) return {empty:true,sourceWidth:w,sourceHeight:h};
      portraitCropRuntime.sampled++;
    } catch {
      // Tainted/undrawable images remain eligible for legacy fallbacks.
      return {unknown:true,sourceWidth:w,sourceHeight:h};
    }
    const left=minX/probe.width*w;
    const right=(maxX+1)/probe.width*w;
    const top=minY/probe.height*h;
    const bottom=(maxY+1)/probe.height*h;
    const visibleWidth=Math.max(1,right-left);
    const visibleHeight=Math.max(1,bottom-top);
    // Focus on the head / upper torso, not the entire body. On BC's tall
    // character canvases the visible bounds can include the whole outfit,
    // which makes tiny avatars look zoomed out and transparent around the
    // sides. Use a square crop anchored near the top visible region.
    // Do not force a 180px crop on 128px or other small source canvases.
    // A small complete character should fill its portrait; partial eyes or
    // clothing will instead be rejected by the thumbnail completeness test.
    const naturalTarget=Math.max(visibleWidth*1.30,visibleHeight*0.54);
    const target=Math.min(w,h,Math.max(Math.min(w,h)*0.10,naturalTarget));
    const sx=Math.max(0,Math.min(w-target,(left+right-target)/2));
    const sy=Math.max(0,Math.min(h-target,top-target*0.08));
    return {sourceWidth:w,sourceHeight:h,visiblePixels:visible,topPixel:Math.round(top),bottomPixel:Math.round(bottom),
      visibleWidth,visibleHeight,x:sx,y:sy,width:target,height:target};
  }
  // A canvas is not a portrait just because some pixels are opaque.  BC can
  // expose clothing/eye layers before the assembled character has rendered.
  // Check area, coverage and placement before hiding the user's fallback.
  function portraitCompleteness(canvas) {
    const w=canvas.width,h=canvas.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if (!ctx || w<16 || h<16) return {ok:false,reason:'no-canvas'};
    let pixels;
    try { pixels=ctx.getImageData(0,0,w,h).data; }
    catch { return {ok:false,reason:'uninspectable'}; }
    let n=0,minX=w,minY=h,maxX=-1,maxY=-1;
    let rows=new Uint16Array(3),cols=new Uint16Array(3);
    for (let y=0;y<h;y+=2) for(let x=0;x<w;x+=2) {
      const i=(y*w+x)*4;
      if (pixels[i+3]<44) continue;
      n++;
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      rows[Math.min(2,Math.floor(y*3/h))]++;
      cols[Math.min(2,Math.floor(x*3/w))]++;
    }
    const area=Math.ceil(w/2)*Math.ceil(h/2);
    const fill=n/Math.max(1,area);
    const spanX=(maxX-minX+2)/w,spanY=(maxY-minY+2)/h;
    // Don't accept isolated eyes/lips, a clothing item, or a tiny character
    // stuck in a corner. Works with legitimately transparent BC backgrounds.
    const ok=fill>=0.075 && spanX>=0.40 && spanY>=0.50 &&
      rows.filter(v=>v>=8).length>=2 && cols.filter(v=>v>=8).length>=2 &&
      minY/h<0.45 && maxY/h>0.52;
    return {ok,reason:ok?'complete':'partial-or-tiny',fill:+fill.toFixed(3),
      spanX:+spanX.toFixed(3),spanY:+spanY.toFixed(3),
      score:fill*0.5+spanX*0.25+spanY*0.25};
  }
  function drawPortraitLayers(canvas, layers, member=0) {
    if (!layers?.length) return false;
    const ctx=canvas.getContext('2d');
    if (!ctx) return false;
    portraitCropRuntime.attempts++;
    let inspected=0,empty=0,errors=[],partial=0,best=null,bestSource='';
    // Score each source and accept only a complete portrait.  A layer whose
    // only contents are eyes must never win because it was first in a list.
    // Keep candidate count bounded to avoid expensive BC paint loops.
    const preview=document.createElement('canvas');
    preview.width=canvas.width;preview.height=canvas.height;
    const pctx=preview.getContext('2d',{willReadFrequently:true});
    if (!pctx) return false;
    const winning=document.createElement('canvas');
    winning.width=canvas.width;winning.height=canvas.height;
    const winningCtx=winning.getContext('2d');
    const unique=[...new Set(layers.filter(portraitImageSource))].slice(0,12);
    for (const source of unique) {
      try {
        const crop=inspectPortraitCrop(source);
        inspected++;
        if (!crop || crop.empty) { empty++; continue; }
        const w=crop.sourceWidth,h=crop.sourceHeight;
        // A postage-stamp-sized figure somewhere in a full BC canvas is
        // usually a wrong zoom/renderer output, not a usable mugshot.
        if (!crop.unknown && w>=256 && h>=450 &&
            (crop.visibleWidth/w<0.15 || crop.visibleHeight/h<0.19)) { partial++; continue; }
        const sw=crop.unknown ? Math.min(w,Math.max(16,w*.85)) : crop.width;
        const sh=crop.unknown ? Math.min(h,sw) : crop.height;
        const sx=crop.unknown ? Math.max(0,(w-sw)/2) : crop.x;
        const sy=crop.unknown ? (h>=1300 ? Math.max(0,Math.min(h-sh,h*.34)) : Math.max(0,h*.04)) : crop.y;
        pctx.clearRect(0,0,preview.width,preview.height);
        pctx.drawImage(source,sx,sy,sw,sh,0,0,preview.width,preview.height);
        const quality=portraitCompleteness(preview);
        if (!quality.ok) {partial++; continue;}
        if (!best || quality.score>best.score) {
          best={...quality,sourceWidth:w,sourceHeight:h,cropY:Math.round(sy),cropHeight:Math.round(sh)};
          winningCtx.clearRect(0,0,winning.width,winning.height);
          winningCtx.drawImage(preview,0,0);
          bestSource=source===layers[0]?'preferred-composite':'alternative-composite';
        }
        // An excellent first composite needs no expensive extra candidates.
        if (inspected===1 && quality.fill>=0.26 && quality.spanX>=0.68 && quality.spanY>=0.72) break;
      } catch(error) {errors.push(String(error?.message||error).slice(0,90));portraitCropRuntime.failures++;}
    }
    if (best) {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(winning,0,0);
      ctx.save();
      ctx.globalCompositeOperation='destination-over';
      ctx.fillStyle='#512942';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.restore();
      canvas.classList.add('is-painted');
      canvas.parentElement?.classList.add('kc-has-mugshot');
      // The first complete remote portrait becomes the stable crop for this
      // contact until manual refresh or the next account/session switch.
      // Only finished, explicit profile or room rendering paths are allowed
      // to freeze offline thumbnails. Arbitrary canvas layers may be clothing
      // or blinking eyes even when their bounding box looks plausible.
      portraitRuntime.painted++;
      if (member) portraitCropRuntime.last.set(member,{outcome:'painted',inspected,empty,partial,source:bestSource,...best});
      return true;
    }
    if (member) portraitCropRuntime.last.set(member,{outcome:'rejected-incomplete',inspected,empty,partial,errors:errors.slice(0,2)});
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.classList.remove('is-painted');
    canvas.parentElement?.classList.remove('kc-has-mugshot');
    if (empty) portraitCropRuntime.transparent++;
    return false;
  }

  function clonePaintedPortrait(sourceCanvas, targetCanvas, member) {
    if (!sourceCanvas || !targetCanvas) return false;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return false;
    try {
      ctx.clearRect(0,0,targetCanvas.width,targetCanvas.height);
      ctx.drawImage(sourceCanvas,0,0,targetCanvas.width,targetCanvas.height);
      targetCanvas.classList.add('is-painted');
      targetCanvas.parentElement?.classList.add('kc-has-mugshot');
      if (member) portraitCropRuntime.last.set(member,{ outcome:'cloned',painted:true,source:'existing-painted-canvas' });
      return true;
    } catch {
      return false;
    }
  }

  function syncPaintedPortraitCopies(member) {
    if (!ui.shadow || !member) return 0;
    const all = [...ui.shadow.querySelectorAll(`.kc-bc-mugshot[data-kc-portrait="${member}"]`)];
    const source = all.find(c => c.classList.contains('is-painted'));
    if (!source) return 0;
    let copied = 0;
    for (const canvas of all) {
      if (canvas === source || canvas.classList.contains('is-painted')) continue;
      if (clonePaintedPortrait(source, canvas, member)) copied++;
    }
    return copied;
  }

  // WCE's actual "Save & browse seen profiles" store (WCE/FBC pastProfiles.js):
  // IndexedDB bce-past-profiles v31, object store profiles, key memberNumber;
  // characterBundle contains the JSON snapshot used by WCE itself.
  // Read it only while WCE is installed and Kittychat is open. No writes,
  // no new persistent store, no saved pictures and no copy of the profile DB.
  const wceSnapshotRuntime = {
    pending:new Set(), attempts:new Map(), reports:new Map(), temporaryPortraits:new Map(),
    dbMissingUntil:0, dbLastCheck:'not-checked', activeAccount:0
  };
  // In-memory only; 96 thumbnails at 128x128 consume at most about 6 MiB of
  // raw pixel memory. A small LRU caused random default-avatar fallbacks when
  // visiting multiple chats; closing the messenger must not discard portraits.
  const MAX_OFFLINE_PORTRAITS = 96;
  // v0.9.1: Freeze completed portraits *only for contacts outside the current
  // BC room*. A sidebar refresh used to reconstruct every canvas, causing the
  // saved WCE character to shift/crop or briefly revert to its fallback image.
  // This is a bounded session-only pixel cache (not localStorage/IndexedDB).
  // Live in-room members still render through BC's normal live path.
  const steadyRemotePortraits = new Map();
  // Before a room member disappears from BC's live roster, retain *only the
  // finished 128px thumbnail*. This prevents an avatar going blank simply
  // because the user left, without copying any appearance or profile data.
  // Entries stay in memory only and are evicted after six hours or 96 people.
  const recentRoomPortraits = new Map();
  function finishedThumbnailCopy(source) {
    if (!source || !source.width || !source.height) return null;
    try {
      const copy=document.createElement('canvas');
      copy.width=128;copy.height=128;
      const ctx=copy.getContext('2d',{alpha:false});
      if (!ctx) return null;
      ctx.drawImage(source,0,0,128,128);
      return copy;
    } catch { return null; }
  }
  function rememberRoomPortrait(member,source) {
    if (!member || !hasActualLivePresence(member) ||
        !source?.classList?.contains('is-painted')) return false;
    const copy=finishedThumbnailCopy(source);
    if (!copy) return false;
    recentRoomPortraits.delete(member);
    recentRoomPortraits.set(member,{canvas:copy,at:Date.now()});
    while(recentRoomPortraits.size>MAX_OFFLINE_PORTRAITS)
      recentRoomPortraits.delete(recentRoomPortraits.keys().next().value);
    return true;
  }
  function steadyRemotePortrait(member) {
    if (!member || hasActualLivePresence(member)) return null;
    const steady=steadyRemotePortraits.get(member);
    if(steady)return steady;
    const recent=recentRoomPortraits.get(member);
    if(!recent)return null;
    if(Date.now()-recent.at>21600000){recentRoomPortraits.delete(member);return null;}
    return recent.canvas;
  }
  function rememberSteadyRemotePortrait(member, source) {
    if (!member || hasActualLivePresence(member) || steadyRemotePortraits.has(member) ||
        !source || !source.width || !source.height) return false;
    try {
      const copy=finishedThumbnailCopy(source);
      if (!copy) return false;
      steadyRemotePortraits.set(member,copy);
      while (steadyRemotePortraits.size > MAX_OFFLINE_PORTRAITS)
        steadyRemotePortraits.delete(steadyRemotePortraits.keys().next().value);
      return true;
    } catch { return false; }
  }
  function paintSteadyRemotePortraits(root) {
    if (!root) return 0;
    let painted=0;
    for (const canvas of root.querySelectorAll('.kc-bc-mugshot:not(.is-painted)')) {
      const member=numeric(canvas.dataset.kcPortrait);
      const saved=steadyRemotePortrait(member) ||
        (!hasActualLivePresence(member) ? wceSnapshotRuntime.temporaryPortraits.get(member) : null);
      if (saved && clonePaintedPortrait(saved,canvas,member)) painted++;
    }
    return painted;
  }
  function cachedWcePortrait(member) {
    const cached=wceSnapshotRuntime.temporaryPortraits.get(member);
    if (!cached) return null;
    // Cache entries are final portraits with an opaque background; only
    // canvases produced by the strict drawPortraitLayers path enter here.
    // Refresh LRU order without reloading the saved BC outfit.
    wceSnapshotRuntime.temporaryPortraits.delete(member);
    wceSnapshotRuntime.temporaryPortraits.set(member,cached);
    return cached;
  }
  function hasActualLivePresence(member) {
    if (numeric(window.Player?.MemberNumber)===member) return true;
    return window.CurrentScreen==='ChatRoom' && Array.isArray(window.ChatRoomCharacter) &&
      window.ChatRoomCharacter.some(c=>numeric(c?.MemberNumber)===member);
  }
  function wceRetryDelay(member) {
    const previous=wceSnapshotRuntime.reports.get(member)?.status;
    // Asynchronous image loads often finish just after the first paint; give
    // those a prompt second attempt rather than blindly waiting 25 seconds.
    if (previous==='render-not-ready' || previous==='character-load-error' || previous==='invalid-loaded-character') return 3500;
    if (previous==='database-error' || previous==='wce-database-missing') return 20000;
    if (previous==='not-in-wce' || previous==='snapshot-missing-appearance') return 90000;
    return 25000;
  }
  function wceIsInstalled() {
    return !!(window.FBC_VERSION || window.Player?.FBC || window.WCE || window.wce);
  }
  function readWceDatabaseSnapshot(member) {
    return new Promise(resolve => {
      if (!window.indexedDB) { resolve({status:'indexeddb-unavailable'}); return; }
      // WCE sometimes becomes available after Kittychat boots, and its data
      // can remain available even when WCE hasn't initialized this session.
      // Do not rely on a global WCE flag, which is not stable across builds.
      if (Date.now()<wceSnapshotRuntime.dbMissingUntil) {
        resolve({status:'wce-database-missing'}); return;
      }
      let finished=false, db=null, watchdog=null;
      const done = result => {
        if (finished) return;
        finished=true;
        if (watchdog) clearTimeout(watchdog);
        wceSnapshotRuntime.dbLastCheck=result.status;
        try { db?.close(); } catch {}
        resolve(result);
      };
      let request;
      // Never create a new IndexedDB database just to look for a snapshot.
      // Abort onupgradeneeded when the WCE database is absent; do not write.
      try { request=window.indexedDB.open('bce-past-profiles'); }
      catch(err) { done({status:'database-error', error:String(err?.message||err).slice(0,120)}); return; }
      // Guard against a blocked upgrade/open (e.g. WCE is opening its store)
      // leaving this member permanently pending with only the default avatar.
      watchdog=setTimeout(()=>done({status:'database-timeout'}),6500);
      request.onupgradeneeded=() => {
        try { request.transaction?.abort(); } catch {}
        wceSnapshotRuntime.dbMissingUntil=Date.now()+20000;
        done({status:'wce-database-missing'});
      };
      request.onerror=()=>done({status:'database-error',error:String(request.error?.message||'open failed').slice(0,120)});
      request.onsuccess=()=>{
        db=request.result;
        if (finished) { try { db.close(); } catch {} return; }
        wceSnapshotRuntime.dbMissingUntil=0;
        try {
          if (!db.objectStoreNames.contains('profiles')) { done({status:'profiles-store-missing'}); return; }
          const tx=db.transaction('profiles','readonly');
          const get=tx.objectStore('profiles').get(member);
          get.onsuccess=()=>{
            const record=get.result;
            done(record && typeof record.characterBundle==='string' ?
              {status:'found',record} : {status:'not-in-wce'});
          };
          get.onerror=()=>done({status:'database-error',error:'profile read failed'});
          tx.onabort=()=>done({status:'database-error',error:'read transaction aborted'});
        } catch(err) { done({status:'database-error', error:String(err?.message||err).slice(0,120)}); }
      };
    });
  }
  function applyWcePortraitToVisible(member, painted) {
    if (!ui.shadow || !state.open || !painted) return 0;
    if (!hasActualLivePresence(member)) rememberSteadyRemotePortrait(member,painted);
    const stable=steadyRemotePortrait(member) || painted;
    let count=0;
    for (const target of ui.shadow.querySelectorAll(`.kc-bc-mugshot[data-kc-portrait="${member}"]`)) {
      if (!target.isConnected || target.classList.contains('is-painted')) continue;
      if (clonePaintedPortrait(stable,target,member)) count++;
    }
    if (count) portraitRuntime.unresolved.delete(member);
    return count;
  }
  function requestWceSavedSnapshotPortrait(member) {
    if (!member || !state.open || wceSnapshotRuntime.pending.has(member)) return;
    // A character selected by BC is not necessarily online. Offline saved
    // portraits must still work when CurrentCharacter references that person.
    if (hasActualLivePresence(member) || steadyRemotePortraits.has(member)) return;
    const cached=cachedWcePortrait(member);
    if (cached) { applyWcePortraitToVisible(member,cached); return; }
    // Rendering many WCE characters concurrently overloaded BC's renderer,
    // and the direct fallback has an intentional global re-entry guard.
    // Refill one at a time, then let the next animation frame pick the next.
    if (wceSnapshotRuntime.pending.size>=1) return;
    const now=Date.now();
    if (now-(wceSnapshotRuntime.attempts.get(member)||0)<wceRetryDelay(member)) return;
    wceSnapshotRuntime.attempts.set(member,now);
    wceSnapshotRuntime.pending.add(member);
    const account=state.myId;
    const report={status:'checking',at:now,database:'bce-past-profiles',source:'WCE saved characterBundle',painted:false};
    wceSnapshotRuntime.reports.set(member,report);
    (async()=>{
      const result=await readWceDatabaseSnapshot(member);
      if (state.myId!==account) return;
      if (result.status!=='found') { report.status=result.status;report.error=result.error||'';return; }
      report.savedAt=Number(result.record.seen)||null;
      let bundle;
      try { bundle=JSON.parse(result.record.characterBundle); }
      catch { report.status='invalid-snapshot-json';return; }
      if (!bundle || numeric(bundle.MemberNumber)!==member || !Array.isArray(bundle.Appearance) || !bundle.Appearance.length) {
        report.status='snapshot-missing-appearance';return;
      }
      if (typeof window.CharacterLoadOnline!=='function') { report.status='character-loader-unavailable';return; }
      let character;
      try {
        character=await Promise.resolve(window.CharacterLoadOnline(bundle,member));
      } catch(err) { report.status='character-load-error';report.error=String(err?.message||err).slice(0,140);return; }
      if (!character || numeric(character.MemberNumber)!==member || !Array.isArray(character.Appearance)) {
        report.status='invalid-loaded-character';return;
      }
      if (typeof window.CharacterLoadCanvas==='function') {
        try { await Promise.resolve(window.CharacterLoadCanvas(character)); }
        catch(err) { report.canvasWarning=String(err?.message||err).slice(0,120); }
      }
      const paint=()=>{
        if (state.myId!==account || hasActualLivePresence(member)) return false;
        const temp=document.createElement('canvas');
        temp.width=128;temp.height=128;
        // CanvasBlink can contain just the blinking face; it is not a
        // standalone portrait and caused floating eyes in contact circles.
        const sources=[character.Canvas,character.CharacterCanvas,
          character.DrawCanvas,character.RenderCanvas].filter(portraitImageSource);
        // Prefer the finished BC composite. If it is not ready yet, ask
        // BC's renderer; don't promote isolated clothing/eye-layer canvases
        // to permanent avatars while textures are still downloading.
        const rendered = (sources.length && drawPortraitLayers(temp,sources,member)) ||
          drawLiveCharacterThroughBC(temp,member,character);
        if (rendered) rememberSteadyRemotePortrait(member,temp);
        if (!rendered) return false;
        wceSnapshotRuntime.temporaryPortraits.set(member,temp);
        while (wceSnapshotRuntime.temporaryPortraits.size>MAX_OFFLINE_PORTRAITS) {
          wceSnapshotRuntime.temporaryPortraits.delete(wceSnapshotRuntime.temporaryPortraits.keys().next().value);
        }
        report.status='painted';report.painted=true;
        report.copies=applyWcePortraitToVisible(member,temp);
        return true;
      };
      if (!paint()) {
        // BC finishes loading character textures asynchronously; on slower
        // browsers the old ~2.4-second retry window gave up too early.
        // Yield between attempts and never recreate the online character.
        for (const delay of [500,1000,1800,3000]) {
          await new Promise(resolve=>setTimeout(resolve,delay));
          if(state.myId!==account || !state.open || hasActualLivePresence(member))break;
          if(paint())break;
        }
        if (!report.painted) report.status='render-not-ready';
      }
    })().catch(err=>{
      report.status='error';report.error=String(err?.message||err).slice(0,140);
    }).finally(()=>{
      wceSnapshotRuntime.pending.delete(member);
      // The next pending thumbnail is picked only after the current renderer
      // has stopped mutating BC's global MainCanvas.
      if (state.open && state.myId===account) schedulePortraits();
    });
  }
  function tryWcePortrait(canvas, member, record) {
    if (!record) return false;
    // The fallback image must enter the same session cache as fully loaded
    // snapshots; without `member` the previous implementation repainted on
    // every sidebar rebuild and could jump between crops.
    if (drawPortraitLayers(canvas, collectPortraitSources(record),member)) {
      if (!hasActualLivePresence(member)) rememberSteadyRemotePortrait(member,canvas);
      return true;
    }
    const url = portraitUrl(record);
    if (!url || portraitRuntime.pending.get(canvas) === url) return false;
    portraitRuntime.pending.set(canvas, url);
    const img = new Image();
    img.onload = () => {
      portraitRuntime.pending.delete(canvas);
      if (canvas.isConnected && !canvas.classList.contains('is-painted') &&
          drawPortraitLayers(canvas,[img],member)) {
        if (!hasActualLivePresence(member)) rememberSteadyRemotePortrait(member,canvas);
        syncPaintedPortraitCopies(member);
      }
    };
    img.onerror = () => { portraitRuntime.pending.delete(canvas); };
    img.src = url;
    return false;
  }
  // BC can have a fully loaded character but no *painted* canvas yet.
  // Ask its own renderer once, then retry. This is NOT a profile database:
  // no image, body or appearance bundle is stored by Kittychat.
  function requestBCPortraitRefresh(member, character) {
    const loader = window.CharacterLoadCanvas;
    if (typeof loader !== 'function' || !character) return false;
    if (!Array.isArray(character.Appearance) || character.Appearance.length === 0) return false;
    const now = Date.now();
    // Refreshes may be expensive. Limit to one character per 1.8 s and a
    // single refresh per character every 90 s; never run while pending.
    if (portraitRuntime.refreshBusy.has(member) || now - (portraitRuntime.refreshLast.get(member) || 0) < 90000 ||
        now - portraitRuntime.refreshGlobalAt < 1800) return false;
    portraitRuntime.refreshBusy.add(member);
    portraitRuntime.refreshLast.set(member, now);
    portraitRuntime.refreshGlobalAt = now;
    const report = { at: now, attempted: true, outcome: 'running', error: '' };
    portraitRuntime.refreshResults.set(member, report);
    try {
      const result = loader(character);
      Promise.resolve(result).then(() => {
        report.outcome = 'finished';
      }).catch(err => {
        report.outcome = 'error';
        report.error = String(err?.message || err).slice(0, 180);
      }).finally(() => {
        portraitRuntime.refreshBusy.delete(member);
        // BC may publish its updated canvas later than the loader resolves.
        setTimeout(schedulePortraits, 250);
        setTimeout(schedulePortraits, 1000);
      });
      return true;
    } catch (err) {
      report.outcome = 'error';
      report.error = String(err?.message || err).slice(0, 180);
      portraitRuntime.refreshBusy.delete(member);
      return false;
    }
  }

  // Direct, display-only BC renderer fallback. R133 can draw live room
  // characters even when no individual character canvas is exposed by
  // CharacterLoadCanvas. DrawCharacter is the game renderer, so rather than
  // scraping renderer internals, draw *one character* to an isolated scratch
  // canvas with MainCanvas swapped for only the synchronous draw call.
  // The scratch image is never serialized, cached, or added to a database.
  const directPortraitRuntime = { lastAttempt:new Map(), results:new Map(), active:false };
  function drawLiveCharacterThroughBC(canvas, member, character) {
    const now = Date.now();
    const report = {
      at:now, attempted:false, outcome:'unavailable',
      drawCharacterAvailable:typeof window.DrawCharacter === 'function',
      mainCanvasAvailable:!!window.MainCanvas,
      mainCanvasIs2D:typeof window.MainCanvas?.drawImage === 'function',
      error:''
    };
    // This renderer normally only works during a live game room. Never
    // synthesize an appearance, and never call private WCE storage APIs.
    if (!character || !Array.isArray(character.Appearance) || !character.Appearance.length ||
        typeof window.DrawCharacter !== 'function' || !window.MainCanvas ||
        typeof window.MainCanvas.drawImage !== 'function' || directPortraitRuntime.active) {
      directPortraitRuntime.results.set(member,report);
      return false;
    }
    // Drawing a complete BC character can be expensive. One draw per member
    // every 15 seconds at most, with a global synchronous re-entry guard.
    const lastOutcome=directPortraitRuntime.results.get(member)?.outcome;
    // An early empty render is common with asynchronously loading offline
    // WCE appearances. Allow a prompt retry; 15 s cooldown is for success.
    const cooldown=lastOutcome==='painted' ? 15000 : (hasActualLivePresence(member) ? 2200 : 700);
    if (now - (directPortraitRuntime.lastAttempt.get(member) || 0) < cooldown) return false;
    directPortraitRuntime.lastAttempt.set(member,now);
    directPortraitRuntime.active = true;
    const original = window.MainCanvas;
    const temp = document.createElement('canvas');
    temp.width=500; temp.height=1000;
    const context=temp.getContext('2d',{alpha:true});
    if (!context) { directPortraitRuntime.active=false; return false; }
    report.attempted = true;
    let drew=false;
    try {
      window.MainCanvas=context;
      if (window.MainCanvas!==context) throw new Error('BC MainCanvas is not writable');
      // Drawing at native BC coordinates preserves clothing/face details.
      // 4th argument = zoom, just as BC uses in its own screens.
      window.DrawCharacter(character,0,0,1);
      // If the renderer ignored the temporary context, alpha sampling
      // prevents showing an empty canvas.
      drew=drawPortraitLayers(canvas,[temp]);
      report.outcome=drew?'painted':'empty-render';
    } catch(err) {
      report.outcome='error';
      report.error=String(err?.message||err).slice(0,180);
    } finally {
      window.MainCanvas=original;
      directPortraitRuntime.active=false;
      directPortraitRuntime.results.set(member,report);
    }
    return drew;
  }

  // Composite-only window/launcher motion should never compete with the heavy
  // character renderer. There is no polling or timer involved in motion itself.
  const motionRuntime = { active: 0, dragFrames: 0, resizeFrames: 0, fabFrames: 0,
    frameGeometryWrites: 0, lastDragMs: 0, lastResizeMs: 0 };
  const sidebarRefresh={dirty:false,queued:false};
  function scheduleSidebarUpdate() {
    if (!state.open || !ui.menu || !['chats','friends'].includes(state.tab)) return;
    sidebarRefresh.dirty=true;
    if (sidebarRefresh.queued || motionRuntime.active) return;
    sidebarRefresh.queued=true;
    requestAnimationFrame(()=>{
      sidebarRefresh.queued=false;
      if (!sidebarRefresh.dirty || motionRuntime.active) return;
      sidebarRefresh.dirty=false;
      if (state.open && ui.menu && ['chats','friends'].includes(state.tab)) reconcileSidebarContacts();
    });
  }
  function beginMotion() { motionRuntime.active++; }
  function endMotion() {
    motionRuntime.active = Math.max(0, motionRuntime.active-1);
    if (!motionRuntime.active) {
      if (sidebarRefresh.dirty) scheduleSidebarUpdate();
      schedulePortraits();
    }
  }
  function paintVisiblePortraits() {
    portraitRuntime.queued = false;
    if (!state.open || !ui.shadow || motionRuntime.active) return;
    const candidates = ui.shadow.querySelectorAll('.kc-bc-mugshot:not(.is-painted)');
    const grouped = new Map();
    for (const canvas of candidates) {
      const member = numeric(canvas.dataset.kcPortrait);
      if (!member) continue;
      if (!grouped.has(member)) grouped.set(member, []);
      grouped.get(member).push(canvas);
    }
    for (const [member, canvases] of grouped) {
      // Treat only Player and people physically in this BC room as live.
      // CurrentCharacter can retain a previously viewed *offline* member and
      // otherwise suppress or overwrite their saved WCE portrait.
      const live = hasActualLivePresence(member) ? findLiveCharacter(member) : null;
      if (live) steadyRemotePortraits.delete(member);
      // Prioritize cached WCE portraits for anyone not actually sharing our
      // live room. A stale BC CurrentCharacter should never mask an offline
      // snapshot. Cached bitmaps also eliminate fallback flicker on rerenders.
      const offlineCached=!hasActualLivePresence(member) &&
        (steadyRemotePortrait(member) || cachedWcePortrait(member));
      if (offlineCached) {
        applyWcePortraitToVisible(member,offlineCached);
        continue;
      }
      const saved = readWceSavedProfile(member);
      const liveLayers = collectPortraitSources(live);
      // Some renderers expose ready-made pictures through getter functions,
      // not enumerable character fields. Only call safe zero-argument getters.
      if (live && !liveLayers.length) for (const getter of ['GetCanvas','getCanvas','GetCharacterCanvas']) {
        try {
          if (typeof live[getter] === 'function' && live[getter].length===0) {
            const output=live[getter]();
            if (portraitImageSource(output)) { liveLayers.push(output); break; }
          }
        } catch {}
      }
      const savedLayers = liveLayers.length ? [] : collectPortraitSources(saved);
      // Only use explicitly composited canvases first. Generic layer
      // traversal is allowed as a last resort but checked for completeness.
      const nativeLayers = live ? [live.Canvas,live.CharacterCanvas,
        live.DrawCanvas,live.RenderCanvas].filter(portraitImageSource) : [];
      // If BC exposes a pre-composited portrait, never let a lone overlay
      // found during generic object traversal outscore that complete canvas.
      const composite = nativeLayers.length ? nativeLayers :
        [saved?.Canvas,saved?.CharacterCanvas,saved?.DrawCanvas,
          saved?.RenderCanvas].filter(portraitImageSource);
      const layers = composite.length ? [...new Set(composite)] :
        [...new Set(liveLayers.length ? liveLayers : savedLayers)].filter(x=>
          !/blink|eye|mouth|lips/i.test(String(x?.id||x?.name||'')));
      let worked = false;
      // Paint once then clone to all other avatars for this same person.
      if (canvases.length && drawPortraitLayers(canvases[0],layers,member)) {
        worked=true;
        for (const extra of canvases.slice(1)) clonePaintedPortrait(canvases[0], extra, member);
      } else if (canvases.length) {
        worked=tryWcePortrait(canvases[0],member,saved);
        if (worked) for (const extra of canvases.slice(1)) clonePaintedPortrait(canvases[0], extra, member);
      }
      // Real BC renderer fallback when the client can draw the character in
      // the chatroom but the usual Canvas/CanvasBlink field is inaccessible.
      // Paint once per person and clone the result to their other visible
      // avatars without invoking the expensive BC renderer again.
      if (!worked && live && canvases.length && drawLiveCharacterThroughBC(canvases[0],member,live)) {
        worked=true;
        for (const extra of canvases.slice(1)) clonePaintedPortrait(canvases[0], extra, member);
      }
      if (worked) {
        if(live) rememberRoomPortrait(member,canvases[0]);
        else if(canvases[0]?.classList.contains('is-painted'))
          rememberSteadyRemotePortrait(member,canvases[0]);
        syncPaintedPortraitCopies(member);
        portraitRuntime.unresolved.delete(member);
      }
      else {
        portraitRuntime.unresolved.add(member);
        if (live && hasActualLivePresence(member)) requestBCPortraitRefresh(member, live);
        else requestWceSavedSnapshotPortrait(member);
      }
    }
  }
  function schedulePortraits() {
    if (!state.open || !ui.shadow || motionRuntime.active) return;
    // Synchronous copy: prevents fallback-image flashing across panel redraws.
    // Only remote portraits are stabilized; characters in the room remain live.
    paintSteadyRemotePortraits(ui.shadow);
    for (const member of steadyRemotePortraits.keys())
      if (hasActualLivePresence(member)) steadyRemotePortraits.delete(member);
    if (portraitRuntime.queued) return;
    portraitRuntime.queued = true;
    // BC can finish drawing a character *after* the first render. tick() calls
    // this every two seconds, so newly populated canvases get another chance.
    requestAnimationFrame(paintVisiblePortraits);
  }
  function mugshotDiagnostics(id) {
    const member = numeric(id) || numeric(state.selected);
    const live = findLiveCharacter(member);
    const wce = readWceSavedProfile(member);
    const selector = `.kc-bc-mugshot[data-kc-portrait="${member}"]`;
    const canvases = member && ui.shadow ? [...ui.shadow.querySelectorAll(selector)] : [];
    const sourceSummary = source => {
      if (!source) return null;
      let keys = [];
      try { keys = Object.keys(source).filter(k => /canvas|draw|portrait|mugshot|image|sprite|bitmap/i.test(k)).slice(0,25); } catch {}
      return { renderingFields:keys, layersFound:collectPortraitSources(source).length,
        imageLinkFound:!!portraitUrl(source) };
    };
    return { version:VERSION, member, gameCharacterLoaded:!!live,
      gamePortrait:sourceSummary(live), wceProfileExposed:!!wce,
      wcePortrait:sourceSummary(wce),
      wceSavedSnapshot:{installed:wceIsInstalled(),database:'bce-past-profiles',
        dbLastCheck:wceSnapshotRuntime.dbLastCheck,
        cachedInSession:wceSnapshotRuntime.temporaryPortraits.has(member),
        stableRemotePortrait:!!steadyRemotePortrait(member),
        recentRoomPortrait:recentRoomPortraits.has(member),
        cachedMembers:wceSnapshotRuntime.temporaryPortraits.size,
        currentlyLoading:wceSnapshotRuntime.pending.has(member),
        isInLiveRoom:hasActualLivePresence(member),
        ...(wceSnapshotRuntime.reports.get(member)||{status:'not-checked'})},
      visibleAvatarCanvases:canvases.length,
      paintedAvatarCanvases:canvases.filter(c=>c.classList.contains('is-painted')).length,
      bcCanvasLoaderAvailable:typeof window.CharacterLoadCanvas === 'function',
      bcCharacterHasAppearance:Array.isArray(live?.Appearance) && live.Appearance.length > 0,
      bcCanvasRefresh:portraitRuntime.refreshResults.get(member) || null,
      bcDirectRenderer:directPortraitRuntime.results.get(member) || {
        attempted:false, drawCharacterAvailable:typeof window.DrawCharacter==='function',
        mainCanvasAvailable:!!window.MainCanvas,
        mainCanvasIs2D:typeof window.MainCanvas?.drawImage==='function'
      },
      canvasCrop:portraitCropRuntime.last.get(member) || {outcome:'not-checked'},
      portraitCompletenessGuard:'enabled: rejects partial eyes/clothing and tiny corner renders',
      nativeCanvasShape:live?.Canvas ? {width:live.Canvas.width||0,height:live.Canvas.height||0,kind:Object.prototype.toString.call(live.Canvas)} : null,
      drawableSources:collectPortraitSources(live).map(v=>({kind:Object.prototype.toString.call(v),width:v.width||v.naturalWidth||0,height:v.height||v.naturalHeight||0})).slice(0,8),
      rendererKeys: live ? Object.keys(live).filter(k=>/canvas|draw|render|layer|image|bitmap|sprite|texture/i.test(k)).slice(0,28) : [],
      fallbackReason:canvases.some(c=>c.classList.contains('is-painted')) ? null :
        !live && !wce ? 'No live character; check wceSavedSnapshot for the existing WCE database lookup' :
        typeof window.CharacterLoadCanvas !== 'function' ? 'No drawable portrait and BC does not expose CharacterLoadCanvas' :
        'BC character loaded but no drawable portrait: inspect bcDirectRenderer, bcCanvasRefresh, and drawableSources' };
  }

  function popFace(holder) {
    if (!holder) return;
    const now = Date.now();
    const burst = now - (state.faceBurst.at || 0) < 450 ? Math.min(14, (state.faceBurst.count || 0) + 1) : 1;
    state.faceBurst = { at: now, count: burst };
    holder.classList.remove('popping');
    void holder.offsetWidth;
    holder.classList.add('popping');
    setTimeout(() => holder.classList.remove('popping'), 340);
    let layer = holder.querySelector('.heart-burst');
    if (!layer) {
      layer = document.createElement('span');
      layer.className = 'heart-burst';
      holder.appendChild(layer);
    }
    const hearts = Math.min(10, 2 + Math.ceil(burst / 2));
    const glyphs = ['♥', '♡', '💗', '💕'];
    for (let i = 0; i < hearts; i++) {
      const heart = document.createElement('span');
      heart.className = 'float-heart';
      heart.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      heart.style.left = `${45 + Math.random() * 18}%`;
      heart.style.top = `${44 + Math.random() * 18}%`;
      heart.style.fontSize = `${14 + Math.random() * 13}px`;
      heart.style.setProperty('--drift', `${-42 + Math.random() * 84}px`);
      heart.style.setProperty('--rise', `${52 + Math.random() * 54}px`);
      heart.style.animationDelay = `${i * 0.025}s`;
      layer.appendChild(heart);
      setTimeout(() => heart.remove(), 1300);
    }
  }
  function stylesheet() {
    return `
:host{all:initial;font:15px/1.5 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--ink);--ink:#fff5fc;--sub:#e0c4db;--bg:#241629;--card:#34213b;--card2:#452d4c;--accent:#ef7db3;--accent2:#5c325e;--border:#6b4368;--bubble:#7c4366;--bubble2:#55304c;--shadow:0 18px 60px #000a;--hero1:#2a162c;--hero2:#4a2745;--hero3:#1a1220;--good:#79d18e;}
*{box-sizing:border-box}button,input,textarea,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.theme-pink{--ink:#693858;--sub:#9d748f;--bg:#fff7fb;--card:#fff;--card2:#fff6fb;--accent:#ea80b1;--accent2:#ffd6e9;--border:#efcadc;--bubble:#ffe4f0;--bubble2:#f9d4e6;--shadow:0 16px 50px #5e224633;--hero1:#f0cadb;--hero2:#e3b6cc;--hero3:#f7e4ee;--good:#33a85e;}
.theme-lavender{--ink:#f8f2ff;--sub:#e0d6f1;--bg:#241f32;--card:#302946;--card2:#3d3459;--accent:#af98f4;--accent2:#4b3e72;--border:#62597d;--bubble:#695699;--bubble2:#4a3d6f;--hero1:#2d2740;--hero2:#4e4372;--hero3:#1f1b31;--good:#82d999;}
.theme-cream{--ink:#705442;--sub:#987a68;--bg:#fffaf1;--card:#fffdf9;--card2:#fff3df;--accent:#d99668;--accent2:#f8ddb8;--border:#e7d0ad;--bubble:#f8ead3;--bubble2:#eedabb;--shadow:0 16px 50px #54361b22;--hero1:#f0dec4;--hero2:#e7ca9f;--hero3:#fff7eb;--good:#4f9f63;}
.theme-midnight{--ink:#fff5fc;--sub:#e0c4db;--bg:#241629;--card:#34213b;--card2:#452d4c;--accent:#ef7db3;--accent2:#5c325e;--border:#6b4368;--bubble:#7c4366;--bubble2:#55304c;--shadow:0 18px 60px #000a;--hero1:#2a162c;--hero2:#4a2745;--hero3:#1a1220;--good:#79d18e;}
#kc-fab{all:unset;position:fixed;right:16px;bottom:100px;z-index:2147483000;width:64px;height:64px;border:0;border-radius:0;background:transparent;box-shadow:none;display:flex;align-items:center;justify-content:center;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(0 7px 8px #190b24ae);transition:transform .19s ease,filter .19s ease;overflow:visible}
/* Yield the launcher to other mods / BC menus without changing its saved drag position. */
#kc-fab.kc-yielding{visibility:hidden!important;opacity:0!important;pointer-events:none!important;transition:none!important}
/* A non-interactive host lets BC receive clicks outside these actual controls. */
#kc-fab:not(.kc-yielding),#kc-panel.open{pointer-events:auto!important}
#kc-fab:hover{transform:translateY(-4px) rotate(-3deg);filter:drop-shadow(0 11px 12px #9d427a88)}#kc-fab:active{cursor:grabbing}#kc-fab .asset{width:64px;height:64px;font-size:34px;pointer-events:none}#kc-fab .counter{position:absolute;right:-2px;top:2px;font:bold 11px system-ui;color:#fff1f8;background:#532843;border:2px solid #e79bbd;border-radius:7px;transform:rotate(13deg);box-shadow:0 3px 8px #20132399;min-width:25px;text-align:center;padding:2px 5px}
.asset{display:inline-flex;align-items:center;justify-content:center;position:relative;overflow:hidden;font-size:inherit}.asset>img{position:absolute;width:100%;height:100%;object-fit:contain;z-index:1}.asset>span{display:flex;align-items:center;justify-content:center;width:100%;height:100%}.asset>img:not([style*="display: none"])+span{visibility:hidden}.avatar{width:46px;height:46px;flex:0 0 46px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bubble2);border:2px solid #ffffff18;overflow:hidden;font-size:25px;box-shadow:0 4px 10px #0002}.avatar img{width:100%;height:100%;object-fit:cover}.avatar .asset{width:100%;height:100%}
#kc-panel{position:fixed;right:24px;bottom:182px;width:min(1260px,calc(100vw - 20px));height:min(840px,calc(100dvh - 35px));z-index:2147483001;display:none;flex-direction:column;border-radius:28px;overflow:hidden;background:var(--bg);border:1px solid var(--border);box-shadow:var(--shadow);color:var(--ink)}#kc-panel.open{display:flex}
.hero{min-height:108px;flex:none;padding:14px 18px;display:flex;align-items:flex-start;gap:16px;background:radial-gradient(circle at right top,#78405d66,transparent 35%),linear-gradient(110deg,var(--hero1),var(--hero2) 55%,var(--hero3));border-bottom:1px solid var(--border);position:relative}.hero::after{content:'';position:absolute;inset:auto 0 0 0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.5}.logo{width:72px;height:72px;font-size:42px}.brandblock{display:flex;flex-direction:column;gap:4px;min-width:0}.title{font-size:24px;font-weight:900;letter-spacing:.2px}.subtitle{font-size:13px;color:var(--sub)}.grow{flex:1}.heroactions{display:flex;gap:10px;align-items:center}.heroactions .iconbutton{width:48px;height:48px;border-radius:15px;font-size:22px;background:#ffffff0f}
.iconbutton{width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,#ffffff08,#00000005);color:var(--ink);font-size:18px}
.workspace{display:grid;grid-template-columns:92px 228px minmax(0,1fr);flex:1;min-height:0;background:linear-gradient(180deg,#0000000d,transparent 16%)}
.workspace.wide .main{grid-column:2 / -1}.rail{border-right:1px solid var(--border);background:linear-gradient(180deg,#221325,#27162b);padding:14px 10px;display:flex;flex-direction:column;gap:12px;align-items:stretch}.railtab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:92px;border:1px solid var(--border);border-radius:22px;background:linear-gradient(180deg,#ffffff08,#00000008);color:var(--sub);font-weight:700;padding:10px 4px}.railtab .ic{font-size:30px;line-height:1}.railtab .tx{font-size:14px}.railtab.active{background:linear-gradient(180deg,var(--accent2),#ffffff08);color:var(--ink);box-shadow:inset 0 0 0 1px #ffffff18}.railspacer{flex:1}
.sidebar{border-right:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:linear-gradient(180deg,#2b192f,#241528)}.side-shell{padding:16px;display:flex;flex-direction:column;gap:14px;min-height:0;height:100%}.side-card{border:1px solid var(--border);border-radius:22px;background:linear-gradient(180deg,#ffffff08,#00000008);padding:14px;position:relative;overflow:hidden}.side-card::after{content:'';position:absolute;inset:auto -35px -35px auto;width:130px;height:70px;background:radial-gradient(circle at center,var(--accent2),transparent 70%);opacity:.35}.side-card-title{font-size:14px;color:var(--accent);font-weight:800;margin-bottom:8px}.side-mainline{display:flex;align-items:center;gap:12px}.side-search{position:relative}.side-search .search{padding-right:42px}.pawhint{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--accent);font-size:20px;pointer-events:none}
.search,.field{width:100%;border:1px solid var(--border);border-radius:16px;background:var(--card2);padding:11px 13px;color:var(--ink);min-width:0}.search::placeholder,.field::placeholder,textarea::placeholder{color:var(--sub)}textarea.field{resize:vertical}.muted{color:var(--sub);font-size:13px}.side-filters{display:flex;gap:8px}.filterbtn{flex:1;border:1px solid var(--border);border-radius:14px;background:transparent;color:var(--sub);padding:9px 8px;font-weight:700}.filterbtn.active{background:var(--accent);color:#301624;border-color:transparent}.side-list{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px}.contact{width:100%;display:flex;align-items:center;gap:10px;background:linear-gradient(180deg,#ffffff04,#00000008);border:1px solid var(--border);border-radius:18px;padding:10px 12px;text-align:left;color:var(--ink)}.contact:hover,.contact.active{background:linear-gradient(180deg,var(--bubble2),#ffffff06);border-color:#ffffff30}.contact .info{min-width:0;flex:1}.contact .topline{display:flex;gap:8px;align-items:center}.contact .nameline{font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.contact .time{margin-left:auto;font-size:11px;color:var(--sub);white-space:nowrap}.contact .preview{font-size:13px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}.tiny-pill{font-size:11px;border-radius:30px;background:#ff557f;color:white;padding:3px 8px;min-width:28px;text-align:center;font-weight:800}.presence{width:11px;height:11px;border-radius:50%;background:#858585;border:2px solid var(--card)}.presence.on{background:var(--good)}
.main{min-width:0;display:flex;flex-direction:column;min-height:0;background:linear-gradient(180deg,#2b182d,#241629)}
.chatlayout{display:grid;grid-template-columns:minmax(0,1fr) 280px;height:100%;min-height:0}.chatcenter{display:flex;flex-direction:column;min-width:0;min-height:0}.companion{border-left:1px solid var(--border);background:linear-gradient(180deg,#28172b,#221326);padding:16px;display:flex;flex-direction:column;gap:14px;overflow:auto}
.chathead{min-height:98px;display:flex;align-items:center;gap:12px;padding:16px 18px;background:linear-gradient(180deg,#ffffff06,#00000005);border-bottom:1px solid var(--border)}.chatcover{position:absolute;inset:0;background:radial-gradient(circle at right bottom,var(--accent2),transparent 45%);opacity:.18;pointer-events:none}.headblock{min-width:0;flex:1}.headtitle{font-weight:900;font-size:20px}.headsubtitle{font-size:14px;color:var(--sub)}.headright{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.typing-paws{display:inline-block;animation:kc-purr .9s ease-in-out infinite alternate}@keyframes kc-purr{from{transform:translateY(0);opacity:.62}to{transform:translateY(-2px);opacity:1}}@media(prefers-reduced-motion:reduce){.typing-paws{animation:none}}
.msglog{flex:1;min-height:0;overflow:auto;padding:18px;background:linear-gradient(180deg,#00000010,#00000005),var(--bg);background-image:none;background-size:170px;display:flex;flex-direction:column;gap:12px}.msgrow{display:flex;align-items:flex-end;gap:10px;max-width:94%}.msgrow.mine{align-self:flex-end;flex-direction:row-reverse}.msgrow.other{align-self:flex-start}.msgavatar{align-self:flex-end}.msgcol{display:flex;flex-direction:column;gap:4px;max-width:100%}.msgbubble{border-radius:22px 22px 22px 8px;background:linear-gradient(180deg,#ffffff08,#00000007);border:1px solid var(--border);padding:13px 15px;overflow-wrap:anywhere;white-space:pre-wrap;line-height:1.55;font-size:15px;min-width:55px;max-width:100%}.mine .msgbubble{border-radius:22px 22px 8px 22px;background:linear-gradient(180deg,var(--bubble),var(--bubble2))}.msgmeta{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--sub)}.react{background:transparent;border:0;color:var(--sub);font-size:13px;padding:0 4px}.react:hover{color:var(--accent)}.msgsticker{width:min(180px,100%);height:150px;display:flex;align-items:center;justify-content:center;font-size:63px}.msgsticker img{width:100%;height:100%;object-fit:contain}
.empty{margin:auto;text-align:center;color:var(--sub);padding:25px;max-width:420px}.empty .art{height:120px;font-size:75px;margin-bottom:10px}.empty .art .asset{height:112px;width:150px}
.quick{display:flex;gap:8px;overflow:auto;padding:10px 14px;border-top:1px solid var(--border);background:linear-gradient(180deg,#00000005,#ffffff04)}.pill{border:1px solid var(--border);border-radius:22px;background:var(--card2);padding:8px 12px;color:var(--ink);white-space:nowrap;font-size:13px}.composer{background:linear-gradient(180deg,#0000000b,#00000004);padding:12px 14px;display:grid;gap:10px;align-items:center;border-top:1px solid var(--border)}.composer textarea{flex:1;min-width:0;max-height:112px;min-height:42px;resize:vertical}.chat-composer{grid-template-columns:58px minmax(136px,160px) minmax(0,1fr) 118px}.group-composer{grid-template-columns:96px 58px minmax(0,1fr) 118px}.composer .kc-add{width:58px;height:46px;border-radius:16px;font-size:28px;line-height:1}.chat-composer .mode{min-width:136px;padding:11px 34px 11px 12px;white-space:nowrap}.primary{background:linear-gradient(180deg,#fba4ce,#ed84b7);color:#37182a;border:0;border-radius:16px;padding:12px 15px;font-weight:850}.secondary{background:linear-gradient(180deg,#ffffff06,#00000008);color:var(--ink);border:1px solid var(--border);border-radius:16px;padding:10px 12px}.mode{width:100%;padding:11px 10px;background:var(--card2);border:1px solid var(--border);border-radius:14px;color:var(--ink)}
.screen{padding:18px;overflow:auto;flex:1;min-height:0}.sectiontitle{font-weight:900;font-size:22px;margin:5px 0 14px}.smalltitle{font-weight:800;margin:16px 0 7px}.settingrow{display:flex;align-items:center;gap:10px;justify-content:space-between;margin:12px 0}.settingrow>*:last-child{max-width:65%}.settingrow label{cursor:pointer}.settingrow input[type=checkbox]{accent-color:var(--accent);transform:scale(1.25)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.roomcard,.compcard{padding:14px;border:1px solid var(--border);background:linear-gradient(180deg,#ffffff08,#00000008);border-radius:18px;overflow-wrap:anywhere}.roomcard strong{display:block;margin-bottom:6px}.flex{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.actions{display:flex;gap:6px;align-items:center}.stickerpicker{display:grid;grid-template-columns:repeat(auto-fit,minmax(94px,1fr));gap:10px;padding:12px;border-top:1px solid var(--border);background:linear-gradient(180deg,#00000005,#ffffff03)}.stickerbtn{display:flex;flex-direction:column;gap:6px;align-items:center;justify-content:center;padding:10px;border:1px solid var(--border);border-radius:16px;background:var(--card2);color:var(--ink)}.stickerbtn .asset{width:60px;height:60px;font-size:32px}.stickerbtn small{font-size:11px;color:var(--sub)}
.profilehero{text-align:center;padding:8px 0 2px}.profilehero .avatar{width:110px;height:110px;margin:0 auto 10px;font-size:56px;border-width:3px}.profilename{font-size:18px;font-weight:900}.statusline{color:var(--sub);font-size:12px}.stickercard .asset{width:170px;height:120px;margin:auto;font-size:72px;display:flex}.quickactions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.quickactions .iconbutton{width:100%;height:48px;border-radius:14px;font-size:22px}.friendnote{font-size:12px;line-height:1.4}.inline-room{display:flex;align-items:center;justify-content:space-between;gap:8px}
#kc-toast{position:fixed;right:24px;bottom:20px;z-index:2147483002;padding:12px 14px;border-radius:15px;background:#24152dcc;color:#ffe8f3;border:1px solid #ffffff26;backdrop-filter:blur(6px);transform:translateY(14px);opacity:0;pointer-events:none;transition:all .18s}#kc-toast.show{transform:translateY(0);opacity:1}.hidden{display:none!important}
@media (max-width: 1120px){.workspace{grid-template-columns:82px 194px minmax(0,1fr)}.chatlayout{grid-template-columns:minmax(0,1fr) 240px}.chat-composer{grid-template-columns:54px minmax(128px,150px) minmax(0,1fr) 112px}.group-composer{grid-template-columns:88px 54px minmax(0,1fr) 112px}.composer .kc-add{width:54px;height:44px}}
@media (max-width: 820px){.chat-composer{grid-template-columns:58px minmax(132px,1fr);grid-template-areas:'stickers mode' 'input input' 'send send'}.chat-composer .kc-add{grid-area:stickers}.chat-composer .mode{grid-area:mode}.chat-composer textarea{grid-area:input}.chat-composer .primary{grid-area:send}.group-composer{grid-template-columns:96px 58px;grid-template-areas:'group stickers' 'input input' 'send send'}.group-composer .group-head-tag{grid-area:group}.group-composer .kc-add{grid-area:stickers}.group-composer textarea{grid-area:input}.group-composer .primary{grid-area:send}}
@media (max-width: 930px){#kc-panel{width:calc(100vw - 10px);height:calc(100dvh - 10px);right:5px;bottom:5px}.workspace{grid-template-columns:78px 1fr}.sidebar{display:none}.main{grid-column:2}.railtab{min-height:82px}.chatlayout{grid-template-columns:1fr}.companion{display:none}}
@media (max-width: 620px){.hero{min-height:86px;padding:12px}.logo{width:56px;height:56px}.title{font-size:20px}.subtitle{font-size:11px}.heroactions .iconbutton{width:42px;height:42px}.workspace{grid-template-columns:1fr;grid-template-rows:auto 1fr}.rail{flex-direction:row;overflow:auto;padding:10px;border-right:0;border-bottom:1px solid var(--border)}.railtab{min-width:92px;min-height:72px}.main{grid-column:1}.workspace.wide .main{grid-column:1}.chat-composer{grid-template-columns:1fr 52px;grid-template-areas:'mode stickers' 'input input' 'send send'}.chat-composer .mode{grid-area:mode}.chat-composer .sticker-toggle{grid-area:stickers}.chat-composer textarea{grid-area:input}.chat-composer .primary{grid-area:send}.group-composer{grid-template-columns:1fr 52px;grid-template-areas:'group stickers' 'input input' 'send send'}.group-composer .group-head-tag{grid-area:group}.group-composer .sticker-toggle{grid-area:stickers}.group-composer textarea{grid-area:input}.group-composer .primary{grid-area:send}}

/* Larger, higher-contrast typography. Settings can increase it further. */
.text-large .muted,.text-large .group-sub,.text-large .contact .preview,.text-large .subtitle{font-size:14px}
.text-large .contact .nameline,.text-large .group-name{font-size:15px}
.text-large .msgbubble{font-size:16px}.text-large .msgmeta{font-size:13px}
.text-extra .muted,.text-extra .group-sub,.text-extra .contact .preview,.text-extra .subtitle{font-size:15px}
.text-extra .contact .nameline,.text-extra .group-name{font-size:17px}
.text-extra .msgbubble{font-size:18px}.text-extra .msgmeta{font-size:14px}
/* Kittychat v0.3: draggable, resizable panel and high-contrast group controls */
#kc-panel{container-type:inline-size;left:50px;top:40px;right:auto;bottom:auto;min-width:0;min-height:0}
.hero{cursor:grab;touch-action:none;user-select:none}.hero:active{cursor:grabbing}.hero button{touch-action:manipulation;cursor:pointer}
.kc-resize{position:absolute;right:1px;bottom:1px;z-index:90;display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:13px 0 20px 0;color:var(--ink);background:var(--card2);border-left:1px solid var(--border);border-top:1px solid var(--border);cursor:nwse-resize;touch-action:none;font-size:19px}
.kc-resize:hover{background:var(--bubble)}
.groupbar{display:flex;align-items:center;gap:7px;margin-bottom:4px}.groupbar b{flex:1;color:var(--ink);font-size:14px}.group-item{padding:11px 13px;display:flex;gap:9px;align-items:center;border:1px solid var(--border);border-radius:16px;background:var(--card2);color:var(--ink);width:100%;text-align:left}.group-item.active{border-color:var(--accent);background:var(--bubble2)}.group-name{font-weight:850;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.group-sub{font-size:12px;color:var(--sub)}.group-invite{border:1px solid #ea9dc7;border-radius:16px;background:var(--card2);padding:10px 12px;display:grid;gap:7px}.group-invite b{color:var(--ink)}.group-invite .actions button{flex:1}.group-stack{display:grid;gap:7px;max-height:165px;overflow:auto}.group-pill{font-size:11px;border:1px solid var(--border);border-radius:10px;padding:4px 7px;white-space:nowrap}.group-member{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--card2);margin-top:7px;color:var(--ink)}.group-member small{color:var(--sub);font-size:12px}
.group-create-backdrop{position:absolute;inset:0;z-index:95;display:grid;place-items:center;background:#100a1ccc;backdrop-filter:blur(6px);padding:15px}.group-create-card{width:min(450px,100%);max-height:min(680px,95%);overflow:auto;background:var(--card);border:1px solid var(--border);border-radius:25px;box-shadow:0 18px 65px #0009;padding:24px;color:var(--ink)}.group-create-card h2{margin:0 0 8px;color:var(--ink);font-size:23px}.member-picker{display:grid;gap:7px;margin:12px 0;max-height:240px;overflow:auto}.member-picker label{display:flex;gap:12px;align-items:center;background:var(--card2);border:1px solid var(--border);padding:9px 11px;border-radius:13px;color:var(--ink)}.member-picker input{accent-color:var(--accent);width:17px;height:17px}.group-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.group-head-tag{color:var(--ink);background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:9px 13px;font-size:13px}.group-message-author{font-size:12px;font-weight:850;color:var(--ink);margin-bottom:5px}.group-details h3{margin:0 0 12px;font-size:17px}
input,textarea,select{color:var(--ink);caret-color:var(--accent)}input::selection,textarea::selection{background:#d981b8;color:#251527}
@container (max-width:1120px){.workspace{grid-template-columns:78px 180px minmax(0,1fr)}.chatlayout{grid-template-columns:minmax(0,1fr)}.companion{display:none}.rail{padding:9px 7px}.railtab{min-height:72px}.railtab .ic{font-size:22px}}
@container (max-width:790px){.workspace{grid-template-columns:66px 140px minmax(0,1fr)}.side-shell{padding:10px}.chathead{padding:10px;min-height:74px}.headright{gap:3px}.headright .secondary{display:none}.chathead .avatar{width:35px;height:35px;flex-basis:35px}.hero{min-height:73px;padding:7px 12px}.logo{width:48px;height:48px}.title{font-size:18px}.subtitle{font-size:11px}.heroactions .iconbutton{height:35px;width:35px}.railtab .tx{font-size:11px}.railtab .ic{font-size:19px}}
@container (max-width:620px){.workspace{grid-template-columns:60px minmax(0,1fr);position:relative}.main,.workspace.wide .main{grid-column:2}.sidebar{display:none!important}.sidebar.compact-open{display:flex!important;position:absolute;top:0;bottom:0;left:60px;width:min(300px,calc(100% - 60px));z-index:40;box-shadow:20px 0 38px #0009}.rail{flex-direction:column;overflow:auto;min-width:0;padding:6px 3px}.railtab{min-width:0;min-height:64px}.composer{grid-template-columns:1fr 48px;grid-template-areas:'mode stickers' 'input input' 'send send'}.composer .mode{grid-area:mode}.composer .sticker-toggle{grid-area:stickers}.composer textarea{grid-area:input}.composer .primary{grid-area:send}.quick{padding:5px}.headtitle{font-size:15px}.headright .iconbutton{width:30px;height:30px}.chathead{gap:5px}}
@media (max-width:930px){#kc-panel{right:auto;bottom:auto}}
@media (max-width:620px){.rail{flex-direction:column}.workspace{grid-template-columns:60px minmax(0,1fr);grid-template-rows:1fr}.main,.workspace.wide .main{grid-column:2}.composer{grid-template-columns:1fr 48px}}


/* Kittychat v0.4 — original, illustrated den layout; no moon/day-night UI. */

#kc-panel{background:#1b101f;border:2px solid #e47ead;border-radius:35px 35px 27px 27px;box-shadow:0 0 0 2px #4e2648,0 15px 70px #000b, inset 0 0 0 1px #ffb6dc33}
.hero{min-height:100px;padding:10px 18px 14px 22px;align-items:center;gap:8px;background:radial-gradient(ellipse at 15% 30%,#6c305b 0%,transparent 53%),linear-gradient(160deg,#31172b,#170f1f 70%);border-bottom:2px solid #ac577d;overflow:visible}
.hero::after{height:3px;background:linear-gradient(90deg,#f5b1d2,transparent,#d26b9b);opacity:.6}
.logo{width:86px;height:67px;font-size:43px;margin:-18px 2px -6px -4px;filter:drop-shadow(0 3px 5px #f58fc960);overflow:visible;flex:0 0 86px}.logo .asset{width:100%;height:100%;overflow:visible}
.title{font-size:30px;font-weight:950;letter-spacing:-.9px;color:#ffd1e8;line-height:1.08;text-shadow:0 2px #9f3468,0 3px 7px #f48ebeaa;font-family:'Trebuchet MS',system-ui,sans-serif}
.subtitle{font-size:12px;color:#f5c9dc;letter-spacing:.45px;margin-top:4px}
.heroactions{align-self:stretch;display:flex;align-items:center;gap:10px}.dragcue{border:1px solid #b05c87;border-radius:50px;color:#c9a0b7;background:#2e1a32;padding:4px 14px;font-size:11px;letter-spacing:1px;white-space:nowrap;pointer-events:none}.heroactions .closekitty{width:40px;height:43px;border-radius:16px 16px 13px 13px;border:1px solid #ffc5df;background:linear-gradient(180deg,#ff8dc2,#dd4f95);font-size:24px;color:#fff;box-shadow:0 2px 8px #e66ba577}
.workspace{grid-template-columns:86px 320px minmax(0,1fr);background:#211224;min-height:0}
.rail{background:linear-gradient(180deg,#2a142a,#180e1f);padding:28px 7px 10px;gap:4px;border-right:1px solid #8f4c73;align-items:stretch}
.railtab{background:none;border:1px solid transparent;min-height:68px;border-radius:20px;gap:2px;color:#db9ec8;padding:7px 2px;box-shadow:none}
.railtab .ic{font-size:29px;filter:drop-shadow(0 2px 2px #0008)}.railtab .tx{font-size:12px;font-weight:800}
.railtab.active{background:linear-gradient(155deg,#f57db0,#ce367f);color:#fff;border-color:#ffd5e8;box-shadow:0 0 0 2px #86345d,0 0 14px #f968ae77}
.railtab:hover:not(.active){background:#64305166;border-color:#95547d}
.sidebar{background:linear-gradient(180deg,#2a182e 0%,#1d1223 95%);border-right:1px solid #995379}
.side-shell{padding:12px 11px 14px;gap:9px}
.side-card{border-radius:15px;padding:10px 12px;background:radial-gradient(ellipse at top,#71355355,transparent 95%),linear-gradient(180deg,#38203a,#2a1830);border-color:#9e567f;box-shadow:inset 0 1px #f4a5d12a}
.side-card-title{font-size:13px;color:#f1a1ce;margin-bottom:4px}.side-mainline .avatar{width:42px;height:42px;flex-basis:42px}
.side-filters{gap:6px}.filterbtn{border-radius:24px;padding:7px 5px;font-size:12px;border-color:#80476a;color:#eed1e1}.filterbtn.active{background:linear-gradient(180deg,#f99cc6,#df598f);color:#2c1324;box-shadow:0 2px 9px #e76fa166}
.side-search .search{padding:9px 34px 9px 13px;border-radius:25px;background:#201329;border-color:#b46895;box-shadow:inset 0 2px 6px #0004}.pawhint{font-size:18px}
.side-shell>.flex>.secondary,.side-shell>.flex>.primary{padding:8px 6px;border-radius:19px;font-size:12px}
.groupbar{padding:6px 2px 0;gap:6px}.groupbar b{color:#f5a5ce;font-size:13px}.group-stack{flex:0 0 auto;max-height:165px;gap:5px}.group-stack:empty{display:none}.group-item{background:#29182c;border-radius:12px;padding:7px 9px}.group-invite{padding:8px}
.side-list{padding:3px 2px 10px;gap:3px}.contact{border-radius:15px;padding:9px 7px;background:transparent;border-color:transparent;border-bottom:1px solid #723d594d}.contact.active{border-color:#f38abc;background:linear-gradient(145deg,#8e3d66,#4d2646);box-shadow:inset 0 0 8px #f67ab328}.contact .nameline{font-size:14px}.contact .time{font-size:11px}.contact .preview{font-size:12px;color:#dfc0d7}.contact .avatar{width:42px;height:42px;flex-basis:42px}.tiny-pill{background:#f15191;font-size:11px}
.main{background:#211325}
.chatlayout{grid-template-columns:minmax(0,1fr) 285px;min-height:0}
.chatcenter{background:#1c1122;min-height:0;overflow:hidden}
.chathead{min-height:72px;padding:10px 12px;gap:8px;background:linear-gradient(180deg,#321d36,#271729);border-bottom:1px solid #955079}
.chathead .avatar{width:43px;height:43px;flex-basis:43px}
.headtitle{font-size:17px;color:#ffdeed;line-height:1.15}.headsubtitle{font-size:12px;color:#e8bed6;overflow-wrap:anywhere;line-height:1.35}.headright{gap:4px;flex-wrap:nowrap}
.headright .iconbutton{width:31px;height:32px;border-radius:11px;font-size:15px;border-color:#87436c}.headright .secondary{display:none}
.msglog{padding:16px 16px 20px;background-color:#251329;background-image:linear-gradient(180deg,#150d1ad1,#271323a8 50%,#1b1021b5),url(${imgUrl('kitty-den-wallpaper.svg')});background-position:center,center center;background-size:cover,cover;background-repeat:no-repeat;gap:11px}
.msgrow{max-width:96%;gap:7px}.msgrow.mine .msgcol{align-items:flex-end}.msgrow.other .msgcol{align-items:flex-start}
.msgcol{max-width:calc(100% - 51px);gap:2px}.msgbubble{border-radius:17px 19px 18px 9px;color:#fff5fb;font-size:14px;line-height:1.45;background:linear-gradient(160deg,#382238ed,#241527ed);border:1px solid #935579;padding:10px 13px;box-shadow:0 3px 10px #0005;min-width:44px}
.mine .msgbubble{border-radius:19px 19px 9px 19px;background:linear-gradient(150deg,#ff94be,#e46a9e);color:#321124;border-color:#ffaad0;text-shadow:none;box-shadow:0 3px 14px #360c2499}
.msgbubble .muted{color:inherit;opacity:.9}.msgmeta{font-size:11px;color:#f5d1e4;padding:2px 6px;text-shadow:0 1px 3px #000b}.mine .msgmeta{color:#fbb9d3}.msgmeta .react{color:#ff8fba}
.msgavatar .avatar{width:37px;height:37px;flex-basis:37px}.msgsticker{width:130px;height:122px;font-size:55px}.msgsticker .asset{width:100%;height:100%}
.quick{order:3;flex:none;min-height:36px;max-height:44px;padding:4px 11px 8px;gap:6px;border-top:0;background:linear-gradient(180deg,#291629,#1a0e20)}
.quick .pill{padding:5px 10px;font-size:11px;background:#3d2139;border-color:#8f4c72;color:#ffe1f1}
.stickerpicker{order:1;flex:none;max-height:172px;overflow:auto;background:#291729;padding:9px;grid-template-columns:repeat(8,minmax(54px,1fr))}
.composer{order:2;flex:none;padding:9px 10px 5px;grid-template-columns:82px 37px minmax(0,1fr) 62px;gap:7px;align-items:center;background:#29172a;border-top:1px solid #9b5176}
.composer .mode{padding:9px 3px;font-size:11px;background:#2e1c31}.composer textarea{min-height:38px;max-height:82px;height:40px;resize:vertical;background:#211329;border-radius:26px;padding:8px 13px;line-height:1.3;font-size:13px}
.composer>.primary{width:56px;height:43px;min-width:56px;padding:2px 4px;border-radius:35px;font-size:11px;box-shadow:0 0 0 2px #5b2345,0 0 10px #ed679b88}
.composer .sticker-toggle{height:37px;width:37px;border-radius:50%;font-size:17px}
.companion{padding:9px;gap:8px;background:linear-gradient(180deg,#2c1830,#1a1020);border-left:1px solid #93537b}
.compcard{border-radius:15px;padding:9px 11px;border:1px solid #8d4b73;background:linear-gradient(160deg,#35203a,#21152b);box-shadow:inset 0 1px #f7bfdc13}
.profilehero{padding:9px 7px}.profilehero .avatar{width:77px;height:77px;margin:0 auto 4px;font-size:34px;border:2px solid #e68cb9;box-shadow:0 0 0 3px #6f395c}
.profilename{font-size:15px;font-weight:900;letter-spacing:-.2px}.statusline{font-size:11px;line-height:1.35}.kconline{color:#a5f0b6}.profilebuttons{display:flex;justify-content:center;gap:6px;margin-top:10px;align-items:center}.profilebuttons .secondary{font-size:11px;padding:7px 8px;border-radius:13px}.profilebuttons .iconbutton{height:33px;width:33px;border-radius:12px;font-size:17px}
.stickerwall .smalltitle,.roompreview .smalltitle,.actioncard .smalltitle{margin:0 0 6px;font-size:13px;color:#ffd1e9}.stickergrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px}.stickertile{background:#39233a55;border:1px solid #7b476c;border-radius:9px;min-width:0;aspect-ratio:1/1;display:flex;justify-content:center;align-items:center;padding:3px}.stickertile:hover{background:#824967}.stickertile .asset{width:100%;height:100%;font-size:26px}.stickertile:hover .asset{transform:scale(1.05)}
.roompreview-row{display:flex;align-items:center;gap:7px}.room-preview-icon{flex:0 0 44px;height:38px;display:grid;place-items:center;border:1px solid #bc668a;border-radius:11px;background:linear-gradient(130deg,#5c2f55,#28182c)}.roompreview-name{font-size:11px;flex:1;min-width:0;overflow-wrap:anywhere;font-weight:850}.roompreview-name small{display:block;font-weight:400;color:#e3b8d1;margin-top:2px}.room-marker{font-size:9px;color:#f9b1d3}
.quickactions{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.quickactions .iconbutton{height:35px;font-size:19px;width:100%}
#kc-resize{border-radius:18px 0 20px 0;background:linear-gradient(150deg,#ef76ae,#742c60);color:#fff;box-shadow:0 0 8px #f476bc66}
.screen{background:linear-gradient(140deg,#311d37,#211524)}.sectiontitle{color:#ffd5ed}.sticker-library .gallerygrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:12px}.gallery-sticker{min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:13px;background:#412441;border:1px solid #a66390;border-radius:18px;color:#ffdaed}.gallery-sticker .asset{height:98px;width:100%;font-size:52px}
.theme-pink .chathead,.theme-cream .chathead{color:#fff5fc}
.text-large .msgbubble{font-size:15px}.text-extra .msgbubble{font-size:17px}.text-large .msgmeta{font-size:12px}.text-extra .msgmeta{font-size:13px}
@container (max-width:950px){.workspace{grid-template-columns:64px 238px minmax(0,1fr)}.chatlayout{grid-template-columns:1fr}.companion{display:none}.rail{padding:9px 4px}.railtab{min-height:65px}.railtab .ic{font-size:23px}.chathead{padding:9px}.headright .iconbutton{height:30px;width:30px}.composer{grid-template-columns:75px 36px minmax(0,1fr) 59px}}
@container (max-width:790px){.workspace{grid-template-columns:62px 206px minmax(0,1fr)}.sidebar{display:flex}.railtab{min-height:58px}}
@container (max-width:620px){.workspace{grid-template-columns:56px minmax(0,1fr)}.sidebar{display:none}.sidebar.compact-open{left:56px;width:min(320px,calc(100% - 56px))}.chathead .headsubtitle{font-size:11px}.hero{min-height:64px;padding:6px 10px}.logo{width:49px;height:49px;flex-basis:49px;margin:-9px 0 -6px 0}.brandblock .title{font-size:19px}.subtitle{font-size:10px}.dragcue{display:none}.railtab{min-height:53px}.railtab .tx{font-size:10px}.railtab .ic{font-size:21px}.composer{grid-template-columns:1fr 38px;grid-template-areas:'mode stickers' 'input input' 'send send';padding:7px}.composer>.primary{width:100%;height:34px}.stickerpicker{grid-template-columns:repeat(4,1fr)}}
@media (max-height:640px){.hero{min-height:62px}.logo{height:51px;width:60px;flex-basis:60px}.chathead{min-height:54px}.companion{gap:5px;padding:6px}.compcard{padding:7px}.profilehero .avatar{height:60px;width:60px}.side-shell{gap:6px}.side-card{padding:6px}}

/* Kittychat v0.6 art-complete: every primary mockup ornament is an asset, not an emoji. */
#kc-panel{border:2px solid #e778ae;background:#1b101e;border-radius:36px 34px 30px 35px;box-shadow:0 0 0 2px #512745,0 0 25px #a12d6a55,0 22px 75px #000c}
#kc-panel:before,#kc-panel:after{content:'';position:absolute;pointer-events:none;left:36px;right:36px;height:43px;background-repeat:no-repeat;background-size:100% 100%;z-index:3;opacity:.82}
#kc-panel:before{top:-18px;background-image:url("${imgUrl('frame-top.svg')}")}
#kc-panel:after{bottom:-17px;background-image:url("${imgUrl('frame-bottom.svg')}")}
.hero{min-height:108px;padding:5px 16px 8px 7px;gap:5px;background:radial-gradient(ellipse at 22% 12%,#4b2845 0%,transparent 50%),linear-gradient(165deg,#31172d,#1a0d20 72%)}
.brandlockup{position:relative;display:block;width:337px;height:105px;flex:0 0 337px;margin:-18px 0 -9px 0;z-index:4;pointer-events:none}
.brandlockup .asset{width:100%;height:100%;overflow:visible}
.brandlockup .asset img{object-fit:fill}
.brandlockup .asset>span{font-weight:900;font-size:26px;text-shadow:0 2px 6px #000;color:#ffc9e7}
.brand-after-lockup{position:absolute;left:214px;top:82px;z-index:5;pointer-events:none}
.brand-after-lockup .subrow small{font-size:11px;font-weight:650;color:#f9c8de;text-shadow:0 2px 4px #08030b;white-space:nowrap}
.kc-deco-left-top{left:-110px;top:53px;width:112px;height:112px;z-index:5}
.kc-deco-left-top .asset{height:100%;width:100%;overflow:visible}
.kc-deco-left-ribbon{left:-22px;bottom:98px;width:92px;height:205px;z-index:6;pointer-events:none}
.kc-deco-left-ribbon:before,.kc-deco-left-ribbon:after{display:none}
.kc-deco-left-ribbon .asset{height:100%;width:100%;overflow:visible}
.kc-deco-left-bottom{left:-15px;bottom:-9px;width:140px;height:132px;z-index:7}
.kc-deco-left-bottom .asset{width:100%;height:100%;overflow:visible}
.kc-deco-right-top{right:71px;top:-41px;width:176px;height:98px;align-items:center;justify-content:flex-end;gap:0;z-index:6}
.kc-deco-right-top>.asset{width:153px;height:93px;overflow:visible}
.kc-deco-right-top .mini-moon{position:absolute;left:0;top:43px;width:29px;height:29px;pointer-events:none}
.kc-deco-right-top .mini-moon .asset{width:100%;height:100%}
.herocharms{gap:10px;margin-right:32px}
.herocharm{width:22px;height:22px}
.herocharm .asset{width:100%;height:100%}
.hero .closekitty{position:relative;z-index:7;width:51px;height:48px;border-radius:17px;background:linear-gradient(180deg,#ff9ac9,#de4b99);box-shadow:inset 0 1px #fff8,0 0 12px #ed6ba36f}
.closekitty>.asset{height:25px;width:25px}
.rail{padding-top:16px;background:linear-gradient(175deg,#2c132e,#1b0d20 90%)}
.rail:before,.rail:after{content:none}
.railtab{min-height:76px;border-radius:22px}
.railtab .ic{height:32px;display:grid;place-items:center}
.railtab .ic .asset{width:31px;height:31px}
.railtab.active{background:linear-gradient(145deg,#f783b8,#c93682);border:2px solid #ffcee8;box-shadow:0 0 9px #fd80c5,0 0 16px #bd3b87}
.railtab:hover .asset{transform:scale(1.06)}
.pawhint{width:21px;height:21px;display:grid;place-items:center}
.pawhint .asset{width:100%;height:100%}
.groupbar:before{content:'';width:19px;height:19px;background:url("${imgUrl('ui-paw.svg')}") center / contain no-repeat;flex:none}
.side-card{border:1px solid #a65182;border-radius:19px;box-shadow:inset 0 1px #ffbfdd44,0 3px 14px #14081750}
.side-card-title{color:#fa92c4;font-size:14px}
.contact.active{border-color:#c86b9d;background:linear-gradient(160deg,#703458,#451f40)}
.chathead{min-height:81px;border-radius:18px 18px 0 0;margin:7px 7px 0;background:linear-gradient(165deg,#392139,#25162c);border:1px solid #9e507b}
.msglog .empty .art .asset{width:90px;height:90px;opacity:.7}.msglog{background:#1d1022;background-image:linear-gradient(180deg,#160b1dc5,#20101c9e 47%,#130817b0),url("${imgUrl('kitty-den-painted.png')}");background-position:center;background-size:cover,cover;background-repeat:no-repeat}
.msgbubble{border-radius:20px 21px 20px 8px;position:relative;border:1px solid #8e5077;background:linear-gradient(145deg,#312030ed,#211426eb)}
.msgrow.mine .msgbubble{border-radius:20px 20px 6px 20px;background:linear-gradient(180deg,#ff8abd,#f36ca9);color:#2e1021;border-color:#ffb8d5}
.msgrow.mine .msgbubble:after{content:'';position:absolute;right:-7px;bottom:7px;border-top:8px solid transparent;border-bottom:7px solid transparent;border-left:10px solid #ef70a8}
.msgrow.other .msgbubble:after{content:'';position:absolute;left:-7px;bottom:8px;border-top:8px solid transparent;border-bottom:7px solid transparent;border-right:9px solid #301e30}
.companion{background:linear-gradient(165deg,#211326,#1a0e20)}
.compcard{border-radius:18px;border-color:#9b537c;box-shadow:inset 0 1px #f4accd24}
.compcard .smalltitle{color:#f7acd2}
.room-preview-icon{flex-basis:55px;width:55px;height:46px;padding:0;overflow:hidden;background:transparent}
.room-preview-icon .asset{width:100%;height:100%;overflow:hidden}
.room-preview-icon .asset img{object-fit:cover}
.composer>.primary{display:flex;flex-direction:column;gap:1px;align-items:center;justify-content:center;border-radius:50%;width:55px;height:52px}
.composer>.primary>.asset{width:27px;height:27px}
.composer>.primary .send-caption{display:none}
.headright .iconbutton .asset{width:20px;height:20px}
.quickactions .iconbutton .asset{height:22px;width:22px}
#kc-resize .asset{height:26px;width:26px}
@container (max-width:1150px){.kc-deco-left-top{left:-51px;top:54px;width:72px;height:75px}.kc-deco-right-top{right:64px;top:-23px;width:100px;height:65px}.kc-deco-right-top>.asset{width:102px;height:70px}.herocharms{margin-right:8px}.brandlockup{width:300px;flex-basis:300px}.brand-after-lockup{left:190px}}
@container (max-width:790px){.kc-deco-left-top,.kc-deco-left-bottom,.kc-deco-left-ribbon,.kc-deco-right-top{display:none}.brandlockup{width:270px;flex-basis:270px;height:82px;margin:0}.brand-after-lockup{left:175px;top:65px}.hero{min-height:82px}.herocharms{display:none}}
@container (max-width:620px){.brandlockup{width:205px;flex-basis:205px;height:68px}.brand-after-lockup{left:138px;top:56px}.brand-after-lockup .subrow small{font-size:9px}.hero{min-height:72px}.dragcue{display:none}}
/* Prevent logo caption overlap, preserve outside ornaments when close to a viewport edge. */
.brand-after-lockup{left:239px;top:98px}.brand-after-lockup .subrow small{font-size:11px;text-shadow:0 1px 4px #120513,0 2px 5px #150817}
.kc-deco-left-top{left:-58px;width:100px;height:101px}
.kc-deco-right-top{right:62px;top:-25px}
.kc-deco-right-top>.asset{filter:brightness(1.25) drop-shadow(0 0 4px #f47cb852)}
@container (max-width:1150px){.brand-after-lockup{left:220px;top:93px}.kc-deco-left-top{left:-34px;width:69px;height:69px}.kc-deco-right-top{right:63px;top:-17px}}
@container (max-width:790px){.brand-after-lockup{left:190px;top:70px}}
@container (max-width:620px){.brand-after-lockup{left:138px;top:56px}}



#kc-panel{overflow:visible}
.kc-deco-left-top,.kc-deco-left-bottom,.kc-deco-right-top{position:absolute;z-index:2;pointer-events:none;filter:drop-shadow(0 8px 18px #0008)}
.kc-deco-left-top{left:-94px;top:44px;width:92px;height:110px;display:flex;align-items:center;justify-content:center}
.kc-deco-left-top .asset{width:100%;height:100%}
.kc-deco-left-bottom{left:-4px;bottom:-7px;width:78px;height:78px;display:grid;place-items:end start;color:#24101c}
.kc-deco-left-bottom .kitty{font-size:54px;line-height:1;filter:drop-shadow(0 2px 2px #ff8fc155)}
.kc-deco-left-bottom .moon{position:absolute;left:40px;bottom:6px;font-size:15px;color:#ffc4df}
.kc-deco-left-ribbon{position:absolute;left:-7px;bottom:74px;width:43px;height:88px;z-index:2;pointer-events:none}
.kc-deco-left-ribbon::before{content:'🎀';position:absolute;left:0;top:-2px;font-size:38px;filter:drop-shadow(0 3px 4px #0007)}
.kc-deco-left-ribbon::after{content:'🔔';position:absolute;left:12px;bottom:-6px;font-size:28px;filter:drop-shadow(0 3px 4px #0007)}
.kc-deco-right-top{right:78px;top:-11px;width:90px;height:78px;display:flex;align-items:flex-start;justify-content:flex-end;gap:8px}
.kc-deco-right-top .asset{width:54px;height:54px;margin-top:-2px}
.kc-deco-right-top .catbubble{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:22px;background:linear-gradient(180deg,#2c1630,#1d101f);border:1px solid #89486f;box-shadow:inset 0 1px #ffb4d41f}
.kc-deco-right-top .catbubble span{font-size:34px;line-height:1;filter:drop-shadow(0 2px 2px #0007)}
.herocharms{display:flex;align-items:center;gap:7px;margin-right:6px;pointer-events:none}
.herocharm{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;color:#ffbada;text-shadow:0 1px 4px #000a;font-size:15px}
.herocharm.mini{font-size:13px;width:16px;height:16px}
.hero .pawfloat{position:absolute;right:190px;top:14px;color:#7b4566;font-size:22px;opacity:.7;pointer-events:none}
.hero .pawfloat2{position:absolute;right:255px;top:36px;color:#5f3552;font-size:15px;opacity:.7;pointer-events:none}
.titlewrap{display:flex;align-items:center;gap:8px}
.titlewrap .hearttitle{font-size:17px;color:#ff9ec8;text-shadow:0 2px 5px #6c1643}
.brandblock .subrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.brandblock .subrow small{font-size:12px;color:#f5c9dc;letter-spacing:.45px;line-height:1.25;display:block}
.rail{position:relative;overflow:visible}
.rail::before{content:'🔔';position:absolute;left:12px;top:8px;font-size:22px;filter:drop-shadow(0 2px 3px #0007)}
.rail::after{content:'✨';position:absolute;left:20px;bottom:10px;font-size:18px;color:#ffc2df;filter:drop-shadow(0 2px 3px #0007)}
.sidebar::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#ff94c9,transparent);opacity:.45}
.side-shell{position:relative}
.companion{position:relative}
.companion::before{content:'';position:absolute;right:8px;top:20px;width:58px;height:58px;border-radius:18px;background:radial-gradient(circle at 35% 35%,#3b223d,#201023);border:1px solid #84486e;opacity:.22}
.groupbar{align-items:center}
.groupbar .groupplus{margin-left:auto}
.compcard .smalltitle{display:flex;align-items:center;gap:6px}
.quickactions .iconbutton .labeltiny{display:block;font-size:10px;line-height:1;margin-top:2px}
@container (max-width:790px){.kc-deco-left-top,.kc-deco-left-bottom,.kc-deco-left-ribbon,.kc-deco-right-top{display:none}}


/* v0.6.2 — reference mockup layout match. Placed last to override old legacy rules. */
#kc-panel{border:2px solid #e77dad;border-radius:36px;box-shadow:0 0 0 2px #402034,0 0 20px #d460a754,0 22px 75px #000c;background:#170d1b}
#kc-panel .hero{height:102px;min-height:102px;max-height:102px;padding:0 18px;display:flex;align-items:center;border-bottom:1px solid #a2527b;background:linear-gradient(160deg,#30152d,#1d1024 72%);overflow:visible}
#kc-panel .brandlockup{position:absolute;left:7px;top:-21px;width:352px;height:125px;margin:0;z-index:6;flex:none}
#kc-panel .brandlockup .asset{width:100%;height:100%}
#kc-panel .brand-after-lockup{position:absolute;left:230px;top:85px;white-space:nowrap;z-index:7}
#kc-panel .brand-after-lockup .subrow small{font-size:11px;font-weight:600;color:#f4c1d8;letter-spacing:.2px}
#kc-panel .heroactions{margin-left:auto;align-self:center;z-index:7;position:relative;gap:10px}
#kc-panel .dragcue{border-radius:30px;border:1px solid #8f4c75;background:#2d1a2e80;color:#dba7c3;padding:6px 13px;font-size:11px}
#kc-panel .herocharms{display:flex;gap:9px;margin-right:20px}
#kc-panel .kc-deco-right-top{right:78px;top:-31px;height:103px;width:156px;z-index:8}
#kc-panel .kc-deco-right-top>.asset{height:99px;width:147px}
#kc-panel .kc-deco-left-top{left:-45px;top:35px;width:83px;height:88px;z-index:8}
#kc-panel .kc-deco-left-ribbon{left:-27px;bottom:92px;width:88px;height:160px;z-index:8}
#kc-panel .kc-deco-left-bottom{left:-17px;bottom:-13px;width:146px;height:128px;z-index:8}
#kc-panel .workspace{grid-template-columns:82px 337px minmax(0,1fr);background:#211225;overflow:hidden;min-height:0;border-radius:0 0 31px 31px}
#kc-panel .rail{background:#201023;padding:16px 9px 15px;gap:6px;border-right:1px solid #733b5c}
#kc-panel .railtab{min-height:79px;border-radius:18px;padding:8px 3px;gap:4px}
#kc-panel .railtab .ic .asset{width:32px;height:32px}
#kc-panel .railtab .tx{font-size:13px}
#kc-panel .railtab.active{background:linear-gradient(150deg,#fa84bb,#c83a85);box-shadow:0 0 15px #fa72b393,inset 0 0 0 1px #ffd1e2;border:1px solid #ffd2e5}
#kc-panel .sidebar{border-right:1px solid #8f426d;background:linear-gradient(180deg,#2e182f,#1f1024)}
#kc-panel .side-shell{display:flex;flex-direction:column;gap:11px;padding:12px 10px 10px;height:100%;min-height:0}
#kc-panel .side-card{padding:12px;border-radius:18px;border:1px solid #a75884;flex:0 0 auto;background:linear-gradient(145deg,#573052,#321b37)}
#kc-panel .side-card-title{color:#ff93c7;font-size:15px}
#kc-panel .side-card .muted{font-size:12px;color:#f5ccdf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#kc-panel .hero-heart{font-size:24px;color:#ff8cb8}
#kc-panel .side-search .search{padding:11px 40px 11px 13px;font-size:13px;background:#231427;border:1px solid #8a5176}
#kc-panel .side-search{order:2}
#kc-panel .side-filters{order:1;gap:6px}
#kc-panel .side-filters .filterbtn{font-size:12px;border-radius:18px;min-width:0;padding:8px 2px}
#kc-panel .side-filters .filterbtn.active{background:linear-gradient(#ff96c5,#ed609e);border-color:#ffb5d4;box-shadow:0 2px 8px #ed6aaa40}
#kc-panel .contacts-scroll{order:3;flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#9c527d transparent}
#kc-panel .side-list{display:flex;flex-direction:column;flex:none;padding:0;gap:3px;overflow:visible}
#kc-panel .contact{flex:0 0 auto;min-height:58px;padding:7px 6px;border:1px solid transparent;border-bottom-color:#7e416643;border-radius:13px;background:transparent}
#kc-panel .contact.active{border-color:#ba5986;background:linear-gradient(145deg,#733457,#3e223f);box-shadow:inset 0 0 0 1px #ea7cad15}
#kc-panel .contact .avatar{width:44px;height:44px;flex-basis:44px;border-color:#c876a5}
#kc-panel .contact .nameline{font-size:13px;color:#fff1f8}
#kc-panel .contact .preview{font-size:12px;color:#e3c0d3}
#kc-panel .contact .presence{width:9px;height:9px;flex:0 0 9px;margin-left:0}
#kc-panel .contact .tiny-pill{background:#f44f95;color:white;box-shadow:0 1px 3px #0005}
#kc-panel .groupbar{display:flex;align-items:center;gap:5px;margin:12px 2px 8px;padding:3px 0}
#kc-panel .groupbar b{color:#ff91c9;font-weight:900;font-size:15px}
#kc-panel .group-plus{font-weight:750;border:1px solid #ffb1d7;background:#f07ab1;color:#2a0e1f;border-radius:18px;padding:7px 11px;white-space:nowrap;font-size:11px}
#kc-panel .group-stack{max-height:none;gap:6px;margin-bottom:9px}
#kc-panel .group-item{min-height:56px;border:1px solid #7c4167;border-radius:12px;background:#301a30}
#kc-panel .group-item .group-avatar{width:43px;height:43px;font-size:25px;flex:0 0 43px}
#kc-panel .new-kitty{order:4;border-radius:18px;background:#2c1a2f;color:#f2b8d5;border:1px solid #87416d;padding:7px 10px;font-size:12px}
#kc-panel .main{background:#201225;min-height:0}
#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 285px;height:100%;min-height:0}
#kc-panel .chatcenter{background:#1c1021;min-height:0}
#kc-panel .chathead{min-height:73px;height:73px;flex:none;margin:6px 6px 0;border-radius:17px;border:1px solid #8f4b74;background:linear-gradient(180deg,#331c32,#24152a);padding:10px 12px}
#kc-panel .chathead .avatar{width:48px;height:48px;flex-basis:48px}
#kc-panel .headtitle{font-size:17px;font-weight:900;color:#ffe1ee}
#kc-panel .headsubtitle{color:#e8c3d8;font-size:12px;line-height:1.3}
#kc-panel .headright{flex-wrap:nowrap;gap:6px}
#kc-panel .headright .iconbutton{width:35px;height:36px;border-radius:12px;border:1px solid #8b496d}
#kc-panel .msglog{padding:12px 18px 15px;gap:9px;background-color:#23132b;background-image:linear-gradient(180deg,#1d0e23b5 0%,#1b0d1d66 46%,#150c20ab 100%),url('${imgUrl('kitty-den-painted.png')}');background-repeat:no-repeat;background-size:cover,cover;background-position:center center;scrollbar-width:thin;scrollbar-color:#c56c9a transparent}
#kc-panel .kc-date-divider{display:flex;align-items:center;gap:16px;text-align:center;color:#f8d8e8;font-size:12px;flex:0 0 auto;padding:4px 0 7px}
#kc-panel .kc-date-divider:before,#kc-panel .kc-date-divider:after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,#d46b9c88,transparent)}
#kc-panel .msgrow{max-width:94%;gap:8px;flex:none}
#kc-panel .msgavatar .avatar{height:42px;width:42px;flex-basis:42px;border:2px solid #b66290}
#kc-panel .msgcol{max-width:min(100%,430px);gap:2px}
#kc-panel .msgbubble{font-size:14px;line-height:1.42;padding:10px 14px;max-width:100%;border:1px solid #895172;border-radius:17px 18px 18px 6px;background:linear-gradient(150deg,#2d1b2ddf,#1a1124f2);color:#fff4fb;box-shadow:0 2px 8px #12061c60}
#kc-panel .msgrow.mine .msgbubble{background:linear-gradient(160deg,#ff9dc7,#f078ae);color:#311224;border-color:#ffadd2;border-radius:17px 17px 6px 17px;box-shadow:0 3px 13px #3a112755}
#kc-panel .msgrow.mine .msgbubble:after{border-left-color:#f07ead}
#kc-panel .msgmeta{font-size:11px;color:#e8c8df;padding:1px 6px}
#kc-panel .mine .msgmeta{color:#ffbadb}
#kc-panel .msgrow:has(.msgsticker) .msgbubble{padding:4px;background:transparent;border-color:transparent;box-shadow:none}
#kc-panel .msgrow:has(.msgsticker) .msgbubble:after{display:none}
#kc-panel .msgsticker{width:120px;height:112px}
#kc-panel .quick{order:3;padding:4px 12px 7px;min-height:35px;border:0;background:#2b172c}
#kc-panel .quick .pill{font-size:11px;padding:5px 12px;border-radius:14px;background:#412441;border:1px solid #8d4e79}
#kc-panel .composer{order:2;grid-template-columns:55px 40px minmax(0,1fr) 58px;min-height:66px;padding:8px 12px 5px;gap:8px;background:#2a172a;border-top:1px solid #94527b}
#kc-panel .composer .mode{width:55px;height:43px;max-width:55px;padding:4px;border-radius:17px;font-size:10px;color:#f9d4e8}
#kc-panel .composer .sticker-toggle{width:40px;height:40px;border-radius:50%;border:1px solid #a65d83}
#kc-panel .composer .field{height:42px;min-height:42px;background:#241529;color:#ffe2ee;border-color:#9b507a;padding:9px 14px;font-size:13px;border-radius:24px}
#kc-panel .composer>.primary{width:52px;min-width:52px;height:52px;border:1px solid #ffe0e8;border-radius:50%;background:linear-gradient(145deg,#ff8dbe,#e75d9e);box-shadow:0 0 10px #ff68ad61}
#kc-panel .companion{padding:10px;gap:9px;border-left:1px solid #8b486e;background:linear-gradient(180deg,#2c1831,#1b1021)}
#kc-panel .compcard{border-radius:18px;padding:10px 11px;background:linear-gradient(170deg,#2f1a32,#1d1125);border:1px solid #864b72;box-shadow:inset 0 1px #e78dc31c}
#kc-panel .profilehero .avatar{width:100px;height:100px;border:2px solid #fa92c1;box-shadow:0 0 0 3px #723855;margin:0 auto 5px}
#kc-panel .profilename{font-size:16px;color:#ffe0f0;font-weight:900}
#kc-panel .statusline{color:#e7c0d5;font-size:12px}
#kc-panel .profilebuttons{margin-top:9px;gap:5px;flex-wrap:nowrap}
#kc-panel .profilebuttons .secondary{font-size:11px;padding:8px 10px}
#kc-panel .profilebuttons .iconbutton{height:33px;width:33px}
#kc-panel .stickerwall .smalltitle,#kc-panel .roompreview .smalltitle,#kc-panel .actioncard .smalltitle{font-size:13px;margin:0 0 9px;color:#ffb5db}
#kc-panel .stickergrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
#kc-panel .stickertile{background:#2c1c2d;border-radius:10px;aspect-ratio:1/1;max-height:67px;border:1px solid #754264}
#kc-panel .roompreview-name{font-size:12px}
#kc-panel .room-preview-icon{width:56px;height:50px;flex:0 0 56px}
#kc-panel .quickactions .iconbutton{min-height:40px;border-radius:12px}
#kc-panel #kc-resize{z-index:12}
@container (max-width:1130px){#kc-panel .workspace{grid-template-columns:70px 260px minmax(0,1fr)}#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 230px}#kc-panel .companion{padding:7px}#kc-panel .profilehero .avatar{width:77px;height:77px}#kc-panel .brandlockup{width:305px;height:106px}#kc-panel .brand-after-lockup{left:208px;top:80px}}
@container (max-width:920px){#kc-panel .workspace{grid-template-columns:66px 238px minmax(0,1fr)}#kc-panel .chatlayout{grid-template-columns:1fr}#kc-panel .companion{display:none}#kc-panel .kc-deco-right-top{display:none}}
@container (max-width:740px){#kc-panel .workspace{grid-template-columns:56px minmax(0,1fr)}#kc-panel .sidebar{display:none}#kc-panel .sidebar.compact-open{display:flex}#kc-panel .hero{height:80px;min-height:80px}#kc-panel .brandlockup{width:250px;height:84px;top:-7px}#kc-panel .brand-after-lockup{left:178px;top:62px}#kc-panel .herocharms,#kc-panel .dragcue{display:none}#kc-panel .kc-deco-left-top,#kc-panel .kc-deco-left-ribbon,#kc-panel .kc-deco-left-bottom{display:none}#kc-panel .chathead{margin:3px 3px 0;padding:6px}#kc-panel .chathead .avatar{width:35px;height:35px;flex-basis:35px}#kc-panel .msglog{padding:9px}#kc-panel .composer{grid-template-columns:58px 40px 1fr 50px;grid-template-areas:none}#kc-panel .composer .mode{grid-area:auto}#kc-panel .composer .sticker-toggle{grid-area:auto}#kc-panel .composer .field{grid-area:auto}#kc-panel .composer>.primary{grid-area:auto;width:47px;min-width:47px;height:47px}}
@container (max-width:470px){#kc-panel .workspace{grid-template-columns:48px minmax(0,1fr)}#kc-panel .railtab .ic .asset{width:22px;height:22px}#kc-panel .railtab .tx{font-size:9px}#kc-panel .chathead .headright .iconbutton:nth-child(3),#kc-panel .chathead .headright .iconbutton:nth-child(4){display:none}#kc-panel .composer{grid-template-columns:48px 36px minmax(0,1fr) 44px;gap:4px;padding:5px}#kc-panel .composer .field{font-size:12px;padding:6px 8px}#kc-panel .composer>.primary{height:44px;width:44px;min-width:44px}}


/* Keep grid placement correct when the viewport is narrower than 930px.
   Old Lian-like responsive rules had accidentally stacked main on top of sidebar. */
#kc-panel .workspace:not(.wide) .main{grid-column:3}
#kc-panel .workspace.wide .main{grid-column:2}
@container (max-width:740px){#kc-panel .workspace:not(.wide) .main{grid-column:2}}

.kc-profile-backdrop{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#110814cc;z-index:80;padding:24px}.kc-profile-backdrop.hidden{display:none}.kc-pawmodal,.kc-pawviewer{position:relative;background:linear-gradient(180deg,#311735,#201124);border:1px solid #a95d87;box-shadow:0 18px 60px #000b,inset 0 1px 0 #ffd3e355;border-radius:24px;color:#fff4fb}.kc-pawmodal{width:min(620px,calc(100% - 20px));padding:24px}.kc-pawviewer{width:min(700px,calc(100% - 20px));max-height:calc(100% - 20px);overflow:auto}.kc-pawmodal-close{position:absolute;right:16px;top:14px;border:0;background:transparent;color:#ffd1e6;font-size:28px;line-height:1;cursor:pointer}.kc-pawmodal-title,.kc-pawviewer-title{font-weight:900;font-size:18px;color:#fff}.kc-share-row{display:flex;gap:16px;align-items:center;margin:18px 0}.kc-share-row .avatar.large{width:82px;height:82px;flex-basis:82px}.kc-share-copy b{display:block;font-size:22px;margin-bottom:6px}.kc-share-copy p{margin:0;color:#e9c5d8;line-height:1.45}.kc-share-preview{border:1px solid #8d4e72;border-radius:18px;padding:14px;background:linear-gradient(180deg,#ffffff08,#00000010)}.kc-share-preview-label{font-size:12px;color:#ffbad8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}.kc-share-preview-card{border-radius:16px;padding:14px;background:linear-gradient(180deg,#4a2447,#2e1631)}.kc-share-preview-name{font-size:20px;font-weight:800}.kc-share-preview-status{margin-top:6px;color:#f8cbe1}.kc-pawmodal-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:18px}.kc-share-confirm{min-width:180px}.kc-pawviewer-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #9d557a;background:linear-gradient(180deg,#2f1533,#241126);z-index:2}.kc-pawviewer-body{padding:18px}.kc-pawhero{position:relative;border-radius:22px;overflow:hidden;min-height:240px;background:#241228;border:1px solid #8f4c72;box-shadow:inset 0 1px #ffcae04a}.kc-pawhero img{width:100%;height:260px;object-fit:cover;display:block}.kc-pawhero-fallback{height:260px;background:radial-gradient(circle at 30% 20%,#ffb3d6,#7e4369 48%,#281329 100%)}.kc-pawhero-overlay{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:flex-end;gap:18px;padding:20px;background:linear-gradient(180deg,transparent,#170b19d9 45%,#170b19f0)}.kc-pawhero .avatar.hero{width:112px;height:112px;flex-basis:112px;border:3px solid #f68fbf;box-shadow:0 0 0 4px #6f3556}.kc-pawhero-meta{min-width:0;flex:1;padding-bottom:6px}.kc-pawhero-name{font-size:28px;font-weight:900;line-height:1.1}.kc-pawhero-sub{display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:#f8d7e7;margin-top:8px;font-size:15px}.kc-statusdot{width:14px;height:14px;border-radius:50%;display:inline-block;background:#8d7a87;box-shadow:0 0 0 2px #251027}.kc-statusdot.on{background:#61dd7a}.kc-memberno{margin-left:auto;color:#f1c6db}.kc-pawquote{margin-top:18px;border:1px solid #8f4c72;border-radius:18px;padding:16px 18px;background:linear-gradient(180deg,#401d42,#2b1530);font-size:16px;color:#ffe5f1}.kc-pawsection{margin-top:18px;border:1px solid #8f4c72;border-radius:20px;padding:16px;background:linear-gradient(180deg,#2f1632,#211126)}.kc-pawsection-title{font-size:16px;font-weight:900;color:#ffd0e6;margin-bottom:12px}.kc-pawfacts{display:flex;flex-direction:column;gap:10px}.kc-pawfact{display:grid;grid-template-columns:30px 128px minmax(0,1fr);gap:10px;align-items:start}.kc-pawfact-icon{font-size:20px;line-height:1}.kc-pawfact-label{font-weight:800;color:#ffd8ea}.kc-pawfact-value{color:#fff4fb;line-height:1.45}.kc-pawgallery{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.kc-pawgallery-item{aspect-ratio:1/1;border-radius:16px;overflow:hidden;border:1px solid #9f5d81;background:#241228}.kc-pawgallery-item img{width:100%;height:100%;object-fit:cover;display:block}@media (max-width:780px){.kc-pawhero img,.kc-pawhero-fallback{height:210px}.kc-pawhero .avatar.hero{width:88px;height:88px;flex-basis:88px}.kc-pawhero-name{font-size:22px}.kc-pawfact{grid-template-columns:26px 90px minmax(0,1fr)}.kc-pawgallery{grid-template-columns:repeat(2,minmax(0,1fr))}.kc-share-row{align-items:flex-start;flex-direction:column}}


/* Unlimited local chat archive navigation. IndexedDB data is paginated. */
#kc-panel .kc-history-older{align-self:center;display:block;width:max-content;max-width:95%;margin:4px auto 12px;padding:8px 18px;border:1px solid #d67bb0;border-radius:20px;background:linear-gradient(155deg,#613250,#39203a);color:#ffe1f2;font-weight:800;font-size:12px;cursor:pointer;box-shadow:0 2px 9px #12051970}
#kc-panel .kc-history-older:hover{background:#8a466f}
#kc-panel .kc-archive-state{text-align:center;color:#f2c2dd;font-size:12px;padding:9px}

/* v0.7.35: native message reactions, inbox, group receipts, radar, scrapbook */
#kc-panel .kc-inbox-filters{overflow-x:auto;flex-shrink:0;scrollbar-width:thin;gap:5px}
#kc-panel .kc-inbox-filters .filterbtn{flex:0 0 auto;white-space:nowrap;padding:7px 9px;font-size:11px}
#kc-panel .kc-inbox-tools{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
#kc-panel .kc-inbox-tools button{font-size:11px;padding:5px 8px;min-width:0}
#kc-panel .kc-reply-banner{display:flex;align-items:center;justify-content:space-between;padding:7px 15px;border-top:1px solid #984b7a;background:#462144;color:#ffe0ec;font-size:12px;gap:10px}
#kc-panel .kc-reply-banner.hidden{display:none}
#kc-panel .kc-reply-banner .iconbutton{width:25px;height:25px;flex:0 0 25px;font-size:12px}
#kc-panel .kc-message-reply{display:block;text-align:left;max-width:100%;padding:5px 10px;margin-bottom:7px;background:#ffffff12;border:0;border-left:3px solid #f4a1c5;border-radius:7px;color:inherit;font-size:11px;overflow-wrap:anywhere}
#kc-panel .kc-message-reply span{font-weight:800;color:#ffbbd9}
#kc-panel .msgrow.mine .kc-message-reply span{color:#7b2e62}
#kc-panel .kc-message-actions{display:inline-flex;gap:3px}
#kc-panel .kc-message-actions button{padding:0 4px;min-width:14px}
#kc-panel .kc-reaction-list{display:flex;flex-wrap:wrap;gap:5px;margin:3px 0}
#kc-panel .kc-reaction-chip{font-size:12px;padding:3px 8px;border-radius:14px;background:#3c1d3f;border:1px solid #ba6993;color:#ffe9f3}
#kc-panel .kc-reaction-chip.mine{background:#a15180;border-color:#ffb7d3}
#kc-panel .kc-highlight-message .msgbubble{outline:2px solid #fa9fc4}
#kc-panel .kc-room-radar{margin-top:10px;padding:12px;border:1px solid #8e5178;background:#25152c;border-radius:15px}
#kc-panel .kc-room-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
#kc-panel .kc-room-chips button,#kc-panel .kc-room-recent{font-size:11px;padding:5px 8px;border-radius:10px}
#kc-panel .kc-room-recent{background:#ffffff10}
#kc-panel .kc-roomcard-title{display:flex;justify-content:space-between;align-items:center;gap:5px}
#kc-panel .kc-room-star{font-size:24px;color:#ffbfdd;line-height:1;background:transparent;border:0;padding:0 5px}
#kc-panel .kc-moments-grid{margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px}
#kc-panel .kc-moment-card{position:relative;background:linear-gradient(160deg,#4a2347,#26152b);border:1px solid #bb729a;border-radius:20px;padding:15px;box-shadow:0 4px 20px #0003}
#kc-panel .kc-moment-title{font-weight:900;font-size:17px;color:#ffd4e8;padding-right:27px}
#kc-panel .kc-moment-decor{position:absolute;right:12px;top:8px;font-size:27px;color:#ffaccf}
#kc-panel .kc-moment-card blockquote{white-space:pre-wrap;overflow-wrap:anywhere;max-height:190px;overflow:auto;margin:10px 0;color:#ffe1ef;font-size:13px;border-left:2px solid #e98eb7;padding-left:10px}
#kc-panel .kc-moment-card img{max-width:100%;max-height:150px;object-fit:cover;border-radius:12px;margin-top:10px}
#kc-panel .kc-moment-card .flex{margin-top:12px}
#kc-panel .kc-role-toggle{font-size:10px;background:#6d3c6a;color:#ffe8f3;border:1px solid #c481a9;border-radius:7px;padding:3px 5px;margin-top:4px}
#kc-panel .group-details .secondary{font-size:11px;padding:7px;margin:4px 0}


/* Interactive performance: promote the whole window to one compositor layer
   only for the duration of its drag. No appearance or hit targets are changed. */
#kc-panel.kc-moving{will-change:transform;touch-action:none}
#kc-panel.kc-resizing{touch-action:none}
#kc-fab.kc-moving{will-change:transform;transition:none!important;filter:drop-shadow(0 7px 8px #190b24ae)}
/* Final reference-image alignment: header, decorative frame and launcher visibility. */
#kc-panel:before,#kc-panel:after{display:none}
#kc-panel .brandlockup{top:-38px}
#kc-panel .brand-after-lockup{left:252px;top:85px}
#kc-panel .dragcue{position:absolute;right:190px;top:34px;white-space:nowrap}
#kc-panel .herocharms{margin-right:32px}
#kc-panel .kc-deco-right-top{right:80px;top:-36px}
#kc-panel .msglog .msgrow.mine .msgcol{align-items:flex-end}
#kc-panel .msglog .msgrow.other .msgcol{align-items:flex-start}
@container (max-width:1130px){#kc-panel .brand-after-lockup{left:218px;top:79px}#kc-panel .dragcue{right:152px}}
@container (max-width:740px){#kc-panel .brandlockup{top:-7px}#kc-panel .brand-after-lockup{display:none}#kc-panel .dragcue{display:none}}


/* Kittychat v0.7: closer to concept-art proportions and tactile, ornamental surfaces. */
#kc-panel{border:2px solid #bb5b87!important;border-radius:38px 35px 27px 27px!important;box-shadow:0 0 0 3px #160a1b,0 0 0 5px #713257,0 25px 68px #000e,inset 0 0 0 1px #ff8ac65e!important;background:#1a0d1d!important}
#kc-panel::before,#kc-panel::after{display:block!important;position:absolute!important;left:30px!important;right:30px!important;z-index:2!important;pointer-events:none!important;opacity:.62!important}
#kc-panel::before{top:-19px!important;background-image:url(${imgUrl('frame-top.svg')})!important}
#kc-panel::after{bottom:-15px!important;background-image:url(${imgUrl('frame-bottom.svg')})!important}
#kc-panel .companion::before{display:none!important;content:none!important}
#kc-panel .side-search{order:2!important}
#kc-panel .side-filters{order:3!important}
#kc-panel .hero{height:121px!important;min-height:121px!important;max-height:121px!important;border-bottom:0!important;background:linear-gradient(180deg,#200e20 12%,#2b1329 90%)!important;border-radius:35px 35px 0 0!important;box-shadow:inset 0 1px #ffb9d34b}
#kc-panel .hero::after{bottom:0;height:2px!important;opacity:.9!important;background:linear-gradient(90deg,#ae527b,#e47aaa,#713256)!important}
#kc-panel .brandlockup{position:absolute!important;top:-43px!important;left:36px!important;width:353px!important;height:146px!important;z-index:5;filter:drop-shadow(0 7px 7px #0009)}
#kc-panel .brand-after-lockup{position:absolute!important;left:240px!important;top:95px!important;white-space:nowrap;z-index:7}
#kc-panel .brand-after-lockup small{font-size:12px!important;color:#f9d2e5!important;letter-spacing:.1px!important;text-shadow:0 2px 3px #000b}
#kc-panel .dragcue{right:290px!important;top:55px!important;position:absolute!important;padding:5px 28px!important;border:1px solid #693357!important;box-shadow:inset 0 0 8px #8a3b693a!important;border-radius:26px!important;background:#2a182dcf!important}
#kc-panel .herocharms{margin-right:78px!important;gap:10px!important}
#kc-panel .closekitty{height:51px!important;width:51px!important;border-radius:16px!important;border:2px solid #ffc2dd!important;box-shadow:0 0 10px #ed6aa9aa,inset 0 1px 8px #ffb6d464!important}
#kc-panel .kc-deco-left-top{top:60px!important;left:-120px!important;width:124px!important;height:105px!important}
#kc-panel .kc-deco-left-ribbon{top:10px!important;left:-15px!important;width:116px!important;height:113px!important}
#kc-panel .kc-deco-left-bottom{left:-22px!important;bottom:-10px!important;width:130px!important;height:148px!important}
#kc-panel .kc-deco-right-top{right:92px!important;top:-31px!important;width:162px!important;height:97px!important}
#kc-panel .kc-deco-right-top>.asset{width:160px!important;height:105px!important}
#kc-panel .workspace{background:#160d1b!important;grid-template-columns:94px 346px minmax(0,1fr)!important;gap:0!important;border-radius:0 0 25px 25px!important;overflow:hidden!important}
#kc-panel .rail{padding:42px 7px 8px!important;background:linear-gradient(180deg,#25142a,#180c21)!important;border-right:2px solid #793758!important;gap:6px!important}
#kc-panel .railtab{min-height:80px!important;border-radius:21px!important;color:#e2b7d6!important;gap:3px!important}
#kc-panel .railtab.active{border-radius:22px!important;background:linear-gradient(165deg,#f88ac0,#e74e9a)!important;box-shadow:0 0 0 2px #78294c,0 0 16px #ff4f9b88!important;color:#fff!important;border:2px solid #ffc1df!important}
#kc-panel .railtab .ic .asset{width:34px!important;height:34px!important}
#kc-panel .railtab .tx{font-size:13px!important;font-weight:750!important}
#kc-panel .sidebar{background:linear-gradient(180deg,#26142a,#1c0e20)!important;border-right:2px solid #7b3c61!important}
#kc-panel .side-shell{padding:15px 11px 11px!important;gap:11px!important}
#kc-panel .side-card{padding:13px!important;min-height:125px!important;border:1px solid #9d4f78!important;background:radial-gradient(ellipse at 44% 0,#7a3a6277,transparent 70%),#311c34!important;border-radius:19px!important}
#kc-panel .side-card-title{font-weight:850!important;font-size:15px!important;color:#fd72b3!important}
#kc-panel .side-mainline{margin-top:8px!important}
#kc-panel .side-mainline .avatar{width:60px!important;height:60px!important;flex-basis:60px!important}
#kc-panel .side-search .search{border-radius:23px!important;background:#24132a!important;border:1px solid #8b486c!important;box-shadow:inset 0 2px 6px #0009!important;height:42px!important;font-size:13px!important}
#kc-panel .filterbtn{min-height:38px!important;background:#231329!important;border:1px solid #82466a!important}
#kc-panel .filterbtn.active{background:linear-gradient(180deg,#f99dc6,#f36ca7)!important;color:#250a20!important}
#kc-panel .contact{min-height:68px!important;padding:7px 9px!important;gap:9px!important;border:1px solid transparent!important;border-bottom-color:#6130547a!important;border-radius:14px!important}
#kc-panel .contact.active{border:1px solid #9e4d78!important;background:linear-gradient(90deg,#824063bb,#522b4bb3)!important;box-shadow:inset 0 0 14px #f385aa28!important}
#kc-panel .contact .avatar{width:50px!important;height:50px!important;flex-basis:50px!important}
#kc-panel .contact .nameline{font-size:14px!important;color:#fff0f8!important}
#kc-panel .contact .preview{font-size:12px!important;color:#e5bdd6!important}
#kc-panel .groupbar{border-top:1px solid #70345d70!important;padding-top:12px!important;margin-top:5px!important}
#kc-panel .groupbar b{font-size:15px!important;color:#ff77b7!important}
#kc-panel .group-item{min-height:70px!important;border-radius:15px!important;background:transparent!important;border-bottom:1px solid #69345980!important}
#kc-panel .group-item.active{background:#6b365599!important}
#kc-panel .new-kitty{border:1px solid #8b456b!important;border-radius:14px!important;background:#3a1e34!important;color:#fbd6eb!important}
#kc-panel .main{background:#1b0e20!important;overflow:hidden!important}
#kc-panel .chatlayout{height:100%!important;grid-template-columns:minmax(0,1fr) 307px!important;gap:0!important}
#kc-panel .chatcenter{margin:10px 7px 7px 9px!important;border:1px solid #81456b!important;border-radius:21px!important;overflow:hidden!important;box-shadow:inset 0 0 9px #0006!important}
#kc-panel .chathead{height:80px!important;min-height:80px!important;padding:9px 16px!important;background:linear-gradient(180deg,#2c1a30e8,#24132aee)!important;border-bottom:1px solid #713f68!important;margin:0!important;border-radius:20px 20px 0 0!important;box-shadow:none!important}
#kc-panel .chathead .avatar{width:59px!important;height:59px!important;flex-basis:59px!important;border:2px solid #7e4776!important}
#kc-panel .headtitle{font-size:18px!important}
#kc-panel .headsubtitle{font-size:12px!important;color:#d9b8cf!important}
#kc-panel .headright .iconbutton{width:42px!important;height:42px!important;border-radius:12px!important;border:1px solid #7e4569!important;background:#29182e!important}
#kc-panel .msglog{background-color:#1b1220!important;background-image:linear-gradient(180deg,#140a1aa1,#21101b82 48%,#1b0b19ae),url(${imgUrl('kitty-den-painted.png')})!important;background-size:cover,cover!important;background-position:center,center 46%!important;padding:15px 20px 16px!important;gap:12px!important}
#kc-panel .kc-date-divider{margin:5px 0 9px!important;font-size:12px!important;color:#ffd8ec!important}
#kc-panel .msgrow{gap:9px!important;max-width:97%!important}
#kc-panel .msgavatar .avatar{width:48px!important;height:48px!important;flex-basis:48px!important;border:2px solid #8d5075!important}
#kc-panel .msgcol{max-width:calc(100% - 62px)!important;gap:2px!important}
#kc-panel .msgbubble{background:#241425ee!important;border:1px solid #8b456e!important;border-radius:21px 22px 20px 8px!important;color:#fff0f8!important;font-size:14px!important;line-height:1.55!important;padding:10px 15px!important;max-width:440px!important;box-shadow:0 6px 13px #09030a91!important}
#kc-panel .mine .msgbubble{background:linear-gradient(165deg,#ff91bc,#f173a7)!important;border:1px solid #ffb0d4!important;border-radius:22px 21px 7px 20px!important;color:#321029!important;box-shadow:0 6px 16px #160713a6!important}
#kc-panel .msgmeta{font-size:11px!important;color:#dbafc7!important}
#kc-panel .mine .msgmeta{color:#ffc2dc!important}
#kc-panel .msgsticker{width:155px!important;height:150px!important}
#kc-panel .composer{display:grid!important;grid-template-columns:42px 78px minmax(0,1fr) 57px!important;gap:7px!important;padding:9px 11px!important;background:linear-gradient(180deg,#2b1530,#1c0e23)!important;min-height:76px!important;order:2!important}
#kc-panel .composer .kc-add{grid-column:1!important;width:43px!important;height:43px!important;border-radius:50%!important;border:2px solid #be6393!important;font-size:27px!important;background:linear-gradient(180deg,#502944,#2d1730)!important;line-height:1!important}
#kc-panel .composer .mode{grid-column:2!important;width:77px!important;height:42px!important;border-radius:18px!important;background:#28132a!important;border-color:#834468!important;padding:3px!important;font-size:11px!important}
#kc-panel .composer #kc-compose{grid-column:3!important;min-height:43px!important;height:43px!important;border-radius:23px!important;background:#24132a!important;border:1px solid #955477!important;line-height:25px!important;padding:8px 14px!important;font-size:13px!important}
#kc-panel .composer>.primary{grid-column:4!important;height:55px!important;width:55px!important;min-width:55px!important;border:2px solid #ffd5e8!important;border-radius:50%!important;background:linear-gradient(155deg,#f7a2c9,#ed4c97)!important;box-shadow:0 0 0 2px #712b58,0 0 13px #fc75b395!important}
#kc-panel .quick{order:3!important;min-height:40px!important;max-height:42px!important;padding:3px 10px 7px!important;gap:7px!important;background:#231125!important}
#kc-panel .quick .pill{font-size:11px!important;border-radius:30px!important;border-color:#854167!important;background:#44223e!important}
#kc-panel .companion{background:linear-gradient(180deg,#211324,#170c1b)!important;border-left:0!important;padding:10px 8px 7px 0!important;gap:9px!important;overflow:auto!important}
#kc-panel .compcard{background:linear-gradient(150deg,#2c1730,#1a0f20)!important;border:1px solid #8a476c!important;border-radius:17px!important;padding:11px 12px!important;box-shadow:inset 0 1px #ff98c819!important}
#kc-panel .profilehero{padding:11px 10px 9px!important;text-align:center!important;flex:none!important}
#kc-panel .kitty-profile-avatar{position:relative;width:max-content;margin:0 auto 7px}
#kc-panel .kitty-profile-avatar .avatar{height:112px!important;width:112px!important;border:3px solid #d66d9e!important;box-shadow:0 0 0 3px #6b3255,0 4px 18px #0007!important;font-size:58px!important}
#kc-panel .kitty-heartbadge{position:absolute;right:-7px;bottom:-4px;background:linear-gradient(160deg,#f48fc1,#d75b98);border:2px solid #fac7df;color:white;font-size:22px;line-height:1;width:35px;height:35px;display:grid;place-items:center;border-radius:50%}
#kc-panel .profilename{font-size:18px!important;color:#ffe4f1!important}
#kc-panel .profile-number{font-size:12px;color:#f6bcdc;margin-top:1px}
#kc-panel .profilehero .statusline{font-size:12px!important;max-width:230px;margin:5px auto 8px;line-height:1.35!important;color:#e8c5db!important}
#kc-panel .profilebuttons{display:flex!important;gap:7px!important;margin:8px 0 9px!important}
#kc-panel .profilebuttons .profile-action{display:inline-flex;align-items:center;gap:5px;padding:6px 11px!important;height:38px!important;font-size:12px!important}
#kc-panel .profilebuttons .profile-action .asset{width:19px!important;height:19px!important}
#kc-panel .profilebuttons .iconbutton{width:39px!important;height:38px!important;font-size:18px!important}
#kc-panel .profile-tools{display:flex;gap:7px;width:100%}
#kc-panel .whisper-cta{flex:1;min-width:0;min-height:39px;border:1px solid #fca2cc;color:#fff;font-weight:850;background:linear-gradient(175deg,#fd91bd,#dd5793);border-radius:11px;box-shadow:inset 0 2px #ffcdf454;cursor:pointer}
#kc-panel .whisper-switch{width:41px;border:1px solid #f39ec8;border-radius:12px;background:linear-gradient(180deg,#f47fb5,#d95998);color:white;font-size:18px;cursor:pointer}
#kc-panel .compcard .smalltitle{font-size:14px!important;color:#ffbbdb!important;margin:0 0 8px!important;font-weight:850!important}
#kc-panel .compcard .smalltitle .asset{width:18px;height:18px}
#kc-panel .featured-sticker{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:105px;gap:3px;color:#f1c4dd;font-size:11px}
#kc-panel .featured-sticker .asset{height:84px;width:110px}
#kc-panel .stickergrid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important;margin-top:6px}
#kc-panel .stickertile{max-height:50px!important;min-height:43px!important;border-radius:10px!important;background:#31192e!important}
#kc-panel .roompreview-row{gap:7px!important}
#kc-panel .room-preview-icon{width:65px!important;height:52px!important;flex-basis:65px!important}
#kc-panel .room-join{flex:none;padding:7px 9px;border-radius:10px;background:#6c2f56;border:1px solid #bc6993;color:#fbd3e9;font-size:11px;font-weight:800;cursor:pointer}
#kc-panel .quickactions .iconbutton{min-height:65px!important;height:65px!important;display:flex!important;flex-direction:column!important;gap:2px!important;font-size:20px!important;border-radius:13px!important;justify-content:center!important}
#kc-panel .quickactions .iconbutton small{font-size:11px!important;color:#eec0d6;font-weight:500}
#kc-panel #kc-resize{width:43px!important;height:43px!important;border-radius:13px 0 24px 0!important}
/* Fine-tune density so first and last messages are visible together in a typical desktop den. */
#kc-panel .msglog{gap:7px!important;padding-top:10px!important;padding-bottom:10px!important}
#kc-panel .msgrow{gap:7px!important}
#kc-panel .msgavatar .avatar{width:41px!important;height:41px!important;flex-basis:41px!important}
#kc-panel .msgcol{gap:0!important}
#kc-panel .msgbubble{font-size:13px!important;line-height:1.45!important;padding:8px 13px!important}
#kc-panel .msgmeta{font-size:10px!important;line-height:14px!important;padding:1px 4px!important}
#kc-panel .kc-date-divider{margin:2px 0 4px!important}
#kc-panel .profilehero .kitty-profile-avatar .avatar{height:98px!important;width:98px!important}
#kc-panel .profilehero{padding:7px 9px 7px!important}
#kc-panel .profilehero .statusline{margin:3px auto 5px!important}
#kc-panel .profilebuttons{margin:6px 0 6px!important}
#kc-panel .featured-sticker{min-height:88px!important}
#kc-panel .featured-sticker .asset{height:66px!important}
#kc-panel .stickertile{max-height:42px!important;min-height:37px!important}
#kc-panel .compcard{padding:8px 10px!important}
#kc-panel .quickactions .iconbutton{min-height:55px!important;height:55px!important}
#kc-panel .companion{gap:6px!important}
#kc-panel .composer .kc-add{grid-area:auto!important;grid-column:1!important;grid-row:1!important;align-self:center!important}
#kc-panel .composer .mode{grid-area:auto!important;grid-column:2!important;grid-row:1!important;align-self:center!important}
#kc-panel .composer #kc-compose{grid-area:auto!important;grid-column:3!important;grid-row:1!important;align-self:center!important}
#kc-panel .composer>.primary{grid-area:auto!important;grid-column:4!important;grid-row:1!important;align-self:center!important}
/* Responsive fidelity: keep the full three-panel composition down to a usable width. */
@container (max-width:1280px){#kc-panel .workspace{grid-template-columns:80px 290px minmax(0,1fr)!important}#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 275px!important}#kc-panel .brandlockup{width:319px!important;height:131px!important}#kc-panel .brand-after-lockup{left:221px!important;top:91px!important}#kc-panel .dragcue{right:235px!important}}
@container (max-width:1050px){#kc-panel .workspace{grid-template-columns:70px 260px minmax(0,1fr)!important}#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 230px!important}#kc-panel .compcard{padding:8px!important}#kc-panel .profilehero .kitty-profile-avatar .avatar{height:83px!important;width:83px!important}#kc-panel .profilehero .profilebuttons .iconbutton{width:33px!important}#kc-panel .featured-sticker .asset{height:60px!important}#kc-panel .stickergrid{margin-top:2px!important}#kc-panel .companion{gap:5px!important}#kc-panel .chathead .headright .iconbutton{width:31px!important;height:31px!important}}
@container (max-width:920px){#kc-panel .workspace{grid-template-columns:62px 245px minmax(0,1fr)!important}#kc-panel .chatlayout{grid-template-columns:1fr!important}#kc-panel .companion{display:none!important}#kc-panel .brandlockup{width:282px!important;height:117px!important}#kc-panel .brand-after-lockup{left:196px!important;top:90px!important}}
@container (max-width:740px){#kc-panel .hero{height:80px!important;min-height:80px!important;max-height:80px!important}#kc-panel .brandlockup{top:-8px!important;width:215px!important;height:91px!important}#kc-panel .brand-after-lockup{display:none!important}#kc-panel .dragcue,#kc-panel .kc-deco-right-top,#kc-panel .kc-deco-left-ribbon{display:none!important}#kc-panel .workspace{grid-template-columns:56px minmax(0,1fr)!important}#kc-panel .sidebar{display:none!important}#kc-panel .sidebar.compact-open{display:flex!important}#kc-panel .rail{padding-top:9px!important}#kc-panel .railtab{min-height:63px!important}#kc-panel .railtab .ic .asset{width:27px!important;height:27px!important}#kc-panel .chatcenter{margin:4px!important}#kc-panel .chathead{min-height:62px!important;height:62px!important;padding:5px 8px!important}#kc-panel .chathead .avatar{height:39px!important;width:39px!important;flex-basis:39px!important}#kc-panel .msglog{padding:8px!important}#kc-panel .composer{grid-template-columns:35px 60px minmax(0,1fr) 42px!important;gap:4px!important;padding:5px!important;min-height:59px!important}#kc-panel .composer .kc-add{width:34px!important;height:34px!important}#kc-panel .composer .mode{width:59px!important;height:36px!important;font-size:10px!important}#kc-panel .composer #kc-compose{height:36px!important;min-height:36px!important;line-height:18px!important;font-size:12px!important;padding:5px 8px!important}#kc-panel .composer>.primary{height:42px!important;width:42px!important;min-width:42px!important}#kc-panel .quick{max-height:34px!important}}
@container (max-width:430px){#kc-panel .workspace{grid-template-columns:48px minmax(0,1fr)!important}#kc-panel .headright .iconbutton:nth-child(n+3){display:none!important}#kc-panel .composer{grid-template-columns:30px 48px minmax(0,1fr) 37px!important}#kc-panel .composer .mode{width:47px!important}#kc-panel .composer>.primary{height:38px!important;width:37px!important;min-width:37px!important}}

#kc-panel .chatcenter{position:relative}
#kc-panel .msglog{position:relative}
#kc-panel .facepop-btn{all:unset;position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;cursor:pointer;touch-action:manipulation}
#kc-panel .facepop-btn .avatar,#kc-panel .facepop-btn .asset{pointer-events:none}
#kc-panel .facepop-btn.popping .avatar,#kc-panel .facepop-btn.popping .asset{animation:kc-face-bop .34s cubic-bezier(.22,.82,.28,1.18)}
#kc-panel .facepop-btn:active .avatar{transform:scale(.97)}
#kc-panel .heart-burst{position:absolute;inset:-14px;pointer-events:none;overflow:visible}
#kc-panel .float-heart{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;color:#ff9bc9;text-shadow:0 2px 7px #511b38,0 0 8px #ff94bf;animation:kc-heart-float 1.02s ease-out forwards;will-change:transform,opacity}
#kc-panel .chat-float-kitten{position:absolute;left:58%;top:-78px;bottom:auto;transform:translateX(-50%);z-index:24;width:78px;height:78px;filter:drop-shadow(0 10px 15px #150716a6)}
#kc-panel .chat-float-kitten .asset{width:100%;height:100%}
#kc-panel .chat-float-kitten .facepop-btn{width:100%;height:100%;border-radius:24px}
#kc-panel .chat-float-kitten .heart-burst{inset:-18px}
#kc-panel .kitty-profile-avatar.facepop-btn{width:max-content;margin:0 auto 7px}
#kc-panel .headface.facepop-btn{flex:none}
@keyframes kc-face-bop{0%{transform:scale(1) rotate(0deg)}30%{transform:scale(1.12) rotate(-6deg)}58%{transform:scale(.95) rotate(5deg)}100%{transform:scale(1) rotate(0deg)}}
@keyframes kc-heart-float{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}16%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--drift,0px)),calc(-50% - var(--rise,74px))) scale(1.06)}}
@container (max-width:1050px){#kc-panel .chat-float-kitten{width:66px;height:66px;left:58%;top:-66px;bottom:auto}}
@container (max-width:740px){#kc-panel .chat-float-kitten{display:none}#kc-panel .profilehero .kitty-profile-avatar.facepop-btn{margin-bottom:5px!important}}


#kc-panel{width:min(1415px,calc(100vw - 18px));height:min(845px,calc(100dvh - 18px));border-radius:34px!important}
#kc-panel .hero{min-height:112px!important;padding:0 18px 0 0!important;align-items:stretch!important;overflow:visible!important}
#kc-panel .brandlockup{position:absolute!important;top:-49px!important;left:24px!important;width:408px!important;height:150px!important;z-index:7!important;filter:drop-shadow(0 9px 10px #0009)!important}
#kc-panel .brandlockup .asset img{object-fit:contain!important}
#kc-panel .brand-after-lockup{left:258px!important;top:96px!important}
#kc-panel .brand-after-lockup small{font-size:12px!important}
#kc-panel .heroactions{align-self:flex-start!important;margin-top:14px!important}
#kc-panel .dragcue{right:254px!important;top:22px!important;position:absolute!important;padding:7px 29px!important;border-radius:28px!important;background:#281729e8!important;border:1px solid #7e4065!important}
#kc-panel .herocharms{margin-right:76px!important;gap:12px!important}
#kc-panel .kc-deco-left-top{left:-124px!important;top:50px!important;width:124px!important;height:117px!important}
#kc-panel .kc-deco-left-ribbon{left:-31px!important;top:14px!important;width:126px!important;height:124px!important}
#kc-panel .kc-deco-left-bottom{left:-25px!important;bottom:-14px!important;width:148px!important;height:154px!important}
#kc-panel .kc-deco-right-top{right:86px!important;top:-36px!important;width:176px!important;height:108px!important}
#kc-panel .kc-deco-right-top>.asset{width:171px!important;height:108px!important}
#kc-panel .workspace{grid-template-columns:84px 342px minmax(0,1fr)!important}
#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 300px!important}
#kc-panel .side-shell{padding:16px 15px 14px!important}
#kc-panel .side-card{border-radius:20px!important}
#kc-panel .chathead{min-height:84px!important;padding:10px 18px!important}
#kc-panel .msglog{background-position:center center,center 51%!important}
#kc-panel .profilehero .kitty-profile-avatar .avatar{height:108px!important;width:108px!important}
#kc-panel .profilehero .statusline{max-width:240px!important}
#kc-panel .companion{padding:12px 13px!important;gap:10px!important}
#kc-panel .compcard{border-radius:18px!important}
@container (max-width:1280px){#kc-panel .brandlockup{width:365px!important;height:136px!important;left:18px!important;top:-43px!important}#kc-panel .brand-after-lockup{left:230px!important;top:91px!important}#kc-panel .workspace{grid-template-columns:78px 300px minmax(0,1fr)!important}#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 270px!important}#kc-panel .dragcue{right:220px!important}}
@container (max-width:920px){#kc-panel .workspace{grid-template-columns:62px 245px minmax(0,1fr)!important}#kc-panel .chatlayout{grid-template-columns:1fr!important}#kc-panel .companion{display:none!important}#kc-panel .brandlockup{width:292px!important;height:118px!important;left:10px!important;top:-24px!important}#kc-panel .brand-after-lockup{left:186px!important;top:78px!important}#kc-panel .dragcue{right:140px!important}}
@container (max-width:740px){#kc-panel .brandlockup{top:-6px!important;left:8px!important;width:220px!important;height:88px!important}#kc-panel .kc-deco-right-top,#kc-panel .kc-deco-left-ribbon{display:none!important}}


/* Kittychat v0.7.5 — sculpted responsive shell, traced around the concept cats. */
#kc-panel{overflow:visible!important;border:0!important;border-radius:35px 43px 30px 32px!important;box-shadow:0 21px 65px #030105ec,0 0 0 1px #5a284b!important;background:radial-gradient(ellipse at 9% 0%,#522741 0%,transparent 33%),#1a101d!important;isolation:isolate}
#kc-panel::before,#kc-panel::after{display:none!important;content:none!important}
#kc-panel .kc-sculpted-frame{position:absolute;left:-22px;top:-25px;width:calc(100% + 44px);height:calc(100% + 50px);display:block;overflow:visible;pointer-events:none!important;z-index:15;filter:drop-shadow(0 4px 7px #09040aaa)}
#kc-panel .kc-sculpted-frame path{fill:none;pointer-events:none;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
#kc-panel .kc-outline-shadow{stroke:#0d0613;stroke-width:17;opacity:.98}
#kc-panel .kc-outline-glow{stroke:#f05e9e;stroke-width:8;opacity:.27}
#kc-panel .kc-outline-main{stroke:url(#kc-outline-grad);stroke-width:2.8;opacity:.97}
#kc-panel .kc-outline-inset{stroke:#ffc0dd;stroke-width:1.15;opacity:.35}
#kc-panel .kc-divider-rail{stroke:#af567f;stroke-width:1.7;opacity:.65}
#kc-panel .hero{background:radial-gradient(ellipse at 8% 10%,#5a2a4a,#281629 42%,#211127 100%)!important;border-bottom:1px solid #b45c87!important;box-shadow:inset 0 1px #f4aad536!important;border-radius:34px 38px 0 0!important}
#kc-panel .hero::after{height:2px!important;background:linear-gradient(90deg,transparent 2%,#ffc4e197 22%,#6f3256 49%,#d57ca8 76%,transparent 98%)!important}
#kc-panel .brandlockup{width:342px!important;height:149px!important;top:-39px!important;left:10px!important;filter:drop-shadow(0 4px 7px #05020799)!important;z-index:18!important;pointer-events:none!important}
#kc-panel .brandlockup .asset img{object-fit:contain!important}
#kc-panel .brand-after-lockup{left:170px!important;top:98px!important;z-index:19!important}
#kc-panel .profilehero .kitty-profile-avatar.facepop-btn{width:112px!important;height:112px!important;display:inline-flex!important;flex:0 0 112px!important;box-sizing:border-box!important;align-self:center!important;position:relative!important}#kc-panel .profilehero .kitty-profile-avatar.facepop-btn .avatar{flex:none!important;width:108px!important;height:108px!important;min-width:108px!important;min-height:108px!important;border-radius:50%!important;object-fit:cover!important}#kc-panel .profilehero .kitty-profile-avatar.facepop-btn .asset{height:100%!important;width:100%!important}#kc-panel .brand-after-lockup small{color:#ffcfeb!important;text-shadow:0 2px 4px #07030bdd!important;font-size:11px!important}
#kc-panel .kc-deco-left-top{left:-56px!important;top:77px!important;width:100px!important;height:102px!important;z-index:19!important}
#kc-panel .kc-deco-left-ribbon{left:-42px!important;top:18px!important;width:103px!important;height:112px!important;z-index:19!important}
#kc-panel .kc-deco-left-bottom{left:-8px!important;bottom:2px!important;width:124px!important;height:126px!important;z-index:19!important}
#kc-panel .kc-deco-right-top{right:83px!important;top:-38px!important;width:166px!important;height:106px!important;z-index:19!important}
#kc-panel .kc-deco-right-top>.asset{width:166px!important;height:105px!important}
#kc-panel .rail{position:relative!important;border-right:1px solid #955073!important;box-shadow:inset 3px 0 10px #ce629736!important;background:linear-gradient(180deg,#28182b,#190e22)!important;border-radius:20px 0 0 26px!important}
#kc-panel .rail::before{display:none!important}
#kc-panel .sidebar{border-right:1px solid #894068!important;box-shadow:inset 1px 0 #d47fac3b!important}
#kc-panel .companion{border-left:1px solid #a95884!important;box-shadow:inset 2px 0 #f4a7cb1a!important;border-radius:17px 24px 20px 18px!important}
#kc-panel .chatcenter{border:1px solid #965074!important;box-shadow:inset 0 0 0 1px #e5a2cd1b,0 3px 16px #09020983!important;border-radius:24px!important}
#kc-panel .chathead{border-radius:23px 23px 0 0!important}
#kc-panel .workspace{border-radius:0 0 29px 29px!important;overflow:hidden!important}
#kc-panel .kc-resize{z-index:22!important;right:1px!important;bottom:0px!important}
/* Keep the four right-hand cards inside the sculpted lower border at reference size. */
#kc-panel .companion{gap:7px!important}
#kc-panel .profilehero{padding:6px 9px 5px!important}
#kc-panel .profilehero .kitty-profile-avatar.facepop-btn{width:102px!important;height:102px!important;flex-basis:102px!important}
#kc-panel .profilehero .kitty-profile-avatar.facepop-btn .avatar{width:100px!important;height:100px!important;min-width:100px!important;min-height:100px!important}
#kc-panel .profilebuttons{margin-top:4px!important;margin-bottom:4px!important}
#kc-panel .featured-sticker{min-height:58px!important;gap:0!important}
#kc-panel .featured-sticker .asset{height:43px!important}
#kc-panel .stickerwall{padding-top:7px!important;padding-bottom:7px!important}
#kc-panel .roompreview{padding-top:8px!important;padding-bottom:8px!important}

@container (max-width:1280px){#kc-panel .brandlockup{width:320px!important;height:141px!important;top:-33px!important;left:6px!important}#kc-panel .brand-after-lockup{left:169px!important;top:94px!important}#kc-panel .kc-deco-left-top{left:-35px!important;width:80px!important}#kc-panel .kc-deco-left-ribbon{left:-26px!important;width:88px!important}#kc-panel .kc-deco-right-top{right:70px!important}}
@container (max-width:920px){#kc-panel .brandlockup{top:-23px!important;width:282px!important;height:121px!important}#kc-panel .brand-after-lockup{left:148px!important;top:83px!important}#kc-panel .kc-deco-left-top,#kc-panel .kc-deco-right-top{display:none!important}}
@container (max-width:740px){#kc-panel .brandlockup{top:-6px!important;width:223px!important;height:91px!important;left:1px!important}#kc-panel .brand-after-lockup{display:none!important}#kc-panel .kc-deco-left-ribbon,#kc-panel .kc-deco-left-bottom{display:none!important}#kc-panel .kc-sculpted-frame{opacity:.85!important}#kc-panel .rail{border-radius:14px 0 0 16px!important}}


#kc-panel .kc-deco-left-top{display:none!important}
#kc-panel .chatcenter{overflow:visible!important}
#kc-panel .chat-float-kitten .facepop-btn{border-radius:22px;background:transparent}
#kc-panel .chat-float-kitten .asset img{object-fit:contain}
#kc-panel .chat-float-kitten{pointer-events:none}
#kc-panel .chat-float-kitten .facepop-btn{pointer-events:auto}
#kc-panel .kc-deco-left-bottom .asset img{object-fit:contain;object-position:left bottom}
#kc-panel .kc-deco-left-bottom{filter:drop-shadow(0 8px 14px rgba(0,0,0,.42))!important}
@container (max-width:1280px){#kc-panel .kc-deco-left-bottom{left:-4px!important;bottom:2px!important;width:112px!important;height:114px!important}#kc-panel .chat-float-kitten{width:72px!important;height:72px!important;left:58%!important;top:-70px!important}}
@container (max-width:920px){#kc-panel .chat-float-kitten{display:none!important}#kc-panel .kc-deco-left-bottom{width:96px!important;height:98px!important;left:-1px!important;bottom:1px!important}}


#kc-panel .kc-deco-left-bottom{left:-3px!important;bottom:6px!important;width:112px!important;height:116px!important;transform:rotate(-1deg)!important}
#kc-panel .kc-deco-right-top{right:73px!important;top:-42px!important;width:182px!important;height:113px!important}
#kc-panel .kc-deco-right-top>.asset{width:176px!important;height:111px!important}
#kc-panel .dragcue{right:232px!important;top:20px!important}
#kc-panel .brandlockup{left:6px!important;top:-36px!important}
#kc-panel .kc-sculpted-frame{filter:drop-shadow(0 5px 8px #09040aaa)!important}
@container (max-width:1280px){#kc-panel .kc-deco-left-bottom{left:-1px!important;bottom:4px!important;width:98px!important;height:102px!important}#kc-panel .kc-deco-right-top{right:66px!important;top:-33px!important;width:160px!important;height:100px!important}#kc-panel .dragcue{right:202px!important}}
@container (max-width:920px){#kc-panel .kc-deco-left-bottom{left:2px!important;bottom:3px!important;width:86px!important;height:90px!important}}


/* v0.7.11: independent left conversation and right widget scrolling. */
#kc-panel .sidebar{min-height:0!important;overflow:hidden!important}
#kc-panel .side-shell{display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}
#kc-panel .side-shell>.side-card,#kc-panel .side-shell>.side-search,#kc-panel .side-shell>.side-filters,#kc-panel .side-shell>.new-kitty{flex-shrink:0!important}
#kc-panel .contacts-scroll{flex:1 1 auto!important;min-height:0!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:#eb78b0 #271429;overscroll-behavior:contain;scrollbar-gutter:stable;padding-right:3px;touch-action:pan-y}
#kc-panel .contacts-scroll>.side-list{display:flex!important;flex-direction:column!important;flex:none!important;overflow:visible!important;min-height:min-content!important}
#kc-panel .contacts-scroll .contact,#kc-panel .contacts-scroll .group-item,#kc-panel .contacts-scroll .group-invite{flex-shrink:0!important}
#kc-panel .group-stack{max-height:none!important;overflow:visible!important;display:grid!important}
#kc-panel .companion{min-height:0!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#eb78b0 #271429;scrollbar-gutter:stable;touch-action:pan-y}
#kc-panel .companion>.compcard{flex:0 0 auto!important;min-height:min-content!important}
#kc-panel .companion.group-details>.compcard{flex:0 0 auto!important}
#kc-panel.panel-scrollbars-visible .contacts-scroll,#kc-panel.panel-scrollbars-visible .companion{overflow-y:scroll!important}
#kc-panel .contacts-scroll::-webkit-scrollbar,#kc-panel .companion::-webkit-scrollbar{width:8px}
#kc-panel .contacts-scroll::-webkit-scrollbar-track,#kc-panel .companion::-webkit-scrollbar-track{background:#2a1730;border-radius:12px}
#kc-panel .contacts-scroll::-webkit-scrollbar-thumb,#kc-panel .companion::-webkit-scrollbar-thumb{background:linear-gradient(#ff99ca,#ab5185);border:2px solid #2a1730;border-radius:12px}
#kc-panel .contacts-scroll:focus-visible,#kc-panel .companion:focus-visible{outline:1px solid #ffb4d6;outline-offset:-2px}


/* v0.7.12 — stable flexible layout and clean inset bars */
#kc-panel .kc-divider-rail{display:none!important}
#kc-panel .workspace{min-height:0!important;min-width:0!important;overflow:hidden!important;grid-template-columns:84px minmax(0,342px) minmax(0,1fr)!important}
#kc-panel .workspace>.rail,#kc-panel .workspace>.sidebar,#kc-panel .workspace>.main{min-width:0!important;min-height:0!important;max-height:100%!important}
#kc-panel .main,#kc-panel .chatlayout,#kc-panel .chatcenter{min-width:0!important;min-height:0!important;max-height:100%!important}
#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) minmax(0,300px)!important;overflow:hidden!important}
#kc-panel .chatcenter{overflow:hidden!important;position:relative!important}
#kc-panel .chatcenter>.msglog{min-height:0!important;min-width:0!important;overflow-y:auto!important;overflow-x:hidden!important}
#kc-panel .sidebar{overflow:hidden!important}
#kc-panel .side-shell{min-width:0!important;max-height:100%!important;overflow:hidden!important}
#kc-panel .contacts-scroll{min-width:0!important;min-height:0!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important}
#kc-panel .side-card,#kc-panel .contact,#kc-panel .group-item{min-width:0!important;max-width:100%!important}
#kc-panel .side-card .side-mainline,#kc-panel .contact .info{min-width:0!important}
#kc-panel .companion{min-width:0!important;max-width:100%!important;overflow-y:auto!important;overflow-x:hidden!important;min-height:0!important}
#kc-panel .companion>.compcard{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere!important}
#kc-panel .companion .profilebuttons{max-width:100%!important;flex-wrap:wrap!important}
#kc-panel .companion .stickergrid,#kc-panel .companion .quickactions{min-width:0!important}
#kc-panel .chathead{min-width:0!important;overflow:hidden!important}
#kc-panel .chathead .headblock{min-width:0!important;overflow:hidden!important}
#kc-panel .chathead .headtitle,#kc-panel .chathead .headsubtitle{overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
#kc-panel .composer{min-width:0!important;max-width:100%!important;overflow:hidden!important}
#kc-panel .composer>#kc-compose{min-width:0!important;width:100%!important}
#kc-panel .quick{min-width:0!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin;flex-wrap:nowrap!important}
#kc-panel .quick .pill{flex:0 0 auto!important;white-space:nowrap!important}
#kc-panel .kc-resize{touch-action:none!important;cursor:nwse-resize!important;z-index:45!important}
@container (max-width:1280px){
  #kc-panel .workspace{grid-template-columns:78px minmax(0,200px) minmax(0,1fr)!important}
  #kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) minmax(0,270px)!important}
}
@container (max-width:1120px){
  #kc-panel .workspace{grid-template-columns:64px minmax(0,170px) minmax(0,1fr)!important}
  #kc-panel .chatlayout{grid-template-columns:minmax(0,1fr)!important}
  #kc-panel .companion{display:none!important}
  #kc-panel .sidebar .side-shell{padding:10px 9px!important;gap:8px!important}
  #kc-panel .side-filters{gap:4px!important}
  #kc-panel .side-filters .filterbtn{padding:7px 3px!important;font-size:11px!important}
  #kc-panel .chathead .headright{gap:3px!important}
}
@container (max-width:780px){
  #kc-panel .workspace{grid-template-columns:56px minmax(0,1fr)!important;position:relative!important}
  #kc-panel .workspace>.main{grid-column:2!important}
  #kc-panel .workspace>.sidebar{display:none!important}
  #kc-panel .workspace>.sidebar.compact-open{display:flex!important;position:absolute!important;z-index:40!important;top:0!important;bottom:0!important;left:56px!important;width:min(275px,calc(100% - 56px))!important;max-height:100%!important}
  #kc-panel .chatlayout{grid-template-columns:minmax(0,1fr)!important}
  #kc-panel .companion{display:none!important}
  #kc-panel .rail{padding-left:3px!important;padding-right:3px!important}
  #kc-panel .railtab{min-width:0!important;max-width:100%!important}
  #kc-panel .brand-after-lockup,#kc-panel .dragcue,#kc-panel .herocharms{display:none!important}
  #kc-panel .kc-deco-right-top{display:none!important}
}
@container (max-width:560px){
  #kc-panel .headright .iconbutton:nth-child(2),#kc-panel .headright .iconbutton:nth-child(3),#kc-panel .headright .iconbutton:nth-child(4){display:none!important}
  #kc-panel .chathead{gap:5px!important;padding:5px 7px!important}
  #kc-panel .chathead .headsubtitle{font-size:10px!important}
  #kc-panel .composer{gap:4px!important;padding:5px!important}
  #kc-panel .kc-deco-left-ribbon,#kc-panel .kc-deco-left-bottom{display:none!important}
}
#kc-panel.kc-short .side-card{display:none!important}
#kc-panel.kc-short .side-shell{gap:5px!important;padding-top:7px!important;padding-bottom:6px!important}
#kc-panel.kc-short .chathead{height:58px!important;min-height:58px!important}
#kc-panel.kc-short .companion{gap:4px!important}
#kc-panel.kc-short .companion .featured-sticker{min-height:32px!important}


/* Short windows keep useful room for reading and composing messages. */
#kc-panel.kc-short .hero{height:70px!important;min-height:70px!important;max-height:70px!important}
#kc-panel.kc-short .brandlockup{width:215px!important;height:83px!important;left:3px!important;top:-11px!important}
#kc-panel.kc-short .brand-after-lockup{display:none!important}
#kc-panel.kc-short .heroactions{margin-top:5px!important}
#kc-panel.kc-short .closekitty{width:35px!important;height:37px!important}
#kc-panel.kc-short .rail{overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin!important}
#kc-panel.kc-short .railtab{flex:0 0 auto!important;min-height:55px!important;gap:0!important}
#kc-panel.kc-short .railtab .tx{font-size:10px!important}
#kc-panel.kc-short .quick{min-height:28px!important;max-height:28px!important}
#kc-panel.kc-short .chatcenter .msglog .empty .art{display:none!important}
#kc-panel.kc-short .chatcenter .msglog .empty{font-size:12px!important;padding:3px!important}

#kc-panel .rail{padding:16px 8px 12px 14px!important;overflow:visible!important}
#kc-panel .railtab{position:relative;left:2px}
#kc-panel .chatcenter{position:relative}
#kc-panel .collapse-handle{position:absolute;top:108px;z-index:45;width:28px;height:28px;border-radius:999px;border:1px solid #ff92c2;background:linear-gradient(180deg,#52253e,#28132f);color:#ffd5e8;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;line-height:1;box-shadow:0 0 0 2px #2a132a,0 8px 18px #0008;cursor:pointer;transition:transform .16s ease,filter .16s ease,background .16s ease}
#kc-panel .collapse-handle:hover{transform:scale(1.06);filter:brightness(1.12)}
#kc-panel .collapse-handle.left{left:-14px}
#kc-panel .collapse-handle.right{right:-14px}
#kc-panel.left-collapsed .workspace{grid-template-columns:92px 0 minmax(0,1fr)!important}
#kc-panel.left-collapsed .sidebar{display:none!important}
#kc-panel.right-collapsed .chatlayout{grid-template-columns:minmax(0,1fr) 0!important}
#kc-panel.right-collapsed .companion{display:none!important}
#kc-panel.left-collapsed .collapse-handle.left .arr{transform:translateX(1px)}
#kc-panel.right-collapsed .collapse-handle.right .arr{transform:translateX(-1px)}
@container (max-width:1130px){#kc-panel.left-collapsed .workspace{grid-template-columns:78px 0 minmax(0,1fr)!important}}
@container (max-width:920px){#kc-panel .collapse-handle.right{display:none!important}#kc-panel.right-collapsed .chatlayout{grid-template-columns:1fr!important}}
@container (max-width:740px){#kc-panel .collapse-handle{display:none!important}}

/* v0.7.39: keep the pink horizontal inbox bar in a separate row.
   The scrolling filter strip has no native overlay scrollbar: buttons remain
   fully clickable and visible on Windows, Firefox, Chromium, and Opera. */
#kc-panel .kc-inbox-filter-wrap {
  display:flex!important;
  flex-direction:column!important;
  order:3!important;
  flex:0 0 auto!important;
  min-width:0!important;
  max-width:100%!important;
  gap:9px!important;
  padding:0 0 3px!important;
  overflow:hidden!important;
}
#kc-panel .kc-inbox-filter-wrap>.kc-inbox-filters {
  order:0!important;
  flex:0 0 auto!important;
  display:flex!important;
  flex-wrap:nowrap!important;
  align-items:stretch!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  scrollbar-width:none!important;
  -ms-overflow-style:none!important;
  padding:2px 0 3px!important;
  margin:0!important;
  overscroll-behavior-x:contain;
}
#kc-panel .kc-inbox-filter-wrap>.kc-inbox-filters::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}
#kc-panel .kc-inbox-filter-wrap .filterbtn{flex:none!important;position:relative!important;min-height:39px!important;white-space:nowrap!important;cursor:pointer!important}
#kc-panel .kc-filter-scroll-controls{
  display:grid!important;
  grid-template-columns:20px minmax(0,1fr) 20px!important;
  align-items:center!important;
  gap:6px!important;
  width:100%!important;
  height:18px!important;
  min-width:0!important;
  flex:0 0 18px!important;
  margin:0!important;
  padding:0 2px!important;
  box-sizing:border-box!important;
}
#kc-panel .kc-filter-scroll-btn{
  display:flex!important;align-items:center!important;justify-content:center!important;
  height:18px!important;min-width:20px!important;padding:0!important;
  border:1px solid #c871ab!important;border-radius:7px!important;
  background:#4e2445!important;color:#ffb8da!important;
  cursor:pointer!important;line-height:1!important;font-size:16px!important;
}
#kc-panel .kc-filter-scroll-btn:disabled{opacity:.32!important;cursor:default!important}
#kc-panel .kc-filter-scroll-track{
  position:relative!important;height:12px!important;min-width:0!important;
  box-sizing:border-box!important;overflow:hidden!important;
  border-radius:15px!important;border:1px solid #a9528a!important;
  background:#341432!important;box-shadow:inset 0 1px 4px #0e0414!important;
  cursor:pointer!important;touch-action:none!important;
}
#kc-panel .kc-filter-scroll-thumb{
  position:absolute!important;top:1px!important;left:0!important;height:8px!important;
  border-radius:13px!important;box-sizing:border-box!important;
  border:1px solid #ffe0ef!important;
  background:linear-gradient(90deg,#ff90c6 0%,#ff4f9f 50%,#ffc3e1 100%)!important;
  box-shadow:0 0 7px #ff70b4aa!important;
  pointer-events:auto!important;
}
#kc-panel .kc-filter-scroll-track:focus-visible{outline:2px solid #ffd4ed!important;outline-offset:2px!important}
#kc-panel .kc-filter-scroll-controls.kc-no-filter-overflow{opacity:.5!important}
@container (max-width:470px){#kc-panel .kc-inbox-filter-wrap{gap:8px!important}}

/* v0.7.14 — keep the name-list scrollbar in its own outer gutter.
   Extend only the scrolling box into the sidebar's unused right padding,
   then reserve inset room for the rounded contact cards. */
#kc-panel .contacts-scroll{
  box-sizing:border-box!important;
  width:calc(100% + 10px)!important;
  max-width:none!important;
  margin-right:-10px!important;
  padding-right:15px!important;
  scrollbar-gutter:stable!important;
}
#kc-panel .contacts-scroll>.side-list,
#kc-panel .contacts-scroll>.group-stack,
#kc-panel .contacts-scroll>.groupbar{box-sizing:border-box!important;max-width:100%!important;min-width:0!important}
#kc-panel .contacts-scroll .contact,
#kc-panel .contacts-scroll .group-item,
#kc-panel .contacts-scroll .group-invite{max-width:100%!important;min-width:0!important}
@container (max-width:920px){
  #kc-panel .contacts-scroll{width:calc(100% + 7px)!important;margin-right:-7px!important;padding-right:12px!important}
}


/* v0.7.18 — Compact navigation labels: prevent long words from clipping into the rails. */
#kc-panel .rail .railtab .tx{font-size:10.5px!important;line-height:1.15!important;font-weight:700!important;letter-spacing:0!important;white-space:nowrap!important;text-align:center!important;max-width:100%!important}
@container (max-width:790px){#kc-panel .rail .railtab .tx{font-size:9.5px!important}}
@container (max-width:470px){#kc-panel .rail .railtab .tx{font-size:9px!important}}


/* Native BC mugshots; drawn from characters already in memory, never stored. */
#kc-panel .avatar{position:relative;isolation:isolate}
#kc-panel .avatar .kc-bc-mugshot{display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;z-index:4;pointer-events:none}
#kc-panel .avatar .kc-bc-mugshot.is-painted{display:block}
#kc-panel .avatar.kc-has-mugshot>img,
#kc-panel .avatar.kc-has-mugshot>.asset,
#kc-panel .avatar.kc-has-mugshot>span:not(.kc-bc-mugshot){display:none!important}

/* v0.7.24: quick paws must wrap/reflow instead of clipping beneath the composer. */
#kc-panel .quick{box-sizing:border-box!important;width:100%!important;max-width:100%!important;max-height:min(112px,24vh)!important;min-height:0!important;height:auto!important;overflow-x:hidden!important;overflow-y:auto!important;flex-wrap:wrap!important;flex:0 0 auto!important;gap:6px!important;align-content:start!important;align-items:center!important;padding:7px 10px!important;scrollbar-width:thin!important}
#kc-panel .quick .pill{box-sizing:border-box!important;flex:1 1 135px!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.3!important;min-height:27px!important;padding:5px 8px!important}
#kc-panel.kc-short .quick{height:auto!important;min-height:0!important;max-height:65px!important;overflow-y:auto!important;padding:3px 7px!important}
#kc-panel.kc-short .quick .pill{min-height:24px!important;flex-basis:115px!important;font-size:10px!important}
@container (max-width:640px){#kc-panel .quick .pill{flex-basis:115px!important}}
@container (max-width:420px){#kc-panel .quick .pill{flex-basis:100%!important}}


/* v0.7.30 - definitive composer layout. Older stylesheet revisions imposed
   77px max-width with a 136px minimum, making the mode picker overlap text.
   Scope these overrides to a named chatcenter container so they respond to
   the actual available chat width, not the overall movable panel width. */
#kc-panel .chatcenter{container-type:inline-size;container-name:kc-chat-area}
#kc-panel .composer.chat-composer,
#kc-panel .composer.group-composer{
  display:grid!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
  box-sizing:border-box!important;
  grid-template-areas:none!important;
  grid-template-columns:46px 132px minmax(0,1fr) 52px!important;
  gap:8px!important;
  padding:9px 12px!important;
  align-items:center!important;
  overflow:hidden!important;
}
#kc-panel .composer.chat-composer>.kc-add{
  grid-column:1!important;grid-row:1!important;grid-area:auto!important;
  width:46px!important;min-width:0!important;height:46px!important;
}
#kc-panel .composer.chat-composer>#kc-mode{
  grid-column:2!important;grid-row:1!important;grid-area:auto!important;
  display:block!important;box-sizing:border-box!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  height:44px!important;padding:8px 26px 8px 10px!important;
  font-size:12px!important;line-height:22px!important;
  text-overflow:ellipsis!important;
  overflow:hidden!important;white-space:nowrap!important;
  border-radius:17px!important;
}
#kc-panel .composer.chat-composer>#kc-compose,
#kc-panel .composer.group-composer>#kc-compose{
  grid-column:3!important;grid-row:1!important;grid-area:auto!important;
  display:block!important;box-sizing:border-box!important;
  width:100%!important;min-width:0!important;max-width:100%!important;
  height:46px!important;min-height:46px!important;max-height:112px!important;
  padding:10px 13px!important;line-height:24px!important;resize:none!important;
}
#kc-panel .composer.chat-composer>.primary,
#kc-panel .composer.group-composer>.primary{
  grid-column:4!important;grid-row:1!important;grid-area:auto!important;
  width:50px!important;min-width:0!important;max-width:50px!important;
  height:50px!important;justify-self:center!important;
}
#kc-panel .composer.group-composer{grid-template-columns:88px 46px minmax(0,1fr) 52px!important}
#kc-panel .composer.group-composer>.group-head-tag{
  grid-column:1!important;grid-row:1!important;grid-area:auto!important;
  width:100%!important;min-width:0!important;white-space:nowrap!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
#kc-panel .composer.group-composer>.kc-add{
  grid-column:2!important;grid-row:1!important;grid-area:auto!important;
  width:46px!important;min-width:0!important;height:46px!important;
}
/* An intermediate layout reduces spacing without clipping any field. */
@container kc-chat-area (max-width:535px){
  #kc-panel .composer.chat-composer{grid-template-columns:43px 124px minmax(0,1fr) 47px!important;gap:6px!important;padding:7px!important}
  #kc-panel .composer.group-composer{grid-template-columns:78px 43px minmax(0,1fr) 47px!important;gap:6px!important;padding:7px!important}
  #kc-panel .composer.chat-composer>.kc-add,#kc-panel .composer.group-composer>.kc-add{width:43px!important;height:43px!important}
  #kc-panel .composer.chat-composer>.primary,#kc-panel .composer.group-composer>.primary{height:45px!important;width:45px!important;max-width:45px!important}
}
/* Small chat area: mode stays fully readable above a full-width input;
   textarea and Send share their own row, with nothing overlapping. */
@container kc-chat-area (max-width:425px){
  #kc-panel .composer.chat-composer,
  #kc-panel .composer.group-composer{
    grid-template-columns:45px minmax(0,1fr) 47px!important;
    grid-template-rows:43px 46px!important;
    grid-template-areas:none!important;
    gap:5px 7px!important;padding:7px!important;
  }
  #kc-panel .composer.chat-composer>.kc-add{grid-column:1!important;grid-row:1!important}
  #kc-panel .composer.chat-composer>#kc-mode{grid-column:2/4!important;grid-row:1!important;width:100%!important;max-width:none!important;min-width:0!important;height:43px!important}
  #kc-panel .composer.chat-composer>#kc-compose{grid-column:1/3!important;grid-row:2!important;height:46px!important;min-height:46px!important}
  #kc-panel .composer.chat-composer>.primary{grid-column:3!important;grid-row:2!important}
  #kc-panel .composer.group-composer>.group-head-tag{grid-column:1/3!important;grid-row:1!important}
  #kc-panel .composer.group-composer>.kc-add{grid-column:3!important;grid-row:1!important}
  #kc-panel .composer.group-composer>#kc-compose{grid-column:1/3!important;grid-row:2!important}
  #kc-panel .composer.group-composer>.primary{grid-column:3!important;grid-row:2!important}
}

/* Kittychat 0.7.33 — privately shared friend-status badges. */
#kc-panel .kc-status-label{display:block;max-width:100%;min-width:0;color:#ffb9db;font-size:11px;font-weight:700;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
#kc-panel .contact .kc-status-label{color:#ffb7d8}
#kc-panel .kc-head-status{font-size:12px;max-width:290px;margin-top:5px}
#kc-panel .kc-side-status .kc-status-label{font-size:12px;white-space:normal;overflow-wrap:anywhere;text-align:center;color:#ffbadd;margin:4px auto}
#kc-panel .kc-pawstatus{font-size:14px;white-space:normal;text-align:center;border:1px solid #8d4e72;border-radius:16px;padding:8px 12px;background:#482246}
#kc-panel .kc-status-settings{border:1px solid #8c4c75;background:linear-gradient(160deg,#40213f,#27172c);border-radius:18px;padding:13px;margin-top:10px}
#kc-panel .kc-status-settings label{display:block;margin-bottom:9px;font-size:13px;color:#ffe4f4}
#kc-panel .kc-status-settings .field{margin-top:4px}
#kc-panel .kc-publish-status{width:100%;min-height:42px;margin:7px 0}
#kc-panel .kc-status-example{font-size:12px;color:#f6c9df;margin-top:4px;overflow-wrap:anywhere}


/* v0.7.41 — artwork and clean label for Paw Moments in every rail width.
   Keep the icon self-contained and prevent narrow rails from clipping text. */
#kc-panel .rail .railtab[data-tab="moments"]{
  box-sizing:border-box!important;
  position:relative!important;
  left:0!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  margin:0!important;
  padding:6px 2px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:3px!important;
  overflow:hidden!important;
}
#kc-panel .rail .railtab[data-tab="moments"] .ic{
  display:flex!important;
  flex:0 0 auto!important;
  align-items:center!important;
  justify-content:center!important;
  width:min(34px,100%)!important;
  height:34px!important;
  line-height:1!important;
  font-size:0!important;
}
#kc-panel .rail .railtab[data-tab="moments"] .kc-moments-icon{
  display:block!important;
  width:32px!important;
  height:32px!important;
  max-width:100%!important;
  object-fit:contain!important;
  aspect-ratio:1!important;
  pointer-events:none!important;
  filter:drop-shadow(0 1px 3px #fc69c28c)!important;
}
#kc-panel .rail .railtab[data-tab="moments"] .tx{
  display:block!important;
  box-sizing:border-box!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  padding:0!important;
  margin:0!important;
  white-space:nowrap!important;
  overflow:visible!important;
  font-size:10.5px!important;
  line-height:1.18!important;
  font-weight:750!important;
  text-align:center!important;
  letter-spacing:-.18px!important;
}
@container (max-width:1130px){
  #kc-panel .rail{padding-left:4px!important;padding-right:4px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .tx{font-size:9.25px!important}
}
@container (max-width:790px){
  #kc-panel .rail{padding-left:4px!important;padding-right:4px!important}
  #kc-panel .rail .railtab[data-tab="moments"]{padding:5px 0!important;gap:2px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .ic{height:29px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .kc-moments-icon{width:28px!important;height:28px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .tx{font-size:9px!important;letter-spacing:-.23px!important}
}
@container (max-width:470px){
  #kc-panel .rail{padding-left:2px!important;padding-right:2px!important}
  #kc-panel .rail .railtab[data-tab="moments"]{padding:4px 0!important;gap:1px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .ic{height:25px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .kc-moments-icon{width:24px!important;height:24px!important}
  #kc-panel .rail .railtab[data-tab="moments"] .tx{font-size:8.4px!important;letter-spacing:-.28px!important}
}
#kc-panel.kc-short .rail .railtab[data-tab="moments"]{gap:0!important}


/* PawLounge identity and feature screens — scoped to the messenger shadow root. */
#kc-panel .paw-brandlockup{font-size:clamp(26px,3.6vw,49px)!important;font-weight:1000;letter-spacing:-2px;color:#ffdff0;line-height:1.15;display:flex;align-items:center;gap:7px;text-shadow:0 2px #752646,0 4px 16px #eb70b8,0 0 4px #fff5;white-space:nowrap;padding:24px 4px 0 18px!important;filter:drop-shadow(0 4px 8px #1b0715)!important}
#kc-panel .paw-brand-heart{font-size:.65em;color:#f99dc7}
#kc-panel .railtab[data-tab="catchup"] .tx{font-size:10px!important;letter-spacing:-.2px!important;white-space:nowrap}
#kc-panel .railtab[data-tab="catchup"] .ic{font-size:25px!important}
#kc-panel .paw-circle-row,#kc-panel .paw-theme-row,#kc-panel .paw-profile-extras{display:flex;align-items:center;gap:6px;min-width:0}
#kc-panel .paw-circle-row .field{flex:1;min-width:0;font-size:11px;padding:7px 5px;border-radius:9px}
#kc-panel .paw-circle-row .secondary{flex:none;font-size:10px;padding:7px 8px}
#kc-panel .paw-theme-row{justify-content:space-between;flex-wrap:wrap;border-top:1px solid #9c638333;padding-top:7px;margin-top:7px}
#kc-panel .paw-theme-row label{font-size:11px;color:#ffc5e1}
#kc-panel .paw-theme-row .field{width:min(165px,100%);font-size:11px;padding:6px}
#kc-panel .paw-profile-extras{margin:6px 0;flex-wrap:wrap}
#kc-panel .paw-profile-extras button{flex:1;font-size:11px;min-width:70px}
#kc-panel .chatlayout[data-paw-chat-theme="rose"] .msgbubble{background:#59243e!important;border-color:#ed79a6!important}
#kc-panel .chatlayout[data-paw-chat-theme="rose"] .msgrow.mine .msgbubble{background:#ff9bbf!important;color:#491728!important}
#kc-panel .chatlayout[data-paw-chat-theme="rose"] .msglog{background:linear-gradient(145deg,#451c3d,#27192d)!important}
#kc-panel .chatlayout[data-paw-chat-theme="moon"] .msgbubble{background:#2a2852!important;border-color:#787bd5!important}
#kc-panel .chatlayout[data-paw-chat-theme="moon"] .msgrow.mine .msgbubble{background:#8271c3!important;color:#1e1236!important}
#kc-panel .chatlayout[data-paw-chat-theme="moon"] .msglog{background:linear-gradient(145deg,#18192f,#292140)!important}
#kc-panel .chatlayout[data-paw-chat-theme="forest"] .msgbubble{background:#203a32!important;border-color:#6fba9f!important}
#kc-panel .chatlayout[data-paw-chat-theme="forest"] .msgrow.mine .msgbubble{background:#82c7a2!important;color:#103028!important}
#kc-panel .chatlayout[data-paw-chat-theme="forest"] .msglog{background:linear-gradient(145deg,#152b27,#232f2a)!important}
#kc-panel .chatlayout[data-paw-chat-theme="gold"] .msgbubble{background:#4b322d!important;border-color:#cb936d!important}
#kc-panel .chatlayout[data-paw-chat-theme="gold"] .msgrow.mine .msgbubble{background:#f4bc82!important;color:#482c1f!important}
#kc-panel .chatlayout[data-paw-chat-theme="gold"] .msglog{background:linear-gradient(145deg,#392329,#231820)!important}
#kc-panel .paw-wide-screen{overflow:auto;max-height:100%;padding:18px 25px 40px}
#kc-panel .paw-items{display:grid;gap:10px;margin:13px 0}
#kc-panel .paw-item{border:1px solid #9b5b83;background:linear-gradient(145deg,#36213a,#211527);border-radius:16px;padding:12px;overflow-wrap:anywhere}
#kc-panel .paw-item p{font-size:13px;white-space:normal}
#kc-panel .paw-item .flex{gap:8px;flex-wrap:wrap}
#kc-panel .paw-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:15px 0}
#kc-panel .paw-stats>div{background:#422a48;border-radius:14px;border:1px solid #b47ca1;padding:12px 8px;text-align:center}
#kc-panel .paw-stats strong{display:block;font-size:27px;color:#ffb9db}
#kc-panel .paw-stats small{display:block;font-size:11px;color:#edc5dc}
#kc-panel .paw-settings-section{display:grid;gap:7px;margin:13px 0;padding:13px;border:1px solid #985d7c;border-radius:14px}
#kc-panel .paw-albums{margin:16px 0}.paw-album-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:9px;margin-top:12px}
#kc-panel .paw-album-cards>div{border:1px solid #a46a90;border-radius:14px;padding:10px}
#kc-panel .paw-album-cards img{max-width:100%;max-height:170px;object-fit:contain}
#kc-panel .paw-profile-detail{padding:8px 11px;margin:10px 0;color:#ffdaec;background:#612c5644;border-radius:10px}
#kc-panel .paw-profile-badges{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}
#kc-panel .paw-profile-badges span{padding:5px 11px;border:1px solid #e3a0d1;background:#723e71;border-radius:30px;font-size:12px}
#kc-panel .paw-profile-theme-rose{background:linear-gradient(#53213f,#2f1725)}
#kc-panel .paw-profile-theme-midnight{background:linear-gradient(#24234c,#160f28)}
#kc-panel .paw-profile-theme-lavender{background:linear-gradient(#413569,#261c40)}
@container (max-width:740px){#kc-panel .paw-brandlockup{font-size:27px!important;padding:16px 0 0 7px!important}#kc-panel .paw-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:470px){#kc-panel .railtab[data-tab="catchup"] .ic{font-size:21px!important}#kc-panel .railtab[data-tab="catchup"] .tx{font-size:8.5px!important}}

/* v0.8.3: Keep the rail scrollable and anchor the decorative kitty into the panel corner
   so the art visually follows the chatbox curve instead of covering the lower buttons. */
#kc-panel .workspace{min-height:0!important}
#kc-panel .rail{
  box-sizing:border-box!important;
  min-height:0!important;
  height:100%!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  overscroll-behavior:contain!important;
  scrollbar-width:thin!important;
  scrollbar-color:#d77aa9 #2a182b!important;
  padding-bottom:clamp(126px,22%,178px)!important;
  scroll-padding-bottom:146px!important;
  align-content:start!important;
}
#kc-panel .rail .railtab{flex-shrink:0!important;isolation:isolate}
#kc-panel .railspacer{flex-shrink:0!important;min-height:4px!important}
#kc-panel .kc-deco-left-bottom{
  pointer-events:none!important;
  left:0!important;
  bottom:0!important;
  width:118px!important;
  height:124px!important;
  z-index:9!important;
  overflow:hidden!important;
  border-bottom-left-radius:34px!important;
  transform:none!important;
  display:flex!important;
  align-items:flex-end!important;
  justify-content:flex-start!important;
  filter:drop-shadow(0 8px 14px rgba(0,0,0,.42))!important;
}
#kc-panel .kc-deco-left-bottom .asset{width:100%!important;height:100%!important}
#kc-panel .kc-deco-left-bottom .asset img{
  object-fit:contain!important;
  object-position:left bottom!important;
  transform:translate(-6px,7px) scale(1.08)!important;
}
#kc-panel.kc-short .rail{padding-bottom:116px!important}
@container (max-width:1280px){
  #kc-panel .kc-deco-left-bottom{width:106px!important;height:112px!important}
  #kc-panel .kc-deco-left-bottom .asset img{transform:translate(-5px,6px) scale(1.05)!important}
}
@container (max-width:920px){
  #kc-panel .kc-deco-left-bottom{width:94px!important;height:98px!important}
  #kc-panel .kc-deco-left-bottom .asset img{transform:translate(-4px,4px) scale(1.02)!important}
}
@container (max-width:790px){#kc-panel .rail{padding-bottom:12px!important}}


/* v0.8.5: Layer the bottom-left cat above the sculpted frame outline. */
#kc-panel .kc-sculpted-frame{z-index:15!important}
#kc-panel .kc-deco-left-bottom{
 position:absolute!important;z-index:35!important;
 left:-9px!important;bottom:-8px!important;
 overflow:visible!important;border-radius:0!important;clip-path:none!important;
 pointer-events:none!important;filter:drop-shadow(0 5px 8px rgba(6,2,10,.56))!important;
}
#kc-panel .kc-deco-left-bottom .asset,
#kc-panel .kc-deco-left-bottom .asset img{overflow:visible!important;clip-path:none!important}
#kc-panel .kc-deco-left-bottom .asset img{transform:translate(0,0) scale(1.02)!important}
@container (max-width:1280px){#kc-panel .kc-deco-left-bottom{left:-7px!important;bottom:-7px!important}}
@container (max-width:920px){#kc-panel .kc-deco-left-bottom{left:-5px!important;bottom:-5px!important}}


/* v0.8.7 restored illustrated PawLounge header artwork */
#kc-panel .paw-image-brandlockup{padding:0!important;display:block!important;overflow:visible!important;pointer-events:none!important}
#kc-panel .paw-image-brandlockup .asset{width:100%!important;height:100%!important;display:block!important}
#kc-panel .paw-image-brandlockup .asset img{width:100%!important;height:100%!important;display:block!important;object-fit:contain!important;object-position:center center!important}

/* v0.8.8: Irregular, transparent PawLounge logo artwork.
   No solid rectangular image backing: the frame, kitten, ribbon and wordmark
   sit cleanly over the existing header border. Keep the art click-through. */
#kc-panel .brandlockup.paw-image-brandlockup{
  left:-14px!important;
  top:-11px!important;
  width:396px!important;
  height:172px!important;
  z-index:27!important;
  filter:drop-shadow(0 5px 6px rgba(11,2,15,.42))!important;
  pointer-events:none!important;
  background:transparent!important;
  overflow:visible!important;
}
#kc-panel .paw-image-brandlockup .asset{
  background:transparent!important;
  border:0!important;
  overflow:visible!important;
  width:100%!important;
  height:100%!important;
}
#kc-panel .paw-image-brandlockup .asset img{
  width:100%!important;height:100%!important;
  object-fit:fill!important;object-position:left top!important;
  display:block!important;max-width:none!important;
  background:transparent!important;
}
#kc-panel .brand-after-lockup{left:180px!important;top:108px!important;z-index:28!important}
/* The new logo includes its own hanging bow and bell. Do not render the
   duplicate ribbon art over the kitten's face. */
#kc-panel .kc-deco-left-ribbon{display:none!important}
@container (max-width:1280px){
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-10px!important;top:-8px!important;width:348px!important;height:151px!important;
  }
  #kc-panel .brand-after-lockup{left:160px!important;top:99px!important}
}
@container (max-width:920px){
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-8px!important;top:-5px!important;width:308px!important;height:133px!important;
  }
  #kc-panel .brand-after-lockup{left:137px!important;top:90px!important}
}
@container (max-width:740px){
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-3px!important;top:0!important;width:232px!important;height:99px!important;
  }
  #kc-panel .brand-after-lockup{display:none!important}
}
@container (max-width:480px){
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-4px!important;top:1px!important;width:193px!important;height:83px!important;
  }
}


/* v0.8.11: Compact rail with an unobstructed frame-side text gutter.
   This replaces the v0.8.10 110px/104px/100px wide navigation rail. */
#kc-panel .workspace{grid-template-columns:88px minmax(0,228px) minmax(0,1fr)!important}
#kc-panel .rail{
  box-sizing:border-box!important;min-width:0!important;
  padding-left:15px!important;padding-right:5px!important;
  display:flex!important;flex-direction:column!important;
  align-items:stretch!important;overflow-x:hidden!important;
  overflow-y:auto!important;scrollbar-width:thin!important;
}
#kc-panel .rail .railtab,#kc-panel .rail .railtab[data-tab="moments"]{
  box-sizing:border-box!important;position:relative!important;
  left:0!important;transform:none!important;
  display:flex!important;flex-direction:column!important;
  align-items:center!important;justify-content:center!important;
  flex:0 0 auto!important;width:100%!important;
  min-width:0!important;max-width:100%!important;
  padding:7px 2px!important;margin:0!important;
  overflow:visible!important;
}
#kc-panel .rail .railtab .tx,#kc-panel .rail .railtab[data-tab="moments"] .tx,
#kc-panel .rail .railtab[data-tab="catchup"] .tx{
  display:block!important;position:static!important;transform:none!important;
  box-sizing:border-box!important;width:100%!important;
  min-width:0!important;max-width:100%!important;
  margin:0!important;padding:0!important;
  font-size:10px!important;font-weight:760!important;
  letter-spacing:-.07px!important;line-height:1.18!important;
  text-align:center!important;white-space:normal!important;
  overflow-wrap:normal!important;word-break:normal!important;
  overflow:visible!important;text-overflow:clip!important;
}
@container (max-width:1280px){
 #kc-panel .workspace{grid-template-columns:80px minmax(0,200px) minmax(0,1fr)!important}
 #kc-panel .rail{padding-left:13px!important;padding-right:4px!important}
}
@container (max-width:1130px){
 #kc-panel .workspace{grid-template-columns:76px minmax(0,180px) minmax(0,1fr)!important}
 #kc-panel .rail{padding-left:10px!important;padding-right:4px!important}
}
@container (max-width:1050px){
 #kc-panel .workspace{grid-template-columns:74px minmax(0,170px) minmax(0,1fr)!important}
}
@container (max-width:920px){
 #kc-panel .workspace{grid-template-columns:72px minmax(0,164px) minmax(0,1fr)!important}
 #kc-panel .rail{padding-left:9px!important;padding-right:4px!important}
}
@container (max-width:780px){
 #kc-panel .workspace{grid-template-columns:66px minmax(0,1fr)!important;position:relative!important}
 #kc-panel .workspace>.main{grid-column:2!important}
 #kc-panel .workspace>.sidebar.compact-open{left:66px!important;width:min(275px,calc(100% - 66px))!important}
 #kc-panel.left-collapsed .workspace{grid-template-columns:66px minmax(0,1fr)!important}
 #kc-panel.left-collapsed .workspace>.sidebar.compact-open{display:flex!important}
 #kc-panel .rail{padding-left:7px!important;padding-right:3px!important}
 #kc-panel .rail .railtab .tx,#kc-panel .rail .railtab[data-tab="moments"] .tx,
 #kc-panel .rail .railtab[data-tab="catchup"] .tx{font-size:9.1px!important}
}
@container (max-width:520px){
 #kc-panel .workspace{grid-template-columns:60px minmax(0,1fr)!important}
 #kc-panel .workspace>.sidebar.compact-open{left:60px!important;width:min(275px,calc(100% - 60px))!important}
 #kc-panel.left-collapsed .workspace{grid-template-columns:60px minmax(0,1fr)!important}
 #kc-panel .rail{padding-left:5px!important;padding-right:2px!important}
 #kc-panel .rail .railtab .tx,#kc-panel .rail .railtab[data-tab="moments"] .tx,
 #kc-panel .rail .railtab[data-tab="catchup"] .tx{font-size:8.5px!important;letter-spacing:-.15px!important}
}
@container (min-width:781px){
 #kc-panel.left-collapsed .workspace{grid-template-columns:88px 0 minmax(0,1fr)!important}
}
@container (min-width:781px) and (max-width:1280px){
 #kc-panel.left-collapsed .workspace{grid-template-columns:80px 0 minmax(0,1fr)!important}
}
@container (min-width:781px) and (max-width:1130px){
 #kc-panel.left-collapsed .workspace{grid-template-columns:76px 0 minmax(0,1fr)!important}
}
@container (min-width:781px) and (max-width:1050px){
 #kc-panel.left-collapsed .workspace{grid-template-columns:74px 0 minmax(0,1fr)!important}
}
@container (min-width:781px) and (max-width:920px){
 #kc-panel.left-collapsed .workspace{grid-template-columns:72px 0 minmax(0,1fr)!important}
}

/* Restore collapse arrows WITHIN the chat area to avoid clipped negative edges.
   Leave message/panel scroll and cat frame artwork unchanged. */
#kc-panel{container-name:kc-pawlounge-shell!important}
#kc-panel .chatcenter{position:relative!important}
#kc-panel .chatcenter>.collapse-handle{
  position:absolute!important;top:100px!important;
  z-index:72!important;display:flex!important;
  visibility:visible!important;opacity:1!important;
  width:30px!important;height:30px!important;
  min-width:30px!important;min-height:30px!important;
  padding:0!important;border-radius:50%!important;
  align-items:center!important;justify-content:center!important;
  line-height:1!important;pointer-events:auto!important;
  touch-action:manipulation!important;
}
#kc-panel .chatcenter>.collapse-handle.left{left:8px!important;right:auto!important}
#kc-panel .chatcenter>.collapse-handle.right{right:8px!important;left:auto!important;display:flex!important}
#kc-panel .chatcenter>.collapse-handle .arr{display:block!important;line-height:1!important}
#kc-panel .sidebar>.kc-compact-close{display:none!important}
@container kc-pawlounge-shell (max-width:780px){
  #kc-panel .sidebar.compact-open>.kc-compact-close{
    display:grid!important;place-items:center!important;
    position:absolute!important;right:9px!important;top:8px!important;
    z-index:80!important;width:30px!important;height:30px!important;
    font-size:22px!important;line-height:1!important;
    color:#ffe3f0!important;background:#552241!important;
    border:1px solid #ff96c9!important;border-radius:50%!important;
    cursor:pointer!important;pointer-events:auto!important;
  }
}
@container kc-pawlounge-shell (max-width:1120px){
 #kc-panel .chatcenter>.collapse-handle.right{display:none!important}
}
@container kc-pawlounge-shell (max-width:780px){
 #kc-panel .chatcenter>.collapse-handle.left{display:flex!important;top:68px!important;left:7px!important}
}


/* v0.8.12 — Artwork-safe header & compact sidebar labels.
   Do not move the decorative frame or widen the 88px rail. The title asset
   can hang over the frame; navigation items must never start underneath it.
   The lower decorative black cat remains above the border but below controls. */
#kc-panel .brand-after-lockup{
  left:440px!important;
  top:96px!important;
  right:auto!important;
  width:max-content!important;
  max-width:calc(100% - 660px)!important;
  white-space:nowrap!important;
  z-index:28!important;
  pointer-events:none!important;
}
#kc-panel .brand-after-lockup small{
  display:block!important;
  font-size:11px!important;
  line-height:1.3!important;
  white-space:nowrap!important;
}
#kc-panel .rail{
  padding-top:35px!important;
  padding-bottom:124px!important;
  scroll-padding-top:35px!important;
  scroll-padding-bottom:124px!important;
  gap:4px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  overscroll-behavior-y:contain!important;
}
#kc-panel .rail .railtab,
#kc-panel .rail .railtab[data-tab="moments"]{
  flex:0 0 64px!important;
  height:64px!important;
  min-height:64px!important;
  max-height:64px!important;
  gap:2px!important;
  padding:5px 1px!important;
  position:relative!important;
  z-index:30!important;
}
#kc-panel .rail .railtab .ic{flex-shrink:0!important;max-width:100%!important}
#kc-panel .rail .railtab .tx{flex-shrink:0!important;line-height:1.15!important}
/* Decorative cat remains on the edge of the scrollable nav, behind controls. */
#kc-panel .kc-deco-left-bottom{pointer-events:none!important;z-index:19!important}
@container kc-pawlounge-shell (max-width:1280px){
  #kc-panel .brand-after-lockup{left:385px!important;top:92px!important;max-width:calc(100% - 575px)!important}
  #kc-panel .rail{padding-top:30px!important;padding-bottom:116px!important;scroll-padding-top:30px!important}
}
@container kc-pawlounge-shell (max-width:920px){
  #kc-panel .brand-after-lockup{left:333px!important;top:85px!important;max-width:calc(100% - 430px)!important}
  #kc-panel .rail{padding-top:24px!important;padding-bottom:105px!important;scroll-padding-top:24px!important}
}
@container kc-pawlounge-shell (max-width:780px){
  /* The corner cat otherwise covers the last navigation item on small windows. */
  #kc-panel .kc-deco-left-bottom{display:none!important}
  #kc-panel .brand-after-lockup{display:none!important}
  #kc-panel .rail{padding-top:17px!important;padding-bottom:92px!important;scroll-padding-top:17px!important}
  #kc-panel .rail .railtab,#kc-panel .rail .railtab[data-tab="moments"]{
    flex-basis:60px!important;height:60px!important;min-height:60px!important;max-height:60px!important
  }
}
@container kc-pawlounge-shell (max-width:740px){
  /* Both decorative cats are hidden at this width: give the nav its room back. */
  #kc-panel .rail{padding-top:10px!important;padding-bottom:12px!important;scroll-padding-top:10px!important;scroll-padding-bottom:12px!important}
}
#kc-panel.kc-short .rail{padding-top:10px!important;padding-bottom:12px!important}
#kc-panel.kc-short .rail .railtab,
#kc-panel.kc-short .rail .railtab[data-tab="moments"]{
  flex-basis:56px!important;height:56px!important;min-height:56px!important;max-height:56px!important
}


/* v0.8.13 — compact, artwork-safe navigation.  In BC's scaled UI, seven 64px
   tabs can fill the rail and put Settings directly on the corner cat.
   Keep all controls in normal flow, just use a smaller, consistent tab size. */
#kc-panel .rail{
  padding-top:27px!important;
  gap:3px!important;
  scroll-padding-top:27px!important;
  padding-bottom:132px!important;
  scroll-padding-bottom:132px!important;
}
#kc-panel .rail .railtab,
#kc-panel .rail .railtab[data-tab="moments"]{
  flex:0 0 53px!important;
  box-sizing:border-box!important;
  height:53px!important;min-height:53px!important;max-height:53px!important;
  padding:3px 1px!important;gap:1px!important;
}
#kc-panel .rail .railtab .ic{
  height:30px!important;min-height:0!important;
  line-height:1!important;flex:0 0 30px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
}
#kc-panel .rail .railtab[data-tab="moments"] .ic{height:30px!important;flex-basis:30px!important}
#kc-panel .rail .railtab .ic .asset{width:29px!important;height:29px!important}
#kc-panel .rail .railtab[data-tab="moments"] .kc-moments-icon{width:29px!important;height:29px!important}
#kc-panel .rail .railtab .tx,
#kc-panel .rail .railtab[data-tab="moments"] .tx,
#kc-panel .rail .railtab[data-tab="catchup"] .tx{
  font-size:9.8px!important;line-height:1.1!important;
  flex:0 0 auto!important;
}
/* The subtitle belongs to the logo's immediate right, not the middle of the header. */
#kc-panel .brand-after-lockup{left:380px!important;top:96px!important;max-width:calc(100% - 580px)!important}
/* The cat remains above the OUTER border, while the rail icons stay separate. */
#kc-panel .kc-deco-left-bottom{pointer-events:none!important;z-index:19!important}
@container kc-pawlounge-shell (max-width:1280px){
  #kc-panel .brand-after-lockup{left:325px!important;top:92px!important;max-width:calc(100% - 500px)!important}
  #kc-panel .rail{padding-top:24px!important;padding-bottom:122px!important;scroll-padding-top:24px!important}
}
@container kc-pawlounge-shell (max-width:920px){
  #kc-panel .brand-after-lockup{left:278px!important;top:85px!important;max-width:calc(100% - 390px)!important}
  #kc-panel .rail{padding-top:20px!important;padding-bottom:108px!important;scroll-padding-top:20px!important}
}
@container kc-pawlounge-shell (max-width:780px){
  #kc-panel .brand-after-lockup{display:none!important}
  #kc-panel .kc-deco-left-bottom{display:none!important}
  #kc-panel .rail{padding-top:12px!important;padding-bottom:12px!important;scroll-padding-top:12px!important;scroll-padding-bottom:12px!important}
  #kc-panel .rail .railtab,#kc-panel .rail .railtab[data-tab="moments"]{
    flex-basis:52px!important;height:52px!important;min-height:52px!important;max-height:52px!important;
  }
}
#kc-panel.kc-short .rail{padding-top:9px!important;padding-bottom:10px!important}
#kc-panel.kc-short .rail .railtab,#kc-panel.kc-short .rail .railtab[data-tab="moments"]{
  flex-basis:50px!important;height:50px!important;min-height:50px!important;max-height:50px!important;
}

/* v0.8.14 — compact contacts view. Save vertical height without reducing
   sidebar width, hiding message controls, or changing navigation/collapse arrows. */
#kc-panel .sidebar .side-shell{
  padding:8px 9px 8px!important;
  gap:6px!important;
  min-height:0!important;
}
/* Now Purring is a small summary rather than a full profile card. */
#kc-panel .side-shell>.side-card{
  min-height:0!important;height:auto!important;
  padding:7px 10px 8px!important;border-radius:15px!important;
}
#kc-panel .side-card .side-card-title{
  font-size:12px!important;line-height:16px!important;margin:0 0 3px!important;
}
#kc-panel .side-card .side-mainline{
  min-height:0!important;margin-top:0!important;gap:7px!important;align-items:center!important;
}
#kc-panel .side-card .side-mainline .avatar{
  width:38px!important;height:38px!important;min-width:38px!important;
  min-height:38px!important;flex:0 0 38px!important;
}
#kc-panel .side-card .side-mainline>div{min-width:0!important}
#kc-panel .side-card .side-mainline>div>div:first-child{
  font-size:13px!important;line-height:1.2!important;
  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
}
#kc-panel .side-card .side-mainline .muted{
  font-size:11px!important;line-height:1.2!important;
  max-width:100%!important;white-space:nowrap!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
#kc-panel .side-card .side-mainline .kc-status-label{
  font-size:10px!important;line-height:1.15!important;
  white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
  margin:2px 0 0!important;
}
#kc-panel .side-card .hero-heart{font-size:18px!important;flex:0 0 auto!important}
/* Contacts circles and search keep usable hit targets, with reduced empty space. */
#kc-panel .side-shell>.paw-circle-row{
  box-sizing:border-box!important;gap:5px!important;
  flex:0 0 32px!important;height:32px!important;min-height:32px!important;
}
#kc-panel .paw-circle-row .field{
  box-sizing:border-box!important;height:32px!important;min-height:32px!important;
  max-height:32px!important;padding:3px 6px!important;
  font-size:11px!important;line-height:1.2!important;
}
#kc-panel .paw-circle-row .secondary{
  box-sizing:border-box!important;height:32px!important;min-height:32px!important;
  padding:3px 8px!important;font-size:11px!important;
}
#kc-panel .side-search{min-height:0!important}
#kc-panel .side-search .search{
  box-sizing:border-box!important;height:36px!important;min-height:36px!important;
  padding:6px 37px 6px 12px!important;font-size:12px!important;
}
#kc-panel .side-search .pawhint{font-size:16px!important}
/* Filters stay horizontally scrollable; trim the dead space around the bar. */
#kc-panel .kc-inbox-filter-wrap{
  gap:4px!important;padding:0!important;
  margin:0!important;min-height:0!important;
}
#kc-panel .kc-inbox-filter-wrap>.kc-inbox-filters{
  align-items:center!important;padding:0!important;
}
#kc-panel .kc-inbox-filter-wrap .filterbtn{
  box-sizing:border-box!important;height:33px!important;min-height:33px!important;
  max-height:33px!important;padding:5px 8px!important;
  font-size:11px!important;line-height:1.2!important;
}
#kc-panel .kc-filter-scroll-controls{
  height:14px!important;min-height:14px!important;flex-basis:14px!important;
  gap:5px!important;
}
#kc-panel .kc-filter-scroll-btn{height:14px!important;font-size:14px!important}
#kc-panel .kc-filter-scroll-track{height:9px!important}
#kc-panel .kc-filter-scroll-thumb{height:5px!important}
/* Denser, still readable contact rows. Unread badges and statuses stay visible. */
#kc-panel .contacts-scroll>.side-list{gap:2px!important;padding:0 0 3px!important}
#kc-panel .contacts-scroll .contact{
  box-sizing:border-box!important;min-height:52px!important;height:auto!important;
  padding:4px 6px!important;gap:7px!important;border-radius:12px!important;
}
#kc-panel .contacts-scroll .contact .avatar{
  width:36px!important;height:36px!important;min-width:36px!important;
  min-height:36px!important;flex:0 0 36px!important;
}
#kc-panel .contact .info{min-width:0!important}
#kc-panel .contact .topline{gap:4px!important;min-width:0!important}
#kc-panel .contact .nameline{
  font-size:13px!important;line-height:1.18!important;min-width:0!important;
}
#kc-panel .contact .time{font-size:10px!important;line-height:1.2!important}
#kc-panel .contact .preview{
  font-size:11px!important;line-height:1.2!important;
  margin-top:1px!important;
}
#kc-panel .contact .kc-status-label{
  font-size:10px!important;line-height:1.18!important;
  white-space:nowrap!important;overflow:hidden!important;
  text-overflow:ellipsis!important;margin-top:1px!important;
}
#kc-panel .contact .tiny-pill{
  font-size:10px!important;min-width:19px!important;
  padding:2px 4px!important;
}
#kc-panel .contact .presence{width:8px!important;height:8px!important;flex:0 0 8px!important}
#kc-panel .contacts-scroll .groupbar{
  padding:7px 0 2px!important;margin:4px 1px 2px!important;
}
#kc-panel .contacts-scroll .groupbar b{font-size:13px!important}
#kc-panel .contacts-scroll .group-stack{gap:3px!important;margin-bottom:3px!important}
#kc-panel .contacts-scroll .group-item{
  min-height:53px!important;padding:5px 7px!important;border-radius:12px!important;
}
#kc-panel .side-shell>.new-kitty{
  box-sizing:border-box!important;min-height:34px!important;
  height:34px!important;padding:6px 9px!important;
  border-radius:13px!important;flex-shrink:0!important;
}
/* Short-height windows: keep the Now Purring summary rather than deleting it,
   but reduce it further to preserve a usable scrolling contacts area. */
#kc-panel.kc-short .side-shell>.side-card{display:block!important;padding:5px 9px!important}
#kc-panel.kc-short .side-card .side-card-title{margin-bottom:2px!important}
#kc-panel.kc-short .side-card .side-mainline .avatar{
  width:32px!important;height:32px!important;min-width:32px!important;
  min-height:32px!important;flex-basis:32px!important;
}

/* v0.8.16: one default All inbox option, without the horizontal track.
   Its content remains searchable through Search kitties and BC Friends/Circles. */
#kc-panel .kc-single-inbox-filter{
  display:flex!important;
  margin:0!important;
  padding:0!important;
  gap:0!important;
  min-height:0!important;
  flex:0 0 auto!important;
}
#kc-panel .kc-single-inbox-filter>.kc-inbox-filters{
  overflow:hidden!important;
  flex:0 0 30px!important;
  width:100%!important;
  height:30px!important;
  padding:0!important;
  margin:0!important;
  align-items:center!important;
}
#kc-panel .kc-single-inbox-filter .filterbtn{
  box-sizing:border-box!important;
  height:29px!important;
  min-height:29px!important;
  padding:4px 14px!important;
  border-radius:15px!important;
}


/* v0.8.19 — Keep the decorative PawLounge lockup within the header instead
   of letting its lower half obscure Now Purring or the first rail button.
   Retain transparent artwork, unmodified sidebar/card scrolling, and all
   collapse handles. A wider header is unnecessary: recover space by sizing
   the logo proportionally and reserving only 24px more height. */
#kc-panel .hero{
  height:126px!important;min-height:126px!important;max-height:126px!important;
}
#kc-panel .brandlockup.paw-image-brandlockup{
  left:-7px!important;top:-13px!important;
  width:304px!important;height:139px!important;
  overflow:visible!important;pointer-events:none!important;
}
#kc-panel .brand-after-lockup{
  left:312px!important;top:88px!important;
  max-width:calc(100% - 510px)!important;
}
@container kc-pawlounge-shell (max-width:1280px){
  #kc-panel .hero{height:119px!important;min-height:119px!important;max-height:119px!important}
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-6px!important;top:-11px!important;width:282px!important;height:129px!important;
  }
  #kc-panel .brand-after-lockup{left:291px!important;top:84px!important;max-width:calc(100% - 450px)!important}
}
@container kc-pawlounge-shell (max-width:920px){
  #kc-panel .hero{height:106px!important;min-height:106px!important;max-height:106px!important}
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-4px!important;top:-7px!important;width:240px!important;height:110px!important;
  }
  #kc-panel .brand-after-lockup{left:249px!important;top:76px!important;max-width:calc(100% - 365px)!important}
}
@container kc-pawlounge-shell (max-width:780px){
  #kc-panel .hero{height:101px!important;min-height:101px!important;max-height:101px!important}
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-3px!important;top:-2px!important;width:220px!important;height:101px!important;
  }
  #kc-panel .brand-after-lockup{display:none!important}
}
@container kc-pawlounge-shell (max-width:480px){
  #kc-panel .hero{height:85px!important;min-height:85px!important;max-height:85px!important}
  #kc-panel .brandlockup.paw-image-brandlockup{
    left:-3px!important;top:-1px!important;width:180px!important;height:83px!important;
  }
}
/* Height-constrained popups remain usable and keep the short mode's condensed
   sidebar, with the logo still fully clear of the first contacts and tabs. */
#kc-panel.kc-short .hero{height:75px!important;min-height:75px!important;max-height:75px!important}
#kc-panel.kc-short .brandlockup.paw-image-brandlockup{
  left:-2px!important;top:-5px!important;width:170px!important;height:78px!important;
}
#kc-panel.kc-short .brand-after-lockup{display:none!important}
/* v0.9.0 — PawLounge Social Studio */
#kc-panel .paw-draggable{cursor:grab!important;outline:1px dashed var(--accent);outline-offset:1px}
#kc-panel .paw-schedule{margin:2px 10px;padding:6px 9px;background:#28182a99;border:1px solid var(--border);border-radius:11px;max-height:124px;overflow-y:auto;font-size:11px}
#kc-panel .paw-schedule-head,.paw-schedule-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
#kc-panel .paw-schedule button{font-size:10px;padding:3px 6px}
#kc-panel .paw-schedule-row span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#kc-panel .paw-nickname{font-size:11px;padding:2px 5px;vertical-align:middle}
#kc-panel .paw-cover{position:relative;overflow:hidden;border:2px solid #e991bd;border-radius:16px;background:linear-gradient(135deg,var(--paw-cover),#22142c);min-height:120px;margin:8px 0;display:flex;align-items:end;justify-content:center;box-shadow:0 4px 14px #0004}
#kc-panel .paw-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.65}
#kc-panel .paw-cover-label{position:relative;z-index:1;text-shadow:0 1px 7px #000;padding:16px;font-size:22px;color:white;text-align:center;font-weight:900}
#kc-panel .paw-cover-polaroid{border:9px solid #fff1f6;border-bottom-width:22px;border-radius:4px}
#kc-panel .paw-cover-floral{border:4px double #f8a8d1;border-radius:30px}
#kc-panel .paw-album-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
#kc-panel .paw-page-layout-list{display:flex;flex-direction:column}
#kc-panel .paw-page-layout-polaroid{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
#kc-panel .paw-page{min-width:0;background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:9px}
#kc-panel .paw-page-layout-polaroid .paw-page{border:8px solid #fff2f7;border-bottom-width:16px;color:#2c1530;border-radius:3px}
#kc-panel .paw-page img{display:block;max-width:100%;max-height:240px;object-fit:contain}
#kc-panel .paw-memory-actions{display:flex;flex-wrap:wrap;gap:3px}
#kc-panel .paw-memory-actions button{padding:3px 6px;font-size:11px}
#kc-panel .paw-memory-comment{border-top:1px solid var(--border);font-size:11px;padding:4px 2px;word-break:break-word}
#kc-panel .paw-den-extras{display:flex;flex-direction:column;gap:8px}
#kc-panel .paw-poll{border:1px solid var(--border);border-radius:9px;padding:7px;display:flex;flex-direction:column;gap:4px}
#kc-panel .paw-poll-choice{border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--ink);text-align:left;padding:5px}
#kc-panel .paw-poll-choice.selected{background:var(--accent);color:var(--bg)}
#kc-panel .paw-privacy{border:1px solid var(--border);border-radius:10px;padding:12px;margin:12px 0;display:flex;flex-direction:column;gap:5px;font-size:12px}
#kc-panel .paw-privacy h3{margin:0 0 3px}
#kc-panel[data-paw-bubble-shape="square"] .msgbubble{border-radius:5px!important}
#kc-panel[data-paw-bubble-shape="cloud"] .msgbubble{border-radius:28px 28px 24px 8px!important}
#kc-panel .msgrow.mine .msgbubble{background:color-mix(in srgb,var(--bubble) var(--paw-bubble-opacity,95%),transparent)!important}
#kc-panel .msgrow.other .msgbubble{background:color-mix(in srgb,var(--bubble2) var(--paw-bubble-opacity,95%),transparent)!important}
#kc-panel.paw-minimalist .kc-deco,#kc-panel.paw-minimalist .kc-deco-left-bottom,#kc-panel.paw-minimalist .kc-deco-right-top,#kc-panel.paw-minimalist .brandlockup,#kc-panel.paw-minimalist .brand-after-lockup,#kc-panel.paw-minimalist .chat-float-kitten{display:none!important}
#kc-panel.paw-minimalist .hero{background:var(--bg)!important}
/* v0.9.3 — Keep the contacts/chat grid coherent at resized window sizes.
   Earlier viewport breakpoint rules were hiding the sidebar even when the
   resizable panel still had room. The native 3-column grid must win over
   those rules; otherwise the collapse arrow/composer render underneath the
   contacts overlay and can disappear from view. */
@container kc-pawlounge-shell (min-width:781px){
  #kc-panel .workspace:not(.wide)>.rail{
    grid-column:1!important;grid-row:1!important;
  }
  #kc-panel:not(.left-collapsed) .workspace:not(.wide)>.sidebar{
    display:flex!important;grid-column:2!important;grid-row:1!important;
    position:relative!important;
  }
  #kc-panel .workspace:not(.wide)>.main{
    display:flex!important;grid-column:3!important;grid-row:1!important;
    min-width:0!important;overflow:hidden!important;
  }
  #kc-panel .chatcenter>.collapse-handle.left{
    display:flex!important;visibility:visible!important;opacity:1!important;
    left:8px!important;z-index:75!important;
  }
}
/* Compact-width overlay retains its dedicated sidebar toggle. */
@container kc-pawlounge-shell (max-width:780px){
  #kc-panel .workspace:not(.wide)>.main{grid-column:2!important}
  #kc-panel .chatcenter>.collapse-handle.left{
    display:flex!important;visibility:visible!important;opacity:1!important;
  }
}

/* v0.9.3 — clearer, softer type without sacrificing compact contact density.
   Use local/browser system fonts, never a network-loaded font. Text hierarchy
   is scoped to PawLounge and keeps light themes, bright message bubbles,
   notification colors and existing text-size preferences readable. */
#kc-panel{
  --paw-text-main:#fff9fd;
  --paw-text-secondary:#f3d6e8;
  --paw-text-muted:#e8c0d8;
  --paw-text-shadow:0 1px 2px #100611b8;
  font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif!important;
  font-feature-settings:'kern' 1;
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
}
#kc-panel.theme-lavender{
  --paw-text-main:#fdf8ff;--paw-text-secondary:#eae0fc;
  --paw-text-muted:#d5c6ef;
}
#kc-panel.theme-pink{
  --paw-text-main:#51213d;--paw-text-secondary:#653653;
  --paw-text-muted:#815b75;--paw-text-shadow:none;
}
#kc-panel.theme-cream{
  --paw-text-main:#543c2c;--paw-text-secondary:#72513d;
  --paw-text-muted:#836c58;--paw-text-shadow:none;
}
#kc-panel button,#kc-panel input,#kc-panel textarea,#kc-panel select{
  font-family:inherit!important;
}
/* Names provide the primary visual anchors in dense lists and open chats. */
#kc-panel .contact .nameline,#kc-panel .headtitle,
#kc-panel .group-name,#kc-panel .side-mainline b{
  color:var(--paw-text-main)!important;
  font-weight:850!important;
  letter-spacing:-.18px!important;
  text-shadow:var(--paw-text-shadow)!important;
}
#kc-panel .contact .nameline{font-size:13.5px!important;line-height:1.2!important}
#kc-panel.text-large .contact .nameline{font-size:14.5px!important}
#kc-panel.text-extra .contact .nameline{font-size:16px!important}
#kc-panel .contact .preview,#kc-panel .group-sub{
  color:var(--paw-text-secondary)!important;
  font-weight:520!important;
  letter-spacing:.03px!important;
  line-height:1.3!important;
  text-shadow:var(--paw-text-shadow)!important;
}
#kc-panel .contact .preview{font-size:11.5px!important}
#kc-panel.text-large .contact .preview{font-size:12.5px!important}
#kc-panel.text-extra .contact .preview{font-size:14px!important}
/* Strong enough to read at a glance, subordinate to the contact name. */
#kc-panel .contact .time,#kc-panel .headsubtitle,
#kc-panel .muted,#kc-panel .msgmeta{
  color:var(--paw-text-muted)!important;
  font-weight:530!important;
  text-shadow:var(--paw-text-shadow)!important;
}
#kc-panel .headsubtitle{font-size:12px!important;line-height:1.36!important}
#kc-panel .msgmeta{font-size:11px!important;line-height:1.35!important}
#kc-panel .side-card-title,#kc-panel .groupbar b{
  color:#ff9aca!important;
  font-weight:850!important;
  text-shadow:0 1px 2px #1a0618aa!important;
  letter-spacing:-.15px!important;
}
#kc-panel.theme-pink .side-card-title,#kc-panel.theme-pink .groupbar b{color:#a33270!important;text-shadow:none!important}
#kc-panel.theme-cream .side-card-title,#kc-panel.theme-cream .groupbar b{color:#865025!important;text-shadow:none!important}
#kc-panel .railtab .tx{font-weight:800!important;text-shadow:0 1px 2px #130817b0!important}
#kc-panel .filterbtn,#kc-panel .secondary,#kc-panel .quick .pill{
  font-weight:690!important;
  letter-spacing:.05px!important;
}
#kc-panel .search,#kc-panel textarea.field,#kc-panel .composer .field{
  color:var(--paw-text-main)!important;
  font-weight:540!important;
  letter-spacing:.08px!important;
}
#kc-panel .search::placeholder,#kc-panel textarea::placeholder,#kc-panel .field::placeholder{
  color:var(--paw-text-muted)!important;
  opacity:.95!important;
  font-weight:450!important;
}
/* Preserve the user's personalized bubble shape/opacity and the outgoing
   bubble's dark-on-pink readability. Improve only actual message typography. */
#kc-panel .msgbubble{
  font-family:inherit!important;
  font-weight:535!important;
  line-height:1.52!important;
  letter-spacing:.07px!important;
}
#kc-panel .msgrow.other .msgbubble{
  color:var(--paw-text-main)!important;
  text-shadow:var(--paw-text-shadow)!important;
}
/* The earlier Social Studio opacity rule used a dark mauve background with
   dark foreground text in the default theme. Restore the intended bright
   pink bubble while honoring the opacity control and themed palettes. */
#kc-panel .msgrow.mine .msgbubble{
  background:color-mix(in srgb,#f48bb7 var(--paw-bubble-opacity,95%),transparent)!important;
  color:#351226!important;
  text-shadow:none!important;
}
#kc-panel.theme-lavender .msgrow.mine .msgbubble{
  background:color-mix(in srgb,#d5baf6 var(--paw-bubble-opacity,95%),transparent)!important;
  color:#2a153d!important;
}
#kc-panel.theme-pink .msgrow.mine .msgbubble{
  background:color-mix(in srgb,#ffd7e9 var(--paw-bubble-opacity,95%),transparent)!important;
  color:#51213d!important;
}
#kc-panel.theme-cream .msgrow.mine .msgbubble{
  background:color-mix(in srgb,#f5dfbb var(--paw-bubble-opacity,95%),transparent)!important;
  color:#543c2c!important;
}
#kc-panel .chatlayout[data-paw-chat-theme="rose"] .msgrow.mine .msgbubble{
  background:color-mix(in srgb,#ff9bbf var(--paw-bubble-opacity,95%),transparent)!important;
  color:#491728!important;
}

/* v0.9.7 — Keep the right widget arrow visible at every panel width.
   On compact panel sizes, reveal the companion as a slide-over drawer, not a
   second grid column. This avoids crushing the message composer at 900px. */
#kc-panel .chatcenter>.collapse-handle.right{
  display:flex!important;visibility:visible!important;opacity:1!important;
  pointer-events:auto!important;right:8px!important;left:auto!important;
  z-index:78!important;
}
#kc-panel .companion>.kc-drawer-close{display:none!important}
@container kc-pawlounge-shell (max-width:1120px){
  #kc-panel .chatlayout{
    position:relative!important;
    grid-template-columns:minmax(0,1fr)!important;
  }
  #kc-panel .chatcenter>.collapse-handle.right{
    display:flex!important;visibility:visible!important;opacity:1!important;
  }
  /* A drawer can open even if desktop profile details were previously collapsed. */
  #kc-panel.right-drawer-open .chatlayout>.companion{
    display:flex!important;position:absolute!important;
    top:0!important;right:0!important;bottom:0!important;
    left:auto!important;
    width:min(320px,calc(100% - 42px))!important;
    height:100%!important;max-height:100%!important;
    min-width:0!important;
    z-index:82!important;
    overflow-y:auto!important;
    padding-top:51px!important;
    background:var(--bg)!important;
    border:1px solid var(--accent)!important;
    border-radius:18px 0 0 18px!important;
    box-shadow:-12px 0 25px #08040eae!important;
  }
  #kc-panel.right-drawer-open .chatcenter>.collapse-handle.right{display:none!important}
  #kc-panel.right-drawer-open .companion>.kc-drawer-close{
    display:flex!important;align-items:center!important;justify-content:center!important;
    position:absolute!important;top:9px!important;right:10px!important;
    z-index:85!important;flex:none!important;
    width:32px!important;height:32px!important;
    border-radius:50%!important;
    border:1px solid #ff92c2!important;
    background:linear-gradient(180deg,#52253e,#28132f)!important;
    color:#ffd5e8!important;font-size:22px!important;font-weight:900!important;
    box-shadow:0 4px 12px #0006!important;cursor:pointer!important;
    pointer-events:auto!important;
  }
}

/* v0.9.8 — Dedicated Groups tab and vertically compact group inbox. */
#kc-panel .paw-groups-shell{min-height:0;display:flex;flex-direction:column;gap:9px;height:100%}
#kc-panel .paw-groups-heading{display:flex;align-items:center;justify-content:space-between;gap:7px;padding:10px 4px 5px;flex:0 0 auto;min-width:0}
#kc-panel .paw-groups-heading .side-card-title{font-size:16px!important;margin:0 0 3px!important}
#kc-panel .paw-groups-heading .muted{font-size:11px!important}
#kc-panel .paw-groups-heading .group-plus{flex:0 0 auto;padding:8px 10px;min-height:34px}
#kc-panel .paw-groups-shell>.side-search{flex:0 0 auto}
#kc-panel .paw-group-scroll{min-height:0;flex:1 1 auto;overflow-y:auto!important;overflow-x:hidden!important;padding-bottom:15px}
#kc-panel .paw-group-scroll .groupbar{margin:6px 0!important;padding:8px 0 3px!important;border-top:0!important}
#kc-panel .paw-group-scroll .group-stack{max-height:none!important;overflow:visible!important;display:grid!important;gap:7px!important}
#kc-panel .paw-group-scroll .group-item{width:100%;min-width:0;max-width:100%;padding:9px 7px!important;gap:7px!important;text-align:left}
#kc-panel .paw-group-info{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;gap:4px}
#kc-panel .paw-group-info .group-name,#kc-panel .paw-group-info .group-sub{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#kc-panel .paw-group-scroll .group-invite{margin:0!important}
#kc-panel .paw-group-empty-list{font-size:12px;line-height:1.5;padding:13px 8px}
#kc-panel .paw-group-empty{display:flex;align-items:center;justify-content:center;min-height:0;height:100%;padding:22px;text-align:center}
#kc-panel .paw-groups-shell>.new-kitty{flex:0 0 auto}
#kc-panel .rail .railtab[data-tab="groups"] .ic{font-size:26px;line-height:1}

/* v0.9.9 — Keep the close control above the ornamental frame at all sizes.
   Its stacking order must beat the SVG (15) and the top kitten (19). */
#kc-panel .heroactions{z-index:36!important;position:relative!important}
#kc-panel .heroactions .closekitty{position:relative!important;z-index:37!important;isolation:isolate!important}
#kc-panel .kc-sculpted-frame{pointer-events:none!important}


/* v0.9.12 — Zero-flicker delivery indicators and compact outbox. */
#kc-panel .kc-outbox{border:1px solid #d78bbb66;border-radius:12px;background:#321c33bf;padding:4px 9px;max-height:102px;overflow-y:auto;scrollbar-width:thin}
#kc-panel .kc-outbox-title{font-weight:780;font-size:11px;color:#ffd0e8;margin-bottom:2px}
#kc-panel .kc-outbox-row{display:flex;align-items:center;gap:6px;font-size:10px;padding:2px 0;border-top:1px solid #eeb7d522;min-width:0}
#kc-panel .kc-outbox-preview{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:35%;flex:1;color:#ffe3f0}
#kc-panel .kc-outbox-status{color:#f5bfdb;font-size:10px;flex:1;line-height:1.2}
#kc-panel .kc-outbox-row .secondary{font-size:10px;padding:3px 7px;white-space:nowrap}
#kc-panel .kc-delivery{color:#fbd2e6;font-size:10px;white-space:normal}


/* v0.9.17: Security modal always above both drawers, input masked by default. */
#kc-panel .paw-secure-overlay{position:absolute;inset:0;z-index:1800;background:rgba(14,6,20,.83);display:flex;justify-content:center;align-items:center;padding:18px;overflow:auto}
#kc-panel .paw-secure-overlay.hidden{display:none!important}
#kc-panel .paw-secure-dialog{width:min(460px,100%);max-height:90%;overflow:auto;padding:20px;border:2px solid #ed8dbb;border-radius:20px;background:#28152e;box-shadow:0 14px 55px #0009;color:#ffe9f5}
#kc-panel .paw-secure-dialog h3{font-size:20px;margin:0 0 10px}
#kc-panel .paw-secure-dialog .field{width:100%;margin:8px 0}
#kc-panel .paw-secure-dialog .flex{flex-wrap:wrap;margin-top:12px}
#kc-panel .paw-secure-dialog p{line-height:1.5}
/* PawBooks 1.0 — bookshelf, chapters, timeline, collaborative annotations */
#kc-panel .railtab[data-tab="pawbooks"] .ic{font-size:25px;line-height:1}
#kc-panel .railtab[data-tab="pawbooks"] .tx{font-size:9.6px!important;letter-spacing:-.25px}
#kc-panel .workspace.wide>.sidebar{display:none!important}
#kc-panel .workspace.wide>.main{grid-column:2 / -1!important;grid-row:1!important;width:100%!important;min-width:0!important}
#kc-panel .pawbooks-screen{padding:18px 22px 24px;max-width:none;overflow-y:auto;min-width:0;height:100%}
#kc-panel .pawbook-heading{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:0 0 12px}
#kc-panel .pawbook-heading h2{font:800 clamp(18px,2vw,24px)/1.3 system-ui,sans-serif;color:#ffe9f5;margin:0;flex:1}
#kc-panel .pawbook-heading span{color:#ebb4d7}
#kc-panel .pawbook-toolbar,#kc-panel .pawbook-tools{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:10px 0}
#kc-panel .pawbook-toolbar .field{min-width:180px;max-width:380px;width:100%}
#kc-panel .pawbook-tools .secondary,#kc-panel .pawbook-toolbar button{font-size:11px;padding:6px 10px;min-height:28px}
#kc-panel .pawbook-shelf{display:grid;grid-template-columns:repeat(auto-fill,minmax(164px,1fr));gap:14px;padding:15px 0 25px}
#kc-panel .pawbook-shelf-card{display:flex;flex-direction:column;align-items:stretch;gap:7px;text-align:left;min-width:0;min-height:245px;padding:9px;background:linear-gradient(150deg,#482341,#281928);border:1px solid #be80a4;border-radius:14px;color:#ffe6f4;cursor:pointer;box-shadow:0 8px 20px #180b1b77}
#kc-panel .pawbook-shelf-card:hover{border-color:#ffb5d8;transform:translateY(-2px)}
#kc-panel .pawbook-shelf-card .paw-cover{height:170px!important;min-height:170px!important;width:100%!important;max-width:none!important}
#kc-panel .pawbook-shelf-card strong{font-size:13px;overflow-wrap:anywhere}
#kc-panel .pawbook-shelf-card small{font-size:11px;color:#ffc7e5}
#kc-panel .pawbook-cover-hero{display:flex;align-items:center;gap:20px;padding:16px;background:#301c30;border:1px solid #7c4f71;border-radius:17px;margin:10px 0 14px}
#kc-panel .pawbook-cover-hero>.paw-cover{width:145px!important;min-width:145px;height:175px;max-height:175px}
#kc-panel .pawbook-cover-hero>div:nth-child(2){min-width:0;flex:1}
#kc-panel .pawbook-cover-hero strong{font-size:18px;color:#ffe5f3;overflow-wrap:anywhere}
#kc-panel .pawbook-cover-hero p{margin:5px 0;color:#e8bdd6}
#kc-panel .pawbook-memberlist{display:flex;flex-wrap:wrap;gap:7px}
#kc-panel .pawbook-memberlist>span{font-size:11px;border-radius:15px;background:#52304d;padding:6px 9px}
#kc-panel .pawbook-memberlist button{font-size:10px;padding:2px 6px}
#kc-panel .pawbook-chapter{padding:17px;margin:16px 0;background:linear-gradient(160deg,#3b2439,#261a30);border:1px solid #895e7b;border-radius:15px;min-width:0}
#kc-panel .pawbook-chapter-head{display:flex;justify-content:space-between;flex-wrap:wrap;align-items:center;gap:6px;font-size:17px;font-weight:750;color:#ffe9f3}
#kc-panel .pawbook-page-caption{font-style:italic;font-size:12px;color:#f9cce6;margin:10px 0}
#kc-panel .pawbook-canvas{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:11px;margin:14px 0}
#kc-panel .pawbook-layout-list{grid-template-columns:1fr}
#kc-panel .pawbook-layout-polaroid .pawbook-memory{border:7px solid #f8e4e7;background:#e9d7e2;color:#42243b;transform:rotate(-1deg)}
#kc-panel .pawbook-layout-polaroid .pawbook-memory:nth-child(2n){transform:rotate(1deg)}
#kc-panel .pawbook-layout-polaroid .pawbook-memory p,#kc-panel .pawbook-layout-polaroid .pawbook-memory small{color:#4b2c42}
#kc-panel .pawbook-layout-collage{display:block;position:relative;min-height:550px;max-width:100%;border:2px dashed #b880a1;border-radius:12px;background:radial-gradient(#8a577944 1px,transparent 1px);background-size:18px 18px;overflow:hidden}
#kc-panel .pawbook-layout-collage .pawbook-memory{position:absolute;width:22%;min-width:130px;max-width:235px;cursor:grab;touch-action:none;user-select:none;z-index:1}
#kc-panel .pawbook-layout-collage .pawbook-memory:active{cursor:grabbing;z-index:4}
#kc-panel .pawbook-memory{padding:12px;border-radius:11px;border:1px solid #a67397;background:#4c304d;min-width:0;box-shadow:0 3px 10px #13081644;color:#fff3fa}
#kc-panel .pawbook-memory-title{font-size:13px;font-weight:750;overflow-wrap:anywhere}
#kc-panel .pawbook-memory img{display:block;max-width:100%;max-height:220px;object-fit:contain;margin:8px auto;border-radius:7px}
#kc-panel .pawbook-memory p{font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45;color:inherit}
#kc-panel .pawbook-memory small{display:block;color:#f7c2dc;font-size:10px}
#kc-panel .pawbook-memory .pawbook-tools{margin:7px 0 0}
#kc-panel .pawbook-memory .pawbook-tools button{min-height:24px;font-size:10px;padding:4px 7px}
#kc-panel .pawbook-memo{font:italic 12px Georgia,serif;background:#fff4;line-height:1.4;border-radius:6px;padding:8px}
#kc-panel .pawbook-tags{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0}
#kc-panel .pawbook-tags span{background:#ef9fc34d;padding:3px 6px;border-radius:9px;font-size:10px}
#kc-panel .pawbook-comment{padding:4px 7px;border-left:2px solid #f7b6d7;font-size:11px!important}
#kc-panel .pawbook-seal{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:175px;background:linear-gradient(145deg,#4b274d,#2d253e);border:1px solid #d38bad;border-radius:12px;text-align:center}
#kc-panel .pawbook-seal span{font-size:44px}
#kc-panel .pawbook-seal strong{font-size:16px}
#kc-panel .pawbook-seal small{color:#f7cee7}
#kc-panel .pawbook-empty{padding:30px 15px;text-align:center;border:1px dashed #b673a2;border-radius:15px;color:#ebc0da}
#kc-panel .pawbook-activity,#kc-panel .pawbook-chronicle{padding:15px;margin:12px 0;border:1px solid #986586;border-radius:12px;background:#312235}
#kc-panel .pawbook-activity>div,#kc-panel .pawbook-chronicle>div{padding:7px;border-bottom:1px solid #865875;overflow-wrap:anywhere;color:#f8d9e8}
#kc-panel .pawbook-chronicle small{display:inline;color:#ebc6dd}
#kc-panel .pawbook-invite{padding:13px;background:#563052;border:1px solid #da9abd;border-radius:10px;margin:9px 0}
@container (max-width:700px){#kc-panel .pawbooks-screen{padding:10px}#kc-panel .pawbook-cover-hero{flex-wrap:wrap}#kc-panel .pawbook-chapter{padding:10px}#kc-panel .pawbook-shelf{grid-template-columns:repeat(auto-fill,minmax(132px,1fr))}#kc-panel .pawbook-canvas{grid-template-columns:1fr}#kc-panel .pawbook-layout-collage .pawbook-memory{min-width:100px}}


/* v1.0.4 — Compact conversation-header outbox. It must never consume a row
   or compress the message log / composer. The existing details and retry
   buttons remain in an on-demand floating popover. */
#kc-panel .chatcenter{position:relative!important}
#kc-panel .chathead .headblock{min-width:0!important}
#kc-panel .chathead .kc-header-subrow{display:flex!important;align-items:center!important;gap:7px!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important}
#kc-panel .kc-header-subtext{min-width:0!important;flex:0 1 auto!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
#kc-panel .kc-outbox-trigger{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;gap:3px!important;min-height:24px!important;min-width:27px!important;padding:2px 6px!important;margin:0!important;border:1px solid #bf739d99!important;border-radius:12px!important;background:#49304a!important;color:#ffe1f0!important;font-size:10px!important;font-weight:700!important;line-height:1.1!important;cursor:pointer!important;box-shadow:none!important}
#kc-panel .kc-outbox-trigger:hover,#kc-panel .kc-outbox-trigger[aria-expanded="true"]{border-color:#ffc2e2!important;background:#613854!important}
#kc-panel .kc-outbox-trigger:focus-visible,#kc-panel .kc-outbox-close:focus-visible{outline:2px solid #ffb5db!important;outline-offset:2px!important}
#kc-panel .kc-outbox-trigger-count{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:16px!important;height:16px!important;padding:0 3px!important;border-radius:9px!important;background:#f27eb1!important;color:#271222!important;font-size:10px!important}
#kc-panel .kc-outbox-trigger-count[hidden]{display:none!important}
#kc-panel .kc-outbox-needs-attention{border-color:#f3a5ce!important}
#kc-panel .kc-outbox-popover{display:block!important;position:absolute!important;top:calc(80px - 1px)!important;left:min(60px, 7%)!important;right:auto!important;z-index:115!important;width:min(390px, calc(100% - 22px))!important;max-width:calc(100% - 22px)!important;max-height:min(285px, 55%)!important;margin:0!important;padding:11px!important;overflow:auto!important;background:linear-gradient(165deg,#3c2240,#241528)!important;border:1px solid #e897bf!important;border-radius:14px!important;box-shadow:0 10px 35px #090311cf,0 0 0 1px #f6aaca16!important;scrollbar-width:thin!important}
#kc-panel .kc-outbox-popover[hidden]{display:none!important}
#kc-panel .kc-outbox-popover .kc-outbox-title{display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-bottom:5px;color:#ffdaee}
#kc-panel .kc-outbox-close{min-height:24px;min-width:25px;border-radius:10px;border:1px solid #9e6083;background:#482a49;color:#ffe5f4;font-size:17px;cursor:pointer}
#kc-panel .kc-outbox-popover .kc-outbox-row{flex-wrap:wrap;gap:5px;line-height:1.4;padding:6px 0}
#kc-panel .kc-outbox-popover .kc-outbox-preview{flex:1 1 125px;max-width:none}
#kc-panel .kc-outbox-popover .kc-outbox-status{flex:1 1 140px;font-size:11px}
#kc-panel .kc-outbox-empty{font-size:11px;color:#ffe0ed;line-height:1.45}
#kc-panel .kc-outbox-empty small{display:block;color:#d6adc6}
#kc-panel.kc-short .kc-outbox-popover{top:58px!important}
@container kc-pawlounge-shell (max-width:850px){#kc-panel .kc-outbox-trigger-label{display:none!important}#kc-panel .kc-outbox-trigger{padding:2px 5px!important}#kc-panel .kc-outbox-popover{top:63px!important;left:9px!important}}
@container kc-pawlounge-shell (max-width:650px){#kc-panel .kc-outbox-popover{top:56px!important}}


/* v1.0.5 — More conversation room, with all controls preserved.
   Reduces fixed chrome instead of hiding quick actions, and keeps the
   message log flexible / scrollable across desktop and compact sizes. */
#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) minmax(225px,260px)!important}
#kc-panel .chathead{height:68px!important;min-height:68px!important;padding:6px 12px!important;flex:0 0 auto!important}
#kc-panel .chathead .headtitle{font-size:18px!important;line-height:1.2!important}
#kc-panel .chathead .headsubtitle{font-size:12px!important;line-height:1.3!important}
#kc-panel .chatcenter>.msglog{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;padding:10px 12px!important;gap:8px!important}
#kc-panel .quick,#kc-panel.kc-short .quick{display:flex!important;flex:0 0 34px!important;height:34px!important;min-height:0!important;max-height:34px!important;box-sizing:border-box!important;flex-wrap:nowrap!important;align-items:center!important;align-content:center!important;gap:5px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:3px 8px!important;scrollbar-width:thin!important}
#kc-panel .quick .pill,#kc-panel.kc-short .quick .pill{flex:0 0 auto!important;box-sizing:border-box!important;max-width:min(235px,75%)!important;min-width:0!important;height:26px!important;min-height:26px!important;padding:4px 10px!important;font-size:11px!important;line-height:1.2!important;text-overflow:ellipsis!important;white-space:nowrap!important;overflow:hidden!important;border-radius:17px!important}
#kc-panel .quick .paw-quick-schedule{margin-left:auto!important;border-color:#c586aa!important}
#kc-panel .paw-schedule-collapsed{flex:0 0 auto!important;max-height:115px!important;padding:0 8px!important;margin:0 7px 4px!important;overflow-y:auto!important}
#kc-panel .paw-schedule-collapsed:not([open]){height:24px!important;max-height:24px!important;overflow:hidden!important}
#kc-panel .paw-schedule-collapsed>summary{cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:23px!important;font-size:10px!important;font-weight:750!important;list-style:none!important;color:#ffe2f0!important}
#kc-panel .paw-schedule-collapsed>summary::-webkit-details-marker{display:none!important}
#kc-panel .paw-schedule-collapsed .paw-schedule-items{padding:3px 0 6px!important}
#kc-panel.kc-short .chathead{height:55px!important;min-height:55px!important;padding:3px 8px!important}
@container kc-pawlounge-shell (max-width:1280px){#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr) 235px!important}}
@container kc-pawlounge-shell (max-width:1120px){#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr)!important}}
@container kc-pawlounge-shell (max-width:920px){#kc-panel .chatlayout{grid-template-columns:minmax(0,1fr)!important}#kc-panel .chathead{height:61px!important;min-height:61px!important;padding:4px 8px!important}}
@container kc-pawlounge-shell (max-width:740px){#kc-panel .chathead{height:58px!important;min-height:58px!important}}

/* v1.0.6 — Smart Catch-Up: compact category controls and batch invitations. */
#kc-panel .paw-catchup-actions{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:7px 0 10px}
#kc-panel .paw-catchup-actions>button{flex:0 0 auto;min-height:29px;padding:5px 10px;font-size:11px;line-height:1.2;white-space:normal}
#kc-panel .paw-catchup-invites-title{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between}
#kc-panel .paw-catchup-invites-title h3{margin:7px 0}
#kc-panel .paw-catchup-invites-title .paw-catchup-actions{margin:0}
#kc-panel .paw-catchup-actions>button:disabled{opacity:.45;cursor:not-allowed}

/* v1.0.11 — Browser zoom compensation (panel geometry owns scaled transform).
   Mobile intentionally keeps scale 1 and uses larger touch-friendly controls. */
#kc-panel{transform-origin:top left!important}
#kc-fab{transform-origin:top left!important;transform:scale(var(--kc-zoom-factor,1))}
#kc-fab:hover{transform:translateY(-4px) rotate(-3deg) scale(var(--kc-zoom-factor,1))}
#kc-panel.kc-mobile{border-radius:16px!important;overflow:hidden!important}
#kc-panel.kc-mobile .hero{height:58px!important;min-height:58px!important;max-height:58px!important;padding:3px 8px!important}
#kc-panel.kc-mobile .brandlockup{left:6px!important;top:1px!important;width:154px!important;height:62px!important}
#kc-panel.kc-mobile .brand-after-lockup,#kc-panel.kc-mobile .kc-deco-right-top,#kc-panel.kc-mobile .kc-deco-left-bottom,
#kc-panel.kc-mobile .kc-deco-left-ribbon,#kc-panel.kc-mobile .herocharms,
#kc-panel.kc-mobile .dragcue,#kc-panel.kc-mobile .kc-sculpted-frame,#kc-panel.kc-mobile .kc-resize{display:none!important}
#kc-panel.kc-mobile .heroactions{z-index:100!important;margin-left:auto!important}
#kc-panel.kc-mobile .closekitty{min-width:43px!important;min-height:43px!important;z-index:101!important}
#kc-panel.kc-mobile .workspace{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr) 64px!important;position:relative!important;border-radius:0!important}
#kc-panel.kc-mobile .workspace>.main{grid-column:1!important;grid-row:1!important;min-width:0!important;min-height:0!important}
#kc-panel.kc-mobile .workspace>.rail{grid-column:1!important;grid-row:2!important;display:flex!important;flex-direction:row!important;gap:2px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:3px 5px!important;min-width:0!important;min-height:64px!important;height:64px!important;align-items:stretch!important;border-right:0!important;border-top:1px solid var(--border)!important;scrollbar-width:none!important}
#kc-panel.kc-mobile .workspace>.rail::-webkit-scrollbar{display:none}
#kc-panel.kc-mobile .workspace>.rail{padding-bottom:max(3px,env(safe-area-inset-bottom,3px))!important}
#kc-panel.kc-mobile .rail .railtab{flex:0 0 62px!important;width:62px!important;min-width:62px!important;max-width:62px!important;height:56px!important;min-height:56px!important;max-height:56px!important;padding:4px 1px!important;gap:0!important;z-index:1!important}
#kc-panel.kc-mobile .rail .railtab .ic,#kc-panel.kc-mobile .rail .railtab .ic .asset{font-size:22px!important;width:25px!important;height:25px!important}
#kc-panel.kc-mobile .rail .railtab .tx{font-size:10px!important;line-height:1.1!important;white-space:nowrap!important}
#kc-panel.kc-mobile .railspacer{display:none!important}
#kc-panel.kc-mobile .workspace>.sidebar{grid-row:1!important;grid-column:1!important;display:none!important;position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:min(310px,92%)!important;height:auto!important;z-index:95!important;box-shadow:10px 0 28px #000b!important;background:#24142a!important}
#kc-panel.kc-mobile .workspace>.sidebar.compact-open{display:flex!important}
#kc-panel.kc-mobile .sidebar>.side-shell{padding:10px!important;gap:7px!important}
#kc-panel.kc-mobile .main .chatlayout{grid-template-columns:minmax(0,1fr)!important;min-height:0!important}
#kc-panel.kc-mobile .main .chatcenter{min-width:0!important;min-height:0!important}
#kc-panel.kc-mobile .chathead{height:57px!important;min-height:57px!important;max-height:57px!important;margin:1px 2px 0!important;padding:4px 5px!important;gap:5px!important}
#kc-panel.kc-mobile .chathead .avatar{width:35px!important;height:35px!important;flex-basis:35px!important}
#kc-panel.kc-mobile .chathead .headtitle{font-size:13px!important;line-height:1.1!important}
#kc-panel.kc-mobile .chathead .headsubtitle{font-size:10px!important;line-height:1.1!important}
#kc-panel.kc-mobile .chathead .headright{gap:2px!important;max-width:43%;overflow-x:auto!important;scrollbar-width:none!important}
#kc-panel.kc-mobile .chathead .headright .iconbutton{flex:0 0 34px!important;width:34px!important;height:38px!important}
#kc-panel.kc-mobile .composer.chat-composer,
#kc-panel.kc-mobile .composer.group-composer{display:grid!important;grid-template-columns:46px minmax(92px,1fr) 46px!important;grid-template-areas:'stickers mode send' 'input input input'!important;gap:5px!important;padding:5px 8px!important}
#kc-panel.kc-mobile .composer.group-composer{grid-template-areas:'group stickers send' 'input input input'!important}
#kc-panel.kc-mobile .composer .kc-add{grid-area:stickers!important;width:46px!important;height:42px!important;min-height:42px!important}
#kc-panel.kc-mobile .composer .mode{grid-area:mode!important;min-width:0!important;width:100%!important;height:42px!important}
#kc-panel.kc-mobile .composer .group-head-tag{grid-area:group!important;min-width:0!important;width:auto!important;height:42px!important}
#kc-panel.kc-mobile .composer textarea{grid-area:input!important;width:100%!important;min-height:47px!important;max-height:95px!important;resize:none!important}
#kc-panel.kc-mobile .composer .primary{grid-area:send!important;width:46px!important;height:42px!important;min-width:0!important;min-height:42px!important;padding:0!important}
#kc-panel.kc-mobile .quick{padding:3px 5px!important;gap:4px!important;max-height:36px!important}
#kc-panel.kc-mobile .quick .pill{font-size:10px!important;padding:5px 7px!important}
#kc-panel.kc-mobile .msglog{min-height:0!important;padding:7px 9px!important}
#kc-panel.kc-mobile .msgrow{max-width:100%!important}
#kc-panel.kc-mobile .msgcol{max-width:100%!important}
#kc-panel.kc-mobile .screen{padding:12px!important}
#kc-panel.kc-mobile .settingrow{flex-wrap:wrap!important}
#kc-panel.kc-mobile .settingrow>*:last-child{max-width:100%!important}
#kc-panel.kc-mobile .collapse-handle.left{z-index:110!important}
#kc-panel.kc-mobile .collapse-handle.right{z-index:110!important}
#kc-panel.kc-mobile .companion{max-width:95%!important}
#kc-panel.kc-mobile button,#kc-panel.kc-mobile input,#kc-panel.kc-mobile select{touch-action:manipulation}
#kc-panel.kc-mobile .kc-profile-backdrop,#kc-panel.kc-mobile .group-create-backdrop{z-index:150!important}
/* v1.0.12 — Compact host/moderator management. */
#kc-panel .kc-group-invite{width:100%;margin:2px 0 9px;padding:7px 8px;font-size:12px}
#kc-panel .group-member{gap:5px;min-width:0;flex-wrap:wrap}
#kc-panel .group-member>div{min-width:0;flex:1 1 90px}
#kc-panel .kc-group-kick{margin:2px 0 2px auto;flex:0 0 auto;border-color:#f18caa!important;color:#ffd3df!important}
`; }

  // Browser zoom changes devicePixelRatio on desktop Firefox/Chrome.
  // Keep CSS pixels physically close to the calibrated starting size by
  // scaling the two UI surfaces, not the game or other mods. Touch devices
  // deliberately use natural sizing for readable tap targets.
  const pawViewportScale={ratio:1,dpr:0,mobile:false,updates:0,lastDesktopRect:null};
  const mobileVisibleHeight=()=>Math.max(240,Math.min(window.innerHeight,Number(window.visualViewport?.height)||window.innerHeight));
  const isMobileLayout=()=>window.innerWidth<=720 ||
     (window.matchMedia?.('(pointer:coarse)')?.matches&&window.innerWidth<=900);
  function deviceZoomRatio(){
    if(isMobileLayout())return 1;
    const dpr=Math.max(.5,Math.min(8,Number(window.devicePixelRatio)||1));
    const base=Number(state.settings.zoomReferenceDpr)||dpr;
    return Math.min(1.6,Math.max(.6,base/dpr));
  }
  function syncZoomAndMobile(force=false){
    const dpr=Math.max(.5,Math.min(8,Number(window.devicePixelRatio)||1));
    const mobile=isMobileLayout(),ratio=mobile?1:deviceZoomRatio();
    const wasMobile=pawViewportScale.mobile;
    if(!force&&Math.abs(ratio-pawViewportScale.ratio)<.002&&mobile===wasMobile&&dpr===pawViewportScale.dpr)return;
    if(mobile&&!wasMobile&&state.windowRect&&state.windowRect.w>=650)
      pawViewportScale.lastDesktopRect={...state.windowRect};
    if(!mobile&&wasMobile)
      state.windowRect=pawViewportScale.lastDesktopRect?{...pawViewportScale.lastDesktopRect}:defaultWindowRect();
    pawViewportScale.ratio=ratio;pawViewportScale.dpr=dpr;pawViewportScale.mobile=mobile;pawViewportScale.updates++;
    if(!ui.panel||!ui.fab)return;
    ui.panel.classList.toggle('kc-mobile',mobile);
    ui.panel.style.setProperty('--kc-zoom-factor',String(ratio));
    ui.fab.style.setProperty('--kc-zoom-factor',String(ratio));
    // Keep the native mobile keyboard, touch targets and compact drawer usable.
    if(mobile)state.rightDrawerOpen=false;
    if(state.windowRect){
      if(mobile){
        const vW=Math.max(1,window.innerWidth),vH=mobileVisibleHeight();
        Object.assign(state.windowRect,{x:3,y:3,w:Math.max(280,vW-6),h:Math.max(250,vH-6)});
      }
      applyWindowRect();
    }
    fitFab();
  }
  function setTheme() {
    if (!ui.panel) return;
    const selectedTheme = VALID_THEMES.includes(state.settings.theme) ? state.settings.theme : 'midnight';
    if (!ui.panel.classList.contains(`theme-${selectedTheme}`)) {
      ui.panel.classList.remove(...VALID_THEMES.map(theme => `theme-${theme}`));
      ui.panel.classList.add(`theme-${selectedTheme}`);
    }
    const sizeClass = `text-${['normal','large','extra'].includes(state.settings.fontSize)?state.settings.fontSize:'large'}`;
    if (!ui.panel.classList.contains(sizeClass)) {
      ui.panel.classList.remove('text-normal','text-large','text-extra');
      ui.panel.classList.add(sizeClass);
    }
    ui.panel.classList.toggle('panel-scrollbars-visible', state.settings.panelScrollbars !== false);
    ui.panel.classList.toggle('paw-minimalist',!!state.settings.minimalist);
    ui.panel.dataset.pawBubbleShape=state.settings.bubbleShape;
    ui.panel.style.setProperty('--paw-bubble-opacity',`${state.settings.bubbleOpacity}%`);
    ui.panel.classList.toggle('left-collapsed', !!state.leftCollapsed);
    ui.panel.classList.toggle('right-collapsed', !!state.rightCollapsed);
    ui.panel.classList.toggle('right-drawer-open', !!state.rightDrawerOpen);
    ui.panel.classList.toggle('open', state.open);
    ui.panel.setAttribute('aria-hidden', state.open ? 'false' : 'true');
    if (ui.fab) ui.fab.style.display = state.open ? 'none' : 'flex';
  }
  function buildUI() {
    if (ui.host || !document.body) return;
    try {
    const host = document.createElement('div'); host.id = 'kittychat-host';
    // BC creates different canvas/UI stacking contexts after sign-in. Giving
    // only the shadow child a high z-index is not sufficient if the host ends
    // up underneath a BC or addon overlay. This zero-sized fixed host creates
    // an explicit top-level layer and never intercepts pointer input itself.
    host.style.setProperty('position','fixed','important');
    host.style.setProperty('left','0','important');
    host.style.setProperty('top','0','important');
    host.style.setProperty('width','0','important');
    host.style.setProperty('height','0','important');
    host.style.setProperty('z-index','2147483000','important');
    host.style.setProperty('pointer-events','none','important');
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = stylesheet(); shadow.appendChild(style);
    style.textContent += `
      .kc-marv-page{padding:clamp(14px,3vw,28px);max-width:850px;margin:auto;overflow:auto;height:100%;box-sizing:border-box;color:inherit}
      .kc-marv-page h2{margin-top:0}.kc-marv-page h2 small{font-size:.58em;opacity:.75}
      .kc-marv-page h3{margin:12px 0}.kc-marv-page label{display:block;margin:10px 0;font-size:.95em}
      .kc-marv-page .field{box-sizing:border-box;display:block;width:100%;max-width:100%;margin-top:5px;color:inherit}
      .kc-marv-page .kc-marv-compose,.kc-marv-page .kc-marv-item{border:1px solid rgba(242,166,204,.42);border-radius:16px;padding:12px;margin:14px 0;background:rgba(91,32,74,.13)}
      .kc-marv-actions{display:flex;flex-wrap:wrap;gap:7px}.kc-marv-page button{margin:4px 3px}
      .kc-marv-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}
      .kc-marv-meta small{opacity:.72}.kc-marv-body{white-space:pre-wrap;overflow-wrap:anywhere}
      .kc-marv-error{padding:10px;border:1px solid #e78f9c;border-radius:9px;color:#fbe5ec;background:#502b3e}
      .kc-offline-unlock-prompt[hidden],.kc-offline-unlock-prompt [hidden]{display:none!important}
      .kc-offline-unlock-prompt{position:fixed;right:18px;bottom:18px;z-index:2147483646;
        width:min(365px,calc(100vw - 30px));pointer-events:auto;box-sizing:border-box;
        font:14px/1.45 system-ui,sans-serif;color:#ffeaf5}
      .kc-offline-unlock-card{border:2px solid #f1a2cb;border-radius:19px;padding:16px;
        background:#321d36;box-shadow:0 12px 42px #0009;max-height:calc(100vh - 26px);overflow:auto}
      .kc-offline-unlock-card h3{margin:0 0 8px;font-size:18px;color:#ffe1ef}
      .kc-offline-unlock-card p{margin:7px 0 12px}
      .kc-offline-unlock-card label{display:block;font-weight:600}
      .kc-offline-unlock-card input{box-sizing:border-box;width:100%;margin-top:6px;padding:10px;border-radius:9px;
        background:#24152c;color:#fff;border:1px solid #d49cbb;font:inherit}
      .kc-offline-unlock-buttons{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
      .kc-offline-unlock-buttons button{padding:9px 11px;border-radius:10px;cursor:pointer;color:#fff;
        background:#674368;border:1px solid #bf82aa;font:inherit;flex-grow:1}
      .kc-offline-unlock-buttons .primary{background:#994a79;font-weight:700}
      .kc-offline-unlock-buttons button:disabled{opacity:.6;cursor:wait}
      .kc-offline-unlock-hint{font-size:12px;opacity:.82}
      #kc-offline-unlock-error{color:#ffe2e2;font-size:12px;border-left:3px solid #ed7b87;padding:4px 8px}
    `;
    const wrap = document.createElement('div'); wrap.innerHTML = `
      <button id="kc-fab" aria-label="Open PawLounge" title="Drag me or click to open PawLounge">${asset('kitty-launcher-mailcat.png','','✉️')}<span class="counter hidden" id="kc-counter"></span></button>
      <div id="kc-panel" role="dialog" aria-label="PawLounge messenger">
      <svg id="kc-sculpted-frame" class="kc-sculpted-frame" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 900">
        <defs><linearGradient id="kc-outline-grad" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#ffd2e4"/><stop offset=".32" stop-color="#d979ad"/><stop offset=".7" stop-color="#803b67"/><stop offset="1" stop-color="#fd93bf"/></linearGradient></defs>
        <path data-frame-path="outline" class="kc-outline-shadow" />
        <path data-frame-path="outline" class="kc-outline-glow" />
        <path data-frame-path="outline" class="kc-outline-main" />
        <path data-frame-path="inset" class="kc-outline-inset" />
        <path data-frame-path="rail" class="kc-divider-rail" />
        <path data-frame-path="sidebar" class="kc-divider-rail" />
        <path data-frame-path="companion" class="kc-divider-rail" />
      </svg>
      <div class="kc-deco-left-ribbon">${asset('decor-bow-bell.png','','Ribbon and bell')}</div><div class="kc-deco-left-bottom">${asset('decor-black-cat-bottom.png','','Black kitten')}</div><div class="kc-deco-right-top">${asset('decor-black-cat-top.png','','Black kitten')}<span class="mini-moon">${asset('ui-moon-decor.svg','','')}</span></div>
      <header class="hero"><span class="pawfloat">🐾</span><span class="pawfloat2">🐾</span>
        <span class="brandlockup paw-image-brandlockup">${asset('decor-header-lockup-shaped.png','','PawLounge','PawLounge')}</span>
        <div class="brandblock brand-after-lockup"><span class="subrow"><small>A cozy little social lounge · v${VERSION}</small></span></div>
        <div class="grow"></div>
        <div class="heroactions"><span class="dragcue" aria-hidden="true">⠿ &nbsp; Drag to move</span><div class="herocharms" aria-hidden="true"><span class="herocharm">${asset('ui-paw.svg','','')}</span><span class="herocharm">${asset('ui-star.svg','','')}</span></div><button class="iconbutton closekitty" data-action="close" aria-label="Close PawLounge">${asset('ui-close.svg','','✕')}</button></div>
      </header>
      <div class="workspace">
        <nav class="rail" aria-label="PawLounge navigation">
          <button class="railtab active" data-tab="chats"><span class="ic">${asset('ui-paw.svg','','🐾')}</span><span class="tx">Chats</span></button>
          <button class="railtab" data-tab="groups" title="Group Dens and invitations" aria-label="Groups"><span class="ic" aria-hidden="true">👥</span><span class="tx">Groups</span></button>
          <button class="railtab" data-tab="pawbooks" title="Collaborative Scrapbooks and memory books" aria-label="PawBooks"><span class="ic" aria-hidden="true">📚</span><span class="tx">PawBooks</span></button>
          <button class="railtab" data-tab="catchup" title="Catch-up & invitations"><span class="ic">📬</span><span class="tx">Catch Up</span></button>
          <button class="railtab" data-tab="notes" title="Private Paw Notes · send and receive messages"><span class="ic">✉️</span><span class="tx">Paw Notes</span></button>
          <button class="railtab" data-tab="marvelous" title="Marvelous encrypted cloud and shared features"><span class="ic">☁️</span><span class="tx">Marvelous</span></button>
          <button class="railtab" data-tab="moments" title="Private memories and Paw Moments" aria-label="Memories and Moments"><span class="ic"><img class="kc-moments-icon" src="${KC_MOMENTS_ICON_SRC}" alt="" width="32" height="32" draggable="false" decoding="async"/></span><span class="tx">Memories</span></button>
          <button class="railtab" data-tab="personality" title="Pet personality studio"><span class="ic">🐾</span><span class="tx">Pet Self</span></button>
          <button class="railtab" data-tab="focus" title="Room focus mode"><span class="ic">🎬</span><span class="tx">Focus</span></button>
          <button class="railtab" data-tab="rooms"><span class="ic">${asset('ui-house.svg','','⌂')}</span><span class="tx">Rooms</span></button>
          <button class="railtab" data-tab="stickers"><span class="ic">${asset('ui-heart.svg','','♡')}</span><span class="tx">Stickers</span></button>
          <button class="railtab" data-tab="settings"><span class="ic">${asset('ui-settings.svg','','⚙')}</span><span class="tx">Settings</span></button>
          <div class="railspacer"></div>
        </nav>
        <aside class="sidebar" id="kc-side"></aside>
        <main class="main" id="kc-body"></main>
      </div><div class="group-create-backdrop hidden" id="kc-group-modal"></div><div class="kc-profile-backdrop hidden" id="kc-profile-modal"></div><button class="kc-resize" id="kc-resize" aria-label="Drag to resize Kittychat" title="Drag to resize Kittychat">${asset('ui-resize.svg','','↘')}</button></div>
       <div id="kc-toast" role="status" aria-live="polite"></div>
       <section id="kc-offline-unlock-prompt" class="kc-offline-unlock-prompt" role="dialog" aria-label="Unlock Marvelous offline messaging" aria-modal="false" hidden>
         <div class="kc-offline-unlock-card">
           <h3>💌 Unlock offline messaging</h3>
           <p>Welcome back, BC <b id="kc-offline-unlock-member"></b>. Unlock your Marvelous mailbox to read offline messages and send encrypted notes.</p>
           <label for="kc-offline-unlock-password">Marvelous mailbox password
             <input id="kc-offline-unlock-password" type="password" autocomplete="off" placeholder="Paw Notes encryption passphrase">
           </label>
           <p class="kc-offline-unlock-hint">Use your Paw Notes passphrase (your Cloud Hub backup password may be different). It is never saved.</p>
           <p id="kc-offline-unlock-error" role="alert" hidden></p>
           <div class="kc-offline-unlock-buttons">
             <button class="primary" data-action="marv-prompt-unlock">Unlock</button>
             <button class="secondary" data-action="marv-prompt-later">Not now</button>
             <button class="secondary" data-action="marv-prompt-never">No, never ask again</button>
           </div>
         </div>
       </section>`;
    const marvelousFiveStyle=document.createElement('style');marvelousFiveStyle.textContent='\n/* Marvelous Five Features: compact kitten UI cards; parent theme variables stay intact. */\n#kc-panel .rail{overflow-y:auto;min-height:0;scrollbar-width:thin;overscroll-behavior:contain}\n#kc-panel .railtab{flex-shrink:0}\n#kc-panel .marv-feature-page{padding:20px;max-width:960px;margin:0 auto;overflow:auto;height:100%;box-sizing:border-box}\n#kc-panel .marv-feature-page h2{margin:0 0 12px;color:#ffe1f2;font-size:22px}\n#kc-panel .marv-feature-card{border:1px solid #9e6388;border-radius:16px;background:linear-gradient(135deg,#50304a9c,#342238cf);padding:14px;margin:12px 0;max-width:100%;overflow-wrap:anywhere}\n#kc-panel .marv-feature-card label{display:block;margin:8px 0}\n#kc-panel .marv-feature-card .field{width:100%;box-sizing:border-box;max-width:100%}\n#kc-panel .marv-feature-top,#kc-panel .marv-feature-actions,#kc-panel .marv-prompt{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}\n#kc-panel .marv-feature-actions{justify-content:flex-start}\n#kc-panel .marv-feature-card p{white-space:pre-wrap}\n#kc-panel .marv-room-thumb{display:block;object-fit:contain;max-width:min(100%,420px);max-height:240px;border-radius:10px;margin:10px 0}\n#kc-panel .marv-image-label{display:inline-block!important;padding:8px 12px;background:#754061;border:1px solid #c67fad;border-radius:9px;cursor:pointer}\n#kc-panel .marv-image-label input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}\n#kc-panel .marv-pet-icon{font-size:48px;text-align:center;margin:16px auto}\n#kc-panel .marv-feature-page .settingrow{display:flex;justify-content:space-between;gap:15px;align-items:center}\n';shadow.appendChild(marvelousFiveStyle);
    const memoryHubStyle=document.createElement('style');
    memoryHubStyle.textContent=`
      #kc-panel .kc-memory-hub{overflow:auto;max-width:1060px}
      #kc-panel .kc-memory-actions,#kc-panel .kc-memory-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      #kc-panel .kc-memory-tools{margin:12px 0;display:grid;gap:10px}
      #kc-panel .kc-memory-tools label{display:block;font-size:12px}
      #kc-panel .kc-memory-tools .field{width:100%;max-width:600px;box-sizing:border-box;margin-top:5px}
      #kc-panel .kc-memory-filters button{min-height:34px}
      #kc-panel .kc-memory-favorite-toggle{display:flex;gap:8px;align-items:center}
      #kc-panel .kc-memory-composer{margin:12px 0}
      #kc-panel .kc-memory-composer label{display:block;margin:8px 0}
      #kc-panel .kc-memory-feed{align-items:start}
      #kc-panel .kc-memory-entry{min-width:0;margin:0;overflow-wrap:anywhere;box-sizing:border-box}
      #kc-panel .kc-memory-entry .flex,#kc-panel .kc-memory-entry .marv-feature-actions{display:flex;flex-wrap:wrap;gap:6px}
      #kc-panel .kc-memory-entry .kc-memory-kind{font-size:11px;font-weight:700;opacity:.8;margin-bottom:8px}
      #kc-panel .kc-memory-entry blockquote{white-space:pre-wrap;overflow-wrap:anywhere}
      #kc-panel .kc-memory-entry img{max-width:100%;height:auto}
      @container (max-width:530px){#kc-panel .kc-memory-feed{grid-template-columns:1fr}}
    `;
    shadow.appendChild(memoryHubStyle);
    shadow.appendChild(wrap);
    document.body.appendChild(host);
    Object.assign(ui, { host, shadow, fab:shadow.getElementById('kc-fab'),
      panel:shadow.getElementById('kc-panel'), badge:shadow.getElementById('kc-counter'),
      body:shadow.getElementById('kc-body'), menu:shadow.getElementById('kc-side'), status:shadow.getElementById('kc-toast') });
    // Only watch markup replacement; drawing into a canvas does not trigger this.
    portraitRuntime.observer?.disconnect();
    portraitRuntime.observer = new MutationObserver(schedulePortraits);
    portraitRuntime.observer.observe(shadow, { childList:true, subtree:true });
    shadow.addEventListener('click', clickUI);
    shadow.addEventListener('input', inputUI);
    shadow.addEventListener('pointerdown',bookPointerStart);
    shadow.addEventListener('pointermove',bookPointerMove);
    shadow.addEventListener('pointerup',bookPointerEnd);
    shadow.addEventListener('pointercancel',bookPointerEnd);
    shadow.addEventListener('change', changeUI);
    shadow.addEventListener('keydown', keyUI);
    shadow.addEventListener('dragstart', pawDragStart);
    shadow.addEventListener('dragover', pawDragOver);
    shadow.addEventListener('drop', pawDrop);
    shadow.addEventListener('dragend',()=>{pawDragSection='';});
    shadow.addEventListener('scroll', captureSideScroll, true);
    shadow.addEventListener('scroll', onInboxFilterScroll, true);
    shadow.addEventListener('pointerdown', dragInboxFilterBar);
    shadow.addEventListener('wheel', forwardSidebarWheel, { passive: false });
    ui.fab.addEventListener('pointerdown', dragFab);
    shadow.querySelector('.hero')?.addEventListener('pointerdown', dragWindow);
    shadow.getElementById('kc-resize')?.addEventListener('pointerdown', resizeWindow);
    if (!state.windowRect) state.windowRect = defaultWindowRect();
    syncZoomAndMobile(true);
    applyWindowRect();
    if (typeof ResizeObserver === 'function') {
      ui.rightArrowObserver?.disconnect();
      ui.rightArrowObserver = new ResizeObserver(syncRightDrawerArrow);
      ui.rightArrowObserver.observe(ui.panel);
    }
    if (!state.hotkeysAttached) { document.addEventListener('keydown', hotkeys, true); state.hotkeysAttached = true; }
    if (state.fabPosition) positionFab(state.fabPosition.x, state.fabPosition.y);
    if (!state.resizeAttached) {
      let pendingViewport=0;
      window.addEventListener('resize',()=>{
        if(!pendingViewport)pendingViewport=requestAnimationFrame(()=>{
          pendingViewport=0;syncZoomAndMobile();
          if(isMobileLayout()&&state.windowRect)Object.assign(state.windowRect,{x:3,y:3,w:Math.max(280,innerWidth-6),h:Math.max(250,mobileVisibleHeight()-6)});
          applyWindowRect();fitFab();syncInboxFilterBar();
        });
      },{passive:true});
      window.visualViewport?.addEventListener('resize',()=>{
        if(isMobileLayout()&&state.windowRect){
          state.windowRect.h=Math.max(250,mobileVisibleHeight()-6);
          applyWindowRect();
        }else syncZoomAndMobile();
      },{passive:true});
      state.resizeAttached=true;
    }
    setTheme(); updateBadge(); render(); syncFabCoexistence();
    } catch (err) {
      // If startup fails partway through the UI, remove partial nodes before retrying.
      try { ui.rightArrowObserver?.disconnect(); ui.rightArrowObserver = null; ui.host?.remove(); } catch {}
      Object.assign(ui, {host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null,input:null});
      throw err;
    }
  }

  const minWinWidth = () => Math.min(420, Math.max(280,window.innerWidth - 12));
  const minWinHeight = () => Math.min(320, Math.max(250,window.innerHeight - 12));
  function defaultWindowRect() {
    const w=Math.min(1410,Math.max(280,window.innerWidth-28));
    const h=Math.min(860,Math.max(250,window.innerHeight-32));
    return {x:Math.round((window.innerWidth-w)/2),y:Math.round((window.innerHeight-h)/2),w,h};
  }
  // The border is vector-drawn from the actual window dimensions. This keeps
  // curved ornamental edges crisp and aligned after dragging/resizing.
  const frameGeometry = new WeakMap();
  function updateSculptedFrame(width, height) {
    const svg = ui.shadow?.getElementById('kc-sculpted-frame');
    if (!svg || !ui.panel) return;
    // Explicit dimensions are supplied during resize so we NEVER read offsetWidth
    // immediately after setting it (which previously forced synchronous reflow).
    width = Number.isFinite(width) ? width : ui.panel.offsetWidth;
    height = Number.isFinite(height) ? height : ui.panel.offsetHeight;
    if (!width || !height) return;
    let refs = frameGeometry.get(svg);
    if (!refs) {
      refs = {
        outer: svg.querySelector('[data-frame-path="outline"]'),
        inner: svg.querySelector('[data-frame-path="inset"]'),
        left: svg.querySelector('[data-frame-path="rail"]'),
        middle: svg.querySelector('[data-frame-path="sidebar"]'),
        right: svg.querySelector('[data-frame-path="companion"]'),
        signature: ''
      };
      frameGeometry.set(svg, refs);
    }
    // The sculpted border normally bleeds 22px sideways / 25px vertically.
    // When the plugin fills the game window, that protruding outline was cut
    // off by the viewport at both upper corners. Use only the available bleed
    // and keep the path's pixel scale at 1:1 instead of stretching it.
    const rect = state.windowRect || defaultWindowRect();
    const vw = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
    const vh = Math.max(1, document.documentElement.clientHeight || window.innerHeight);
    const gapRight = Math.max(0, vw - (rect.x + width));
    const gapBottom = Math.max(0, vh - (rect.y + height));
    const leftBleed = Math.max(0, Math.min(22, rect.x + 5));
    const rightBleed = Math.max(0, Math.min(22, gapRight + 5));
    const topBleed = Math.max(0, Math.min(25, rect.y - 5));
    const bottomBleed = Math.max(0, Math.min(25, gapBottom + 4));
    const signature = `${width}:${height}:${leftBleed}:${rightBleed}:${topBleed}:${bottomBleed}`;
    if (refs.signature === signature) return;
    refs.signature = signature;
    motionRuntime.frameGeometryWrites++;
    const {outer, inner, left, middle, right} = refs;
    const w = width + leftBleed + rightBleed;
    const h = height + topBleed + bottomBleed;
    svg.style.setProperty('left', `${-leftBleed}px`);
    svg.style.setProperty('top', `${-topBleed}px`);
    svg.style.setProperty('width', `${w}px`);
    svg.style.setProperty('height', `${h}px`);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const narrow = width < 830 || height < 410;
    const top = narrow ? 29 : 84;
    let outline, inset;
    if (narrow) {
      outline = `M 37 25 Q 22 25 22 43 L 22 ${h-64} Q 22 ${h-22} 63 ${h-22} L ${w-60} ${h-22} Q ${w-22} ${h-22} ${w-22} ${h-63} L ${w-22} 52 Q ${w-22} 25 ${w-52} 25 Z`;
      inset = `M 40 31 Q 28 32 28 48 L 28 ${h-64} Q 28 ${h-28} 65 ${h-28} L ${w-62} ${h-28} Q ${w-28} ${h-28} ${w-28} ${h-65} L ${w-28} 54 Q ${w-28} 31 ${w-55} 31 Z`;
    } else {
      // Closer to the traced concept: a longer sculpted top ridge, a fuller
      // lower-left shell corner, and a more pronounced right-side contour.
      outline = `M 32 185 C 18 166 16 132 21 96 C 26 58 52 40 98 38 C 121 37 129 19 160 14 C 206 1 258 9 295 33 C 313 45 325 57 363 61 C 412 67 453 57 497 48 L ${w-388} 48 C ${w-352} 48 ${w-326} 45 ${w-298} 39 C ${w-269} 33 ${w-249} 30 ${w-227} 37 C ${w-211} 17 ${w-158} 10 ${w-120} 29 C ${w-84} 19 ${w-40} 35 ${w-26} 80 L ${w-23} ${h-132} C ${w-21} ${h-101} ${w-19} ${h-72} ${w-18} ${h-52} C ${w-16} ${h-28} ${w-37} ${h-16} ${w-79} ${h-17} L 128 ${h-17} C 83 ${h-17} 60 ${h-11} 46 ${h-36} C 31 ${h-64} 31 ${h-92} 32 ${h-124} Z`;
      inset = `M 40 182 C 26 157 24 124 30 97 C 35 65 61 49 103 47 C 128 44 138 27 165 22 C 210 11 247 20 291 41 C 322 55 334 60 368 64 C 414 69 451 61 500 55 L ${w-384} 55 C ${w-349} 54 ${w-325} 50 ${w-298} 45 C ${w-269} 40 ${w-251} 37 ${w-228} 43 C ${w-198} 22 ${w-163} 19 ${w-121} 37 C ${w-88} 28 ${w-48} 46 ${w-34} 84 L ${w-30} ${h-131} C ${w-29} ${h-103} ${w-28} ${h-75} ${w-26} ${h-56} C ${w-24} ${h-36} ${w-42} ${h-24} ${w-81} ${h-24} L 131 ${h-24} C 90 ${h-24} 67 ${h-19} 53 ${h-42} C 40 ${h-66} 38 ${h-94} 40 ${h-125} Z`;
    }
    for (const shape of svg.querySelectorAll('[data-frame-path="outline"]')) shape.setAttribute('d',outline);
    inner?.setAttribute('d',inset);
    // Keep just the outer and inset curves. The three old inset divider
    // paths were drawn through the welcome view and over control cards when
    // the window was resized. Section borders are handled by CSS instead.
    left?.setAttribute('d', '');
    middle?.setAttribute('d', '');
    right?.setAttribute('d', '');
  }

  function applyWindowRect(refreshFrame = true) {
    if (!ui.panel) return;
    const r = state.windowRect || defaultWindowRect();
    const viewportW = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
    const viewportH = Math.max(1, document.documentElement.clientHeight || window.innerHeight);
    const ratio=pawViewportScale.ratio||1;
    const maxW=Math.max(1,(viewportW-8)/ratio),maxH=Math.max(1,(viewportH-8)/ratio);
    r.w = Math.round(Math.max(Math.min(minWinWidth(), maxW), Math.min(Number(r.w) || maxW, maxW)));
    r.h = Math.round(Math.max(Math.min(minWinHeight(), maxH), Math.min(Number(r.h) || maxH, maxH)));
    r.x = Math.round(Math.max(4, Math.min(Number(r.x) || 0, viewportW - r.w*ratio - 4)));
    r.y = Math.round(Math.max(4, Math.min(Number(r.y) || 0, viewportH - r.h*ratio - 4)));
    state.windowRect = r;
    ui.panel.classList.toggle('kc-short', r.h < 530);
    // A few older mockup CSS rules used !important width/height. Keep live
    // dimensions authoritative even if a theme introduces those again.
    const style = ui.panel.style;
    style.setProperty('left', `${r.x}px`, 'important');
    style.setProperty('top', `${r.y}px`, 'important');
    style.setProperty('right', 'auto', 'important');
    style.setProperty('bottom', 'auto', 'important');
    style.setProperty('width', `${r.w}px`, 'important');
    style.setProperty('height', `${r.h}px`, 'important');
    if (!ui.panel.classList.contains('kc-moving'))style.setProperty('transform',`scale(${ratio})`,'important');
    if (refreshFrame) { updateSculptedFrame(r.w, r.h); requestAnimationFrame(syncInboxFilterBar); }
    syncRightDrawerArrow();
  }
  function dragWindow(e) {
    if (e.button !== 0 || !ui.panel || e.target?.closest?.('button,a,input,select,textarea')) return;
    const el = e.currentTarget, panel = ui.panel;
    const id = e.pointerId;
    const origin = { ...(state.windowRect || defaultWindowRect()) };
    const x0 = e.clientX, y0 = e.clientY;
    const maxX = Math.max(4, window.innerWidth-origin.w*pawViewportScale.ratio-4);
    const maxY = Math.max(4, window.innerHeight-origin.h*pawViewportScale.ratio-4);
    let x = origin.x, y = origin.y, frame=0, active=true;
    const started = performance.now();
    const oldTouch = el.style.touchAction;
    el.style.touchAction = 'none';
    beginMotion();
    panel.classList.add('kc-moving');
    const paint = () => {
      frame=0;
      if (!active || ui.panel !== panel) return;
      // A transform is GPU-composited and leaves layout and the ornamental
      // SVG completely unchanged until the gesture is finished.
      panel.style.setProperty('transform', `translate3d(${x-origin.x}px, ${y-origin.y}px, 0) scale(${pawViewportScale.ratio})`, 'important');
      motionRuntime.dragFrames++;
    };
    const measure = ev => {
      x = Math.round(Math.max(4, Math.min(maxX,origin.x+ev.clientX-x0)));
      y = Math.round(Math.max(4, Math.min(maxY,origin.y+ev.clientY-y0)));
    };
    const move = ev => {
      if (!active || ev.pointerId !== id) return;
      measure(ev);
      if (!frame) frame = requestAnimationFrame(paint);
      ev.preventDefault();
    };
    const end = ev => {
      if (!active || ev.pointerId !== id) return;
      if (ev.type === 'pointerup') measure(ev);
      active=false;
      if (frame) cancelAnimationFrame(frame);
      frame=0;
      el.removeEventListener('pointermove',move);
      el.removeEventListener('pointerup',end);
      el.removeEventListener('pointercancel',end);
      el.removeEventListener('lostpointercapture',end);
      try { if (el.hasPointerCapture(id)) el.releasePointerCapture(id); } catch {}
      // Commit the new absolute location before removing the compositor offset
      // so the window does not flash or jump back to its old position.
      Object.assign(state.windowRect,{x,y});
      const style=panel.style;
      style.setProperty('left',`${x}px`,'important');
      style.setProperty('top',`${y}px`,'important');
      style.setProperty('transform',`scale(${pawViewportScale.ratio})`,'important');
      panel.classList.remove('kc-moving');
      updateSculptedFrame(state.windowRect.w,state.windowRect.h);
      el.style.touchAction=oldTouch;
      motionRuntime.lastDragMs=Math.round(performance.now()-started);
      endMotion();
      saveSoon();
    };
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerup',end);
    el.addEventListener('pointercancel',end);
    el.addEventListener('lostpointercapture',end);
    try { el.setPointerCapture(id); } catch {}
    e.preventDefault();
    e.stopPropagation();
  }
  function resizeWindow(e) {
    if (e.button !== 0 || !ui.panel) return;
    const el = e.currentTarget;
    const start = { ...(state.windowRect || defaultWindowRect()) };
    const startX = e.clientX, startY = e.clientY, id = e.pointerId;
    const viewportW = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
    const viewportH = Math.max(1, document.documentElement.clientHeight || window.innerHeight);
    // Anchor to the starting top-left edge. Never move the entire window
    // in response to dragging its bottom-right handle.
    const ratio=pawViewportScale.ratio||1;
    const maxW=Math.max(minWinWidth(),(viewportW-start.x-4)/ratio);
    const maxH=Math.max(minWinHeight(),(viewportH-start.y-4)/ratio);
    let pendingW = start.w, pendingH = start.h, animationFrame = 0, active = true;
    const started=performance.now();
    beginMotion();
    ui.panel.classList.add('kc-resizing');
    const applyPending = () => {
      animationFrame = 0;
      if (!ui.panel || !active) return;
      Object.assign(state.windowRect, { x:start.x, y:start.y, w:pendingW, h:pendingH });
      applyWindowRect(false);
      motionRuntime.resizeFrames++;
    };
    const measure = ev => {
      pendingW = Math.round(Math.max(minWinWidth(), Math.min(maxW, start.w + (ev.clientX - startX)/ratio)));
      pendingH = Math.round(Math.max(minWinHeight(), Math.min(maxH, start.h + (ev.clientY - startY)/ratio)));
      if (!animationFrame) animationFrame = requestAnimationFrame(applyPending);
    };
    const move = ev => {
      if (ev.pointerId !== id || !active) return;
      measure(ev);
      ev.preventDefault();
    };
    const originalSelect = document.documentElement.style.userSelect;
    document.documentElement.style.userSelect = 'none';
    el.style.cursor = 'nwse-resize';
    const end = ev => {
      if (ev.pointerId !== id || !active) return;
      // Apply the last pointer position immediately, even if a frame was
      // skipped, so what is saved is exactly what the user last saw.
      if (ev.type === 'pointerup') measure(ev);
      active = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      Object.assign(state.windowRect, { x:start.x, y:start.y, w:pendingW, h:pendingH });
      applyWindowRect();
      motionRuntime.lastResizeMs=Math.round(performance.now()-started);
      ui.panel?.classList.remove('kc-resizing');
      endMotion();
      document.documentElement.style.userSelect = originalSelect;
      el.style.cursor = '';
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointercancel', end);
      el.removeEventListener('lostpointercapture', end);
      try { if (el.hasPointerCapture(id)) el.releasePointerCapture(id); } catch {}
      saveSoon();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
    try { el.setPointerCapture(id); } catch {}
    e.preventDefault();
    e.stopPropagation();
  }
  function positionFab(x, y) {
    x = Math.max(4, Math.min(Number(x) || 0, window.innerWidth - (ui.fab?.offsetWidth || 64)*pawViewportScale.ratio - 4));
    y = Math.max(4, Math.min(Number(y) || 0, window.innerHeight - (ui.fab?.offsetHeight || 64)*pawViewportScale.ratio - 4));
    ui.fab.style.left = `${x}px`; ui.fab.style.top = `${y}px`;
    ui.fab.style.right = 'auto'; ui.fab.style.bottom = 'auto';
    state.fabPosition = {x, y};
  }
  function fitFab() { if (state.fabPosition) positionFab(state.fabPosition.x, state.fabPosition.y); }

  // v1.0.14: BC room-safe launcher coexistence. Generic plugin overlay
  // containers are frequently mounted on room join even when no window is
  // open. They must NOT count as actual dialogs. When a painted foreign popup
  // really overlaps the launcher, prefer a temporary free position to hiding.
  const fabCoexistence={reason:'',checks:0,hidden:0,alwaysShow:false,temporary:null,
    home:null, lastScreen:'',surfaces:[],roomTransitions:0,manualRoomPopupKey:'',popupKey:''};
  const FOREIGN_WINDOW_SELECTOR='dialog[open],[role="dialog"],[aria-modal="true"],[id*="lian" i],[class*="lian" i],[id*="modal" i],[class*="modal" i],[id*="popup" i],[class*="popup" i],[id*="overlay" i],[class*="overlay" i],[id*="window" i],[class*="window" i]';
  function paintedPopupSurface(node, style, box, points) {
    const visiblyPainted=s=>{
      if(!s||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<=.05)return false;
      const bg=String(s.backgroundColor||'');
      const paintedBg=s.backgroundImage!=='none' || (bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)'&&
        !/rgba\([^)]*,\s*0(?:\.0+)?\s*\)/.test(bg));
      const border=['Top','Right','Bottom','Left'].some(side=>
        parseFloat(s['border'+side+'Width'])>=1&&s['border'+side+'Style']!=='none'&&
        s['border'+side+'Color']!=='transparent');
      return paintedBg||border||(s.boxShadow&&s.boxShadow!=='none');
    };
    if(node.tagName==='DIALOG' || visiblyPainted(style))return true;
    // A fullscreen or sidebar-sized transparent mod *host* is not a window.
    // Accept it only when an actual painted descendant intersects the button.
    let scanned=0;
    for(const child of node.querySelectorAll?.('*')||[]){
      if(++scanned>110)break;
      if(child===ui.host||child.contains?.(ui.host))continue;
      let cr,cs;
      try{cr=child.getBoundingClientRect();cs=getComputedStyle(child);}catch{continue;}
      if(!cr||cr.width<90||cr.height<55||!points(cr))continue;
      if(visiblyPainted(cs))return true;
    }
    return false;
  }
  function foreignPopupSurfaces(fabRect) {
    const candidates=[],visited=new Set(),roots=[document];
    const overlaps=a=>a.left<fabRect.right+4&&a.right>fabRect.left-4&&
      a.top<fabRect.bottom+4&&a.bottom>fabRect.top-4;
    let total=0;
    for(let i=0;i<roots.length&&i<25;i++){
      const root=roots[i];
      let found;
      try{found=root.querySelectorAll('body > *, :host > *, '+FOREIGN_WINDOW_SELECTOR);}catch{continue;}
      for(const node of found){
        if(++total>2300)break;
        if(!node||visited.has(node)||node===ui.host||ui.host?.contains(node))continue;
        visited.add(node);
        if(node.shadowRoot&&roots.length<25)roots.push(node.shadowRoot);
        if(!node.isConnected||node.matches?.('canvas,svg,img,video,style,script,link,template'))continue;
        let style;
        try{style=getComputedStyle(node);}catch{continue;}
        if(!style||style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<=.05)continue;
        const label=`${node.id||''} ${typeof node.className==='string'?node.className:''}`;
        const modal=node.matches?.('dialog[open],[role="dialog"],[aria-modal="true"]');
        const namedWindow=/(?:lian(?:chat)?|modal|popup|overlay|dialog|floating[-_ ]?window|addon[-_ ]?menu)/i.test(label);
        if(!modal&&!namedWindow)continue;
        // A BC room canvas or its letterbox container is never an addon popup.
        if(node.matches?.('#MainCanvas,#ChatRoomCanvas,#gameCanvas,[id="game"],[id="main-game"],canvas'))continue;
        if(node===document.body||node===document.documentElement)continue;
        const position=style.position;
        if(!modal&&!['fixed','absolute','sticky'].includes(position))continue;
        if(!modal&&/^(?:chatroom|online|main|game|canvas|screen|container|information|information-sheet)$/i.test(String(node.id||'')))continue;
        let box;
        try{box=node.getBoundingClientRect();}catch{continue;}
        if(!box||box.width<120||box.height<85||!overlaps(box))continue;
        // A full-page addon host is NOT itself a popup. However, many
        // third-party mods mount a real, smaller popup *inside* that host.
        // Detect the actual painted child rather than hiding behind the root.
        if(box.width>=innerWidth*.9&&box.height>=innerHeight*.9){
          let nestedCount=0;
          for(const child of node.querySelectorAll?.('*')||[]){
            if(++nestedCount>160)break;
            if(child.matches?.('canvas,svg,img,video,style,script,link,template'))continue;
            let cb,cs;
            try{cb=child.getBoundingClientRect();cs=getComputedStyle(child);}catch{continue;}
            if(!cb||cb.width<135||cb.height<90||
              (cb.width>=innerWidth*.9&&cb.height>=innerHeight*.9)||!overlaps(cb))continue;
            if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<=.05)continue;
            if(!paintedPopupSurface(child,cs,cb,overlaps))continue;
            candidates.push({node:child,box:cb,
              name:String(child.id||node.id||'addon-popup').slice(0,80)});
            break;
          }
          continue;
        }
        if(!paintedPopupSurface(node,style,box,overlaps))continue;
        candidates.push({node,box,name:String(node.id||node.tagName.toLowerCase()).slice(0,80)});
      }
      if(total>2300)break;
    }
    return candidates;
  }
  function defaultFabHomeRect() {
    const ratio=pawViewportScale.ratio||1;
    const w=(ui.fab?.offsetWidth||64)*ratio,h=(ui.fab?.offsetHeight||64)*ratio;
    const x=state.fabPosition?.x??Math.max(4,innerWidth-w-16);
    const y=state.fabPosition?.y??Math.max(4,innerHeight-h-100);
    const left=Math.max(4,Math.min(x,innerWidth-w-4));
    const top=Math.max(4,Math.min(y,innerHeight-h-4));
    return {left,top,right:left+w,bottom:top+h,width:w,height:h};
  }
  function fabRectAt(x,y,w,h){return {left:x,top:y,right:x+w,bottom:y+h,width:w,height:h};}
  function restoreFabHome(){
    if(!fabCoexistence.temporary||!ui.fab)return;
    const fab=ui.fab;
    fabCoexistence.temporary=null;
    if(state.fabPosition){positionFab(state.fabPosition.x,state.fabPosition.y);}
    else{fab.style.removeProperty('left');fab.style.removeProperty('top');
      fab.style.removeProperty('right');fab.style.removeProperty('bottom');}
  }
  // v1.0.16: BC's room interface and third-party room addons can create a
  // new stacking context above a Shadow DOM launcher. A working JS runtime and
  // connected shadow host do not prove that its launcher is actually visible.
  // Mount a *single* independent, light-DOM room button at document root. It
  // mirrors the same saved coordinates and action but cannot be buried in the
  // zero-sized shadow host. No timers, global hooks or other mods are patched.
  const roomLauncher={button:null,repairs:0,lastReason:'',moves:0,topLayer:false,topLayerErrors:0,dragging:false};
  // A z-index cannot escape all CSS stacking contexts and cannot outrank
  // browser top-layer content. popover=manual permits a freely draggable
  // button on the actual BC room canvas *and* in letterboxed black margins.
  function roomLauncherTopLayer(button,visible=true){
    if(!button?.isConnected)return;
    if(!visible){
      try{if(button.matches(':popover-open'))button.hidePopover();}catch{}
      roomLauncher.topLayer=false;return;
    }
    if(typeof button.showPopover!=='function')return;
    try{
      if(!button.matches(':popover-open'))button.showPopover();
      roomLauncher.topLayer=button.matches(':popover-open');
    }catch(err){
      roomLauncher.topLayer=false;roomLauncher.topLayerErrors++;
      // Older embedded browsers may not support popovers. Retain the fixed,
      // root-level button as a safe fallback rather than failing to load.
    }
  }
  function roomLauncherViewportRect(){
    const scale=pawViewportScale.ratio||1;
    const width=64*scale;
    const fallback=defaultFabHomeRect();
    // Never read position from the hidden shadow FAB in a BC room. It may
    // live inside a resized/translated BC stacking context after room entry.
    // Our saved absolute viewport coords are authoritative.
    const desired=fabCoexistence.temporary||state.fabPosition;
    const x=Number.isFinite(Number(desired?.x))?Number(desired.x):fallback.left;
    const y=Number.isFinite(Number(desired?.y))?Number(desired.y):fallback.top;
    return {x:Math.round(Math.max(4,Math.min(Math.max(4,innerWidth-width-4),x))),
      y:Math.round(Math.max(4,Math.min(Math.max(4,innerHeight-width-4),y))),
      scale,width};
  }
  function roomLauncherActive(){
    return window.CurrentScreen==='ChatRoom'||
      (window.CurrentScreen==='Online'&&window.CurrentModule==='ChatRoom');
  }
  function removeRoomLauncher(){
    const old=roomLauncher.button;
    if(old){roomLauncherTopLayer(old,false);try{old.remove();}catch{}roomLauncher.button=null;}
    if(ui.fab){ui.fab.style.removeProperty('visibility');ui.fab.style.removeProperty('pointer-events');}
    if(ui.host){
      ui.host.style.setProperty('z-index','2147483000','important');
      if(document.body&&ui.host.parentNode!==document.body)document.body.appendChild(ui.host);
    }
  }
  function makeRoomLauncher(){
    const button=document.createElement('button');
    button.id='kc-room-launcher';
    button.setAttribute('popover','manual');
    button.type='button';
    button.setAttribute('aria-label','Open PawLounge');
    button.title='PawLounge · drag to reposition, tap to open';
    button.style.cssText='all:initial!important;box-sizing:border-box!important;position:fixed!important;inset:auto!important;margin:0!important;z-index:2147483647!important;width:64px!important;height:64px!important;display:flex!important;align-items:center!important;justify-content:center!important;border:0!important;background:transparent!important;cursor:grab!important;touch-action:none!important;user-select:none!important;filter:drop-shadow(0 7px 8px #190b24ae)!important;pointer-events:auto!important;';
    const icon=ui.fab?.querySelector('.asset')?.cloneNode(true);
    if(icon){
      icon.style.cssText='display:inline-flex!important;align-items:center!important;justify-content:center!important;position:relative!important;overflow:hidden!important;width:64px!important;height:64px!important;pointer-events:none!important';
      const img=icon.querySelector('img');
      if(img){img.style.cssText='display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none';}
      const fallback=icon.querySelector('span');
      if(fallback){fallback.style.cssText='display:none'; if(img){img.addEventListener('error',()=>{img.style.display='none';fallback.style.cssText='display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:36px;color:#ffbada';});}}
      button.appendChild(icon);
    }else{
      const fallback=document.createElement('span');fallback.textContent='🐾';
      fallback.style.cssText='font:36px system-ui;pointer-events:none';button.appendChild(fallback);
    }
    const counter=document.createElement('span');
    counter.className='kc-room-counter';
    counter.style.cssText='position:absolute;right:-2px;top:0;font:bold 11px system-ui;color:#fff1f8;background:#532843;border:2px solid #e79bbd;border-radius:8px;min-width:25px;text-align:center;padding:2px 5px;pointer-events:none';
    button.appendChild(counter);
    let drag=null;
    button.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      // The 800ms coexistence poll must not overwrite a live pointer drag.
      roomLauncher.dragging=true;
      const point=button.getBoundingClientRect();
      drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:point.left,y:point.top,moved:false};
      try{button.setPointerCapture(e.pointerId);}catch{}
      e.preventDefault();e.stopPropagation();
    });
    button.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
      if(Math.hypot(dx,dy)>5)drag.moved=true;
      if(drag.moved){
        const ratio=pawViewportScale.ratio||1;
        const x=Math.max(4,Math.min(innerWidth-64*ratio-4,drag.x+dx));
        const y=Math.max(4,Math.min(innerHeight-64*ratio-4,drag.y+dy));
        button.style.setProperty('left',`${x}px`,'important');button.style.setProperty('top',`${y}px`,'important');
      }
      e.preventDefault();
    });
    function finish(e){
      if(!drag||e.pointerId!==drag.id)return;
      const moved=drag.moved,interrupted=e.type!=='pointerup';drag=null;
      roomLauncher.dragging=false;
      if(moved&&!interrupted){
        const x=Number.parseFloat(button.style.left)||4,y=Number.parseFloat(button.style.top)||4;
        if(ui.fab)positionFab(x,y);
        state.fabPosition={x,y};
        fabCoexistence.temporary=null;
        // Manual drag wins over the same popup(s) for as long as they remain
        // open. This prevents the button snapping back on the next poll.
        fabCoexistence.manualRoomPopupKey=fabCoexistence.popupKey;
        roomLauncher.moves++;saveSoon();
      } else if(!moved&&!interrupted)toggle(true);
      try{if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);}catch{}
      if(!interrupted)syncFabCoexistence();
      e.preventDefault();e.stopPropagation();
    }
    button.addEventListener('pointerup',finish);
    button.addEventListener('pointercancel',finish);
    // Use the document root rather than a BC-controlled body overlay. Some BC
    // themes and mods apply transforms to the body during room entry.
    document.documentElement.appendChild(button);
    roomLauncher.button=button;roomLauncher.repairs++;
    return button;
  }
  function syncRoomLauncher(){
    if(!ui.fab?.isConnected||!roomLauncherActive()){
      if(roomLauncher.button)removeRoomLauncher();return;
    }
    const button=roomLauncher.button?.isConnected?roomLauncher.button:makeRoomLauncher();
    // Do not reset left/top, popover state, or stacking while the user drags.
    if(roomLauncher.dragging)return;
    // Move the main panel's Shadow DOM host to the same document-root layer
    // as the room button. Otherwise a room-created stacking context can hide
    // the entire panel after the user taps the rescue button.
    if(ui.host&&ui.host.parentNode!==document.documentElement)
      document.documentElement.insertBefore(ui.host,button);
    // Opening the full panel intentionally hides both launch buttons.
    if(state.open){
      roomLauncherTopLayer(button,false);
      button.style.setProperty('display','none','important');
      ui.fab.style.setProperty('visibility','hidden','important');
      ui.fab.style.setProperty('pointer-events','none','important');
      if(ui.host)ui.host.style.setProperty('z-index','2147483647','important');
      return;
    }
    // The shadow copy is only a source of positioning/icons in rooms. The
    // independent room copy is the one interactive visible button.
    ui.fab.style.setProperty('visibility','hidden','important');
    ui.fab.style.setProperty('pointer-events','none','important');
    if(ui.host)ui.host.style.setProperty('z-index','2147483647','important');
    const {x,y,scale}=roomLauncherViewportRect();
    button.style.setProperty('left',`${Math.round(x)}px`,'important');
    button.style.setProperty('top',`${Math.round(y)}px`,'important');
    button.style.setProperty('width','64px','important');
    button.style.setProperty('height','64px','important');
    button.style.setProperty('transform',`scale(${scale})`,'important');
    button.style.setProperty('transform-origin','top left','important');
    button.style.setProperty('visibility','visible','important');
    button.style.setProperty('opacity','1','important');
    button.style.setProperty('display','flex','important');
    roomLauncherTopLayer(button,true);
    const counter=button.querySelector('.kc-room-counter');
    if(counter){counter.textContent=ui.badge?.textContent||'';
      counter.style.setProperty('display',ui.badge?.classList.contains('hidden')?'none':'inline-block');}
    // BC sometimes adds its full-screen canvas AFTER the room launcher during
    // room entry. If the canvas (not a real addon dialog) is on top, restore
    // document order once so the normal launcher can be clicked.
    const box=button.getBoundingClientRect();
    const hit=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2);
    if(hit&&hit!==button&&!button.contains(hit)&&
       (hit.matches?.('canvas,#MainCanvas,#ChatRoomCanvas')||
        hit.closest?.('#bc-app,#ChatRoomCanvas'))&&
       button.parentNode===document.documentElement && !roomLauncher.topLayer){
      document.documentElement.appendChild(button);
      roomLauncher.repairs++;
    }
  }
  // Only true open dialogs should force a room launcher move. A number of
  // addons leave painted overlays, canvases and entire application roots in
  // ChatRoom permanently, even with their actual window closed.
  function roomConfirmedPopup(surface){
    const node=surface?.node;
    if(!node?.isConnected)return false;
    if(node.matches?.('dialog[open],[role="dialog"],[aria-modal="true"]'))return true;
    let parent=node;
    for(let i=0;parent&&i<12;i++){
      const ident=`${parent.id||''} ${typeof parent.className==='string'?parent.className:''}`;
      if(/lian(?:chat)?|(?:^|[\s_-])(?:modal|popup|dialog|addon[-_]?menu|floating[-_]?window)(?:$|[\s_-])/i.test(ident))return true;
      parent=parent.parentElement || parent.getRootNode?.()?.host || null;
    }
    return false;
  }
  function roomPopupSignature(surfaces){
    return surfaces.map(s=>{
      const node=s.node;
      return `${node?.id||''}|${typeof node?.className==='string'?node.className:''}|${Math.round(s.box.width)}x${Math.round(s.box.height)}`;
    }).sort().join(';');
  }
  function syncFabCoexistence() {
    if(ui.panel&&!motionRuntime.active)syncZoomAndMobile();
    const fab=ui.fab;
    if(!fab?.isConnected){syncRoomLauncher();return;}
    fabCoexistence.checks++;
    if(fab.classList.contains('kc-moving')||roomLauncher.dragging)return;
    const room=window.CurrentScreen==='ChatRoom' ||
      (window.CurrentScreen==='Online'&&window.CurrentModule==='ChatRoom');
    const screen=room?'room':String(window.CurrentScreen||'');
    if(fabCoexistence.lastScreen!==screen){fabCoexistence.lastScreen=screen;
      fabCoexistence.roomTransitions+=room?1:0;restoreFabHome();}
    if(state.open||fabCoexistence.alwaysShow){restoreFabHome();
      fab.classList.remove('kc-yielding');fabCoexistence.reason='';fabCoexistence.surfaces=[];
      fab.setAttribute('aria-hidden',state.open?'true':'false');syncRoomLauncher();return;}
    let surfaces=[];
    try{surfaces=foreignPopupSurfaces(defaultFabHomeRect());}catch{surfaces=[];}
    // ChatRoom has permanent pseudo-popup layers: discard those false positives.
    if(room)surfaces=surfaces.filter(roomConfirmedPopup);
    const popupKey=room?roomPopupSignature(surfaces):'';
    fabCoexistence.popupKey=popupKey;
    if(!popupKey)fabCoexistence.manualRoomPopupKey='';
    // A drag is an explicit choice that overrides auto-avoidance while these
    // exact popup surfaces remain mounted. When they close, restore normal.
    if(room&&popupKey&&fabCoexistence.manualRoomPopupKey===popupKey)surfaces=[];
    fabCoexistence.surfaces=surfaces.map(s=>s.name);
    let reason='',shouldHide=false;
    if(surfaces.length){
      reason=surfaces[0].name;
      const home=defaultFabHomeRect();
      const margin=10,w=home.width,h=home.height;
      // Prefer the nearest clear position; bottom-left must never be the
      // unconditional first choice just because a suspicious room element exists.
      const positions=[
        [home.left,home.top],
        [margin,margin],
        [Math.max(margin,innerWidth-w-margin),margin],
        [margin,Math.max(margin,innerHeight-h-margin)],
        [Math.max(margin,innerWidth-w-margin),Math.max(margin,innerHeight-h-margin)],
        [Math.max(margin,(innerWidth-w)/2),margin]
      ].sort((a,b)=>(a[0]-home.left)**2+(a[1]-home.top)**2-
                    ((b[0]-home.left)**2+(b[1]-home.top)**2));
      // Check a proposed alternate position against *all* popup surfaces;
      // only move to positions that are outside their actual bounds.
      const clear=([x,y])=>x>=0&&y>=0&&x+w<=innerWidth&&y+h<=innerHeight&&
        surfaces.every(s=>x+w<=s.box.left-4||x>=s.box.right+4||
          y+h<=s.box.top-4||y>=s.box.bottom+4);
      const available=positions.find(clear);
      if(available){
        const [x,y]=available;
        fab.style.left=`${Math.round(x)}px`;fab.style.top=`${Math.round(y)}px`;
        fab.style.right='auto';fab.style.bottom='auto';
        fabCoexistence.temporary={x,y};
        reason=`moved away from ${reason}`;
      }else {
        restoreFabHome();shouldHide=true;
      }
    }else restoreFabHome();
    const hidden=shouldHide&&!state.open;
    fab.classList.toggle('kc-yielding',hidden);
    fab.setAttribute('aria-hidden',hidden?'true':'false');
    // Another mod might alter display/visibility during a room transition.
    // The closed PawLounge launcher must remain displayable and interactive.
    if(!hidden&&fab.style.display==='none')fab.style.display='flex';
    fabCoexistence.reason=reason;
    if(hidden)fabCoexistence.hidden++;
    syncRoomLauncher();
  }
  function dragFab(e) {
    if (e.button !== 0 || !ui.fab) return;
    const fab=ui.fab, id=e.pointerId, bounds=fab.getBoundingClientRect();
    const x0=e.clientX,y0=e.clientY;
    const viewportW=window.innerWidth, viewportH=window.innerHeight;
    let x=bounds.left,y=bounds.top,moved=false,frame=0,active=true;
    beginMotion();
    fab.classList.add('kc-moving');
    const paint=()=>{
      frame=0;
      if (!active || !fab.isConnected) return;
      fab.style.transform=`translate3d(${x-bounds.left}px,${y-bounds.top}px,0) scale(${pawViewportScale.ratio})`;
      motionRuntime.fabFrames++;
    };
    const measure=ev=>{
      moved ||= Math.hypot(ev.clientX-x0,ev.clientY-y0)>5;
      if (!moved) return;
      x=Math.round(Math.max(4,Math.min(viewportW-bounds.width-4,bounds.left+ev.clientX-x0)));
      y=Math.round(Math.max(4,Math.min(viewportH-bounds.height-4,bounds.top+ev.clientY-y0)));
    };
    const move=ev=>{
      if (!active || ev.pointerId!==id) return;
      measure(ev);
      if (moved && !frame) frame=requestAnimationFrame(paint);
      ev.preventDefault();
    };
    const end=ev=>{
      if (!active || ev.pointerId!==id) return;
      if (ev.type==='pointerup') measure(ev);
      active=false;
      if (frame) cancelAnimationFrame(frame);
      frame=0;
      fab.removeEventListener('pointermove',move);
      fab.removeEventListener('pointerup',end);
      fab.removeEventListener('pointercancel',end);
      fab.removeEventListener('lostpointercapture',end);
      try { if (fab.hasPointerCapture(id)) fab.releasePointerCapture(id); } catch {}
      if (moved) {
        fabCoexistence.temporary=null;
        // Commit absolute coordinates without reading layout again.
        fab.style.left=`${x}px`;fab.style.top=`${y}px`;
        fab.style.right='auto';fab.style.bottom='auto';
        state.fabPosition={x,y};
        saveSoon();fab.dataset.dragged='true';
      }
      fab.style.transform='';
      void fab.offsetWidth; // only once at release; suppress stale compositor offset
      fab.classList.remove('kc-moving');
      endMotion();syncZoomAndMobile();syncFabCoexistence();
      if (!moved && ev.type==='pointerup') toggle();
    };
    fab.addEventListener('pointermove',move);
    fab.addEventListener('pointerup',end);
    fab.addEventListener('pointercancel',end);
    fab.addEventListener('lostpointercapture',end);
    try { fab.setPointerCapture(id); } catch {}
    e.preventDefault();
  }
  function toggle(force) {
    state.open = typeof force === 'boolean' ? force : !state.open;
    if (!ui.panel) return;
    setTheme();
    if (state.open) updateSculptedFrame();
    ui.fab.setAttribute('aria-label', state.open ? 'Close PawLounge' : 'Open PawLounge');
    syncFabCoexistence();
    if (state.open) { render(); (ui.shadow.getElementById(state.tab==='groups'?'kc-group-search':'kc-search'))?.focus(); if (state.tab==='groups'&&state.selectedGroup) void prepareHistoryView('group',state.selectedGroup); else if(state.tab==='chats'&&state.selected){ void prepareHistoryView('chat',state.selected);requestFriendStatus(state.selected); } }
    // Keep small offline canvases across close/reopen within this browser
    // session. They are memory-only, bounded, and cleared at account switch.
    else { /* no portrait cache teardown on ordinary window close */ }
  }
  function updateBadge() {
    if (!ui.badge) return;
    const total = Object.values(state.chats).reduce((n,c) => n + (c.muted ? 0 : (Number(c.unread) || 0)), 0) + Object.values(state.groups).reduce((n,g)=>n+(Number(g.unread)||0),0);
    ui.badge.textContent = total > 99 ? '99+' : String(total);
    ui.badge.classList.toggle('hidden', total === 0);
  }
  // A new conversation can be selected while its IndexedDB history is still loading.
  // Also BC may synchronously invoke several outgoing hooks during a quick message.
  // Reconcile only the active chat, never a different chat selected since the send.
  // A targeted refresh avoids the old close/reopen workaround and prevents full
  // panel rebuilds on every message (important for BC/WCE portrait performance).
  function syncVisiblePrivateChat(member, expectedId = '') {
    member=numeric(member);
    if (!state.open || state.tab!=='chats' || state.selected!==member || state.selectedGroup) return;
    const log=ui.shadow?.getElementById('kc-log');
    if (!log || !log.isConnected) {renderChat();return;}
    const present=expectedId && [...log.querySelectorAll('[data-message-id]')]
      .some(row=>row.dataset.messageId===String(expectedId));
    if (expectedId && present) return;
    renderMessages();
  }
  function queueVisiblePrivateChatSync(member, expectedId = '') {
    // First refresh right now, then check again after any synchronous BC hooks,
    // async history preparation, or same-frame sidebar update have run.
    syncVisiblePrivateChat(member, expectedId);
    requestAnimationFrame(()=>syncVisiblePrivateChat(member, expectedId));
  }
  // Make contact changes immediately ready for typing, without entering or sending
  // anything for the user. If the selected person is in this room, Whisper is
  // the natural default; otherwise keep native BC delivery restrictions intact.
  function focusSwitchedChatComposer(member){
    if(!state.open||state.tab!=='chats'||state.selected!==member)return;
    const field=ui.shadow?.getElementById('kc-compose');
    if(!field||!field.isConnected)return;
    ui.input=field;
    field.focus({preventScroll:true});
    if(ui.shadow.activeElement===field){
      const end=field.value.length;
      try{field.setSelectionRange(end,end);}catch{}
    }
  }
  function selectChat(id) {
    id=numeric(id);
    const chat = ensure(id); if (!chat) return;
    // Remember the BC-visible name before this player leaves the room, so an
    // otherwise unknown player doesn't turn into 'Kitty #12345' afterward.
    const roomCharacter=currentRoomRoster().find(character=>numeric(character.MemberNumber)===id);
    if(roomCharacter)chat.displayName=trim(roomCharacter.Nickname||roomCharacter.Name||chat.displayName,80);
    // Each newly selected conversation gets an appropriate composer mode:
    // Whisper is room-only; confirmed-offline friends use seven-day encrypted
    // notes; other remote friends keep native Beep. Unknown presence is not
    // assumed offline, and nonfriends outside the room can use Offline Note.
    if(inRoom(id))state.composerMode='whisper';
    else if(pawFriendConfirmedOffline(id)||!myFriends().includes(id))state.composerMode='offline';
    else state.composerMode='beep';
    state.compactOpen=false;state.selected = id; state.messageSearch = ''; chat.unread = 0;
    state.tab = 'chats'; saveSoon(); updateBadge(); void prepareHistoryView('chat',id); render();
    queueVisiblePrivateChatSync(id);
    focusSwitchedChatComposer(id);
    requestFriendStatus(id);
  }
  function selectGroup(id) {
    const g=state.groups[id];if(!g)return;
    state.compactOpen=false;state.selectedGroup=id;state.messageSearch='';if(g.joined)g.unread=0;
    state.tab='groups';saveSoon();updateBadge();void prepareHistoryView('group',id);render();
  }
  function isCompactCollapseLayout() {
    // Container query tracks the resizable PawLounge panel, not viewport width.
    return (ui.panel?.offsetWidth || 9999) <= 780;
  }
  // In a compact resized window the BC profile/den details occupy a drawer,
  // rather than a permanent second chat column. Desktop collapse state is
  // preserved independently, so resizing never silently changes preferences.
  function isRightDrawerLayout() {
    return (ui.panel?.offsetWidth || 9999) <= 1120;
  }
  function rightPaneIsOpen() {
    return isRightDrawerLayout() ? !!state.rightDrawerOpen : !state.rightCollapsed;
  }
  function rightArrowButton() {
    const shown = rightPaneIsOpen();
    return `<button type="button" class="collapse-handle right" data-action="togglerightpanel" aria-label="${shown?'Close':'Open'} right widget" aria-expanded="${shown}" title="${shown?'Close':'Open'} right widget"><span class="arr">${shown?'›':'‹'}</span></button>`;
  }
  function rightDrawerCloseButton() {
    return '<button type="button" class="kc-drawer-close" data-action="togglerightpanel" title="Close right widget" aria-label="Close right widget">›</button>';
  }
  function syncRightDrawerArrow() {
    if (!ui.panel || !ui.shadow) return;
    const shown = rightPaneIsOpen();
    const button = ui.body?.querySelector('.chatcenter>.collapse-handle.right');
    if (button) {
      button.title = `${shown?'Close':'Open'} right widget`;
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-expanded', String(shown));
      const arrow = button.querySelector('.arr');
      if (arrow) arrow.textContent = shown ? '›' : '‹';
    }
  }
  // Marvelous private mailbox v2: verified Bondage Club MemberNumbers, never aliases.
  // Anonymous Supabase login is a transport credential, NOT proof of BC identity.
  // Only a trusted BC verifier account can approve an identity; the game ID is not trusted on its own.
  // Private keys are encrypted with the player's passphrase before localStorage storage.
  // Crypto: ECDH P-256 + HKDF-SHA256 + AES-256-GCM, authenticated with ECDSA P-256.
  const MARVELOUS_URL='https://hxarpryfbcxknwmdyoil.supabase.co';
  const MARVELOUS_PUBLIC_KEY='sb_publishable_ZTj3T89Koj5wO5Rw4E-l6Q_k8gmenVT';
  // Set to the BC MemberNumber of your private Marvelous verifier account.
  // This is NOT the player's own MemberNumber. No verifier = fail closed.
  const MARVELOUS_VERIFIER_BC_MEMBER=264370;
  let marvelousVerificationPoll=null;
  const MARVELOUS_SCHEDULE_DISPATCHER_READY=false; // set true ONLY after cron migration 07 was successfully installed
  const marvelousNotes={owner:0,client:null,user:null,claim:null,keys:null,privateKeys:null,inbox:[],outbox:[],decrypted:new Map(),decrypting:new Set(),view:'inbox',busy:false,error:'',initialized:false,epoch:0,draftTo:'',draftBody:'',ttl:'30d',sendAt:'',unlocked:false};
  // Session-only, opt-in unlocking. Never persist or log the entered password.
  // Cloud Hub passwords and Paw Notes key-vault passphrases can be different.
  const marvelousPrompt={account:0,checked:false,checking:false,shown:false,suppressed:false,
    busy:false,tryAgainAt:0,attempts:0};
  const marvelousPromptNeverKey=id=>'pawlounge-offline-unlock-never-v1-'+numeric(id);
  const marvelousPromptDisabled=id=>{try{return localStorage.getItem(marvelousPromptNeverKey(id))==='1';}catch{return false;}};
  function marvelousPromptHide(){
    const modal=ui.shadow?.getElementById('kc-offline-unlock-prompt');
    if(modal){modal.hidden=true;const field=modal.querySelector('#kc-offline-unlock-password');if(field)field.value='';
      const err=modal.querySelector('#kc-offline-unlock-error');if(err){err.textContent='';err.hidden=true;}}
  }
  function marvelousPromptShow(){
    if(marvelousPrompt.suppressed||marvelousPromptDisabled(me())||marvelousNotes.privateKeys)return;
    if(state.open&&state.tab==='notes')return;
    const modal=ui.shadow?.getElementById('kc-offline-unlock-prompt');
    if(!modal)return;
    modal.hidden=false;marvelousPrompt.shown=true;
    const label=modal.querySelector('#kc-offline-unlock-member');if(label)label.textContent='#'+me();
  }
  function marvelousPromptTick(){
    const id=me();
    if(marvelousPrompt.account!==id){
      marvelousPromptHide();
      Object.assign(marvelousPrompt,{account:id,checked:false,checking:false,shown:false,suppressed:false,busy:false,tryAgainAt:0,attempts:0});
    }
    if(!id||!ui.shadow||marvelousPrompt.busy)return;
    if(marvelousPrompt.suppressed||marvelousPromptDisabled(id)||marvelousNotes.privateKeys){marvelousPromptHide();return;}
    if(state.open&&state.tab==='notes'){marvelousPrompt.suppressed=true;marvelousPromptHide();return;}
    if(marvelousPrompt.checked){
      if(marvelousNotes.user&&marvelousNotes.claim?.verified_at&&marvelousNotes.keys&&marvelousNotes.owner===id)
        marvelousPromptShow();
      return;
    }
    // A missing locally persisted Supabase session is NOT a reason to create an
    // anonymous account or ask for a password. A new user sets up in Paw Notes.
    try{if(!localStorage.getItem('marvelous-mailbox-local-bc-'+id)){marvelousPrompt.checked=true;return;}}catch{return;}
    if(marvelousPrompt.checking||Date.now()<marvelousPrompt.tryAgainAt)return;
    marvelousPrompt.checking=true;
    void (async()=>{
      await marvelousEnsureCrypto();
      await marvelousFetch();
      if(me()!==id)return;
      marvelousPrompt.checked=true;
      if(marvelousNotes.user&&marvelousNotes.claim?.verified_at&&marvelousNotes.keys&&
         marvelousVaultStorageStatus().currentVaultFound)marvelousPromptShow();
    })().catch(()=>{
      marvelousPrompt.tryAgainAt=Date.now()+60000; // Transient offline / SDK failure.
      marvelousPrompt.attempts++;
      if(marvelousPrompt.attempts>=3)marvelousPrompt.checked=true;
    }).finally(()=>{marvelousPrompt.checking=false;});
  }
  async function marvelousPromptUnlock(){
    const modal=ui.shadow?.getElementById('kc-offline-unlock-prompt');
    if(!modal||modal.hidden||marvelousPrompt.busy)return;
    const field=modal.querySelector('#kc-offline-unlock-password');
    // Capture first; UI redraws can remove inputs. Drop the DOM copy immediately.
    const pass=String(field?.value||'');if(field)field.value='';
    const err=modal.querySelector('#kc-offline-unlock-error');
    if(!pass){if(err){err.hidden=false;err.textContent='Enter your Paw Notes encryption passphrase.';}return;}
    const id=me();marvelousPrompt.busy=true;
    for(const b of modal.querySelectorAll('button'))b.disabled=true;
    try{
      await marvelousFetch();
      if(id!==me()||!marvelousNotes.claim?.verified_at||!marvelousNotes.keys)
        throw Error('This BC mailbox is not verified yet. Open Paw Notes to finish setup.');
      await marvelousUnlockVault(pass);
      await marvelousFetch();
      marvelousPrompt.suppressed=true;marvelousPromptHide();
      notice('🔓 Offline messaging unlocked for this session.');
    }catch(e){
      if(err){err.hidden=false;err.textContent=String(e?.message||'Could not unlock this mailbox.').slice(0,260);}
    }finally{
      marvelousPrompt.busy=false;
      for(const b of modal.querySelectorAll('button'))b.disabled=false;
    }
  }
  let marvelousSdkLoader=null;
  let marvelousNextBackgroundSync=0;
  let marvelousLastUnread=-1;
  const marvelousTextEncoder=new TextEncoder();
  const marvelousTextDecoder=new TextDecoder('utf-8',{fatal:true});
  const marvelousU8=x=>new Uint8Array(x);
  const marvelousB64=x=>pawBytesToBase64Url(marvelousU8(x));
  const marvelousUnb64=x=>pawBase64UrlToBytes(x);
  const marvelousUtf8=x=>marvelousTextEncoder.encode(String(x));
  function marvelousNotesReset(){
    marvelousNotes.epoch++;marvelousLastUnread=-1;marvelousNextBackgroundSync=0;
    Object.assign(marvelousNotes,{owner:0,client:null,user:null,claim:null,keys:null,privateKeys:null,inbox:[],outbox:[],decrypted:new Map(),decrypting:new Set(),view:'inbox',busy:false,error:'',initialized:false,draftTo:'',draftBody:'',ttl:'30d',sendAt:'',unlocked:false});
  }
  async function marvelousLoadSdk(){
    if(window.supabase?.createClient)return window.supabase;
    if(marvelousSdkLoader)return marvelousSdkLoader;
    marvelousSdkLoader=(async()=>{
      let lastError='';
      for(const url of [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js',
        'https://unpkg.com/@supabase/supabase-js@2.118.0/dist/umd/supabase.js'
      ]){
        try{
          await new Promise((resolve,reject)=>{
            const script=document.createElement('script');script.src=url;script.async=true;
            script.onload=()=>window.supabase?.createClient?resolve():reject(Error('Supabase SDK unavailable'));
            script.onerror=()=>reject(Error('Network or CSP prevented Supabase SDK loading'));
            document.head.appendChild(script);
          });
          return window.supabase;
        }catch(e){lastError=String(e?.message||e);}
      }
      throw Error('Cannot load Supabase SDK: '+lastError);
    })().catch(e=>{marvelousSdkLoader=null;throw e;});
    return marvelousSdkLoader;
  }
  async function marvelousClient(){
    const id=me();if(!numeric(id))throw Error('Sign into Bondage Club first.');
    if(marvelousNotes.owner!==id){marvelousNotesReset();marvelousNotes.owner=id;}
    if(marvelousNotes.client)return marvelousNotes.client;
    const sdk=await marvelousLoadSdk();
    if(id!==me())throw Error('BC account changed during mailbox initialization.');
    marvelousNotes.client=sdk.createClient(MARVELOUS_URL,MARVELOUS_PUBLIC_KEY,{
      auth:{storageKey:'marvelous-mailbox-local-bc-'+id,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
    });
    return marvelousNotes.client;
  }
  function marvelousCheck(result){if(result.error)throw result.error;return result.data;}
  function marvelousAssertIdentity(){
    if(!marvelousNotes.user||!marvelousNotes.claim||!marvelousNotes.claim.verified_at ||
      numeric(marvelousNotes.claim.claimed_member_number)!==me() || marvelousNotes.owner!==me())
      throw Error('This BC MemberNumber is not verified for this mailbox. Sending is disabled.');
  }
  function marvelousVaultKey(){
    if(!marvelousNotes.user)throw Error('Please sign into your mailbox first.');
    return 'marvelous-e2ee-v1-'+me()+'-'+marvelousNotes.user.id;
  }
  function marvelousPub(jwk){
    if(!jwk||jwk.kty!=='EC'||jwk.crv!=='P-256'||!jwk.x||!jwk.y ||
      !/^[A-Za-z0-9_-]{43}$/.test(jwk.x)||!/^[A-Za-z0-9_-]{43}$/.test(jwk.y))
      throw Error('Invalid P-256 public key.');
    return {kty:'EC',crv:'P-256',x:jwk.x,y:jwk.y};
  }
  async function marvelousFingerprint(keys){
    const bytes=await crypto.subtle.digest('SHA-256',marvelousUtf8(JSON.stringify({e:marvelousPub(keys.ecdh_public_jwk),s:marvelousPub(keys.ecdsa_public_jwk)})));
    return marvelousB64(bytes);
  }
  function marvelousTrustKey(id){return 'marvelous-key-pin-v1-'+me()+'-'+numeric(id);}
  async function marvelousPinKeys(id,keys){
    const path=marvelousTrustKey(id),fp=await marvelousFingerprint(keys);
    const previous=localStorage.getItem(path);
    if(previous&&previous!==fp)throw Error('SECURITY ALERT: Member #'+id+' has changed cryptographic keys. Message blocked. Verify this person through BC before contacting support.');
    if(!previous)localStorage.setItem(path,fp); // TOFU: first-contact keys require out-of-band confirmation for stronger trust.
    return fp;
  }
  function marvelousStagedVaultKey(){
    if(!marvelousNotes.user)throw Error('Open your verified mailbox before resetting encryption.');
    return 'marvelous-e2ee-reset-stage-v1-'+me()+'-'+marvelousNotes.user.id;
  }
  function marvelousSamePublic(a,b){
    try{return JSON.stringify(marvelousPub(a))===JSON.stringify(marvelousPub(b));}catch{return false;}
  }
  function marvelousVaultStorageStatus(){
    const bc=me(),prefix='marvelous-e2ee-v1-'+bc+'-';
    const current=marvelousNotes.user?'marvelous-e2ee-v1-'+bc+'-'+marvelousNotes.user.id:'';
    let found=0,other=0;
    try{for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k?.startsWith(prefix)){found++;if(k!==current)other++;}
    }}catch{}
    return {bcMember:bc,mailboxSignedIn:!!marvelousNotes.user,verified:!!marvelousNotes.claim?.verified_at,
      registeredKeys:!!marvelousNotes.keys,unlocked:!!marvelousNotes.privateKeys,
      currentVaultFound:!!current&&!!localStorage.getItem(current),
      otherVaultsForThisBCMember:other,totalVaultsForThisBCMember:found,
      pendingKeyReset:!!marvelousNotes.user&&!!localStorage.getItem(marvelousStagedVaultKey()),
      guidance:!marvelousNotes.user?'Open Paw Notes and sign in to your mailbox.':
        other?'Older vaults exist for this BC member on this browser. Do not clear storage; they may belong to a previous Supabase session.':
        'The Cloud Hub and Paw Notes use separate passphrases. Keep any encrypted key backups.'};
  }
  // This diagnostic reports counts and booleans only; never keys, passphrases or Supabase user IDs.
  window.MarvelousNotesVaultDiag=marvelousVaultStorageStatus;
  async function marvelousDecodeVaultRecord(obj,password,uid){
    if(!obj||obj.v!==1||typeof obj.salt!=='string'||typeof obj.iv!=='string'||typeof obj.ct!=='string')
      throw Error('Invalid encrypted Paw Notes key backup.');
    if(!password)throw Error('Enter the original Paw Notes key passphrase (not necessarily your cloud backup passphrase).');
    try{
      const material=await crypto.subtle.importKey('raw',marvelousUtf8(password),'PBKDF2',false,['deriveKey']);
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:marvelousUnb64(obj.salt),iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
      const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:marvelousUnb64(obj.iv),additionalData:marvelousUtf8('marvelous-vault:'+uid)},key,marvelousUnb64(obj.ct));
      const vault=JSON.parse(marvelousTextDecoder.decode(raw));
      if(vault?.v!==1||typeof vault.ecdh!=='string'||typeof vault.sign!=='string')throw Error('Damaged encryption keys.');
      marvelousPub(vault.ecdhPublic);marvelousPub(vault.signPublic);
      return vault;
    }catch(e){throw Error('Cannot unlock Paw Notes keys: wrong Paw Notes passphrase, damaged vault, or mismatched mailbox login. Your cloud backup passphrase is separate.');}
  }
  async function marvelousRestoreVault(file,password){
    if(!file||file.size>65536)throw Error('Select a small Marvelous encrypted-key backup JSON file.');
    if(!marvelousNotes.user||!marvelousNotes.claim?.verified_at||!marvelousNotes.keys)
      throw Error('Sign into your original verified mailbox before restoring keys.');
    const backup=JSON.parse(await file.text());
    if(backup?.format!=='MarvelousKeyBackup-v1'||numeric(backup.bc_member)!==me())
      throw Error('This is not an encrypted key backup for your BC account.');
    if(backup.auth_user_id!==marvelousNotes.user.id)
      throw Error('This key backup belongs to a DIFFERENT Supabase mailbox login. Do not overwrite this vault. Identity recovery/relinking must be completed first.');
    const vault=await marvelousDecodeVaultRecord(backup.vault,password,marvelousNotes.user.id);
    const keys=marvelousNotes.keys;
    if(JSON.stringify(marvelousPub(vault.ecdhPublic))!==JSON.stringify(marvelousPub(keys.ecdh_public_jwk))||
       JSON.stringify(marvelousPub(vault.signPublic))!==JSON.stringify(marvelousPub(keys.ecdsa_public_jwk)))
      throw Error('SECURITY: Backup public keys do not match this verified mailbox. Restore refused.');
    const signPriv=await crypto.subtle.importKey('pkcs8',marvelousUnb64(vault.sign),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
    const signPub=await crypto.subtle.importKey('jwk',marvelousPub(keys.ecdsa_public_jwk),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const test=marvelousUtf8('marvelous-vault-recovery-key-check');
    const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},signPriv,test);
    if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},signPub,sig,test))
      throw Error('SECURITY: Signing key in backup does not match the mailbox.');
    const ecdhPriv=await crypto.subtle.importKey('pkcs8',marvelousUnb64(vault.ecdh),{name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
    const ecdhPub=await crypto.subtle.importKey('jwk',marvelousPub(keys.ecdh_public_jwk),{name:'ECDH',namedCurve:'P-256'},false,[]);
    const ephem=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
    const testA=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:ephem.publicKey},ecdhPriv,256));
    const testB=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:ecdhPub},ephem.privateKey,256));
    if(testA.length!==testB.length||testA.some((v,i)=>v!==testB[i]))
      throw Error('SECURITY: Decryption key in backup does not match the mailbox.');
    const key=marvelousVaultKey(),existing=localStorage.getItem(key);
    if(existing){
      if(!window.confirm('This browser already has an encrypted Paw Notes vault. Export the current vault and replace it with the validated backup?'))return;
      download('Marvelous-Previous-Key-Vault-BC-'+me()+'.json','application/json',
        JSON.stringify({format:'MarvelousKeyBackup-v1',bc_member:me(),auth_user_id:marvelousNotes.user.id,vault:JSON.parse(existing)},null,2));
    }else if(!window.confirm('Restore the validated encrypted key backup for this verified mailbox?'))return;
    localStorage.setItem(key,JSON.stringify(backup.vault));
    await marvelousUnlockVault(password);
    marvelousUpdate();notice('Your original encrypted Paw Notes keys were restored and unlocked.');
  }
  // Encrypt and immediately decrypt every newly generated vault before persisting.
  // Do not treat keys as registered until the local round trip succeeds.
  async function marvelousCreateVaultRecord(password,ecdh,sign){
    if(password.length<12)throw Error('Use a passphrase of at least 12 characters.');
    if(!marvelousNotes.user?.id)throw Error('Mailbox session is missing.');
    const uid=marvelousNotes.user.id;
    const ep=marvelousPub(await crypto.subtle.exportKey('jwk',ecdh.publicKey));
    const sp=marvelousPub(await crypto.subtle.exportKey('jwk',sign.publicKey));
    const secret=JSON.stringify({v:1,
      ecdh:marvelousB64(await crypto.subtle.exportKey('pkcs8',ecdh.privateKey)),
      sign:marvelousB64(await crypto.subtle.exportKey('pkcs8',sign.privateKey)),
      ecdhPublic:ep,signPublic:sp});
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const material=await crypto.subtle.importKey('raw',marvelousUtf8(password),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);
    const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:marvelousUtf8('marvelous-vault:'+uid)},key,marvelousUtf8(secret));
    const record={v:1,salt:marvelousB64(salt),iv:marvelousB64(iv),ct:marvelousB64(ct)};
    const opened=await marvelousDecodeVaultRecord(record,password,uid);
    if(!marvelousSamePublic(opened.ecdhPublic,ep)||!marvelousSamePublic(opened.signPublic,sp))
      throw Error('Self-test failed: encryption keys could not be recovered safely. Nothing was changed.');
    return {record,ep,sp};
  }
  async function marvelousStoreVault(password,ecdh,sign){
    const {record,ep,sp}=await marvelousCreateVaultRecord(password,ecdh,sign);
    localStorage.setItem(marvelousVaultKey(),JSON.stringify(record));
    marvelousNotes.privateKeys={ecdh:ecdh.privateKey,sign:sign.privateKey,ecdhPublic:ep,signPublic:sp};
    marvelousNotes.unlocked=true;
  }
  // After a crash, finish the local write ONLY when Supabase already has these exact public keys.
  async function marvelousFinishKeyReset(password){
    marvelousAssertIdentity();
    const stagePath=marvelousStagedVaultKey(),raw=localStorage.getItem(stagePath);
    if(!raw)throw Error('No pending encryption reset is saved on this browser.');
    const stage=JSON.parse(raw),uid=marvelousNotes.user.id;
    if(stage?.v!==1||stage.bc_member!==me()||stage.auth_user_id!==uid)
      throw Error('The pending reset belongs to a different mailbox. Nothing was overwritten.');
    const registered=marvelousNotes.keys;
    if(!registered||!marvelousSamePublic(registered.ecdh_public_jwk,stage.ecdhPublic)||
      !marvelousSamePublic(registered.ecdsa_public_jwk,stage.signPublic))
      throw Error('Server key rotation is not confirmed. The original local vault is untouched.');
    const opened=await marvelousDecodeVaultRecord(stage.vault,password,uid);
    if(!marvelousSamePublic(opened.ecdhPublic,registered.ecdh_public_jwk)||
      !marvelousSamePublic(opened.signPublic,registered.ecdsa_public_jwk))
      throw Error('The saved reset keys do not match the verified mailbox. Nothing was overwritten.');
    const vaultPath=marvelousVaultKey();
    localStorage.setItem(vaultPath,JSON.stringify(stage.vault));
    await marvelousUnlockVault(password);
    marvelousNotes.decrypted.clear();marvelousNotes.decrypting.clear();
    localStorage.removeItem(stagePath);
    await marvelousFetch();
    notice('Your Paw Notes keys are reset and ready. Old encrypted notes cannot be read.');
  }
  async function marvelousResetKeys(password){
    marvelousAssertIdentity();await marvelousEnsureCrypto();
    if(!marvelousNotes.keys)throw Error('Your mailbox keys must be registered first.');
    if(localStorage.getItem(marvelousStagedVaultKey()))
      throw Error('A previous key reset is pending. Finish it or discard the pending attempt first.');
    const uid=marvelousNotes.user.id,bc=me();
    const e=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
    const s=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
    const fresh=await marvelousCreateVaultRecord(password,e,s);
    const stage={v:1,bc_member:bc,auth_user_id:uid,vault:fresh.record,ecdhPublic:fresh.ep,signPublic:fresh.sp};
    try{localStorage.setItem(marvelousStagedVaultKey(),JSON.stringify(stage));}
    catch{throw Error('Browser storage is full. No keys have been rotated. Free storage before retrying.');}
    if(!localStorage.getItem(marvelousStagedVaultKey()))
      throw Error('Could not save the pending key reset. No server keys have been changed.');
    const c=await marvelousClient();
    marvelousCheck(await c.rpc('marvelous_rotate_mailbox_keys',{
      p_ecdh_public_jwk:fresh.ep,p_ecdsa_public_jwk:fresh.sp
    }));
    await marvelousFetch();
    if(me()!==bc||marvelousNotes.user?.id!==uid)throw Error('BC account changed. Pending reset is preserved.');
    await marvelousFinishKeyReset(password);
  }
  async function marvelousUnlockVault(password){
    const record=localStorage.getItem(marvelousVaultKey());
    if(!record)throw Error('Encrypted keys not found on this browser. Do not create new keys: restore the original key backup or recover the mailbox first.');
    const vault=await marvelousDecodeVaultRecord(JSON.parse(record),password,marvelousNotes.user.id);
    // A valid local vault is not sufficient if its keys do not match the public keys
    // currently registered for this verified mailbox.
    if(marvelousNotes.keys&&(!marvelousSamePublic(vault.ecdhPublic,marvelousNotes.keys.ecdh_public_jwk)||
        !marvelousSamePublic(vault.signPublic,marvelousNotes.keys.ecdsa_public_jwk)))
      throw Error('This key vault does not match your currently registered mailbox keys. Use pending reset recovery or the original matching backup.');
    const ecdh=await crypto.subtle.importKey('pkcs8',marvelousUnb64(vault.ecdh),{name:'ECDH',namedCurve:'P-256'},false,['deriveBits']);
    const sign=await crypto.subtle.importKey('pkcs8',marvelousUnb64(vault.sign),{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
    marvelousNotes.privateKeys={ecdh,sign,ecdhPublic:marvelousPub(vault.ecdhPublic),signPublic:marvelousPub(vault.signPublic)};marvelousNotes.unlocked=true;
    void marvelousImportOfflineChats().catch(err=>console.warn('[PawLounge] Offline chat sync:',err));
  }
  async function marvelousEnsureCrypto(){
    if(!window.isSecureContext||!crypto?.subtle)throw Error('Browser Web Crypto is unavailable; secure Paw Notes cannot be used.');
  }
  async function marvelousFetch(){
    const c=await marvelousClient(),bc=me(),epoch=marvelousNotes.epoch;
    const session=marvelousCheck(await c.auth.getSession());
    const user=session.session?marvelousCheck(await c.auth.getUser()).user:null;
    if(epoch!==marvelousNotes.epoch||bc!==me())throw Error('BC account changed during mailbox sync.');
    if(marvelousNotes.user?.id && user?.id!==marvelousNotes.user.id){marvelousNotes.privateKeys=null;marvelousNotes.unlocked=false;marvelousNotes.decrypted.clear();}
    marvelousNotes.user=user||null;marvelousNotes.claim=null;marvelousNotes.keys=null;marvelousNotes.inbox=[];marvelousNotes.outbox=[];
    if(!user)return;
    marvelousNotes.claim=marvelousCheck(await c.from('marvelous_bc_claims').select('auth_user_id,claimed_member_number,challenge_code,created_at,verified_at').eq('auth_user_id',user.id).maybeSingle());
    marvelousNotes.keys=marvelousCheck(await c.from('marvelous_secure_keys').select('auth_user_id,bc_member_number,ecdh_public_jwk,ecdsa_public_jwk,accept_notes,rotated_at').eq('auth_user_id',user.id).maybeSingle());
    if(epoch!==marvelousNotes.epoch||bc!==me())throw Error('BC account switched.');
    if(marvelousNotes.claim && numeric(marvelousNotes.claim.claimed_member_number)!==bc)
      throw Error('Mailbox identity mismatch; no messages loaded.');
    if(marvelousNotes.privateKeys&&marvelousNotes.keys&&
       (!marvelousSamePublic(marvelousNotes.privateKeys.ecdhPublic,marvelousNotes.keys.ecdh_public_jwk)||
        !marvelousSamePublic(marvelousNotes.privateKeys.signPublic,marvelousNotes.keys.ecdsa_public_jwk))){
      marvelousNotes.privateKeys=null;marvelousNotes.unlocked=false;marvelousNotes.decrypted.clear();
    }
    if(!marvelousNotes.claim?.verified_at||!marvelousNotes.keys)return;
    let inQuery=c.from('marvelous_secure_notes').select('id,sender_uid,recipient_uid,sender_bc_member,recipient_bc_member,envelope,sent_at,read_at').eq('recipient_uid',user.id);
    if(marvelousNotes.keys.rotated_at)inQuery=inQuery.gte('sent_at',marvelousNotes.keys.rotated_at);
    marvelousNotes.inbox=marvelousCheck(await inQuery.order('sent_at',{ascending:false}).limit(50))||[];
    let outQuery=c.from('marvelous_secure_notes').select('id,sender_uid,recipient_uid,sender_bc_member,recipient_bc_member,envelope,sent_at,read_at').eq('sender_uid',user.id);
    if(marvelousNotes.keys.rotated_at)outQuery=outQuery.gte('sent_at',marvelousNotes.keys.rotated_at);
    marvelousNotes.outbox=marvelousCheck(await outQuery.order('sent_at',{ascending:false}).limit(50))||[];
    if(epoch!==marvelousNotes.epoch||bc!==me())throw Error('BC account switched.');
    marvelousUpdateUnreadIndicator();
    if(marvelousNotes.privateKeys)void marvelousImportOfflineChats().catch(err=>console.warn('[PawLounge] Offline chat sync:',err));
  }
  async function marvelousDirectory(member){
    if(!numeric(member))throw Error('Enter a numeric Bondage Club MemberNumber.');
    const c=await marvelousClient();
    const k=marvelousCheck(await c.from('marvelous_secure_keys').select('auth_user_id,bc_member_number,ecdh_public_jwk,ecdsa_public_jwk,accept_notes').eq('bc_member_number',member).maybeSingle());
    if(!k)throw Error('Member #'+member+' has no verified Marvelous mailbox.');
    await marvelousPinKeys(member,k);
    return k;
  }
  function marvelousUUID(){return crypto.randomUUID();}
  function marvelousCanonicalEnvelope(w){
    if(w?.v!==1||!/^[0-9a-f-]{36}$/.test(w.id||'')||!numeric(w.from)||!numeric(w.to))throw Error('Malformed signed message.');
    for(const k of ['r','s'])if(!w[k]||!/^[A-Za-z0-9_-]{16}$/.test(w[k].iv)||!w[k].ct||w[k].ct.length>9000)throw Error('Malformed encrypted payload.');
    return {v:1,id:w.id,from:String(w.from),to:String(w.to),epk:marvelousPub(w.epk),r:{iv:w.r.iv,ct:w.r.ct},s:{iv:w.s.iv,ct:w.s.ct}};
  }
  async function marvelousSharedKey(privateKey,otherPublic,id,label){
    const other=await crypto.subtle.importKey('jwk',marvelousPub(otherPublic),{name:'ECDH',namedCurve:'P-256'},false,[]);
    const bits=await crypto.subtle.deriveBits({name:'ECDH',public:other},privateKey,256);
    const root=await crypto.subtle.importKey('raw',bits,'HKDF',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:marvelousUtf8('Marvelous-PawNotes:'+id),info:marvelousUtf8('AES-GCM:'+label)},root,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function marvelousSeal(key,text,header){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:marvelousUtf8(header)},key,marvelousUtf8(text));
    return {iv:marvelousB64(iv),ct:marvelousB64(ciphertext)};
  }
  async function marvelousEncrypt(text,to,k){
    marvelousAssertIdentity();
    if(!marvelousNotes.privateKeys)throw Error('Unlock the key vault first.');
    const id=marvelousUUID(),from=me();
    const ephemeral=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
    const epk=marvelousPub(await crypto.subtle.exportKey('jwk',ephemeral.publicKey));
    const ours=marvelousNotes.keys;
    const rk=await marvelousSharedKey(ephemeral.privateKey,k.ecdh_public_jwk,id,'recipient');
    const sk=await marvelousSharedKey(ephemeral.privateKey,ours.ecdh_public_jwk,id,'sender');
    const r=await marvelousSeal(rk,text,'marvelous:'+id+':'+from+':'+to+':recipient');
    const s=await marvelousSeal(sk,text,'marvelous:'+id+':'+from+':'+to+':sender');
    const w=marvelousCanonicalEnvelope({v:1,id,from:String(from),to:String(to),epk,r,s});
    const signature=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},marvelousNotes.privateKeys.sign,marvelousUtf8(JSON.stringify(w)));
    return {...w,sig:marvelousB64(signature)};
  }
  const MARVELOUS_OFFLINE_NOTE_TTL_MS=7*24*60*60*1000;
  // Keep the original marker for backwards-compatible reading. Never show
  // either transport marker in the user-facing mailbox or conversation history.
  const MARVELOUS_OFFLINE_CHAT_PREFIX='\u001ePawLounge-Offline-Chat-v1\u001e\n';
  const MARVELOUS_OFFLINE_CHAT_V2_PREFIX='\u001ePawLounge-Offline-Chat-v2\u001e\n';
  const marvelousAccountName=value=>trim(value,80).replace(/[\x00-\x1f\x7f-\x9f]/g,' ').replace(/\s+/g,' ').trim();
  function marvelousOfflineChatContent(plaintext){
    if(plaintext.startsWith(MARVELOUS_OFFLINE_CHAT_V2_PREFIX)){
      let packet;
      try{packet=JSON.parse(plaintext.slice(MARVELOUS_OFFLINE_CHAT_V2_PREFIX.length));}catch{}
      if(packet?.v!==2||typeof packet.body!=='string'||!packet.body||packet.body.length>2000)
        throw Error('Invalid offline chat format.');
      return {offline:true,body:packet.body,senderName:marvelousAccountName(packet.senderName)};
    }
    if(plaintext.startsWith(MARVELOUS_OFFLINE_CHAT_PREFIX))
      return {offline:true,body:plaintext.slice(MARVELOUS_OFFLINE_CHAT_PREFIX.length),senderName:''};
    return {offline:false,body:plaintext,senderName:''};
  }
  // An account name is a display hint, never proof of identity. Verified,
  // signed BC member numbers remain authoritative for message routing.
  function marvelousKnownAccountName(member,senderName=''){
    const roomName=Array.isArray(window.ChatRoomCharacter)?window.ChatRoomCharacter.find(p=>numeric(p?.MemberNumber)===member)?.Name:'';
    const candidates=[roomName,state.chats[member]?.displayName,window.Player?.FriendNames?.get?.(member),state.profiles[member]?.name,senderName];
    return candidates.map(marvelousAccountName).find(value=>value&&value!==`Kitty #${member}`&&value!==`BC #${member}`)||'';
  }
  let marvelousOfflineImportBusy=false;
  // Real offline delivery goes through the existing authenticated, signed,
  // end-to-end encrypted mailbox. Never transmit private text through BC as a
  // fake delivery attempt, and never downgrade after an encryption failure.
  async function marvelousSendOfflineChat(recipient,text,onHandoff){
    await marvelousEnsureCrypto();
    const c=await marvelousClient();
    if(!marvelousNotes.user||!marvelousNotes.claim||!marvelousNotes.keys)
      await marvelousFetch();
    marvelousAssertIdentity();
    if(!marvelousNotes.privateKeys)
      throw Error('Open Paw Notes and unlock your encryption vault before sending an offline message.');
    const to=numeric(recipient),member=await marvelousDirectory(to);
    if(!member.accept_notes)throw Error('BC #'+to+' is not accepting offline Paw Notes.');
    // The name travels inside the sender-signed, end-to-end encrypted payload.
    // It is optional metadata and cannot replace the verified sender MemberNumber.
    const displayName=marvelousAccountName(window.Player?.Name||window.Player?.Nickname||'');
    const packet=MARVELOUS_OFFLINE_CHAT_V2_PREFIX+JSON.stringify({v:2,senderName:displayName,body:text});
    const envelope=await marvelousEncrypt(packet,to,member);
    const row={id:envelope.id,sender_uid:marvelousNotes.user.id,recipient_uid:member.auth_user_id,
      sender_bc_member:me(),recipient_bc_member:to,envelope,
      expires_at:new Date(Date.now()+MARVELOUS_OFFLINE_NOTE_TTL_MS).toISOString()};
    // From here an interrupted request may have been accepted; do not
    // automatically retry and accidentally send twice.
    onHandoff();
    const result=await c.from('marvelous_secure_notes').insert(row);
    if(result.error){
      // A definitive SQL rejection was not saved. Network errors remain
      // unconfirmed and should never be auto-replayed.
      if(result.status>=400&&result.status<500)throw Object.assign(new Error(result.error.message),{definitive:true});
      throw result.error;
    }
    return envelope.id;
  }
  async function marvelousImportOfflineChats(){
    if(marvelousOfflineImportBusy||!marvelousNotes.privateKeys||!marvelousNotes.claim?.verified_at)return;
    const owner=me(),uid=marvelousNotes.user?.id;
    if(!uid)return;
    marvelousOfflineImportBusy=true;
    const ledgerKey='pawlounge-offline-import-v1-'+owner;
    let ledger=[];
    try{const stored=JSON.parse(localStorage.getItem(ledgerKey)||'[]');if(Array.isArray(stored))ledger=stored.filter(x=>typeof x==='string'&&/^[0-9a-f-]{36}$/.test(x)).slice(-1000);}catch{}
    const seen=new Set(ledger);
    try{
      for(const row of marvelousNotes.inbox){
        if(owner!==me()||uid!==marvelousNotes.user?.id||!marvelousNotes.privateKeys)break;
        if(seen.has(row.id)||numeric(row.recipient_bc_member)!==owner)continue;
        let plain;
        try{plain=await marvelousDecrypt(row,true);}catch{continue;}
        const content=marvelousOfflineChatContent(plain);
        if(!content.offline)continue;
        const from=numeric(row.sender_bc_member);
        if(!from||from===owner||!content.body||content.body.length>2000)continue;
        // The BC sender and member number are checked by MarvelousDecrypt's
        // signature verification before the text enters local chat history.
        if(content.senderName&&!state.chats[from]?.displayName)
          rememberNativeSender(from,content.senderName);
        appendMessage(from,content.body,from,'beep','network',{messageId:'marv_'+row.id,offline:true});
        seen.add(row.id);ledger.push(row.id);
        try{localStorage.setItem(ledgerKey,JSON.stringify(ledger.slice(-1000)));}catch(e){
          console.warn('[PawLounge] Could not save offline import marker; browser storage may be full.',e);
        }
      }
    }finally{marvelousOfflineImportBusy=false;}
  }
  async function marvelousDecrypt(row,inbox){
    if(!marvelousNotes.privateKeys)return '[Encrypted — unlock your keys to read]';
    const w=marvelousCanonicalEnvelope(row.envelope),own=me();
    if(w.id!==row.id || numeric(w.from)!==numeric(row.sender_bc_member)||numeric(w.to)!==numeric(row.recipient_bc_member))
      throw Error('Signed routing data does not match the database row.');
    if((inbox ? numeric(w.to) : numeric(w.from))!==own)throw Error('Wrong account.');
    const otherMember=inbox?numeric(w.from):numeric(w.to);
    const keyRecord=inbox?await marvelousDirectory(otherMember):marvelousNotes.keys;
    if(inbox && keyRecord.auth_user_id!==row.sender_uid)throw Error('Sender identity and signature key mismatch.');
    const pub=await crypto.subtle.importKey('jwk',marvelousPub(keyRecord.ecdsa_public_jwk),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    const signatureOK=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},pub,marvelousUnb64(row.envelope.sig),marvelousUtf8(JSON.stringify(w)));
    if(!signatureOK)throw Error('Invalid sender signature.');
    const label=inbox?'recipient':'sender',piece=inbox?w.r:w.s;
    const aes=await marvelousSharedKey(marvelousNotes.privateKeys.ecdh,w.epk,w.id,label);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:marvelousUnb64(piece.iv),additionalData:marvelousUtf8('marvelous:'+w.id+':'+w.from+':'+w.to+':'+label)},aes,marvelousUnb64(piece.ct));
    return marvelousTextDecoder.decode(plain);
  }
  function marvelousUpdateUnreadIndicator(){
    const count=marvelousNotes.inbox.filter(m=>!m.read_at).length;
    const button=ui.shadow?.querySelector('[data-tab="notes"]');
    if(button){const label=button.querySelector('.tx');if(label)label.textContent=count?'Paw Notes ('+Math.min(count,99)+')':'Paw Notes';button.title=count?count+' unread encrypted Paw Notes':'Offline Marvelous Paw Notes';}
    if(marvelousLastUnread>=0&&count>marvelousLastUnread&&state.tab!=='notes'&&state.settings.notifications&&!inPawQuietHours())notice('💌 You have '+count+' unread Paw Note'+(count===1?'':'s')+'.');
    marvelousLastUnread=count;
  }
  function marvelousBackgroundTick(){
    if(!state.open||!marvelousNotes.initialized||!marvelousNotes.user||!marvelousNotes.claim?.verified_at||marvelousNotes.busy||state.tab==='notes'||me()!==marvelousNotes.owner)return;
    if(Date.now()<marvelousNextBackgroundSync)return;
    if(document.hidden)return;
    marvelousNextBackgroundSync=Date.now()+(marvelousBridge.lowCpu?360000:120000);void marvelousRun(marvelousFetch);
  }
  function marvelousUpdate(){if(state.open&&state.tab==='notes')renderMarvelousNotes();marvelousUpdateUnreadIndicator();}
  async function marvelousRun(task){
    if(marvelousNotes.busy)return;
    marvelousNotes.busy=true;marvelousNotes.error='';marvelousUpdate();
    try{await task();}catch(e){marvelousNotes.error=String(e?.message||e).slice(0,450);console.warn('[Marvelous Secure Paw Notes]',e);}
    finally{marvelousNotes.busy=false;marvelousUpdate();}
  }
  function marvelousEnterTab(){
    if(marvelousNotes.initialized)return;
    marvelousNotes.initialized=true;
    void marvelousRun(async()=>{await marvelousEnsureCrypto();await marvelousFetch();});
  }
  function marvelousSafeDate(value){const d=new Date(value);return isNaN(d.valueOf())?'':d.toLocaleString();}
  function marvelousNoteList(items,inbox){
    if(!items.length)return '<p class="muted">No secure Paw Notes yet.</p>';
    return items.map(m=>{
      const sender=numeric(m.sender_bc_member),recipient=numeric(m.recipient_bc_member);
      const other=inbox?sender:recipient;
      const when=escapeText(marvelousSafeDate(m.sent_at));
      const status=inbox&&!m.read_at?`<button class="secondary" data-action="marv-read" data-note-id="${escapeText(m.id)}">Mark read</button>`:
        `<span class="muted">${inbox?'Read':m.read_at?'Read by recipient':'Not yet read'}</span>`;
      const cached=marvelousNotes.decrypted.get(m.id);
      let content=null;
      if(typeof cached==='string'){
        try{content=marvelousOfflineChatContent(cached);}catch{content={body:'Cannot display this offline chat.',offline:false,senderName:''};}
      }
      const accountName=marvelousKnownAccountName(other,inbox?content?.senderName||'':'');
      const nameTag=accountName?' — '+escapeText(accountName):'';
      return `<article class="kc-marv-item"><div class="kc-marv-meta"><b>${inbox?'From':'To'}: BC #${other}</b><span data-marv-sender-name="${escapeText(m.id)}">${nameTag}</span> <small>${when}</small></div><div class="muted" data-marv-offline-label="${escapeText(m.id)}" ${content?.offline?'':'hidden'}>Offline chat</div><p class="kc-marv-body" data-marv-plain="${escapeText(m.id)}">${content?escapeText(content.body):marvelousNotes.privateKeys?'Decrypting…':'🔒 Encrypted — unlock to read'}</p>${status}${inbox?`<button class="secondary" data-action="marv-block" data-bc-id="${sender}">Block #${sender}</button>`:''}</article>`;
    }).join('');
  }
  async function marvelousDecryptVisible(){
    if(!marvelousNotes.privateKeys||state.tab!=='notes'||!state.open)return;
    const epoch=marvelousNotes.epoch,notes=marvelousNotes.view==='inbox'?marvelousNotes.inbox:marvelousNotes.outbox,inbox=marvelousNotes.view==='inbox';
    for(const row of notes){
      if(epoch!==marvelousNotes.epoch||state.tab!=='notes'||!state.open)return;
      const el=ui.body?.querySelector('[data-marv-plain="'+row.id+'"]');
      if(!el||marvelousNotes.decrypted.has(row.id)||marvelousNotes.decrypting.has(row.id))continue;
      marvelousNotes.decrypting.add(row.id);
      try{
        const plaintext=await marvelousDecrypt(row,inbox);
        if(epoch!==marvelousNotes.epoch)return;
        const content=marvelousOfflineChatContent(plaintext);
        marvelousNotes.decrypted.set(row.id,plaintext);
        if(el.isConnected){
          el.textContent=content.body;
          const label=ui.body?.querySelector('[data-marv-offline-label="'+row.id+'"]');
          if(label)label.hidden=!content.offline;
          const nameTag=ui.body?.querySelector('[data-marv-sender-name="'+row.id+'"]');
          const member=numeric(inbox?row.sender_bc_member:row.recipient_bc_member);
          const accountName=marvelousKnownAccountName(member,inbox?content.senderName:'');
          if(nameTag)nameTag.textContent=accountName?' — '+accountName:'';
        }
      }catch(e){if(el.isConnected)el.textContent='⛔ Cannot authenticate/decrypt this message: '+String(e?.message||e).slice(0,130);}
      finally{marvelousNotes.decrypting.delete(row.id);}
    }
  }
  function renderMarvelousNotes(){
    if(!ui.body)return;
    if(marvelousNotes.owner&&marvelousNotes.owner!==me())marvelousNotesReset();
    const x=marvelousNotes,message=x.error?`<p class="kc-marv-error" role="alert">${escapeText(x.error)}</p>`:'';
    let inside='';
    if(!x.initialized||x.busy&&!x.user)inside='<p class="muted">Opening Marvelous mailbox…</p>';
    else if(!x.user)inside='<p>No email needed. Your private mailbox sign-in is saved on this browser.</p><button class="primary" data-action="marv-start">Create my mailbox</button>';
    else if(!x.claim){
      inside=`<p>Set up your private mailbox for BC <b>#${me()}</b>. You will confirm ownership with a one-time private whisper to PawID.</p>${localStorage.getItem(marvelousVaultKey())?'<p>An encrypted key vault already exists; enter its original passphrase to resume registration safely.</p>':''}
        <label>Create encryption-key passphrase (12+ characters)<input type="password" class="field" id="kc-marv-pass" autocomplete="new-password" minlength="12"></label>
        <label>Confirm encryption passphrase<input type="password" class="field" id="kc-marv-pass-confirm" autocomplete="new-password" minlength="12"></label>
        <button class="primary" data-action="marv-register">Set up my private mailbox</button>`;
    }else if(numeric(x.claim.claimed_member_number)!==me()){
      inside='<p class="kc-marv-error">Account mismatch. Mailbox locked; do not use this BC account with these credentials.</p>';
    }else if(!x.keys){
      inside=`<p>Finish setting up your private mailbox. Saved encryption keys: ${localStorage.getItem(marvelousVaultKey())?'found':'not found'}.</p><label>Passphrase<input class="field" id="kc-marv-pass" type="password" autocomplete="off"></label><button class="primary" data-action="marv-resume">Continue mailbox setup</button>`;
    }else if(!x.claim.verified_at){
      inside=`<h3>🔐 BC #${me()} — one-time automatic verification</h3><p>Confirm your account with a one-time private whisper to PawID. Once verified, you can send and receive private notes without repeating this step each time you sign in.</p>${MARVELOUS_VERIFIER_BC_MEMBER>0?`<p>PawID <b>#${MARVELOUS_VERIFIER_BC_MEMBER}</b> must be online and in your current BC chatroom. Join PawID in <b>Subbycat's place</b> before continuing.</p><button class="primary" data-action="marv-auto-verify">Send verification whisper</button>`:'<p class="kc-marv-error">Verification is not available right now. Please try again later.</p>'}<p class="muted">Your confirmation code: <code>Marvelous verify: ${escapeText(x.claim.challenge_code)}</code></p><button class="secondary" data-action="marv-refresh">Check verification</button><button class="secondary" data-action="marv-backup">Save encrypted key backup</button>`;
    }else{
      const inboxUnread=x.inbox.filter(m=>!m.read_at).length;
      inside=`<p class="muted">✓ Verified BC #${me()} · ${inboxUnread} unread · Paw Notes expire according to their selected lifetime (offline chat notes: 7 days).</p>
        ${marvelousPromptDisabled(me())?'<p class="muted">Sign-in unlock reminder is disabled. <button class="secondary" data-action="marv-prompt-allow">Ask to unlock on sign-in</button></p>':'<p class="muted">On sign-in, Marvelous can offer to unlock your offline mailbox. You can dismiss or disable the reminder.</p>'}
        ${x.privateKeys?'<p class="muted">🔓 Vault unlocked for this session.</p>':`<p class="muted">Paw Notes needs the passphrase chosen when this mailbox was created. The Cloud Hub backup password may be different.</p><label>Unlock encrypted messages with your Paw Notes passphrase<input class="field" type="password" id="kc-marv-pass" autocomplete="off"></label><button class="primary" data-action="marv-unlock">Unlock</button><p class="muted">Key vault on this browser: <b>${marvelousVaultStorageStatus().currentVaultFound?'found':'not found'}</b>. ${marvelousVaultStorageStatus().otherVaultsForThisBCMember?'Older login vaults also exist here; do not delete browser storage.':''}</p><label>Restore your saved encrypted-key backup (JSON)<input class="field" id="kc-marv-keyfile" type="file" accept=".json,application/json"></label><button class="secondary" data-action="marv-key-info">Check key storage</button>`}
        ${!x.privateKeys?`<section class="kc-marv-compose"><h3>Encryption key recovery</h3>
          ${marvelousVaultStorageStatus().pendingKeyReset?`<p>A previous key reset was interrupted. Enter the passphrase chosen during that reset to finish safely.</p><label>Reset passphrase<input class="field" type="password" id="kc-marv-reset-pass" autocomplete="off"></label><button class="secondary" data-action="marv-finish-reset">Finish pending key reset</button><button class="secondary" data-action="marv-discard-reset">Discard pending attempt (server keys unchanged only)</button>`:
          `<p>If your original Paw Notes keys cannot be unlocked, you can replace them without losing BC verification. <b>Old encrypted Paw Notes will become unreadable</b>; contacts must confirm your new key fingerprint.</p><label>New Paw Notes passphrase (12+ characters)<input class="field" type="password" id="kc-marv-reset-pass" autocomplete="new-password" minlength="12"></label><button class="secondary" data-action="marv-reset-keys">Reset Paw Notes encryption</button>`}
        </section>`:''}
        <section class="kc-marv-compose"><h3>Contact key verification</h3><p class="muted">If a friend has reset their encryption keys, verify their new fingerprint with them through native BC before accepting it here.</p><label>BC MemberNumber<input class="field" id="kc-marv-key-member" inputmode="numeric" placeholder="123456"></label><button class="secondary" data-action="marv-review-contact-key">Review updated key</button></section>
        <div class="kc-marv-actions"><button class="secondary" data-action="marv-backup">Save encrypted key backup</button><button class="secondary" data-action="marv-refresh">↻ Refresh</button><button class="secondary" data-action="marv-switch" ${x.view==='inbox'?'disabled':''}>📥 Inbox</button><button class="secondary" data-action="marv-outbox" ${x.view==='outbox'?'disabled':''}>📤 Sent</button></div>
        ${x.privateKeys?`<section class="kc-marv-compose"><h3>✉️ Leave encrypted Paw Note</h3><label>Recipient's BC member number<input id="kc-marv-to" class="field" inputmode="numeric" placeholder="123456" value="${escapeText(x.draftTo)}"></label><label>Your private message<textarea id="kc-marv-body" class="field" rows="4" maxlength="2000">${escapeText(x.draftBody)}</textarea></label><label>Message expiration<select class="field" id="marv-message-ttl"><option value="30d" ${x.ttl==='30d'?'selected':''}>30 days</option><option value="7d" ${x.ttl==='7d'?'selected':''}>7 days</option><option value="1d" ${x.ttl==='1d'?'selected':''}>1 day</option></select></label><label>Schedule for later (optional; requires trusted scheduler)<input type="datetime-local" class="field" id="marv-send-at" value="${escapeText(x.sendAt||'')}"></label><button class="primary" data-action="marv-send">Encrypt & send</button></section>`:''}
        <h3>${x.view==='inbox'?'📥 Secure inbox':'📤 Secure sent notes'}</h3>${marvelousNoteList(x.view==='inbox'?x.inbox:x.outbox,x.view==='inbox')}`;
    }
    const guide=!x.claim?.verified_at?`<section class="marv-feature-card" aria-label="How PawID verification works">
      <h3>🐾 How to verify with PawID</h3>
      <ol><li>Log into the BC character you want to register and create your mailbox here.</li>
      <li>Find <b>PawID (#264370)</b> in the <b>Subbycat's place</b> chatroom. PawID must be online.</li>
      <li>While you and PawID are in the same chatroom, choose <b>Send verification whisper</b>. PawLounge privately sends your one-time code to PawID.</li>
      <li>Come back here and use <b>Check verification</b> if needed. When PawID confirms the BC MemberNumber, your mailbox unlocks.</li></ol>
      <p class="muted">No email or password for PawID is needed. You normally verify just once per mailbox. If PawID is offline or not in your room, try again once you are both in the same chatroom. Never give another player your encryption passphrase.</p>
    </section>`:'';
    ui.body.innerHTML=`<div class="kc-marv-page"><h2>💌 Marvelous Paw Notes</h2><p class="muted">Private notes are addressed to verified BC member numbers and encrypted before they leave your browser.</p>${guide}${message}${inside}${x.busy?'<p class="muted">Working…</p>':''}<p class="muted">Keep an encrypted key backup before clearing browser data or switching devices. If you lose your saved keys, old notes may become unreadable. Paw Notes and regular BC whispers are separate. For extra security, compare encryption fingerprints with your friends.</p></div>`;
    if(x.privateKeys)void marvelousDecryptVisible();
  }
  async function marvelousAction(act,element){
    if(act==='marv-switch'||act==='marv-outbox'){marvelousNotes.view=act==='marv-switch'?'inbox':'outbox';marvelousUpdate();return;}
    if(act==='marv-start')return marvelousRun(async()=>{
      await marvelousEnsureCrypto();const c=await marvelousClient(),res=await c.auth.getSession();if(res.error)throw res.error;
      if(!res.data.session)marvelousCheck(await c.auth.signInAnonymously());
      await marvelousFetch();
    });
    if(act==='marv-refresh')return marvelousRun(marvelousFetch);
    if(act==='marv-auto-verify')return marvelousRun(async()=>{
      const target=Number(MARVELOUS_VERIFIER_BC_MEMBER);
      if(!Number.isSafeInteger(target)||target<=0||target===me())throw Error('Marvelous verifier account is not configured.');
      if(!marvelousNotes.claim||marvelousNotes.claim.verified_at||numeric(marvelousNotes.claim.claimed_member_number)!==me())
        throw Error('Register the correct BC character first.');
      if(typeof window.ServerSend!=='function')throw Error('BC native messaging is not ready.');
      if(!inRoom(target))throw Error("Join PawID (#264370) in Subbycat's place first. Verification whispers only work in the same BC chatroom.");
      let claim=marvelousNotes.claim;
      const created=Date.parse(String(claim.created_at||''));
      if(!Number.isFinite(created)||Date.now()-created>12*60*1000){
        const client=await marvelousClient();
        marvelousCheck(await client.rpc('marvelous_rotate_challenge'));
        await marvelousFetch();
        claim=marvelousNotes.claim;
      }
      if(!claim||claim.verified_at||numeric(claim.claimed_member_number)!==me()||!/^[0-9a-f]{32}$/.test(claim.challenge_code))
        throw Error('Invalid or already verified BC challenge.');
      // BC server supplies the sender MemberNumber to the verifier's native event.
      // No Supabase privilege is granted just because this send was attempted.
      // BC supplies the actual sender MemberNumber to the receiving room packet.
      // Whisper delivery is restricted by BC to players in this same chatroom.
      window.ServerSend('ChatRoomChat',{Type:'Whisper',Target:target,
        Content:'Marvelous verify: '+claim.challenge_code});
      notice('Private verification whisper sent to PawID #'+target+'. Check verification shortly.');
      if(marvelousVerificationPoll)clearInterval(marvelousVerificationPoll);
      const myMember=me();let attempts=0;
      marvelousVerificationPoll=setInterval(async()=>{
        if(++attempts>30||me()!==myMember||marvelousNotes.claim?.verified_at){clearInterval(marvelousVerificationPoll);marvelousVerificationPoll=null;return;}
        try{await marvelousFetch();if(marvelousNotes.claim?.verified_at){notice('✓ Marvelous BC #'+myMember+' verified automatically!');marvelousUpdate();clearInterval(marvelousVerificationPoll);marvelousVerificationPoll=null;}}
        catch(e){console.warn('[Marvelous auto-verification]',e);}
      },10000);
    });
    if(act==='marv-register'){
      const pass=String(ui.shadow?.getElementById('kc-marv-pass')?.value||'');
      if(pass.length<12){marvelousNotes.error='Choose a passphrase at least 12 characters long.';marvelousUpdate();return;}
      if(pass!==String(ui.shadow?.getElementById('kc-marv-pass-confirm')?.value||'')){
        marvelousNotes.error='Passphrases do not match. No mailbox or keys were created.';marvelousUpdate();return;
      }
      return marvelousRun(async()=>{
        await marvelousEnsureCrypto();const c=await marvelousClient(),uid=marvelousNotes.user?.id;
        if(!uid)throw Error('Sign into a mailbox session first.');
        if(marvelousNotes.claim)throw Error('MemberNumber already claimed; cannot create a second identity here.');
        if(localStorage.getItem(marvelousVaultKey())){
          await marvelousUnlockVault(pass);
        }else{
          const ecdh=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
          const sign=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
          await marvelousStoreVault(pass,ecdh,sign);
        }
        const ek=marvelousNotes.privateKeys.ecdhPublic;
        const sk=marvelousNotes.privateKeys.signPublic;
        marvelousCheck(await c.from('marvelous_bc_claims').insert({auth_user_id:uid,claimed_member_number:me()}));
        marvelousCheck(await c.from('marvelous_secure_keys').insert({auth_user_id:uid,bc_member_number:me(),ecdh_public_jwk:ek,ecdsa_public_jwk:sk}));
        await marvelousFetch();
      });
    }
    if(act==='marv-resume'){
      const pass=String(ui.shadow?.getElementById('kc-marv-pass')?.value||'');
      return marvelousRun(async()=>{
        await marvelousUnlockVault(pass);
        const c=await marvelousClient();
        marvelousCheck(await c.from('marvelous_secure_keys').insert({auth_user_id:marvelousNotes.user.id,bc_member_number:me(),ecdh_public_jwk:marvelousNotes.privateKeys.ecdhPublic,ecdsa_public_jwk:marvelousNotes.privateKeys.signPublic}));
        await marvelousFetch();
      });
    }
    if(act==='marv-backup')return marvelousRun(async()=>{
      if(!marvelousNotes.user)throw Error('No mailbox session.');
      const vault=localStorage.getItem(marvelousVaultKey());if(!vault)throw Error('No encrypted vault on this browser.');
      download('Marvelous-Encrypted-Keys-BC-'+me()+'.json','application/json',JSON.stringify({format:'MarvelousKeyBackup-v1',bc_member:me(),auth_user_id:marvelousNotes.user.id,vault:JSON.parse(vault)},null,2));
      notice('Encrypted key backup saved. Store it privately; never share your passphrase.');
    });
    if(act==='marv-key-info'){
      const d=marvelousVaultStorageStatus();
      notice((d.currentVaultFound?'This mailbox has an encrypted key vault on this browser.':'No encrypted keys exist for the current mailbox login on this browser.')+(d.otherVaultsForThisBCMember?' Previous-login vault(s) found: '+d.otherVaultsForThisBCMember+'.':''));
      return;
    }
    if(act==='marv-unlock'){
      const pass=String(ui.shadow?.getElementById('kc-marv-pass')?.value||'');
      return marvelousRun(async()=>{await marvelousUnlockVault(pass);marvelousUpdate();});
    }
    if(act==='marv-reset-keys'){
      // The busy-state redraw removes password inputs. Capture before marvelousRun.
      const pass=String(ui.shadow?.getElementById('kc-marv-reset-pass')?.value||'');
      return marvelousRun(async()=>{
      if(pass.length<12)throw Error('Choose a new passphrase at least 12 characters long.');
      if(window.prompt('Repeat your NEW Paw Notes passphrase to confirm:','')!==pass)
        throw Error('New passphrase confirmation did not match. Nothing changed.');
      if(window.prompt('Old encrypted Paw Notes will be unreadable. Type RESET to continue:','')!=='RESET')return;
      if(!window.confirm('Reset the encryption keys for your VERIFIED BC #'+me()+' mailbox? This cannot recover older messages.'))return;
      await marvelousResetKeys(pass);marvelousUpdate();
      });
    }
    if(act==='marv-finish-reset'){
      // Keep the supplied passphrase through the busy-state redraw.
      const pass=String(ui.shadow?.getElementById('kc-marv-reset-pass')?.value||'');
      return marvelousRun(async()=>{
      if(!pass)throw Error('Enter the new passphrase chosen for the interrupted reset.');
      await marvelousFetch();await marvelousFinishKeyReset(pass);marvelousUpdate();
      });
    }
    if(act==='marv-discard-reset')return marvelousRun(async()=>{
      marvelousAssertIdentity();
      const raw=localStorage.getItem(marvelousStagedVaultKey());if(!raw)return;
      const st=JSON.parse(raw),keys=marvelousNotes.keys;
      if(keys&&(marvelousSamePublic(keys.ecdh_public_jwk,st.ecdhPublic)||
                  marvelousSamePublic(keys.ecdsa_public_jwk,st.signPublic)))
        throw Error('These keys are registered on the server. Finish the pending reset instead; discarding them would lose mailbox access.');
      if(!window.confirm('Discard only the unfinished reset attempt? Your existing encrypted key vault remains unchanged.'))return;
      localStorage.removeItem(marvelousStagedVaultKey());marvelousUpdate();
    });
    if(act==='marv-review-contact-key'){
      const bc=numeric(String(ui.shadow?.getElementById('kc-marv-key-member')?.value||'').trim());
      return marvelousRun(async()=>{
      marvelousAssertIdentity();
      if(!bc||bc===me())throw Error('Enter the BC MemberNumber of the contact whose keys changed.');
      const client=await marvelousClient();
      const keys=marvelousCheck(await client.from('marvelous_secure_keys')
        .select('auth_user_id,bc_member_number,ecdh_public_jwk,ecdsa_public_jwk')
        .eq('bc_member_number',bc).maybeSingle());
      if(!keys)throw Error('This member has no verified public encryption keys.');
      const fresh=await marvelousFingerprint(keys),path=marvelousTrustKey(bc);
      const old=localStorage.getItem(path);
      if(old===fresh)return notice('The saved fingerprint for BC #'+bc+' is already current.');
      if(old&&!window.confirm('BC #'+bc+' has changed encryption keys.\n\nOLD: '+old+'\nNEW: '+fresh+'\n\nOnly continue after confirming the new fingerprint with this person through BC.'))return;
      if(window.prompt('Type the LAST 8 characters of the NEW fingerprint shown by BC #'+bc+' to accept it:','')!==fresh.slice(-8))
        throw Error('Fingerprint confirmation did not match. The old trusted key is retained.');
      localStorage.setItem(path,fresh);
      notice('Trusted fingerprint updated for BC #'+bc+'.');
      });
    }
    if(act==='marv-send'){
      const to=numeric(String(ui.shadow?.getElementById('kc-marv-to')?.value||'').trim());
      const message=String(ui.shadow?.getElementById('kc-marv-body')?.value||'').trim();
      marvelousNotes.draftTo=String(to||'');marvelousNotes.draftBody=message;
      if(!to||to===me()||!message||message.length>2000){marvelousNotes.error='Enter a different BC MemberNumber and a message of 1–2000 characters.';marvelousUpdate();return;}
      return marvelousRun(async()=>{
        marvelousAssertIdentity();const c=await marvelousClient(),k=await marvelousDirectory(to);
        if(!k.accept_notes)throw Error('This member is not accepting Paw Notes.');
        const w=await marvelousEncrypt(message,to,k);
        const ttl=marvelousNotes.ttl==='1d'?86400000:marvelousNotes.ttl==='7d'?604800000:2592000000;
        const when=marvelousNotes.sendAt?Date.parse(marvelousNotes.sendAt):0;
        if(marvelousNotes.sendAt&&(!Number.isFinite(when)||when<=Date.now()+60000))throw Error('Schedule at least 1 minute in the future.');
        if(when){
          if(!MARVELOUS_SCHEDULE_DISPATCHER_READY)throw Error('Scheduled sending is not available right now. You can still send notes immediately.');
          marvelousCheck(await c.from('marvelous_scheduled_notes').insert({id:w.id,sender_uid:marvelousNotes.user.id,recipient_uid:k.auth_user_id,sender_member:me(),recipient_member:to,envelope:w,deliver_after:new Date(when).toISOString(),expires_at:new Date(when+ttl).toISOString()}));
        }else{
          marvelousCheck(await c.from('marvelous_secure_notes').insert({id:w.id,sender_uid:marvelousNotes.user.id,recipient_uid:k.auth_user_id,sender_bc_member:me(),recipient_bc_member:to,envelope:w,expires_at:new Date(Date.now()+ttl).toISOString()}));
        }
        marvelousNotes.draftBody='';marvelousNotes.draftTo='';marvelousNotes.sendAt='';marvelousNotes.view='outbox';await marvelousFetch();
        notice('🔐 Encrypted Paw Note saved for BC #'+to+'.');
      });
    }
    if(act==='marv-read'){
      const id=String(element?.dataset?.noteId||'');if(!/^[0-9a-f-]{36}$/.test(id))return;
      return marvelousRun(async()=>{
        marvelousAssertIdentity();const c=await marvelousClient();
        marvelousCheck(await c.from('marvelous_secure_notes').update({read_at:new Date().toISOString()}).eq('id',id).eq('recipient_uid',marvelousNotes.user.id));
        await marvelousFetch();
      });
    }
    if(act==='marv-block'){
      const bc=numeric(element?.dataset?.bcId);if(!bc)return;
      return marvelousRun(async()=>{
        marvelousAssertIdentity();const c=await marvelousClient(),other=await marvelousDirectory(bc);
        marvelousCheck(await c.from('marvelous_secure_blocks').upsert({blocker_uid:marvelousNotes.user.id,blocked_uid:other.auth_user_id},{onConflict:'blocker_uid,blocked_uid'}));
        notice('Blocked encrypted notes from BC #'+bc+'.');
      });
    }
  }
  // Diagnostic excludes keys, passphrases, plaintext, identities' proof codes and tokens.
  window.MarvelousOfflineUnlockDiag=()=>({version:VERSION,bcMember:me(),reminderDisabled:marvelousPromptDisabled(me()),
    promptShown:!!ui.shadow?.getElementById('kc-offline-unlock-prompt')?.hidden===false,
    mailboxVerified:!!marvelousNotes.claim?.verified_at,keysUnlocked:!!marvelousNotes.privateKeys,
    presenceFresh:pawPresenceIsFresh(),onlineFriendsObserved:pawOnlinePresence.ids.size,
    offlineRetentionDays:MARVELOUS_OFFLINE_NOTE_TTL_MS/86400000});
  window.MarvelousNotesDiag=()=>({addon:VERSION,bcMember:me(),connected:!!marvelousNotes.client,hasSession:!!marvelousNotes.user,claim:!!marvelousNotes.claim,verified:!!marvelousNotes.claim?.verified_at,unlocked:!!marvelousNotes.privateKeys,inboxCount:marvelousNotes.inbox.length,error:marvelousNotes.error});
  window.PawLoungeOfflineDiag=()=>({version:VERSION,bcMember:me(),recipient:numeric(state.selected),
    nativePresenceFresh:Date.now()-pawOnlinePresence.seenAt<130000,
    recipientConfirmedOffline:pawFriendConfirmedOffline(numeric(state.selected)),
    composerMode:state.composerMode,mailboxSignedIn:!!marvelousNotes.user,
    verified:!!marvelousNotes.claim?.verified_at,vaultUnlocked:!!marvelousNotes.privateKeys,
    recentDeliveries:state.deliveryOutbox.filter(x=>x.kind==='chat'&&(x.mode==='offline'||x.transport==='marvelous')).slice(-5).map(x=>({status:x.status,reason:x.reason,transport:x.transport||x.mode}))});

  // Marvelous Hub v1: cloud encryption is strictly opt-in and tied to verified BC ID.
  // NEVER put secret/service role keys here. The account's anonymous Supabase session
  // is NOT independent proof of the BC MemberNumber.
  const marvelousHub={busy:false,error:'',rows:[],notifs:[],devices:[],connections:[],groups:[],members:[],cards:[],shared:[],
    initialized:false,options:{chats:false,memories:false,plushies:false},tab:'cloud',target:'',note:'',signal:'',publicSignal:false,availability:false,guestbook:false,
    selectedNamespace:'settings',status:'',lookupCard:null,lastSynced:'',password:'',notificationCategory:'all',notificationUnreadOnly:false};
  const marvelousHubNamespaces={
    settings:'PawLounge settings',memories:'Room Memories',plushies:'Subby’s Plushies & Essentials (full backup)',
    chats:'Private chat snapshot (explicit consent)',profiles:'Paw profile',favorites:'Favorites & circles',
    achievements:'Achievements',keys:'Encrypted key-vault backup'
  };
  function marvelousHubReady(){marvelousAssertIdentity();if(!marvelousNotes.user)throw Error('Open Paw Notes and verify your BC account first.');}
  function marvelousHubRefresh(){if(state.open&&state.tab==='marvelous')renderMarvelousHub();}
  async function marvelousHubRun(work){if(marvelousHub.busy)return;marvelousHub.busy=true;marvelousHub.error='';marvelousHubRefresh();
    try{await work();}catch(e){marvelousHub.error=String(e?.message||e).slice(0,350);console.warn('[Marvelous Hub]',e);}
    finally{marvelousHub.busy=false;marvelousHubRefresh();}}
  async function marvelousHubOpen(){if(marvelousHub.initialized)return;marvelousHub.initialized=true;
    await marvelousHubRun(async()=>{await marvelousEnsureCrypto();await marvelousFetch();
      if(marvelousNotes.claim?.verified_at)await marvelousHubFetch();});}
  async function marvelousHubFetch(){marvelousHubReady();const c=await marvelousClient(),uid=marvelousNotes.user.id;
    const queries=[
      c.from('marvelous_cloud_records').select('namespace,record_key,updated_at').eq('user_id',uid).order('updated_at',{ascending:false}).limit(60),
      c.from('marvelous_notifications').select('id,category,created_at,read_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(30),
      c.from('marvelous_devices').select('device_id,label,last_seen').eq('user_id',uid),
      c.from('marvelous_connections').select('*').or('requester_uid.eq.'+uid+',requested_uid.eq.'+uid).order('created_at',{ascending:false}).limit(25),
      c.from('marvelous_mail_groups').select('id,title,owner_uid,owner_member').limit(25),
      c.from('marvelous_mail_group_members').select('group_id,user_id,member_number,accepted_at').limit(60),
      c.from('marvelous_shared_envelopes').select('id,sender_uid,recipient_uid,sender_member,recipient_member,item_type,collection_id,envelope,created_at').order('created_at',{ascending:false}).limit(30),
      c.from('marvelous_social_cards').select('*').eq('user_id',uid).maybeSingle(),
      c.from('marvelous_account_options').select('options').eq('user_id',uid).maybeSingle()
    ];
    const results=await Promise.all(queries);results.forEach(marvelousCheck);
    [marvelousHub.rows,marvelousHub.notifs,marvelousHub.devices,marvelousHub.connections,marvelousHub.groups,marvelousHub.members,marvelousHub.shared]=results.slice(0,7).map(x=>x.data||[]);
    const options=results[8].data?.options;if(options&&typeof options==='object')marvelousHub.options={chats:!!options.chats,memories:!!options.memories,plushies:!!options.plushies};
    const card=results[7].data;if(card){marvelousHub.signal=card.signal||'';marvelousHub.publicSignal=!!card.visible;marvelousHub.availability=!!card.available;marvelousHub.guestbook=!!card.allow_guestbook;}
    marvelousHub.lastSynced=new Date().toLocaleTimeString();}
  async function marvelousHubPayload(namespace){
    switch(namespace){
      case 'settings':return {settings:state.settings};
      case 'memories':return {memories:state.roomMemories.map(({id,room,notes,tags,created,favorite})=>({id,room,notes,tags,created,favorite}))};
      case 'profiles':return {profile:state.profiles?.[me()]||{},petPersona:state.settings.petPersona};
      case 'favorites':return {circles:state.circles,roomFavorites:state.roomFavorites};
      case 'chats':return {chats:state.chats,groups:state.groups}; // explicit opt-in only
      case 'plushies':{
        const api=marvelousBridgeConnect();
        if(!api||typeof api.getBackupPayload!=='function')throw Error('Update Subby’s Plushies to v3.5.104 before backing up Plushies & Essentials.');
        const backup=await api.getBackupPayload();
        const preview=api.previewBackupPayload?.(backup);
        if(!preview||preview.memberNumber!==me())throw Error('Plushies backup does not match this BC account.');
        return {format:'SubbysPlushies-Structured-v1',member:me(),backup};
      }
      case 'achievements':return {plushieStats:localStorage.getItem('SubbysPlushies:stats:v1')};
      case 'keys':return {vault:localStorage.getItem(marvelousVaultKey()),fromUid:marvelousNotes.user.id};
      default:throw Error('Unknown cloud record type');
    }
  }
  async function marvelousHubCipher(namespace,recordKey,payload,password){
    if(password.length<12)throw Error('Enter a cloud passphrase of at least 12 characters.');
    const plain=JSON.stringify({v:1,member:me(),namespace,data:payload});
    if(plain.length>950000)throw Error('This backup exceeds the 950 KB local limit. Export a local file from Plushies instead.');
    let bytes=marvelousUtf8(plain),compressed=false;
    if(typeof CompressionStream==='function'&&bytes.length>5000){
      const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
      const zipped=new Uint8Array(await new Response(stream).arrayBuffer());
      if(zipped.length<bytes.length){bytes=zipped;compressed=true;}
    }
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const root=await crypto.subtle.importKey('raw',marvelousUtf8(password),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},root,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    const aad=marvelousUtf8('Marvelous-Cloud-v1:'+me()+':'+namespace+':'+recordKey);
    const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},key,bytes);
    const result={v:'1',salt:marvelousB64(salt),iv:marvelousB64(iv),ct:marvelousB64(ct)};
    if(compressed)result.zip='gzip';
    if(JSON.stringify(result).length>252000)throw Error('Encrypted snapshot is larger than the Supabase 256 KB record limit. Please export a local backup instead.');
    return result;
  }
  async function marvelousHubUncipher(namespace,recordKey,vault,password){
    if(!vault||vault.v!=='1')throw Error('Unrecognized encrypted cloud format.');
    if(password.length<12)throw Error('Enter your original cloud passphrase.');
    const root=await crypto.subtle.importKey('raw',marvelousUtf8(password),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:marvelousUnb64(vault.salt),iterations:310000,hash:'SHA-256'},root,{name:'AES-GCM',length:256},false,['decrypt']);
    const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:marvelousUnb64(vault.iv),additionalData:marvelousUtf8('Marvelous-Cloud-v1:'+me()+':'+namespace+':'+recordKey)},key,marvelousUnb64(vault.ct));
    let decoded=new Uint8Array(bytes);
    if(vault.zip){
      if(vault.zip!=='gzip'||typeof DecompressionStream!=='function')throw Error('This compressed backup needs a browser with gzip support.');
      decoded=new Uint8Array(await new Response(new Blob([decoded]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    }
    if(decoded.length>1050000)throw Error('Decompressed backup exceeds the 1 MB safety limit.');
    const result=JSON.parse(marvelousTextDecoder.decode(decoded));
    if(result.member!==me()||result.namespace!==namespace)throw Error('This encrypted backup belongs to a different account or category.');
    return result.data;
  }
  async function marvelousHubCloudSave(namespace,password,recordKey='current'){marvelousHubReady();
    if(!/^(current|snapshot-[0-9]{13})$/.test(recordKey))throw Error('Invalid cloud restore point.');
    if(['chats','memories','plushies'].includes(namespace)&&!marvelousHub.options[namespace])throw Error('Enable this data category under Security > Plugin permissions first.');
    if(namespace==='chats'&&!window.confirm('Upload a passphrase-encrypted snapshot of your PRIVATE conversation cache? This is optional and does not include all archived history.'))return;
    const c=await marvelousClient(),encrypted_payload=await marvelousHubCipher(namespace,recordKey,(await marvelousHubPayload(namespace)),password);
    marvelousCheck(await c.from('marvelous_cloud_records').upsert({user_id:marvelousNotes.user.id,member_number:me(),namespace,record_key:recordKey,encrypted_payload,updated_at:new Date().toISOString()},{onConflict:'user_id,namespace,record_key'}));
    marvelousHub.status='Encrypted '+namespace+(recordKey==='current'?' backup updated.':' restore point saved.')+' Plushies & Essentials use native export when available; screenshots/IndexedDB archives are not included.';
    await marvelousHubFetch();
  }
  async function marvelousHubCloudRestore(namespace,password,recordKey='current',apply=false){marvelousHubReady();
    if(!/^(current|snapshot-[0-9]{13})$/.test(recordKey))throw Error('Invalid cloud restore point.');
    const c=await marvelousClient(),uid=marvelousNotes.user.id;
    const row=marvelousCheck(await c.from('marvelous_cloud_records').select('encrypted_payload').eq('user_id',uid).eq('namespace',namespace).eq('record_key',recordKey).single());
    const data=await marvelousHubUncipher(namespace,recordKey,row.encrypted_payload,password);
    if(apply){
      if(namespace!=='plushies')throw Error('In-place restore is supported only for Plushies & Essentials.');
      const api=marvelousBridgeConnect();
      if(!api||typeof api.restoreBackupPayload!=='function')throw Error('Update Plushies to v3.5.104 to restore from cloud.');
      if(data?.format!=='SubbysPlushies-Structured-v1'||data.member!==me())throw Error('Not a matching structured Plushies backup.');
      const preview=api.previewBackupPayload(data.backup);
      if(preview.memberNumber!==me())throw Error('This snapshot belongs to a different BC account.');
      const restored=await api.restoreBackupPayload(data.backup);
      marvelousHub.status=restored.cancelled?'Restore cancelled.':'Plushies & Essentials restored. Progress integrity check: '+(restored.progressVerified?'valid':'invalid (progress not replaced)')+'.';
      return;
    }
    // Restore is SAFE by default: download data, do not silently overwrite running game/plugin state.
    download('Marvelous-'+namespace+'-'+recordKey+'-BC-'+me()+'-RESTORE.json','application/json',JSON.stringify({format:'MarvelousSnapshot-v1',member:me(),namespace,data},null,2));
    marvelousHub.status='Decrypted restore exported. No live plugin data was overwritten.';
  }
  async function marvelousHubSavePermissions(){marvelousHubReady();const c=await marvelousClient();
    const uid=marvelousNotes.user.id,member=me();
    marvelousCheck(await c.from('marvelous_account_options').upsert({user_id:uid,member_number:member,options:marvelousHub.options,updated_at:new Date().toISOString()},{onConflict:'user_id'}));
    marvelousHub.status='Plugin cloud permissions saved. Each upload still requires an explicit click and passphrase.';await marvelousHubFetch();}
  async function marvelousHubCardSave(){marvelousHubReady();const c=await marvelousClient();
    const signal=marvelousHub.signal.slice(0,120),visible=!!marvelousHub.publicSignal;
    const existing=marvelousCheck(await c.from('marvelous_social_cards').select('user_id').eq('user_id',marvelousNotes.user.id).maybeSingle());
    const change={signal,available:visible&&!!marvelousHub.availability,visible,allow_guestbook:visible&&!!marvelousHub.guestbook,updated_at:new Date().toISOString()};
    if(existing)marvelousCheck(await c.from('marvelous_social_cards').update(change).eq('user_id',marvelousNotes.user.id));
    else marvelousCheck(await c.from('marvelous_social_cards').insert({user_id:marvelousNotes.user.id,member_number:me(),...change}));
    marvelousHub.status=visible?'Opt-in public status published. Anyone signed into Marvelous can query it.':'Public status hidden.';
    await marvelousHubFetch();
  }
  async function marvelousHubConnect(member){marvelousHubReady();const contact=await marvelousDirectory(member),c=await marvelousClient();
    marvelousCheck(await c.from('marvelous_connections').insert({requester_uid:marvelousNotes.user.id,requested_uid:contact.auth_user_id,requester_member:me(),requested_member:member}));
    marvelousHub.status='Private connection invitation sent to BC #'+member+'.';await marvelousHubFetch();
  }
  async function marvelousHubShare(member,kind,message,groupId=null){marvelousHubReady();if(!marvelousNotes.privateKeys)throw Error('Unlock your encryption keys in Paw Notes first.');
    if(!message||message.length>2000)throw Error('Enter a message of 1–2000 characters.');
    const recipient=await marvelousDirectory(member),c=await marvelousClient();
    const envelope=await marvelousEncrypt(message,member,recipient);
    marvelousCheck(await c.from('marvelous_shared_envelopes').insert({id:envelope.id,sender_uid:marvelousNotes.user.id,recipient_uid:recipient.auth_user_id,
      sender_member:me(),recipient_member:member,item_type:kind,collection_id:groupId,envelope}));
    marvelousHub.status='Encrypted '+kind+' entry sent to BC #'+member+'.';await marvelousHubFetch();
  }
  async function marvelousHubCreateGroup(title){marvelousHubReady();if(!title||title.length>80)throw Error('Give your group a name of up to 80 characters.');
    const c=await marvelousClient();marvelousCheck(await c.from('marvelous_mail_groups').insert({owner_uid:marvelousNotes.user.id,owner_member:me(),title}));
    marvelousHub.status='Private group mailbox created.';await marvelousHubFetch();}
  async function marvelousHubInviteGroup(id,member){marvelousHubReady();const recipient=await marvelousDirectory(member),c=await marvelousClient();
    marvelousCheck(await c.from('marvelous_mail_group_members').insert({group_id:id,user_id:recipient.auth_user_id,member_number:member,invited_by:marvelousNotes.user.id}));
    marvelousHub.status='Group invite sent to BC #'+member;await marvelousHubFetch();}
  async function marvelousHubSendGroup(id,body){marvelousHubReady();const c=await marvelousClient(),uid=marvelousNotes.user.id;
    const group=marvelousHub.groups.find(g=>g.id===id);if(!group)throw Error('Group was not found.');
    const peers=marvelousHub.members.filter(m=>m.group_id===id&&m.accepted_at&&m.user_id!==uid);
    if(group.owner_uid!==uid){if(!marvelousHub.members.some(m=>m.group_id===id&&m.user_id===uid&&m.accepted_at))throw Error('You have not accepted the group invitation.');
      peers.push({user_id:group.owner_uid,member_number:Number(group.owner_member)});}
    if(peers.length>12)throw Error('Group mailbox limit: 12 accepted recipients.');
    if(!peers.length)throw Error('Invite another verified member and wait for acceptance.');
    for(const peer of peers)await marvelousHubShare(Number(peer.member_number),'group',body,id);
    marvelousHub.status='Group message encrypted independently for '+peers.length+' recipients.';await marvelousHubFetch();}
  async function marvelousHubInboxRead(item){
    const plain=await marvelousDecrypt({id:item.id,sender_uid:item.sender_uid,recipient_uid:item.recipient_uid,
      sender_bc_member:item.sender_member,recipient_bc_member:item.recipient_member,envelope:item.envelope},item.recipient_uid===marvelousNotes.user.id);
    window.alert('Marvelous '+item.item_type+' from BC #'+item.sender_member+'\n\n'+plain);
  }
  const marvelousHubShortDate=x=>escapeText(marvelousSafeDate(x));
  function marvelousHubVisibleNotifications(){
    return marvelousHub.notifs.filter(n=>(marvelousHub.notificationCategory==='all'||n.category===marvelousHub.notificationCategory)&&(!marvelousHub.notificationUnreadOnly||!n.read_at));
  }
  function renderMarvelousHub(){if(!ui.body)return;
    const h=marvelousHub,verified=!!marvelousNotes.user&&!!marvelousNotes.claim?.verified_at&&marvelousNotes.owner===me();
    const opts=Object.entries(marvelousHubNamespaces).map(([k,n])=>`<option value="${k}" ${h.selectedNamespace===k?'selected':''}>${escapeText(n)}</option>`).join('');
    const desc='<p class="muted">Cloud sharing is optional. You choose what to save, and private backups are encrypted with your passphrase before uploading. Keep that passphrase somewhere safe.</p>';
    const nav=`<div class="flex">${[['cloud','☁️ Cloud'],['social','💗 Social'],['shared','📚 Shared'],['security','🔐 Security']].map(([v,n])=>`<button class="${h.tab===v?'primary':'secondary'}" data-action="marvhub-tab" data-value="${v}">${n}</button>`).join('')}</div>`;
    let inner='';
    if(!verified)inner=`<p class="kc-marv-error">Verify your BC account in Paw Notes to unlock cloud features. Everything saved on this browser remains available.</p><button class="secondary" data-tab="notes">Open Paw Notes</button>
      <div class="marv-feature-card"><b>🧸 Local plushie milestones</b>${marvelousBridge.events.length?marvelousBridge.events.slice(0,12).map(e=>`<p>${escapeText(e.message)} · ${marvelousHubShortDate(e.at)}</p>`).join(''):'<p class="muted">No milestones this session.</p>'}</div>`;
    else if(h.tab==='cloud')inner=`<div class="marv-feature-card"><b>Encrypted cloud snapshots</b>
      <label>Choose category<select class="field" id="marvhub-ns">${opts}</select></label>
      <label>Cloud encryption passphrase (12+ characters)<input type="password" class="field" id="marvhub-pass" autocomplete="off" placeholder="Never stored on the server"></label>
      <div class="flex"><button class="primary" data-action="marvhub-backup">Update latest backup</button><button class="secondary" data-action="marvhub-restore">Export latest</button><button class="secondary" data-action="marvhub-create-point">Create restore point</button></div>
      <p class="muted">Each restore point is encrypted separately. Your passphrase is needed to export it, and restoring your data always requires your confirmation. Photos and older full chat archives are not included.</p></div>
      <div class="marv-feature-card"><b>Encrypted restore history (showing up to 60)</b>
      ${h.rows.length?h.rows.map(r=>`<div class="flex"><span>${escapeText(r.namespace)} · ${escapeText(r.record_key==='current'?'Latest':r.record_key)} · ${marvelousHubShortDate(r.updated_at)}</span><button class="secondary" data-action="marvhub-restore-point" data-ns="${escapeText(r.namespace)}" data-key="${escapeText(r.record_key)}">Export</button>${r.namespace==='plushies'?`<button class="secondary" data-action="marvhub-apply-point" data-ns="${escapeText(r.namespace)}" data-key="${escapeText(r.record_key)}">Restore Plushies</button>`:''}${r.record_key!=='current'?`<button class="secondary" data-action="marvhub-delete-point" data-ns="${escapeText(r.namespace)}" data-key="${escapeText(r.record_key)}">Delete</button>`:''}</div>`).join(''):'<p class="muted">No encrypted backups yet.</p>'}</div>`;
    else if(h.tab==='social')inner=`<div class="marv-feature-card"><b>Opt-in public Paw Signal & availability</b>
      <p class="muted">Public means any logged-in Marvelous user can query the status. For private friend-only statuses, continue using PawLounge’s native Paw Signals.</p>
      <label>Signal<input class="field" id="marvhub-signal" maxlength="120" value="${escapeText(h.signal)}"></label>
      <label><input type="checkbox" id="marvhub-public" ${h.publicSignal?'checked':''}> Publish this card</label>
      <label><input type="checkbox" id="marvhub-available" ${h.availability?'checked':''}> Available for company</label>
      <label><input type="checkbox" id="marvhub-guestbook" ${h.guestbook?'checked':''}> Accept encrypted guestbook entries</label>
      <button class="primary" data-action="marvhub-card">Save public profile choices</button></div>
      <div class="marv-feature-card"><b>Verified friend connection</b><p>Connections must be accepted by both people before sharing a scrapbook or plushie bond.</p>
      <label>BC MemberNumber<input id="marvhub-to" class="field" type="number" min="1" value="${escapeText(h.target)}" placeholder="Member #"></label>
      <div class="flex"><button class="secondary" data-action="marvhub-lookup">Look up opt-in status</button><button class="secondary" data-action="marvhub-invite">Invite member</button></div>
      ${h.lookupCard?`<p class="muted">BC #${h.lookupCard.member_number}: ${escapeText(h.lookupCard.signal||'No signal')} · ${h.lookupCard.available?'Available':'Not available'} ${h.lookupCard.signal_expires_at&&Date.parse(h.lookupCard.signal_expires_at)<Date.now()?'(expired)':''}</p>`:''}
      ${h.connections.map(p=>`<div class="flex"><span>BC #${p.requester_uid===marvelousNotes.user.id?p.requested_member:p.requester_member} · ${p.accepted_at?'Connected':'Pending'}</span>${!p.accepted_at&&p.requested_uid===marvelousNotes.user.id?`<button data-action="marvhub-accept" data-value="${escapeText(p.id)}">Accept</button>`:''}</div>`).join('')}</div>`;
    else if(h.tab==='shared')inner=`<div class="marv-feature-card"><b>Encrypted guestbook, scrapbook & plushie bond</b>
      <p class="muted">Guestbooks require the recipient to opt in. Scrapbooks and plushie bonds require a mutual connection. All entries are signed and encrypted for the recipient.</p>
      <label>Recipient BC #<input class="field" id="marvhub-to" type="number" min="1" value="${escapeText(h.target)}"></label>
      <label>Entry<textarea class="field" rows="3" maxlength="2000" id="marvhub-text">${escapeText(h.note)}</textarea></label>
      <div class="flex"><button class="secondary" data-action="marvhub-send" data-value="guestbook">Guestbook</button><button class="secondary" data-action="marvhub-send" data-value="scrapbook">Scrapbook</button><button class="secondary" data-action="marvhub-send" data-value="plushie_bond">Plushie friendship</button></div>
      <p class="muted">Messages may be visible as ciphertext to the writer and recipient. No auto-recording of room conversations.</p></div>
      <div class="marv-feature-card"><b>Private encrypted group mailboxes</b><p class="muted">Each recipient gets a separately encrypted copy. Recipients must accept an invitation.</p>
      <button class="secondary" data-action="marvhub-group-create">Create group</button>
      ${h.groups.map(g=>`<div class="marv-feature-card"><b>${escapeText(g.title)}</b> · ${escapeText(g.id.slice(0,8))}
      ${g.owner_uid===marvelousNotes.user.id?`<button class="secondary" data-action="marvhub-group-invite" data-value="${escapeText(g.id)}">Invite member</button>`:''}
      ${h.members.some(m=>m.group_id===g.id&&m.user_id===marvelousNotes.user.id&&!m.accepted_at)?`<button class="secondary" data-action="marvhub-group-accept" data-value="${escapeText(g.id)}">Accept invitation</button>`:''}
      <button class="secondary" data-action="marvhub-group-send" data-value="${escapeText(g.id)}">Send group message</button></div>`).join('')}</div>
      <div class="marv-feature-card"><b>Shared entries (${h.shared.length})</b>
      ${h.shared.map(x=>`<div class="flex"><span>${escapeText(x.item_type)} · BC #${x.sender_uid===marvelousNotes.user.id?x.recipient_member:x.sender_member} · ${marvelousHubShortDate(x.created_at)}</span><button data-action="marvhub-open" data-value="${escapeText(x.id)}">Read</button></div>`).join('')||'<p class="muted">Nothing shared yet.</p>'}</div>`;
    else inner=`<div class="marv-feature-card"><b>Device & session security</b><p class="muted">This list shows browsers you have registered. Removing one from the list does not sign it out; use Sign out on that browser when possible.</p>
      <button class="secondary" data-action="marvhub-device">Register this browser</button><button class="secondary" data-action="marvhub-signout">Sign out this Marvelous session</button>
      ${h.devices.map(d=>`<p>${escapeText(d.label)} · ${marvelousHubShortDate(d.last_seen)}</p>`).join('')}</div>
      <div class="marv-feature-card"><b>Unified notifications (${h.notifs.filter(n=>!n.read_at).length} unread in loaded history)</b>
      <p class="muted">Showing the latest 30 notifications. Filters are private to this browser and do not change delivery.</p>
      <label>Category<select class="field" id="marvhub-notification-category">${['all','note','invitation','guestbook','scrapbook','plushie','group'].map(c=>`<option value="${c}" ${h.notificationCategory===c?'selected':''}>${c==='all'?'All categories':c}</option>`).join('')}</select></label>
      <label><input type="checkbox" id="marvhub-notification-unread" ${h.notificationUnreadOnly?'checked':''}> Unread only</label>
      <button class="secondary" data-action="marvhub-read-visible">Mark displayed unread notifications as read</button>
      ${marvelousHubVisibleNotifications().map(n=>`<div class="flex"><span>${escapeText(n.category)} · ${marvelousHubShortDate(n.created_at)} ${n.read_at?'✓':''}</span>${!n.read_at?`<button data-action="marvhub-read" data-value="${escapeText(n.id)}">Read</button>`:''}</div>`).join('')||'<p class="muted">No notifications match these filters.</p>'}</div>
      <div class="marv-feature-card"><b>🧸 Local plushie milestones</b><p class="muted">Plushie milestones appear here while PawLounge is open. They stay on this device.</p>
        ${marvelousBridge.events.length?marvelousBridge.events.slice(0,12).map(e=>`<p>${escapeText(e.message)} · ${marvelousHubShortDate(e.at)}</p>`).join(''):'<p class="muted">No plushie milestones this session.</p>'}</div>
      <div class="marv-feature-card"><b>Cloud permissions — all off by default</b><p class="muted">Enable categories before uploading. No continuous background history collection.</p>
      ${[['memories','Room Memories'],['plushies','Plushie stats'],['chats','Native chat snapshot']].map(([k,v])=>`<label><input type="checkbox" data-marvhub-perm="${k}" ${h.options[k]?'checked':''}> Allow encrypted ${v} backups</label>`).join('')}
      <button class="secondary" data-action="marvhub-save-perms">Save permissions</button></div>
      <div class="marv-feature-card"><b>Your data & privacy</b><p class="muted">You can export your encrypted cloud records or remove your saved cloud snapshots here. Full account deletion and lost-key recovery are not available yet.</p>
      <button class="secondary" data-action="marvhub-export">Export cloud data</button><button class="secondary" data-action="marvhub-clear">Clear my cloud snapshots</button></div>`;
    ui.body.innerHTML=`<div class="marv-feature-page"><h2>☁️ Marvelous Hub</h2>${desc}${nav}${h.busy?'<p class="muted">Syncing…</p>':''}${h.error?`<p class="kc-marv-error">${escapeText(h.error)}</p>`:''}${h.status?`<p class="muted">${escapeText(h.status)}</p>`:''}<div class="flex"><button class="secondary" data-action="marvhub-refresh">Refresh</button><span class="muted">${escapeText(h.lastSynced)}</span></div>${inner}</div>`;
  }
  function marvelousHubAction(act,element){
    if(act==='marvhub-tab'){marvelousHub.tab=element.dataset.value;renderMarvelousHub();return;}
    const ns=marvelousHub.selectedNamespace,to=Number(marvelousHub.target),password=ui.shadow?.getElementById('marvhub-pass')?.value||'';
    const uid=marvelousNotes.user?.id;
    void marvelousHubRun(async()=>{
      if(act==='marvhub-refresh'){await marvelousFetch();await marvelousHubFetch();}
      else if(act==='marvhub-backup')await marvelousHubCloudSave(ns,password);
      else if(act==='marvhub-create-point')await marvelousHubCloudSave(ns,password,'snapshot-'+Date.now());
      else if(act==='marvhub-apply-point'){
        const row=marvelousHub.rows.find(r=>r.namespace==='plushies'&&r.record_key===element.dataset.key);
        if(!row)throw Error('No Plushies restore point found.');
        await marvelousHubCloudRestore('plushies',password,row.record_key,true);
      }
      else if(act==='marvhub-restore-point'){
        const row=marvelousHub.rows.find(r=>r.namespace===element.dataset.ns&&r.record_key===element.dataset.key);
        if(!row)throw Error('Unknown restore point. Refresh your cloud list.');
        await marvelousHubCloudRestore(row.namespace,password,row.record_key);
      }
      else if(act==='marvhub-delete-point'){
        const row=marvelousHub.rows.find(r=>r.namespace===element.dataset.ns&&r.record_key===element.dataset.key);
        if(!row||row.record_key==='current'||!/^snapshot-[0-9]{13}$/.test(row.record_key))throw Error('Only optional restore points may be deleted here.');
        if(!window.confirm('Permanently delete this encrypted restore point? Other backups will remain.'))return;
        marvelousHubReady();const c=await marvelousClient();
        marvelousCheck(await c.from('marvelous_cloud_records').delete().eq('user_id',uid).eq('namespace',row.namespace).eq('record_key',row.record_key));
        marvelousHub.status='Restore point deleted.';await marvelousHubFetch();
      }
      else if(act==='marvhub-restore')await marvelousHubCloudRestore(ns,password);
      else if(act==='marvhub-card')await marvelousHubCardSave();
      else if(act==='marvhub-save-perms')await marvelousHubSavePermissions();
      else if(act==='marvhub-lookup'){
        marvelousHubReady();if(!to)throw Error('Enter a BC MemberNumber.');
        const c=await marvelousClient();marvelousHub.lookupCard=marvelousCheck(await c.from('marvelous_social_cards').select('member_number,signal,available,signal_expires_at').eq('member_number',to).eq('visible',true).maybeSingle());
        if(!marvelousHub.lookupCard)marvelousHub.status='No public status shared by that BC member.';
      }
      else if(act==='marvhub-invite'){if(!to||to===me())throw Error('Enter a different valid BC MemberNumber.');await marvelousHubConnect(to);}
      else if(act==='marvhub-accept'){
        marvelousHubReady();const c=await marvelousClient();marvelousCheck(await c.from('marvelous_connections').update({accepted_at:new Date().toISOString()}).eq('id',element.dataset.value).eq('requested_uid',uid));await marvelousHubFetch();
      }
      else if(act==='marvhub-send'){
        if(!to||to===me())throw Error('Enter the recipient’s BC MemberNumber.');
        await marvelousHubShare(to,element.dataset.value,marvelousHub.note);marvelousHub.note='';
      }
      else if(act==='marvhub-open'){
        marvelousHubReady();const item=marvelousHub.shared.find(x=>x.id===element.dataset.value);if(item)await marvelousHubInboxRead(item);
      }
      else if(act==='marvhub-group-create'){
        const title=window.prompt('Group mailbox name (1–80 characters):','Paw friends');if(title!==null)await marvelousHubCreateGroup(title.trim());
      }
      else if(act==='marvhub-group-invite'){
        const member=Number(window.prompt('Invite which BC MemberNumber?',''));
        if(Number.isSafeInteger(member)&&member>0&&member!==me())await marvelousHubInviteGroup(element.dataset.value,member);
      }
      else if(act==='marvhub-group-accept'){
        marvelousHubReady();const c=await marvelousClient();
        marvelousCheck(await c.from('marvelous_mail_group_members').update({accepted_at:new Date().toISOString()}).eq('group_id',element.dataset.value).eq('user_id',uid));await marvelousHubFetch();
      }
      else if(act==='marvhub-group-send'){
        const body=window.prompt('Encrypted group message (max 2,000 characters):','');
        if(body!==null&&body.trim())await marvelousHubSendGroup(element.dataset.value,body.slice(0,2000));
      }
      else if(act==='marvhub-device'){
        marvelousHubReady();const c=await marvelousClient(),key='MarvelousDevice:'+me()+':'+uid;
        let device_id=localStorage.getItem(key);if(!device_id){device_id=crypto.randomUUID();localStorage.setItem(key,device_id);}
        const label=(navigator.userAgentData?.platform||navigator.platform||'Browser').slice(0,64);
        if(marvelousHub.devices.some(d=>d.device_id===device_id))marvelousCheck(await c.from('marvelous_devices').update({label,last_seen:new Date().toISOString()}).eq('user_id',uid).eq('device_id',device_id));
        else marvelousCheck(await c.from('marvelous_devices').insert({user_id:uid,member_number:me(),device_id,label}));
        await marvelousHubFetch();
      }
      else if(act==='marvhub-signout'){
        if(!window.confirm('Sign out of Marvelous on this browser? A BC verification challenge may be required to regain access.'))return;
        const c=await marvelousClient();marvelousCheck(await c.auth.signOut({scope:'local'}));marvelousNotesReset();marvelousHub.initialized=false;marvelousHub.status='Signed out of this device. Your encryption vault remains local.';
      }
      else if(act==='marvhub-read-visible'){
        marvelousHubReady();const ids=marvelousHubVisibleNotifications().filter(n=>!n.read_at).map(n=>n.id).slice(0,30);
        if(!ids.length){marvelousHub.status='No displayed unread notifications.';return;}
        const c=await marvelousClient();marvelousCheck(await c.from('marvelous_notifications').update({read_at:new Date().toISOString()}).eq('user_id',uid).in('id',ids).is('read_at',null));
        marvelousHub.status='Marked '+ids.length+' loaded notification(s) as read.';await marvelousHubFetch();
      }
      else if(act==='marvhub-read'){
        marvelousHubReady();const c=await marvelousClient();marvelousCheck(await c.from('marvelous_notifications').update({read_at:new Date().toISOString()}).eq('id',element.dataset.value).eq('user_id',uid));await marvelousHubFetch();
      }
      else if(act==='marvhub-export'){
        marvelousHubReady();const c=await marvelousClient();
        const [cloud,options,devices,notifs,shared]=await Promise.all([
          c.from('marvelous_cloud_records').select('*').eq('user_id',uid),c.from('marvelous_account_options').select('*').eq('user_id',uid),
          c.from('marvelous_devices').select('*').eq('user_id',uid),c.from('marvelous_notifications').select('*').eq('user_id',uid),
          c.from('marvelous_shared_envelopes').select('*').or('sender_uid.eq.'+uid+',recipient_uid.eq.'+uid)]);
        [cloud,options,devices,notifs,shared].forEach(marvelousCheck);
        download('Marvelous-Cloud-BC-'+me()+'-export.json','application/json',JSON.stringify({format:'MarvelousCloudExport-v1',member:me(),cloud:cloud.data,options:options.data,devices:devices.data,notifications:notifs.data,shared:shared.data},null,2));
      }
      else if(act==='marvhub-clear'){
        if(!window.confirm('Delete ONLY your encrypted cloud snapshots? This will NOT delete Paw Notes, Supabase Auth identity, other players’ copies, or local files.'))return;
        marvelousHubReady();const c=await marvelousClient();marvelousCheck(await c.from('marvelous_cloud_records').delete().eq('user_id',uid));await marvelousHubFetch();
      }
    });
  }
  window.MarvelousHubDiag=()=>({version:VERSION,owner:me(),verified:!!marvelousNotes.claim?.verified_at,restorePoints:marvelousHub.rows.filter(r=>r.record_key!=='current').length,loaded:marvelousHub.initialized,
    cloudRecords:marvelousHub.rows.length,notifications:marvelousHub.notifs.length,error:marvelousHub.error});

  function render() {
    if (!ui.body) return;
    if (state.tab === 'friends') state.tab = 'chats'; // Migrate old Pals tab state.
    if (state.tab === 'memories') state.tab = 'moments'; // Legacy room-memory route now opens the unified hub.
    setTheme();marvelousUpdateUnreadIndicator();
    ui.shadow.querySelectorAll('.railtab').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
    ui.menu.style.display = state.tab === 'chats' || state.tab === 'groups' ? 'flex' : 'none';
    ui.menu.classList.toggle('compact-open',!!state.compactOpen && (state.tab==='chats'||state.tab==='groups'));
    ui.shadow.querySelector('.workspace')?.classList.toggle('wide', state.tab === 'rooms' || state.tab === 'settings' || state.tab === 'stickers' || state.tab==='moments' || state.tab==='pawbooks' || state.tab==='catchup' || state.tab==='circles' || state.tab==='notes' || state.tab==='marvelous' || state.tab==='memories' || state.tab==='personality' || state.tab==='focus');
    if (state.tab === 'chats' || state.tab === 'groups') {
      if (state.tab==='chats') {
        ensureDefaultSelection();
        if(state.open&&state.selected)void prepareHistoryView('chat',state.selected);
      } else {
        if(!state.groups[state.selectedGroup]?.joined) {
          const first=Object.values(state.groups).filter(g=>g.joined).sort((a,b)=>b.updated-a.updated)[0];
          state.selectedGroup=first?.id||'';
        }
        if(state.open&&state.selectedGroup) {
          if(state.groups[state.selectedGroup].unread){state.groups[state.selectedGroup].unread=0;saveSoon();updateBadge();}
          void prepareHistoryView('group',state.selectedGroup);
        }
      }
      renderSidebar();renderChat();
      if (isCompactCollapseLayout() && state.compactOpen) {
        ui.menu.insertAdjacentHTML('beforeend', '<button type="button" class="kc-compact-close" data-action="toggleleftpanel" title="Collapse contacts sidebar" aria-label="Collapse contacts sidebar">‹</button>');
      }
    }
    else if (state.tab === 'rooms') renderRooms();
    else if (state.tab === 'stickers') renderStickersLibrary();
    else if (state.tab === 'moments') renderMoments();
    else if (state.tab === 'pawbooks') renderPawBooks();
    else if (state.tab === 'catchup') renderCatchUp();
    else if (state.tab === 'notes') {renderMarvelousNotes();marvelousEnterTab();}
    else if (state.tab === 'marvelous') {renderMarvelousHub();void marvelousHubOpen();}
    else if (state.tab === 'personality') renderPetPersonality();
    else if (state.tab === 'focus') renderFocusMode();
    else if (state.tab === 'circles') renderCircles();
    else renderSettings();
    ui.panel?.classList.toggle('left-collapsed', !!state.leftCollapsed);
    ui.panel?.classList.toggle('right-collapsed', !!state.rightCollapsed);
    ui.panel?.classList.toggle('right-drawer-open', !!state.rightDrawerOpen);
    renderGroupModal();
    renderProfileModal();
    schedulePortraits();
  }
  function contactItems() {
    const friends=new Set(myFriends());
    const roomIds=new Set(currentRoomRoster().map(character=>numeric(character.MemberNumber)));
    const inRoomOnly=state.contactsMode==='inroom';
    const onlineOnly=state.contactsMode==='online';
    // Online means actual BC friends confirmed online by native presence,
    // not every player in the current room or stale profile statuses.
    const ids = inRoomOnly ? roomIds : onlineOnly ? friends : new Set([...Object.keys(state.chats).map(numeric), ...friends, ...roomIds]);
    ids.delete(me());
    const query=state.search.toLowerCase();
    return [...ids].filter(numeric)
      .filter(id => !onlineOnly || (friends.has(id) && pawFriendConfirmedOnline(id)))
      // In Room is a separate live roster, not a subset of a friend circle.
      .filter(id => inRoomOnly || !state.circleFilter || (state.circleFilter === '__paw_bc_friends__'
        ? friends.has(id)
        : !!state.circles.find(c => c.id === state.circleFilter && c.members.includes(id))))
      .filter(id => !query || (`${name(id)} ${id}`).toLowerCase().includes(query))
      .filter(id => state.contactsMode !== 'unread' || Number(state.chats[id]?.unread || 0) > 0)
      .filter(id => state.contactsMode !== 'pinned' || !!state.chats[id]?.pinned)
      .filter(id => state.contactsMode !== 'favorites' || !!state.chats[id]?.favorite)
      .filter(id => state.contactsMode !== 'later' || !!state.chats[id]?.replyLater)
      .filter(id => state.contactsMode !== 'muted' || !!state.chats[id]?.muted || state.chats[id]?.snoozeUntil>Date.now())
      .filter(id => state.contactsMode==='requests' ? !!state.chats[id]?.requestPending :
        inRoomOnly || state.contactsMode==='all' || !state.chats[id]?.requestPending)
      .sort((a,b) => Number(!!state.chats[b]?.pinned) - Number(!!state.chats[a]?.pinned) ||
        Number(!!state.chats[b]?.favorite) - Number(!!state.chats[a]?.favorite) ||
        (state.chats[b]?.updated || 0) - (state.chats[a]?.updated || 0) || name(a).localeCompare(name(b)));
  }
  function ensureDefaultSelection() {
    if (state.tab !== 'chats' && state.tab !== 'friends') return;
    const items = contactItems();
    if (state.selected && state.chats[state.selected]) return;
    if (items.length) {
      state.selected = items[0];
      if (!state.chats[state.selected]) ensure(state.selected);
      state.chats[state.selected].unread = 0;
    } else if (state.selected && !state.chats[state.selected]) {
      state.selected = 0;
    }
  }

  // Keep each side panel at its own position when a message updates the UI.
  function captureSideScroll(e) {
    const element = e.target;
    if (element?.classList?.contains('contacts-scroll')) state.panelScroll.left = element.scrollTop;
    else if (element?.classList?.contains('companion')) state.panelScroll.right = element.scrollTop;
  }
  function restoreSideScroll(which) {
    const element = which === 'left' ? ui.menu?.querySelector('.contacts-scroll') : ui.body?.querySelector('.companion');
    if (!element) return;
    element.scrollTop = Math.max(0, Number(state.panelScroll[which]) || 0);
  }
  // The left sidebar's header/search are fixed. Wheel there scrolls the name list too.
  function forwardSidebarWheel(e) {
    if (e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const target = e.target;
    if (!target?.closest?.('.sidebar') || target.closest('.contacts-scroll')) return;
    const scrollable = ui.menu?.querySelector('.contacts-scroll');
    if (!scrollable || scrollable.scrollHeight <= scrollable.clientHeight) return;
    e.preventDefault();
    scrollable.scrollTop += e.deltaY;
  }

  // v0.7.39: an independent horizontal scrollbar sits BELOW inbox buttons,
  // never on top of a click target (including Firefox overlay-scrollbar mode).
  let inboxFilterScroll = 0;
  function syncInboxFilterBar() {
    const viewport = ui.menu?.querySelector('.kc-inbox-filters');
    const controls = ui.menu?.querySelector('.kc-filter-scroll-controls');
    const track = controls?.querySelector('.kc-filter-scroll-track');
    const thumb = controls?.querySelector('.kc-filter-scroll-thumb');
    if (!viewport || !controls || !track || !thumb) return;
    const scrollMax = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const trackSize = track.clientWidth;
    if (!trackSize) return; // Sidebar not laid out yet; resize observer will update.
    const thumbSize = scrollMax ? Math.min(trackSize, Math.max(36, trackSize * viewport.clientWidth / viewport.scrollWidth)) : trackSize;
    const travel = Math.max(0, trackSize - thumbSize);
    const ratio = scrollMax ? Math.min(1,Math.max(0,viewport.scrollLeft / scrollMax)) : 0;
    thumb.style.width = `${thumbSize}px`;
    thumb.style.transform = `translateX(${travel * ratio}px)`;
    track.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    controls.classList.toggle('kc-no-filter-overflow', scrollMax < 2);
    const back = controls.querySelector('[data-action="inboxscrollleft"]');
    const ahead = controls.querySelector('[data-action="inboxscrollright"]');
    if (back) back.disabled = scrollMax < 2 || viewport.scrollLeft < 2;
    if (ahead) ahead.disabled = scrollMax < 2 || viewport.scrollLeft >= scrollMax - 2;
    inboxFilterScroll = viewport.scrollLeft;
  }
  function scrollInboxFilters(direction) {
    const viewport = ui.menu?.querySelector('.kc-inbox-filters');
    if (!viewport) return;
    viewport.scrollBy({ left: direction * Math.max(96, viewport.clientWidth * .68), behavior: 'smooth' });
  }
  function onInboxFilterScroll(e) {
    if (e.target?.classList?.contains('kc-inbox-filters')) syncInboxFilterBar();
  }
  function dragInboxFilterBar(e) {
    if (e.button !== 0) return;
    const track = e.target?.closest?.('.kc-filter-scroll-track');
    if (!track) return;
    const viewport = ui.menu?.querySelector('.kc-inbox-filters');
    const thumb = track.querySelector('.kc-filter-scroll-thumb');
    if (!viewport || !thumb) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    if (max <= 0) return;
    const thumbWidth = thumb.getBoundingClientRect().width;
    // Drag the thumb without jumping; clicking the track centers the thumb.
    const startedOnThumb = e.target === thumb;
    const offset = startedOnThumb ? e.clientX - thumb.getBoundingClientRect().left : thumbWidth / 2;
    function move(ev) {
      if (ev.pointerId !== e.pointerId) return;
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, rect.width - thumbWidth);
      const fraction = Math.max(0, Math.min(1, (ev.clientX - rect.left - offset) / travel));
      viewport.scrollLeft = fraction * max;
      inboxFilterScroll = viewport.scrollLeft;
      syncInboxFilterBar();
    }
    function stop(ev) {
      if (ev.pointerId !== e.pointerId) return;
      track.removeEventListener('pointermove',move);
      track.removeEventListener('pointerup',stop);
      track.removeEventListener('pointercancel',stop);
      try { track.releasePointerCapture(e.pointerId); } catch {}
    }
    track.addEventListener('pointermove',move);
    track.addEventListener('pointerup',stop);
    track.addEventListener('pointercancel',stop);
    track.setPointerCapture(e.pointerId);
    move(e);
    e.preventDefault();
    e.stopPropagation();
  }
  function renderGroupsSidebar() {
    if(!ui.menu||state.tab!=='groups')return;
    const old=ui.menu.querySelector('.contacts-scroll');
    if(old)state.panelScroll.left=old.scrollTop;
    const query=state.groupSearch.trim().toLowerCase();
    const groups=Object.values(state.groups).sort((a,b)=>Number(b.joined)-Number(a.joined)||(b.updated||0)-(a.updated||0));
    const filtered=groups.filter(g=>!query||`${g.name} ${g.id} ${g.creator}`.toLowerCase().includes(query));
    const invitations=filtered.filter(g=>!g.joined);
    const joined=filtered.filter(g=>g.joined);
    const groupRow=g=>`<button class="group-item ${state.selectedGroup===g.id?'active':''}" data-group="${escapeText(g.id)}" aria-current="${state.selectedGroup===g.id?'page':'false'}">${asset('group-coven-avatar.png','group-avatar','🏡')}<span class="paw-group-info"><span class="group-name">${escapeText(g.name)}</span><span class="group-sub">${g.accepted.length}/${g.members.length} members · ${g.creator===me()?'Your den':'Group Den'}</span></span>${g.unread?`<span class="tiny-pill">${Math.min(99,g.unread)}</span>`:''}</button>`;
    ui.menu.innerHTML=`<div class="side-shell paw-groups-shell">
      <div class="paw-groups-heading"><div><div class="side-card-title">Group Dens ♡</div><div class="muted">Your shared little hideouts</div></div><button class="group-plus" data-action="newgroup" title="Create Group Den">＋ New</button></div>
      <div class="side-search"><input class="search" id="kc-group-search" type="search" placeholder="Search Group Dens..." value="${escapeText(state.groupSearch)}" aria-label="Search Group Dens"/><span class="pawhint">${asset('ui-paw.svg','','🐾')}</span></div>
      <div class="contacts-scroll paw-group-scroll" tabindex="0" role="region" aria-label="Group Dens and invitations">
        ${invitations.length?`<div class="groupbar"><b>💌 Invitations (${invitations.length})</b></div><div class="group-stack">${invitations.map(g=>`<div class="group-invite"><b>${escapeText(g.name)}</b><span class="muted">From ${escapeText(bcName(g.creator))}</span><div class="actions"><button class="primary" data-group-accept="${escapeText(g.id)}">Join</button><button class="secondary" data-group-decline="${escapeText(g.id)}">Decline</button></div></div>`).join('')}</div>`:''}
        <div class="groupbar"><b>🏡 Your Groups (${joined.length})</b></div>
        <div class="group-stack">${joined.map(groupRow).join('')||`<div class="paw-group-empty-list muted">${query?'No matching groups.':'No Group Dens yet. Create one or accept an invitation ♡'}</div>`}</div>
      </div>
      <button class="new-kitty" data-action="newgroup">＋ Create a Group Den</button>
    </div>`;
    restoreSideScroll('left');
  }
  function contactRowHTML(id,onlineMembers){
    const c=state.chats[id],m=c?.messages?.at(-1),online=onlineMembers.has(id),friendOnline=pawFriendConfirmedOnline(id);
    return `<button class="contact ${id===state.selected?'active':''}" data-contact="${id}">
      ${avatar(id)}<span class="info"><div class="topline"><span class="nameline">${escapeText(name(id))} ${c?.favorite?'♡':''}</span><span class="time">${m?new Date(m.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}</span></div><div class="preview">${escapeText(m?.text||(online?'In your room':'No messages yet'))}</div>${statusMarkup(id)}</span>
      ${c?.replyLater?'<span title="Reply later">⏰</span>':''}${c?.requestPending?'<span title="Message request">✉</span>':''}${c?.unread?`<span class="tiny-pill">${Math.min(99,c.unread)}</span>`:''}<span class="presence ${friendOnline?'on':''}" title="${online?'In your room':friendOnline?'Online friend':'Not confirmed online'}"></span></button>`;
  }
  function contactRowSignature(id,onlineMembers){
    const c=state.chats[id],m=c?.messages?.at(-1);
    return JSON.stringify([id,id===state.selected,name(id),m?.id,m?.time,m?.text,
      c?.unread,c?.favorite,c?.replyLater,c?.requestPending,c?.pinned,c?.muted,
      onlineMembers.has(id),pawFriendConfirmedOnline(id),statusLabel(id),state.profiles[id]?.updated||0]);
  }
  const sidebarDiffStats={patches:0,rebuilt:0,kept:0,rowsReplaced:0,rowsAdded:0};
  function reconcileSidebarContacts(){
    if(!state.open||state.tab!=='chats'||!ui.menu)return;
    const key=[state.contactsMode,state.circleFilter,state.search].join('|');
    const list=ui.menu.querySelector('.side-list');
    if(!list||ui.menu.dataset.kcSidebarKey!==key){renderSidebar();sidebarDiffStats.rebuilt++;return;}
    const items=contactItems(),online=new Set(currentRoomRoster().map(p=>numeric(p.MemberNumber)));
    const before=ui.menu.querySelector('.contacts-scroll');
    const top=before?.scrollTop||0;
    const existing=new Map([...list.querySelectorAll(':scope > button.contact[data-contact]')].map(node=>[numeric(node.dataset.contact),node]));
    let changed=false;
    const template=document.createElement('template');
    for(let i=0;i<items.length;i++){
      const id=items[i],signature=contactRowSignature(id,online);
      let row=existing.get(id);
      if(!row||row.dataset.kcRowSig!==signature){
        template.innerHTML=contactRowHTML(id,online);
        const fresh=template.content.firstElementChild;
        if(!fresh)continue;
        fresh.dataset.kcRowSig=signature;
        if(row){
          // Keep painted BC portrait and its canvas attached; prevent a new
          // async portrait render on every received message or badge change.
          const oldAvatar=row.querySelector('.avatar');
          const newAvatar=fresh.querySelector('.avatar');
          if(oldAvatar&&newAvatar)newAvatar.replaceWith(oldAvatar);
          row.replaceWith(fresh);sidebarDiffStats.rowsReplaced++;
        }else sidebarDiffStats.rowsAdded++;
        row=fresh;changed=true;
      }else sidebarDiffStats.kept++;
      if(list.children[i]!==row){list.insertBefore(row,list.children[i]||null);changed=true;}
      existing.delete(id);
    }
    for(const old of existing.values()){old.remove();changed=true;}
    if(!items.length){
      if(!list.querySelector('.kc-room-empty,.muted')){
        list.innerHTML=state.contactsMode==='inroom'?
          `<div class="muted kc-room-empty">${window.CurrentScreen!=='ChatRoom'?'Join a BC room to see everyone there.':'Nobody else is in this room yet.'}</div>`:
          state.contactsMode==='online'?`<div class="muted">${pawPresenceIsFresh()?'No BC friends online right now.':'Checking which BC friends are online…'}</div>`:
          '<div class="muted">No kitties found yet.</div>';
        changed=true;
      }
    }else for(const empty of list.querySelectorAll(':scope > .muted')){empty.remove();changed=true;}
    const heroId=['inroom','online'].includes(state.contactsMode)?(items.includes(state.selected)?state.selected:items[0]||0):(state.selected||items[0]||0);
    const hero=ui.menu.querySelector('.side-mainline');
    if(hero && heroId && numeric(hero.querySelector('.avatar')?.dataset.kcMember)===heroId){
      const current=state.chats[heroId],last=current?.messages?.at(-1);
      const content=hero.querySelector(':scope > div');
      const title=content?.children?.[0],preview=content?.querySelector('.muted');
      const newName=name(heroId),newPreview=last?.text||(online.has(heroId)?'Together in the same room ♡':'A cozy connection');
      if(title&&title.textContent!==newName)title.textContent=newName;
      if(preview&&preview.textContent!==newPreview)preview.textContent=newPreview;
    }
    if(before)before.scrollTop=top;
    sidebarDiffStats.patches++;
    // No work on portraits unless a brand-new row has been inserted.
    if(changed){paintSteadyRemotePortraits(ui.menu);schedulePortraits();}
  }
  function renderSidebar() {
    if(state.tab==='groups'){renderGroupsSidebar();return;}
    if (!ui.menu) return;
    // v0.9.4: The old v0.8.16 simplification incorrectly removed the
    // entire inbox-filter strip. Keep the original choices and ensure any
    // stale/unknown mode falls back safely to All.
    const inboxModes = ['all','online','inroom','unread','favorites','later','requests','muted','pinned'];
    if (!inboxModes.includes(state.contactsMode)) state.contactsMode = 'all';
    const confirmedFriends=new Set(myFriends());
    for(const [id,c] of Object.entries(state.chats)) if(c?.requestPending && confirmedFriends.has(Number(id))){c.requestPending=false;c.requestAccepted=true;saveSoon();}
    const currentLeft = ui.menu.querySelector('.contacts-scroll');
    if (currentLeft) state.panelScroll.left = currentLeft.scrollTop;
    const previousInboxFilters = ui.menu.querySelector('.kc-inbox-filters');
    if (previousInboxFilters) inboxFilterScroll = previousInboxFilters.scrollLeft;
    ensureDefaultSelection();
    const items = contactItems();
    const onlineMembers = new Set(currentRoomRoster().map(p=>numeric(p.MemberNumber)));
    // The spotlight follows this roster too, rather than showing someone
    // outside the room when In Room is selected.
    const heroId = ['inroom','online'].includes(state.contactsMode) ?
      (items.includes(state.selected) ? state.selected : items[0] || 0) :
      (state.selected || items[0] || 0);
    const heroChat = heroId ? state.chats[heroId] : null;
    const heroLast = heroChat?.messages?.at(-1);
    ui.menu.innerHTML = `<div class="side-shell">
      <div class="side-card"><div class="side-card-title">Now Purring ♡</div>
        ${heroId ? `<div class="side-mainline">${avatar(heroId)}<div style="min-width:0;flex:1"><div style="font-size:15px;font-weight:900">${escapeText(name(heroId))}</div><div class="muted">${escapeText(heroLast?.text || (onlineMembers.has(heroId) ? 'Together in the same room ♡' : 'A cozy connection'))}</div>${statusMarkup(heroId)}</div><span class="hero-heart">♡</span></div>` : '<div class="muted">Pick a kitty to start purring ♡</div>'}</div>
      <div class="side-search"><input class="search" id="kc-search" type="search" placeholder="Search kitties..." value="${escapeText(state.search)}"/><span class="pawhint">${asset('ui-paw.svg','','🐾')}</span></div>
      <div class="paw-circle-row"><select id="paw-circle-filter" class="field" aria-label="Filter contacts by friend circle"><option value="">🐾 All friend circles</option><option value="__paw_bc_friends__" ${state.circleFilter==='__paw_bc_friends__'?'selected':''}>🐈 BC Friends only</option>${state.circles.map(c=>`<option value="${escapeText(c.id)}" ${state.circleFilter===c.id?'selected':''}>${escapeText(c.name)} (${c.members.length})</option>`).join('')}</select><button class="secondary" data-action="opencircles">Manage</button></div>
      <div class="kc-inbox-filter-wrap">
        <div class="side-filters kc-inbox-filters" aria-label="Inbox filters">${[['all','All'],['online','🟢 Online'],['inroom',`🏠 In Room (${onlineMembers.size})`],['unread','♡ Unread'],['favorites','💗 Favorites'],['later','⏰ Later'],['requests','✉ Requests'],['muted','🔕 Muted'],['pinned','📌 Pinned']].map(([key,label])=>`<button type="button" class="filterbtn ${state.contactsMode===key?'active':''}" data-filter="${key}" aria-pressed="${state.contactsMode===key}">${label}</button>`).join('')}</div>
        <div class="kc-filter-scroll-controls" aria-label="Scroll inbox filters">
          <button type="button" class="kc-filter-scroll-btn" data-action="inboxscrollleft" title="Previous filters" aria-label="Scroll filters left">‹</button>
          <div class="kc-filter-scroll-track" role="scrollbar" tabindex="0" aria-label="Inbox filters horizontal scrollbar" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="kc-filter-scroll-thumb"></div></div>
          <button type="button" class="kc-filter-scroll-btn" data-action="inboxscrollright" title="Next filters" aria-label="Scroll filters right">›</button>
        </div>
      </div>
      <div class="contacts-scroll" tabindex="0" role="region" aria-label="Scroll kitty names and contacts">
        <div class="side-list">${items.map(id=>contactRowHTML(id,onlineMembers)).join('') || (state.contactsMode==='inroom' ?
          `<div class="muted kc-room-empty">${window.CurrentScreen!=='ChatRoom' ? 'Join a BC room to see everyone there.' : state.search.trim() ? 'No matching room members.' : 'Nobody else is in this room yet.'}</div>` : state.contactsMode==='online' ? `<div class="muted">${state.search.trim()?'No matching online friends.':pawPresenceIsFresh()?'No BC friends online right now.':'Checking which BC friends are online…'}</div>` : '<div class="muted">No kitties found yet.</div>')}</div>
      </div>
      <button class="new-kitty" data-action="new">＋ Add a kitty by member #</button>
    </div>`;
    ui.menu.dataset.kcSidebarKey=[state.contactsMode,state.circleFilter,state.search].join('|');
    for(const row of ui.menu.querySelectorAll('.side-list >button.contact[data-contact]')){
      const id=numeric(row.dataset.contact);row.dataset.kcRowSig=contactRowSignature(id,onlineMembers);
    }
    paintSteadyRemotePortraits(ui.menu);
    restoreSideScroll('left');
    const newInboxFilters = ui.menu.querySelector('.kc-inbox-filters');
    if (newInboxFilters) newInboxFilters.scrollLeft = inboxFilterScroll;
    syncInboxFilterBar();pawSidebarSort();
  }
  function renderChat() {
    const oldComposer = ui.shadow?.getElementById('kc-compose');
    const restoreComposer = oldComposer && ui.shadow.activeElement === oldComposer;
    const composerCursor = restoreComposer ? oldComposer.selectionStart : 0;
    const oldCompanion = ui.body?.querySelector('.companion');
    if (oldCompanion) state.panelScroll.right = oldCompanion.scrollTop;
    if (state.tab==='groups') {
      if(currentGroup()?.joined)renderGroupChat();
      else ui.body.innerHTML=`<div class="screen paw-group-empty"><div class="empty"><div class="art">🏡</div><b>Welcome to Group Dens!</b><p>Select a group on the left, accept an invitation, or create a den for your kitties.</p><button class="primary" data-action="newgroup">＋ New Group Den</button></div></div>`;
      return;
    }
    const id = state.selected, c = state.chats[id];
    if (!id || !c) { ui.body.innerHTML = `<div class="screen" style="display:flex;align-items:center;justify-content:center"><div class="empty"><div class="art">${asset('kitty-empty.png','','😽')}</div><b>Welcome to the kitty den!</b><p>Choose a friend on the left to start a cozy chat, or add a kitty by member number.</p><button class="primary" data-action="new">＋ Add a kitty</button></div></div>`; return; }
    const p = state.profiles[id] || {};
    const lastSticker = (c.messages || []).slice().reverse().find(m => sticker(m.text));
    const lastStickerInfo = lastSticker ? sticker(lastSticker.text) : null;
    ui.body.innerHTML = `<div class="chatlayout" data-paw-chat-theme="${chatTheme(id)}"><section class="chatcenter"><button class="collapse-handle left" data-action="toggleleftpanel" title="${(isCompactCollapseLayout() ? !state.compactOpen : state.leftCollapsed) ? 'Expand left panel' : 'Collapse left panel'}"><span class="arr">${(isCompactCollapseLayout() ? !state.compactOpen : state.leftCollapsed) ? '›' : '‹'}</span></button>${rightArrowButton()}<div class="chathead" id="kc-chathead"></div>${outboxMarkup('chat',id)}<div class="msglog" id="kc-log"></div><div class="chat-float-kitten"><button class="facepop-btn" type="button" data-facepop="float-kitten" title="Pat the kitty">${asset('decor-floating-kitten.png','','🐱')}</button></div>
      ${scheduleMarkup('chat',id)}<div class="quick" aria-label="Quick Paws and scheduling">${state.settings.shortcuts.slice(0,6).map((q,i) => `<button class="pill" data-quick="${i}" title="Send this message">🐾 ${escapeText(q)}</button>`).join('')}<button class="pill paw-quick-schedule" type="button" data-action="schedulepaw" title="Schedule a message for later">📅 Schedule</button></div>
      <div class="stickerpicker hidden" id="kc-stickers">${STICKERS.map(s => `<button class="stickerbtn" data-sticker="${s.id}" title="Send ${s.name}">${asset(`sticker-${s.id}.png`,'',s.emoji)}<small>${s.name}</small></button>`).join('')}</div>
      <div class="kc-reply-banner hidden" id="kc-reply-banner"></div><div class="composer chat-composer"><button class="iconbutton sticker-toggle kc-add" data-action="stickers" title="Open sticker tray">＋</button><select class="mode" id="kc-mode" title="Message type"><option value="beep" ${state.composerMode === 'beep' ? 'selected' : ''}>🐱 Beep</option><option value="whisper" ${state.composerMode === 'whisper' ? 'selected' : ''}>🤫 Whisper</option><option value="offline" ${state.composerMode === 'offline' ? 'selected' : ''}>📮 Offline Note</option></select>
      <textarea class="field" id="kc-compose" maxlength="2000" rows="1" placeholder="${state.composerMode==='offline'?'Write an encrypted offline note...':'Write a little meow...'}">${escapeText(c.draft || '')}</textarea><button class="primary" data-action="send">${asset('ui-send.svg','','➤')}<span class="send-caption">Send</span></button></div></section>
      <aside class="companion" tabindex="0" aria-label="Scrollable profile, stickers, room and actions">${rightDrawerCloseButton()}
        <section class="compcard profilehero"><button class="kitty-profile-avatar facepop-btn" type="button" data-facepop="profile-face" title="Pat the kitty face">${avatar(id)}<span class="kitty-heartbadge">${c.favorite ? '♥' : '♡'}</span></button>
          <div class="profilename">${escapeText(name(id))} ♡ <button class="secondary paw-nickname" data-action="nickname" title="Private nickname">✎</button></div>
          <div class="profile-number">#${id}${inRoom(id) ? ' · <span class="kconline">● Together in BC</span>' : ''}</div>
          <div class="statusline">${p.signature ? escapeText(p.signature) : 'A cozy connection ♡'}</div><div class="kc-side-status">${statusMarkup(id)}</div>
          <div class="profilebuttons"><button class="secondary profile-action" data-action="profile" title="Share your Paw Profile">🐾 Share Profile</button><button class="secondary profile-action" data-action="viewpawprofile" title="View saved Paw Profile">♡ Paw Profile</button><button class="iconbutton" data-action="favorite" title="Favourite">${c.favorite ? '💗':'♡'}</button><button class="iconbutton" data-action="pin" title="Pin">${c.pinned ? '📌' : asset('ui-pin.svg','','📌')}</button><button class="iconbutton" data-action="menu" title="More actions">···</button></div>
          <div class="paw-theme-row"><label for="paw-theme-current">🎨 Chat theme</label><select class="field" id="paw-theme-current">${Object.keys(PAW_CHAT_THEMES).map(t=>`<option value="${t}" ${chatTheme(id)===t?'selected':''}>${PAW_CHAT_THEMES[t].label}</option>`).join('')}</select></div>
          <div class="kc-inbox-tools"><button class="secondary" data-action="replylater">${c.replyLater?'✓ Clear Later':'⏰ Reply Later'}</button><button class="secondary" data-action="snoozechat">${c.snoozeUntil>Date.now()?'🔔 Unsnooze':'🔕 Snooze 1h'}</button>${c.requestPending?'<button class="primary" data-action="acceptrequest">✓ Accept Request</button>':''}</div>
          <div class="paw-profile-extras"><button class="secondary" data-action="assigncircle">🐾 Circle</button><button class="secondary" data-action="kittyinvite">✉ Invite</button></div>
          <div class="profile-tools"><button class="whisper-cta" data-action="whisperquick">♡ &nbsp;Whisper</button><button class="whisper-switch" data-action="beepquick" title="Switch to beep messaging">▾</button></div>
        </section>
        <section class="compcard stickerwall"><div class="smalltitle">${asset('ui-paw.svg','','🐾')} Current Sticker</div>
          <div class="featured-sticker">${lastStickerInfo ? `${asset(`sticker-${lastStickerInfo.id}.png`,'',lastStickerInfo.emoji)}<span>${escapeText(lastStickerInfo.name)} sticker</span>` : `${asset('sticker-purr.png','','🐱')}<span>Pick a kitty mood ♡</span>`}</div>
          <div class="stickergrid">${STICKERS.slice(0,8).map(st => `<button class="stickertile" data-sticker="${st.id}" title="Send ${escapeText(st.name)} sticker">${asset(`sticker-${st.id}.png`,'',st.emoji)}</button>`).join('')}</div>
        </section>
        <section class="compcard roompreview"><div class="smalltitle">${asset('ui-paw.svg','','🐾')} Shared Room</div><div class="roompreview-row"><div class="room-preview-icon">${asset('room-thumb-mockup.png','','🏡')}</div><div class="roompreview-name">${inRoom(id) ? escapeText(window.ChatRoomData?.Name || 'Current room') : 'No shared room'}<small>${inRoom(id) ? 'Together in the same room ♡' : 'Explore public rooms'}</small></div><button class="room-join" data-action="roomshortcut" title="Open room explorer">⌂ Join</button></div></section>
        <section class="compcard actioncard"><div class="smalltitle">${asset('ui-settings.svg','','⚙')} Quick Actions</div><div class="quickactions"><button class="iconbutton" data-action="favorite" title="Favourite"><span>${c.favorite ? '💗':'♡'}</span><small>Like</small></button><button class="iconbutton" data-action="pin" title="Pin"><span>${c.pinned ? '📌':'☆'}</span><small>Pin</small></button><button class="iconbutton" data-action="menu" title="Chat options"><span>···</span><small>More</small></button></div></section>
      </aside></div><div id="kc-secure-modal" class="paw-secure-overlay hidden" role="dialog" aria-modal="true" aria-label="Set Secure Chat secret">
        <div class="paw-secure-dialog"><h3>🔐 Secure Chat</h3><p class="muted">Encrypt new PawLounge Beeps and Whispers to <b class="paw-secure-recipient"></b> with AES-256-GCM.</p>
        <p class="muted">You BOTH enter the SAME secret, shared OUTSIDE Bondage Club. Generated random secrets are safest. No passwords are saved; repeat after reload. Native BC shows encoded ciphertext.</p>
        <label>Shared secret <input class="field" type="password" id="kc-secure-key" autocomplete="off" spellcheck="false" maxlength="256" placeholder="Paste the same secret on both clients"/></label>
        <div class="paw-secure-status muted"></div><div class="flex"><button class="secondary" data-action="pawsecuregenerate">Generate 256-bit secret</button><button class="primary" data-action="pawsecuresave">Enable secure chat</button></div>
        <div class="flex"><button class="secondary" data-action="pawsecureforget">Disable / forget key</button><button class="secondary" data-action="pawsecureclose">Close</button></div></div></div>`;
    ui.input = ui.shadow.getElementById('kc-compose');
    renderChatHeader(); renderMessages();renderReplyBar();
    restoreSideScroll('right');
    if (restoreComposer && ui.input) {
      ui.input.focus({preventScroll:true});
      const cursor = Math.min(composerCursor, ui.input.value.length);
      ui.input.setSelectionRange(cursor, cursor);
    }
  }
  function renderGroupModal() {
    const box=ui.shadow?.getElementById('kc-group-modal');if(!box)return;
    box.classList.toggle('hidden',!state.groupCreateOpen);
    if(!state.groupCreateOpen){box.innerHTML='';return;}
    const friends=myFriends().filter(id=>id!==me());
    box.innerHTML=`<div class="group-create-card" role="dialog" aria-modal="true" aria-label="Create PawLounge group">
      <h2>🏡 Start a Group Den</h2><p class="muted">Invite at least two BC friends. Invitations must be accepted; group chat works when members run PawLounge or compatible Kittychat builds.</p>
      <label>Group name<input class="field" id="kc-group-name" maxlength="46" placeholder="The Purrfect Hideout"/></label>
      <div class="smalltitle">Choose friends (up to ${MAX_GROUP_MEMBERS-1})</div>
      <div class="member-picker">${friends.length?friends.map(id=>`<label><input type="checkbox" name="kc-group-member" value="${id}"/>${avatar(id)}<span>${escapeText(bcName(id))} <small class="muted">#${id}</small></span></label>`).join(''):'<div class="muted">You need at least two BC friends to create a group.</div>'}</div>
      <div class="group-actions"><button class="secondary" data-action="cancelgroup">Cancel</button><button class="primary" data-action="creategroup">💌 Send invites</button></div></div>`;
  }
  function renderGroupChat(preserveTop=false) {
    const g=currentGroup();if(!g)return;
    const oldLog=ui.shadow?.getElementById('kc-log');
    const previousTop=oldLog?.scrollTop||0,previousHeight=oldLog?.scrollHeight||0;
    const oldComposer = ui.shadow?.getElementById('kc-compose');
    const restoreComposer = oldComposer && ui.shadow.activeElement === oldComposer;
    const composerCursor = restoreComposer ? oldComposer.selectionStart : 0;
    const groupMessages=historyDisplayMessages('group',g.id,g.messages);
    ui.body.innerHTML=`<div class="chatlayout"><section class="chatcenter"><button class="collapse-handle left" data-action="toggleleftpanel" title="${(isCompactCollapseLayout() ? !state.compactOpen : state.leftCollapsed) ? 'Expand left panel' : 'Collapse left panel'}"><span class="arr">${(isCompactCollapseLayout() ? !state.compactOpen : state.leftCollapsed) ? '›' : '‹'}</span></button>${rightArrowButton()}
      <div class="chathead"><div style="font-size:36px">🏡</div><div class="headblock"><div class="headtitle">${escapeText(g.name)}</div><div class="headsubtitle kc-header-subrow"><span class="kc-header-subtext">PawLounge Group Den · ${g.accepted.length}/${g.members.length} members joined</span>${outboxTrigger('group',g.id)}</div></div><button class="secondary" data-action="leavegroup">Leave group</button></div>${outboxMarkup('group',g.id)}
      <div class="msglog" id="kc-log">${historyLoadButton()}${groupMessages.length ? `<div class="kc-date-divider"><span>${new Date(groupMessages[0].time).toDateString() === new Date().toDateString() ? 'Today' : new Date(groupMessages[0].time).toLocaleDateString()}</span></div>` : ''}${groupMessages.length?groupMessages.map(m=>{const mine=m.from===me(),st=sticker(m.text);return `<div class="msgrow ${mine?'mine':'other'}" data-message-id="${escapeText(m.id)}"><div class="msgavatar">${avatar(mine ? me() : m.from)}</div><div class="msgcol"><div class="msgbubble"><div class="group-message-author">${escapeText(mine?'You':name(m.from))}</div>${replyPreview(m.replyTo)}${st?`<div class="msgsticker">${asset(`sticker-${st.id}.png`,'',st.emoji)}</div>`:escapeText(m.text)}</div>${reactionMarkup(m,'group',g.id)}<div class="msgmeta">${m.recovered?`<span title="Matched by ${m.verifiedBy?.length||0} other group participants; client-reported, not cryptographically verified">✓ ${m.verifiedBy?.length||0} peer confirmations · </span>`:''}${new Date(m.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} ${mine ? `<span data-group-receipt="${escapeText(m.id)}">· ✓ ${g.receipts?.[m.id]?.length||0}/${Math.max(0,g.accepted.length-1)} client ACKs</span>` : ''}${m.outboxId?` <span class="kc-delivery" data-outbox-status="${escapeText(m.outboxId)}">${escapeText(outboxStatusLabel(outboxById(m.outboxId)))}</span>`:''} ${messageActions(m,'group')}</div></div></div>`}).join(''):'<div class="empty">🐾 No group messages yet. Say meow!</div>'}</div>
      <div class="quick" aria-label="Quick Paws and scheduling">${state.settings.shortcuts.slice(0,6).map((q,i)=>`<button class="pill" data-quick="${i}" title="Send this message">🐾 ${escapeText(q)}</button>`).join('')}<button class="pill paw-quick-schedule" type="button" data-action="schedulepaw" title="Schedule a group message for later">📅 Schedule</button></div>
      <div class="stickerpicker hidden" id="kc-stickers">${STICKERS.map(st=>`<button class="stickerbtn" data-sticker="${st.id}">${asset(`sticker-${st.id}.png`,'',st.emoji)}<small>${escapeText(st.name)}</small></button>`).join('')}</div>
      <div class="kc-reply-banner hidden" id="kc-reply-banner"></div><div class="composer group-composer"><div class="group-head-tag">🏡 Group</div><button class="iconbutton sticker-toggle kc-add" data-action="stickers" title="Open group stickers">＋</button><textarea class="field" id="kc-compose" maxlength="${MAX_GROUP_TEXT}" rows="1" placeholder="Meow to the group...">${escapeText(g.draft||'')}</textarea><button class="primary" data-action="send">${asset('ui-send.svg','','➤')}<span class="send-caption">Send</span></button></div>${scheduleMarkup('group',g.id)}
      </section><aside class="companion group-details" tabindex="0" aria-label="Scroll group details and members">${rightDrawerCloseButton()}<div class="compcard"><h3>🐾 Den Members</h3>${canModerateDen(g)?'<button class="secondary kc-group-invite" type="button" data-action="groupinvite">＋ Invite member</button>':''}${g.members.map(id=>`<div class="group-member">${avatar(id)}<div><b>${escapeText(name(id))}</b><div><small>${g.accepted.includes(id)?'✅ Joined': '✉️ Awaiting invitation'}${id===g.creator?' · Host':g.moderators?.includes(id)?' · Moderator':''}${g.creator===me() && id!==me() ? ` <button class="kc-role-toggle" data-role-toggle="${id}" title="Toggle moderator role">${g.moderators?.includes(id)?'Remove moderator':'Make moderator'}</button><button class="kc-role-toggle" data-paw-role="${id}">${escapeText(g.roles?.[id]||'Member')} ▾</button>` : ` · ${escapeText(id===g.creator?'Host':g.roles?.[id]||'Member')}`}</small></div></div>${canModerateDen(g)&&id!==g.creator&&(g.creator===me()||!g.moderators?.includes(id))?`<button class="kc-role-toggle kc-group-kick" type="button" data-kick-group-member="${id}" title="Remove ${escapeText(name(id))} from group" aria-label="Remove ${escapeText(name(id))} from group">Kick</button>`:''}</div>`).join('')}</div>
      <div class="compcard"><h3>💌 Group delivery</h3><p class="muted">Messages are delivered as individual BC beeps. Each member must accept and be a BC friend of the sender.</p>${g.creator===me()?'<button class="secondary" data-action="resendgroup">Resend pending invites</button>':''}<button class="secondary" data-action="recovergroup" title="Ask group members to corroborate recent messages">↻ Recover recent messages</button>${quorumState(g.id)?`<p class="muted" data-recovery-status>${escapeText(recoveryStatus(g.id))}</p>`: ''}</div>${pawGroupExtras(g)}</aside></div>`;
    ui.input=ui.shadow.getElementById('kc-compose');renderReplyBar();
    const logEl=ui.shadow.getElementById('kc-log'); if(logEl)logEl.scrollTop=preserveTop ? previousTop+(logEl.scrollHeight-previousHeight) : logEl.scrollHeight;
    restoreSideScroll('right');
    if (restoreComposer && ui.input) {
      ui.input.focus({preventScroll:true});
      const cursor = Math.min(composerCursor, ui.input.value.length);
      ui.input.setSelectionRange(cursor, cursor);
    }
  }
  function renderChatHeader() {
    const id = state.selected, c = state.chats[id], head = ui.shadow.getElementById('kc-chathead'); if (!head || !c) return;
    const typing = (state.typingUntil[id] || 0) > Date.now();
    const p = state.profiles[id];
    head.innerHTML = `<button class="headface facepop-btn" type="button" data-facepop="head-face" title="Pat the kitty face">${avatar(id)}</button><div class="headblock"><div class="headtitle">${escapeText(name(id))} ${p?.kitty ? '♡' : ''}</div><div class="headsubtitle kc-header-subrow"><span class="kc-header-subtext">#${id} · ${typing ? '<span class="typing-paws">🐾 typing...</span>' : inRoom(id) ? 'In the room with you' : (p?.signature ? escapeText(p.signature) : 'A cozy connection')}</span>${outboxTrigger('chat',id)}</div>${statusMarkup(id,'kc-head-status')}</div>
    <div class="headright"><button class="iconbutton" data-action="securechat" title="Secure Chat: ${pawSecureSecrets.has(id)?'Enabled (session only)':'Set a shared secret'}">${pawSecureSecrets.has(id)?'🔐':'🔒'}</button><button class="iconbutton" data-action="searchmessages" title="Search chat history">${asset('ui-search.svg','','🔎')}</button><button class="iconbutton" data-action="profile" title="Share your Paw Profile">🐾</button><button class="iconbutton" data-action="viewpawprofile" title="View saved Paw Profile">♡</button><button class="iconbutton" data-action="favorite" title="Favourite">${asset('ui-heart.svg','','♡')}</button><button class="iconbutton" data-action="menu" title="Chat options">⋯</button></div>`;
  }
  // Reuse one markup function for initial render and fast append. This also
  // preserves the native reply/reaction UI in both paths without divergence.
  function privateMessageMarkup(m,c) {
    const mine=m.from===me(), st=sticker(m.text);
    return `<div class="msgrow ${mine ? 'mine' : 'other'}" data-message-id="${escapeText(m.id)}"><div class="msgavatar">${avatar(mine ? me() : c.id)}</div><div class="msgcol"><div class="msgbubble">${replyPreview(m.replyTo)}${st ? `<div class="msgsticker">${asset(`sticker-${st.id}.png`,'',st.emoji)}</div><div class="muted">${escapeText(st.name)} sticker</div>` : escapeText(m.text)}</div>${reactionMarkup(m,'chat',c.id)}<div class="msgmeta">${m.offline ? '📮 Offline Note' : m.mode === 'whisper' ? '🤫 Whisper' : '💌 Beep'} · ${new Date(m.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}${m.outboxId?` <span class="kc-delivery" data-outbox-status="${escapeText(m.outboxId)}">${escapeText(outboxStatusLabel(outboxById(m.outboxId)))}</span>`:''} ${messageActions(m,'chat')}</div></div></div>`;
  }
  function privateDateLabel(time) {
    const d=new Date(time);
    return d.toDateString()===new Date().toDateString() ? 'Today' : d.toLocaleDateString([], {month:'short', day:'numeric', year:'numeric'});
  }
  function appendVisiblePrivateMessage(member,message) {
    if (state.tab!=='chats' || state.selected!==member || state.selectedGroup || state.messageSearch ||
        state.historyLoading || state.historyOlder.length ||
        state.historySelection!==historySelectionKey('chat',member)) return false;
    const c=state.chats[member],log=ui.shadow?.getElementById('kc-log');
    if (!c || !log) return false;
    const rows=log.querySelectorAll(':scope > .msgrow');
    const saturated=rows.length===MAX_MESSAGES && c.messages.length===MAX_MESSAGES;
    if (!saturated && rows.length!==c.messages.length-1) return false;
    if(!rows.length && c.messages.length!==1)return false;
    const nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<100;
    if (saturated) rows[0]?.remove();
    const empty=log.querySelector(':scope > .empty');if(empty)empty.remove();
    if(!log.querySelector(':scope > .kc-date-divider') && !state.historyOlder.length)log.insertAdjacentHTML('beforeend',`<div class="kc-date-divider"><span>${escapeText(privateDateLabel(message.time))}</span></div>`);
    log.insertAdjacentHTML('beforeend',privateMessageMarkup(message,c));
    // When a full 90-message cache advances beyond midnight, its day label
    // must advance too. Only the existing label changes, never the log DOM.
    const day=log.querySelector(':scope > .kc-date-divider span');
    if (day && c.messages[0]) {
      const label=privateDateLabel(c.messages[0].time);
      if (day.textContent!==label) day.textContent=label;
    }
    if (nearBottom) log.scrollTop=log.scrollHeight;
    return true;
  }
  function renderMessages(preserveTop=false) {
    const c = state.chats[state.selected], logElement = ui.shadow.getElementById('kc-log'); if (!c || !logElement) return;
    const oldHeight=logElement.scrollHeight,oldScroll=logElement.scrollTop;
    const nearBottom = logElement.scrollHeight - logElement.scrollTop - logElement.clientHeight < 100;
    const combined=historyDisplayMessages('chat',c.id,c.messages);
    const visible = state.messageSearch ? combined.filter(m => m.text.toLowerCase().includes(state.messageSearch.toLowerCase())) : combined;
    const dateHeader = visible.length ? `<div class="kc-date-divider"><span>${privateDateLabel(visible[0].time)}</span></div>` : '';
    logElement.innerHTML = historyLoadButton() + (visible.length ? dateHeader + visible.map(m=>privateMessageMarkup(m,c)).join('') : '<div class="empty"><div class="art">🐾</div>No messages yet. Send the first meow!</div>');
    if (preserveTop) logElement.scrollTop=oldScroll+(logElement.scrollHeight-oldHeight);
    else if (nearBottom) logElement.scrollTop = logElement.scrollHeight;
  }

  function normalizeMoment(raw) {
    if(!raw||typeof raw!=='object')return null;
    const id=trim(raw.id||'',80),text=trim(raw.text||'',380);
    if(!id||!text)return null;
    const image=trim(raw.image||'',500);
    return {id,text,title:trim(raw.title||'Paw Moment',65),from:numeric(raw.from),source:trim(raw.source||'',85),
      at:Number(raw.at)||Date.now(),image:/^https:\/\//i.test(image)?image:'',decoration:['♡','🐾','✨','🌷','🎀'].includes(raw.decoration)?raw.decoration:'♡',received:!!raw.received};
  }
  function saveMessageAsMoment(mid) {
    const kind=currentConversationKind(),conversation=kind==='group'?state.selectedGroup:state.selected;
    const m=lookupMessage(kind,conversation,mid);
    if(!m)return;
    const title=window.prompt('Name this Paw Moment:','A cozy memory ♡');if(title===null)return;
    const moment=normalizeMoment({id:`moment_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title,text:m.text,from:m.from,
      source:kind==='group'?currentGroup()?.name:name(conversation),at:m.time,decoration:'♡'});
    if(!moment)return;
    state.moments.push(moment);state.moments=state.moments.slice(-MOMENT_LIMIT);saveSoon();notice('♡ Paw Moment saved privately.');
  }
  // PawLounge extensions retain Kittychat's existing account storage and wire IDs.
  // This keeps old messages, existing friends, and the GitHub auto-launcher compatible.
  const PAW_CHAT_THEMES = Object.freeze({
    velvet:{label:'Velvet (original)'},rose:{label:'Rose Garden'},moon:{label:'Moonlight'},forest:{label:'Forest Kitty'},gold:{label:'Golden Hour'}
  });
  const chatTheme=id=>Object.hasOwn(PAW_CHAT_THEMES,state.chats[id]?.pawTheme)?state.chats[id].pawTheme:'velvet';
  const uniquePawId=prefix=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  const safeImg=u=>/^https:\/\//i.test(trim(u,500))?trim(u,500):'';
  function normalizeGuestEntry(e){
    const from=numeric(e?.from),text=trim(e?.text,250),at=Number(e?.at);
    return from&&text?{from,text,at:Number.isFinite(at)?at:Date.now(),id:trim(e?.id,80)}:null;
  }
  function normalizeInvitation(o){
    if(!o||typeof o!=='object')return null;
    const id=trim(o.id,80),from=numeric(o.from),type=trim(o.type,16);
    if(!/^invite_[\w-]{5,45}$/.test(id)||!from||!['chat','room','group'].includes(type))return null;
    const room=o.room&&['X','M','F'].includes(o.room.Space)&&trim(o.room.Name,110)?{Space:o.room.Space,Name:trim(o.room.Name,110)}:null;
    return {id,from,type,room,groupId:trim(o.groupId,65),label:trim(o.label,120),at:Number(o.at)||Date.now(),status:['pending','accepted','declined'].includes(o.status)?o.status:'pending'};
  }
  // PawBooks 1.0 uses the same shared album IDs and saved cards as legacy scrapbooks.
  function normalizeBookPage(p){
    const id=trim(p?.id,80),title=trim(p?.title,60);
    if(!/^page_[\w-]{5,60}$/.test(id)||!title)return null;
    const until=Number(p.sealedUntil)||0;
    return {id,title,caption:trim(p.caption||'',250),background:['rose','plum','midnight','lavender','forest','gold'].includes(p.background)?p.background:'rose',
      layout:['grid','list','polaroid','collage'].includes(p.layout)?p.layout:'polaroid',sealedUntil:until>0&&until<4102444800000?until:0,
      updated:Number(p.updated)||0,private:!!p.private};
  }
  function normalizeBookPages(raw){return (Array.isArray(raw)?raw:[]).slice(0,24).map(normalizeBookPage).filter(p=>p&&!p.private);}
  function normalizePrivateBookPages(raw){
    const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    for(const [id,pages] of Object.entries(raw).slice(0,30))if(/^album_[\w-]{5,45}$/.test(id)){
      out[id]=(Array.isArray(pages)?pages:[]).slice(-24).map(p=>{
        const page=normalizeBookPage(p);if(!page)return null;
        return {...page,private:true,cards:(Array.isArray(p.cards)?p.cards:[]).slice(-60).map(normalizePawCard).filter(Boolean)};
      }).filter(Boolean);
    }
    return out;
  }
  function normalizeBookRoles(raw,members){
    const out={};for(const member of members)if(['viewer','contributor','editor'].includes(raw?.[member]))out[member]=raw[member];
    return out;
  }
  function normalizeBookEvents(raw){return (Array.isArray(raw)?raw:[]).slice(-60).map(e=>({
    id:trim(e?.id,80),by:numeric(e?.by),type:trim(e?.type,30),detail:trim(e?.detail,110),at:Number(e?.at)||0
  })).filter(e=>/^evt_[\w-]{5,65}$/.test(e.id)&&e.by&&e.at>0);}
  function normalizeAlbum(raw){
    const id=trim(raw?.id,80),owner=numeric(raw?.owner);
    if(!/^album_[\w-]{5,45}$/.test(id)||!owner)return null;
    const members=[...new Set([owner,...(Array.isArray(raw?.members)?raw.members:[]).map(numeric)].filter(Boolean))].slice(0,8);
    const cards=(Array.isArray(raw.cards)?raw.cards:[]).slice(-60).map(normalizePawCard).filter(Boolean);
    const nameUpdated=Number(raw.nameUpdated);
    return {id,owner,bookPages:normalizeBookPages(raw.bookPages),bookRoles:normalizeBookRoles(raw.bookRoles,members),bookEvents:normalizeBookEvents(raw.bookEvents),linkedGroup:trim(raw.linkedGroup||'',65),bookUpdated:Math.max(0,Number(raw.bookUpdated)||0),name:trim(raw.name,70)||'Paw Scrapbook',nameUpdated:Number.isSafeInteger(nameUpdated)&&nameUpdated>0?nameUpdated:0,members,joined:!!raw.joined,pendingInvites:(Array.isArray(raw.pendingInvites)?raw.pendingInvites:[]).map(numeric).filter(Boolean).slice(0,8),cards,coverColor:Object.hasOwn(PAW_COVER_COLORS,raw.coverColor)?raw.coverColor:'rose',coverImage:safeImg(raw.coverImage),coverFrame:['classic','polaroid','floral'].includes(raw.coverFrame)?raw.coverFrame:'classic',coverAt:Number(raw.coverAt)||0,pageLayout:PAW_PAGE_LAYOUTS.includes(raw.pageLayout)?raw.pageLayout:'grid',pageAt:Number(raw.pageAt)||0,updated:Number(raw.updated)||Date.now()};
  }
  function pawSend(member,type,body){
    member=numeric(member);
    if(!member||!myFriends().includes(member)||typeof window.ServerSend!=='function')return false;
    try{window.ServerSend('AccountBeep',{MemberNumber:member,BeepType:type,IsSecret:true,Message:pawWireJSON({...body,nonce:integrityNonce()})});return true;}
    catch(err){console.warn('[PawLounge] Send failed:',err);return false;}
  }
  function circleFlag(member,field){return state.circles.some(c=>c.members.includes(numeric(member))&&c[field]===false);}
  function circleQuiet(member){return state.circles.some(c=>c.members.includes(numeric(member))&&c.quiet===true);}
  function togglePawCircleFlag(id,field){
    const c=state.circles.find(x=>x.id===id);if(!c||!['shareStatus','shareProfile','quiet'].includes(field))return;
    c[field]=field==='quiet'?!c.quiet:c[field]===false;
    saveSoon();renderCircles();if(field==='shareStatus')publishFriendStatus(false);
  }
  function createPawCircle(){
    if(state.circles.length>=30){notice('Maximum 30 friend circles.');return;}
    const name=window.prompt('Name your friend circle (up to 45 characters):','Cuddle Buddies ♡');
    if(!name?.trim())return;
    const c={id:uniquePawId('circle'),name:trim(name,45),members:[],shareStatus:true,shareProfile:true,quiet:false};
    state.circles.push(c);saveSoon();renderCircles();
  }
  function assignPawCircle(member){
    member=numeric(member);if(!member)return;
    if(!state.circles.length){notice('Create a Friend Circle first.');state.tab='circles';render();return;}
    const answer=window.prompt('Choose a circle number to toggle this friend:\n'+state.circles.map((c,i)=>`${i+1}. ${c.name} ${c.members.includes(member)?'✓':''}`).join('\n'),'1');
    if(answer===null)return;
    const index=Number(answer)-1,c=state.circles[index];if(!c)return notice('No circle found for that number.');
    c.members=c.members.includes(member)?c.members.filter(x=>x!==member):[...c.members,member];saveSoon();render();
  }
  function renderCircles(){
    ui.body.innerHTML=`<div class="screen paw-wide-screen"><div class="sectiontitle">🐾 Friend Circles</div><p class="muted">Arrange your BC friends into private local circles. No one is notified, and circle labels are not sent to other players.</p><button class="primary" data-action="newcircle">＋ New circle</button>
      <div class="paw-items">${state.circles.map(c=>`<div class="paw-item"><h3>♡ ${escapeText(c.name)}</h3><p class="muted">${c.members.length} friend${c.members.length===1?'':'s'}</p><p>${c.members.map(x=>escapeText(bcName(x))).join(' · ')||'No members yet. Open a conversation and use 🐾 Circle to add someone.'}</p><div class="flex"><button class="secondary" data-paw-circle-toggle="${escapeText(c.id)}:shareStatus">${c.shareStatus===false?'⛔ Status hidden':'🟢 Share status'}</button><button class="secondary" data-paw-circle-toggle="${escapeText(c.id)}:shareProfile">${c.shareProfile===false?'⛔ Profile sharing off':'🐾 Profile sharing on'}</button><button class="secondary" data-paw-circle-toggle="${escapeText(c.id)}:quiet">${c.quiet?'🔕 Quiet circle':'🔔 Normal sounds'}</button><button class="secondary" data-paw-circle-delete="${escapeText(c.id)}">Remove circle</button></div></div>`).join('')||'<p class="muted">No circles yet.</p>'}</div></div>`;
  }
  // Mark only the relevant category as caught up. Beep unread counts must
  // survive a "Whispers caught up" action. Historic chats predate per-mode
  // counters, so infer the whisper portion from the cached unread tail.
  function markCatchUpCategory(kind){
    const now=Date.now();
    if(kind==='whispers'){
      state.catchUpWhispersSince=now;
      for(const chat of Object.values(state.chats)){
        const unread=Math.max(0,Number(chat.unread)||0);
        if(!unread)continue;
        const recentIncoming=(chat.messages||[]).filter(m=>m.from!==me()).slice(-unread);
        const whisperUnread=recentIncoming.filter(m=>m.mode==='whisper').length;
        chat.unread=Math.max(0,unread-whisperUnread);
      }
      notice('🤫 Whispers caught up. Unread beeps are preserved.');
    }else if(kind==='groups'){
      state.catchUpGroupsSince=now;
      for(const group of Object.values(state.groups))if(group.joined)group.unread=0;
      notice('🏡 Group chats caught up.');
    }else return;
    saveSoon();updateBadge();if(state.open&&state.tab==='catchup')renderCatchUp();
  }
  function pendingCatchUpInvitations(){
    const paw=state.invitations.filter(x=>x.status==='pending');
    const albums=state.sharedAlbums.filter(x=>!x.joined&&x.owner!==me());
    const dens=Object.values(state.groups).filter(g=>!g.joined&&g.creator!==me());
    return {paw,albums,dens};
  }
  function bulkAnswerCatchUpInvitations(accept){
    const {paw,albums,dens}=pendingCatchUpInvitations();
    const count=paw.length+albums.length+dens.length;
    if(!count)return notice('No pending invitations to process.');
    const roomCount=accept?paw.filter(x=>x.type==='room').length:0;
    const unavailable=accept?paw.filter(x=>x.type==='group'&&!state.groups[x.groupId]).length:0;
    const locked=accept&&pawBookVault.locked?albums.length:0;
    const skipped=roomCount+unavailable+locked;
    const actionable=count-skipped;
    if(!actionable)return notice('These invitations need individual attention before they can be accepted.');
    const caveat=skipped?`\n\n${skipped} invitation(s) will remain pending: room joins need individual approval, unknown Group Dens need a creator invite, and locked PawBooks must be unlocked.`:'';
    if(!window.confirm(`${accept?'Accept':'Decline'} ${actionable} pending PawLounge invitation(s)?${caveat}`))return;
    let done=0;
    for(const g of dens){if(state.groups[g.id]&&!g.joined){respondGroup(g.id,accept,true);done++;}}
    for(const a of albums){if(!pawBookVault.locked&&state.sharedAlbums.includes(a)&&!a.joined){if(answerAlbumInvite(a.id,accept,true))done++;}}
    for(const invite of paw){if(answerPawInvite(invite.id,accept,true))done++;}
    // Batch controls must never select arbitrary chats, change tabs, or join
    // a BC room. Render once, after the entire action has been saved.
    saveSoon();updateBadge();if(state.open&&state.tab==='catchup')renderCatchUp();
    notice(`${accept?'Accepted':'Declined'} ${done} invitation${done===1?'':'s'}.${skipped?` ${skipped} still pending.`:''}`);
  }
  function renderCatchUp(){
    const since=state.catchUpSince||Date.now();
    const whispersSince=Math.max(since,state.catchUpWhispersSince||since);
    const groupsSince=Math.max(since,state.catchUpGroupsSince||since);
    const allPrivate=Object.entries(state.chats).flatMap(([id,c])=>(c.messages||[]).filter(m=>m.from!==me()).map(m=>({id:Number(id),time:Number(m.time)||0,text:m.text,mode:m.mode})));
    const whispers=allPrivate.filter(m=>m.mode==='whisper'&&m.time>whispersSince).sort((a,b)=>b.time-a.time);
    const beeps=allPrivate.filter(m=>m.mode!=='whisper'&&m.time>since).sort((a,b)=>b.time-a.time);
    const groups=Object.values(state.groups).filter(g=>g.joined).flatMap(g=>(g.messages||[]).filter(m=>m.from!==me()&&Number(m.time)>groupsSince).map(m=>({id:g.id,name:g.name,time:Number(m.time),text:m.text}))).sort((a,b)=>b.time-a.time);
    const {paw:pending,albums,dens}=pendingCatchUpInvitations();
    const unread=Object.values(state.chats).reduce((n,c)=>n+(Number(c.unread)||0),0);
    const pendingCount=pending.length+albums.length+dens.length;
    ui.body.innerHTML=`<div class="screen paw-wide-screen"><div class="sectiontitle">📬 Smart Catch-Up</div><p class="muted">Recent locally saved messages and invitations. Each category can be marked caught up independently; older archived messages remain accessible in Chats.</p>
      <div class="paw-stats"><div><strong>${whispers.length}</strong><small>Recent whispers</small></div><div><strong>${groups.length}</strong><small>Recent group messages</small></div><div><strong>${unread}</strong><small>Unread private notifications</small></div><div><strong>${pendingCount}</strong><small>Pending invitations</small></div></div>
      <div class="paw-catchup-actions"><button class="secondary" data-action="markcatchup">✓ Mark everything caught up</button><button class="secondary" data-action="markwhisperscaughtup">🤫 Whispers caught up</button><button class="secondary" data-action="markgroupscaughtup">🏡 Group chats caught up</button></div>
      <div class="paw-catchup-invites-title"><h3>💌 Invitations (${pendingCount})</h3><div class="paw-catchup-actions"><button class="primary" data-action="catchupacceptall" ${pendingCount?'':'disabled'}>✓ Accept all invites</button><button class="secondary" data-action="catchupdeclineall" ${pendingCount?'':'disabled'}>✕ Decline all invites</button></div></div>
      <div class="paw-items">${pending.map(x=>`<div class="paw-item"><b>${escapeText(bcName(x.from))}</b> invited you to ${x.type==='room'?`room ${escapeText(x.room?.Name||'')}`:x.type==='group'?`Group Den ${escapeText(x.label)}`:'chat'}<div class="flex"><button class="primary" data-paw-invite-accept="${escapeText(x.id)}">Accept</button><button class="secondary" data-paw-invite-decline="${escapeText(x.id)}">Decline</button></div></div>`).join('')}${dens.map(g=>`<div class="paw-item"><b>${escapeText(bcName(g.creator))}</b> invited you to Group Den <b>${escapeText(g.name)}</b><div class="flex"><button class="primary" data-group-accept="${escapeText(g.id)}">Join</button><button class="secondary" data-group-decline="${escapeText(g.id)}">Decline</button></div></div>`).join('')}${albums.map(a=>`<div class="paw-item"><b>${escapeText(bcName(a.owner))}</b> invited you to collaborate on <b>${escapeText(a.name)}</b><div class="flex"><button class="primary" data-paw-album-accept="${escapeText(a.id)}">Join scrapbook</button><button class="secondary" data-paw-album-decline="${escapeText(a.id)}">Decline</button></div></div>`).join('')}${pendingCount?'':'<p class="muted">No new invitations.</p>'}</div>
      <h3>🤫 Recent whispers</h3><div class="paw-items">${whispers.slice(0,12).map(m=>`<div class="paw-item"><b>${escapeText(bcName(m.id))}</b> · ${new Date(m.time).toLocaleTimeString()}<p>${escapeText(trim(m.text,175))}</p><button class="secondary" data-contact="${m.id}">Open conversation</button></div>`).join('')||'<p class="muted">Whispers caught up!</p>'}</div>
      <h3>💌 Recent beeps</h3><div class="paw-items">${beeps.slice(0,8).map(m=>`<div class="paw-item"><b>${escapeText(bcName(m.id))}</b> · ${new Date(m.time).toLocaleTimeString()}<p>${escapeText(trim(m.text,175))}</p><button class="secondary" data-contact="${m.id}">Open conversation</button></div>`).join('')||'<p class="muted">No new beeps.</p>'}</div>
      <h3>🏡 Group updates</h3><div class="paw-items">${groups.slice(0,8).map(m=>`<div class="paw-item"><b>${escapeText(m.name)}</b> · ${new Date(m.time).toLocaleTimeString()}<p>${escapeText(trim(m.text,175))}</p><button class="secondary" data-group="${escapeText(m.id)}">Open group</button></div>`).join('')||'<p class="muted">Group chats caught up!</p>'}</div></div>`;
  }
  function offerPawInvite(){
    const target=numeric(state.selected);
    if(!target||!myFriends().includes(target)){notice('Invitations require a BC friend.');return;}
    const kind=trim(window.prompt('Send an invitation: chat, room or group?','chat'),10).toLowerCase();
    if(!['chat','room','group'].includes(kind))return;
    const invitation={id:uniquePawId('invite'),from:me(),type:kind,at:Date.now(),label:'',room:null,groupId:''};
    if(kind==='room'){
      if(window.CurrentScreen!=='ChatRoom'||!window.ChatRoomData?.Name){notice('Enter a BC room first to send a room invitation.');return;}
      const space=window.ChatRoomData?.Space||'X';if(!['X','M','F'].includes(space))return;
      invitation.room={Name:trim(window.ChatRoomData.Name,110),Space:space};
      invitation.label=invitation.room.Name;
    }else if(kind==='group'){
      const g=currentGroup();if(!g?.joined){notice('Open a Group Den before inviting someone to it.');return;}
      invitation.groupId=g.id;invitation.label=g.name;
    }
    if(!window.confirm(`Invite ${bcName(target)} to ${kind==='room'?`room ${invitation.label}`:kind==='group'?`group ${invitation.label}`:'chat'}?`))return;
    if(pawSend(target,'KCPawInvite',{v:1,type:'KCPawInvite',invitation})){
      notice('✉ Invitation sent. Your friend needs PawLounge to accept.');
      queueVisiblePrivateChatSync(target);
    } else notice('Could not send invitation.');
  }
  function receivePawInvite(data,from){
    if(!myFriends().includes(from))return;
    let p;try{p=pawParseWireJSON(String(data.Message||''),15000);}catch{return;}
    if(p?.type!=='KCPawInvite'||p.v!==1)return;
    if(!integrityAcceptEvent('invite',from,p,integrityMsgId(p.invitation?.id)?p.invitation.id:''))return;
    const i=normalizeInvitation({...p.invitation,from});if(!i||state.invitations.some(x=>x.id===i.id))return;
    state.invitations.push(i);state.invitations=state.invitations.slice(-70);saveSoon();
    notice(`✉ ${bcName(from)} sent a PawLounge invitation.`);
    if(state.open&&state.tab==='catchup')renderCatchUp();
  }
  function answerPawInvite(id,accept,batch=false){
    const inv=state.invitations.find(i=>i.id===id&&i.status==='pending');if(!inv)return false;
    // Never switch multiple BC rooms via a bulk action; and never claim an
    // unavailable group invitation was accepted when there is no Group Den.
    if(batch&&accept&&inv.type==='room')return false;
    if(batch&&accept&&inv.type==='group'&&!state.groups[inv.groupId])return false;
    inv.status=accept?'accepted':'declined';saveSoon();
    if(accept){
      if(inv.type==='chat'){if(batch)ensure(inv.from);else selectChat(inv.from);}
      else if(inv.type==='room'&&inv.room)joinRoomFromRadar(inv.room); // Existing explicit confirmation remains mandatory.
      else if(inv.type==='group'){
        const group=state.groups[inv.groupId];
        if(group){if(!group.joined)respondGroup(group.id,true,batch);else if(!batch)selectGroup(group.id);}
        else notice('A Group Den invitation from the creator is required before joining.');
      }
    }
    if(!batch&&state.open&&state.tab==='catchup')renderCatchUp();
    return true;
  }
  function leavePawGuestbook(){
    const target=state.profileModal?.member;
    if(!target||!myFriends().includes(target)||!state.profiles[target]?.pawProfile?.guestbookOpen)return;
    const text=window.prompt(`Leave a private guestbook pawprint for ${bcName(target)} (max 250 characters):`,'You are pawsome ♡');
    if(!text?.trim())return;
    const entry={id:uniquePawId('paw'),from:me(),at:Date.now(),text:trim(text,250)};
    if(pawSend(target,'KCPawGuestbook',{type:'KCPawGuestbook',v:1,entry})){notice('🐾 Guestbook pawprint delivered.');closeProfileModal();}
    else notice('Could not deliver guestbook pawprint.');
  }
  function receivePawGuestbook(data,from){
    if(!myFriends().includes(from)||state.settings.pawGuestbookOpen===false)return;
    let o;try{o=pawParseWireJSON(String(data.Message||''),15000);}catch{return;}
    if(o?.type!=='KCPawGuestbook'||o.v!==1)return;
    if(!integrityAcceptEvent('guestbook',from,o,integrityMsgId(o.entry?.id)?o.entry.id:''))return;
    const e=normalizeGuestEntry({...o.entry,from});if(!e||state.pawGuestbook.some(x=>x.id===e.id))return;
    state.pawGuestbook.push(e);state.pawGuestbook=state.pawGuestbook.slice(-50);saveSoon();notice(`🐾 ${bcName(from)} left a guestbook pawprint.`);
  }
  // Only the owner sets the shared album title. An independent name timestamp
  // prevents older rename packets from reverting newer titles; saved card
  // timestamps must not interfere with renames.
  function acceptAlbumName(album,packet){
    const title=trim(packet?.name,70);
    const changedAt=Number(packet?.nameUpdated);
    if(!title||!Number.isSafeInteger(changedAt)||changedAt<=0||
       changedAt<=Number(album.nameUpdated||0))return false;
    album.name=title;
    album.nameUpdated=changedAt;
    return true;
  }
  function renameSharedAlbum(albumId){
    const album=state.sharedAlbums.find(a=>a.id===albumId&&a.joined&&a.owner===me());
    if(!album)return notice('Only the scrapbook owner can rename it.');
    const answer=window.prompt('Rename shared scrapbook (1–70 characters):',album.name);
    if(answer===null)return;
    const newName=trim(answer,70);
    if(!newName)return notice('Please enter a scrapbook name.');
    if(newName===album.name)return;
    album.name=newName;
    album.nameUpdated=Math.max(Date.now(),Number(album.nameUpdated||0)+1);
    album.updated=Date.now();
    saveNow(true);
    bookRender();
    let failed=0;
    for(const member of album.members){
      if(member===me())continue;
      if(!pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'rename',id:album.id,
           name:album.name,nameUpdated:album.nameUpdated}))failed++;
    }
    notice(`📒 Scrapbook renamed to “${album.name}”.${failed?' Some collaborators could not be sent the new name.':''}`);
  }
  // v0.9.0 social workspace additions. BC friends/beeps remain the transport;
  // all new cross-client packets are bounded, opt-in and authenticated by sender.
  const PAW_COVER_COLORS = Object.freeze({rose:'#663451',plum:'#342342',midnight:'#202038',lavender:'#584b79',forest:'#29493e',gold:'#67513a'});
  const PAW_PAGE_LAYOUTS = Object.freeze(['grid','list','polaroid']);
  const PAW_ROLE_NAMES = Object.freeze(['Member','Organizer','Keeper']);
  const PAW_SECTIONS = ['side-card','side-search','paw-circle-row','kc-inbox-filter-wrap'];
  let pawDragSection = '';
  const validHour = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  function inPawQuietHours(date=new Date()) {
    const a=state.settings.quietStart, b=state.settings.quietEnd;
    if (!state.settings.quietHours || !validHour(a) || !validHour(b) || a===b) return false;
    const now=date.getHours()*60+date.getMinutes();
    const x=Number(a.slice(0,2))*60+Number(a.slice(3));
    const y=Number(b.slice(0,2))*60+Number(b.slice(3));
    return x<y ? now>=x&&now<y : now>=x||now<y;
  }
  function pawNickname() {
    if(!state.selected || currentGroup())return;
    const c=ensure(state.selected);if(!c)return;
    const value=window.prompt('Private nickname for this kitty (leave blank to use BC name):',c.nickname||'');
    if(value===null)return;
    c.nickname=trim(value,70);saveSoon();render();
  }
  function schedulePawMessage() {
    const g=currentGroup(),recipient=g?g.id:state.selected;
    if(!recipient)return notice('Choose a conversation first.');
    if(!g && state.composerMode==='offline')return notice('To schedule an encrypted offline note, use Paw Notes → Schedule for later.');
    const text=window.prompt('Message to send later (only while logged in and connected):',ui.input?.value||'');
    if(text===null)return;
    const content=trim(text,g?MAX_GROUP_TEXT:2000);
    if(!content)return notice('Message cannot be empty.');
    const candidate=new Date(Date.now()+10*60000);
    const suggestion=new Date(candidate.getTime()-candidate.getTimezoneOffset()*60000).toISOString().slice(0,16);
    const when=window.prompt('Local delivery time YYYY-MM-DD HH:MM (up to 30 days ahead). Missed messages expire after 10 minutes:',suggestion.replace('T',' '));
    if(when===null)return;
    if(!/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d$/.test(when))return notice('Enter a date like 2026-11-03 19:30.');
    const due=new Date(when.replace(' ','T')).getTime();
    if(!Number.isFinite(due)||due<Date.now()+10000||due>Date.now()+30*86400000)return notice('Choose a time from 10 seconds to 30 days in the future.');
    if(state.scheduledMessages.length>=80)return notice('Maximum 80 scheduled messages.');
    state.scheduledMessages.push({id:uniquePawId('scheduled'),kind:g?'group':'chat',to:recipient,text:content,mode:state.composerMode==='whisper'?'whisper':'beep',secure:!g&&pawSecureSecrets.has(numeric(recipient)),due,status:'pending'});
    saveNow(true); renderChat();notice(`📅 Message scheduled for ${new Date(due).toLocaleString()}. Keep BC connected.`);
  }
  function cancelPawSchedule(id) {
    const entry=state.scheduledMessages.find(m=>m.id===id&&m.status==='pending');
    if(!entry)return;
    entry.status='cancelled';saveNow(true);renderChat();
  }
  function deliverScheduledMessages() {
    if(!state.myId||me()!==state.myId||typeof window.ServerSend!=='function')return;
    const now=Date.now();
    for(const entry of state.scheduledMessages){
      if(entry.status!=='pending'||entry.due>now)continue;
      if(now-entry.due>10*60000){entry.status='missed';saveNow(true);continue;}
      const g=entry.kind==='group'?state.groups[entry.to]:null;
      if(g&&(!g.joined||!g.accepted.includes(me())))continue;
      if(entry.kind==='chat'&&entry.secure&&!pawSecureSecrets.has(numeric(entry.to)))continue; // Fail closed until re-unlocked or expired.
      if(entry.kind==='chat'&&entry.mode==='whisper'&&!inRoom(numeric(entry.to)))continue;
      if(entry.kind==='chat'&&entry.mode==='beep'&&!myFriends().includes(numeric(entry.to)))continue;
      // Mark intent in durable storage before handing off, so a resumed tick
      // cannot enqueue the same scheduled message twice after a page crash.
      entry.status='sent';entry.sentAt=now;saveNow(true);
      const item=enqueueDelivery(entry.kind,entry.to,entry.text,entry.mode);
      if(!item){entry.status='missed';saveNow(true);continue;}
      if(state.open&&['chats','groups'].includes(state.tab)){
        scheduleSidebarUpdate();
        if((entry.kind==='chat'&&state.tab==='chats'&&state.selected===entry.to)||
           (entry.kind==='group'&&state.tab==='groups'&&state.selectedGroup===entry.to)){
          refreshOutboxPopover(entry.kind,entry.to);
        }
      }
      notice('📅 Scheduled message queued to Outbox.');
    }
    if(state.scheduledMessages.length>100){state.scheduledMessages=state.scheduledMessages.filter(x=>x.status==='pending').concat(state.scheduledMessages.filter(x=>x.status!=='pending').slice(-30));saveSoon();}
  }
  function scheduleMarkup(kind,id) {
    const list=state.scheduledMessages.filter(s=>s.kind===kind&&String(s.to)===String(id)&&s.status==='pending').sort((a,b)=>a.due-b.due);
    // Keep the message log tall: the schedule lives in a small collapsible
    // badge only while pending items exist. A persistent Schedule shortcut
    // is available from the slim Quick Paws strip.
    if(!list.length)return '';
    return `<details class="paw-schedule paw-schedule-collapsed"><summary>📅 ${list.length} scheduled message${list.length===1?'':'s'} <span aria-hidden="true">▾</span></summary><div class="paw-schedule-items">${list.slice(0,8).map(s=>`<div class="paw-schedule-row"><span>${escapeText(new Date(s.due).toLocaleString())} · ${escapeText(s.text.slice(0,55))}</span><button class="secondary" data-paw-cancel-schedule="${escapeText(s.id)}">Cancel</button></div>`).join('')}</div></details>`;
  }
  function pawPrivacyMarkup() {
    const p=state.settings;
    const active=state.circles.filter(c=>c.shareProfile!==false).length;
    return `<section class="paw-privacy"><h3>🔒 Privacy Dashboard</h3>
    <div>Profile: <b>Shared manually only</b> · Guestbook: <b>${p.pawGuestbookOpen?'Open to friends':'Closed'}</b></div>
    <div>Friend status: <b>${p.shareFriendStatus?'Shared to compatible BC friends':'Hidden from friends'}</b></div>
    <div>Typing indicators: <b>${p.typing?'On':'Off'}</b> · Message notifications: <b>${p.notifications?'On':'Off'}</b></div>
    <div>Quiet hours: <b>${p.quietHours?`${escapeText(p.quietStart)}–${escapeText(p.quietEnd)}`:'Off'}</b></div>
    <div>Saved locally: <b>${Object.keys(state.chats).length} chats, ${state.moments.length} moments, ${state.sharedAlbums.length} scrapbooks, ${active} profile-enabled circles</b></div>
    <p class="muted">BC servers deliver beeps/whispers. PawLounge stores cached messages and backups locally; invited collaborators hold their own copies. Hiding this window never changes native BC online status.</p></section>`;
  }
  function pawSidebarSort() {
    const shell=ui.menu?.querySelector('.side-shell');if(!shell)return;
    const order=(Array.isArray(state.settings.sidebarOrder)?state.settings.sidebarOrder:PAW_SECTIONS).filter(s=>PAW_SECTIONS.includes(s));
    const anchor=shell.querySelector('.contacts-scroll');
    if(!anchor)return;
    for(const cls of [...new Set([...order,...PAW_SECTIONS])]){
      const el=shell.querySelector('.'+cls);if(!el)continue;
      el.dataset.pawSection=cls;
      el.draggable=!!state.settings.layoutEdit;
      el.classList.toggle('paw-draggable',!!state.settings.layoutEdit);
      shell.insertBefore(el,anchor);
    }
  }
  function pawDragStart(e) {
    if(!state.settings.layoutEdit)return;
    const section=e.target?.closest?.('[data-paw-section]');if(!section)return;
    pawDragSection=section.dataset.pawSection;
    try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',pawDragSection);}catch{}
  }
  function pawDragOver(e) {if(state.settings.layoutEdit&&pawDragSection&&e.target?.closest?.('[data-paw-section]'))e.preventDefault();}
  function pawDrop(e) {
    if(!state.settings.layoutEdit||!pawDragSection)return;
    const dest=e.target?.closest?.('[data-paw-section]');
    if(!dest||dest.dataset.pawSection===pawDragSection)return;
    e.preventDefault();
    const order=PAW_SECTIONS.filter(s=>ui.menu.querySelector(`[data-paw-section="${s}"]`));
    order.sort((a,b)=>{const els=[...ui.menu.querySelectorAll('[data-paw-section]')];return els.findIndex(el=>el.dataset.pawSection===a)-els.findIndex(el=>el.dataset.pawSection===b);});
    const from=order.indexOf(pawDragSection),to=order.indexOf(dest.dataset.pawSection);
    if(from<0||to<0)return;
    order.splice(from,1);order.splice(to,0,pawDragSection);
    state.settings.sidebarOrder=order;saveSoon();pawSidebarSort();
  }
  function normalizePawCard(c) {
    const base=normalizeMoment(c);if(!base)return null;
    const reactions=c?.reactions&&typeof c.reactions==='object'&&!Array.isArray(c.reactions)?c.reactions:{};
    base.reactions=Object.fromEntries(Object.entries(reactions).filter(([e,v])=>['💗','⭐','🐾'].includes(e)&&Array.isArray(v)).map(([e,v])=>[e,[...new Set(v.map(numeric).filter(Boolean))].slice(0,8)]));
    base.sharedBy=numeric(c?.sharedBy);
    base.importedBy=numeric(c?.importedBy);
    base.pageId=trim(c?.pageId||'',85);base.tags=(Array.isArray(c?.tags)?c.tags:[]).slice(0,8).map(x=>trim(x,24)).filter(Boolean);base.note=trim(c?.note||'',230);base.pos=(c?.pos&&Number.isFinite(Number(c.pos.x))&&Number.isFinite(Number(c.pos.y)))?{x:Math.max(0,Math.min(76,Number(c.pos.x))),y:Math.max(0,Math.min(75,Number(c.pos.y)))}:null;
    base.comments=(Array.isArray(c?.comments)?c.comments:[]).slice(-24).map(x=>({id:trim(x.id,65),from:numeric(x.from),text:trim(x.text,180),at:Number(x.at)||Date.now()})).filter(x=>x.id&&x.from&&x.text);
    return base;
  }
  function pawAlbumBroadcast(a,action,body) {
    for(const member of a.members)if(member!==me())pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,action,id:a.id,...body});
  }
  // --- PawBooks 1.0: bookshelf, scrapbook chapters, permissions & keepsakes ---
  const pawBookUI={query:'',timeline:false,activity:false,selectedPage:'',drag:null};
  function bookRender(){if(!state.open)return;if(state.tab==='pawbooks')renderPawBooks();else if(state.tab==='moments')renderMoments();}
  const bookSyncRuntime={lastRequest:new Map(),lastResponse:new Map()};
  function bookRequestSync(albumId){
    const a=bookLookup(albumId);if(!a||a.owner===me())return notice('You already own the authoritative copy of this PawBook.');
    const key=a.id+':'+me();if(Date.now()-(bookSyncRuntime.lastRequest.get(key)?.at||0)<60000)return notice('Please wait before requesting another sync.');
    const token=integrityNonce();
    bookSyncRuntime.lastRequest.set(key,{at:Date.now(),token});
    if(!pawSend(a.owner,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'book-sync-request',id:a.id,requestToken:token}))return notice('Could not request updates from the scrapbook owner.');
    notice('📚 Requested missing pages and memories. The owner must be online.');
  }
  function bookServeSync(a,member,token){
    if(typeof token!=='string'||!integrityMsgId(token))return;
    const key=a.id+':'+member;
    if(Date.now()-(bookSyncRuntime.lastResponse.get(key)||0)<60000)return;
    bookSyncRuntime.lastResponse.set(key,Date.now());
    // Send page and memory records separately to stay below BC transport limits.
    // Avoid leaking personal private pages, which are not in the shared album.
    const messages=[
      {action:'book-metadata',id:a.id,name:a.name,nameUpdated:a.nameUpdated,owner:a.owner,
        members:a.members,coverColor:a.coverColor,coverImage:a.coverImage,coverFrame:a.coverFrame,coverAt:a.coverAt,
        linkedGroup:a.linkedGroup,bookRoles:a.bookRoles,bookUpdated:a.bookUpdated},
      ...a.bookPages.map(page=>({action:'book-sync-page',id:a.id,page,bookUpdated:a.bookUpdated})),
      ...a.cards.map(card=>({action:'book-sync-card',id:a.id,card}))
    ];
    let index=0;const sendNext=()=>{
      if(!state.myId||me()!==a.owner||!a.members.includes(member)||index>=messages.length)return;
      for(let k=0;k<2&&index<messages.length;k++){
        const item=messages[index++];
        pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,...item,requestToken:token});
      }
      if(index<messages.length)setTimeout(sendNext,1000);
    };
    sendNext();
  }
  function bookSyncAuthorized(a,from,token){
    const r=bookSyncRuntime.lastRequest.get(a.id+':'+me());
    return from===a.owner&&typeof token==='string'&&!!r&&r.token===token&&Date.now()-r.at<90000;
  }
  function bookLookup(id){return state.sharedAlbums.find(a=>a.id===id&&a.joined&&a.members.includes(me()));}
  function bookAccess(a,member=me()){
    if(!a?.members.includes(member))return 'none';
    return member===a.owner?'owner':(a.bookRoles?.[member]||'contributor');
  }
  function bookCanAdd(a,member=me()){return ['owner','editor','contributor'].includes(bookAccess(a,member));}
  function bookCanEdit(a,member=me()){return ['owner','editor'].includes(bookAccess(a,member));}
  function bookPage(a,id){return a.bookPages.find(p=>p.id===id)||(state.privateBookPages[a.id]||[]).find(p=>p.id===id);}
  function bookPrivate(a){return (state.privateBookPages[a.id]||[]).filter(p=>p.private);}
  function bookAllPages(a){return [...a.bookPages,...bookPrivate(a)];}
  function bookPageCards(a,p){return p.private?(p.cards||[]):a.cards.filter(c=>!c.pageId||c.pageId===p.id||(a.bookPages.length===0));}
  function bookPageSealed(p){return Number(p.sealedUntil)>Date.now();}
  function bookAlbumEvent(a,type,detail,broadcast=true){
    const event={id:uniquePawId('evt'),by:me(),type:trim(type,30),detail:trim(detail,110),at:Date.now()};
    a.bookEvents=[...(a.bookEvents||[]),event].slice(-60);
    if(broadcast)pawAlbumBroadcast(a,'book-event',{event});
    return event;
  }
  function bookStore(action,detail=''){if(pawBookVault.active&&!pawBookVault.locked)bookVaultQueueSave();saveSoon();bookRender();if(detail)notice(detail);}
  function bookSyncPage(a,p,act='book-page'){
    if(!p.private)pawAlbumBroadcast(a,act,{page:p,bookUpdated:a.bookUpdated});
  }
  function bookTouch(a){a.updated=Date.now();a.bookUpdated=Math.max(Date.now(),(a.bookUpdated||0)+1);}
  function bookCreatePage(id){
    const a=bookLookup(id);if(!a)return;
    const title=window.prompt('New scrapbook page or chapter title (max 60 characters):','A little adventure ♡');if(title===null||!trim(title,60))return;
    const privatePage=window.confirm('Make this a PRIVATE page visible only on your device?\nOK = private; Cancel = shared with collaborators.');
    if(!privatePage&&!bookCanEdit(a))return notice('Only editors and the owner can create shared chapters.');
    const list=privatePage?(state.privateBookPages[a.id]||=[]):a.bookPages;
    if(list.length>=24)return notice('Page limit reached (24).');
    const p={id:uniquePawId('page'),title:trim(title,60),caption:'',background:'rose',layout:'polaroid',sealedUntil:0,updated:Date.now(),private:privatePage};
    if(privatePage)p.cards=[];
    list.push(p);bookTouch(a);
    if(!privatePage){bookSyncPage(a,p);bookAlbumEvent(a,'page',`Created “${p.title}”`);}
    pawBookUI.selectedPage=p.id;bookStore('page','📖 Page created.');
  }
  function bookEditPage(albumId,pageId){
    const a=bookLookup(albumId),p=a&&bookPage(a,pageId);if(!p)return;
    if(!p.private&&!bookCanEdit(a))return notice('Only scrapbook editors can customize shared pages.');
    const title=window.prompt('Page title:',p.title);if(title===null||!trim(title,60))return;
    const caption=window.prompt('Page introduction / caption (max 250 characters):',p.caption||'');if(caption===null)return;
    const bg=window.prompt('Background: rose, plum, midnight, lavender, forest, gold',p.background);if(bg===null)return;
    if(!Object.hasOwn(PAW_COVER_COLORS,bg))return notice('Invalid page color.');
    const layout=window.prompt('Arrangement: grid / list / polaroid / collage',p.layout);if(layout===null)return;
    if(!['grid','list','polaroid','collage'].includes(layout))return notice('Invalid layout.');
    Object.assign(p,{title:trim(title,60),caption:trim(caption,250),background:bg,layout,updated:Math.max(Date.now(),(p.updated||0)+1)});
    bookTouch(a);if(!p.private){bookSyncPage(a,p);bookAlbumEvent(a,'page',`Edited “${p.title}”`);}
    bookStore('edit','📖 Page updated.');
  }
  function bookSealPage(albumId,pageId){
    const a=bookLookup(albumId),p=a&&bookPage(a,pageId);if(!p||(!p.private&&!bookCanEdit(a)))return;
    const old=p.sealedUntil?new Date(p.sealedUntil).toISOString().slice(0,16):'';
    const answer=window.prompt('Open date and time, YYYY-MM-DDTHH:MM (blank to unseal). Not cryptographically sealed:',old);if(answer===null)return;
    const t=answer.trim()?new Date(answer).getTime():0;
    if(answer.trim()&&(!Number.isFinite(t)||t<=Date.now()||t>4102444800000))return notice('Choose a valid future date before 2100.');
    p.sealedUntil=t;p.updated=Math.max(Date.now(),(p.updated||0)+1);bookTouch(a);
    if(!p.private){bookSyncPage(a,p);bookAlbumEvent(a,'seal',t?'Sealed a time capsule':'Opened a time capsule');}
    bookStore('seal',t?'🎁 Time capsule set.':'📖 Page unsealed.');
  }
  function bookAddNote(albumId,pageId){
    const a=bookLookup(albumId),p=a&&bookPage(a,pageId);if(!p||(!p.private&&!bookCanAdd(a))||bookPageSealed(p))return;
    const title=window.prompt('Memory title:', 'A sweet little memory ♡');if(title===null||!trim(title,65))return;
    const text=window.prompt('Write a note (max 380 characters):','');if(text===null||!trim(text,380))return;
    const c=normalizePawCard({id:uniquePawId('moment'),title,text,from:me(),sharedBy:me(),source:'PawBooks',at:Date.now(),pageId:p.id,decoration:'🐾'});
    if(!c)return;
    if(p.private){if(p.cards.length>=60)return notice('Private page is full.');p.cards.push(c);}
    else{
      if(a.cards.length>=60)return notice('Book memory limit reached (60 shared memories).');
      a.cards.push(c);pawAlbumBroadcast(a,'card',{card:c});bookAlbumEvent(a,'memory',`Added “${c.title}”`);
    }
    bookTouch(a);bookStore('card','♡ Memory added.');
  }
  function bookAddSnapshot(albumId,pageId){
    const a=bookLookup(albumId),p=a&&bookPage(a,pageId);if(!p||(!p.private&&!bookCanAdd(a))||bookPageSealed(p))return;
    if(!window.confirm('Character snapshots require the pictured person’s permission. Have you obtained permission to save and share this picture?'))return;
    const title=window.prompt('Snapshot caption / title:', 'Outfit memory ♡');if(title===null)return;
    const img=window.prompt('Paste an HTTPS URL for the consented image (no automatic BC capture):','');if(img===null||!safeImg(img))return notice('An HTTPS image URL is required.');
    const text=window.prompt('Optional description:', 'A memorable look ♡');if(text===null)return;
    const c=normalizePawCard({id:uniquePawId('moment'),title:trim(title,65)||'Character snapshot',text:trim(text,380)||'A special portrait ♡',image:safeImg(img),from:me(),sharedBy:me(),source:'Consented snapshot',at:Date.now(),pageId:p.id});
    if(p.private){(p.cards||=[]).push(c);p.cards=p.cards.slice(-60);}
    else{if(a.cards.length>=60)return notice('Book is full.');a.cards.push(c);pawAlbumBroadcast(a,'card',{card:c});bookAlbumEvent(a,'snapshot','Added a character snapshot');}
    bookTouch(a);bookStore('snapshot','📸 Snapshot saved.');
  }
  function bookAddFromConversation(mid){
    const kind=currentConversationKind(),conversation=kind==='group'?state.selectedGroup:state.selected;
    const m=lookupMessage(kind,conversation,mid);if(!m)return;
    if(m.from!==me()&&!window.confirm('This message belongs to another player. Confirm you have their explicit permission to share it in this scrapbook. Cancel to keep it private.'))return;
    return bookChooseAndAdd({id:uniquePawId('moment'),title:`Message from ${name(m.from)}`,text:trim(m.text,380),from:m.from,source:kind==='group'?currentGroup()?.name:name(conversation),at:m.time,decoration:'♡',sharedBy:me()},true);
  }
  function bookChooseAndAdd(moment,quoted=false){
    const books=state.sharedAlbums.filter(a=>a.joined&&bookCanAdd(a));if(!books.length)return notice('Create or join a PawBook first.');
    const selection=window.prompt('Choose PawBook number:\n'+books.map((a,i)=>`${i+1}. ${a.name}`).join('\n'),'1');if(selection===null)return;
    const a=books[Number(selection)-1];if(!a)return;
    const pages=bookAllPages(a).filter(p=>p.private||bookCanAdd(a));
    const answer=window.prompt('Choose page number, or 0 for the book’s default page:\n0. Unsorted memories\n'+pages.map((p,i)=>`${i+1}. ${p.title}${p.private?' (private)':''}`).join('\n'),'0');if(answer===null)return;
    const n=Number(answer),p=n>0?pages[n-1]:null;
    if(n>0&&!p)return notice('Invalid page.');
    if(p&&bookPageSealed(p))return notice('That time capsule is sealed.');
    const c=normalizePawCard({...moment,id:uniquePawId('moment'),pageId:p?.id||'',sharedBy:me()});if(!c)return;
    if(p?.private){(p.cards||=[]).push(c);p.cards=p.cards.slice(-60);}
    else{if(a.cards.length>=60)return notice('Book is full.');a.cards.push(c);pawAlbumBroadcast(a,'card',{card:c});bookAlbumEvent(a,quoted?'quote':'memory',`Added “${c.title}”`);}
    state.albumView=a.id;pawBookUI.selectedPage=p?.id||'';bookTouch(a);bookStore('memory','📖 Saved to PawBooks.');
  }
  function bookTagMemory(albumId,cardId){
    const a=bookLookup(albumId);if(!a)return;
    const all=[...a.cards,...bookPrivate(a).flatMap(p=>p.cards||[])],c=all.find(x=>x.id===cardId);
    if(!c)return;
    const privateCard=!a.cards.includes(c);
    if(!privateCard&&!bookCanEdit(a)&&c.sharedBy!==me())return notice('Only editors or the original contributor can annotate this memory.');
    const tags=window.prompt('Tags separated by commas (up to 8):',(c.tags||[]).join(', '));if(tags===null)return;
    const note=window.prompt('Decorative caption / annotation:',c.note||'');if(note===null)return;
    c.tags=tags.split(',').map(x=>trim(x,24)).filter(Boolean).slice(0,8);c.note=trim(note,230);bookTouch(a);
    if(!privateCard){pawAlbumBroadcast(a,'book-card-meta',{cardId:c.id,tags:c.tags,note:c.note});bookAlbumEvent(a,'caption',`Annotated “${c.title}”`);}
    bookStore('annotation','🎀 Annotation saved.');
  }
  function bookRoleChange(albumId,member){
    const a=bookLookup(albumId);if(!a||a.owner!==me()||!a.members.includes(member)||member===me())return;
    const answer=window.prompt(`Role for ${bcName(member)}: viewer / contributor / editor`,bookAccess(a,member));if(answer===null)return;
    const role=answer.trim().toLowerCase();if(!['viewer','contributor','editor'].includes(role))return notice('Invalid role.');
    a.bookRoles[member]=role;bookTouch(a);
    pawAlbumBroadcast(a,'book-role',{member,role,bookUpdated:a.bookUpdated});bookAlbumEvent(a,'role',`Changed a collaborator to ${role}`);
    bookStore('role','✓ Collaborator permissions updated.');
  }
  function bookGroupLink(albumId){
    const a=bookLookup(albumId);if(!a||a.owner!==me())return;
    const choices=Object.values(state.groups).filter(g=>g.joined&&g.accepted.includes(me()));
    const input=window.prompt('Link to Group Den number (0 = unlink). Group members are NOT invited automatically:\n0. None\n'+choices.map((g,i)=>`${i+1}. ${g.name}`).join('\n'),'0');if(input===null)return;
    const id=Number(input)>0?choices[Number(input)-1]?.id||'':Number(input)===0?'':null;
    if(id===null)return notice('Invalid group.');
    a.linkedGroup=id;bookTouch(a);pawAlbumBroadcast(a,'book-link',{linkedGroup:id,bookUpdated:a.bookUpdated});
    bookAlbumEvent(a,'group',id?'Linked a Group Den':'Unlinked Group Den');bookStore('link','🏡 Group association updated.');
  }
  function bookCardMove(albumId,pageId,cardId,x,y){
    const a=bookLookup(albumId),p=a&&bookPage(a,pageId);if(!p||p.layout!=='collage'||(!p.private&&!bookCanEdit(a)))return;
    const c=bookPageCards(a,p).find(x=>x.id===cardId);if(!c)return;
    const position={x:Math.round(Math.max(0,Math.min(76,x))),y:Math.round(Math.max(0,Math.min(75,y)))};
    c.pos=position;bookTouch(a);
    if(!p.private)pawAlbumBroadcast(a,'book-position',{cardId:c.id,pageId:p.id,pos:position});
    saveSoon();
  }
  function bookPointerStart(e){
    if(e.target?.closest?.('button,input,textarea,a,select'))return;
    const target=e.target?.closest?.('[data-book-drag-card]');if(!target||e.button!==0)return;
    const a=bookLookup(target.dataset.bookDragAlbum),p=a&&bookPage(a,target.dataset.bookDragPage);
    if(!p||p.layout!=='collage'||(!p.private&&!bookCanEdit(a)))return;
    const surface=target.closest('.pawbook-canvas');if(!surface)return;
    e.preventDefault();e.stopPropagation();
    pawBookUI.drag={target,surface,id:a.id,pageId:p.id,cardId:target.dataset.bookDragCard,oldX:e.clientX,oldY:e.clientY,x:parseFloat(target.style.left)||0,y:parseFloat(target.style.top)||0};
    try{target.setPointerCapture(e.pointerId);}catch{}
  }
  function bookPointerMove(e){
    const d=pawBookUI.drag;if(!d)return;
    e.stopPropagation();const r=d.surface.getBoundingClientRect();
    const x=Math.max(0,Math.min(76,d.x+(e.clientX-d.oldX)/Math.max(1,r.width)*100));
    const y=Math.max(0,Math.min(75,d.y+(e.clientY-d.oldY)/Math.max(1,r.height)*100));
    d.target.style.left=x+'%';d.target.style.top=y+'%';
  }
  function bookPointerEnd(e){
    const d=pawBookUI.drag;if(!d)return;pawBookUI.drag=null;
    bookCardMove(d.id,d.pageId,d.cardId,parseFloat(d.target.style.left),parseFloat(d.target.style.top));
  }
  function bookPageRow(a,p){
    const mine=p.private,canEdit=mine||bookCanEdit(a),canAdd=bookCanAdd(a);
    const cards=bookPageCards(a,p),sealed=bookPageSealed(p);
    const pageTitle=`${mine?'🔒 ':'📖 '}${escapeText(p.title)}`;
    const body=sealed?`<div class="pawbook-seal"><span>🎁</span><strong>Memory time capsule</strong><p>Opens ${new Date(p.sealedUntil).toLocaleString()}</p><small>Visible content is hidden by the UI, not encrypted.</small></div>`:
      `<div class="pawbook-canvas pawbook-layout-${escapeText(p.layout)}">${cards.map((c,i)=>bookCardMarkup(a,p,c,i)).join('')||'<p class="muted">A blank page ready for new memories.</p>'}</div>`;
    return `<section class="pawbook-chapter" data-pawbook-page-id="${escapeText(p.id)}"><div class="pawbook-chapter-head"><span>${pageTitle}</span><span class="muted">${cards.length} memories</span></div>
      ${p.caption?`<p class="pawbook-page-caption">${escapeText(p.caption)}</p>`:''}
      ${body}<div class="pawbook-tools">${canAdd&&!sealed?`<button class="secondary" data-book-note="${escapeText(a.id)}|${escapeText(p.id)}">＋ Note</button><button class="secondary" data-book-snapshot="${escapeText(a.id)}|${escapeText(p.id)}">📸 Snapshot</button>`:''}
      ${canEdit?`<button class="secondary" data-book-edit="${escapeText(a.id)}|${escapeText(p.id)}">🎨 Edit page</button><button class="secondary" data-book-seal="${escapeText(a.id)}|${escapeText(p.id)}">${sealed?'⏳ Change opening':'🎁 Time capsule'}</button>`:''}</div></section>`;
  }
  function bookCardMarkup(a,p,c,i){
    const pos=c.pos||{x:(i%4)*24,y:Math.floor(i/4)*28};const x=Math.max(0,Math.min(76,Number(pos.x)||0)),y=Math.max(0,Math.min(75,Number(pos.y)||0));
    const collage=p.layout==='collage';
    return `<article class="pawbook-memory" ${collage?`style="left:${x}%;top:${y}%;" data-book-drag-card="${escapeText(c.id)}" data-book-drag-album="${escapeText(a.id)}" data-book-drag-page="${escapeText(p.id)}"`:''}>
      <div class="pawbook-memory-title">${escapeText(c.decoration||'🐾')} ${escapeText(c.title)}</div>
      ${c.image?`<img src="${escapeText(c.image)}" loading="lazy" alt="Consented memory image"/>`:''}<p>${escapeText(c.text)}</p>
      ${c.note?`<div class="pawbook-memo">🎀 ${escapeText(c.note)}</div>`:''}
      ${(c.tags||[]).length?`<div class="pawbook-tags">${c.tags.map(t=>`<span>#${escapeText(t)}</span>`).join('')}</div>`:''}
      <small>${escapeText(name(c.sharedBy||c.from))} · ${new Date(c.at).toLocaleDateString()}</small>
      <div class="pawbook-tools">${!p.private?`<button class="secondary" data-paw-card-react="${escapeText(a.id)}|${escapeText(c.id)}|💗">💗 ${c.reactions?.['💗']?.length||0}</button><button class="secondary" data-paw-card-react="${escapeText(a.id)}|${escapeText(c.id)}|⭐">⭐ ${c.reactions?.['⭐']?.length||0}</button><button class="secondary" data-paw-card-react="${escapeText(a.id)}|${escapeText(c.id)}|🐾">🐾 ${c.reactions?.['🐾']?.length||0}</button><button class="secondary" data-paw-card-comment="${escapeText(a.id)}|${escapeText(c.id)}">💬 ${c.comments?.length||0}</button>`:''}
      ${(p.private||bookCanEdit(a)||c.sharedBy===me())?`<button class="secondary" data-book-tag="${escapeText(a.id)}|${escapeText(c.id)}">✎</button>`:''}</div>
      ${(c.comments||[]).slice(-3).map(m=>`<p class="pawbook-comment"><b>${escapeText(name(m.from))}:</b> ${escapeText(m.text)}</p>`).join('')}</article>`;
  }
  function bookUnsorted(a){
    return a.cards.filter(c=>!c.pageId||!a.bookPages.some(p=>p.id===c.pageId));
  }
  function bookGiftPage(id){
    const a=bookLookup(id);if(!a||!bookCanEdit(a))return notice('Only editors can prepare a shared memory gift.');
    const title=window.prompt('Gift page title:', 'A surprise just for you ♡');if(title===null||!trim(title,60))return;
    const note=window.prompt('Gift message (max 380 characters):','A little gift made of memories ♡');if(note===null||!trim(note,380))return;
    const date=window.prompt('Opening date: YYYY-MM-DDTHH:MM (blank for immediately):','');if(date===null)return;
    const time=date.trim()?new Date(date).getTime():0;
    if(date.trim()&&(!Number.isFinite(time)||time<=Date.now()||time>4102444800000))return notice('Invalid future opening date.');
    if(a.bookPages.length>=24||a.cards.length>=60)return notice('PawBook is at its page or memory limit.');
    const p={id:uniquePawId('page'),title:trim(title,60),caption:'🎁 A friendship keepsake',background:'rose',layout:'polaroid',sealedUntil:time,updated:Date.now(),private:false};
    const c=normalizePawCard({id:uniquePawId('moment'),title:trim(title,65),text:trim(note,380),from:me(),sharedBy:me(),source:'Memory Gift',at:Date.now(),pageId:p.id,decoration:'🎀'});
    a.bookPages.push(p);a.cards.push(c);bookTouch(a);
    bookSyncPage(a,p);pawAlbumBroadcast(a,'card',{card:c});bookAlbumEvent(a,'gift',`Prepared “${p.title}”`);
    bookStore('gift','🎁 Memory gift added!');
  }
  function bookKeepsake(id){
    const a=bookLookup(id);if(!a)return;
    const includePrivate=bookPrivate(a).length&&window.confirm('Include your LOCAL PRIVATE pages in this personal export? This file will contain their text and image URLs.');
    const pages=[...a.bookPages,...(includePrivate?bookPrivate(a):[])];
    const chunks=pages.map(p=>`<section class="page"><h2>${escapeText(p.title)} ${p.private?'(Private)':''}</h2><p>${escapeText(p.caption)}</p>${bookPageSealed(p)?'<p>Time capsule — not yet open.</p>':bookPageCards(a,p).map(c=>`<article><h3>${escapeText(c.title)}</h3>${c.image?`<img src="${escapeText(c.image)}" alt="Snapshot"/>`:''}<p>${escapeText(c.text)}</p><small>${escapeText(name(c.from))} · ${new Date(c.at).toLocaleDateString()}</small></article>`).join('')}</section>`).join('');
    const unsorted=bookUnsorted(a).map(c=>`<article><h3>${escapeText(c.title)}</h3><p>${escapeText(c.text)}</p></article>`).join('');
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeText(a.name)} - PawBook</title><style>body{font-family:Georgia,serif;color:#3c243a;max-width:850px;margin:40px auto;line-height:1.6}h1,h2{color:#873d71}header,.page{padding:30px;break-after:page}article{border:1px solid #e8b9d3;border-radius:12px;margin:16px 0;padding:15px;break-inside:avoid}img{max-width:100%;max-height:400px;object-fit:contain}@media print{body{margin:0}.page{break-after:page}}</style></head><body><header><h1>📚 ${escapeText(a.name)}</h1><p>${a.cards.length} memories · ${a.members.length} collaborators</p><p>From PawLounge · Print this page → Save as PDF</p></header>${chunks}${unsorted?`<section class="page"><h2>Unsorted memories</h2>${unsorted}</section>`:''}</body></html>`;
    download('PawBook-'+a.name.replace(/[^a-z0-9_-]/gi,'_').slice(0,45)+'.html','text/html;charset=utf-8',html);
    notice('📖 Printable keepsake exported. Open the HTML file in Firefox and Print → Save as PDF.');
  }
  function renderPawBooks(){
    if(pawBookVault.active&&pawBookVault.locked){
      ui.body.innerHTML=`<div class="screen pawbooks-screen"><div class="pawbook-heading"><h2>🔐 PawBooks are locked</h2></div><p>Saved books and private pages are protected by your password on this device. Enter it to open the bookshelf.</p>${bookVaultControls()}<p class="muted">Your password is never saved. Incoming scrapbook updates cannot be processed while locked.</p></div>`;
      return;
    }
    const joined=state.sharedAlbums.filter(a=>a.joined),pending=state.sharedAlbums.filter(a=>!a.joined);
    const q=pawBookUI.query.toLocaleLowerCase(),list=joined.filter(a=>!q||a.name.toLowerCase().includes(q)||a.cards.some(c=>[c.title,c.text,...(c.tags||[])].some(v=>String(v).toLowerCase().includes(q))));
    const a=bookLookup(state.albumView);if(a){
      const pages=bookAllPages(a),group=state.groups[a.linkedGroup];
      const sorted=pawBookUI.timeline?a.cards.slice().sort((x,y)=>(x.at||0)-(y.at||0)):[];
      ui.body.innerHTML=`<div class="screen pawbooks-screen"><div class="pawbook-heading"><button class="secondary" data-action="bookback">← Bookshelf</button><h2>📚 ${escapeText(a.name)}</h2><span>${a.members.length} collaborators</span></div>
        <div class="pawbook-toolbar">${a.owner===me()?`<button class="secondary" data-paw-album-rename="${escapeText(a.id)}">✎ Rename</button><button class="secondary" data-paw-cover="${escapeText(a.id)}">🎨 Cover</button><button class="secondary" data-book-group="${escapeText(a.id)}">🏡 Link Group</button><button class="secondary" data-paw-album-invite="${escapeText(a.id)}">✉ Invite</button>`:''}
          <button class="primary" data-book-new-page="${escapeText(a.id)}">＋ New Page</button><button class="secondary" data-book-export="${escapeText(a.id)}">📖 Keepsake</button>${bookVaultControls()}${a.owner!==me()?`<button class="secondary" data-book-sync="${escapeText(a.id)}">↻ Sync from owner</button>`:''}<button class="secondary" data-book-gift="${escapeText(a.id)}">🎁 Memory gift</button><button class="secondary" data-book-activity="${escapeText(a.id)}">🕒 Activity</button><button class="secondary" data-book-timeline="${escapeText(a.id)}">📜 Chronicle</button>
          <button class="secondary" data-paw-album-leave="${escapeText(a.id)}">↩ Leave</button></div>
        <div class="pawbook-cover-hero">${pawCoverMarkup(a)}<div><strong>${escapeText(a.name)}</strong><p>${a.cards.length} memories · ${pages.length} pages</p><p>${group?`Linked Den: ${escapeText(group.name)}`:a.linkedGroup?'Linked Group Den':'A cozy collection of moments'}</p>
          <div class="pawbook-memberlist">${a.members.map(m=>`<span>${escapeText(name(m))}${m===a.owner?' 👑':''} ${m!==a.owner?`<small>${escapeText(bookAccess(a,m))}</small>`:''} ${a.owner===me()&&m!==me()?`<button class="secondary" data-book-role="${escapeText(a.id)}|${m}">Change role</button>`:''}</span>`).join('')}</div></div></div>
        ${pawBookUI.activity?`<section class="pawbook-activity"><h3>🕒 Contribution history</h3>${(a.bookEvents||[]).slice(-30).reverse().map(e=>`<div><small>${new Date(e.at).toLocaleString()}</small> · <b>${escapeText(name(e.by))}</b>: ${escapeText(e.detail)}</div>`).join('')||'<p class="muted">No logged contributions yet.</p>'}</section>`:''}
        ${pawBookUI.timeline?`<section class="pawbook-chronicle"><h3>📜 Friendship Chronicle</h3>${sorted.map(c=>`<div><b>${new Date(c.at).toLocaleDateString()}</b> · ${escapeText(c.title)} <small>${escapeText(c.text.slice(0,140))}</small></div>`).join('')||'<p class="muted">Save memories to begin your timeline.</p>'}</section>`:''}
        <div class="pawbook-pages">${pages.map(p=>bookPageRow(a,p)).join('')}${bookUnsorted(a).length?`<section class="pawbook-chapter"><h3>📜 Unsorted memories</h3><div class="pawbook-canvas pawbook-layout-grid">${bookUnsorted(a).map((c,i)=>bookCardMarkup(a,{id:'',layout:'grid',private:false},c,i)).join('')}</div></section>`:''}
        ${!pages.length&&!a.cards.length?'<div class="pawbook-empty">📖 A new story begins. Add your first page to start collecting memories.</div>':''}</div></div>`;
      return;
    }
    ui.body.innerHTML=`<div class="screen pawbooks-screen"><div class="pawbook-heading"><h2>📚 PawBooks · My Bookshelf</h2><button class="primary" data-action="newalbum">＋ New PawBook</button>${bookVaultControls()}</div>
      <p class="muted">Your shared stories live here. Existing scrapbooks are preserved and now support chapters, covers, private pages, collaborative comments and keepsake exports.</p>
      <div class="pawbook-toolbar"><input class="field" id="pawbook-search" type="search" value="${escapeText(pawBookUI.query)}" placeholder="Search books and memories…"/></div>
      ${pending.map(p=>`<div class="pawbook-invite"><b>${escapeText(p.name)}</b> · Invitation from ${escapeText(name(p.owner))}<button class="primary" data-paw-album-accept="${escapeText(p.id)}">Accept</button><button class="secondary" data-paw-album-decline="${escapeText(p.id)}">Decline</button></div>`).join('')}
      <div class="pawbook-shelf">${list.map(a=>`<button type="button" class="pawbook-shelf-card" data-paw-album="${escapeText(a.id)}">${pawCoverMarkup(a)}<strong>${escapeText(a.name)}</strong><small>${a.cards.length} memories · ${a.members.length} members · ${a.bookPages.length} chapters</small></button>`).join('')||'<div class="pawbook-empty">No matching books yet. Create one to begin your shared story ♡</div>'}</div>
      <div class="pawbook-bottom"><button class="secondary" data-action="pawbooksmoments">♡ Private Memories</button></div></div>`;
  }
  function bookHandlePacket(a,p,from){
    const act=p.action,owned=from===a.owner,editor=bookCanEdit(a,from),member=a.members.includes(from);
    if(!a.joined||!member)return false;
    if(act==='book-role'){
      if(!owned||!Number.isSafeInteger(Number(p.bookUpdated))||Number(p.bookUpdated)<=Number(a.bookUpdated||0))return false;
      const n=numeric(p.member),role=p.role;if(!owned||!a.members.includes(n)||n===a.owner||!['viewer','contributor','editor'].includes(role))return false;
      a.bookRoles[n]=role;a.bookUpdated=Number(p.bookUpdated);
    }else if(act==='book-link'){
      if(!owned||!Number.isSafeInteger(Number(p.bookUpdated))||Number(p.bookUpdated)<=Number(a.bookUpdated||0))return false;
      if(!owned||p.linkedGroup&&(!/^g_[\w-]{8,44}$/.test(p.linkedGroup)))return false;
      a.linkedGroup=trim(p.linkedGroup||'',65);a.bookUpdated=Number(p.bookUpdated);
    }else if(act==='book-page'){
      const raw=normalizeBookPage(p.page);if(!raw||raw.private||!editor)return false;
      const old=a.bookPages.find(x=>x.id===raw.id);
      if(old&&raw.updated<=old.updated)return false;
      if(!old&&a.bookPages.length>=24)return false;
      if(old)Object.assign(old,raw);else a.bookPages.push(raw);
    }else if(act==='book-position'){
      const card=a.cards.find(c=>c.id===p.cardId),page=a.bookPages.find(c=>c.id===p.pageId),pos=p.pos;
      if(!card||!page||!editor||page.layout!=='collage'||card.pageId!==page.id||!Number.isFinite(pos?.x)||!Number.isFinite(pos?.y)||pos.x<0||pos.x>76||pos.y<0||pos.y>75)return false;
      card.pos={x:pos.x,y:pos.y};
    }else if(act==='book-card-meta'){
      const card=a.cards.find(c=>c.id===p.cardId);if(!card||!(editor||card.sharedBy===from)||!Array.isArray(p.tags)||p.tags.length>8)return false;
      card.tags=p.tags.map(x=>trim(x,24)).filter(Boolean);card.note=trim(p.note||'',230);
    }else if(act==='book-event'){
      const e=normalizeBookEvents([p.event])[0];if(!e||e.by!==from||a.bookEvents.some(x=>x.id===e.id))return false;
      a.bookEvents.push(e);a.bookEvents=a.bookEvents.slice(-60);
    }else return false;
    a.updated=Date.now();return true;
  }

  function customizePawCover(albumId) {
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.owner===me()&&x.joined);if(!a)return;
    const tone=window.prompt('Cover color: rose / plum / midnight / lavender / forest / gold',a.coverColor||'rose');
    if(tone===null)return;
    if(!Object.hasOwn(PAW_COVER_COLORS,tone))return notice('Choose one of the listed cover colors.');
    const image=window.prompt('Optional cover image HTTPS URL (leave blank for color only):',a.coverImage||'');
    if(image===null)return;
    if(trim(image,500)&&!/^https:\/\/[^\s]+$/i.test(trim(image,500)))return notice('Cover picture must be an HTTPS URL.');
    const frame=window.prompt('Cover frame: classic / polaroid / floral',a.coverFrame||'classic');
    if(frame===null)return;
    if(!['classic','polaroid','floral'].includes(frame))return notice('Choose classic, polaroid or floral.');
    Object.assign(a,{coverColor:tone,coverImage:trim(image,500),coverFrame:frame,coverAt:Date.now(),updated:Date.now()});
    pawAlbumBroadcast(a,'cover',{owner:a.owner,coverColor:a.coverColor,coverImage:a.coverImage,coverFrame:a.coverFrame,coverAt:a.coverAt});
    saveSoon();bookRender();
  }
  function changePawPageLayout(albumId) {
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined&&x.owner===me());if(!a)return;
    const style=window.prompt('Memory page layout: grid / list / polaroid',a.pageLayout||'grid');
    if(style===null)return;
    if(!PAW_PAGE_LAYOUTS.includes(style))return notice('Choose grid, list or polaroid.');
    a.pageLayout=style;a.updated=Date.now();a.pageAt=Date.now();
    pawAlbumBroadcast(a,'layout',{owner:a.owner,layout:style,pageAt:a.pageAt,cardIds:a.cards.map(c=>c.id)});
    saveSoon();bookRender();
  }
  function movePawCard(albumId,cardId,delta) {
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined&&x.owner===me());if(!a)return;
    const index=a.cards.findIndex(c=>c.id===cardId),next=index+delta;
    if(index<0||next<0||next>=a.cards.length)return;
    [a.cards[index],a.cards[next]]=[a.cards[next],a.cards[index]];
    a.updated=Date.now();a.pageAt=Math.max(Date.now(),(a.pageAt||0)+1);
    pawAlbumBroadcast(a,'layout',{owner:a.owner,layout:a.pageLayout||'grid',pageAt:a.pageAt,cardIds:a.cards.map(c=>c.id)});
    saveSoon();bookRender();
  }
  function reactPawCard(albumId,cardId,emoji) {
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined&&x.members.includes(me()));
    const c=a?.cards.find(x=>x.id===cardId);if(!c||!['💗','⭐','🐾'].includes(emoji))return;
    c.reactions ||= {};const list=c.reactions[emoji] ||= [];
    const remove=list.includes(me());c.reactions[emoji]=remove?list.filter(x=>x!==me()):[...new Set([...list,me()])];
    pawAlbumBroadcast(a,'react',{cardId,emoji,remove});saveSoon();bookRender();
  }
  function commentPawCard(albumId,cardId) {
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined&&x.members.includes(me()));
    const c=a?.cards.find(x=>x.id===cardId);if(!c)return;
    const text=window.prompt('Comment on this memory (max 180 characters):','');
    if(text===null||!trim(text,180))return;
    const comment={id:uniquePawId('reply'),from:me(),text:trim(text,180),at:Date.now()};
    c.comments ||= [];c.comments.push(comment);c.comments=c.comments.slice(-24);
    pawAlbumBroadcast(a,'comment',{cardId,comment});saveSoon();bookRender();
  }
  function pawCoverMarkup(a) {
    const color=PAW_COVER_COLORS[a.coverColor]||PAW_COVER_COLORS.rose;
    const img=a.coverImage&&/^https:\/\/[^\s]+$/i.test(a.coverImage)?`<img src="${escapeText(a.coverImage)}" loading="lazy" referrerpolicy="no-referrer" alt="Scrapbook cover"/>`:'';
    return `<div class="paw-cover paw-cover-${escapeText(a.coverFrame||'classic')}" style="--paw-cover:${color}">${img}<div class="paw-cover-label">📒 ${escapeText(a.name)}</div></div>`;
  }
  function pawCardMarkup(a,c) {
    const reactions=['💗','⭐','🐾'].map(e=>`<button class="secondary" data-paw-card-react="${escapeText(a.id)}|${escapeText(c.id)}|${e}" title="React">${e} ${c.reactions?.[e]?.length||0}</button>`).join('');
    return `<article class="paw-page"><b>${escapeText(c.title)}</b>${c.importedBy?`<div class="muted" title="Historical memory provided by the album owner, not independently verified">⚠ Imported by ${escapeText(bcName(c.importedBy))} · attribution unverified</div>`:''}<p>${escapeText(c.text)}</p>${c.image?`<img src="${escapeText(c.image)}" loading="lazy" referrerpolicy="no-referrer" alt="Scrapbook picture"/>`:''}<div class="paw-memory-actions">${reactions}<button class="secondary" data-paw-card-comment="${escapeText(a.id)}|${escapeText(c.id)}">💬 Comment</button>${a.owner===me()?`<button class="secondary" data-paw-card-move="${escapeText(a.id)}|${escapeText(c.id)}|-1" title="Previous page">←</button><button class="secondary" data-paw-card-move="${escapeText(a.id)}|${escapeText(c.id)}|1" title="Next page">→</button>`:''}</div>
    ${(c.comments||[]).slice(-8).map(m=>`<div class="paw-memory-comment"><b>${escapeText(name(m.from))}:</b> ${escapeText(m.text)}</div>`).join('')}</article>`;
  }
  function pawGroupBroadcast(g,p,summary='PawLounge group update') {
    for(const member of g.accepted)if(member!==me())sendGroupWire(member,{id:g.id,...p},summary,true);
  }
  function pawGroupAnnouncement() {
    const g=currentGroup();if(!g||!g.joined||!(g.creator===me()||g.moderators?.includes(me())||g.roles?.[me()]==='Organizer'))return;
    const text=window.prompt('Pin a group announcement (blank removes it):',g.announcement?.text||'');if(text===null)return;
    const a={text:trim(text,220),from:me(),at:Math.max(Date.now(),Number(g.announcement?.at||0)+1)};
    g.announcement=a;pawGroupBroadcast(g,{t:'announcement',announcement:a},`📌 ${g.name}: ${a.text||'Announcement cleared'}`);saveSoon();renderGroupChat();
  }
  function pawGroupRole(member) {
    const g=currentGroup();if(!g||g.creator!==me()||!g.members.includes(member)||member===me())return;
    const value=window.prompt('Role: Member / Organizer / Keeper (decorative; Moderator remains separate):',g.roles?.[member]||'Member');
    if(value===null)return;
    if(!PAW_ROLE_NAMES.includes(value))return notice('Choose Member, Organizer or Keeper.');
    g.roles ||= {};g.roles[member]=value;syncGroup(g);saveSoon();renderGroupChat();
  }
  function makePawPoll() {
    const g=currentGroup();if(!g?.joined||!g.accepted.includes(me()))return;
    if((g.polls||[]).length>=25)return notice('This group has reached its poll limit.');
    const question=window.prompt('Group poll question (max 130 characters):','');if(question===null||!trim(question,130))return;
    const choices=window.prompt('Poll choices separated by | (2–5 options, max 65 characters each):','Yes | No | Maybe');if(choices===null)return;
    const options=choices.split('|').map(s=>trim(s,65)).filter(Boolean);
    if(options.length<2||options.length>5||new Set(options).size!==options.length)return notice('Enter 2 to 5 unique poll choices.');
    const poll={id:uniquePawId('poll'),from:me(),question:trim(question,130),options,votes:{},at:Date.now()};
    g.polls ||= [];g.polls.push(poll);pawGroupBroadcast(g,{t:'poll',poll},`📊 New poll: ${poll.question}`);saveSoon();renderGroupChat();
  }
  function votePawPoll(pollId,index) {
    const g=currentGroup(),p=g?.polls?.find(x=>x.id===pollId);
    if(!p||!g.joined||!g.accepted.includes(me())||!Number.isInteger(index)||index<0||index>=p.options.length)return;
    p.votes ||= {};p.votes[me()]=index;
    pawGroupBroadcast(g,{t:'pollvote',pollId,index},`📊 ${bcName(me())} voted in ${g.name}`);
    saveSoon();renderGroupChat();
  }
  function pawGroupExtras(g) {
    const admin=g.creator===me()||g.moderators?.includes(me())||g.roles?.[me()]==='Organizer';
    return `<section class="compcard paw-den-extras"><h3>📌 Group Announcement</h3><p>${escapeText(g.announcement?.text||'Nothing pinned yet.')}</p>${g.announcement?.text?`<small>By ${escapeText(name(g.announcement.from))}</small>`:''}${admin?'<button class="secondary" data-action="groupannouncement">✎ Edit announcement</button>':''}</section>
    <section class="compcard paw-den-extras"><h3>📊 Group Polls</h3><button class="secondary" data-action="grouppoll">＋ Create poll</button>${(g.polls||[]).slice(-10).reverse().map(p=>`<div class="paw-poll"><b>${escapeText(p.question)}</b>${p.options.map((opt,i)=>`<button class="paw-poll-choice ${p.votes?.[me()]===i?'selected':''}" data-paw-vote="${escapeText(p.id)}|${i}">${escapeText(opt)} · ${Object.values(p.votes||{}).filter(v=>v===i).length}</button>`).join('')}</div>`).join('')||'<div class="muted">No polls yet.</div>'}</section>`;
  }
  function pawPrivacySettingsMarkup() {return pawPrivacyMarkup();}

  function createSharedAlbum(){
    if(state.sharedAlbums.length>=30)return notice('Maximum 30 scrapbooks.');
    const name=window.prompt('Shared scrapbook title (max 70 characters):','Our Paw Moments ♡');if(!name?.trim())return;
    const a=normalizeAlbum({id:uniquePawId('album'),owner:me(),name,nameUpdated:Date.now(),members:[me()],joined:true,cards:[],updated:Date.now()});
    state.sharedAlbums.push(a);state.albumView=a.id;state.tab='pawbooks';saveSoon();renderPawBooks();
  }
  function renderSharedAlbums(){
    return `<section class="paw-albums"><h3>📒 Shared Scrapbooks</h3><div class="paw-items">${state.sharedAlbums.map(a=>`<div class="paw-item"><b>${escapeText(a.name)}</b> <span class="muted">· ${a.members.length} member(s) · ${a.cards.length} moments</span>
      ${a.joined?`<div class="flex"><button class="secondary" data-paw-album="${escapeText(a.id)}">${state.albumView===a.id?'✓ Viewing':'View album'}</button>${a.owner===me()?`<button class="secondary" data-paw-album-rename="${escapeText(a.id)}" title="Rename for all collaborators">✎ Rename</button><button class="secondary" data-paw-cover="${escapeText(a.id)}">🎨 Cover</button><button class="secondary" data-paw-pages="${escapeText(a.id)}">▦ Pages</button><button class="secondary" data-paw-album-invite="${escapeText(a.id)}">✉ Invite collaborator</button>`:''}<button class="secondary paw-album-leave" data-paw-album-leave="${escapeText(a.id)}" title="${a.owner===me()?'Transfer or close this scrapbook':'Leave this scrapbook'}">${a.owner===me()?(a.members.length>1?'↪ Transfer &amp; leave':'✕ Delete scrapbook'):'↩ Leave scrapbook'}</button></div>`:'<span class="muted">Invitation pending — see Catch Up</span>'}
      ${a.joined&&state.albumView===a.id?`${pawCoverMarkup(a)}<div class="paw-album-cards paw-page-layout-${a.pageLayout||'grid'}">${a.cards.map(c=>pawCardMarkup(a,c)).join('')||'<p class="muted">Add Paw Moments below to this scrapbook.</p>'}</div>`:''}</div>`).join('')||'<p class="muted">Create a shared scrapbook to collect memories with friends.</p>'}</div></section>`;
  }
  // Shared Scrapbooks are separate from Group Dens (which already have Leave Group).
  // Keep private Paw Moments only when explicitly requested. For owners with other
  // participants, hand off ownership rather than destroying the shared scrapbook.
  function leaveSharedAlbum(albumId){
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined);
    if(!a||!a.members.includes(me()))return;
    const owned=a.owner===me();
    const others=a.members.filter(member=>member!==me());
    let successor=0;
    if(owned&&others.length){
      const members=others.map(member=>`${member} — ${bcName(member)}`).join('\n');
      const requested=window.prompt(`Transfer ownership of “${a.name}” before leaving.\nChoose one of these member numbers:\n${members}`,String(others[0]));
      if(requested===null)return;
      successor=numeric(requested);
      if(!others.includes(successor)){notice('Choose an existing scrapbook collaborator to transfer ownership to.');return;}
    }
    const consequence=owned?(successor?`Ownership will transfer to ${bcName(successor)}. You will lose access to the shared scrapbook.`:'This scrapbook will be deleted from your account.'):'You will lose access to its shared memories and stop receiving updates.';
    if(!window.confirm(`${owned&&successor?'Transfer and leave':owned?'Delete':'Leave'} “${a.name}”?\n${consequence}\nOther collaborators keep their own copies.`))return;

    // Validate the private-copy choice before changing membership or notifying peers.
    let copies=[];
    if(a.cards.length&&window.confirm(`Keep a personal copy of this scrapbook’s ${a.cards.length} saved moment(s) in your private Paw Moments?`)){
      const available=MOMENT_LIMIT-state.moments.length;
      if(available<a.cards.length){notice(`Not enough private Paw Moment slots (${available} available, ${a.cards.length} needed). Delete older moments or retry without keeping a copy.`);return;}
      copies=a.cards.map(card=>normalizeMoment({...card,id:uniquePawId('moment'),source:`Scrapbook: ${a.name}`,received:false})).filter(Boolean);
    }

    const priorOwner=a.owner;
    let sent=0,failed=0;
    let transfer=null;
    if(owned&&successor){
      transfer={type:'KCPawAlbum',v:1,action:'owner-transfer',id:a.id,owner:successor,members:others,name:a.name,nameUpdated:a.nameUpdated};
      // A failed transfer must not orphan the scrapbook. Only remove ourselves
      // after the selected new owner has successfully been sent the notice.
      if(!pawSend(successor,'KCPawAlbum',transfer)){
        notice(`Could not notify ${bcName(successor)}. You are still the scrapbook owner; try again when you are BC friends.`);
        return;
      }
      sent++;
    }

    if(copies.length)state.moments.push(...copies);
    // Update this user's UI and saved account immediately, even if a peer is offline.
    state.sharedAlbums=state.sharedAlbums.filter(album=>album.id!==a.id);
    if(state.albumView===a.id)state.albumView='';
    saveNow(true);
    bookRender();

    if(transfer){
      for(const member of others){
        if(member===successor)continue;
        if(pawSend(member,'KCPawAlbum',transfer))sent++;else failed++;
      }
      notice(`📒 Left “${a.name}”. Ownership transferred to ${bcName(successor)}.${failed?' Some collaborators could not be notified.':''}`);
    }else if(!owned){
      // Notify collaborators directly in addition to the owner: their member lists
      // can update even when the owner is temporarily offline.
      for(const member of others){
        if(pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'leave',id:a.id}))sent++;else failed++;
      }
      // Legacy owners recognize response:false even before adopting v0.8.17.
      if(priorOwner&&others.includes(priorOwner))pawSend(priorOwner,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'response',id:a.id,accepted:false});
      notice(`📒 You left “${a.name}”.${failed?' Some collaborators could not be notified.':''}`);
    }else{
      notice(`📒 Your empty scrapbook “${a.name}” was removed.`);
    }
  }

  function inviteAlbumFriend(albumId){
    const a=state.sharedAlbums.find(x=>x.id===albumId&&x.joined);if(!a)return;
    const member=numeric(window.prompt('Friend member number to invite:',String(state.selected||'')));
    if(!member||!myFriends().includes(member)||member===me())return notice('Choose a BC friend.');
    if(a.members.includes(member))return notice('Already collaborating.');
    if(a.members.length>=8)return notice('Maximum 8 collaborators per scrapbook.');
    (a.pendingInvites ||= []).push(member);a.pendingInvites=[...new Set(a.pendingInvites)].slice(-8);saveSoon();
    const packet={type:'KCPawAlbum',v:1,action:'invite',id:a.id,owner:a.owner,name:a.name,nameUpdated:a.nameUpdated,members:[...a.members,member],cards:a.cards.slice(-8),coverColor:a.coverColor,coverImage:a.coverImage,coverFrame:a.coverFrame,coverAt:a.coverAt,pageLayout:a.pageLayout,pageAt:a.pageAt,bookPages:a.bookPages,bookRoles:a.bookRoles,linkedGroup:a.linkedGroup,bookUpdated:a.bookUpdated};
    if(pawSend(member,'KCPawAlbum',packet))notice('📒 Scrapbook invitation sent.');else {a.pendingInvites=(a.pendingInvites||[]).filter(n=>n!==member);saveSoon();notice('Invitation failed.');}
  }
  function answerAlbumInvite(id,accept,batch=false){
    const a=state.sharedAlbums.find(x=>x.id===id);if(!a||a.joined||pawBookVault.locked)return false;
    if(accept){a.joined=true;a.members=[...new Set([...a.members,me()])];if(!batch)state.albumView=a.id;}
    else state.sharedAlbums=state.sharedAlbums.filter(x=>x!==a);
    pawSend(a.owner,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'response',id:a.id,accepted:!!accept});
    saveSoon();if(!batch){if(state.tab==='catchup')renderCatchUp();else if(state.tab==='pawbooks')renderPawBooks();else renderMoments();}
    return true;
  }
  function addMomentToAlbum(momentId){
    const moment=state.moments.find(x=>x.id===momentId);if(!moment)return;
    if(moment.from!==me()&&!window.confirm('This saved moment quotes another player. Confirm they agreed it can be shared with the scrapbook collaborators. Cancel to keep it private.'))return;
    bookChooseAndAdd(moment,moment.from!==me());
  }
  function receivePawAlbum(data,from){
    if(!myFriends().includes(from)||pawBookVault.locked)return;
    let p;try{p=pawParseWireJSON(String(data.Message||''),30000);}catch{return;}
    if(p?.type!=='KCPawAlbum'||p.v!==1||!['invite','rename','response','sync','leave','owner-transfer','cover','layout','react','comment','card','book-page','book-position','book-card-meta','book-role','book-link','book-event','book-sync-request','book-sync-card','book-sync-page','book-metadata'].includes(p.action))return;
    const id=trim(p.id,80);if(!/^album_[\w-]{5,45}$/.test(id))return;
    const legacyKey=p.action==='invite'?`${id}:invite`:p.action==='card'&&integrityMsgId(p.card?.id)?`${id}:card:${p.card.id}`:p.action==='comment'&&integrityMsgId(p.comment?.id)?`${id}:comment:${p.comment.id}`:'';
    if(!integrityAcceptEvent('album',from,p,legacyKey))return;
    let album=state.sharedAlbums.find(x=>x.id===id);
    if(p.action==='invite'){
      if(numeric(p.owner)!==from||album)return;
      const normalized=normalizeAlbum({id,owner:from,name:p.name,nameUpdated:p.nameUpdated,members:p.members,joined:false,cards:p.cards||[],coverColor:p.coverColor,coverImage:p.coverImage,coverFrame:p.coverFrame,coverAt:p.coverAt,pageLayout:p.pageLayout,pageAt:p.pageAt,bookPages:p.bookPages,bookRoles:p.bookRoles,linkedGroup:p.linkedGroup,bookUpdated:p.bookUpdated,updated:Date.now()});
      if(!normalized||!normalized.members.includes(me()))return;
      for(const card of normalized.cards){card.importedBy=from;card.sharedBy=from;}
      state.sharedAlbums.push(normalized);state.sharedAlbums=state.sharedAlbums.slice(-30);
      notice(`📒 ${bcName(from)} invited you to a Shared Scrapbook.`);
    }else if(p.action==='rename'&&album&&from===album.owner){
      if(!acceptAlbumName(album,p))return;
      album.updated=Date.now();
      notice(`📒 ${bcName(from)} renamed the scrapbook to “${album.name}”.`);
    }else if(p.action==='response'&&album&&album.owner===me()){
      if(!album.members.includes(from)&&!(album.pendingInvites||[]).includes(from))return;
      album.pendingInvites=(album.pendingInvites||[]).filter(n=>n!==from);
      if(p.accepted===true&&!album.members.includes(from)){album.members.push(from);if(album.members.length>8)album.members=album.members.slice(0,8);}
      if(p.accepted!==true)album.members=album.members.filter(id=>id!==from);
      album.updated=Date.now();
      // Sync the new collaborator list with everyone who has already joined.
      for(const member of album.members)if(member!==me())pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'sync',id:album.id,owner:me(),members:album.members,name:album.name,nameUpdated:album.nameUpdated,bookRoles:album.bookRoles,linkedGroup:album.linkedGroup,bookUpdated:album.bookUpdated});
    }else if(p.action==='sync'&&album&&from===album.owner&&Array.isArray(p.members)){
      album.members=[...new Set([album.owner,...p.members.map(numeric).filter(Boolean)])].slice(0,8);album.updated=Date.now();
      acceptAlbumName(album,p);
      if(Number(p.bookUpdated)>Number(album.bookUpdated||0)){
        album.bookRoles=normalizeBookRoles(p.bookRoles,album.members);
        album.linkedGroup=trim(p.linkedGroup||'',65);
        album.bookUpdated=Number(p.bookUpdated);
      }
      if(album.joined&&!album.members.includes(me())){
        state.sharedAlbums=state.sharedAlbums.filter(x=>x.id!==id);
        if(state.albumView===id)state.albumView='';
        notice('📒 You are no longer a member of this scrapbook.');
      }
    }else if(p.action==='leave'&&album?.joined&&from!==album.owner&&album.members.includes(from)){
      album.members=album.members.filter(member=>member!==from);album.updated=Date.now();
      if(album.owner===me()){
        // The owner updates the rest of the collaborators after someone leaves.
        for(const member of album.members)if(member!==me())
          pawSend(member,'KCPawAlbum',{type:'KCPawAlbum',v:1,action:'sync',id,owner:me(),members:album.members,name:album.name,nameUpdated:album.nameUpdated,bookRoles:album.bookRoles,linkedGroup:album.linkedGroup,bookUpdated:album.bookUpdated});
      }
    }else if(p.action==='owner-transfer'&&album?.joined&&from===album.owner&&Array.isArray(p.members)){
      const incoming=[...new Set(p.members.map(numeric).filter(Boolean))].slice(0,8);
      const successor=numeric(p.owner);
      // Only the former owner may transfer, and the successor must have been
      // an existing member. The departing owner must not remain on the list.
      if(!album.members.includes(successor)||successor===from||!incoming.includes(successor)||incoming.includes(from))return;
      acceptAlbumName(album,p);
      album.owner=successor;album.members=incoming;album.updated=Date.now();
      if(!incoming.includes(me())){
        state.sharedAlbums=state.sharedAlbums.filter(x=>x.id!==id);
        if(state.albumView===id)state.albumView='';
      }else notice(`📒 ${bcName(successor)} now owns “${album.name}”.`);
    }else if(p.action==='cover'&&album?.joined&&from===album.owner&&Number(p.coverAt)>Number(album.coverAt||0)){
      if(!Object.hasOwn(PAW_COVER_COLORS,p.coverColor)||!['classic','polaroid','floral'].includes(p.coverFrame))return;
      const img=trim(p.coverImage,500);if(img&&!/^https:\/\/[^\s]+$/i.test(img))return;
      Object.assign(album,{coverColor:p.coverColor,coverImage:img,coverFrame:p.coverFrame,coverAt:Number(p.coverAt)});
    }else if(p.action==='layout'&&album?.joined&&from===album.owner&&Number(p.pageAt)>Number(album.pageAt||0)){
      if(!PAW_PAGE_LAYOUTS.includes(p.layout)||!Array.isArray(p.cardIds))return;
      album.pageLayout=p.layout;album.pageAt=Number(p.pageAt);
      const order=p.cardIds.slice(0,60).map(x=>trim(x,80));
      album.cards.sort((a,b)=>{const x=order.indexOf(a.id),y=order.indexOf(b.id);return (x<0?999:x)-(y<0?999:y);});
    }else if(p.action==='react'&&album?.joined&&album.members.includes(from)){
      const c=album.cards.find(x=>x.id===p.cardId);
      if(!c||!['💗','⭐','🐾'].includes(p.emoji)||typeof p.remove!=='boolean')return;
      c.reactions ||= {};const current=c.reactions[p.emoji]||[];
      c.reactions[p.emoji]=p.remove?current.filter(x=>x!==from):[...new Set([...current,from])].slice(0,8);
    }else if(p.action==='comment'&&album?.joined&&album.members.includes(from)){
      const c=album.cards.find(x=>x.id===p.cardId),raw=p.comment;
      if(!c||!raw||numeric(raw.from)!==from||!/^reply_[\w-]{4,45}$/.test(trim(raw.id,65)))return;
      const text=trim(raw.text,180);if(!text)return;
      c.comments ||= [];if(c.comments.some(x=>x.id===raw.id))return;
      c.comments.push({id:trim(raw.id,65),from,text,at:Number(raw.at)||Date.now()});c.comments=c.comments.slice(-24);
    }else if(p.action==='card'&&album?.joined&&album.members.includes(from)&&bookCanAdd(album,from)){
      const card=normalizePawCard(p.card);if(!card||album.cards.some(x=>x.id===card.id)||(card.sharedBy&&card.sharedBy!==from))return;
      card.sharedBy=from;
      if(card.from!==from)card.importedBy=from;
      album.cards.push(card);album.cards=album.cards.slice(-60);album.updated=Date.now();notice(`♡ ${bcName(from)} added a scrapbook memory.`);
    }else if(p.action==='book-sync-request'&&album?.joined&&album.owner===me()&&album.members.includes(from)){
      bookServeSync(album,from,p.requestToken);
    }else if(p.action==='book-sync-page'&&album?.joined&&from===album.owner){
      if(!bookSyncAuthorized(album,from,p.requestToken))return;
      if(!bookHandlePacket(album,{...p,action:'book-page'},from))return;
    }else if(p.action==='book-sync-card'&&album?.joined&&from===album.owner){
      if(!bookSyncAuthorized(album,from,p.requestToken))return;
      const card=normalizePawCard(p.card);
      if(!card||!card.sharedBy||!album.members.includes(card.sharedBy)||album.cards.some(c=>c.id===card.id)||album.cards.length>=60)return;
      // Historical copies provided by the owner are not independently verified.
      if(card.sharedBy!==from)card.importedBy=from;
      album.cards.push(card);
    }else if(p.action==='book-metadata'&&album?.joined&&from===album.owner){
      if(!bookSyncAuthorized(album,from,p.requestToken))return;
      if(Number(p.bookUpdated)<Number(album.bookUpdated||0)||!Array.isArray(p.members))return;
      album.members=[...new Set([album.owner,...p.members.map(numeric).filter(Boolean)])].slice(0,8);
      album.bookRoles=normalizeBookRoles(p.bookRoles,album.members);
      album.linkedGroup=trim(p.linkedGroup||'',65);album.bookUpdated=Number(p.bookUpdated)||0;
      acceptAlbumName(album,p);
      if(Object.hasOwn(PAW_COVER_COLORS,p.coverColor)&&['classic','polaroid','floral'].includes(p.coverFrame)){
        album.coverColor=p.coverColor;album.coverFrame=p.coverFrame;album.coverImage=safeImg(p.coverImage);
        album.coverAt=Math.max(Number(album.coverAt)||0,Number(p.coverAt)||0);
      }
    }else if(p.action.startsWith('book-')&&album?.joined){
      if(!bookHandlePacket(album,p,from))return;
    }else return;
    if(pawBookVault.active&&!pawBookVault.locked)bookVaultQueueSave();
    saveSoon();if(state.open&&(state.tab==='moments'||state.tab==='pawbooks'||state.tab==='catchup'))render();
  }
  async function pawBackupData(){
    await flushHistoryArchive();
    const db=await historyDb(),rows=await new Promise((resolve,reject)=>{
      const out=[],tx=db.transaction('messages','readonly');
      const req=tx.objectStore('messages').index('byAccount').openCursor(IDBKeyRange.only(state.myId));
      req.onsuccess=()=>{const cursor=req.result;if(cursor){out.push(pawDecodeHistoryRow(cursor.value));cursor.continue();}};
      req.onerror=()=>reject(req.error);tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error);
    });
    return {format:'PawLounge-backup',version:1,account:state.myId,exported:new Date().toISOString(),settings:state.settings,
      chats:state.chats,groups:state.groups,profiles:state.profiles,moments:state.moments,circles:state.circles,
      sharedAlbums:state.sharedAlbums,privateBookPages:state.privateBookPages,invitations:state.invitations,pawGuestbook:state.pawGuestbook,
      catchUpSince:state.catchUpSince,catchUpWhispersSince:state.catchUpWhispersSince,catchUpGroupsSince:state.catchUpGroupsSince,roomFavorites:state.roomFavorites,roomRecent:state.roomRecent,
      roomSort:state.roomSort,scheduledMessages:state.scheduledMessages,messages:rows,roomHistory:state.roomHistory};
  }
  const bytesBase64=bytes=>{let out='';for(let i=0;i<bytes.length;i+=16384)out+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(out);};
  const base64Bytes=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
  async function pawCryptoKey(password,salt){
    const master=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},master,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function exportPawBackup(encrypted){
    if(!state.myId)return;
    if(!crypto?.subtle||!crypto?.getRandomValues)return notice('This browser does not support secure backup encryption.');
    let password='';if(encrypted){password=window.prompt('Encryption password (minimum 8 characters):','');if(password===null)return;if(password.length<8)return notice('Use a password with at least 8 characters.');const confirm=window.prompt('Repeat your encryption password:','');if(confirm!==password)return notice('Passwords did not match.');}
    try{
      const data=await pawBackupData();
      if(encrypted){
        const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
        const key=await pawCryptoKey(password,salt),plaintext=new TextEncoder().encode(JSON.stringify(data));
        const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plaintext);
        download(`PawLounge-${state.myId}-${new Date().toISOString().slice(0,10)}.pawbackup`,'application/json',JSON.stringify({format:'PawLounge-encrypted',version:1,kdf:'PBKDF2-SHA256',iterations:250000,cipher:'AES-256-GCM',salt:bytesBase64(salt),iv:bytesBase64(iv),data:bytesBase64(new Uint8Array(cipher))}));
      }else download(`PawLounge-${state.myId}.json`,'application/json',JSON.stringify(data));
      notice(`✓ Complete ${encrypted?'encrypted ':''}backup saved (${data.messages.length} archived messages).`);
    }catch(e){console.warn('[PawLounge] Backup failed',e);notice(`Backup failed: ${trim(e.message,100)}`);}
  }
  async function importPawBackup(file){
    if(pawBookVault.active&&pawBookVault.locked)return notice('Unlock PawBooks before importing backups.');
    if(!file||file.size>120*1024*1024)return notice('Backup is missing or over 120 MB.');
    try{
      let data=JSON.parse(await file.text());
      if(data?.format==='PawLounge-encrypted'){
        const password=window.prompt('Password for this encrypted PawLounge backup:','');if(password===null)return;
        const key=await pawCryptoKey(password,base64Bytes(data.salt));
        const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:base64Bytes(data.iv)},key,base64Bytes(data.data));
        data=JSON.parse(new TextDecoder().decode(bytes));
      }
      if(!['PawLounge-backup','Kittychat full history'].includes(data?.format)||Number(data.account)!==me()||!Array.isArray(data.messages))return notice('Not a valid backup for your logged-in BC account.');
      if(!window.confirm(`Merge backup (${data.messages.length} archived messages) with this account? Existing messages will be preserved.`))return;
      await flushHistoryArchive();
      const rows=data.messages.slice(0,1000000).map(m=>historyRecord(state.myId,m.kind,m.conversation,m)).filter(Boolean);
      const db=await historyDb();
      for(let i=0;i<rows.length;i+=250){
        await new Promise((resolve,reject)=>{const tx=db.transaction('messages','readwrite'),store=tx.objectStore('messages');for(const row of rows.slice(i,i+250))store.add(row).onerror=e=>{if(e.target.error?.name==='ConstraintError'){e.preventDefault();e.stopPropagation();}};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Archive import failed'));});
      }
      for(const [id,chat] of Object.entries(data.chats||{})){const member=numeric(id);if(!member||member===me()||!chat||typeof chat!=='object')continue;const existing=ensure(member);const seen=new Set((existing.messages||[]).map(m=>m.id));existing.messages=[...existing.messages,...(Array.isArray(chat.messages)?chat.messages:[]).filter(m=>m&&typeof m.text==='string'&&!seen.has(m.id))].sort((a,b)=>a.time-b.time).slice(-MAX_MESSAGES);existing.updated=Math.max(existing.updated||0,Number(chat.updated)||0);}
      for(const [id,g] of Object.entries(data.groups||{})){if(/^g_[\w-]{8,44}$/.test(id)&&!state.groups[id]&&g?.members?.includes(me()))state.groups[id]=g;}
      for(const moment of data.moments||[]){const m=normalizeMoment(moment);if(m&&!state.moments.some(x=>x.id===m.id))state.moments.push(m);}
      for(const circle of data.circles||[]){if(/^circle_[\w-]{4,32}$/.test(circle?.id||'')&&!state.circles.some(c=>c.id===circle.id))state.circles.push({id:circle.id,name:trim(circle.name,45),members:(circle.members||[]).map(numeric).filter(Boolean)});}
      for(const album of data.sharedAlbums||[]){const a=normalizeAlbum(album);if(a&&!state.sharedAlbums.some(x=>x.id===a.id))state.sharedAlbums.push(a);}
      for(const [bookId,pages] of Object.entries(normalizePrivateBookPages(data.privateBookPages))){
        const current=state.privateBookPages[bookId]||[];const known=new Set(current.map(p=>p.id));
        state.privateBookPages[bookId]=[...current,...pages.filter(p=>!known.has(p.id))].slice(0,24);
      }
      for(const inv of data.invitations||[]){const v=normalizeInvitation(inv);if(v&&!state.invitations.some(x=>x.id===v.id))state.invitations.push(v);}
      for(const entry of data.pawGuestbook||[]){const v=normalizeGuestEntry(entry);if(v&&!state.pawGuestbook.some(x=>x.id===v.id))state.pawGuestbook.push(v);}
      state.circles=state.circles.slice(-30);state.sharedAlbums=state.sharedAlbums.slice(-30);state.invitations=state.invitations.slice(-70);state.pawGuestbook=state.pawGuestbook.slice(-50);state.moments=state.moments.slice(-MOMENT_LIMIT);
      // Only overwrite settings after explicit choice: preserve current config by default.
      if(data.settings&&window.confirm('Also restore saved appearance, status and profile settings?'))state.settings={...DEFAULT_SETTINGS,...data.settings};
      saveNow(true);state.historySelection='';state.historyEpoch++;render();notice(`✓ Imported ${rows.length} archive records. Existing messages preserved.`);
    }catch(e){console.warn('[PawLounge] Import failed',e);notice('Import failed. Check your password and backup file, then try again.');}
  }

  // Memories + Paw Moments share one rail button and one chronological view.
  // Storage intentionally stays in its original arrays/IndexedDB stores: no
  // destructive migration, and Marvelous room-backup permissions are unchanged.
  function renderMoments() {
    if(!ui.body)return;
    const f=marvelousRoomMemoryFilters;
    const view=['all','moments','rooms'].includes(f.view)?f.view:'all';
    const query=String(f.query||'').trim().toLocaleLowerCase();
    const records=[
      ...state.moments.map(m=>({kind:'moment',at:Number(m.at)||0,item:m,
        search:[m.title,m.text,m.source,m.decoration].join(' ').toLocaleLowerCase()})),
      ...state.roomMemories.map(m=>({kind:'room',at:Number(m.created)||0,item:m,
        search:[m.room,m.notes,m.tags].join(' ').toLocaleLowerCase()}))
    ].filter(r=>(view==='all'||(view==='moments'?r.kind==='moment':r.kind==='room')) &&
      (!query||r.search.includes(query)) &&
      (r.kind!=='room'||!f.favoritesOnly||r.item.favorite))
      .sort((a,b)=>b.at-a.at);
    const draft=state.roomMemoryDraft||{name:'',notes:'',tags:''};
    const current=trim(window.ChatRoomData?.Name||'',110);
    const tabs=[['all','All',state.moments.length+state.roomMemories.length],
      ['moments','Paw Moments',state.moments.length],['rooms','Room Memories',state.roomMemories.length]];
    const card=r=>{
      const m=r.item;
      if(r.kind==='moment')return `<article class="kc-moment-card kc-memory-entry"><div class="kc-memory-kind">♡ Paw Moment</div><div class="kc-moment-decor">${escapeText(m.decoration)}</div><div class="kc-moment-title">${escapeText(m.title)}</div>${m.image?`<img src="${escapeText(m.image)}" alt="Moment image" loading="lazy"/>`:''}<blockquote>${escapeText(m.text)}</blockquote><div class="muted">${escapeText(m.source)} · ${new Date(r.at).toLocaleDateString()}</div><div class="flex"><button class="secondary" data-momentshare="${escapeText(m.id)}">💌 Share</button><button class="secondary" data-paw-album-moment="${escapeText(m.id)}">📒 Add to album</button><button class="secondary" data-momentdelete="${escapeText(m.id)}">Delete</button></div></article>`;
      return `<article class="marv-feature-card kc-memory-entry" data-mem-id="${escapeText(m.id)}"><div class="kc-memory-kind">📔 Room Memory</div><div class="marv-feature-top"><b>${m.favorite?'⭐ ':''}${escapeText(m.room||'Unnamed room')}</b><span class="muted">${new Date(r.at).toLocaleDateString()}</span></div><p>${escapeText(m.notes)}</p>${m.tags?`<p class="muted">🏷 ${escapeText(m.tags)}</p>`:''}${m.hasImage?`<img class="marv-room-thumb" data-marv-memory-img="${escapeText(m.id)}" alt="Room memory screenshot" loading="lazy"/>`:''}<div class="marv-feature-actions"><button class="secondary" data-action="marv-feature-favorite-memory" data-id="${escapeText(m.id)}">${m.favorite?'★ Unfavorite':'☆ Favorite'}</button><label class="marv-image-label">📷 Attach screenshot<input type="file" data-memory-file="${escapeText(m.id)}" accept="image/png,image/jpeg,image/webp"></label><button class="secondary" data-action="marv-feature-delete-memory" data-id="${escapeText(m.id)}">Delete</button></div></article>`;
    };
    ui.body.innerHTML=`<div class="marv-feature-page kc-memory-hub"><h2>♡ Memories</h2><p class="muted">Paw Moments and private room memories together in one place. Nothing is shared or uploaded automatically.</p>
      <div class="kc-memory-actions"><button class="primary" data-action="newmoment">＋ Write a Moment</button><button class="secondary" data-action="memoryhub-compose">${f.composeOpen?'✕ Close Room Journal':'📔 Add Room Memory'}</button><button class="secondary" data-action="openpawbooks">📚 PawBooks</button></div>
      ${f.composeOpen?`<div class="marv-feature-card kc-memory-composer"><div class="smalltitle">📔 Save a private room memory</div><label>Room name<input class="field" id="marv-memory-room" maxlength="110" placeholder="${escapeText(current||'Room name')}" value="${escapeText(draft.name)}"></label><label>Your private memory<textarea class="field" id="marv-memory-note" maxlength="2000" rows="3" placeholder="What made this moment memorable?">${escapeText(draft.notes)}</textarea></label><label>Optional tags<input class="field" id="marv-memory-tags" maxlength="100" placeholder="cuddles, friends" value="${escapeText(draft.tags)}"></label><button class="primary" data-action="marv-feature-add-memory">♡ Keep this memory</button></div>`:''}
      <div class="kc-memory-tools"><div class="kc-memory-filters" role="group" aria-label="Filter memories">${tabs.map(([id,label,count])=>`<button class="${view===id?'primary':'secondary'}" data-action="memoryhub-view-${id}" aria-pressed="${view===id}">${label} (${count})</button>`).join('')}</div>
      <label>Find a memory<input class="field" type="search" id="marv-memory-search" maxlength="120" placeholder="Search moments, messages, rooms or tags" value="${escapeText(f.query)}" autocomplete="off"></label>
      ${view!=='moments'?`<label class="kc-memory-favorite-toggle"><input type="checkbox" id="marv-memory-favorites" ${f.favoritesOnly?'checked':''}> Starred room memories only</label>`:''}<p class="muted">${records.length} saved ${records.length===1?'entry':'entries'} shown</p></div>
      <div class="kc-moments-grid kc-memory-feed">${records.map(card).join('')||'<p class="muted">No matching memories. Save a Moment or write a room memory to begin. ♡</p>'}</div></div>`;
    // Room screenshots live in the old IndexedDB store. Load only those shown.
    for(const r of records)if(r.kind==='room'&&r.item.hasImage)void marvelousShowImage(r.item.id);
  }
  function addOwnMoment() {
    const title=window.prompt('Paw Moment title:','A sweet memory ♡');if(title===null)return;
    const content=window.prompt('Write your memory (up to 380 characters):','');if(!content?.trim())return;
    const image=window.prompt('Optional HTTPS image URL (leave blank for none):','');if(image===null)return;
    if(image.trim()&&!/^https:\/\//i.test(image.trim())){notice('Paw Moment pictures require HTTPS URLs.');return;}
    const moment=normalizeMoment({id:`moment_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,title,text:content,from:me(),source:'My scrapbook',at:Date.now(),image,decoration:'🐾'});
    if(moment){state.moments.push(moment);state.moments=state.moments.slice(-MOMENT_LIMIT);saveSoon();bookRender();}
  }
  function sendPawMoment(momentId) {
    const m=state.moments.find(x=>x.id===momentId);if(!m)return;
    const target=numeric(window.prompt('BC friend member number to receive this moment:',String(state.selected||'')));
    if(!target||!myFriends().includes(target)){notice('Sharing requires a BC friend.');return;}
    if(!state.profiles[target]?.kitty){notice('Your friend needs PawLounge/Kittychat (confirmed by Paw Profile or status handshake) to receive this card.');return;}
    if(!window.confirm(`Share "${m.title}" with ${bcName(target)}?`))return;
    const body={type:'KCMoment',v:1,moment:{...m,received:true}};
    try{window.ServerSend('AccountBeep',{MemberNumber:target,BeepType:'KCMoment',IsSecret:true,Message:pawWireJSON(body)});notice('💌 Paw Moment sent; recipient needs a compatible PawLounge or Kittychat build.');}
    catch(err){notice('Could not share Paw Moment.');}
  }
  function receivePawMoment(data,from) {
    if(!myFriends().includes(from))return;
    try{
      const obj=pawParseWireJSON(String(data.Message||''),6000);
      if(obj?.type!=='KCMoment'||obj.v!==1)return;
      if(!integrityAcceptEvent('moment',from,obj,integrityMsgId(obj.moment?.id)?obj.moment.id:''))return;
      const m=normalizeMoment(obj.moment);if(!m)return;
      m.from=from;m.received=true;m.source=bcName(from);
      if(state.moments.some(x=>x.id===m.id&&x.from===from))return;
      state.moments.push(m);state.moments=state.moments.slice(-MOMENT_LIMIT);saveSoon();
      notice(`♡ ${bcName(from)} shared a Paw Moment with you.`);
      if(state.open&&state.tab==='moments')renderMoments();
    }catch{}
  }

  function renderStickersLibrary() {
    ui.body.innerHTML = `<div class="screen sticker-library"><div class="sectiontitle">🐾 The Kitty Sticker Chest</div>
      <p class="muted">All eight kitty moods, ready to send to the conversation you selected. Open a chat or Group Den first.</p>
      <div class="gallerygrid">${STICKERS.map(st=>`<button class="gallery-sticker" data-sticker="${st.id}">${asset(`sticker-${st.id}.png`,'',st.emoji)}<strong>${escapeText(st.name)}</strong></button>`).join('')}</div>
      </div>`;
  }
  // BC's room search is scoped to a room Space. An empty Space is not an
  // all-spaces request, so aggregate X/M/F for the All filter.
  const KITTY_ROOM_SPACES = ['X', 'M', 'F'];
  let roomSearchQueue = Promise.resolve();
  let roomAutoSearchQueued = false;
  const recentRoomResults = new Map();
  function roomResultArray(result) {
    // Current BC versions return Result<Array<Room>, ServerError>, rather
    // than a plain array. Older builds/addons may return an array or .value.
    if (result?.ok === false || result?.err === true) {
      const failure = result.error ?? result.reason ?? result.err ?? 'Search rejected by BC';
      throw failure instanceof Error ? failure : new Error(String(failure?.message ?? failure?.code ?? failure));
    }
    let value;
    if (Array.isArray(result)) value = result;
    else if (typeof result?.unwrap === 'function') value = result.unwrap();
    else value = result?.value ?? result?.data ?? result?.rooms;
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.Rooms)) return value.Rooms;
    if (Array.isArray(value?.rooms)) return value.rooms;
    throw new Error('BC returned a room-search response without a room array.');
  }
  function searchRoomSpace(query, space) {
    // Serializing is essential: ServerRoomSearch uses Socket.once for its
    // response; concurrent requests would all receive the same packet.
    const key = `${space}:${query.toUpperCase().trim()}`;
    const recent = recentRoomResults.get(key);
    if (recent && Date.now() - recent.at < 3100) return Promise.resolve(recent.rooms);
    const work = roomSearchQueue.catch(() => {}).then(async () => {
      const again = recentRoomResults.get(key);
      if (again && Date.now() - again.at < 3100) return again.rooms;
      const response = await window.ServerRoomSearch(query, { Language:'', Space:space, Game:'', FullRooms:true });
      const rooms = roomResultArray(response);
      recentRoomResults.set(key, { at: Date.now(), rooms });
      // Bound the transient request cache. No rooms are stored in localStorage.
      if (recentRoomResults.size > 12) recentRoomResults.delete(recentRoomResults.keys().next().value);
      return rooms;
    });
    roomSearchQueue = work.then(() => {}, () => {});
    return work;
  }
  function roomSorted(rooms) {
    const arr=[...rooms],fav=new Set(state.roomFavorites.map(r=>`${r.Space}:${r.Name.toUpperCase()}`));
    const n=r=>Number(r.MemberCount)||0;
    return arr.sort((a,b)=>state.roomSort==='least' ? n(a)-n(b)||a.Name.localeCompare(b.Name) :
      state.roomSort==='name' ? a.Name.localeCompare(b.Name) :
      state.roomSort==='favorite' ? Number(fav.has(`${b.Space}:${b.Name.toUpperCase()}`))-Number(fav.has(`${a.Space}:${a.Name.toUpperCase()}`))||n(b)-n(a) :
      n(b)-n(a)||a.Name.localeCompare(b.Name));
  }
  function joinRoomFromRadar(room) {
    if(!room?.Name || !['X','M','F'].includes(room.Space))return;
    if(!window.confirm(`Leave your current location and visit "${room.Name}"?`))return;
    try{
      if(window.CurrentScreen==='ChatRoom'&&typeof window.ChatRoomLeave==='function')window.ChatRoomLeave();
      if(typeof window.CommonSetScreen==='function')window.CommonSetScreen('Online','ChatSearch');
      if(typeof window.CommonTime==='function')window.ChatSearchLastQueryJoinTime=window.CommonTime();
      window.ChatSearchLastQueryJoin=room.Name;
      window.ServerSend('ChatRoomJoin',{Name:room.Name,Space:room.Space});
      const key=`${room.Space}:${room.Name.toUpperCase()}`;
      state.roomRecent=state.roomRecent.filter(r=>`${r.Space}:${r.Name.toUpperCase()}`!==key);
      state.roomRecent.push({Name:room.Name,Space:room.Space,at:Date.now()});saveSoon();
      if(typeof window.ChatRoomPingLeashedPlayers==='function')window.ChatRoomPingLeashedPlayers();
      toggle(false);
    }catch(err){notice(`Could not enter room: ${err.message||err}`);}
  }
  function renderRooms() {
    const total = state.rooms.length;
    const favored=new Set(state.roomFavorites.map(r=>`${r.Space}:${r.Name.toUpperCase()}`));
    const rooms=roomSorted(state.rooms);
    const note = state.roomLoading ? '🐾 Searching X, M and F spaces...' :
      state.roomError || (state.roomSearched ? `${total} public room${total === 1 ? '' : 's'}` : 'Press Search to explore rooms across all spaces.');
    ui.body.innerHTML = `<div class="screen"><div class="sectiontitle">🏡 Kitty Room Explorer</div><p class="muted">Search public BC rooms across X, M and F automatically. Entering a room requires confirmation.</p>
      <div class="flex"><input class="field" style="flex:1;min-width:120px" id="kc-roomquery" placeholder="Room name..." value="${escapeText(state.roomSearch)}"/><select class="mode" id="kc-roomsort" aria-label="Sort rooms"><option value="most" ${state.roomSort==='most'?'selected':''}>Most users ↓</option><option value="least" ${state.roomSort==='least'?'selected':''}>Least users ↑</option><option value="name" ${state.roomSort==='name'?'selected':''}>Name A–Z</option><option value="favorite" ${state.roomSort==='favorite'?'selected':''}>Favorites first</option></select><button class="primary" data-action="searchrooms" ${state.roomLoading ? 'disabled' : ''}>${state.roomLoading ? 'Searching...' : 'Search'}</button></div>
      <p class="muted" role="status" style="margin:12px 0 0">${escapeText(note)}</p>
      ${state.roomSearchWarnings.length ? `<p class="muted" style="font-size:12px">${escapeText(state.roomSearchWarnings.join(' · '))}</p>` : ''}
      <div class="kc-room-radar"><div class="smalltitle">⭐ Favorite rooms</div><div class="kc-room-chips">${state.roomFavorites.length?state.roomFavorites.map((r,i)=>`<button class="secondary" data-favvisit="${i}">⭐ ${escapeText(r.Name)} · ${escapeText(r.Space)}</button>`).join(''):'<span class="muted">Star a room below to save it here.</span>'}</div><div class="smalltitle">↺ Recently visited</div><div class="kc-room-chips">${state.roomRecent.slice().reverse().slice(0,8).map((r,i)=>`<span class="kc-room-recent">${escapeText(r.Name)} (${escapeText(r.Space)})</span>`).join('')||'<span class="muted">No recent visits through Kittychat.</span>'}</div></div>
      <div class="grid" style="margin-top:15px">${rooms.map(r => {const index=state.rooms.indexOf(r),key=`${r.Space}:${r.Name.toUpperCase()}`;return `<div class="roomcard"><div class="kc-roomcard-title"><strong>${escapeText(r.Name || 'Unnamed room')}</strong><button class="kc-room-star" data-roomstar="${index}" title="Favorite room">${favored.has(key)?'★':'☆'}</button></div><div class="muted">👥 ${Number(r.MemberCount) || 0}/${Number(r.MemberLimit) || '?'} · ${escapeText(r.Language || '')}${r.Space ? ` · ${escapeText(r.Space)}` : ''}</div><p>${escapeText(trim(r.Description || 'No description',150))}</p><button class="secondary" data-join="${index}">Visit room →</button></div>`;}).join('')}</div></div>`;
    // Safety net: even if a navigation/shortcut handler only switches the tab,
    // Room Explorer must never sit in an unsearched state. Defer so the new
    // controls exist before the search paints a loading indicator.
    if (state.open && state.tab === 'rooms' && !state.roomSearched && !state.roomLoading && !roomAutoSearchQueued) {
      roomAutoSearchQueued = true;
      Promise.resolve().then(() => {
        roomAutoSearchQueued = false;
        if (state.open && state.tab === 'rooms' && !state.roomSearched && !state.roomLoading) void searchRooms('room-open');
      });
    }
  }
  async function searchRooms(trigger = 'manual') {
    const current = ++state.roomsRequest;
    state.roomSearchTrigger = trigger;
    state.roomLastStarted = Date.now();
    state.roomLastFinished = 0;
    state.roomSearched = true;
    if (typeof window.ServerRoomSearch !== 'function') {
      state.roomError = 'BC room search has not loaded yet. Reopen Rooms or press Search to retry.';
      state.roomLoading = false;
      state.roomLastFinished = Date.now();
      if (state.tab === 'rooms') renderRooms();
      return;
    }
    const query = state.roomSearch.trim();
    // Rooms always searches every BC room space. There is no space-specific UI.
    const spaces = KITTY_ROOM_SPACES;
    state.roomLoading=true; state.roomError=''; state.roomSearchWarnings=[];
    state.rooms=[]; state.roomCounts={};
    if (state.tab === 'rooms') renderRooms();
    const combined = new Map();
    try {
      let errors = 0;
      for (const space of spaces) {
        if (current !== state.roomsRequest) return;
        try {
          const rooms = await searchRoomSpace(query, space);
          if (current !== state.roomsRequest) return;
          state.roomCounts[space] = rooms.length;
          for (const r of rooms) {
            if (!r || typeof r.Name !== 'string' || !r.Name.trim()) continue;
            const safeSpace=typeof r.Space==='string' && KITTY_ROOM_SPACES.includes(r.Space) ? r.Space : space;
            const key=`${safeSpace}:${r.Name.toUpperCase()}`;
            if(!combined.has(key))combined.set(key,{...r,Space:safeSpace});
          }
        } catch (err) {
          errors++;
          state.roomSearchWarnings.push(`${space}: ${String(err?.message || err).slice(0,90)}`);
        }
        // Show completed spaces immediately rather than hiding X results
        // while BC is still processing the M and F requests.
        if (current !== state.roomsRequest) return;
        state.rooms = [...combined.values()].sort((a,b) => (Number(b.MemberCount)||0) - (Number(a.MemberCount)||0)).slice(0,150);
        if (state.tab === 'rooms' && state.open) renderRooms();
      }
      if (current !== state.roomsRequest) return;
      if (errors === spaces.length) state.roomError = `Room search failed for ${spaces.join(', ')}. Check the details below.`;
      else if (!state.rooms.length) state.roomError = 'No matching public rooms were found in X, M, or F.';
    } finally {
      if (current === state.roomsRequest) {
        state.roomLoading=false;
        state.roomLastFinished=Date.now();
        if (state.tab === 'rooms') renderRooms();
      }
    }
  }
  // Marvelous Five Features: room journals are local, never auto-uploaded or scraped.
  // Screenshots are saved ONLY when a player explicitly attaches one.
  const marvelousRoomImages=new Map();
  let marvelousRoomDbPromise=null;
  const marvelousRoomDb=()=>{
    if(marvelousRoomDbPromise)return marvelousRoomDbPromise;
    marvelousRoomDbPromise=new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(Error('Browser has no IndexedDB'));return;}
      const req=indexedDB.open('MarvelousRoomMemoriesV1',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('captures');
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||Error('Room images unavailable'));
    }).catch(e=>{marvelousRoomDbPromise=null;throw e;});
    return marvelousRoomDbPromise;
  };
  async function marvelousImageStore(action,key,blob){
    const db=await marvelousRoomDb();return new Promise((resolve,reject)=>{
      const tx=db.transaction('captures',action==='read'?'readonly':'readwrite');
      const s=tx.objectStore('captures');const req=action==='write'?s.put(blob,key):action==='delete'?s.delete(key):s.get(key);
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
  }
  const marvelousRoomImageKey=(id)=>`${state.myId}:${id}`;
  async function marvelousShowImage(id){
    try{
      if(!marvelousRoomImages.has(id)){
        const blob=await marvelousImageStore('read',marvelousRoomImageKey(id));
        if(!blob||!blob.type?.startsWith('image/'))return;
        marvelousRoomImages.set(id,URL.createObjectURL(blob));
      }
      const img=ui.shadow?.querySelector(`[data-marv-memory-img="${id}"]`);
      if(img)img.src=marvelousRoomImages.get(id);
    }catch(e){console.warn('[Marvelous Room Memories] Could not read screenshot',e);}
  }
  async function marvelousAttachRoomImage(id,file){
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){notice('Select a PNG, JPEG or WebP image smaller than 2 MB.');return;}
    const memory=state.roomMemories.find(m=>m.id===id);
    if(!memory)return;
    try{
      await marvelousImageStore('write',marvelousRoomImageKey(id),file);
      if(marvelousRoomImages.has(id)){URL.revokeObjectURL(marvelousRoomImages.get(id));marvelousRoomImages.delete(id);}
      memory.hasImage=true;saveSoon();renderRoomMemories();notice('Screenshot kept privately in this browser.');
    }catch(e){notice('Screenshot could not be saved: '+String(e?.message||e).slice(0,80));}
  }
  const marvelousRoomMemoryFilters={query:'',favoritesOnly:false,view:'all',composeOpen:false};
  function renderRoomMemories(){
    if(state.open && (state.tab==='moments'||state.tab==='memories'))renderMoments();
  }
  const marvelousPetPrompt=(id,index)=>PET_PERSONAS[id]?.lines?.[index]||'';
  function renderPetPersonality(){
    if(!ui.body)return;
    const p=state.settings;
    const persona=PET_PERSONAS[p.petPersona]||PET_PERSONAS['curious-kitten'];
    ui.body.innerHTML=`<div class="marv-feature-page"><h2>🐾 Pet Personality Studio</h2><p class="muted">A roleplay identity, not a restraint or BC pose override. Only sharing your Paw Profile shows this badge to friends.</p>
      <div class="marv-feature-card"><label>Choose your personality<select class="field" id="marv-persona-choice">${Object.entries(PET_PERSONAS).map(([id,v])=>`<option value="${id}" ${id===p.petPersona?'selected':''}>${v.icon} ${v.name}</option>`).join('')}</select></label>
        <div class="marv-pet-icon">${persona.icon}</div><h3>${persona.name}</h3><p class="muted">${persona.trait}</p>
        <label>My custom pet description<textarea class="field" data-setting="petPersonaDescription" maxlength="300" rows="4" placeholder="Describe your pet personality in your own words…">${escapeText(p.petPersonaDescription||'')}</textarea></label>
        <p class="muted">Up to 300 characters. Saved on this device, and included when you choose to share your Paw Profile.</p>
        <label class="settingrow"><span>Include my pet badge and description when I share a Paw Profile</span><input type="checkbox" id="marv-persona-share" ${p.petPersonaShare?'checked':''}/></label>
      </div><div class="smalltitle">Themed roleplay expressions</div><p class="muted">Choose a line to copy. Nothing is sent to the chatroom automatically.</p>
      ${persona.lines.map((line,i)=>`<div class="marv-feature-card marv-prompt"><span>${escapeText(line)}</span><button class="secondary" data-action="marv-feature-copy-pet" data-index="${i}">Copy</button></div>`).join('')}</div>`;
  }
  // Focus Mode is intentionally opt-in and scoped to DOM overlays.
  // It never hides MainCanvas or overrides BC rendering functions.
  const marvelousFocusRuntime={enabled:false,style:null};
  function marvelousFocusCss(){
    if(marvelousFocusRuntime.style?.isConnected)return;
    const style=document.createElement('style');style.id='marvelous-pawlounge-focus-style';
    style.textContent=`
      body.marv-focus-conversation #ChatRoomMenu {opacity:0!important;pointer-events:none!important}
    `;document.head?.appendChild(style);marvelousFocusRuntime.style=style;
  }
  function applyMarvelousFocus(){
    marvelousFocusCss();
    const active=marvelousFocusRuntime.enabled&&window.CurrentScreen==='ChatRoom';
    document.body?.classList.remove('marv-focus-characters','marv-focus-conversation','marv-focus-cinematic');
    if(active)document.body?.classList.add('marv-focus-conversation');
    try{marvelousBridgeConnect()?.setExternalFocus?.(active);}catch{}
  }
  function toggleMarvelousFocus(enable){
    marvelousFocusRuntime.enabled=enable===undefined?!marvelousFocusRuntime.enabled:!!enable;
    applyMarvelousFocus();
    if(state.open&&state.tab==='focus')renderFocusMode();
    return marvelousFocusRuntime.enabled;
  }
  function renderFocusMode(){
    if(!ui.body)return;applyMarvelousFocus();
    const enabled=marvelousFocusRuntime.enabled;
    ui.body.innerHTML=`<div class="marv-feature-page"><h2>🎬 Conversation Focus</h2>
      <p class="muted">Keep the conversation in view by hiding compatible chatroom menu controls. Your character, clothing, and chat messages stay unchanged.</p>
      <div class="marv-feature-card">
        <button class="${enabled?'secondary':'primary'}" data-action="marv-feature-toggle-focus">${enabled?'Disable Focus Mode':'Enable Focus Mode'}</button>
        <p class="muted">Shortcut: <b>Alt + Shift + F</b>. Focus applies only in chatrooms; some BC canvas controls may remain visible.</p>
      </div></div>`;
  }
  function marvelousFeatureAction(action,el){
    if(action==='marv-feature-add-memory'){
      const d=state.roomMemoryDraft;
      const room=trim(d.name||window.ChatRoomData?.Name||'',110),notes=trim(d.notes,2000),tags=trim(d.tags,100);
      if(!room||!notes){notice('Enter a room name and a memory first.');return;}
      const id='rm_'+(crypto.randomUUID?.().replaceAll('-','')||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2));
      state.roomMemories.push({id,room,notes,tags,created:Date.now(),favorite:false,hasImage:false});
      state.roomMemories=state.roomMemories.slice(-60);state.roomMemoryDraft={name:'',notes:'',tags:''};marvelousRoomMemoryFilters.composeOpen=false;saveSoon();renderRoomMemories();notice('Saved privately to your local journal.');
    }else if(action==='marv-feature-favorite-memory'){
      const m=state.roomMemories.find(x=>x.id===el.dataset.id);if(m){m.favorite=!m.favorite;saveSoon();renderRoomMemories();}
    }else if(action==='marv-feature-delete-memory'){
      const id=el.dataset.id;if(!window.confirm('Delete this private room memory and its screenshot?'))return;
      state.roomMemories=state.roomMemories.filter(x=>x.id!==id);saveSoon();
      if(marvelousRoomImages.has(id)){URL.revokeObjectURL(marvelousRoomImages.get(id));marvelousRoomImages.delete(id);}
      void marvelousImageStore('delete',marvelousRoomImageKey(id)).catch(()=>{});renderRoomMemories();
    }else if(action==='marv-feature-copy-pet'){
      const line=marvelousPetPrompt(state.settings.petPersona,Number(el.dataset.index));
      if(!line)return;
      if(window.navigator.clipboard?.writeText){void window.navigator.clipboard.writeText(line).then(()=>notice('Copied roleplay expression.'),()=>window.prompt('Copy this expression:',line));}
      else window.prompt('Copy this expression:',line);
    }else if(action==='marv-feature-toggle-focus'){
      toggleMarvelousFocus();notice(marvelousFocusRuntime.enabled?'Focus Mode enabled (Alt+Shift+F to exit).':'Focus Mode disabled.');
    }
  }
  document.addEventListener('keydown',e=>{
    if(e.altKey&&e.shiftKey&&!e.ctrlKey&&!e.metaKey&&e.code==='KeyF'&&!e.repeat&&!e.target?.matches?.('input,textarea,select,[contenteditable]')){
      e.preventDefault();toggleMarvelousFocus();
    }
  },true);
  // Reapply only on screen transitions. No frequent DOM mutation observer.
  let marvelousLastFocusScreen='';
  function marvelousFocusTick(){
    if(!marvelousFocusRuntime.enabled)return;
    const screen=String(window.CurrentScreen||'');
    if(screen!==marvelousLastFocusScreen){marvelousLastFocusScreen=screen;applyMarvelousFocus();}
  }
  function renderSettings() {
    const p = state.settings;
    const control = (name, label) => `<div class="settingrow"><label for="kc-${name}">${label}</label><input type="checkbox" id="kc-${name}" data-setting="${name}" ${p[name] ? 'checked':''}/></div>`;
    ui.body.innerHTML = `<div class="screen"><div class="sectiontitle">⚙ PawLounge Settings</div><p class="muted">Personal preferences live on this browser only. No additional server is used.</p>
    <section class="paw-settings-section"><div class="smalltitle">🗃 Storage · My data / Other players / Shared</div>
    <p class="muted">Your memories and settings stay protected. Conversation archives stay separate. Only cached profiles of other players expire; favorites and members of your circles are excluded.</p>
    <label>Other-player profile cache retention<select class="field" data-setting="peerCacheDays">${[[1,'1 day'],[7,'7 days (default)'],[14,'14 days'],[30,'30 days']].map(([n,t])=>`<option value="${n}" ${Number(p.peerCacheDays)===n?'selected':''}>${t}</option>`).join('')}</select></label>
    <label>Temporary profile limit<select class="field" data-setting="peerCacheCap">${[50,100,200,400].map(n=>`<option value="${n}" ${Number(p.peerCacheCap)===n?'selected':''}>${n} profiles</option>`).join('')}</select></label>
    <div class="flex"><button class="secondary" data-action="pawstorage-report">Show storage breakdown</button><button class="secondary" data-action="pawstorage-clean">Clean expired other-player cache</button></div>
    <p class="muted">Marvelous cloud backups remain optional and passphrase-encrypted. Nothing is uploaded by this cleanup.</p></section>
    <section class="paw-settings-section"><div class="smalltitle">🏠 Subbycat's place · chat history</div>
    ${control('showSubbycatRecentMessages','Show the last 20 public messages from the previous session when I enter the room')}
    <p class="muted">Turning this off hides the previous-session message panel immediately. It does not erase your locally saved public messages or change BC's live chat. Whispers are never included.</p></section>
    <div class="smalltitle">🎨 Cozy appearance</div><div class="settingrow"><label for="kc-theme">Colour theme</label><select class="field" id="kc-theme" data-setting="theme">${VALID_THEMES.map(t => `<option value="${t}" ${p.theme === t ? 'selected':''}>${t==='midnight'?'Velvet (default)':t[0].toUpperCase()+t.slice(1)}</option>`).join('')}</select></div>
    <div class="settingrow"><label for="kc-fontSize">Text size / readability</label><select class="field" id="kc-fontSize" data-setting="fontSize"><option value="normal" ${p.fontSize==='normal'?'selected':''}>Standard</option><option value="large" ${p.fontSize==='large'?'selected':''}>Large (default)</option><option value="extra" ${p.fontSize==='extra'?'selected':''}>Extra large</option></select></div>
    <div class="settingrow"><span>Zoom-independent sizing</span><button class="secondary" data-action="calibratezoom" type="button">Set current zoom as 100% reference</button></div>
    <p class="muted">Desktop browser zoom is compensated relative to this reference. Calibrate at your preferred Firefox zoom. On mobile, normal touch-friendly sizing is used.</p>
    <div class="smalltitle">🪄 Layout &amp; chat bubbles</div>
    ${control('minimalist','Minimalist mode (hide decorative artwork)')}
    ${control('layoutEdit','Enable drag-and-drop sidebar editor')}<p class="muted">When enabled, drag Now Purring, Search, Circles and Inbox filter into your preferred order. Your layout is saved locally.</p>
    <label>Message bubble shape<select class="field" data-setting="bubbleShape">${[['rounded','Rounded'],['square','Squared'],['cloud','Cloudy']].map(([v,t])=>`<option value="${v}" ${p.bubbleShape===v?'selected':''}>${t}</option>`).join('')}</select></label>
    <label>Bubble opacity: ${p.bubbleOpacity}% <input type="range" min="50" max="100" step="5" value="${p.bubbleOpacity}" data-setting="bubbleOpacity"/></label>
    <p class="muted">Keyboard: Alt+K open/close, Alt+Shift+1–6 select tabs, Alt+↑/↓ move through contacts, Escape closes PawLounge, Enter sends and Shift+Enter adds a line.</p>
    <div class="smalltitle">🖱 Side panel scrolling</div>${control('panelScrollbars','Always show left and right panel scrollbars')}
    <p class="muted">Scroll the kitty name list and right widgets separately with the mouse wheel, trackpad, touch, or scrollbar. Your conversation stays in place.</p>
    <div class="smalltitle">🔔 Notifications</div>${control('notifications','Message alerts')}${control('sounds','Kitty chime (optional)')}${control('typing','Send typing paws in Beeps and Whispers')}<p class="muted">The other player must use PawLounge. Beeps work with verified BC friends; Whispers work with anyone in your current BC room. Typing paws disappear automatically after you stop typing.</p><div class="smalltitle">🔡 PawLounge data encoding</div>${control('encodePrivateChat','Encode native whisper/beep messages for updated PawLounge recipients only')}<div class="smalltitle">🌙 Quiet Hours</div>${control('quietHours','Silence PawLounge message alerts during these hours')}<div class="flex"><label>From<input class="field" data-setting="quietStart" type="time" value="${escapeText(p.quietStart)}"/></label><label>Until<input class="field" data-setting="quietEnd" type="time" value="${escapeText(p.quietEnd)}"/></label></div><p class="muted">Affects PawLounge alerts and chimes, not native BC presence or notifications.</p>
    ${pawPrivacySettingsMarkup()}<section class="paw-settings-section"><div class="smalltitle">🛡 Message Integrity Shield · active</div><p class="muted">Incoming addon packets are checked for valid senders, permissions, lengths, rate limits and replays. Group delivery acknowledgments are recipient-client reports, not proof of receipt or reading. Older plugin clients have limited replay protection.</p><p class="muted">This session: ${integrity.rejects} rejected · ${integrity.duplicates} duplicates blocked · ${integrity.rateLimited} rate-limited</p></section><section class="kc-status-settings"><div class="smalltitle">💗 Friend status</div>
      <p class="muted">Show a short status to your BC friends who use PawLounge. Your full Paw Profile stays separate.</p>
      <label>Status preset<select class="field" data-setting="friendStatusMode">${Object.keys(STATUS_MODES).map(mode=>`<option value="${escapeText(mode)}" ${p.friendStatusMode===mode?'selected':''}>${STATUS_MODES[mode]} ${escapeText(mode)}</option>`).join('')}</select></label>
      <label>Custom status message<input class="field" data-setting="friendStatusText" value="${escapeText(p.friendStatusText)}" placeholder="Cuddles welcome ♡" maxlength="100"/></label>
      <label>Status expires<select class="field" id="kc-status-duration" data-setting="friendStatusMinutes">${[[0,'Never'],[30,'After 30 minutes'],[60,'After 1 hour'],[240,'After 4 hours'],[1440,'After 24 hours']].map(([n,label])=>`<option value="${n}" ${Number(p.friendStatusMinutes)===n?'selected':''}>${label}</option>`).join('')}</select></label>
      <div class="settingrow"><label for="kc-shareFriendStatus">Automatically share status with PawLounge friends</label><input type="checkbox" id="kc-shareFriendStatus" data-setting="shareFriendStatus" ${p.shareFriendStatus?'checked':''}/></div>
      <button class="primary kc-publish-status" data-action="sharefriendstatus">🐾 Save &amp; Share Status</button>
      <div class="kc-status-example" role="status">Your status: ${p.shareFriendStatus?escapeText(statusLabel(me())):'Hidden from friends'}</div>
    </section>
    <div class="flex"><button class="secondary" data-tab="personality">🐾 Open Pet Personality Studio</button><button class="secondary" data-tab="moments">♡ Memories</button><button class="secondary" data-tab="focus">🎬 Room Focus</button></div><div class="smalltitle">🐾 Paw Profile</div><label>Avatar HTTPS image URL<input class="field" data-setting="avatar" value="${escapeText(p.avatar)}" placeholder="https://.../avatar.png" maxlength="500"/></label><label>Banner / hero HTTPS image URL<input class="field" data-setting="pawHero" value="${escapeText(p.pawHero)}" placeholder="https://.../hero.png" maxlength="500"/></label><label>Status / signature<input class="field" data-setting="signature" value="${escapeText(p.signature)}" maxlength="140"/></label><label>About me<input class="field" data-setting="pawAbout" value="${escapeText(p.pawAbout)}" maxlength="240"/></label><label>Likes<input class="field" data-setting="pawLikes" value="${escapeText(p.pawLikes)}" maxlength="240"/></label><label>Dislikes<input class="field" data-setting="pawDislikes" value="${escapeText(p.pawDislikes)}" maxlength="240"/></label><label>Looking for<input class="field" data-setting="pawLookingFor" value="${escapeText(p.pawLookingFor)}" maxlength="240"/></label><div class="flex" style="gap:10px"><label style="flex:1">Timezone<input class="field" data-setting="pawTimezone" value="${escapeText(p.pawTimezone)}" maxlength="60"/></label><label style="flex:1">Pronouns<input class="field" data-setting="pawPronouns" value="${escapeText(p.pawPronouns)}" maxlength="60"/></label></div><div class="smalltitle" style="margin-top:12px">🖼 Gallery (up to 4 HTTPS image URLs)</div><label>Gallery image 1<input class="field" data-setting="pawGallery1" value="${escapeText(p.pawGallery1)}" maxlength="500"/></label><label>Gallery image 2<input class="field" data-setting="pawGallery2" value="${escapeText(p.pawGallery2)}" maxlength="500"/></label><label>Gallery image 3<input class="field" data-setting="pawGallery3" value="${escapeText(p.pawGallery3)}" maxlength="500"/></label><label>Gallery image 4<input class="field" data-setting="pawGallery4" value="${escapeText(p.pawGallery4)}" maxlength="500"/></label>
    <div class="flex" style="margin-top:10px;gap:10px"><button class="secondary" data-action="previewmypawprofile">Preview my Paw Profile</button></div><p class="muted">Open a conversation and choose “Share Profile” to send this Paw Profile. No automatic profile sharing.</p>
    <section class="paw-settings-section"><div class="smalltitle">✨ Interactive Paw Profile 2.0</div>
      <label>Favorite plushie<input class="field" data-setting="pawPlushie" maxlength="80" value="${escapeText(p.pawPlushie)}" placeholder="My Subbycat plushie"/></label>
      ${control('shareLivePlushie','Include held plushie mood and relationship when sharing my Paw Profile')}<p class="muted">Only your own live preview updates automatically. Friends see the latest card you explicitly share; no automatic activity broadcasting.</p>
      <label>Profile badges (comma separated, up to 5)<input class="field" data-setting="pawBadges" maxlength="150" value="${escapeText(p.pawBadges)}" placeholder="Cuddle bug, Night owl"/></label>
      <label>Profile theme<select class="field" data-setting="pawProfileTheme">${[['velvet','Velvet'],['rose','Rose'],['midnight','Midnight'],['lavender','Lavender']].map(([id,label])=>`<option value="${id}" ${p.pawProfileTheme===id?'selected':''}>${label}</option>`).join('')}</select></label>
      ${control('pawGuestbookOpen','Allow BC friends to leave guestbook pawprints')}
      <div class="muted">Guestbook entries are private to your local PawLounge until you decide to share them.</div>
    </section>
    <section class="paw-settings-section"><div class="smalltitle">🔒 Device transfer</div><p class="muted">Encrypted backup includes your full IndexedDB message history, circles, Moments, albums, chat themes, Paw Profiles and settings. Choose a password you can remember; PawLounge cannot recover it.</p>
      <div class="flex"><button class="secondary" data-action="exportsecure">🔐 Export encrypted backup</button><button class="secondary" data-action="importsecure">📥 Import / merge backup</button></div><input class="hidden" type="file" id="paw-import-file" accept=".json,.pawbackup,application/json"/>
    </section>
    <div class="smalltitle">🖼 Image repository</div><label>Asset base URL<input class="field" data-setting="assetBase" value="${escapeText(p.assetBase)}" maxlength="500"/></label>
    <p class="muted">Use an HTTPS folder URL ending in /; for example the raw GitHub assets folder. Emoji fallbacks are shown if an image is missing.</p>
    <div class="smalltitle">💌 Quick paws (one per line)</div><textarea class="field" id="kc-quick-settings" rows="4" maxlength="600">${escapeText(p.shortcuts.join('\n'))}</textarea><div class="flex" style="margin-top:10px"><button class="secondary" data-action="savequick">Save quick paws</button><button class="secondary" data-action="resetwindow">Reset window to reference size</button><button class="secondary" data-action="downloadall">Export FULL history (JSON)</button><button class="secondary" data-action="importnativebeeps">Import available BC beeps</button><button class="secondary" data-action="clearall">Clear local chat history</button></div>
    <p class="muted">🐾 Messages are archived in browser IndexedDB without a fixed count limit (subject to browser storage space). Only the last 90 remain in the fast UI cache. Click “Load older messages” in a chat to browse further back. No server history is recovered from before installation.</p>
    <p class="muted" style="margin-top:16px">PawLounge v${VERSION} · Alt+K to open/close · Data saved separately per BC member number.</p></div>`;
  }
  // Keep the composer ready for the next message even if sending repaints the chat.
  function sendFromComposer() {
    const composer = ui.shadow?.getElementById('kc-compose');
    if (!composer) return false;
    const sent = (currentGroup() ? sendGroupMessage : sendText)(composer.value);
    if (state.open) {
      const nextComposer = ui.shadow?.getElementById('kc-compose');
      if (nextComposer) {
        ui.input = nextComposer;
        nextComposer.focus({preventScroll:true});
        const end = nextComposer.value.length;
        nextComposer.setSelectionRange(end,end);
      }
    }
    return sent;
  }
  function clickUI(e) {
    const target = e.target?.closest?.('[data-action],[data-tab],[data-contact],[data-quick],[data-sticker],[data-join],[data-react],[data-filter],[data-group],[data-group-accept],[data-group-decline],[data-facepop],[data-reply-msg],[data-save-moment],[data-book-save-message],[data-reaction-id],[data-jumpreply],[data-role-toggle],[data-kick-group-member],[data-roomstar],[data-favvisit],[data-momentshare],[data-momentdelete],[data-paw-circle-delete],[data-paw-circle-toggle],[data-paw-album],[data-paw-album-invite],[data-paw-album-rename],[data-paw-album-leave],[data-paw-album-moment],[data-paw-album-accept],[data-paw-album-decline],[data-paw-invite-accept],[data-paw-invite-decline],[data-paw-cancel-schedule],[data-paw-cover],[data-paw-pages],[data-paw-card-react],[data-paw-card-comment],[data-paw-card-move],[data-paw-vote],[data-paw-role],[data-outbox-retry],[data-outbox-cancel],[data-book-new-page],[data-book-edit],[data-book-note],[data-book-seal],[data-book-snapshot],[data-book-tag],[data-book-role],[data-book-group],[data-book-export],[data-book-activity],[data-book-timeline],[data-book-gift],[data-book-sync]');
    if (!target) return;
    if(target.dataset.action==='marv-prompt-unlock'){void marvelousPromptUnlock();return;}
    if(target.dataset.action==='marv-prompt-later'){marvelousPrompt.suppressed=true;marvelousPromptHide();return;}
    if(target.dataset.action==='marv-prompt-never'){
      try{localStorage.setItem(marvelousPromptNeverKey(me()),'1');}catch{}
      marvelousPrompt.suppressed=true;marvelousPromptHide();return;
    }
    if(target.dataset.action==='marv-prompt-allow'){
      try{localStorage.removeItem(marvelousPromptNeverKey(me()));}catch{}
      marvelousPrompt.suppressed=true;notice('Offline messaging unlock prompt enabled for next sign-in.');
      marvelousUpdate();return;
    }
    if(String(target.dataset.action||'').startsWith('marvhub-')){marvelousHubAction(target.dataset.action,target);return;}
    if(String(target.dataset.action||'').startsWith('marv-feature-')){void marvelousFeatureAction(target.dataset.action,target);return;}
    if(String(target.dataset.action||'').startsWith('marv-')){void marvelousAction(target.dataset.action,target);return;}
    if(target.dataset.outboxRetry!==undefined){retryFailedOutbox(target.dataset.outboxRetry);return;}
    if(target.dataset.outboxCancel!==undefined){cancelQueuedOutbox(target.dataset.outboxCancel);return;}
    if(target.dataset.pawCircleToggle!==undefined){const [id,field]=target.dataset.pawCircleToggle.split(':');togglePawCircleFlag(id,field);return;}
    if(target.dataset.pawCircleDelete!==undefined){const id=target.dataset.pawCircleDelete;if(window.confirm('Delete this friend circle?')){state.circles=state.circles.filter(c=>c.id!==id);if(state.circleFilter===id)state.circleFilter='';saveSoon();renderCircles();}return;}
    if(target.dataset.pawCancelSchedule!==undefined){cancelPawSchedule(target.dataset.pawCancelSchedule);return;}
    if(target.dataset.bookNewPage!==undefined){bookCreatePage(target.dataset.bookNewPage);return;}
    if(target.dataset.bookEdit!==undefined){const [a,p]=target.dataset.bookEdit.split('|');bookEditPage(a,p);return;}
    if(target.dataset.bookNote!==undefined){const [a,p]=target.dataset.bookNote.split('|');bookAddNote(a,p);return;}
    if(target.dataset.bookSeal!==undefined){const [a,p]=target.dataset.bookSeal.split('|');bookSealPage(a,p);return;}
    if(target.dataset.bookSnapshot!==undefined){const [a,p]=target.dataset.bookSnapshot.split('|');bookAddSnapshot(a,p);return;}
    if(target.dataset.bookTag!==undefined){const [a,c]=target.dataset.bookTag.split('|');bookTagMemory(a,c);return;}
    if(target.dataset.bookRole!==undefined){const [a,m]=target.dataset.bookRole.split('|');bookRoleChange(a,numeric(m));return;}
    if(target.dataset.bookGroup!==undefined){bookGroupLink(target.dataset.bookGroup);return;}
    if(target.dataset.bookExport!==undefined){bookKeepsake(target.dataset.bookExport);return;}
    if(target.dataset.bookGift!==undefined){bookGiftPage(target.dataset.bookGift);return;}
    if(target.dataset.bookSync!==undefined){bookRequestSync(target.dataset.bookSync);return;}
    if(target.dataset.bookActivity!==undefined){pawBookUI.activity=!pawBookUI.activity;renderPawBooks();return;}
    if(target.dataset.bookTimeline!==undefined){pawBookUI.timeline=!pawBookUI.timeline;renderPawBooks();return;}
    if(target.dataset.pawCover!==undefined){customizePawCover(target.dataset.pawCover);return;}
    if(target.dataset.pawPages!==undefined){changePawPageLayout(target.dataset.pawPages);return;}
    if(target.dataset.pawCardReact!==undefined){const [a,c,emoji]=target.dataset.pawCardReact.split('|');reactPawCard(a,c,emoji);return;}
    if(target.dataset.pawCardComment!==undefined){const [a,c]=target.dataset.pawCardComment.split('|');commentPawCard(a,c);return;}
    if(target.dataset.pawCardMove!==undefined){const [a,c,delta]=target.dataset.pawCardMove.split('|');movePawCard(a,c,Number(delta));return;}
    if(target.dataset.pawVote!==undefined){const [id,index]=target.dataset.pawVote.split('|');votePawPoll(id,Number(index));return;}
    if(target.dataset.pawRole!==undefined){pawGroupRole(numeric(target.dataset.pawRole));return;}
    if(target.dataset.pawAlbum!==undefined){state.albumView=target.dataset.pawAlbum;state.tab='pawbooks';renderPawBooks();return;}
    if(target.dataset.pawAlbumInvite!==undefined){inviteAlbumFriend(target.dataset.pawAlbumInvite);return;}
    if(target.dataset.pawAlbumRename!==undefined){renameSharedAlbum(target.dataset.pawAlbumRename);return;}
    if(target.dataset.pawAlbumLeave!==undefined){leaveSharedAlbum(target.dataset.pawAlbumLeave);return;}
    if(target.dataset.pawAlbumMoment!==undefined){addMomentToAlbum(target.dataset.pawAlbumMoment);return;}
    if(target.dataset.pawAlbumAccept!==undefined){answerAlbumInvite(target.dataset.pawAlbumAccept,true);return;}
    if(target.dataset.pawAlbumDecline!==undefined){answerAlbumInvite(target.dataset.pawAlbumDecline,false);return;}
    if(target.dataset.pawInviteAccept!==undefined){answerPawInvite(target.dataset.pawInviteAccept,true);return;}
    if(target.dataset.pawInviteDecline!==undefined){answerPawInvite(target.dataset.pawInviteDecline,false);return;}
    if (target.dataset.facepop !== undefined) { popFace(target); return; }
    if (target.dataset.jumpreply!==undefined) {const el=ui.shadow?.querySelector(`[data-message-id="${CSS.escape(target.dataset.jumpreply)}"]`);if(el){el.scrollIntoView({block:'center'});el.classList.add('kc-highlight-message');}else notice('Use Load older messages to find the original.');return;}
    if (target.dataset.replyMsg!==undefined) {setReplyTarget(target.dataset.replyMsg);return;}
    if (target.dataset.bookSaveMessage!==undefined){bookAddFromConversation(target.dataset.bookSaveMessage);return;}
    if (target.dataset.saveMoment!==undefined) {saveMessageAsMoment(target.dataset.saveMoment);return;}
    if (target.dataset.reactionId!==undefined) {replyAndReact(currentConversationKind(),target.dataset.reactionId,target.dataset.emoji);return;}
    if (target.dataset.kickGroupMember!==undefined) {changeGroupMember('kick',target.dataset.kickGroupMember);return;}
    if (target.dataset.roleToggle!==undefined) {const g=currentGroup(),id=numeric(target.dataset.roleToggle);if(g?.creator===me()&&g.members.includes(id)&&id!==me()){g.moderators||=[];g.moderators=g.moderators.includes(id)?g.moderators.filter(x=>x!==id):[...g.moderators,id];syncGroup(g);saveSoon();renderGroupChat();}return;}
    if (target.dataset.tab) {state.compactOpen=['chats','groups'].includes(target.dataset.tab); state.tab=target.dataset.tab==='memories'?'moments':target.dataset.tab;state.replyTarget=null;render();if (state.tab==='rooms') void searchRooms('rooms-tab');return;}
    if (target.dataset.contact) { selectChat(numeric(target.dataset.contact)); return; }
    if (target.dataset.group){selectGroup(target.dataset.group);return;}
    if (target.dataset.groupAccept){respondGroup(target.dataset.groupAccept,true);return;}
    if (target.dataset.groupDecline){respondGroup(target.dataset.groupDecline,false);return;}
    if (target.dataset.filter) { const mode=target.dataset.filter; if(!['all','online','inroom','unread','favorites','later','requests','muted','pinned'].includes(mode))return; state.contactsMode = mode; if(mode==='online') pawRequestPresenceForDelivery(); renderSidebar(); const list=ui.menu?.querySelector('.contacts-scroll'); if (list) list.scrollTop=0; state.panelScroll.left=0; return; }
    if (target.dataset.quick !== undefined) { (currentGroup()?sendGroupMessage:sendText)(state.settings.shortcuts[Number(target.dataset.quick)]); return; }
    if (target.dataset.react !== undefined) { const chosen=window.prompt('Reaction emoji: 💗 🐾 😽 ✨ 😹','💗');if(chosen)replyAndReact(currentConversationKind(),target.dataset.react,trim(chosen,12));return; }
    if (target.dataset.sticker) { const st = STICKERS.find(x => x.id === target.dataset.sticker); if (!st) return; if (!currentGroup() && !state.chats[state.selected]) { notice('Choose a kitty or Group Den before sending a sticker.'); return; } (currentGroup()?sendGroupMessage:sendText)(`🐱 Kittychat sticker: ${st.name} ${st.emoji}`); return; }
    if(target.dataset.roomstar!==undefined){const r=state.rooms[Number(target.dataset.roomstar)];if(r){const key=`${r.Space}:${r.Name.toUpperCase()}`;const found=state.roomFavorites.findIndex(x=>`${x.Space}:${x.Name.toUpperCase()}`===key);if(found>=0)state.roomFavorites.splice(found,1);else state.roomFavorites.push({Name:r.Name,Space:r.Space});saveSoon();renderRooms();}return;}
    if(target.dataset.favvisit!==undefined){joinRoomFromRadar(state.roomFavorites[Number(target.dataset.favvisit)]);return;}
    if (target.dataset.momentshare!==undefined){sendPawMoment(target.dataset.momentshare);return;}
    if (target.dataset.momentdelete!==undefined){if(window.confirm('Delete this saved Paw Moment?')){state.moments=state.moments.filter(m=>m.id!==target.dataset.momentdelete);saveSoon();bookRender();}return;}
    if(target.dataset.join!==undefined){joinRoomFromRadar(state.rooms[Number(target.dataset.join)]);return;}
    const act = target.dataset.action;
    if(act==='pawstorage-report'){
      const d=window.PawLoungeStorageCategories();
      notice(`Mine ${d.estimatedKiB.mine} KiB · Shared ${d.estimatedKiB.shared} KiB · Other ${d.estimatedKiB.otherPlayers} KiB`);
      console.info('[PawLounge] Local storage categories (sizes only)',d);return;
    }
    if(act==='pawstorage-clean'){
      void window.PawLoungeCleanupOtherPlayers().then(r=>{
        notice(`Removed ${r.removed} expired profiles; kept ${r.kept}.`);
        if(state.tab==='settings')renderSettings();
      }).catch(e=>notice('Storage cleanup unavailable: '+String(e.message||e)));return;
    }
    if (act === 'bookvaultenable') void bookVaultEnable();
    else if (act === 'bookvaultunlock') void bookVaultUnlock();
    else if (act === 'bookvaultlock') void bookVaultLock();
    else if (act === 'securechat') pawSecureOpenModal();
    else if (act === 'pawsecuresave') pawSecureSaveKey();
    else if (act === 'pawsecureforget') pawSecureForgetKey();
    else if (act === 'pawsecureclose') pawSecureCloseModal();
    else if (act === 'pawsecuregenerate') pawSecureGenerateKey();
    else if (act === 'close') toggle(false);
    else if (act === 'inboxscrollleft' || act === 'inboxscrollright') scrollInboxFilters(act === 'inboxscrollleft' ? -1 : 1);
    else if (act === 'opencircles') {state.tab='circles';render();}
    else if (act === 'newcircle') createPawCircle();
    else if (act === 'assigncircle') assignPawCircle(state.selected);
    else if (act === 'kittyinvite') offerPawInvite();
    else if (act === 'leaveguestbook') leavePawGuestbook();
    else if (act === 'markcatchup') {state.catchUpSince=Date.now();state.catchUpWhispersSince=state.catchUpSince;state.catchUpGroupsSince=state.catchUpSince;saveSoon();renderCatchUp();}
    else if (act === 'markwhisperscaughtup') markCatchUpCategory('whispers');
    else if (act === 'markgroupscaughtup') markCatchUpCategory('groups');
    else if (act === 'catchupacceptall') bulkAnswerCatchUpInvitations(true);
    else if (act === 'catchupdeclineall') bulkAnswerCatchUpInvitations(false);
    else if (act === 'newalbum') createSharedAlbum();
    else if (act === 'openpawbooks') {state.tab='pawbooks';state.albumView='';render();}
    else if (act === 'pawbooksmoments'){state.tab='moments';render();}
    else if (act === 'bookback'){state.albumView='';pawBookUI.timeline=false;pawBookUI.activity=false;renderPawBooks();}
    else if (act === 'nickname') pawNickname();
    else if (act === 'schedulepaw') schedulePawMessage();
    else if (act === 'toggleoutbox') toggleOutboxPopover();
    else if (act === 'grouppoll') makePawPoll();
    else if (act === 'groupannouncement') pawGroupAnnouncement();
    else if (act === 'exportsecure') void exportPawBackup(true);
    else if (act === 'importsecure') ui.shadow?.getElementById('paw-import-file')?.click();
    else if (act === 'calibratezoom') {
      if(isMobileLayout()){notice('Desktop zoom calibration is not needed on mobile.');return;}
      state.settings.zoomReferenceDpr=Number(window.devicePixelRatio)||1;
      syncZoomAndMobile(true);saveSoon();notice('PawLounge zoom reference updated.');
    }
    else if (act === 'resetwindow') { state.windowRect = defaultWindowRect(); applyWindowRect(); saveSoon(); notice('Window size and position restored.'); }
    else if (act === 'new') { const val = window.prompt('Kitty member number (BC ID):'); if (val !== null) {
      const id = numeric(val); if (id && id !== me()) selectChat(id); else notice('Please enter a valid member number.'); } }
    else if(act==='groupinvite'){
      const number=window.prompt('BC member number to invite to this Group Den:');
      if(number!==null)changeGroupMember('invite',number);
    }
    else if (act === 'newgroup') {state.groupCreateOpen=true;renderGroupModal();ui.shadow.getElementById('kc-group-name')?.focus();}
    else if (act === 'cancelgroup') {state.groupCreateOpen=false;renderGroupModal();}
    else if (act === 'creategroup') {const picked=[...ui.shadow.querySelectorAll('input[name="kc-group-member"]:checked')].map(x=>numeric(x.value));createGroup(ui.shadow.getElementById('kc-group-name')?.value,picked);}
    else if (act === 'leavegroup') leaveGroup();
    else if (act === 'resendgroup') {const g=currentGroup();if(g && g.creator===me()){let sent=0;for(const id of g.members)if(id!==me() && !g.accepted.includes(id))if(sendGroupWire(id,{t:'invite',id:g.id,creator:g.creator,name:g.name,members:g.members},`💌 Invitation to group “${g.name}”. Open PawLounge to accept.`))sent++;notice(`Sent ${sent} reminder invites.`);}}
    else if (act==='replylater') {const c=state.chats[state.selected];if(c){c.replyLater=!c.replyLater;saveSoon();render();}}
    else if (act==='snoozechat') {const c=state.chats[state.selected];if(c){c.snoozeUntil=c.snoozeUntil>Date.now()?0:Date.now()+3600000;saveSoon();render();}}
    else if (act==='acceptrequest') {const c=state.chats[state.selected];if(c){c.requestPending=false;c.requestAccepted=true;saveSoon();render();notice('Message request accepted.');}}
    else if (act === 'whisperquick') {state.composerMode='whisper';const mode=ui.shadow.getElementById('kc-mode');if(mode)mode.value='whisper';ui.shadow.getElementById('kc-compose')?.focus();notice(inRoom(state.selected)?'Whisper mode selected.':'Whisper requires you both to be in the same BC room.');}
    else if (act === 'toggleleftpanel') {
      if (isCompactCollapseLayout()) state.compactOpen = !state.compactOpen;
      else state.leftCollapsed = !state.leftCollapsed;
      saveSoon(); render();
    }
    else if (act === 'togglerightpanel') {
      if (isRightDrawerLayout()) { state.rightDrawerOpen = !state.rightDrawerOpen; render(); }
      else { state.rightCollapsed = !state.rightCollapsed; saveSoon(); render(); }
    }
    else if (act === 'beepquick') {state.composerMode='beep';const mode=ui.shadow.getElementById('kc-mode');if(mode)mode.value='beep';ui.shadow.getElementById('kc-compose')?.focus();notice('Beep mode selected.');}
    else if (act === 'roomshortcut') {state.tab='rooms';render();void searchRooms('rooms-shortcut');}
    else if (act === 'send') sendFromComposer();
    else if (act === 'loadolderhistory') void loadOlderHistory();
    else if (act === 'cancelreply') {state.replyTarget=null;renderReplyBar();}
    else if (act==='memoryhub-compose'){marvelousRoomMemoryFilters.composeOpen=!marvelousRoomMemoryFilters.composeOpen;renderMoments();if(marvelousRoomMemoryFilters.composeOpen)ui.shadow.getElementById('marv-memory-room')?.focus();}
    else if (act==='memoryhub-view-all'||act==='memoryhub-view-moments'||act==='memoryhub-view-rooms'){marvelousRoomMemoryFilters.view=act.slice('memoryhub-view-'.length);renderMoments();}
    else if (act==='newmoment')addOwnMoment();
    else if (act==='momentsfromchat'){state.tab='chats';render();}
    else if (act === 'recovergroup') {const g=currentGroup();if(g){
      const recipients=g.accepted.filter(n=>n!==me()&&myFriends().includes(n));
      if(recipients.length<RECOVERY_QUORUM){notice('Recovery requires two other accepted group members who are BC friends.');return;}
      // One round = one separate challenge per other member and at most 90s.
      for(const n of g.accepted)integrity.recovery.delete(integrityRecoveryKey(g.id,n));
      const round={until:Date.now()+RECOVERY_TTL,candidates:new Map(),members:new Set(),reporters:new Set(),confirmed:0};
      integrity.quorums.set(g.id,round);
      const after=Date.now()-7*86400000;
      for(const n of recipients){
        const rid=integrityRequestRecovery(g.id,n,after);
        if(sendGroupWire(n,{t:'historyRequest',id:g.id,after,rid,quorum:RECOVERY_QUORUM},'🐾 History quorum request',true))round.members.add(n);
        else integrity.recovery.delete(integrityRecoveryKey(g.id,n));
      }
      if(round.members.size<RECOVERY_QUORUM){integrity.quorums.delete(g.id);notice('Unable to contact two members for recovery.');}
      else notice(`Requested recovery witnesses from ${round.members.size} people. Awaiting two matching reports per message.`);
      if(state.open)renderGroupChat();
    }}
    else if (act === 'stickers') ui.shadow.getElementById('kc-stickers')?.classList.toggle('hidden');
    else if (act === 'profile') sendProfile();
    else if (act === 'viewpawprofile') openViewProfileModal(state.selected);
    else if (act === 'previewmypawprofile') openViewProfileModal(me(), true);
    else if (act === 'sharefriendstatus') {
      for (const key of ['friendStatusText','friendStatusMode']) {
        const field=ui.shadow.querySelector(`[data-setting="${key}"]`);
        if (field) state.settings[key] = key==='friendStatusText' ? trim(field.value,100) : field.value;
      }
      const toggle=ui.shadow.getElementById('kc-shareFriendStatus');
      if (toggle) state.settings.shareFriendStatus=toggle.checked;
      const minutes=ui.shadow.getElementById('kc-status-duration');
      if(minutes)state.settings.friendStatusMinutes=[0,30,60,240,1440].includes(Number(minutes.value))?Number(minutes.value):0;
      scheduleStatusExpiry();saveSoon();publishFriendStatus(true);renderSettings();
    }
    else if (act === 'confirmshareprofile') { sendProfileNow(state.profileModal?.member || state.selected); closeProfileModal(); }
    else if (act === 'cancelshareprofile' || act === 'closeprofilemodal') closeProfileModal();
    else if (act === 'searchmessages') {
      const phrase = window.prompt('Search messages in this conversation (blank to show all):', state.messageSearch);
      if (phrase !== null) { state.messageSearch = trim(phrase,100); renderMessages(); }
    }
    else if (act === 'favorite' || act === 'pin') { const c = state.chats[state.selected]; if (c) { c[act === 'pin' ? 'pinned':'favorite'] = !c[act === 'pin' ? 'pinned':'favorite']; saveSoon(); renderSidebar(); renderChatHeader(); } }
    else if (act === 'menu') {
      const id = state.selected, c = state.chats[id]; if (!c) return;
      const chosen = window.prompt('Chat options: 1 = mute/unmute (including native BC sounds), 2 = rename, 3 = export TXT, 4 = export JSON, 5 = delete history', '1');
      if (chosen === '1') { c.muted = !c.muted; notice(c.muted ? 'Muted: BC beeps and whispers from this kitty will be silent.' : 'Unmuted: BC sounds restored for this kitty.'); saveSoon(); renderSidebar(); renderChatHeader(); }
      if (chosen === '2') { const n = window.prompt('Local nickname (blank = reset):',c.nickname || ''); if (n !== null) { c.nickname = trim(n, 80); saveSoon(); render(); } }
      if (chosen === '3') exportHistory('txt'); if (chosen === '4') exportHistory('json');
      if (chosen === '5' && window.confirm('Delete this conversation and ALL archived messages from this browser?')) { c.messages=[]; c.unread=0; void eraseArchivedHistory(state.myId,'chat',id); saveSoon(); render(); updateBadge(); }
    }
    else if (act === 'searchrooms') void searchRooms('search-button');
    else if (act === 'savequick') { state.settings.shortcuts = ui.shadow.getElementById('kc-quick-settings').value.split('\n').map(x=>trim(x,120)).filter(Boolean).slice(0,6); saveSoon(); notice('Quick paws saved.'); }
    else if (act === 'downloadall') void exportFullHistory();
    else if (act === 'importnativebeeps') importAvailableNativeBeeps();
    else if (act === 'clearall' && window.confirm('Permanently delete all Kittychat conversation history for this BC account on this browser?')) {
      const account=state.myId;state.historyEpoch++;state.historyOlder=[];state.historySelection='';
      state.chats = {}; state.groups={};state.roomHistory=[];roomReplay.snapshot=[];document.getElementById('kc-subbycat-previous-session')?.remove();state.selectedGroup='';state.selected = 0; saveNow(); updateBadge(); render(); void eraseArchivedHistory(account); notice('Clearing local Kittychat cache and archive.'); }
  }
  function inputUI(e) {
    const t = e.target;
    if(t.id==='marvhub-to'){marvelousHub.target=t.value;return;}
    if(t.id==='marvhub-text'){marvelousHub.note=t.value;return;}
    if(t.id==='marvhub-signal'){marvelousHub.signal=t.value;return;}
    if(t.id==='marv-memory-search'){
      marvelousRoomMemoryFilters.query=t.value;
      const pos=t.selectionStart;renderRoomMemories();const field=ui.shadow.getElementById('marv-memory-search');
      field?.focus();field?.setSelectionRange(pos,pos);return;
    }
    if(t.id==='marv-memory-room'){state.roomMemoryDraft.name=t.value;return;}
    if(t.id==='marv-memory-note'){state.roomMemoryDraft.notes=t.value;return;}
    if(t.id==='marv-memory-tags'){state.roomMemoryDraft.tags=t.value;return;}
    if(t.id==='marv-send-at'){marvelousNotes.sendAt=t.value;return;}
    if(t.id==='kc-marv-to'){marvelousNotes.draftTo=t.value;return;}
    if(t.id==='kc-marv-body'){marvelousNotes.draftBody=t.value;return;}
    if(t.id==='kc-marv-handle'){marvelousNotes.draftAlias=t.value;return;}
    if(t.id==='pawbook-search'){pawBookUI.query=t.value;const pos=t.selectionStart;renderPawBooks();const field=ui.shadow.getElementById('pawbook-search');field?.focus();field?.setSelectionRange(pos,pos);return;}
    if (t.id === 'kc-search') { state.search = t.value; // Preserve focus and cursor after sidebar repaint.
      const pos = t.selectionStart; renderSidebar(); const s = ui.shadow.getElementById('kc-search'); s?.focus(); s?.setSelectionRange(pos,pos); const list=ui.menu?.querySelector('.contacts-scroll'); if (list) list.scrollTop=0; state.panelScroll.left=0; }
    else if (t.id === 'kc-compose') {if (currentGroup() && state.tab==='groups'){currentGroup().draft=trim(t.value,MAX_GROUP_TEXT);saveSoon();return;}const c = state.chats[state.selected]; if (c) { c.draft = t.value; saveSoon(); sendTyping(); } }
    else if (t.id === 'kc-group-search') { state.groupSearch=t.value;const pos=t.selectionStart;renderGroupsSidebar();const field=ui.shadow.getElementById('kc-group-search');field?.focus();field?.setSelectionRange(pos,pos);const list=ui.menu?.querySelector('.contacts-scroll');if(list)list.scrollTop=0;state.panelScroll.left=0; }
    else if (t.id === 'kc-roomquery') state.roomSearch = t.value;
  }
  function changeUI(e) {
    const t = e.target;
    if(t.id==='marv-memory-favorites'){marvelousRoomMemoryFilters.favoritesOnly=!!t.checked;renderRoomMemories();return;}
    if(t.id==='kc-marv-keyfile'){
      const file=t.files?.[0],password=String(ui.shadow?.getElementById('kc-marv-pass')?.value||'');
      if(file)void marvelousRun(()=>marvelousRestoreVault(file,password));
      t.value='';return;
    }
    if(t.id==='marv-message-ttl'){marvelousNotes.ttl=t.value;return;}
    if(t.id==='marvhub-ns'){marvelousHub.selectedNamespace=t.value;return;}
    if(t.id==='marvhub-notification-category'){marvelousHub.notificationCategory=['all','note','invitation','guestbook','scrapbook','plushie','group'].includes(t.value)?t.value:'all';renderMarvelousHub();return;}
    if(t.id==='marvhub-notification-unread'){marvelousHub.notificationUnreadOnly=!!t.checked;renderMarvelousHub();return;}
    if(t.dataset.marvhubPerm){marvelousHub.options[t.dataset.marvhubPerm]=!!t.checked;return;}
    if(t.id==='marvhub-public'){marvelousHub.publicSignal=t.checked;return;}
    if(t.id==='marvhub-available'){marvelousHub.availability=t.checked;return;}
    if(t.id==='marvhub-guestbook'){marvelousHub.guestbook=t.checked;return;}
    if(t.dataset.memoryFile){void marvelousAttachRoomImage(t.dataset.memoryFile,t.files?.[0]);t.value='';return;}
    if(t.id==='marv-persona-choice'){state.settings.petPersona=Object.hasOwn(PET_PERSONAS,t.value)?t.value:'curious-kitten';saveSoon();renderPetPersonality();return;}
    if(t.id==='marv-persona-share'){state.settings.petPersonaShare=t.checked;saveSoon();renderPetPersonality();return;}
    if(t.id==='paw-circle-filter'){state.circleFilter=t.value;renderSidebar();return;}
    if(t.id==='paw-theme-current'){const c=state.chats[state.selected];if(c&&Object.hasOwn(PAW_CHAT_THEMES,t.value)){c.pawTheme=t.value;saveSoon();renderChat();}return;}
    if(t.id==='paw-import-file'){const file=t.files?.[0];if(file)void importPawBackup(file);t.value='';return;}
    if (t.id === 'kc-mode') { state.composerMode = ['beep','whisper','offline'].includes(t.value)?t.value:'beep'; if(state.composerMode==='offline')notice('📮 Offline Notes are encrypted, saved for 7 days, and require both members to have verified mailboxes. Unlock Paw Notes first.'); return; }
    if (t.id === 'kc-roomsort') {state.roomSort=t.value;saveSoon();renderRooms();return;}
    const k = t.dataset.setting; if (!k || !Object.hasOwn(DEFAULT_SETTINGS,k)) return;
    const value = t.type === 'checkbox' ? t.checked : t.value;
    if (k === 'assetBase') { if (!/^https:\/\/[^\s]+\/$/.test(value)) { notice('Asset base must be an HTTPS URL ending with /.'); return; } }
    if ((k === 'avatar' || k === 'pawHero' || /^pawGallery[1-4]$/.test(k)) && value && !/^https:\/\//i.test(value)) { notice('Profile images must use HTTPS URLs.'); return; }
    if (k==='friendStatusText' && String(value).length>100) { notice('Status is limited to 100 characters.'); return; }
    if (k==='petPersonaDescription' && String(value).length>300) { notice('Pet description is limited to 300 characters.'); return; }
    if (k==='friendStatusMode' && !Object.hasOwn(STATUS_MODES,value)) return;
    if(k==='friendStatusMinutes' && ![0,30,60,240,1440].includes(Number(value))) return;
    if(k==='peerCacheDays' && !PAW_PEER_DAYS.includes(Number(value)))return;
    if(k==='peerCacheCap' && !PAW_PEER_CAPS.includes(Number(value)))return;
    state.settings[k] = ['friendStatusMinutes','peerCacheDays','peerCacheCap'].includes(k)?Number(value):value;
    if (k === 'showSubbycatRecentMessages') restoreSubbycatRoomHistory();
    if(['friendStatusText','friendStatusMode','shareFriendStatus','friendStatusMinutes'].includes(k))scheduleStatusExpiry();
    saveSoon();
    if (['friendStatusText','friendStatusMode','shareFriendStatus','friendStatusMinutes'].includes(k)) {
      publishFriendStatus(false);
      if (k!=='friendStatusText') renderSettings();
      else { const view=ui.shadow?.querySelector('.kc-status-example'); if(view) view.textContent=`Your status: ${statusLabel(me()) || 'Hidden from friends'}`; }
    }
    if (k === 'panelScrollbars') setTheme();
    if (['minimalist','layoutEdit','bubbleShape','bubbleOpacity'].includes(k)) {setTheme();if(k==='layoutEdit')render();}
    if(['quietStart','quietEnd'].includes(k)&&!validHour(value)){state.settings[k]=DEFAULT_SETTINGS[k];notice('Use a valid HH:MM time.');}
    if (k === 'theme' || k === 'fontSize' || k === 'assetBase' || k==='minimalist' || k==='bubbleShape' || k==='bubbleOpacity') render();
  }
  function keyUI(e) {
    if(e.target?.id==='kc-offline-unlock-password'&&e.key==='Enter'){
      e.preventDefault();e.stopPropagation();void marvelousPromptUnlock();return;
    }
    if (e.target?.classList?.contains('kc-filter-scroll-track')) {
      const viewport = ui.menu?.querySelector('.kc-inbox-filters');
      if (viewport && ['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
        e.preventDefault(); e.stopPropagation();
        if (e.key === 'Home') viewport.scrollLeft = 0;
        else if (e.key === 'End') viewport.scrollLeft = viewport.scrollWidth;
        else scrollInboxFilters(e.key === 'ArrowLeft' ? -1 : 1);
        syncInboxFilterBar();
        return;
      }
    }
    if(e.altKey&&!e.ctrlKey&&!e.metaKey&&['ArrowUp','ArrowDown'].includes(e.key)&&state.tab==='chats'){
      const items=contactItems();const pos=items.indexOf(state.selected),next=items[Math.max(0,Math.min(items.length-1,pos+(e.key==='ArrowDown'?1:-1)))];
      if(next){e.preventDefault();e.stopPropagation();selectChat(next);}return;
    }
    if(!e.ctrlKey&&e.shiftKey&&e.altKey&&!e.metaKey&&/^[1-7]$/.test(e.key)&&!e.target?.matches?.('input,textarea,select')){
      const tab=['chats','groups','pawbooks','catchup','rooms','stickers','moments'][Number(e.key)-1];
      if(tab){e.preventDefault();e.stopPropagation();state.tab=tab;render();return;}
    }
    if (e.key === 'Escape' && state.profileModal) { e.stopPropagation(); closeProfileModal(); return; }
    if (e.key === 'Escape' && state.open) { e.stopPropagation(); toggle(false); return; }
    if (e.target?.id === 'kc-roomquery' && e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); void searchRooms('enter-key'); return; }
    if (e.target?.id === 'kc-compose' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault(); e.stopPropagation(); sendFromComposer(); return;
    }
    // Avoid BC processing shortcuts while the user types into our own shadow root.
    if (e.target?.matches?.('input,textarea,select')) e.stopPropagation();
  }
  function hotkeys(e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'k') {
      e.preventDefault(); e.stopImmediatePropagation(); toggle(); return;
    }
  }
  let lastVisibleRosterSignature='';
  function tick() {
    const id = me();
    if (!id) { marvelousPromptHide();marvelousPrompt.account=0; if (!ui.host && document.body) buildUI(); return; }
    if (state.myId !== id) { if (state.myId) saveNow(true); pawSecureResetSession(); motionRuntime.active=0; typingSendTimes.clear();state.typingUntil={}; wceSnapshotRuntime.temporaryPortraits.clear(); steadyRemotePortraits.clear(); recentRoomPortraits.clear(); wceSnapshotRuntime.attempts.clear(); wceSnapshotRuntime.reports.clear(); wceSnapshotRuntime.dbMissingUntil=0; state.recentFingerprints.clear(); if (ui.host) { ui.host.remove(); Object.assign(ui,{host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null,input:null}); state.open = false; fabCoexistence.temporary=null; } loadForAccount(id); }
    if (ui.host && (!ui.host.isConnected || !ui.panel || !ui.shadow || !ui.fab || !ui.body || !ui.fab.isConnected)) { motionRuntime.active=0; try { ui.host.remove(); } catch {} Object.assign(ui,{host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null}); }
    if (!ui.host) buildUI();
    if(!Number.isFinite(Number(state.settings.zoomReferenceDpr))||Number(state.settings.zoomReferenceDpr)<=0){
      state.settings.zoomReferenceDpr=Number(window.devicePixelRatio)||1;
      saveSoon();
    }
    syncZoomAndMobile();
    // Recover from BC or another addon replacing part of the mounted UI.
    if (ui.host && ui.shadow && !ui.shadow.getElementById('kc-resize')) {
      motionRuntime.active=0; ui.host.remove();
      Object.assign(ui,{host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null});
      buildUI();
    }
    hookBC();
    marvelousPromptTick();
    // A small once-per-login refresh for friends known to have Kittychat.
    if (statusWire.bootAccount!==id && typeof window.ServerSend==='function') {
      statusWire.bootAccount=id;
      if (state.settings.shareFriendStatus) publishFriendStatus(false);
    }
    restoreSubbycatRoomHistory();
    deliverScheduledMessages();
    dispatchOutbox();
    if (state.open && state.tab === 'rooms' && !state.roomLoading && state.roomError.startsWith('BC room search has not loaded yet.') && typeof window.ServerRoomSearch === 'function') void searchRooms('bc-search-ready');
    if (state.open && state.tab==='chats') {
      const roster=roomRosterSignature();
      if(roster!==lastVisibleRosterSignature){
        lastVisibleRosterSignature=roster;
        // Only update the sidebar when the membership/names truly changed.
        // Rebuilding it every tick would reset focus and cause avatar flicker.
        renderSidebar();
        // Update the selected conversation's room-presence subtitle too.
        // Do not rebuild the composer or message history when the roster changes.
        renderChatHeader();
      }
    }
    if (state.open) schedulePortraits();
    if (state.open && state.tab === 'chats' && !state.selected && !state.selectedGroup && (Object.keys(state.chats).length || myFriends().length)) render();
    if (state.open && state.selected && state.typingUntil[state.selected] && state.typingUntil[state.selected] < Date.now()) {
      state.typingUntil[state.selected] = 0; renderChatHeader();
    }
    state.started = true;
  }
  window.KittyChat = Object.freeze({ version: VERSION,
    nativeMuteDiagnostics: id => ({ version: VERSION, member: numeric(id), muted: isMutedNativeContact(id), bcSoundHooks: !!state.mod, serverShowBeepAvailable: typeof window.ServerShowBeep === 'function', notificationRaiseAvailable: typeof window.NotificationRaise === 'function', silenced: {...mutedNativeAudioStats} }),
    presenceDiagnostics: () => ({ version: VERSION, modSdkHookInstalled: pawOnlinePresence.modSdkHookInstalled, lastNativeResponse: pawOnlinePresence.seenAt || null, knownOnlineCount: pawOnlinePresence.ids.size, lastQuery: pawOnlinePresence.lastQuery || null }),
    performanceDiagnostics: () => ({ ...motionRuntime,
      portraitQueued: portraitRuntime.queued,
      archivePending: historyArchive.queue?.length ?? null,
      view: state.tab, window: { ...(state.windowRect || {}) },
      liveAvatars: ui.shadow?.querySelectorAll('.kc-bc-mugshot:not(.is-painted)').length || 0 }),
    toggle: () => toggle(),
    open: () => { safeTick(); toggle(true); }, close: () => toggle(false),
    select: id => { if (!me()) return false; const n = numeric(id); if (!n) return false; selectChat(n); toggle(true); return true; },
    setAssetBase: url => { if (!/^https:\/\/[^\s]+\/$/.test(url)) return false; state.settings.assetBase=url; saveSoon(); render(); return true; },
    refreshMugshots: () => { if (!ui.shadow) return 0; steadyRemotePortraits.clear(); recentRoomPortraits.clear(); wceSnapshotRuntime.temporaryPortraits.clear(); wceSnapshotRuntime.attempts.clear(); for (const c of ui.shadow.querySelectorAll('.kc-bc-mugshot')) {c.classList.remove('is-painted'); c.parentElement?.classList.remove('kc-has-mugshot');} schedulePortraits(); return ui.shadow.querySelectorAll('.kc-bc-mugshot').length; },
    mugshotDiagnostics,
    mugshotReport: id => {
      const d=mugshotDiagnostics(id);
      return JSON.stringify({version:d.version,member:d.member,loaded:d.gameCharacterLoaded,
        appearance:d.bcCharacterHasAppearance,painted:d.paintedAvatarCanvases,
        canvas:d.nativeCanvasShape,crop:d.canvasCrop,direct:d.bcDirectRenderer,
        refresh:d.bcCanvasRefresh,wce:d.wceProfileExposed,wceSaved:d.wceSavedSnapshot},null,2);
    },
    historyDiagnostics:() => ({version:VERSION,account:state.myId,storage:'IndexedDB',queued:historyArchive.pending.length,savedThisSession:historyArchive.saved,readThisSession:historyArchive.fetched,error:historyArchive.error,hasMore:state.historyHasMore,loadedOlder:state.historyOlder.length,activeConversation:state.historySelection}),
    exportFullHistory:()=>exportFullHistory(),
    importNativeBeeps:()=>importAvailableNativeBeeps(),
    roomHistoryDiagnostics:() => ({version:VERSION, room:window.ChatRoomData?.Name || null, tracking:inHistoryRoom(), displayEnabled:state.settings.showSubbycatRecentMessages !== false, stored:state.roomHistory.length, visible:!!document.getElementById('kc-subbycat-previous-session'), restores:roomReplay.restoreCount, limit:20}),
    refreshRooms: () => { if (!ui.body) safeTick(); state.tab='rooms'; toggle(true); return searchRooms('console-refresh'); },
    roomSearchDiagnostics: () => ({ version:VERSION, activeTab:state.tab, panelOpen:state.open, roomsVisible:!!ui.shadow?.getElementById('kc-roomquery'), selected:'All spaces (X/M/F)', query:state.roomSearch, loading:state.roomLoading, searched:state.roomSearched, searchAttemptCount:state.roomsRequest, lastTrigger:state.roomSearchTrigger, lastStarted:state.roomLastStarted ? new Date(state.roomLastStarted).toISOString() : null, lastFinished:state.roomLastFinished ? new Date(state.roomLastFinished).toISOString() : null, resultCount:state.rooms.length, perSpace:{...state.roomCounts}, warnings:[...state.roomSearchWarnings], error:state.roomError, serverSearchAvailable:typeof window.ServerRoomSearch === 'function' }),
    whisperReactionsDiagnostics:()=>({version:VERSION,transport:'native BC beep for friends; targeted room Hidden for non-friends',whisperIds:'native Dictionary tagged, no visible text changes',sameRoomOnlyForNonFriends:true}),
    displayDiagnostics:()=>({version:VERSION,zoomFactor:pawViewportScale.ratio,referenceDpr:state.settings.zoomReferenceDpr,currentDpr:window.devicePixelRatio,mobile:pawViewportScale.mobile,updates:pawViewportScale.updates}),
    roomLauncherDiagnostics:()=>({version:VERSION,active:roomLauncherActive(),mounted:!!roomLauncher.button?.isConnected,
      repairs:roomLauncher.repairs,moves:roomLauncher.moves,topLayer:roomLauncher.topLayer,topLayerErrors:roomLauncher.topLayerErrors,
      dragging:roomLauncher.dragging,popupKey:fabCoexistence.popupKey,manualPopupOverride:fabCoexistence.manualRoomPopupKey,
      detectedPopups:[...fabCoexistence.surfaces],
      savedPosition:state.fabPosition,temporaryPosition:fabCoexistence.temporary,
      rect:(()=>{const r=roomLauncher.button?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;})(),
      nodeOnTop:(()=>{const r=roomLauncher.button?.getBoundingClientRect();if(!r)return null;
        const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
        return hit?.id||hit?.tagName||null;})(),
      style:roomLauncher.button?{display:getComputedStyle(roomLauncher.button).display,visibility:getComputedStyle(roomLauncher.button).visibility,z:getComputedStyle(roomLauncher.button).zIndex}:null}),
    launcherCoexistenceDiagnostics:()=>({version:VERSION,checks:fabCoexistence.checks,hiddenChecks:fabCoexistence.hidden,reason:fabCoexistence.reason,hidden:!!ui.fab?.classList.contains('kc-yielding'),temporaryPosition:fabCoexistence.temporary,foreignSurfaces:[...fabCoexistence.surfaces],roomTransitions:fabCoexistence.roomTransitions,screen:window.CurrentScreen||null,hostLayer:ui.host?getComputedStyle(ui.host).zIndex:null,visible:!!ui.fab?.isConnected&&!ui.fab?.classList.contains('kc-yielding'),alwaysShow:fabCoexistence.alwaysShow}),
    recoverLauncher:()=>{fabCoexistence.alwaysShow=true;if(ui.host&&!ui.host.isConnected){try{ui.host.remove();}catch{}Object.assign(ui,{host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null});}if(!ui.host&&document.body)buildUI();restoreFabHome();setTheme();syncFabCoexistence();return roomLauncherActive()?!!roomLauncher.button?.isConnected:!!ui.fab?.isConnected;},
    alwaysShowLauncher:(enable=true)=>{fabCoexistence.alwaysShow=!!enable;syncFabCoexistence();return fabCoexistence.alwaysShow;},
    zeroFlickerDiagnostics:()=>({...sidebarDiffStats,sideScroll:ui.menu?.querySelector('.contacts-scroll')?.scrollTop||0,filterScroll:ui.menu?.querySelector('.kc-inbox-filters')?.scrollLeft||0}),
    dataCodecDiagnostics:()=>({version:VERSION,codec:'PL2',storage:'reversible-encoded localStorage',archive:'encoded message text only; metadata indexed',packets:'PL2 with legacy JSON/KC1 receive fallback',privateChatEncoded:!!state.settings.encodePrivateChat,cryptographic:false,...pawCodecMetrics}),
    integrityDiagnostics:()=>({version:VERSION,enabled:true,checks:['sender','member-permissions','size','rate-limit','nonce-replay','group-ack-challenge','recovery-request','two-peer-recovery-quorum','message-ids'],accepted:integrity.accepted,rejected:integrity.rejects,duplicates:integrity.duplicates,rateLimited:integrity.rateLimited,legacyEvents:integrity.legacy,rememberedEvents:state.integritySeen.length,pendingRecoveryRequests:integrity.recovery.size,pendingRecoveryQuorums:integrity.quorums.size}),
    outboxDiagnostics:()=>({version:VERSION,entries:state.deliveryOutbox.map(x=>({id:x.id,kind:x.kind,to:x.to,status:x.status,mode:x.mode,targets:{...x.targets},reason:x.reason,created:x.created})),sentThisSession:outboxRuntime.sent}),
    socialStudioDiagnostics:()=>({version:VERSION,pendingScheduled:state.scheduledMessages.filter(x=>x.status==='pending').length,quietHours:inPawQuietHours(),favoriteFriends:Object.values(state.chats).filter(x=>x.favorite).length,groupPolls:Object.values(state.groups).reduce((sum,g)=>sum+(g.polls||[]).length,0),scrapbooks:state.sharedAlbums.length,layoutEdit:state.settings.layoutEdit}),
    roomRosterDiagnostics:()=>({version:VERSION,insideRoom:window.CurrentScreen==='ChatRoom',filter:state.contactsMode,room:window.CurrentScreen==='ChatRoom'?(window.ChatRoomData?.Name||''):null,visibleMembers:currentRoomRoster().map(c=>({id:numeric(c.MemberNumber),name:trim(c.Nickname||c.Name||'',80)}))}),
    expansionDiagnostics: () => ({version:VERSION,roomSort:state.roomSort,roomFavorites:state.roomFavorites.length,recentRooms:state.roomRecent.length,moments:state.moments.length,replyActive:!!state.replyTarget,inboxFilter:state.contactsMode,pendingRequests:Object.values(state.chats).filter(c=>c.requestPending).length,replyLater:Object.values(state.chats).filter(c=>c.replyLater).length,moderatorAssignments:Object.values(state.groups).reduce((n,g)=>n+(g.moderators?.length||0),0)}),
    friendStatusDiagnostics: () => ({version:VERSION,mode:state.settings.friendStatusMode,
      text:state.settings.friendStatusText,sharing:state.settings.shareFriendStatus,
      knownFriends:myFriends().filter(id=>state.profiles[id]?.kitty).length,
      queued:statusWire.pending.length,sent:statusWire.packetsSent,
      received:statusWire.packetsReceived,failures:statusWire.failures,
      lastFailure:statusWire.lastFailure}),
    setFriendStatus: (mode,text='') => {
      if (!Object.hasOwn(STATUS_MODES,mode)) return false;
      state.settings.friendStatusMode=mode;
      state.settings.friendStatusText=trim(text,100);
      saveSoon();publishFriendStatus(false);
      if (state.open && state.tab==='settings') renderSettings();
      return true;
    },
    diagnostics: () => ({ version:VERSION, account:state.myId, mugshotMode:'BC live canvas / WCE bce-past-profiles readonly snapshot / kitten; only temporary in-memory rendering, no persistent mugshot storage', hooked:!!state.mod,
      conversations:Object.keys(state.chats).length, nativeMessages:true, groups:Object.keys(state.groups).length, windowRect:state.windowRect, theme:state.settings.theme, hasUI:!!ui.host, bootError:state.bootError, bootAttempts:state.bootAttempts }) });
  window.MarvelousBridgeDiag=()=>({version:VERSION,connected:marvelousBridge.attached,plushiesVersion:marvelousBridge.api?.version||null,lowCpu:marvelousBridge.lowCpu,safeMode:marvelousBridge.safeMode,localNotifications:marvelousBridge.events.length,focusEnabled:marvelousFocusRuntime.enabled});
  window.PawLounge = window.KittyChat;
  window.PawLoungeBootDiag = () => window.KittyChatBootDiag();
  // A failure during BC startup or DOM construction must never abort all future retries.
  function safeTick() {
    try {
      state.bootAttempts++;
      tick();
      marvelousBridgeTick();pawPresenceTick();expireFriendStatusIfNeeded();marvelousFocusTick();marvelousBackgroundTick();
      BOOT.attempts = state.bootAttempts;
      markBoot(ui.fab?.isConnected ? (me() ? 'ready' : 'waiting-for-login') : 'waiting-for-dom');
      state.bootError = '';
      const errorTag = document.getElementById('kittychat-startup-error');
      if (errorTag) errorTag.remove();
    } catch (err) {
      state.bootError = `${err?.name || 'Error'}: ${err?.message || err}`;
      BOOT.error = state.bootError;
      BOOT.attempts = state.bootAttempts;
      markBoot('retrying-after-error');
      if (Date.now() - state.lastBootErrorAt > 12000) {
        state.lastBootErrorAt = Date.now();
        console.error(`[Kittychat ${VERSION}] Startup failed (retrying):`,err);
      }
      // Show a visible notice in case the usual launcher never appears.
      if (document.body && !document.getElementById('kittychat-startup-error')) {
        const badge = document.createElement('button');
        badge.id = 'kittychat-startup-error';
        badge.type = 'button';
        badge.style.cssText = 'position:fixed;right:16px;bottom:95px;z-index:2147483646;background:#401a35;color:#ffe5f2;border:2px solid #f18dbf;padding:9px 13px;border-radius:16px;font:12px system-ui;box-shadow:0 6px 25px #0008;cursor:pointer';
        badge.textContent = '🐾 PawLounge could not open · Retry';
        badge.title = "PawLounge could not open. Try again, or reload Bondage Club.";
        badge.addEventListener('click',()=> { try { ui.host?.remove(); } catch {} Object.assign(ui,{host:null,shadow:null,fab:null,panel:null,badge:null,body:null,menu:null,status:null}); safeTick(); });
        document.body.appendChild(badge);
      }
    }
  }
  window.KittyChatBootDiag = () => ({ ...emergencyDiagnostics(), account: state.myId,
    attempts: state.bootAttempts, error: state.bootError || BOOT.error,
    hasLauncher: !!ui.fab, hasPanel: !!ui.panel,
    hostConnected: !!ui.host?.isConnected,
    launcherVisible: roomLauncherActive() ? !!roomLauncher.button?.isConnected &&
      getComputedStyle(roomLauncher.button).display!=='none' && getComputedStyle(roomLauncher.button).visibility!=='hidden' :
      (!!ui.fab?.isConnected && !ui.fab.classList.contains('kc-yielding') &&
      getComputedStyle(ui.fab).display !== 'none' && getComputedStyle(ui.fab).visibility !== 'hidden' &&
      getComputedStyle(ui.fab).opacity !== '0'),
    roomLauncherMounted:!!roomLauncher.button?.isConnected,
    roomLauncherRect:(()=>{const r=roomLauncher.button?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null;})(),
    launcherHiddenReason: fabCoexistence.reason,
    launcherTemporaryPosition:fabCoexistence.temporary,
    launcherForeignSurfaces:[...fabCoexistence.surfaces],
    launcherDisplay:ui.fab?.isConnected ? getComputedStyle(ui.fab).display : 'absent',
    screen:String(window.CurrentScreen||''), module:String(window.CurrentModule||''),
    panelOpen: !!state.open, windowRect: state.windowRect,
    olderVersionConflict: document.getElementById('kittychat-version-conflict')?.textContent || null });
  safeTick();
  let check = setInterval(safeTick, 2000);
  let fabCheck = setInterval(syncFabCoexistence, 800);
  document.addEventListener('DOMContentLoaded', safeTick, {once:true});
  window.addEventListener('pagehide', () => {
    try { if (state.myId) saveNow(true); } catch {}
    if (check) { clearInterval(check); check = null; }
    if (fabCheck) {clearInterval(fabCheck);fabCheck=null;}
  });
  // Browsers can restore BC from the back-forward cache without reinjecting scripts.
  window.addEventListener('pageshow', () => {
    if (!check) check = setInterval(safeTick, 2000);
    if (!fabCheck) fabCheck=setInterval(syncFabCoexistence,800);
    safeTick();syncFabCoexistence();
  });
  log('Bootstrapped', VERSION);
  } catch (err) {
    BOOT.error = `${err?.name || 'Error'}: ${err?.message || err}`;
    markBoot('fatal-initialization-error');
    console.error(`[Kittychat ${VERSION}] Fatal initialization error:`, err);
    // The emergency diagnostics remains usable even if the main runtime crashed.
    try {
      const showFatalNotice = () => {
        if (!document.body || document.getElementById('kittychat-fatal-boot')) return;
        const notice = document.createElement('div');
        notice.id = 'kittychat-fatal-boot';
        notice.style.cssText = 'position:fixed;bottom:22px;right:16px;z-index:2147483646;background:#30172e;color:#fff3fb;padding:12px;border:2px solid #ff96ca;border-radius:16px;font:13px system-ui;box-shadow:0 8px 28px #0009';
        notice.textContent = `Kittychat ${VERSION} could not initialize. Check KittyChatBootDiag() in the browser console.`;
        document.body.appendChild(notice);
      };
      if (document.body) showFatalNotice();
      else document.addEventListener('DOMContentLoaded', showFatalNotice, {once:true});
    } catch {}
  }
})();
