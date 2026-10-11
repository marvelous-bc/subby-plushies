# Subby's Plushies + Wardrobe — v3.5.0-beta.2 (Beta)

A Bondage Club userscript that adds plushie interactions, relationships, emotes, room mascots, progress/achievements, a native wardrobe collection, and a built-in color-zone editor.

**Credits:** Plugin / Development — **Marvelous** · Lore, Text & Assets — **Subbycat** · Rey's Lore — **hira**.


## What's new: Wardrobe Studio

Open **Extensions → Wardrobe → Edit Color Zones** for the Headband, Heart Charm, or Draped Wrap Dress.

- **Manage zones:** Add, rename, delete, merge and lock color zones (up to 16 per item). New/renamed zones are exported with explicit `zoneOrder` so they are recognized as BC color layers after publishing.
- **Brush tools:** Size 1–64 px, hardness 0–100%, opacity 1–100%, paint and erase the selected zone. Existing overlapping masks are preserved until edited.
- **Magic Wand:** Selects a connected similar-color region within the opaque garment; click **Apply Wand Selection** to paint it into the chosen zone. Tolerance adjustable.
- **Smart Fill:** Immediately fills a connected region of similar artwork colors and matching existing zone boundaries. Tolerance adjustable.
- **Before/after:** Original garment PNG and edited zone visualization appear side by side; the main canvas can display all zones, the current zone, or original artwork only.
- **In-game preview:** Opt in to apply the current zone masks *locally* to your equipped item. No network update is sent, and the original color layers are restored on turning preview off or closing the editor. **Requires the item equipped.**
- **Pose selector:** Choose Standing, ArmsUp, ArmsUpWide, ArmsBehind, Kneel or AllFours. Import **one transparent PNG per pose** (`<AssetName>_<Pose>.png`) on the same full canvas size as Standing. You can optionally copy the standing zone masks, then paint pose-specific masks. Export new pose PNG files and the color manifest. The game uses mapped native asset layers to select them; verify each pose in BC.
- **Clothing slot selector:** Pick a supported native appearance slot. Changing the slot is not immediate: publish `color-layers.json`, reload BC, and unequip the old-slot item before equipping its new version.
- **Movable/resizable window:** Drag the title bar to reposition; resize via the bottom-right corner. Zoom from 15% to 800%, hand/pan mode, middle-button pan, Ctrl+wheel zoom, undo and redo.


### Safety and known limitations

- A per-pose coverage/opacity guard prevents exporting extremely incomplete masks that would make the clothing invisible. No asset PNGs are rewritten by normal zone painting.
- The live in-game preview temporarily swaps local image mappings; it is not a multiplayer preview, and it restores original sprites on exit.
- **New poses are not automatically illustrated**. Create or import one PNG per pose; all poses use the same dimensions as Standing, with separate zone masks and shared color pickers.
- Mapping through native BC `PoseMapping` is present, but some pose variants/other extensions may require further calibration inside BC. There is no guarantee of correct arm/hand occlusion for every pose.
- Zone creation changes the image masks, not the garment silhouette. No character-height manipulation is performed.
- The dialog handles desktop and smaller windows but the native BC canvas UI may use special CSS. Report screenshot and browser/BC version if any controls overlap.

## Existing wardrobe items

| Item | BC slot | Color zones |
| --- | --- | --- |
| Subbycat Cat-Ear Headband (`SubbyCatHeadband`) | Hair Accessory 2 | OuterEars, InnerEars, Headband, Bow |
| Subbycat Heart Charm (`SubbyHeartCharm`) | Necklace | Chain, Heart |
| Subby's Draped Wrap Dress (`SubbyDrapedWrapDress`) | Upper Clothing (`Cloth`) | Fabric, RearDrape, Underlayer, KnotSash |

The current Dress remains **279×373 BC sprite pixels**, native **X90 / Y182**, with the same custom zone masks, Fabric priority **29**, and no forced character-height changes. This reflects the previously provided reference fit at 155 cm. Native BC character scaling remains in charge of height; other heights need live fitting checks. 

## Install

You can run the full userscript locally or install the release launcher. **Don't run both at once.** The game must support R132-compatible APIs, and other viewers will need a compatible version to see your custom wardrobe items.


### Diagnostics

```js
SubbysWardrobeCurated.diagnose()
SubbysWardrobeCurated.imageStatus
SubbysWardrobeCurated.nativePicker
SubbysWardrobeCurated.heightFit()
```


## Credits

- **Plugin / Development:** Marvelous
- **Lore, Text & Assets:** Subbycat
- **Rey's Lore:** hira