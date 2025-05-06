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
export var Crystal = /*#__PURE__*/ function() {
    "use strict";
    function Crystal(scene, position) {
        _class_call_check(this, Crystal);
        this.scene = scene;
        this.mesh = null;
        this.isActive = true; // For future interactions
        this.createMesh(position);
    }
    _create_class(Crystal, [
        {
            key: "createMesh",
            value: function createMesh(position) {
                var geometry = new THREE.OctahedronGeometry(CONSTANTS.CRYSTAL_SIZE, 0); // Simple crystal shape
                var material = new THREE.MeshPhongMaterial({
                    color: CONSTANTS.CRYSTAL_COLOR,
                    emissive: CONSTANTS.CRYSTAL_EMISSIVE_COLOR,
                    emissiveIntensity: 0.6,
                    shininess: 80,
                    specular: 0xffffff,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.DoubleSide // Render both sides for potential transparency effects
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                this.mesh.position.y = CONSTANTS.CRYSTAL_SIZE / 2; // Place it on the ground
                this.mesh.castShadow = true;
                // Add a subtle point light emanating from the crystal
                this.light = new THREE.PointLight(CONSTANTS.CRYSTAL_EMISSIVE_COLOR, 0.5, CONSTANTS.CRYSTAL_LIGHT_RANGE);
                this.light.position.copy(this.mesh.position);
                this.light.position.y += 0.2; // Slightly above the crystal center
                this.scene.add(this.mesh);
                this.scene.add(this.light);
            }
        },
        {
            key: "update",
            value: function update(deltaTime) {
                if (!this.isActive) return;
                // Pulsating light effect
                this.light.intensity = 0.4 + Math.sin(performance.now() * 0.002) * 0.2;
                this.mesh.rotation.y += CONSTANTS.CRYSTAL_ROTATION_SPEED * deltaTime;
            }
        },
        {
            key: "remove",
            value: function remove() {
                this.isActive = false;
                if (this.mesh.parent) {
                    this.scene.remove(this.mesh);
                }
                if (this.light.parent) {
                    this.scene.remove(this.light);
                }
            // Dispose geometry and material if no longer needed by other crystals
            // For simplicity, not disposing here assuming multiple crystals might share them initially.
            // Proper disposal would be needed if geometries/materials are unique per crystal.
            }
        }
    ]);
    return Crystal;
}();
