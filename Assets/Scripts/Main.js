// ── Компоненты ─────────────────────────────────────────────────────────────
// @input Component.ScriptComponent worldMover         {"label": "World Mover"}
// @input Component.ScriptComponent animationController {"label": "Anim Controller"}
// @input Component.ScriptComponent itemPool           {"label": "Item Pool"}

// ── Скорость мира ──────────────────────────────────────────────────────────
// @input float minWorldSpeed = -1000 {"label": "Min World Speed (cm/s)"}
// @input float maxWorldSpeed = -2500 {"label": "Max World Speed (cm/s)"}

// ── Скорость анимации бега ─────────────────────────────────────────────────
// @input float minRunAnimMultiplier = 1 {"label": "Min Run Anim Speed"}
// @input float maxRunAnimMultiplier = 2 {"label": "Max Run Anim Speed"}

// ── Плотность препятствий ──────────────────────────────────────────────────
// @input float minDensity = 0.2 {"label": "Min Density (0–1)"}
// @input float maxDensity = 0.8 {"label": "Max Density (0–1)"}

// ── Сложность ──────────────────────────────────────────────────────────────
// @input float difficulty             = 0    {"label": "Start Difficulty (0–1)"}
// @input float difficultyIncreaseRate = 0.02 {"label": "Difficulty Rate (per sec)"}

// ───────────────────────────────────────────────────────────────────────────

var currentDifficulty = Math.max(0, Math.min(1, script.difficulty));

function lerp(a, b, t) { return a + (b - a) * t; }

script.createEvent("UpdateEvent").bind(function (e) {
    currentDifficulty = Math.min(1, currentDifficulty + script.difficultyIncreaseRate * e.getDeltaTime());
    var d = currentDifficulty;

    if (script.worldMover) {
        script.worldMover.speed = lerp(script.minWorldSpeed, script.maxWorldSpeed, d);
    }

    if (script.animationController) {
        script.animationController.runSpeedMultiplier = lerp(script.minRunAnimMultiplier, script.maxRunAnimMultiplier, d);
    }

    if (script.itemPool) {
        script.itemPool.density = lerp(script.minDensity, script.maxDensity, d);
    }
});
