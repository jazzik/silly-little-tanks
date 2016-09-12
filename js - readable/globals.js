'use strict';

exports.userInput = {
    mouse: {
        x: null,
        y: null
    }
};

exports.collisionObjects = [];

exports.playerGlobalPosition = null;
exports.playerTank = null;
exports.playerPoints = 5;
exports.levelStarted = false;

window.game = exports;

var storedGraphicsLevel;
try {
    storedGraphicsLevel = localStorage.getItem('slt|graphics');
} catch (e) {}

exports.highGraphics = storedGraphicsLevel !== 'Low';

var showTrees;
try {
    showTrees = localStorage.getItem('slt|showTrees');
} catch (e) {}

exports.showTrees = showTrees !== 'off';

exports.enemies = [];

var trackMouse = function (event) {
    exports.userInput.mouse = {
        x: event.clientX,
        y: event.clientY
    };
};

document.addEventListener('mousemove', trackMouse);

exports.isPaused = false;
exports.isInGame = false;
