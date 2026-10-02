# Subby's Plushies

**Subby's Plushies** is a Bondage Club R132+ userscript by **Marvelous** that adds a modular handheld plushie collection with custom activities, positioning tools, moods, relationships, room-synced emotes, room mascots, plushie battles, achievements, themes, backups, and a native Preferences → Extensions control center.

Current development build: **v2 - first official release**  
Designed for: **Bondage Club R132**

> This is an independent addon and is not part of the Bondage Club base game.

## Highlights

- 18 public plushie options in one modular `ItemHandheld` asset.
- Searchable, paginated lo-fi Use menu with Favorites, hover preview, Emotes, Presets, Battle, Mascot, Settings, and Extension Menu shortcuts.
- BC-native Move / Resize, Easy Drag, snap points, per-plush saved Pose 1/2/3 presets, scaling, and rotation.
- Plush activities including cuddle, pet, pat, nuzzle, kiss, bonk, hide behind, balance on head, offer, show, whisper, wave, and Hug Tightly.
- Persistent per-plush happiness, mood history, sleepy state, relationship levels, favorites, lore, achievements, and relationship milestone celebration bubbles.
- Happiness passively decays by **1 every 15 minutes** and stops at **29**.
- **15-second room-synced emotes** (`♥`, `!!`, `zZ`, `!`, `…`) visible to other room members who run Subby's Plushies.
- Persistent room mascot stored in synchronized room custom data so late joiners can recover the current mascot even if they were offline when it was set.
- Multiplayer plushie battles with target prompt, local battle history, stats, and achievements.
- Native **Preferences → Extensions** control center with lo-fi themes, custom colors, layout options, performance mode, backup/restore, history, and detailed plush information.
- Normal / Low CPU performance modes.
- Git-backed validated JSON configuration with local known-good cache and built-in fallback values. Remote JavaScript is never executed.
- Public `window.SubbysPlushies` API for other addons; API documentation lives in this README rather than the user-facing Extensions menu.

## Installation

1. Install a userscript manager.
2. Install `SubbysPlushies.user.js` from this repository.
3. Enable it on the Bondage Club domain you use.
4. Reload Bondage Club.
5. Enter a chat room and use `/plushie` or open **Preferences → Extensions → Subby's Plushies**.

The metadata includes the current Bondage Club ElementFX, Europe, and Asia locations used by the script.

## Quick Start

```text
/plushie
/plushieuse
/plushieextensions
/plushieposition
/plushiedrag on
/plushieemote happy
```

The complete command reference is available in-game in **Extensions → Commands** and below.

## Use Menu

The Use menu is a themed lo-fi selector with pagination and search. Favorites appear first, and the bottom controls provide:

- **Emotes** — Happy, Angry, Sleepy, Protective, Sulky.
- **Mascot** — room mascot controls.
- **Settings** — quick feature toggles.
- **Presets** — save/apply Pose 1/2/3.
- **Extension Menu** — opens the full control center.
- **Battle** — opens a player-name/member-number challenge prompt.

Users can customize Use-menu colors independently from the Extensions control center, or apply a shared preset such as Lo-fi, Pink, Midnight, Rose, Sage, or Monochrome.

## Mood, Sleep, and Relationships

Each plush tracks its own happiness. Interactions can raise or lower happiness, while passive decay removes **1 point every 15 minutes** until the score reaches **29**. Mood changes are stored locally in a short per-plush history.

Relationship progression is also per plush:

**Stranger → Familiar → Friend → Bestie → Bonded**

Relationship milestones trigger a small local celebration bubble and can unlock relationship speech/achievements. A plush can become sleepy after extended inactivity; interacting with or selecting it wakes it.

## Emotes

Emotes last **15 seconds**:

```text
/plushieemote happy
/plushieemote angry
/plushieemote sleepy
/plushieemote protective
/plushieemote sulky
```

The icon and tiny bubble are positioned from the plushie's actual transformed bounds, so they follow Move / Resize, Easy Drag, scale, and rotation. Emotes are synchronized through the room for other users running Subby's Plushies; they do not require permanent room state.

## Positioning and Saved Poses

Subby's Plushies uses BC's native per-layer transforms. Easy Drag updates locally while dragging and publishes once on release. Named snap positions include Hands, Chest, Face, Head, Left Shoulder, and Right Shoulder.

Each plush has three local saved pose slots containing X, Y, Scale X/Y, and Rotation. Pose presets are useful for screenshots and frequently used placements.

## Room Mascot

Only synchronized room admins may set or clear the room mascot. The mascot is stored in the room's synchronized `Custom` data, which means a player who joins later can recover the current mascot even if they were offline when it was originally chosen.

Each player can still hide/show the mascot overlay locally without changing the room state.

## Battles and History

Plushie Battle supports name/member-number targeting, accept/decline prompts, multiple randomized rounds, local detailed results, and a **last 20 battles** history page. Battle history records opponent, plushies, score, result, and date/time.

## Extensions Control Center

Open **Preferences → Extensions → Subby's Plushies**.

Current tabs:

| Tab | Purpose |
| --- | --- |
| **Status** | Current plush, mood, mascot, settings, performance, and data/update status. |
| **Lore** | Search/browse plush lore with artwork and held-plush shortcut. |
| **Plushies** | Relationship progress, favorites, emotes, sleepy state, and saved poses. |
| **History** | Recent per-plush mood changes and last 20 battles. |
| **Settings** | Feature toggles, room-synced emotes, Normal/Low CPU mode, and utility controls. |
| **Layout** | Menu density, hover preview, lore side, theme presets, and independent interface colors. |
| **Stats** | Detailed local interaction/battle statistics. |
| **Achievements** | Locked/unlocked achievements and timestamps. |
| **Backup** | Export/import preferences and sealed progression data. |
| **Commands** | Slash-command reference. |

There is a public dev API.

## Backup / Restore

Backup schema v3 exports portable local preferences and data, including moods/history, battle history, favorites, layouts/themes, nicknames, and saved poses. Progression values (stats, achievements, relationships) are integrity-sealed. If those values are manually modified, progression restore is rejected while ordinary preference data can still be imported.



## Performance

**Normal** mode provides all optional animations and standard recovery checks. **Low CPU** pauses optional idle/petting animations, reduces visual refresh work, and lengthens background watchdog intervals while keeping core actions, drag, battles, emotes, mascot sync, and other functional behavior available.

## Command Reference

### General

| Command | Description |
| --- | --- |
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

## Developer API

Other addons can integrate through `window.SubbysPlushies` instead of hooking private internals. Current API v1 includes:

```text
SubbysPlushies.getHeld()
SubbysPlushies.getMood(name?)
SubbysPlushies.getMoodHistory(name?, limit?)
SubbysPlushies.getRelationship(name?)
SubbysPlushies.getBattleHistory(limit?)
SubbysPlushies.showEmote(type)
SubbysPlushies.getPerformanceMode()
SubbysPlushies.setPerformanceMode(mode)
SubbysPlushies.on(event, callback)
SubbysPlushies.off(event, callback)
SubbysPlushies.once(event, callback)
```

Events include `interaction`, `mood`, `relationship`, `battle`, `emote`, `favorite`, `pose`, and `performance`.

## Git-backed Data

`data/index.json` is the manifest for validated configuration. The runtime loads cached known-good JSON immediately when available and refreshes Git data asynchronously. Invalid or unavailable remote data falls back to cache/built-in values.

Configured data files include plush metadata, lore, speech, moods, achievements, battle settings, commands, poses, defaults, activities, idle settings, protect settings, stats schema, and relationship thresholds/speech.

Executable/security-sensitive behavior stays in the userscript: BC hooks, runtime asset/activity registration, image mapping, drag, transfers, room sync, battle networking, persistence internals, and validation.

## Assets

Artwork: `assets/plushies/`  
Sound effects: `assets/sfx/`

Asset filenames are case-sensitive on Git hosting.

## Updating

`version.json` provides version/update metadata. The updater does not execute JavaScript from the manifest. Automatic checks can be disabled from Settings.

## Troubleshooting

- Make sure only one current Subby's Plushies userscript is enabled.
- Reload Bondage Club after replacing the script.
- Use `/plushiedebug` for detailed console diagnostics.
- Use `/plushierecover` to rebuild the local held-plush state if needed.
- If artwork is missing, verify the exact filename/capitalization under `assets/plushies/`.
- If a command is unclear, check the in-game Commands tab; all published commands use the `/plushie...` namespace.

---

**Subby's Plushies v2** — cute chaos, plushie cuddles, and a suspicious amount of bonking.
