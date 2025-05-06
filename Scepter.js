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
import { CONSTANTS } from './constants.js'; // We might need constants for dimensions/colors later
// Basic Scepter Colors (can be moved to CONSTANTS.js if they become complex)
var SCEPTER_ROD_COLOR = 0x8B4513; // Brown for wood/metal
var SCEPTER_HEAD_COLOR = 0xFFD700; // Gold for the head/gem
var SCEPTER_HEAD_EMISSIVE = 0x443300;
export var Scepter = /*#__PURE__*/ function() {
    "use strict";
    function Scepter(scene) {
        _class_call_check(this, Scepter);
        this.scene = scene; // May not be needed if scepter is always child of player
        this.mesh = new THREE.Group(); // Use a group to combine parts
        this.isCharging = false;
        this.chargeLevel = 0; // 0 to 1
        this.chargingParticlesGroup = new THREE.Group();
        this.activeChargingMotes = []; // To manage individual mote animations
        this.createMesh();
        this.mesh.add(this.chargingParticlesGroup); // Add particle group to scepter
        this.mesh.visible = false; // Start hidden
    }
    _create_class(Scepter, [
        {
            key: "createMesh",
            value: function createMesh() {
                // Rod
                var rodGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8); // radiusTop, radiusBottom, height, radialSegments
                var rodMaterial = new THREE.MeshStandardMaterial({
                    color: SCEPTER_ROD_COLOR,
                    roughness: 0.6,
                    metalness: 0.4
                });
                var rodMesh = new THREE.Mesh(rodGeometry, rodMaterial);
                rodMesh.position.y = 0.6; // Position so bottom is at group origin
                this.mesh.add(rodMesh);
                // Head (Gem/Ornament)
                var headRadius = 0.25;
                var headGeometry = new THREE.SphereGeometry(headRadius, 16, 12);
                var headMaterial = new THREE.MeshStandardMaterial({
                    color: SCEPTER_HEAD_COLOR,
                    emissive: SCEPTER_HEAD_EMISSIVE,
                    emissiveIntensity: 0.3,
                    roughness: 0.2,
                    metalness: 0.7
                });
                this.headMesh = new THREE.Mesh(headGeometry, headMaterial); // Store reference for effects
                this.headMesh.position.y = 1.2 + headRadius * 0.8; // Position on top of the rod
                this.mesh.add(this.headMesh);
                // Optional: A small attachment detail between rod and head
                var attachmentRadiusLarge = 0.15;
                var attachmentRadiusSmall = 0.12;
                var attachmentHeight = 0.1;
                var attachmentGeometry = new THREE.CylinderGeometry(attachmentRadiusLarge, attachmentRadiusSmall, attachmentHeight, 8);
                var attachmentMaterial = new THREE.MeshStandardMaterial({
                    color: SCEPTER_ROD_COLOR,
                    roughness: 0.5,
                    metalness: 0.5
                });
                var attachmentMesh = new THREE.Mesh(attachmentGeometry, attachmentMaterial);
                attachmentMesh.position.y = 1.2 - attachmentHeight / 2; // Base of head
                this.mesh.add(attachmentMesh);
                // Scepter will be held, so position its group accordingly relative to player
                // This initial local position is if the player holds it straight up
                this.mesh.rotation.z = Math.PI / 6; // Tilt slightly forward
                this.mesh.position.set(0.3, 0.6, 0.1); // Offset to player's hand (approx)
            }
        },
        {
            // Basic methods for scepter functionality (to be expanded)
            key: "startCharging",
            value: function startCharging() {
                if (this.isCharging) return;
                this.isCharging = true;
                // console.log("Scepter charging started");
                // Visual feedback for charging can start here
                // Create motes if not already present
                if (this.activeChargingMotes.length === 0) {
                    var moteCount = 5;
                    var headPos = this.headMesh.position;
                    for(var i = 0; i < moteCount; i++){
                        var moteMaterial = new THREE.MeshBasicMaterial({
                            color: 0xFFFF00,
                            transparent: true,
                            opacity: 0.8,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false
                        });
                        var moteGeometry = new THREE.SphereGeometry(0.03, 6, 6); // Small spheres
                        var mote = new THREE.Mesh(moteGeometry, moteMaterial);
                        // Initial random position around head
                        var angle = Math.random() * Math.PI * 2;
                        var dist = 0.3 + Math.random() * 0.2; // Distance from head center
                        mote.position.set(headPos.x + Math.cos(angle) * dist, headPos.y + (Math.random() - 0.5) * 0.3, headPos.z + Math.sin(angle) * dist);
                        mote.userData.angle = angle; // Store for orbit
                        mote.userData.distance = dist;
                        mote.userData.ySpeed = (Math.random() - 0.5) * 0.5; // Vertical drift speed
                        mote.userData.initialY = mote.position.y;
                        this.chargingParticlesGroup.add(mote);
                        this.activeChargingMotes.push(mote);
                    }
                }
            }
        },
        {
            key: "stopChargingAndDeploy",
            value: function stopChargingAndDeploy() {
                var _this = this;
                if (!this.isCharging) return null;
                this.isCharging = false;
                var deploySuccess = this.chargeLevel >= 0.9; // Example condition
                // console.log(`Scepter deployment attempt. Charge: ${this.chargeLevel.toFixed(2)}, Success: ${deploySuccess}`);
                this.chargeLevel = 0;
                // Visual feedback reset - clear motes
                this.activeChargingMotes.forEach(function(mote) {
                    // Optional: could add a quick "fly off" animation here
                    _this.chargingParticlesGroup.remove(mote);
                    mote.geometry.dispose();
                    mote.material.dispose();
                });
                this.activeChargingMotes = [];
                if (deploySuccess) {
                    var currentCharge = this.chargeLevel; // Capture before reset
                    // Return field properties or trigger field creation
                    return {
                        type: CONSTANTS.EQUIPMENT_TYPES.SCEPTER_FIELD,
                        position: this.mesh.getWorldPosition(new THREE.Vector3()),
                        chargeLevel: currentCharge // Pass the actual charge level
                    };
                }
                return null;
            }
        },
        {
            key: "getHeadWorldPosition",
            value: function getHeadWorldPosition() {
                if (!this.headMesh) return new THREE.Vector3();
                return this.headMesh.getWorldPosition(new THREE.Vector3());
            }
        },
        {
            key: "update",
            value: function update(deltaTime, isActionHeld) {
                var _this = this;
                if (this.isCharging) {
                    this.chargeLevel = Math.min(this.chargeLevel + deltaTime * 0.5, 1); // Charge rate
                    // Update emissive intensity based on charge
                    this.headMesh.material.emissiveIntensity = 0.3 + this.chargeLevel * 1.2;
                    this.headMesh.material.emissiveIntensity = 0.3 + this.chargeLevel * 1.2;
                    // Animate charging motes
                    var headPos = this.headMesh.position;
                    var time = performance.now() * 0.001; // Current time for consistent animation
                    this.activeChargingMotes.forEach(function(mote) {
                        // Orbit around head
                        mote.userData.angle += deltaTime * (1 + _this.chargeLevel * 2); // Orbit faster with more charge
                        var currentDist = mote.userData.distance * (0.8 + Math.sin(time * 2 + mote.userData.angle) * 0.2); // Pulsate distance
                        mote.position.x = headPos.x + Math.cos(mote.userData.angle) * currentDist;
                        mote.position.z = headPos.z + Math.sin(mote.userData.angle) * currentDist;
                        // Vertical bobbing/drifting
                        mote.position.y = headPos.y + Math.sin(time * 3 + mote.userData.angle * 0.5) * 0.15; // Sync bob with orbit slightly
                        // Pulse opacity/intensity
                        mote.material.opacity = 0.6 + Math.sin(time * 5 + mote.userData.angle) * 0.4;
                        mote.scale.setScalar(0.8 + Math.sin(time * 4 + mote.userData.angle * 0.7) * 0.2); // Pulse size
                    });
                } else {
                    this.headMesh.material.emissiveIntensity = Math.max(0.3, this.headMesh.material.emissiveIntensity - deltaTime * 2); // Cool down
                    // Ensure motes are cleared if charging stops abruptly (e.g. switching equipment)
                    if (this.activeChargingMotes.length > 0) {
                        this.activeChargingMotes.forEach(function(mote) {
                            _this.chargingParticlesGroup.remove(mote);
                            mote.geometry.dispose();
                            mote.material.dispose();
                        });
                        this.activeChargingMotes = [];
                    }
                }
                if (!isActionHeld && this.isCharging) {
                // Action released. The actual deployment check/return is now fully inside stopChargingAndDeploy.
                // Player.js will call this and get the details if any.
                // No need to explicitly call it again here if Player.js is already doing it on action release.
                // However, the original logic in Player.js is:
                // if (!isActionKeyHeld && this.scepter.isCharging) { this.scepter.stopChargingAndDeploy(); }
                // So, this internal call in scepter.update is redundant if player.js handles it.
                // Let's keep it simple: Player.js detects release and calls stopChargingAndDeploy.
                // This update method should only manage chargeLevel and visual feedback.
                }
            }
        },
        {
            key: "setVisible",
            value: function setVisible(visible) {
                var _this = this;
                this.mesh.visible = visible;
                if (!visible && this.isCharging) {
                    this.chargeLevel = 0;
                    this.isCharging = false;
                    this.headMesh.material.emissiveIntensity = 0.3;
                    // Clear motes if scepter becomes invisible while charging
                    this.activeChargingMotes.forEach(function(mote) {
                        _this.chargingParticlesGroup.remove(mote);
                        mote.geometry.dispose();
                        mote.material.dispose();
                    });
                    this.activeChargingMotes = [];
                }
            }
        }
    ]);
    return Scepter;
}();
