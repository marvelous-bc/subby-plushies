# Subby's Plushies & Essentials

**A feature-rich Bondage Club userscript for plushie companions, wardrobe creation, chat personalization, achievements, quality-of-life tools, and performance controls.**

**Current documented build: `v3.9.52` · November 8, 2026**  
**Created by:** Marvelous · **Lore, writing & assets:** Subbycat · **Rey's lore:** hira

[Install the complete userscript](https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js) · [Install the release launcher](https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js) · [Report an issue](https://github.com/marvelous-bc/subby-plushies/issues) · [Release manifest](version.json)

> **Not an official Bondage Club addon.** Features depend on the game's available APIs and its rules, permissions, and currently loaded assets. Custom art and shared effects generally require the receiving player to have a compatible addon version.

## Contents

- [Install & get started](#install--get-started)
- [Navigating Essentials](#navigating-essentials)
- [Plushies, interactions & companions](#plushies-interactions--companions)
- [Positioning, emotes & room mascots](#positioning-emotes--room-mascots)
- [Wardrobe & creative tools](#wardrobe--creative-tools)
- [Outfit history & protection](#outfit-history--protection)
- [Chat & social customization](#chat--social-customization)
- [Stats, achievements & battles](#stats-achievements--battles)
- [Themes, layouts & mobile](#themes-layouts--mobile)
- [Performance, recovery & compatibility](#performance-recovery--compatibility)
- [Backups, updates & diagnostics](#backups-updates--diagnostics)
- [Complete feature directory](#complete-feature-directory)
- [Slash-command reference](#slash-command-reference)
- [Important limitations](#important-limitations)
- [Credits](#credits)

## Install & get started

### Requirements

- Bondage Club running in a browser environment compatible with the userscript's `@match` domains (the main `.user.js` header is the source of truth).
- A userscript manager capable of injecting scripts into the **page/main world**, such as a correctly configured Tampermonkey or Violentmonkey installation. Injection support varies by browser and client.
- Access to GitHub-hosted data and image assets for features that use the repository; the addon has local fallbacks for certain assets/data.

### Choose **one** installation method

1. **Release launcher:** alternatively install [`SubbysPlushies-Launcher.user.js`](https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies-Launcher.user.js) to load the main script from the repository, with a fallback to its last validated cached copy if downloading fails.
2. Reload Bondage Club after installation. Open the game's **Extensions** entry for **Subby's Plushies & Essentials**, or use `/plushieextensions`. Use `/plushie` to equip a handheld plushie and `/plushieaddon` for an optional second plushie.

**Do not run the full script and a launcher simultaneously**, or install multiple launcher variants: duplicate injection can cause initialization conflicts. If an update appears stuck, verify that only one active installation remains and check the version using `/plushieversion`.

### Updating

The main script has GitHub `@updateURL` / `@downloadURL` metadata. Essentials also offers **Settings → Features → Updates → Check for Updates Now**, optional automatic checks (at most daily), and `/plushieupdate`. The root [`version.json`](version.json) is the release manifest. GitHub/CDN caching and userscript-manager update schedules may delay availability.

## Navigating Essentials

The control center is organized around finding an action quickly:

| Area | What you will find |
| --- | --- |
| **Home** | Common tasks, feature shortcuts, current plushie/progress overview. |
| **Find / Search** | Searchable catalog of **41 feature destinations**, filterable by category. |
| **Tools** | Wardrobe, Time Machine, Harmonizer, Color Studio, emoticons, mascot tools, and related utilities. |
| **Chat** | Personal/public styling, whispers, sounds, badges, preset codes, text effects, and player colors. |
| **Settings** | Feature toggles, Safety & Poses, Appearance & Layout, and Performance & Improvements. |
| **Progress** | Plushies, mood/relationships, saved poses, stats, achievements, battle history, and backup/restore. |
| **Help / Commands** | Searchable slash-command reference, aliases, and argument formats. |
| **Lore** | Character-specific plushie stories and descriptions. |

The **Kitten UI** is the default themed interface, with a separately selectable **Classic UI**. Features are the same in both; only their presentation changes. You can switch layouts in **Settings → Appearance & Layout**.

## Plushies, interactions & companions

### Plushie collection

Choose a character or paired plushie from the searchable, paginated Use menu. The script includes the following named options (some entries have a shared image or a placeholder/fallback image):

**Subbycat · Ale · M · Izneas · Lyra · Terra · Steele · Izzy and lyly · Hari · Fog · Hira · Pink · Kyu · Rey · Margot · Mara · Eva · Loona**, plus paired Subbycat plushies: **Subbycat and luna, Subbycat and ale, Subbycat and Terra, Subbycat and pink, Subbycat and Steele**.

- Equip one in **ItemHandheld** and an optional second in **ItemAddon / Body slot**.
- Search and page through the Use menu; mark favorites to put frequently used plushies first.
- Local image caching, loading fallbacks, and asset-name recovery handle missing or delayed art/name registration more gracefully.
- Plushie-specific lore, including hidden entries where applicable.
- Native-style plushie actions and named activity text; interactions include affectionate, playful, and protective activities. Actions target the correct character and use the selected plushie's name.
- Sound effects include a local purr; sound playback depends on browser audio permissions and game state.

### Personality, relationships & moods

- Each plushie tracks an independent mood, sleeping/awake state, interaction count, and relationship progression: **Stranger → Familiar → Friend → Bestie → Bonded**.
- Favorites, mood changes and recent mood history remain available in Progress.
- Optional **idle animation** and **speech bubbles**, including mood-driven local reactions.
- **Protect Me:** playful reactions to supported incoming activities.
- **Jealous Plushie:** reacts when attention is given to another player.
- Relationship milestones and progression-based activities/achievements.
- A **Balance on Head** activity with a timed balancing challenge.

### Activities & extra actions

The plugin registers plushie-specific activities such as petting, patting, nuzzling, kissing, nose-booping, cheek resting, forehead bumping, hiding behind a plushie, and cuddling. It also provides a **Hug Tightly** action.

**Extra Actions** is an optional, separately toggled social-action set (off by default), including hair ruffling, shoulder squeezes/taps, cheek squishes, linked arms, bows, raising arms, pointing dramatically, and more. Some actions can alter a pose briefly; **Ignore Pose-Changing Emotes** disables the addon-induced pose changes locally.

## Positioning, emotes & room mascots

### Plushie positioning & Plushie Snap Points

- BC-compatible **Move / Resize** controls for size, position, and rotation.
- **Easy Drag** with a draggable on-screen control, selectable handheld/body plushie target, and an option to hide the button.
- **Saved poses:** three independent slots **per plushie** for X/Y offset, size, and rotation.
- **Snap Points:** hands, shoulder, chest, lap, and beside, with individually remembered placement adjustments.
- Temporary positioning actions such as **Hide Behind Plushie** and **Balance on Head**, with placement-sensitive symbol/bubble overlays.
- Reset position / return to hands. Adjustments may still depend on BC pose and asset-layer support.

### Emotes & room reactions

- Five manual 15-second plushie emotes: **Happy, Angry, Sleepy, Protective, Sulky**.
- Emoji **quick reactions** beneath public chat/emote messages, with reaction-count hover information for updated addon users.
- **Shared Wave chains** ripple from left to right among compatible addon users in a chat room.
- **Expression reactions** support short facial responses to compatible social actions.
- Optional local speech bubbles and other non-invasive effects.

### Room mascot

- Choose the held plushie, pick a specific mascot, or pick randomly (shared room changes are **room-admin only**).
- The mascot can be shown or hidden **locally**, moved/dragged, and restored with the repair command.
- Shared room-mascot state is published through supported room custom data so compatible clients, including late arrivals, can recover it.
- The mascot overlay defers to open dialogs and other UI windows; it is not intended to block controls.

## Wardrobe & creative tools

### Curated Subby's Wardrobe

Items appear in supported native Bondage Club appearance slots:

| Item | Native slot | Color zones |
| --- | --- | --- |
| **Subbycat Cat-Ear Headband** (`SubbyCatHeadband`) | Hair Accessory 2 | OuterEars, InnerEars, Headband, Bow |
| **Subbycat Heart Charm** (`SubbyHeartCharm`) | Necklace | Chain, Heart |
| **Subby's Draped Wrap Dress** (`SubbyDrapedWrapDress`) | Upper Clothing (`Cloth`) | Fabric, RearDrape, Underlayer, KnotSash |

Wear/remove items from the Wardrobe panel, adjust their placement, reset their fit, and change independent color zones. Custom items generally require a compatible client to display to other players. The dress uses a native sprite placement reference rather than changing your character's height.

### Wardrobe Studio — editable color zones

- Add, rename, merge, delete, reorder, and lock color zones (with supported zone limits), and manage their color masks.
- Paint/erase masks with brush size, hardness, and opacity controls; use **Magic Wand**, **Smart Fill**, and tolerance settings.
- Original-versus-edited previews, all-zone/individual-zone visualization, and undo/redo.
- Import pose artwork for **Standing, ArmsUp, ArmsUpWide, ArmsBehind, Kneel, and AllFours** and edit masks per pose.
- Export garment PNG files and the zone manifest (`color-layers.json`) for publishing to the repository.
- Preview new layers **locally** on an **equipped** item; the preview restores existing local art when disabled/closed.
- Built-in safeguards help catch incomplete alpha coverage before export. A newly added pose still needs its own correctly aligned artwork and in-game verification.

### Asset Drawing Studio

Draw assets on a **500 × 1000** transparent canvas with your current character as a tracing reference; the reference itself is **not** exported. The movable/resizable editor includes:

- **Selection:** rectangle, ellipse, lasso, Magic Wand; add/subtract/intersect, move selection/pixels, clipboard cut/copy/paste.
- **Painting:** paintbrush, pencil, eraser, bucket, gradient, clone stamp, recolor, eyedropper, and text.
- **Shapes:** line, curve, rectangle, rounded rectangle, ellipse; outlines and fills.
- **Workspace:** zoom (15–800%), hand/pan, customizable brush/hardness/opacity/tolerance, undo/redo, and transparent PNG import/export.
- **Pose-aware reference:** refresh the in-game pose reference or follow pose changes while drawing; apply a completed drawing into the Wardrobe Studio for the selected pose.

### Smart Outfit Color Harmonizer

- Pick **three core colors** and material-dependent color suggestions, or extract/suggest a palette from your current outfit.
- Rules for individual items and color layers; review a planned recolor before applying.
- Material targeting covers fabric/latex/rubber/plastic/silk/satin/fur/buttons and relevant trim or metal/jewelry treatments, with category controls.
- Preview changes, apply to eligible clothing, and use the built-in **undo** for the last Harmonizer operation.
- **Tail, wing, eye, hair and lip slots are excluded** from Harmonizer recoloring by design. Locked/permission-restricted items and protected outfit-lock items are skipped.

### Color Studio & Chat Emoticons

- Build custom color palettes and swatches, save/edit them locally, and apply colors to supported outfit layers with multi-item selection.
- Import/export palettes and manage recent colors; some changes use BC's normal appearance update path and respect permissions/protected outfits.
- Search and pick chat emoticons from built-in and Git-backed catalog entries; use the floating 😺 shortcut or **Tools → Chat Emoticons**.
- Color Studio and Chat Emoticons are already integrated into this main script: **do not install a separate Essentials Expansion userscript alongside it**.

### Custom Items manager

Browse and edit a supported `customitems.json` collection, replace crafted-item slots, create backups, and export an updated file. Changes to repository JSON must be uploaded/published separately; editing your browser's local copy is not an automatic GitHub commit.

## Outfit history & protection

### Outfit Time Machine

- Track recent outfit changes and browse previous looks.
- **Undo / redo**, save and restore looks, preview previous outfits and compare changes before applying.
- Selective restore tools for supported items, with compatibility handling for supported Echo/BC wardrobe operations.
- Minimize to a movable icon; restore the window and remembered position.
- Observes/records local appearance changes; snapshots cannot guarantee recovery of items that BC permissions, locks, or another addon reject.

### Outfit Lock System

Lock **individual currently worn clothing/accessory items against Essentials' own automated wardrobe tools**, including Harmonizer, Color Studio batch recoloring, and Time Machine restores. This does **not** create a Bondage Club padlock and does not block normal native clothing edits.

### Outfit Change Forensics

- Inspect a local log of clothing asset, color, and cosmetic-property changes.
- Compare before/after values, run a manual scan, copy a report, and clear its limited local history.
- Reuses Time Machine monitoring rather than installing an extra constant scanner.
- **Unknown addon origin is not secure attribution**; the report can describe *what* changed without proving *which* script caused it.

### Appearance Shield & pose safety

- **Appearance Shield** is opt-in. It monitors protected appearance slots and can optionally attempt to restore changes to clothing/accessories and body cosmetics (including hair, eyes, mouth/lips, tails and wings).
- Choose **monitor-only** or limited **restore** behavior. Native Appearance/Wardrobe editing can be allowed as a trusted editing context.
- Optional compatibility settings for **BCX, Echo and BCOM** cooperative updates, plus a best-effort automatic allowance for BCOM actions attributable to a recent real user interaction.
- Status, change logs, allow/edit controls and an emergency-disable option.
- **Ignore Pose-Changing Emotes** to prevent supported addon actions such as Wave/Raise Both Arms from changing your pose locally.
- **Unsuspected posture without equipping OneBarGirl:** try BC's native pose first, otherwise a local-only fallback; restore the previous pose using the companion action.
- **Native Pet Bed Locking:** BC's own Pet Bed/padlock controls, a compatibility check, and optional auto/manual restoration after an unexpected removal. This is **best effort, not server-enforced**, and does not bypass BC's permissions/keys/unlock rules.

## Chat & social customization

### Personal public chat style

- Customize a **multi-stop name gradient** (start, middle, end), accent/border colors, border shape and decorative symbols; preview before applying.
- Built-in color presets and your own imported/shared preset codes.
- Style information uses the addon's supported hidden presence signaling; **players without Essentials still see normal BC chat**.
- Choose whether to display shared custom styles, name gradients, badges, and soft whisper-like backgrounds on styled public messages.
- A **Cuddle Queen** title/royal seal exists exclusively for the designated Subbycat account; its broadcast is separately controllable.

### Whisper appearance, audio & badges

- Customize whisper theme/appearance and choose whether to share your styling with compatible clients.
- Chat sound themes, whisper/notification settings and local sound previews; the game/browser ultimately controls audio permissions.
- Local settings for shared badges/visibility, public name styling, and optional whisper-style public presentation.

### Text Quick Panel

- Gradient direction editing, up to **eight saved personal gradient palettes**, built-in presets.
- Optional formatting for quotes, gentle message entrance animations, and reduced-motion support.
- **@name/@nickname highlighting**, optional mention chime, and highlighting of your own name/nickname even without `@`.
- Text effects are **display-only**: they do not rewrite outgoing chat messages.

### Per-player chat colors & social tools

- Give selected players' public messages a custom local color, including their nickname in whispers where compatible.
- React to compatible chat/emote rows, participate in shared wave chains, and enable optional Extra Actions.
- Searchable Chat Emoticons panel and moveable shortcut button.

## Stats, achievements & battles

- **Per-plushie relationships and moods**, affection interactions, favorites, sleeping state, recent mood activity, and saved poses.
- **Plushie Battle** with challenges, supported player targeting, battle actions/round scoring, win/loss/draw statistics, and a local **last-20-battles** history.
- Persistent **lifetime stats**: interactions, affectionate actions, battles, offers, mascots, rooms visited, people interacted with, protective triggers, balancing records, interaction streaks and more.
- **Achievements**, hidden milestones, tiered progress and collection goals, plus an **Essentials level/XP** system.
- **Daily quests** with local calendar-day progress and XP that remains after the day changes.
- **Achievement Showcase:** display up to three unlocked achievements on the local Essentials profile.
- Local progression data is included in the portable backup and uses integrity checks to detect some edits

## Themes, layouts & mobile

- **Kitten UI** (default): cat-ear visual shell, soft artwork, ivory body text, dark titles on light buttons, and electric-purple highlighted text.
- **Classic UI:** switchable alternative using the same features and commands; switching does not discard preferences.
- **Home dashboard** and searchable **Find** page with category filters and one-click navigation.
- **Cozy/compact** controls for the plushie Use menu and Extensions; optional hover preview and left/right Lore list.
- Independent color editors for **Use menu** and **Extensions** with color presets: **Lo-fi, Midnight, Rose, Pink, Sage, Monochrome**. Save separate palettes, copy colors between menus, or reset.
- **Zoom-independent scaling** and calibration for text/overlay UI (not the base-game canvas).
- **One-handed mobile mode:** automatic/left/right-handed navigation, bottom controls, swipe navigation, adjustable dock width/opacity/spacing, collapse/expand, remembered dock placement, touch-oriented shortcuts.
- **Floating Window Minimize:** collapse Essentials or Time Machine into a draggable restore icon; saved dimensions and position for supported desktop layouts.
- Reduced-motion support for optional UI animation.

## Performance, recovery & compatibility

All performance switches are grouped under **Settings → Performance & Improvements**.

| Feature | Purpose |
| --- | --- |
| **Normal / Low CPU** | Keep all optional effects or reduce idle animations and visual refresh work. |
| **BC-Safe Speed Guard** | Batch addon layout/hover/remote plushie updates without changing BC networking or native character-draw behavior. |
| **Experimental Long-Chat Paint Skipping** | Browser `content-visibility` optimization for long chat logs. Defaults to **on**, remains individually toggleable; turn off if chat scroll positioning shifts. |
| **Performance Budget Manager** | Optional periodic FPS estimate with automatic adjustment or manual mode. Estimates are not GPU benchmarks. |
| **Rendering profiles** | Quality / Balanced / Performance, with optional adaptive changes to reaction/emote and name-gradient rendering budgets. |
| **Addon Safe Mode** | Temporarily pauses optional animations, mascot, reactions and extra social effects, while keeping core wardrobe/history tools accessible. Original settings return when Safe Mode is exited. |
| **Reconnect Performance Recovery (v3.9.52)** | Event-driven disconnect/reconnect detection, stale room-visual/queue cleanup, chat observer reattachment, bounded recovery after room synchronization, and local counters. |
| **Asset-name recovery (v3.9.51)** | Re-registers/repairs known plushie display names when game startup/reload would otherwise present “Missing Asset.” |
| **PawLounge performance bridge** | Optional cooperative UI-change events between Essentials and PawLounge when both understand the protocol; each works independently. |

Reconnect recovery intentionally **does not** replace BC's network reconnection or clear saved wardrobes, settings, or progression. It helps with Essentials-owned stale state; it cannot fix every base-game or third-party performance issue.

### Reconnect diagnostics (browser console)

```js
SubbysReconnectPerformance.status()         // Current phase and recovery counters
SubbysReconnectPerformance.report()         // Print details to the console
SubbysReconnectPerformance.refreshVisuals() // Manually refresh Essentials-owned visuals
```

### Other useful diagnostics

```js
SubbysPlushiesBootstrapDiag()        // Script injection/startup state
SubbysPerformanceEngine.status()     // Performance engine and reconnect state
SubbysSharedPerformanceBridge.status() // Optional PawLounge UI-event bridge
SubbysWardrobeCurated.diagnose()      // Native curated-item registration
```

These commands are intended for the browser developer console, not Bondage Club chat. Availability depends on the initialization phase.

## Backups, updates & diagnostics

- **Progress → Backup / Restore:** export/import portable addon-local JSON with stats, achievements, moods/history, battles, favorites, saved poses, layouts, settings, and nicknames.
- Backups do **not** include BC credentials, the BC account itself, native server-side outfits, or room contents. Keep files private if they contain nicknames or other personal preferences.
- **Settings → Features → Updates:** check for new releases manually or enable daily automatic checks.
- **Help & Commands:** searchable reference for the built-in slash commands with aliases and parameters, and `/help plushie` for the in-chat list.
- **Status / Diagnostics:** current build version, data loader/cache status, integration health and feature status. See `/plushiedebug` and `/plushiedata`.
- Git-backed data files are validated with caching/fallbacks; some content, including custom-item/lore data, depends on files published alongside the script.

## Complete feature directory

This is the **full 41-entry feature finder** built into v3.9.52. The names below match the addon's searchable destinations.

### Plushies

| Feature | What it does |
| --- | --- |
| **Plushie settings** | Customize reactions, speech, mascot and plushie behavior. |
| **Plushies & saved poses** | See your held plushie, favorites, relationships and saved poses. |
| **Plushie Lore** | Browse character stories and plushie descriptions. |
| **Equip a plushie** | Choose a plushie to hold or wear. |
| **Plushie drag & shortcuts** | Move plushies, change drag target, hide floating buttons. |
| **Plushie emotes** | Send happy, angry, sleepy, protective or sulky emotes. |
| **Room mascot** | Pick or customize the current room mascot. |

### Clothing & tools

| Feature | What it does |
| --- | --- |
| **Wardrobe** | Browse curated accessories and customize their colors and placement. |
| **Outfit Time Machine** | Open outfit history, previews, undo and restore. |
| **Outfit Harmonizer** | Recolor outfits with coordinated color palettes. |
| **Color Studio** | Create and edit your own colors. |
| **Clothing X-Ray Mode** | Preview selected hidden outfit layers locally. |
| **Custom Items** | Manage your BC custom-item collection and backups. |

### Safety & poses

| Feature | What it does |
| --- | --- |
| **Outfit protection** | Appearance Shield settings and protected outfits. |
| **Pose safety** | Ignore pose-changing emotes and manage Unsuspected posture. |
| **Pet Bed locking** | Pet Bed auto-restore and manual compatibility checks. |

### Chat & social

| Feature | What it does |
| --- | --- |
| **Chat style** | Choose your public message colors and name styles. |
| **Whisper appearance** | Customize the look of whispers and private messages. |
| **Sounds & notification themes** | Configure chat and notification sound themes. |
| **Badges & visibility** | Control local chat badges and how styles display. |
| **Chat style presets** | Import or share your personal style preset codes. |
| **Mentions & text effects** | Manage @mentions, highlighting, quote styles and chat animations. |
| **Chat reactions & emote chains** | Manage quick reactions, shared waves, expressions and Extra Actions. |
| **Character chat colors** | Color-code specific people’s messages locally. |
| **Chat Emoticons** | Open the chat emoticon picker. |

### Performance

| Feature | What it does |
| --- | --- |
| **Performance & Improvements** | All CPU, rendering and optimization controls in one place. |
| **Low CPU mode** | Choose Normal or Low CPU for optional addon animations. |
| **Long-chat paint skipping** | Render long chat logs more efficiently; can be turned off. |
| **Performance Budget Manager** | Set quality profiles and optional automatic adjustment. |
| **Addon Safe Mode** | Temporarily pause optional effects to troubleshoot conflicts. |

### Appearance & layout

| Feature | What it does |
| --- | --- |
| **Menu layout & themes** | Change menu density, kitten/classic UI and visual themes. |
| **Interface size & zoom** | Adjust UI scale and calibrate browser zoom. |
| **One-handed mobile mode** | Choose dock side, size, spacing and one-handed navigation. |
| **Minimize floating windows** | Collapse Essentials and Time Machine to movable icons. |

### Progress & help

| Feature | What it does |
| --- | --- |
| **Stats & levels** | Review your activities, achievements and level. |
| **Achievements** | See unlocked achievements and milestone progress. |
| **Battle history** | Review completed plushie battles. |
| **Export & restore backup** | Save or restore your local Essentials data. |
| **Commands & shortcuts** | Search every Essentials slash command, alias and argument format. |
| **Addon status & diagnostics** | Check version, feature status, Git data and runtime details. |
| **Automatic update checks** | Configure daily update checks or check manually. |


## Slash-command reference

The following is the complete **built-in command table** declared in v3.9.52, grouped exactly as in the plugin. The in-game Commands tab also searches the list and may include additional separately loaded command entries when available. `[]` marks optional arguments; `<>` marks required choices/placeholders.

Use `/help plushie`, or open the Commands panel with `/plushiecommands`.

### General

| Command | Action |
| --- | --- |
| `/help` | Open BC help; Essentials also displays a short command list when supported. |
| `/help plushie` | Show the complete Subby's Plushies & Essentials command reference in chat. |
| `/help plushies` | Alias for /help plushie. |
| `/plushie` | Equip Subby's Plushies in ItemHandheld. |
| `/plushieuse` | Open the plushie selector / Use menu. |
| `/plushieaddon` | Wear a second Subby's Plushies plushie in ItemAddon (Body slot). |
| `/plushieremove` | Remove the held Subby's Plushies item. |
| `/plushierecover` | Run the plush recovery helper. |
| `/plushiefeatures` | Show the current feature-toggle status. |

### Extensions & Navigation

| Command | Action |
| --- | --- |
| `/plushieextensions` | Open the Subby's Plushies & Essentials Extensions control center on Settings. |
| `/plushiestatus` | Open the Status tab. |
| `/plushiewardrobe` | Open Wardrobe: multicolor cat-ear headband and heart charm, with position controls. |
| `/plushietimemachine` | Open outfit history, undo/redo, saved looks and Echo-compatible wardrobe batch restore. |
| `/plushieforensics` | Open Wardrobe → Outfit Change Forensics and inspect clothing changes. |
| `/plushiesettings` | Open Settings → General. |
| `/plushielayout` | Open Settings → Layout customization. |
| `/plushieplushies` | Open Progress → Plushies with relationships, favorites, emotes, and saved poses. |
| `/plushiehistory` | Open Progress → Battle History. |
| `/plushieitems` | Browse BC custom-items JSON, replace crafted-item slots, and export a new customitems.json with backups. |
| `/plushiebackup` | Open Progress → Backup / Restore. |
| `/plushiecommands` | Open the Commands tab directly. |
| `/plushiecommand` | Alias for /plushiecommands. |

### Chat Styles & Notifications

| Command | Action |
| --- | --- |
| `/plushiechatstyle` | Open Chat Styles, including public chat gradients and whisper themes. |
| `/plushiestyle` | Alias for /plushiechatstyle. |
| `/plushietext` | Open Chat Styles → Text Quick Panel for direction, saved palettes, quote styling, animations and @mentions. |
| `/plushietoast` | Replay the local floating-hearts 'Subby's essentials loaded' popup to preview its appearance (does not reload the addon). |

### Positioning & Poses

| Command | Action |
| --- | --- |
| `/plushieposition` | Open BC's native Move / Resize editor for the plushie. |
| `/plushiemove` | Alias for /plushieposition. |
| `/plushieresize` | Alias for /plushieposition. |
| `/plushiehands` | Reset the plushie to its default hands position. |
| `/plushiecenter` | Alias for /plushiehands. |
| `/plushiedrag [on\|off]` | Toggle Easy Drag, or explicitly turn it on/off. |
| `/plushiebalance` | Open the progressive Balance on Head minigame (8–20 seconds). |
| `/plushieposes` | Open the Plushies tab at the saved-pose controls. |
| `/unsuspectedpose` | Use Unsuspected standing posture without equipping the device (native if accepted; otherwise local display). |
| `/unsuspectedreset` | Restore your posture before the Unsuspected native-pose shortcut. |
| `/plushiesnap <hands\|shoulder\|chest\|lap\|beside>` | Snap your selected plushie to an anchor; each point remembers its custom placement. |
| `/plushiesnaps` | Open Progress → Plushies → Snap Points. |
| `/plushieposesave <1\|2\|3>` | Save the current plushie's X/Y position, scale, and rotation to a pose slot. |
| `/plushieposeload <1\|2\|3>` | Apply a saved pose for the held plushie. |
| `/plushieposeclear <1\|2\|3>` | Clear a saved pose slot for the held plushie. |

### Mood & Interactions

| Command | Action |
| --- | --- |
| `/plushiemood` | Show the held plushie's mood, relationship, and quick info. |
| `/plushieinfo` | Alias for /plushiemood. |
| `/plushielore` | Open the Lore browser on the held plushie. |
| `/plushiefavorite` | Toggle the held plushie as a favorite. |
| `/plushieemote <happy\|angry\|sleepy\|protective\|sulky>` | Show a 15-second room-synced plushie emote and bubble. |
| `/plushieprotect` | Toggle Protect Me mode. |
| `/plushiejealous` | Toggle Jealous Plushie mode. |
| `/plushieidle` | Toggle idle plushie wiggle animations. |
| `/plushiespeech` | Toggle local automatic speech bubbles. |
| `/plushieextraactions` | Toggle optional non-plush Extra Actions. Disabled by default. |
| `/plushiereactions [on\|off]` | Toggle emoji reactions below public chat messages. Visible only to updated addon users. |
| `/plushiewavechain` | Toggle left-to-right shared Wave emote chains. |
| `/plushieignoreposes` | Toggle ignoring pose-changing plugin emotes such as Wave and Raise Both Arms. |
| `/plushieexpressions` | Toggle short expression reactions to plushie and Extra Actions. |
| `/plushiespeak` | Force one local plushie speech bubble. |
| `/plushiebubble` | Alias for /plushiespeak. |
| `/plushiepurr` | Play the plushie purr sound locally. |
| `/plushieperformance [normal\|low]` | Show or change the performance mode. |

### Room Mascot

| Command | Action |
| --- | --- |
| `/plushiemascot` | Show current room mascot information. |
| `/plushiemascot info` | Show current room mascot information (explicit form). |
| `/plushiemascot set` | Set your held plushie as the shared room mascot (room admin only). |
| `/plushiemascot random` | Pick and publish a random shared room mascot (room admin only). |
| `/plushiemascot picker` | Open the room mascot picker (room admin only). |
| `/plushiemascot pick` | Alias for /plushiemascot picker. |
| `/plushiemascot open` | Alias for /plushiemascot picker. |
| `/plushiemascot choose` | Alias for /plushiemascot picker. |
| `/plushiemascot clear` | Clear the shared room mascot (room admin only). |
| `/plushiemascot remove` | Alias for /plushiemascot clear. |
| `/plushiemascot show` | Restore the mascot picture locally. |
| `/plushiemascot unhide` | Alias for /plushiemascot show. |
| `/plushiemascot repair` | Recover a locally remembered mascot and diagnose its visibility. |
| `/plushiemascot hide` | Hide the mascot picture locally. |
| `/plushiemascotshow` | Shortcut for /plushiemascot show. |
| `/plushiemascothide` | Shortcut for /plushiemascot hide. |

### Battle & Progress

| Command | Action |
| --- | --- |
| `/plushiebattle [member/name]` | Challenge another player to a plushie battle; with no target, use the focused character when possible. |
| `/plushiestats` | Open Progress on Stats. |
| `/plushieachievements` | Open Progress on Achievements. |
| `/plushieach` | Short alias for /plushieachievements. |

### Backup / Restore

| Command | Action |
| --- | --- |
| `/plushieexport` | Export a portable Subby's Plushies & Essentials JSON backup. |
| `/plushieimport` | Choose and restore a Subby's Plushies & Essentials JSON backup. |

### Updates & Diagnostics

| Command | Action |
| --- | --- |
| `/plushieupdate` | Check the GitHub version manifest for an update. |
| `/plushieupdateopen` | Open the latest update / download page. |
| `/plushiedata` | Show Git-backed data source and cache status. |
| `/plushiedatareload` | Force-refresh validated data files from GitHub. |
| `/plushieversion` | Show the currently running addon version and pose-safety status. |
| `/plushiedebug` | Print detailed addon diagnostics to the browser console. |


## Important limitations

- **Client compatibility:** other players need the current addon to see custom items, plushie visual effects, chat styles, reactions, and mascot decorations. Ordinary BC chat remains readable without it.
- **No server-side enforcement:** Appearance Shield, Pet Bed recovery, and outfit-protection tools cannot override game permissions, locked items, server rejections, or determined third-party script interference.
- **Local versus shared:** some visuals are deliberately local-only; shared states use supported room/addon protocols and can disappear for clients without Essentials.
- **Native sprites:** pose mapping, drawing placement, clipping, custom color zones and body-scale fit need in-game checks after editing assets.
- **Performance:** automatic recovery and low-CPU modes target work owned by this addon, not all Bondage Club or third-party slowdowns.
- **GitHub deployment:** editing/exporting a PNG or JSON file in an in-game editor **does not upload it to GitHub automatically**. Publish generated files to the expected repository paths for other clients to load them.
- **Privacy:** browser-local preferences and backups are separate from your BC account. Shared addon effects may send limited style/presence/room state to other compatible clients; do not treat the addon as encrypted messaging.

## Repository files

| File/path | Purpose |
| --- | --- |
| [`SubbysPlushies.user.js`](SubbysPlushies.user.js) | Complete userscript, including current UI and integrated utilities. |
| [`SubbysPlushies-Launcher.user.js`](SubbysPlushies-Launcher.user.js) | Optional release launcher; install **instead of** the full script. |
| [`version.json`](version.json) | Latest release manifest used by the update checker. |
| [`assets/`](assets/) | Plushie artwork, optional sound effects and other assets. |
| [`data/`](data/) | Validated JSON resources, wardrobe color layers and configuration. |
| [`csv/`](csv/) | Additional repository data. |

## Credits

- **Plugin / Development:** Marvelous
- **Lore, Text & Assets:** Subbycat
- **Rey's Lore:** hira

For bugs, compatibility concerns, or feature requests, use [GitHub Issues](https://github.com/marvelous-bc/subby-plushies/issues). Include your **Bondage Club release, browser, userscript manager, Essentials version, and reproduction steps** where possible.

---
