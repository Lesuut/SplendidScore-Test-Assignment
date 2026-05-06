// @input float laneLeft = -100 {"label": "Lane Left X"}
// @input float laneCenter = 0 {"label": "Lane Center X"}
// @input float laneRight = 100 {"label": "Lane Right X"}
// @input float swipeThreshold = 0.1 {"label": "Swipe Threshold (0-1)"}
// @input float laneSmooth = 10 {"label": "Lane Smooth Speed"}
// @input float tiltAngle = 20 {"label": "Tilt Angle (deg)"}
// @input float jumpHeight = 50 {"label": "Jump Height (cm)"}
// @input float jumpDuration = 0.6 {"label": "Jump Duration (sec)"}
// @input float fastFallMultiplier = 3 {"label": "Fast Fall Speed Multiplier"}
// @input Component.ScriptComponent animController {"label": "Anim Controller"}

var DEG2RAD = Math.PI / 180;
var lanes = [script.laneLeft, script.laneCenter, script.laneRight];

var t = script.getSceneObject().getTransform();
var basePos = t.getLocalPosition();

var currentLane = 1;
var laneStartX = basePos.x;
var targetX = lanes[currentLane];

var isJumping = false;
var isFastFalling = false;
var jumpTimer = 0;

var touchStartX = 0;
var touchStartY = 0;

global.touchSystem.touchBlocking = true;

function switchLane(dir) {
    var next = currentLane + dir;
    if (next < 0 || next > 2) return;
    laneStartX = t.getLocalPosition().x;
    currentLane = next;
    targetX = lanes[currentLane];
}

function startJump() {
    if (isJumping) return;
    isJumping = true;
    isFastFalling = false;
    jumpTimer = 0;
    if (script.animController) script.animController.playJump();
}

function startFastFall() {
    if (!isJumping) return;
    isFastFalling = true;
}

function endJump() {
    isJumping = false;
    isFastFalling = false;
    jumpTimer = 0;
    if (script.animController) script.animController.playRun();
}

script.createEvent("TouchStartEvent").bind(function (e) {
    touchStartX = e.getTouchPosition().x;
    touchStartY = e.getTouchPosition().y;
});

script.createEvent("TouchEndEvent").bind(function (e) {
    if (global.gameState !== "playing") return;

    var dx = e.getTouchPosition().x - touchStartX;
    var dy = e.getTouchPosition().y - touchStartY;

    if (Math.abs(dy) > Math.abs(dx)) {
        if (dy < -script.swipeThreshold) startJump();
        else if (dy > script.swipeThreshold) startFastFall();
    } else {
        if (dx > script.swipeThreshold) switchLane(-1);
        else if (dx < -script.swipeThreshold) switchLane(1);
    }
});

script.createEvent("UpdateEvent").bind(function (e) {
    var dt = e.getDeltaTime();
    var pos = t.getLocalPosition();

    var newX = pos.x + (targetX - pos.x) * script.laneSmooth * dt;

    var newY = basePos.y;
    if (isJumping) {
        var speedMul = isFastFalling ? script.fastFallMultiplier : 1;
        jumpTimer += dt * speedMul;
        var progress = jumpTimer / script.jumpDuration;
        if (progress >= 1) {
            endJump();
        } else {
            newY = basePos.y + Math.sin(progress * Math.PI) * script.jumpHeight;
        }
    }

    t.setLocalPosition(new vec3(newX, newY, basePos.z));

    var totalDist = Math.abs(targetX - laneStartX);
    var tiltY = 0;
    if (totalDist > 0.5) {
        var laneProgress = 1 - Math.abs(newX - targetX) / totalDist;
        tiltY = Math.sin(laneProgress * Math.PI) * script.tiltAngle * (targetX > laneStartX ? 1 : -1);
    }

    t.setLocalRotation(quat.fromEulerAngles(0, tiltY * DEG2RAD, 0));
});
