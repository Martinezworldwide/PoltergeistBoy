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
import { CONSTANTS } from './constants.js'; // May not be needed directly, but good practice
export var DesktopButtonControls = /*#__PURE__*/ function() {
    "use strict";
    function DesktopButtonControls(inputHandler, renderDiv) {
        _class_call_check(this, DesktopButtonControls);
        this.inputHandler = inputHandler;
        this.renderDiv = renderDiv;
        this.controlsContainer = null;
        this.captureButton = null;
        this.crystalButton = null;
        this.switchEqButton = null;
        this.createControls();
        this.addEventListeners();
        this.applyStyles();
    }
    _create_class(DesktopButtonControls, [
        {
            key: "createControls",
            value: function createControls() {
                this.controlsContainer = document.createElement('div');
                this.controlsContainer.className = 'desktop-controls-container';
                // Capture Button (E)
                this.captureButton = document.createElement('button');
                this.captureButton.id = 'desktop-capture-button';
                this.captureButton.textContent = 'Capture (E)';
                this.controlsContainer.appendChild(this.captureButton);
                // Crystal Button (F)
                this.crystalButton = document.createElement('button');
                this.crystalButton.id = 'desktop-crystal-button';
                this.crystalButton.textContent = 'Crystal (F)';
                this.controlsContainer.appendChild(this.crystalButton);
                // Switch Equipment Button (Q)
                // Assuming 'switchEquipment' key exists in inputHandler.keys from previous scepter implementation
                if (typeof this.inputHandler.keys.switchEquipment !== 'undefined') {
                    this.switchEqButton = document.createElement('button');
                    this.switchEqButton.id = 'desktop-switch-button';
                    this.switchEqButton.textContent = 'Switch (Q)';
                    this.controlsContainer.appendChild(this.switchEqButton);
                }
                this.renderDiv.appendChild(this.controlsContainer);
            }
        },
        {
            key: "addEventListeners",
            value: function addEventListeners() {
                var _this = this;
                // Capture Button (E) - mousedown/mouseup to support hold actions like scepter charge
                this.captureButton.addEventListener('mousedown', function() {
                    _this.inputHandler.updateKeyState('action', true);
                });
                this.captureButton.addEventListener('mouseup', function() {
                    _this.inputHandler.updateKeyState('action', false);
                // Game.js's checkCaptures loop calls inputHandler.resetAction() for tap
                });
                // If mouse leaves button while pressed, treat as mouseup
                this.captureButton.addEventListener('mouseleave', function() {
                    if (_this.inputHandler.keys.action) {
                        _this.inputHandler.updateKeyState('action', false);
                    }
                });
                // Crystal Button (F) - click for tap action
                this.crystalButton.addEventListener('click', function() {
                    _this.inputHandler.updateKeyState('placeCrystal', true);
                // Game.js's handleCrystalPlacement calls inputHandler.resetPlaceCrystal()
                });
                // Switch Equipment Button (Q) - click for tap action
                if (this.switchEqButton) {
                    this.switchEqButton.addEventListener('click', function() {
                        _this.inputHandler.updateKeyState('switchEquipment', true);
                    // Player.js's update calls inputHandler.resetSwitchEquipment()
                    });
                }
            }
        },
        {
            key: "applyStyles",
            value: function applyStyles() {
                var style = document.createElement('style');
                style.textContent = "\n            .desktop-controls-container {\n                position: absolute; /* Relative to renderDiv */\n                bottom: 10px;\n                right: 10px;\n                display: flex;\n                flex-direction: column;\n                align-items: flex-end; /* Align buttons to the right if container is wider */\n                gap: 8px;\n                z-index: 10; /* Consistent with touch controls z-index */\n            }\n            .desktop-controls-container button {\n                padding: 10px 15px;\n                background-color: rgba(50, 50, 50, 0.7);\n                color: white;\n                border: 1px solid rgba(200, 200, 200, 0.5);\n                border-radius: 5px;\n                cursor: pointer;\n                font-family: 'Arial', sans-serif;\n                font-size: 14px;\n                text-align: center;\n                min-width: 120px; /* Ensure buttons have a decent width */\n                transition: background-color 0.2s ease;\n            }\n            .desktop-controls-container button:hover {\n                background-color: rgba(80, 80, 80, 0.8);\n            }\n            .desktop-controls-container button:active {\n                background-color: rgba(30, 30, 30, 0.9);\n            }\n        ";
                document.head.appendChild(style);
            }
        }
    ]);
    return DesktopButtonControls;
}();
