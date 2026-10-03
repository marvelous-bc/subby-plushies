// ==UserScript==
// @name         BC - Subby's Plushies
// @namespace    subbycat.subbysplushies
// @author	     Marvelous
// @version      2.0.0
// @description  Plushie companion system for Bondage Club R132: activities, moods, relationships, emotes, battles, mascot, themes, poses, stats, achievements, and more
// @homepageURL   https://github.com/marvelous-bc/subby-plushies
// @supportURL    https://github.com/marvelous-bc/subby-plushies/issues
// @updateURL     https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js
// @downloadURL   https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/SubbysPlushies.user.js
// @match        https://www.bondageprojects.elementfx.com/R*
// @match        https://www.bondageeurope.com/*/BondageClub/
// @match        https://www.bondage-europe.com/*/BondageClub/
// @match        https://www.bondage-asia.com/club/*/
// @run-at       document-start
// @grant        none
// @sandbox      raw
// ==/UserScript==

(() => {
    "use strict";

    const VERSION = "2.0.0";
    const TAG = "[Subby's Plushies]";
    const MOD_NAME = "SubbysPlushies";
    const DISPLAY_NAME = "Subby's Plushies";
    const FAMILY = "Female3DCG";
    const GROUP = "ItemHandheld";
    const ASSET_NAME = "SubbysPlushies";
    const MODULE_KEY = "p";

    const HUG_TIGHTLY_ACTIVITY_NAME = "SubbysPlushiesHugTightlyItem";
    const HUG_TIGHTLY_ACTIVITY_LABEL = "Hug Tightly";
    const HUG_TIGHTLY_ACTIVITY_ID_BASE = 9000;
    const HUG_TIGHTLY_MARKER_TAG = "SubbysPlushiesHugTightly";

    const CUSTOM_ACTIVITY_ID_BASE = 9010;
    const CUSTOM_ACTIVITY_MARKER_TAG = "SubbysPlushiesActivity";
    const CUSTOM_ACTIVITY_TOKEN_TAG = "SubbysPlushiesActivityToken";
    const CUSTOM_ACTIVITY_SOURCE_MEMBER_TAG = "SubbysPlushiesSourceMember";
    const CUSTOM_ACTIVITY_SOURCE_NAME_TAG = "SubbysPlushiesSourceName";
    const CUSTOM_ACTIVITY_TARGET_MEMBER_TAG = "SubbysPlushiesTargetMember";
    const CUSTOM_ACTIVITY_TARGET_NAME_TAG = "SubbysPlushiesTargetName";

    const CUSTOM_PLUSH_ACTIVITIES = Object.freeze([
        {
            key: "rubFace",
            name: "SubbysPlushiesRubAgainstFaceItem",
            label: "Rub Against Face",
            targets: ["ItemMouth"],
            targetSelf: true,
            selfText: "{Source} rubs the plushie against their face.",
            otherText: "{Source} rubs the plushie against {Target}'s face.",
        },
        {
            key: "cuddleChest",
            name: "SubbysPlushiesCuddleToChestItem",
            label: "Cuddle to Chest",
            targets: ["ItemTorso", "ItemBreast"],
            targetSelf: true,
            selfText: "{Source} cuddles the plushie against their chest.",
            otherText: "{Source} cuddles the plushie against {Target}'s chest.",
        },
        {
            key: "nuzzle",
            name: "SubbysPlushiesNuzzlePlushieItem",
            label: "Nuzzle Plushie",
            targets: ["ItemMouth"],
            targetSelf: true,
            selfText: "{Source} nuzzles into the plushie.",
            otherText: "{Source} nuzzles the plushie against {Target}'s cheek.",
        },
        {
            key: "pat",
            name: "SubbysPlushiesPatPlushieItem",
            label: "Pat Plushie",
            targets: ["ItemHands"],
            targetSelf: true,
            selfText: "{Source} gives the plushie a gentle pat.",
            otherText: "{Source} holds the plushie out for {Target} and gives it a gentle pat.",
        },
        {
            key: "pet",
            name: "SubbysPlushiesPetPlushieItem",
            label: "Pet Plushie",
            targets: ["ItemHands"],
            targetSelf: true,
            selfText: "{Source} pets the plushie affectionately.",
            otherText: "{Source} lets {Target} pet the plushie.",
        },
        {
            key: "hideBehind",
            name: "SubbysPlushiesHideBehindPlushieItem",
            label: "Hide Behind Plushie",
            targets: ["ItemMouth", "ItemHood"],
            targetSelf: true,
            selfText: "{Source} hides their face behind the plushie.",
            otherText: "{Source} playfully hides the plushie in front of {Target}'s face.",
            effect: "hideBehindFace",
        },
        {
            key: "kissPlushie",
            name: "SubbysPlushiesKissPlushieItem",
            label: "Kiss Plushie",
            targets: ["ItemMouth"],
            targetSelf: true,
            selfText: "{Source} gives the plushie a little kiss.",
            otherText: "{Source} gives the plushie a little kiss in front of {Target}.",
        },
        {
            key: "kissWith",
            name: "SubbysPlushiesKissWithPlushieItem",
            label: "Kiss With Plushie",
            targets: ["ItemMouth"],
            targetSelf: false,
            selfText: "{Source} gives the plushie a little kiss.",
            otherText: "{Source} presses the plushie to {Target}'s cheek in a little kiss.",
        },
        {
            key: "bonk",
            name: "SubbysPlushiesBonkWithPlushieItem",
            label: "Bonk With Plushie",
            targets: ["ItemHood", "ItemMouth"],
            targetSelf: true,
            selfText: "{Source} gently bonks themself with the plushie.",
            otherText: "{Source} gently bonks {Target} with the plushie.",
        },
        {
            key: "balanceHead",
            name: "SubbysPlushiesBalanceOnHeadItem",
            label: "Balance Plushie on Head",
            targets: ["ItemHood"],
            targetSelf: true,
            selfText: "{Source} balances the plushie on their head.",
            otherText: "{Source} balances the plushie on {Target}'s head.",
            effect: "balanceHead",
        },
        {
            key: "offer",
            name: "SubbysPlushiesOfferPlushieItem",
            label: "Offer Plushie",
            targets: ["ItemHands"],
            targetSelf: false,
            selfText: "{Source} offers the plushie.",
            otherText: "{Source} offers the plushie to {Target}.",
            prompt: true,
        },
        {
            key: "show",
            name: "SubbysPlushiesShowPlushieItem",
            label: "Show Plushie",
            targets: ["ItemHands"],
            targetSelf: false,
            selfText: "{Source} holds up the plushie.",
            otherText: "{Source} holds up the plushie to show {Target}.",
        },
        {
            key: "whisper",
            name: "SubbysPlushiesWhisperToPlushieItem",
            label: "Whisper to Plushie",
            targets: ["ItemMouth"],
            targetSelf: true,
            selfText: "{Source} leans in and whispers something to the plushie.",
            otherText: "{Source} whispers something to the plushie while looking at {Target}.",
        },
        {
            key: "squeezeCheeks",
            name: "SubbysPlushiesSqueezeCheeksWithPlushieItem",
            label: "Squeeze Cheeks With Plushie",
            targets: ["ItemMouth"],
            targetSelf: false,
            selfText: "{Source} gently squishes their cheeks with the plushie.",
            otherText: "{Source} gently squishes {Target}'s cheeks with the plushie.",
        },
        {
            key: "wave",
            name: "SubbysPlushiesWavePlushieItem",
            label: "Wave Plushie",
            targets: ["ItemHands"],
            targetSelf: false,
            selfText: "{Source} waves the plushie.",
            otherText: "{Source} waves the plushie at {Target}.",
        },
    ].map(spec => Object.freeze(spec)));

    const CUSTOM_ACTIVITY_BY_KEY = new Map(CUSTOM_PLUSH_ACTIVITIES.map(spec => [spec.key, spec]));
    const CUSTOM_ACTIVITY_BY_NAME = new Map(CUSTOM_PLUSH_ACTIVITIES.map(spec => [spec.name, spec]));
    const CUSTOM_ACTIVITY_FAST_TOKENS = Object.freeze(CUSTOM_PLUSH_ACTIVITIES.map(spec => Object.freeze({
        spec,
        compactName: spec.name.replace(/[^a-z0-9]/gi, "").toLowerCase(),
        compactLabel: spec.label.replace(/[^a-z0-9]/gi, "").toLowerCase(),
    })));
    let BALANCE_HEAD_DURATION_MS = 8000;
    let BALANCE_HEAD_TRANSFORM = Object.freeze({
        TranslationX: 0,
        TranslationY: -170,
        Rotation: 0,
    });

    let HIDE_BEHIND_DURATION_MS = 8000;

    const ACTIVITY_MONITOR_INTERVAL_MS = 5000;
    const ACTIVITY_INTEGRITY_INTERVAL_MS = 60000;
    const ROOM_ROSTER_WATCHDOG_INTERVAL_MS = 60000;
    const CHAT_OBSERVER_MONITOR_INTERVAL_MS = 10000;
    const LAYERING_BRIDGE_MONITOR_INTERVAL_MS = 1000;
    let HIDE_BEHIND_FACE_TRANSFORM = Object.freeze({
        TranslationX: 0,
        TranslationY: -105,
        Rotation: 0,
    });

    const FEATURE_SETTINGS_STORAGE_KEY = "SubbysPlushies:feature-settings:v1";
    const LAYOUT_SETTINGS_STORAGE_KEY = "SubbysPlushies:layout-settings:v1";
    const MOOD_STORAGE_KEY = "SubbysPlushies:moods:v1";
    const MOOD_HISTORY_STORAGE_KEY = "SubbysPlushies:mood-history:v1";
    const BATTLE_HISTORY_STORAGE_KEY = "SubbysPlushies:battle-history:v1";
    const STATS_STORAGE_KEY = "SubbysPlushies:stats:v1";
    const RELATIONSHIP_STORAGE_KEY = "SubbysPlushies:relationships:v1";
    const FAVORITES_STORAGE_KEY = "SubbysPlushies:favorites:v1";
    const SAVED_POSES_STORAGE_KEY = "SubbysPlushies:saved-poses:v1";
    const NICKNAME_STORAGE_KEY = "SubbysPlushies:nicknames:v1";
    const BACKUP_SCHEMA_VERSION = 3;
    const BACKUP_PROGRESS_SEAL_VERSION = 1;
    const BACKUP_PROGRESS_SEAL_KEY = ["Subbys", "Plushies", "portable", "progress", "v3", "89413"].join("|");
    const ROOM_MASCOT_CUSTOM_KEY = "SubbysPlushiesMascot";
    const ROOM_MASCOT_CACHE_STORAGE_KEY = "SubbysPlushies:room-mascots:v1";
    const PLUSH_EMOTE_SYNC_CONTENT_PREFIX = "SubbysPlushiesEmote:";
    const PLUSH_EMOTE_SYNC_TAG = "SubbysPlushiesEmote";
    const PLUSH_EMOTE_DURATION_MS = 15000;
    const OFFER_TRANSFER_SYNC_CONTENT = "SubbysPlushiesOfferSync";
    const OFFER_TRANSFER_SYNC_PROTOCOL = 1;
    const OFFER_TRANSFER_SYNC_RETRY_DELAYS_MS = Object.freeze([0, 250, 900]);
    const CUDDLE_QUEEN_MEMBER_NUMBER = 89413;
    const CUDDLE_ROOM_NAME = "Subbycat's place";
    let FEATURE_DEFAULTS = Object.freeze({
        protectMe: false,
        jealousPlushie: false,
        showRoomMascot: true,
        autoUpdateChecks: true,
        idleAnimations: true,
        speechBubbles: true,
    });
    let IDLE_MIN_DELAY_MS = 22000;
    let IDLE_MAX_DELAY_MS = 48000;
    let SPEECH_BUBBLE_DURATION_MS = 3400;
    let SPEECH_BUBBLE_Y_OFFSET_CSS_PX = 5;
    let SPEECH_INTERACTION_ACTIONS = Object.freeze(["pet", "pat", "cuddleChest", "kissPlushie"]);
    let SPEECH_INTERACTION_CHANCE = 0.45;
    let SPEECH_INTERACTION_DELAY_MS = 140;
    let SPEECH_IDLE_CHANCE = 0.32;
    const BATTLE_CHALLENGE_RE = /(.+?)\((\d+)\) challenges (.+?)\((\d+)\) to a plushie battle with (.+?)\./i;
    const BATTLE_RESULT_RE = /Plushie battle result: (.+?)\((\d+)\) \[([^\]]+)\] (wins|loses|draws) against (.+?)\((\d+)\) \[([^\]]+)\]\. Scores (\d+)-(\d+)\./i;
    const UPDATE_CHECK_STORAGE_KEY = "SubbysPlushies:last-update-check:v1";
    const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
    const UPDATE_REPOSITORY_API = "https://api.github.com/repos/marvelous-bc/subby-plushies/contents/";
    const UPDATE_REPOSITORY_PAGE = "https://github.com/marvelous-bc/subby-plushies";

    let PROTECT_DURATION_MS = 2800;
    let PROTECT_TRANSFORM = Object.freeze({
        TranslationX: 0,
        TranslationY: -78,
        Rotation: 0,
    });
    let PROTECT_KEYWORDS = Object.freeze([
        "slap", "spank", "hit", "punch", "kick", "bonk", "poke", "tickle",
        "bite", "pinch", "whip", "shock", "zap", "attack", "smack", "swat",
    ]);
    let PROTECT_RENDER_VERB_RE = /\b(slaps?|spanks?|hits?|punch(?:es)?|kicks?|bonks?|pokes?|tickles?|bites?|pinches?|whips?|shocks?|zaps?|attacks?|smacks?|swats?)\b/i;
    let PROTECT_RENDER_ACTION_RE = /(.+?)\s+(slaps?|spanks?|hits?|punch(?:es)?|kicks?|bonks?|pokes?|tickles?|bites?|pinches?|whips?|shocks?|zaps?|attacks?|smacks?|swats?)\s+(.+?)(?:'s|')\s+[^.)]+/i;
    let JEALOUS_ACTIVITY_KEYWORDS = Object.freeze([
        "kiss", "hug", "cuddle", "caress", "nuzzle", "snuggle", "pet", "lick", "smooch",
    ]);

    let MOOD_DEFAULT_SCORE = 60;
    let MOOD_MIN_SCORE = 0;
    let MOOD_MAX_SCORE = 100;
    let MOOD_DRIFT_TARGET = 29;
    let MOOD_DRIFT_STEP = 1;
    let MOOD_DRIFT_EVERY_MS = 15 * 60 * 1000;
    let MOOD_LABELS = Object.freeze([
        Object.freeze({ maxScore: 18, label: "Grumpy" }),
        Object.freeze({ maxScore: 38, label: "Sulky" }),
        Object.freeze({ maxScore: 58, label: "Calm" }),
        Object.freeze({ maxScore: 78, label: "Happy" }),
        Object.freeze({ maxScore: 92, label: "Very Happy" }),
        Object.freeze({ maxScore: 100, label: "Adoring" }),
    ]);

    let MOOD_DELTAS = Object.freeze({
        rubFace: 4, cuddleChest: 7, nuzzle: 5, pat: 3, pet: 6, hideBehind: 1,
        kissPlushie: 6, kissWith: 3, bonk: -8, balanceHead: 2, show: 2,
        whisper: 3, squeezeCheeks: -2, wave: 1, hugTightly: 10, protect: 4, jealous: -4,
    });

    let RELATIONSHIP_LEVELS = Object.freeze([
        Object.freeze({ name: "Stranger", minInteractions: 0 }),
        Object.freeze({ name: "Familiar", minInteractions: 5 }),
        Object.freeze({ name: "Friend", minInteractions: 20 }),
        Object.freeze({ name: "Bestie", minInteractions: 50 }),
        Object.freeze({ name: "Bonded", minInteractions: 100 }),
    ]);
    let RELATIONSHIP_SPEECH = Object.freeze({
        Familiar: Object.freeze(["I know you!", "You're familiar now."]),
        Friend: Object.freeze(["I'm glad you're here.", "Friend cuddle?"]),
        Bestie: Object.freeze(["Bestie cuddle!", "You always come back ♥"]),
        Bonded: Object.freeze(["Always with you. ♥", "We're stitched together now."]),
    });
    let SLEEPY_AFTER_MS = 30 * 60 * 1000;
    const SAVED_POSE_SLOTS = Object.freeze([1, 2, 3]);

    let PLUSH_SPEECH = Object.freeze({
        grumpy: Object.freeze(["Hmph.", "No more bonks.", "I require cuddles.", "Excuse me?!"]),
        calm: Object.freeze(["Comfy.", "Hi there.", "Just plushie things.", "I'm watching."]),
        happy: Object.freeze(["Cuddle?", "Prrr~", "This is nice!", "Again!", "Hehe~"]),
        adoring: Object.freeze(["You're my favorite!", "Never letting go.", "Best holder ever!", "More cuddles!"]),
    });
    let IDLE_ANIMATION_FRAMES = Object.freeze([
        Object.freeze({ delayMs: 0, deltaY: -2, rotationMultiplier: 2, restore: false }),
        Object.freeze({ delayMs: 160, deltaY: -5, rotationMultiplier: -3, restore: false }),
        Object.freeze({ delayMs: 340, deltaY: -2, rotationMultiplier: 2, restore: false }),
        Object.freeze({ delayMs: 520, deltaY: 0, rotationMultiplier: 0, restore: true }),
    ]);

    let BATTLE_ROUNDS = 3;
    let BATTLE_RESULT_DELAY_MS = 180;
    let BATTLE_MOVES = Object.freeze([
        Object.freeze({ name: "Cuddle Crush", min: 3, max: 8 }),
        Object.freeze({ name: "Tiny Bonk", min: 2, max: 10 }),
        Object.freeze({ name: "Squeak Blast", min: 4, max: 8 }),
        Object.freeze({ name: "Dramatic Stare", min: 1, max: 11 }),
        Object.freeze({ name: "Plushie Pounce", min: 3, max: 9 }),
    ]);
    let AFFECTION_ACTION_KEYS = Object.freeze(["rubFace", "cuddleChest", "nuzzle", "pat", "pet", "kissPlushie", "kissWith", "whisper", "hugTightly"]);
    let ACHIEVEMENTS = Object.freeze([
        Object.freeze({ id: "first_friend", name: "First Friend", description: "Interact with a plushie once.", test: s => s.totalInteractions >= 1 }),
        Object.freeze({ id: "plush_pal", name: "Plush Pal", description: "Reach 25 plushie interactions.", test: s => s.totalInteractions >= 25 }),
        Object.freeze({ id: "professional_cuddler", name: "Professional Cuddler", description: "Reach 100 affectionate plushie interactions.", test: s => statAffectionCount(s) >= 100 }),
        Object.freeze({ id: "bonk_scholar", name: "Bonk Scholar", description: "Use Bonk With Plushie 10 times.", test: s => (s.actions?.bonk || 0) >= 10 }),
        Object.freeze({ id: "head_case", name: "Head Case", description: "Balance a plushie on a head 25 times.", test: s => (s.actions?.balanceHead || 0) >= 25 }),
        Object.freeze({ id: "collector", name: "Collector", description: "Use 10 different plushies.", test: s => Object.keys(s.plushesUsed || {}).length >= 10 }),
        Object.freeze({ id: "chatty_plush", name: "Chatty Plush", description: "Show 25 plushie speech bubbles.", test: s => (s.speechBubbles || 0) >= 25 }),
        Object.freeze({ id: "wiggle_worm", name: "Wiggle Worm", description: "See 25 idle plushie animations.", test: s => (s.idleAnimations || 0) >= 25 }),
        Object.freeze({ id: "battle_tested", name: "Battle Tested", description: "Finish your first plushie battle.", test: s => (s.battles?.played || 0) >= 1 }),
        Object.freeze({ id: "plush_champion", name: "Plush Champion", description: "Win 10 plushie battles.", test: s => (s.battles?.wins || 0) >= 10 }),
        Object.freeze({ id: "meet_cuddle_queen", name: "Meet the cuddle queen", description: "Share a chat room with the Cuddle Queen.", test: s => achievementMetricValue(s, "cuddleQueenEncounter") >= 1 }),
        Object.freeze({ id: "join_cuddle_room", name: "Join the cuddle room", description: "Join Subbycat's place.", test: s => achievementMetricValue(s, "cuddleRoomJoined") >= 1 }),
        Object.freeze({ id: "bestie_material", name: "Bestie Material", description: "Reach Bestie relationship with any plushie.", test: s => achievementMetricValue(s, "maxRelationshipInteractions") >= 50 }),
        Object.freeze({ id: "stitched_together", name: "Stitched Together", description: "Reach Bonded relationship with any plushie.", test: s => achievementMetricValue(s, "maxRelationshipInteractions") >= 100 }),
        Object.freeze({ id: "mascot_maker", name: "Mascot Maker", description: "Set a room mascot once.", test: s => (s.mascotSets || 0) >= 1 }),
    ]);

    let PLUSH_SNAP_POINTS = Object.freeze([
        Object.freeze({ name: "Hands", TranslationX: 0, TranslationY: 0 }),
        Object.freeze({ name: "Chest", TranslationX: 0, TranslationY: -48 }),
        Object.freeze({ name: "Face", TranslationX: 0, TranslationY: -105 }),
        Object.freeze({ name: "Head", TranslationX: 0, TranslationY: -170 }),
        Object.freeze({ name: "Left Shoulder", TranslationX: -92, TranslationY: -88 }),
        Object.freeze({ name: "Right Shoulder", TranslationX: 92, TranslationY: -88 }),
    ]);
    let DRAG_SNAP_RADIUS = 34;
    const ROOM_MASCOT_SET_RE = /(.+?)\s+sets\s+(.+?)\s+as\s+the\s+room\s+mascot\s+plushie\.?/i;
    const ROOM_MASCOT_CLEAR_RE = /(.+?)\s+clears\s+the\s+room\s+mascot\s+plushie\.?/i;

    const ACTIVE_GUARD = "__SUBBYS_PLUSHIES_ACTIVE__";
    if (window[ACTIVE_GUARD]) {
        console.warn(TAG, "Another Subby's Plushies build is already loaded.");
        return;
    }

    window[ACTIVE_GUARD] = VERSION;

    console.log(`[Subby v${VERSION}] Userscript injected.`);

    const REPOSITORY_RAW_ROOT = "https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main";
    const DATA_INDEX_URL = `${REPOSITORY_RAW_ROOT}/data/index.json`;
    const GIT_DATA_SCHEMA_VERSION = 1;
    const GIT_DATA_CACHE_KEY = "SubbysPlushies:git-data-cache:v1";
    const GIT_DATA_LAST_CHECK_KEY = "SubbysPlushies:git-data-last-check:v1";
    const GIT_DATA_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
    const GIT_DATA_FILES = Object.freeze([
        "lore.json",
        "speech.json",
        "moods.json",
        "achievements.json",
        "battle.json",
        "commands.json",
        "poses.json",
        "defaults.json",
        "idle.json",
        "protect.json",
        "relationships.json",
    ]);
    const UPDATE_MANIFEST_URL = `${REPOSITORY_RAW_ROOT}/version.json`;
    const PLUSH_ASSET_ROOT = `${REPOSITORY_RAW_ROOT}/assets/plushies`;
    const SFX_ASSET_ROOT = `${REPOSITORY_RAW_ROOT}/assets/sfx`;
    const HUG_TIGHTLY_ICON_URL = `${PLUSH_ASSET_ROOT}/hugtightly.png`;
    const plushAsset = fileName => `${PLUSH_ASSET_ROOT}/${fileName}`;

    const PURR_SFX_URLS = Object.freeze([
        `${SFX_ASSET_ROOT}/purr.mp3`,
        `${SFX_ASSET_ROOT}/purr.ogg`,
        `${SFX_ASSET_ROOT}/purr.wav`,
    ]);

    const PLUSH_FALLBACK_IMAGE = plushAsset("subbycat.png");

    const PLUSHES = Object.freeze([
        { name: "Subbycat", image: plushAsset("subbycat.png") },
        { name: "Ale", image: plushAsset("subbyale.png") },
        { name: "M", image: plushAsset("M.png?rev=1.5.49") },
        { name: "Izneas", image: plushAsset("izneas.png") },
        { name: "Lyra", image: plushAsset("lyra.png") },
        { name: "Subbycat and luna", image: plushAsset("subbyluna.png") },
        { name: "Subbycat and ale", image: plushAsset("subbyale.png") },
        { name: "Subbycat and Terra", image: plushAsset("subbyterra.png") },
        { name: "Subbycat and pink", image: plushAsset("pink.png") },
        { name: "Subbycat and Steele", image: plushAsset("subbysteele.png") },
        { name: "Terra", image: plushAsset("terra.png") },
        { name: "Steele", image: plushAsset("steele.png") },
        { name: "Izzy and lyly", image: plushAsset("izzylyly.png") },
        { name: "Hari", image: plushAsset("hari%27.png") },
        { name: "Fog", image: PLUSH_FALLBACK_IMAGE },
        { name: "Hira", image: plushAsset("hira.png") },
        { name: "Pink", image: plushAsset("pink.png") },
        { name: "Kyu", image: PLUSH_FALLBACK_IMAGE },

        { name: "Subbycat", image: plushAsset("subbycat.png"), wireAlias: true },
    ].map(Object.freeze));

    const PUBLIC_PLUSH_COUNT = 18;
    const SUBBYCAT_WIRE_OPTION = 18;

    const PLUSH_NAMES = Object.freeze(PLUSHES.map(plush => plush.name));
    const PLUSH_IMAGES = Object.freeze(PLUSHES.map(plush => plush.image));

    let PLUSH_LORE = Object.freeze({});

    const CHARACTER_MENU = Object.freeze([
        { label: "Subbycat", submenu: true },
        { label: "Ale", option: 1 },
        { label: "M", option: 2 },
        { label: "Terra", option: 10 },
        { label: "Steele", option: 11 },
        { label: "Izneas", option: 3 },
        { label: "Lyra", option: 4 },
        { label: "Izzy and lyly", option: 12 },
        { label: "Hari", option: 13 },
        { label: "Fog", option: 14 },
        { label: "Hira", option: 15 },
        { label: "Pink", option: 16 },
        { label: "Kyu", option: 17 },
    ].map(Object.freeze));

    const SUBBYCAT_MENU = Object.freeze([
        { label: "Subbycat", option: 0 },
        { label: "Subbycat and luna", option: 5 },
        { label: "Subbycat and ale", option: 6 },
        { label: "Subbycat and Terra", option: 7 },
        { label: "Subbycat and pink", option: 8 },
        { label: "Subbycat and Steele", option: 9 },
    ].map(Object.freeze));

    const PLUSH_DRAW_PRIORITY = 51;
    const PLUSH_RENDER = Object.freeze({
        Left: 186,
        Top: 305,
        Width: 128,
        Height: 128,
    });

    const DEFAULT_TRANSFORM = Object.freeze({
        TranslationX: 0,
        TranslationY: 0,
        ScaleX: 1,
        ScaleY: 1,
        Rotation: 0,
    });

    const NATIVE_LAYER_TRANSFORM_KEYS = Object.freeze([
        "TranslationX",
        "TranslationY",
        "ScaleX",
        "ScaleY",
        "Rotation",
    ]);
    const NATIVE_LAYER_PROPERTY_BY_TRANSFORM = Object.freeze({
        TranslationX: "LayerTranslationX",
        TranslationY: "LayerTranslationY",
        ScaleX: "LayerScaleX",
        ScaleY: "LayerScaleY",
        Rotation: "LayerRotation",
    });

    const MENU = Object.freeze({
        PanelX: 1000,
        PanelY: 0,
        PanelW: 1000,
        PanelH: 1000,
        CloseX: 1885,
        CloseY: 25,
        CloseW: 90,
        CloseH: 70,
        MoveX: 1445,
        MoveY: 25,
        MoveW: 400,
        MoveH: 70,
        Col1X: 1040,
        Col2X: 1510,
        ButtonW: 430,
        ButtonH: 70,
        StartY: 145,
        RowGap: 88,
        SubStartY: 190,
        SubRowGap: 125,
        BackX: 1290,
        BackY: 760,
        BackW: 420,
        BackH: 75,
    });

    const LOFI_MENU_STYLE = Object.freeze({
        background: "#211B2B",
        header: "#2A2233",
        surface: "#302638",
        surfaceHover: "#403249",
        selected: "#5A4565",
        border: "#8E719A",
        accent: "#D8A8C9",
        text: "#F7EEF5",
        muted: "#C5B6C8",
        shadow: "#17121D",
    });
    const LOFI_PREVIEW_RECT = Object.freeze({ x: 1040, y: 738, w: 910, h: 82 });
    const USE_MENU_PAGE_SIZE = 12;
    const USE_MENU_NAV_RECT = Object.freeze({ x: 1510, y: 650, w: 430, h: 58 });
    const USE_MENU_BACK_RECT = Object.freeze({ x: 1040, y: 650, w: 430, h: 58 });
    const USE_MENU_PREVIOUS_RECT = Object.freeze({ x: 1410, y: 103, w: 54, h: 28 });
    const LAYOUT_DEFAULTS = Object.freeze({
        useMenuDensity: "cozy",
        showHoverPreview: true,
        extensionsDensity: "cozy",
        loreListSide: "left",
    });

    const INTERFACE_COLOR_KEYS = Object.freeze([
        "background", "header", "surface", "surfaceHover", "selected",
        "border", "accent", "text", "muted", "shadow",
    ]);

    const INTERFACE_COLOR_LABELS = Object.freeze({
        background: "Background",
        header: "Header",
        surface: "Buttons / panels",
        surfaceHover: "Hover",
        selected: "Selected",
        border: "Border",
        accent: "Accent",
        text: "Main text",
        muted: "Muted text",
        shadow: "Shadow",
    });

    const INTERFACE_COLOR_PRESETS = Object.freeze({
        "Lo-fi": Object.freeze({ ...LOFI_MENU_STYLE }),
        "Midnight": Object.freeze({
            background: "#12151E", header: "#191E2A", surface: "#222938",
            surfaceHover: "#303A4D", selected: "#3A4660", border: "#69758F",
            accent: "#A8B4D4", text: "#F3F5FA", muted: "#ADB5C6", shadow: "#090B10",
        }),
        "Rose": Object.freeze({
            background: "#281A22", header: "#35212C", surface: "#402833",
            surfaceHover: "#563442", selected: "#704456", border: "#A56C82",
            accent: "#E7A9BD", text: "#FFF1F5", muted: "#D1B2BD", shadow: "#180E13",
        }),
        "Pink": Object.freeze({
            background: "#2A1723", header: "#3A1E31", surface: "#4A2740",
            surfaceHover: "#633653", selected: "#7D4468", border: "#C96F9F",
            accent: "#FF9FD0", text: "#FFF4FA", muted: "#E8BDD4", shadow: "#190C14",
        }),
        "Sage": Object.freeze({
            background: "#1C2621", header: "#263129", surface: "#303C33",
            surfaceHover: "#3E4D42", selected: "#506253", border: "#78927D",
            accent: "#B6D2B9", text: "#F0F7F1", muted: "#B8C7BB", shadow: "#111713",
        }),
        "Monochrome": Object.freeze({
            background: "#171717", header: "#202020", surface: "#292929",
            surfaceHover: "#383838", selected: "#4A4A4A", border: "#777777",
            accent: "#D0D0D0", text: "#F4F4F4", muted: "#B8B8B8", shadow: "#0B0B0B",
        }),
    });

    const FEATURE_MENU = Object.freeze({
        Emotes: Object.freeze({ x: 1040, y: 842, w: 280, h: 58 }),
        Mascot: Object.freeze({ x: 1335, y: 842, w: 300, h: 58 }),
        Settings: Object.freeze({ x: 1650, y: 842, w: 300, h: 58 }),
        Presets: Object.freeze({ x: 1040, y: 914, w: 280, h: 58 }),
        Extensions: Object.freeze({ x: 1335, y: 914, w: 300, h: 58 }),
        Battle: Object.freeze({ x: 1650, y: 914, w: 300, h: 58 }),

        Protect: Object.freeze({ x: 1040, y: 842, w: 280, h: 58 }),
        Jealous: Object.freeze({ x: 1335, y: 842, w: 300, h: 58 }),
        Drag: Object.freeze({ x: 1650, y: 842, w: 300, h: 58 }),
        MascotVisible: Object.freeze({ x: 1040, y: 914, w: 280, h: 58 }),
        AutoUpdate: Object.freeze({ x: 1335, y: 914, w: 300, h: 58 }),
        Update: Object.freeze({ x: 1650, y: 914, w: 300, h: 58 }),
        Idle: Object.freeze({ x: 1040, y: 690, w: 280, h: 58 }),
        Speech: Object.freeze({ x: 1335, y: 690, w: 300, h: 58 }),
        EmotesSettings: Object.freeze({ x: 1650, y: 690, w: 300, h: 58 }),
    });

    const USE_MENU_EMOTES = Object.freeze([
        Object.freeze({ rect: FEATURE_MENU.Emotes, label: "♥ Happy", type: "happy" }),
        Object.freeze({ rect: FEATURE_MENU.Mascot, label: "!! Angry", type: "angry" }),
        Object.freeze({ rect: FEATURE_MENU.Settings, label: "zZ Sleepy", type: "sleepy" }),
        Object.freeze({ rect: FEATURE_MENU.Presets, label: "! Protective", type: "protective" }),
        Object.freeze({ rect: FEATURE_MENU.Extensions, label: "… Sulky", type: "sulky" }),
    ]);

    const EXTENSIONS_IDENTIFIER = "SubbysPlushies";
    const EXTENSIONS_BUTTON_TEXT = "Subby's Plushies";
    const EXTENSIONS_TABS = Object.freeze(["status", "lore", "plushies", "history", "settings", "layout", "stats", "achievements", "backup", "commands"]);

    let EXTENSIONS_COMMAND_GROUPS = [
        {
                "title": "General",
                "commands": [
                        {
                                "command": "/plushie",
                                "description": "Equip Subby's Plushies."
                        },
                        {
                                "command": "/plushieuse",
                                "description": "Open the plushie selector/use menu."
                        },
                        {
                                "command": "/plushieextensions",
                                "description": "Open the Subby's Plushies Extensions control center."
                        },
                        {
                                "command": "/plushiecommands",
                                "description": "Open the Commands tab directly."
                        },
                        {
                                "command": "/plushiecommand",
                                "description": "Alias for /plushiecommands."
                        },
                        {
                                "command": "/plushiestatus",
                                "description": "Open the Status tab."
                        },
                        {
                                "command": "/plushiesettings",
                                "description": "Open the Settings tab."
                        },
                        {
                                "command": "/plushielayout",
                                "description": "Open the Layout customization tab."
                        },
                        {
                                "command": "/plushieremove",
                                "description": "Remove the held Subby's Plushies item."
                        },
                        {
                                "command": "/plushierecover",
                                "description": "Run the plush recovery helper."
                        }
                ]
        },
        {
                "title": "Positioning",
                "commands": [
                        {
                                "command": "/plushieposition",
                                "description": "Open BC's native Move / Resize editor."
                        },
                        {
                                "command": "/plushiemove",
                                "description": "Alias for Move / Resize."
                        },
                        {
                                "command": "/plushieresize",
                                "description": "Alias for Move / Resize."
                        },
                        {
                                "command": "/plushiehands",
                                "description": "Reset the plush to its default hands position."
                        },
                        {
                                "command": "/plushiecenter",
                                "description": "Alias for resetting the plush position."
                        },
                        {
                                "command": "/plushiedrag [on|off]",
                                "description": "Toggle Easy Drag, or explicitly turn it on/off."
                        },
                        {
                                "command": "/plushiesnap <point>",
                                "description": "Snap to a named point such as head, face, chest, hands, left shoulder, or right shoulder."
                        }
                ]
        },
        {
                "title": "Features",
                "commands": [
                        {
                                "command": "/plushiemood",
                                "description": "Show the current plushie's mood and quick info."
                        },
                        {
                                "command": "/plushielore",
                                "description": "Open the Lore browser on the held plushie."
                        },
                        {
                                "command": "/plushieinfo",
                                "description": "Show the current plushie's mood and quick info."
                        },
                        {
                                "command": "/plushieprotect",
                                "description": "Toggle Protect Me mode."
                        },
                        {
                                "command": "/plushiejealous",
                                "description": "Toggle Jealous Plushie mode."
                        },
                        {
                                "command": "/plushieidle",
                                "description": "Toggle idle plush animations."
                        },
                        {
                                "command": "/plushiespeech",
                                "description": "Toggle local speech bubbles."
                        },
                        {
                                "command": "/plushiespeak",
                                "description": "Force one local plush speech bubble."
                        },
                        {
                                "command": "/plushiebubble",
                                "description": "Alias for /plushiespeak."
                        },
                        {
                                "command": "/plushiepurr",
                                "description": "Play the plush purr sound locally."
                        },
                        {
                                "command": "/plushiefeatures",
                                "description": "Show the current feature-toggle status."
                        }
                ]
        },
        {
                "title": "Room Mascot",
                "commands": [
                        {
                                "command": "/plushiemascot set",
                                "description": "Set your held plush as the room mascot (room admin only)."
                        },
                        {
                                "command": "/plushiemascot clear",
                                "description": "Clear the room mascot (room admin only)."
                        },
                        {
                                "command": "/plushiemascot show",
                                "description": "Show mascot information / restore the mascot picture."
                        },
                        {
                                "command": "/plushiemascot hide",
                                "description": "Hide the mascot picture locally."
                        },
                        {
                                "command": "/plushiemascotshow",
                                "description": "Shortcut to show the mascot picture."
                        },
                        {
                                "command": "/plushiemascothide",
                                "description": "Shortcut to hide the mascot picture."
                        }
                ]
        },
        {
                "title": "Battle, Stats & Achievements",
                "commands": [
                        {
                                "command": "/plushiebattle <member/name>",
                                "description": "Challenge another player to a plushie battle. With no argument, uses the focused character when possible."
                        },
                        {
                                "command": "/plushiestats",
                                "description": "Open the detailed Stats tab."
                        },
                        {
                                "command": "/plushieachievements",
                                "description": "Open the detailed Achievements tab."
                        },
                        {
                                "command": "/plushieach",
                                "description": "Short alias for /plushieachievements."
                        }
                ]
        },
        {
                "title": "Updates & Diagnostics",
                "commands": [
                        {
                                "command": "/plushieupdate",
                                "description": "Check the GitHub version manifest for an update."
                        },
                        {
                                "command": "/plushieupdateopen",
                                "description": "Open the latest update/download page."
                        },
                        {
                                "command": "/plushiedebug",
                                "description": "Print detailed plugin diagnostics to the browser console."
                        },
                        {
                                "command": "/plushiedata",
                                "description": "Show Git-backed data source/cache status."
                        },
                        {
                                "command": "/plushiedatareload",
                                "description": "Force-refresh validated data files from GitHub."
                        }
                ]
        }
];

    const SIZE_TOKENS = Object.freeze(["Normal", "Small", "Large", "XLarge"]);
    const ASSET_BASE = `Assets/${FAMILY}/${GROUP}/${ASSET_NAME}`;
    const EXTENDED_PREFIX = `Inventory${GROUP}${ASSET_NAME}`;

    const renderImages = new Array(PLUSHES.length);
    let hugTightlyIconImage = null;
    let imageMappings = null;
    let modularArchetype = null;
    let modApi = null;
    let hookBackend = "direct";
    let assetAddStrategy = null;
    let modularRegistrationStrategy = null;
    let ready = false;
    let failed = false;
    let startupError = null;
    let customMenuWrapped = false;
    let plushMenuPage = "characters";
    let plushMenuReturnPage = "characters";
    let plushMenuListPage = 0;
    let hugTightlyActivityID = null;
    let hugTightlyActivityRegistration = null;
    let hugTightlyActivityObject = null;
    let hugTightlyActivityMonitor = null;
    let hugTightlyActivityEnabled = false;
    let lastActivityMonitorHeldState = null;
    let lastActivityMonitorFullCheckAt = 0;
    const customActivityObjects = new Map();
    let customActivitiesRegistration = "inactive";
    let activityMenuOrderHookInstalled = false;
    let activityMenuOrderPassCount = 0;
    let lastActivityMenuOrder = null;
    let pendingLocalCustomActivity = null;
    let customActivityEventSequence = 0;
    const seenOfferPromptTokens = new Map();
    let offerPromptElement = null;
    let offerSignalsReceived = 0;
    let offerPromptsDisplayed = 0;
    let offerVisibleActionsSeen = 0;
    let offerVisiblePromptsTriggered = 0;
    let lastOfferSignalReceived = null;
    let lastOfferPromptDisplayed = null;
    let lastOfferActionSeen = null;

    let offerChatObserver = null;
    let offerChatObservedRoot = null;
    let offerChatObserverMonitor = null;
    let offerChatObserverAttachCount = 0;
    let offerChatRowsSeen = 0;
    let offerChatOfferCandidates = 0;
    let offerChatPromptsTriggered = 0;
    let lastOfferChatRow = null;
    const processedOfferChatRows = new WeakSet();
    const processedOfferDecisionRows = new WeakSet();
    const OFFER_DECISION_DEDUPE_MS = 8000;
    const recentOfferDecisionTokens = new Map();
    const processedBalanceHeadChatRows = new WeakSet();
    const processedHideBehindChatRows = new WeakSet();
    const processedProtectChatRows = new WeakSet();

    const OFFER_TRANSFER_PENDING_MS = 120000;
    const pendingOutgoingPlushOffers = new Map();
    let offerTransferReceiveAttempts = 0;
    let offerTransfersReceived = 0;
    let offerTransferReceiveFailures = 0;
    let offerTransferSenderRemovals = 0;
    let offerTransferSenderRemovalFailures = 0;
    let lastOfferTransferReceived = null;
    let lastOfferTransferFailure = null;
    let lastOfferSenderRemoval = null;
    let lastOfferDecisionSeen = null;
    let offerPendingCapturedFromRenderedAction = 0;
    let lastRenderedOutgoingOfferCapture = null;

    let balanceHeadGeneration = 0;
    let activeBalanceHeadSession = null;
    let lastBalanceHeadActivityRunAt = 0;
    let balanceHeadActivityTriggerCount = 0;
    let balanceHeadRenderedActionsSeen = 0;
    let balanceHeadRenderedTriggerCount = 0;
    let lastBalanceHeadRenderedAction = null;
    let lastBalanceHeadTriggerSource = null;
    let lastBalanceHeadEffect = null;
    let hideBehindGeneration = 0;
    let activeHideBehindSession = null;
    let hideBehindRenderedActionsSeen = 0;
    let hideBehindRenderedTriggerCount = 0;
    let lastHideBehindRenderedAction = null;
    let lastHideBehindTriggerSource = null;
    let lastHideBehindEffect = null;

    let featureSettingsState = null;
    let layoutSettingsState = null;
    let moodState = null;
    let moodHistoryState = null;
    let battleHistoryState = null;
    let relationshipState = null;
    let favoritesState = null;
    let savedPosesState = null;
    let lastMoodChange = null;
    let protectGeneration = 0;
    let activeProtectSession = null;
    let lastProtectReactionAt = 0;
    let lastProtectEffect = null;
    let lastJealousReactionAt = 0;
    let petAnimationGeneration = 0;
    let dragModeEnabled = false;
    let dragSession = null;
    let dragFrameRequest = null;
    let lastDragSnap = null;
    let dragHandlersInstalled = false;
    let dragToggleButton = null;
    let dragToggleUiTimer = null;
    let roomMascotState = null;
    let roomMascotCacheState = null;
    let lastRoomMascotSharedSyncAt = 0;
    let roomMascotOverlay = null;
    let roomMascotOverlayImage = null;
    let roomMascotOverlayLabel = null;
    let roomMascotUiSafetyTimer = null;
    let mascotUiHooksInstalled = false;
    let lastUpdateInfo = null;
    let updateCheckPromise = null;
    let statsState = null;
    let idleAnimationTimer = null;
    let idleAnimationGeneration = 0;
    let activeIdleAnimationSession = null;
    let speechBubbleElement = null;
    let speechBubbleTimer = null;
    let plushStatusIconElement = null;
    let plushStatusIconTimer = null;
    let localOverlayRepositionFrame = null;
    let localOverlayPositionSignature = null;
    let manualPlushEmote = null;
    let manualPlushEmoteTimer = null;
    const remotePlushEmotes = new Map();
    const lastCharacterChatRoomDraw = new Map();
    let backupImportInput = null;
    let lastPlayerChatRoomDraw = null;
    let plushSearchInput = null;
    let plushSearchQuery = "";
    let battlePromptElement = null;
    let battleTargetPromptElement = null;
    let lastBattleResult = null;
    const pluginApiListeners = new Map();
    let gitDataRefreshPromise = null;
    let gitDataState = {
        source: "built-in",
        loadedFiles: [],
        cachedAt: null,
        refreshedAt: null,
        indexPluginVersion: null,
        lastError: null,
    };

    let extensionsPanelElement = null;
    let extensionsPanelContent = null;
    let extensionsActiveTab = "status";
    let extensionsLoreSelectedName = null;
    let extensionsIntegrationTimer = null;
    let extensionsIntegrationInstalled = false;
    let extensionsNativeRegistered = false;
    let extensionsOpenedFromNativePreference = false;

    let nativeLayeringBridgeTimer = null;
    let nativeLayeringBridgeRoot = null;
    let nativeLayeringBridgeInputHandler = null;
    let nativeLayeringBridgeStartedAt = 0;
    let nativeLayeringLastSignature = null;
    let nativeLayeringSyncCount = 0;
    let nativeLayeringInputEvents = 0;
    let nativeLayeringFallbackWrites = 0;
    let nativeLayeringResizeWrapCount = 0;
    let lastNativeLayeringSync = null;
    let lastNativeLayeringInput = null;

    let purrAudioContext = null;
    let purrSfxWorkingUrl = null;
    let activePurrAudio = null;
    let purrPlayCount = 0;
    let lastPurrPlay = null;
    let lastPurrStartedAt = 0;
    let hugTightlyEventSequence = 0;
    let pendingLocalHugTightlyUntil = 0;
    const recentPurrTokens = new Map();

    let lastPlushOption = SUBBYCAT_WIRE_OPTION;
    let plushStateRepairCount = 0;
    let lastPlushStateRepair = null;
    let stabilizerGeneration = 0;

    const plushStateByCharacter = new Map();
    let actionRecoveryCount = 0;
    let lastActionRecovery = null;
    let actionRecoveryGeneration = 0;
    let localPlushRepairSuppressedUntil = 0;
    let lastLocalPlushRepairSuppression = null;

    let roomRosterSignature = null;
    let roomRosterWatchdog = null;
    let roomRosterEventHookCount = 0;
    let roomRosterEventCheckGeneration = 0;
    let roomRosterRecoveryCount = 0;
    let lastRoomRosterRecovery = null;

    const installedHooks = new Set();
    const CUSTOM_HOOK_MARK = Symbol("SubbysPlushiesHook");
    const NATIVE_LAYERING_RESIZE_MARK = Symbol("SubbysPlushiesLayeringResizeBridge");
    const unmappedImageSources = new Set();
    let imageElementSrcHookInstalled = false;
    let imageElementSetAttributeHookInstalled = false;
    let bcImagePathHookInstalled = null;
    let nativeCommandHookInstalled = false;
    let plushieCommandAutocompleteState = null;
    let plushieCommandAutocompleteCache = null;

    const log = (...args) => console.log(TAG, ...args);
    const warn = (...args) => console.warn(TAG, ...args);
    const error = (...args) => console.error(TAG, ...args);
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    function initHookBackend() {
        const sdk = window.bcModSdk || window.bcModSDK;
        if (!sdk || typeof sdk.registerMod !== "function") {
            hookBackend = "direct";
            return;
        }

        try {
            modApi = sdk.registerMod({
                name: MOD_NAME,
                fullName: DISPLAY_NAME,
                version: VERSION,
            });
            hookBackend = "ModSDK";
        } catch (e) {
            modApi = null;
            hookBackend = "direct";
            warn("ModSDK registration was unavailable; using local wrappers instead:", e);
        }
    }

    function installHook(functionName, priority, handler) {
        if (installedHooks.has(functionName)) return true;
        const original = window[functionName];
        if (typeof original !== "function") return false;

        if (modApi && typeof modApi.hookFunction === "function") {
            modApi.hookFunction(functionName, priority, (args, next) => handler(args, next));
            installedHooks.add(functionName);
            return true;
        }

        if (original[CUSTOM_HOOK_MARK]) {
            installedHooks.add(functionName);
            return true;
        }

        const wrapped = function (...args) {
            const next = nextArgs => original.apply(this, Array.isArray(nextArgs) ? nextArgs : args);
            return handler(args, next);
        };

        try {
            Object.defineProperty(wrapped, CUSTOM_HOOK_MARK, { value: true });
        } catch (_) {}

        window[functionName] = wrapped;
        installedHooks.add(functionName);
        return true;
    }

    function readLocalJSON(key, fallback) {
        try {
            const raw = window.localStorage?.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : fallback;
        } catch (_) {
            return fallback;
        }
    }

    function writeLocalJSON(key, value) {
        try {
            window.localStorage?.setItem(key, JSON.stringify(value));
            return true;
        } catch (_) {
            return false;
        }
    }

    function getFeatureSettings() {
        if (featureSettingsState) return featureSettingsState;
        const stored = readLocalJSON(FEATURE_SETTINGS_STORAGE_KEY, {});
        const storedBoolean = key => Object.prototype.hasOwnProperty.call(stored, key)
            ? !!stored[key]
            : !!FEATURE_DEFAULTS[key];
        featureSettingsState = {
            protectMe: storedBoolean("protectMe"),
            jealousPlushie: storedBoolean("jealousPlushie"),
            showRoomMascot: storedBoolean("showRoomMascot"),
            autoUpdateChecks: storedBoolean("autoUpdateChecks"),
            idleAnimations: storedBoolean("idleAnimations"),
            speechBubbles: storedBoolean("speechBubbles"),
            performanceMode: String(stored.performanceMode || "normal").toLowerCase() === "low" ? "low" : "normal",
        };
        return featureSettingsState;
    }

    function setFeatureSetting(key, enabled) {
        const settings = getFeatureSettings();
        if (!Object.prototype.hasOwnProperty.call(settings, key) || key === "performanceMode") return false;
        settings[key] = !!enabled;
        writeLocalJSON(FEATURE_SETTINGS_STORAGE_KEY, settings);
        if (key === "idleAnimations") {
            if (settings[key] && !isLowCpuMode()) scheduleNextIdleAnimation(1200);
            else cancelIdleAnimation(false);
        }
        if (key === "speechBubbles" && !settings[key]) removeSpeechBubble();
        return settings[key];
    }

    function isLowCpuMode() {
        return getFeatureSettings().performanceMode === "low";
    }

    function performanceInterval(normalMs, lowCpuMs) {
        return isLowCpuMode() ? lowCpuMs : normalMs;
    }

    function restartPerformanceSensitiveMonitors() {
        if (plushStatusIconTimer != null) {
            window.clearInterval(plushStatusIconTimer);
            plushStatusIconTimer = null;
            startPlushStatusIconMonitor();
        }
        if (dragToggleUiTimer != null) {
            window.clearInterval(dragToggleUiTimer);
            dragToggleUiTimer = window.setInterval(refreshDragToggleButton, performanceInterval(2500, 8000));
        }
        if (roomMascotUiSafetyTimer != null) {
            window.clearInterval(roomMascotUiSafetyTimer);
            roomMascotUiSafetyTimer = window.setInterval(() => {
                if (roomMascotState?.name || roomMascotOverlay?.isConnected) refreshRoomMascotOverlay();
            }, performanceInterval(2500, 8000));
        }
        if (offerChatObserverMonitor != null) {
            window.clearInterval(offerChatObserverMonitor);
            offerChatObserverMonitor = window.setInterval(
                () => ensureOfferChatObserver("chat observer monitor"),
                performanceInterval(CHAT_OBSERVER_MONITOR_INTERVAL_MS, CHAT_OBSERVER_MONITOR_INTERVAL_MS * 3)
            );
        }
        if (roomRosterWatchdog != null) {
            window.clearInterval(roomRosterWatchdog);
            roomRosterWatchdog = window.setInterval(
                () => checkRoomRosterChange(isLowCpuMode() ? "120-second watchdog" : "60-second watchdog"),
                performanceInterval(ROOM_ROSTER_WATCHDOG_INTERVAL_MS, ROOM_ROSTER_WATCHDOG_INTERVAL_MS * 3)
            );
        }
        return true;
    }

    function setPerformanceMode(mode) {
        const normalized = String(mode || "").trim().toLowerCase();
        const next = normalized === "low" || normalized === "low cpu" || normalized === "lowcpu" ? "low" : "normal";
        const settings = getFeatureSettings();
        settings.performanceMode = next;
        writeLocalJSON(FEATURE_SETTINGS_STORAGE_KEY, settings);
        cancelIdleAnimation(false);
        if (next === "normal" && settings.idleAnimations) scheduleNextIdleAnimation(1200);
        restartPerformanceSensitiveMonitors();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        emitPluginApiEvent("performance", { mode: next });
        return next;
    }

    function toggleFeatureSetting(key) {
        const settings = getFeatureSettings();
        return setFeatureSetting(key, !settings[key]);
    }

    function sanitizeInterfaceColor(value, fallback) {
        const normalized = String(value || "").trim();
        return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized.toUpperCase() : fallback;
    }

    function normalizeInterfacePalette(value) {
        const source = value && typeof value === "object" ? value : {};
        const palette = {};
        for (const key of INTERFACE_COLOR_KEYS) {
            palette[key] = sanitizeInterfaceColor(source[key], LOFI_MENU_STYLE[key]);
        }
        return palette;
    }

    function getLayoutSettings() {
        if (layoutSettingsState) return layoutSettingsState;
        const stored = readLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, {});
        layoutSettingsState = {
            useMenuDensity: stored.useMenuDensity === "compact" ? "compact" : LAYOUT_DEFAULTS.useMenuDensity,
            showHoverPreview: Object.prototype.hasOwnProperty.call(stored, "showHoverPreview") ? !!stored.showHoverPreview : LAYOUT_DEFAULTS.showHoverPreview,
            extensionsDensity: stored.extensionsDensity === "compact" ? "compact" : LAYOUT_DEFAULTS.extensionsDensity,
            loreListSide: stored.loreListSide === "right" ? "right" : LAYOUT_DEFAULTS.loreListSide,
            useMenuColors: normalizeInterfacePalette(stored.useMenuColors),
            extensionsColors: normalizeInterfacePalette(stored.extensionsColors),
        };
        return layoutSettingsState;
    }

    function getUseMenuStyle() {
        return getLayoutSettings().useMenuColors;
    }

    function getExtensionsStyle() {
        return getLayoutSettings().extensionsColors;
    }

    function setLayoutSetting(key, value) {
        const settings = getLayoutSettings();
        if (!Object.prototype.hasOwnProperty.call(settings, key)) return false;
        if (key === "useMenuDensity" || key === "extensionsDensity") value = value === "compact" ? "compact" : "cozy";
        else if (key === "loreListSide") value = value === "right" ? "right" : "left";
        else if (key === "useMenuColors" || key === "extensionsColors") value = normalizeInterfacePalette(value);
        else value = !!value;
        settings[key] = value;
        writeLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, settings);
        plushMenuListPage = 0;
        refreshPlushSearchInput();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return value;
    }

    function setInterfaceColor(scope, key, value) {
        if (!INTERFACE_COLOR_KEYS.includes(key)) return false;
        const settings = getLayoutSettings();
        const settingsKey = scope === "extensions" ? "extensionsColors" : "useMenuColors";
        const palette = normalizeInterfacePalette(settings[settingsKey]);
        palette[key] = sanitizeInterfaceColor(value, LOFI_MENU_STYLE[key]);
        settings[settingsKey] = palette;
        writeLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, settings);
        if (scope === "use") refreshPlushSearchInput();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return palette[key];
    }

    function applyInterfacePalette(scope, palette) {
        const settings = getLayoutSettings();
        const settingsKey = scope === "extensions" ? "extensionsColors" : "useMenuColors";
        settings[settingsKey] = normalizeInterfacePalette(palette);
        writeLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, settings);
        if (scope === "use") refreshPlushSearchInput();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return { ...settings[settingsKey] };
    }

    function resetInterfacePalette(scope) {
        return applyInterfacePalette(scope, LOFI_MENU_STYLE);
    }

    function copyInterfacePalette(fromScope, toScope) {
        const source = fromScope === "extensions" ? getExtensionsStyle() : getUseMenuStyle();
        return applyInterfacePalette(toScope, source);
    }

    function applySharedInterfaceTheme(palette) {
        const settings = getLayoutSettings();
        const normalized = normalizeInterfacePalette(palette);
        settings.useMenuColors = { ...normalized };
        settings.extensionsColors = { ...normalized };
        writeLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, settings);
        refreshPlushSearchInput();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return { ...normalized };
    }

    function resetLayoutSettings() {
        layoutSettingsState = {
            ...LAYOUT_DEFAULTS,
            useMenuColors: normalizeInterfacePalette(LOFI_MENU_STYLE),
            extensionsColors: normalizeInterfacePalette(LOFI_MENU_STYLE),
        };
        writeLocalJSON(LAYOUT_SETTINGS_STORAGE_KEY, layoutSettingsState);
        plushMenuListPage = 0;
        refreshPlushSearchInput();
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return {
            ...layoutSettingsState,
            useMenuColors: { ...layoutSettingsState.useMenuColors },
            extensionsColors: { ...layoutSettingsState.extensionsColors },
        };
    }

    function useMenuLayoutMetrics() {
        const compact = getLayoutSettings().useMenuDensity === "compact";
        return compact
            ? { startY: 162, rowGap: 70, buttonH: 52, subStartY: 176, subRowGap: 90, searchTop: 105, searchHeight: 26, searchWidth: 340 }
            : { startY: 164, rowGap: 82, buttonH: 62, subStartY: 182, subRowGap: 106, searchTop: 104, searchHeight: 28, searchWidth: 350 };
    }

    function extensionsLayoutMetrics() {
        const compact = getLayoutSettings().extensionsDensity === "compact";
        return compact
            ? { buttonMinHeight: 32, buttonPadding: "4px 9px", sectionPadding: 10, sectionGap: 9, headingSize: 17, fontSize: 14, rowPadding: "5px 2px" }
            : { buttonMinHeight: 38, buttonPadding: "6px 11px", sectionPadding: 13, sectionGap: 12, headingSize: 19, fontSize: 15, rowPadding: "7px 2px" };
    }

    function currentWirePlushOption() {
        const option = canonicalWirePlushOption(getItemPlushOption(getHeld(window.Player)));
        return validPlushOption(option) ? option : SUBBYCAT_WIRE_OPTION;
    }

    function currentPlushName() {
        return PLUSH_NAMES[currentWirePlushOption()] || "Subbycat";
    }

    function publicPlushName(option) {
        const numeric = Number(option);
        if (!validPublicPlushOption(numeric)) return null;
        const wire = publicToWirePlushOption(numeric);
        return PLUSH_NAMES[wire] || null;
    }

    function publicOptionForPlushName(name) {
        const wanted = normalizeLoreLookupKey(name);
        if (!wanted) return -1;
        for (let option = 0; option < PUBLIC_PLUSH_COUNT; option++) {
            if (normalizeLoreLookupKey(publicPlushName(option)) === wanted) return option;
        }
        return -1;
    }

    function clonePluginApiPayload(value) {
        try {
            if (typeof structuredClone === "function") return structuredClone(value);
        } catch (_) {}
        try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
    }

    function emitPluginApiEvent(eventName, payload = {}) {
        const key = String(eventName || "").trim().toLowerCase();
        if (!key) return false;
        const listeners = pluginApiListeners.get(key);
        if (!listeners?.size) return false;
        const eventPayload = Object.freeze({
            event: key,
            at: new Date().toISOString(),
            ...clonePluginApiPayload(payload),
        });
        for (const listener of [...listeners]) {
            try { listener(eventPayload); } catch (e) { warn(`Plugin API listener failed for ${key}:`, e); }
        }
        return true;
    }

    function onPluginApiEvent(eventName, listener) {
        const key = String(eventName || "").trim().toLowerCase();
        if (!key || typeof listener !== "function") return () => false;
        let listeners = pluginApiListeners.get(key);
        if (!listeners) { listeners = new Set(); pluginApiListeners.set(key, listeners); }
        listeners.add(listener);
        return () => offPluginApiEvent(key, listener);
    }

    function offPluginApiEvent(eventName, listener) {
        const key = String(eventName || "").trim().toLowerCase();
        const listeners = pluginApiListeners.get(key);
        if (!listeners) return false;
        const removed = listeners.delete(listener);
        if (!listeners.size) pluginApiListeners.delete(key);
        return removed;
    }

    function oncePluginApiEvent(eventName, listener) {
        if (typeof listener !== "function") return () => false;
        let unsubscribe = null;
        const wrapped = payload => {
            try { listener(payload); } finally { unsubscribe?.(); }
        };
        unsubscribe = onPluginApiEvent(eventName, wrapped);
        return unsubscribe;
    }

    function getMoodHistoryStore() {
        if (moodHistoryState) return moodHistoryState;
        const stored = readLocalJSON(MOOD_HISTORY_STORAGE_KEY, {});
        moodHistoryState = stored && typeof stored === "object" ? stored : {};
        return moodHistoryState;
    }

    function moodReasonLabel(reason) {
        const key = String(reason || "interaction").trim();
        const map = {
            rubFace: "Rub Against Face", cuddleChest: "Cuddle", nuzzle: "Nuzzle", pat: "Pat", pet: "Pet",
            hideBehind: "Hide Behind", kissPlushie: "Kiss", kissWith: "Kiss With Plushie", bonk: "Bonk",
            balanceHead: "Balance on Head", show: "Show Plushie", whisper: "Whisper", squeezeCheeks: "Squeeze Cheeks",
            wave: "Wave", hugTightly: "Hug Tightly", "hug tightly": "Hug Tightly", "room mascot": "Room Mascot",
            "idle decay": "Idle decay",
        };
        if (map[key]) return map[key];
        if (key.startsWith("jealous:")) return "Jealous";
        if (key.startsWith("protect me:")) return "Protect Me";
        return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, char => char.toUpperCase());
    }

    function recordMoodHistory(name, delta, reason, score, at = Date.now()) {
        const plushName = String(name || currentPlushName() || "Subbycat");
        const numericDelta = Math.round(Number(delta) || 0);
        if (!numericDelta) return null;
        const store = getMoodHistoryStore();
        const list = Array.isArray(store[plushName]) ? store[plushName] : [];
        const entry = {
            at: Number(at) || Date.now(),
            delta: numericDelta,
            reason: moodReasonLabel(reason),
            score: clampMood(score),
        };
        list.push(entry);
        store[plushName] = list.slice(-40);
        writeLocalJSON(MOOD_HISTORY_STORAGE_KEY, store);
        return { ...entry };
    }

    function moodHistoryFor(name = currentPlushName(), limit = 40) {
        const plushName = String(name || currentPlushName());
        const list = getMoodHistoryStore()[plushName];
        return Array.isArray(list) ? list.slice(-Math.max(1, Math.min(40, Number(limit) || 40))).map(entry => ({ ...entry })) : [];
    }

    function getBattleHistoryStore() {
        if (battleHistoryState) return battleHistoryState;
        const stored = readLocalJSON(BATTLE_HISTORY_STORAGE_KEY, { entries: [] });
        const entries = Array.isArray(stored?.entries) ? stored.entries.slice(-20) : [];
        battleHistoryState = { entries };
        return battleHistoryState;
    }

    function battleHistory(limit = 20) {
        return getBattleHistoryStore().entries.slice(-Math.max(1, Math.min(20, Number(limit) || 20))).map(entry => ({ ...entry }));
    }

    function recordBattleHistory(entry) {
        const store = getBattleHistoryStore();
        const normalized = {
            at: Number(entry?.at) || Date.now(),
            opponent: String(entry?.opponent || "Unknown"),
            opponentMember: Number(entry?.opponentMember) || 0,
            plush: String(entry?.plush || currentPlushName()),
            opponentPlush: String(entry?.opponentPlush || "Unknown"),
            score: Math.max(0, Number(entry?.score) || 0),
            opponentScore: Math.max(0, Number(entry?.opponentScore) || 0),
            result: ["win", "loss", "draw"].includes(entry?.result) ? entry.result : "draw",
        };
        store.entries.push(normalized);
        store.entries = store.entries.slice(-20);
        writeLocalJSON(BATTLE_HISTORY_STORAGE_KEY, store);
        return { ...normalized };
    }

    function getRelationshipStore() {
        if (relationshipState) return relationshipState;
        const stored = readLocalJSON(RELATIONSHIP_STORAGE_KEY, {});
        relationshipState = stored && typeof stored === "object" ? stored : {};
        return relationshipState;
    }

    function relationshipLevelForInteractions(interactions) {
        const count = Math.max(0, Math.floor(Number(interactions) || 0));
        let level = RELATIONSHIP_LEVELS[0] || { name: "Stranger", minInteractions: 0 };
        for (const candidate of RELATIONSHIP_LEVELS) {
            if (count >= candidate.minInteractions) level = candidate;
            else break;
        }
        return level;
    }

    function getPlushRelationshipRecord(name = currentPlushName()) {
        const plushName = String(name || currentPlushName() || "Subbycat");
        const store = getRelationshipStore();
        let record = store[plushName];
        const now = Date.now();
        if (!record || typeof record !== "object") {
            record = { interactions: 0, lastInteractionAt: now, updatedAt: now };
            store[plushName] = record;
            writeLocalJSON(RELATIONSHIP_STORAGE_KEY, store);
            return record;
        }
        record.interactions = Math.max(0, Math.floor(Number(record.interactions) || 0));
        record.lastInteractionAt = Number(record.lastInteractionAt) || now;
        record.updatedAt = Number(record.updatedAt) || record.lastInteractionAt;
        return record;
    }

    function relationshipStatus(name = currentPlushName()) {
        const record = getPlushRelationshipRecord(name);
        const level = relationshipLevelForInteractions(record.interactions);
        const currentIndex = Math.max(0, RELATIONSHIP_LEVELS.findIndex(entry => entry.name === level.name));
        const next = RELATIONSHIP_LEVELS[currentIndex + 1] || null;
        return {
            name: String(name || currentPlushName()),
            interactions: record.interactions,
            level: level.name,
            nextLevel: next?.name || null,
            nextAt: next?.minInteractions ?? null,
            remaining: next ? Math.max(0, next.minInteractions - record.interactions) : 0,
            lastInteractionAt: record.lastInteractionAt,
        };
    }

    function maxRelationshipInteractions() {
        let best = 0;
        for (const record of Object.values(getRelationshipStore())) {
            best = Math.max(best, Math.max(0, Number(record?.interactions) || 0));
        }
        return best;
    }

    function showRelationshipMilestone(plushName, levelName) {
        if (!levelName || levelName === "Stranger") return false;
        const symbols = { Familiar: "♡", Friend: "♥", Bestie: "♥♥", Bonded: "✦♥✦" };
        const symbol = symbols[levelName] || "♥";
        showSpeechBubble(`${symbol} ${levelName}! ${symbol}`, { force: true, durationMs: 5200 });
        return true;
    }

    function touchPlushRelationship(name = currentPlushName(), { increment = 0, wake = true } = {}) {
        const plushName = String(name || currentPlushName() || "Subbycat");
        const store = getRelationshipStore();
        const record = getPlushRelationshipRecord(plushName);
        const before = relationshipLevelForInteractions(record.interactions).name;
        const amount = Math.max(0, Math.floor(Number(increment) || 0));
        if (amount) record.interactions += amount;
        if (wake) record.lastInteractionAt = Date.now();
        record.updatedAt = Date.now();
        store[plushName] = record;
        writeLocalJSON(RELATIONSHIP_STORAGE_KEY, store);
        const status = relationshipStatus(plushName);
        const milestone = amount > 0 && status.level !== before ? status.level : null;
        if (amount) checkAchievements(true);
        if (milestone) showRelationshipMilestone(plushName, milestone);
        refreshPlushStatusIcon();
        if (amount) emitPluginApiEvent("relationship", { plushName, ...status, milestone });
        return { ...status, milestone };
    }

    function isPlushSleepy(name = currentPlushName()) {
        const record = getPlushRelationshipRecord(name);
        return Date.now() - (Number(record.lastInteractionAt) || Date.now()) >= SLEEPY_AFTER_MS;
    }

    function getFavoritesStore() {
        if (favoritesState) return favoritesState;
        const stored = readLocalJSON(FAVORITES_STORAGE_KEY, {});
        const raw = Array.isArray(stored?.names) ? stored.names : [];
        const names = [];
        for (const value of raw) {
            const option = publicOptionForPlushName(value);
            const canonical = option >= 0 ? publicPlushName(option) : null;
            if (canonical && !names.some(entry => normalizeLoreLookupKey(entry) === normalizeLoreLookupKey(canonical))) names.push(canonical);
        }
        favoritesState = { names };
        return favoritesState;
    }

    function favoritePlushNames() {
        return [...getFavoritesStore().names];
    }

    function isFavoritePlush(name) {
        const wanted = normalizeLoreLookupKey(name);
        return !!wanted && getFavoritesStore().names.some(entry => normalizeLoreLookupKey(entry) === wanted);
    }

    function toggleFavoritePlush(name) {
        const option = publicOptionForPlushName(name);
        if (option < 0) return false;
        const canonical = publicPlushName(option);
        const store = getFavoritesStore();
        const wanted = normalizeLoreLookupKey(canonical);
        const index = store.names.findIndex(entry => normalizeLoreLookupKey(entry) === wanted);
        let enabled = false;
        if (index >= 0) store.names.splice(index, 1);
        else { store.names.push(canonical); enabled = true; }
        writeLocalJSON(FAVORITES_STORAGE_KEY, store);
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        emitPluginApiEvent("favorite", { plushName: canonical, favorite: enabled });
        return enabled;
    }

    function favoriteMenuEntries() {
        return favoritePlushNames()
            .map(name => ({ label: name, option: publicOptionForPlushName(name) }))
            .filter(entry => entry.option >= 0);
    }

    function sanitizeSavedPoseTransform(value) {
        const source = value && typeof value === "object" ? value : {};
        const finite = (key, fallback, min, max) => {
            const number = Number(source[key]);
            return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
        };
        return {
            TranslationX: finite("TranslationX", 0, -2000, 2000),
            TranslationY: finite("TranslationY", 0, -2000, 2000),
            ScaleX: finite("ScaleX", 1, 0.05, 8),
            ScaleY: finite("ScaleY", 1, 0.05, 8),
            Rotation: finite("Rotation", 0, -1080, 1080),
        };
    }

    function getSavedPosesStore() {
        if (savedPosesState) return savedPosesState;
        const stored = readLocalJSON(SAVED_POSES_STORAGE_KEY, {});
        savedPosesState = stored && typeof stored === "object" ? stored : {};
        return savedPosesState;
    }

    function getSavedPose(slot, name = currentPlushName()) {
        const numericSlot = Number(slot);
        if (!SAVED_POSE_SLOTS.includes(numericSlot)) return null;
        const raw = getSavedPosesStore()?.[name]?.[String(numericSlot)];
        return raw && typeof raw === "object" ? sanitizeSavedPoseTransform(raw) : null;
    }

    function saveCurrentPose(slot) {
        const numericSlot = Number(slot);
        if (!SAVED_POSE_SLOTS.includes(numericSlot)) return null;
        const item = getHeld(window.Player);
        if (!isOurs(item)) return null;
        const transform = readActivePlushLayerTransform(item);
        if (!transform) return null;
        const name = currentPlushName();
        const store = getSavedPosesStore();
        if (!store[name] || typeof store[name] !== "object") store[name] = {};
        const pose = sanitizeSavedPoseTransform(transform);
        store[name][String(numericSlot)] = pose;
        writeLocalJSON(SAVED_POSES_STORAGE_KEY, store);
        emitPluginApiEvent("pose", { action: "save", plushName: name, slot: numericSlot, pose });
        return { ...pose };
    }

    function applySavedPose(slot) {
        const numericSlot = Number(slot);
        const pose = getSavedPose(numericSlot);
        const item = getHeld(window.Player);
        const layerName = getActivePlushLayerName(item);
        if (!pose || !isOurs(item) || !layerName) return false;
        if (activeBalanceHeadSession) restoreActiveBalanceHead("saved pose");
        if (activeHideBehindSession) restoreActiveHideBehind("saved pose");
        if (activeProtectSession) restoreActiveProtect("saved pose");
        setPlushLayerTransform(item, layerName, pose);
        compactPlushLayerTransformsToActive(item, pose);
        resetGenericNativeTransform(item);
        rememberCharacterPlushState(window.Player, item);
        rebuildCharacterCanvas(window.Player, `saved pose ${numericSlot}`);
        try { if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(window.Player); } catch (_) {}
        positionSpeechBubble();
        positionPlushStatusIcon();
        emitPluginApiEvent("pose", { action: "apply", plushName: currentPlushName(), slot: numericSlot, pose });
        return true;
    }

    function clearSavedPose(slot, name = currentPlushName()) {
        const numericSlot = Number(slot);
        if (!SAVED_POSE_SLOTS.includes(numericSlot)) return false;
        const store = getSavedPosesStore();
        if (!store?.[name] || !Object.prototype.hasOwnProperty.call(store[name], String(numericSlot))) return false;
        delete store[name][String(numericSlot)];
        if (!Object.keys(store[name]).length) delete store[name];
        writeLocalJSON(SAVED_POSES_STORAGE_KEY, store);
        emitPluginApiEvent("pose", { action: "clear", plushName: name, slot: numericSlot });
        return true;
    }

    function cloneBackupValue(value) {
        try { return JSON.parse(JSON.stringify(value ?? {})); } catch (_) { return {}; }
    }

    function stableBackupStringify(value) {
        if (Array.isArray(value)) return `[${value.map(stableBackupStringify).join(",")}]`;
        if (value && typeof value === "object") {
            return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableBackupStringify(value[key])}`).join(",")}}`;
        }
        return JSON.stringify(value);
    }

    async function sealBackupProgress(progress) {
        const payload = `${BACKUP_PROGRESS_SEAL_VERSION}|${BACKUP_PROGRESS_SEAL_KEY}|${stableBackupStringify(progress)}`;
        if (!window.crypto?.subtle || typeof TextEncoder !== "function") {
            let hash = 2166136261;
            for (let i = 0; i < payload.length; i++) {
                hash ^= payload.charCodeAt(i);
                hash = Math.imul(hash, 16777619);
            }
            return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
        }
        const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
        return `sha256:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}`;
    }

    async function createBackupPayload() {
        const stats = cloneBackupValue(getStatsStore());
        const layout = cloneBackupValue(getLayoutSettings());
        const progress = {
            stats,
            achievements: cloneBackupValue(stats.achievements || {}),
            relationships: cloneBackupValue(getRelationshipStore()),
        };
        const progressSeal = await sealBackupProgress(progress);
        return {
            schemaVersion: BACKUP_SCHEMA_VERSION,
            plugin: MOD_NAME,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            data: {
                progress,
                progressSeal,
                moods: cloneBackupValue(getMoodStore()),
                moodHistory: cloneBackupValue(getMoodHistoryStore()),
                battleHistory: cloneBackupValue(getBattleHistoryStore()),
                favorites: cloneBackupValue(getFavoritesStore()),
                layouts: layout,
                themes: {
                    useMenuColors: cloneBackupValue(layout.useMenuColors || {}),
                    extensionsColors: cloneBackupValue(layout.extensionsColors || {}),
                },
                featureSettings: cloneBackupValue(getFeatureSettings()),
                nicknames: cloneBackupValue(readLocalJSON(NICKNAME_STORAGE_KEY, {})),
                savedPoses: cloneBackupValue(getSavedPosesStore()),
            },
        };
    }

    async function exportPlushBackup() {
        const payload = await createBackupPayload();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `SubbysPlushies-backup-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return payload;
    }

    async function restorePlushBackup(payload) {
        if (!payload || typeof payload !== "object" || Number(payload.schemaVersion) !== BACKUP_SCHEMA_VERSION || !payload.data || typeof payload.data !== "object") {
            throw new Error("Unsupported Subby's Plushies backup file.");
        }
        const data = payload.data;
        const safeObject = value => value && typeof value === "object" && !Array.isArray(value) ? cloneBackupValue(value) : null;
        const layout = safeObject(data.layouts) || {};
        if (safeObject(data.themes?.useMenuColors)) layout.useMenuColors = normalizeInterfacePalette(data.themes.useMenuColors);
        if (safeObject(data.themes?.extensionsColors)) layout.extensionsColors = normalizeInterfacePalette(data.themes.extensionsColors);

        const progress = safeObject(data.progress);
        const suppliedSeal = typeof data.progressSeal === "string" ? data.progressSeal : "";
        const expectedSeal = progress ? await sealBackupProgress(progress) : "";
        const progressVerified = !!progress && !!suppliedSeal && suppliedSeal === expectedSeal;

        const writes = [
            [MOOD_STORAGE_KEY, safeObject(data.moods)],
            [MOOD_HISTORY_STORAGE_KEY, safeObject(data.moodHistory)],
            [BATTLE_HISTORY_STORAGE_KEY, safeObject(data.battleHistory)],
            [FAVORITES_STORAGE_KEY, safeObject(data.favorites)],
            [LAYOUT_SETTINGS_STORAGE_KEY, layout],
            [FEATURE_SETTINGS_STORAGE_KEY, safeObject(data.featureSettings)],
            [NICKNAME_STORAGE_KEY, safeObject(data.nicknames)],
            [SAVED_POSES_STORAGE_KEY, safeObject(data.savedPoses)],
        ];
        if (progressVerified) {
            const stats = safeObject(progress.stats) || {};
            if (safeObject(progress.achievements)) stats.achievements = cloneBackupValue(progress.achievements);
            writes.unshift(
                [STATS_STORAGE_KEY, stats],
                [RELATIONSHIP_STORAGE_KEY, safeObject(progress.relationships)]
            );
        }

        for (const [key, value] of writes) {
            if (value) writeLocalJSON(key, value);
        }

        featureSettingsState = null;
        layoutSettingsState = null;
        moodState = null;
        moodHistoryState = null;
        battleHistoryState = null;
        relationshipState = null;
        favoritesState = null;
        savedPosesState = null;
        statsState = null;
        refreshPlushSearchInput();
        refreshPlushStatusIcon();
        restartPerformanceSensitiveMonitors();
        scheduleNextIdleAnimation(1000);
        checkAchievements(false);
        if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
        return { payload: await createBackupPayload(), progressVerified };
    }

    function importPlushBackupFromFile() {
        if (!backupImportInput?.isConnected) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json,.json";
            input.style.display = "none";
            input.addEventListener("change", async () => {
                const file = input.files?.[0];
                input.value = "";
                if (!file) return;
                try {
                    const payload = JSON.parse(await file.text());
                    if (typeof window.confirm === "function" && !window.confirm("Restore this Subby's Plushies backup? Current local plush settings will be replaced. Progress is restored only when its integrity seal is valid.")) return;
                    const result = await restorePlushBackup(payload);
                    appendLocalInfoBox("Backup restored", [
                        "Preferences, moods/history, battle history, favorites, layouts/themes, nicknames, and saved poses were restored.",
                        result.progressVerified
                            ? "Progress seal verified: stats, achievements, and relationships were restored."
                            : "Progress seal did not verify: stats, achievements, and relationships were left unchanged.",
                    ]);
                } catch (e) {
                    appendLocalInfoBox("Backup restore failed", [String(e?.message || e)]);
                }
            });
            document.body.appendChild(input);
            backupImportInput = input;
        }
        backupImportInput.click();
        return true;
    }

    function getMoodStore() {
        if (moodState) return moodState;
        const stored = readLocalJSON(MOOD_STORAGE_KEY, {});
        moodState = stored && typeof stored === "object" ? stored : {};
        return moodState;
    }

    function clampMood(value) {
        return Math.max(MOOD_MIN_SCORE, Math.min(MOOD_MAX_SCORE, Math.round(Number(value) || 0)));
    }

    function moodLabel(score) {
        const numeric = clampMood(score);
        for (const entry of MOOD_LABELS) {
            if (numeric <= entry.maxScore) return entry.label;
        }
        return MOOD_LABELS.at?.(-1)?.label || "Adoring";
    }

    function getPlushMoodRecord(name = currentPlushName()) {
        const store = getMoodStore();
        const now = Date.now();
        let record = store[name];
        if (!record || typeof record !== "object") {
            record = { score: MOOD_DEFAULT_SCORE, interactions: 0, updatedAt: now };
            store[name] = record;
            writeLocalJSON(MOOD_STORAGE_KEY, store);
            return record;
        }

        record.score = clampMood(Number.isFinite(Number(record.score)) ? Number(record.score) : MOOD_DEFAULT_SCORE);
        record.interactions = Math.max(0, Math.floor(Number(record.interactions) || 0));
        const last = Number(record.updatedAt) || now;

        const passiveFloor = 29;
        const passiveEveryMs = 15 * 60 * 1000;
        const steps = Math.floor(Math.max(0, now - last) / passiveEveryMs);
        if (steps > 0) {
            const beforeScore = record.score;
            if (record.score > passiveFloor) {
                record.score = clampMood(Math.max(passiveFloor, record.score - steps));
            }
            record.updatedAt = now;
            writeLocalJSON(MOOD_STORAGE_KEY, store);
            const appliedDelta = record.score - beforeScore;
            if (appliedDelta) {
                const historyEntry = recordMoodHistory(name, appliedDelta, "idle decay", record.score, now);
                lastMoodChange = { name, delta: appliedDelta, reason: "idle decay", score: record.score, at: new Date(now).toISOString() };
                emitPluginApiEvent("mood", { plushName: name, delta: appliedDelta, reason: "Idle decay", score: record.score, historyEntry });
            }
        }
        return record;
    }

    function adjustCurrentPlushMood(delta, reason = "interaction") {
        if (!Number.isFinite(delta) || delta === 0) return getPlushMoodRecord();
        const name = currentPlushName();
        const store = getMoodStore();
        const record = getPlushMoodRecord(name);
        record.score = clampMood(record.score + delta);
        record.interactions = Math.max(0, Math.floor(Number(record.interactions) || 0)) + 1;
        record.updatedAt = Date.now();
        store[name] = record;
        writeLocalJSON(MOOD_STORAGE_KEY, store);
        const historyEntry = recordMoodHistory(name, delta, reason, record.score);
        lastMoodChange = { name, delta, reason, score: record.score, at: new Date().toISOString() };
        refreshPlushStatusIcon();
        emitPluginApiEvent("mood", { plushName: name, delta, reason: moodReasonLabel(reason), score: record.score, historyEntry });
        return record;
    }

    function appendLocalInfoBox(title, lines, options = null) {
        const normalizedLines = Array.isArray(lines) ? lines.map(v => String(v)) : [String(lines ?? "")];
        log(title, ...normalizedLines);

        if (typeof window.ChatRoomAppendChat !== "function") return false;
        try {
            const row = document.createElement("div");
            row.className = "ChatMessage SubbysPlushiesLocalInfo";
            Object.assign(row.style, {
                boxSizing: "border-box",
                width: "calc(100% - 8px)",
                margin: options?.compact ? "2px 4px" : "6px 4px",
                padding: options?.compact ? "4px 6px" : "8px 10px",
                border: "1px solid currentColor",
                borderRadius: options?.compact ? "5px" : "8px",
                lineHeight: options?.compact ? "1.08" : "1.35",
                ...(options?.compact ? { fontSize: "10px" } : {}),
            });
            const heading = document.createElement("strong");
            heading.textContent = title;
            row.appendChild(heading);
            for (const line of normalizedLines) {
                const div = document.createElement("div");
                div.textContent = line;
                row.appendChild(div);
            }
            window.ChatRoomAppendChat(row);
            row.removeAttribute("data-time");
            row.removeAttribute("data-sender");
            return true;
        } catch (_) {
            return false;
        }
    }

    function getStatsStore() {
        if (statsState) return statsState;
        const stored = readLocalJSON(STATS_STORAGE_KEY, {});
        statsState = {
            totalInteractions: Math.max(0, Number(stored.totalInteractions) || 0),
            actions: stored.actions && typeof stored.actions === "object" ? stored.actions : {},
            plushesUsed: stored.plushesUsed && typeof stored.plushesUsed === "object" ? stored.plushesUsed : {},
            speechBubbles: Math.max(0, Number(stored.speechBubbles) || 0),
            idleAnimations: Math.max(0, Number(stored.idleAnimations) || 0),
            mascotSets: Math.max(0, Number(stored.mascotSets) || 0),
            drags: Math.max(0, Number(stored.drags) || 0),
            offers: Math.max(0, Number(stored.offers) || 0),
            battles: {
                played: Math.max(0, Number(stored.battles?.played) || 0),
                wins: Math.max(0, Number(stored.battles?.wins) || 0),
                losses: Math.max(0, Number(stored.battles?.losses) || 0),
                draws: Math.max(0, Number(stored.battles?.draws) || 0),
            },
            achievements: stored.achievements && typeof stored.achievements === "object" ? stored.achievements : {},
        };
        return statsState;
    }

    function statAffectionCount(stats = getStatsStore()) {
        return AFFECTION_ACTION_KEYS.reduce((sum, key) => sum + (Number(stats.actions?.[key]) || 0), 0);
    }

    function checkAchievements(showNew = true) {
        const stats = getStatsStore();
        const unlocked = [];
        for (const achievement of ACHIEVEMENTS) {
            if (stats.achievements[achievement.id]) continue;
            let passed = false;
            try { passed = !!achievement.test(stats); } catch (_) {}
            if (!passed) continue;
            stats.achievements[achievement.id] = Date.now();
            unlocked.push(achievement);
        }
        if (unlocked.length) {
            writeLocalJSON(STATS_STORAGE_KEY, stats);
            if (showNew) {
                for (const achievement of unlocked) {
                    appendLocalInfoBox(`Achievement unlocked: ${achievement.name}`, [achievement.description]);
                }
            }
        }
        return unlocked;
    }

    function recordStat(kind, amount = 1, detail = null) {
        const stats = getStatsStore();
        const value = Math.max(0, Number(amount) || 0);
        if (!value) return stats;
        if (kind === "interaction") {
            stats.totalInteractions += value;
            const key = String(detail?.action || "other");
            stats.actions[key] = (Number(stats.actions[key]) || 0) + value;
        } else if (kind === "speech") stats.speechBubbles += value;
        else if (kind === "idle") stats.idleAnimations += value;
        else if (kind === "mascot") stats.mascotSets += value;
        else if (kind === "drag") stats.drags += value;
        else if (kind === "offer") stats.offers += value;
        else if (kind === "battlePlayed") stats.battles.played += value;
        else if (kind === "battleWin") stats.battles.wins += value;
        else if (kind === "battleLoss") stats.battles.losses += value;
        else if (kind === "battleDraw") stats.battles.draws += value;
        const plushName = detail?.plushName || currentPlushName();
        if (plushName) stats.plushesUsed[plushName] = (Number(stats.plushesUsed[plushName]) || 0) + (kind === "select" ? value : 0);
        writeLocalJSON(STATS_STORAGE_KEY, stats);
        checkAchievements(true);
        return stats;
    }

    function recordPlushSelection(name = currentPlushName()) {
        const stats = getStatsStore();
        stats.plushesUsed[name] = (Number(stats.plushesUsed[name]) || 0) + 1;
        writeLocalJSON(STATS_STORAGE_KEY, stats);
        checkAchievements(true);
    }

    function showStats() {
        const s = getStatsStore();
        appendLocalInfoBox("Plushie stats", [
            `Interactions: ${s.totalInteractions} • affectionate: ${statAffectionCount(s)}`,
            `Battles: ${s.battles.played} • wins ${s.battles.wins} • losses ${s.battles.losses} • draws ${s.battles.draws}`,
            `Speech bubbles: ${s.speechBubbles} • idle wiggles: ${s.idleAnimations} • drags: ${s.drags}`,
            `Offers: ${s.offers} • room mascots set: ${s.mascotSets}`,
            `Different plushies used: ${Object.keys(s.plushesUsed).length}`,
        ]);
        return { ...s };
    }

    function showAchievements() {
        const stats = getStatsStore();
        checkAchievements(false);
        const lines = ACHIEVEMENTS.map(a => `${stats.achievements[a.id] ? "✓" : "○"} ${a.name} — ${a.description}`);
        appendLocalInfoBox(`Achievements (${Object.keys(stats.achievements).length}/${ACHIEVEMENTS.length})`, lines);
        return ACHIEVEMENTS.map(a => ({ ...a, unlocked: !!stats.achievements[a.id] }));
    }

    function randomPlushSpeech() {
        const score = getPlushMoodRecord().score;
        const bucket = score <= 38 ? PLUSH_SPEECH.grumpy : score <= 65 ? PLUSH_SPEECH.calm : score <= 92 ? PLUSH_SPEECH.happy : PLUSH_SPEECH.adoring;
        const moodLines = Array.isArray(bucket) && bucket.length ? bucket : ["Hi!"];
        const relationship = relationshipStatus();
        const relationshipLines = RELATIONSHIP_SPEECH?.[relationship.level];
        if (Array.isArray(relationshipLines) && relationshipLines.length && Math.random() < 0.28) {
            return relationshipLines[Math.floor(Math.random() * relationshipLines.length)] || moodLines[0] || "Hi!";
        }
        return moodLines[Math.floor(Math.random() * moodLines.length)] || "Hi!";
    }

    function removeSpeechBubble() {
        if (speechBubbleTimer != null) window.clearTimeout(speechBubbleTimer);
        speechBubbleTimer = null;
        try { speechBubbleElement?.remove?.(); } catch (_) {}
        speechBubbleElement = null;
        localOverlayPositionSignature = null;
    }

    function characterChatRoomDraw(C) {
        if (!C) return null;
        const playerMember = Number(window.Player?.MemberNumber);
        const member = Number(C?.MemberNumber);
        if (C === window.Player || (Number.isFinite(playerMember) && member === playerMember)) return lastPlayerChatRoomDraw;
        return Number.isFinite(member) ? lastCharacterChatRoomDraw.get(member) || null : null;
    }

    function characterPointToScreen(C, characterX, characterY) {
        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        const rect = canvas?.getBoundingClientRect?.();
        if (!canvas || !rect || rect.width <= 0 || rect.height <= 0) return null;

        const logicalWidth = Number(canvas.width) || 2000;
        const logicalHeight = Number(canvas.height) || 1000;
        const draw = characterChatRoomDraw(C);

        let mainX = characterX;
        let mainY = characterY;
        if (draw && Number.isFinite(draw.x) && Number.isFinite(draw.y) && Number.isFinite(draw.zoom)) {
            let heightRatio = Number(C?.HeightRatio);
            if (!Number.isFinite(heightRatio) || heightRatio <= 0) heightRatio = 1;

            let xOffset = 0;
            let yOffset = 0;
            try {
                if (typeof CharacterAppearanceXOffset === "function") xOffset = Number(CharacterAppearanceXOffset(C, heightRatio)) || 0;
                else xOffset = 500 * (1 - heightRatio) / 2;
            } catch (_) {
                xOffset = 500 * (1 - heightRatio) / 2;
            }
            try {
                if (typeof CharacterAppearanceYOffset === "function") {
                    yOffset = Number(CharacterAppearanceYOffset(C, heightRatio)) || 0;
                } else {
                    const proportion = Number.isFinite(Number(C?.HeightRatioProportion)) ? Number(C.HeightRatioProportion) : 1;
                    const modifier = Number(C?.HeightModifier) || 0;
                    yOffset = 1000 * (1 - heightRatio) * proportion - modifier * heightRatio;
                }
            } catch (_) {
                yOffset = 0;
            }

            const scale = draw.zoom * heightRatio;
            mainX = draw.x + draw.zoom * xOffset + characterX * scale;
            mainY = draw.y + draw.zoom * yOffset + characterY * scale;
        }

        return {
            x: rect.left + (mainX / logicalWidth) * rect.width,
            y: rect.top + (mainY / logicalHeight) * rect.height,
        };
    }

    function playerCharacterPointToScreen(characterX, characterY) {
        return characterPointToScreen(window.Player, characterX, characterY);
    }

    function plushOverlayPositionSignature(C, item) {
        if (!C || !isOurs(item)) return "";
        const draw = characterChatRoomDraw(C);
        const transform = readActivePlushLayerTransform(item);
        if (!transform) return "";
        return [
            draw?.x ?? "", draw?.y ?? "", draw?.zoom ?? "", Number(C?.HeightRatio) || 1,
            transform.TranslationX, transform.TranslationY, transform.ScaleX, transform.ScaleY, transform.Rotation,
        ].join("|");
    }

    function positionSpeechBubble() {
        if (!speechBubbleElement?.isConnected) return false;
        const item = getHeld(window.Player);
        const bounds = currentPlushCanvasBounds(item);
        if (!bounds) return false;

        const visualTop = Number.isFinite(bounds.visualTop) ? bounds.visualTop : bounds.top + 12;
        const screen = playerCharacterPointToScreen(bounds.centerX, visualTop - 8);
        if (!screen) return false;
        speechBubbleElement.style.left = `${Math.round(screen.x)}px`;
        speechBubbleElement.style.top = `${Math.round(screen.y + SPEECH_BUBBLE_Y_OFFSET_CSS_PX - 5)}px`;
        return true;
    }

    function showSpeechBubble(text = null, { force = false, durationMs = SPEECH_BUBBLE_DURATION_MS } = {}) {
        if (!force && !getFeatureSettings().speechBubbles) return false;
        if (!isOurs(getHeld(window.Player)) || window.CurrentScreen !== "ChatRoom") return false;
        removeSpeechBubble();
        const bubble = document.createElement("div");
        bubble.className = "SubbysPlushiesSpeechBubble";
        bubble.textContent = String(text || randomPlushSpeech()).slice(0, 90);
        Object.assign(bubble.style, {
            position: "fixed", zIndex: "2147482900", transform: "translate(-50%, -100%)",
            maxWidth: "90px", padding: "3px 5px", border: "1px solid currentColor",
            borderRadius: "6px", background: "rgba(255,255,255,0.94)", color: "black",
            font: "6px sans-serif", lineHeight: "1.2", textAlign: "center", pointerEvents: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        });
        document.body.appendChild(bubble);
        speechBubbleElement = bubble;
        positionSpeechBubble();
        recordStat("speech", 1, { plushName: currentPlushName() });
        speechBubbleTimer = window.setTimeout(removeSpeechBubble, Math.max(250, Number(durationMs) || SPEECH_BUBBLE_DURATION_MS));
        return true;
    }

    function plushStatusDescriptor() {
        const now = Date.now();
        if (manualPlushEmote && Number(manualPlushEmote.until) > now) return manualPlushEmote;
        if (manualPlushEmote && Number(manualPlushEmote.until) <= now) manualPlushEmote = null;
        if (activeProtectSession) return { type: "protective", symbol: "!", color: "#FFD166" };
        if (isPlushSleepy()) return { type: "sleepy", symbol: "zZ", color: "#D8C8FF" };
        const score = getPlushMoodRecord().score;
        if (score <= 38) return { type: "sulky", symbol: "…", color: "#C8B9C8" };
        if (score >= 66) return { type: "happy", symbol: "♥", color: "#FF8FC7" };
        return null;
    }

    function removePlushStatusIcon() {
        try { plushStatusIconElement?.remove?.(); } catch (_) {}
        plushStatusIconElement = null;
        localOverlayPositionSignature = null;
    }

    function positionPlushStatusIcon() {
        if (!plushStatusIconElement?.isConnected) return false;
        const item = getHeld(window.Player);
        const bounds = currentPlushCanvasBounds(item);
        if (!bounds) return false;
        const screen = playerCharacterPointToScreen(bounds.visualRight + 6, bounds.visualTop + 4);
        if (!screen) return false;
        plushStatusIconElement.style.left = `${Math.round(screen.x)}px`;
        plushStatusIconElement.style.top = `${Math.round(screen.y)}px`;
        return true;
    }

    function scheduleLocalOverlayReposition() {
        if (localOverlayRepositionFrame != null) return;
        localOverlayRepositionFrame = requestAnimationFrame(() => {
            localOverlayRepositionFrame = null;
            if (speechBubbleElement?.isConnected) positionSpeechBubble();
            if (plushStatusIconElement?.isConnected) positionPlushStatusIcon();
            const item = getHeld(window.Player);
            if (isOurs(item)) localOverlayPositionSignature = plushOverlayPositionSignature(window.Player, item);
        });
    }

    function refreshPlushStatusIcon() {
        if (window.CurrentScreen !== "ChatRoom" || !isOurs(getHeld(window.Player))) {
            removePlushStatusIcon();
            return false;
        }
        const descriptor = plushStatusDescriptor();
        if (!descriptor?.symbol) {
            removePlushStatusIcon();
            return false;
        }
        if (!plushStatusIconElement?.isConnected) {
            const icon = document.createElement("div");
            icon.className = "SubbysPlushiesMoodVisual";
            Object.assign(icon.style, {
                position: "fixed",
                zIndex: "2147482880",
                transform: "translate(-50%, -100%)",
                pointerEvents: "none",
                userSelect: "none",
                font: "bold 11px Arial, sans-serif",
                lineHeight: "1",
                textShadow: "0 1px 2px rgba(0,0,0,.85)",
                whiteSpace: "nowrap",
            });
            document.body.appendChild(icon);
            plushStatusIconElement = icon;
        }
        plushStatusIconElement.textContent = descriptor.symbol;
        plushStatusIconElement.style.color = descriptor.color || "#FFFFFF";
        plushStatusIconElement.dataset.state = descriptor.type || "mood";
        return positionPlushStatusIcon();
    }

    function startPlushStatusIconMonitor() {
        refreshPlushStatusIcon();
        if (plushStatusIconTimer == null) {
            plushStatusIconTimer = window.setInterval(refreshPlushStatusIcon, performanceInterval(15000, 60000));
        }
        return true;
    }

    function plushEmoteDefinition(type) {
        const key = String(type || "").trim().toLowerCase();
        const definitions = {
            happy: { type: "happy", symbol: "♥", color: "#FF8FC7", bubble: "♥" },
            angry: { type: "angry", symbol: "!!", color: "#FF8F8F", bubble: "Hmph!" },
            sleepy: { type: "sleepy", symbol: "zZ", color: "#D8C8FF", bubble: "zZ..." },
            protective: { type: "protective", symbol: "!", color: "#FFD166", bubble: "!" },
            protect: { type: "protective", symbol: "!", color: "#FFD166", bubble: "!" },
            sulky: { type: "sulky", symbol: "…", color: "#C8B9C8", bubble: "..." },
        };
        return definitions[key] || null;
    }

    function sendSyncedPlushEmote(type) {
        const selected = plushEmoteDefinition(type);
        if (!selected || window.CurrentScreen !== "ChatRoom" || typeof window.ServerSend !== "function") return false;
        try {
            window.ServerSend("ChatRoomChat", {
                Content: `${PLUSH_EMOTE_SYNC_CONTENT_PREFIX}${selected.type}`,
                Type: "Hidden",
                Dictionary: [
                    { Tag: PLUSH_EMOTE_SYNC_TAG, Text: selected.type },
                    { Tag: "SubbysPlushiesEmotePlush", Text: currentPlushName() },
                    { Tag: "SubbysPlushiesEmoteDuration", Text: String(PLUSH_EMOTE_DURATION_MS) },
                ],
            });
            return true;
        } catch (e) {
            warn("Could not synchronize plushie emote:", e);
            return false;
        }
    }

    function syncedPlushEmoteType(data) {
        if (!data || typeof data !== "object") return null;
        const content = String(data.Content || "");
        if (content.startsWith(PLUSH_EMOTE_SYNC_CONTENT_PREFIX)) {
            const selected = plushEmoteDefinition(content.slice(PLUSH_EMOTE_SYNC_CONTENT_PREFIX.length));
            if (selected) return selected.type;
        }
        const dictionary = Array.isArray(data.Dictionary) ? data.Dictionary : [];
        const entry = dictionary.find(part => part?.Tag === PLUSH_EMOTE_SYNC_TAG && typeof part?.Text === "string");
        const selected = plushEmoteDefinition(entry?.Text);
        return selected?.type || null;
    }

    function isSyncedPlushEmotePacket(data) {
        return !!syncedPlushEmoteType(data) && (data?.Type === "Hidden" || data?.Type === "Action");
    }

    function removeRemotePlushEmote(memberNumber) {
        const member = Number(memberNumber);
        const state = remotePlushEmotes.get(member);
        if (!state) return false;
        if (state.timer != null) window.clearTimeout(state.timer);
        try { state.icon?.remove?.(); } catch (_) {}
        try { state.bubble?.remove?.(); } catch (_) {}
        remotePlushEmotes.delete(member);
        return true;
    }

    function clearRemotePlushEmotes() {
        for (const member of [...remotePlushEmotes.keys()]) removeRemotePlushEmote(member);
        lastCharacterChatRoomDraw.clear();
    }

    function positionRemotePlushEmote(memberNumber) {
        const member = Number(memberNumber);
        const state = remotePlushEmotes.get(member);
        if (!state) return false;
        if (Date.now() >= state.until) {
            removeRemotePlushEmote(member);
            return false;
        }
        const C = getRoomCharacterByMember(member);
        const item = getHeld(C);
        if (!C || !isOurs(item)) return false;
        const bounds = currentPlushCanvasBounds(item);
        if (!bounds) return false;

        const iconPoint = characterPointToScreen(C, bounds.visualRight - 3, bounds.visualTop + 3);
        const bubblePoint = characterPointToScreen(C, bounds.centerX, bounds.visualTop - 8);
        if (iconPoint && state.icon?.isConnected) {
            state.icon.style.left = `${Math.round(iconPoint.x)}px`;
            state.icon.style.top = `${Math.round(iconPoint.y)}px`;
        }
        if (bubblePoint && state.bubble?.isConnected) {
            state.bubble.style.left = `${Math.round(bubblePoint.x)}px`;
            state.bubble.style.top = `${Math.round(bubblePoint.y + SPEECH_BUBBLE_Y_OFFSET_CSS_PX - 5)}px`;
        }
        return !!(iconPoint || bubblePoint);
    }

    function showRemotePlushEmote(memberNumber, type) {
        const member = Number(memberNumber);
        const playerMember = Number(window.Player?.MemberNumber);
        if (!Number.isFinite(member) || member === playerMember || window.CurrentScreen !== "ChatRoom") return false;
        const selected = plushEmoteDefinition(type);
        const C = getRoomCharacterByMember(member);
        if (!selected || !C || !isOurs(getHeld(C))) return false;

        removeRemotePlushEmote(member);
        const icon = document.createElement("div");
        icon.className = "SubbysPlushiesRemoteMoodVisual";
        icon.textContent = selected.symbol;
        Object.assign(icon.style, {
            position: "fixed", zIndex: "2147482878", transform: "translate(-50%, -100%)",
            pointerEvents: "none", userSelect: "none", font: "bold 11px Arial, sans-serif",
            lineHeight: "1", textShadow: "0 1px 2px rgba(0,0,0,.85)", whiteSpace: "nowrap",
            color: selected.color || "#FFFFFF",
        });

        const bubble = document.createElement("div");
        bubble.className = "SubbysPlushiesRemoteSpeechBubble";
        bubble.textContent = selected.bubble;
        Object.assign(bubble.style, {
            position: "fixed", zIndex: "2147482898", transform: "translate(-50%, -100%)",
            maxWidth: "90px", padding: "3px 5px", border: "1px solid currentColor",
            borderRadius: "6px", background: "rgba(255,255,255,0.94)", color: "black",
            font: "6px sans-serif", lineHeight: "1.2", textAlign: "center", pointerEvents: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        });

        document.body.append(icon, bubble);
        const state = {
            type: selected.type,
            until: Date.now() + PLUSH_EMOTE_DURATION_MS,
            icon,
            bubble,
            timer: null,
            positionSignature: "",
        };
        state.timer = window.setTimeout(() => removeRemotePlushEmote(member), PLUSH_EMOTE_DURATION_MS + 80);
        remotePlushEmotes.set(member, state);
        positionRemotePlushEmote(member);
        return true;
    }

    function processSyncedPlushEmote(data) {
        const type = syncedPlushEmoteType(data);
        const sender = Number(data?.Sender);
        if (!type || !Number.isFinite(sender)) return false;
        return showRemotePlushEmote(sender, type);
    }

    function triggerPlushEmote(type) {
        const selected = plushEmoteDefinition(type);
        if (!selected || !isOurs(getHeld(window.Player))) return false;
        if (manualPlushEmoteTimer != null) window.clearTimeout(manualPlushEmoteTimer);
        manualPlushEmote = { ...selected, until: Date.now() + PLUSH_EMOTE_DURATION_MS };
        emitPluginApiEvent("emote", { plushName: currentPlushName(), type: selected.type, symbol: selected.symbol, durationMs: PLUSH_EMOTE_DURATION_MS, synced: window.CurrentScreen === "ChatRoom" });
        refreshPlushStatusIcon();
        showSpeechBubble(selected.bubble, { force: true, durationMs: PLUSH_EMOTE_DURATION_MS });
        if (window.CurrentScreen === "ChatRoom") sendSyncedPlushEmote(selected.type);
        manualPlushEmoteTimer = window.setTimeout(() => {
            manualPlushEmoteTimer = null;
            manualPlushEmote = null;
            refreshPlushStatusIcon();
        }, PLUSH_EMOTE_DURATION_MS + 50);
        return true;
    }

    function cancelIdleAnimation(reschedule = true) {
        if (idleAnimationTimer != null) window.clearTimeout(idleAnimationTimer);
        idleAnimationTimer = null;
        idleAnimationGeneration++;
        const session = activeIdleAnimationSession;
        activeIdleAnimationSession = null;
        if (session) {
            const current = getHeld(window.Player);
            if (isOurs(current) && getActivePlushLayerName(current) === session.layerName) {
                setPlushLayerTransform(current, session.layerName, session.base);
                rebuildCharacterCanvas(window.Player, "idle animation cancel");
            }
        }
        if (reschedule && getFeatureSettings().idleAnimations) scheduleNextIdleAnimation();
        return true;
    }

    function runIdleAnimation() {
        const settings = getFeatureSettings();
        const item = getHeld(window.Player);
        if (!settings.idleAnimations || isLowCpuMode() || !isOurs(item) || window.CurrentScreen !== "ChatRoom" || dragSession || nativeLayeringVisible() ||
            activeBalanceHeadSession || activeHideBehindSession || activeProtectSession || activeIdleAnimationSession || isPlushSleepy()) return false;
        const layerName = getActivePlushLayerName(item);
        const base = readActivePlushLayerTransform(item);
        if (!layerName || !base) return false;
        const generation = ++idleAnimationGeneration;
        activeIdleAnimationSession = { generation, layerName, base: { ...base } };
        const direction = Math.random() < 0.5 ? -1 : 1;
        const frames = IDLE_ANIMATION_FRAMES.map(frame => ({
            delay: frame.delayMs,
            dy: frame.deltaY,
            rot: frame.rotationMultiplier * direction,
            restore: !!frame.restore,
        }));
        for (const frame of frames) {
            window.setTimeout(() => {
                const session = activeIdleAnimationSession;
                if (!session || session.generation !== generation) return;
                const current = getHeld(window.Player);
                if (!isOurs(current) || getActivePlushLayerName(current) !== layerName) return;
                setPlushLayerTransform(current, layerName, {
                    TranslationY: base.TranslationY + frame.dy,
                    Rotation: base.Rotation + frame.rot,
                });
                rebuildCharacterCanvas(window.Player, "idle plush animation");
                scheduleLocalOverlayReposition();
                if (frame.restore) {
                    setPlushLayerTransform(current, layerName, base);
                    activeIdleAnimationSession = null;
                    rebuildCharacterCanvas(window.Player, "idle plush animation restore");
                    recordStat("idle", 1, { plushName: currentPlushName() });
                    if (settings.speechBubbles && Math.random() < SPEECH_IDLE_CHANCE) showSpeechBubble();
                }
            }, frame.delay);
        }
        return true;
    }

    function scheduleNextIdleAnimation(delay = null) {
        if (idleAnimationTimer != null) window.clearTimeout(idleAnimationTimer);
        if (!getFeatureSettings().idleAnimations || isLowCpuMode()) { idleAnimationTimer = null; return false; }
        const wait = Number.isFinite(delay) ? Math.max(500, delay) : IDLE_MIN_DELAY_MS + Math.random() * (IDLE_MAX_DELAY_MS - IDLE_MIN_DELAY_MS);
        idleAnimationTimer = window.setTimeout(() => {
            idleAnimationTimer = null;
            runIdleAnimation();
            scheduleNextIdleAnimation();
        }, wait);
        return true;
    }

    function showCurrentPlushInfo() {
        const name = currentPlushName();
        const lore = getPlushLore(name) || { title: "Plushie", text: "Lore is not available yet. The plugin will use the validated Git copy when it is online or cached." };
        const mood = getPlushMoodRecord(name);
        const relationship = relationshipStatus(name);
        const mascot = roomMascotState?.name ? `Room mascot: ${roomMascotState.name}` : "Room mascot: none";
        appendLocalInfoBox(`${name} — ${lore.title}`, [
            lore.text,
            `Mood: ${moodLabel(mood.score)} (${mood.score}/100) • interactions: ${mood.interactions}`,
            `Relationship: ${relationship.level} (${relationship.interactions})${relationship.nextLevel ? ` • ${relationship.remaining} to ${relationship.nextLevel}` : " • max"} • ${isPlushSleepy(name) ? "sleeping zZ" : "awake"}`,
            `Protect Me: ${getFeatureSettings().protectMe ? "ON" : "off"} • Jealous Plushie: ${getFeatureSettings().jealousPlushie ? "ON" : "off"}`,
            mascot,
        ]);
        return { name, lore, mood: { ...mood } };
    }

    function handleLocalPlushInteraction(key) {
        const delta = MOOD_DELTAS[key] || 0;
        if (delta) adjustCurrentPlushMood(delta, key);
        const plushName = currentPlushName();
        recordStat("interaction", 1, { action: key, plushName });
        const relationship = touchPlushRelationship(plushName, { increment: 1, wake: true });
        if (!isLowCpuMode() && (key === "pet" || key === "pat")) window.setTimeout(animatePetting, 70);
        if (!relationship.milestone && getFeatureSettings().speechBubbles && SPEECH_INTERACTION_ACTIONS.includes(key) && Math.random() < SPEECH_INTERACTION_CHANCE) {
            window.setTimeout(() => showSpeechBubble(), SPEECH_INTERACTION_DELAY_MS);
        }
        emitPluginApiEvent("interaction", {
            action: key,
            plushName,
            mood: { ...getPlushMoodRecord(plushName) },
            relationship: { ...relationship },
        });
    }

    function activityNameFromRunArgsFast(args) {
        const values = Array.isArray(args) ? args : [args];
        const candidates = [];
        const add = value => {
            if (typeof value === "string" && value && !candidates.includes(value)) candidates.push(value);
        };
        for (const value of values) {
            if (typeof value === "string") { add(value); continue; }
            if (!value || typeof value !== "object" || looksLikeCharacter(value)) continue;
            add(value.ActivityName);
            const nested = value.Activity;
            if (typeof nested === "string") add(nested);
            else if (nested && typeof nested === "object") {
                add(nested.ActivityName);
                add(nested.Name);
            }
            add(value.Name);
            add(value.Content);
        }
        return candidates.find(isAffectionateActivityName) || candidates[0] || "";
    }

    function isAffectionateActivityName(value) {
        const lower = String(value || "").toLowerCase();
        return !!lower && JEALOUS_ACTIVITY_KEYWORDS.some(token => lower.includes(token));
    }

    function triggerJealousReaction(target, activityName = "") {
        if (!getFeatureSettings().jealousPlushie || !isOurs(getHeld(window.Player))) return false;
        const now = Date.now();
        if (now - lastJealousReactionAt < 12000) return false;
        lastJealousReactionAt = now;
        adjustCurrentPlushMood(MOOD_DELTAS.jealous, `jealous:${activityName || "affection"}`);

        const sourceName = getCharacterDisplayName(window.Player) || "Someone";
        const targetName = getCharacterDisplayName(target) || "someone else";
        const plushName = currentPlushName();
        sendStandaloneActionMessage(`${plushName} plushie gives ${targetName} a tiny jealous stare while ${sourceName} gives away attention.`);
        return true;
    }

    function actionSearchText(data) {
        let text = typeof data?.Content === "string" ? data.Content : "";
        const dictionary = data?.Dictionary;
        if (Array.isArray(dictionary)) {
            for (const entry of dictionary) {
                if (typeof entry?.Text === "string") text += ` ${entry.Text}`;
            }
        }
        return text.toLowerCase();
    }

    function actionLooksProtectable(data) {
        if (!getFeatureSettings().protectMe || !isChatAction(data) || !isOurs(getHeld(window.Player))) return false;
        const text = actionSearchText(data);
        return PROTECT_KEYWORDS.some(token => text.includes(token));
    }

    function protectContextTargetsLocalPlayer(context) {
        const playerMember = Number(window.Player?.MemberNumber);
        if (!Number.isFinite(playerMember)) return false;

        if (Number.isFinite(context?.targetMember)) return Number(context.targetMember) === playerMember;

        return offerTargetIsLocalPlayer(context?.targetName);
    }

    function protectSourceIsLocal(context, data = null) {
        const playerMember = Number(window.Player?.MemberNumber);
        if (Number.isFinite(playerMember)) {
            if (Number.isFinite(context?.sourceMember) && Number(context.sourceMember) === playerMember) return true;
            if (Number(data?.Sender) === playerMember) return true;
        }

        const source = normalizeOfferName(context?.sourceName);
        return !!source && localOfferNameVariants().has(source);
    }

    function triggerProtectReaction(sourceName = null, triggerSource = "activity packet") {
        if (!getFeatureSettings().protectMe || !isOurs(getHeld(window.Player))) return false;

        const now = Date.now();
        if (now - lastProtectReactionAt < 1200) return false;
        lastProtectReactionAt = now;

        adjustCurrentPlushMood(MOOD_DELTAS.protect, `protect me:${triggerSource}`);
        window.setTimeout(movePlushToProtectTemporarily, 40);

        const plushName = currentPlushName();
        const holderName = getCharacterDisplayName(window.Player) || "its holder";
        const troubleName = sourceName || "the incoming trouble";
        sendStandaloneActionMessage(`${plushName} plushie jumps into a protective pose between ${holderName} and ${troubleName}.`);
        return true;
    }

    function maybeTriggerProtect(data, prechecked = false) {
        if (!prechecked && !actionLooksProtectable(data)) return false;
        const context = getActionCharacterContext(data);
        if (!protectContextTargetsLocalPlayer(context)) return false;
        if (protectSourceIsLocal(context, data)) return false;
        return triggerProtectReaction(context.sourceName, "activity packet");
    }

    function parseRenderedProtectAction(text) {
        let value = String(text || "")
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        if (!value || !PROTECT_RENDER_VERB_RE.test(value)) return null;

        value = value.replace(/^\(+\s*/, "");
        const match = value.match(PROTECT_RENDER_ACTION_RE);
        if (!match) return null;

        return {
            sourceName: String(match[1] || "").trim(),
            verb: String(match[2] || "").trim(),
            targetName: String(match[3] || "").trim(),
        };
    }

    function inspectRenderedProtectRow(row) {
        if (!(row instanceof Element)) return false;
        if (processedProtectChatRows.has(row)) return false;
        if (!getFeatureSettings().protectMe || !isOurs(getHeld(window.Player))) return false;

        const text = String(row.textContent || "").replace(/\s+/g, " ").trim();
        const parsed = parseRenderedProtectAction(text);
        if (!parsed) return false;

        processedProtectChatRows.add(row);
        if (!offerTargetIsLocalPlayer(parsed.targetName)) return false;

        const resolvedSource = resolveRenderedOfferSource(row, parsed.sourceName);
        if (balanceRenderedSourceIsLocal(resolvedSource.sourceName, resolvedSource.sourceMember)) return false;

        return triggerProtectReaction(resolvedSource.sourceName, `rendered ${parsed.verb}`);
    }

    function animatePetting() {
        const item = getHeld(window.Player);
        if (!isOurs(item) || activeBalanceHeadSession || activeHideBehindSession || activeProtectSession || activeIdleAnimationSession) return false;
        const layerName = getActivePlushLayerName(item);
        const base = readActivePlushLayerTransform(item);
        if (!layerName || !base) return false;

        const generation = ++petAnimationGeneration;
        const frames = [
            { delay: 0, dy: -3, rot: -4 },
            { delay: 90, dy: -6, rot: 4 },
            { delay: 180, dy: -3, rot: -3 },
            { delay: 270, dy: 0, rot: 0 },
        ];

        for (const frame of frames) {
            window.setTimeout(() => {
                if (generation !== petAnimationGeneration) return;
                const current = getHeld(window.Player);
                if (!isOurs(current) || getActivePlushLayerName(current) !== layerName) return;
                setPlushLayerTransform(current, layerName, {
                    TranslationY: base.TranslationY + frame.dy,
                    Rotation: base.Rotation + frame.rot,
                });
                rebuildCharacterCanvas(window.Player, "petting animation");
                if (frame.delay === 270) rememberCharacterPlushState(window.Player, current);
            }, frame.delay);
        }
        return true;
    }

    function battleCharacterLabel(C) {
        const name = getCharacterDisplayName(C) || C?.Name || "Someone";
        const member = Number(C?.MemberNumber);
        return Number.isFinite(member) ? `${name}(${member})` : name;
    }

    function resolveBattleTarget(query = "") {
        const playerMember = Number(window.Player?.MemberNumber);
        const focused = window.DialogFocusCharacter;
        if (!query && focused && Number(focused.MemberNumber) !== playerMember) return focused;
        const wanted = String(query || "").trim().toLowerCase();
        const characters = Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : [];
        if (/^\d+$/.test(wanted)) return characters.find(C => Number(C?.MemberNumber) === Number(wanted)) || null;
        if (wanted) return characters.find(C => [getCharacterDisplayName(C), C?.Name, C?.Nickname].filter(Boolean).some(n => String(n).toLowerCase().includes(wanted))) || null;
        return null;
    }

    function closeBattleTargetPrompt() {
        try { battleTargetPromptElement?.remove?.(); } catch (_) {}
        battleTargetPromptElement = null;
    }

    function showBattleTargetPrompt() {
        if (!isOurs(getHeld(window.Player))) {
            appendLocalInfoBox("Plushie battle", ["Equip a plushie first."], { compact: true });
            return false;
        }

        closeBattleTargetPrompt();
        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        const rect = canvas?.getBoundingClientRect?.();
        if (!rect || rect.width <= 0 || rect.height <= 0) return false;

        const root = document.createElement("div");
        root.className = "SubbysPlushiesBattleTargetPrompt";
        Object.assign(root.style, {
            position: "fixed",
            zIndex: "2147483300",
            left: `${Math.round(rect.left + rect.width * 0.50)}px`,
            top: `${Math.round(rect.top + rect.height * 0.50)}px`,
            transform: "translate(-50%, -50%)",
            width: `${Math.max(300, Math.min(430, Math.round(rect.width * 0.30)))}px`,
            boxSizing: "border-box",
            padding: "16px",
            border: "1px solid #8E719A",
            borderRadius: "14px",
            background: "rgba(33,27,43,0.98)",
            color: "#F7EEF5",
            boxShadow: "0 12px 36px rgba(0,0,0,0.48)",
            font: "14px Arial, sans-serif",
        });

        const title = document.createElement("div");
        title.textContent = "Plushie Battle";
        Object.assign(title.style, { fontSize: "20px", fontWeight: "bold", color: "#D8A8C9", marginBottom: "5px" });
        const subtitle = document.createElement("div");
        subtitle.textContent = "Who do you want to battle?";
        Object.assign(subtitle.style, { opacity: "0.82", marginBottom: "10px" });

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Type a player name or member number";
        input.autocomplete = "off";
        Object.assign(input.style, {
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 10px",
            borderRadius: "7px",
            border: "1px solid #8E719A",
            outline: "none",
            background: "#2A2233",
            color: "#F7EEF5",
            font: "14px Arial, sans-serif",
        });

        const suggestions = document.createElement("div");
        Object.assign(suggestions.style, { marginTop: "8px", fontSize: "12px", color: "#C5B6C8", lineHeight: "1.35" });
        const playerMember = Number(window.Player?.MemberNumber);
        const roomNames = (Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : [])
            .filter(C => Number(C?.MemberNumber) !== playerMember)
            .map(C => getCharacterDisplayName(C) || C?.Name)
            .filter(Boolean)
            .slice(0, 8);
        suggestions.textContent = roomNames.length ? `In room: ${roomNames.join(", ")}` : "Enter the exact name or member number.";

        const errorText = document.createElement("div");
        Object.assign(errorText.style, { minHeight: "18px", marginTop: "7px", fontSize: "12px", color: "#F0A9B7" });

        const controls = document.createElement("div");
        Object.assign(controls.style, { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" });
        const cancel = document.createElement("button");
        const battle = document.createElement("button");
        cancel.type = battle.type = "button";
        cancel.textContent = "Cancel";
        battle.textContent = "Battle";
        for (const button of [cancel, battle]) Object.assign(button.style, {
            minWidth: "92px",
            padding: "7px 12px",
            borderRadius: "8px",
            border: "1px solid #8E719A",
            color: "#F7EEF5",
            cursor: "pointer",
            font: "bold 13px Arial, sans-serif",
        });
        cancel.style.background = "#302638";
        battle.style.background = "#5A4565";

        const submit = () => {
            const query = String(input.value || "").trim();
            if (!query) {
                errorText.textContent = "Type a player name first.";
                input.focus();
                return;
            }
            const target = resolveBattleTarget(query);
            if (!target || Number(target.MemberNumber) === playerMember) {
                errorText.textContent = "I couldn't find that player in the room.";
                input.select();
                return;
            }
            const member = Number(target.MemberNumber);
            closeBattleTargetPrompt();
            challengePlushBattle(Number.isFinite(member) ? String(member) : query);
        };

        cancel.addEventListener("click", closeBattleTargetPrompt);
        battle.addEventListener("click", submit);
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") { event.preventDefault(); submit(); }
            else if (event.key === "Escape") { event.preventDefault(); closeBattleTargetPrompt(); }
        });
        root.addEventListener("pointerdown", event => event.stopPropagation());
        root.append(title, subtitle, input, suggestions, errorText, controls);
        controls.append(cancel, battle);
        document.body.appendChild(root);
        battleTargetPromptElement = root;
        window.setTimeout(() => input.focus(), 0);
        return true;
    }

    function closeBattlePrompt() {
        if (!battlePromptElement) return;
        try { battlePromptElement.querySelectorAll("button").forEach(button => button.disabled = true); } catch (_) {}
        battlePromptElement = null;
    }

    function rollBattleRound() {
        const move = BATTLE_MOVES[Math.floor(Math.random() * BATTLE_MOVES.length)];
        const score = move.min + Math.floor(Math.random() * (move.max - move.min + 1));
        return { move: move.name, score };
    }

    function resolveAcceptedBattle(challengerMember, challengerName, challengerPlush) {
        const opponent = getRoomCharacterByMember(challengerMember);
        const playerMember = Number(window.Player?.MemberNumber);
        const playerName = getCharacterDisplayName(window.Player) || "Someone";
        const ownPlush = currentPlushName();
        if (!isOurs(getHeld(window.Player))) {
            appendLocalInfoBox("Plushie battle", ["Equip a Subby's Plushies plushie before accepting the battle."], { compact: true });
            return false;
        }
        let challengerScore = 0, playerScore = 0;
        const roundLines = [];
        for (let i = 1; i <= BATTLE_ROUNDS; i++) {
            const a = rollBattleRound(), b = rollBattleRound();
            challengerScore += a.score; playerScore += b.score;
            roundLines.push(`R${i}: ${challengerPlush} ${a.move} ${a.score} vs ${ownPlush} ${b.move} ${b.score}`);
        }
        const playerResult = playerScore > challengerScore ? "wins" : playerScore < challengerScore ? "loses" : "draws";
        sendStandaloneActionMessage(`${battleCharacterLabel(window.Player)} accepts ${challengerName}(${challengerMember})'s plushie battle challenge with ${ownPlush}.`);
        window.setTimeout(() => {
            sendStandaloneActionMessage(`Plushie battle result: ${playerName}(${playerMember}) [${ownPlush}] ${playerResult} against ${challengerName}(${challengerMember}) [${challengerPlush}]. Scores ${playerScore}-${challengerScore}.`);
            appendLocalInfoBox("Plushie battle", [...roundLines, `Final: ${ownPlush} ${playerScore} — ${challengerPlush} ${challengerScore}`], { compact: true });
            lastBattleResult = {
                result: playerResult === "wins" ? "win" : playerResult === "loses" ? "loss" : "draw",
                playerScore,
                challengerScore,
                ownPlush,
                challengerPlush,
                rounds: roundLines.slice(),
                at: new Date().toISOString(),
            };
        }, BATTLE_RESULT_DELAY_MS);
        return true;
    }

    function showBattlePrompt(challengerMember, challengerName, challengerPlush) {
        if (Number(challengerMember) === Number(window.Player?.MemberNumber)) return false;
        if (typeof window.ChatRoomAppendChat !== "function") return false;
        closeBattlePrompt();
        const row = document.createElement("div");
        row.className = "ChatMessage SubbysPlushiesBattlePrompt";
        Object.assign(row.style, {
            margin: "2px 4px",
            padding: "4px 6px",
            border: "1px solid currentColor",
            borderRadius: "5px",
            fontSize: "10px",
            lineHeight: "1.08",
        });
        const msg = document.createElement("div");
        msg.textContent = `${challengerName} challenges you to a plushie battle with ${challengerPlush}!`;
        const controls = document.createElement("div");
        Object.assign(controls.style, { display: "flex", gap: "4px", marginTop: "3px" });
        const accept = document.createElement("button"), decline = document.createElement("button");
        accept.textContent = "Accept"; decline.textContent = "Decline";
        for (const button of [accept, decline]) Object.assign(button.style, { fontSize: "9px", padding: "1px 5px", minHeight: "20px" });
        const decide = accepted => {
            if (!row.isConnected || row.dataset.decided === "true") return;
            if (accepted && !resolveAcceptedBattle(challengerMember, challengerName, challengerPlush)) return;
            row.dataset.decided = "true";
            accept.disabled = decline.disabled = true;
            controls.remove();
            if (!accepted) {
                sendStandaloneActionMessage(`${battleCharacterLabel(window.Player)} declines ${challengerName}(${challengerMember})'s plushie battle challenge.`);
                msg.textContent = "Battle declined.";
            } else msg.textContent = `Battle accepted — resolving ${BATTLE_ROUNDS} round${BATTLE_ROUNDS === 1 ? "" : "s"}...`;
            if (battlePromptElement === row) battlePromptElement = null;
        };
        accept.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); decide(true); });
        decline.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); decide(false); });
        controls.append(accept, decline); row.append(msg, controls); window.ChatRoomAppendChat(row);
        battlePromptElement = row;
        return true;
    }

    function challengePlushBattle(targetQuery = "") {
        if (!isOurs(getHeld(window.Player))) {
            appendLocalInfoBox("Plushie battle", ["Equip a plushie first."], { compact: true });
            return false;
        }
        const target = resolveBattleTarget(targetQuery);
        if (!target || Number(target.MemberNumber) === Number(window.Player?.MemberNumber)) {
            appendLocalInfoBox("Plushie battle", ["Focus another character or use /plushiebattle <member number or name>."], { compact: true });
            return false;
        }
        const sourceLabel = battleCharacterLabel(window.Player);
        const targetLabel = battleCharacterLabel(target);
        const plushName = currentPlushName();
        sendStandaloneActionMessage(`${sourceLabel} challenges ${targetLabel} to a plushie battle with ${plushName}.`);
        return true;
    }

    function processBattleAction(data) {
        if (!isChatAction(data)) return false;
        const msg = getDictionaryText(data, "msg") || "";
        let match = msg.match(BATTLE_CHALLENGE_RE);
        if (match) {
            const sourceMember = Number(match[2]), targetMember = Number(match[4]);
            if (targetMember === Number(window.Player?.MemberNumber) && sourceMember !== targetMember) showBattlePrompt(sourceMember, match[1].trim(), match[5].trim());
            return true;
        }

        match = msg.match(BATTLE_RESULT_RE);
        if (match) {
            const firstMember = Number(match[2]), firstResult = match[4].toLowerCase(), secondMember = Number(match[6]);
            const playerMember = Number(window.Player?.MemberNumber);
            if (playerMember !== firstMember && playerMember !== secondMember) return true;
            let result = "draw";
            if (playerMember === firstMember) result = firstResult === "wins" ? "win" : firstResult === "loses" ? "loss" : "draw";
            else result = firstResult === "wins" ? "loss" : firstResult === "loses" ? "win" : "draw";
            const playerIsFirst = playerMember === firstMember;
            const ownPlush = playerIsFirst ? match[3].trim() : match[7].trim();
            const opponent = playerIsFirst ? match[5].trim() : match[1].trim();
            const opponentMember = playerIsFirst ? secondMember : firstMember;
            const opponentPlush = playerIsFirst ? match[7].trim() : match[3].trim();
            const ownScore = Number(playerIsFirst ? match[8] : match[9]) || 0;
            const opponentScore = Number(playerIsFirst ? match[9] : match[8]) || 0;
            recordStat("battlePlayed", 1, { plushName: ownPlush });
            recordStat(result === "win" ? "battleWin" : result === "loss" ? "battleLoss" : "battleDraw", 1, { plushName: ownPlush });
            const historyEntry = recordBattleHistory({
                at: Date.now(), opponent, opponentMember, plush: ownPlush, opponentPlush,
                score: ownScore, opponentScore, result,
            });
            lastBattleResult = { result, text: msg, at: new Date().toISOString(), historyEntry };
            emitPluginApiEvent("battle", historyEntry);
            return true;
        }

        return false;
    }

    function compareVersions(a, b) {
        const parse = value => String(value || "0").split(/[.-]/).map(part => /^\d+$/.test(part) ? Number(part) : part);
        const A = parse(a), B = parse(b), length = Math.max(A.length, B.length);
        for (let i = 0; i < length; i++) {
            const av = A[i] ?? 0, bv = B[i] ?? 0;
            if (typeof av === "number" && typeof bv === "number") {
                if (av !== bv) return av > bv ? 1 : -1;
            } else {
                const cmp = String(av).localeCompare(String(bv));
                if (cmp) return cmp > 0 ? 1 : -1;
            }
        }
        return 0;
    }

    function versionFromScriptText(text) {
        const match = String(text || "").match(/@version\s+([^\s]+)/i) || String(text || "").match(/const\s+VERSION\s*=\s*["']([^"']+)/);
        return match?.[1] || null;
    }

    async function fetchTextWithTimeout(url, timeoutMs = 6000) {
        const controller = typeof AbortController === "function" ? new AbortController() : null;
        const timer = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
            const response = await fetch(url, { cache: "no-store", ...(controller ? { signal: controller.signal } : {}) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } finally {
            if (timer != null) window.clearTimeout(timer);
        }
    }

    function gitDataPlainObject(value) {
        return !!value && typeof value === "object" && !Array.isArray(value);
    }

    function gitDataFinite(value, fallback, min = -Infinity, max = Infinity) {
        const number = Number(value);
        return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
    }

    function gitDataString(value, fallback = "", maxLength = 8000) {
        if (typeof value !== "string") return fallback;
        const normalized = value.trim();
        return normalized ? normalized.slice(0, maxLength) : fallback;
    }

    function gitDataStringArray(value, fallback = [], maxItems = 100, maxLength = 180) {
        if (!Array.isArray(value)) return [...fallback];
        const result = [];
        for (const entry of value.slice(0, maxItems)) {
            const text = gitDataString(entry, "", maxLength);
            if (text) result.push(text);
        }
        return result.length ? result : [...fallback];
    }

    function escapeRegExp(value) {
        return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function protectVerbForms(verbs) {
        const forms = new Set();
        for (const raw of verbs) {
            const verb = String(raw || "").trim().toLowerCase();
            if (!/^[a-z]+$/.test(verb)) continue;
            forms.add(verb);
            forms.add(`${verb}s`);
            forms.add(`${verb}es`);
            if (verb.endsWith("e")) forms.add(`${verb.slice(0, -1)}es`);
        }
        return [...forms].sort((a, b) => b.length - a.length);
    }

    function rebuildProtectRenderRegex(verbs) {
        const forms = protectVerbForms(verbs);
        if (!forms.length) return false;
        const alternation = forms.map(escapeRegExp).join("|");
        PROTECT_RENDER_VERB_RE = new RegExp(`\\b(${alternation})\\b`, "i");
        PROTECT_RENDER_ACTION_RE = new RegExp(`(.+?)\\s+(${alternation})\\s+(.+?)(?:'s|')\\s+[^.)]+`, "i");
        return true;
    }

    function cuddleQueenEncounterValue() {
        if (Number(window.Player?.MemberNumber) === CUDDLE_QUEEN_MEMBER_NUMBER) return 1;
        if (window.CurrentScreen !== "ChatRoom") return 0;
        const characters = Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : [];
        return characters.some(C => Number(C?.MemberNumber) === CUDDLE_QUEEN_MEMBER_NUMBER) ? 1 : 0;
    }

    function currentChatRoomName() {
        const candidates = [
            window.ChatRoomData?.Name,
            window.ChatRoomData?.RoomName,
            window.ChatRoomData?.DisplayName,
        ];
        const value = candidates.find(entry => typeof entry === "string" && entry.trim());
        return String(value || "").trim();
    }

    function cuddleRoomJoinedValue() {
        if (window.CurrentScreen !== "ChatRoom") return 0;
        const normalize = value => String(value || "")
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
        return normalize(currentChatRoomName()) === normalize(CUDDLE_ROOM_NAME) ? 1 : 0;
    }

    function ensureRequiredAchievements(definitions) {
        const list = Array.isArray(definitions) ? [...definitions] : [];
        if (!list.some(entry => entry?.id === "meet_cuddle_queen")) {
            list.push(Object.freeze({
                id: "meet_cuddle_queen",
                name: "Meet the cuddle queen",
                description: "Share a chat room with the Cuddle Queen.",
                condition: Object.freeze({ metric: "cuddleQueenEncounter", operator: ">=", value: 1 }),
                test: stats => cuddleQueenEncounterValue() >= 1,
            }));
        }
        if (!list.some(entry => entry?.id === "join_cuddle_room")) {
            list.push(Object.freeze({
                id: "join_cuddle_room",
                name: "Join the cuddle room",
                description: "Join Subbycat's place.",
                condition: Object.freeze({ metric: "cuddleRoomJoined", operator: ">=", value: 1 }),
                test: stats => cuddleRoomJoinedValue() >= 1,
            }));
        }
        if (!list.some(entry => entry?.id === "bestie_material")) {
            list.push(Object.freeze({
                id: "bestie_material",
                name: "Bestie Material",
                description: "Reach Bestie relationship with any plushie.",
                condition: Object.freeze({ metric: "maxRelationshipInteractions", operator: ">=", value: 50 }),
                test: stats => maxRelationshipInteractions() >= 50,
            }));
        }
        if (!list.some(entry => entry?.id === "stitched_together")) {
            list.push(Object.freeze({
                id: "stitched_together",
                name: "Stitched Together",
                description: "Reach Bonded relationship with any plushie.",
                condition: Object.freeze({ metric: "maxRelationshipInteractions", operator: ">=", value: 100 }),
                test: stats => maxRelationshipInteractions() >= 100,
            }));
        }
        return Object.freeze(list);
    }

    function achievementMetricValue(stats, metric) {
        if (metric === "affectionCount") return statAffectionCount(stats);
        if (metric === "uniquePlushiesUsed") return Object.keys(stats?.plushesUsed || {}).length;
        if (metric === "cuddleQueenEncounter") return cuddleQueenEncounterValue();
        if (metric === "cuddleRoomJoined") return cuddleRoomJoinedValue();
        if (metric === "maxRelationshipInteractions") return maxRelationshipInteractions();
        const parts = String(metric || "").split(".").filter(Boolean);
        let value = stats;
        for (const part of parts) {
            if (!gitDataPlainObject(value) && typeof value !== "object") return 0;
            value = value?.[part];
        }
        return Number(value) || 0;
    }

    function achievementConditionPasses(stats, condition) {
        if (!gitDataPlainObject(condition)) return false;
        const actual = achievementMetricValue(stats, condition.metric);
        const expected = Number(condition.value);
        if (!Number.isFinite(expected)) return false;
        switch (condition.operator) {
            case ">=": return actual >= expected;
            case "<=": return actual <= expected;
            case ">": return actual > expected;
            case "<": return actual < expected;
            case "==":
            case "=": return actual === expected;
            default: return false;
        }
    }

    function normalizeLoreLookupKey(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/lyly/g, "lily")
            .replace(/kyutie/g, "kyu")
            .replace(/[^a-z0-9]/g, "");
    }

    function getPlushLore(name) {
        const direct = PLUSH_LORE?.[name];
        if (direct) return direct;
        const wanted = normalizeLoreLookupKey(name);
        if (!wanted) return null;
        for (const [key, value] of Object.entries(PLUSH_LORE || {})) {
            if (normalizeLoreLookupKey(key) === wanted) return value;
        }
        return null;
    }

    function normalizeGitDataFile(fileName, payload) {
        if (!gitDataPlainObject(payload) || Number(payload.schemaVersion) !== GIT_DATA_SCHEMA_VERSION) return null;

        if (fileName === "lore.json") {
            if (!gitDataPlainObject(payload.lore)) return null;
            const lore = Object.create(null);
            for (const [key, value] of Object.entries(payload.lore)) {
                if (!gitDataPlainObject(value)) continue;
                const title = gitDataString(value.title, "", 180);
                const text = gitDataString(value.text, "", 12000);
                if (title && text) lore[String(key).slice(0, 180)] = Object.freeze({ title, text });
            }
            return Object.keys(lore).length ? { lore: Object.freeze(lore) } : null;
        }

        if (fileName === "speech.json") {
            if (!gitDataPlainObject(payload.moodBuckets)) return null;
            const buckets = Object.create(null);
            for (const key of ["grumpy", "calm", "happy", "adoring"]) {
                const bucket = payload.moodBuckets[key];
                if (!gitDataPlainObject(bucket)) continue;
                const lines = gitDataStringArray(bucket.lines, [], 80, 120);
                if (lines.length) buckets[key] = Object.freeze(lines);
            }
            if (!Object.keys(buckets).length) return null;
            const triggers = gitDataPlainObject(payload.automaticTriggers) ? payload.automaticTriggers : {};
            return {
                bubbleDurationMs: gitDataFinite(payload.bubbleDurationMs, SPEECH_BUBBLE_DURATION_MS, 500, 20000),
                bubbleYOffsetCssPx: gitDataFinite(payload.bubbleYOffsetCssPx, SPEECH_BUBBLE_Y_OFFSET_CSS_PX, -200, 200),
                buckets: Object.freeze(buckets),
                interactionActions: Object.freeze(gitDataStringArray(triggers.interactionActions, SPEECH_INTERACTION_ACTIONS, 50, 80)),
                interactionChance: gitDataFinite(triggers.interactionChance, SPEECH_INTERACTION_CHANCE, 0, 1),
                interactionDelayMs: gitDataFinite(triggers.interactionDelayMs, SPEECH_INTERACTION_DELAY_MS, 0, 5000),
                idleChance: gitDataFinite(triggers.idleChance, SPEECH_IDLE_CHANCE, 0, 1),
            };
        }

        if (fileName === "moods.json") {
            const labels = Array.isArray(payload.labels)
                ? payload.labels.map(entry => ({
                    maxScore: gitDataFinite(entry?.maxScore, NaN, 0, 1000),
                    label: gitDataString(entry?.label, "", 80),
                })).filter(entry => Number.isFinite(entry.maxScore) && entry.label).sort((a, b) => a.maxScore - b.maxScore)
                : [];
            const deltas = gitDataPlainObject(payload.interactionDeltas) ? Object.create(null) : null;
            if (deltas) {
                for (const [key, value] of Object.entries(payload.interactionDeltas)) {
                    const amount = Number(value);
                    if (Number.isFinite(amount) && Math.abs(amount) <= 1000) deltas[key] = amount;
                }
            }
            if (!labels.length || !deltas || !Object.keys(deltas).length) return null;
            const min = gitDataFinite(payload.minimumScore, MOOD_MIN_SCORE, -1000, 1000);
            const max = gitDataFinite(payload.maximumScore, MOOD_MAX_SCORE, min, 2000);
            return {
                defaultScore: gitDataFinite(payload.defaultScore, MOOD_DEFAULT_SCORE, min, max),
                minimumScore: min,
                maximumScore: max,
                driftTarget: gitDataFinite(payload.driftTarget, MOOD_DRIFT_TARGET, min, max),
                driftStep: gitDataFinite(payload.driftStep, MOOD_DRIFT_STEP, 1, 100),
                driftEveryMs: gitDataFinite(payload.driftEveryMinutes, MOOD_DRIFT_EVERY_MS / 60000, 1, 10080) * 60000,
                labels: Object.freeze(labels.map(Object.freeze)),
                deltas: Object.freeze(deltas),
            };
        }

        if (fileName === "achievements.json") {
            if (!Array.isArray(payload.achievements)) return null;
            const definitions = [];
            for (const entry of payload.achievements.slice(0, 100)) {
                if (!gitDataPlainObject(entry) || !gitDataPlainObject(entry.condition)) continue;
                const id = gitDataString(entry.id, "", 80);
                const name = gitDataString(entry.name, "", 120);
                const description = gitDataString(entry.description, "", 500);
                const metric = gitDataString(entry.condition.metric, "", 120);
                const operator = gitDataString(entry.condition.operator, "", 4);
                const value = Number(entry.condition.value);
                if (!id || !name || !description || !metric || ![">=", "<=", ">", "<", "==", "="].includes(operator) || !Number.isFinite(value)) continue;
                const condition = Object.freeze({ metric, operator, value });
                definitions.push(Object.freeze({ id, name, description, condition, test: stats => achievementConditionPasses(stats, condition) }));
            }
            if (!definitions.length) return null;
            return {
                affectionActionKeys: Object.freeze(gitDataStringArray(payload.affectionActionKeys, AFFECTION_ACTION_KEYS, 80, 80)),
                achievements: Object.freeze(definitions),
            };
        }

        if (fileName === "battle.json") {
            if (!Array.isArray(payload.moves)) return null;
            const moves = [];
            for (const entry of payload.moves.slice(0, 40)) {
                const name = gitDataString(entry?.name, "", 120);
                const min = Number(entry?.min), max = Number(entry?.max);
                if (!name || !Number.isFinite(min) || !Number.isFinite(max) || max < min || Math.abs(min) > 10000 || Math.abs(max) > 10000) continue;
                moves.push(Object.freeze({ name, min, max }));
            }
            if (!moves.length) return null;
            return {
                rounds: Math.round(gitDataFinite(payload.rounds, BATTLE_ROUNDS, 1, 10)),
                resultDelayMs: gitDataFinite(payload.resultDelayMs, BATTLE_RESULT_DELAY_MS, 0, 10000),
                moves: Object.freeze(moves),
            };
        }

        if (fileName === "commands.json") {
            if (!Array.isArray(payload.groups)) return null;
            const groups = [];
            for (const group of payload.groups.slice(0, 30)) {
                const title = gitDataString(group?.title, "", 120);
                if (!title || !Array.isArray(group?.commands)) continue;
                const commands = [];
                for (const entry of group.commands.slice(0, 100)) {
                    const command = gitDataString(entry?.command, "", 180);
                    const description = gitDataString(entry?.description, "", 600);
                    if (!command.startsWith("/") || !description) continue;
                    commands.push(Object.freeze({ command, description }));
                }
                if (commands.length) groups.push(Object.freeze({ title, commands: Object.freeze(commands) }));
            }
            return groups.length ? { groups: Object.freeze(groups) } : null;
        }

        if (fileName === "poses.json") {
            if (!Array.isArray(payload.snapPoints)) return null;
            const points = [];
            for (const entry of payload.snapPoints.slice(0, 50)) {
                const name = gitDataString(entry?.name, "", 100);
                const x = Number(entry?.TranslationX), y = Number(entry?.TranslationY);
                if (!name || !Number.isFinite(x) || !Number.isFinite(y)) continue;
                points.push(Object.freeze({ name, TranslationX: x, TranslationY: y }));
            }
            if (!points.length) return null;
            const temporary = gitDataPlainObject(payload.temporaryPoses) ? payload.temporaryPoses : {};
            const normalizePose = (entry, fallbackDuration, fallbackTransform) => {
                if (!gitDataPlainObject(entry)) return { durationMs: fallbackDuration, transform: fallbackTransform };
                return {
                    durationMs: gitDataFinite(entry.durationMs, fallbackDuration, 250, 60000),
                    transform: Object.freeze({
                        TranslationX: gitDataFinite(entry.TranslationX, fallbackTransform.TranslationX, -1000, 1000),
                        TranslationY: gitDataFinite(entry.TranslationY, fallbackTransform.TranslationY, -1000, 1000),
                        Rotation: gitDataFinite(entry.Rotation, fallbackTransform.Rotation, -360, 360),
                    }),
                };
            };
            return {
                snapRadius: gitDataFinite(payload.snapRadius, DRAG_SNAP_RADIUS, 1, 500),
                snapPoints: Object.freeze(points),
                balanceHead: normalizePose(temporary.balanceHead, BALANCE_HEAD_DURATION_MS, BALANCE_HEAD_TRANSFORM),
                hideBehind: normalizePose(temporary.hideBehindFace, HIDE_BEHIND_DURATION_MS, HIDE_BEHIND_FACE_TRANSFORM),
            };
        }

        if (fileName === "defaults.json") {
            if (!gitDataPlainObject(payload.featureDefaults)) return null;
            const current = FEATURE_DEFAULTS;
            const next = {};
            for (const key of Object.keys(current)) {
                next[key] = Object.prototype.hasOwnProperty.call(payload.featureDefaults, key)
                    ? !!payload.featureDefaults[key]
                    : !!current[key];
            }
            return { featureDefaults: Object.freeze(next) };
        }

        if (fileName === "idle.json") {
            if (!Array.isArray(payload.frames)) return null;
            const frames = [];
            for (const entry of payload.frames.slice(0, 30)) {
                const delayMs = Number(entry?.delayMs), deltaY = Number(entry?.deltaY), rotationMultiplier = Number(entry?.rotationMultiplier);
                if (!Number.isFinite(delayMs) || !Number.isFinite(deltaY) || !Number.isFinite(rotationMultiplier)) continue;
                frames.push(Object.freeze({
                    delayMs: Math.max(0, Math.min(10000, delayMs)),
                    deltaY: Math.max(-100, Math.min(100, deltaY)),
                    rotationMultiplier: Math.max(-50, Math.min(50, rotationMultiplier)),
                    restore: !!entry?.restore,
                }));
            }
            if (!frames.length || !frames.some(frame => frame.restore)) return null;
            return {
                minDelayMs: gitDataFinite(payload.minDelayMs, IDLE_MIN_DELAY_MS, 1000, 600000),
                maxDelayMs: gitDataFinite(payload.maxDelayMs, IDLE_MAX_DELAY_MS, 1000, 600000),
                frames: Object.freeze(frames.sort((a, b) => a.delayMs - b.delayMs)),
                speechChanceAfterAnimation: gitDataFinite(payload.speechChanceAfterAnimation, SPEECH_IDLE_CHANCE, 0, 1),
            };
        }

        if (fileName === "protect.json") {
            const keywords = gitDataStringArray(payload.keywords, PROTECT_KEYWORDS, 100, 40).map(value => value.toLowerCase());
            const verbs = gitDataStringArray(payload.renderVerbs, keywords, 100, 40).map(value => value.toLowerCase());
            const jealous = gitDataStringArray(payload.jealousActivityKeywords, JEALOUS_ACTIVITY_KEYWORDS, 100, 40).map(value => value.toLowerCase());
            const transform = gitDataPlainObject(payload.transform) ? Object.freeze({
                TranslationX: gitDataFinite(payload.transform.TranslationX, PROTECT_TRANSFORM.TranslationX, -1000, 1000),
                TranslationY: gitDataFinite(payload.transform.TranslationY, PROTECT_TRANSFORM.TranslationY, -1000, 1000),
                Rotation: gitDataFinite(payload.transform.Rotation, PROTECT_TRANSFORM.Rotation, -360, 360),
            }) : PROTECT_TRANSFORM;
            return {
                durationMs: gitDataFinite(payload.durationMs, PROTECT_DURATION_MS, 250, 60000),
                transform,
                keywords: Object.freeze(keywords),
                renderVerbs: Object.freeze(verbs),
                jealousKeywords: Object.freeze(jealous),
            };
        }

        if (fileName === "relationships.json") {
            if (!Array.isArray(payload.levels)) return null;
            const levels = payload.levels
                .slice(0, 20)
                .map(entry => ({
                    name: gitDataString(entry?.name, "", 80),
                    minInteractions: Math.max(0, Math.floor(gitDataFinite(entry?.minInteractions, NaN, 0, 1000000))),
                }))
                .filter(entry => entry.name && Number.isFinite(entry.minInteractions))
                .sort((a, b) => a.minInteractions - b.minInteractions);
            if (!levels.length || levels[0].minInteractions !== 0) return null;
            const speechLines = Object.create(null);
            if (gitDataPlainObject(payload.speechLines)) {
                for (const level of levels) {
                    const lines = gitDataStringArray(payload.speechLines[level.name], [], 40, 120);
                    if (lines.length) speechLines[level.name] = Object.freeze(lines);
                }
            }
            return {
                sleepyAfterMs: gitDataFinite(payload.sleepyAfterMinutes, SLEEPY_AFTER_MS / 60000, 1, 10080) * 60000,
                levels: Object.freeze(levels.map(Object.freeze)),
                speechLines: Object.freeze(speechLines),
            };
        }

        return null;
    }

    function applyNormalizedGitDataFile(fileName, normalized) {
        if (!normalized) return false;
        if (fileName === "lore.json") PLUSH_LORE = normalized.lore;
        else if (fileName === "speech.json") {
            SPEECH_BUBBLE_DURATION_MS = normalized.bubbleDurationMs;
            SPEECH_BUBBLE_Y_OFFSET_CSS_PX = normalized.bubbleYOffsetCssPx;
            PLUSH_SPEECH = normalized.buckets;
            SPEECH_INTERACTION_ACTIONS = normalized.interactionActions;
            SPEECH_INTERACTION_CHANCE = normalized.interactionChance;
            SPEECH_INTERACTION_DELAY_MS = normalized.interactionDelayMs;
            SPEECH_IDLE_CHANCE = normalized.idleChance;
        } else if (fileName === "moods.json") {
            MOOD_DEFAULT_SCORE = normalized.defaultScore;
            MOOD_MIN_SCORE = normalized.minimumScore;
            MOOD_MAX_SCORE = normalized.maximumScore;
            MOOD_DRIFT_TARGET = 29;
            MOOD_DRIFT_STEP = 1;
            MOOD_DRIFT_EVERY_MS = 15 * 60 * 1000;
            MOOD_LABELS = normalized.labels;
            MOOD_DELTAS = normalized.deltas;
        } else if (fileName === "achievements.json") {
            AFFECTION_ACTION_KEYS = normalized.affectionActionKeys;
            ACHIEVEMENTS = ensureRequiredAchievements(normalized.achievements);
        } else if (fileName === "battle.json") {
            BATTLE_ROUNDS = normalized.rounds;
            BATTLE_RESULT_DELAY_MS = normalized.resultDelayMs;
            BATTLE_MOVES = normalized.moves;
        } else if (fileName === "commands.json") {
            EXTENSIONS_COMMAND_GROUPS = normalized.groups;
            plushieCommandAutocompleteCache = null;
        } else if (fileName === "poses.json") {
            DRAG_SNAP_RADIUS = normalized.snapRadius;
            PLUSH_SNAP_POINTS = normalized.snapPoints;
            BALANCE_HEAD_DURATION_MS = normalized.balanceHead.durationMs;
            BALANCE_HEAD_TRANSFORM = normalized.balanceHead.transform;
            HIDE_BEHIND_DURATION_MS = normalized.hideBehind.durationMs;
            HIDE_BEHIND_FACE_TRANSFORM = normalized.hideBehind.transform;
        } else if (fileName === "defaults.json") {
            FEATURE_DEFAULTS = normalized.featureDefaults;
        } else if (fileName === "idle.json") {
            IDLE_MIN_DELAY_MS = Math.min(normalized.minDelayMs, normalized.maxDelayMs);
            IDLE_MAX_DELAY_MS = Math.max(normalized.minDelayMs, normalized.maxDelayMs);
            IDLE_ANIMATION_FRAMES = normalized.frames;
        } else if (fileName === "protect.json") {
            PROTECT_DURATION_MS = normalized.durationMs;
            PROTECT_TRANSFORM = normalized.transform;
            PROTECT_KEYWORDS = normalized.keywords;
            JEALOUS_ACTIVITY_KEYWORDS = normalized.jealousKeywords;
            rebuildProtectRenderRegex(normalized.renderVerbs);
        } else if (fileName === "relationships.json") {
            RELATIONSHIP_LEVELS = normalized.levels;
            RELATIONSHIP_SPEECH = normalized.speechLines;
            SLEEPY_AFTER_MS = normalized.sleepyAfterMs;
            refreshPlushStatusIcon();
        } else return false;
        return true;
    }

    function validateAndApplyGitDataFile(fileName, payload) {
        const normalized = normalizeGitDataFile(fileName, payload);
        return normalized ? applyNormalizedGitDataFile(fileName, normalized) : false;
    }

    function readGitDataCache() {
        try {
            const raw = window.localStorage?.getItem(GIT_DATA_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return gitDataPlainObject(parsed) && Number(parsed.schemaVersion) === GIT_DATA_SCHEMA_VERSION ? parsed : null;
        } catch (_) {
            return null;
        }
    }

    function writeGitDataCache(cache) {
        try {
            window.localStorage?.setItem(GIT_DATA_CACHE_KEY, JSON.stringify(cache));
            return true;
        } catch (_) {
            return false;
        }
    }

    function loadCachedGitData() {
        const cache = readGitDataCache();
        if (!cache || !gitDataPlainObject(cache.files)) return false;
        const loaded = [];
        for (const fileName of GIT_DATA_FILES) {
            if (validateAndApplyGitDataFile(fileName, cache.files[fileName])) loaded.push(fileName);
        }
        if (!loaded.length) return false;
        gitDataState = {
            ...gitDataState,
            source: "cache",
            loadedFiles: loaded,
            cachedAt: Number(cache.savedAt) || null,
            indexPluginVersion: typeof cache.indexPluginVersion === "string" ? cache.indexPluginVersion : null,
            lastError: null,
        };
        log(`Loaded ${loaded.length} validated Git data file${loaded.length === 1 ? "" : "s"} from local cache.`);
        return true;
    }

    function gitDataPathFromIndex(index, fileName) {
        const candidate = index?.files?.[fileName]?.path;
        const path = typeof candidate === "string" && candidate.trim() ? candidate.trim() : `data/${fileName}`;
        if (!/^data\/[A-Za-z0-9._/-]+\.json$/.test(path) || path.includes("..")) return null;
        return path;
    }

    async function fetchGitDataJson(url, timeoutMs = 8000) {
        const text = await fetchTextWithTimeout(url, timeoutMs);
        return JSON.parse(text);
    }

    function gitDataStatusText() {
        const count = gitDataState.loadedFiles?.length || 0;
        if (gitDataState.source === "github") return `GitHub live (${count}/${GIT_DATA_FILES.length} files)`;
        if (gitDataState.source === "cache") return `Cached Git data (${count}/${GIT_DATA_FILES.length} files)`;
        return "Built-in fallback";
    }

    async function refreshGitDataFromGitHub({ force = false, silent = true } = {}) {
        if (gitDataRefreshPromise) return gitDataRefreshPromise;
        if (!force) {
            let lastCheck = 0;
            try { lastCheck = Number(window.localStorage?.getItem(GIT_DATA_LAST_CHECK_KEY)) || 0; } catch (_) {}
            if (Date.now() - lastCheck < GIT_DATA_REFRESH_INTERVAL_MS && gitDataState.loadedFiles.length) return { ...gitDataState };
        }

        gitDataRefreshPromise = (async () => {
            try {
                const stamp = Date.now();
                const index = await fetchGitDataJson(`${DATA_INDEX_URL}?t=${stamp}`);
                if (!gitDataPlainObject(index) || Number(index.schemaVersion) !== GIT_DATA_SCHEMA_VERSION || !gitDataPlainObject(index.files)) {
                    throw new Error("Unsupported or invalid data/index.json schema.");
                }

                const previous = readGitDataCache();
                const cachedFiles = gitDataPlainObject(previous?.files) ? { ...previous.files } : {};
                const loaded = [];
                const failures = [];

                const results = await Promise.allSettled(GIT_DATA_FILES.map(async fileName => {
                    const path = gitDataPathFromIndex(index, fileName);
                    if (!path) throw new Error(`${fileName}: invalid path in data/index.json`);
                    const payload = await fetchGitDataJson(`${REPOSITORY_RAW_ROOT}/${path}?t=${stamp}`);
                    return { fileName, payload };
                }));

                const fetched = new Map();
                for (const result of results) {
                    if (result.status === "fulfilled") fetched.set(result.value.fileName, result.value.payload);
                    else failures.push(String(result.reason || "unknown failure"));
                }

                for (const fileName of GIT_DATA_FILES) {
                    if (!fetched.has(fileName)) continue;
                    const payload = fetched.get(fileName);
                    if (!validateAndApplyGitDataFile(fileName, payload)) {
                        failures.push(`${fileName}: validation failed`);
                        continue;
                    }
                    loaded.push(fileName);
                    cachedFiles[fileName] = payload;
                }

                if (!loaded.length) throw new Error(failures[0] || "No Git data files could be loaded.");

                const savedAt = Date.now();
                writeGitDataCache({
                    schemaVersion: GIT_DATA_SCHEMA_VERSION,
                    savedAt,
                    indexPluginVersion: typeof index.pluginVersion === "string" ? index.pluginVersion : null,
                    files: cachedFiles,
                });
                try { window.localStorage?.setItem(GIT_DATA_LAST_CHECK_KEY, String(savedAt)); } catch (_) {}

                gitDataState = {
                    source: "github",
                    loadedFiles: [...new Set([...(gitDataState.loadedFiles || []), ...loaded])],
                    cachedAt: savedAt,
                    refreshedAt: savedAt,
                    indexPluginVersion: typeof index.pluginVersion === "string" ? index.pluginVersion : null,
                    lastError: failures.length ? `${failures.length} file(s) kept their cached/fallback copy.` : null,
                };

                if (featureSettingsState == null) {
                }
                if (speechBubbleElement) positionSpeechBubble();
                if (extensionsPanelElement?.isConnected) renderExtensionsPanel();
                log(`Refreshed ${loaded.length}/${GIT_DATA_FILES.length} validated Git data files.`, failures.length ? failures : "");
                if (!silent) appendLocalInfoBox("Git data", [gitDataStatusText(), failures.length ? `${failures.length} file(s) used cache/fallback.` : "All supported data files validated."]);
                return { ...gitDataState };
            } catch (e) {
                gitDataState = { ...gitDataState, lastError: String(e) };
                try { window.localStorage?.setItem(GIT_DATA_LAST_CHECK_KEY, String(Date.now())); } catch (_) {}
                warn("Git data refresh failed; keeping validated cache/built-in fallbacks:", e);
                if (!silent) appendLocalInfoBox("Git data", ["Refresh failed; the plugin kept its last-known-good cache/built-in fallbacks.", String(e)]);
                return { ...gitDataState };
            } finally {
                gitDataRefreshPromise = null;
            }
        })();
        return gitDataRefreshPromise;
    }

    function showGitDataStatus() {
        const refreshed = gitDataState.refreshedAt ? new Date(gitDataState.refreshedAt).toLocaleString() : "Not this session";
        const cached = gitDataState.cachedAt ? new Date(gitDataState.cachedAt).toLocaleString() : "None";
        appendLocalInfoBox("Git-backed data", [
            `Source: ${gitDataStatusText()}`,
            `Index plugin version: ${gitDataState.indexPluginVersion || "Unknown"}`,
            `Last live refresh: ${refreshed}`,
            `Last-known-good cache: ${cached}`,
            gitDataState.lastError ? `Note: ${gitDataState.lastError}` : "Validation: OK",
        ]);
        return { ...gitDataState };
    }

    function normalizeReleaseUrl(value) {
        try {
            const url = new URL(String(value || ""), UPDATE_REPOSITORY_PAGE);
            return url.protocol === "https:" ? url.href : UPDATE_REPOSITORY_PAGE;
        } catch (_) {
            return UPDATE_REPOSITORY_PAGE;
        }
    }

    async function resolveLatestAddonVersion() {
        try {
            const text = await fetchTextWithTimeout(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`);
            const manifest = JSON.parse(text);
            if (manifest && typeof manifest.version === "string") {
                return {
                    version: manifest.version,
                    downloadUrl: normalizeReleaseUrl(manifest.downloadUrl),
                    notes: typeof manifest.notes === "string" ? manifest.notes : "",
                    source: "version.json",
                };
            }
        } catch (_) {}

        try {
            const listingText = await fetchTextWithTimeout(`${UPDATE_REPOSITORY_API}?t=${Date.now()}`);
            const listing = JSON.parse(listingText);
            if (!Array.isArray(listing)) return null;
            const candidates = listing
                .filter(entry => typeof entry?.name === "string" && /subby.*plush.*(?:\.user\.js|\.js|\.txt)$/i.test(entry.name))
                .sort((a, b) => Number(/\.user\.js$/i.test(b.name)) - Number(/\.user\.js$/i.test(a.name)));
            for (const entry of candidates.slice(0, 5)) {
                if (typeof entry.download_url !== "string") continue;
                try {
                    const scriptText = await fetchTextWithTimeout(`${entry.download_url}?t=${Date.now()}`);
                    const version = versionFromScriptText(scriptText);
                    if (version) return { version, downloadUrl: normalizeReleaseUrl(entry.html_url || entry.download_url), notes: "", source: entry.name };
                } catch (_) {}
            }
        } catch (_) {}
        return null;
    }

    async function checkForUpdates({ silent = false } = {}) {
        if (updateCheckPromise) return updateCheckPromise;
        updateCheckPromise = (async () => {
            try {
                const latest = await resolveLatestAddonVersion();
                if (!latest) {
                    lastUpdateInfo = { ok: false, version: VERSION, at: new Date().toISOString(), reason: "No release metadata found." };
                    if (!silent) appendLocalInfoBox("Subby's Plushies updater", ["Could not find release metadata in the GitHub repository.", "Add a version.json file or publish the userscript in the repository root to enable update detection."]);
                    return lastUpdateInfo;
                }

                const comparison = compareVersions(latest.version, VERSION);
                lastUpdateInfo = { ok: true, current: VERSION, latest: latest.version, updateAvailable: comparison > 0, ...latest, at: new Date().toISOString() };
                if (comparison > 0) {
                    appendLocalInfoBox("Subby's Plushies update available", [
                        `Installed: v${VERSION} • Latest: v${latest.version}`,
                        latest.notes || "A newer build is available in the repository.",
                        "The updater only checks versions; it never executes downloaded code automatically.",
                    ]);
                } else if (!silent) {
                    appendLocalInfoBox("Subby's Plushies updater", [`v${VERSION} is up to date.`, `Release source: ${latest.source}`]);
                }
                return lastUpdateInfo;
            } catch (e) {
                lastUpdateInfo = { ok: false, version: VERSION, error: String(e), at: new Date().toISOString() };
                if (!silent) appendLocalInfoBox("Subby's Plushies updater", [`Update check failed: ${String(e)}`]);
                return lastUpdateInfo;
            } finally {
                try { window.localStorage?.setItem(UPDATE_CHECK_STORAGE_KEY, String(Date.now())); } catch (_) {}
                updateCheckPromise = null;
            }
        })();
        return updateCheckPromise;
    }

    function scheduleAutomaticUpdateCheck() {
        if (!getFeatureSettings().autoUpdateChecks) return;
        let previous = 0;
        try { previous = Number(window.localStorage?.getItem(UPDATE_CHECK_STORAGE_KEY)) || 0; } catch (_) {}
        if (Date.now() - previous < UPDATE_CHECK_INTERVAL_MS) return;
        window.setTimeout(() => {
            if (getFeatureSettings().autoUpdateChecks) void checkForUpdates({ silent: true });
        }, 5000);
    }

    async function openLatestUpdatePage() {
        const info = lastUpdateInfo?.ok ? lastUpdateInfo : await checkForUpdates({ silent: false });
        const url = normalizeReleaseUrl(info?.downloadUrl);
        try {
            window.open(url, "_blank", "noopener,noreferrer");
            return url;
        } catch (_) {
            return null;
        }
    }

    function roomAdminMembers() {
        const admins = window.ChatRoomData?.Admin;
        return Array.isArray(admins)
            ? admins.map(Number).filter(Number.isFinite)
            : [];
    }

    function isRoomAdminMember(memberNumber) {
        const member = Number(memberNumber);
        if (!Number.isFinite(member)) return false;
        return roomAdminMembers().includes(member);
    }

    function canSetRoomMascot() {
        try {
            if (typeof window.ChatRoomPlayerIsAdmin === "function" && window.ChatRoomPlayerIsAdmin()) return true;
        } catch (_) {}
        return isRoomAdminMember(window.Player?.MemberNumber);
    }

    function currentRoomMascotCacheKey() {
        const data = window.ChatRoomData;
        const name = String(data?.Name || "").trim();
        if (!name) return null;
        const space = String(data?.Space || "MainHall").trim() || "MainHall";
        return `${space}::${name}`;
    }

    function getRoomMascotCache() {
        if (roomMascotCacheState) return roomMascotCacheState;
        const stored = readLocalJSON(ROOM_MASCOT_CACHE_STORAGE_KEY, {});
        roomMascotCacheState = stored && typeof stored === "object" ? stored : {};
        return roomMascotCacheState;
    }

    function cacheRoomMascotState(state) {
        const key = currentRoomMascotCacheKey();
        if (!key) return false;
        const cache = getRoomMascotCache();
        if (state?.name) cache[key] = cloneBackupValue(state);
        else delete cache[key];
        writeLocalJSON(ROOM_MASCOT_CACHE_STORAGE_KEY, cache);
        return true;
    }

    function roomMascotFromSharedRoomData() {
        const raw = window.ChatRoomData?.Custom?.[ROOM_MASCOT_CUSTOM_KEY];
        if (!raw) return null;
        const name = typeof raw === "string" ? raw : raw?.name;
        if (typeof name !== "string" || !name.trim()) return null;
        const known = PLUSH_NAMES.find(entry => String(entry || "").toLowerCase() === name.trim().toLowerCase());
        if (!known) return null;
        const member = Number(raw?.memberNumber);
        return {
            name: known,
            setBy: typeof raw?.setBy === "string" && raw.setBy.trim() ? raw.setBy.trim() : "room admin",
            memberNumber: Number.isFinite(member) ? member : null,
            at: typeof raw?.at === "string" ? raw.at : null,
            shared: true,
        };
    }

    function recoverRoomMascotState({ allowCache = true } = {}) {
        const roomLoaded = !!String(window.ChatRoomData?.Name || "").trim();
        const shared = roomMascotFromSharedRoomData();
        if (shared) {
            roomMascotState = shared;
            cacheRoomMascotState(shared);
            refreshRoomMascotOverlay();
            return { source: "room", state: { ...shared } };
        }

        if (roomLoaded) {
            cacheRoomMascotState(null);
            roomMascotState = null;
            removeRoomMascotOverlay();
            return { source: "room-none", state: null };
        }

        const key = currentRoomMascotCacheKey();
        const cached = allowCache && key ? getRoomMascotCache()?.[key] : null;
        if (cached?.name && mascotRenderIndex(cached.name) >= 0) {
            roomMascotState = { ...cached, cached: true };
            refreshRoomMascotOverlay();
            return { source: "cache", state: { ...roomMascotState } };
        }

        roomMascotState = null;
        removeRoomMascotOverlay();
        return { source: "none", state: null };
    }

    function buildRoomUpdatePayloadWithCustom(custom) {
        const data = window.ChatRoomData;
        if (!data || typeof data !== "object") return null;

        const room = {};
        const keys = [
            "Name", "Description", "Background", "Limit", "Admin", "Ban", "Private", "Locked",
            "Language", "BlockCategory", "Visibility", "Access", "Space", "Game", "Custom",
        ];
        for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(data, key) || data[key] === undefined) continue;
            room[key] = cloneTransferValue(data[key]);
        }
        room.Custom = custom && Object.keys(custom).length ? custom : undefined;
        return room;
    }

    function publishRoomMascotSharedState(state) {
        if (!canSetRoomMascot() || typeof window.ServerSend !== "function" || !window.ChatRoomData) return false;
        const currentCustom = window.ChatRoomData.Custom && typeof window.ChatRoomData.Custom === "object"
            ? cloneBackupValue(window.ChatRoomData.Custom)
            : {};
        if (state?.name) {
            currentCustom[ROOM_MASCOT_CUSTOM_KEY] = {
                name: state.name,
                setBy: state.setBy || getCharacterDisplayName(window.Player) || "room admin",
                memberNumber: Number(window.Player?.MemberNumber) || null,
                at: state.at || new Date().toISOString(),
            };
        } else {
            delete currentCustom[ROOM_MASCOT_CUSTOM_KEY];
        }

        const room = buildRoomUpdatePayloadWithCustom(currentCustom);
        if (!room) return false;

        window.ChatRoomData.Custom = Object.keys(currentCustom).length ? currentCustom : undefined;
        lastRoomMascotSharedSyncAt = Date.now();
        try {
            window.ServerSend("ChatRoomAdmin", {
                MemberNumber: window.Player?.ID,
                Room: room,
                Action: "Update",
            });
            return true;
        } catch (e) {
            warn("Could not persist the room mascot in shared room data:", e);
            return false;
        }
    }

    function mascotRenderIndex(name) {
        const wanted = String(name || "").trim().toLowerCase();
        if (!wanted) return -1;
        return PLUSH_NAMES.findIndex(entry => String(entry || "").trim().toLowerCase() === wanted);
    }

    function removeRoomMascotOverlay() {
        try { roomMascotOverlay?.remove?.(); } catch (_) {}
        roomMascotOverlay = null;
        roomMascotOverlayImage = null;
        roomMascotOverlayLabel = null;
    }

    function roomMascotShouldYieldToMenus() {
        if (nativeLayeringVisible()) return true;
        if (window.DialogFocusItem) return true;
        return false;
    }

    function scheduleRoomMascotUiRefresh() {
        window.setTimeout(() => {
            refreshRoomMascotOverlay();
            refreshDragToggleButton();
        }, 0);
    }

    function installRoomMascotUiSafety() {
        if (mascotUiHooksInstalled) return true;
        mascotUiHooksInstalled = true;

        document.addEventListener("pointerdown", event => {
            if (roomMascotOverlay && roomMascotOverlay.contains?.(event.target)) return;
            scheduleRoomMascotUiRefresh();
        }, true);

        document.addEventListener("keydown", event => {
            if (["Escape", "Enter", " "].includes(event.key)) scheduleRoomMascotUiRefresh();
        }, true);

        window.addEventListener("resize", scheduleRoomMascotUiRefresh, { passive: true });

        if (roomMascotUiSafetyTimer == null) {
            roomMascotUiSafetyTimer = window.setInterval(() => {
                if (roomMascotState?.name || roomMascotOverlay?.isConnected) refreshRoomMascotOverlay();
            }, performanceInterval(2500, 8000));
        }
        return true;
    }

    function refreshRoomMascotOverlay() {
        const settings = getFeatureSettings();
        const inRoom = window.CurrentScreen === "ChatRoom";
        if (!settings.showRoomMascot || !inRoom || !roomMascotState?.name) {
            removeRoomMascotOverlay();
            return false;
        }

        if (roomMascotShouldYieldToMenus()) {
            if (roomMascotOverlay?.isConnected) roomMascotOverlay.style.display = "none";
            return false;
        }

        const chatRoot = getOfferChatRoot();
        if (!chatRoot?.isConnected) {
            removeRoomMascotOverlay();
            return false;
        }

        let chatRect = null;
        try { chatRect = chatRoot.getBoundingClientRect?.() || null; } catch (_) {}
        if (!chatRect || chatRect.width <= 0 || chatRect.height <= 0) {
            removeRoomMascotOverlay();
            return false;
        }

        if (roomMascotOverlay?.isConnected && roomMascotOverlay.parentElement !== document.body) {
            removeRoomMascotOverlay();
        }

        if (!roomMascotOverlay?.isConnected) {
            const root = document.createElement("div");
            root.className = "SubbysPlushiesRoomMascot";
            Object.assign(root.style, {
                position: "fixed",
                zIndex: "2147483000",
                width: "72px",
                boxSizing: "border-box",
                padding: "6px",
                border: "1px solid currentColor",
                borderRadius: "8px",
                background: "rgba(20, 20, 20, 0.72)",
                color: "white",
                textAlign: "center",
                font: "10px sans-serif",
                lineHeight: "1.2",
                userSelect: "none",
                cursor: "pointer",
                pointerEvents: "auto",
            });
            root.title = "Room mascot — click for info. Visibility can be changed in Plush Settings.";

            const image = document.createElement("img");
            image.alt = "Room mascot plushie";
            Object.assign(image.style, {
                display: "block",
                width: "60px",
                height: "60px",
                objectFit: "contain",
                margin: "0 auto 4px",
                pointerEvents: "none",
            });

            const label = document.createElement("div");
            Object.assign(label.style, {
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px",
            });

            root.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                showRoomMascot();
            });
            root.append(image, label);
            document.body.appendChild(root);
            roomMascotOverlay = root;
            roomMascotOverlayImage = image;
            roomMascotOverlayLabel = label;
        }

        if (roomMascotOverlay) {
            const overlayWidth = 72;
            const left = Math.max(0, Math.round(chatRect.right - overlayWidth - 8));
            const top = Math.max(0, Math.round(chatRect.top + 28));
            roomMascotOverlay.style.left = `${left}px`;
            roomMascotOverlay.style.top = `${top}px`;
            roomMascotOverlay.style.right = "auto";
            roomMascotOverlay.style.display = "block";
        }

        const index = mascotRenderIndex(roomMascotState.name);
        const imageSource = index >= 0
            ? (renderImages[index] || PLUSH_IMAGES[index] || PLUSH_FALLBACK_IMAGE)
            : (renderImages[0] || PLUSH_FALLBACK_IMAGE);
        if (roomMascotOverlayImage && roomMascotOverlayImage.src !== imageSource) {
            roomMascotOverlayImage.src = imageSource;
        }
        if (roomMascotOverlayLabel) {
            roomMascotOverlayLabel.innerHTML = "";
            const titleLine = document.createElement("div");
            titleLine.textContent = "Room Mascot";
            Object.assign(titleLine.style, {
                fontWeight: "bold",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
            });
            const nameLine = document.createElement("div");
            nameLine.textContent = roomMascotState.name;
            Object.assign(nameLine.style, {
                whiteSpace: "nowrap",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
            });
            roomMascotOverlayLabel.append(titleLine, nameLine);
        }
        return true;
    }

    function setRoomMascotOverlayVisible(visible) {
        const enabled = setFeatureSetting("showRoomMascot", !!visible);
        if (enabled) refreshRoomMascotOverlay();
        else removeRoomMascotOverlay();
        appendLocalInfoBox("Room mascot", [enabled
            ? "Room mascot picture is visible locally."
            : "Room mascot picture is hidden locally. Use /plushiemascot show to restore it."]);
        return enabled;
    }

    function setCurrentPlushAsRoomMascot() {
        if (!isOurs(getHeld(window.Player))) {
            appendLocalInfoBox("Room mascot", ["Equip a Subby's Plushies plushie first."]);
            return false;
        }
        if (!canSetRoomMascot()) {
            appendLocalInfoBox("Room mascot", ["Only a verified room admin can set the shared mascot."]);
            return false;
        }
        const name = currentPlushName();
        const source = getCharacterDisplayName(window.Player) || "Someone";
        roomMascotState = { name, setBy: source, memberNumber: Number(window.Player?.MemberNumber) || null, at: new Date().toISOString(), shared: true };
        cacheRoomMascotState(roomMascotState);
        const persisted = publishRoomMascotSharedState(roomMascotState);
        refreshRoomMascotOverlay();
        sendStandaloneActionMessage(`${source} sets ${name} as the room mascot plushie.`);
        if (!persisted) appendLocalInfoBox("Room mascot", ["Mascot was set locally, but the shared room-state update could not be sent."]);
        adjustCurrentPlushMood(3, "room mascot");
        recordStat("mascot", 1, { plushName: name });
        return true;
    }

    function clearRoomMascot() {
        if (!canSetRoomMascot()) {
            appendLocalInfoBox("Room mascot", ["Only a verified room admin can clear the shared mascot."]);
            return false;
        }
        const source = getCharacterDisplayName(window.Player) || "Someone";
        roomMascotState = null;
        cacheRoomMascotState(null);
        const persisted = publishRoomMascotSharedState(null);
        removeRoomMascotOverlay();
        sendStandaloneActionMessage(`${source} clears the room mascot plushie.`);
        if (!persisted) appendLocalInfoBox("Room mascot", ["Mascot was cleared locally, but the shared room-state update could not be sent."]);
        return true;
    }

    function processRoomMascotAction(data) {
        const text = getDictionaryText(data, "msg");
        if (typeof text !== "string") return false;

        const senderMember = Number(data?.Sender);
        if (!isRoomAdminMember(senderMember)) return false;

        const clear = text.match(ROOM_MASCOT_CLEAR_RE);
        if (clear) {
            roomMascotState = null;
            cacheRoomMascotState(null);
            removeRoomMascotOverlay();
            return true;
        }
        const set = text.match(ROOM_MASCOT_SET_RE);
        if (!set) return false;
        const renderedName = String(set[2] || "").trim();
        const known = PLUSH_NAMES.find(name => name.toLowerCase() === renderedName.toLowerCase()) || renderedName;
        roomMascotState = { name: known, setBy: String(set[1] || "Someone").trim(), memberNumber: senderMember, at: new Date().toISOString(), shared: true };
        cacheRoomMascotState(roomMascotState);
        refreshRoomMascotOverlay();
        return true;
    }

    function showRoomMascot() {
        if (!roomMascotState) {
            appendLocalInfoBox("Room mascot", ["No shared mascot is currently stored for this room."]);
            return null;
        }
        appendLocalInfoBox("Room mascot", [
            `${roomMascotState.name} • set by ${roomMascotState.setBy || "room admin"}${roomMascotState.cached ? " • cached" : ""}`,
            `Picture: ${getFeatureSettings().showRoomMascot ? "visible" : "hidden locally"}`,
        ]);
        return { ...roomMascotState };
    }

    function handleRoomMascotCommand(command) {
        const arg = String(command || "").split(/\s+/)[1] || "info";
        if (arg === "set") return setCurrentPlushAsRoomMascot();
        if (arg === "clear" || arg === "remove") return clearRoomMascot();
        if (arg === "hide") return setRoomMascotOverlayVisible(false);
        if (arg === "show" || arg === "unhide") return setRoomMascotOverlayVisible(true);
        return showRoomMascot();
    }

    function mainCanvasCoordinates(event) {
        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        if (!canvas || event?.target !== canvas) return null;
        const rect = canvas.getBoundingClientRect?.();
        if (!rect || rect.width <= 0 || rect.height <= 0) return null;
        const width = Number(canvas.width) || 2000;
        const height = Number(canvas.height) || 1000;
        return {
            canvas,
            x: (event.clientX - rect.left) * width / rect.width,
            y: (event.clientY - rect.top) * height / rect.height,
        };
    }

    function currentPlushCanvasBounds(item) {
        const transform = readActivePlushLayerTransform(item);
        if (!transform) return null;

        const scaleX = Math.max(0.05, Math.abs(Number(transform.ScaleX) || 1));
        const scaleY = Math.max(0.05, Math.abs(Number(transform.ScaleY) || 1));
        const width = PLUSH_RENDER.Width * scaleX;
        const height = PLUSH_RENDER.Height * scaleY;
        const centerX = PLUSH_RENDER.Left + PLUSH_RENDER.Width / 2 + transform.TranslationX;
        const centerY = PLUSH_RENDER.Top + PLUSH_RENDER.Height / 2 + transform.TranslationY;

        const radians = (Number(transform.Rotation) || 0) * Math.PI / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));
        const boundWidth = width * cos + height * sin;
        const boundHeight = width * sin + height * cos;
        const padding = 12;

        const visualLeft = centerX - boundWidth / 2;
        const visualRight = centerX + boundWidth / 2;
        const visualTop = centerY - boundHeight / 2;
        const visualBottom = centerY + boundHeight / 2;

        return {
            left: visualLeft - padding,
            right: visualRight + padding,
            top: visualTop - padding,
            bottom: visualBottom + padding,
            visualLeft,
            visualRight,
            visualTop,
            visualBottom,
            centerX,
            centerY,
            transform,
        };
    }

    function nearestPlushSnap(transform) {
        let best = null;
        for (const snap of PLUSH_SNAP_POINTS) {
            const dx = transform.TranslationX - snap.TranslationX;
            const dy = transform.TranslationY - snap.TranslationY;
            const distance = Math.hypot(dx, dy);
            if (!best || distance < best.distance) best = { snap, distance };
        }
        return best && best.distance <= DRAG_SNAP_RADIUS ? best : null;
    }

    function snapCurrentPlushTo(name) {
        const wanted = String(name || "").trim().toLowerCase();
        if (!wanted) return false;
        const snap = PLUSH_SNAP_POINTS.find(point => point.name.toLowerCase() === wanted) ||
            PLUSH_SNAP_POINTS.find(point => point.name.toLowerCase().includes(wanted));
        if (!snap) {
            appendLocalInfoBox("Plush snap", [`Unknown snap point: ${name}`, `Available: ${PLUSH_SNAP_POINTS.map(point => point.name).join(", ")}`]);
            return false;
        }
        const item = getHeld(window.Player);
        const layerName = getActivePlushLayerName(item);
        if (!isOurs(item) || !layerName) return false;
        if (activeBalanceHeadSession) restoreActiveBalanceHead("manual snap");
        if (activeHideBehindSession) restoreActiveHideBehind("manual snap");
        if (activeProtectSession) restoreActiveProtect("manual snap");
        setPlushLayerTransform(item, layerName, { TranslationX: snap.TranslationX, TranslationY: snap.TranslationY });
        compactPlushLayerTransformsToActive(item, readActivePlushLayerTransform(item));
        rememberCharacterPlushState(window.Player, item);
        rebuildCharacterCanvas(window.Player, `snap ${snap.name}`);
        try { if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(window.Player); } catch (_) {}
        lastDragSnap = { name: snap.name, distance: 0, at: new Date().toISOString() };
        return true;
    }

    function applyDragFrame(point) {
        const session = dragSession;
        if (!session || !point) return;
        const current = getHeld(window.Player);
        if (!isOurs(current) || getActivePlushLayerName(current) !== session.layerName) return;
        const dx = point.x - session.startX;
        const dy = point.y - session.startY;
        setPlushLayerTransform(current, session.layerName, {
            TranslationX: session.base.TranslationX + dx,
            TranslationY: session.base.TranslationY + dy,
        });
        rebuildCharacterCanvas(window.Player, "direct plush drag");
        if (speechBubbleElement) positionSpeechBubble();
        session.lastPoint = point;
    }

    function finishDirectDrag(cancelled = false) {
        const session = dragSession;
        dragSession = null;
        if (dragFrameRequest != null) {
            cancelAnimationFrame(dragFrameRequest);
            dragFrameRequest = null;
        }
        if (!session) return false;

        const current = getHeld(window.Player);
        if (!isOurs(current) || getActivePlushLayerName(current) !== session.layerName) return false;
        if (cancelled) {
            setPlushLayerTransform(current, session.layerName, {
                TranslationX: session.base.TranslationX,
                TranslationY: session.base.TranslationY,
            });
        } else {
            const transform = readActivePlushLayerTransform(current);
            const nearest = transform ? nearestPlushSnap(transform) : null;
            if (nearest) {
                setPlushLayerTransform(current, session.layerName, {
                    TranslationX: nearest.snap.TranslationX,
                    TranslationY: nearest.snap.TranslationY,
                });
                lastDragSnap = { name: nearest.snap.name, distance: nearest.distance, at: new Date().toISOString() };
            } else {
                lastDragSnap = { name: null, at: new Date().toISOString() };
            }
        }

        compactPlushLayerTransformsToActive(current, readActivePlushLayerTransform(current));
        resetGenericNativeTransform(current);
        rememberCharacterPlushState(window.Player, current);
        rebuildCharacterCanvas(window.Player, cancelled ? "direct plush drag cancel" : "direct plush drag commit");
        if (!cancelled && typeof ChatRoomCharacterUpdate === "function") {
            try { ChatRoomCharacterUpdate(window.Player); } catch (_) {}
        }
        if (!cancelled) recordStat("drag", 1, { plushName: currentPlushName() });
        return true;
    }

    function removeDragToggleButton() {
        try { dragToggleButton?.remove?.(); } catch (_) {}
        dragToggleButton = null;
    }

    function refreshDragToggleButton() {
        const inRoom = window.CurrentScreen === "ChatRoom";
        const item = getHeld(window.Player);
        if (!inRoom || !isOurs(item) || nativeLayeringVisible()) {
            removeDragToggleButton();
            return false;
        }

        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        const rect = canvas?.getBoundingClientRect?.();
        if (!canvas || !rect || rect.width <= 0 || rect.height <= 0) {
            removeDragToggleButton();
            return false;
        }

        if (!dragToggleButton?.isConnected) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "SubbysPlushiesDragToggle";
            Object.assign(button.style, {
                position: "fixed",
                zIndex: "2147482990",
                width: "28px",
                height: "28px",
                padding: "0",
                border: "1px solid rgba(255,255,255,0.72)",
                borderRadius: "9px",
                color: "white",
                font: "15px/1 sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                pointerEvents: "auto",
                boxShadow: "0 2px 6px rgba(0,0,0,0.30)",
            });
            button.addEventListener("pointerdown", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            });
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                setDragMode(!dragModeEnabled);
            });
            document.body.appendChild(button);
            dragToggleButton = button;
        }

        const buttonSize = 28;
        const logicalWidth = Number(canvas.width) || 2000;
        const characterFraction = Math.max(0.1, Math.min(0.9, 1000 / logicalWidth));
        const characterRight = rect.left + rect.width * characterFraction;
        const left = Math.max(rect.left + 2, characterRight - buttonSize - 3);
        const top = Math.max(rect.top + 2, rect.bottom - buttonSize - 3);
        dragToggleButton.style.left = `${Math.round(left)}px`;
        dragToggleButton.style.top = `${Math.round(top)}px`;
        dragToggleButton.textContent = "🖱️";
        dragToggleButton.setAttribute("aria-label", dragModeEnabled ? "Disable Easy Drag" : "Enable Easy Drag");
        dragToggleButton.title = dragModeEnabled
            ? "Easy Drag is ON — click to disable it."
            : "Easy Drag is OFF — click to enable it.";
        dragToggleButton.style.background = dragModeEnabled
            ? "rgba(72, 170, 105, 0.96)"
            : "rgba(28, 28, 32, 0.82)";
        dragToggleButton.style.opacity = dragModeEnabled ? "1" : "0.90";
        return true;
    }

    function installDragToggleUi() {
        refreshDragToggleButton();
        if (dragToggleUiTimer == null) {
            dragToggleUiTimer = window.setInterval(refreshDragToggleButton, performanceInterval(2500, 8000));
        }
        window.addEventListener("resize", refreshDragToggleButton, { passive: true });
        return true;
    }

    function setDragMode(enabled) {
        const next = !!enabled;
        if (next && !isOurs(getHeld(window.Player))) {
            dragModeEnabled = false;
            refreshDragToggleButton();
            return false;
        }
        dragModeEnabled = next;
        if (!dragModeEnabled && dragSession) finishDirectDrag(true);
        refreshDragToggleButton();
        return dragModeEnabled;
    }

    function toggleDragMode() {
        return setDragMode(!dragModeEnabled);
    }

    function installDirectDragHandlers() {
        if (dragHandlersInstalled) return true;
        dragHandlersInstalled = true;

        document.addEventListener("pointerdown", event => {
            if (!dragModeEnabled || event.button !== 0 || nativeLayeringVisible()) return;
            const point = mainCanvasCoordinates(event);
            if (!point || point.x >= 1000 || point.y < 0 || point.y > 1000) return;

            if (activeIdleAnimationSession) cancelIdleAnimation();
            if (activeBalanceHeadSession) restoreActiveBalanceHead("Easy Drag started");
            if (activeHideBehindSession) restoreActiveHideBehind("Easy Drag started");
            if (activeProtectSession) restoreActiveProtect("Easy Drag started");

            const item = getHeld(window.Player);
            if (!isOurs(item)) {
                setDragMode(false);
                return;
            }

            const layerName = getActivePlushLayerName(item);
            const base = readActivePlushLayerTransform(item);
            if (!layerName || !base) return;

            dragSession = {
                pointerId: event.pointerId,
                layerName,
                base: { ...base },
                startX: point.x,
                startY: point.y,
                lastPoint: point,
            };
            try { point.canvas.setPointerCapture?.(event.pointerId); } catch (_) {}
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }, true);

        document.addEventListener("pointermove", event => {
            if (!dragSession || event.pointerId !== dragSession.pointerId) return;
            const point = mainCanvasCoordinates(event);
            if (!point) return;
            dragSession.lastPoint = point;
            if (dragFrameRequest == null) {
                dragFrameRequest = requestAnimationFrame(() => {
                    dragFrameRequest = null;
                    if (dragSession?.lastPoint) applyDragFrame(dragSession.lastPoint);
                });
            }
            event.preventDefault();
        }, true);

        document.addEventListener("pointerup", event => {
            if (!dragSession || event.pointerId !== dragSession.pointerId) return;
            const point = mainCanvasCoordinates(event);
            if (point) applyDragFrame(point);
            finishDirectDrag(false);
            event.preventDefault();
        }, true);

        document.addEventListener("pointercancel", event => {
            if (!dragSession || event.pointerId !== dragSession.pointerId) return;
            finishDirectDrag(true);
        }, true);
        return true;
    }

    function extensionsPreferenceScreenActive() {
        if (String(window.CurrentScreen || "") !== "Preference") return false;
        const candidates = [
            window.PreferenceSubscreen?.name,
            window.PreferenceSubscreen?.Name,
            window.PreferenceSubscreen,
            window.PreferenceSubScreen,
            window.PreferenceCurrentSubscreen,
            window.PreferenceCurrentSubScreen,
        ];
        return candidates.some(value => String(value || "").toLowerCase() === "extensions");
    }

    function extensionsStatusSnapshot() {
        const held = getHeld(window.Player);
        const ours = isOurs(held);
        const mood = getPlushMoodRecord();
        const relationship = relationshipStatus();
        const settings = getFeatureSettings();
        const unlocked = Object.keys(getStatsStore().achievements || {}).length;
        return {
            version: VERSION,
            state: failed ? "FAILED" : (ready ? "Ready" : "Loading"),
            hookBackend,
            held: ours ? currentPlushName() : "Not holding a Subby's Plushies plushie",
            mood: `${moodLabel(mood.score)} (${mood.score}/100)`,
            relationship: `${relationship.level} (${relationship.interactions} interactions)`,
            sleepy: isPlushSleepy() ? "Sleeping" : "Awake",
            favorite: isFavoritePlush(currentPlushName()),
            protectMe: settings.protectMe,
            jealousPlushie: settings.jealousPlushie,
            easyDrag: dragModeEnabled,
            mascotPicture: settings.showRoomMascot,
            mascot: roomMascotState?.name || "None announced in this room",
            idleAnimations: settings.idleAnimations,
            speechBubbles: settings.speechBubbles,
            autoUpdateChecks: settings.autoUpdateChecks,
            performanceMode: settings.performanceMode,
            activities: `${hugTightlyActivityRegistration || "inactive"} / ${customActivitiesRegistration || "inactive"}`,
            offer: {
                transferStrategy: "LSCG-style recipient remove/wear plus dual CharacterUpdate; sender self-removal fallback",
                playerMember: Number.isFinite(Number(window.Player?.MemberNumber)) ? Number(window.Player.MemberNumber) : null,
                currentHeldAsset: getHeld(window.Player)?.Asset?.Name || null,
                currentHeldGroup: getHeld(window.Player)?.Asset?.Group?.Name || null,
                currentHeldIsPlushie: isOurs(getHeld(window.Player)),
                promptActive: !!offerPromptElement?.isConnected,
                promptToken: offerPromptElement?.getAttribute?.("data-subbys-plushies-offer") || null,
                pendingOutgoingOffers: [...pendingOutgoingPlushOffers.values()].map(entry => ({ ...entry })),
                pendingOutgoingRecipients: [...pendingOutgoingPlushOffers.keys()],
                signalsReceived: offerSignalsReceived,
                lastSignalReceived: lastOfferSignalReceived,
                receiveAttempts: offerTransferReceiveAttempts,
                received: offerTransfersReceived,
                receiveFailures: offerTransferReceiveFailures,
                senderRemovals: offerTransferSenderRemovals,
                senderRemovalFailures: offerTransferSenderRemovalFailures,
                lastReceived: lastOfferTransferReceived,
                lastFailure: lastOfferTransferFailure,
                lastSenderRemoval: lastOfferSenderRemoval,
                lastDecisionSeen: lastOfferDecisionSeen,
                hooks: {
                    chatRoomMessage: installedHooks.has("ChatRoomMessage"),
                    serverSend: installedHooks.has("ServerSend"),
                    activityRun: installedHooks.has("ActivityRun"),
                },
            },
            imageMapping: bcImagePathHookInstalled || (imageElementSrcHookInstalled ? "HTMLImageElement.src fallback" : "not installed"),
            achievements: `${unlocked}/${ACHIEVEMENTS.length}`,
            latestVersion: lastUpdateInfo?.ok
                ? (lastUpdateInfo.latest || lastUpdateInfo.version || "Unknown")
                : (lastUpdateInfo ? "Check failed" : "Not checked this session"),
            gitData: gitDataStatusText(),
            gitDataRefreshed: gitDataState.refreshedAt ? new Date(gitDataState.refreshedAt).toLocaleString() : "Not this session",
        };
    }

    function styleExtensionsButton(button, active = false, hovered = false) {
        const metrics = extensionsLayoutMetrics();
        Object.assign(button.style, {
            minHeight: `${metrics.buttonMinHeight}px`,
            padding: metrics.buttonPadding,
            border: `1px solid ${active || hovered ? getExtensionsStyle().accent : getExtensionsStyle().border}`,
            borderRadius: "8px",
            background: active ? getExtensionsStyle().selected : (hovered ? getExtensionsStyle().surfaceHover : getExtensionsStyle().surface),
            color: getExtensionsStyle().text,
            font: "inherit",
            fontSize: `${metrics.fontSize}px`,
            cursor: "pointer",
            boxShadow: active ? `inset 4px 0 0 ${getExtensionsStyle().accent}` : "none",
            transition: "background 90ms ease, border-color 90ms ease",
        });
    }

    function makeExtensionsButton(label, onClick, options = {}) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.lofiActive = options.active ? "true" : "false";
        styleExtensionsButton(button, !!options.active, false);
        button.addEventListener("mouseenter", () => styleExtensionsButton(button, button.dataset.lofiActive === "true", true));
        button.addEventListener("mouseleave", () => styleExtensionsButton(button, button.dataset.lofiActive === "true", false));
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            onClick?.();
        });
        return button;
    }

    function makeExtensionsSection(title) {
        const metrics = extensionsLayoutMetrics();
        const section = document.createElement("section");
        Object.assign(section.style, {
            border: `1px solid ${getExtensionsStyle().border}`,
            borderRadius: "10px",
            padding: `${metrics.sectionPadding}px`,
            marginBottom: `${metrics.sectionGap}px`,
            background: getExtensionsStyle().surface,
            boxShadow: `3px 4px 0 ${getExtensionsStyle().shadow}`,
        });
        const heading = document.createElement("h3");
        heading.textContent = title;
        Object.assign(heading.style, { margin: "0 0 9px", fontSize: `${metrics.headingSize}px`, color: getExtensionsStyle().accent, letterSpacing: "0.02em" });
        section.appendChild(heading);
        return section;
    }

    function appendExtensionsKeyValue(section, label, value) {
        const metrics = extensionsLayoutMetrics();
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "grid",
            gridTemplateColumns: "minmax(150px, 0.8fr) minmax(180px, 1.2fr)",
            gap: "12px",
            padding: metrics.rowPadding,
            borderBottom: `1px solid ${getExtensionsStyle().border}55`,
        });
        const left = document.createElement("strong");
        left.textContent = label;
        left.style.color = getExtensionsStyle().text;
        const right = document.createElement("span");
        right.textContent = String(value);
        right.style.color = getExtensionsStyle().muted;
        row.append(left, right);
        section.appendChild(row);
    }

    function extensionsSettingRow(label, description, checked, onToggle) {
        const metrics = extensionsLayoutMetrics();
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "15px",
            alignItems: "center",
            padding: metrics.rowPadding,
            borderBottom: `1px solid ${getExtensionsStyle().border}55`,
        });
        const info = document.createElement("div");
        const name = document.createElement("div");
        name.textContent = label;
        Object.assign(name.style, { fontWeight: "bold", color: getExtensionsStyle().text });
        const desc = document.createElement("div");
        desc.textContent = description;
        Object.assign(desc.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginTop: "2px" });
        info.append(name, desc);
        const button = makeExtensionsButton(checked ? "ON" : "OFF", () => {
            onToggle?.();
            renderExtensionsPanel();
        }, { active: checked });
        button.style.minWidth = "72px";
        row.append(info, button);
        return row;
    }

    function loreBrowseNames() {
        const result = [];
        const seen = new Set();
        const add = name => {
            const display = String(name || "").trim();
            const key = normalizeLoreLookupKey(display);
            if (!display || !key || seen.has(key)) return;
            seen.add(key);
            result.push(display);
        };
        for (let i = 0; i < PUBLIC_PLUSH_COUNT; i++) add(PLUSH_NAMES[i]);
        for (const key of Object.keys(PLUSH_LORE || {})) add(key);
        return result;
    }

    function resolveLoreBrowseName(name, names = loreBrowseNames()) {
        const wanted = normalizeLoreLookupKey(name);
        if (!wanted) return null;
        return names.find(entry => normalizeLoreLookupKey(entry) === wanted) || null;
    }

    function loreBrowseImage(name) {
        const wanted = normalizeLoreLookupKey(name);
        for (let i = 0; i < PUBLIC_PLUSH_COUNT; i++) {
            if (normalizeLoreLookupKey(PLUSH_NAMES[i]) === wanted) return renderImages[i] || PLUSH_IMAGES[i] || PLUSH_FALLBACK_IMAGE;
        }
        return renderImages[0] || PLUSH_FALLBACK_IMAGE;
    }

    function selectExtensionsLore(name) {
        const names = loreBrowseNames();
        const resolved = resolveLoreBrowseName(name, names) || names[0] || "Subbycat";
        extensionsLoreSelectedName = resolved;
        extensionsActiveTab = "lore";
        renderExtensionsPanel();
        return resolved;
    }

    function openLoreBrowser(name = null, fromNativePreference = false) {
        const names = loreBrowseNames();
        const heldName = isOurs(getHeld(window.Player)) ? currentPlushName() : null;
        extensionsLoreSelectedName = resolveLoreBrowseName(name, names) || resolveLoreBrowseName(heldName, names) || extensionsLoreSelectedName || names[0] || "Subbycat";
        if (extensionsPanelElement?.isConnected) {
            extensionsActiveTab = "lore";
            renderExtensionsPanel();
            return true;
        }
        return openExtensionsPanel("lore", fromNativePreference);
    }

    function renderExtensionsLore(container) {
        const names = loreBrowseNames();
        if (!names.length) {
            const section = makeExtensionsSection("Lore");
            const empty = document.createElement("div");
            empty.textContent = "No plushie lore is available yet.";
            section.appendChild(empty);
            container.appendChild(section);
            return;
        }

        let selected = resolveLoreBrowseName(extensionsLoreSelectedName, names);
        if (!selected) {
            const heldName = isOurs(getHeld(window.Player)) ? currentPlushName() : null;
            selected = resolveLoreBrowseName(heldName, names) || names[0];
            extensionsLoreSelectedName = selected;
        }

        const layout = document.createElement("div");
        Object.assign(layout.style, {
            display: "grid",
            gridTemplateColumns: "minmax(190px, 0.62fr) minmax(0, 1.8fr)",
            gap: "14px",
            alignItems: "start",
        });

        const browser = makeExtensionsSection("Plushies");
        Object.assign(browser.style, { position: "sticky", top: "0", maxHeight: "calc(100vh - 230px)", overflowY: "auto" });
        for (const name of names) {
            const button = makeExtensionsButton(name, () => selectExtensionsLore(name), { active: normalizeLoreLookupKey(name) === normalizeLoreLookupKey(selected) });
            Object.assign(button.style, { display: "block", width: "100%", marginBottom: "7px", textAlign: "left" });
            browser.appendChild(button);
        }

        const detail = makeExtensionsSection(selected);
        const lore = getPlushLore(selected);
        const top = document.createElement("div");
        Object.assign(top.style, { display: "flex", gap: "16px", alignItems: "center", marginBottom: "14px" });
        const image = document.createElement("img");
        image.alt = `${selected} plushie`;
        image.src = loreBrowseImage(selected);
        Object.assign(image.style, { width: "112px", height: "112px", objectFit: "contain", flex: "0 0 auto", filter: "none", mixBlendMode: "normal" });
        const headingWrap = document.createElement("div");
        const loreTitle = document.createElement("div");
        loreTitle.textContent = lore?.title || "Lore unavailable";
        Object.assign(loreTitle.style, { fontSize: "23px", fontWeight: "bold", lineHeight: "1.2" });
        const mood = getPlushMoodRecord(selected);
        const moodLine = document.createElement("div");
        moodLine.textContent = `Mood: ${moodLabel(mood.score)} (${mood.score}/100)`;
        Object.assign(moodLine.style, { opacity: "0.72", fontSize: "13px", marginTop: "6px" });
        headingWrap.append(loreTitle, moodLine);
        top.append(image, headingWrap);
        detail.appendChild(top);

        const body = document.createElement("div");
        body.textContent = lore?.text || "Lore for this plushie has not been loaded yet. Use Reload Git data on the Status page if needed.";
        Object.assign(body.style, { whiteSpace: "pre-wrap", lineHeight: "1.58", fontSize: "15px", overflowWrap: "anywhere" });
        detail.appendChild(body);

        const nav = document.createElement("div");
        Object.assign(nav.style, { display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "18px" });
        const index = Math.max(0, names.findIndex(name => normalizeLoreLookupKey(name) === normalizeLoreLookupKey(selected)));
        const previous = names[(index - 1 + names.length) % names.length];
        const next = names[(index + 1) % names.length];
        nav.append(
            makeExtensionsButton("Previous", () => selectExtensionsLore(previous)),
            makeExtensionsButton("Next", () => selectExtensionsLore(next)),
            makeExtensionsButton("Held Plushie", () => {
                const held = isOurs(getHeld(window.Player)) ? currentPlushName() : null;
                if (held) selectExtensionsLore(held);
            })
        );
        detail.appendChild(nav);

        if (getLayoutSettings().loreListSide === "right") layout.append(detail, browser);
        else layout.append(browser, detail);
        container.appendChild(layout);
    }

    function renderExtensionsStatus(container) {
        const status = extensionsStatusSnapshot();
        const section = makeExtensionsSection("Addon status");
        appendExtensionsKeyValue(section, "Version", status.version);
        appendExtensionsKeyValue(section, "State", status.state);
        appendExtensionsKeyValue(section, "Held plushie", status.held);
        appendExtensionsKeyValue(section, "Current mood", status.mood);
        appendExtensionsKeyValue(section, "Relationship", status.relationship);
        appendExtensionsKeyValue(section, "Plush state", `${status.sleepy}${status.favorite ? " • ★ Favorite" : ""}`);
        appendExtensionsKeyValue(section, "Room mascot", status.mascot);
        appendExtensionsKeyValue(section, "Achievements", status.achievements);
        appendExtensionsKeyValue(section, "Latest version", status.latestVersion);
        appendExtensionsKeyValue(section, "Git data", status.gitData);
        appendExtensionsKeyValue(section, "Git data refreshed", status.gitDataRefreshed);
        container.appendChild(section);

        const enabled = makeExtensionsSection("Feature status");
        appendExtensionsKeyValue(enabled, "Protect Me", status.protectMe ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Jealous Plushie", status.jealousPlushie ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Easy Drag", status.easyDrag ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Mascot picture", status.mascotPicture ? "Visible" : "Hidden");
        appendExtensionsKeyValue(enabled, "Idle animations", status.idleAnimations ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Speech bubbles", status.speechBubbles ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Automatic update checks", status.autoUpdateChecks ? "ON" : "Off");
        appendExtensionsKeyValue(enabled, "Performance mode", status.performanceMode === "low" ? "Low CPU" : "Normal");
        container.appendChild(enabled);

        const actions = document.createElement("div");
        Object.assign(actions.style, { display: "flex", gap: "10px", flexWrap: "wrap" });
        actions.append(
            makeExtensionsButton("Check for update", () => { void checkForUpdates({ silent: false }).finally(renderExtensionsPanel); }),
            makeExtensionsButton("Open Move / Resize", () => { closeExtensionsPanel(); void openNativeLayering(); }),
            makeExtensionsButton("Reload Git data", () => { void refreshGitDataFromGitHub({ force: true, silent: false }).finally(renderExtensionsPanel); }),
            makeExtensionsButton("Print debug to console", () => debug())
        );
        container.appendChild(actions);
    }

    function renderExtensionsSettings(container) {
        const settings = getFeatureSettings();
        const section = makeExtensionsSection("Settings");
        section.append(
            extensionsSettingRow("Protect Me", "The held plush reacts to selected incoming actions.", settings.protectMe, () => toggleFeatureSetting("protectMe")),
            extensionsSettingRow("Jealous Plushie", "Playful jealous reactions when you show affection to someone else.", settings.jealousPlushie, () => toggleFeatureSetting("jealousPlushie")),
            extensionsSettingRow("Easy Drag", "Drag anywhere on the character side to reposition the held plushie.", dragModeEnabled, () => toggleDragMode()),
            extensionsSettingRow("Room Mascot Picture", "Show the room mascot picture locally in the chat area.", settings.showRoomMascot, () => setRoomMascotOverlayVisible(!getFeatureSettings().showRoomMascot)),
            extensionsSettingRow("Idle Animation", "Occasional lightweight local plush wiggles.", settings.idleAnimations, () => toggleFeatureSetting("idleAnimations")),
            extensionsSettingRow("Speech Bubbles", "Allow local mood-based plush speech bubbles.", settings.speechBubbles, () => toggleFeatureSetting("speechBubbles")),
            extensionsSettingRow("Automatic Update Checks", "Check the repository manifest at most once per day.", settings.autoUpdateChecks, () => toggleFeatureSetting("autoUpdateChecks"))
        );
        container.appendChild(section);

        const performance = makeExtensionsSection("Performance mode");
        const performanceHint = document.createElement("div");
        performanceHint.textContent = settings.performanceMode === "low"
            ? "Low CPU pauses optional idle/petting animations, reduces visual refresh checks, and lengthens recovery watchdogs. Manual actions and emotes still work."
            : "Normal mode keeps all optional local animations and standard refresh/watchdog timing.";
        Object.assign(performanceHint.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginBottom: "9px", lineHeight: "1.4" });
        const performanceButtons = document.createElement("div");
        Object.assign(performanceButtons.style, { display: "flex", flexWrap: "wrap", gap: "8px" });
        performanceButtons.append(
            makeExtensionsButton("Normal", () => setPerformanceMode("normal"), { active: settings.performanceMode !== "low" }),
            makeExtensionsButton("Low CPU", () => setPerformanceMode("low"), { active: settings.performanceMode === "low" })
        );
        performance.append(performanceHint, performanceButtons);
        container.appendChild(performance);

        const emotes = makeExtensionsSection("Emotes");
        const emoteHint = document.createElement("div");
        emoteHint.textContent = "Room-synced emotes last 15 seconds. Other Subby's Plushies users in the room see the same symbol and bubble on your plushie.";
        Object.assign(emoteHint.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginBottom: "8px" });
        const emoteButtons = document.createElement("div");
        Object.assign(emoteButtons.style, { display: "flex", flexWrap: "wrap", gap: "8px" });
        for (const [label, type] of [["♥ Happy", "happy"], ["!! Angry", "angry"], ["zZ Sleepy", "sleepy"], ["! Protective", "protective"], ["… Sulky", "sulky"]]) {
            emoteButtons.appendChild(makeExtensionsButton(label, () => triggerPlushEmote(type)));
        }
        emotes.append(emoteHint, emoteButtons);
        container.appendChild(emotes);

        const utility = makeExtensionsSection("Utilities");
        const buttons = document.createElement("div");
        Object.assign(buttons.style, { display: "flex", flexWrap: "wrap", gap: "10px" });
        buttons.append(
            makeExtensionsButton("Check Update Now", () => { void checkForUpdates({ silent: false }).finally(renderExtensionsPanel); }),
            makeExtensionsButton("Open Lore Browser", () => openLoreBrowser(currentPlushName())),
            makeExtensionsButton("Reset Plush Position", () => { closeExtensionsPanel(); resetPosition(); })
        );
        utility.appendChild(buttons);
        container.appendChild(utility);
    }

    function renderExtensionsPlushies(container) {
        const name = currentPlushName();
        const mood = getPlushMoodRecord(name);
        const relationship = relationshipStatus(name);
        const heldSection = makeExtensionsSection("Held plushie");
        const hero = document.createElement("div");
        Object.assign(hero.style, {
            display: "grid",
            gridTemplateColumns: "96px 1fr",
            gap: "14px",
            alignItems: "center",
        });
        const image = document.createElement("img");
        image.alt = `${name} plushie`;
        image.src = PLUSH_IMAGES[currentWirePlushOption()] || PLUSH_FALLBACK_IMAGE;
        Object.assign(image.style, {
            width: "88px",
            height: "88px",
            objectFit: "contain",
            border: `1px solid ${getExtensionsStyle().border}`,
            borderRadius: "10px",
            background: getExtensionsStyle().background,
        });
        const info = document.createElement("div");
        const title = document.createElement("div");
        title.textContent = name;
        Object.assign(title.style, { color: getExtensionsStyle().accent, fontWeight: "bold", fontSize: "18px", marginBottom: "6px" });
        const lines = document.createElement("div");
        const nextText = relationship.nextLevel
            ? `${relationship.remaining} interaction${relationship.remaining === 1 ? "" : "s"} to ${relationship.nextLevel}`
            : "Maximum relationship reached";
        lines.textContent = `${relationship.level} • ${relationship.interactions} interactions • ${nextText}\nMood: ${moodLabel(mood.score)} ${mood.score}/100 • ${isPlushSleepy(name) ? "Sleeping zZ" : "Awake"}`;
        Object.assign(lines.style, { color: getExtensionsStyle().muted, whiteSpace: "pre-line", lineHeight: "1.45" });
        const controls = document.createElement("div");
        Object.assign(controls.style, { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "9px" });
        controls.append(
            makeExtensionsButton(isFavoritePlush(name) ? "★ Favorite" : "☆ Add Favorite", () => { toggleFavoritePlush(name); renderExtensionsPanel(); }, { active: isFavoritePlush(name) }),
            makeExtensionsButton("Open Lore", () => openLoreBrowser(name)),
            makeExtensionsButton("Wake", () => { touchPlushRelationship(name, { increment: 0, wake: true }); renderExtensionsPanel(); })
        );
        info.append(title, lines, controls);
        hero.append(image, info);
        heldSection.appendChild(hero);
        container.appendChild(heldSection);

        const emotes = makeExtensionsSection("Plushie emotes");
        const emoteText = document.createElement("div");
        emoteText.textContent = "Room-synced emotes last 15 seconds and change the plush symbol and speech bubble for everyone in the room who has Subby's Plushies.";
        Object.assign(emoteText.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginBottom: "9px" });
        const emoteButtons = document.createElement("div");
        Object.assign(emoteButtons.style, { display: "flex", flexWrap: "wrap", gap: "8px" });
        for (const [label, type] of [["♥ Happy", "happy"], ["!! Angry", "angry"], ["zZ Sleepy", "sleepy"], ["! Protective", "protective"], ["… Sulky", "sulky"]]) {
            emoteButtons.appendChild(makeExtensionsButton(label, () => triggerPlushEmote(type)));
        }
        emotes.append(emoteText, emoteButtons);
        container.appendChild(emotes);

        const poses = makeExtensionsSection("Saved poses");
        const poseIntro = document.createElement("div");
        poseIntro.textContent = "Pose slots are saved separately for each plushie and include X/Y, scale, and rotation.";
        Object.assign(poseIntro.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginBottom: "8px" });
        poses.appendChild(poseIntro);
        for (const slot of SAVED_POSE_SLOTS) {
            const row = document.createElement("div");
            Object.assign(row.style, {
                display: "grid",
                gridTemplateColumns: "minmax(145px, 1fr) auto",
                gap: "12px",
                alignItems: "center",
                padding: extensionsLayoutMetrics().rowPadding,
                borderBottom: `1px solid ${getExtensionsStyle().border}55`,
            });
            const saved = getSavedPose(slot, name);
            const label = document.createElement("div");
            if (saved) {
                label.textContent = `Pose ${slot} — X ${Math.round(saved.TranslationX)}, Y ${Math.round(saved.TranslationY)}, ${saved.ScaleX.toFixed(2)}×${saved.ScaleY.toFixed(2)}, ${Math.round(saved.Rotation)}°`;
            } else label.textContent = `Pose ${slot} — Empty`;
            label.style.color = saved ? getExtensionsStyle().text : getExtensionsStyle().muted;
            const buttons = document.createElement("div");
            Object.assign(buttons.style, { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" });
            buttons.append(
                makeExtensionsButton("Save", () => { saveCurrentPose(slot); renderExtensionsPanel(); }),
                makeExtensionsButton("Apply", () => { applySavedPose(slot); renderExtensionsPanel(); }),
                makeExtensionsButton("Clear", () => { clearSavedPose(slot, name); renderExtensionsPanel(); })
            );
            buttons.children[1].disabled = !saved;
            buttons.children[2].disabled = !saved;
            row.append(label, buttons);
            poses.appendChild(row);
        }
        container.appendChild(poses);

        const favorites = makeExtensionsSection(`Favorites (${favoritePlushNames().length})`);
        const favoriteNames = favoritePlushNames();
        if (!favoriteNames.length) {
            const empty = document.createElement("div");
            empty.textContent = "No favorites yet. Use the ☆ stars in the Use menu to add plushies here.";
            empty.style.color = getExtensionsStyle().muted;
            favorites.appendChild(empty);
        } else {
            const favoriteButtons = document.createElement("div");
            Object.assign(favoriteButtons.style, { display: "flex", flexWrap: "wrap", gap: "7px" });
            for (const favorite of favoriteNames) {
                favoriteButtons.appendChild(makeExtensionsButton(`★ ${favorite}`, () => openLoreBrowser(favorite)));
            }
            favorites.appendChild(favoriteButtons);
        }
        container.appendChild(favorites);

        const collection = makeExtensionsSection("Relationship collection");
        for (let option = 0; option < PUBLIC_PLUSH_COUNT; option++) {
            const plushName = publicPlushName(option);
            if (!plushName) continue;
            const bond = relationshipStatus(plushName);
            appendExtensionsKeyValue(collection, `${isFavoritePlush(plushName) ? "★ " : ""}${plushName}`, `${bond.level} • ${bond.interactions} interaction${bond.interactions === 1 ? "" : "s"}`);
        }
        container.appendChild(collection);
    }

    function renderExtensionsBackup(container) {
        const section = makeExtensionsSection("Backup / Restore");
        const intro = document.createElement("div");
        intro.textContent = "Export your local Subby's Plushies progress and preferences to a JSON file, then restore it in another browser or account. Progress is tamper-evident: edited stats/achievements/relationships will not import.";
        Object.assign(intro.style, { color: getExtensionsStyle().muted, lineHeight: "1.45", marginBottom: "10px" });
        section.appendChild(intro);
        appendExtensionsKeyValue(section, "Progress", "Stats, achievements, relationships (integrity sealed)");
        appendExtensionsKeyValue(section, "Included", "Moods/history, battle history, favorites, saved poses, nicknames");
        appendExtensionsKeyValue(section, "Interface", "Layouts, themes, feature settings");
        appendExtensionsKeyValue(section, "Personal data", "Nicknames and saved poses");
        const note = document.createElement("div");
        note.textContent = "This backup contains only this plugin's localStorage data. It does not export your Bondage Club account, wardrobe, credentials, or room data.";
        Object.assign(note.style, { color: getExtensionsStyle().muted, fontSize: "12px", margin: "10px 0" });
        const buttons = document.createElement("div");
        Object.assign(buttons.style, { display: "flex", flexWrap: "wrap", gap: "9px" });
        buttons.append(
            makeExtensionsButton("Export Backup", () => { void exportPlushBackup(); }),
            makeExtensionsButton("Import Backup", () => importPlushBackupFromFile())
        );
        section.append(note, buttons);
        container.appendChild(section);
    }

    function renderExtensionsLayout(container) {
        const settings = getLayoutSettings();
        const section = makeExtensionsSection("Layout customization");

        const choiceRow = (label, description, valueLabel, onClick) => {
            const metrics = extensionsLayoutMetrics();
            const row = document.createElement("div");
            Object.assign(row.style, {
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "15px",
                alignItems: "center",
                padding: metrics.rowPadding,
                borderBottom: `1px solid ${getExtensionsStyle().border}55`,
            });
            const info = document.createElement("div");
            const name = document.createElement("div");
            name.textContent = label;
            Object.assign(name.style, { fontWeight: "bold", color: getExtensionsStyle().text });
            const desc = document.createElement("div");
            desc.textContent = description;
            Object.assign(desc.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginTop: "2px" });
            info.append(name, desc);
            const button = makeExtensionsButton(valueLabel, onClick, { active: true });
            button.style.minWidth = "118px";
            row.append(info, button);
            return row;
        };

        section.append(
            choiceRow(
                "Use menu density",
                "Choose roomier buttons or a tighter compact plush selector.",
                settings.useMenuDensity === "compact" ? "Compact" : "Cozy",
                () => setLayoutSetting("useMenuDensity", settings.useMenuDensity === "compact" ? "cozy" : "compact")
            ),
            choiceRow(
                "Hover preview",
                "Show or hide the plush image and mood preview at the bottom of the Use menu.",
                settings.showHoverPreview ? "Shown" : "Hidden",
                () => setLayoutSetting("showHoverPreview", !settings.showHoverPreview)
            ),
            choiceRow(
                "Extensions density",
                "Choose a cozy or compact spacing style for this control center.",
                settings.extensionsDensity === "compact" ? "Compact" : "Cozy",
                () => setLayoutSetting("extensionsDensity", settings.extensionsDensity === "compact" ? "cozy" : "compact")
            ),
            choiceRow(
                "Lore list side",
                "Put the plushie list on the left or right side of the Lore browser.",
                settings.loreListSide === "right" ? "Right" : "Left",
                () => setLayoutSetting("loreListSide", settings.loreListSide === "right" ? "left" : "right")
            )
        );
        container.appendChild(section);

        const themeSection = makeExtensionsSection("Theme presets");
        const themeIntro = document.createElement("div");
        themeIntro.textContent = "Apply one palette to both the Use menu and Extensions control center. You can still customize either interface separately below.";
        Object.assign(themeIntro.style, {
            color: getExtensionsStyle().muted,
            fontSize: "12px",
            lineHeight: "1.4",
            marginBottom: "10px",
        });
        const themeButtons = document.createElement("div");
        Object.assign(themeButtons.style, {
            display: "flex",
            flexWrap: "wrap",
            gap: "7px",
        });
        for (const [presetName, presetPalette] of Object.entries(INTERFACE_COLOR_PRESETS)) {
            themeButtons.appendChild(makeExtensionsButton(presetName, () => applySharedInterfaceTheme(presetPalette)));
        }
        themeSection.append(themeIntro, themeButtons);
        container.appendChild(themeSection);

        const colorSection = makeExtensionsSection("Interface colors");
        const colorIntro = document.createElement("div");
        colorIntro.textContent = "Customize the Use menu and Extensions control center independently. Colors are stored only on this browser/account.";
        Object.assign(colorIntro.style, {
            color: getExtensionsStyle().muted,
            fontSize: "12px",
            lineHeight: "1.4",
            marginBottom: "12px",
        });
        colorSection.appendChild(colorIntro);

        const makePaletteEditor = (title, scope, palette) => {
            const wrap = document.createElement("div");
            Object.assign(wrap.style, {
                border: `1px solid ${getExtensionsStyle().border}`,
                borderRadius: "9px",
                padding: "11px",
                marginBottom: "12px",
                background: getExtensionsStyle().background,
            });

            const heading = document.createElement("div");
            heading.textContent = title;
            Object.assign(heading.style, {
                fontWeight: "bold",
                color: getExtensionsStyle().accent,
                marginBottom: "9px",
                fontSize: "14px",
            });
            wrap.appendChild(heading);

            const presetRow = document.createElement("div");
            Object.assign(presetRow.style, {
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "10px",
            });
            for (const [presetName, presetPalette] of Object.entries(INTERFACE_COLOR_PRESETS)) {
                const button = makeExtensionsButton(presetName, () => applyInterfacePalette(scope, presetPalette));
                button.style.minHeight = "30px";
                button.style.padding = "4px 8px";
                presetRow.appendChild(button);
            }
            wrap.appendChild(presetRow);

            const grid = document.createElement("div");
            Object.assign(grid.style, {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
                gap: "7px 10px",
            });

            for (const key of INTERFACE_COLOR_KEYS) {
                const row = document.createElement("label");
                Object.assign(row.style, {
                    display: "grid",
                    gridTemplateColumns: "1fr 38px",
                    alignItems: "center",
                    gap: "8px",
                    minHeight: "36px",
                    padding: "4px 7px",
                    border: `1px solid ${getExtensionsStyle().border}66`,
                    borderRadius: "7px",
                    color: getExtensionsStyle().text,
                    background: getExtensionsStyle().surface,
                    cursor: "pointer",
                });

                const label = document.createElement("span");
                label.textContent = INTERFACE_COLOR_LABELS[key] || key;
                label.style.fontSize = "12px";

                const picker = document.createElement("input");
                picker.type = "color";
                picker.value = sanitizeInterfaceColor(palette[key], LOFI_MENU_STYLE[key]).toLowerCase();
                picker.title = `${INTERFACE_COLOR_LABELS[key] || key}: ${palette[key]}`;
                Object.assign(picker.style, {
                    width: "36px",
                    height: "28px",
                    padding: "0",
                    border: `1px solid ${getExtensionsStyle().border}`,
                    borderRadius: "6px",
                    background: "transparent",
                    cursor: "pointer",
                });
                picker.addEventListener("change", () => setInterfaceColor(scope, key, picker.value));

                row.append(label, picker);
                grid.appendChild(row);
            }
            wrap.appendChild(grid);

            const utility = document.createElement("div");
            Object.assign(utility.style, {
                display: "flex",
                flexWrap: "wrap",
                gap: "7px",
                marginTop: "10px",
            });
            utility.append(
                makeExtensionsButton("Reset colors", () => resetInterfacePalette(scope)),
                makeExtensionsButton(
                    scope === "use" ? "Copy Extensions colors" : "Copy Use-menu colors",
                    () => copyInterfacePalette(scope === "use" ? "extensions" : "use", scope)
                )
            );
            wrap.appendChild(utility);
            return wrap;
        };

        colorSection.append(
            makePaletteEditor("Use menu", "use", getUseMenuStyle()),
            makePaletteEditor("Extensions control center", "extensions", getExtensionsStyle())
        );
        container.appendChild(colorSection);

        const reset = makeExtensionsSection("Reset layout");
        const text = document.createElement("div");
        text.textContent = "Layout choices are stored only on this browser/account and do not affect other players.";
        Object.assign(text.style, { color: getExtensionsStyle().muted, marginBottom: "10px", fontSize: "12px" });
        reset.append(text, makeExtensionsButton("Reset to default layout", () => resetLayoutSettings()));
        container.appendChild(reset);
    }

    function renderExtensionsHistory(container) {
        const plushName = currentPlushName();
        const mood = getPlushMoodRecord(plushName);
        const moodEntries = moodHistoryFor(plushName, 40);
        const moodSection = makeExtensionsSection(`Mood history — ${plushName}`);
        const moodSummary = document.createElement("div");
        moodSummary.textContent = `${moodLabel(mood.score)} • ${mood.score}/100 • last ${Math.min(20, moodEntries.length)} shown`;
        Object.assign(moodSummary.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginBottom: "9px" });
        moodSection.appendChild(moodSummary);

        if (!moodEntries.length) {
            const empty = document.createElement("div");
            empty.textContent = "No mood changes recorded yet.";
            empty.style.color = getExtensionsStyle().muted;
            moodSection.appendChild(empty);
        } else {
            const recent = moodEntries.slice(-20).reverse();
            for (const entry of recent) {
                const row = document.createElement("div");
                Object.assign(row.style, {
                    display: "grid", gridTemplateColumns: "72px 1fr auto", gap: "10px", alignItems: "center",
                    padding: extensionsLayoutMetrics().rowPadding, borderBottom: `1px solid ${getExtensionsStyle().border}55`,
                });
                const delta = document.createElement("strong");
                delta.textContent = `${entry.delta > 0 ? "+" : ""}${entry.delta}`;
                delta.style.color = entry.delta > 0 ? getExtensionsStyle().accent : getExtensionsStyle().muted;
                const detail = document.createElement("div");
                const reason = document.createElement("div");
                reason.textContent = entry.reason || "Mood change";
                reason.style.color = getExtensionsStyle().text;
                const when = document.createElement("div");
                when.textContent = new Date(Number(entry.at) || Date.now()).toLocaleString();
                Object.assign(when.style, { color: getExtensionsStyle().muted, fontSize: "11px", marginTop: "2px" });
                detail.append(reason, when);
                const score = document.createElement("div");
                score.textContent = `${entry.score}/100`;
                Object.assign(score.style, { color: getExtensionsStyle().muted, fontWeight: "bold" });
                row.append(delta, detail, score);
                moodSection.appendChild(row);
            }
        }
        container.appendChild(moodSection);

        const battles = battleHistory(20).reverse();
        const battleSection = makeExtensionsSection("Battle history — last 20");
        if (!battles.length) {
            const empty = document.createElement("div");
            empty.textContent = "No completed plushie battles recorded yet.";
            empty.style.color = getExtensionsStyle().muted;
            battleSection.appendChild(empty);
        } else {
            for (const entry of battles) {
                const row = document.createElement("div");
                Object.assign(row.style, {
                    display: "grid", gridTemplateColumns: "82px minmax(180px, 1fr) auto", gap: "10px", alignItems: "center",
                    padding: extensionsLayoutMetrics().rowPadding, borderBottom: `1px solid ${getExtensionsStyle().border}55`,
                });
                const result = document.createElement("strong");
                result.textContent = String(entry.result || "draw").toUpperCase();
                result.style.color = entry.result === "win" ? getExtensionsStyle().accent : getExtensionsStyle().muted;
                const info = document.createElement("div");
                const opponent = document.createElement("div");
                opponent.textContent = `vs ${entry.opponent}${entry.opponentMember ? ` (${entry.opponentMember})` : ""}`;
                opponent.style.color = getExtensionsStyle().text;
                const plushes = document.createElement("div");
                plushes.textContent = `${entry.plush} vs ${entry.opponentPlush} • ${entry.score}-${entry.opponentScore}`;
                Object.assign(plushes.style, { color: getExtensionsStyle().muted, fontSize: "11px", marginTop: "2px" });
                info.append(opponent, plushes);
                const when = document.createElement("div");
                when.textContent = new Date(Number(entry.at) || Date.now()).toLocaleString();
                Object.assign(when.style, { color: getExtensionsStyle().muted, fontSize: "11px", textAlign: "right" });
                row.append(result, info, when);
                battleSection.appendChild(row);
            }
        }
        container.appendChild(battleSection);
    }

    function renderExtensionsStats(container) {
        const s = getStatsStore();
        const summary = makeExtensionsSection("Lifetime local stats");
        appendExtensionsKeyValue(summary, "Interactions", s.totalInteractions);
        appendExtensionsKeyValue(summary, "Affectionate interactions", statAffectionCount(s));
        appendExtensionsKeyValue(summary, "Battles played", s.battles.played);
        appendExtensionsKeyValue(summary, "Battle record", `${s.battles.wins} W / ${s.battles.losses} L / ${s.battles.draws} D`);
        appendExtensionsKeyValue(summary, "Speech bubbles", s.speechBubbles);
        appendExtensionsKeyValue(summary, "Idle animations", s.idleAnimations);
        appendExtensionsKeyValue(summary, "Offers", s.offers);
        appendExtensionsKeyValue(summary, "Room mascots set", s.mascotSets);
        container.appendChild(summary);

        const actions = makeExtensionsSection("Interaction breakdown");
        const entries = Object.entries(s.actions || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
        if (!entries.length) {
            const empty = document.createElement("div");
            empty.textContent = "No tracked interactions yet.";
            empty.style.opacity = "0.75";
            actions.appendChild(empty);
        } else {
            for (const [key, value] of entries) appendExtensionsKeyValue(actions, key, value);
        }
        container.appendChild(actions);

    }

    function renderExtensionsAchievements(container) {
        const stats = getStatsStore();
        checkAchievements(false);
        const unlockedCount = ACHIEVEMENTS.filter(a => !!stats.achievements[a.id]).length;
        const section = makeExtensionsSection(`Achievements (${unlockedCount}/${ACHIEVEMENTS.length})`);
        for (const achievement of ACHIEVEMENTS) {
            const unlocked = !!stats.achievements[achievement.id];
            const row = document.createElement("div");
            Object.assign(row.style, {
                display: "grid",
                gridTemplateColumns: "34px 1fr",
                gap: "10px",
                padding: extensionsLayoutMetrics().rowPadding,
                opacity: unlocked ? "1" : "0.62",
                borderBottom: `1px solid ${getExtensionsStyle().border}55`,
            });
            const mark = document.createElement("div");
            mark.textContent = unlocked ? "✓" : "○";
            Object.assign(mark.style, { fontSize: "22px", fontWeight: "bold", textAlign: "center", color: unlocked ? getExtensionsStyle().accent : getExtensionsStyle().muted });
            const info = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = achievement.name;
            name.style.color = getExtensionsStyle().text;
            const desc = document.createElement("div");
            desc.textContent = achievement.description;
            Object.assign(desc.style, { marginTop: "2px", color: getExtensionsStyle().muted });
            info.append(name, desc);
            if (unlocked) {
                const when = document.createElement("div");
                const timestamp = Number(stats.achievements[achievement.id]);
                when.textContent = Number.isFinite(timestamp) ? `Unlocked ${new Date(timestamp).toLocaleString()}` : "Unlocked";
                Object.assign(when.style, { fontSize: "12px", color: getExtensionsStyle().muted, marginTop: "3px" });
                info.appendChild(when);
            }
            row.append(mark, info);
            section.appendChild(row);
        }
        container.appendChild(section);
    }

    function commandGroupsForDisplay() {
        const groups = (Array.isArray(EXTENSIONS_COMMAND_GROUPS) ? EXTENSIONS_COMMAND_GROUPS : []).map(group => ({
            title: group?.title || "Commands",
            commands: Array.isArray(group?.commands) ? [...group.commands] : [],
        }));
        const required = [
            ["General", [
                { command: "/help plushie", description: "Show the full Subby's Plushies command reference in chat." },
            ]],
            ["Plushies & Relationships", [
                { command: "/plushieplushies", description: "Open the Plushies tab with relationship, favorites, emotes, and saved poses." },
                { command: "/plushiefavorite", description: "Toggle the held plushie as a favorite." },
                { command: "/plushieemote happy|angry|sleepy|protective|sulky", description: "Show a 15-second room-synced plushie emote and mood symbol." },
                { command: "/plushieposes", description: "Open the Plushies tab at the saved-pose controls." },
                { command: "/plushieposesave <1|2|3>", description: "Save the held plushie's current position, scale, and rotation to a pose slot." },
                { command: "/plushieposeload <1|2|3>", description: "Apply a saved pose for the held plushie." },
                { command: "/plushieposeclear <1|2|3>", description: "Clear a saved pose slot for the held plushie." },
            ]],
            ["History & Performance", [
                { command: "/plushiehistory", description: "Open mood and battle history." },
                { command: "/plushieperformance normal|low", description: "Switch between Normal and Low CPU performance modes." },
            ]],
            ["Backup / Restore", [
                { command: "/plushiebackup", description: "Open the Backup / Restore tab." },
                { command: "/plushieexport", description: "Export a portable Subby's Plushies JSON backup." },
                { command: "/plushieimport", description: "Choose and restore a Subby's Plushies JSON backup." },
            ]],
        ];
        const existing = new Set();
        for (const group of groups) for (const entry of group.commands) {
            const command = Array.isArray(entry) ? entry[0] : entry?.command;
            if (command) existing.add(String(command).split(/\s+/)[0].toLowerCase());
        }
        for (const [title, entries] of required) {
            const missing = entries.filter(entry => !existing.has(entry.command.split(/\s+/)[0].toLowerCase()));
            if (!missing.length) continue;
            let target = groups.find(group => group.title === title);
            if (!target) { target = { title, commands: [] }; groups.push(target); }
            target.commands.push(...missing);
            for (const entry of missing) existing.add(entry.command.split(/\s+/)[0].toLowerCase());
        }
        return groups;
    }

    function renderExtensionsCommands(container) {
        const groups = commandGroupsForDisplay();

        for (const group of groups) {
            const section = makeExtensionsSection(group.title);
            for (const entry of group.commands) {
                const command = Array.isArray(entry) ? entry[0] : entry?.command;
                const description = Array.isArray(entry) ? entry[1] : entry?.description;
                if (!command || !description) continue;
                const row = document.createElement("div");
                Object.assign(row.style, {
                    display: "grid",
                    gridTemplateColumns: "minmax(220px, 0.8fr) minmax(260px, 1.4fr)",
                    gap: "14px",
                    padding: extensionsLayoutMetrics().rowPadding,
                    borderBottom: `1px solid ${getExtensionsStyle().border}55`,
                    alignItems: "start",
                });
                const code = document.createElement("code");
                code.textContent = command;
                Object.assign(code.style, {
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "13px",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    color: getExtensionsStyle().accent,
                });
                const desc = document.createElement("span");
                desc.textContent = description;
                Object.assign(desc.style, { color: getExtensionsStyle().muted, lineHeight: "1.35" });
                row.append(code, desc);
                section.appendChild(row);
            }
            container.appendChild(section);
        }

    }

    function applyExtensionsPanelTheme() {
        if (!extensionsPanelElement?.isConnected) return false;
        const style = getExtensionsStyle();
        Object.assign(extensionsPanelElement.style, {
            borderColor: style.border,
            background: style.background,
            color: style.text,
            boxShadow: `7px 9px 0 ${style.shadow}, 0 12px 30px rgba(0,0,0,0.38)`,
        });
        const header = extensionsPanelElement.querySelector(".SubbysPlushiesExtensionsHeader");
        if (header) Object.assign(header.style, { borderBottomColor: style.border, background: style.header });
        const tabs = extensionsPanelElement.querySelector(".SubbysPlushiesExtensionsTabs");
        if (tabs) Object.assign(tabs.style, { borderBottomColor: `${style.border}88`, background: style.header });
        const content = extensionsPanelElement.querySelector(".SubbysPlushiesExtensionsContent");
        if (content) content.style.background = style.background;
        const title = extensionsPanelElement.querySelector(".SubbysPlushiesExtensionsTitle");
        if (title) title.style.color = style.text;
        const subtitle = extensionsPanelElement.querySelector(".SubbysPlushiesExtensionsSubtitle");
        if (subtitle) subtitle.style.color = style.muted;
        for (const button of extensionsPanelElement.querySelectorAll("button")) {
            styleExtensionsButton(button, button.dataset.lofiActive === "true", false);
        }
        return true;
    }

    function renderExtensionsPanel() {
        if (!extensionsPanelElement?.isConnected || !extensionsPanelContent) return false;
        applyExtensionsPanelTheme();
        extensionsPanelContent.innerHTML = "";
        extensionsPanelElement.style.font = `${extensionsLayoutMetrics().fontSize}px Arial, sans-serif`;
        if (extensionsActiveTab === "lore") renderExtensionsLore(extensionsPanelContent);
        else if (extensionsActiveTab === "plushies") renderExtensionsPlushies(extensionsPanelContent);
        else if (extensionsActiveTab === "history") renderExtensionsHistory(extensionsPanelContent);
        else if (extensionsActiveTab === "settings") renderExtensionsSettings(extensionsPanelContent);
        else if (extensionsActiveTab === "layout") renderExtensionsLayout(extensionsPanelContent);
        else if (extensionsActiveTab === "stats") renderExtensionsStats(extensionsPanelContent);
        else if (extensionsActiveTab === "achievements") renderExtensionsAchievements(extensionsPanelContent);
        else if (extensionsActiveTab === "backup") renderExtensionsBackup(extensionsPanelContent);
        else if (extensionsActiveTab === "commands") renderExtensionsCommands(extensionsPanelContent);
        else renderExtensionsStatus(extensionsPanelContent);

        const nav = extensionsPanelElement.querySelector?.(".SubbysPlushiesExtensionsTabs");
        if (nav) {
            for (const button of nav.querySelectorAll("button[data-tab]")) {
                const active = button.dataset.tab === extensionsActiveTab;
                button.dataset.lofiActive = active ? "true" : "false";
                styleExtensionsButton(button, active, false);
                button.style.fontWeight = active ? "bold" : "normal";
            }
        }
        return true;
    }

    function positionExtensionsPanel() {
        if (!extensionsPanelElement?.isConnected) return false;
        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        const rect = canvas?.getBoundingClientRect?.();
        if (!rect || rect.width <= 0 || rect.height <= 0) {
            Object.assign(extensionsPanelElement.style, { left: "5vw", top: "5vh", width: "90vw", height: "90vh" });
            return true;
        }
        const marginX = Math.max(12, rect.width * 0.035);
        const marginY = Math.max(12, rect.height * 0.045);
        Object.assign(extensionsPanelElement.style, {
            left: `${Math.round(rect.left + marginX)}px`,
            top: `${Math.round(rect.top + marginY)}px`,
            width: `${Math.round(Math.max(480, rect.width - marginX * 2))}px`,
            height: `${Math.round(Math.max(420, rect.height - marginY * 2))}px`,
        });
        return true;
    }

    function destroyExtensionsPanel() {
        try { extensionsPanelElement?.remove?.(); } catch (_) {}
        extensionsPanelElement = null;
        extensionsPanelContent = null;
        refreshRoomMascotOverlay?.();
        return true;
    }

    function closeExtensionsPanel(returnToExtensionsList = true) {
        const wasNative = extensionsOpenedFromNativePreference;
        extensionsOpenedFromNativePreference = false;
        destroyExtensionsPanel();

        if (wasNative && returnToExtensionsList && extensionsPreferenceScreenActive()) {
            try {
                if (typeof window.PreferenceSubscreenExtensionsClear === "function") {
                    window.PreferenceSubscreenExtensionsClear();
                }
            } catch (e) {
                warn("Could not clear the native Extensions selection:", e);
            }
            window.setTimeout(() => {
                try {
                    if (String(window.CurrentScreen || "") === "Preference" &&
                        typeof window.PreferenceOpenSubscreen === "function") {
                        window.PreferenceOpenSubscreen("Extensions");
                    }
                } catch (_) {}
            }, 0);
        }
        return true;
    }

    function openExtensionsPanel(tab = "status", fromNativePreference = false) {
        if (EXTENSIONS_TABS.includes(String(tab).toLowerCase())) extensionsActiveTab = String(tab).toLowerCase();
        destroyExtensionsPanel();
        if (fromNativePreference) extensionsOpenedFromNativePreference = true;
        removeRoomMascotOverlay?.();

        const root = document.createElement("div");
        root.className = "SubbysPlushiesExtensionsPanel";
        Object.assign(root.style, {
            position: "fixed",
            zIndex: "2147483200",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: `2px solid ${getExtensionsStyle().border}`,
            borderRadius: "14px",
            background: getExtensionsStyle().background,
            color: getExtensionsStyle().text,
            font: `${extensionsLayoutMetrics().fontSize}px Arial, sans-serif`,
            boxShadow: `7px 9px 0 ${getExtensionsStyle().shadow}, 0 12px 30px rgba(0,0,0,0.38)`,
        });

        const header = document.createElement("div");
        header.className = "SubbysPlushiesExtensionsHeader";
        Object.assign(header.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            padding: "12px 16px 9px",
            borderBottom: `1px solid ${getExtensionsStyle().border}`,
            background: getExtensionsStyle().header,
        });
        const titleWrap = document.createElement("div");
        const title = document.createElement("div");
        title.className = "SubbysPlushiesExtensionsTitle";
        title.textContent = "Subby's Plushies";
        Object.assign(title.style, { fontSize: "23px", fontWeight: "bold", color: getExtensionsStyle().text, letterSpacing: "0.03em" });
        const subtitle = document.createElement("div");
        subtitle.className = "SubbysPlushiesExtensionsSubtitle";
        subtitle.textContent = `Extensions Control Center • v${VERSION}`;
        Object.assign(subtitle.style, { color: getExtensionsStyle().muted, fontSize: "12px", marginTop: "2px" });
        titleWrap.append(title, subtitle);
        const close = makeExtensionsButton("Back", () => closeExtensionsPanel(true));
        header.append(titleWrap, close);

        const tabs = document.createElement("div");
        tabs.className = "SubbysPlushiesExtensionsTabs";
        Object.assign(tabs.style, {
            display: "flex",
            gap: "8px",
            padding: "10px 16px",
            borderBottom: `1px solid ${getExtensionsStyle().border}88`,
            background: getExtensionsStyle().header,
            flexWrap: "wrap",
        });
        const labels = { status: "Status", lore: "Lore", plushies: "Plushies", history: "History", settings: "Settings", layout: "Layout", stats: "Stats", achievements: "Achievements", backup: "Backup", commands: "Commands" };
        for (const tab of EXTENSIONS_TABS) {
            const button = makeExtensionsButton(labels[tab], () => {
                extensionsActiveTab = tab;
                renderExtensionsPanel();
            }, { active: tab === extensionsActiveTab });
            button.dataset.tab = tab;
            tabs.appendChild(button);
        }

        const content = document.createElement("div");
        content.className = "SubbysPlushiesExtensionsContent";
        Object.assign(content.style, {
            padding: "14px 16px 18px",
            background: getExtensionsStyle().background,
            overflowY: "auto",
            overscrollBehavior: "contain",
            flex: "1 1 auto",
        });

        root.append(header, tabs, content);
        document.body.appendChild(root);
        extensionsPanelElement = root;
        extensionsPanelContent = content;
        positionExtensionsPanel();
        renderExtensionsPanel();
        return true;
    }

    function nativeExtensionsEntryAlreadyRegistered() {
        const display = window.PreferenceExtensionsDisplay;
        if (!Array.isArray(display)) return false;
        return display.some(entry =>
            String(entry?.Identifier || "") === EXTENSIONS_IDENTIFIER ||
            String(entry?.Button || entry?.ButtonText || "").trim() === EXTENSIONS_BUTTON_TEXT ||
            String(entry?.Button || entry?.ButtonText || "").trim() === `${EXTENSIONS_BUTTON_TEXT} Settings`
        );
    }

    function installPreferencesExtensionsIntegration() {
        if (extensionsIntegrationInstalled || extensionsNativeRegistered) return true;
        if (typeof window.PreferenceRegisterExtensionSetting !== "function") return false;

        if (nativeExtensionsEntryAlreadyRegistered()) {
            extensionsNativeRegistered = true;
            extensionsIntegrationInstalled = true;
            return true;
        }

        try {
            window.PreferenceRegisterExtensionSetting({
                Identifier: EXTENSIONS_IDENTIFIER,
                ButtonText: EXTENSIONS_BUTTON_TEXT,
                Image: renderImages[0] || PLUSH_FALLBACK_IMAGE,
                load: () => {
                    extensionsOpenedFromNativePreference = true;
                    openExtensionsPanel("status", true);
                },
                run: () => {
                    if (!extensionsPanelElement?.isConnected) openExtensionsPanel(extensionsActiveTab, true);
                    else positionExtensionsPanel();
                },
                click: () => {},
                exit: () => {
                    extensionsOpenedFromNativePreference = false;
                    destroyExtensionsPanel();
                },
            });
            extensionsNativeRegistered = true;
            extensionsIntegrationInstalled = true;
            log("Registered Subby's Plushies in BC's native Preferences > Extensions list.");

            if (extensionsIntegrationTimer != null) {
                window.clearInterval(extensionsIntegrationTimer);
                extensionsIntegrationTimer = null;
            }
            return true;
        } catch (e) {
            warn("Could not register Subby's Plushies in the native Extensions list yet:", e);
            return false;
        }
    }

    function startPreferencesExtensionsIntegration() {
        if (installPreferencesExtensionsIntegration()) return;
        if (extensionsIntegrationTimer != null) return;
        extensionsIntegrationTimer = window.setInterval(() => installPreferencesExtensionsIntegration(), 3000);
    }

    function clearChatInput() {
        const input = document.getElementById("InputChat");
        if (input) input.value = "";
    }

    function flattenPlushieCommands() {
        const entries = [];
        const seen = new Set();
        for (const group of commandGroupsForDisplay()) {
            for (const entry of group.commands || []) {
                const command = String(Array.isArray(entry) ? entry[0] : entry?.command || "").trim();
                const description = String(Array.isArray(entry) ? entry[1] : entry?.description || "").trim();
                if (!command) continue;
                const base = command.split(/\s+/)[0].toLowerCase();
                if (!base.startsWith("/plushie") || seen.has(base)) continue;
                seen.add(base);
                entries.push({ command, base, description });
            }
        }
        return entries;
    }

    function plushieAutocompleteCandidates(value) {
        const raw = String(value || "").trimStart();
        const lower = raw.toLowerCase();
        if (!lower.startsWith("/plu") && !lower.startsWith("/help p")) return [];

        const argumentGroups = [
            ["/plushieemote ", ["happy", "angry", "sleepy", "protective", "sulky"]],
            ["/plushieperformance ", ["normal", "low"]],
            ["/plushiedrag ", ["on", "off"]],
            ["/plushiemascot ", ["set", "clear", "show", "hide"]],
            ["/plushieposesave ", ["1", "2", "3"]],
            ["/plushieposeload ", ["1", "2", "3"]],
            ["/plushieposeclear ", ["1", "2", "3"]],
            ["/plushiesnap ", PLUSH_SNAP_POINTS.map(point => String(point.name || "").toLowerCase())],
        ];
        for (const [prefix, values] of argumentGroups) {
            if (lower.startsWith(prefix)) {
                return values.map(value => `${prefix}${value}`).filter(candidate => candidate.startsWith(lower));
            }
        }

        if (lower.startsWith("/help p")) {
            return ["/help plushie", "/help plushies"].filter(candidate => candidate.startsWith(lower));
        }

        if (!plushieCommandAutocompleteCache) {
            plushieCommandAutocompleteCache = flattenPlushieCommands().map(entry => entry.base).sort();
        }
        return plushieCommandAutocompleteCache.filter(candidate => candidate.startsWith(lower));
    }

    function handlePlushieChatAutocomplete(event, input) {
        if (event.key !== "Tab") {
            plushieCommandAutocompleteState = null;
            return false;
        }
        const current = String(input?.value || "");
        let state = plushieCommandAutocompleteState;
        if (!state || state.lastValue !== current || !Array.isArray(state.candidates) || !state.candidates.length) {
            const candidates = plushieAutocompleteCandidates(current);
            if (!candidates.length) {
                plushieCommandAutocompleteState = null;
                return false;
            }
            state = { candidates, index: -1, lastValue: current };
        }
        state.index = (state.index + 1) % state.candidates.length;
        const nextValue = state.candidates[state.index];
        state.lastValue = nextValue;
        plushieCommandAutocompleteState = state;
        input.value = nextValue;
        try { input.setSelectionRange(nextValue.length, nextValue.length); } catch (_) {}
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return true;
    }

    function showPlushieHelp({ detailed = false } = {}) {
        const groups = commandGroupsForDisplay();
        if (detailed) {
            const lines = [];
            for (const group of groups) {
                const commands = [];
                for (const entry of group.commands || []) {
                    const command = String(Array.isArray(entry) ? entry[0] : entry?.command || "").trim();
                    const description = String(Array.isArray(entry) ? entry[1] : entry?.description || "").trim();
                    if (!command || !command.toLowerCase().startsWith("/plushie")) continue;
                    commands.push(description ? `${command} — ${description}` : command);
                }
                if (commands.length) lines.push(`${group.title}:`, ...commands);
            }
            appendLocalInfoBox("Subby's Plushies commands", lines, { compact: true });
            return true;
        }

        const names = flattenPlushieCommands().map(entry => entry.base);
        const chunks = [];
        for (let i = 0; i < names.length; i += 8) chunks.push(names.slice(i, i + 8).join(" • "));
        appendLocalInfoBox("Subby's Plushies — /help", [
            "Plushie commands are available in this room:",
            ...chunks,
            "Type /help plushie for descriptions. Press Tab while typing /plu… to autocomplete.",
        ], { compact: true });
        return true;
    }

    function requireReady(action) {
        if (ready) {
            action();
            return;
        }

        warn(
            failed
                ? "Startup failed. Run /plushiedebug and check the console."
                : "Subby's Plushies is still loading. Wait for the READY message."
        );
    }

    function consumeCommand(command) {
        if (command === "/help plushie" || command === "/help plushies") {
            requireReady(() => showPlushieHelp({ detailed: true }));
            return true;
        }
        if (command === "/plushieextensions" || command === "/plushiesettings") {
            requireReady(() => openExtensionsPanel("settings"));
            return true;
        }
        if (command === "/plushiestatus") {
            requireReady(() => openExtensionsPanel("status"));
            return true;
        }
        if (command === "/plushiecommands" || command === "/plushiecommand") {
            requireReady(() => openExtensionsPanel("commands"));
            return true;
        }
        if (command === "/plushielayout") {
            requireReady(() => openExtensionsPanel("layout"));
            return true;
        }
        if (command === "/plushieplushies" || command === "/plushieposes") {
            requireReady(() => openExtensionsPanel("plushies"));
            return true;
        }
        if (command === "/plushiebackup") {
            requireReady(() => openExtensionsPanel("backup"));
            return true;
        }
        if (command === "/plushieexport") {
            requireReady(() => { void exportPlushBackup(); });
            return true;
        }
        if (command === "/plushieimport") {
            requireReady(importPlushBackupFromFile);
            return true;
        }
        if (command === "/plushiefavorite") {
            requireReady(() => {
                const name = currentPlushName();
                const enabled = toggleFavoritePlush(name);
                appendLocalInfoBox("Favorite plushie", [`${name} is now ${enabled ? "a favorite ★" : "removed from favorites"}.`], { compact: true });
            });
            return true;
        }
        if (command.startsWith("/plushieemote ")) {
            requireReady(() => {
                const type = command.slice("/plushieemote ".length).trim();
                if (!triggerPlushEmote(type)) appendLocalInfoBox("Plushie emote", ["Use: /plushieemote happy|angry|sleepy|protective|sulky"], { compact: true });
            });
            return true;
        }
        if (command.startsWith("/plushieposesave ")) {
            requireReady(() => {
                const slot = Number(command.slice("/plushieposesave ".length).trim());
                const saved = saveCurrentPose(slot);
                appendLocalInfoBox("Saved pose", [saved ? `Saved ${currentPlushName()} Pose ${slot}.` : "Use Pose 1, 2, or 3 while holding a plushie."], { compact: true });
            });
            return true;
        }
        if (command.startsWith("/plushieposeload ")) {
            requireReady(() => {
                const slot = Number(command.slice("/plushieposeload ".length).trim());
                appendLocalInfoBox("Saved pose", [applySavedPose(slot) ? `Applied ${currentPlushName()} Pose ${slot}.` : "That pose slot is empty or invalid."], { compact: true });
            });
            return true;
        }
        if (command.startsWith("/plushieposeclear ")) {
            requireReady(() => {
                const slot = Number(command.slice("/plushieposeclear ".length).trim());
                appendLocalInfoBox("Saved pose", [clearSavedPose(slot) ? `Cleared ${currentPlushName()} Pose ${slot}.` : "That pose slot is already empty or invalid."], { compact: true });
            });
            return true;
        }
        if (command === "/plushielore") {
            requireReady(() => openLoreBrowser(currentPlushName()));
            return true;
        }
        if (command === "/plushiemood" || command === "/plushieinfo") {
            requireReady(showCurrentPlushInfo);
            return true;
        }
        if (command === "/plushieprotect") {
            requireReady(() => {
                const enabled = toggleFeatureSetting("protectMe");
                appendLocalInfoBox("Protect Me", [`Protect Me mode is now ${enabled ? "ON" : "off"}.`]);
            });
            return true;
        }
        if (command === "/plushiejealous") {
            requireReady(() => {
                const enabled = toggleFeatureSetting("jealousPlushie");
                appendLocalInfoBox("Jealous Plushie", [`Jealous Plushie mode is now ${enabled ? "ON" : "off"}.`]);
            });
            return true;
        }
        if (command === "/plushiedrag" || command.startsWith("/plushiedrag ")) {
            requireReady(() => {
                const arg = command.slice("/plushiedrag".length).trim();
                const enabled = arg === "on"
                    ? setDragMode(true)
                    : (arg === "off" ? setDragMode(false) : toggleDragMode());
                appendLocalInfoBox("Easy Drag", [
                    `Easy Drag is now ${enabled ? "ON" : "off"}.`,
                    enabled
                        ? "Drag anywhere on the character area to move the held plushie. Use the floating Drag button to turn it off."
                        : "Normal character clicks are restored.",
                ]);
            });
            return true;
        }
        if (command.startsWith("/plushiesnap ")) {
            requireReady(() => snapCurrentPlushTo(command.slice("/plushiesnap ".length)));
            return true;
        }
        if (command === "/plushiemascothide") {
            requireReady(() => setRoomMascotOverlayVisible(false));
            return true;
        }
        if (command === "/plushiemascotshow") {
            requireReady(() => setRoomMascotOverlayVisible(true));
            return true;
        }
        if (command.startsWith("/plushiemascot")) {
            requireReady(() => handleRoomMascotCommand(command));
            return true;
        }
        if (command === "/plushiedata") {
            requireReady(showGitDataStatus);
            return true;
        }
        if (command === "/plushiedatareload") {
            requireReady(() => { void refreshGitDataFromGitHub({ force: true, silent: false }); });
            return true;
        }

        if (command === "/plushieupdateopen") {
            requireReady(() => { void openLatestUpdatePage(); });
            return true;
        }
        if (command === "/plushieupdate") {
            requireReady(() => { void checkForUpdates({ silent: false }); });
            return true;
        }
        if (command === "/plushiehistory") { requireReady(() => openExtensionsPanel("history")); return true; }
        if (command === "/plushieperformance" || command.startsWith("/plushieperformance ")) {
            requireReady(() => {
                const arg = command.slice("/plushieperformance".length).trim();
                if (!arg) {
                    appendLocalInfoBox("Performance mode", [`Current mode: ${isLowCpuMode() ? "Low CPU" : "Normal"}.`, "Use /plushieperformance normal or /plushieperformance low."], { compact: true });
                    return;
                }
                const normalized = arg.toLowerCase();
                if (!["normal", "low", "lowcpu", "low cpu"].includes(normalized)) {
                    appendLocalInfoBox("Performance mode", ["Use /plushieperformance normal or /plushieperformance low."], { compact: true });
                    return;
                }
                const mode = setPerformanceMode(normalized);
                appendLocalInfoBox("Performance mode", [`Performance mode is now ${mode === "low" ? "Low CPU" : "Normal"}.`], { compact: true });
            });
            return true;
        }
        if (command === "/plushiestats") { requireReady(() => openExtensionsPanel("stats")); return true; }
        if (command === "/plushieachievements" || command === "/plushieach") { requireReady(() => openExtensionsPanel("achievements")); return true; }
        if (command === "/plushiespeak" || command === "/plushiebubble") { requireReady(() => showSpeechBubble(null, { force: true })); return true; }
        if (command === "/plushieidle") { requireReady(() => { const enabled = toggleFeatureSetting("idleAnimations"); appendLocalInfoBox("Idle Animation", [`Idle Animation is now ${enabled ? "ON" : "off"}.`]); }); return true; }
        if (command === "/plushiespeech") { requireReady(() => { const enabled = toggleFeatureSetting("speechBubbles"); appendLocalInfoBox("Speech Bubbles", [`Speech Bubbles are now ${enabled ? "ON" : "off"}.`]); }); return true; }
        if (command === "/plushiebattle" || command.startsWith("/plushiebattle ")) {
            requireReady(() => challengePlushBattle(command.slice("/plushiebattle".length).trim()));
            return true;
        }
        if (command === "/plushiefeatures") {
            requireReady(() => {
                const settings = getFeatureSettings();
                appendLocalInfoBox("Subby's Plushies features", [
                    `Protect Me: ${settings.protectMe ? "ON" : "off"}`,
                    `Jealous Plushie: ${settings.jealousPlushie ? "ON" : "off"}`,
                    `Easy Drag: ${dragModeEnabled ? "ON" : "off"}`,
                    `Room mascot: ${roomMascotState?.name || "none"} (${settings.showRoomMascot ? "picture visible" : "picture hidden"})`,
                    `Automatic update checks: ${settings.autoUpdateChecks ? "ON" : "off"}`,
                    `Idle animations: ${settings.idleAnimations ? "ON" : "off"}`,
                    `Speech bubbles: ${settings.speechBubbles ? "ON" : "off"}`,
                    `Performance mode: ${settings.performanceMode === "low" ? "Low CPU" : "Normal"}`,
                ]);
            });
            return true;
        }

        switch (command) {
            case "/plushie":
                requireReady(equip);
                return true;

            case "/plushieuse":
                requireReady(useItem);
                return true;

            case "/plushieposition":
            case "/plushiemove":
            case "/plushieresize":
                requireReady(openNativeLayering);
                return true;

            case "/plushiehands":
            case "/plushiecenter":
                resetPosition();
                return true;

            case "/plushieremove":
                remove();
                return true;

            case "/plushierecover":
                recover();
                return true;

            case "/plushiepurr":
                void playPurrSfx(`manual:${Date.now()}`, "manual command");
                return true;

            case "/plushiedebug":
                debug();
                return true;

            default:
                return false;
        }
    }

    document.addEventListener(
        "keydown",
        event => {
            const input = document.getElementById("InputChat");
            if (!input || document.activeElement !== input) return;
            if (handlePlushieChatAutocomplete(event, input)) return;
            if (event.key !== "Enter") return;

            const command = String(input.value || "").trim().toLowerCase();
            if (!consumeCommand(command)) return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            clearChatInput();
        },
        true
    );

    function installNativeCommandFallbackHook() {
        if (installedHooks.has("ChatRoomSendChat")) {
            nativeCommandHookInstalled = true;
            return true;
        }
        if (typeof window.ChatRoomSendChat !== "function") return false;

        const installed = installHook("ChatRoomSendChat", 20000, (args, next) => {
            const input = document.getElementById("InputChat");
            const command = String(input?.value || "").trim().toLowerCase();
            if (!command) return next(args);
            if (command === "/help") {
                const result = next(args);
                window.setTimeout(() => { if (ready) showPlushieHelp({ detailed: false }); }, 0);
                return result;
            }
            if (!consumeCommand(command)) return next(args);
            clearChatInput();
            return;
        });
        nativeCommandHookInstalled = installed;
        if (installed) log("Installed native ChatRoomSendChat command fallback.");
        return installed;
    }

    function scheduleNativeCommandFallbackHook() {
        for (const delay of [0, 250, 1000, 3000, 8000]) {
            window.setTimeout(() => {
                if (!nativeCommandHookInstalled) installNativeCommandFallbackHook();
            }, delay);
        }
    }

    function allocateHugTightlyActivityID(activities) {
        let activityID = HUG_TIGHTLY_ACTIVITY_ID_BASE;
        const usedIDs = new Set(activities.map(activity => activity?.ActivityID).filter(Number.isFinite));
        while (usedIDs.has(activityID)) activityID++;
        return activityID;
    }

    function makeHugTightlyActivity(activities) {
        const activityID = allocateHugTightlyActivityID(activities);
        hugTightlyActivityID = activityID;

        return {
            Name: HUG_TIGHTLY_ACTIVITY_NAME,
            ActivityID: activityID,
            MaxProgress: 0,
            Prerequisite: ["UseHands"],
            Target: ["ItemHands"],
            TargetSelf: true,
            ActivityExpression: [
                { Group: "Mouth", Name: "Grin", Timer: 10 },
            ],
        };
    }

    function allocateCustomActivityID(activities, offset = 0) {
        let activityID = CUSTOM_ACTIVITY_ID_BASE + offset;
        const usedIDs = new Set(activities.map(activity => activity?.ActivityID).filter(Number.isFinite));
        while (usedIDs.has(activityID)) activityID++;
        return activityID;
    }

    function makeCustomActivity(spec, activities, offset) {
        return {
            Name: spec.name,
            ActivityID: allocateCustomActivityID(activities, offset),
            MaxProgress: 0,
            Prerequisite: ["UseHands"],
            Target: [...spec.targets],
            TargetSelf: !!spec.targetSelf,
            ActivityExpression: [
                { Group: "Blush", Name: "Low", Timer: 10 },
            ],
        };
    }

    function ensureCustomActivitiesRegistered(reason = "availability check") {
        const activities = window.ActivityFemale3DCG;
        if (!Array.isArray(activities)) return false;

        for (let i = 0; i < CUSTOM_PLUSH_ACTIVITIES.length; i++) {
            const spec = CUSTOM_PLUSH_ACTIVITIES[i];
            let activity = activities.find(entry => entry?.Name === spec.name);
            if (!activity) {
                activity = makeCustomActivity(spec, activities, i);
                activities.push(activity);
                log(`Enabled ${spec.label} activity (ID ${activity.ActivityID}).`);
            }
            customActivityObjects.set(spec.key, activity);
        }

        customActivitiesRegistration = `active (${reason})`;
        return true;
    }

    function removeCustomActivities(reason = "availability check") {
        const activities = window.ActivityFemale3DCG;
        if (!Array.isArray(activities)) return false;

        const names = new Set(CUSTOM_PLUSH_ACTIVITIES.map(spec => spec.name));
        let removed = 0;
        for (let i = activities.length - 1; i >= 0; i--) {
            if (names.has(activities[i]?.Name)) {
                activities.splice(i, 1);
                removed++;
            }
        }

        customActivityObjects.clear();
        customActivitiesRegistration = `inactive (${reason})`;
        if (removed) log(`Disabled ${removed} extra plush activit${removed === 1 ? "y" : "ies"} (${reason}).`);
        return removed > 0;
    }

    function compactActivityName(value) {
        return String(value || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
    }

    function customActivityFromKnownString(value) {
        if (typeof value !== "string" || !value) return null;

        const direct = CUSTOM_ACTIVITY_BY_NAME.get(value);
        if (direct) return direct;

        const lower = value.toLowerCase();
        if (!lower.includes("subbysplushies") && !lower.includes("plushie")) return null;

        const compact = compactActivityName(value);
        for (const token of CUSTOM_ACTIVITY_FAST_TOKENS) {
            if (compact === token.compactName || compact === token.compactLabel ||
                compact.includes(token.compactName)) return token.spec;
        }
        return null;
    }

    function inspectActivityRunFast(args) {
        const values = Array.isArray(args) ? args : [args];
        let customSpec = null;
        let hugTightly = false;

        const inspectString = value => {
            if (typeof value !== "string" || !value) return;
            if (value === HUG_TIGHTLY_ACTIVITY_NAME) {
                hugTightly = true;
                return;
            }
            if (!customSpec) customSpec = customActivityFromKnownString(value);
        };

        const inspectObject = value => {
            if (!value || typeof value !== "object") return;
            if (value === hugTightlyActivityObject) hugTightly = true;
            if (!customSpec) {
                for (const activity of customActivityObjects.values()) {
                    if (value === activity) {
                        customSpec = CUSTOM_ACTIVITY_BY_NAME.get(activity?.Name) || null;
                        break;
                    }
                }
            }

            inspectString(value.Name);
            inspectString(value.ActivityName);
            inspectString(typeof value.Activity === "string" ? value.Activity : null);
            inspectString(value.Content);

            const nested = value.Activity;
            if (nested && typeof nested === "object") {
                if (nested === hugTightlyActivityObject) hugTightly = true;
                inspectString(nested.Name);
                inspectString(nested.ActivityName);
                inspectString(typeof nested.Activity === "string" ? nested.Activity : null);
            }
        };

        for (const value of values) {
            if (typeof value === "string") inspectString(value);
            else inspectObject(value);
            if (customSpec && hugTightly) break;
        }

        return { customSpec, hugTightly };
    }

    function identifyCustomActivity(value, depth = 0, seen = new Set()) {
        if (depth > 6 || value == null) return null;

        if (typeof value === "string") {
            const compact = compactActivityName(value);
            for (const spec of CUSTOM_PLUSH_ACTIVITIES) {
                const compactName = compactActivityName(spec.name);
                if (compact.includes(compactName) || compact.includes(compactActivityName(spec.label))) {
                    return spec;
                }
            }
            return null;
        }

        if (typeof value !== "object") return null;
        if (seen.has(value)) return null;
        seen.add(value);

        if (Array.isArray(value)) {
            for (const entry of value) {
                const spec = identifyCustomActivity(entry, depth + 1, seen);
                if (spec) return spec;
            }
            return null;
        }

        for (const [key, entry] of Object.entries(value)) {
            const keySpec = identifyCustomActivity(key, depth + 1, seen);
            if (keySpec) return keySpec;
            const entrySpec = identifyCustomActivity(entry, depth + 1, seen);
            if (entrySpec) return entrySpec;
        }

        return null;
    }

    function getCustomActivityFromAction(data) {
        const key = getDictionaryText(data, CUSTOM_ACTIVITY_MARKER_TAG);
        if (key && CUSTOM_ACTIVITY_BY_KEY.has(key)) return CUSTOM_ACTIVITY_BY_KEY.get(key);
        return identifyCustomActivity(data);
    }

    function activityTemplate(spec, self, sourceName, targetName) {
        const template = self ? spec.selfText : (spec.otherText || spec.selfText);
        return template
            .replaceAll("{Source}", sourceName || "Someone")
            .replaceAll("{Target}", targetName || "someone");
    }

    function getActionCharacterContext(data, fallbackTarget = null) {
        const dictionary = Array.isArray(data?.Dictionary) ? data.Dictionary : [];

        const numberFrom = (...values) => {
            for (const value of values) {
                const n = Number(value);
                if (Number.isFinite(n)) return n;
            }
            return null;
        };

        const memberFromDirectKeys = keys => {
            for (const entry of dictionary) {
                if (!entry || typeof entry !== "object") continue;
                for (const key of keys) {
                    const n = Number(entry[key]);
                    if (Number.isFinite(n)) return n;
                }
            }
            return null;
        };

        const textFromTags = tags => {
            for (const tag of tags) {
                const entry = dictionary.find(item => item?.Tag === tag);
                if (typeof entry?.Text === "string" && entry.Text.trim()) return entry.Text.trim();
            }
            return null;
        };

        const memberFromTags = tags => {
            for (const tag of tags) {
                const entry = dictionary.find(item => item?.Tag === tag);
                const n = numberFrom(entry?.MemberNumber, entry?.Text);
                if (Number.isFinite(n)) return n;
            }
            return null;
        };

        const sourceMember = numberFrom(
            data?.Sender,
            data?.SourceMemberNumber,
            memberFromDirectKeys(["SourceCharacter", "SourceCharacterMemberNumber"]),
            memberFromTags([
                CUSTOM_ACTIVITY_SOURCE_MEMBER_TAG,
                "SourceCharacter",
                "SourceCharacterMemberNumber",
            ])
        );

        const targetMember = numberFrom(
            data?.Target,
            data?.TargetMemberNumber,
            data?.DestinationMemberNumber,
            memberFromDirectKeys([
                "TargetCharacter",
                "DestinationCharacter",
                "TargetCharacterMemberNumber",
                "DestinationCharacterMemberNumber",
            ]),
            memberFromTags([
                CUSTOM_ACTIVITY_TARGET_MEMBER_TAG,
                "DestinationCharacter",
                "DestinationCharacterMemberNumber",
                "TargetCharacter",
                "TargetCharacterMemberNumber",
            ]),
            fallbackTarget?.MemberNumber
        );

        const characterByMember = member => {
            if (!Number.isFinite(member)) return null;
            if (window.Player?.MemberNumber === member) return window.Player;
            if (!Array.isArray(window.ChatRoomCharacter)) return null;
            return window.ChatRoomCharacter.find(C => C?.MemberNumber === member) || null;
        };

        const sourceCharacter = characterByMember(sourceMember);
        const targetCharacter = characterByMember(targetMember);

        const sourceName =
            getCharacterDisplayName(sourceCharacter) ||
            getDictionaryText(data, CUSTOM_ACTIVITY_SOURCE_NAME_TAG) ||
            textFromTags(["SourceCharacterName", "SourceCharacter"]) ||
            null;

        const targetName =
            getCharacterDisplayName(targetCharacter) ||
            getDictionaryText(data, CUSTOM_ACTIVITY_TARGET_NAME_TAG) ||
            textFromTags(["DestinationCharacterName", "TargetCharacterName", "DestinationCharacter", "TargetCharacter"]) ||
            getCharacterDisplayName(fallbackTarget) ||
            null;

        return { sourceMember, targetMember, sourceName, targetName };
    }

    function getCharacterDisplayName(C) {
        if (!C) return null;
        try {
            if (typeof CharacterNickname === "function") return CharacterNickname(C);
        } catch (_) {}
        return C.Nickname || C.Name || null;
    }

    function looksLikeCharacter(value) {
        return !!value &&
            typeof value === "object" &&
            Number.isFinite(value.MemberNumber) &&
            (
                Array.isArray(value.Appearance) ||
                typeof value.Name === "string" ||
                typeof value.Nickname === "string" ||
                typeof value.AssetFamily === "string"
            );
    }

    function findActivityTargetFast(args) {
        const playerMember = window.Player?.MemberNumber;
        const candidates = [];
        const add = value => {
            if (!looksLikeCharacter(value) || candidates.includes(value)) return;
            candidates.push(value);
        };

        add(window.DialogFocusCharacter);
        add(window.CurrentCharacter);

        const values = Array.isArray(args) ? args : [args];
        const knownKeys = [
            "Target", "TargetCharacter", "DestinationCharacter", "Character",
            "SourceCharacter", "C", "target", "character",
        ];
        for (const value of values) {
            add(value);
            if (!value || typeof value !== "object") continue;
            for (const key of knownKeys) add(value[key]);

            const activity = value.Activity;
            if (activity && typeof activity === "object") {
                for (const key of knownKeys) add(activity[key]);
            }
        }

        const other = candidates.find(C =>
            Number.isFinite(C?.MemberNumber) &&
            (!Number.isFinite(playerMember) || C.MemberNumber !== playerMember)
        );
        if (other) return other;

        const self = candidates.find(C =>
            Number.isFinite(C?.MemberNumber) &&
            Number.isFinite(playerMember) &&
            C.MemberNumber === playerMember
        );
        return self || window.DialogFocusCharacter || window.CurrentCharacter || window.Player || null;
    }

    function findActivityTargetFromArgs(args) {
        const playerMember = window.Player?.MemberNumber;
        const candidates = [];

        const add = value => {
            if (!looksLikeCharacter(value)) return;
            if (!candidates.includes(value)) candidates.push(value);
        };

        add(window.DialogFocusCharacter);
        add(window.CurrentCharacter);

        const seen = new Set();
        const walk = (value, depth = 0) => {
            if (depth > 5 || value == null) return;
            if (looksLikeCharacter(value)) {
                add(value);
                return;
            }
            if (typeof value !== "object" || seen.has(value)) return;
            seen.add(value);

            if (Array.isArray(value)) {
                for (const entry of value) walk(entry, depth + 1);
                return;
            }
            for (const entry of Object.values(value)) walk(entry, depth + 1);
        };

        walk(args);

        const other = candidates.find(C =>
            Number.isFinite(C?.MemberNumber) &&
            (!Number.isFinite(playerMember) || C.MemberNumber !== playerMember)
        );
        if (other) return other;

        const self = candidates.find(C =>
            Number.isFinite(C?.MemberNumber) &&
            Number.isFinite(playerMember) &&
            C.MemberNumber === playerMember
        );
        return self || window.Player || null;
    }

    function makeCustomActivityNetworkAction(originalData, spec, fallbackTarget = null) {
        const playerName = getCharacterDisplayName(window.Player) || "Someone";
        const playerMember = Number.isFinite(window.Player?.MemberNumber) ? window.Player.MemberNumber : null;
        const context = getActionCharacterContext(originalData, fallbackTarget);
        const targetName = context.targetName || getCharacterDisplayName(fallbackTarget);
        const targetMember = Number.isFinite(context.targetMember)
            ? context.targetMember
            : (Number.isFinite(fallbackTarget?.MemberNumber) ? fallbackTarget.MemberNumber : null);

        const isSelf =
            (Number.isFinite(playerMember) && Number.isFinite(targetMember) && playerMember === targetMember) ||
            (!!targetName && targetName === playerName) ||
            fallbackTarget === window.Player;

        const token = `${playerMember ?? "local"}:${Date.now()}:${++customActivityEventSequence}:${spec.key}`;
        const message = activityTemplate(spec, isSelf, playerName, targetName);

        const preserved = Array.isArray(originalData?.Dictionary)
            ? originalData.Dictionary.filter(entry => {
                const tag = String(entry?.Tag || "");
                return ![
                    "Beep",
                    "msg",
                    CUSTOM_ACTIVITY_MARKER_TAG,
                    CUSTOM_ACTIVITY_TOKEN_TAG,
                    CUSTOM_ACTIVITY_SOURCE_MEMBER_TAG,
                    CUSTOM_ACTIVITY_SOURCE_NAME_TAG,
                    CUSTOM_ACTIVITY_TARGET_MEMBER_TAG,
                    CUSTOM_ACTIVITY_TARGET_NAME_TAG,
                ].includes(tag);
            })
            : [];

        const dictionary = [
            ...preserved,
            { Tag: "Beep", Text: "msg" },
            { Tag: "msg", Text: message },
            { Tag: CUSTOM_ACTIVITY_MARKER_TAG, Text: spec.key },
            { Tag: CUSTOM_ACTIVITY_TOKEN_TAG, Text: token },
            { Tag: CUSTOM_ACTIVITY_SOURCE_NAME_TAG, Text: playerName },
        ];

        if (Number.isFinite(playerMember)) {
            dictionary.push({ Tag: CUSTOM_ACTIVITY_SOURCE_MEMBER_TAG, Text: String(playerMember), MemberNumber: playerMember });
        }
        if (targetName) dictionary.push({ Tag: CUSTOM_ACTIVITY_TARGET_NAME_TAG, Text: targetName });
        if (Number.isFinite(targetMember)) {
            dictionary.push({ Tag: CUSTOM_ACTIVITY_TARGET_MEMBER_TAG, Text: String(targetMember), MemberNumber: targetMember });
        }

        return {
            data: {
                ...originalData,
                ...(Number.isFinite(targetMember) ? { Target: targetMember } : {}),
                Content: "Beep",
                Type: "Action",
                Dictionary: dictionary,
            },
            token,
            targetMember,
            targetName,
            isSelf,
        };
    }

    function pruneOfferPromptTokens(now = Date.now()) {
        for (const [token, timestamp] of seenOfferPromptTokens) {
            if (now - timestamp > 60000) seenOfferPromptTokens.delete(token);
        }
    }

    function cloneTransferValue(value) {
        if (value == null) return value;
        try {
            if (typeof structuredClone === "function") return structuredClone(value);
        } catch (_) {}
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (_) {
            return value;
        }
    }

    function snapshotPlushItem(item) {
        if (!isOurs(item)) return null;
        const option = canonicalWirePlushOption(getItemPlushOption(item));
        if (!validPlushOption(option)) return null;

        return {
            assetName: ASSET_NAME,
            groupName: GROUP,
            option,
            color: cloneTransferValue(item.Color),
            difficulty: Number.isFinite(item.Difficulty) ? item.Difficulty : null,
            property: cloneTransferValue(item.Property || {}),
            craft: cloneTransferValue(item.Craft),
        };
    }

    function captureOfferedPlushSnapshot(sourceMember) {
        const sourceCharacter = getRoomCharacterByMember(sourceMember);
        if (!sourceCharacter) return null;
        return snapshotPlushItem(getHeld(sourceCharacter));
    }

    function prunePendingOutgoingPlushOffers(now = Date.now()) {
        for (const [member, pending] of pendingOutgoingPlushOffers) {
            if (!pending || now - pending.createdAt > OFFER_TRANSFER_PENDING_MS) {
                pendingOutgoingPlushOffers.delete(member);
            }
        }
    }

    function rememberOutgoingPlushOffer(targetMember, token) {
        if (!Number.isFinite(targetMember)) return false;
        const held = getHeld(window.Player);
        const snapshot = snapshotPlushItem(held);
        if (!snapshot) return false;

        prunePendingOutgoingPlushOffers();
        pendingOutgoingPlushOffers.set(targetMember, {
            targetMember,
            token: String(token || ""),
            option: snapshot.option,
            createdAt: Date.now(),
        });
        return true;
    }

    function sendOfferDecisionSignal(sourceMember, actorMember, token, decision) {
        if (!Number.isFinite(sourceMember) || !Number.isFinite(actorMember)) return false;
        if (typeof window.ServerSend !== "function") return false;

        const normalizedDecision = decision === "accepts" ? "accepts" : "declines";
        const message = {
            IsSubbysPlushies: true,
            protocol: OFFER_TRANSFER_SYNC_PROTOCOL,
            version: VERSION,
            kind: "offer-decision",
            sourceMember,
            actorMember,
            token: String(token || ""),
            decision: normalizedDecision,
        };

        const send = () => {
            window.ServerSend("ChatRoomChat", {
                Type: "Hidden",
                Content: OFFER_TRANSFER_SYNC_CONTENT,
                Sender: actorMember,
                Dictionary: [{ message }],
            });
        };

        let sent = false;
        for (const delay of OFFER_TRANSFER_SYNC_RETRY_DELAYS_MS) {
            if (delay === 0) {
                try {
                    send();
                    sent = true;
                } catch (e) {
                    warn("Could not send Offer Plushie transfer signal:", e);
                }
                continue;
            }
            window.setTimeout(() => {
                try { send(); } catch (e) { warn("Could not retry Offer Plushie transfer signal:", e); }
            }, delay);
        }
        return sent;
    }

    function parseOfferDecisionSignal(data) {
        if (!data || data.Type !== "Hidden" || data.Content !== OFFER_TRANSFER_SYNC_CONTENT) return null;
        const dictionary = Array.isArray(data.Dictionary) ? data.Dictionary : [];
        const entry = dictionary.find(part => part && typeof part === "object" && part.message && typeof part.message === "object");
        const message = entry?.message;
        if (!message || message.IsSubbysPlushies !== true || message.protocol !== OFFER_TRANSFER_SYNC_PROTOCOL || message.kind !== "offer-decision") return null;

        const sourceMember = Number(message.sourceMember);
        const actorMember = Number(message.actorMember);
        const senderMember = Number(data.Sender);
        const decision = String(message.decision || "").toLowerCase();
        if (!Number.isFinite(sourceMember) || !Number.isFinite(actorMember)) return null;
        if (Number.isFinite(senderMember) && senderMember !== actorMember) return null;
        if (decision !== "accepts" && decision !== "declines") return null;

        return {
            actorName: getCharacterDisplayName(getRoomCharacterByMember(actorMember)) || null,
            actorMember,
            decision,
            sourceName: getCharacterDisplayName(getRoomCharacterByMember(sourceMember)) || null,
            sourceMember,
            token: String(message.token || ""),
        };
    }

    function processOfferDecisionSignal(data) {
        const parsed = parseOfferDecisionSignal(data);
        if (!parsed) return false;
        offerSignalsReceived++;
        lastOfferSignalReceived = {
            ...parsed,
            sender: Number.isFinite(Number(data?.Sender)) ? Number(data.Sender) : null,
            at: new Date().toISOString(),
        };
        handleOfferDecision(parsed, "", "Hidden offer sync", parsed.token);
        return true;
    }

    function receiveOfferedPlush(sourceMember, sourceName, cachedSnapshot = null) {
        offerTransferReceiveAttempts++;

        const fail = reason => {
            offerTransferReceiveFailures++;
            lastOfferTransferFailure = {
                side: "recipient",
                reason,
                sourceMember: Number.isFinite(sourceMember) ? sourceMember : null,
                sourceName: sourceName || null,
                at: new Date().toISOString(),
            };
            return { ok: false, reason };
        };

        if (!Number.isFinite(sourceMember)) return fail("Could not identify the sender's member number.");
        if (getHeld(window.Player)) return fail("Your hands are occupied. Free your ItemHandheld slot and press Accept again.");

        const sourceCharacter = getRoomCharacterByMember(sourceMember);
        if (!sourceCharacter) return fail("The sender is no longer available in the room.");

        const sourceItem = getHeld(sourceCharacter);
        const liveSnapshot = snapshotPlushItem(sourceItem);
        const snapshot = liveSnapshot || cachedSnapshot;
        if (!liveSnapshot || !snapshot || snapshot.assetName !== ASSET_NAME || snapshot.groupName !== GROUP) {
            return fail("The offered plushie is no longer in the sender's hand.");
        }

        const originalProperty = cloneTransferValue(sourceItem?.Property || snapshot.property || {});
        const originalCraft = cloneTransferValue(sourceItem?.Craft ?? snapshot.craft);
        const originalColor = cloneTransferValue(sourceItem?.Color ?? snapshot.color);
        const originalDifficulty = Number.isFinite(sourceItem?.Difficulty)
            ? sourceItem.Difficulty
            : snapshot.difficulty;

        const publishTransfer = () => {
            try {
                if (typeof window.ChatRoomCharacterUpdate === "function") {
                    window.ChatRoomCharacterUpdate(sourceCharacter);
                }
            } catch (e) {
                warn("Offer Plushie could not publish sender CharacterUpdate:", e);
            }
            try {
                if (typeof window.ChatRoomCharacterUpdate === "function") {
                    window.ChatRoomCharacterUpdate(window.Player);
                }
            } catch (e) {
                warn("Offer Plushie could not publish recipient CharacterUpdate:", e);
            }
        };

        try {
            InventoryRemove(sourceCharacter, GROUP, false);

            if (isOurs(getHeld(sourceCharacter)) && Array.isArray(sourceCharacter.Appearance)) {
                sourceCharacter.Appearance = sourceCharacter.Appearance.filter(item => !(
                    item?.Asset?.Group?.Name === GROUP && item?.Asset?.Name === ASSET_NAME
                ));
            }

            if (isOurs(getHeld(sourceCharacter))) {
                throw new Error("BC did not remove the sender's ItemHandheld plushie on the accepting client.");
            }

            const received = InventoryWear(
                window.Player,
                ASSET_NAME,
                GROUP,
                originalColor,
                Number.isFinite(originalDifficulty) ? originalDifficulty : undefined,
                sourceMember,
                originalCraft,
                false
            );

            if (!isOurs(received || getHeld(window.Player))) {
                throw new Error("BC did not equip Subby's Plushies into your ItemHandheld slot.");
            }

            const heldReceived = received || getHeld(window.Player);
            heldReceived.Property = originalProperty;
            if (originalCraft != null) heldReceived.Craft = originalCraft;
            else if (Object.prototype.hasOwnProperty.call(heldReceived, "Craft")) delete heldReceived.Craft;

            setItemPlushState(heldReceived, snapshot.option);
            ensureNativeTransform(heldReceived);
            rememberCharacterPlushState(window.Player, heldReceived);
            refresh(window.Player, false);
            schedulePlushStabilization(snapshot.option);
            syncHugTightlyActivityAvailability("Offer Plushie received");

            window.setTimeout(publishTransfer, 0);
            window.setTimeout(publishTransfer, 250);
            window.setTimeout(publishTransfer, 900);

            offerTransfersReceived++;
            lastOfferTransferReceived = {
                sourceMember,
                sourceName: sourceName || null,
                option: snapshot.option,
                craftPreserved: originalCraft != null,
                sourceRemovedLocally: !isOurs(getHeld(sourceCharacter)),
                recipientEquippedLocally: isOurs(getHeld(window.Player)),
                transferStrategy: "LSCG-style recipient remove/wear plus dual CharacterUpdate",
                at: new Date().toISOString(),
            };
            log(`Received offered plushie from #${sourceMember} using LSCG-style ItemHandheld transfer.`, lastOfferTransferReceived);
            return { ok: true, snapshot };
        } catch (e) {
            try {
                if (isOurs(getHeld(window.Player))) {
                    suppressLocalPlushRepair("failed Offer Plushie rollback", 1500);
                    clearRememberedLocalPlushState();
                    InventoryRemove(window.Player, GROUP, false);
                }
            } catch (_) {}

            try {
                if (!getHeld(sourceCharacter)) {
                    const restored = InventoryWear(
                        sourceCharacter,
                        ASSET_NAME,
                        GROUP,
                        originalColor,
                        Number.isFinite(originalDifficulty) ? originalDifficulty : undefined,
                        sourceMember,
                        originalCraft,
                        false
                    );
                    if (restored) {
                        restored.Property = cloneTransferValue(originalProperty);
                        if (originalCraft != null) restored.Craft = cloneTransferValue(originalCraft);
                    }
                }
            } catch (_) {}

            try { publishTransfer(); } catch (_) {}
            return fail(`Could not transfer the offered plushie: ${String(e)}`);
        }
    }

    function parseRenderedOfferDecision(text) {
        const value = String(text || "")
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        if (!value || !/plushie offer/i.test(value)) return null;

        const match = value.match(/\((\d+)\)\s+(accepts|declines)\s+.*?\((\d+)\)'s\s+plushie\s+offer\.?/i);
        if (!match) return null;

        const actorMember = Number(match[1]);
        const sourceMember = Number(match[3]);
        return {
            actorName: getCharacterDisplayName(getRoomCharacterByMember(actorMember)) || null,
            actorMember,
            decision: String(match[2] || "").toLowerCase(),
            sourceName: getCharacterDisplayName(getRoomCharacterByMember(sourceMember)) || null,
            sourceMember,
        };
    }

    function pruneRecentOfferDecisionTokens(now = Date.now()) {
        for (const [token, seenAt] of recentOfferDecisionTokens) {
            if (!Number.isFinite(seenAt) || now - seenAt > OFFER_DECISION_DEDUPE_MS) {
                recentOfferDecisionTokens.delete(token);
            }
        }
    }

    function handleOfferDecision(parsed, text = "", triggerSource = "unknown", syncToken = "") {
        if (!parsed || !Number.isFinite(parsed.actorMember) || !Number.isFinite(parsed.sourceMember)) return false;

        const playerMember = Number(window.Player?.MemberNumber);
        const now = Date.now();
        lastOfferDecisionSeen = {
            ...parsed,
            text: String(text || ""),
            triggerSource,
            at: new Date(now).toISOString(),
        };
        if (!Number.isFinite(playerMember) || parsed.sourceMember !== playerMember) return false;

        pruneRecentOfferDecisionTokens(now);
        const decisionToken = `${parsed.actorMember}:${parsed.sourceMember}:${parsed.decision}`;
        const previousDecisionAt = recentOfferDecisionTokens.get(decisionToken);
        if (Number.isFinite(previousDecisionAt) && now - previousDecisionAt <= OFFER_DECISION_DEDUPE_MS) return true;

        prunePendingOutgoingPlushOffers(now);
        let pending = pendingOutgoingPlushOffers.get(parsed.actorMember);

        if (!pending && lastRenderedOutgoingOfferCapture &&
            lastRenderedOutgoingOfferCapture.sourceMember === playerMember &&
            lastRenderedOutgoingOfferCapture.targetMember === parsed.actorMember) {
            const age = now - Date.parse(lastRenderedOutgoingOfferCapture.at);
            if (Number.isFinite(age) && age >= 0 && age <= OFFER_TRANSFER_PENDING_MS) {
                const heldNow = getHeld(window.Player);
                const snap = snapshotPlushItem(heldNow);
                if (snap) {
                    pending = {
                        targetMember: parsed.actorMember,
                        token: lastRenderedOutgoingOfferCapture.token || `${triggerSource}-fallback`,
                        option: snap.option,
                        createdAt: now,
                    };
                }
            }
        }

        if (!pending) {
            lastOfferTransferFailure = {
                side: "sender",
                reason: "Ignored an acceptance/decline because no recent outgoing plush offer to that recipient could be confirmed.",
                actorMember: parsed.actorMember,
                triggerSource,
                at: new Date(now).toISOString(),
            };
            return false;
        }

        const incomingToken = String(syncToken || "");
        const pendingToken = String(pending.token || "");
        if (incomingToken && pendingToken && incomingToken !== pendingToken) {
            const fallbackToken = value => /^offer-(?:rendered|chat|action):/i.test(value);
            if (!fallbackToken(incomingToken) && !fallbackToken(pendingToken)) {
                lastOfferTransferFailure = {
                    side: "sender",
                    reason: "Ignored an Offer Plushie transfer signal because its token did not match the pending offer.",
                    actorMember: parsed.actorMember,
                    triggerSource,
                    at: new Date(now).toISOString(),
                };
                return false;
            }
        }

        pendingOutgoingPlushOffers.delete(parsed.actorMember);
        recentOfferDecisionTokens.set(decisionToken, now);
        if (parsed.decision !== "accepts") return true;

        const held = getHeld(window.Player);
        if (!isOurs(held)) {
            lastOfferSenderRemoval = {
                recipientMember: parsed.actorMember,
                option: pending.option,
                triggerSource,
                alreadyRemovedByRecipientTransfer: true,
                at: new Date().toISOString(),
            };
            log(`Transferred plushie away to #${parsed.actorMember}; sender copy was already removed by the recipient transfer (${triggerSource}).`);
            return true;
        }

        const currentOption = canonicalWirePlushOption(getItemPlushOption(held));
        if (validPlushOption(pending.option) && currentOption !== pending.option) {
            offerTransferSenderRemovalFailures++;
            lastOfferTransferFailure = {
                side: "sender",
                reason: "The sender changed plushies after offering; the newer held plushie was not removed.",
                actorMember: parsed.actorMember,
                offeredOption: pending.option,
                currentOption,
                triggerSource,
                at: new Date().toISOString(),
            };
            return false;
        }

        try {
            cancelIdleAnimation(false);
            removeSpeechBubble();
            removePlushStatusIcon();
            if (dragModeEnabled) setDragMode(false);
            if (activeBalanceHeadSession) restoreActiveBalanceHead("Offer Plushie transferred away");
            if (activeHideBehindSession) restoreActiveHideBehind("Offer Plushie transferred away");
            if (activeProtectSession) restoreActiveProtect("Offer Plushie transferred away");

            suppressLocalPlushRepair("Offer Plushie transferred away", 3500);
            clearRememberedLocalPlushState();
            InventoryRemove(window.Player, GROUP, false);

            if (isOurs(getHeld(window.Player)) && Array.isArray(window.Player?.Appearance)) {
                window.Player.Appearance = window.Player.Appearance.filter(item => !(
                    item?.Asset?.Group?.Name === GROUP && item?.Asset?.Name === ASSET_NAME
                ));
            }

            if (isOurs(getHeld(window.Player))) throw new Error("ItemHandheld still contained Subby's Plushies after removal.");

            refresh(window.Player, false);
            const publishRemoval = () => {
                try {
                    if (typeof window.ChatRoomCharacterItemUpdate === "function") {
                        window.ChatRoomCharacterItemUpdate(window.Player, GROUP);
                    }
                } catch (itemUpdateError) {
                    warn("Offer Plushie sender removal could not publish ItemHandheld update:", itemUpdateError);
                }
                try {
                    if (typeof window.ChatRoomCharacterUpdate === "function") window.ChatRoomCharacterUpdate(window.Player);
                } catch (updateError) {
                    warn("Offer Plushie sender removal could not publish CharacterUpdate:", updateError);
                }
            };
            publishRemoval();
            window.setTimeout(publishRemoval, 250);
            window.setTimeout(publishRemoval, 900);
            syncHugTightlyActivityAvailability("Offer Plushie transferred away");
            refreshDragToggleButton();
            refreshPlushStatusIcon();
            offerTransferSenderRemovals++;
            lastOfferSenderRemoval = {
                recipientMember: parsed.actorMember,
                option: pending.option,
                triggerSource,
                at: new Date().toISOString(),
            };
            log(`Transferred plushie away to #${parsed.actorMember}; removed sender ItemHandheld copy (${triggerSource}).`);
            return true;
        } catch (e) {
            offerTransferSenderRemovalFailures++;
            lastOfferTransferFailure = {
                side: "sender",
                reason: `Could not remove transferred plushie from sender: ${String(e)}`,
                actorMember: parsed.actorMember,
                triggerSource,
                at: new Date().toISOString(),
            };
            return false;
        }
    }

    function processOfferDecisionAction(data) {
        if (!isChatAction(data)) return false;
        const text = getDictionaryText(data, "msg") || "";
        const parsed = parseRenderedOfferDecision(text);
        if (!parsed) return false;
        return handleOfferDecision(parsed, text, "ChatRoomMessage");
    }

    function inspectRenderedOfferDecisionRow(row) {
        if (!(row instanceof Element)) return false;
        if (row.classList?.contains("SubbysPlushiesOfferPrompt")) return false;
        if (processedOfferDecisionRows.has(row)) return false;

        const text = String(row.textContent || "").replace(/\s+/g, " ").trim();
        const parsed = parseRenderedOfferDecision(text);
        if (!parsed) return false;
        processedOfferDecisionRows.add(row);
        return handleOfferDecision(parsed, text, "rendered chat row");
    }

    function sendStandaloneActionMessage(message) {
        if (typeof ServerSend !== "function" || !message) return false;
        try {
            ServerSend("ChatRoomChat", {
                Content: "Beep",
                Type: "Action",
                Dictionary: [
                    { Tag: "Beep", Text: "msg" },
                    { Tag: "msg", Text: message },
                ],
            });
            return true;
        } catch (e) {
            warn("Could not send plush activity response:", e);
            return false;
        }
    }

    function getOfferChatRoot() {
        return (
            document.getElementById("TextAreaChatLog") ||
            document.querySelector("#TextAreaChatLog") ||
            document.querySelector('[id*="ChatLog"]')
        );
    }

    function normalizeOfferName(value) {
        return String(value || "")
            .replace(/[\u2018\u2019]/g, "'")
            .trim()
            .toLocaleLowerCase()
            .replace(/\s+/g, " ");
    }

    function localOfferNameVariants() {
        const names = [
            getCharacterDisplayName(window.Player),
            window.Player?.Nickname,
            window.Player?.Name,
            window.Player?.AccountName,
        ].filter(Boolean);

        const result = new Set();
        for (const value of names) {
            const name = normalizeOfferName(value);
            if (!name) continue;
            result.add(name);
            result.add(`${name}'s`);
            if (name.endsWith("s")) result.add(`${name}'`);
        }
        return result;
    }

    function parseRenderedOfferAction(text) {
        let value = String(text || "").replace(/\s+/g, " ").trim();
        if (!value) return null;

        value = value.replace(/^\(+\s*/, "");
        const match = value.match(/(.+?)\s+offers?\s+(?:the|a)\s+plushie\s+to\s+(.+?)\.(?:\s|\)|$)/i);
        if (!match) return null;

        const sourceName = String(match[1] || "").replace(/^\(+\s*/, "").trim();
        const targetName = String(match[2] || "").trim();
        if (!sourceName || !targetName) return null;
        return { sourceName, targetName };
    }

    function offerTargetIsLocalPlayer(targetName) {
        const target = normalizeOfferName(targetName);
        if (!target) return false;
        return localOfferNameVariants().has(target);
    }

    function findOfferSourceMember(sourceName) {
        const wanted = normalizeOfferName(sourceName);
        if (!wanted || !Array.isArray(window.ChatRoomCharacter)) return null;

        for (const C of window.ChatRoomCharacter) {
            const names = [getCharacterDisplayName(C), C?.Nickname, C?.Name, C?.AccountName]
                .filter(Boolean)
                .map(normalizeOfferName);
            if (names.includes(wanted) && Number.isFinite(C?.MemberNumber)) return C.MemberNumber;
        }
        return null;
    }

    function findOfferTargetMember(targetName) {
        const wanted = normalizeOfferName(targetName);
        if (!wanted) return null;

        const variants = new Set([wanted]);
        if (wanted.endsWith("'s")) variants.add(wanted.slice(0, -2));
        if (wanted.endsWith("s'")) variants.add(wanted.slice(0, -1));

        const characters = [
            window.Player,
            ...(Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : []),
        ].filter(Boolean);

        for (const C of characters) {
            if (!Number.isFinite(C?.MemberNumber)) continue;
            const names = [getCharacterDisplayName(C), C?.Nickname, C?.Name, C?.AccountName]
                .filter(Boolean)
                .map(normalizeOfferName);
            if (names.some(name => variants.has(name))) return C.MemberNumber;
        }
        return null;
    }

    function getRoomCharacterByMember(memberNumber) {
        if (!Number.isFinite(memberNumber)) return null;
        if (Number(window.Player?.MemberNumber) === memberNumber) return window.Player;
        if (!Array.isArray(window.ChatRoomCharacter)) return null;
        return window.ChatRoomCharacter.find(C => Number(C?.MemberNumber) === memberNumber) || null;
    }

    function formatOfferCharacterLabel(name, memberNumber) {
        const cleanName = String(name || "Someone").trim() || "Someone";
        return Number.isFinite(memberNumber)
            ? `${cleanName}(${memberNumber})`
            : cleanName;
    }

    function resolveRenderedOfferSource(row, renderedSource) {
        let sourceName = String(renderedSource || "").trim();
        let sourceMember = null;

        const rowSender = Number(row?.dataset?.sender ?? row?.getAttribute?.("data-sender"));
        if (Number.isFinite(rowSender)) sourceMember = rowSender;

        const decorated = sourceName.match(/(?:^|\D)(\d{3,})\s*\(\s*([^()]*)$/);
        if (decorated) {
            const parsedMember = Number(decorated[1]);
            if (!Number.isFinite(sourceMember) && Number.isFinite(parsedMember)) sourceMember = parsedMember;
            if (decorated[2]?.trim()) sourceName = decorated[2].trim();
        }

        const sourceCharacter = getRoomCharacterByMember(sourceMember);
        const memberName = getCharacterDisplayName(sourceCharacter);
        if (memberName) sourceName = memberName;

        if (Array.isArray(window.ChatRoomCharacter)) {
            const rendered = normalizeOfferName(sourceName);
            let best = null;
            for (const C of window.ChatRoomCharacter) {
                if (!Number.isFinite(C?.MemberNumber)) continue;
                const names = [getCharacterDisplayName(C), C?.Nickname, C?.Name, C?.AccountName].filter(Boolean);
                for (const candidate of names) {
                    const normalized = normalizeOfferName(candidate);
                    if (!normalized) continue;
                    if (rendered === normalized || rendered.endsWith(`(${normalized}`) || rendered.endsWith(normalized)) {
                        if (!best || normalized.length > best.normalized.length) {
                            best = { name: String(candidate), member: C.MemberNumber, normalized };
                        }
                    }
                }
            }
            if (best) {
                sourceName = best.name;
                sourceMember = best.member;
            }
        }

        return {
            sourceName: sourceName || "Someone",
            sourceMember: Number.isFinite(sourceMember) ? sourceMember : findOfferSourceMember(sourceName),
        };
    }

    function inspectRenderedOfferRow(row) {
        if (!(row instanceof Element)) return false;
        if (row.classList?.contains("SubbysPlushiesOfferPrompt")) return false;
        if (processedOfferChatRows.has(row)) return false;

        const text = String(row.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return false;
        offerChatRowsSeen++;

        const parsed = parseRenderedOfferAction(text);
        if (!parsed) return false;

        processedOfferChatRows.add(row);
        offerChatOfferCandidates++;

        const targetIsLocal = offerTargetIsLocalPlayer(parsed.targetName);
        const resolvedSource = resolveRenderedOfferSource(row, parsed.sourceName);
        const sourceMember = resolvedSource.sourceMember;
        const sourceName = resolvedSource.sourceName;
        const targetMember = findOfferTargetMember(parsed.targetName);
        const playerMember = Number(window.Player?.MemberNumber);

        if (Number.isFinite(playerMember) && sourceMember === playerMember &&
            Number.isFinite(targetMember) && targetMember !== playerMember) {
            const captureToken = `offer-rendered:${playerMember}:${targetMember}:${Date.now()}`;
            if (rememberOutgoingPlushOffer(targetMember, captureToken)) {
                offerPendingCapturedFromRenderedAction++;
                lastRenderedOutgoingOfferCapture = {
                    sourceMember: playerMember,
                    targetMember,
                    token: captureToken,
                    at: new Date().toISOString(),
                };
            }
        }

        lastOfferChatRow = {
            text,
            sourceName,
            sourceMember,
            rawSourceName: parsed.sourceName,
            targetName: parsed.targetName,
            targetMember: Number.isFinite(targetMember) ? targetMember : null,
            targetIsLocal,
            at: new Date().toISOString(),
        };

        if (!targetIsLocal) return false;

        const token = `offer-chat:${sourceMember ?? "unknown"}:${playerMember ?? "local"}:${Date.now()}`;
        const now = Date.now();
        pruneOfferPromptTokens(now);
        if (seenOfferPromptTokens.has(token)) return false;
        seenOfferPromptTokens.set(token, now);

        offerChatPromptsTriggered++;
        showOfferPromptInChat(sourceName, sourceMember, token);
        return true;
    }

    function parseRenderedBalanceHeadSelfAction(text) {
        let value = String(text || "").replace(/\s+/g, " ").trim();
        if (!value) return null;

        value = value.replace(/^\(+\s*/, "");
        const match = value.match(/(.+?)\s+balances\s+the\s+plushie\s+on\s+their\s+head\.(?:\s|\)|$)/i);
        if (!match) return null;

        const sourceName = String(match[1] || "").replace(/^\(+\s*/, "").trim();
        return sourceName ? { sourceName } : null;
    }

    function balanceRenderedSourceIsLocal(sourceName, sourceMember) {
        const playerMember = Number(window.Player?.MemberNumber);
        if (Number.isFinite(playerMember) && Number.isFinite(sourceMember)) {
            return playerMember === sourceMember;
        }

        const source = normalizeOfferName(sourceName);
        return !!source && localOfferNameVariants().has(source);
    }

    function inspectRenderedBalanceHeadRow(row) {
        if (!(row instanceof Element)) return false;
        if (row.classList?.contains("SubbysPlushiesOfferPrompt")) return false;
        if (processedBalanceHeadChatRows.has(row)) return false;

        const text = String(row.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return false;

        const parsed = parseRenderedBalanceHeadSelfAction(text);
        if (!parsed) return false;

        processedBalanceHeadChatRows.add(row);
        balanceHeadRenderedActionsSeen++;

        const resolvedSource = resolveRenderedOfferSource(row, parsed.sourceName);
        const sourceName = resolvedSource.sourceName;
        const sourceMember = resolvedSource.sourceMember;
        const isLocal = balanceRenderedSourceIsLocal(sourceName, sourceMember);

        lastBalanceHeadRenderedAction = {
            text,
            sourceName,
            sourceMember: Number.isFinite(sourceMember) ? sourceMember : null,
            isLocal,
            at: new Date().toISOString(),
        };

        if (!isLocal || !isOurs(getHeld(window.Player))) return false;

        const now = Date.now();
        if (activeBalanceHeadSession && now - activeBalanceHeadSession.startedAt < 1000) {
            return true;
        }

        balanceHeadRenderedTriggerCount++;
        lastBalanceHeadTriggerSource = "rendered self-action";
        window.setTimeout(() => {
            if (!isOurs(getHeld(window.Player))) return;
            movePlushToHeadTemporarily();
        }, 30);
        return true;
    }

    function parseRenderedHideBehindSelfAction(text) {
        let value = String(text || "").replace(/\s+/g, " ").trim();
        if (!value) return null;

        value = value.replace(/^\(+\s*/, "");
        const match = value.match(/(.+?)\s+hides\s+their\s+face\s+behind\s+the\s+plushie\.(?:\s|\)|$)/i);
        if (!match) return null;

        const sourceName = String(match[1] || "").replace(/^\(+\s*/, "").trim();
        return sourceName ? { sourceName } : null;
    }

    function inspectRenderedHideBehindRow(row) {
        if (!(row instanceof Element)) return false;
        if (row.classList?.contains("SubbysPlushiesOfferPrompt")) return false;
        if (processedHideBehindChatRows.has(row)) return false;

        const text = String(row.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) return false;

        const parsed = parseRenderedHideBehindSelfAction(text);
        if (!parsed) return false;

        processedHideBehindChatRows.add(row);
        hideBehindRenderedActionsSeen++;

        const resolvedSource = resolveRenderedOfferSource(row, parsed.sourceName);
        const sourceName = resolvedSource.sourceName;
        const sourceMember = resolvedSource.sourceMember;
        const isLocal = balanceRenderedSourceIsLocal(sourceName, sourceMember);

        lastHideBehindRenderedAction = {
            text,
            sourceName,
            sourceMember: Number.isFinite(sourceMember) ? sourceMember : null,
            isLocal,
            at: new Date().toISOString(),
        };

        if (!isLocal || !isOurs(getHeld(window.Player))) return false;

        const now = Date.now();
        if (activeHideBehindSession && now - activeHideBehindSession.startedAt < 1000) return true;

        hideBehindRenderedTriggerCount++;
        lastHideBehindTriggerSource = "rendered self-action";
        window.setTimeout(() => {
            if (!isOurs(getHeld(window.Player))) return;
            movePlushInFrontOfFaceTemporarily();
        }, 30);
        return true;
    }

    function inspectOfferMutationNode(node, root) {
        if (!node) return;

        let element = null;
        if (node.nodeType === Node.ELEMENT_NODE) element = node;
        else if (node.parentElement) element = node.parentElement;
        if (!element) return;

        let row = element.closest?.(".ChatMessage") || null;
        if (!row && root) {
            let current = element;
            while (current && current.parentElement && current.parentElement !== root) {
                current = current.parentElement;
            }
            if (current?.parentElement === root) row = current;
        }
        if (!row) row = element;

        const text = String(row.textContent || "");
        const normalPlushRow = /plushie|balances|accepts|declines|hides/i.test(text);
        const protectRow = getFeatureSettings().protectMe && isOurs(getHeld(window.Player)) && PROTECT_RENDER_VERB_RE.test(text);
        if (!normalPlushRow && !protectRow) return;

        if (/plushie\s+battle/i.test(text) || /battle\s+result/i.test(text)) {
            row.classList?.add("SubbysPlushiesBattleMessage");
            Object.assign(row.style, {
                fontSize: "10px",
                lineHeight: "1.08",
                paddingTop: "1px",
                paddingBottom: "1px",
            });
        }

        inspectRenderedOfferRow(row);
        inspectRenderedOfferDecisionRow(row);
        inspectRenderedBalanceHeadRow(row);
        inspectRenderedHideBehindRow(row);
        if (protectRow) inspectRenderedProtectRow(row);
    }

    function ensureOfferChatObserver(reason = "monitor") {
        if (offerChatObserver && offerChatObservedRoot?.isConnected) return true;
        const root = getOfferChatRoot();
        if (!root) return false;
        if (offerChatObserver && offerChatObservedRoot === root) return true;

        try { offerChatObserver?.disconnect?.(); } catch (_) {}

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    for (const node of mutation.addedNodes) inspectOfferMutationNode(node, root);
                }
            }
        });

        observer.observe(root, { childList: true, subtree: true });
        offerChatObserver = observer;
        offerChatObservedRoot = root;
        offerChatObserverAttachCount++;
        log(`Watching BC chat for Offer Plushie, Balance-on-Head, and Hide-Behind actions (${reason}).`);
        return true;
    }

    function startOfferChatObserverMonitor() {
        if (offerChatObserverMonitor != null) return;
        ensureOfferChatObserver("startup");
        offerChatObserverMonitor = window.setInterval(
            () => ensureOfferChatObserver("chat observer monitor"),
            performanceInterval(CHAT_OBSERVER_MONITOR_INTERVAL_MS, CHAT_OBSERVER_MONITOR_INTERVAL_MS * 3)
        );
    }

    function closeOfferPrompt() {
        if (!offerPromptElement) return;

        try {
            const controls = offerPromptElement.querySelector?.(".SubbysPlushiesOfferControls");
            if (controls) {
                for (const button of controls.querySelectorAll("button")) button.disabled = true;
            }
        } catch (_) {}

        offerPromptElement = null;
    }

    function appendOfferPromptToNativeChat(sourceName, sourceMember, token) {
        if (typeof window.ChatRoomAppendChat !== "function") {
            warn("ChatRoomAppendChat is unavailable; cannot display the Offer Plushie prompt safely.");
            return false;
        }

        closeOfferPrompt();

        const row = document.createElement("div");
        row.className = "ChatMessage SubbysPlushiesOfferPrompt";
        row.setAttribute("data-subbys-plushies-offer", token);

        if (Number.isFinite(window.Player?.MemberNumber)) {
            row.dataset.target = String(window.Player.MemberNumber);
        }

        Object.assign(row.style, {
            boxSizing: "border-box",
            width: "calc(100% - 8px)",
            margin: "6px 4px",
            padding: "9px 10px",
            border: "1px solid currentColor",
            borderRadius: "8px",
            lineHeight: "1.35",
        });

        const sourceLabel = formatOfferCharacterLabel(sourceName, sourceMember);
        let offeredSnapshot = captureOfferedPlushSnapshot(sourceMember);

        const message = document.createElement("div");
        message.className = "SubbysPlushiesOfferMessage";
        message.textContent = `(${sourceLabel} is offering you their plushie.)`;

        const question = document.createElement("div");
        question.className = "SubbysPlushiesOfferQuestion";
        question.textContent = "Do you want to accept it?";
        question.style.marginTop = "3px";

        const controls = document.createElement("div");
        controls.className = "SubbysPlushiesOfferControls";
        Object.assign(controls.style, {
            display: "flex",
            gap: "8px",
            marginTop: "7px",
            alignItems: "center",
            flexWrap: "wrap",
        });

        const makeButton = (label, className) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.className = className;
            Object.assign(button.style, {
                cursor: "pointer",
                minWidth: "86px",
                padding: "4px 10px",
            });
            return button;
        };

        const accept = makeButton("Accept", "SubbysPlushiesOfferAccept");
        const decline = makeButton("Decline", "SubbysPlushiesOfferDecline");

        const decide = accepted => {
            if (!row.isConnected || row.getAttribute("data-subbys-plushies-decided") === "true") return;

            const playerName = getCharacterDisplayName(window.Player) || "Someone";
            const playerMember = Number.isFinite(window.Player?.MemberNumber) ? window.Player.MemberNumber : null;
            if (!Number.isFinite(playerMember) || !Number.isFinite(sourceMember)) {
                question.textContent = "Could not synchronize this plushie transfer because a member number is missing.";
                return;
            }

            if (accepted) {
                const transfer = receiveOfferedPlush(sourceMember, sourceName, offeredSnapshot);
                if (!transfer.ok) {
                    question.textContent = transfer.reason;
                    return;
                }
                offeredSnapshot = transfer.snapshot;
            }

            const signalSent = sendOfferDecisionSignal(
                sourceMember,
                playerMember,
                token,
                accepted ? "accepts" : "declines"
            );

            if (!signalSent && accepted) {
                try {
                    suppressLocalPlushRepair("Offer Plushie sync failure rollback", 1200);
                    clearRememberedLocalPlushState();
                    InventoryRemove(window.Player, GROUP, false);
                    refresh(window.Player, false);
                    if (typeof window.ChatRoomCharacterItemUpdate === "function") window.ChatRoomCharacterItemUpdate(window.Player, GROUP);
                    else if (typeof window.ChatRoomCharacterUpdate === "function") window.ChatRoomCharacterUpdate(window.Player);
                } catch (_) {}
                question.textContent = "Could not notify the sender. The transfer was cancelled; press Accept to try again.";
                return;
            }

            row.setAttribute("data-subbys-plushies-decided", "true");
            accept.disabled = true;
            decline.disabled = true;

            const playerLabel = formatOfferCharacterLabel(playerName, playerMember);
            question.textContent = accepted ? "Accepted — plushie transferred." : "Declined.";
            controls.remove();

            sendStandaloneActionMessage(
                accepted
                    ? `${playerLabel} accepts ${sourceLabel}'s plushie offer.`
                    : `${playerLabel} declines ${sourceLabel}'s plushie offer.`
            );

            if (offerPromptElement === row) offerPromptElement = null;
        };

        accept.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            decide(true);
        });

        decline.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            decide(false);
        });

        controls.append(accept, decline);
        row.append(message, question, controls);

        try {
            window.ChatRoomAppendChat(row);
            row.removeAttribute("data-time");
            row.removeAttribute("data-sender");
            if (row.dataset) {
                delete row.dataset.time;
                delete row.dataset.sender;
            }
        } catch (e) {
            warn("BC could not append the Offer Plushie prompt to chat:", e);
            return false;
        }

        offerPromptElement = row;
        offerPromptsDisplayed++;
        lastOfferPromptDisplayed = {
            token,
            sourceMember: Number.isFinite(sourceMember) ? sourceMember : null,
            sourceName,
            at: new Date().toISOString(),
        };
        log(`Displayed Offer Plushie prompt in BC chat from ${sourceName}.`);
        return true;
    }

    function showOfferPromptInChat(sourceName, sourceMember, token) {
        const delays = [0, 80, 250, 600];

        for (const delay of delays) {
            window.setTimeout(() => {
                if (
                    offerPromptElement?.isConnected &&
                    offerPromptElement?.getAttribute("data-subbys-plushies-offer") === token
                ) {
                    return;
                }

                appendOfferPromptToNativeChat(sourceName, sourceMember, token);
            }, delay);
        }
    }

    function maybePromptOfferRecipient(data) {
        const spec = getCustomActivityFromAction(data);
        const readableMessage = getDictionaryText(data, "msg");

        const isOffer =
            spec?.key === "offer" ||
            (typeof readableMessage === "string" && /offers? (?:the|a) plushie to /i.test(readableMessage));

        if (!isOffer) return false;

        const context = getActionCharacterContext(data);
        const playerMember = window.Player?.MemberNumber;
        if (!Number.isFinite(playerMember)) return false;

        offerVisibleActionsSeen++;
        lastOfferActionSeen = {
            sender: Number.isFinite(Number(data?.Sender)) ? Number(data.Sender) : null,
            sourceMember: context.sourceMember,
            targetMember: context.targetMember,
            sourceName: context.sourceName,
            targetName: context.targetName,
            content: typeof data?.Content === "string" ? data.Content : null,
            readableMessage: typeof readableMessage === "string" ? readableMessage : null,
            recognizedSpec: spec?.key || null,
            isForPlayer: Number.isFinite(context.targetMember) && context.targetMember === playerMember,
            dictionaryShape: Array.isArray(data?.Dictionary)
                ? data.Dictionary.map(entry => entry && typeof entry === "object" ? Object.keys(entry) : typeof entry)
                : null,
            at: new Date().toISOString(),
        };

        if (context.sourceMember === playerMember || Number(data?.Sender) === playerMember) {
            return false;
        }

        const normalizeName = value =>
            String(value || "").trim().toLocaleLowerCase().replace(/\s+/g, " ");

        const playerNames = [
            getCharacterDisplayName(window.Player),
            window.Player?.Nickname,
            window.Player?.Name,
            window.Player?.AccountName,
        ]
            .filter(Boolean)
            .map(normalizeName);

        const memberMatches =
            Number.isFinite(context.targetMember) &&
            context.targetMember === playerMember;

        const normalizedTarget = normalizeName(context.targetName);
        const nameMatches = !!normalizedTarget && playerNames.includes(normalizedTarget);

        let readableMatches = false;
        if (typeof readableMessage === "string") {
            const readable = normalizeName(readableMessage);
            readableMatches = playerNames.some(name =>
                readable.includes(`offers the plushie to ${name}`) ||
                readable.includes(`offers a plushie to ${name}`)
            );
        }

        if (!memberMatches && !nameMatches && !readableMatches) return false;

        const token =
            getDictionaryText(data, CUSTOM_ACTIVITY_TOKEN_TAG) ||
            `offer-action:${context.sourceMember ?? data?.Sender ?? "unknown"}:${context.targetMember ?? playerMember}:${Date.now()}`;

        const now = Date.now();
        pruneOfferPromptTokens(now);
        if (seenOfferPromptTokens.has(token)) return false;
        seenOfferPromptTokens.set(token, now);

        let sourceName = context.sourceName;
        if (!sourceName && Number.isFinite(context.sourceMember) && Array.isArray(window.ChatRoomCharacter)) {
            const sourceCharacter = window.ChatRoomCharacter.find(C => C?.MemberNumber === context.sourceMember);
            sourceName = getCharacterDisplayName(sourceCharacter);
        }
        sourceName ||= "Someone";

        offerVisiblePromptsTriggered++;
        showOfferPromptInChat(sourceName, context.sourceMember, token);
        return true;
    }

    function getActivePlushLayerName(item) {
        const option = getItemPlushOption(item);
        return validPlushOption(option) ? `Plush${option + 1}` : null;
    }

    function snapshotLayerTransform(property, layerName) {
        const snapshot = {};
        for (const propName of ["TranslationX", "TranslationY", "Rotation"]) {
            const key = `Layer${propName}`;
            const record = property?.[key];
            const usableRecord = !!record && typeof record === "object" && !Array.isArray(record);
            snapshot[propName] = {
                hadRecord: usableRecord,
                hadValue: usableRecord && Object.prototype.hasOwnProperty.call(record, layerName),
                value: usableRecord ? record[layerName] : undefined,
            };
        }
        return snapshot;
    }

    function setPlushLayerTransform(item, layerName, values) {
        const property = getProperty(item);
        if (!property || !layerName) return false;

        let changed = false;
        for (const [propName, value] of Object.entries(values)) {
            if (!Number.isFinite(value)) continue;
            const key = `Layer${propName}`;
            if (!property[key] || typeof property[key] !== "object" || Array.isArray(property[key])) {
                property[key] = {};
                changed = true;
            }
            if (property[key][layerName] !== value) {
                property[key][layerName] = value;
                changed = true;
            }
        }
        if (changed && item === getHeld(window.Player)) scheduleLocalOverlayReposition();
        return changed;
    }

    function restorePlushLayerTransform(item, layerName, snapshot) {
        const property = getProperty(item);
        if (!property || !layerName || !snapshot) return false;

        for (const propName of ["TranslationX", "TranslationY", "Rotation"]) {
            const key = `Layer${propName}`;
            const saved = snapshot[propName];
            if (!saved) continue;

            if (saved.hadValue) {
                if (!property[key] || typeof property[key] !== "object" || Array.isArray(property[key])) {
                    property[key] = {};
                }
                property[key][layerName] = saved.value;
                continue;
            }

            const record = property[key];
            if (record && typeof record === "object" && !Array.isArray(record)) {
                delete record[layerName];
                if (!saved.hadRecord && Object.keys(record).length === 0) delete property[key];
            }
        }
        if (item === getHeld(window.Player)) scheduleLocalOverlayReposition();
        return true;
    }

    function redrawAndPublishBalanceHead(reason) {
        const redrawn = rebuildCharacterCanvas(window.Player, reason);
        if (!redrawn) {
            try {
                if (typeof CharacterRefresh === "function") CharacterRefresh(window.Player);
            } catch (e) {
                warn(`Balance Plushie redraw failed (${reason}):`, e);
            }
        }

        try {
            if (typeof ChatRoomCharacterUpdate === "function") {
                ChatRoomCharacterUpdate(window.Player);
            }
        } catch (e) {
            warn(`Balance Plushie publish failed (${reason}):`, e);
        }
    }

    function restoreActiveBalanceHead(reason = "timer") {
        const session = activeBalanceHeadSession;
        if (!session) return false;

        activeBalanceHeadSession = null;

        const current = getHeld(window.Player);
        if (!isOurs(current)) {
            lastBalanceHeadEffect = {
                active: false,
                restoredAt: new Date().toISOString(),
                restoreReason: `${reason}: plush no longer held`,
                layerName: session.layerName,
                originalLayerTransform: session.originalLayerTransform,
            };
            return false;
        }

        restorePlushLayerTransform(current, session.layerName, session.originalLayerTransform);
        redrawAndPublishBalanceHead("Balance Plushie on Head restore");

        lastBalanceHeadEffect = {
            active: false,
            restoredAt: new Date().toISOString(),
            restoreReason: reason,
            layerName: session.layerName,
            originalLayerTransform: session.originalLayerTransform,
        };
        return true;
    }

    function movePlushToHeadTemporarily() {
        if (activeIdleAnimationSession) cancelIdleAnimation();
        if (activeHideBehindSession) restoreActiveHideBehind("replaced by Balance Plushie on Head");
        if (activeProtectSession) restoreActiveProtect("replaced by Balance Plushie on Head");
        if (activeBalanceHeadSession) restoreActiveBalanceHead("restarted");

        const item = getHeld(window.Player);
        if (!isOurs(item)) return false;

        ensureNativeTransform(item);
        const property = getProperty(item);
        const layerName = getActivePlushLayerName(item);
        if (!property || !layerName) return false;

        const originalLayerTransform = snapshotLayerTransform(property, layerName);

        const headLayerTransform = { ...BALANCE_HEAD_TRANSFORM };

        const generation = ++balanceHeadGeneration;
        activeBalanceHeadSession = {
            generation,
            layerName,
            originalLayerTransform,
            headLayerTransform,
            startedAt: Date.now(),
        };

        if (!setPlushLayerTransform(item, layerName, headLayerTransform)) {
            activeBalanceHeadSession = null;
            return false;
        }

        redrawAndPublishBalanceHead("Balance Plushie on Head start");

        lastBalanceHeadEffect = {
            active: true,
            startedAt: new Date().toISOString(),
            restoresAfterMs: BALANCE_HEAD_DURATION_MS,
            layerName,
            headLayerTransform,
            originalLayerTransform,
        };

        window.setTimeout(() => {
            if (!activeBalanceHeadSession || activeBalanceHeadSession.generation !== generation) return;
            restoreActiveBalanceHead("8-second timer");
        }, BALANCE_HEAD_DURATION_MS);

        return true;
    }

    function redrawAndPublishHideBehind(reason) {
        const redrawn = rebuildCharacterCanvas(window.Player, reason);
        if (!redrawn) {
            try {
                if (typeof CharacterRefresh === "function") CharacterRefresh(window.Player);
            } catch (e) {
                warn(`Hide Behind Plushie redraw failed (${reason}):`, e);
            }
        }

        try {
            if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(window.Player);
        } catch (e) {
            warn(`Hide Behind Plushie publish failed (${reason}):`, e);
        }
    }

    function restoreActiveHideBehind(reason = "timer") {
        const session = activeHideBehindSession;
        if (!session) return false;

        activeHideBehindSession = null;

        const current = getHeld(window.Player);
        if (!isOurs(current)) {
            lastHideBehindEffect = {
                active: false,
                restoredAt: new Date().toISOString(),
                restoreReason: `${reason}: plush no longer held`,
                layerName: session.layerName,
                originalLayerTransform: session.originalLayerTransform,
            };
            return false;
        }

        restorePlushLayerTransform(current, session.layerName, session.originalLayerTransform);
        redrawAndPublishHideBehind("Hide Behind Plushie restore");

        lastHideBehindEffect = {
            active: false,
            restoredAt: new Date().toISOString(),
            restoreReason: reason,
            layerName: session.layerName,
            originalLayerTransform: session.originalLayerTransform,
        };
        return true;
    }

    function movePlushInFrontOfFaceTemporarily() {
        if (activeIdleAnimationSession) cancelIdleAnimation();
        if (activeBalanceHeadSession) restoreActiveBalanceHead("replaced by Hide Behind Plushie");
        if (activeProtectSession) restoreActiveProtect("replaced by Hide Behind Plushie");
        if (activeHideBehindSession) restoreActiveHideBehind("restarted");

        const item = getHeld(window.Player);
        if (!isOurs(item)) return false;

        ensureNativeTransform(item);
        const property = getProperty(item);
        const layerName = getActivePlushLayerName(item);
        if (!property || !layerName) return false;

        const originalLayerTransform = snapshotLayerTransform(property, layerName);
        const faceLayerTransform = { ...HIDE_BEHIND_FACE_TRANSFORM };
        const generation = ++hideBehindGeneration;

        activeHideBehindSession = {
            generation,
            layerName,
            originalLayerTransform,
            faceLayerTransform,
            startedAt: Date.now(),
        };

        if (!setPlushLayerTransform(item, layerName, faceLayerTransform)) {
            activeHideBehindSession = null;
            return false;
        }

        redrawAndPublishHideBehind("Hide Behind Plushie start");
        lastHideBehindEffect = {
            active: true,
            startedAt: new Date().toISOString(),
            restoresAfterMs: HIDE_BEHIND_DURATION_MS,
            layerName,
            faceLayerTransform,
            originalLayerTransform,
        };

        window.setTimeout(() => {
            if (!activeHideBehindSession || activeHideBehindSession.generation !== generation) return;
            restoreActiveHideBehind("8-second timer");
        }, HIDE_BEHIND_DURATION_MS);

        return true;
    }

    function redrawAndPublishProtect(reason) {
        const redrawn = rebuildCharacterCanvas(window.Player, reason);
        if (!redrawn) {
            try { if (typeof CharacterRefresh === "function") CharacterRefresh(window.Player); } catch (_) {}
        }
        try { if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(window.Player); } catch (_) {}
    }

    function restoreActiveProtect(reason = "timer") {
        const session = activeProtectSession;
        if (!session) return false;
        activeProtectSession = null;
        const current = getHeld(window.Player);
        if (!isOurs(current)) return false;
        restorePlushLayerTransform(current, session.layerName, session.originalLayerTransform);
        redrawAndPublishProtect("Protect Me restore");
        lastProtectEffect = { active: false, restoredAt: new Date().toISOString(), restoreReason: reason };
        refreshPlushStatusIcon();
        return true;
    }

    function movePlushToProtectTemporarily() {
        if (activeIdleAnimationSession) cancelIdleAnimation();
        if (activeBalanceHeadSession) restoreActiveBalanceHead("replaced by Protect Me");
        if (activeHideBehindSession) restoreActiveHideBehind("replaced by Protect Me");
        if (activeProtectSession) restoreActiveProtect("restarted");

        const item = getHeld(window.Player);
        if (!isOurs(item)) return false;
        ensureNativeTransform(item);
        const property = getProperty(item);
        const layerName = getActivePlushLayerName(item);
        if (!property || !layerName) return false;

        const originalLayerTransform = snapshotLayerTransform(property, layerName);
        const protectLayerTransform = { ...PROTECT_TRANSFORM };
        const generation = ++protectGeneration;
        activeProtectSession = { generation, layerName, originalLayerTransform, protectLayerTransform, startedAt: Date.now() };
        if (!setPlushLayerTransform(item, layerName, protectLayerTransform)) {
            activeProtectSession = null;
            return false;
        }
        redrawAndPublishProtect("Protect Me start");
        lastProtectEffect = { active: true, startedAt: new Date().toISOString(), restoresAfterMs: PROTECT_DURATION_MS, layerName };
        refreshPlushStatusIcon();
        window.setTimeout(() => {
            if (!activeProtectSession || activeProtectSession.generation !== generation) return;
            restoreActiveProtect("timer");
        }, PROTECT_DURATION_MS);
        return true;
    }

    function ensureHugTightlyActivityRegistered(reason = "availability check") {
        const activities = window.ActivityFemale3DCG;
        if (!Array.isArray(activities)) return false;

        const existing = activities.find(activity => activity?.Name === HUG_TIGHTLY_ACTIVITY_NAME);
        if (existing) {
            hugTightlyActivityObject = existing;
            hugTightlyActivityID = existing.ActivityID ?? hugTightlyActivityID;
            hugTightlyActivityEnabled = true;
            hugTightlyActivityRegistration = `active (${reason})`;
            return true;
        }

        const activity = makeHugTightlyActivity(activities);
        activities.push(activity);
        hugTightlyActivityObject = activity;
        hugTightlyActivityEnabled = true;
        hugTightlyActivityRegistration = `active (${reason})`;
        log(`Enabled ${HUG_TIGHTLY_ACTIVITY_LABEL} activity (ID ${activity.ActivityID}).`);
        return true;
    }

    function removeHugTightlyActivity(reason = "availability check") {
        const activities = window.ActivityFemale3DCG;
        if (!Array.isArray(activities)) return false;

        let removed = false;
        for (let i = activities.length - 1; i >= 0; i--) {
            const entry = activities[i];
            if (entry === hugTightlyActivityObject || entry?.Name === HUG_TIGHTLY_ACTIVITY_NAME) {
                activities.splice(i, 1);
                removed = true;
            }
        }

        if (removed) log(`Disabled ${HUG_TIGHTLY_ACTIVITY_LABEL} activity (${reason}).`);
        hugTightlyActivityObject = null;
        hugTightlyActivityEnabled = false;
        hugTightlyActivityRegistration = `inactive (${reason})`;
        return removed;
    }

    function syncHugTightlyActivityAvailability(reason = "availability check") {
        const shouldBeActive = isOurs(getHeld(window.Player));
        if (shouldBeActive) {
            const hugReady = ensureHugTightlyActivityRegistered(reason);
            const extrasReady = ensureCustomActivitiesRegistered(reason);
            return hugReady && extrasReady;
        }

        if (hugTightlyActivityEnabled || window.ActivityFemale3DCG?.some?.(a => a?.Name === HUG_TIGHTLY_ACTIVITY_NAME)) {
            removeHugTightlyActivity(reason);
        } else {
            hugTightlyActivityRegistration = `inactive (${reason})`;
        }

        const anyExtraRegistered = window.ActivityFemale3DCG?.some?.(
            activity => CUSTOM_ACTIVITY_BY_NAME.has(activity?.Name)
        );
        if (customActivityObjects.size || anyExtraRegistered) {
            removeCustomActivities(reason);
        } else {
            customActivitiesRegistration = `inactive (${reason})`;
        }

        return false;
    }

    function startHugTightlyActivityMonitor() {
        if (hugTightlyActivityMonitor != null) return;
        syncHugTightlyActivityAvailability("startup");
        lastActivityMonitorHeldState = isOurs(getHeld(window.Player));
        lastActivityMonitorFullCheckAt = Date.now();
        hugTightlyActivityMonitor = window.setInterval(() => {
            const heldNow = isOurs(getHeld(window.Player));
            const now = Date.now();
            if (heldNow !== lastActivityMonitorHeldState || now - lastActivityMonitorFullCheckAt >= ACTIVITY_INTEGRITY_INTERVAL_MS) {
                lastActivityMonitorHeldState = heldNow;
                lastActivityMonitorFullCheckAt = now;
                syncHugTightlyActivityAvailability("held-item monitor");
            }
        }, ACTIVITY_MONITOR_INTERVAL_MS);
    }

    function getDictionaryText(data, tag) {
        const dictionary = data?.Dictionary;
        if (!Array.isArray(dictionary)) return null;
        const entry = dictionary.find(item => item?.Tag === tag);
        return typeof entry?.Text === "string" ? entry.Text : null;
    }

    function getHugTightlyToken(data) {
        return getDictionaryText(data, HUG_TIGHTLY_MARKER_TAG);
    }

    function containsHugTightlyMarker(value, depth = 0, seen = new Set()) {
        if (depth > 5 || value == null) return false;
        if (typeof value === "string") {
            const compact = value.replace(/[^a-z]/gi, "").toLowerCase();
            return compact.includes("hugtightly") || value.includes(HUG_TIGHTLY_MARKER_TAG);
        }
        if (typeof value !== "object") return false;
        if (seen.has(value)) return false;
        seen.add(value);

        if (Array.isArray(value)) {
            return value.some(entry => containsHugTightlyMarker(entry, depth + 1, seen));
        }

        for (const [key, entry] of Object.entries(value)) {
            const compactKey = String(key).replace(/[^a-z]/gi, "").toLowerCase();
            if (compactKey.includes("hugtightly") || key === HUG_TIGHTLY_MARKER_TAG) return true;
            if (containsHugTightlyMarker(entry, depth + 1, seen)) return true;
        }
        return false;
    }

    function isHugTightlyAction(data) {
        if (!isChatAction(data)) return false;
        if (getHugTightlyToken(data)) return true;
        return containsHugTightlyMarker(data);
    }

    function prunePurrTokens(now = Date.now()) {
        for (const [token, timestamp] of recentPurrTokens) {
            if (now - timestamp > 15000) recentPurrTokens.delete(token);
        }
    }

    async function playHostedPurrSfx() {
        const candidates = purrSfxWorkingUrl
            ? [purrSfxWorkingUrl, ...PURR_SFX_URLS.filter(url => url !== purrSfxWorkingUrl)]
            : [...PURR_SFX_URLS];

        for (const url of candidates) {
            try {
                const audio = new Audio(url);
                audio.preload = "auto";
                audio.volume = 0.75;
                activePurrAudio = audio;
                await audio.play();
                purrSfxWorkingUrl = url;
                return true;
            } catch (_) {
                if (purrSfxWorkingUrl === url) purrSfxWorkingUrl = null;
            }
        }
        return false;
    }

    async function playGeneratedPurrFallback() {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (typeof AudioContextCtor !== "function") return false;

        try {
            if (!purrAudioContext || purrAudioContext.state === "closed") {
                purrAudioContext = new AudioContextCtor();
            }
            if (purrAudioContext.state === "suspended") {
                await purrAudioContext.resume();
            }

            const ctx = purrAudioContext;
            const duration = 1.65;
            const sampleRate = ctx.sampleRate;
            const frameCount = Math.max(1, Math.floor(duration * sampleRate));
            const buffer = ctx.createBuffer(1, frameCount, sampleRate);
            const samples = buffer.getChannelData(0);

            let smoothedNoise = 0;
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                const fadeIn = Math.min(1, t / 0.08);
                const fadeOut = Math.min(1, (duration - t) / 0.18);
                const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
                const pulse = 0.78 + 0.22 * Math.sin(2 * Math.PI * 4.3 * t);
                const rawNoise = Math.random() * 2 - 1;
                smoothedNoise += 0.055 * (rawNoise - smoothedNoise);

                const tone =
                    0.28 * Math.sin(2 * Math.PI * 26 * t) +
                    0.24 * Math.sin(2 * Math.PI * 52 * t + 0.35) +
                    0.17 * Math.sin(2 * Math.PI * 104 * t + 0.7) +
                    0.08 * Math.sin(2 * Math.PI * 156 * t + 1.1);

                samples[i] = envelope * pulse * (tone + 0.10 * smoothedNoise);
            }

            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            source.buffer = buffer;
            gain.gain.setValueAtTime(0.16, ctx.currentTime);
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start();
            return true;
        } catch (_) {
            return false;
        }
    }

    async function playPurrSfx(token = null, reason = "hug tightly") {
        const now = Date.now();
        prunePurrTokens(now);

        if (now - lastPurrStartedAt < 350) return false;
        if (token && recentPurrTokens.has(token)) return false;
        if (token) recentPurrTokens.set(token, now);

        try {
            const played = await playHostedPurrSfx() || await playGeneratedPurrFallback();
            if (!played) {
                warn("Could not play the plush purr SFX from assets/sfx or the local fallback.");
                return false;
            }

            lastPurrStartedAt = Date.now();
            purrPlayCount++;
            lastPurrPlay = {
                token,
                reason,
                at: new Date().toISOString(),
                source: purrSfxWorkingUrl || "generated fallback",
            };
            return true;
        } catch (e) {
            warn("Could not play plush purr SFX:", e);
            return false;
        }
    }

    function makeHugTightlyNetworkAction(originalData) {
        const sourceName = typeof CharacterNickname === "function"
            ? CharacterNickname(window.Player)
            : (window.Player?.Nickname || window.Player?.Name || "Someone");
        const member = Number.isFinite(window.Player?.MemberNumber) ? window.Player.MemberNumber : "local";
        const token = `${member}:${Date.now()}:${++hugTightlyEventSequence}`;

        return {
            data: {
                ...originalData,
                Content: "Beep",
                Type: "Action",
                Dictionary: [
                    { Tag: "Beep", Text: "msg" },
                    { Tag: "msg", Text: `${sourceName} hugs the plushie tightly.` },
                    { Tag: HUG_TIGHTLY_MARKER_TAG, Text: token },
                ],
            },
            token,
        };
    }

    function getHeld(C = window.Player) {
        if (!C || typeof InventoryGet !== "function") return null;

        try {
            return InventoryGet(C, GROUP);
        } catch (_) {
            return null;
        }
    }

    function isOurs(item) {
        return (
            item?.Asset?.Group?.Name === GROUP &&
            item?.Asset?.Name === ASSET_NAME
        );
    }

    function getProperty(item) {
        if (!item) return null;

        if (!item.Property || typeof item.Property !== "object" || Array.isArray(item.Property)) {
            item.Property = {};
        }

        return item.Property;
    }

    function refresh(C, publish = true) {
        if (!C) return;

        try {
            if (typeof CharacterRefresh === "function") CharacterRefresh(C);
        } catch (e) {
            warn("CharacterRefresh failed:", e);
        }

        if (!publish || C !== window.Player) return;

        try {
            if (typeof ChatRoomCharacterUpdate === "function") {
                ChatRoomCharacterUpdate(C);
            }
        } catch (e) {
            warn("ChatRoomCharacterUpdate failed:", e);
        }
    }

    function ensureNativeTransform(item, force = false) {
        if (!isOurs(item)) return false;

        const property = getProperty(item);
        if (!property) return false;

        for (const [key, value] of Object.entries(DEFAULT_TRANSFORM)) {
            if (force || !Number.isFinite(property[key])) property[key] = value;
        }

        delete property.OverridePriority;
        return true;
    }

    function getItemPlushOption(item) {
        const recordValue = item?.Property?.TypeRecord?.[MODULE_KEY];
        if (Number.isInteger(recordValue) && recordValue >= 0 && recordValue < PLUSHES.length) {
            return recordValue;
        }

        const type = item?.Property?.Type;
        if (typeof type !== "string") return -1;

        const match = type.match(/^p(\d+)$/);
        if (!match) return -1;

        const value = Number(match[1]);
        return Number.isInteger(value) && value >= 0 && value < PLUSHES.length
            ? value
            : -1;
    }

    function validPlushOption(optionIndex) {
        return Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < PLUSHES.length;
    }

    function validPublicPlushOption(optionIndex) {
        return Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < PUBLIC_PLUSH_COUNT;
    }

    function canonicalWirePlushOption(optionIndex) {
        return optionIndex === 0 ? SUBBYCAT_WIRE_OPTION : optionIndex;
    }

    function publicToWirePlushOption(optionIndex) {
        return optionIndex === 0 ? SUBBYCAT_WIRE_OPTION : optionIndex;
    }

    function wireToPublicPlushOption(optionIndex) {
        return optionIndex === SUBBYCAT_WIRE_OPTION ? 0 : optionIndex;
    }

    function setItemPlushState(item, optionIndex) {
        optionIndex = canonicalWirePlushOption(optionIndex);
        if (!validPlushOption(optionIndex)) return false;

        const property = getProperty(item);
        if (!property) return false;

        property.Type = `${MODULE_KEY}${optionIndex}`;
        property.TypeRecord = {
            ...(property.TypeRecord &&
            typeof property.TypeRecord === "object" &&
            !Array.isArray(property.TypeRecord)
                ? property.TypeRecord
                : {}),
            [MODULE_KEY]: optionIndex,
        };

        lastPlushOption = optionIndex;
        return true;
    }

    function isLocalPlayerCharacter(C) {
        if (!C || !window.Player) return false;
        if (C === window.Player) return true;
        const playerMember = Number(window.Player?.MemberNumber);
        return Number.isFinite(playerMember) && Number(C?.MemberNumber) === playerMember;
    }

    function suppressLocalPlushRepair(reason = "intentional change", durationMs = 1800) {
        const now = Date.now();
        localPlushRepairSuppressedUntil = Math.max(
            localPlushRepairSuppressedUntil,
            now + Math.max(250, Number(durationMs) || 1800)
        );
        stabilizerGeneration++;
        actionRecoveryGeneration++;
        lastLocalPlushRepairSuppression = {
            reason: String(reason || "intentional change"),
            until: new Date(localPlushRepairSuppressedUntil).toISOString(),
            at: new Date(now).toISOString(),
        };
        return localPlushRepairSuppressedUntil;
    }

    function localPlushRepairSuppressed(C = window.Player) {
        return isLocalPlayerCharacter(C) && Date.now() < localPlushRepairSuppressedUntil;
    }

    function clearRememberedLocalPlushState() {
        const key = getCharacterStateKey(window.Player);
        if (key) plushStateByCharacter.delete(key);
        return true;
    }

    function getCharacterStateKey(C) {
        if (!C) return null;
        if (Number.isFinite(C.MemberNumber)) return `member:${C.MemberNumber}`;
        if (C === window.Player) return "player";
        return null;
    }

    function rememberCharacterPlushState(C, item = getHeld(C)) {
        if (!C || !isOurs(item)) return null;

        const key = getCharacterStateKey(C);
        if (!key) return null;

        const previous = plushStateByCharacter.get(key) || {
            option: C === window.Player && validPlushOption(lastPlushOption) ? lastPlushOption : 0,
            transform: {},
            layerTransform: {},
        };
        if (!previous.layerTransform || typeof previous.layerTransform !== "object") previous.layerTransform = {};

        const option = canonicalWirePlushOption(getItemPlushOption(item));
        if (validPlushOption(option)) previous.option = option;

        const property = item.Property;
        if (property && typeof property === "object" && !Array.isArray(property)) {
            for (const transformKey of Object.keys(DEFAULT_TRANSFORM)) {
                if (Number.isFinite(property[transformKey])) previous.transform[transformKey] = property[transformKey];
            }

            const temporaryPoseActive = C === window.Player && (activeBalanceHeadSession || activeHideBehindSession || activeProtectSession || activeIdleAnimationSession);
            if (!temporaryPoseActive) {
                const activeLayer = getActivePlushLayerName(item);
                if (activeLayer) {
                    for (const [transformKey, layerProperty] of Object.entries(NATIVE_LAYER_PROPERTY_BY_TRANSFORM)) {
                        const record = property[layerProperty];
                        const value = record && typeof record === "object" && !Array.isArray(record) ? record[activeLayer] : undefined;
                        if (Number.isFinite(value)) previous.layerTransform[transformKey] = value;
                    }
                }
            }
        }

        plushStateByCharacter.set(key, previous);

        if (C === window.Player && validPlushOption(previous.option)) {
            lastPlushOption = previous.option;
        }

        return previous;
    }

    function pruneRememberedPlushStates(includeRoomCharacters = true) {
        const keep = new Set();
        const playerKey = getCharacterStateKey(window.Player);
        if (playerKey) keep.add(playerKey);

        if (includeRoomCharacters && Array.isArray(window.ChatRoomCharacter)) {
            for (const C of window.ChatRoomCharacter) {
                const key = getCharacterStateKey(C);
                if (key) keep.add(key);
            }
        }

        for (const key of plushStateByCharacter.keys()) {
            if (!keep.has(key)) plushStateByCharacter.delete(key);
        }
    }

    function rememberedPlushOption(C, fallback = 0) {
        const key = getCharacterStateKey(C);
        const remembered = key ? plushStateByCharacter.get(key) : null;
        if (validPlushOption(remembered?.option)) return canonicalWirePlushOption(remembered.option);
        if (C === window.Player && validPlushOption(lastPlushOption)) return canonicalWirePlushOption(lastPlushOption);
        return validPlushOption(fallback) ? fallback : 0;
    }

    function repairPlushState(item, preferredOption = lastPlushOption, reason = "refresh", C = window.Player) {
        if (!isLocalPlayerCharacter(C)) return false;
        if (localPlushRepairSuppressed(C)) return false;
        if (!isOurs(item)) return false;

        const property = getProperty(item);
        if (!property) return false;

        const key = getCharacterStateKey(C);
        const remembered = key ? plushStateByCharacter.get(key) : null;

        let option = canonicalWirePlushOption(getItemPlushOption(item));
        if (!validPlushOption(option)) {
            option = validPlushOption(remembered?.option)
                ? remembered.option
                : (validPlushOption(preferredOption) ? preferredOption : 0);
        }

        const expectedType = `${MODULE_KEY}${option}`;
        let changed = false;

        if (property.Type !== expectedType) {
            property.Type = expectedType;
            changed = true;
        }

        if (!property.TypeRecord || typeof property.TypeRecord !== "object" || Array.isArray(property.TypeRecord)) {
            property.TypeRecord = {};
            changed = true;
        }

        if (property.TypeRecord[MODULE_KEY] !== option) {
            property.TypeRecord[MODULE_KEY] = option;
            changed = true;
        }

        for (const [transformKey, defaultValue] of Object.entries(DEFAULT_TRANSFORM)) {
            if (!Number.isFinite(property[transformKey])) {
                const rememberedValue = remembered?.transform?.[transformKey];
                property[transformKey] = Number.isFinite(rememberedValue) ? rememberedValue : defaultValue;
                changed = true;
            }
        }

        if (!(C === window.Player && (activeBalanceHeadSession || activeHideBehindSession || activeProtectSession || activeIdleAnimationSession))) {
            const compacted = compactPlushLayerTransformsToActive(
                item,
                remembered?.layerTransform || null
            );
            if (compacted) changed = true;

            if (hasPlushLayerTransform(item)) {
                for (const [transformKey, defaultValue] of Object.entries(DEFAULT_TRANSFORM)) {
                    if (property[transformKey] !== defaultValue) {
                        property[transformKey] = defaultValue;
                        changed = true;
                    }
                }
            }
        }

        if (Object.prototype.hasOwnProperty.call(property, "OverridePriority")) {
            delete property.OverridePriority;
            changed = true;
        }

        if (changed) {
            rememberCharacterPlushState(C, item);
            plushStateRepairCount++;
            lastPlushStateRepair = {
                reason,
                option,
                memberNumber: Number.isFinite(C?.MemberNumber) ? C.MemberNumber : null,
                at: new Date().toISOString(),
            };
            log(`Repaired plush state after ${reason}: ${expectedType}${Number.isFinite(C?.MemberNumber) ? ` for #${C.MemberNumber}` : ""}.`);
        }

        return changed;
    }

    function normalizePlushState(item) {
        const current = canonicalWirePlushOption(getItemPlushOption(item));
        const option = validPlushOption(current)
            ? current
            : (validPlushOption(lastPlushOption) ? canonicalWirePlushOption(lastPlushOption) : SUBBYCAT_WIRE_OPTION);
        setItemPlushState(item, option);
        ensureNativeTransform(item);
        return option;
    }

    function schedulePlushStabilization(optionIndex) {
        if (!validPlushOption(optionIndex)) return;

        const generation = ++stabilizerGeneration;
        const delays = [80, 350, 1200];

        for (const delay of delays) {
            setTimeout(() => {
                if (generation !== stabilizerGeneration) return;

                const item = getHeld(window.Player);
                if (!isOurs(item)) return;

                const changed = repairPlushState(item, optionIndex, `stabilizer ${delay}ms`, window.Player);
                if (changed) refresh(window.Player, true);
            }, delay);
        }
    }

    function captureVisiblePlushStates() {
        const player = window.Player;
        if (player && !localPlushRepairSuppressed(player)) rememberCharacterPlushState(player);
    }

    function rebuildCharacterCanvas(C, reason = "plush repair") {
        if (!C) return false;

        if (typeof CharacterLoadCanvas === "function") {
            try {
                CharacterLoadCanvas(C);
                const playerMember = Number(window.Player?.MemberNumber);
                const isLocalPlayer = C === window.Player || (Number.isFinite(playerMember) && Number(C?.MemberNumber) === playerMember);
                if (isLocalPlayer && window.CurrentScreen === "ChatRoom") {
                    scheduleLocalOverlayReposition();
                }
                return true;
            } catch (e) {
                warn(`CharacterLoadCanvas failed after ${reason}:`, e);
            }
        }

        return false;
    }

    function repairVisiblePlushStates(reason) {
        const affected = [];
        const player = window.Player;
        if (!player || localPlushRepairSuppressed(player)) return affected;

        const item = getHeld(player);
        if (!isOurs(item)) return affected;

        const preferred = rememberedPlushOption(player, lastPlushOption);
        affected.push({ C: player, changed: repairPlushState(item, preferred, reason, player) });
        return affected;
    }

    function schedulePlushRecovery(reason) {
        const generation = ++actionRecoveryGeneration;
        const delay = 80;

        setTimeout(() => {
            if (generation !== actionRecoveryGeneration) return;

            const affected = repairVisiblePlushStates(`${reason} ${delay}ms`);
            if (!affected.length) return;

            const repaired = affected.filter(entry => entry.changed);
            const redrawn = [];

            for (const { C } of repaired) {
                if (rebuildCharacterCanvas(C, `${reason} ${delay}ms`)) {
                    redrawn.push(Number.isFinite(C?.MemberNumber) ? C.MemberNumber : null);
                }
            }

            actionRecoveryCount++;
            lastActionRecovery = {
                reason,
                delay,
                checked: affected.map(({ C }) => Number.isFinite(C?.MemberNumber) ? C.MemberNumber : null),
                repaired: repaired.map(({ C }) => Number.isFinite(C?.MemberNumber) ? C.MemberNumber : null),
                redrawn,
                at: new Date().toISOString(),
            };
        }, delay);
    }

    const scheduleActionRecovery = schedulePlushRecovery;

    function currentRoomRosterSignature() {
        if (typeof window.CurrentScreen !== "string" || window.CurrentScreen !== "ChatRoom") {
            return null;
        }

        const characters = Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : [];
        const members = characters.map((C, index) => {
            if (Number.isFinite(C?.MemberNumber)) return `member:${C.MemberNumber}`;
            const fallbackName = typeof C?.Name === "string" ? C.Name : "unknown";
            return `anon:${index}:${fallbackName}`;
        });

        members.sort();
        return `${members.length}|${members.join("|")}`;
    }

    function checkRoomRosterChange(reason = "watchdog") {
        const signature = currentRoomRosterSignature();

        if (signature == null) {
            roomRosterSignature = null;
            return;
        }

        if (roomRosterSignature == null) {
            roomRosterSignature = signature;
            captureVisiblePlushStates();
            pruneRememberedPlushStates(true);
            checkAchievements(true);
            return;
        }

        if (signature === roomRosterSignature) return;

        const previousSignature = roomRosterSignature;
        roomRosterSignature = signature;

        captureVisiblePlushStates();
        pruneRememberedPlushStates(true);
        checkAchievements(true);

        roomRosterRecoveryCount++;
        lastRoomRosterRecovery = {
            previousSignature,
            signature,
            reason,
            at: new Date().toISOString(),
        };

        log("Chat room roster changed; scheduling plush redraw recovery.", {
            previousSignature,
            signature,
            reason,
        });

        schedulePlushRecovery(`ChatRoom roster change (${reason})`);
    }

    function scheduleRoomRosterEventCheck(reason, delay = 0) {
        const generation = ++roomRosterEventCheckGeneration;
        window.setTimeout(() => {
            if (generation !== roomRosterEventCheckGeneration) return;
            checkRoomRosterChange(reason);
            pruneRemotePlushEmotes();
        }, delay);
    }

    function installRoomRosterEventHooks() {
        let hooked = 0;

        for (const functionName of ["ChatRoomSyncMemberJoin", "ChatRoomSyncMemberLeave"]) {
            if (installHook(functionName, 10000, (args, next) => {
                const result = next(args);
                scheduleRoomRosterEventCheck(functionName, 0);
                return result;
            })) hooked++;
        }

        if (installHook("ChatRoomLeave", 10000, (args, next) => {
            cacheRoomMascotState(roomMascotState);
            const result = next(args);
            roomRosterSignature = null;
            roomMascotState = null;
            removeRoomMascotOverlay();
            clearRemotePlushEmotes();
            pruneRememberedPlushStates(false);
            return result;
        })) hooked++;

        if (installHook("ChatRoomSync", 10000, (args, next) => {
            roomMascotState = null;
            removeRoomMascotOverlay();
            const result = next(args);
            const afterSync = reason => {
                scheduleRoomRosterEventCheck(reason, 0);
                window.setTimeout(() => recoverRoomMascotState({ allowCache: true }), 0);
            };
            if (result && typeof result.then === "function") {
                void result.then(
                    () => afterSync("ChatRoomSync"),
                    () => afterSync("ChatRoomSync failed")
                );
            } else {
                window.setTimeout(() => {
                    scheduleRoomRosterEventCheck("ChatRoomSync", 0);
                    recoverRoomMascotState({ allowCache: true });
                }, 100);
            }
            return result;
        })) hooked++;

        if (installHook("ChatRoomSyncRoomProperties", 10000, (args, next) => {
            const result = next(args);
            window.setTimeout(() => recoverRoomMascotState({ allowCache: false }), 0);
            return result;
        })) hooked++;

        roomRosterEventHookCount = hooked;
        return hooked;
    }

    function pruneRemotePlushEmotes() {
        const present = new Set((Array.isArray(window.ChatRoomCharacter) ? window.ChatRoomCharacter : [])
            .map(C => Number(C?.MemberNumber))
            .filter(Number.isFinite));
        for (const member of [...remotePlushEmotes.keys()]) {
            if (!present.has(member)) removeRemotePlushEmote(member);
        }
    }

    function startRoomRosterMonitor() {
        if (roomRosterWatchdog != null) return;

        roomRosterSignature = currentRoomRosterSignature();
        const hooked = installRoomRosterEventHooks();
        window.setTimeout(() => recoverRoomMascotState({ allowCache: true }), 250);

        roomRosterWatchdog = window.setInterval(
            () => checkRoomRosterChange(isLowCpuMode() ? "120-second watchdog" : "60-second watchdog"),
            performanceInterval(ROOM_ROSTER_WATCHDOG_INTERVAL_MS, ROOM_ROSTER_WATCHDOG_INTERVAL_MS * 3)
        );
        log(`Started event-driven room roster recovery (${hooked} hook(s), ${isLowCpuMode() ? "120s" : "60s"} watchdog).`);
    }

    function isChatAction(data) {
        return !!data && typeof data === "object" && data.Type === "Action";
    }

    function isPotentialPlushAction(data) {
        if (!isChatAction(data)) return false;

        const content = data?.Content;
        if (typeof content === "string" && (
            content.includes("SubbysPlushies") ||
            content.includes("subbysplushies") ||
            content.includes("Plushie") ||
            content.includes("plushie")
        )) return true;

        const dictionary = data?.Dictionary;
        if (!Array.isArray(dictionary)) return false;
        for (const entry of dictionary) {
            const tag = entry?.Tag;
            if (typeof tag === "string" && tag.startsWith("SubbysPlushies")) return true;

            const text = entry?.Text;
            if (typeof text === "string" && (text.includes("plushie") || text.includes("Plushie"))) return true;
        }
        return false;
    }

    function isPlushMenuActivity(entry) {
        if (!entry) return false;

        const name = entry.Name;
        if (typeof name === "string" && (name === HUG_TIGHTLY_ACTIVITY_NAME || CUSTOM_ACTIVITY_BY_NAME.has(name))) return true;

        const activityName = entry.ActivityName;
        if (typeof activityName === "string" && (activityName === HUG_TIGHTLY_ACTIVITY_NAME || CUSTOM_ACTIVITY_BY_NAME.has(activityName))) return true;

        const activity = entry.Activity;
        const nestedName = activity && typeof activity === "object" ? activity.Name : activity;
        return typeof nestedName === "string" &&
            (nestedName === HUG_TIGHTLY_ACTIVITY_NAME || CUSTOM_ACTIVITY_BY_NAME.has(nestedName));
    }

    function installActivityMenuOrderingHook() {
        if (installedHooks.has("ActivityAllowedForGroup")) {
            activityMenuOrderHookInstalled = true;
            return true;
        }

        const installed = installHook("ActivityAllowedForGroup", 10000, (args, next) => {
            const result = next(args);
            if (!Array.isArray(result) || result.length < 2) return result;

            if (!hugTightlyActivityEnabled && customActivityObjects.size === 0) return result;

            let sawPlush = false;
            let needsReorder = false;
            for (const entry of result) {
                if (isPlushMenuActivity(entry)) {
                    sawPlush = true;
                } else if (sawPlush) {
                    needsReorder = true;
                    break;
                }
            }

            if (!sawPlush || !needsReorder) return result;

            const normal = [];
            const plush = [];
            for (const entry of result) {
                (isPlushMenuActivity(entry) ? plush : normal).push(entry);
            }
            const reordered = normal.concat(plush);
            activityMenuOrderPassCount++;
            lastActivityMenuOrder = {
                group: typeof args?.[1] === "string" ? args[1] : args?.[1]?.Name || null,
                total: result.length,
                plushCount: plush.length,
                normalCount: normal.length,
                at: new Date().toISOString(),
            };
            return reordered;
        });

        activityMenuOrderHookInstalled = installed;
        if (installed) log("Installed R132 final activity-list ordering hook (plush actions last).");
        else warn("ActivityAllowedForGroup was unavailable; plush activity ordering was not installed.");
        return installed;
    }

    function installPlushStateHooks() {
        const activityOrderHooked = installActivityMenuOrderingHook();

        const drawCharacterHooked = installHook("DrawCharacter", 10000, (args, next) => {
            const C = args?.[0];
            const playerMember = Number(window.Player?.MemberNumber);
            const member = Number(C?.MemberNumber);
            const samePlayer = C === window.Player ||
                (Number.isFinite(playerMember) && member === playerMember);

            if (C && window.CurrentScreen === "ChatRoom") {
                const x = Number(args?.[1]);
                const y = Number(args?.[2]);
                const zoomArg = args?.[3] == null ? 1 : Number(args[3]);
                const zoom = Number.isFinite(zoomArg) && zoomArg > 0 ? zoomArg : 1;
                if (Number.isFinite(x) && Number.isFinite(y)) {
                    const placement = { x, y, zoom, at: Date.now() };
                    if (samePlayer) lastPlayerChatRoomDraw = placement;
                    if (Number.isFinite(member)) lastCharacterChatRoomDraw.set(member, placement);
                }
            }

            const result = next(args);

            if (samePlayer && (speechBubbleElement?.isConnected || plushStatusIconElement?.isConnected)) {
                const signature = plushOverlayPositionSignature(C, getHeld(C));
                if (signature && signature !== localOverlayPositionSignature) {
                    localOverlayPositionSignature = signature;
                    scheduleLocalOverlayReposition();
                }
            }
            if (!samePlayer && Number.isFinite(member)) {
                const remote = remotePlushEmotes.get(member);
                if (remote) {
                    const signature = plushOverlayPositionSignature(C, getHeld(C));
                    if (signature && signature !== remote.positionSignature) {
                        remote.positionSignature = signature;
                        requestAnimationFrame(() => positionRemotePlushEmote(member));
                    }
                }
            }
            return result;
        });

        const activityRunHooked = installHook("ActivityRun", 10000, (args, next) => {
            if (!hugTightlyActivityEnabled && customActivityObjects.size === 0) return next(args);

            const activityRunInfo = inspectActivityRunFast(args);
            if (activityRunInfo.hugTightly) pendingLocalHugTightlyUntil = Date.now() + 1500;

            const customSpec = activityRunInfo.customSpec;
            const jealousEnabled = getFeatureSettings().jealousPlushie;
            const focusedTarget = (customSpec || jealousEnabled) ? findActivityTargetFast(args) : null;
            if (customSpec) {
                pendingLocalCustomActivity = {
                    key: customSpec.key,
                    until: Date.now() + 2000,
                    target: focusedTarget,
                };
                if (
                    customSpec.key === "offer" &&
                    Number.isFinite(Number(focusedTarget?.MemberNumber)) &&
                    Number(focusedTarget.MemberNumber) !== Number(window.Player?.MemberNumber)
                ) {
                    rememberOutgoingPlushOffer(Number(focusedTarget.MemberNumber), "");
                }
            }

            let jealousReaction = null;
            if (jealousEnabled && !customSpec && !activityRunInfo.hugTightly && focusedTarget && focusedTarget !== window.Player) {
                const activityName = activityNameFromRunArgsFast(args);
                if (isAffectionateActivityName(activityName)) jealousReaction = { target: focusedTarget, activityName };
            }

            const runBalanceEffect = customSpec?.effect === "balanceHead";
            if (runBalanceEffect) {
                lastBalanceHeadActivityRunAt = Date.now();
                balanceHeadActivityTriggerCount++;
                lastBalanceHeadTriggerSource = "ActivityRun";
            }

            const result = next(args);

            if (runBalanceEffect) {
                window.setTimeout(movePlushToHeadTemporarily, 120);
            }
            if (customSpec) handleLocalPlushInteraction(customSpec.key);
            if (jealousReaction) window.setTimeout(() => triggerJealousReaction(jealousReaction.target, jealousReaction.activityName), 80);

            return result;
        });

        const refreshHooked = installHook("CharacterRefresh", 10000, (args, next) => {
            const C = args?.[0];
            if (!C || !isLocalPlayerCharacter(C) || localPlushRepairSuppressed(C)) return next(args);

            let item = getHeld(C);
            if (!isOurs(item)) return next(args);

            const preferred = rememberedPlushOption(C, lastPlushOption);
            repairPlushState(item, preferred, "CharacterRefresh pre", C);

            const result = next(args);

            item = getHeld(C);
            if (isOurs(item)) {
                const changedAfter = repairPlushState(item, preferred, "CharacterRefresh post", C);
                let balanceReapplied = false;

                if (C === window.Player && activeBalanceHeadSession) {
                    const session = activeBalanceHeadSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        balanceReapplied = setPlushLayerTransform(
                            item,
                            session.layerName,
                            session.headLayerTransform
                        );
                    }
                }

                let hideBehindReapplied = false;
                if (C === window.Player && activeHideBehindSession) {
                    const session = activeHideBehindSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        hideBehindReapplied = setPlushLayerTransform(
                            item,
                            session.layerName,
                            session.faceLayerTransform
                        );
                    }
                }

                let protectReapplied = false;
                if (C === window.Player && activeProtectSession) {
                    const session = activeProtectSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        protectReapplied = setPlushLayerTransform(item, session.layerName, session.protectLayerTransform);
                    }
                }

                if (changedAfter || balanceReapplied || hideBehindReapplied || protectReapplied) {
                    rebuildCharacterCanvas(
                        C,
                        balanceReapplied
                            ? "CharacterRefresh balance-head reapply"
                            : (hideBehindReapplied
                                ? "CharacterRefresh hide-behind reapply"
                                : (protectReapplied ? "CharacterRefresh protect reapply" : "CharacterRefresh post"))
                    );
                }
            }

            return result;
        });

        const updateHooked = installHook("ChatRoomCharacterUpdate", 10000, (args, next) => {
            const C = args?.[0] || window.Player;
            if (!isLocalPlayerCharacter(C) || localPlushRepairSuppressed(C)) return next(args);
            const item = getHeld(C);
            if (isOurs(item)) {
                const preferred = rememberedPlushOption(C, lastPlushOption);
                repairPlushState(item, preferred, "ChatRoomCharacterUpdate", C);

                if (C === window.Player && activeBalanceHeadSession) {
                    const session = activeBalanceHeadSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        setPlushLayerTransform(item, session.layerName, session.headLayerTransform);
                    }
                }

                if (C === window.Player && activeHideBehindSession) {
                    const session = activeHideBehindSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        setPlushLayerTransform(item, session.layerName, session.faceLayerTransform);
                    }
                }

                if (C === window.Player && activeProtectSession) {
                    const session = activeProtectSession;
                    if (getActivePlushLayerName(item) === session.layerName) {
                        setPlushLayerTransform(item, session.layerName, session.protectLayerTransform);
                    }
                }
            }
            return next(args);
        });

        const actionMessageHooked = installHook("ChatRoomMessage", 10000, (args, next) => {
            const data = args?.[0];
            if (processOfferDecisionSignal(data)) return next(args);

            const syncedEmote = isSyncedPlushEmotePacket(data);

            if (syncedEmote) {
                processSyncedPlushEmote(data);
                return next(args);
            }
            if (!isChatAction(data)) return next(args);

            const offerDecisionHandled = processOfferDecisionAction(data);
            const protectCandidate = getFeatureSettings().protectMe && actionLooksProtectable(data);
            const plushRelated = offerDecisionHandled || isPotentialPlushAction(data);
            if (!plushRelated && !protectCandidate) return next(args);

            const hugTightly = plushRelated && isHugTightlyAction(data);
            const hugTightlyToken = hugTightly ? getHugTightlyToken(data) : null;

            if (protectCandidate) maybeTriggerProtect(data, true);
            if (plushRelated) {
                processRoomMascotAction(data);
                processBattleAction(data);
                maybePromptOfferRecipient(data);
                captureVisiblePlushStates();
            }

            const result = next(args);

            if (hugTightly) void playPurrSfx(hugTightlyToken, "incoming Hug Tightly action");
            if (plushRelated) scheduleActionRecovery("ChatRoomMessage plush Action");
            return result;
        });

        const serverSendHooked = installHook("ServerSend", 10000, (args, next) => {
            const messageType = args?.[0];
            const originalData = args?.[1];
            const outgoingAction = messageType === "ChatRoomChat" && isChatAction(originalData);

            if (!outgoingAction) return next(args);

            const now = Date.now();
            const pendingHugTightly = now <= pendingLocalHugTightlyUntil;
            const pendingCustom = !!pendingLocalCustomActivity && pendingLocalCustomActivity.until >= now;
            if (!hugTightlyActivityEnabled && customActivityObjects.size === 0 && !pendingHugTightly && !pendingCustom) {
                return next(args);
            }

            let nextArgs = args;
            const packetLooksPlush = isPotentialPlushAction(originalData);
            const outgoingHugTightly = pendingHugTightly || (packetLooksPlush && isHugTightlyAction(originalData));
            if (outgoingHugTightly) {
                pendingLocalHugTightlyUntil = 0;
                const { data, token } = makeHugTightlyNetworkAction(originalData);
                nextArgs = args.slice();
                nextArgs[1] = data;
                adjustCurrentPlushMood(MOOD_DELTAS.hugTightly, "hug tightly");
                recordStat("interaction", 1, { action: "hugTightly", plushName: currentPlushName() });
                touchPlushRelationship(currentPlushName(), { increment: 1, wake: true });
                void playPurrSfx(token, "outgoing Hug Tightly action");
            } else {
                const directSpec = packetLooksPlush ? getCustomActivityFromAction(originalData) : null;
                const pendingSpec =
                    pendingCustom
                        ? CUSTOM_ACTIVITY_BY_KEY.get(pendingLocalCustomActivity.key)
                        : null;
                const customSpec = directSpec || pendingSpec;

                if (customSpec) {
                    const fallbackTarget =
                        pendingLocalCustomActivity?.target ||
                        findActivityTargetFromArgs(args) ||
                        window.DialogFocusCharacter ||
                        null;
                    pendingLocalCustomActivity = null;

                    const normalized = makeCustomActivityNetworkAction(originalData, customSpec, fallbackTarget);
                    nextArgs = args.slice();
                    nextArgs[1] = normalized.data;

                    if (customSpec.key === "offer" && Number.isFinite(normalized.targetMember) && !normalized.isSelf) {
                        rememberOutgoingPlushOffer(normalized.targetMember, normalized.token);
                        recordStat("offer", 1, { plushName: currentPlushName() });
                    }

                    if (customSpec.effect === "balanceHead" && Date.now() - lastBalanceHeadActivityRunAt > 750) {
                        lastBalanceHeadTriggerSource = "ServerSend fallback";
                        window.setTimeout(movePlushToHeadTemporarily, 120);
                    }
                }
            }

            if (nextArgs === args && !outgoingHugTightly) return next(args);

            captureVisiblePlushStates();
            const result = next(nextArgs);

            scheduleActionRecovery("outgoing plush Action");
            return result;
        });

        captureVisiblePlushStates();
        startRoomRosterMonitor();

        log(
            `Installed plush-state persistence hooks: ActivityAllowedForGroup=${activityOrderHooked}, ` +
            `DrawCharacter=${drawCharacterHooked}, ActivityRun=${activityRunHooked}, CharacterRefresh=${refreshHooked}, ` +
            `ChatRoomCharacterUpdate=${updateHooked}, ` +
            `ChatRoomMessage=${actionMessageHooked}, ServerSend=${serverSendHooked}, ` +
            `RoomRosterEvents=${roomRosterEventHookCount}, watchdog=60s (no forced Action refresh).`
        );
    }

    function getFocusedPlushItem() {
        const C = window.DialogFocusCharacter || window.Player;
        const focusItem = window.DialogFocusItem;
        const item = isOurs(focusItem) ? focusItem : getHeld(C);
        return { C, item };
    }

    function currentPlushOption() {
        const wireOption = getItemPlushOption(getFocusedPlushItem().item);
        return wireToPublicPlushOption(wireOption);
    }

    function getLayeringAPI() {
        try {
            if (typeof Layering !== "undefined" && Layering) return Layering;
        } catch (_) {}

        return window.Layering || null;
    }

    function nativeLayeringRoot() {
        const api = getLayeringAPI();
        const rootID = api?.ID?.root || "layering";
        return document.getElementById(rootID);
    }

    function nativeLayeringVisible() {
        return !!nativeLayeringRoot();
    }

    function isPlushLayerName(value) {
        return typeof value === "string" && /^Plush\d+$/.test(value);
    }

    function readNativeItemTransform(item) {
        const property = getProperty(item);
        if (!property) return null;

        const transform = {};
        for (const key of NATIVE_LAYER_TRANSFORM_KEYS) {
            const fallback = DEFAULT_TRANSFORM[key];
            transform[key] = Number.isFinite(property[key]) ? property[key] : fallback;
        }
        return transform;
    }

    function nativeItemTransformSignature(item) {
        const transform = readNativeItemTransform(item);
        return transform ? JSON.stringify(transform) : null;
    }

    function resetGenericNativeTransform(item) {
        const property = getProperty(item);
        if (!property) return false;
        for (const [key, value] of Object.entries(DEFAULT_TRANSFORM)) property[key] = value;
        return true;
    }

    function compactPlushLayerTransformsToActive(item, fallbackTransform = null) {
        const property = getProperty(item);
        const activeLayer = getActivePlushLayerName(item);
        if (!property || !activeLayer) return false;

        let changed = false;

        for (const [transformKey, layerProperty] of Object.entries(NATIVE_LAYER_PROPERTY_BY_TRANSFORM)) {
            let record = property[layerProperty];
            if (!record || typeof record !== "object" || Array.isArray(record)) {
                if (Object.prototype.hasOwnProperty.call(property, layerProperty)) {
                    delete property[layerProperty];
                    changed = true;
                }
                record = null;
            }

            let activeValue = record?.[activeLayer];

            if (!Number.isFinite(activeValue)) {
                const rememberedValue = fallbackTransform?.[transformKey];
                if (Number.isFinite(rememberedValue)) activeValue = rememberedValue;
            }

            if (Number.isFinite(activeValue)) {
                if (!record) {
                    record = {};
                    property[layerProperty] = record;
                    changed = true;
                }
                if (record[activeLayer] !== activeValue) {
                    record[activeLayer] = activeValue;
                    changed = true;
                }
            }

            if (!record) continue;

            for (const layerName of Object.keys(record)) {
                if (layerName !== activeLayer && isPlushLayerName(layerName)) {
                    delete record[layerName];
                    changed = true;
                }
            }

            if (Object.keys(record).length === 0) {
                delete property[layerProperty];
                changed = true;
            }
        }

        return changed;
    }

    function hasPlushLayerTransform(item) {
        const property = getProperty(item);
        const layerName = getActivePlushLayerName(item);
        if (!property || !layerName) return false;
        return Object.values(NATIVE_LAYER_PROPERTY_BY_TRANSFORM).some(layerProperty => {
            const record = property[layerProperty];
            return !!record && typeof record === "object" && !Array.isArray(record) && Number.isFinite(record[layerName]);
        });
    }

    function readActivePlushLayerTransform(item) {
        const property = getProperty(item);
        const activeLayer = getActivePlushLayerName(item);
        if (!property || !activeLayer) return null;

        const transform = {};
        for (const [transformKey, layerProperty] of Object.entries(NATIVE_LAYER_PROPERTY_BY_TRANSFORM)) {
            const record = property[layerProperty];
            const value = record && typeof record === "object" && !Array.isArray(record)
                ? record[activeLayer]
                : undefined;
            transform[transformKey] = Number.isFinite(value) ? value : DEFAULT_TRANSFORM[transformKey];
        }
        return transform;
    }

    function mergeNativeTransformWithActiveLayer(item, changedFields = null) {
        const nativeTransform = readNativeItemTransform(item);
        const activeTransform = readActivePlushLayerTransform(item);
        if (!nativeTransform || !activeTransform) return null;

        const explicitFields = Array.isArray(changedFields)
            ? new Set(changedFields.filter(field => NATIVE_LAYER_TRANSFORM_KEYS.includes(field)))
            : null;

        if (explicitFields?.size) {
            for (const field of explicitFields) activeTransform[field] = nativeTransform[field];
            return activeTransform;
        }

        for (const field of NATIVE_LAYER_TRANSFORM_KEYS) {
            if (nativeTransform[field] !== DEFAULT_TRANSFORM[field]) {
                activeTransform[field] = nativeTransform[field];
            }
        }
        return activeTransform;
    }

    function mirrorNativeTransformToActivePlushLayer(C, item, reason = "native Layering", publish = true, changedFields = null) {
        if (!C || !isOurs(item)) return false;
        ensureNativeTransform(item);

        const property = getProperty(item);
        const transform = mergeNativeTransformWithActiveLayer(item, changedFields);
        const activeLayer = getActivePlushLayerName(item);
        if (!property || !transform || !activeLayer) return false;

        for (const [transformKey, layerProperty] of Object.entries(NATIVE_LAYER_PROPERTY_BY_TRANSFORM)) {
            if (!property[layerProperty] || typeof property[layerProperty] !== "object" || Array.isArray(property[layerProperty])) {
                property[layerProperty] = {};
            }
            property[layerProperty][activeLayer] = transform[transformKey];
        }
        compactPlushLayerTransformsToActive(item, transform);
        resetGenericNativeTransform(item);
        rememberCharacterPlushState(C, item);

        rebuildCharacterCanvas(C, reason);
        if (C === window.Player) scheduleLocalOverlayReposition();

        if (publish && C === window.Player) {
            try {
                if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(C);
            } catch (e) {
                warn(`Could not publish Move / Resize values (${reason}):`, e);
            }
        }

        nativeLayeringLastSignature = nativeItemTransformSignature(item);
        nativeLayeringSyncCount++;
        lastNativeLayeringSync = {
            reason,
            transform: { ...transform },
            changedFields: Array.isArray(changedFields) ? [...changedFields] : null,
            canonical: "active-layer-only",
            activeLayer,
            published: !!publish,
            at: new Date().toISOString(),
        };
        return true;
    }

    function canonicalizeExistingMoveResize(C, item, reason = "Move / Resize canonicalize") {
        if (!C || !isOurs(item)) return false;
        ensureNativeTransform(item);

        const remembered = rememberCharacterPlushState(C, item);
        compactPlushLayerTransformsToActive(item, remembered?.layerTransform || null);

        if (!hasPlushLayerTransform(item)) {
            return mirrorNativeTransformToActivePlushLayer(C, item, reason, false);
        }

        resetGenericNativeTransform(item);
        rememberCharacterPlushState(C, item);
        rebuildCharacterCanvas(C, reason);
        if (C === window.Player) scheduleLocalOverlayReposition();
        return true;
    }

    function flattenLayeringIDs(value, prefix = "", output = []) {
        if (!value || typeof value !== "object") return output;
        for (const [key, entry] of Object.entries(value)) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof entry === "string") output.push([path, entry]);
            else if (entry && typeof entry === "object") flattenLayeringIDs(entry, path, output);
        }
        return output;
    }

    function nativeLayeringInputDescription(input, api) {
        const parts = [
            input?.id,
            input?.name,
            input?.placeholder,
            input?.getAttribute?.("aria-label"),
            input?.getAttribute?.("title"),
        ];

        try {
            if (input?.labels) {
                for (const label of input.labels) parts.push(label?.textContent);
            }
        } catch (_) {}

        if (input?.id && api?.ID) {
            for (const [path, id] of flattenLayeringIDs(api.ID)) {
                if (id === input.id) parts.push(path);
            }
        }

        try {
            const parentText = input?.parentElement?.textContent;
            if (parentText && parentText.length < 180) parts.push(parentText);
        } catch (_) {}

        return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim().toLowerCase();
    }

    function visibleNativeLayeringInputs(root) {
        if (!root) return [];
        return [...root.querySelectorAll("input")].filter(input => {
            if (input.disabled) return false;
            const type = String(input.type || "text").toLowerCase();
            if (!["number", "text", "range"].includes(type)) return false;
            try {
                const style = window.getComputedStyle?.(input);
                if (style?.display === "none" || style?.visibility === "hidden") return false;
                if (input.getClientRects && input.getClientRects().length === 0) return false;
            } catch (_) {}
            return true;
        });
    }

    function inferNativeLayeringInputField(input, root, api) {
        const description = nativeLayeringInputDescription(input, api);
        const tab = String(api?.activeTab || "").toLowerCase();

        const hasX = /(?:^|[^a-z])x(?:[^a-z]|$)|horizontal|left/.test(description);
        const hasY = /(?:^|[^a-z])y(?:[^a-z]|$)|vertical|top/.test(description);

        if (/rotation|rotate|angle/.test(description) || /rotation|rotate/.test(tab)) {
            return { field: "Rotation", description };
        }
        if (/width|scalex|scale x|resize x|size x/.test(description)) {
            return { field: "ScaleX", description };
        }
        if (/height|scaley|scale y|resize y|size y/.test(description)) {
            return { field: "ScaleY", description };
        }
        if (/translationx|translate x|move x|offset x|position x/.test(description)) {
            return { field: "TranslationX", description };
        }
        if (/translationy|translate y|move y|offset y|position y/.test(description)) {
            return { field: "TranslationY", description };
        }

        if (/scale|resize|size/.test(tab)) {
            if (hasX) return { field: "ScaleX", description };
            if (hasY) return { field: "ScaleY", description };
        }
        if (/translation|translate|move|position/.test(tab)) {
            if (hasX) return { field: "TranslationX", description };
            if (hasY) return { field: "TranslationY", description };
        }

        const inputs = visibleNativeLayeringInputs(root);
        const index = inputs.indexOf(input);
        if (index >= 0) {
            if (/rotation|rotate/.test(tab)) return { field: "Rotation", description };
            if (/scale|resize|size/.test(tab)) {
                return { field: index === 0 ? "ScaleX" : index === 1 ? "ScaleY" : null, description };
            }
            if (/translation|translate|move|position/.test(tab) || !tab) {
                return { field: index === 0 ? "TranslationX" : index === 1 ? "TranslationY" : null, description };
            }
        }

        return { field: null, description };
    }

    function convertNativeLayeringInputValue(field, rawValue, description) {
        const value = Number(rawValue);
        if (!Number.isFinite(value)) return null;

        if (field === "ScaleX" || field === "ScaleY") {
            const baseSize = field === "ScaleX" ? PLUSH_RENDER.Width : PLUSH_RENDER.Height;
            if (/percent|%/.test(description)) return value / 100;
            if (/width|height|pixel|px/.test(description)) return value / baseSize;

            if (Math.abs(value) > 8) return value / baseSize;
            return value;
        }

        if (field === "TranslationX") {
            if (/absolute|position x|left/.test(description) && Math.abs(value) > 128) {
                return value - PLUSH_RENDER.Left;
            }
            return value;
        }
        if (field === "TranslationY") {
            if (/absolute|position y|top/.test(description) && Math.abs(value) > 128) {
                return value - PLUSH_RENDER.Top;
            }
            return value;
        }

        return value;
    }

    function applyNativeLayeringInputFallback(input, root, api, item, signatureBefore) {
        if (!isOurs(item)) return false;

        const signatureAfterNative = nativeItemTransformSignature(item);
        if (signatureBefore && signatureAfterNative && signatureAfterNative !== signatureBefore) return false;

        const { field, description } = inferNativeLayeringInputField(input, root, api);
        if (!field) return false;

        const value = convertNativeLayeringInputValue(field, input.value, description);
        if (!Number.isFinite(value)) return false;

        const property = getProperty(item);
        if (!property) return false;
        property[field] = value;

        nativeLayeringFallbackWrites++;
        lastNativeLayeringInput = {
            field,
            rawValue: input.value,
            appliedValue: value,
            description,
            activeTab: api?.activeTab ?? null,
            fallback: true,
            at: new Date().toISOString(),
        };
        return true;
    }

    function attachNativeLayeringInputBridge(root, api) {
        if (!root || root === nativeLayeringBridgeRoot) return;

        if (nativeLayeringBridgeRoot && nativeLayeringBridgeInputHandler) {
            try {
                nativeLayeringBridgeRoot.removeEventListener("input", nativeLayeringBridgeInputHandler, true);
                nativeLayeringBridgeRoot.removeEventListener("change", nativeLayeringBridgeInputHandler, true);
            } catch (_) {}
        }

        nativeLayeringBridgeRoot = root;
        nativeLayeringBridgeInputHandler = event => {
            const input = event?.target;
            if (!(input instanceof HTMLInputElement)) return;

            const inputType = String(input.type || "text").toLowerCase();
            if (event.type === "input" && inputType !== "range") return;

            nativeLayeringInputEvents++;
            const focused = getFocusedPlushItem();
            if (!focused.C || !isOurs(focused.item)) return;
            const signatureBefore = nativeItemTransformSignature(focused.item);
            const eventType = event.type;
            const inferredField = inferNativeLayeringInputField(input, root, api).field;

            window.setTimeout(() => {
                const current = getFocusedPlushItem();
                if (!current.C || !isOurs(current.item)) return;
                applyNativeLayeringInputFallback(input, root, api, current.item, signatureBefore);
                mirrorNativeTransformToActivePlushLayer(
                    current.C,
                    current.item,
                    `Move / Resize ${eventType}`,
                    eventType === "change",
                    inferredField ? [inferredField] : null
                );
            }, 0);
        };

        root.addEventListener("input", nativeLayeringBridgeInputHandler, true);
        root.addEventListener("change", nativeLayeringBridgeInputHandler, true);
    }

    function installNativeLayeringResizeBridge(api) {
        if (!api || typeof api.Resize !== "function") return false;
        if (api.Resize[NATIVE_LAYERING_RESIZE_MARK]) return true;

        const original = api.Resize;
        const wrapped = function (...args) {
            const beforeFocused = getFocusedPlushItem();
            const beforeTransform = beforeFocused.C && isOurs(beforeFocused.item)
                ? readNativeItemTransform(beforeFocused.item)
                : null;

            const result = original.apply(this, args);
            window.setTimeout(() => {
                const { C, item } = getFocusedPlushItem();
                if (!C || !isOurs(item)) return;

                const afterTransform = readNativeItemTransform(item);
                const changedFields = beforeTransform && afterTransform
                    ? NATIVE_LAYER_TRANSFORM_KEYS.filter(field => beforeTransform[field] !== afterTransform[field])
                    : [];

                if (changedFields.length) {
                    mirrorNativeTransformToActivePlushLayer(C, item, "Layering.Resize", true, changedFields);
                }
            }, 0);
            return result;
        };

        try {
            Object.defineProperty(wrapped, NATIVE_LAYERING_RESIZE_MARK, { value: true });
            api.Resize = wrapped;
            nativeLayeringResizeWrapCount++;
            return true;
        } catch (e) {
            warn("Could not wrap R132 Layering.Resize; using input/poll bridge only:", e);
            return false;
        }
    }

    function stopNativeLayeringBridge() {
        if (nativeLayeringBridgeTimer != null) {
            window.clearInterval(nativeLayeringBridgeTimer);
            nativeLayeringBridgeTimer = null;
        }
        if (nativeLayeringBridgeRoot && nativeLayeringBridgeInputHandler) {
            try {
                nativeLayeringBridgeRoot.removeEventListener("input", nativeLayeringBridgeInputHandler, true);
                nativeLayeringBridgeRoot.removeEventListener("change", nativeLayeringBridgeInputHandler, true);
            } catch (_) {}
        }
        nativeLayeringBridgeRoot = null;
        nativeLayeringBridgeInputHandler = null;
        nativeLayeringLastSignature = null;
    }

    function startNativeLayeringBridge(api) {
        stopNativeLayeringBridge();
        installNativeLayeringResizeBridge(api);
        nativeLayeringBridgeStartedAt = Date.now();

        nativeLayeringBridgeTimer = window.setInterval(() => {
            const root = nativeLayeringRoot();
            if (root) attachNativeLayeringInputBridge(root, api);

            if (!root && Date.now() - nativeLayeringBridgeStartedAt > 1500) {
                stopNativeLayeringBridge();
            }
        }, LAYERING_BRIDGE_MONITOR_INTERVAL_MS);
    }

    async function openNativeLayering() {
        if (!ready) {
            warn("Not ready yet.");
            return;
        }

        const { C, item } = getFocusedPlushItem();
        if (!C || !isOurs(item)) {
            warn("Equip Subby's Plushies first with /plushie.");
            return;
        }

        const api = getLayeringAPI();
        if (!api || typeof api.Init !== "function") {
            error("R132 Layering.Init is unavailable. Run /plushiedebug.");
            return;
        }

        removeRoomMascotOverlay();
        setDragMode(false);
        if (activeIdleAnimationSession) cancelIdleAnimation();
        if (C === window.Player && activeBalanceHeadSession) restoreActiveBalanceHead("opened Move / Resize");
        if (C === window.Player && activeHideBehindSession) restoreActiveHideBehind("opened Move / Resize");
        if (C === window.Player && activeProtectSession) restoreActiveProtect("opened Move / Resize");

        ensureNativeTransform(item);
        canonicalizeExistingMoveResize(C, item, "Move / Resize open canonicalize");
        installNativeLayeringResizeBridge(api);

        try {
            api.activeTab = "translation";
        } catch (_) {}

        try {
            await api.Init(item, C);
            startNativeLayeringBridge(api);
        } catch (e) {
            error("Opening BC's native Layering editor failed:", e);
        }
    }

    function resetPosition() {
        const item = getHeld(window.Player);
        if (!isOurs(item)) {
            warn("Equip Subby's Plushies first with /plushie.");
            return;
        }

        setDragMode(false);
        if (activeIdleAnimationSession) cancelIdleAnimation();
        if (activeBalanceHeadSession) restoreActiveBalanceHead("position reset");
        if (activeHideBehindSession) restoreActiveHideBehind("position reset");
        if (activeProtectSession) restoreActiveProtect("position reset");

        ensureNativeTransform(item, true);
        const property = getProperty(item);
        if (property) {
            for (const layerProperty of Object.values(NATIVE_LAYER_PROPERTY_BY_TRANSFORM)) {
                delete property[layerProperty];
            }
        }

        rebuildCharacterCanvas(window.Player, "Move / Resize reset");
        try {
            if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(window.Player);
        } catch (e) {
            warn("Could not publish reset plush position:", e);
        }
        log("Reset plush position.", { ...PLUSH_RENDER, ...DEFAULT_TRANSFORM });
    }

    function loadImage(url, label) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            if (/^https?:/i.test(url)) image.crossOrigin = "anonymous";

            const timeout = window.setTimeout(() => {
                image.onload = null;
                image.onerror = null;
                try { image.src = ""; } catch (_) {}
                reject(new Error(`Timed out loading ${label}.`));
            }, 5000);

            image.onload = () => {
                window.clearTimeout(timeout);
                if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                    resolve(image);
                } else {
                    reject(new Error(`${label} decoded as a broken image.`));
                }
            };

            image.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error(`Could not load ${label}.`));
            };
            image.src = url;
        });
    }

    async function renderSmallPlush(url, label) {
        const image = await loadImage(url, label);
        const canvas = document.createElement("canvas");
        canvas.width = PLUSH_RENDER.Width;
        canvas.height = PLUSH_RENDER.Height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error(`Could not create a canvas context for ${label}.`);

        ctx.imageSmoothingEnabled = true;
        if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";

        const scale = Math.min(
            canvas.width / image.naturalWidth,
            canvas.height / image.naturalHeight
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const x = Math.round((canvas.width - width) / 2);
        const y = Math.round((canvas.height - height) / 2);

        ctx.drawImage(image, x, y, width, height);

        let dataUrl;
        try {
            dataUrl = canvas.toDataURL("image/png");
        } catch (e) {
            throw new Error(`Could not resize ${label}: ${String(e)}`);
        }

        if (!dataUrl.startsWith("data:image/png")) {
            throw new Error(`Could not encode resized image for ${label}.`);
        }

        return dataUrl;
    }

    function makeTransparentRenderFallback() {
        const canvas = document.createElement("canvas");
        canvas.width = PLUSH_RENDER.Width;
        canvas.height = PLUSH_RENDER.Height;
        return canvas.toDataURL("image/png");
    }

    async function prepareRenderImages() {
        const uniqueSources = [...new Set(PLUSH_IMAGES)];
        const firstIndexBySource = new Map();

        PLUSH_IMAGES.forEach((source, index) => {
            if (!firstIndexBySource.has(source)) firstIndexBySource.set(source, index);
        });

        const preparedEntries = await Promise.all(
            uniqueSources.map(async source => {
                const index = firstIndexBySource.get(source) ?? 0;
                try {
                    return [source, await renderSmallPlush(source, PLUSH_NAMES[index])];
                } catch (e) {
                    warn(`Could not prepare remote plush image for ${PLUSH_NAMES[index]}:`, source, e);
                    return [source, null];
                }
            })
        );

        const prepared = new Map(preparedEntries);
        const subbycatSource = PLUSH_IMAGES[0];
        const firstGoodRender =
            prepared.get(subbycatSource) ||
            preparedEntries.find(([, image]) => typeof image === "string" && image.startsWith("data:image/png"))?.[1] ||
            makeTransparentRenderFallback();

        PLUSH_IMAGES.forEach((source, index) => {
            const image = prepared.get(source);
            renderImages[index] =
                typeof image === "string" && image.startsWith("data:image/png")
                    ? image
                    : firstGoodRender;
        });

        try {
            hugTightlyIconImage = await renderSmallPlush(HUG_TIGHTLY_ICON_URL, HUG_TIGHTLY_ACTIVITY_LABEL);
            log("Prepared Hug Tightly activity icon from assets/plushies/hugtightly.png.");
        } catch (e) {
            hugTightlyIconImage = renderImages[0] || firstGoodRender;
            warn("Could not load assets/plushies/hugtightly.png; using the plush image as the activity icon.", e);
        }

        imageMappings = buildImageMappings();

        const failedCount = preparedEntries.filter(([, image]) => !image).length;
        log(
            `Prepared ${uniqueSources.length - failedCount}/${uniqueSources.length} remote plush image source(s) ` +
            `for ${PLUSHES.length} plush options${failedCount ? `; ${failedCount} used fallback artwork` : ""}.`
        );
    }

    function resolveModularArchetype() {
        if (modularArchetype != null) return modularArchetype;

        const donors = [
            ["ItemMouth", "ModularGag"],
            ["ItemPelvis", "ModularChastityBelt"],
        ];

        for (const [group, name] of donors) {
            try {
                const asset = AssetGet(FAMILY, group, name);
                if (asset?.Archetype != null) {
                    modularArchetype = asset.Archetype;
                    return modularArchetype;
                }
            } catch (_) {}
        }

        try {
            if (typeof ExtendedArchetype !== "undefined" && ExtendedArchetype?.MODULAR != null) {
                modularArchetype = ExtendedArchetype.MODULAR;
            }
        } catch (_) {}

        return modularArchetype;
    }

    function makeLayers() {
        return PLUSHES.map((_, index) => ({
            Name: `Plush${index + 1}`,
            AllowColorize: false,
            AllowTypes: { [MODULE_KEY]: [index] },
        }));
    }

    function makeExtendedConfig() {
        const archetype = resolveModularArchetype();
        if (archetype == null) {
            throw new Error("Could not resolve BC's MODULAR ExtendedItem archetype.");
        }

        return {
            Archetype: archetype,
            DrawImages: false,
            Modules: [
                {
                    Name: "Plushie",
                    Key: MODULE_KEY,
                    Options: PLUSHES.map(() => ({})),
                },
            ],
        };
    }

    function makeAssetStrings() {
        const EN = {
            SelectBase: "Choose a plushie",
            ModulePlushie: "Plushie",
        };

        PLUSH_NAMES.forEach((label, index) => {
            EN[`Option${MODULE_KEY}${index}`] = label;
            EN[`Set${MODULE_KEY}${index}`] =
                `SourceCharacter selects ${label} for DestinationCharacter.`;
        });

        return { EN };
    }

    function buildImageMappings() {
        const mappings = {
            [`${ASSET_BASE}.png`]: renderImages[0],
            [`${ASSET_BASE.replace(`/${ASSET_NAME}`, `/Preview/${ASSET_NAME}`)}.png`]: renderImages[0],
        };

        for (const size of SIZE_TOKENS) {
            mappings[`${ASSET_BASE}_${size}.png`] = renderImages[0];
        }

        PLUSHES.forEach((_, index) => {
            const layerName = `Plush${index + 1}`;
            const typeToken = `${MODULE_KEY}${index}`;
            const image = renderImages[index];

            mappings[`${ASSET_BASE}_${layerName}.png`] = image;

            mappings[`${ASSET_BASE}_${typeToken}.png`] = image;
            mappings[`${ASSET_BASE}_${typeToken}_${layerName}.png`] = image;
            mappings[`${ASSET_BASE}_${layerName}_${typeToken}.png`] = image;

            for (const size of SIZE_TOKENS) {
                mappings[`${ASSET_BASE}_${size}_${layerName}.png`] = image;
                mappings[`${ASSET_BASE}_${layerName}_${size}.png`] = image;
                mappings[`${ASSET_BASE}_${size}_${typeToken}.png`] = image;
                mappings[`${ASSET_BASE}_${typeToken}_${size}.png`] = image;
                mappings[`${ASSET_BASE}_${size}_${typeToken}_${layerName}.png`] = image;
                mappings[`${ASSET_BASE}_${typeToken}_${size}_${layerName}.png`] = image;
                mappings[`${ASSET_BASE}_${size}_${layerName}_${typeToken}.png`] = image;
            }
        });

        return mappings;
    }

    function buildNativeAssetTextMap() {
        const strings = makeAssetStrings().EN;
        const prefix = `${GROUP}${ASSET_NAME}`;

        const textMap = new Map([
            [prefix, DISPLAY_NAME],
            [`${GROUP}:${ASSET_NAME}`, DISPLAY_NAME],
            [`${GROUP.toLowerCase()}:${ASSET_NAME.toLowerCase()}`, DISPLAY_NAME],
        ]);

        for (const [key, value] of Object.entries(strings)) {
            textMap.set(`${prefix}${key}`, value);
        }

        return textMap;
    }

    function installAssetTextHook() {
        const textMap = buildNativeAssetTextMap();
        if (!installHook("AssetTextGet", 1000, (args, next) => {
            const key = args?.[0];
            if (typeof key === "string" && textMap.has(key)) return textMap.get(key);
            return next(args);
        })) {
            throw new Error("AssetTextGet is unavailable; cannot install custom asset text.");
        }
    }

    function installHugTightlyTextHook() {
        const compactHugName = compactActivityName(HUG_TIGHTLY_ACTIVITY_NAME);
        const activityTextTokens = CUSTOM_PLUSH_ACTIVITIES.map(spec => ({
            spec,
            name: compactActivityName(spec.name),
            label: compactActivityName(spec.label),
        }));

        function specFromTextKey(key, compactKey = compactActivityName(key)) {
            for (const token of activityTextTokens) {
                if (compactKey.includes(token.name) || compactKey.includes(token.label)) return token.spec;
            }
            return null;
        }

        function bcActivityTemplate(spec, self) {
            const template = self ? spec.selfText : (spec.otherText || spec.selfText);
            return template
                .replaceAll("{Source}", "SourceCharacter")
                .replaceAll("{Target}", "DestinationCharacter");
        }

        const activityHooked = installHook("ActivityDictionaryText", 1000, (args, next) => {
            const key = args?.[0];
            if (typeof key !== "string") return next(args);
            if (
                !key.includes("SubbysPlushies") &&
                !key.includes("HugTightly") &&
                !key.includes("Plushie") &&
                !key.includes("plushie") &&
                !key.includes("Rub Against Face") &&
                !key.includes("Cuddle to Chest") &&
                !key.includes("Nuzzle")
            ) return next(args);

            const compactKey = compactActivityName(key);
            const isHug = compactKey.includes(compactHugName) || compactKey.includes("hugtightlyitem");
            if (isHug) {
                if (/^label-/i.test(key)) return HUG_TIGHTLY_ACTIVITY_LABEL;
                if (/^chat(?:self|other)-/i.test(key)) {
                    void playPurrSfx(null, "Hug Tightly activity rendered");
                    return "SourceCharacter hugs the plushie tightly.";
                }
                return HUG_TIGHTLY_ACTIVITY_LABEL;
            }

            const spec = specFromTextKey(key, compactKey);
            if (!spec) return next(args);

            if (/^label-/i.test(key)) return spec.label;
            if (/^chatself-/i.test(key)) return bcActivityTemplate(spec, true);
            if (/^chatother-/i.test(key)) return bcActivityTemplate(spec, false);
            return spec.label;
        });

        if (!activityHooked) {
            throw new Error("ActivityDictionaryText is unavailable; cannot register plush activity text safely.");
        }
        return true;
    }

    const IMAGE_COMPACT_HUG_NAME = compactActivityName(HUG_TIGHTLY_ACTIVITY_NAME);
    const IMAGE_CUSTOM_ACTIVITY_TOKENS = Object.freeze(
        CUSTOM_PLUSH_ACTIVITIES.map(spec => Object.freeze({ spec, name: compactActivityName(spec.name) }))
    );

    function normalizeAssetImagePath(source) {
        if (typeof source !== "string") return null;

        let value = source.trim();
        if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;

        value = value.split("#", 1)[0].split("?", 1)[0];

        try {
            value = decodeURIComponent(value);
        } catch (_) {}

        const assetsIndex = value.indexOf("Assets/");
        if (assetsIndex >= 0) value = value.slice(assetsIndex);

        while (value.startsWith("./")) value = value.slice(2);
        while (value.startsWith("../")) value = value.slice(3);

        return value;
    }

    function mapImageSource(source) {
        if (typeof source !== "string" || !imageMappings) return source;

        if (
            !source.includes(ASSET_NAME) &&
            !source.includes("SubbysPlushies") &&
            !source.includes("subbysplushies")
        ) return source;

        const normalized = normalizeAssetImagePath(source);
        if (typeof normalized !== "string") return source;

        const direct = imageMappings[normalized];
        if (direct) return direct;

        const compactNormalized = normalized.replace(/[^a-z0-9]/gi, "").toLowerCase();
        let extraActivitySpec = null;
        for (const token of IMAGE_CUSTOM_ACTIVITY_TOKENS) {
            if (compactNormalized.includes(token.name)) {
                extraActivitySpec = token.spec;
                break;
            }
        }

        if (
            compactNormalized.includes(IMAGE_COMPACT_HUG_NAME) ||
            compactNormalized.includes("hugtightlyitem") ||
            compactNormalized.includes("subbysplushieshugtightly")
        ) {
            return hugTightlyIconImage || renderImages[0] || source;
        }

        if (extraActivitySpec) {
            const selected = getItemPlushOption(getHeld(window.Player));
            return renderImages[selected] || renderImages[0] || source;
        }

        if (!normalized.includes(ASSET_NAME)) return source;

        const typeMatch = normalized.match(/(?:^|[_/])p(\d+)(?:[_./]|$)/i);
        if (typeMatch) {
            const index = Number(typeMatch[1]);
            if (Number.isInteger(index) && index >= 0 && index < renderImages.length) {
                return renderImages[index];
            }
        }

        const layerMatch = normalized.match(/(?:^|[_/])Plush(\d+)(?:[_./]|$)/i);
        if (layerMatch) {
            const index = Number(layerMatch[1]) - 1;
            if (Number.isInteger(index) && index >= 0 && index < renderImages.length) {
                return renderImages[index];
            }
        }

        if (
            normalized.endsWith(`/${ASSET_NAME}.png`) ||
            normalized.includes(`/Preview/${ASSET_NAME}.png`) ||
            normalized.includes(`${ASSET_NAME}_`)
        ) {
            return renderImages[0];
        }

        if (!unmappedImageSources.has(normalized)) {
            unmappedImageSources.add(normalized);
            warn("Saw an unrecognized Subby's Plushies image path:", source);
        }

        return source;
    }

    function installNativeImageElementHook() {
        const proto = window.HTMLImageElement?.prototype;
        if (!proto) return false;

        let installed = false;

        const srcDescriptor = Object.getOwnPropertyDescriptor(proto, "src");
        if (
            srcDescriptor?.get &&
            srcDescriptor?.set &&
            srcDescriptor.configurable &&
            !srcDescriptor.set[CUSTOM_HOOK_MARK]
        ) {
            const originalSet = srcDescriptor.set;
            const wrappedSet = function (value) {
                if (typeof value !== "string") return originalSet.call(this, value);
                if (!value.includes("SubbysPlushies") && !value.includes("subbysplushies")) {
                    return originalSet.call(this, value);
                }
                return originalSet.call(this, mapImageSource(value));
            };

            try {
                Object.defineProperty(wrappedSet, CUSTOM_HOOK_MARK, { value: true });
                Object.defineProperty(proto, "src", {
                    ...srcDescriptor,
                    set: wrappedSet,
                });
                imageElementSrcHookInstalled = true;
                installed = true;
            } catch (e) {
                warn("Could not wrap HTMLImageElement.src; falling back to a BC draw hook:", e);
            }
        } else if (srcDescriptor?.set?.[CUSTOM_HOOK_MARK]) {
            imageElementSrcHookInstalled = true;
            installed = true;
        }

        const originalSetAttribute = proto.setAttribute;
        if (
            typeof originalSetAttribute === "function" &&
            !originalSetAttribute[CUSTOM_HOOK_MARK]
        ) {
            const wrappedSetAttribute = function (name, value) {
                if ((name === "src" || name === "SRC") && typeof value === "string" &&
                    (value.includes("SubbysPlushies") || value.includes("subbysplushies"))) {
                    return originalSetAttribute.call(this, name, mapImageSource(value));
                }
                return originalSetAttribute.call(this, name, value);
            };

            try {
                Object.defineProperty(wrappedSetAttribute, CUSTOM_HOOK_MARK, { value: true });
                proto.setAttribute = wrappedSetAttribute;
                imageElementSetAttributeHookInstalled = true;
                installed = true;
            } catch (e) {
                warn("Could not wrap HTMLImageElement.setAttribute:", e);
            }
        } else if (originalSetAttribute?.[CUSTOM_HOOK_MARK]) {
            imageElementSetAttributeHookInstalled = true;
            installed = true;
        }

        return installed;
    }

    function installImageMappingHooks() {
        const nativeImageHook = installNativeImageElementHook();

        let fallbackHook = null;
        if (!nativeImageHook) {
            const candidates = [
                "DrawGetImage",
                "DrawImage",
                "DrawImageEx",
                "DrawImageResize",
                "DrawImageCanvas",
                "DrawImageZoomCanvas",
            ];

            for (const functionName of candidates) {
                const installed = installHook(functionName, 1000, (args, next) => {
                    const source = args?.[0];
                    if (typeof source !== "string" ||
                        (!source.includes("SubbysPlushies") && !source.includes("subbysplushies"))) {
                        return next(args);
                    }
                    const mapped = mapImageSource(source);
                    if (mapped === source) return next(args);
                    const mappedArgs = args.slice();
                    mappedArgs[0] = mapped;
                    return next(mappedArgs);
                });
                if (installed) {
                    fallbackHook = functionName;
                    bcImagePathHookInstalled = functionName;
                    break;
                }
            }
        }

        if (!nativeImageHook && !fallbackHook) {
            throw new Error("No browser or BC image-loading hook was available for the plush image mapper.");
        }

        log(
            `Installed proven image mapper: HTMLImageElement.src=${imageElementSrcHookInstalled ? "yes" : "no"}, ` +
            `setAttribute=${imageElementSetAttributeHookInstalled ? "yes" : "no"}, ` +
            `BC fallback=${fallbackHook || "none"}.`
        );
    }

    function getExtendedRoot() {
        const root = window.AssetFemale3DCGExtended;
        if (!root || typeof root !== "object") {
            throw new Error("AssetFemale3DCGExtended is unavailable.");
        }
        if (!root[GROUP] || typeof root[GROUP] !== "object") root[GROUP] = {};
        return root[GROUP];
    }

    function installExtendedConfig() {
        const groupConfig = getExtendedRoot();
        groupConfig[ASSET_NAME] = makeExtendedConfig();
    }

    function registerNativeModularData(asset) {
        if (!asset) throw new Error("Cannot register modular data without the runtime asset.");

        const createModularData = window.ModularItemCreateModularData;
        if (typeof createModularData !== "function") {
            throw new Error(
                "R132 ModularItemCreateModularData is unavailable; cannot register SubbysPlushies in the modular lookup."
            );
        }

        const config = makeExtendedConfig();
        let data;

        try {
            data = createModularData(asset, config);
        } catch (e) {
            throw new Error(`Could not register native modular data: ${String(e)}`);
        }

        const expectedKey = `${GROUP}${ASSET_NAME}`;
        if (!data || typeof data !== "object" || data.key !== expectedKey) {
            throw new Error(
                `ModularItemCreateModularData returned an invalid registration for ${expectedKey}.`
            );
        }

        modularRegistrationStrategy = "ModularItemCreateModularData(asset, config)";
        log(`Registered native modular lookup entry: ${expectedKey}.`);
        return data;
    }

    function makeNativeAssetDefinition() {
        return {
            Name: ASSET_NAME,
            Description: DISPLAY_NAME,
            Value: 0,
            Difficulty: 0,
            Random: false,
            Extended: true,
            AllowActivity: [HUG_TIGHTLY_ACTIVITY_NAME, ...CUSTOM_PLUSH_ACTIVITIES.map(spec => spec.name)],
            ActivityAudio: [],

            ParentGroup: {},
            CreateLayerTypes: [MODULE_KEY],

            Top: PLUSH_RENDER.Top,
            Left: PLUSH_RENDER.Left,
            Priority: PLUSH_DRAW_PRIORITY,
            Layer: makeLayers(),
        };
    }

    function findRuntimeAssetGroup() {
        return Array.isArray(window.AssetGroup)
            ? window.AssetGroup.find(group =>
                group?.Name === GROUP && (!group?.Family || group.Family === FAMILY)
            ) || null
            : null;
    }

    function findSourceAssetGroup() {
        return Array.isArray(window.AssetFemale3DCG)
            ? window.AssetFemale3DCG.find(group => group?.Group === GROUP) || null
            : null;
    }

    function rememberNativeDefinition(definition) {
        const sourceGroup = findSourceAssetGroup();
        if (!sourceGroup || !Array.isArray(sourceGroup.Asset)) return;
        if (sourceGroup.Asset.some(asset => asset?.Name === ASSET_NAME)) return;
        sourceGroup.Asset.push(definition);
    }

    function getParameterNames(fn) {
        try {
            const source = Function.prototype.toString.call(fn);
            const match = source.match(/^[^(]*\(([^)]*)\)/);
            if (!match) return [];
            return match[1]
                .split(",")
                .map(part => part.trim().replace(/\s*=.*$/, ""))
                .filter(Boolean);
        } catch (_) {
            return [];
        }
    }

    function getAssetAddSignatureFunction() {
        const add = window.AssetAdd;
        if (typeof add !== "function") return null;

        try {
            const sdk = window.bcModSdk || window.bcModSDK;
            const patchingInfo = typeof sdk?.getPatchingInfo === "function" ? sdk.getPatchingInfo() : null;
            const entry = patchingInfo && typeof patchingInfo.get === "function"
                ? patchingInfo.get("AssetAdd")
                : null;
            if (typeof entry?.original === "function") return entry.original;
        } catch (_) {}

        return add;
    }

    function callAssetAdd(definition, runtimeGroup) {
        const add = window.AssetAdd;
        if (typeof add !== "function") throw new Error("AssetAdd is unavailable.");
        if (!runtimeGroup || typeof runtimeGroup !== "object") {
            throw new Error(`AssetAdd runtime group ${GROUP} is unavailable.`);
        }
        if (!definition || typeof definition !== "object" || !definition.Name) {
            throw new Error("AssetAdd received an invalid plushie asset definition.");
        }

        const previousCurrentGroup = window.AssetCurrentGroup;
        const signatureFunction = getAssetAddSignatureFunction() || add;
        const params = getParameterNames(signatureFunction);
        const arity = Math.max(Number(signatureFunction.length) || 0, params.length);
        const extendedConfig = makeExtendedConfig();
        const sourceGroup = findSourceAssetGroup();

        try {
            window.AssetCurrentGroup = runtimeGroup;

            if (arity === 3 && (!params.length || params.every(name => name.length <= 2))) {
                assetAddStrategy = "AssetAdd(runtimeGroup, definition, extendedConfig) [R132/ModSDK]";
                add(runtimeGroup, definition, extendedConfig);
                return;
            }

            if (!params.length && arity >= 2 && arity <= 3) {
                assetAddStrategy = "AssetAdd(runtimeGroup, definition, extendedConfig) [arity fallback]";
                add(runtimeGroup, definition, ...(arity >= 3 ? [extendedConfig] : []));
                return;
            }

            const args = params.map((parameter, index) => {
                const name = parameter.toLowerCase().replace(/[^a-z0-9]/g, "");

                if (name.includes("extendedconfig") || name === "config" || name === "extendeditemconfig") return extendedConfig;
                if (name.includes("groupdef") || name === "sourcegroup") return sourceGroup;
                if (name === "group" || name === "g" || name === "assetgroup" || name === "runtimegroup") return runtimeGroup;
                if (name.includes("family")) return FAMILY;
                if (name === "a" || name === "asset" || name === "assetdef" || name === "assetdefinition" ||
                    name.includes("definition") || name === "item") {
                    return definition;
                }
                if (name === "extended" || name === "extend") return true;

                if (arity === 3) {
                    if (index === 0) return runtimeGroup;
                    if (index === 1) return definition;
                    if (index === 2) return extendedConfig;
                }

                return undefined;
            });

            const requiredCount = arity || params.length;
            const recognizedRequired = args.slice(0, requiredCount).every(value => value !== undefined);

            if (!recognizedRequired) {
                if (requiredCount >= 2 && requiredCount <= 3) {
                    assetAddStrategy = "AssetAdd(runtimeGroup, definition, extendedConfig) [compat fallback]";
                    add(runtimeGroup, definition, extendedConfig);
                    return;
                }

                throw new Error(
                    `Unsupported AssetAdd signature: (${params.join(", ") || `${arity} parameter(s)`})`
                );
            }

            assetAddStrategy = `AssetAdd(${params.join(", ") || `${arity} args`})`;
            add(...args.slice(0, requiredCount));
        } finally {
            try { window.AssetCurrentGroup = previousCurrentGroup; } catch (_) {}
        }
    }

    function setupNativeAsset() {
        if (!imageMappings) throw new Error("Render image mappings were not prepared.");

        installExtendedConfig();
        installAssetTextHook();
        installHugTightlyTextHook();
        installImageMappingHooks();

        const definition = makeNativeAssetDefinition();
        const runtimeGroup = findRuntimeAssetGroup();
        if (!runtimeGroup) throw new Error(`Could not find BC runtime asset group ${GROUP}.`);

        callAssetAdd(definition, runtimeGroup);

        const asset = AssetGet(FAMILY, GROUP, ASSET_NAME);
        if (!asset) {
            throw new Error(
                `Native AssetAdd completed but AssetGet(${FAMILY}, ${GROUP}, ${ASSET_NAME}) returned null.`
            );
        }

        rememberNativeDefinition(definition);

        asset.Extended = true;
        if (asset.Archetype == null) asset.Archetype = resolveModularArchetype();
        if (asset.Description === ASSET_NAME || !asset.Description) asset.Description = DISPLAY_NAME;

        registerNativeModularData(asset);

        return asset;
    }

    function ensureExtendedCallbacks() {
        const initName = `${EXTENDED_PREFIX}Init`;
        const loadName = `${EXTENDED_PREFIX}Load`;
        const drawName = `${EXTENDED_PREFIX}Draw`;
        const clickName = `${EXTENDED_PREFIX}Click`;

        window[initName] = () => {};
        window[loadName] = () => {
            plushMenuPage = "characters";
            plushMenuReturnPage = "characters";
            plushMenuListPage = 0;
            plushSearchQuery = "";
            installCustomMenu();
            window.setTimeout(refreshPlushSearchInput, 0);
        };
        window[drawName] = () => drawCustomPlushMenu();
        window[clickName] = () => {
            if (!nativeLayeringVisible()) clickCustomPlushMenu();
        };
    }

    function searchResults() {
        const q = String(plushSearchQuery || "").trim().toLowerCase();
        if (!q) return [];
        const results = [];
        for (let option = 0; option < PUBLIC_PLUSH_COUNT; option++) {
            const wire = publicToWirePlushOption(option);
            const name = PLUSH_NAMES[wire] || "";
            if (name.toLowerCase().includes(q)) results.push({ label: name, option });
        }
        return results;
    }

    function removePlushSearchInput() {
        try { plushSearchInput?.remove?.(); } catch (_) {}
        plushSearchInput = null;
    }

    function refreshPlushSearchInput() {
        const item = window.DialogFocusItem;
        const shouldShow = isOurs(item) && plushMenuPage === "characters" && !nativeLayeringVisible();
        if (!shouldShow) { removePlushSearchInput(); return false; }
        const canvas = document.getElementById("MainCanvas") || document.querySelector("canvas");
        const rect = canvas?.getBoundingClientRect?.();
        if (!canvas || !rect || rect.width <= 0 || rect.height <= 0) return false;
        const metrics = useMenuLayoutMetrics();
        if (!plushSearchInput?.isConnected) {
            const input = document.createElement("input");
            input.type = "search";
            input.placeholder = "Search plushies…";
            input.value = plushSearchQuery;
            input.className = "SubbysPlushiesSearch";
            Object.assign(input.style, {
                position: "fixed",
                zIndex: "2147483001",
                boxSizing: "border-box",
                padding: "2px 9px",
                borderRadius: "8px",
                border: `1px solid ${getUseMenuStyle().border}`,
                background: getUseMenuStyle().header,
                color: getUseMenuStyle().text,
                caretColor: getUseMenuStyle().accent,
                outline: "none",
                boxShadow: `2px 3px 0 ${getUseMenuStyle().shadow}`,
                font: "12px Arial, sans-serif",
            });
            input.addEventListener("input", () => {
                plushSearchQuery = input.value;
                plushMenuListPage = 0;
            });
            input.addEventListener("pointerdown", e => e.stopPropagation());
            document.body.appendChild(input);
            plushSearchInput = input;
        }
        const useStyle = getUseMenuStyle();
        Object.assign(plushSearchInput.style, {
            borderColor: useStyle.border,
            background: useStyle.header,
            color: useStyle.text,
            caretColor: useStyle.accent,
            boxShadow: `2px 3px 0 ${useStyle.shadow}`,
        });

        const logicalWidth = Number(canvas.width) || 2000;
        const logicalHeight = Number(canvas.height) || 1000;
        const left = rect.left + (1040 / logicalWidth) * rect.width;
        const top = rect.top + (metrics.searchTop / logicalHeight) * rect.height;
        plushSearchInput.style.left = `${Math.round(left)}px`;
        plushSearchInput.style.top = `${Math.round(top)}px`;
        plushSearchInput.style.width = `${Math.max(135, Math.round(metrics.searchWidth / logicalWidth * rect.width))}px`;
        plushSearchInput.style.height = `${Math.max(23, Math.round(metrics.searchHeight / logicalHeight * rect.height))}px`;
        plushSearchInput.style.fontSize = getLayoutSettings().useMenuDensity === "compact" ? "10px" : "11px";
        return true;
    }

    function menuGridRect(index) {
        const metrics = useMenuLayoutMetrics();
        const column = index % 2;
        const row = Math.floor(index / 2);
        return {
            x: column === 0 ? MENU.Col1X : MENU.Col2X,
            y: metrics.startY + row * metrics.rowGap,
            w: MENU.ButtonW,
            h: metrics.buttonH,
        };
    }

    function searchMenuRect(index) {
        return menuGridRect(index);
    }

    function menuRect(entryType, index) {
        const metrics = useMenuLayoutMetrics();
        if (entryType === "subbycat") {
            const column = index % 2;
            const row = Math.floor(index / 2);
            return {
                x: column === 0 ? MENU.Col1X : MENU.Col2X,
                y: metrics.subStartY + row * metrics.subRowGap,
                w: MENU.ButtonW,
                h: metrics.buttonH,
            };
        }
        return menuGridRect(index);
    }

    function mouseInRect({ x, y, w, h }) {
        return typeof MouseIn === "function" && MouseIn(x, y, w, h);
    }

    function drawLofiBorder(rect, color = getUseMenuStyle().border, thickness = 2) {
        if (typeof DrawRect !== "function") return;
        DrawRect(rect.x, rect.y, rect.w, thickness, color);
        DrawRect(rect.x, rect.y + rect.h - thickness, rect.w, thickness, color);
        DrawRect(rect.x, rect.y, thickness, rect.h, color);
        DrawRect(rect.x + rect.w - thickness, rect.y, thickness, rect.h, color);
    }

    function drawLofiTextFit(text, x, y, width, color = getUseMenuStyle().text, size = 24) {
        const canvas = window.MainCanvas;
        let saved = false;
        try {
            if (canvas && typeof canvas.save === "function") {
                canvas.save();
                saved = true;
                canvas.font = `${Math.max(10, Number(size) || 24)}px Arial`;
            }
            if (typeof DrawTextFit === "function") DrawTextFit(String(text || ""), x, y, Math.max(20, width), color, "#0D0A10");
            else if (typeof DrawText === "function") DrawText(String(text || ""), x, y, color, "#0D0A10");
        } finally {
            if (saved) {
                try { canvas.restore(); } catch (_) {}
            }
        }
    }

    function favoriteStarRect(rect) {
        return { x: rect.x + rect.w - 48, y: rect.y, w: 48, h: rect.h };
    }

    function drawButton(rect, label, selected = false, options = null) {
        const favoriteOption = Number(options?.favoriteOption);
        const showFavoriteStar = Number.isInteger(favoriteOption) && validPublicPlushOption(favoriteOption);
        if (typeof DrawRect !== "function" || (typeof DrawText !== "function" && typeof DrawTextFit !== "function")) {
            if (typeof DrawButton === "function") DrawButton(rect.x, rect.y, rect.w, rect.h, label, selected ? "#D8C2DE" : "#F1E8F1");
            return;
        }
        const hovered = mouseInRect(rect);
        const fill = selected ? getUseMenuStyle().selected : (hovered ? getUseMenuStyle().surfaceHover : getUseMenuStyle().surface);
        DrawRect(rect.x + 4, rect.y + 5, rect.w, rect.h, getUseMenuStyle().shadow);
        DrawRect(rect.x, rect.y, rect.w, rect.h, fill);
        drawLofiBorder(rect, selected || hovered ? getUseMenuStyle().accent : getUseMenuStyle().border, selected ? 3 : 2);
        if (selected || hovered) DrawRect(rect.x, rect.y, 5, rect.h, getUseMenuStyle().accent);
        const compact = getLayoutSettings().useMenuDensity === "compact";
        const starSpace = showFavoriteStar ? 54 : 0;
        const labelWidth = Math.max(60, rect.w - 34 - starSpace);
        const labelCenter = rect.x + 17 + labelWidth / 2;
        drawLofiTextFit(label, labelCenter, rect.y + rect.h / 2 + 5, labelWidth, getUseMenuStyle().text, compact ? 21 : 24);
        if (showFavoriteStar) {
            const name = publicPlushName(favoriteOption);
            const starred = isFavoritePlush(name);
            const star = favoriteStarRect(rect);
            drawLofiTextFit(starred ? "★" : "☆", star.x + star.w / 2, rect.y + rect.h / 2 + 5, star.w - 8, starred ? getUseMenuStyle().accent : getUseMenuStyle().muted, compact ? 18 : 20);
        }
    }

    function pagedMenuEntries(entries) {
        const source = Array.isArray(entries) ? entries : [];
        const pageCount = Math.max(1, Math.ceil(source.length / USE_MENU_PAGE_SIZE));
        plushMenuListPage = Math.max(0, Math.min(plushMenuListPage, pageCount - 1));
        const start = plushMenuListPage * USE_MENU_PAGE_SIZE;
        return {
            items: source.slice(start, start + USE_MENU_PAGE_SIZE),
            page: plushMenuListPage,
            pageCount,
            hasPrevious: plushMenuListPage > 0,
            hasNext: plushMenuListPage < pageCount - 1,
        };
    }

    function currentCharacterMenuEntries() {
        if (plushSearchQuery.trim()) return searchResults();
        return [
            { label: `★ Favorites (${favoritePlushNames().length})`, favoritesSubmenu: true },
            ...CHARACTER_MENU,
        ];
    }

    function menuPageNavigation(entries = currentCharacterMenuEntries()) {
        const page = pagedMenuEntries(entries);
        if (page.pageCount <= 1) return { ...page, label: null, direction: 0 };
        if (page.hasNext) return { ...page, label: "Next Page →", direction: 1 };
        return { ...page, label: "← Previous Page", direction: -1 };
    }

    function hoveredPlushMenuEntry() {
        if (["settings", "emotes", "presets"].includes(plushMenuPage)) return null;
        if (plushMenuPage === "subbycat") {
            for (let index = 0; index < SUBBYCAT_MENU.length; index++) {
                if (mouseInRect(menuRect("subbycat", index))) return SUBBYCAT_MENU[index];
            }
            return null;
        }
        if (plushMenuPage === "favorites") {
            const page = pagedMenuEntries(favoriteMenuEntries());
            for (let index = 0; index < page.items.length; index++) {
                if (mouseInRect(menuGridRect(index))) return page.items[index];
            }
            return null;
        }
        const page = pagedMenuEntries(currentCharacterMenuEntries());
        for (let index = 0; index < page.items.length; index++) {
            if (!mouseInRect(menuGridRect(index))) continue;
            const entry = page.items[index];
            if (entry.favoritesSubmenu) return null;
            return entry.submenu ? { label: "Subbycat", option: 0 } : entry;
        }
        return null;
    }

    function drawPlushMenuHoverPreview() {
        if (["settings", "emotes", "presets"].includes(plushMenuPage) || !getLayoutSettings().showHoverPreview) return;
        const hovered = hoveredPlushMenuEntry();
        if (!hovered) return;
        const option = Number(hovered.option);
        if (!Number.isInteger(option) || option < 0 || option >= PUBLIC_PLUSH_COUNT) return;
        const wire = publicToWirePlushOption(option);
        const name = PLUSH_NAMES[wire] || hovered.label || "Plushie";
        const image = PLUSH_IMAGES[wire] || renderImages[wire] || PLUSH_FALLBACK_IMAGE;
        const mood = getPlushMoodRecord(name);
        const relationship = relationshipStatus(name);
        const rect = LOFI_PREVIEW_RECT;
        DrawRect(rect.x + 4, rect.y + 5, rect.w, rect.h, getUseMenuStyle().shadow);
        DrawRect(rect.x, rect.y, rect.w, rect.h, getUseMenuStyle().header);
        drawLofiBorder(rect, getUseMenuStyle().border, 2);
        if (typeof DrawImageResize === "function") {
            try { DrawImageResize(image, rect.x + 9, rect.y + 7, 68, 68); } catch (_) {}
        } else if (typeof DrawImage === "function") {
            try { DrawImage(image, rect.x + 9, rect.y + 7); } catch (_) {}
        }
        drawLofiTextFit(name, rect.x + 285, rect.y + 34, 350, getUseMenuStyle().text, 23);
        drawLofiTextFit(`${relationship.level} • ${moodLabel(mood.score)} ${mood.score}/100${isPlushSleepy(name) ? " • zZ" : ""}`, rect.x + 690, rect.y + 34, 360, getUseMenuStyle().muted, 17);
    }

    function drawCustomPlushMenu() {
        if (nativeLayeringVisible()) { removePlushSearchInput(); return; }
        refreshPlushSearchInput();

        if (typeof DrawRect === "function") {
            DrawRect(MENU.PanelX, MENU.PanelY, MENU.PanelW, MENU.PanelH, getUseMenuStyle().background);
            DrawRect(MENU.PanelX, MENU.PanelY, MENU.PanelW, 148, getUseMenuStyle().header);
            DrawRect(MENU.PanelX, 148, MENU.PanelW, 2, getUseMenuStyle().border);
            DrawRect(MENU.PanelX + 24, 22, 7, 72, getUseMenuStyle().accent);
        }

        drawButton({ x: MENU.CloseX, y: MENU.CloseY, w: MENU.CloseW, h: MENU.CloseH }, "×");
        drawButton({ x: MENU.MoveX, y: MENU.MoveY, w: MENU.MoveW, h: MENU.MoveH }, "Move / Resize");

        const selected = currentPlushOption();
        const submenu = plushMenuPage === "subbycat";
        const favoritesPage = plushMenuPage === "favorites";
        const settingsPage = plushMenuPage === "settings";
        const emotesPage = plushMenuPage === "emotes";
        const presetsPage = plushMenuPage === "presets";

        drawLofiTextFit(
            settingsPage
                ? "PLUSHIE SETTINGS"
                : (emotesPage
                    ? "PLUSHIE EMOTES"
                    : (presetsPage
                        ? "POSE PRESETS"
                        : (favoritesPage ? "★ FAVORITES" : (submenu ? "SUBBYCAT COLLECTION" : "SUBBY'S PLUSHIES")))),
            1238,
            57,
            360,
            getUseMenuStyle().text,
            28
        );

        if (settingsPage) {
            drawLofiTextFit("soft controls • local preferences", 1295, 112, 430, getUseMenuStyle().muted, 17);
        } else if (emotesPage) {
            drawLofiTextFit("local only • lasts 15 seconds", 1295, 112, 430, getUseMenuStyle().muted, 17);
        } else if (presetsPage) {
            drawLofiTextFit(`saved separately for ${currentPlushName()}`, 1325, 112, 490, getUseMenuStyle().muted, 16);
        } else if (!submenu && !favoritesPage) {
            const entries = currentCharacterMenuEntries();
            const page = menuPageNavigation(entries);
            if (page.hasPrevious && page.hasNext) drawButton(USE_MENU_PREVIOUS_RECT, "←");
            if (page.pageCount > 1) drawLofiTextFit(`Page ${page.page + 1}/${page.pageCount}`, 1505, 119, 125, getUseMenuStyle().muted, 14);
            const mood = getPlushMoodRecord(PLUSH_NAMES[publicToWirePlushOption(selected)] || currentPlushName());
            drawLofiTextFit(`Mood: ${moodLabel(mood.score)} • ${mood.score}/100`, 1755, 119, 310, getUseMenuStyle().muted, 15);
        } else {
            const mood = getPlushMoodRecord(PLUSH_NAMES[publicToWirePlushOption(selected)] || currentPlushName());
            drawLofiTextFit(`Mood: ${moodLabel(mood.score)} • ${mood.score}/100`, 1715, 119, 390, getUseMenuStyle().muted, 15);
        }

        if (!settingsPage && !emotesPage && !presetsPage) {
            drawButton(FEATURE_MENU.Emotes, "Emotes");
            drawButton(FEATURE_MENU.Mascot, roomMascotState?.name ? `Mascot: ${roomMascotState.name}` : "Set Room Mascot");
            drawButton(FEATURE_MENU.Settings, "Settings");
            drawButton(FEATURE_MENU.Presets, "Presets");
            drawButton(FEATURE_MENU.Extensions, "Extension Menu");
            drawButton(FEATURE_MENU.Battle, "Battle");
        } else if (settingsPage) {
            const settings = getFeatureSettings();
            drawButton(FEATURE_MENU.Idle, `Idle Animation: ${settings.idleAnimations ? "ON" : "off"}`, settings.idleAnimations);
            drawButton(FEATURE_MENU.Speech, `Speech Bubbles: ${settings.speechBubbles ? "ON" : "off"}`, settings.speechBubbles);
            drawButton(FEATURE_MENU.EmotesSettings, "Emotes");
            drawButton(FEATURE_MENU.Protect, `Protect Me: ${settings.protectMe ? "ON" : "off"}`, settings.protectMe);
            drawButton(FEATURE_MENU.Jealous, `Jealous: ${settings.jealousPlushie ? "ON" : "off"}`, settings.jealousPlushie);
            drawButton(FEATURE_MENU.Drag, `Easy Drag: ${dragModeEnabled ? "ON" : "off"}`, dragModeEnabled);
            drawButton(FEATURE_MENU.MascotVisible, `Mascot Picture: ${settings.showRoomMascot ? "ON" : "hidden"}`, settings.showRoomMascot);
            drawButton(FEATURE_MENU.AutoUpdate, `Auto Update Check: ${settings.autoUpdateChecks ? "ON" : "off"}`, settings.autoUpdateChecks);
            drawButton(FEATURE_MENU.Update, "Check Update Now");
            drawButton({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH }, "Back to plushies");
            return;
        }

        if (emotesPage) {
            for (const emote of USE_MENU_EMOTES) drawButton(emote.rect, emote.label);
            drawButton({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH }, plushMenuReturnPage === "settings" ? "Back to settings" : "Back to plushies");
            return;
        }

        if (presetsPage) {
            const slots = SAVED_POSE_SLOTS;
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                drawButton([FEATURE_MENU.Emotes, FEATURE_MENU.Mascot, FEATURE_MENU.Settings][i], `Apply Pose ${slot}`, !!getSavedPose(slot));
                drawButton([FEATURE_MENU.Presets, FEATURE_MENU.Extensions, FEATURE_MENU.Battle][i], `Save Pose ${slot}`);
            }
            drawButton({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH }, "Back to plushies");
            return;
        }

        if (submenu) {
            SUBBYCAT_MENU.forEach((entry, index) => drawButton(menuRect("subbycat", index), entry.label, selected === entry.option, { favoriteOption: entry.option }));
            drawButton(USE_MENU_BACK_RECT, "Back to characters");
            drawPlushMenuHoverPreview();
            return;
        }

        if (favoritesPage) {
            const favorites = favoriteMenuEntries();
            const page = menuPageNavigation(favorites);
            if (!favorites.length) {
                drawLofiTextFit("No favorites yet — click ☆ beside any plushie to add one.", 1495, 350, 760, getUseMenuStyle().muted, 19);
            } else {
                page.items.forEach((entry, index) => drawButton(menuGridRect(index), entry.label, selected === entry.option, { favoriteOption: entry.option }));
                if (page.label) drawButton(USE_MENU_NAV_RECT, page.label);
            }
            drawButton(USE_MENU_BACK_RECT, "Back to plushies");
            drawPlushMenuHoverPreview();
            return;
        }

        const entries = currentCharacterMenuEntries();
        const page = menuPageNavigation(entries);
        page.items.forEach((entry, index) => {
            if (entry.favoritesSubmenu) {
                drawButton(menuGridRect(index), `${entry.label} >`, false);
                return;
            }
            const selectedEntry = entry.submenu
                ? SUBBYCAT_MENU.some(sub => sub.option === selected)
                : selected === entry.option;
            const favoriteOption = entry.submenu ? 0 : entry.option;
            drawButton(menuGridRect(index), entry.submenu ? `${entry.label} >` : entry.label, selectedEntry, { favoriteOption });
        });
        if (page.label) drawButton(USE_MENU_NAV_RECT, page.label);
        drawPlushMenuHoverPreview();
    }

    function closeCustomPlushMenu() {
        plushMenuPage = "characters";
        plushMenuReturnPage = "characters";
        plushMenuListPage = 0;
        plushSearchQuery = "";
        removePlushSearchInput();
        if (typeof DialogLeave === "function") DialogLeave();
        window.setTimeout(refreshDragToggleButton, 0);
    }

    function clickCustomPlushMenu() {
        if (nativeLayeringVisible()) return true;

        if (mouseInRect({ x: MENU.CloseX, y: MENU.CloseY, w: MENU.CloseW, h: MENU.CloseH })) {
            closeCustomPlushMenu();
            return true;
        }

        if (mouseInRect({ x: MENU.MoveX, y: MENU.MoveY, w: MENU.MoveW, h: MENU.MoveH })) {
            void openNativeLayering();
            return true;
        }

        if (plushMenuPage === "settings") {
            if (mouseInRect(FEATURE_MENU.Idle)) { toggleFeatureSetting("idleAnimations"); return true; }
            if (mouseInRect(FEATURE_MENU.Speech)) { toggleFeatureSetting("speechBubbles"); return true; }
            if (mouseInRect(FEATURE_MENU.EmotesSettings)) {
                plushMenuReturnPage = "settings";
                plushMenuPage = "emotes";
                return true;
            }
            if (mouseInRect(FEATURE_MENU.Protect)) { toggleFeatureSetting("protectMe"); return true; }
            if (mouseInRect(FEATURE_MENU.Jealous)) { toggleFeatureSetting("jealousPlushie"); return true; }
            if (mouseInRect(FEATURE_MENU.Drag)) { toggleDragMode(); return true; }
            if (mouseInRect(FEATURE_MENU.MascotVisible)) {
                const settings = getFeatureSettings();
                setRoomMascotOverlayVisible(!settings.showRoomMascot);
                return true;
            }
            if (mouseInRect(FEATURE_MENU.AutoUpdate)) { toggleFeatureSetting("autoUpdateChecks"); return true; }
            if (mouseInRect(FEATURE_MENU.Update)) { void checkForUpdates({ silent: false }); return true; }
            if (mouseInRect({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH })) {
                plushMenuPage = "characters";
                plushMenuListPage = 0;
                return true;
            }
            return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
        }

        if (plushMenuPage === "emotes") {
            for (const emote of USE_MENU_EMOTES) {
                if (mouseInRect(emote.rect)) {
                    triggerPlushEmote(emote.type);
                    return true;
                }
            }
            if (mouseInRect({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH })) {
                plushMenuPage = plushMenuReturnPage === "settings" ? "settings" : "characters";
                plushMenuReturnPage = "characters";
                if (plushMenuPage === "characters") window.setTimeout(refreshPlushSearchInput, 0);
                return true;
            }
            return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
        }

        if (plushMenuPage === "presets") {
            const applyRects = [FEATURE_MENU.Emotes, FEATURE_MENU.Mascot, FEATURE_MENU.Settings];
            const saveRects = [FEATURE_MENU.Presets, FEATURE_MENU.Extensions, FEATURE_MENU.Battle];
            for (let i = 0; i < SAVED_POSE_SLOTS.length; i++) {
                const slot = SAVED_POSE_SLOTS[i];
                if (mouseInRect(applyRects[i])) { applySavedPose(slot); return true; }
                if (mouseInRect(saveRects[i])) { saveCurrentPose(slot); return true; }
            }
            if (mouseInRect({ x: MENU.BackX, y: MENU.BackY, w: MENU.BackW, h: MENU.BackH })) {
                plushMenuPage = "characters";
                plushMenuListPage = 0;
                window.setTimeout(refreshPlushSearchInput, 0);
                return true;
            }
            return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
        }

        if (mouseInRect(FEATURE_MENU.Emotes)) {
            plushMenuReturnPage = "characters";
            plushMenuPage = "emotes";
            removePlushSearchInput();
            return true;
        }
        if (mouseInRect(FEATURE_MENU.Presets)) {
            plushMenuReturnPage = "characters";
            plushMenuPage = "presets";
            removePlushSearchInput();
            return true;
        }
        if (mouseInRect(FEATURE_MENU.Extensions)) {
            closeCustomPlushMenu();
            window.setTimeout(() => openExtensionsPanel("status"), 0);
            return true;
        }

        if (mouseInRect(FEATURE_MENU.Battle)) {
            closeCustomPlushMenu();
            window.setTimeout(showBattleTargetPrompt, 0);
            return true;
        }
        if (mouseInRect(FEATURE_MENU.Mascot)) {
            setCurrentPlushAsRoomMascot();
            return true;
        }
        if (mouseInRect(FEATURE_MENU.Settings)) {
            plushMenuReturnPage = "characters";
            plushMenuPage = "settings";
            plushMenuListPage = 0;
            removePlushSearchInput();
            return true;
        }

        if (plushMenuPage === "favorites") {
            if (mouseInRect(USE_MENU_BACK_RECT)) {
                plushMenuPage = "characters";
                plushMenuListPage = 0;
                window.setTimeout(refreshPlushSearchInput, 0);
                return true;
            }
            const favorites = favoriteMenuEntries();
            const page = menuPageNavigation(favorites);
            if (page.label && mouseInRect(USE_MENU_NAV_RECT)) {
                plushMenuListPage = Math.max(0, Math.min(page.pageCount - 1, plushMenuListPage + page.direction));
                return true;
            }
            for (let index = 0; index < page.items.length; index++) {
                const rect = menuGridRect(index);
                const entry = page.items[index];
                if (mouseInRect(favoriteStarRect(rect))) {
                    toggleFavoritePlush(publicPlushName(entry.option));
                    plushMenuListPage = Math.max(0, Math.min(plushMenuListPage, Math.max(0, Math.ceil(favoriteMenuEntries().length / USE_MENU_PAGE_SIZE) - 1)));
                    return true;
                }
                if (!mouseInRect(rect)) continue;
                setPlushOption(entry.option);
                return true;
            }
            return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
        }

        if (plushMenuPage === "subbycat") {
            if (mouseInRect(USE_MENU_BACK_RECT)) {
                plushMenuPage = "characters";
                plushMenuListPage = 0;
                window.setTimeout(refreshPlushSearchInput, 0);
                return true;
            }
            for (let index = 0; index < SUBBYCAT_MENU.length; index++) {
                const rect = menuRect("subbycat", index);
                const entry = SUBBYCAT_MENU[index];
                if (mouseInRect(favoriteStarRect(rect))) {
                    toggleFavoritePlush(publicPlushName(entry.option));
                    return true;
                }
                if (!mouseInRect(rect)) continue;
                setPlushOption(entry.option);
                return true;
            }
            return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
        }

        const entries = currentCharacterMenuEntries();
        const page = menuPageNavigation(entries);
        if (page.hasPrevious && page.hasNext && mouseInRect(USE_MENU_PREVIOUS_RECT)) {
            plushMenuListPage = Math.max(0, plushMenuListPage - 1);
            return true;
        }
        if (page.label && mouseInRect(USE_MENU_NAV_RECT)) {
            plushMenuListPage = Math.max(0, Math.min(page.pageCount - 1, plushMenuListPage + page.direction));
            return true;
        }
        for (let index = 0; index < page.items.length; index++) {
            const rect = menuGridRect(index);
            const entry = page.items[index];
            if (entry.favoritesSubmenu && mouseInRect(rect)) {
                plushMenuPage = "favorites";
                plushMenuListPage = 0;
                removePlushSearchInput();
                return true;
            }
            if (!entry.favoritesSubmenu) {
                const favoriteOption = entry.submenu ? 0 : Number(entry.option);
                if (validPublicPlushOption(favoriteOption) && mouseInRect(favoriteStarRect(rect))) {
                    toggleFavoritePlush(publicPlushName(favoriteOption));
                    return true;
                }
            }
            if (!mouseInRect(rect)) continue;
            if (entry.submenu) {
                plushMenuPage = "subbycat";
                plushMenuListPage = 0;
                removePlushSearchInput();
            } else {
                setPlushOption(entry.option);
            }
            return true;
        }

        return mouseInRect({ x: MENU.PanelX, y: MENU.PanelY, w: MENU.PanelW, h: MENU.PanelH });
    }

    function installCustomMenu() {
        if (customMenuWrapped) return;
        ensureExtendedCallbacks();
        customMenuWrapped = true;
        log("Installed standalone nested plush menu callbacks.");
    }

    function publishPlushSwapAction(C, plushName) {
        try {
            if (
                typeof CurrentScreen !== "string" ||
                CurrentScreen !== "ChatRoom" ||
                typeof ServerSend !== "function"
            ) {
                return;
            }

            const sourceName = typeof CharacterNickname === "function"
                ? CharacterNickname(C)
                : (C?.Nickname || C?.Name || "Character");

            const message = `${sourceName} has swapped her plushie to ${plushName}.`;

            ServerSend("ChatRoomChat", {
                Content: "Beep",
                Type: "Action",
                Dictionary: [
                    { Tag: "Beep", Text: "msg" },
                    { Tag: "msg", Text: message },
                ],
            });
        } catch (e) {
            warn("Could not publish plush swap Action:", e);
        }
    }

    function setPlushOption(optionIndex) {
        if (!validPublicPlushOption(optionIndex)) {
            warn("Invalid plush option index:", optionIndex);
            return false;
        }

        const { C, item } = getFocusedPlushItem();
        if (!C || !isOurs(item)) {
            warn("Subby's Plushies is not the focused/equipped item.");
            return false;
        }

        const wireOption = publicToWirePlushOption(optionIndex);
        const previousWireOption = getItemPlushOption(item);
        const previousOption = wireToPublicPlushOption(previousWireOption);

        const previousState = rememberCharacterPlushState(C, item);

        if (!setItemPlushState(item, wireOption)) return false;

        ensureNativeTransform(item);
        compactPlushLayerTransformsToActive(item, previousState?.layerTransform || null);
        rememberCharacterPlushState(C, item);
        refresh(C, true);
        schedulePlushStabilization(wireOption);

        if (previousOption !== optionIndex) {
            publishPlushSwapAction(C, PLUSH_NAMES[wireOption]);
            recordPlushSelection(PLUSH_NAMES[wireOption]);
            touchPlushRelationship(PLUSH_NAMES[wireOption], { increment: 0, wake: true });
        }

        return true;
    }

    function validate() {
        const problems = [];
        const asset = AssetGet(FAMILY, GROUP, ASSET_NAME);

        if (!asset) {
            problems.push("AssetGet returned null.");
        } else {
            if (!Array.isArray(asset.Layer) || asset.Layer.length !== PLUSHES.length) {
                problems.push(`Expected ${PLUSHES.length} layers.`);
            }
            if (!asset.Extended) problems.push("Asset is not marked Extended.");
            if (!Array.isArray(asset.AllowActivity) || !asset.AllowActivity.includes(HUG_TIGHTLY_ACTIVITY_NAME)) {
                problems.push("Asset does not expose the Hug Tightly activity.");
            }
            const missingCustomActivities = CUSTOM_PLUSH_ACTIVITIES.filter(
                spec => !Array.isArray(asset.AllowActivity) || !asset.AllowActivity.includes(spec.name)
            );
            if (missingCustomActivities.length) {
                problems.push(
                    `Asset is missing ${missingCustomActivities.length} custom plush activit${missingCustomActivities.length === 1 ? "y" : "ies"}.`
                );
            }

            const expectedArchetype = resolveModularArchetype();
            if (expectedArchetype != null && asset.Archetype !== expectedArchetype) {
                problems.push(`Unexpected Archetype: ${String(asset.Archetype)}.`);
            }

            if (typeof ExtendedItemGetData === "function") {
                try {
                    const extendedData = ExtendedItemGetData(asset, asset.Archetype);
                    if (!extendedData || typeof extendedData !== "object") {
                        problems.push("ExtendedItem modular lookup did not register SubbysPlushies.");
                    }
                } catch (e) {
                    problems.push(`ExtendedItem modular lookup failed: ${String(e)}`);
                }
            }
        }

        const hugTightlyShouldBeActive = isOurs(getHeld(window.Player));
        if (hugTightlyShouldBeActive &&
            (!Array.isArray(window.ActivityFemale3DCG) ||
             !window.ActivityFemale3DCG.some(activity => activity?.Name === HUG_TIGHTLY_ACTIVITY_NAME))) {
            problems.push("Hug Tightly is not registered while Subby's Plushies is held.");
        }
        if (hugTightlyShouldBeActive && Array.isArray(window.ActivityFemale3DCG)) {
            const registeredNames = new Set(window.ActivityFemale3DCG.map(activity => activity?.Name));
            const missingRuntime = CUSTOM_PLUSH_ACTIVITIES.filter(spec => !registeredNames.has(spec.name));
            if (missingRuntime.length) {
                problems.push(
                    `Missing runtime plush activities: ${missingRuntime.map(spec => spec.label).join(", ")}.`
                );
            }
        }

        const renderProbe = `${ASSET_BASE}_XLarge_Plush1.png`;
        try {
            const mapped = mapImageSource(renderProbe);
            if (mapped !== renderImages[0]) {
                problems.push(`Image mapping inactive for ${renderProbe}.`);
            }
        } catch (e) {
            problems.push(`Image-mapping self-test threw: ${String(e)}`);
        }

        try {
            if (typeof AssetTextGet !== "function") {
                problems.push("AssetTextGet is unavailable.");
            } else if (AssetTextGet(`${GROUP}${ASSET_NAME}`) !== DISPLAY_NAME) {
                problems.push("Custom asset description text hook is inactive.");
            } else if (AssetTextGet(`${GROUP}${ASSET_NAME}SelectBase`) !== "Choose a plushie") {
                problems.push("Custom ExtendedItem text hook is inactive.");
            }
        } catch (e) {
            problems.push(`Custom-text self-test threw: ${String(e)}`);
        }

        ensureExtendedCallbacks();
        installCustomMenu();

        for (const suffix of ["Init", "Load", "Draw", "Click"]) {
            if (typeof window[`${EXTENDED_PREFIX}${suffix}`] !== "function") {
                problems.push(`Missing standalone ExtendedItem callback: ${suffix}.`);
            }
        }

        if (problems.length) {
            failed = true;
            ready = false;
            error("SAFETY CHECK FAILED:");
            console.table(problems);
            return false;
        }

        ready = true;
        failed = false;
        log(`Subby's Plushies v${VERSION} is READY (standalone asset layer).`);
        return true;
    }

    function equip() {
        if (!ready) {
            warn("Not ready yet.");
            return;
        }

        try {
            InventoryWear(window.Player, ASSET_NAME, GROUP);
        } catch (e) {
            error("InventoryWear failed:", e);
            return;
        }

        const held = getHeld(window.Player);
        if (!isOurs(held)) {
            error("BC did not equip Subby's Plushies.", held);
            return;
        }

        const option = normalizePlushState(held);
        ensureNativeTransform(held);
        refresh(window.Player, true);
        syncHugTightlyActivityAvailability("explicit equip");
        schedulePlushStabilization(option);
        recordPlushSelection(currentPlushName());
        touchPlushRelationship(currentPlushName(), { increment: 0, wake: true });
        refreshDragToggleButton();
        refreshPlushStatusIcon();
        scheduleNextIdleAnimation(2500);
    }

    function useItem() {
        const item = getHeld(window.Player);
        if (!isOurs(item)) {
            warn("Equip Subby's Plushies first with /plushie.");
            return;
        }

        removeRoomMascotOverlay();
        removeSpeechBubble();
        removeDragToggleButton();
        window.DialogFocusCharacter = window.Player;
        window.DialogFocusItem = item;
        ensureNativeTransform(item);
        installCustomMenu();

        const loadFn = window[`${EXTENDED_PREFIX}Load`];
        if (typeof loadFn !== "function") {
            error("Standalone plush menu Load callback is unavailable.");
            return;
        }

        try {
            loadFn();
        } catch (e) {
            error("Opening the ExtendedItem screen failed:", e);
        }
    }

    function remove() {
        cancelIdleAnimation(false);
        removeSpeechBubble();
        removePlushStatusIcon();
        clearRemotePlushEmotes();
        manualPlushEmote = null;
        if (manualPlushEmoteTimer != null) { window.clearTimeout(manualPlushEmoteTimer); manualPlushEmoteTimer = null; }
        removePlushSearchInput();
        setDragMode(false);
        if (activeProtectSession) restoreActiveProtect("plush removed");
        const held = getHeld(window.Player);
        if (!isOurs(held)) {
            log("No Subby's Plushies item is equipped.");
            return;
        }

        try {
            suppressLocalPlushRepair("explicit remove", 1800);
            clearRememberedLocalPlushState();
            InventoryRemove(window.Player, GROUP);
            refresh(window.Player, true);
            syncHugTightlyActivityAvailability("explicit remove");
        } catch (e) {
            error("Remove failed:", e);
        }
    }

    function recover() {
        cancelIdleAnimation(false);
        removeSpeechBubble();
        removePlushStatusIcon();
        clearRemotePlushEmotes();
        manualPlushEmote = null;
        if (manualPlushEmoteTimer != null) { window.clearTimeout(manualPlushEmoteTimer); manualPlushEmoteTimer = null; }
        removePlushSearchInput();
        setDragMode(false);
        activeProtectSession = null;
        try {
            suppressLocalPlushRepair("explicit recover", 2200);
            clearRememberedLocalPlushState();
            const appearance = Array.isArray(window.Player?.Appearance)
                ? window.Player.Appearance
                : [];

            window.Player.Appearance = appearance.filter(item => !isOurs(item));

            try {
                InventoryRemove(window.Player, GROUP);
            } catch (_) {}

            refresh(window.Player, true);
            syncHugTightlyActivityAvailability("explicit recover");
            log("Recovery finished.");
        } catch (e) {
            error("Recovery failed:", e);
        }
    }

    function debug() {
        let asset = null;
        try {
            asset = AssetGet(FAMILY, GROUP, ASSET_NAME);
        } catch (_) {}

        const held = getHeld(window.Player);
        const renderProbe = `${ASSET_BASE}_XLarge_Plush1.png`;
        const selectedOption = getItemPlushOption(held);
        const selectedTypeProbe = selectedOption >= 0
            ? `${ASSET_BASE}_XLarge_${MODULE_KEY}${selectedOption}.png`
            : null;

        let extendedData = null;
        try {
            if (asset && typeof ExtendedItemGetData === "function") {
                extendedData = ExtendedItemGetData(asset, asset.Archetype);
            }
        } catch (e) {
            extendedData = { error: String(e) };
        }

        console.log(TAG, "DEBUG", {
            version: VERSION,
            gameVersion: window.GameVersion,
            ready,
            failed,
            startupError: startupError ? String(startupError) : null,
            hookBackend,
            installedHooks: [...installedHooks],
            assetAddStrategy,
            modularRegistrationStrategy,
            modularArchetype: resolveModularArchetype(),
            performance: {
                profile: "release-reviewed event-driven hot-path profile",
                activityMonitorMs: ACTIVITY_MONITOR_INTERVAL_MS,
                activityFullIntegrityMs: ACTIVITY_INTEGRITY_INTERVAL_MS,
                roomRosterMode: "event-driven + watchdog",
                roomRosterWatchdogMs: ROOM_ROSTER_WATCHDOG_INTERVAL_MS,
                roomRosterEventHooks: roomRosterEventHookCount,
                chatObserverHealthMs: CHAT_OBSERVER_MONITOR_INTERVAL_MS,
                chatObserverCharacterData: false,
                globalTextGetHook: false,
                unrelatedActionFastPath: true,
                activityRunShallowInspection: true,
                activityTargetShallowInspection: true,
                characterRefreshActivityScanRemoved: true,
                singleImageInterceptionPath: true,
                bcImagePathHook: bcImagePathHookInstalled,
                htmlImageSrcHook: imageElementSrcHookInstalled,
                htmlImageSetAttributeHook: imageElementSetAttributeHookInstalled,
                nativeCommandFallback: nativeCommandHookInstalled,
                unrelatedImageFastPath: true,
                moveResizeLifecyclePollMs: LAYERING_BRIDGE_MONITOR_INTERVAL_MS,
            },
            asset: asset
                ? {
                    priority: asset.Priority,
                    left: asset.Left,
                    top: asset.Top,
                    extended: asset.Extended,
                    archetype: asset.Archetype,
                    createLayerTypes: asset.CreateLayerTypes,
                    parentGroup: asset.ParentGroup,
                    layers: asset.Layer?.map(layer => ({
                        name: layer?.Name,
                        priority: layer?.Priority,
                        allowTypes: layer?.AllowTypes,
                    })),
                }
                : null,
            item: held
                ? {
                    isOurs: isOurs(held),
                    property: held.Property,
                    option: getItemPlushOption(held),
                }
                : null,
            render: {
                ...PLUSH_RENDER,
                priority: PLUSH_DRAW_PRIORITY,
                prepared: renderImages.every(image => typeof image === "string"),
                mappingProbe: mapImageSource(renderProbe),
                selectedTypeProbe,
                selectedTypeMapped: selectedTypeProbe ? mapImageSource(selectedTypeProbe) : null,
                bcImagePathHook: bcImagePathHookInstalled,
                htmlImageSrcHook: imageElementSrcHookInstalled,
                htmlImageSetAttributeHook: imageElementSetAttributeHookInstalled,
                nativeCommandFallback: nativeCommandHookInstalled,
                unmappedImageSources: [...unmappedImageSources],
            },
            layering: {
                available: typeof getLayeringAPI()?.Init === "function",
                visible: nativeLayeringVisible(),
                activeTab: getLayeringAPI()?.activeTab,
                moveResizeBridge: {
                    active: nativeLayeringBridgeTimer != null,
                    rootAttached: !!nativeLayeringBridgeRoot?.isConnected,
                    resizeWrapped: !!getLayeringAPI()?.Resize?.[NATIVE_LAYERING_RESIZE_MARK],
                    resizeWrapCount: nativeLayeringResizeWrapCount,
                    syncCount: nativeLayeringSyncCount,
                    inputEvents: nativeLayeringInputEvents,
                    fallbackWrites: nativeLayeringFallbackWrites,
                    lastSync: lastNativeLayeringSync,
                    lastInput: lastNativeLayeringInput,
                    strategy: "event-driven active-layer-only canonical transform (no 75ms write loop)",
                },
            },
            persistence: {
                lastPlushOption,
                repairCount: plushStateRepairCount,
                lastRepair: lastPlushStateRepair,
                stabilizerGeneration,
                selectionSyncStrategy: "no unconditional second refresh; repair-only stabilizer",
                rememberedCharacters: [...plushStateByCharacter.entries()].map(([key, value]) => ({ key, ...value })),
                actionRecoveryCount,
                actionRecoveryGeneration,
                lastActionRecovery,
                localRepairSuppressed: Date.now() < localPlushRepairSuppressedUntil,
                localRepairSuppressedUntil: localPlushRepairSuppressedUntil ? new Date(localPlushRepairSuppressedUntil).toISOString() : null,
                lastLocalPlushRepairSuppression,
                remoteRepairPolicy: "server-authoritative; never rewritten from remembered plush state",
                roomRosterSignature,
                roomRosterRecoveryCount,
                lastRoomRosterRecovery,
                roomRosterWatchdogActive: roomRosterWatchdog != null,
                roomRosterEventHookCount,
                characterRefreshHook: installedHooks.has("CharacterRefresh"),
                characterUpdateHook: installedHooks.has("ChatRoomCharacterUpdate"),
                chatRoomMessageHook: installedHooks.has("ChatRoomMessage"),
                serverSendHook: installedHooks.has("ServerSend"),
                activityRunHook: installedHooks.has("ActivityRun"),
            },
            hugTightly: {
                activityName: HUG_TIGHTLY_ACTIVITY_NAME,
                name: HUG_TIGHTLY_ACTIVITY_NAME,
                label: HUG_TIGHTLY_ACTIVITY_LABEL,
                activityID: hugTightlyActivityID,
                registration: hugTightlyActivityRegistration,
                active: hugTightlyActivityEnabled,
                monitorActive: hugTightlyActivityMonitor != null,
                target: ["ItemHands"],
                assetAllowActivity: asset?.AllowActivity,
                purrPlayCount,
                lastPurrPlay,
                recentPurrTokenCount: recentPurrTokens.size,
            },
            extraActivities: {
                registration: customActivitiesRegistration,
                count: CUSTOM_PLUSH_ACTIVITIES.length,
                order: {
                    strategy: "ActivityAllowedForGroup final-result reorder; ActivityID unchanged",
                    hookInstalled: activityMenuOrderHookInstalled,
                    passCount: activityMenuOrderPassCount,
                    lastPass: lastActivityMenuOrder,
                    hugTightlyActivityID,
                    customActivityIDs: CUSTOM_PLUSH_ACTIVITIES.map(spec => ({
                        key: spec.key,
                        id: window.ActivityFemale3DCG?.find?.(activity => activity?.Name === spec.name)?.ActivityID ?? null,
                    })),
                },
                offerPrompt: {
                    nativeChatAppendAvailable: typeof window.ChatRoomAppendChat === "function",
                    transportMode: "visible-action-chat-observer",
                    chatObserverAttached: !!offerChatObserver && !!offerChatObservedRoot?.isConnected,
                    chatObserverAttachCount: offerChatObserverAttachCount,
                    chatRowsSeen: offerChatRowsSeen,
                    chatOfferCandidates: offerChatOfferCandidates,
                    chatPromptsTriggered: offerChatPromptsTriggered,
                    lastChatOfferRow: lastOfferChatRow,
                    active: !!offerPromptElement?.isConnected,
                    token: offerPromptElement?.getAttribute?.("data-subbys-plushies-offer") || null,
                    signalsReceived: offerSignalsReceived,
                    promptsDisplayed: offerPromptsDisplayed,
                    visibleActionsSeen: offerVisibleActionsSeen,
                    visiblePromptsTriggered: offerVisiblePromptsTriggered,
                    lastSignalReceived: lastOfferSignalReceived,
                    lastPromptDisplayed: lastOfferPromptDisplayed,
                    lastVisibleOfferAction: lastOfferActionSeen,
                    transfer: {
                        pendingOutgoingOffers: [...pendingOutgoingPlushOffers.values()].map(entry => ({ ...entry })),
                        receiveAttempts: offerTransferReceiveAttempts,
                        received: offerTransfersReceived,
                        receiveFailures: offerTransferReceiveFailures,
                        senderRemovals: offerTransferSenderRemovals,
                        senderRemovalFailures: offerTransferSenderRemovalFailures,
                        pendingCapturedFromRenderedAction: offerPendingCapturedFromRenderedAction,
                        lastRenderedOutgoingOfferCapture,
                        pendingOutgoingRecipients: [...pendingOutgoingPlushOffers.keys()],
                        lastReceived: lastOfferTransferReceived,
                        lastFailure: lastOfferTransferFailure,
                        lastSenderRemoval: lastOfferSenderRemoval,
                        lastDecisionSeen: lastOfferDecisionSeen,
                    },
                },
                balanceHead: {
                    effect: lastBalanceHeadEffect,
                    absoluteTarget: BALANCE_HEAD_TRANSFORM,
                    activityTriggerCount: balanceHeadActivityTriggerCount,
                    lastActivityRunAt: lastBalanceHeadActivityRunAt || null,
                    renderedActionsSeen: balanceHeadRenderedActionsSeen,
                    renderedTriggerCount: balanceHeadRenderedTriggerCount,
                    lastRenderedAction: lastBalanceHeadRenderedAction,
                    lastTriggerSource: lastBalanceHeadTriggerSource,
                    sessionActive: !!activeBalanceHeadSession,
                },
                hideBehind: {
                    effect: lastHideBehindEffect,
                    absoluteTarget: HIDE_BEHIND_FACE_TRANSFORM,
                    renderedActionsSeen: hideBehindRenderedActionsSeen,
                    renderedTriggerCount: hideBehindRenderedTriggerCount,
                    lastRenderedAction: lastHideBehindRenderedAction,
                    lastTriggerSource: lastHideBehindTriggerSource,
                    sessionActive: !!activeHideBehindSession,
                },
                activities: CUSTOM_PLUSH_ACTIVITIES.map(spec => ({
                    key: spec.key,
                    name: spec.name,
                    label: spec.label,
                    targets: spec.targets,
                    targetSelf: spec.targetSelf,
                    registered: !!window.ActivityFemale3DCG?.some?.(activity => activity?.Name === spec.name),
                })),
            },
            callbacks: {
                init: typeof window[`${EXTENDED_PREFIX}Init`],
                load: typeof window[`${EXTENDED_PREFIX}Load`],
                draw: typeof window[`${EXTENDED_PREFIX}Draw`],
                click: typeof window[`${EXTENDED_PREFIX}Click`],
            },
            extendedData,
            extendedSourceConfig: window.AssetFemale3DCGExtended?.[GROUP]?.[ASSET_NAME] || null,
            optionMapping: { publicSubbycat: 0, wireSubbycat: SUBBYCAT_WIRE_OPTION },
            features: {
                settings: { ...getFeatureSettings() },
                currentMood: { name: currentPlushName(), ...getPlushMoodRecord() },
                activeProtectSession: !!activeProtectSession,
                dragModeEnabled,
                lastDragSnap,
                roomMascotState,
                lastUpdateInfo,
                lastMoodChange,
                stats: getStatsStore(),
                idleAnimationActive: !!activeIdleAnimationSession,
                lastBattleResult,
                moodHistoryEntries: moodHistoryFor(currentPlushName(), 40).length,
                battleHistoryEntries: battleHistory(20).length,
                gitData: { ...gitDataState, status: gitDataStatusText() },
            },
            plushes: PLUSHES.map((plush, index) => ({ index, ...plush })),
        });
    }

    function pluginApiHeldSnapshot() {
        const item = getHeld(window.Player);
        if (!isOurs(item)) return null;
        const name = currentPlushName();
        const wireOption = currentWirePlushOption();
        return Object.freeze({
            name,
            wireOption,
            option: wireToPublicPlushOption(wireOption),
            favorite: isFavoritePlush(name),
            sleepy: isPlushSleepy(name),
            mood: Object.freeze({ ...getPlushMoodRecord(name), label: moodLabel(getPlushMoodRecord(name).score) }),
            relationship: Object.freeze({ ...relationshipStatus(name) }),
        });
    }

    window.SubbysPlushies = {
        version: VERSION,
        apiVersion: 1,
        get ready() { return ready; },
        get failed() { return failed; },
        getHeld: pluginApiHeldSnapshot,
        getMood: name => { const record = getPlushMoodRecord(name || currentPlushName()); return Object.freeze({ name: name || currentPlushName(), ...record, label: moodLabel(record.score) }); },
        getMoodHistory: (name, limit) => moodHistoryFor(name || currentPlushName(), limit),
        getRelationship: name => relationshipStatus(name || currentPlushName()),
        getBattleHistory: limit => battleHistory(limit),
        getPerformanceMode: () => isLowCpuMode() ? "low" : "normal",
        setPerformanceMode,
        showEmote: triggerPlushEmote,
        on: onPluginApiEvent,
        off: offPluginApiEvent,
        once: oncePluginApiEvent,
        equip,
        use: useItem,
        position: openNativeLayering,
        move: openNativeLayering,
        resize: openNativeLayering,
        hands: resetPosition,
        center: resetPosition,
        remove,
        recover,
        purr: () => playPurrSfx(`api:${Date.now()}`, "public API"),
        balanceHead: movePlushToHeadTemporarily,
        hideBehind: movePlushInFrontOfFaceTemporarily,
        protect: () => setFeatureSetting("protectMe", true),
        unprotect: () => setFeatureSetting("protectMe", false),
        jealous: enabled => setFeatureSetting("jealousPlushie", enabled !== false),
        mood: () => ({ name: currentPlushName(), ...getPlushMoodRecord() }),
        relationship: () => relationshipStatus(),
        favorite: () => toggleFavoritePlush(currentPlushName()),
        favorites: () => favoritePlushNames(),
        stats: showStats,
        achievements: showAchievements,
        speak: text => showSpeechBubble(text, { force: true }),
        emote: triggerPlushEmote,
        idle: runIdleAnimation,
        battle: challengePlushBattle,
        lore: () => openLoreBrowser(currentPlushName()),
        petAnimation: animatePetting,
        drag: enabled => setDragMode(enabled !== false),
        snap: snapCurrentPlushTo,
        savePose: saveCurrentPose,
        applyPose: applySavedPose,
        clearPose: clearSavedPose,
        exportBackup: exportPlushBackup,
        importBackup: importPlushBackupFromFile,
        mascot: setCurrentPlushAsRoomMascot,
        clearMascot: clearRoomMascot,
        hideMascot: () => setRoomMascotOverlayVisible(false),
        showMascot: () => setRoomMascotOverlayVisible(true),
        checkUpdate: () => checkForUpdates({ silent: false }),
        openUpdate: openLatestUpdatePage,
        extensions: tab => openExtensionsPanel(tab || "status"),
        settings: () => openExtensionsPanel("settings"),
        status: () => extensionsStatusSnapshot(),
        offerStatus: () => extensionsStatusSnapshot().offer,
        dataStatus: () => ({ ...gitDataState, status: gitDataStatusText() }),
        reloadData: () => refreshGitDataFromGitHub({ force: true, silent: false }),
        debug,
    };

    async function waitForBC() {
        let lastStatus = "";

        for (let attempt = 0; attempt < 1200; attempt++) {
            const status = {
                AssetGet: typeof window.AssetGet === "function",
                AssetAdd: typeof window.AssetAdd === "function",
                AssetTextGet: typeof window.AssetTextGet === "function",
                ActivityDictionaryText: typeof window.ActivityDictionaryText === "function",
                ActivityAllowedForGroup: typeof window.ActivityAllowedForGroup === "function",
                ExtendedItemGetData: typeof window.ExtendedItemGetData === "function",
                ModularItemCreateModularData: typeof window.ModularItemCreateModularData === "function",
                ActivitySource: Array.isArray(window.ActivityFemale3DCG),
                InventoryWear: typeof window.InventoryWear === "function",
                InventoryGet: typeof window.InventoryGet === "function",
                AssetGroup: Array.isArray(window.AssetGroup),
                AssetGroupCount: Array.isArray(window.AssetGroup) ? window.AssetGroup.length : 0,
                AssetSource: Array.isArray(window.AssetFemale3DCG),
                ExtendedSource: !!window.AssetFemale3DCGExtended,
            };

            const baseReady =
                status.AssetGet &&
                status.AssetAdd &&
                status.AssetTextGet &&
                status.ActivityDictionaryText &&
                status.ActivityAllowedForGroup &&
                status.ExtendedItemGetData &&
                status.ModularItemCreateModularData &&
                status.ActivitySource &&
                status.InventoryWear &&
                status.InventoryGet &&
                status.AssetGroup &&
                status.AssetGroupCount > 20 &&
                status.AssetSource &&
                status.ExtendedSource;

            if (baseReady && resolveModularArchetype() != null) return;

            const serialized = JSON.stringify({
                ...status,
                ModularArchetype: modularArchetype,
            });

            if (attempt === 0 || (attempt % 50 === 0 && serialized !== lastStatus)) {
                log("Waiting for Bondage Club native asset APIs...", {
                    ...status,
                    ModularArchetype: modularArchetype,
                });
                lastStatus = serialized;
            }

            await sleep(100);
        }

        throw new Error(`Timed out waiting for Bondage Club. Last readiness state: ${lastStatus}`);
    }

    function checkDuplicateAsset() {
        const existing = typeof AssetGet === "function"
            ? AssetGet(FAMILY, GROUP, ASSET_NAME)
            : null;

        if (existing) {
            throw new Error(
                "SubbysPlushies already exists. Disable every other Subby's Plushies script and hard-refresh."
            );
        }
    }

    async function main() {
        log(`Starting standalone v${VERSION}...`);

        loadCachedGitData();
        void refreshGitDataFromGitHub({ force: false, silent: true });

        await waitForBC();
        checkDuplicateAsset();

        startOfferChatObserverMonitor();

        initHookBackend();
        scheduleNativeCommandFallbackHook();

        await prepareRenderImages();
        setupNativeAsset();
        installPlushStateHooks();
        installDirectDragHandlers();
        installDragToggleUi();
        installRoomMascotUiSafety();
        startPreferencesExtensionsIntegration();
        startHugTightlyActivityMonitor();
        scheduleNextIdleAnimation(3500);
        startPlushStatusIconMonitor();

        if (!validate()) {
            throw new Error("Standalone validation failed. Run /plushiedebug and check the console.");
        }
        checkAchievements(true);
        scheduleAutomaticUpdateCheck();
    }

    main().catch(e => {
        startupError = e;
        failed = true;
        ready = false;

        try {
            if (window[ACTIVE_GUARD] === VERSION) delete window[ACTIVE_GUARD];
        } catch (_) {}

        error("STARTUP FAILED:", e);
    });
})();
