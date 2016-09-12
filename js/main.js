'use strict';

var TankFactory = require('./tank');
var generateLevels = require('./levelGenerator');
var backlog = require('./backlog');
var collisionObjects = require('./globals').b;
var globals = require('./globals');
var storage = require('./storage');

var isMainMenu = true;
var graphicsSelector = document.createElement('div');
var treesSetting = document.createElement('div');

window.startGame = function () {
    globals.d = new TankFactory(200, 50, 20, {
        cabinYawSpeed: 0,
        speed: 0,
        fireTimeout: 0,
        maxLife: 0,
        shellDamage: 0
    });
    globals.d.d({x: 300, y: 200}, 0, function () {
        globals.d = null;
    });

    globals.d.j();

    collisionObjects.push({
        type: 'player',
        object: globals.d
    });
    document.getElementById('main').appendChild(globals.d.c);
    globals.d.q();

    isMainMenu = false;

    globals.i.forEach(function (enemy) {
        enemy.o(1000, true);
    });

    if (document.getElementById('name')) {
        storage.b('slt|name', document.getElementById('name').value || 'buddy');
    }

    document.getElementById('main').removeChild(document.getElementById('MainMenu'));
};

window.startLevel = function () {
    document.getElementById('main').removeChild(document.getElementById('EnemiesSumary'));
    globals.j = false;
    globals.f = true;

    treesSetting.style.display = 'none';
    graphicsSelector.style.display = 'none';

    if (globals.d) {
        globals.d.j();
    }
};

generateLevels(function () {
    globals.f = false;
    globals.d.i();
}, isMainMenu);

var time;
(function animloop() {
    if (!globals.d && !isMainMenu) {
        return;
    }
    requestAnimationFrame(animloop);
    var now = Date.now(),
        dt = now - (time || now);

    time = now;

    if (globals.j) {
        return;
    }
    render(dt);
})();

function render(dt) {
    if (globals.d) {
        globals.d.h(dt);
    }
    globals.i.forEach(function (enemy) {
        enemy.h(dt);
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

    if (!globals.j) {
        treesSetting.style.display = 'block';
        graphicsSelector.style.display = 'block';
    } else {
        treesSetting.style.display = 'none';
        graphicsSelector.style.display = 'none';
    }

    if (!globals.f) {
        backlog.d();
        return;
    }

    globals.j = !globals.j;

    if (globals.j) {
        if (globals.d) {
            globals.d.k();
        }
    } else {
        if (globals.d) {
            globals.d.j();
        }
    }
    backlog.d();
}

backlog.c(onKeyDown.bind(null, {keyCode: 71}));

var numberOfKnownNotFixedBugs = 0;
for (var bug in backlog.a) {
    if (backlog.a.hasOwnProperty(bug) && backlog.a[bug].k && !backlog.a[bug].fx) {
        numberOfKnownNotFixedBugs++;
    }
}

var bugsCounter = document.createElement('div');
bugsCounter.innerHTML = '🐞: <span id="numberOfBugs">' + numberOfKnownNotFixedBugs + '</span>';
bugsCounter.style.position = 'fixed';
bugsCounter.style.cursor = 'pointer';
bugsCounter.style.fontSize = '30px';
bugsCounter.style.color = 'white';
bugsCounter.style.fontFamily = 'verdana';
bugsCounter.style.textShadow = '0 0 3px black';
bugsCounter.style.zIndex = '100';

bugsCounter.id = 'listOfBugs';

bugsCounter.addEventListener('click', onBugsClick);
bugsCounter.addEventListener('mouseenter', function () {
    if (globals.d) {
        globals.d.k(true);
    }
});
bugsCounter.addEventListener('mouseleave', function () {
    if (globals.d) {
        globals.d.j(true);
    }
});

document.getElementById('main').appendChild(bugsCounter);

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

graphicsLevel = storage.a('slt|graphics');

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
    var currentLevel = document.getElementById('graphicsLevel'). textContent;

    if (currentLevel === 'High') {
        currentLevel = 'Low';
    } else {
        currentLevel = 'High';
    }

    storage.b('slt|graphics', currentLevel);

    window.location.reload();
}

document.getElementById('main').appendChild(graphicsSelector);

var currentTreesSetting = storage.a('slt|showTrees');

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
    var currentSetting = document.getElementById('showTrees'). textContent;

    if (currentSetting === 'on') {
        currentSetting = 'off';
    } else {
        currentSetting = 'on';
    }

    storage.b('slt|showTrees', currentSetting);

    window.location.reload();
}

document.getElementById('main').appendChild(treesSetting);
