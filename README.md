# Subby's Plushies v2

**Current release:** `2.3.7.13`  
**Release date:** 2026-10-03  
**Target:** Bondage Club R132

Subby's Plushies is a standalone Bondage Club companion addon built around native modular plushie items. It includes plushie activities, mood/affection, relationships, synchronized emotes, two wearable plushie slots, room mascots, battles, saved poses, themes, stats, achievements, backups, Easy Drag, and a native Preferences → Extensions control center.

## What's current in 2.3.7.13

- Main handheld plushie in `ItemHandheld` plus an optional second plushie in `ItemAddon`.
- Passive affection loss is **-1 per 8 hours** for plushies that are not equipped; equipped plushies do not decay.
- Room mascot supports manual set, random selection, admin picker, local movement, and a shared hourly cycle designed so clients converge on one room update.
- Room mascot grants the configured positive-affection modifier to matching plushie interactions.
- Protect Me reacts to `boop` and `bap`; `poke` belongs to Jealous Plushie instead of Protect Me.
- Idle wiggle/rotation applies to equipped plushies, including the ItemAddon/ceiling-style second plushie.
- Easy Drag and native Move/Resize preserve the current transform instead of resetting unrelated resize/rotation values.
- Action text can include the actual plushie name and uses BC character information rather than hardcoded generic pronouns where supported.
- 15-second plushie emotes synchronize to other room users running the addon.
- Opera/userscript isolation handling is built into the full script: it can bridge itself into the Bondage Club page context when necessary.
- The Commands tab always starts from the command list compiled into the current build; `data/commands.json` may add documentation but cannot hide newer built-in commands.

## Installation


### Launcher

`SubbysPlushies-Launcher.user.js` is a thin userscript that `@require`s the matching full build from this repository. The full build itself handles the page-context/browser compatibility logic.

For Opera/Chromium userscript managers, make sure the extension is allowed to run user scripts on the Bondage Club site. In Opera this may require enabling **Developer mode** and **Allow user scripts** for the userscript extension.

### Firefox bookmark

`SubbysPlushies-Firefox-Bookmarklet.txt` contains a bookmarklet. Create a bookmark, paste the full `javascript:...` line into its URL/Location field, open Bondage Club, then click the bookmark to fetch the latest full build.

## Main features

- 18 public plushie variants plus the internal Subbycat wire alias.
- Native `ItemHandheld` and `ItemAddon` integration.
- Native per-layer Move/Resize plus Easy Drag and named snap points.
- Plush activities: Rub Against Face, Cuddle to Chest, Nuzzle, Pat, Pet, Hide Behind, Kiss, Kiss With Plushie, Nose Boop, Rest Cheek, Forehead Bump, Snuggle, Bonk, Balance on Head, Offer, Show, Whisper, Squeeze Cheeks, Wave, and Hug Tightly/purr support.
- Per-plush mood, relationship progression, favorites, sleepy state, and three saved pose slots.
- Relationship levels: Stranger → Familiar → Friend → Bestie → Bonded.
- Relationship milestone bubbles and achievements.
- Synchronized room emotes and addon-presence indicator.
- Shared room mascot with local display/movement controls and hourly cycling.
- Multiplayer plushie battles with per-account battle stats/history.
- Searchable Use menu and native Extensions control center.
- Normal and Low CPU performance modes.
- Portable backup/restore with progression integrity sealing.
- Validated Git-backed configuration with local last-known-good caching and built-in fallbacks.
- Public `window.SubbysPlushies` integration API.

## Mood and affection

Each plushie has its own happiness score. Positive and negative interactions adjust that score. A plushie that is **not currently equipped** loses 1 point for each completed 8-hour block. Plushies equipped in either supported plushie slot are protected from decay, and the decay clock is kept current so removing a plushie does not immediately apply hidden accumulated losses.

## Protect / Jealous behavior

Protect Me watches hostile/rough action verbs such as slap, spank, hit, punch, kick, bonk, **boop**, **bap**, tickle, bite, pinch, whip, shock, zap, attack, smack, and swat. `poke` is intentionally excluded from Protect Me and included in Jealous Plushie detection.

## Room mascot

Room admins can set the held plushie as mascot, choose a random mascot, open the mascot picker, or clear it. The synchronized room state lets later joiners recover the current mascot. Each user can move/hide/show the mascot overlay locally without changing room state. Hourly cycling is enabled by default.

## Commands

`/help` keeps Bondage Club's normal help and adds a plushie summary. `/help plushie` and `/help plushies` show the full addon command reference. Tab completion is available for plushie commands and common arguments.

### General

| Command | Description |
|---|---|
| `/help plushie` | Show the complete Subby's Plushies command reference in chat. |
| `/help plushies` | Alias for /help plushie. |
| `/plushie` | Equip Subby's Plushies in ItemHandheld. |
| `/plushieuse` | Open the plushie selector / Use menu. |
| `/plushieaddon` | Wear a second Subby's Plushies plushie in ItemAddon (Body slot). |
| `/plushieremove` | Remove the held Subby's Plushies item. |
| `/plushierecover` | Run the plush recovery helper. |
| `/plushiefeatures` | Show the current feature-toggle status. |

### Extensions Tabs

| Command | Description |
|---|---|
| `/plushieextensions` | Open the Subby's Plushies Extensions control center on Settings. |
| `/plushiestatus` | Open the Status tab. |
| `/plushiesettings` | Open the Settings tab. |
| `/plushielayout` | Open the Layout customization tab. |
| `/plushieplushies` | Open the Plushies tab with relationships, favorites, emotes, and saved poses. |
| `/plushiehistory` | Open the History tab for mood and plushie battles. |
| `/plushiebackup` | Open the Backup / Restore tab. |
| `/plushiecommands` | Open the Commands tab directly. |
| `/plushiecommand` | Alias for /plushiecommands. |

### Positioning & Poses

| Command | Description |
|---|---|
| `/plushieposition` | Open BC's native Move / Resize editor for the plushie. |
| `/plushiemove` | Alias for /plushieposition. |
| `/plushieresize` | Alias for /plushieposition. |
| `/plushiehands` | Reset the plushie to its default hands position. |
| `/plushiecenter` | Alias for /plushiehands. |
| `/plushiedrag [on|off]` | Toggle Easy Drag, or explicitly turn it on/off. |
| `/plushiesnap <point>` | Snap to hands, chest, face, head, left shoulder, or right shoulder. |
| `/plushiebalance` | Open the Balance on Head minigame directly. |
| `/plushieposes` | Open the Plushies tab at the saved-pose controls. |
| `/plushieposesave <1|2|3>` | Save the current plushie's X/Y position, scale, and rotation to a pose slot. |
| `/plushieposeload <1|2|3>` | Apply a saved pose for the held plushie. |
| `/plushieposeclear <1|2|3>` | Clear a saved pose slot for the held plushie. |

### Mood & Interactions

| Command | Description |
|---|---|
| `/plushiemood` | Show the held plushie's mood, relationship, and quick info. |
| `/plushieinfo` | Alias for /plushiemood. |
| `/plushielore` | Open the Lore browser on the held plushie. |
| `/plushiefavorite` | Toggle the held plushie as a favorite. |
| `/plushieemote <happy|angry|sleepy|protective|sulky>` | Show a 15-second room-synced plushie emote and bubble. |
| `/plushieprotect` | Toggle Protect Me mode. |
| `/plushiejealous` | Toggle Jealous Plushie mode. |
| `/plushieidle` | Toggle idle plushie wiggle animations. |
| `/plushiespeech` | Toggle local automatic speech bubbles. |
| `/plushiespeak` | Force one local plushie speech bubble. |
| `/plushiebubble` | Alias for /plushiespeak. |
| `/plushiepurr` | Play the plushie purr sound locally. |
| `/plushieperformance [normal|low]` | Show or change the performance mode. |

### Room Mascot

| Command | Description |
|---|---|
| `/plushiemascot` | Show current room mascot information. |
| `/plushiemascot set` | Set your held plushie as the shared room mascot (room admin only). |
| `/plushiemascot random` | Pick and publish a random shared room mascot (room admin only). |
| `/plushiemascot picker` | Open the room mascot picker (room admin only; aliases: pick, open, choose). |
| `/plushiemascot clear` | Clear the shared room mascot (room admin only; alias: remove). |
| `/plushiemascot show` | Restore the mascot picture locally (alias: unhide). |
| `/plushiemascot hide` | Hide the mascot picture locally. |
| `/plushiemascotshow` | Shortcut for /plushiemascot show. |
| `/plushiemascothide` | Shortcut for /plushiemascot hide. |

### Battle, Stats & Achievements

| Command | Description |
|---|---|
| `/plushiebattle [member/name]` | Challenge another player to a plushie battle; with no target, use the focused character when possible. |
| `/plushiestats` | Open the detailed Stats tab. |
| `/plushieachievements` | Open the detailed Achievements tab. |
| `/plushieach` | Short alias for /plushieachievements. |

### Backup / Restore

| Command | Description |
|---|---|
| `/plushieexport` | Export a portable Subby's Plushies JSON backup. |
| `/plushieimport` | Choose and restore a Subby's Plushies JSON backup. |

### Updates & Diagnostics

| Command | Description |
|---|---|
| `/plushieupdate` | Check the GitHub version manifest for an update. |
| `/plushieupdateopen` | Open the latest update / download page. |
| `/plushiedata` | Show Git-backed data source and cache status. |
| `/plushiedatareload` | Force-refresh validated data files from GitHub. |
| `/plushiedebug` | Print detailed addon diagnostics to the browser console. |

## Data files

The main script validates remotely fetched JSON before applying it. Startup-critical behavior always has built-in fallbacks. This repo refresh aligns the runtime JSON with the current build so remote configuration does not silently reintroduce older values.

## Public addon API

Other addons should use `window.SubbysPlushies` instead of reaching into internal functions. The API exposes status/version information and helpers such as held plush lookup, mood/relationship data, battle history, emotes, performance mode, and event subscriptions.

## Support

Repository: https://github.com/marvelous-bc/subby-plushies  
Issues: https://github.com/marvelous-bc/subby-plushies/issues
