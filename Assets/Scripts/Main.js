// ── Компоненты ─────────────────────────────────────────────────────────────
// @input Component.ScriptComponent worldMover         {"label": "World Mover"}
// @input Component.ScriptComponent animationController {"label": "Anim Controller"}
// @input Component.ScriptComponent itemPool           {"label": "Item Pool"}
// @input SceneObject               camera             {"label": "Camera"}

// ── Шейк камеры ────────────────────────────────────────────────────────────
// @input float shakeDuration  = 0.4 {"label": "Shake Duration (sec)"}
// @input float shakeMagnitude = 8   {"label": "Shake Magnitude (cm)"}

// ── Скорость мира ──────────────────────────────────────────────────────────
// @input float minWorldSpeed = -1000 {"label": "Min World Speed (cm/s)"}
// @input float maxWorldSpeed = -2500 {"label": "Max World Speed (cm/s)"}

// ── Скорость анимации бега ─────────────────────────────────────────────────
// @input float minRunAnimMultiplier = 1 {"label": "Min Run Anim Speed"}
// @input float maxRunAnimMultiplier = 2 {"label": "Max Run Anim Speed"}

// ── Плотность препятствий ──────────────────────────────────────────────────
// @input float minDensity         = 0.2 {"label": "Min Density (0–1)"}
// @input float maxDensity         = 0.8 {"label": "Max Density (0–1)"}
// @input float densityRampDuration = 60  {"label": "Density Ramp Duration (sec)"}

// ── Сложность ──────────────────────────────────────────────────────────────
// @input float startDifficultyRate = 0.005  {"label": "Start Difficulty Rate (per sec)"}
// @input float maxDifficultyRate   = 0.0167 {"label": "Max Difficulty Rate (per sec)"}
// @input float rateRampDuration    = 30     {"label": "Rate Ramp Duration (sec)"}

// ── UI ─────────────────────────────────────────────────────────────────────
// @input Component.Text scoreText {"label": "Score Text"}

// ── Игра ───────────────────────────────────────────────────────────────────
// @input int maxHp = 3 {"label": "Max HP"}

// ───────────────────────────────────────────────────────────────────────────

global.gameState = "idle";

var currentDifficulty = 0;
var currentRate       = script.startDifficultyRate;
var rateTimer         = 0;
var densityTimer      = 0;
var hp    = script.maxHp;
var score = 0;

var shakeTimer      = 0;
var deathSlowTimer  = 0;
var deathSlowFrom   = 0;
var startupTimer    = 0;
var TRANSITION_DUR  = 0.5;
var camTransform   = null;
var camOrigin      = null;

function resetGame() {
    global.gameState  = "playing";
    currentDifficulty = 0;
    currentRate       = script.startDifficultyRate;
    rateTimer         = 0;
    densityTimer      = 0;
    startupTimer      = TRANSITION_DUR;
    hp                = script.maxHp;
    score             = 0;
    updateScoreText();
    if (script.animationController) script.animationController.playRun();
}

script.createEvent("OnStartEvent").bind(function () {
    if (script.camera) {
        camTransform = script.camera.getTransform();
        camOrigin    = camTransform.getLocalPosition();
    }
    if (script.worldMover) script.worldMover.speed = 0;
    applyDensity(0);
    updateScoreText();
    if (script.animationController) script.animationController.playIdle();
});

script.createEvent("TouchStartEvent").bind(function () {
    if (global.gameState === "idle" || global.gameState === "dead") {
        resetGame();
    }
});

function lerp(a, b, t) { return a + (b - a) * t; }

function updateScoreText() {
    if (script.scoreText) script.scoreText.text = "Score: " + score;
}

function applyDifficulty(d) {
    if (script.worldMover) {
        script.worldMover.speed = lerp(script.minWorldSpeed, script.maxWorldSpeed, d);
    }
    if (script.animationController) {
        script.animationController.runSpeedMultiplier = lerp(script.minRunAnimMultiplier, script.maxRunAnimMultiplier, d);
    }
}

function applyDensity(d) {
    if (script.itemPool) {
        script.itemPool.density = lerp(script.minDensity, script.maxDensity, d);
    }
}

global.gameOnHit = function (name) {
    if (global.gameState !== "playing") return;

    if (name.indexOf("Star") !== -1) {
        score++;
        updateScoreText();
        print("[Game] +1 звезда! Score: " + score + " | HP: " + hp);
    } else {
        hp--;
        currentDifficulty = 0;
        currentRate       = script.startDifficultyRate;
        rateTimer         = 0;
        densityTimer      = 0;
        print("[Game] Удар! HP: " + hp + " | Score: " + score);

        shakeTimer = script.shakeDuration;

        if (hp <= 0) {
            global.gameState  = "dead";
            deathSlowTimer    = 0.5;
            deathSlowFrom     = script.worldMover ? script.worldMover.speed : 0;
            applyDensity(0);
            if (script.animationController) script.animationController.playDeath();
            print("[Game] GAME OVER | Score: " + score);
        }
    }
};

script.createEvent("UpdateEvent").bind(function (e) {
    var dt = e.getDeltaTime();

    if (camTransform && camOrigin) {
        if (shakeTimer > 0) {
            shakeTimer -= dt;
            var t    = shakeTimer / script.shakeDuration;
            var mag  = t * script.shakeMagnitude;
            camTransform.setLocalPosition(new vec3(
                camOrigin.x + (Math.random() * 2 - 1) * mag,
                camOrigin.y + (Math.random() * 2 - 1) * mag,
                camOrigin.z
            ));
        } else {
            camTransform.setLocalPosition(camOrigin);
        }
    }

    if (global.gameState === "dead" && deathSlowTimer > 0) {
        deathSlowTimer -= dt;
        var progress = Math.max(0, deathSlowTimer / 0.5);
        if (script.worldMover) script.worldMover.speed = deathSlowFrom * progress;
    }

    if (global.gameState !== "playing") return;

    rateTimer     = Math.min(script.rateRampDuration, rateTimer + dt);
    currentRate   = lerp(script.startDifficultyRate, script.maxDifficultyRate, rateTimer / script.rateRampDuration);
    currentDifficulty = Math.min(1, currentDifficulty + currentRate * dt);
    applyDifficulty(currentDifficulty);

    if (startupTimer > 0) {
        startupTimer -= dt;
        var rampT = 1 - Math.max(0, startupTimer / TRANSITION_DUR);
        if (script.worldMover) script.worldMover.speed *= rampT;
    }

    densityTimer  = Math.min(script.densityRampDuration, densityTimer + dt);
    applyDensity(densityTimer / script.densityRampDuration);
});
