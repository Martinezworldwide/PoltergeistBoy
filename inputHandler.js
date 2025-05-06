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
export var InputHandler = /*#__PURE__*/ function() {
    "use strict";
    function InputHandler() {
        _class_call_check(this, InputHandler);
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            action: false,
            placeCrystal: false,
            switchEquipment: false // 'Q' key for switching
        };
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }
    _create_class(InputHandler, [
        {
            key: "onKeyDown",
            value: function onKeyDown(event) {
                switch(event.code){
                    case 'ArrowUp':
                    case 'KeyW':
                        this.keys.forward = true;
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.keys.backward = true;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.keys.left = true;
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.keys.right = true;
                        break;
                    case 'KeyE':
                        // Only set action to true on keydown if it wasn't already pressed
                        // This prevents holding E from spamming captures
                        if (!this.keys.action) {
                            this.keys.action = true;
                        }
                        break;
                    case 'KeyF':
                        if (!this.keys.placeCrystal) {
                            this.keys.placeCrystal = true;
                        }
                        break;
                    case 'KeyQ':
                        if (!this.keys.switchEquipment) {
                            this.keys.switchEquipment = true;
                        }
                        break;
                }
            }
        },
        {
            key: "onKeyUp",
            value: function onKeyUp(event) {
                switch(event.code){
                    case 'ArrowUp':
                    case 'KeyW':
                        this.keys.forward = false;
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.keys.backward = false;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.keys.left = false;
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.keys.right = false;
                        break;
                    case 'KeyE':
                        // Action state is reset in the game loop after checking
                        // This keyup just ensures it goes false eventually if held
                        this.keys.action = false;
                        break;
                    case 'KeyF':
                        this.keys.placeCrystal = false;
                        break;
                    case 'KeyQ':
                        this.keys.switchEquipment = false; // Reset on key up
                        break;
                }
            }
        },
        {
            key: "isActionPressed",
            value: function isActionPressed() {
                // Return the current action state
                return this.keys.action;
            }
        },
        {
            key: "resetAction",
            value: function resetAction() {
                // Called by the game loop after processing the action
                this.keys.action = false;
            }
        },
        {
            key: "isPlaceCrystalPressed",
            value: function isPlaceCrystalPressed() {
                return this.keys.placeCrystal;
            }
        },
        {
            key: "resetPlaceCrystal",
            value: function resetPlaceCrystal() {
                this.keys.placeCrystal = false;
            }
        },
        {
            key: "isSwitchEquipmentPressed",
            value: function isSwitchEquipmentPressed() {
                return this.keys.switchEquipment;
            }
        },
        {
            key: "resetSwitchEquipment",
            value: function resetSwitchEquipment() {
                this.keys.switchEquipment = false;
            }
        },
        {
            // Method to allow external updates (e.g., from TouchControls)
            key: "updateKeyState",
            value: function updateKeyState(key, state) {
                if (key in this.keys) {
                    this.keys[key] = state;
                }
            }
        }
    ]);
    return InputHandler;
}();
