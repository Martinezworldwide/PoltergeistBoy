export var CONSTANTS = {
    // Player
    PLAYER_SPEED: 4.0,
    PLAYER_ROTATION_SPEED: 5.0,
    PLAYER_TURN_SPEED: 10.0,
    PLAYER_COLOR: 0xdd6633,
    // Trash Can
    TRASHCAN_COLOR: 0x666666,
    GARBAGE_BAG_COLOR: 0x1a1a1a,
    // Camera
    CAMERA_DISTANCE: 7.0,
    CAMERA_HEIGHT: 4.0,
    CAMERA_LERP_FACTOR: 0.05,
    // Ghosts
    GHOST_COUNT: 50,
    GHOST_MIN_SCALE: 0.5,
    GHOST_MAX_SCALE: 1.5,
    // MIN_GHOST_COUNT: 5, // For potential respawning
    // Removed GHOST_SPEED and GHOST_WANDER_RADIUS as they are not used currently
    // GHOST_SPEED: 1.5,
    // GHOST_WANDER_RADIUS: 10.0,
    GHOST_COLOR: 0xeeeeff,
    GHOST_EMISSIVE_COLOR: 0xaaaaff,
    GHOST_SPAWN_MIN_Y: 1.0,
    GHOST_SPAWN_MAX_Y: 4.0,
    GHOST_BOB_SPEED: 2.0,
    GHOST_BOB_AMOUNT: 0.15,
    // Capture
    CAPTURE_RADIUS: 2.0,
    // Environment - Indoor Colors
    FOG_COLOR: 0xddeeff,
    BACKGROUND_COLOR: 0xeef2f5,
    GROUND_COLOR: 0xccaa88,
    OBSTACLE_COLOR: 0x8B4513,
    WALL_COLOR: 0xf0e5d8,
    PLAY_AREA_HALF_SIZE: 28,
    // Crystals
    CRYSTAL_SIZE: 0.6,
    CRYSTAL_COLOR: 0x4dd0e1,
    CRYSTAL_EMISSIVE_COLOR: 0x00bcd4,
    CRYSTAL_ROTATION_SPEED: 0.5,
    MAX_CRYSTALS: 5,
    CRYSTAL_PLACEMENT_COOLDOWN: 1.0,
    CRYSTAL_LIGHT_RANGE: 5,
    EQUIPMENT_TYPES: {
        VACUUM: 'vacuum',
        SCEPTER: 'scepter',
        SCEPTER_FIELD: 'energyField',
        AIR_FRESHENER: 'airFreshener',
        CRYSTAL_WAND: 'crystalWand' // New equipment type for the Crystal Wand
    },
    EQUIPMENT_ACTIONS: {
        CRYSTAL_WAND_ACTIVATE: 'crystalWandActivate',
        CRYSTAL_WAND_DEACTIVATE: 'crystalWandDeactivate'
    },
    ENERGY_FIELD_BASE_DURATION: 5,
    ENERGY_FIELD_BASE_RADIUS: 3,
    ENERGY_FIELD_COLOR: 0x00FFFF,
    ENERGY_FIELD_OPACITY: 0.3,
    // Air Freshener (basic for now, can expand)
    AIR_FRESHENER_RANGE: 4,
    AIR_FRESHENER_EFFECT_STRENGTH: 5,
    AIR_FRESHENER_USES: 5
};
