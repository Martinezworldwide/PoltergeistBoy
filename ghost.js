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
import { CONSTANTS } from './constants.js';
export var Ghost = /*#__PURE__*/ function() {
    "use strict";
    function Ghost(scene, position) {
        var scale = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        _class_call_check(this, Ghost);
        this.scene = scene;
        this.scale = scale; // Store the scale
        // Removed speed and wanderRadius as ghosts will be stationary for now
        // this.speed = CONSTANTS.GHOST_SPEED * (0.8 + Math.random() * 0.4);
        // this.wanderRadius = CONSTANTS.GHOST_WANDER_RADIUS;
        // this.targetPosition = new THREE.Vector3();
        this.isCaptured = false;
        this.isActive = true; // For potential object pooling later
        this.isAffectedByField = false;
        this.fieldEffectTimer = 0; // Timer to manage temporary effects
        this.wasAffectedLastFrame = false; // To detect exiting a field
        this.nudgeVelocity = new THREE.Vector3(); // For air freshener effect
        this.nudgeTimer = 0; // How long the nudge effect lasts
        this.isFreshened = false;
        this.freshenedTimer = 0;
        this.freshenedDuration = 1.5; // seconds
        this.originalColor = new THREE.Color(CONSTANTS.GHOST_COLOR);
        this.originalEmissive = new THREE.Color(CONSTANTS.GHOST_EMISSIVE_COLOR);
        // Simple ghost shape (elongated sphere)
        var baseGeometryScale = {
            x: 0.7,
            y: 1.2,
            z: 0.7
        };
        var geometry = new THREE.SphereGeometry(0.5, 16, 8);
        // Apply individual scale, then the original elongation
        geometry.scale(baseGeometryScale.x * scale, baseGeometryScale.y * scale, baseGeometryScale.z * scale);
        var material = new THREE.MeshStandardMaterial({
            color: CONSTANTS.GHOST_COLOR,
            transparent: true,
            opacity: 0.8,
            emissive: CONSTANTS.GHOST_EMISSIVE_COLOR,
            emissiveIntensity: 0.5,
            roughness: 0.8
        });
        this.originalOpacity = material.opacity;
        this.originalEmissiveIntensity = material.emissiveIntensity;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true; // Ghosts cast subtle shadows
        this.scene.add(this.mesh);
        // Removed initial wander target finding
        // this.findNewWanderTarget(position);
        // Bobbing motion
        this.bobTime = Math.random() * Math.PI * 2; // Random start phase
        this.currentBobSpeed = CONSTANTS.GHOST_BOB_SPEED; // Store current bob speed
        this.originalBobSpeed = CONSTANTS.GHOST_BOB_SPEED; // Store original for reset
        this.baseY = position.y; // Base Y position for bobbing
        // Adjust baseY if the scaled ghost would clip the floor, ensuring it spawns above ground
        // The pivot is at the center of the SphereGeometry *before* scaling.
        // Its original height from pivot to bottom is 0.5 * baseGeometryScale.y * scale.
        var scaledHalfHeight = 0.5 * 1.2 * this.scale; // original radius * y-elongation * new_scale
        if (this.mesh.position.y - scaledHalfHeight < 0) {
            this.mesh.position.y = scaledHalfHeight;
            this.baseY = scaledHalfHeight; // Update baseY if position adjusted
        }
    }
    _create_class(Ghost, [
        {
            // Removed findNewWanderTarget method as it's no longer needed
            key: "update",
            value: function update(deltaTime, playerPosition) {
                var activeEnergyFields = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
                if (this.isCaptured || !this.isActive) return;
                var currentlyInField = false;
                if (activeEnergyFields && activeEnergyFields.length > 0) {
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = activeEnergyFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var field = _step.value;
                            if (field.isActive && field.isPointInside(this.mesh.position)) {
                                currentlyInField = true;
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
                if (currentlyInField) {
                    if (!this.wasAffectedLastFrame) {
                        // Apply more significant "shock" effect initially
                        this.mesh.material.opacity = this.originalOpacity * 0.3;
                        this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity * 2.5; // Flash brighter
                        this.currentBobSpeed = this.originalBobSpeed * 0.1; // Drastic slowdown
                        this.mesh.scale.set(this.scale * 1.1, this.scale * 0.9, this.scale * 1.1); // Wiggle/distort
                    } else {
                        // Sustained effect (less dramatic than initial shock)
                        this.mesh.material.opacity = this.originalOpacity * 0.5;
                        this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity * 1.5;
                        this.currentBobSpeed = this.originalBobSpeed * 0.3;
                        // Gradually return to normal scale if distorted
                        this.mesh.scale.lerp(new THREE.Vector3(this.scale, this.scale, this.scale), deltaTime * 5);
                    }
                    this.wasAffectedLastFrame = true;
                } else {
                    if (this.wasAffectedLastFrame) {
                        // Smoothly transition back to normal
                        this.mesh.material.opacity = this.originalOpacity;
                        this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity;
                        this.currentBobSpeed = this.originalBobSpeed;
                        this.mesh.scale.set(this.scale, this.scale, this.scale); // Reset scale
                    }
                    // Ensure properties are at their original state if no field interaction
                    this.mesh.material.opacity = THREE.MathUtils.lerp(this.mesh.material.opacity, this.originalOpacity, deltaTime * 5);
                    this.mesh.material.emissiveIntensity = THREE.MathUtils.lerp(this.mesh.material.emissiveIntensity, this.originalEmissiveIntensity, deltaTime * 5);
                    this.currentBobSpeed = THREE.MathUtils.lerp(this.currentBobSpeed, this.originalBobSpeed, deltaTime * 5);
                    this.mesh.scale.lerp(new THREE.Vector3(this.scale, this.scale, this.scale), deltaTime * 5);
                }
                this.wasAffectedLastFrame = currentlyInField;
                // Air freshener visual effect
                if (this.isFreshened) {
                    this.freshenedTimer += deltaTime;
                    if (this.freshenedTimer >= this.freshenedDuration) {
                        this.isFreshened = false;
                        this.freshenedTimer = 0;
                        // Revert visual changes if not affected by a field
                        if (!this.wasAffectedLastFrame) {
                            this.mesh.material.opacity = this.originalOpacity;
                            this.mesh.material.color.set(this.originalColor);
                            this.mesh.material.emissive.set(this.originalEmissive);
                            this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity;
                        }
                    } else {
                        // Apply freshened effect (overridden by field if active)
                        if (!this.wasAffectedLastFrame) {
                            var freshenProgress = this.freshenedTimer / this.freshenedDuration;
                            this.mesh.material.opacity = this.originalOpacity * THREE.MathUtils.lerp(0.3, this.originalOpacity, freshenProgress); // Fade back in
                            // Slight color shift - e.g., desaturate or tint green-ish blue
                            var tempColor = this.originalColor.clone();
                            tempColor.lerp(new THREE.Color(0xccffee), 0.7); // Lerp towards a minty color
                            this.mesh.material.color.lerpColors(tempColor, this.originalColor, freshenProgress);
                            var tempEmissive = this.originalEmissive.clone();
                            tempEmissive.lerp(new THREE.Color(0x66aabb), 0.5);
                            this.mesh.material.emissive.lerpColors(tempEmissive, this.originalEmissive, freshenProgress);
                            this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity * THREE.MathUtils.lerp(0.4, 1.0, freshenProgress);
                        }
                    }
                }
                // Bobbing motion using currentBobSpeed
                this.bobTime += deltaTime * this.currentBobSpeed;
                var targetY = this.baseY + Math.sin(this.bobTime) * CONSTANTS.GHOST_BOB_AMOUNT;
                // Apply nudge
                if (this.nudgeTimer > 0) {
                    this.mesh.position.addScaledVector(this.nudgeVelocity, deltaTime);
                    this.nudgeTimer -= deltaTime;
                    if (this.nudgeTimer <= 0) {
                        this.nudgeVelocity.set(0, 0, 0);
                    }
                    // Dampen nudge effect on Y to prevent flying too high/low from bobbing
                    targetY = this.mesh.position.y + (targetY - this.mesh.position.y) * 0.1; // Blend targetY with current Y if nudged
                }
                this.mesh.position.y = targetY;
            // Removed movement logic
            }
        },
        {
            key: "capture",
            value: function capture() {
                if (this.isCaptured) return false;
                this.isCaptured = true;
                this.isActive = false; // Mark as inactive
                // Effect handled in game.js, just set state here
                console.log("Ghost state set to captured.");
                return true;
            }
        },
        {
            key: "removeFromScene",
            value: function removeFromScene() {
                if (this.mesh.parent) {
                    this.scene.remove(this.mesh);
                }
            }
        },
        {
            key: "applyNudge",
            value: function applyNudge(direction, strength) {
                if (this.isCaptured) return;
                this.nudgeVelocity.copy(direction).multiplyScalar(strength);
                this.nudgeTimer = 0.3; // Nudge effect lasts for 0.3 seconds
                // Start freshened visual effect
                if (!this.isFreshened && !this.wasAffectedLastFrame) {
                    this.isFreshened = true;
                    this.freshenedTimer = 0;
                    this.mesh.material.opacity = this.originalOpacity * 0.3;
                    // Tint color slightly - e.g. more desaturated or towards a "clean" color like light cyan/green
                    this.mesh.material.color.set(0xccffee); // A pale minty color
                    this.mesh.material.emissive.set(0x66aabb); // A dimmer, cooler emissive
                    this.mesh.material.emissiveIntensity = this.originalEmissiveIntensity * 0.4;
                }
                console.log("Ghost nudged and freshened");
            }
        }
    ]);
    return Ghost;
}();
