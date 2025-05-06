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
import { setupScene } from './sceneSetup.js';
import { Player } from './player.js';
import { GhostManager } from './ghostManager.js';
import { InputHandler } from './inputHandler.js';
import { CONSTANTS } from './constants.js';
import { TouchControls } from './touchControls.js';
import { DesktopButtonControls } from './DesktopButtonControls.js'; // Import new controls
import { createCaptureParticles, activeParticleAnimations, updateActiveParticles, createAirFreshenerSpray } from './particleSystem.js';
import { showGhostPhrase, updateSpeechBubbles } from './ghostSpeech.js';
import { Crystal } from './Crystal.js';
import { EnergyField } from './EnergyField.js'; // Import EnergyField
export var Game = /*#__PURE__*/ function() {
    "use strict";
    function Game(renderDiv) {
        _class_call_check(this, Game);
        this.renderDiv = renderDiv;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderDiv.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10); // Initial camera position
        this.clock = new THREE.Clock();
        this.inputHandler = new InputHandler();
        this.ghostsCaptured = 0;
        this.totalGhosts = CONSTANTS.GHOST_COUNT; // Store the total number needed
        this.gameOver = false; // Game state flag
        this.scoreElement = this.createScoreElement(); // Create UI element
        this.winMessageElement = null; // Placeholder for win message UI
        this.airFreshenerUsesElement = this.createAirFreshenerUsesElement(); // UI for air freshener
        this.placedCrystals = [];
        this.lastCrystalPlacementTime = 0;
        this.activeEnergyFields = []; // To store active energy fields
        var collidableObjects = setupScene(this.scene);
        this.player = new Player(this.scene, this.camera, this.inputHandler, collidableObjects); // Pass colliders
        this.ghostManager = new GhostManager(this.scene, CONSTANTS.GHOST_COUNT);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        // Initialize Touch Controls if on a touch device (basic check)
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.touchControls = new TouchControls(this.inputHandler);
            console.log("Poltergeist Boy loaded! Use touch controls to move and capture.");
        } else {
            this.desktopControls = new DesktopButtonControls(this.inputHandler, this.renderDiv);
            console.log("Poltergeist Boy loaded! Use WASD/Arrows to move, E to capture ghosts. Clickable buttons also available.");
        }
    }
    _create_class(Game, [
        {
            key: "onWindowResize",
            value: function onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        },
        {
            key: "start",
            value: function start() {
                this.animate();
            }
        },
        {
            key: "animate",
            value: function animate() {
                requestAnimationFrame(this.animate.bind(this));
                if (this.gameOver) {
                    // Optionally, could render one last time or keep rendering the static scene
                    // For simplicity, just stop the game loop logic here
                    return;
                }
                var deltaTime = this.clock.getDelta();
                this.player.update(deltaTime);
                // Only update ghosts if the game isn't over
                if (!this.gameOver) {
                    this.ghostManager.update(deltaTime, this.player.getPosition(), this.activeEnergyFields); // Pass active fields
                }
                this.checkCaptures();
                updateActiveParticles(deltaTime); // Update particles each frame
                updateSpeechBubbles(); // Update speech bubble positions
                this.placedCrystals.forEach(function(crystal) {
                    return crystal.update(deltaTime);
                });
                this.handleCrystalPlacement();
                this.handleEquipmentActions(); // Renamed to be more generic
                this.updateEnergyFields(deltaTime); // Update active energy fields
                this.updateAirFreshenerUI(); // Update the UI for air freshener uses
                this.renderer.render(this.scene, this.camera);
            }
        },
        {
            key: "checkCaptures",
            value: function checkCaptures() {
                var _this = this;
                if (!this.inputHandler.isActionPressed()) {
                    return;
                }
                var playerPos = this.player.getPosition();
                var captureRadiusSq = CONSTANTS.CAPTURE_RADIUS * CONSTANTS.CAPTURE_RADIUS;
                this.ghostManager.ghosts.forEach(function(ghost) {
                    if (!ghost.isCaptured && ghost.mesh.position.distanceToSquared(playerPos) < captureRadiusSq) {
                        var captured = ghost.capture();
                        if (captured) {
                            _this.ghostsCaptured++;
                            _this.updateScoreDisplay(); // Update UI
                            console.log("Ghost captured! Total: ".concat(_this.ghostsCaptured));
                            // Get the trash can's world position for the particle target
                            var trashCanWorldPosition = new THREE.Vector3();
                            _this.player.trashCan.getWorldPosition(trashCanWorldPosition); // Calculate world position
                            // Trigger particle effect from ghost towards trash can
                            var particleUpdater = createCaptureParticles(_this.scene, ghost.mesh.position.clone(), trashCanWorldPosition);
                            activeParticleAnimations.push(particleUpdater);
                            _this.player.triggerCapturePulse(); // Trigger the trash can pulse
                            // Show ghost phrase
                            showGhostPhrase(_this.scene, _this.camera, _this.renderer, ghost.mesh);
                            // Simple capture effect: quick scale down
                            var tween = new THREE.Vector3(0.1, 0.1, 0.1);
                            var currentScale = ghost.mesh.scale.clone();
                            var time = 0;
                            var duration = 0.2; // seconds
                            var scaleDownInterval = setInterval(function() {
                                time += 1 / 60; // Assuming 60fps
                                var t = Math.min(time / duration, 1);
                                ghost.mesh.scale.lerpVectors(currentScale, tween, t);
                                if (t >= 1) {
                                    clearInterval(scaleDownInterval);
                                    ghost.removeFromScene();
                                    // Check for win condition AFTER removing the ghost
                                    _this.checkForWin();
                                }
                            }, 1000 / 60); // End setInterval arguments
                        }
                    }
                });
                // Reset action press immediately after checking to avoid multiple captures per press
                this.inputHandler.resetAction();
            }
        },
        {
            key: "handleCrystalPlacement",
            value: function handleCrystalPlacement() {
                var currentTime = this.clock.getElapsedTime();
                if (this.inputHandler.isPlaceCrystalPressed() && this.placedCrystals.length < CONSTANTS.MAX_CRYSTALS && currentTime - this.lastCrystalPlacementTime > CONSTANTS.CRYSTAL_PLACEMENT_COOLDOWN) {
                    var playerPos = this.player.getPosition();
                    // Place crystal slightly in front of the player, or at player's feet
                    var forwardVector = new THREE.Vector3(0, 0, -1);
                    forwardVector.applyQuaternion(this.player.mesh.quaternion); // Get player's forward direction
                    var placementPosition = playerPos.clone().add(forwardVector.multiplyScalar(0.5)); // Place 0.5 units in front
                    placementPosition.y = 0; // Ensure it's on the ground
                    var newCrystal = new Crystal(this.scene, placementPosition);
                    this.placedCrystals.push(newCrystal);
                    this.lastCrystalPlacementTime = currentTime;
                    console.log("Crystal placed. Total: ".concat(this.placedCrystals.length));
                }
                // Reset press state even if not placed, to require a fresh press
                if (this.inputHandler.isPlaceCrystalPressed()) {
                    this.inputHandler.resetPlaceCrystal();
                }
            }
        },
        {
            key: "createScoreElement",
            value: function createScoreElement() {
                var scoreDiv = document.createElement('div');
                scoreDiv.id = 'score-display';
                scoreDiv.style.position = 'fixed';
                scoreDiv.style.top = '10px';
                scoreDiv.style.left = '10px';
                scoreDiv.style.padding = '8px 12px';
                scoreDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                scoreDiv.style.color = 'white';
                scoreDiv.style.fontFamily = 'Arial, sans-serif';
                scoreDiv.style.fontSize = '18px';
                scoreDiv.style.borderRadius = '4px';
                scoreDiv.style.zIndex = '100'; // Ensure it's above canvas and controls
                scoreDiv.innerText = "Ghosts: 0";
                this.renderDiv.appendChild(scoreDiv); // Add to the same container as the canvas
                return scoreDiv;
            }
        },
        {
            key: "updateScoreDisplay",
            value: function updateScoreDisplay() {
                if (this.scoreElement) {
                    this.scoreElement.innerText = "Ghosts: ".concat(this.ghostsCaptured);
                }
            }
        },
        {
            key: "createAirFreshenerUsesElement",
            value: function createAirFreshenerUsesElement() {
                var usesDiv = document.createElement('div');
                usesDiv.id = 'air-freshener-uses-display';
                usesDiv.style.position = 'fixed';
                usesDiv.style.bottom = '10px'; // Position at the bottom
                usesDiv.style.left = '10px'; // Position next to score or adjust as needed
                usesDiv.style.padding = '8px 12px';
                usesDiv.style.backgroundColor = 'rgba(0, 100, 150, 0.7)'; // Bluish background
                usesDiv.style.color = 'white';
                usesDiv.style.fontFamily = 'Arial, sans-serif';
                usesDiv.style.fontSize = '16px';
                usesDiv.style.borderRadius = '4px';
                usesDiv.style.zIndex = '100';
                usesDiv.style.visibility = 'hidden'; // Start hidden
                usesDiv.innerText = "Freshener: ".concat(CONSTANTS.AIR_FRESHENER_USES);
                this.renderDiv.appendChild(usesDiv);
                return usesDiv;
            }
        },
        {
            key: "updateAirFreshenerUI",
            value: function updateAirFreshenerUI() {
                if (this.player.equippedItem === CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER) {
                    this.airFreshenerUsesElement.innerText = "Freshener: ".concat(this.player.airFreshener.usesLeft);
                    this.airFreshenerUsesElement.style.visibility = 'visible';
                } else {
                    this.airFreshenerUsesElement.style.visibility = 'hidden';
                }
            }
        },
        {
            key: "checkForWin",
            value: function checkForWin() {
                if (!this.gameOver && this.ghostsCaptured >= this.totalGhosts) {
                    this.gameOver = true;
                    console.log("All ghosts captured! You Win!");
                    this.displayWinMessage();
                // Could add more effects here, like stopping player input, playing sounds etc.
                }
            }
        },
        {
            key: "displayWinMessage",
            value: function displayWinMessage() {
                if (this.winMessageElement) return; // Don't create multiple messages
                this.winMessageElement = document.createElement('div');
                this.winMessageElement.id = 'win-message';
                this.winMessageElement.style.position = 'fixed';
                this.winMessageElement.style.top = '50%';
                this.winMessageElement.style.left = '50%';
                this.winMessageElement.style.transform = 'translate(-50%, -50%)';
                this.winMessageElement.style.padding = '20px 40px';
                this.winMessageElement.style.backgroundColor = 'rgba(40, 180, 40, 0.85)'; // Green background
                this.winMessageElement.style.color = 'white';
                this.winMessageElement.style.fontFamily = "'Arial Black', Gadget, sans-serif"; // Bolder font
                this.winMessageElement.style.fontSize = '36px';
                this.winMessageElement.style.fontWeight = 'bold';
                this.winMessageElement.style.textAlign = 'center';
                this.winMessageElement.style.borderRadius = '10px';
                this.winMessageElement.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
                this.winMessageElement.style.zIndex = '200'; // Ensure it's above everything else
                this.winMessageElement.innerText = "YOU WIN!\nAll ".concat(this.totalGhosts, " ghosts captured!");
                this.renderDiv.appendChild(this.winMessageElement); // Add to the main container
            }
        },
        {
            key: "handleEquipmentActions",
            value: function handleEquipmentActions() {
                var deploymentAction = this.player.getAndClearPendingDeploymentAction();
                if (deploymentAction) {
                    console.log("Game: Received equipment action:", deploymentAction);
                    if (deploymentAction.type === CONSTANTS.EQUIPMENT_TYPES.SCEPTER_FIELD) {
                        var field = new EnergyField(this.scene, deploymentAction.position, deploymentAction.chargeLevel);
                        this.activeEnergyFields.push(field);
                        console.log("Game: EnergyField created and added.");
                    } else if (deploymentAction.type === CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER) {
                        console.log("Game: Air Freshener action received.");
                        // Add particle effect for spray
                        var sprayUpdater = createAirFreshenerSpray(this.scene, deploymentAction.position, deploymentAction.direction, {
                        });
                        activeParticleAnimations.push(sprayUpdater);
                        this.ghostManager.ghosts.forEach(function(ghost) {
                            if (ghost.isCaptured || !ghost.isActive) return;
                            var ghostPos = ghost.mesh.position;
                            var sprayOrigin = deploymentAction.position;
                            var sprayDirection = deploymentAction.direction.normalize(); // Ensure it's normalized
                            var vectorToGhost = new THREE.Vector3().subVectors(ghostPos, sprayOrigin);
                            var distanceToGhostSq = vectorToGhost.lengthSq();
                            if (distanceToGhostSq < deploymentAction.range * deploymentAction.range) {
                                // Check if ghost is roughly in front of the spray
                                vectorToGhost.normalize();
                                var dotProduct = sprayDirection.dot(vectorToGhost);
                                // Adjust cone of effect (e.g., > 0.7 for roughly 45-degree cone)
                                if (dotProduct > 0.6) {
                                    // Apply a nudge force away from the spray origin or along the spray direction
                                    var nudgeForceDirection = vectorToGhost.clone(); // Push away from origin
                                    // Or: const nudgeForceDirection = sprayDirection.clone(); // Push along spray
                                    ghost.applyNudge(nudgeForceDirection, deploymentAction.strength);
                                }
                            }
                        });
                    } else if (deploymentAction.type === CONSTANTS.EQUIPMENT_ACTIONS.CRYSTAL_WAND_ACTIVATE) {
                        console.log("Game: Crystal Wand Activated.", deploymentAction.position, deploymentAction.direction);
                    // TODO: Implement wand activation effects (e.g., beam, ghost interaction)
                    } else if (deploymentAction.type === CONSTANTS.EQUIPMENT_ACTIONS.CRYSTAL_WAND_DEACTIVATE) {
                        console.log("Game: Crystal Wand Deactivated.");
                    // TODO: Implement wand deactivation effects (e.g., stop beam)
                    }
                }
            }
        },
        {
            key: "updateEnergyFields",
            value: function updateEnergyFields(deltaTime) {
                for(var i = this.activeEnergyFields.length - 1; i >= 0; i--){
                    var field = this.activeEnergyFields[i];
                    field.update(deltaTime);
                    if (!field.isActive) {
                        this.activeEnergyFields.splice(i, 1);
                        // Field handles its own mesh removal from scene
                        console.log("Game: Inactive EnergyField removed.");
                    }
                }
            }
        }
    ]);
    return Game;
}();
