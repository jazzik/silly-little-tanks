var overlay = require('./overlay');
var shuffle = require('./utils').shuffle;
var sounds = require('./sounds');
var globals = require('./globals');

var reproSteps = {
    enemies: [
        'Hit enemy',
        'Get hit by an enemy',
        'Crash into enemy',
        'Enemy crashes to enemy',
        'Let one enemy kill another one',
        'Let one enemy damage another one' // 5
    ],
    env: [
        'Hit the tree',
        'Go to the edge of screen'
    ],
    player: [
        'Make full circle',
        'Go straight and then reverse',
        'Play against 2 enemies at minimum',
        'Play against 3 enemies at minimum',
        'Play against 4 enemies at minimum',
        'Decrease level of some skill', // 5
        'Decrease level of some skill to minimum',
        'Increase level of some skill',
        'Increase level of some skill to maximum',
        'Receive damage to orange levels',
        'Receive damage to red levels', // 10
        'Rotate cabin',
        'Fire',
        'Just wait for enemy spawning until it happens'
    ]
};

if (!localStorage.getItem('slt|list')) {
    localStorage.setItem('slt|list', JSON.stringify({
        invincibleEnemies: {
            summary: 'Invincible enemies',
            reproSteps: [{
                type: 'enemies',
                index: 0
            }]
        }, spawningOnOtherObjects: {
            summary: 'Enemies are spawned on other objects/enemies',
            reproSteps: [{
                type: 'player',
                index: 13
            }],
            fromLevel: 1
        }, brokenCabinWhenDamaged: {
            summary: 'Cabin does not work when tank is slightly damaged',
            reproSteps: [{
                type: 'player',
                index: 9
            }, {
                type: 'player',
                index: 11
            }]
        }, friendlyKillFrenzy: {
            summary: 'Friendly kill frenzy',
            reproSteps: [{
                type: 'player',
                index: 2
            }, {
                type: 'enemies',
                index: 5
            }]
        }
    }));
}

exports.list = JSON.parse(localStorage.getItem('slt|list'));

var backlog = overlay.getOverlayElement();

var listItemStyle = 'border: 1px solid gray;border-radius: 5px;padding: 10px;font-family: sans-serif;font-weight: bold;margin: 5px 0;cursor: pointer;';

function setBacklogBody(body, headline, footer) {
    overlay.setBody(backlog, body, headline, footer, 'hideBacklog()');
}

exports.fixBug = function (bug) {
    bug.fixed = true;
    localStorage.setItem('slt|list', JSON.stringify(exports.list));
    document.getElementById('numberOfBugs').innerText = parseInt(document.getElementById('numberOfBugs').innerText, 10) - 1;

    if (bug === exports.list.friendlyKillFrenzy) {
        globals.enemies.forEach(function (enemy) {
            enemy.frenzyFire(false);
        });
    }
};

exports.newBugFound = function (bug) {
    bug.known = true;
    document.getElementById('listOfBugs').className = 'highlighted';
    document.getElementById('numberOfBugs').innerText = parseInt(document.getElementById('numberOfBugs').innerText, 10) + 1;

    localStorage.setItem('slt|list', JSON.stringify(exports.list));
    sounds.playSound(sounds.newBug);
};

var onCloseListener = function () {};

window.submitReproSteps = function (bug, suggestedReproSteps) {
    var selectedBug = exports.list[bug];
    var allMatch = true;
    suggestedReproSteps = JSON.parse(decodeURIComponent(suggestedReproSteps));

    if (selectedBug.reproSteps.length === suggestedReproSteps.length) {
        for (var i = 0; i < selectedBug.reproSteps.length; i++) {
            if (selectedBug.reproSteps[i].type !== suggestedReproSteps[i].type || selectedBug.reproSteps[i].index !== suggestedReproSteps[i].index) {
                allMatch = false;
            }
        }
    } else {
        allMatch = false;
    }

    if (allMatch) {
        setBacklogBody('<h1>Our devs were able to use your repro steps and fix that bug</h1>', 'Awesome!', {action: 'hideBacklog()', label: 'Good! Continue'});
        exports.fixBug(selectedBug);
    } else {
        setBacklogBody('<h1>Our devs were NOT able to repro the bug based on your repro steps. Try harder!</h1>', 'Too bad!', {action: 'hideBacklog()', label: 'Damn! Will try again'});
    }
};

window.selectDetail = function (bug, selectedItem, reproStepGuessing, previousReproSteps) {
    previousReproSteps = JSON.parse(decodeURIComponent(previousReproSteps));
    selectedItem = JSON.parse(decodeURIComponent(selectedItem));

    previousReproSteps.push(selectedItem);

    window.showItemDetail(bug, reproStepGuessing + 1, previousReproSteps);
};

window.showItemDetail = function (bug, reproStepGuessing, previousReproSteps) {
    var selectedBug = exports.list[bug];
    if (!reproStepGuessing) {
        reproStepGuessing = 0;
    }

    if (!previousReproSteps) {
        previousReproSteps = [];
    }

    var correctReproStep = selectedBug.reproSteps[reproStepGuessing];
    var options = [];

    if (correctReproStep) {
        options.push(correctReproStep);
    }

    while (options.length < 4) {
        var buckets = [];
        for (var bucket in reproSteps) {
            if (reproSteps.hasOwnProperty(bucket)) {
                buckets.push(bucket);
            }
        }

        var randomBucket = buckets[Math.floor(Math.random() * buckets.length)];
        var randomItemFromBucket = Math.floor(Math.random() * reproSteps[randomBucket].length);
        var hasNew = true;

        for (var i = 0; i < options.length; i++) {
            if (options[i].type === randomBucket && options[i].index === randomItemFromBucket) {
                hasNew = false;
            }
        }

        if (hasNew) {
            options.push({
                type: randomBucket,
                index: randomItemFromBucket
            });
        }
    }

    shuffle(options);

    var itemDetailBody = '<h2>Repro steps:</h2><ol>' + previousReproSteps.reduce(function (previousValue, currentValue) {
        return previousValue + '<li>' + reproSteps[currentValue.type][currentValue.index] + '</li>';
    }, '') + '</ol><hr><ul style="list-style: none">' + options.reduce(function (previousValue, currentValue) {
        return previousValue + '<li onClick="selectDetail(\'' + bug + '\', \'' + encodeURIComponent(JSON.stringify(currentValue)) + '\', ' + reproStepGuessing + ', \'' + encodeURIComponent(JSON.stringify(previousReproSteps)) + '\')" class="reproStepOption" style="' + listItemStyle + '">' + reproSteps[currentValue.type][currentValue.index] + '</li>';
    }, '') + '</ul>';

    var footer;
    if (reproStepGuessing > 0) {
        footer = {
            action: 'submitReproSteps(\'' + bug + '\', \'' + encodeURIComponent(JSON.stringify(previousReproSteps)) + '\')',
            label: 'Submit'
        };
    }

    setBacklogBody(itemDetailBody, selectedBug.summary, footer);
};

var backlogVisible = false;
function showBacklog() {
    var openList = [];

    for (var bug in exports.list) {
        if (exports.list.hasOwnProperty(bug) && !exports.list[bug].fixed && exports.list[bug].known) {
            openList.push({
                key: bug,
                data: exports.list[bug]
            });
        }
    }

    setBacklogBody(openList.reduce(function (previousValue, currentValue) {
        return previousValue + '<div class="pbi" onClick="showItemDetail(\'' + currentValue.key + '\')" style="' + listItemStyle + '">' + currentValue.data.summary + '</div>';
    }, ''), 'List of open bugs');

    document.body.appendChild(backlog);
    backlogVisible = true;
}

exports.attachOnCloseListener = function (listener) {
    onCloseListener = listener;
};

function hideBacklog() {
    document.body.removeChild(backlog);
    backlogVisible = false;
}

exports.toggleBacklog = function () {
    if (backlogVisible) {
        hideBacklog();
    } else {
        showBacklog();
    }
};

window.hideBacklog = function () {
    onCloseListener();
};
