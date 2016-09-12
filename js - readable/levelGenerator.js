var collisionObjects = require('./globals').collisionObjects;
var globals = require('./globals');
var TankFactory = require('./tank');
var overlay = require('./overlay');
var collisionDetection = require('./collisionDetection').detect;
var shuffle = require('./utils').shuffle;
var env = require('./env');
var backlog = require('./backlog');
var sounds = require('./sounds');

var level = 0;
var onNewLevelStarting;

var levels = [
    {
        tanks: [
            {
                points: 6
            }
        ]
    }, {
        tanks: [
            {
                points: 8
            }, {
                points: 8
            }
        ]
    }, {
        tanks: [
            {
                points: 8
            }, {
                points: 8
            }, {
                points: 8
            }
        ]
    }, {
        tanks: [
            {
                points: 8
            }, {
                points: 8
            }, {
                points: 16
            }
        ]
    }, {
        tanks: [
            {
                points: 8
            }, {
                points: 15
            }, {
                points: 20
            }
        ]
    }, {
        tanks: [
            {
                points: 16
            }, {
                points: 18
            }, {
                points: 22
            }
        ]
    }, {
        tanks: [
            {
                points: 20
            }, {
                points: 25
            }, {
                points: 30
            }
        ]
    }
];
var undefLevel = {
    tanks: [
        {
            points: 20
        }, {
            points: 20
        }, {
            points: 30
        }, {
            points: 30
        }
    ]
};

var mainMenuTanks = Math.ceil(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 125000);
var mainMenuLevel = {
    tanks: []
};

for (var i = 0; i < mainMenuTanks; i++) {
    mainMenuLevel.tanks.push({
        points: 30
    });
}

function onEnemyDead(enemy, enemyCollisionObject, wasFromMainMenu) {
    if (wasFromMainMenu) {
        setTimeout(function () {
            enemy.outerBody.style.opacity = 0;
            collisionObjects.splice(collisionObjects.indexOf(enemyCollisionObject), 1);
            globals.enemies.splice(globals.enemies.indexOf(enemy), 1);
            document.getElementById('main').removeChild(enemy.outerBody);

            if (globals.enemies.length === 0) {
                globals.isInGame = true;
                onNewLevelStarting(level);
                generateLevel();
            }
        }, 0);

        return;
    }

    globals.playerPoints += enemy.getReward();

    setTimeout(function () {
        enemy.outerBody.style.opacity = 0;
        setTimeout(function () {
            collisionObjects.splice(collisionObjects.indexOf(enemyCollisionObject), 1);
            globals.enemies.splice(globals.enemies.indexOf(enemy), 1);
            document.getElementById('main').removeChild(enemy.outerBody);

            if (globals.enemies.length === 0) {
                setTimeout(function () {
                    level++;
                    localStorage.setItem('slt|maxLevel', level);
                    onNewLevelStarting(level);
                    generateLevel();
                }, 1000);
            }
        }, 1000);
    }, globals.enemies.length === 1 ? 1000 : 5000);
}

function generateLevel(isMainMenu) {
    var levelData = isMainMenu ? mainMenuLevel : (levels[level] || undefLevel);

    var oldMap = document.getElementById('map');

    if (oldMap) {
        document.getElementById('main').removeChild(oldMap);
    }
    document.getElementById('main').appendChild(env.generateMap());

    for (var i = 0; i < levelData.tanks.length; i++) {

        function generateLevelDistribution(tank, last) {
            var remainingPoints = tank.points - levelsDistribution.reduce(function (a, b) {
                return a + b;
            }, 0);

            if (last) {
                return Math.min(remainingPoints, 9);
            } else {
                return Math.min(Math.floor(Math.random() * Math.max(remainingPoints, 0)), 9);
            }
        }

        var screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        var levelsDistribution = [];
        levelsDistribution.push(generateLevelDistribution(levelData.tanks[i]));
        levelsDistribution.push(generateLevelDistribution(levelData.tanks[i]));
        levelsDistribution.push(generateLevelDistribution(levelData.tanks[i]));
        levelsDistribution.push(generateLevelDistribution(levelData.tanks[i]));
        levelsDistribution.push(generateLevelDistribution(levelData.tanks[i], true));

        shuffle(levelsDistribution);

        var cabinYawSpeed = levelsDistribution[0];
        var speed = levelsDistribution[1];
        var fireTimeout = levelsDistribution[2];
        var maxLife = levelsDistribution[3];
        var shellDamage = levelsDistribution[4];

        var enemy = new TankFactory(Math.floor(Math.random() * 210), Math.floor(Math.random() * 210), Math.floor(Math.random() * 210), {
            cabinYawSpeed: cabinYawSpeed,
            speed: speed,
            fireTimeout: fireTimeout,
            maxLife: maxLife,
            shellDamage: shellDamage
        });
        var enemyCollisionObject = {
            type: 'enemy',
            object: enemy
        };

        enemy.build({
            x: (level === 0 && !isMainMenu) ? screenWidth - 100 : Math.floor(Math.random() * (screenWidth - 100)) + 50,
            y: (level === 0 && !isMainMenu) ? screenHeight - 100 : Math.floor(Math.random() * (screenHeight - 100)) + 50},
            Math.random() * 3.14 - 1.57,
            onEnemyDead.bind(null, enemy, enemyCollisionObject, isMainMenu));

        enemy.enableAi();

        collisionObjects.push(enemyCollisionObject);

        document.getElementById('main').appendChild(enemy.outerBody);

        globals.enemies.push(enemy);

        if (backlog.list.spawningOnOtherObjects.fixed || level < backlog.list.spawningOnOtherObjects.fromLevel) {
            var attempts = 0;
            while (collisionDetection(enemy) && attempts < 500) {
                attempts++;
                enemy.updatePosition({
                    x: Math.floor(Math.random() * (screenWidth - 100)) + 50,
                    y: Math.floor(Math.random() * (screenHeight - 100)) + 50
                });
            }

            if (attempts === 500) {
                console.log('We were not able to randomly find empty space for placing the tank in 500 attempts');
                alert('BSOD! :( We need to restart the game. Our devs are working on fixing it! If it happens too often, turn off trees.');
                window.location.reload();
                return;
            }
        } else if(!backlog.list.spawningOnOtherObjects.fixed && level >= backlog.list.spawningOnOtherObjects.fromLevel && collisionDetection(enemy)) {
            if (!backlog.list.spawningOnOtherObjects.known) {
                backlog.newBugFound(backlog.list.spawningOnOtherObjects);
            }
        }
    }

    if (isMainMenu) {
        globals.isInGame = false;
        var menu = overlay.getOverlayElement();

        menu.id = 'MainMenu';

        var body = '';
        var footer;
        if (localStorage.getItem('slt|name')) {
            body += 'Hi <b>' + (localStorage.getItem('slt|name') || 'buddy') + '</b>';
            footer = {
                action: 'startGame()',
                label: 'Let\'s do it!'
            };
        } else {
            body = 'Hi <input id="name" value="" placeholder="Enter your name" style="border: none; border-bottom: 1px dashed darkblue; width: 100px"/>!';
            body += '<p>Welcome to our team! Your job, as you surely already know from onboarding session, is to test our brand new game - <b>Silly Little Tanks</b></p>';
            body += '<p>Our dev team did quite a good job, but sadly, we missed some skilled ninja QE, as <b>yourself</b>, but, not any more <span style="font-size: 200%; color: darkblue">☺</span></p>';
            body += 'You have access to <em>dev</em> build of our game, which has implemented advanced system to detect bugs and glitches. But sadly it is not advanced enough to give us repro steps, which dev team could use to fix them.';
            body += '<p>So, your job is basically providing repro steps for bugs you encounter and system will alert you about. <span style="font-size: 200%; color: darkblue">☺</span></p>';

            footer = {
                action: 'startGame()',
                label: 'Let\'s try to hunt first bug together'
            };
        }

        overlay.setBody(menu, body, 'Silly Little Tanks <small style="font-size: 30%">(dev_mode=true)</small>', footer);

        document.getElementById('main').appendChild(menu);
    } else {
        globals.isPaused = true;

        var enemiesSummary = overlay.getOverlayElement();

        enemiesSummary.id = 'EnemiesSumary';

        var body = '<div style="display: flex; flex-direction: row; flex-wrap: wrap; font-size: 13px">';

        body += '<h2 style="width: 100%">You <span style="font-size: 60%">(configure your levels, remaining <span id="remainingPoitns">' + globals.playerPoints + '</span> points)</span></h2>';
        body += generateLevelsSummary(globals.playerTank, true);

        body += '<h2 style="width: 100%">Enemies</h2>';
        globals.enemies.forEach(function (enemy) {
            body += generateLevelsSummary(enemy);
        });

        body += '</div>';
        // body += '<br><p style="text-align: right"></p>';

        var footer = {
            action: 'startLevel()',
            label: 'Start'
        };

        overlay.setBody(enemiesSummary, body, 'Level #' + (level + 1), footer);

        document.getElementById('main').appendChild(enemiesSummary);
    }

    function generateLevelsSummary(tank, isPlayer) {
        var markup = '<div style="display: flex; flex-wrap: nowrap; align-items: center; margin-right: 30px">';
        markup += tank.outerBody.outerHTML.replace(/style="[^"]+"/, 'style="width: 60px;height: 60px;transform: rotate3d(0, 0, 1, -90deg);flex-shrink: 0"');
        markup += '<div style="flex-grow: 1; height: 100px; margin-left: 20px; width: 250px">';
        markup += '<div style="display: flex; flex-direction: column">';

        for (var level in tank.levels) {
            var distname = '';

            if (level === 'cabinYawSpeed') {
                distname = 'cabin yaw speed';
            } else if (level === 'speed') {
                distname = 'tank speed';
            } else if (level === 'fireTimeout') {
                distname = 'fire rate';
            } else if (level === 'maxLife') {
                distname = 'max life';
            } else if (level === 'shellDamage') {
                distname = 'damage';
            } else {
                continue;
            }

            markup += '<div style="display: flex; flex-wrap: nowrap; align-items: center">';
            markup += '<div style="flex-shrink: 0; width: 100px;">' + distname + ': </div>';

            if (isPlayer) {
                markup += '<div data-levelName="' + level + '" onClick="minusLevel(this);" style="width: 100%; height: 15px; margin: 0 2px; font-weight: bold; cursor: pointer">&minus;</div>';
            }

            for (var i = 0; i < 10; i++) {
                markup += '<div class="levelPoint' + (i < tank.levels[level] ? ' filled' : '') + '" style="width: 100%; height: 10px; margin: 0 2px; background: ' + (i < tank.levels[level] ? 'darkblue' : 'white') + '; border: 1px solid black"></div>';
            }

            if (isPlayer) {
                markup += '<div data-levelName="' + level + '" onClick="plusLevel(this);" style="width: 100%; height: 15px; margin: 0 2px; font-weight: bold; cursor: pointer">&plus;</div>';
            }

            markup += '</div>';
        }

        markup += '</div>';
        markup += '</div>';
        markup += '</div>';

        return markup;
    }
}

window.minusLevel = function (element) {
    var lastFilled = null;
    var idx = -1;

    element.parentElement.childNodes.forEach(function (childNode) {
        if (childNode.className === 'levelPoint filled') {
            lastFilled = childNode;
            idx++;
        }
    });

    if (lastFilled) {
        lastFilled.style.backgroundColor = 'white';
        lastFilled.className = 'levelPoint';

        globals.playerPoints++;
        document.getElementById('remainingPoitns').innerText = globals.playerPoints;

        sounds.playSound(sounds.updateLevelDown);

        globals.playerTank.updateLevels(element.getAttribute('data-levelName'), idx);
    } else {
        sounds.playSound(sounds.levelUpdateFail);
    }
};

window.plusLevel = function (element) {
    var firstWhite = null;
    var idx = -2;

    if (globals.playerPoints === 0) {
        sounds.playSound(sounds.levelUpdateFail);
        return;
    }

    element.parentElement.childNodes.forEach(function (childNode) {
        if (!firstWhite) {
            idx++;
        }

        if (!firstWhite && childNode.className === 'levelPoint') {
            firstWhite = childNode;
        }
    });

    if (firstWhite) {
        firstWhite.style.backgroundColor = 'darkblue';
        firstWhite.className = 'levelPoint filled';

        globals.playerPoints--;
        document.getElementById('remainingPoitns').innerText = globals.playerPoints;

        sounds.playSound(sounds.updateLevelUp);

        globals.playerTank.updateLevels(element.getAttribute('data-levelName'), idx);
    } else {
        sounds.playSound(sounds.levelUpdateFail);
    }
};

module.exports = function (onNewLevelStartingCallback, isMainMenu) {
    onNewLevelStarting = onNewLevelStartingCallback || function () {};

    generateLevel(isMainMenu);
};
