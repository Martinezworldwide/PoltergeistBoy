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
export var EnergyField = /*#__PURE__*/ function() {
    "use strict";
    function EnergyField(scene, position) {
        var chargeLevel = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        _class_call_check(this, EnergyField);
        this.scene = scene;
        this.mesh = null;
        this.isActive = true;
        this.lifeTime = 0;
        this.maxLifeTime = CONSTANTS.ENERGY_FIELD_BASE_DURATION * (0.5 + chargeLevel * 0.5); // Duration scales with charge
        this.baseRadius = CONSTANTS.ENERGY_FIELD_BASE_RADIUS * (0.7 + chargeLevel * 0.3); // Radius scales with charge
        this.chargeLevel = chargeLevel; // Store for potential effects
        this.createMesh(position);
    }
    _create_class(EnergyField, [
        {
            key: "createMesh",
            value: function createMesh(position) {
                var segments = 32; // More segments for a smoother sphere
                var geometry = new THREE.SphereGeometry(this.baseRadius, segments, segments);
                var material = new THREE.MeshBasicMaterial({
                    color: CONSTANTS.ENERGY_FIELD_COLOR,
                    transparent: true,
                    opacity: CONSTANTS.ENERGY_FIELD_OPACITY,
                    wireframe: true,
                    side: THREE.DoubleSide
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                this.mesh.position.y = Math.max(this.mesh.position.y, this.baseRadius * 0.1); // Ensure it's not too low, slightly above ground
                this.scene.add(this.mesh);
            }
        },
        {
            key: "update",
            value: function update(deltaTime) {
                if (!this.isActive) return;
                this.lifeTime += deltaTime;
                if (this.lifeTime >= this.maxLifeTime) {
                    this.remove();
                    return;
                }
                // Pulsating effect for opacity and scale
                var pulseFactor = Math.sin(this.lifeTime * Math.PI * 2 / 2) * 0.5 + 0.5; // Slow pulse (2s period)
                this.mesh.material.opacity = CONSTANTS.ENERGY_FIELD_OPACITY * (1 - this.lifeTime / this.maxLifeTime) * (0.5 + pulseFactor * 0.5);
                // Scale effect: start small, expand, then shrink
                var scaleProgress = this.lifeTime / this.maxLifeTime;
                var currentScale;
                if (scaleProgress < 0.2) {
                    currentScale = scaleProgress / 0.2;
                } else if (scaleProgress < 0.8) {
                    currentScale = 1.0;
                } else {
                    currentScale = 1.0 - (scaleProgress - 0.8) / 0.2;
                }
                currentScale = Math.max(0, currentScale); // Ensure scale doesn't go negative
                this.mesh.scale.set(currentScale, currentScale, currentScale);
                // Optional: Make wireframe color more intense as it fades
                var wireframeIntensity = 0.5 + this.lifeTime / this.maxLifeTime * 0.5;
                this.mesh.material.color.setHSL(new THREE.Color(CONSTANTS.ENERGY_FIELD_COLOR).getHSL({
                    h: 0,
                    s: 0,
                    l: 0
                }).h, 1.0, 0.5 * wireframeIntensity // Modulate lightness
                );
            }
        },
        {
            key: "remove",
            value: function remove() {
                this.isActive = false;
                if (this.mesh && this.mesh.parent) {
                    this.scene.remove(this.mesh);
                    this.mesh.geometry.dispose();
                    this.mesh.material.dispose();
                    this.mesh = null;
                    console.log("EnergyField removed and disposed.");
                }
            }
        },
        {
            // Method for ghosts to check if they are inside the field
            key: "isPointInside",
            value: function isPointInside(point) {
                if (!this.isActive || !this.mesh) return false;
                // Use current scaled radius for check
                var currentRadius = this.baseRadius * this.mesh.scale.x;
                return point.distanceToSquared(this.mesh.position) < currentRadius * currentRadius;
            }
        }
    ]);
    return EnergyField;
}();
