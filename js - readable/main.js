'use strict';

var TankFactory = require('./tank');
var generateLevels = require('./levelGenerator');
var backlog = require('./backlog');
var collisionObjects = require('./globals').collisionObjects;
var globals = require('./globals');

var isMainMenu = true;

window.startGame = function () {
    globals.playerTank = new TankFactory(200, 50, 20, {
        cabinYawSpeed: 0,
        speed: 0,
        fireTimeout: 0,
        maxLife: 0,
        shellDamage: 0
    });
    globals.playerTank.build({x: 300, y: 200}, 0, function () {
        globals.playerTank = null;
    });

    globals.playerTank.enablePlayerControls();

    collisionObjects.push({
        type: 'player',
        object: globals.playerTank
    });
    document.getElementById('main').appendChild(globals.playerTank.outerBody);

    isMainMenu = false;

    globals.enemies.forEach(function (enemy) {
        enemy.receiveDamage(1000, true);
    });

    if (document.getElementById('name')) {
        localStorage.setItem('slt|name', document.getElementById('name').value || 'buddy');
    }

    document.getElementById('main').removeChild(document.getElementById('MainMenu'));
};

window.startLevel = function () {
    document.getElementById('main').removeChild(document.getElementById('EnemiesSumary'));
    globals.isPaused = false;
    globals.levelStarted = true;

    if (globals.playerTank) {
        globals.playerTank.enablePlayerControls();
    }
};

generateLevels(function () {
    globals.levelStarted = false;
    globals.playerTank.heal();
}, isMainMenu);

var time;
(function animloop() {
    if (!globals.playerTank && !isMainMenu) {
        return;
    }
    requestAnimationFrame(animloop);
    var now = Date.now(),
        dt = now - (time || now);

    time = now;

    if (globals.isPaused) {
        return;
    }
    render(dt);
})();

function render(dt) {
    if (globals.playerTank) {
        globals.playerTank.render(dt);
    }
    globals.enemies.forEach(function (enemy) {
        enemy.render(dt);
    });
}

function onKeyDown(event) {
    if (event.keyCode === 71) {
        showGameMenu();
    }
}

function onBugsClick(event) {
    event.preventDefault();
    event.cancelBubble = true;
    if (event.stopPropagation) {
        event.stopPropagation();
    }

    showGameMenu();
}

function showGameMenu() {
    document.getElementById('listOfBugs').className = '';

    if (!globals.levelStarted) {
        backlog.toggleBacklog();
        return;
    }

    globals.isPaused = !globals.isPaused;

    if (globals.isPaused) {
        if (globals.playerTank) {
            globals.playerTank.disablePlayerControls();
        }
    } else {
        if (globals.playerTank) {
            globals.playerTank.enablePlayerControls();
        }
    }
    backlog.toggleBacklog();
}

backlog.attachOnCloseListener(onKeyDown.bind(null, {keyCode: 71}));

var numberOfKnownNotFixedBugs = 0;
for (var bug in backlog.list) {
    if (backlog.list.hasOwnProperty(bug) && backlog.list[bug].known && !backlog.list[bug].fixed) {
        numberOfKnownNotFixedBugs++;
    }
}

var graphicsSelector = document.createElement('div');
graphicsSelector.innerHTML = '🐞: <span id="numberOfBugs">' + numberOfKnownNotFixedBugs + '</span>';
graphicsSelector.style.position = 'fixed';
graphicsSelector.style.cursor = 'pointer';
graphicsSelector.style.fontSize = '30px';
graphicsSelector.style.color = 'white';
graphicsSelector.style.fontFamily = 'verdana';
graphicsSelector.style.textShadow = '0 0 3px black';
graphicsSelector.style.zIndex = '100';

graphicsSelector.id = 'listOfBugs';

graphicsSelector.addEventListener('click', onBugsClick);
graphicsSelector.addEventListener('mouseenter', function () {
    if (globals.playerTank) {
        globals.playerTank.disablePlayerControls(true);
    }
});
graphicsSelector.addEventListener('mouseleave', function () {
    if (globals.playerTank) {
        globals.playerTank.enablePlayerControls(true);
    }
});

document.getElementById('main').appendChild(graphicsSelector);

document.addEventListener('keydown', onKeyDown);

var resizeTimeout = null;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(function () {
        alert('We detected change of resolution. Restart is needed.');
        window.location.reload();
    }, 250);
});

var graphicsSelector = document.createElement('div');
var graphicsLevel;

try {
    graphicsLevel = localStorage.getItem('slt|graphics');
} catch (e) {}

if (graphicsLevel !== 'Low') {
    graphicsLevel = 'High';
}

graphicsSelector.innerHTML = 'Graphics: <span id="graphicsLevel" style="font-weight: bold">' + graphicsLevel + '</span>';
graphicsSelector.style.position = 'fixed';
graphicsSelector.style.right = '10px';
graphicsSelector.style.cursor = 'pointer';
graphicsSelector.style.fontSize = '30px';
graphicsSelector.style.color = 'white';
graphicsSelector.style.fontFamily = 'verdana';
graphicsSelector.style.textShadow = '0 0 3px black';
graphicsSelector.style.zIndex = '100';

graphicsSelector.addEventListener('click', onGraphicsSwitched);

function onGraphicsSwitched() {
    var currentLevel = document.getElementById('graphicsLevel').innerText;

    if (currentLevel === 'High') {
        currentLevel = 'Low';
    } else {
        currentLevel = 'High';
    }

    try {
        localStorage.setItem('slt|graphics', currentLevel);
    } catch (e) {}

    window.location.reload();
}

document.getElementById('main').appendChild(graphicsSelector);


var treesSetting = document.createElement('div');
var currentTreesSetting;

try {
    currentTreesSetting = localStorage.getItem('slt|showTrees');
} catch (e) {}

if (currentTreesSetting !== 'off') {
    currentTreesSetting = 'on';
}

treesSetting.innerHTML = 'Trees: <span id="showTrees" style="font-weight: bold">' + currentTreesSetting + '</span>';
treesSetting.style.position = 'fixed';
treesSetting.style.right = '10px';
treesSetting.style.top = '30px';
treesSetting.style.cursor = 'pointer';
treesSetting.style.fontSize = '30px';
treesSetting.style.color = 'white';
treesSetting.style.fontFamily = 'verdana';
treesSetting.style.textShadow = '0 0 3px black';
treesSetting.style.zIndex = '100';

treesSetting.addEventListener('click', onTreesToggle);

function onTreesToggle() {
    var currentSetting = document.getElementById('showTrees').innerText;

    if (currentSetting === 'on') {
        currentSetting = 'off';
    } else {
        currentSetting = 'on';
    }

    try {
        localStorage.setItem('slt|showTrees', currentSetting);
    } catch (e) {}

    window.location.reload();
}

document.getElementById('main').appendChild(treesSetting);
