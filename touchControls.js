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
export var TouchControls = /*#__PURE__*/ function() {
    "use strict";
    function TouchControls(inputHandler) {
        _class_call_check(this, TouchControls);
        this.inputHandler = inputHandler;
        this.joystickBase = null;
        this.joystickStick = null;
        this.actionButton = null;
        this.crystalButton = null;
        this.switchEqButton = null; // Add switch equipment button property
        this.createControls();
        this.addEventListeners();
        this.applyStyles();
    }
    _create_class(TouchControls, [
        {
            key: "createControls",
            value: function createControls() {
                var container = document.body; // Attach directly to body for simplicity
                // Joystick Area (Left Side)
                this.joystickBase = document.createElement('div');
                this.joystickBase.id = 'joystick-base';
                container.appendChild(this.joystickBase);
                this.joystickStick = document.createElement('div');
                this.joystickStick.id = 'joystick-stick';
                this.joystickBase.appendChild(this.joystickStick); // Stick is inside the base
                // Action Button (Right Side)
                this.actionButton = document.createElement('div');
                this.actionButton.id = 'action-button';
                this.actionButton.innerText = 'E'; // Label it like the key
                container.appendChild(this.actionButton);
                // Crystal Button (Right Side, below action)
                this.crystalButton = document.createElement('div');
                this.crystalButton.id = 'crystal-button';
                this.crystalButton.innerText = 'F'; // Label for crystal
                container.appendChild(this.crystalButton);
                // Switch Equipment Button (Right Side, below crystal)
                this.switchEqButton = document.createElement('div');
                this.switchEqButton.id = 'switch-eq-button';
                this.switchEqButton.innerText = 'Q'; // Label for switch
                container.appendChild(this.switchEqButton);
            }
        },
        {
            key: "addEventListeners",
            value: function addEventListeners() {
                var _this = this;
                // Action Button Listeners
                this.actionButton.addEventListener('touchstart', function(e) {
                    e.preventDefault(); // Prevent screen scrolling/zooming
                    _this.inputHandler.updateKeyState('action', true);
                    _this.actionButton.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // Feedback
                }, {
                    passive: false
                });
                this.actionButton.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    // Action state is reset in the game loop after checking, similar to keyup
                    // We keep it pressed until the game loop resets it.
                    // This allows tap-to-capture behaviour.
                    // If hold-to-capture is desired later, uncomment the next line:
                    // this.inputHandler.updateKeyState('action', false);
                    _this.actionButton.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                }, {
                    passive: false
                });
                // Crystal Button Listeners
                this.crystalButton.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    _this.inputHandler.updateKeyState('placeCrystal', true);
                    _this.crystalButton.style.backgroundColor = 'rgba(100, 220, 255, 0.7)'; // Crystal color feedback
                }, {
                    passive: false
                });
                this.crystalButton.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    // Reset in game loop like other actions
                    // this.inputHandler.updateKeyState('placeCrystal', false);
                    _this.crystalButton.style.backgroundColor = 'rgba(100, 220, 255, 0.4)';
                }, {
                    passive: false
                });
                // Switch Equipment Button Listeners
                this.switchEqButton.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    _this.inputHandler.updateKeyState('switchEquipment', true);
                    _this.switchEqButton.style.backgroundColor = 'rgba(200, 200, 200, 0.7)'; // Neutral feedback
                }, {
                    passive: false
                });
                this.switchEqButton.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    // Reset in game/player logic to ensure it's processed
                    // this.inputHandler.updateKeyState('switchEquipment', false); 
                    _this.switchEqButton.style.backgroundColor = 'rgba(200, 200, 200, 0.4)';
                }, {
                    passive: false
                });
                // Joystick Listeners
                this.joystickActive = false;
                this.joystickOrigin = {
                    x: 0,
                    y: 0
                };
                this.joystickMaxDistance = 40; // pixels
                this.joystickBase.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    _this.joystickActive = true;
                    var touch = e.changedTouches[0];
                    var rect = _this.joystickBase.getBoundingClientRect();
                    _this.joystickOrigin = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };
                    // Center stick initially on touch start within the base
                    _this.joystickStick.style.transform = "translate(-50%, -50%)";
                    _this.handleJoystickMove(touch.clientX, touch.clientY); // Process initial touch
                }, {
                    passive: false
                });
                this.joystickBase.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                    if (!_this.joystickActive) return;
                    var touch = e.changedTouches[0];
                    _this.handleJoystickMove(touch.clientX, touch.clientY);
                }, {
                    passive: false
                });
                var endJoystick = function(e) {
                    // Use changedTouches for touchend/touchcancel
                    // Check if the touch ending is the one that started the joystick interaction
                    var relevantTouchEnded = false;
                    for(var i = 0; i < e.changedTouches.length; i++){
                        var touch = e.changedTouches[i];
                        var rect = _this.joystickBase.getBoundingClientRect();
                        // Check if the touch ended within the joystick base area
                        if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                            relevantTouchEnded = true;
                            break;
                        }
                    }
                    // Only reset if the touch ending was related to the joystick
                    // or if it's a general touchcancel event
                    if (relevantTouchEnded || e.type === 'touchcancel') {
                        e.preventDefault();
                        _this.joystickActive = false;
                        _this.resetJoystickKeys();
                        _this.joystickStick.style.transform = 'translate(-50%, -50%)'; // Reset stick visually
                    }
                };
                this.joystickBase.addEventListener('touchend', endJoystick, {
                    passive: false
                });
                this.joystickBase.addEventListener('touchcancel', endJoystick, {
                    passive: false
                }); // Handle interruptions
            }
        },
        {
            key: "handleJoystickMove",
            value: function handleJoystickMove(touchX, touchY) {
                var deltaX = touchX - this.joystickOrigin.x;
                var deltaY = touchY - this.joystickOrigin.y;
                var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                var angle = Math.atan2(deltaY, deltaX);
                var clampedDistance = Math.min(distance, this.joystickMaxDistance);
                var stickX = Math.cos(angle) * clampedDistance;
                var stickY = Math.sin(angle) * clampedDistance;
                // Update visual stick position
                this.joystickStick.style.transform = "translate(calc(-50% + ".concat(stickX, "px), calc(-50% + ").concat(stickY, "px))");
                // Determine input direction based on stick position (relative to center)
                var threshold = this.joystickMaxDistance * 0.3; // Dead zone radius
                this.resetJoystickKeys(); // Clear previous frame's keys
                if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                    if (deltaY < -threshold) this.inputHandler.updateKeyState('forward', true);
                    if (deltaY > threshold) this.inputHandler.updateKeyState('backward', true);
                    if (deltaX < -threshold) this.inputHandler.updateKeyState('left', true);
                    if (deltaX > threshold) this.inputHandler.updateKeyState('right', true);
                }
            }
        },
        {
            key: "resetJoystickKeys",
            value: function resetJoystickKeys() {
                this.inputHandler.updateKeyState('forward', false);
                this.inputHandler.updateKeyState('backward', false);
                this.inputHandler.updateKeyState('left', false);
                this.inputHandler.updateKeyState('right', false);
            }
        },
        {
            key: "applyStyles",
            value: function applyStyles() {
                var style = document.createElement('style');
                style.textContent = "\n            #joystick-base, #action-button, #crystal-button, #switch-eq-button {\n                position: fixed;\n                bottom: 20px;\n                border-radius: 50%;\n                background-color: rgba(255, 255, 255, 0.4);\n                user-select: none; /* Prevent text selection */\n                -webkit-user-select: none; /* Safari */\n                touch-action: manipulation; /* Optimize touch interaction */\n                z-index: 10; /* Ensure they are above the canvas */\n            }\n\n            #joystick-base {\n                left: 20px;\n                width: 100px;\n                height: 100px;\n                 display: flex;\n                 justify-content: center;\n                 align-items: center;\n            }\n\n            #joystick-stick {\n                width: 50px;\n                height: 50px;\n                background-color: rgba(255, 255, 255, 0.7);\n                border-radius: 50%;\n                position: absolute; /* Position relative to base */\n                top: 50%; /* Center vertically */\n                left: 50%; /* Center horizontally */\n                transform: translate(-50%, -50%); /* Precise centering */\n                pointer-events: none; /* Allow touches to pass through to base */\n            }\n\n            #action-button {\n                right: 20px;\n                width: 70px;\n                height: 70px;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n                font-size: 24px;\n                font-weight: bold;\n                color: rgba(0, 0, 0, 0.7);\n                border: 2px solid rgba(255, 255, 255, 0.6);\n}\n#crystal-button {\n    right: 20px;\n    bottom: 100px; /* Position below action button */\n    width: 60px;\n    height: 60px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    font-size: 20px;\n    font-weight: bold;\n    color: rgba(0, 0, 0, 0.7);\n    background-color: rgba(100, 220, 255, 0.4); /* Crystal-like color */\n    border: 2px solid rgba(220, 255, 255, 0.6);\n    border-radius: 15px; /* Slightly different shape */\n}\n#switch-eq-button {\n    right: 20px;\n    bottom: 170px; /* Position below crystal button */\n    width: 50px;\n    height: 50px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    font-size: 18px;\n    font-weight: bold;\n    color: rgba(0, 0, 0, 0.7);\n    background-color: rgba(200, 200, 200, 0.4); /* Neutral color */\n    border: 2px solid rgba(230, 230, 230, 0.6);\n    border-radius: 10px; /* More square-ish */\n}\n             /* Prevent highlighting on tap */\n             * {\n                -webkit-tap-highlight-color: transparent;\n             }\n        ";
                document.head.appendChild(style);
            }
        }
    ]);
    return TouchControls;
}();
