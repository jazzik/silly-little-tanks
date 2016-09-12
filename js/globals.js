'use strict';
var storage = require('./storage');

exports.a = {
    mouse: {
        x: null,
        y: null
    }
};

exports.b = [];

exports.c = null;
exports.d = null;
exports.e = 5;
exports.f = false;

var storedGraphicsLevel;
try {
    storedGraphicsLevel = storage.a('slt|graphics');
} catch (e) {}

exports.g = storedGraphicsLevel !== 'Low';

var showTrees;
try {
    showTrees = storage.a('slt|showTrees');
} catch (e) {}

exports.h = showTrees !== 'off';

exports.i = [];

var trackMouse = function (event) {
    exports.a.a = {
        x: event.clientX,
        y: event.clientY
    };
};

document.addEventListener('mousemove', trackMouse);

exports.j = false;
exports.k = false;

exports.l = function () {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
};

exports.m = function () {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
};

exports.n = {};
