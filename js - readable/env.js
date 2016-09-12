var globals = require('./globals'),
    getCollisionBoundaryFn = require('./collisionDetection').getCollisionBoundaryFn,
    cloudGenerator = require('./cloud');

var availableToRight = {
    0: [0, 0, 0, 3, 10, 12],
    1: [1, 2, 6, 8],
    2: [0, 0, 0, 3, 10, 12],
    3: [1, 2, 6, 8],
    4: [4, 9, 11],
    5: [5, 7, 13],
    6: [5, 7, 13],
    7: [1, 2, 6, 8],
    8: [4, 9, 11],
    9: [1, 2, 6, 8],
    10: [4, 9, 11],
    11: [0, 0, 0, 3, 10, 12],
    12: [5, 7, 13],
    13: [0, 0, 0, 3, 10, 12]
};

var availableBelow = {
    0: [0, 0, 0, 5, 12, 13],
    1: [1, 4, 8, 9],
    2: [2, 6, 11],
    3: [3, 7, 10],
    4: [0, 0, 0, 5, 12, 13],
    5: [1, 4, 8, 9],
    6: [1, 4, 8, 9],
    7: [1, 4, 8, 9],
    8: [2, 6, 11],
    9: [3, 7, 10],
    10: [0, 0, 0, 5, 12, 13],
    11: [0, 0, 0, 5, 12, 13],
    12: [3, 7, 10],
    13: [2, 6, 11]
};

exports.generateMap = function () {
    var mapTiles = generate(Math.ceil(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100),
                            Math.ceil(Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 100));

    var map = document.createElement('div');
    map.style.width = '100%';
    map.style.height = '100%';
    map.style.position = 'absolute';
    map.style.left = '0';
    map.style.top = '0';
    map.style.overflow = 'hidden';
    map.id = 'map';

    var tiles = '';
    mapTiles.forEach(function (row) {
        tiles += '<div style="height: 100px;white-space: nowrap;">';
        row.forEach(function (tile) {
            tiles += generateDirtTile(tile);
        });
        tiles += '</div>';
    });

    map.innerHTML = tiles;

    if (globals.showTrees) {
        for (var i = 0; i < Math.ceil(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) * Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 125000); i++) {
            generateTree(map);
        }
    }

    return map;
};

function generate(width, height) {
    var map = [];

    for (var h = 0; h < height; h++) {
        var row = [];
        for (var w = 0; w < width; w++) {
            if (w === 0 && h === 0) {
                row.push(Math.floor(Math.random() * 14));
            } else if (h === 0) {
                var tilesAvailableFromLeft = availableToRight[row[w - 1]],
                    index = Math.floor(Math.random() * tilesAvailableFromLeft.length);
                row.push(tilesAvailableFromLeft[index]);
            } else {
                var tilesAvailableFromLeft = w === 0 ? Array.apply(null, {length: 14}).map(Number.call, Number) : availableToRight[row[w - 1]],
                    tilesAvailableFromAbove = availableBelow[map[h - 1][w]];

                var availableTiles = tilesAvailableFromLeft.filter(function (tileAvailableFromLeft) {
                    return tilesAvailableFromAbove.indexOf(tileAvailableFromLeft) > -1;
                });

                if (!availableTiles.length) {
                    debugger;
                }

                var index = Math.floor(Math.random() * availableTiles.length);
                row.push(availableTiles[index]);
            }
        }
        map.push(row);
    }

    return map;
}

function generateTree(parent) {
    var tree = document.createElement('div');

    var screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    tree.innerHTML = cloudGenerator(true);

    var randomLeft = Math.floor(Math.random() * (screenWidth - 10)) + 10;
    var randomTop = Math.floor(Math.random() * (screenHeight - 10)) + 10;
    if (globals.playerGlobalPosition) {
        while ((globals.playerGlobalPosition.x - 100 <= randomLeft && globals.playerGlobalPosition.x + 100 >= randomLeft)
            && (globals.playerGlobalPosition.y - 100 <= randomTop && globals.playerGlobalPosition.y + 100 >= randomTop)) {
            randomLeft = Math.floor(Math.random() * (screenWidth - 10)) + 10;
            randomTop = Math.floor(Math.random() * (screenHeight - 10)) + 10;
        }
    }

    var scale = Math.random();
    tree.style.cssText = 'position:absolute;left:' + randomLeft + 'px;top:' + randomTop + 'px;width:77px;height:76px;z-index:99;transformscale3d(' + (1.5 - scale) + ', ' + (1.5 - scale) + ', 1)';

    parent.appendChild(tree);

    globals.collisionObjects.push({
        type: 'tree',
        object: {
            getCollisionBoundary: getCollisionBoundaryFn(tree.childNodes[0], 30 * (1.5 - scale))
        }
    });
}

function generateDirtTile(type) {
    var tile = document.createElement('div'),
        style = 'width:100px;height:100px;position:relative;display:inline-block';

    switch (type) {
        case 0: // full green
            style += ';background:#8BAB2C';
            break;
        case 1: // full dirt
            style += ';background:#BD8958';
            decorate(tile, type);
            break;
        case 2: // dirt to green horizontally
            style += ';background:linear-gradient(to right, #BD8958, #8BAB2C)';
            decorate(tile, type);
            break;
        case 3: // green to dirt horizontally
            style += ';background:linear-gradient(to left, #BD8958, #8BAB2C)';
            decorate(tile, type);
            break;
        case 4: // dirt to green vertically
            style += ';background:linear-gradient(to bottom, #BD8958, #8BAB2C)';
            decorate(tile, type);
            break;
        case 5: // green to dirt vertically
            style += ';background:linear-gradient(to top, #BD8958, #8BAB2C)';
            decorate(tile, type);
            break;
        case 6: // green top right
            style += ';background:linear-gradient(45deg, #BD8958, #BD8958 50%, #8BAB2C)';
            decorate(tile, type);
            break;
        case 7: // green top left
            style += ';background:linear-gradient(-45deg, #BD8958, #BD8958 50%, #8BAB2C)';
            decorate(tile, type);
            break;
        case 8: // green bottom right
            style += ';background:linear-gradient(135deg, #BD8958, #BD8958 50%, #8BAB2C)';
            decorate(tile, type);
            break;
        case 9: // green bottom left
            style += ';background:linear-gradient(-135deg, #BD8958, #BD8958 50%, #8BAB2C)';
            decorate(tile, type);
            break;
        case 10: // dirt top right
            style += ';background:linear-gradient(45deg, #8BAB2C, #8BAB2C 50%, #BD8958)';
            break;
        case 11: // dirt top left
            style += ';background:linear-gradient(-45deg, #8BAB2C, #8BAB2C 50%, #BD8958)';
            break;
        case 12: // dirt bottom right
            style += ';background:linear-gradient(135deg, #8BAB2C, #8BAB2C 50%, #BD8958)';
            break;
        case 13: // dirt bottom left
            style += ';background:linear-gradient(-135deg, #8BAB2C, #8BAB2C 50%, #BD8958)';
            break;
    }

    tile.style.cssText = style;

    return tile.outerHTML;
}

function decorate(tile, type) {
    var data = [
        {s: 12, l: 41, t: -3, e: [2, 3, 5, 6, 7]},
        {s: 12, l: 41, t: 97, e: [2, 3, 4, 8, 9]},
        {s: 12, l: 12, t: 94, e: [2, 3, 4, 8, 9]},
        {s: 12, l: 12, t: -6, e: [2, 3, 5, 6, 7]},
        {s: 14, l: 18, t: 77, e: [2, 3, 4, 5, 8, 9]},
        {s: 17, l: 46, t: 20, e: [2, 3, 4, 5, 6]},
        {s: 22, l: 14, t: 30, e: [2, 3, 4, 5, 7, 9]},
        {s: 16, l: -2, t: 71, e: [3, 4, 5, 7, 9]},
        {s: 16, l: 98, t: 71, e: [2, 4, 5, 6, 8]},
        {s: 15, l: -10, t: 33, e: [3, 4, 5, 7, 9]},
        {s: 15, l: 90, t: 33, e: [2, 4, 5, 6, 8]},
        {s: 13, l: 73, t: 84, e: [2, 4, 8, 9]},
        {s: 26, l: 64, t: 30, e: [2, 3, 4, 5, 6, 8]},
        {s: 17, l: 48, t: 53, e: [2, 3, 4, 5, 8, 9]}
    ];

    var decoration = '';

    data.forEach(function (circle) {
        if (circle.e.indexOf(type) === -1) {
            decoration += '<div style="position: absolute; width: ' + circle.s + 'px; height: ' + circle.s + 'px; border-radius: 50%; background: #B48152; left: ' + circle.l + 'px; top: ' + circle.t + 'px"></div>';
        }
    });

    tile.innerHTML = decoration;
}
