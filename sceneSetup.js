import * as THREE from 'three';
import { CONSTANTS } from './constants.js';
export function setupScene(scene) {
    var collidableObjects = []; // Array to hold objects player can collide with
    // Lighter Fog (more like indoor dust/haze)
    scene.fog = new THREE.Fog(CONSTANTS.FOG_COLOR, 15, 50); // Start further, less dense
    scene.background = new THREE.Color(CONSTANTS.BACKGROUND_COLOR); // Use a light background
    // Lighting (Brighter, more ambient, less directional)
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter ambient light
    scene.add(ambientLight);
    // Use PointLights for a warmer indoor feel instead of DirectionalLight
    var pointLight1 = new THREE.PointLight(0xffddaa, 0.7, 50);
    pointLight1.position.set(8, 10, 5);
    pointLight1.castShadow = true; // Allow one light to cast shadows
    pointLight1.shadow.mapSize.width = 512; // Lower resolution for performance
    pointLight1.shadow.mapSize.height = 512;
    pointLight1.shadow.camera.near = 0.5;
    pointLight1.shadow.camera.far = 30;
    scene.add(pointLight1);
    var pointLight2 = new THREE.PointLight(0xaaddff, 0.4, 40);
    pointLight2.position.set(-10, 8, -8);
    scene.add(pointLight2); // Add a cooler fill light without shadow
    // Ground plane (Indoor floor feel)
    var groundGeometry = new THREE.PlaneGeometry(60, 60); // Smaller area for indoors
    var groundMaterial = new THREE.MeshStandardMaterial({
        color: CONSTANTS.GROUND_COLOR,
        roughness: 0.7,
        metalness: 0.1
    });
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true; // Floor receives shadows
    scene.add(ground);
    // Simple obstacles (Furniture-like shapes)
    var boxGeometry = new THREE.BoxGeometry(1.5, 1, 2); // More like a small table/ottoman
    var boxMaterial = new THREE.MeshStandardMaterial({
        color: CONSTANTS.OBSTACLE_COLOR,
        roughness: 0.6
    });
    for(var i = 0; i < 8; i++){
        var furniture = new THREE.Mesh(boxGeometry, boxMaterial);
        furniture.position.set((Math.random() - 0.5) * 30, 0.5, (Math.random() - 0.5) * 30);
        furniture.rotation.y = Math.random() * Math.PI / 2; // Align more grid-like
        furniture.castShadow = true;
        furniture.receiveShadow = true;
        scene.add(furniture);
        collidableObjects.push(furniture); // Add furniture to collidable list
    }
    // Add simple walls
    var wallHeight = 5;
    var wallThickness = 0.5;
    var wallLength = 60;
    var wallMaterial = new THREE.MeshStandardMaterial({
        color: CONSTANTS.WALL_COLOR,
        side: THREE.DoubleSide
    });
    var wallN = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
    wallN.position.set(0, wallHeight / 2, -wallLength / 2);
    wallN.receiveShadow = true;
    scene.add(wallN);
    collidableObjects.push(wallN);
    var wallS = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), wallMaterial);
    wallS.position.set(0, wallHeight / 2, wallLength / 2);
    wallS.receiveShadow = true;
    scene.add(wallS);
    collidableObjects.push(wallS);
    var wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
    wallE.position.set(wallLength / 2, wallHeight / 2, 0);
    wallE.receiveShadow = true;
    scene.add(wallE);
    collidableObjects.push(wallE);
    var wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), wallMaterial);
    wallW.position.set(-wallLength / 2, wallHeight / 2, 0);
    wallW.receiveShadow = true;
    scene.add(wallW);
    collidableObjects.push(wallW);
    return collidableObjects; // Return the list
}
