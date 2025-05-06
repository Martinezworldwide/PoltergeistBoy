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
// Define some basic colors for the wand (can be moved to CONSTANTS if needed)
var WAND_HANDLE_COLOR = new THREE.Color(0x964B00); // Brown for a wooden handle
var WAND_CRYSTAL_COLOR = new THREE.Color(0xDA70D6); // Orchid - a purplish pink crystal
var WAND_CRYSTAL_EMISSIVE = new THREE.Color(0x4B0082); // Indigo for emissive glow
export var CrystalWand = /*#__PURE__*/ function() {
    "use strict";
    function CrystalWand(scene) {
        _class_call_check(this, CrystalWand);
        this.scene = scene; // May not be needed if always a child of player
        this.mesh = new THREE.Group();
        this.crystalTip = new THREE.Object3D(); // For targeting or effects later
        this.isActive = false; // Is the wand currently "active" (e.g., emitting energy)
        this.lastUseTime = 0;
        this.cooldown = 1.0; // seconds
        this.beamMesh = null;
        this.beamMaterial = null; // To animate its properties
        this.createMesh();
        this.mesh.visible = false; // Start hidden
    }
    _create_class(CrystalWand, [
        {
            key: "createMesh",
            value: function createMesh() {
                // Handle (a simple cylinder)
                var handleHeight = 0.25;
                var handleRadius = 0.03;
                var handleGeometry = new THREE.CylinderGeometry(handleRadius, handleRadius * 0.9, handleHeight, 8);
                var handleMaterial = new THREE.MeshStandardMaterial({
                    color: WAND_HANDLE_COLOR,
                    roughness: 0.7,
                    metalness: 0.1
                });
                var handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
                handleMesh.position.y = handleHeight / 2;
                this.mesh.add(handleMesh);
                // Crystal (an elongated octahedron or a custom shape)
                var crystalLength = 0.15;
                var crystalWidth = 0.05;
                // Using a Box for a simpler crystal shape for now, can be more complex
                var crystalGeometry = new THREE.OctahedronGeometry(crystalWidth, 0);
                crystalGeometry.scale(1, crystalLength / (crystalWidth * Math.sqrt(2)), 1); // Elongate it
                var crystalMaterial = new THREE.MeshPhongMaterial({
                    color: WAND_CRYSTAL_COLOR,
                    emissive: WAND_CRYSTAL_EMISSIVE,
                    emissiveIntensity: 0.4,
                    shininess: 90,
                    specular: 0xeeeeee,
                    transparent: true,
                    opacity: 0.9
                });
                this.crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial); // Store ref
                this.crystalMesh.position.y = handleHeight + crystalLength * 0.4; // Position on top of handle
                this.mesh.add(this.crystalMesh);
                // Position the crystalTip helper at the end of the crystal
                this.crystalTip.position.set(0, crystalLength * 0.5, 0); // Tip of the crystal
                this.crystalMesh.add(this.crystalTip);
                // Create the beam mesh
                var beamLength = 3.0; // Slightly longer beam
                var beamRadiusTop = 0.015; // Thinner at the crystal tip
                var beamRadiusBottom = 0.03; // Wider at the end
                // Using a CylinderGeometry with different top and bottom radii creates a cone/tapered cylinder
                var beamGeometry = new THREE.CylinderGeometry(beamRadiusTop, beamRadiusBottom, beamLength, 12, 1, true); // radialSegments, heightSegments, openEnded
                // Move the beam's pivot to its base so it extends from the crystal tip
                beamGeometry.translate(0, beamLength / 2, 0);
                this.beamMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFF69B4,
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                this.beamMesh = new THREE.Mesh(beamGeometry, this.beamMaterial);
                this.beamMesh.visible = false; // Start hidden
                this.crystalTip.add(this.beamMesh); // Attach beam to the tip, it will inherit tip's orientation
                // Position and orientation for being held
                this.mesh.rotation.x = -Math.PI / 3; // Angled more downwards, like holding a pen/wand
                this.mesh.rotation.z = Math.PI / 6; // Tilted slightly to the side
                this.mesh.position.set(0.25, 0.45, -0.15); // Adjusted for a more natural grip: slightly more to player's right, lower, and a bit forward
            }
        },
        {
            key: "setVisible",
            value: function setVisible(visible) {
                this.mesh.visible = visible;
                if (!visible && this.isActive) {
                    this.deactivate(); // Ensure it deactivates if hidden while active
                }
            }
        },
        {
            // Placeholder for the wand's primary action
            key: "use",
            value: function use() {
                var currentTime = performance.now() / 1000;
                if (currentTime - this.lastUseTime < this.cooldown) {
                    console.log("Crystal Wand on cooldown.");
                    return null;
                }
                this.lastUseTime = currentTime;
                if (this.isActive) {
                    this.deactivate();
                    return {
                        type: CONSTANTS.EQUIPMENT_ACTIONS.CRYSTAL_WAND_DEACTIVATE
                    }; // Placeholder
                } else {
                    this.activate();
                    var tipWorldPosition = new THREE.Vector3();
                    this.crystalTip.getWorldPosition(tipWorldPosition);
                    var wandDirection = new THREE.Vector3(0, 1, 0); // Local Y is "forward" for the tip
                    var worldQuaternion = new THREE.Quaternion();
                    this.crystalTip.getWorldQuaternion(worldQuaternion);
                    wandDirection.applyQuaternion(worldQuaternion).normalize();
                    return {
                        type: CONSTANTS.EQUIPMENT_ACTIONS.CRYSTAL_WAND_ACTIVATE,
                        position: tipWorldPosition,
                        direction: wandDirection
                    };
                }
            }
        },
        {
            key: "activate",
            value: function activate() {
                this.isActive = true;
                // Visual feedback for activation (e.g., increase emissive, add particles)
                this.crystalMesh.material.emissiveIntensity = 0.8;
                if (this.beamMesh) this.beamMesh.visible = true;
                console.log("Crystal Wand Activated");
            }
        },
        {
            key: "deactivate",
            value: function deactivate() {
                this.isActive = false;
                // Visual feedback for deactivation
                this.crystalMesh.material.emissiveIntensity = 0.4;
                if (this.beamMesh) this.beamMesh.visible = false;
                console.log("Crystal Wand Deactivated");
            }
        },
        {
            key: "update",
            value: function update(deltaTime, isActionHeld) {
                var time = performance.now() * 0.001; // For animations
                if (this.isActive) {
                    // Update active effects (e.g., beam, particles, pulsating glow)
                    var crystalPulse = Math.sin(time * 6) * 0.25 + 0.75; // More pronounced pulse for crystal
                    this.crystalMesh.material.emissiveIntensity = 0.5 * crystalPulse + 0.3; // Ensure a base emissiveness
                    this.crystalMesh.scale.setScalar(1 + (crystalPulse - 0.75) * 0.08); // Slightly more subtle scale pulse
                    if (this.beamMesh && this.beamMaterial) {
                        // Beam pulsating opacity and a slight shimmer/color shift
                        var beamPulse = Math.sin(time * 10) * 0.2 + 0.8; // Faster pulse for beam: 0.6 to 1.0
                        this.beamMaterial.opacity = 0.45 * beamPulse + 0.15; // Opacity range 0.3 to 0.6 (overall a bit softer)
                        // Optional: subtle color pulsation for the beam
                        var colorPulseFactor = Math.sin(time * 7) * 0.5 + 0.5; // Slower sine wave for color
                        var baseBeamColor = new THREE.Color(0xFF69B4); // Hot Pink
                        var pulseBeamColor = new THREE.Color(0xFFB6C1); // Light Pink
                        this.beamMaterial.color.lerpColors(baseBeamColor, pulseBeamColor, colorPulseFactor * 0.3); // Mix slightly towards light pink
                    // Example of animating texture offset if we were using a texture for flow effect
                    // if (this.beamMaterial.map) {
                    //     this.beamMaterial.map.offset.y -= deltaTime * 0.5; // Scroll texture
                    // }
                    }
                } else {
                    this.crystalMesh.scale.lerp(new THREE.Vector3(1, 1, 1), deltaTime * 5); // Return to normal size
                    this.crystalMesh.material.emissiveIntensity = THREE.MathUtils.lerp(this.crystalMesh.material.emissiveIntensity, 0.4, deltaTime * 5);
                }
            }
        }
    ]);
    return CrystalWand;
}();
