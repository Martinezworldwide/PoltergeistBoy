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
import { CONSTANTS } from './constants.js'; // Might need later for colors, etc.
var AIR_FRESHENER_BODY_COLOR = new THREE.Color(0xADD8E6); // Light blue
var AIR_FRESHENER_NOZZLE_COLOR = new THREE.Color(0xD3D3D3); // Light grey
var AIR_FRESHENER_EMPTY_COLOR = new THREE.Color(0xFF6347); // Tomato red for empty
export var AirFreshener = /*#__PURE__*/ function() {
    "use strict";
    function AirFreshener() {
        _class_call_check(this, AirFreshener);
        this.mesh = new THREE.Group();
        this.nozzleTip = new THREE.Object3D(); // Helper to get nozzle's world direction
        this.createMesh();
        this.mesh.visible = false; // Start hidden
        this.usesLeft = CONSTANTS.AIR_FRESHENER_USES; // Track uses
        this.lastUseTime = 0; // Cooldown for spray
        this.cooldown = 0.5; // 0.5 seconds cooldown
    }
    _create_class(AirFreshener, [
        {
            key: "createMesh",
            value: function createMesh() {
                // Body of the freshener (a cylinder)
                var bodyHeight = 0.3;
                var bodyRadius = 0.08;
                var bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
                var bodyMaterial = new THREE.MeshStandardMaterial({
                    color: AIR_FRESHENER_BODY_COLOR,
                    roughness: 0.4,
                    metalness: 0.1
                });
                this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial); // Store reference to bodyMesh
                this.bodyMesh.position.y = bodyHeight / 2;
                this.mesh.add(this.bodyMesh);
                // Nozzle (a smaller cylinder or sphere)
                var nozzleHeight = 0.05;
                var nozzleRadius = 0.03;
                var nozzleGeometry = new THREE.CylinderGeometry(nozzleRadius, nozzleRadius * 0.8, nozzleHeight, 8);
                var nozzleMaterial = new THREE.MeshStandardMaterial({
                    color: AIR_FRESHENER_NOZZLE_COLOR,
                    roughness: 0.2,
                    metalness: 0.5
                });
                var nozzleMesh = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
                nozzleMesh.position.y = bodyHeight + nozzleHeight / 2;
                this.mesh.add(nozzleMesh);
                // Add the nozzleTip helper as a child of the nozzleMesh, positioned at its "tip"
                // The nozzle currently points along its local Y axis due to CylinderGeometry default.
                // We want the spray to go "forward" from the player's perspective.
                // The whole AirFreshener mesh is rotated.
                this.nozzleTip.position.set(0, nozzleHeight / 2 + 0.01, 0); // Slightly in front of nozzle geometry
                nozzleMesh.add(this.nozzleTip);
                // Position and orientation for being held
                // Player's right hand would be roughly X: positive, Y: around player model's waist/chest, Z: slightly in front
                this.mesh.position.set(0.35, 0.1, -0.2); // More to the side, lower, and slightly more forward
                this.mesh.rotation.z = Math.PI / 6; // Tilt "forward" (barrel points generally away from player's front)
                this.mesh.rotation.x = -Math.PI / 12; // Tilt nozzle slightly downwards
            }
        },
        {
            key: "setVisible",
            value: function setVisible(visible) {
                this.mesh.visible = visible;
            }
        },
        {
            // Placeholder for future use action
            key: "use",
            value: function use() {
                var currentTime = performance.now() / 1000;
                if (this.usesLeft <= 0) {
                    console.log("Air Freshener is empty!");
                    // Optionally play an empty sound effect or show UI message
                    if (this.bodyMesh.material.color.getHex() !== AIR_FRESHENER_EMPTY_COLOR.getHex()) {
                        this.bodyMesh.material.color.set(AIR_FRESHENER_EMPTY_COLOR);
                    }
                    return null;
                }
                if (currentTime - this.lastUseTime < this.cooldown) {
                    console.log("Air Freshener on cooldown.");
                    return null;
                }
                this.usesLeft--;
                this.lastUseTime = currentTime;
                console.log("Air Freshener used! ".concat(this.usesLeft, " uses left."));
                // Reset color if it was empty previously and now has uses (e.g., after a refill mechanic, not implemented yet)
                // Or ensure it's normal color if not empty.
                if (this.bodyMesh.material.color.getHex() === AIR_FRESHENER_EMPTY_COLOR.getHex() && this.usesLeft > 0) {
                    this.bodyMesh.material.color.set(AIR_FRESHENER_BODY_COLOR);
                }
                // Get spray origin (nozzle tip world position)
                var sprayOrigin = new THREE.Vector3();
                this.nozzleTip.getWorldPosition(sprayOrigin);
                // Get spray direction more accurately from the nozzleTip.
                // The nozzleTip is oriented such that its local Y-axis points "out" of the nozzle.
                var nozzleWorldDirection = new THREE.Vector3(0, 1, 0); // Local "up" for the nozzleTip (spray direction)
                var worldQuaternion = new THREE.Quaternion();
                this.nozzleTip.getWorldQuaternion(worldQuaternion);
                nozzleWorldDirection.applyQuaternion(worldQuaternion).normalize();
                return {
                    type: CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER,
                    position: sprayOrigin,
                    direction: nozzleWorldDirection,
                    range: CONSTANTS.AIR_FRESHENER_RANGE,
                    strength: CONSTANTS.AIR_FRESHENER_EFFECT_STRENGTH
                };
            }
        },
        {
            key: "update",
            value: function update(deltaTime, isActionHeld) {
            // Could add some subtle animation when held, or cooldown indicator
            }
        }
    ]);
    return AirFreshener;
}();
