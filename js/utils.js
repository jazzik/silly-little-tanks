'use strict';
exports.a = function (style, prop, value, regex) {
    switch (prop) {
        case 'translate3d':
            style.transform = style.transform.replace(regex || /translate3d\([^)]+\)/i, 'translate3d(' + value + ')');
            break;
        case 'rotate3d':
            style.transform = style.transform.replace(regex || /rotate3d\([^)]+\)/i, 'rotate3d(' + value + ')');
            break;
    }
};

exports.b = function (a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};
