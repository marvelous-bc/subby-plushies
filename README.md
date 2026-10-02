# Subby's Plushies v2

A standalone Bondage Club R132 plushie companion addon with modular plush artwork, activities, moods, relationships, synchronized emotes, room mascots, battles, saved poses, themes, stats, achievements, history, and a native **Preferences → Extensions** control center.

## Installation

Choose **one** installation method:

- **`SubbysPlushies.user.js`** — full commented/source build.
- **`SubbysPlushies.min.user.js`** — production build with code comments removed.
- **`SubbysPlushies-Launcher.user.js`** — recommended if you want automatic release pickup. The launcher checks `version.json` on every Bondage Club load, downloads the production build only when the release version changes, and keeps the last working release cached as a fallback.

Do not enable the launcher and a full build at the same time. The addon intentionally has a duplicate-instance guard.

## v2 command integration

All addon commands use the `/plushie...` namespace.

- `/help` keeps Bondage Club's normal help and adds a compact Subby's Plushies command summary.
- `/help plushie` (or `/help plushies`) shows the full plushie command reference with descriptions.
- Press **Tab** while typing `/plu...` in chat to complete and cycle matching commands.
- Tab completion also supports common arguments for emotes, performance mode, Easy Drag, mascot actions, pose slots, and snap points.
- Typing `/help p...` and pressing Tab completes the plushie help command.
- The same reference is available in **Preferences → Extensions → Subby's Plushies → Commands**.

## Main features

- 18 public plushie variants in one native modular `ItemHandheld` asset.
- Native per-layer Move/Resize, Easy Drag, and named snap positions.
- Plush activities including cuddle, nuzzle, pat, pet, hide, kiss, bonk, head balance, offer, show, whisper, squeeze cheeks, wave, Hug Tightly + purr, Protect Me, and more.
- Per-plush happiness with passive **-1 every 15 minutes** until 29.
- Per-plush mood history and relationships: **Stranger → Familiar → Friend → Bestie → Bonded**.
- Relationship milestone celebration bubbles.
- Favorites, sleepy state, and three saved pose slots per plush.
- 15-second room-synchronized plushie emotes.
- `zZ`, `…`, `♥`, `!`, and temporary emote symbols follow the plush's transformed position through Move/Resize, Easy Drag, scale, rotation, temporary poses, and saved poses.
- Persistent room mascot in synchronized room custom data, recoverable by later joiners.
- Multiplayer plushie battles, battle history, stats, and achievements.
- Searchable/paginated lo-fi Use menu with Favorites, Emotes, Mascot, Settings, Presets, Extension Menu, and Battle.
- Lo-fi Extensions UI with independent color customization, layout settings, and themes including Pink.
- Normal / Low CPU performance modes.
- Backup/restore with tamper-evident sealing for progression values.
- Validated Git-backed JSON with local last-known-good caching and built-in safe fallbacks.
- Public `window.SubbysPlushies` API for other addons; developer API details stay out of the user-facing Extensions menu.

## Mood, relationships, and sleep

Each plush keeps its own mood, relationship interaction count, favorite state, sleep timing, pose slots, and mood history. Positive/negative activities alter happiness while passive decay only moves downward to 29. Relationship milestones can unlock speech/achievements and trigger a brief local celebration bubble.

## Emotes

Manual emotes last **15 seconds** and synchronize to other room users running Subby's Plushies:

```text
/plushieemote happy
/plushieemote angry
/plushieemote sleepy
/plushieemote protective
/plushieemote sulky
```

## Room mascot

Room admins can set/clear the mascot. The current mascot is stored in synchronized room `Custom` data, so players who join after it was set can still recover it. Each player may hide/show the mascot overlay locally without changing room state.

## Performance and v2 cleanup

**Normal** keeps optional visuals enabled. **Low CPU** pauses optional idle/petting animations and stretches safety-monitor intervals while preserving core actions, Easy Drag, battles, synchronized emotes, room mascot sync, and commands.

v2 consolidates local speech-bubble/status-symbol position work into one animation-frame scheduler and reduces safety polling where event-driven hooks already provide immediate updates.

## Always-latest launcher

The launcher uses fixed raw URLs from this repository. On every Bondage Club load it:

1. fetches `version.json` with cache-busting;
2. compares the release version with its cached version;
3. fetches `SubbysPlushies.min.user.js` only when the release changes;
4. caches the successfully started release;
5. falls back to the cached release if GitHub is temporarily unavailable.

The launcher itself has userscript `@updateURL` / `@downloadURL` metadata so launcher fixes can also be updated by the userscript manager. Because the launcher intentionally executes the production script from this repository, only use it if you trust releases published here.

## Command reference

### General

| Command | Description |
| --- | --- |
| `/help plushie` | Show Subby's Plushies commands with descriptions. Plain /help also includes a plushie command summary. |
| `/plushie` | Equip Subby's Plushies. |
| `/plushieuse` | Open the plushie selector/use menu. |
| `/plushieextensions` | Open the Subby's Plushies Extensions control center. |
| `/plushiecommands` | Open the Commands tab directly. |
| `/plushiecommand` | Alias for /plushiecommands. |
| `/plushiestatus` | Open the Status tab. |
| `/plushiesettings` | Open the Settings tab. |
| `/plushielayout` | Open the Layout customization tab. |
| `/plushieremove` | Remove the held Subby's Plushies item. |
| `/plushierecover` | Run the plush recovery helper. |

### Positioning

| Command | Description |
| --- | --- |
| `/plushieposition` | Open BC's native Move / Resize editor. |
| `/plushiemove` | Alias for Move / Resize. |
| `/plushieresize` | Alias for Move / Resize. |
| `/plushiehands` | Reset the plush to its default hands position. |
| `/plushiecenter` | Alias for resetting the plush position. |
| `/plushiedrag [on\|off]` | Toggle Easy Drag, or explicitly turn it on/off. |
| `/plushiesnap <point>` | Snap to a named point such as head, face, chest, hands, left shoulder, or right shoulder. |

### Features

| Command | Description |
| --- | --- |
| `/plushiemood` | Show the current plushie's mood and quick info. |
| `/plushielore` | Open the Lore browser on the held plushie. |
| `/plushieinfo` | Show the current plushie's mood and quick info. |
| `/plushieprotect` | Toggle Protect Me mode. |
| `/plushiejealous` | Toggle Jealous Plushie mode. |
| `/plushieidle` | Toggle idle plush animations. |
| `/plushiespeech` | Toggle local speech bubbles. |
| `/plushiespeak` | Force one local plush speech bubble. |
| `/plushiebubble` | Alias for /plushiespeak. |
| `/plushiepurr` | Play the plush purr sound locally. |
| `/plushiefeatures` | Show the current feature-toggle status. |
| `/plushiehistory` | Open the History tab with recent mood changes and the last 20 plushie battles. |
| `/plushieperformance normal\|low` | Switch between Normal and Low CPU mode. Low CPU pauses optional animations and reduces background refresh/watchdog frequency. |

### Room Mascot

| Command | Description |
| --- | --- |
| `/plushiemascot set` | Set your held plush as the room mascot (room admin only). |
| `/plushiemascot clear` | Clear the room mascot (room admin only). |
| `/plushiemascot show` | Show mascot information / restore the mascot picture. |
| `/plushiemascot hide` | Hide the mascot picture locally. |
| `/plushiemascotshow` | Shortcut to show the mascot picture. |
| `/plushiemascothide` | Shortcut to hide the mascot picture. |

### Battle, Stats & Achievements

| Command | Description |
| --- | --- |
| `/plushiebattle <member/name>` | Challenge another player to a plushie battle. With no argument, uses the focused character when possible. |
| `/plushiestats` | Open the detailed Stats tab. |
| `/plushieachievements` | Open the detailed Achievements tab. |
| `/plushieach` | Open the detailed Achievements tab. |

### Updates & Diagnostics

| Command | Description |
| --- | --- |
| `/plushieupdate` | Check the GitHub version manifest for an update. |
| `/plushieupdateopen` | Open the latest update/download page. |
| `/plushiedebug` | Print detailed plugin diagnostics to the browser console. |
| `/plushiedata` | Show Git-backed data source/cache status. |
| `/plushiedatareload` | Force-refresh validated data files from GitHub. |

### Plushies & Relationships

| Command | Description |
| --- | --- |
| `/plushieplushies` | Open the Plushies tab with relationship, favorites, emotes, and saved poses. |
| `/plushiefavorite` | Toggle the held plushie as a favorite. |
| `/plushieemote happy\|angry\|sleepy\|protective\|sulky` | Show a 15-second room-synced plushie emote and mood symbol to other Subby's Plushies users in the room. |
| `/plushieposes` | Open the Plushies tab at the saved-pose controls. |
| `/plushieposesave <1\|2\|3>` | Save the held plushie current X/Y, scale, and rotation. |
| `/plushieposeload <1\|2\|3>` | Apply a saved pose for the held plushie. |
| `/plushieposeclear <1\|2\|3>` | Clear a saved pose slot for the held plushie. |

### Backup / Restore

| Command | Description |
| --- | --- |
| `/plushiebackup` | Open the Backup / Restore tab. |
| `/plushieexport` | Export a portable Subby's Plushies JSON backup. |
| `/plushieimport` | Choose and restore a Subby's Plushies JSON backup. |

## Public addon API

`window.SubbysPlushies` exposes the stable public integration surface. Current useful methods include `getHeld()`, `getMood()`, `getMoodHistory()`, `getRelationship()`, `getBattleHistory()`, `showEmote()`, `getPerformanceMode()`, `setPerformanceMode()`, `on()`, `off()`, and `once()`. Other addons should use this API rather than hook Subby's Plushies internals.

## Repository layout

```text
SubbysPlushies.user.js           # commented/source build
SubbysPlushies.min.user.js       # production/comment-free build
SubbysPlushies-Launcher.user.js  # version-aware launcher
assets/plushies/                  # plush artwork
assets/sfx/                       # sound effects
data/                             # validated configuration JSON
version.json                      # updater + launcher manifest
README.md
CHANGELOG.md
```

## Support

Repository: https://github.com/marvelous-bc/subby-plushies

Issues: https://github.com/marvelous-bc/subby-plushies/issues
