var collisionObjects = require('./globals').b,
    globals = require('./globals'),
    TankFactory = require('./tank'),
    overlay = require('./overlay'),
    collisionDetection = require('./collisionDetection').a,
    shuffle = require('./utils').b,
    env = require('./env'),
    backlog = require('./backlog'),
    sounds = require('./sounds'),
    storage = require('./storage'),
    level = 0,
    onNewLevelStarting,
    levels = [
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
                    points: 25
                }, {
                    points: 25
                }, {
                    points: 30
                }
            ]
        }, {
            tanks: [
                {
                    points: 30
                }, {
                    points: 30
                }, {
                    points: 30
                }
            ]
        }
    ],
    undefLevel = {
        tanks: [
            {
                points: 30
            }, {
                points: 30
            }, {
                points: 40
            }, {
                points: 40
            }
        ]
    };

var mainMenuTanks = 5;
var mainMenuLevel = {
    tanks: []
};

for (var i = 0; i < mainMenuTanks; i++) {
    mainMenuLevel.tanks.push({
        points: 30
    });
}

function onEnemyDead(enemy, enemyCollisionObject, wasFromMainMenu, afterDeadCallback) {
    afterDeadCallback = afterDeadCallback || function () {};
    if (wasFromMainMenu) {
        setTimeout(function () {
            enemy.c.style.opacity = 0;
            afterDeadCallback();
            collisionObjects.splice(collisionObjects.indexOf(enemyCollisionObject), 1);
            globals.i.splice(globals.i.indexOf(enemy), 1);
            document.getElementById('main').removeChild(enemy.c);

            if (globals.i.length === 0) {
                globals.k = true;
                onNewLevelStarting(level);
                generateLevel();
            }
        }, 0);

        return;
    }

    globals.e += level > 4 ? (level > 7 ? enemy.e() / 3 : enemy.e() / 2) : enemy.e();

    setTimeout(function () {
        enemy.c.style.opacity = 0;
        setTimeout(function () {
            collisionObjects.splice(collisionObjects.indexOf(enemyCollisionObject), 1);
            globals.i.splice(globals.i.indexOf(enemy), 1);
            document.getElementById('main').removeChild(enemy.c);
            afterDeadCallback();

            if (globals.i.length === 0) {
                setTimeout(function () {
                    level++;
                    storage.b('slt|maxLevel', level);
                    onNewLevelStarting(level);
                    generateLevel();
                }, 1000);
            }
        }, 1000);
    }, globals.i.length === 1 ? 1000 : 5000);
}

function generateLevel(isMainMenu) {
    var levelData = isMainMenu ? mainMenuLevel : (levels[level] || undefLevel);

    var oldMap = document.getElementById('map');

    if (oldMap) {
        document.getElementById('main').removeChild(oldMap);
    }
    document.getElementById('main').appendChild(env.a());

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

        enemy.d({
            x: (level === 0 && !isMainMenu) ? screenWidth - 100 : Math.floor(Math.random() * (screenWidth - 100)) + 50,
            y: (level === 0 && !isMainMenu) ? screenHeight - 100 : Math.floor(Math.random() * (screenHeight - 100)) + 50},
            Math.random() * 3.14 - 1.57,
            onEnemyDead.bind(null, enemy, enemyCollisionObject, isMainMenu));

        enemy.l();

        collisionObjects.push(enemyCollisionObject);

        document.getElementById('main').appendChild(enemy.c);

        globals.i.push(enemy);

        if (backlog.a.b.fx || level < backlog.a.b.f) {
            var attempts = 0;
            while (collisionDetection(enemy) && attempts < 500) {
                attempts++;
                enemy.g({
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
        } else if(!backlog.a.b.fx && level >= backlog.a.b.f && collisionDetection(enemy)) {
            if (!backlog.a.b.k) {
                backlog.b(backlog.a.b);
            }
        }
    }

    if (isMainMenu) {
        globals.k = false;
        var menu = overlay.a();

        menu.id = 'MainMenu';

        var body = '';
        var footer = {
            action: 'startGame()',
            label: 'Let\'s try to hunt those bugs!'
        };
        if (storage.a('slt|name')) {
            if (storage.a('slt|done')) {
                body += 'Hi <b>' + (storage.a('slt|name') || 'buddy') + '</b>';
                body += '<p>Looks like you hunted down all our bugs. Wanna play for fun?';

                footer.label = 'Let\'s play';
            } else {
                body += 'Hi <b>' + (storage.a('slt|name') || 'buddy') + '</b>';
                body += '<p>Based on our public beta program feedback, it looks like there are still some bugs in our code.';
            }
        } else {
            body = 'Hi <input id="name" value="" placeholder="Enter your name" style="border: none; border-bottom: 1px dashed darkblue; width: 100px"/>!';
            body += '<p>Welcome to our team! Your job is to test our brand new game - <b>Silly Little Tanks</b></p>';
            body += '<p>Our dev team did quite a good job, but sadly, we missed some skilled ninja QE, as <b>yourself</b>, but, not any more <span style="font-size: 200%; color: darkblue">☺</span></p>';
            body += 'You have access to <em>dev</em> build of our game, which has implemented advanced system to detect bugs and glitches (watch for upper left corner). But sadly it is not advanced enough to give us repro steps, which dev team could use to fix them.';
            body += '<p>So, your job is basically providing repro steps for bugs you encounter and system will alert you about. <span style="font-size: 200%; color: darkblue">☺</span></p>';
        }

        overlay.b(menu, body, 'Silly Little Tanks <small style="font-size: 30%">(dev_mode=true)</small>', footer);

        document.getElementById('main').appendChild(menu);
    } else {
        globals.j = true;

        var enemiesSummary = overlay.a();

        enemiesSummary.id = 'EnemiesSumary';

        var body = '<div style="display: flex; flex-direction: row; flex-wrap: wrap; font-size: 13px">';

        body += '<h2 style="width: 100%">You <span style="font-size: 60%">(configure your levels, remaining <span id="remainingPoitns">' + globals.e + '</span> points)</span></h2>';
        body += generateLevelsSummary(globals.d, true);

        body += '<h2 style="width: 100%">Enemies</h2>';
        globals.i.forEach(function (enemy) {
            body += generateLevelsSummary(enemy);
        });

        body += '</div>';
        // body += '<br><p style="text-align: right"></p>';

        var footer = {
            action: 'startLevel()',
            label: 'Start'
        };

        overlay.b(enemiesSummary, body, 'Level #' + (level + 1), footer);

        document.getElementById('main').appendChild(enemiesSummary);
    }

    function generateLevelsSummary(tank, isPlayer) {
        var markup = '<div style="display: flex; flex-wrap: nowrap; align-items: center; margin-right: 30px">';
        markup += tank.c.outerHTML.replace(/style="[^"]+"/, 'style="width: 60px;height: 60px;transform: rotate3d(0, 0, 1, -90deg);flex-shrink: 0"');
        markup += '<div style="flex-grow: 1; height: 100px; margin-left: 20px; width: 250px">';
        markup += '<div style="display: flex; flex-direction: column">';

        for (var level in tank.a) {
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

            for (var i = 0; i < 9; i++) {
                markup += '<div class="levelPoint' + (i < tank.a[level] ? ' filled' : '') + '" style="width: 100%; height: 10px; margin: 0 2px; background: ' + (i < tank.a[level] ? 'darkblue' : 'white') + '; border: 1px solid black"></div>';
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

    for (var i = 0; i < element.parentElement.childNodes.length; i++) {
        var childNode = element.parentElement.childNodes[i];
        if (childNode.className === 'levelPoint filled') {
            lastFilled = childNode;
            idx++;
        }
    }

    if (lastFilled) {
        lastFilled.style.backgroundColor = 'white';
        lastFilled.className = 'levelPoint';

        if (globals.n[element.getAttribute('data-levelName')] && !backlog.a.e.fx) {
            if (!backlog.a.e.k) {
                backlog.b(backlog.a.e);
            }
        } else {
            globals.e++;
            document.getElementById('remainingPoitns').textContent = globals.e;
        }

        sounds.k(sounds.i);
        globals.d.f(element.getAttribute('data-levelName'), idx);
    } else {
        sounds.k(sounds.j);
    }
};

window.plusLevel = function (element) {
    var firstWhite = null;
    var idx = -2;

    if (globals.e === 0) {
        sounds.k(sounds.j);
        return;
    }
    for (var i = 0; i < element.parentElement.childNodes.length; i++) {
        var childNode = element.parentElement.childNodes[i];
        if (!firstWhite) {
            idx++;
        }

        if (!firstWhite && childNode.className === 'levelPoint') {
            firstWhite = childNode;
        }
    }

    if (firstWhite) {
        firstWhite.style.backgroundColor = 'darkblue';
        firstWhite.className = 'levelPoint filled';

        globals.e--;
        document.getElementById('remainingPoitns').textContent = globals.e;

        sounds.k(sounds.h);

        globals.d.f(element.getAttribute('data-levelName'), idx);

        if (idx === 9) {
            globals.n[element.getAttribute('data-levelName')] = true;
        }
    } else {
        sounds.k(sounds.j);
    }
};

module.exports = function (onNewLevelStartingCallback, isMainMenu) {
    onNewLevelStarting = onNewLevelStartingCallback || function () {};

    generateLevel(isMainMenu);
};
