import * as THREE from 'three';
import { Game } from './game.js';
// Get the render target
var renderDiv = document.getElementById('renderDiv');
// Initialize the game with the render target
var game = new Game(renderDiv);
// Start the game
game.start();
