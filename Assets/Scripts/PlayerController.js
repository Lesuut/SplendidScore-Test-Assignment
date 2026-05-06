// @input float laneLeft = -100 {"label": "Lane Left X"}
// @input float laneCenter = 0 {"label": "Lane Center X"}
// @input float laneRight = 100 {"label": "Lane Right X"}
// @input float swipeThreshold = 0.1 {"label": "Swipe Threshold (0-1)"}
// @input float smoothSpeed = 10 {"label": "Smooth Speed"}
// @input float tiltAngle = 20 {"label": "Tilt Angle (deg)"}
// @input float jumpHeight = 50 {"label": "Jump Height (cm)"}
// @input float jumpDuration = 0.6 {"label": "Jump Duration (sec)"}
// @input Component.ScriptComponent animController {"label": "Anim Controller"}

var DEG2RAD = Math.PI / 180;

var lanes = [script.laneLeft, script.laneCenter, script.laneRight];
var currentLane = 1;

var t = script.getSceneObject().getTransform();
var basePos = t.getLocalPosition();

var startX = basePos.x;
var targetX = lanes[currentLane];

var isJumping = false;
var jumpTimer = 0;

global.touchSystem.touchBlocking = true;

var touchStartX = 0;
var touchStartY = 0;

script.createEvent("TouchStartEvent").bind(function (e) {
    touchStartX = e.getTouchPosition().x;
    touchStartY = e.getTouchPosition().y;
});

script.createEvent("TouchEndEvent").bind(function (e) {
    var deltaX = e.getTouchPosition().x - touchStartX;
    var deltaY = e.getTouchPosition().y - touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < -script.swipeThreshold && !isJumping) {
            isJumping = true;
            jumpTimer = 0;
            if (script.animController) script.animController.playJump();
        }
    } else {
        if (deltaX > script.swipeThreshold && currentLane > 0) {
            startX = t.getLocalPosition().x;
            currentLane--;
            targetX = lanes[currentLane];
        } else if (deltaX < -script.swipeThreshold && currentLane < 2) {
            startX = t.getLocalPosition().x;
            currentLane++;
            targetX = lanes[currentLane];
        }
    }
});

script.createEvent("UpdateEvent").bind(function (e) {
    var dt = e.getDeltaTime();

    // --- Движение по X ---
    var pos = t.getLocalPosition();
    var newX = pos.x + (targetX - pos.x) * script.smoothSpeed * dt;

    // --- Прыжок по Y ---
    var newY = basePos.y;
    if (isJumping) {
        jumpTimer += dt;
        var progress = jumpTimer / script.jumpDuration;
        if (progress >= 1) {
            isJumping = false;
            jumpTimer = 0;
            if (script.animController) script.animController.playRun();
        } else {
            newY = basePos.y + Math.sin(progress * Math.PI) * script.jumpHeight;
        }
    }

    t.setLocalPosition(new vec3(newX, newY, basePos.z));

    // --- Наклон по Y при смене лейны ---
    var totalDist = Math.abs(targetX - startX);
    var tiltY = 0;
    if (totalDist > 0.5) {
        var laneProgress = 1 - Math.abs(newX - targetX) / totalDist;
        var direction = targetX > startX ? 1 : -1;
        tiltY = Math.sin(laneProgress * Math.PI) * script.tiltAngle * direction;
    }

    t.setLocalRotation(quat.fromEulerAngles(0, tiltY * DEG2RAD, 0));
});
