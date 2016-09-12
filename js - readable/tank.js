'use strict';

var globals = require('./globals'),
    Shell = require('./shell'),
    updateTransform = require('./utils').updateTransform,
    collisionDetection = require('./collisionDetection').detect,
    getCollisionBoundaryFn = require('./collisionDetection').getCollisionBoundaryFn,
    backlog = require('./backlog'),
    cloudGenerator = require('./cloud'),
    sounds = require('./sounds');

var pi = 3.14;

var id = 0;

var speedLevels = [0.06, 0.07, 0.08, 0.09, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2];
var cabinYawSpeedLevels = [0.001, 0.0012, 0.0014, 0.0017, 0.002, 0.0023, 0.0028, 0.0033, 0.004, 0.005];
var fireTimeoutLevels = [500, 460, 420, 380, 340, 300, 250, 200, 150, 100];
var maxLifeLevels = [100, 110, 120, 130, 150, 170, 190, 210, 230, 250];
var shellDamageLevels = [5, 10, 15, 20, 25, 30, 38, 50, 65, 80];

module.exports = function (r, g, b, levels) {
    levels = levels || {
        cabinYawSpeed: 0,
        speed: 0,
        fireTimeout: 0,
        maxLife: 0,
        shellDamage: 0
    };

    var self = this, tracks, body, explosion, lifeBarWrapper, shellsFired = [],
        position = {x: 0, y: 0},
        renderingPosition = {x: 0, y: 0},
        oldMousePosition, movedSinceLastcabinMove = true,
        cabinAngle = 0,
        cabinTargetAngle = 0,
        cabinYawSpeed = cabinYawSpeedLevels[levels.cabinYawSpeed],
        shellDamage = shellDamageLevels[levels.shellDamage],
        renderPositionCorrection = -29.5,
        forwardSpeed = speedLevels[levels.speed],
        backwardSpeed = forwardSpeed / 2,
        yawSpeed = 0.002,
        yaw = 0,
        fireTimeout = fireTimeoutLevels[levels.fireTimeout],
        fireSpeed = 0.4,
        fireDistance = 300,
        canFire = true,
        maxLife = maxLifeLevels[levels.maxLife],
        life = maxLife,
        lifePercentage = 100,
        lowDamageCloudInterval,
        highDamageCloudInterval,
        isAiControlled = false,
        lastAiDecision = 0,
        thisAiDecisionDuration = 0,
        frenzyMode = false,
        playerControlEnabled = false,
        onDead,
        backup = {},
        controls = {
            forward: false,
            backward: false,
            turnLeft: false,
            turnRight: false
        };

    self.levels = levels;
    self.playerControlled = false;

    self.outerBody = document.createElement('div');
    self.cabin = document.createElement('div');
    self.lifeBar = document.createElement('div');

    self.build = function (startPosition, startYaw, onDeadCallback) {
        onDead = onDeadCallback || function () {};
        yaw = startYaw || 0;
        tracks = document.createElement('div');
        body = document.createElement('div');
        explosion = document.createElement('div');
        lifeBarWrapper = document.createElement('div');

        self.outerBody.style.position = 'absolute';
        self.outerBody.style.width = '60px';
        self.outerBody.style.height = '60px';
        self.outerBody.style.transform = 'translate3d(0, 0, 0) rotate3d(0, 0, 1, ' + yaw + 'rad)';
        self.outerBody.style.zIndex = '1';
        self.outerBody.style.transition = 'opacity 1s';
        self.outerBody.id = 'tank' + ++id;

        if (globals.highGraphics) {
            tracks.style.boxShadow = '0px 0px 5px 2px #444';
        }
        tracks.style.border = '1px solid #444';
        tracks.style.width = '44px';
        tracks.style.height = '44px';
        tracks.style.backgroundImage = 'linear-gradient(to bottom, #282828, #282828 70%, #484848 70%, #484848)';
        tracks.style.backgroundSize = '100% 4px';
        tracks.style.backgroundPositionY = '0%';
        tracks.style.borderRadius = '5px';
        tracks.style.position = 'absolute';
        tracks.style.top = '8px';
        tracks.style.left = '8px';

        if (globals.highGraphics) {
            body.style.boxShadow = '0px 0px 7px 0px #444';
        }
        body.style.border = '1px solid #444';
        body.style.width = '30px';
        body.style.height = '50px';
        body.style.background = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        body.style.borderRadius = '5px';
        body.style.position = 'absolute';
        body.style.left = '15px';
        body.style.top = '5px';
        body.innerHTML = '<div style="width: 16px;height: 6px;background: rgb(' + r + ', ' + g + ', ' + b + ');border: 1px solid rgb(' + (r + 40) + ', ' + (g + 40) + ', ' + (b + 40) + ');border-bottom: none;position: absolute;left: 7px;bottom: 0;box-sizing: border-box;"></div>';

        if (globals.highGraphics) {
            self.cabin.style.boxShadow = '0px 0px 10px 0px #444';
        }
        self.cabin.style.width = '20px';
        self.cabin.style.height = '20px';
        self.cabin.style.background = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        self.cabin.style.border = '1px solid rgb(' + (r + 40) + ', ' + (g + 40) + ', ' + (b + 40) + ')';
        self.cabin.style.borderRadius = '10% 10% 40% 40%';
        self.cabin.style.position = 'absolute';
        self.cabin.style.left = '20px';
        self.cabin.style.top = '20px';
        self.cabin.style.boxSizing = 'border-box';
        self.cabin.innerHTML = '<div style="width: 10px;height: 25px;background: rgb(' + r + ', ' + g + ', ' + b + ');border: 1px solid rgb(' + (r + 40) + ', ' + (g + 40) + ', ' + (b + 40) + ');position: absolute;left: 4px;bottom: 15px;box-sizing: border-box;"></div>';

        explosion.style.color = 'yellow';
        explosion.style.fontSize = '25px';
        explosion.style.position = 'absolute';
        explosion.style.left = '-9px';
        explosion.style.top = '-45px';
        explosion.style.display = 'none';
        explosion.innerHTML = '💥<div style="color: red;font-size: 26px;position: absolute;left: 0;top: 0;transform: rotateZ(45deg)">💥</div>';
        self.cabin.appendChild(explosion);

        self.lifeBar.style.position = 'absolute';
        self.lifeBar.style.right = '0';
        self.lifeBar.style.top = '0';
        self.lifeBar.style.width = '100%';
        self.lifeBar.style.height = '100%';
        self.lifeBar.style.background = 'darkgreen';

        lifeBarWrapper.style.position = 'absolute';
        lifeBarWrapper.style.width = '30px';
        lifeBarWrapper.style.height = '6px';
        lifeBarWrapper.style.left = '14px';
        lifeBarWrapper.style.bottom = '-4px';
        lifeBarWrapper.style.border = '1px solid white';
        lifeBarWrapper.style.opacity = '0.5';
        lifeBarWrapper.style.boxSizing = 'border-box';
        lifeBarWrapper.appendChild(self.lifeBar);

        self.outerBody.appendChild(tracks);
        self.outerBody.appendChild(body);
        self.outerBody.appendChild(self.cabin);
        self.outerBody.appendChild(lifeBarWrapper);

        self.updatePosition(startPosition);
    };

    self.getReward = function () {
        return Math.ceil((levels.cabinYawSpeed + levels.speed + levels.fireTimeout + levels.maxLife + levels.shellDamage) / 3);
    };

    self.updateLevels = function (levelName, newValue) {
        switch (levelName) {
            case 'speed':
                forwardSpeed = speedLevels[newValue];
                backwardSpeed = forwardSpeed / 2;
                self.levels.speed = newValue;
                break;
            case 'cabinYawSpeed':
                cabinYawSpeed = cabinYawSpeedLevels[newValue];
                self.levels.cabinYawSpeed = newValue;
                break;
            case 'fireTimeout':
                fireTimeout = fireTimeoutLevels[newValue];
                self.levels.fireTimeout = newValue;
                break;
            case 'maxLife':
                maxLife = maxLifeLevels[newValue];
                self.levels.maxLife = newValue;
                break;
            case 'shellDamage':
                shellDamage = shellDamageLevels[newValue];
                self.levels.shellDamage = newValue;
                break;
            default:
                break;
        }
    };

    self.updatePosition = function (newPosition) {
        if (newPosition.x < 10 || newPosition.y < 10 || newPosition.x > Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 10 || newPosition.y > Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 10) {
            return;
        }
        position = newPosition;
        renderingPosition.x = newPosition.x + renderPositionCorrection;
        renderingPosition.y = newPosition.y + renderPositionCorrection;
        movedSinceLastcabinMove = true;

        updateTransform(self.outerBody.style, 'translate3d', renderingPosition.x + 'px, ' + renderingPosition.y + 'px, 0');
    };

    self.render = function (dt) {
        if (isAiControlled) {
            updateAi();
        }

        updateCabinTargetAngle();

        renderMovement(dt);
        renderRotation(dt);

        renderCabin(dt);

        shellsFired = shellsFired.filter(function (shell) {
            return !shell.isExploded();
        });

        shellsFired.forEach(function (shell) {
            shell.render(dt);
        });
    };

    self.heal = function () {
        life = maxLife;
        updateLifeBar();
    };

    self.enablePlayerControls = function (mouseOnly) {
        if (playerControlEnabled) {
            return;
        }
        playerControlEnabled = true;
        if (!mouseOnly) {
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            self.playerControlled = true;
        }

        document.addEventListener('mousedown', self.fire);
    };

    self.disablePlayerControls = function (mouseOnly) {
        if (!playerControlEnabled) {
            return;
        }
        playerControlEnabled = false;
        if (!mouseOnly) {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            disableControls();
        }
        document.removeEventListener('mousedown', self.fire);

    };

    self.enableAi = function () {
        isAiControlled = true;
        fireTimeout = fireTimeoutLevels[levels.fireTimeout] * 3;
    };

    self.disableAi = function () {
        isAiControlled = false;

        disableControls();
    };

    self.frenzyFire = function (shouldBeInFrenzyMode) {
        frenzyMode = shouldBeInFrenzyMode;

        if (shouldBeInFrenzyMode) {
            backup.cabinYawSpeed = cabinYawSpeed;
            backup.fireTimeout = fireTimeout;

            cabinYawSpeed = cabinYawSpeedLevels[9];
            fireTimeout = fireTimeoutLevels[6];
        } else if (backup.fireTimeout >= 0 && backup.cabinYawSpeed >= 0) {
            cabinYawSpeed = backup.cabinYawSpeed;
            fireTimeout = backup.fireTimeout;
        }
    };

    self.receiveDamage = function (damage, forced) {
        if (isAiControlled && !backlog.list.invincibleEnemies.fixed && !forced) {
            if (!backlog.list.invincibleEnemies.known) {
                backlog.newBugFound(backlog.list.invincibleEnemies);
            }

            return;
        }

        if (life === 0) {
            return;
        }

        life -= damage;

        if (life <= 0) {
            life = 0;

            if (globals.isInGame) {
                sounds.playSound(self.playerControlled ? sounds.playerKilled : sounds.enemyKilled);
            }
        } else {
            sounds.playSound(self.playerControlled ? sounds.playerHit : sounds.enemyHit);
        }

        updateLifeBar();
    };

    self.getCollisionBoundary = getCollisionBoundaryFn(self.outerBody, 28);

    self.fire = function () {
        if (!canFire || globals.isPaused) {
            return;
        }

        canFire = false;
        setTimeout(function () {
            canFire = true;
        }, fireTimeout);

        sounds.playSound(self.playerControlled ? sounds.playerFire : sounds.enemyFire);

        explosion.style.display = 'block';
        setTimeout(function () {
            explosion.style.display = 'none';
        }, 80);

        var realativePos = self.cabin.getBoundingClientRect();

        shellsFired.push(new Shell(self, realativePos.left, realativePos.top, cabinAngle, fireSpeed, fireDistance, shellDamage));
    };

    function updateLifeBar() {
        lifePercentage = life / maxLife * 100;

        self.lifeBar.style.width = lifePercentage + '%';

        if (lifePercentage === 0) {
            self.disablePlayerControls();
            self.disableAi();
            onDead();
        } else if (lifePercentage <= 30 && !highDamageCloudInterval) {
            self.lifeBar.style.background = 'red';
            generateCloud();
            clearInterval(lowDamageCloudInterval);
            lowDamageCloudInterval = null;
            lowDamageCloudInterval = setInterval(generateCloud, 300);
        } else if (lifePercentage <= 60 && !lowDamageCloudInterval) {
            self.lifeBar.style.background = 'orange';
            generateCloud();
            clearInterval(highDamageCloudInterval);
            highDamageCloudInterval = null;
            lowDamageCloudInterval = setInterval(generateCloud, 700);
        } else if (lifePercentage > 60) {
            self.lifeBar.style.background = 'darkgreen';
            clearInterval(highDamageCloudInterval);
            highDamageCloudInterval = null;
            clearInterval(lowDamageCloudInterval);
            lowDamageCloudInterval = null;
        }
    }

    function disableControls() {
        controls.forward = false;
        controls.backward = false;
        controls.turnLeft = false;
        controls.turnRight = false;
    }

    function updateAi() {
        var now = Date.now();
        if (!isAiControlled || lastAiDecision + thisAiDecisionDuration > now) {
            return;
        }

        lastAiDecision = now;
        thisAiDecisionDuration = Math.floor(Math.random() * 1500) + 500;
        var movement = Math.floor(Math.random() * 10);

        if (movement <= 6) {
            controls.forward = true;
            controls.backward = false;
        } else if (movement <= 8) {
            controls.forward = false;
            controls.backward = true;
        } else {
            controls.forward = false;
            controls.backward = false;
        }

        if (movement <= 1) {
            controls.turnLeft = true;
            controls.turnRight = false;
        } else if (movement <= 3) {
            controls.turnLeft = false;
            controls.turnRight = true;
        } else {
            controls.turnLeft = false;
            controls.turnRight = false;
        }
    }

    function renderMovement(dt) {
        var oldPos = position,
            healthMultiplier = 1;

        if (lifePercentage <= 30) {
            healthMultiplier = 0.3;
        } else if (lifePercentage <= 60) {
            healthMultiplier = 0.6;
        }

        if (controls.forward) {
            self.updatePosition({x: position.x + Math.sin(yaw) * forwardSpeed * healthMultiplier * dt, y: position.y - Math.cos(yaw) * forwardSpeed * healthMultiplier * dt});

            if (globals.highGraphics) {
                var newTrackBgPos = parseFloat(tracks.style.backgroundPositionY) - 0.5 * forwardSpeed * healthMultiplier * dt;
                if (newTrackBgPos <= -100) {
                    newTrackBgPos += 100;
                }
                tracks.style.backgroundPositionY = newTrackBgPos + '%';
            }
        } else if (controls.backward) {
            self.updatePosition({x: position.x - Math.sin(yaw) * backwardSpeed * healthMultiplier * dt, y: position.y + Math.cos(yaw) * backwardSpeed * healthMultiplier * dt});

            if (globals.highGraphics) {
                var newTrackBgPos = parseFloat(tracks.style.backgroundPositionY) + 0.5 * backwardSpeed * healthMultiplier * dt;
                if (newTrackBgPos >= 100) {
                    newTrackBgPos -= 100;
                }
                tracks.style.backgroundPositionY = newTrackBgPos + '%';
            }
        }

        if (collisionDetection(self)) {
            self.updatePosition(oldPos);
        }
    }

    function generateCloud() {
        var cloud = document.createElement('div'),
            boundaryRect = self.cabin.getBoundingClientRect();

        cloud.innerHTML = cloudGenerator();

        cloud.style.transition = 'transform 1.5s, opacity 1.5s';
        cloud.style.position = 'absolute';
        cloud.style.left = (boundaryRect.right - 30) + 'px';
        cloud.style.top = (boundaryRect.bottom - 30) + 'px';
        cloud.style.width = '56px';
        cloud.style.height = '54px';
        cloud.style.zIndex = '10';

        cloud.style.transform = 'scale3d(0.01, 0.01, 1)';
        cloud.style.opacity = self.outerBody.style.opacity;

        setTimeout(function () {
            cloud.style.transform = 'scale3d(1, 1, 1) translate3d(10px, 20px, 0) rotate3d(0, 0, 1, 30deg)';
            cloud.style.opacity = '0';
        }, 50);

        setTimeout(function () {
            document.body.removeChild(cloud);
        }, 3000);

        document.body.appendChild(cloud);
    }

    function renderRotation(dt) {
        var healthMultiplier = 1;

        if (lifePercentage <= 30) {
            healthMultiplier = 0.3;
        } else if (lifePercentage <= 60) {
            healthMultiplier = 0.6;
        }
        var dtYawSpeed = yawSpeed * healthMultiplier * dt;

        if (controls.turnLeft) {
            yaw -= dtYawSpeed;
            updateTransform(self.outerBody.style, 'rotate3d', '0, 0, 1, ' + yaw + 'rad');
        }
        if (controls.turnRight) {
            yaw += dtYawSpeed;
            updateTransform(self.outerBody.style, 'rotate3d', '0, 0, 1, ' + yaw + 'rad');
        }
    }

    function renderCabin(dt) {
        var dtCabinYawSpeed = cabinYawSpeed * dt;

        if (Math.abs(cabinAngle - cabinTargetAngle) <= dtCabinYawSpeed) {
            cabinAngle = cabinTargetAngle;
        } else if (cabinAngle > pi / 2 && cabinTargetAngle < -pi / 2) {
            cabinAngle += dtCabinYawSpeed;
            if (cabinAngle >= pi) {
                cabinAngle = -pi;
            }
        } else if (cabinAngle < -pi / 2 && cabinTargetAngle > pi / 2) {
            cabinAngle -= dtCabinYawSpeed;
            if (cabinAngle <= -pi) {
                cabinAngle = pi;
            }
        } else if (cabinAngle > cabinTargetAngle) {
            cabinAngle -= dtCabinYawSpeed;
        } else {
            cabinAngle += dtCabinYawSpeed;
        }

        if (self.playerControlled) {
            var pos = self.cabin.getBoundingClientRect();
            globals.playerGlobalPosition = {
                x: pos.left,
                y: pos.top
            };
        }

        if (!backlog.list.brokenCabinWhenDamaged.fixed && lifePercentage <= 60 && globals.isInGame) {
            if (!backlog.list.brokenCabinWhenDamaged.known) {
                backlog.newBugFound(backlog.list.brokenCabinWhenDamaged);
            }
            return;
        }

        self.cabin.style.transform = 'rotate3d(0, 0, 1, ' + (cabinAngle - yaw) + 'rad)';
    }

    function onKeyDown(event) {
        if ((event.keyCode === 87 || event.keyCode === 38)) {
            controls.forward = true;
        }
        if ((event.keyCode === 83 || event.keyCode === 40)) {
            controls.backward = true;
        }
        if ((event.keyCode === 65 || event.keyCode === 37)) {
            controls.turnLeft = true;
        }
        if ((event.keyCode === 68 || event.keyCode === 39)) {
            controls.turnRight = true;
        }
    }

    function onKeyUp(event) {
        if (event.keyCode === 87 || event.keyCode === 38) {
            controls.forward = false;
        }
        if (event.keyCode === 83 || event.keyCode === 40) {
            controls.backward = false;
        }
        if ((event.keyCode === 65 || event.keyCode === 37)) {
            controls.turnLeft = false;
        }
        if ((event.keyCode === 68 || event.keyCode === 39)) {
            controls.turnRight = false;
        }
    }

    function roundAngle(angle) {
        return Math.round(angle * 1000) / 1000;
    }

    function updateCabinTargetAngle() {
        var targetPosition = {x: null};

        if (isAiControlled && globals.playerGlobalPosition) {
            var myPos = self.cabin.getBoundingClientRect(),
                dist = Math.sqrt(Math.pow(myPos.left - globals.playerGlobalPosition.x, 2) + Math.pow(myPos.top - globals.playerGlobalPosition.y, 2));

            if (frenzyMode) {
                targetPosition = {
                    x: (position.x + 50) - Math.floor(Math.random() * 100),
                    y: (position.y + 50) - Math.floor(Math.random() * 100)
                };
                self.fire();
            } else if (dist < fireDistance * 1.5) {
                targetPosition = globals.playerGlobalPosition;
                self.fire();
            }
        } else if (self.playerControlled) {
            targetPosition = globals.userInput.mouse;
        }

        if (targetPosition.x === null || (oldMousePosition === targetPosition && !movedSinceLastcabinMove)) {
            return;
        }

        movedSinceLastcabinMove = false;
        oldMousePosition = targetPosition;

        var correction = pi / 2,
            opposite = Math.sqrt(Math.pow(targetPosition.y - position.y, 2)),
            adjacent = Math.sqrt(Math.pow(position.x - targetPosition.x, 2)),
            angle = Math.atan(opposite / adjacent);

        if (targetPosition.x > position.x && targetPosition.y < position.y) {
            cabinTargetAngle = roundAngle(correction - angle);
        } else if (targetPosition.x < position.x && targetPosition.y < position.y) {
            cabinTargetAngle = roundAngle(angle - correction);
        } else if (targetPosition.x < position.x && targetPosition.y > position.y) {
            cabinTargetAngle = roundAngle(-angle - correction);
        } else {
            cabinTargetAngle = roundAngle(angle + correction);
        }
    }
};
