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
import { Scepter } from './Scepter.js'; // Import the Scepter class
import { AirFreshener } from './AirFreshener.js'; // Import the AirFreshener class
import { CrystalWand } from './CrystalWand.js'; // Import the CrystalWand class
export var Player = /*#__PURE__*/ function() {
    "use strict";
    function Player(scene, camera, inputHandler, collidableObjects) {
        _class_call_check(this, Player);
        this.scene = scene;
        this.camera = camera;
        this.inputHandler = inputHandler;
        this.collidableObjects = collidableObjects; // Store colliders
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.rotationSpeed = CONSTANTS.PLAYER_ROTATION_SPEED;
        this.turnSpeed = CONSTANTS.PLAYER_TURN_SPEED; // Add a specific turn speed
        this.cameraOffset = new THREE.Vector3(0, CONSTANTS.CAMERA_HEIGHT, CONSTANTS.CAMERA_DISTANCE);
        this.moveDirection = new THREE.Vector3(); // Store move direction
        this.targetRotation = new THREE.Quaternion(); // Store target rotation
        this.currentRotation = new THREE.Quaternion(); // Store current rotation for smoothing
        // Player body (Capsule-like)
        this.playerRadius = 0.4; // Store radius for collision checks
        this.playerHeight = 1.0; // Store height
        var bodyGeometry = new THREE.CapsuleGeometry(this.playerRadius, this.playerHeight, 4, 16);
        var bodyMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.PLAYER_COLOR,
            roughness: 0.6,
            metalness: 0.3
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.position.y = this.playerHeight / 2 + this.playerRadius; // Position feet at ground level
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        this.playerBox = new THREE.Box3(); // Bounding box for the player
        this.obstacleBox = new THREE.Box3(); // Reusable box for obstacles
        // Trash Can
        var canHeight = 0.8;
        var canRadius = 0.3;
        var canGeometry = new THREE.CylinderGeometry(canRadius, canRadius * 0.8, canHeight, 16);
        var canMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.TRASHCAN_COLOR,
            metalness: 0.8,
            roughness: 0.4
        });
        this.trashCan = new THREE.Mesh(canGeometry, canMaterial);
        this.trashCan.position.set(0, 0.5, -0.4); // Positioned on the back
        this.trashCan.rotation.x = Math.PI / 12; // Slight tilt
        this.trashCan.castShadow = true;
        this.mesh.add(this.trashCan); // Attach can to player mesh
        // Garbage Bag inside (simple sphere)
        var bagRadius = canRadius * 0.7;
        var bagGeometry = new THREE.SphereGeometry(bagRadius, 8, 6);
        var bagMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.GARBAGE_BAG_COLOR,
            roughness: 0.9,
            metalness: 0.1
        });
        this.garbageBag = new THREE.Mesh(bagGeometry, bagMaterial);
        this.garbageBag.position.y = -canHeight * 0.1; // Slightly inside the can
        this.trashCan.add(this.garbageBag);
        this.velocity = new THREE.Vector3();
        // Initialize rotations
        this.currentRotation.copy(this.mesh.quaternion);
        this.targetRotation.copy(this.mesh.quaternion);
        this.equippedItem = CONSTANTS.EQUIPMENT_TYPES.VACUUM; // Start with vacuum
        this.equipmentOrder = [
            CONSTANTS.EQUIPMENT_TYPES.VACUUM,
            CONSTANTS.EQUIPMENT_TYPES.SCEPTER,
            CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER,
            CONSTANTS.EQUIPMENT_TYPES.CRYSTAL_WAND
        ];
        this.scepter = new Scepter(this.scene);
        this.mesh.add(this.scepter.mesh);
        this.scepter.setVisible(false);
        this.airFreshener = new AirFreshener();
        this.mesh.add(this.airFreshener.mesh);
        this.airFreshener.setVisible(false);
        this.crystalWand = new CrystalWand(this.scene); // Initialize CrystalWand
        this.mesh.add(this.crystalWand.mesh); // Add its mesh to player
        this.crystalWand.setVisible(false); // Start hidden
        this.pendingDeploymentAction = null; // For scepter/air freshener/wand actions
        this.isCapturingPulseActive = false;
        this.capturePulseTimer = 0;
        this.capturePulseDuration = 0.4; // seconds for the pulse
        this.originalTrashCanScale = new THREE.Vector3(1, 1, 1); // Store original scale
        // Ensure initial visibility matches equipped item
        this.updateEquipmentVisibility();
    }
    _create_class(Player, [
        {
            key: "update",
            value: function update(deltaTime) {
                // --- Handle Equipment Switching ---
                if (this.inputHandler.isSwitchEquipmentPressed()) {
                    var currentIndex = this.equipmentOrder.indexOf(this.equippedItem);
                    var nextIndex = (currentIndex + 1) % this.equipmentOrder.length;
                    var newEquippedItem = this.equipmentOrder[nextIndex];
                    // Cancel scepter charge if switching away from it while charging
                    if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.SCEPTER && this.scepter.isCharging && newEquippedItem !== CONSTANTS.EQUIPMENT_TYPES.SCEPTER) {
                        this.scepter.stopChargingAndDeploy(); // Effectively cancels charge
                    }
                    this.equippedItem = newEquippedItem;
                    this.updateEquipmentVisibility();
                    this.inputHandler.resetSwitchEquipment(); // Consume the input
                    console.log("Switched equipment to:", this.equippedItem);
                }
                // --- Update Active Equipment ---
                var isActionKeyHeld = this.inputHandler.keys.action; // Raw key state for holding
                if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.SCEPTER) {
                    if (isActionKeyHeld && !this.scepter.isCharging) {
                        this.scepter.startCharging();
                    }
                    this.scepter.update(deltaTime, isActionKeyHeld);
                    if (!isActionKeyHeld && this.scepter.isCharging) {
                        var deploymentDetails = this.scepter.stopChargingAndDeploy();
                        if (deploymentDetails) {
                            this.pendingDeploymentAction = deploymentDetails;
                            console.log("Player: Pending scepter deployment action set.", deploymentDetails);
                        }
                    }
                } else if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER) {
                    this.airFreshener.update(deltaTime, isActionKeyHeld); // Pass action state
                    if (this.inputHandler.isActionPressed()) {
                        // For Air Freshener, we might want a tap action rather than hold.
                        // Or hold to aim, release to spray. For now, tap.
                        var actionDetails = this.airFreshener.use();
                        if (actionDetails) {
                            this.pendingDeploymentAction = actionDetails; // If it returns something
                            console.log("Player: Pending air freshener action set.", actionDetails);
                        }
                        this.inputHandler.resetAction(); // Consume the action press for tap-like behavior
                    }
                } else if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.CRYSTAL_WAND) {
                    this.crystalWand.update(deltaTime, isActionKeyHeld); // Pass action state
                    if (this.inputHandler.isActionPressed()) {
                        var actionDetails1 = this.crystalWand.use();
                        if (actionDetails1) {
                            this.pendingDeploymentAction = actionDetails1;
                            console.log("Player: Pending crystal wand action set.", actionDetails1);
                        }
                        this.inputHandler.resetAction();
                    }
                }
                // Vacuum action (capturing) is handled in Game.js's checkCaptures,
                // which checks if VACUUM is equipped.
                var isMoving = false;
                this.moveDirection.set(0, 0, 0);
                // --- Determine Input Direction ---
                if (this.inputHandler.keys.forward) {
                    this.moveDirection.z -= 1;
                    isMoving = true;
                }
                if (this.inputHandler.keys.backward) {
                    this.moveDirection.z += 1;
                    isMoving = true;
                }
                if (this.inputHandler.keys.left) {
                    this.moveDirection.x -= 1;
                    isMoving = true;
                }
                if (this.inputHandler.keys.right) {
                    this.moveDirection.x += 1;
                    isMoving = true;
                }
                // Prevent movement if scepter is charging (optional, can be a design choice)
                // if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.SCEPTER && this.scepter.isCharging) {
                //     isMoving = false;
                // }
                if (isMoving) {
                    this.moveDirection.normalize();
                    // --- Calculate Movement Vector Relative to Camera ---
                    // Get camera forward direction (ignoring y-axis)
                    var cameraDirection = new THREE.Vector3();
                    this.camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();
                    // Get camera right direction
                    var cameraRight = new THREE.Vector3();
                    cameraRight.crossVectors(this.camera.up, cameraDirection).normalize();
                    // Combine directions based on input
                    var moveVector = new THREE.Vector3();
                    moveVector.addScaledVector(cameraDirection, -this.moveDirection.z); // Forward/Backward
                    moveVector.addScaledVector(cameraRight, -this.moveDirection.x); // Left/Right
                    moveVector.normalize();
                    // --- Calculate Target Rotation ---
                    // Make player face the direction of movement
                    this.targetRotation.setFromUnitVectors(new THREE.Vector3(0, 0, -1), moveVector);
                    // --- Apply Movement with Collision Check ---
                    var intendedMove = moveVector.multiplyScalar(this.speed * deltaTime);
                    this.checkAndApplyMovement(intendedMove);
                }
                // --- Smoothly Rotate Player ---
                this.currentRotation.slerp(this.targetRotation, this.turnSpeed * deltaTime);
                this.mesh.quaternion.copy(this.currentRotation);
                // --- Update Camera ---
                this.updateCamera();
                // --- Update Capture Pulse ---
                if (this.isCapturingPulseActive) {
                    this.capturePulseTimer += deltaTime;
                    var progress = this.capturePulseTimer / this.capturePulseDuration;
                    if (progress >= 1) {
                        this.isCapturingPulseActive = false;
                        this.trashCan.scale.copy(this.originalTrashCanScale);
                    } else {
                        // Simple pulse: expand then contract
                        var pulseScale = 1 + 0.3 * Math.sin(progress * Math.PI); // Max scale 1.3
                        this.trashCan.scale.set(this.originalTrashCanScale.x * pulseScale, this.originalTrashCanScale.y * pulseScale, this.originalTrashCanScale.z * pulseScale);
                    }
                }
            }
        },
        {
            key: "updateCamera",
            value: function updateCamera() {
                // Calculate desired camera position based on player position and *current* rotation
                var desiredPosition = this.mesh.position.clone().add(this.cameraOffset.clone().applyQuaternion(this.currentRotation) // Use smoothed rotation
                );
                // Smoothly interpolate camera position
                this.camera.position.lerp(desiredPosition, CONSTANTS.CAMERA_LERP_FACTOR);
                // Make camera look at the player's head position
                var lookAtPosition = this.mesh.position.clone();
                lookAtPosition.y += 1.0; // Look slightly above the base
                this.camera.lookAt(lookAtPosition);
            }
        },
        {
            key: "getPosition",
            value: function getPosition() {
                // Return the player's exact mesh position
                return this.mesh.position.clone();
            }
        },
        {
            key: "checkAndApplyMovement",
            value: function checkAndApplyMovement(moveVector) {
                var currentPosition = this.mesh.position.clone();
                var finalMove = moveVector.clone();
                // --- Check Collision with Full Movement ---
                if (this.checkCollision(currentPosition.clone().add(finalMove))) {
                    // Collision detected! Try moving along X and Z separately.
                    // 1. Try moving only along X
                    var moveX = new THREE.Vector3(finalMove.x, 0, 0);
                    if (!this.checkCollision(currentPosition.clone().add(moveX))) {
                        // X movement is clear, allow it but zero out X for Z check
                        finalMove.x = moveX.x;
                        finalMove.z = 0; // Prevent Z move if X worked
                    } else {
                        // X movement also blocked
                        finalMove.x = 0;
                    }
                    // 2. Try moving only along Z (if X wasn't fully blocked)
                    var moveZ = new THREE.Vector3(0, 0, moveVector.z); // Use original Z move attempt
                    if (finalMove.x === 0 && !this.checkCollision(currentPosition.clone().add(moveZ))) {
                        // Z movement is clear (and X was blocked)
                        finalMove.z = moveZ.z;
                    } else if (finalMove.x !== 0) {
                        // If X movement was allowed, don't allow Z
                        finalMove.z = 0;
                    } else {
                        // Z movement also blocked
                        finalMove.z = 0;
                    }
                }
                // Apply the calculated (potentially adjusted) final move
                this.mesh.position.add(finalMove);
            }
        },
        {
            // Helper function to check collision at a given position
            key: "checkCollision",
            value: function checkCollision(potentialPosition) {
                // Update player bounding box based on the potential position
                var playerBoxCenter = potentialPosition.clone();
                playerBoxCenter.y = this.playerRadius + this.playerHeight / 2;
                var playerBoxHalfHeight = this.playerHeight / 2 + this.playerRadius;
                this.playerBox.setFromCenterAndSize(playerBoxCenter, new THREE.Vector3(this.playerRadius * 2, playerBoxHalfHeight * 2, this.playerRadius * 2));
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = this.collidableObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var obstacle = _step.value;
                        // It's slightly inefficient to update static obstacle boxes every time,
                        // but safe. Could optimize by pre-calculating static boxes.
                        this.obstacleBox.setFromObject(obstacle);
                        if (this.playerBox.intersectsBox(this.obstacleBox)) {
                            return true; // Collision detected
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
                return false; // No collision
            }
        },
        {
            key: "updateEquipmentVisibility",
            value: function updateEquipmentVisibility() {
                this.trashCan.visible = this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.VACUUM;
                this.scepter.setVisible(this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.SCEPTER);
                this.airFreshener.setVisible(this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.AIR_FRESHENER);
                this.crystalWand.setVisible(this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.CRYSTAL_WAND);
            }
        },
        {
            key: "getAndClearPendingDeploymentAction",
            value: function getAndClearPendingDeploymentAction() {
                var action = this.pendingDeploymentAction;
                this.pendingDeploymentAction = null;
                return action;
            }
        },
        {
            key: "triggerCapturePulse",
            value: function triggerCapturePulse() {
                if (this.equippedItem === CONSTANTS.EQUIPMENT_TYPES.VACUUM) {
                    this.isCapturingPulseActive = true;
                    this.capturePulseTimer = 0;
                    // Store current scale as original if not already (though it should be 1,1,1 initially)
                    if (!this.originalTrashCanScale.equals(this.trashCan.scale) && !this.isCapturingPulseActive) {
                        this.originalTrashCanScale.copy(this.trashCan.scale);
                    }
                }
            }
        }
    ]);
    return Player;
}();
