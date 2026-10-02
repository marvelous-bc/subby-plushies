# Subby's Plushies

**Subby's Plushies** is a Bondage Club R132+ userscript that adds a modular handheld plushie system with custom interactions, positioning tools, moods, lore, speech bubbles, multiplayer plushie battles, room mascots, stats, achievements.

Current release: **v1.7.7**  
Designed for: **Bondage Club R132**  
Author: **Marvelous**

> This project is an independent addon and is not part of the Bondage Club base game.

## Highlights

- Multiple selectable plushies using one modular `ItemHandheld` asset.
- Native-feeling plushie activities such as cuddling, petting, kissing, bonking, hiding behind a plushie, balancing it on a head, offering it to another player, and more.
- BC-native **Move / Resize** support.
- **Easy Drag** mode and named snap points for faster positioning.
- **Mood** and **lore** for each plushie.
- Local **idle animations** and **speech bubbles**.
- Optional **Protect Me** and **Jealous Plushie** reactions.
- **Offer Plushie** transfer flow with recipient confirmation.
- Multiplayer **Plushie Battle** system.
- Persistent local **stats** and **achievements**.
- Admin-controlled **Room Mascot** with local show/hide preference.
- Native **Preferences → Extensions** entry with Status, Settings, Stats, Achievements, and Commands tabs.
- Safe update checks through `version.json` without executing remote JavaScript.
- Performance-focused design: local-only animation where possible, event-driven room tracking, and minimal network updates.

## Installation

### Userscript installation

1. Install a userscript manager that supports normal browser userscripts.
2. Add `SubbysPlushies.user.js` to the manager.
3. Make sure the script is enabled for your Bondage Club domain.
4. Reload Bondage Club.
5. Enter a chat room and use `/subbyplush` or open the addon from **Preferences → Extensions → Subby's Plushies**.


If you already run the script through your own local injector, use the same `SubbysPlushies.user.js` file.

## Quick Start

Use:

```text
/subbyplush
```

to equip/open Subby's Plushies.

Useful shortcuts:

```text
/subbyplushuse
/subbyplushposition
/subbyplushdrag on
/subbyplushmood
/subbyplushstats
/subbyplushachievements
/subbyplushextensions
```

The full command reference is available in-game under:

**Preferences → Extensions → Subby's Plushies → Commands**

## Plushie Features

### Plush selector

The addon currently defines **18 public plush options**, including individual characters and Subbycat combination plushies. Search support is built into the selector so plushies can be found by name quickly.

The selection/configuration source is documented in `data/plushies.json`.

### Activities

Subby's Plushies registers custom activities while the plushie is held. Current activities include:

- Rub Against Face
- Cuddle to Chest
- Nuzzle Plushie
- Pat Plushie
- Pet Plushie
- Hide Behind Plushie
- Kiss Plushie
- Kiss With Plushie
- Bonk With Plushie
- Balance Plushie on Head
- Offer Plushie
- Show Plushie
- Whisper to Plushie
- Squeeze Cheeks With Plushie
- Wave Plushie
- Hug Tightly

Some activities can target yourself, while others are intended for another character. Temporary pose effects such as Balance on Head and Hide Behind Plushie are restored automatically afterward.

### Move, resize, drag, and snap

Subby's Plushies works with BC's native Move / Resize system and stores the active plush transform without duplicating transform state across every plush layer.

Easy Drag can be toggled with:

```text
/subbyplushdrag
/subbyplushdrag on
/subbyplushdrag off
```

Named snap points include:

- Hands
- Chest
- Face
- Head
- Left Shoulder
- Right Shoulder

Example:

```text
/subbyplushsnap head
```

### Mood and lore

Each plushie has a persistent mood score that changes through interactions and gradually drifts toward neutral. Lore can be viewed from the addon menu or with:

```text
/subbyplushmood
/subbyplushlore
```

Lore data is extracted into `data/lore.json` for future Git-backed loading.

### Idle animation and speech bubbles

Idle animations are local-only and intentionally avoid room/network spam. Speech bubbles are also rendered locally and follow the current plush position, scale, rotation, and character draw position.

Commands:

```text
/subbyplushidle
/subbyplushspeech
/subbyplushspeak
```

### Protect Me

Protect Me can react when another character performs compatible actions against you. Detection includes raw activity data plus a rendered-chat fallback for common actions such as slap, pinch, and spank.

Toggle it with:

```text
/subbyplushprotect
```

### Jealous Plushie

Jealous Plushie can react when affection is directed elsewhere.

Toggle it with:

```text
/subbyplushjealous
```

### Offer Plushie

Offer Plushie lets another player accept or decline a plush transfer. The recipient receives the corresponding plush state and the sender's copy is removed after successful acceptance.

### Room Mascot

A room admin can set the currently held plush as the room mascot. Other players can independently hide or show the mascot image locally.

Admin commands:

```text
/subbyplushmascot set
/subbyplushmascot clear
```

Local display commands:

```text
/subbyplushmascot show
/subbyplushmascot hide
```

The client validates mascot set/clear events against the synchronized room-admin list.

### Plushie Battle

Players can challenge another player to a three-round plushie battle.

```text
/subbyplushbattle <member number or name>
```

If no argument is supplied, the focused character is used when possible.

Battle moves currently include:

- Cuddle Crush
- Tiny Bonk
- Squeak Blast
- Dramatic Stare
- Plushie Pounce

Battle-specific chat UI uses reduced text sizing so round details do not dominate the room chat.

### Stats and achievements

The addon keeps local plushie statistics, including interaction totals, affectionate actions, battles, speech bubbles, idle animations, offers, mascot use, and action-specific counts.

Achievements currently include:

- First Friend
- Plush Pal
- Professional Cuddler
- Bonk Scholar
- Head Case
- Collector
- Chatty Plush
- Wiggle Worm
- Battle Tested
- Plush Champion
- Mascot Maker

Open them from the Extensions page or use:

```text
/subbyplushstats
/subbyplushachievements
```

Stats are stored locally and are not reconstructed retroactively for interactions that happened before the stats system existed.

## Extensions Control Center

Subby's Plushies registers with Bondage Club's native Extensions system through `PreferenceRegisterExtensionSetting(...)`, so it appears in the normal Extensions list alongside other addons instead of drawing a fixed-position button.

Open:

**Preferences → Extensions → Subby's Plushies**

Available tabs:

| Tab | Purpose |
| --- | --- |
| **Status** | Current addon/plush state, mood, mascot, feature state, and update information. |
| **Settings** | Toggle Protect Me, Jealous Plushie, Easy Drag, Room Mascot display, Idle Animation, Speech Bubbles, and Automatic Update Checks. |
| **Stats** | View persistent local plushie statistics. |
| **Achievements** | View unlocked and locked achievements. |
| **Commands** | Browse the full slash-command reference. |

## Command Reference

### General

| Command | Description |
| --- | --- |
| `/subbyplush` | Equip/open Subby's Plushies. |
| `/subbyplushuse` | Open the plush selector. |
| `/subbyplushextensions` | Open the Extensions control center. |
| `/subbyplushcommands` | Open the Commands tab. |
| `/subbyplushstatus` | Open the Status tab. |
| `/subbyplushsettings` | Open the Settings tab. |
| `/subbyplushremove` | Remove the held Subby's Plushies item. |
| `/subbyplushrecover` | Run the plush recovery helper. |

### Positioning

| Command | Description |
| --- | --- |
| `/subbyplushposition` | Open BC's native Move / Resize editor. |
| `/subbyplushmove` | Alias for Move / Resize. |
| `/subbyplushresize` | Alias for Move / Resize. |
| `/subbyplushhands` | Reset to the default hands position. |
| `/subbyplushcenter` | Alias for the default-position reset. |
| `/subbyplushdrag [on\|off]` | Toggle Easy Drag or explicitly set it. |
| `/subbyplushsnap <point>` | Snap to a named position. |

### Features

| Command | Description |
| --- | --- |
| `/subbyplushmood` | Show mood/lore information. |
| `/subbyplushlore` | Alias for mood/lore information. |
| `/subbyplushinfo` | Alias for mood/lore information. |
| `/subbyplushprotect` | Toggle Protect Me. |
| `/subbyplushjealous` | Toggle Jealous Plushie. |
| `/subbyplushidle` | Toggle idle animations. |
| `/subbyplushspeech` | Toggle speech bubbles. |
| `/subbyplushspeak` | Force one local speech bubble. |
| `/subbyplushbubble` | Alias for `/subbyplushspeak`. |
| `/subbyplushpurr` | Play the plush purr sound locally. |
| `/subbyplushfeatures` | Show feature-toggle status. |

### Room Mascot

| Command | Description |
| --- | --- |
| `/subbyplushmascot set` | Set the held plush as room mascot; room admin only. |
| `/subbyplushmascot clear` | Clear the room mascot; room admin only. |
| `/subbyplushmascot show` | Show mascot info/restore its picture. |
| `/subbyplushmascot hide` | Hide the mascot picture locally. |
| `/subbyplushmascotshow` | Shortcut for show. |
| `/subbyplushmascothide` | Shortcut for hide. |

### Battle, Stats, and Achievements

| Command | Description |
| --- | --- |
| `/subbyplushbattle <member/name>` | Challenge another player to a plushie battle. |
| `/subbyplushstats` | Show local plush stats. |
| `/subbyplushachievements` | Show achievements. |
| `/subbyplushach` | Short achievement alias. |

### Updates and Diagnostics

| Command | Description |
| --- | --- |
| `/subbyplushupdate` | Check the remote version manifest. |
| `/subbyplushupdateopen` | Open the latest download/update page. |
| `/subbyplushdebug` | Print detailed diagnostics to the browser console. |



## Update System

The addon checks `version.json` to discover newer releases. The update checker is intentionally limited to version/update information and does **not** execute code downloaded from the update manifest.

Automatic update checks can be disabled from the Extensions Settings tab.

## Performance Design

Subby's Plushies has been repeatedly optimized to avoid making the browser or room unnecessarily busy. Current design choices include:

- event-driven room membership where possible;
- slow watchdogs instead of aggressive polling;
- early exits in activity/chat hot paths;
- local-only idle/pet animations;
- one room update at the end of Easy Drag instead of on every mouse movement;
- active-layer-only Move / Resize transform storage;
- lazy mood decay;
- asynchronous update checks;

## Troubleshooting

### The addon does not load

- Make sure only one current build is enabled. Older copies can conflict with the addon guard.
- Reload or hard-refresh Bondage Club after changing script versions.
- Confirm your userscript manager is running the addon on the current BC domain.
- Open the browser console and run/use `/subbyplushdebug` for diagnostics.

### My plushie is invisible

- Reload the client once to clear stale local render state.
- Confirm the artwork file exists under `assets/plushies/` with exactly the filename/capitalization listed in `assets/manifest.json`.
- Try `/subbyplushrecover`.
- Re-select the plushie from the selector.

### Another player can see my plushie but I cannot

This can indicate stale local render state. Reloading the affected client has resolved this during development. If it becomes reproducible, capture `/subbyplushdebug` output before reloading so the local asset state can be traced.

### A command does not work

Use the in-game **Commands** tab to verify syntax. The addon has command interception through the chat input path and the BC chat-send path for compatibility.

### Room Mascot cannot be changed

Only synchronized room admins may set or clear the Room Mascot. Show/hide is a local preference and does not require admin access.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for the release history from **v1.5.51 through v1.7.7**.

## Development Notes

Keep executable BC integration inside the userscript, including:

- BC/ModSDK hooks
- activity interception
- chat observers
- image mapping
- Move / Resize bridge
- Easy Drag execution
- Offer transfer logic
- Protect Me detection
- battle networking
- room-admin validation
- room synchronization
- local persistence
- update safety

Content and configuration are better candidates for Git-backed JSON once the validated cache/fallback loader is enabled.



---

**Subby's Plushies v1.7.7** built for cute chaos, plushie cuddles, and a suspicious amount of bonking.
