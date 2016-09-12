var storage = {};
exports.a = function (key) {
    var val = storage[key];
    try {
        val = localStorage.getItem(key);
    } catch (e) {}

    return val;
};

exports.b = function (key, val) {
    storage[key] = val;

    try {
        localStorage.setItem(key, val);
    } catch (e) {}
};
