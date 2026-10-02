# Changelog

All notable changes to **Subby's Plushies** are documented here.

## [1.9.4]

### Changed
- 15-second plushie emotes are now room-synced for other Subby's Plushies clients instead of local-only.
- Removed Plugin API documentation from the user-facing Extensions Commands page; the API itself remains available and is documented in README.
- Refreshed `data/commands.json` so every command uses the `/plushie...` namespace.

### Fixed
- Mood/emote symbols such as `zZ` now follow the plushie's actual transformed position while Move / Resize, Easy Drag, scale, or rotation changes it.

## [1.9.3]

### Added
- Per-plush mood history (40 stored, recent entries shown in History).
- Relationship milestone celebration bubbles.
- Last-20 plushie battle history page.
- Normal / Low CPU performance mode.
- Public Plugin API v1 and local event subscriptions.
- Backup schema v3 with history data.

## [1.9.2]

### Added / Changed
- Use-menu Emotes, Presets, and Extension Menu shortcuts.
- 15-second manual emotes.
- Short `/plushie...` command namespace; unreleased `/subbyplush...` aliases removed.
- Tamper-evident progression backup sealing.
- Persistent room mascot synchronized through room `Custom` data so late joiners can recover it.

## [1.9.1]

### Cleanup
- Removed obsolete compatibility paths for unreleased historical Subby's Plushies builds while keeping current BC/API and Git/cache safety fallbacks.

## [1.9.0]

### Added
- Per-plush relationship levels: Stranger, Familiar, Friend, Bestie, Bonded.
- Favorite plushies and Favorites-first Use menu.
- Mood symbols and sleepy state.
- Three saved pose slots per plush.
- Manual emotes and dedicated Plushies tab.
- Portable Backup / Restore.

## [1.8.9]

### Changed
- Speech bubbles reduced to roughly half size and moved 5 CSS pixels upward.
- Passive happiness decay changed to -1 every 15 minutes with a floor of 29.

## [1.8.8]

### Fixed
- Reworked Use-menu Search / Page / Mood header formatting to prevent overlap.

## [1.8.7]

### Added
- Dedicated Pink theme and shared theme presets that apply to both Use and Extensions interfaces.

## [1.8.6]

### Added
- Independent Use-menu and Extensions color customization with presets, copy, and reset controls.

## [1.8.5]

### Changed
- Paginated/cleaned lo-fi Use menu and lo-fi Extensions UI.
- Added local layout customization.

## [1.8.4]

### Added
- Join the cuddle room achievement.
- Named-player Battle prompt.
- Hover plush previews and lo-fi Use-menu refresh.

## [1.8.3]

### Added
- Meet the cuddle queen achievement.

## [1.8.1 - 1.8.0]

### Added
- Git-backed validated JSON loader/cache/fallback architecture.
- Dedicated Lore browser tab.

All notable changes to **Subby's Plushies** are documented here.

The project follows semantic-style versioning for addon releases. Dates are omitted for older builds where an exact release date was not recorded.

## [1.7.7]

### Added
- Added a **Commands** tab to the native Subby's Plushies Extensions page.
- Grouped command reference into General, Positioning, Features, Room Mascot, Battle / Stats / Achievements, and Updates / Diagnostics.
- Added `/subbyplushcommands` and `/subbyplushcommand` shortcuts to open the Commands tab directly.

### Changed
- Moved speech bubbles **5 CSS pixels lower** while preserving the v1.7.6 positioning logic.

## [1.7.6]

### Fixed
- Reworked speech-bubble positioning so bubbles follow the actual character draw position and zoom rather than treating character-canvas coordinates as screen coordinates.
- Bubbles now track transformed plush position, scale, rotation, Move/Resize changes, Easy Drag, and temporary poses more accurately.

## [1.7.5]

### Fixed
- Improved **Protect Me** detection for standard Bondage Club activities such as slap, pinch, and spank.
- Added target-name fallback when the raw activity packet does not expose the expected member number.
- Added rendered-chat detection as a fallback for compatible activity lines.
- Added deduplication so the same action is not processed twice through packet and rendered-chat paths.

## [1.7.4]

### Changed
- Restored detailed Plushie Battle content after the v1.7.3 compression experiment.
- Reduced the visual size of battle-only chat output instead of removing battle detail.
- Battle messages, prompts, and round-result text use smaller typography and tighter spacing while normal chat remains unchanged.

## [1.7.3]

### Changed
- Simplified the visible Extensions pages by removing Hook Backend, Activities, Image Mapping, Drags, Different Plushies Used, and the detailed Plushies Used section.
- Kept the underlying diagnostics and tracked data inside the addon.
- Experimented with shorter Plushie Battle chat output to reduce room-chat usage. This presentation change was revised in v1.7.4.

## [1.7.2]

### Changed
- Registered Subby's Plushies through Bondage Club R132's native `PreferenceRegisterExtensionSetting(...)` Extensions system.
- Removed the fixed-position Extensions-list button.
- The addon is now positioned and queued naturally with other registered Extensions entries.
- Clicking the native Extensions entry opens the Subby's Plushies submenu.
- Returning from the submenu now restores the normal Extensions list cleanly.

## [1.7.1]

### Added
- Added a dedicated Subby's Plushies Extensions control center.
- Added **Status**, **Settings**, **Stats**, and **Achievements** tabs.
- Added utility controls for update checks, Move/Resize, lore/mood, position reset, and diagnostics.
- Added `/subbyplushextensions`, `/subbyplushsettings`, and `/subbyplushstatus` shortcuts.

## [1.7.0]

### Added
- Added local-only **idle plushie animations**.
- Added mood-aware **speech bubbles**.
- Added multiplayer **Plushie Battle** with challenge, accept/decline, battle moves, round scoring, and results.
- Added searchable plushie names in the plush selector.
- Added persistent local interaction **stats**.
- Added **achievements** and unlock tracking.
- Added settings toggles for Idle Animation and Speech Bubbles.
- Added commands for stats, achievements, speech, idle animation, speech-bubble control, and Plushie Battle.

### Performance
- Idle animations remain local and avoid repeated room/network updates.

## [1.6.9]

### Added
- Added **Easy Drag** mode with a visible Drag ON/OFF toggle.
- Added `/subbyplushdrag`, `/subbyplushdrag on`, and `/subbyplushdrag off`.

### Changed
- When Easy Drag is enabled, the held plush can be moved by dragging from the character area instead of requiring an exact plush hitbox grab.
- Drag movement remains local while moving and publishes the final appearance state on release.
- Existing snap-point behavior is preserved.

## [1.6.8]

### Changed
- Moved the Room Mascot overlay lower inside the chat area to avoid covering room timestamp text.

## [1.6.7]

### Fixed
- Fixed Room Mascot disappearing when attached directly to the scrollable chat-log element.
- Mascot is now attached to `document.body` while being positioned from the visible chat-log rectangle.
- Removed an overly broad menu-hide condition that could leave the mascot hidden.

## [1.6.6]

### Changed
- Attempted to place the Room Mascot directly inside the chat box below the top controls.

### Known Issue
- The direct chat-log attachment could be clipped or scrolled out of view. This was corrected in v1.6.7.

## [1.6.5]

### Changed
- Room Mascot now yields to actual menus, dialogs, and native Layering/Move-Resize screens instead of covering them.
- Drag hit-testing was updated to use the plushie's transformed position, scale, and rotation.

## [1.6.4]

### Changed
- Moved the Room Mascot overlay to the top-right.
- Split the mascot label into two lines: `Room Mascot` and the mascot name.
- Moved the plush mood label lower in the plush menu to avoid control overlap.

## [1.6.3]

### Added
- Added a dedicated **Settings** submenu.
- Added settings for Protect Me, Jealous Plushie, Drag/Snap, Room Mascot picture, Automatic Update Checks, and manual update checks.

### Changed
- Reduced Room Mascot artwork to 60×60 and the surrounding widget footprint accordingly.
- Automatic update checks can now be disabled.

## [1.6.2]

### Added
- Added a top-corner Room Mascot picture overlay.
- Added local mascot show/hide controls and commands.

### Security / Permissions
- Room Mascot set/clear is restricted to synchronized room admins.
- Receiving clients validate mascot set/clear events against the room admin list.
- Local show/hide remains available to all users.

## [1.6.1]

### Fixed
- Restored the proven HTML image-mapping path after the v1.5.55 optimization caused plush images to disappear on some clients.
- Added a second slash-command interception path through `ChatRoomSendChat` to improve command reliability.

## [1.6.0]

### Added
- Added persistent per-plush **Mood** scores with lazy decay toward neutral.
- Added optional **Protect Me** reactions.
- Added optional **Jealous Plushie** reactions.
- Added plush **Lore** and mood commands/menu access.
- Added safe update checking through a remote version manifest without executing remote code.
- Added direct drag with snap points for Hands, Chest, Face, Head, Left Shoulder, and Right Shoulder.
- Added local pet/pat wiggle animation.
- Added **Room Mascot** support with set/show/clear behavior.

## [1.5.55]

### Performance
- Removed the global `TextGet` hook.
- Made room-membership tracking primarily event-driven through chat-room synchronization hooks.
- Reduced roster polling to a slow watchdog interval.
- Reduced global image interception overhead by preferring narrower image paths.

### Known Issue
- The aggressive image-hook optimization could make plush artwork invisible on some clients. The proven image path was restored in v1.6.1.

## [1.5.54]

### Performance
- Added faster hot-path exits for activity processing.
- Reduced unnecessary activity/menu allocations.
- Reduced redraws while typing Move/Resize values; changes commit after editing instead of every keystroke.
- Slowed multiple safety watchdogs and integrity checks.
- Reduced room-wide temporary allocations.
- Optimized image-hook bypass for non-plush assets.

## [1.5.53]

### Fixed
- Fixed Move/Resize edits losing a previously changed axis.
- X, Y, Scale X, Scale Y, and rotation changes now merge into the saved active-layer transform instead of replacing unrelated fields.

## [1.5.52]

### Performance
- Reworked transform persistence from duplicated all-layer transform state to **active-layer-only** transform state.
- Added safe migration from older duplicated transform data.
- Removed an unconditional second full refresh after plush selection, retaining fallback stabilization only when needed.

## [1.5.51]

### Baseline
- Baseline standalone single-asset modular Subby's Plushies build used as the starting point for the optimization and feature work documented above.
- Supports the runtime `SubbysPlushies` handheld asset, multiple plush variants, custom plush activities, Move/Resize integration, temporary poses, Offer Plushie transfer, and remote plush artwork mapping.
