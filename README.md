# Subby's Plushies

A Bondage Club R132 userscript/addon that adds collectible plushies, plushie-focused activities, optional social actions, room mascots, relationships, emotes, battles, achievements, pose tools, lore, and a built-in Extensions control center.

**Current version:** `3.1.21`  
**Bondage Club target:** `R132`  
**Repository:** `marvelous-bc/subby-plushies`

## Highlights

- **20 public plushies** with individual artwork/lore support.
- Plushie interactions use the currently selected plushie's name in action text.
- Nickname-aware and pronoun-aware generated dialogue.
- **20 plushie actions** including Hug Tightly, Offer Plushie, Balance on Head, Hide Behind Plushie, and Start a Wave Emote.
- **20 optional Extra Actions**, disabled by default.
- Shared room emotes and left-to-right Wave chains.
- **Pose safety:** Wave and Raise Both Arms affect only the upper-body pose family, and can be ignored completely with `Ignore Pose-Changing Emotes`.
- Dynamic **Measure Height** comparison text.
- Synced 15-second plushie emotes: happy, angry, sleepy, protective, and sulky.
- Protect Me and Jealous Plushie reactions.
- Plushie mood/affection, relationships, favorites, achievements, and statistics.
- Idle affection decay is `-1` every 8 hours only while that plushie is not being held.
- Shared room mascot with room-admin controls and local positioning.
- Plushie battles with Battle History.
- Saved plushie poses, Move / Resize integration, Easy Drag, and snap points.
- Backup / restore and Git-backed data refresh.
- Normal and Low CPU performance modes.
- Opera-compatible userscript/bootstrap work from the v3 release line.

## Plushies

- Subbycat
- Ale
- M
- Izneas
- Lyra
- Subbycat and Luna
- Subbycat and Ale
- Subbycat and Terra
- Subbycat and Pink
- Subbycat and Steele
- Terra
- Steele
- Izzy and Lyly
- Hari
- Fog
- Hira
- Pink
- Kyu
- Rey
- Margot

Rey includes built-in lore. Margot's lore is intentionally hidden for now.

## Activities

### Plushie actions

- Rub Against Face
- Cuddle to Chest
- Nuzzle Plushie
- Pat Plushie
- Pet Plushie
- Hide Behind Plushie
- Kiss Plushie
- Kiss With Plushie
- Nose Boop Plushie
- Rest Cheek on Plushie
- Forehead Bump Plushie
- Snuggle Plushie
- Bonk With Plushie
- Balance Plushie on Head
- Offer Plushie
- Show Plushie
- Whisper to Plushie
- Squeeze Cheeks With Plushie
- Start a Wave Emote
- Hug Tightly

### Optional Extra Actions

Enable these with **Extra Actions** in Settings or `/plushieextraactions`.

- Ruffle Hair
- Shoulder Squeeze
- Tap Shoulder
- Squish Cheek
- Pat Cheek
- Cup Cheek
- Brush Cheek
- Brush Hair From Face
- Tuck Hair Behind Ear
- Twirl Hair
- Fix Collar
- Tap Head
- Measure Height
- Cover Ears
- Rest Chin on Shoulder
- Rest Chin on Head
- Link Arms
- Raise Both Arms
- Bow To
- Point Dramatically

## Shared action artwork

Custom activity icons use a small shared set under `assets/plushies/`:

| Asset | Used for |
|---|---|
| `hairaction.png` | Hair actions: Ruffle Hair, Brush Hair From Face, Tuck Hair Behind Ear, Twirl Hair |
| `faceaction.png` | Face/cheek actions |
| `pointing.png` | Point Dramatically |
| `subbycat.png` | Fallback/default artwork for every other custom action |

If one of the three shared action images fails to load, the addon falls back to `subbycat.png`.

## Extensions control center

The current top-level tabs are:

- **Status**
- **Lore**
- **Settings**
- **Progress**
- **Commands**

### Settings

- **General** — feature toggles, pose safety, performance, update behavior, speech/emotes, and related preferences.
- **Layout** — Extensions UI layout/customization.

### Progress

- **Stats**
- **Achievements**
- **Plushies** — relationship/favorite/emote/saved-pose information.
- **Battle History**
- **Backup**

Lore remains its own top-level tab.

## Pose safety

Wave and Raise Both Arms are temporary upper-body animations.

- **Start a Wave Emote:** arms remain raised for about 3 seconds per participant.
- **Raise Both Arms:** arms remain raised for about 5 seconds.
- The addon switches only the `BaseUpper` / `OverTheHead` upper-body pose family so kneeling or sitting lower-body poses are preserved.
- Enable **Ignore Pose-Changing Emotes** to keep the chat actions while ignoring the pose changes locally.
- Command: `/plushieignoreposes`

## Room mascot

Room mascots are changed manually; there is no automatic hourly mascot cycle.

Room admins can set the held plushie, choose a random mascot, use the picker, or clear the mascot. Each client can locally hide/show and reposition the mascot picture.

## Mood and relationships

Plushies track mood/affection and relationship progress locally.

- Held plushies do not receive idle affection decay.
- Unheld plushies lose `1` affection per 8-hour idle interval.
- Relationship/stat/achievement information is available under **Progress**.
- Mood history storage is not used by the current release.

## Data files

The addon can load validated Git-backed data files such as:

- `lore.json`
- `speech.json`
- `moods.json`
- `achievements.json`
- `battle.json`
- `commands.json`
- `poses.json`
- `defaults.json`
- `idle.json`
- `protect.json`
- `relationships.json`

The executable command list embedded in the userscript remains authoritative; `commands.json` can supplement documentation without replacing commands supported by the current build.

## Commands

The in-game **Commands** tab, `/help plushie`, `/help plushies`, and autocomplete use the same current command catalog.

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

### Extensions & Navigation

| Command | Description |
|---|---|
| `/plushieextensions` | Open the Subby's Plushies Extensions control center on Settings → General. |
| `/plushiestatus` | Open the Status tab. |
| `/plushiesettings` | Open Settings → General. |
| `/plushielayout` | Open Settings → Layout customization. |
| `/plushieplushies` | Open Progress → Plushies with relationships, favorites, emotes, and saved poses. |
| `/plushiehistory` | Open Progress → Battle History. |
| `/plushiebackup` | Open Progress → Backup / Restore. |
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
| `/plushiebalance` | Open the progressive Balance on Head minigame (8–20 seconds). |
| `/plushieposes` | Open Progress → Plushies at the saved-pose controls. |
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
| `/plushieextraactions` | Toggle optional non-plush Extra Actions. Disabled by default. |
| `/plushiewavechain` | Toggle left-to-right shared Wave emote chains. |
| `/plushieignoreposes` | Toggle ignoring pose-changing plugin emotes such as Wave and Raise Both Arms. |
| `/plushieexpressions` | Toggle short expression reactions to plushie and Extra Actions. |
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

### Battle & Progress

| Command | Description |
|---|---|
| `/plushiebattle [member/name]` | Challenge another player to a plushie battle; with no target, use the focused character when possible. |
| `/plushiestats` | Open Progress → Stats. |
| `/plushieachievements` | Open Progress → Achievements. |
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
| `/plushieversion` | Show the currently running addon version and pose-safety status. |
| `/plushiedebug` | Print detailed addon diagnostics to the browser console. |

## Installation / updating

1. Install a userscript manager supported by your browser.
2. Install `SubbysPlushies.user.js`.
3. Keep the repository assets under their existing paths.
4. The addon checks `version.json` for updates when automatic update checks are enabled.

For a repo update, replace the root userscript, `version.json`, `commands.json`, and `README.md` together when provided in a release package.

## Asset layout

```text
assets/
├── plushies/
│   ├── subbycat.png
│   ├── hairaction.png
│   ├── faceaction.png
│   ├── pointing.png
│   └── ...other plushie artwork...
└── sfx/
    └── ...sound effects...
```

## v3 release-line summary

The v3 series expanded the addon substantially. Major changes include:

- 20+ new/custom interaction actions and optional Extra Actions.
- Shared emote chains and synchronized plushie emotes.
- Nickname/pronoun-aware dialogue.
- Custom action sender/receiver chat rendering fixes.
- Measure Height.
- Raise Both Arms and kneeling-safe Wave behavior.
- Ignore Pose-Changing Emotes safety control.
- Protect/Jealous keyword changes.
- Manual-only room mascot behavior.
- 8-hour idle affection decay for unheld plushies.
- Improved drag, resize, saved-pose, and layout persistence.
- Stats, achievements, Battle History, Backup, and Plushies consolidated under Progress.
- Layout moved under Settings.
- Rey and Margot added while preserving the legacy Subbycat wire option.
- Shared `hairaction.png`, `faceaction.png`, and `pointing.png` custom-action artwork.
- Updated command reference/autocomplete and Git-backed command documentation.

## Notes for contributors

- Keep **wire option 18** reserved for the legacy Subbycat alias for backwards compatibility.
- New public plushie options are mapped around that legacy wire value.
- Keep executable commands in `CURRENT_COMMAND_GROUPS` synchronized with `commands.json` and this README.
- Keep new custom-action image categories routed through the shared action-image resolver rather than adding one-off icon logic.
