var updateTransform = require('./utils').a,
    collisionDetection = require('./collisionDetection').a,
    backlog = require('./backlog'),
    boundaryFn = require('./collisionDetection').b;

var yCorrection = -40;

module.exports = function (parentTank, x, y, angle, speed, distance, damage) {
    var self = this,
        shell = document.createElement('div'),
        explosion = document.createElement('div'),
        currentDistance = yCorrection,
        maxDistance = -distance + yCorrection,
        exploded = false;

    damage = damage || 10;

    shell.style.width = '11px';
    shell.style.height = '21px';
    shell.style.position = 'absolute';
    shell.style.left = x + 'px';
    shell.style.top = y + 'px';
    shell.style.background = 'black';
    shell.style.borderRadius = '50%';
    shell.style.zIndex = '1';
    shell.style.transform = 'translate3d(10px, 0, 0) rotate3d(0, 0, 1, ' + angle + 'rad) translate3d(0, ' + currentDistance + 'px, 0)';

    explosion.style.color = 'yellow';
    explosion.style.fontSize = '25px';
    explosion.style.position = 'absolute';
    explosion.style.left = '-9px';
    explosion.style.top = '-9px';
    explosion.style.display = 'none';
    explosion.innerHTML = '💥<div style="color: red;font-size: 26px;position: absolute;left: 0;top: 0;transform: rotateZ(45deg)">💥</div>';

    shell.appendChild(explosion);

    document.body.appendChild(shell);

    self.a = function () {
        return exploded;
    };

    self.b = function (dt) {
        var hit = collisionDetection(self, [parentTank]);

        if (currentDistance < maxDistance || hit) {
            explode(hit);
            return;
        }

        currentDistance -= speed * dt;
        updateTransform(shell.style, 'translate3d', '0, ' + currentDistance + 'px, 0', /translate3d\(0p?x?, -\d+\.?\d*px, 0p?x?\)/i);
    };

    self.gcb = boundaryFn(shell, 7);

    function explode(hit) {
        var removalDelay = 0;
        exploded = true;

        if (hit && hit.o) {
            explosion.style.display = 'block';
            if (hit instanceof parentTank.constructor && !hit.b && !parentTank.b && !backlog.a.d.fx) {
                parentTank.n(true);

                if (!backlog.a.d.k) {
                    backlog.b(backlog.a.d);
                }
            }

            hit.o(damage, false);

            removalDelay = 80;
        }
        setTimeout(function () {
            document.body.removeChild(shell);
        }, removalDelay);
    }
};
