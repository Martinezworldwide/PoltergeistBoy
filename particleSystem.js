import * as THREE from 'three';
// Simple particle system for capture effect
// Simple particle system for capture effect
export function createCaptureParticles(scene, startPosition, targetPosition) {
    var particleCount = 50;
    var particlesGeometry = new THREE.BufferGeometry();
    var positions = [];
    var startOffsets = []; // Store initial random offset from the startPosition
    var material = new THREE.PointsMaterial({
        color: 0xaaaaff,
        size: 0.15,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });
    for(var i = 0; i < particleCount; i++){
        // Start particles slightly offset around the ghost's position
        var offsetRadius = 0.6;
        var offsetX = (Math.random() - 0.5) * offsetRadius * 2;
        var offsetY = (Math.random() - 0.5) * offsetRadius * 2;
        var offsetZ = (Math.random() - 0.5) * offsetRadius * 2;
        positions.push(startPosition.x + offsetX, startPosition.y + offsetY, startPosition.z + offsetZ);
        startOffsets.push(new THREE.Vector3(offsetX, offsetY, offsetZ)); // Store the offset
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    var particleSystem = new THREE.Points(particlesGeometry, material);
    scene.add(particleSystem);
    // Animation properties
    var lifetime = 0.5; // Make it a bit quicker for suction effect
    var time = 0;
    // No need for initialVelocities, we calculate based on lerp
    function updateParticles(deltaTime) {
        time += deltaTime;
        var progress = Math.min(time / lifetime, 1.0); // Normalized time [0, 1]
        if (progress >= 1.0) {
            scene.remove(particleSystem);
            particlesGeometry.dispose();
            material.dispose();
            return false; // Indicate animation is finished
        }
        var currentPositions = particlesGeometry.attributes.position.array;
        // Fade out faster as particles approach the target
        material.opacity = Math.max(0, (1.0 - progress) * 0.9);
        // Optionally shrink particles as they get closer
        material.size = Math.max(0.01, (1.0 - progress) * 0.15);
        for(var i = 0; i < particleCount; i++){
            var index = i * 3;
            // Calculate the initial position for this particle
            var initialParticlePos = startPosition.clone().add(startOffsets[i]);
            // Interpolate position from initial particle pos towards the target
            var lerpedPosition = initialParticlePos.lerp(targetPosition, progress);
            currentPositions[index] = lerpedPosition.x;
            currentPositions[index + 1] = lerpedPosition.y;
            currentPositions[index + 2] = lerpedPosition.z;
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        return true; // Indicate animation is ongoing
    }
    // Return the update function to be called in the game loop
    return updateParticles;
}
// Global array to keep track of active particle animations
export var activeParticleAnimations = [];
// Function to update all active particle animations
export function updateActiveParticles(deltaTime) {
    for(var i = activeParticleAnimations.length - 1; i >= 0; i--){
        var stillAnimating = activeParticleAnimations[i](deltaTime);
        if (!stillAnimating) {
            activeParticleAnimations.splice(i, 1); // Remove finished animations
        }
    }
}
// New function for Air Freshener Spray
export function createAirFreshenerSpray(scene, origin, baseDirection) {
    var _ref = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, _ref_color = _ref.color, color = _ref_color === void 0 ? 0xADD8E6 : _ref_color, _ref_count = _ref.count, count = _ref_count === void 0 ? 40 : _ref_count, _ref_spreadAngle = _ref.spreadAngle, spreadAngle = _ref_spreadAngle === void 0 ? Math.PI / 8 : _ref_spreadAngle, _ref_speed = _ref.speed, speed = _ref_speed === void 0 ? 8 : _ref_speed, _ref_particleSize = _ref.particleSize, particleSize = _ref_particleSize === void 0 ? 0.08 : _ref_particleSize, _ref_lifetime = _ref.lifetime, lifetime = _ref_lifetime === void 0 ? 0.4 // Shorter lifetime for a quick puff
     : _ref_lifetime;
    var particlesGeometry = new THREE.BufferGeometry();
    var positions = [];
    var velocities = []; // Store initial velocities for each particle
    var material = new THREE.PointsMaterial({
        color: color,
        size: particleSize,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });
    var up = new THREE.Vector3(0, 1, 0);
    var right = new THREE.Vector3().crossVectors(baseDirection, up).normalize();
    if (right.lengthSq() === 0) {
        right.set(1, 0, 0); // Use X axis as right if baseDirection is vertical
    }
    var sprayUp = new THREE.Vector3().crossVectors(right, baseDirection).normalize();
    for(var i = 0; i < count; i++){
        positions.push(origin.x, origin.y, origin.z);
        // Generate random direction within the cone
        var u = Math.random(); // For random angle within cone
        var v = Math.random(); // For random rotation around cone axis
        var theta = Math.acos(1 - u * (1 - Math.cos(spreadAngle))); // Angle from baseDirection
        var phi = v * 2 * Math.PI; // Angle around baseDirection
        // Create a vector in local cone coordinates (Z along baseDirection)
        var particleDir = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta));
        // Rotate this local direction to align with baseDirection
        var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), baseDirection.clone().normalize());
        particleDir.applyQuaternion(quaternion);
        particleDir.normalize();
        velocities.push(particleDir.x * speed, particleDir.y * speed, particleDir.z * speed);
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    var particleSystem = new THREE.Points(particlesGeometry, material);
    scene.add(particleSystem);
    var time = 0;
    function updateParticles(deltaTime) {
        time += deltaTime;
        var progress = Math.min(time / lifetime, 1.0);
        if (progress >= 1.0) {
            scene.remove(particleSystem);
            particlesGeometry.dispose();
            material.dispose();
            return false; // Animation finished
        }
        var currentPositions = particlesGeometry.attributes.position.array;
        material.opacity = Math.max(0, (1.0 - progress) * 0.8); // Fade out
        material.size = Math.max(0.005, particleSize * (1.0 - progress * 0.5)); // Shrink slightly
        for(var i = 0; i < count; i++){
            var index = i * 3;
            currentPositions[index] += velocities[index] * deltaTime;
            currentPositions[index + 1] += velocities[index + 1] * deltaTime;
            currentPositions[index + 2] += velocities[index + 2] * deltaTime;
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        return true; // Animation ongoing
    }
    return updateParticles;
}
