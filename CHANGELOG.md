# Changelog

All notable changes to **Subby's Plushies** are documented here.

## [2.3.7.13] - 2026-10-03

### Repository sync
- Rebuilt the repository metadata around the current `2.3.7.13` full build.
- Updated `README.md`, `version.json`, `SHA256SUMS.txt`, the launcher, Firefox bookmarklet, and `data/index.json`.
- Rebuilt `data/commands.json` directly from the command groups compiled into the userscript.
- The Extensions Commands tab now keeps the in-code command set as the authoritative baseline so an older Git `commands.json` cannot remove newer commands.

### Browser compatibility
- Added the current Opera/userscript page-context bootstrap to the full build.
- Added both `www` and non-`www` Bondage Club host variants in userscript metadata.
- Kept a Firefox bookmarklet option for loading the current GitHub build without a userscript-manager loader.

### Plushie slots and rendering
- Added/retained the second plushie wearable slot in `ItemAddon`.
- Idle wiggle/rotation now applies across equipped plushie items, including the second/ceiling-style plushie.
- Easy Drag and Move/Resize preserve the complete active transform, including prior resize/scale and rotation changes.
- Mood/status overlays and bubbles track transformed plushie position more consistently.

### Mood, mascot, and reactions
- Passive affection decay is now `-1` per completed 8-hour block for unequipped plushies.
- Equipped plushies do not lose affection and do not accumulate hidden decay while held/worn.
- Room mascot has a positive-affection modifier and supports shared hourly random cycling.
- Removed `poke` from Protect Me and added it to Jealous Plushie activity detection.
- Added/retained `boop` and `bap` in Protect Me detection.

### Chat and interaction text
- Plushie action output can name the actual plushie rather than always saying only “the plushie”.
- Character-aware wording uses Bondage Club character information where supported instead of relying only on generic `their` wording.
- Current custom activity set includes Nose Boop, Rest Cheek, Forehead Bump, and Snuggle in addition to the earlier actions.

### Data/config cleanup
- Updated `moods.json` from the obsolete 15-minute decay settings to the 8-hour behavior used by the current build.
- Updated `protect.json` to the current Protect/Jealous keyword split.
- Updated `defaults.json` with hourly mascot cycling and floating Drag button defaults.
- Updated `idle.json`, `speech.json`, `activities.json`, `achievements.json`, and other repo data files to match the current runtime behavior.
- Updated `data/index.json` plugin version from the stale v2.0 metadata.

## [2.3.7.12] - 2026-10-03
- Added an explicit page-context bridge for Opera/userscript isolation while retaining direct execution when Bondage Club globals are already visible.
- Added diagnostics for page-context startup failures instead of silently remaining in the BC-readiness loop.

## [2.3.7.11] - 2026-10-03
- Expanded userscript host coverage to both `www` and non-`www` Bondage Club hosts.
- Adjusted userscript loading metadata during Opera compatibility testing.

## [2.3.7.10] - 2026-10-03
- Added shared hourly mascot cycling and mascot affection modifier behavior.
- Added ItemAddon/second-plush support and current drag/overlay tracking changes.
- Changed passive affection decay to the 8-hour unequipped-only model.
- Updated Protect/Jealous keywords (`boop`/`bap` in Protect, `poke` in Jealous).
- Continued performance, mascot movement, transform persistence, named action-text, and overlay-position work.

## [2.3.x] - 2026-10-02 to 2026-10-03
- Continued v2 stabilization for R132, ItemAddon support, native Extensions icon/integration, pet-suit/arm-restraint visibility, drag UI, mascot placement, and browser loading.

## [2.2.0]
- Consolidated the v2 standalone addon architecture with modular plush artwork, native Extensions integration, mood/relationship systems, synchronized emotes, saved poses, backup/restore, and Git-backed data.

## [1.9.4]
- Made 15-second plushie emotes room-synchronized instead of local-only.
- Refreshed the `/plushie...` command namespace and improved transformed mood/emote symbol tracking.

## [1.9.3]
- Added per-plush mood history, relationship milestone bubbles, battle history, performance mode, public API events, and backup history data.

## [1.9.2]
- Added Use-menu shortcuts, manual emotes, the short `/plushie...` namespace, tamper-evident progression backup sealing, and persistent room mascot synchronization.

## [1.9.0]
- Added relationship levels, favorites, mood symbols/sleepy state, saved pose slots, manual emotes, and portable backup/restore.

## [1.8.x]
- Added theme/layout customization, pink theme, hover previews, command UI improvements, and several positioning fixes.

## [1.7.x]
- Added the Extensions control center and Commands tab, battle/stats/achievements, idle animations, speech bubbles, Easy Drag, and native Extensions registration.

## [1.6.x]
- Added persistent moods, Protect Me, Jealous Plushie, lore, update checking, Room Mascot, and the first drag/snap implementation.

## [1.5.51 - 1.5.55]
- Established the standalone modular plush baseline and then optimized transform persistence, activity hot paths, redraw behavior, room tracking, and image handling.
## [1.5 and prior]
- Plugin base.