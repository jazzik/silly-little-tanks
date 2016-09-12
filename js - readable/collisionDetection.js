var collisionObjects = require('./globals').collisionObjects;

exports.detect = function (self, exclude) {
    exclude = exclude || [];
    var selfCollisionBoundary = self.getCollisionBoundary(),
        otherCollisionObjects = collisionObjects.filter(function (collisionObject) {
            return collisionObject.object !== self && exclude.indexOf(collisionObject.object) === -1;
        }),
        isColliding = false;

    for (var i = 0; i < otherCollisionObjects.length; i++) {
        isColliding = circleDetection(selfCollisionBoundary, otherCollisionObjects[i].object.getCollisionBoundary());

        if (isColliding) {
            return otherCollisionObjects[i].object;
        }
    }

    return false;
};

exports.getCollisionBoundaryFn = function (body, radius) {
    return function () {
        var boundingClientRect = body.getBoundingClientRect();

        return {
            radius: radius,
            x: boundingClientRect.left + boundingClientRect.width / 2,
            y: boundingClientRect.top + boundingClientRect.height / 2
        };
    };
};

function circleDetection(circle1, circle2) {
    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= circle1.radius + circle2.radius) {
        return true;
    }

    return false;
}
