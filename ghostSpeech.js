import * as THREE from 'three';
var activeSpeechBubbles = [];
var GHOST_PHRASES = [
    "I'm the devil!",
    "This is witchcraft!",
    "You'll never catch me!",
    "Cursed be your vacuum!",
    "My ectoplasm!",
    "Aaaargh!",
    "I'll be back!",
    "Boo...hoo..."
];
function worldToScreen(worldVector, camera, renderer) {
    var vector = worldVector.clone();
    vector.project(camera);
    var x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    var y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    return {
        x: x,
        y: y
    };
}
export function showGhostPhrase(scene, camera, renderer, ghostMesh) {
    var phrase = GHOST_PHRASES[Math.floor(Math.random() * GHOST_PHRASES.length)];
    var speechBubble = document.createElement('div');
    speechBubble.className = 'ghost-speech-bubble';
    speechBubble.innerText = phrase;
    // Initial style
    speechBubble.style.position = 'fixed';
    speechBubble.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    speechBubble.style.color = '#333';
    speechBubble.style.padding = '5px 10px';
    speechBubble.style.borderRadius = '5px';
    speechBubble.style.fontFamily = 'Arial, sans-serif';
    speechBubble.style.fontSize = '14px';
    speechBubble.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    speechBubble.style.zIndex = '150'; // Above game, below win message
    speechBubble.style.opacity = '0'; // Start invisible
    speechBubble.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
    speechBubble.style.pointerEvents = 'none'; // Don't block interactions
    document.body.appendChild(speechBubble);
    var ghostWorldPosition = new THREE.Vector3();
    ghostMesh.getWorldPosition(ghostWorldPosition);
    ghostWorldPosition.y += ghostMesh.geometry.boundingSphere.radius * ghostMesh.scale.y + 0.5; // Position above the ghost
    var screenPos = worldToScreen(ghostWorldPosition, camera, renderer);
    speechBubble.style.left = "".concat(screenPos.x, "px");
    speechBubble.style.top = "".concat(screenPos.y, "px");
    speechBubble.style.transform = "translate(-50%, -100%) scale(0.8)"; // Initial small state
    // Animate in
    requestAnimationFrame(function() {
        speechBubble.style.opacity = '1';
        speechBubble.style.transform = "translate(-50%, -100%) scale(1)";
    });
    var duration = 2000; // ms
    var startTime = performance.now();
    var animationDetails = {
        element: speechBubble,
        ghostMesh: ghostMesh,
        startTime: startTime,
        duration: duration,
        camera: camera,
        renderer: renderer,
        initialGhostPosition: ghostMesh.position.clone(),
        offsetY: ghostMesh.geometry.boundingSphere.radius * ghostMesh.scale.y + 0.5
    };
    activeSpeechBubbles.push(animationDetails);
    // Automatically remove after duration
    setTimeout(function() {
        speechBubble.style.opacity = '0';
        speechBubble.style.transform = "translate(-50%, -100%) scale(0.8)";
        setTimeout(function() {
            if (speechBubble.parentElement) {
                speechBubble.parentElement.removeChild(speechBubble);
            }
            var index = activeSpeechBubbles.findIndex(function(item) {
                return item.element === speechBubble;
            });
            if (index > -1) {
                activeSpeechBubbles.splice(index, 1);
            }
        }, 300); // Wait for fade out transition
    }, duration);
}
export function updateSpeechBubbles() {
    activeSpeechBubbles.forEach(function(bubbleDetails) {
        if (!bubbleDetails.ghostMesh || !bubbleDetails.ghostMesh.parent) {
            // If ghost is removed, hide bubble immediately
            if (bubbleDetails.element.parentElement) {
                bubbleDetails.element.parentElement.removeChild(bubbleDetails.element);
            }
            // Remove from active list will happen in its own timeout or next full check.
            return;
        }
        var ghostWorldPosition = new THREE.Vector3();
        // Use the current ghost mesh position for continuous tracking during its capture animation
        bubbleDetails.ghostMesh.getWorldPosition(ghostWorldPosition);
        ghostWorldPosition.y += bubbleDetails.offsetY; // Use stored offset
        var screenPos = worldToScreen(ghostWorldPosition, bubbleDetails.camera, bubbleDetails.renderer);
        bubbleDetails.element.style.left = "".concat(screenPos.x, "px");
        bubbleDetails.element.style.top = "".concat(screenPos.y, "px");
    });
}
