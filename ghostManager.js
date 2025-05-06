function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
import * as THREE from 'three';
import { Ghost } from './ghost.js';
import { CONSTANTS } from './constants.js';
export var GhostManager = /*#__PURE__*/ function() {
    "use strict";
    function GhostManager(scene, initialCount) {
        _class_call_check(this, GhostManager);
        this.scene = scene;
        this.ghosts = [];
        this.spawnArea = CONSTANTS.PLAY_AREA_HALF_SIZE; // Use half size for easier calculations
        for(var i = 0; i < initialCount; i++){
            this.spawnGhost();
        }
    }
    _create_class(GhostManager, [
        {
            key: "spawnGhost",
            value: function spawnGhost() {
                // Spawn within the defined play area
                var x = (Math.random() - 0.5) * CONSTANTS.PLAY_AREA_HALF_SIZE * 2 * 0.9; // Use constant, slight inset
                var z = (Math.random() - 0.5) * CONSTANTS.PLAY_AREA_HALF_SIZE * 2 * 0.9; // Use constant, slight inset
                var y = CONSTANTS.GHOST_SPAWN_MIN_Y + Math.random() * (CONSTANTS.GHOST_SPAWN_MAX_Y - CONSTANTS.GHOST_SPAWN_MIN_Y);
                var position = new THREE.Vector3(x, y, z);
                var randomScale = CONSTANTS.GHOST_MIN_SCALE + Math.random() * (CONSTANTS.GHOST_MAX_SCALE - CONSTANTS.GHOST_MIN_SCALE);
                var ghost = new Ghost(this.scene, position, randomScale);
                this.ghosts.push(ghost);
            }
        },
        {
            key: "update",
            value: function update(deltaTime, playerPosition, activeEnergyFields) {
                // Filter out captured ghosts before updating
                this.ghosts = this.ghosts.filter(function(ghost) {
                    return ghost.isActive;
                });
                this.ghosts.forEach(function(ghost) {
                    ghost.update(deltaTime, playerPosition, activeEnergyFields); // Pass fields to each ghost
                });
            // Potential future logic: Respawn ghosts if count drops below a threshold
            // if (this.ghosts.length < CONSTANTS.MIN_GHOST_COUNT) {
            //     this.spawnGhost();
            // }
            }
        }
    ]);
    return GhostManager;
}();
