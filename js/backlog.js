var overlay = require('./overlay'),
    shuffle = require('./utils').b,
    sounds = require('./sounds'),
    globals = require('./globals'),
    getLocalStorageItem = require('./storage').a,
    setLocalStorageItem = require('./storage').b,
    stringifyJson = JSON.stringify,
    parseJson = JSON.parse,
    getElementById = document.getElementById.bind(document);

var reproSteps = {
    e: [
        'Hit enemy',
        'Get hit by an enemy',
        'Crash into enemy',
        'Enemy crashes to enemy',
        'Let one enemy kill another one',
        'Let one enemy damage another one' // 5
    ],
    p: [
        'Make full circle',
        'Go straight and then reverse',
        'Play against 2 enemies at minimum',
        'Play against 3 enemies at minimum',
        'Play against 4 enemies at minimum',
        'Decrease level of same skill', // 5
        'Decrease level of some skill to minimum',
        'Increase level of same skill',
        'Increase level of some skill to maximum',
        'Receive damage to orange levels',
        'Receive damage to red levels', // 10
        'Rotate cabin',
        'Fire',
        'Just wait for enemy spawning until it randomly happens'
    ],
    o: [
        'Observe that no harm is done to enemy',
        'Observe that cabin is not moving',
        'Observe that enemy became crazy',
        'Observe that enemy is jumping',
        'Observe that enemy disappeared',
        'Observe that enemy changed color', // 5
        'Observe that enemy cannot fire',
        'Observe that enemy cannot move',
        'Observe that skill points are not returned'
    ]
};

if (!getLocalStorageItem('slt|list')) {
    setLocalStorageItem('slt|list', stringifyJson({
        a: {
            s: 'Invincible enemies',
            r: [{
                t: 'e',
                i: 0
            }, {
                t: 'o',
                i: 0
            }]
        }, b: {
            s: 'Enemies are spawned on other objects/enemies',
            r: [{
                t: 'p',
                i: 13
            }, {
                t: '0',
                i: 7
            }],
            f: 3
        }, c: {
            s: 'Cabin does not rotate when tank is damaged',
            r: [{
                t: 'p',
                i: 10
            }, {
                t: 'p',
                i: 11
            }, {
                t: 'o',
                i: 1
            }]
        }, d: {
            s: 'Frenzy fire!',
            r: [{
                t: 'p',
                i: 2
            }, {
                t: 'e',
                i: 5
            }, {
                t: 'o',
                i: 2
            }]
        }, e: {
            s: 'Lowering skill level from maximum does not give points back',
            r: [{
                t: 'p',
                i: 8
            }, {
                t: 'p',
                i: 5
            }, {
                t: 'o',
                i: 8
            }]
        }
    }));
}

exports.a = parseJson(getLocalStorageItem('slt|list'));

var backlog = overlay.a();
var victoryNotice;

window.dismissVictoryNotice = function () {
    document.body.removeChild(victoryNotice);
    window.hideBacklog();
};

var listItemStyle = 'border: 1px solid gray;border-radius: 5px;padding: 10px;font-family: sans-serif;font-weight: bold;margin: 5px 0;cursor: pointer;';

function setBacklogBody(body, headline, footer) {
    overlay.b(backlog, body, headline, footer, 'hideBacklog()');
}

exports.b = function (bug) {
    bug.k = true;
    getElementById('listOfBugs').className = 'highlighted';
    getElementById('numberOfBugs'). textContent = parseInt(getElementById('numberOfBugs'). textContent, 10) + 1;

    setLocalStorageItem('slt|list', stringifyJson(exports.a));
    sounds.k(sounds.g);
};

function fixBug(bug) {
    bug.fx = true;
    setLocalStorageItem('slt|list', stringifyJson(exports.a));
    getElementById('numberOfBugs'). textContent = parseInt(getElementById('numberOfBugs'). textContent, 10) - 1;

    if (bug === exports.a.d) {
        globals.i.forEach(function (enemy) {
            enemy.n(false);
        });
    }

    var remainingBugs = 0;
    for (var bug in exports.a) {
        if (exports.a.hasOwnProperty(bug) && !exports.a[bug].fx) {
            remainingBugs++;
        }
    }

    if (remainingBugs === 0) {
        setLocalStorageItem('slt|done', true);
        victoryNotice = overlay.a();
        overlay.b(victoryNotice, 'You found all bugs!', 'Congrats!', {action: 'dismissVictoryNotice()', label: 'Continue playing'});
        victoryNotice.style.opacity = '1';
        document.body.appendChild(victoryNotice);
    }
}

var onCloseListener = function () {};

window.submitReproSteps = function (bug, suggestedReproSteps) {
    var selectedBug = exports.a[bug];
    var allMatch = true;
    suggestedReproSteps = parseJson(decodeURIComponent(suggestedReproSteps));

    if (selectedBug.r.length === suggestedReproSteps.length) {
        for (var i = 0; i < selectedBug.r.length; i++) {
            if (selectedBug.r[i].t !== suggestedReproSteps[i].t || selectedBug.r[i].i !== suggestedReproSteps[i].i) {
                allMatch = false;
            }
        }
    } else {
        allMatch = false;
    }

    if (allMatch) {
        setBacklogBody('<h1>Our devs were able to use your repro steps and fix that bug</h1>', 'Awesome!', {action: 'hideBacklog()', label: 'Good! Continue'});
        fixBug(selectedBug);
    } else {
        setBacklogBody('<h1>Our devs were NOT able to repro the bug based on your repro steps. Try harder!</h1>', 'Too bad!', {action: 'hideBacklog()', label: 'Damn! Will try again'});
    }
};

window.selectDetail = function (bug, selectedItem, reproStepGuessing, previousReproSteps) {
    previousReproSteps = parseJson(decodeURIComponent(previousReproSteps));
    selectedItem = parseJson(decodeURIComponent(selectedItem));

    previousReproSteps.push(selectedItem);

    window.showItemDetail(bug, reproStepGuessing + 1, previousReproSteps);
};

window.showItemDetail = function (bug, reproStepGuessing, previousReproSteps) {
    var selectedBug = exports.a[bug];
    if (!reproStepGuessing) {
        reproStepGuessing = 0;
    }

    if (!previousReproSteps) {
        previousReproSteps = [];
    }

    var correctReproStep = selectedBug.r[reproStepGuessing];
    var options = [];
    var fromBucket = null;

    if (correctReproStep) {
        options.push(correctReproStep);

        if (correctReproStep.t === 'o') {
            fromBucket = 'o';
        }
    }

    while (options.length < 4) {
        var buckets = [];
        for (var bucket in reproSteps) {
            if (reproSteps.hasOwnProperty(bucket)) {
                buckets.push(bucket);
            }
        }

        var randomBucket = fromBucket || buckets[Math.floor(Math.random() * buckets.length)];
        var randomItemFromBucket = Math.floor(Math.random() * reproSteps[randomBucket].length);
        var hasNew = true;

        for (var i = 0; i < options.length; i++) {
            if (options[i].t === randomBucket && options[i].i === randomItemFromBucket) {
                hasNew = false;
            }
        }

        if (hasNew) {
            fromBucket = null;
            options.push({
                t: randomBucket,
                i: randomItemFromBucket
            });
        }
    }

    shuffle(options);

    var itemDetailBody = '<h2>Repro steps:</h2><ol>' + previousReproSteps.reduce(function (previousValue, currentValue) {
        return previousValue + '<li>' + reproSteps[currentValue.t][currentValue.i] + '</li>';
    }, '') + '</ol><hr><ul style="list-style: none">' + options.reduce(function (previousValue, currentValue) {
        return previousValue + '<li onClick="selectDetail(\'' + bug + '\', \'' + encodeURIComponent(stringifyJson(currentValue)) + '\', ' + reproStepGuessing + ', \'' + encodeURIComponent(stringifyJson(previousReproSteps)) + '\')" class="reproStepOption" style="' + listItemStyle + '">' + reproSteps[currentValue.t][currentValue.i] + '</li>';
    }, '') + '</ul>';

    var footer;
    if (reproStepGuessing > 0) {
        footer = {
            action: 'submitReproSteps(\'' + bug + '\', \'' + encodeURIComponent(stringifyJson(previousReproSteps)) + '\')',
            label: 'Submit'
        };
    }

    setBacklogBody(itemDetailBody, selectedBug.s, footer);
};

var backlogVisible = false;
function showBacklog() {
    var openList = [];

    for (var bug in exports.a) {
        if (exports.a.hasOwnProperty(bug) && !exports.a[bug].fx && exports.a[bug].k) {
            openList.push({
                key: bug,
                data: exports.a[bug]
            });
        }
    }

    var body = openList.reduce(function (previousValue, currentValue) {
        return previousValue + '<div class="pbi" onClick="showItemDetail(\'' + currentValue.key + '\')" style="' + listItemStyle + '">' + currentValue.data.s + '</div>';
    }, '');

    if (body === '') {
        body = 'No new bugs found, yet...';
    }

    setBacklogBody(body, 'List of open bugs');

    document.body.appendChild(backlog);
    backlogVisible = true;
}

exports.c = function (listener) {
    onCloseListener = listener;
};

function hideBacklog() {
    document.body.removeChild(backlog);
    backlogVisible = false;
}

exports.d = function () {
    if (backlogVisible) {
        hideBacklog();
    } else {
        showBacklog();
    }
};

window.hideBacklog = function () {
    onCloseListener();
};
